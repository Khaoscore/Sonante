/**
 * Baja las 3 últimas publicaciones de Instagram de Sonante para el muro
 * "No te pierdas de nada" de Nuestros tips (src/components/tips/SocialWall.tsx).
 *
 *   npm run social                 baja las publicaciones
 *   npm run social -- --refresh    con token de Meta: además lo renueva (60 días más)
 *   npm run social -- --exchange   con token de Meta: cambia uno de 1 hora por uno de 60 días
 *
 * Fuente de los datos (en .env en local, o como secretos en GitHub Actions); basta una:
 *   BEHOLD_FEED_URL        feed JSON de behold.so (https://feeds.behold.so/...). Lo más
 *                          sencillo: se conecta Instagram una vez en behold.so y Behold
 *                          mantiene el acceso; no hace falta Meta for Developers.
 *   INSTAGRAM_TOKEN        token creado en una app de Meta for Developers. Sirven dos tipos:
 *                          - inicio de sesión de Instagram (empieza por IG): dura 60 días
 *                            y la tarea programada lo renueva;
 *                          - inicio de sesión unificado (empieza por EAA): token de usuario
 *                            del sistema que no caduca. Lee la cuenta por su id (ACCOUNT_ID).
 *   INSTAGRAM_APP_SECRET   solo para --exchange
 *   REFRESHED_TOKENS_FILE  (Actions) archivo .env donde se deja el token renovado cuando
 *                          Meta devuelve uno distinto, para guardarlo como secreto
 *
 * Escribe src/data/social-feed.json y las fotos en public/assets/social/. Si la
 * descarga falla, conserva las publicaciones anteriores y termina con código 1
 * para que la tarea programada avise del problema.
 */
import { access, appendFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(root, "src/data/social-feed.json");
const IMG_DIR = path.join(root, "public/assets/social");
const IMG_URL = "/assets/social";

const IG_API = "https://graph.instagram.com";
// Sin versión: Meta usa la de la app y la sube sola cuando la vieja deja de existir
const FB_API = "https://graph.facebook.com";

/**
 * Id de @sonanteagencia en la API de Meta, para los tokens de Facebook (se ve en Meta for
 * Developers → Instagram → API setup → Generar tokens de acceso, debajo del nombre de la cuenta).
 * El token del inicio de sesión unificado lee la cuenta por su id, aunque no la liste como asignada.
 */
const ACCOUNT_ID = "17841467725523157";

/** Los tokens de Facebook (inicio de sesión unificado) empiezan por EAA; los de Instagram, por IG */
const isFacebookToken = (token) => token.startsWith("EAA");

/** Publicaciones que muestra el muro */
const POSTS = 3;
/** Ancho de las fotos guardadas (las tarjetas miden ~390 px: 2x para pantallas retina) */
const MEDIA_WIDTH = 800;
const AVATAR_SIZE = 96;

// En Windows la caché de sharp deja los archivos abiertos y no se pueden borrar
sharp.cache(false);

try {
  process.loadEnvFile(path.join(root, ".env"));
} catch {
  // Sin .env (p. ej. en GitHub Actions): se usan las variables del entorno
}

const args = new Set(process.argv.slice(2));
const inActions = process.env.GITHUB_ACTIONS === "true";
const env = (name) => process.env[name]?.trim() || "";

const log = (msg) => console.log(msg);
const warn = (msg) => console.warn(inActions ? `::warning::${msg}` : `⚠ ${msg}`);
const fail = (msg) => console.error(inActions ? `::error::${msg}` : `✖ ${msg}`);

/* ------------------------------------------------------------------ */

async function main() {
  const previous = await readJson(DATA_FILE);
  const next = { updatedAt: previous?.updatedAt ?? null, instagram: previous?.instagram ?? null };

  const beholdUrl = env("BEHOLD_FEED_URL");
  let token = env("INSTAGRAM_TOKEN");

  if (!beholdUrl && !token) {
    log("No hay BEHOLD_FEED_URL ni INSTAGRAM_TOKEN: se conservan las publicaciones que ya había.");
    return;
  }

  await mkdir(IMG_DIR, { recursive: true });

  try {
    let account;
    if (beholdUrl) {
      account = await fromBehold(beholdUrl);
    } else {
      // Los tokens de usuario del sistema no caducan: no hay nada que renovar
      if (args.has("--refresh") && !isFacebookToken(token)) token = await refreshToken(token);
      account = await fromMeta(token);
    }
    next.instagram = await saveAccount(account);
    log(`Instagram: ${next.instagram.posts.length} publicaciones de @${next.instagram.username} (vía ${beholdUrl ? "Behold" : "API de Meta"}).`);
  } catch (error) {
    fail(`Instagram: no se pudieron bajar las publicaciones (${error.message}). Se conservan las anteriores.`);
    process.exitCode = 1;
  }

  const changed = JSON.stringify(next.instagram) !== JSON.stringify(previous?.instagram ?? null);
  if (changed) next.updatedAt = new Date().toISOString();

  await writeFile(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`);
  await removeUnusedImages(next);
  log(changed ? `Guardado ${path.relative(root, DATA_FILE)}.` : "Sin cambios en las publicaciones.");
}

/**
 * Cuenta en formato común: { username, avatarUrl, posts: [{ id, permalink, kind,
 * caption, timestamp, likes, comments, imageUrls[] }] } con las más recientes primero.
 */
function latest(posts) {
  return posts
    .filter((p) => p.imageUrls.length)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, POSTS);
}

/** Fechas de Meta como "2026-10-29T15:00:00+0000" → ISO estándar */
function isoDate(value) {
  const date = new Date(String(value).replace(/([+-]\d\d)(\d\d)$/, "$1:$2"));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/* ------------------------------ Behold ------------------------------ */

async function fromBehold(url) {
  const feed = await getJson(url);
  if (!Array.isArray(feed.posts)) throw new Error("el feed de Behold no trae publicaciones (¿es un feed JSON?)");

  const posts = feed.posts.map((p) => {
    const child = p.children?.[0];
    const isVideo = p.mediaType === "VIDEO";
    return {
      id: String(p.id),
      permalink: p.permalink,
      kind: isVideo ? "reel" : p.mediaType === "CAROUSEL_ALBUM" ? "carousel" : "image",
      caption: p.caption ?? "",
      timestamp: isoDate(p.timestamp),
      likes: p.likeCount ?? null,
      comments: p.commentsCount ?? null,
      // Primero las versiones de la CDN de Behold; si fallan, las de Instagram
      imageUrls: [
        p.sizes?.large?.mediaUrl,
        p.sizes?.medium?.mediaUrl,
        isVideo ? p.thumbnailUrl : p.mediaUrl,
        child?.sizes?.large?.mediaUrl,
        child?.mediaUrl,
      ].filter(Boolean),
    };
  });

  return { username: feed.username, avatarUrl: feed.profilePictureUrl ?? null, posts: latest(posts) };
}

/* ---------------------------- API de Meta ---------------------------- */

const IG_FIELDS =
  "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";

async function fromMeta(token) {
  if (!isFacebookToken(token)) {
    const me = await api(`${IG_API}/me`, { fields: "user_id,username,profile_picture_url", access_token: token });
    const { data = [] } = await api(`${IG_API}/me/media`, { fields: IG_FIELDS, limit: "12", access_token: token });
    return { username: me.username, avatarUrl: me.profile_picture_url ?? null, posts: await toPosts(data, IG_API, token) };
  }

  const account = await api(`${FB_API}/${ACCOUNT_ID}`, { fields: "username,profile_picture_url", access_token: token });
  const { data = [] } = await api(`${FB_API}/${ACCOUNT_ID}/media`, { fields: IG_FIELDS, limit: "12", access_token: token });
  return { username: account.username, avatarUrl: account.profile_picture_url ?? null, posts: await toPosts(data, FB_API, token) };
}

/** Publicaciones de la API → formato común. `base` es el dominio de la API que corresponde al token */
async function toPosts(data, base, token) {
  const posts = [];
  for (const m of data) {
    const isVideo = m.media_type === "VIDEO";
    const imageUrls = [isVideo ? m.thumbnail_url : m.media_url].filter(Boolean);
    posts.push({
      id: m.id,
      permalink: m.permalink,
      kind: isVideo || m.media_product_type === "REELS" ? "reel" : m.media_type === "CAROUSEL_ALBUM" ? "carousel" : "image",
      caption: m.caption ?? "",
      timestamp: isoDate(m.timestamp),
      likes: m.like_count ?? null,
      comments: m.comments_count ?? null,
      imageUrls,
      carousel: m.media_type === "CAROUSEL_ALBUM" && !imageUrls.length,
    });
  }

  // A los carruseles sin foto propia se les pide la primera foto, solo a los que se van a mostrar
  const shown = posts
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, POSTS + 2);
  for (const p of shown.filter((p) => p.carousel)) {
    const { data: children = [] } = await api(`${base}/${p.id}/children`, {
      fields: "media_type,media_url,thumbnail_url",
      access_token: token,
    });
    const child = children[0];
    if (child) p.imageUrls = [child.media_type === "VIDEO" ? child.thumbnail_url : child.media_url].filter(Boolean);
  }

  return latest(shown);
}

/**
 * Renueva el token por 60 días. Si Meta devuelve uno distinto, lo deja en
 * REFRESHED_TOKENS_FILE para que la tarea programada lo guarde como secreto.
 * Un fallo aquí no detiene la descarga: el token actual puede seguir valiendo
 * (Meta no renueva tokens de menos de 24 horas).
 */
async function refreshToken(token) {
  try {
    const res = await api(`${IG_API}/refresh_access_token`, { grant_type: "ig_refresh_token", access_token: token });
    log(`Instagram: token renovado, vence en ${Math.round((res.expires_in ?? 0) / 86400)} días.`);

    if (res.access_token && res.access_token !== token) {
      if (inActions) console.log(`::add-mask::${res.access_token}`);
      const file = env("REFRESHED_TOKENS_FILE");
      if (file) {
        await appendFile(file, `INSTAGRAM_TOKEN=${res.access_token}\n`);
      } else if (!inActions) {
        log(`Meta devolvió un token nuevo. Reemplaza INSTAGRAM_TOKEN en .env por:\nINSTAGRAM_TOKEN=${res.access_token}`);
      } else {
        warn("Meta devolvió un token nuevo y no hay REFRESHED_TOKENS_FILE donde dejarlo.");
      }
      return res.access_token;
    }
  } catch (error) {
    warn(`Instagram: no se pudo renovar el token (${error.message}). Se usa el actual.`);
  }
  return token;
}

/** Cambia un token de 1 hora por uno de 60 días y lo muestra */
async function exchangeToken() {
  const token = env("INSTAGRAM_TOKEN");
  const secret = env("INSTAGRAM_APP_SECRET");
  if (!token || !secret) {
    fail("Pon en .env el token corto (INSTAGRAM_TOKEN) y la clave secreta de la app (INSTAGRAM_APP_SECRET).");
    process.exitCode = 1;
    return;
  }
  try {
    const res = await api(`${IG_API}/access_token`, {
      grant_type: "ig_exchange_token",
      client_secret: secret,
      access_token: token,
    });
    const days = Math.round((res.expires_in ?? 0) / 86400);
    log(`Token de ${days} días. Guárdalo como INSTAGRAM_TOKEN:\nINSTAGRAM_TOKEN=${res.access_token}`);
  } catch (error) {
    fail(`No se pudo cambiar el token (${error.message}).`);
    process.exitCode = 1;
  }
}

/* ----------------------------- Archivos ----------------------------- */

/** Guarda fotos y foto de perfil, y devuelve lo que va al JSON */
async function saveAccount(account) {
  if (!account.posts.length) throw new Error("la cuenta no devolvió publicaciones con foto");

  const posts = [];
  for (const { imageUrls, carousel, ...post } of account.posts) {
    posts.push({ ...post, image: await saveImage(imageUrls, `instagram-${post.id}`) });
  }

  let avatar = null;
  if (account.avatarUrl) {
    try {
      avatar = await saveAvatar(account.avatarUrl, "instagram-avatar");
    } catch (error) {
      warn(`Instagram: no se pudo bajar la foto de perfil (${error.message}).`);
    }
  }

  return { username: account.username, avatar, posts };
}

const exists = (file) => access(file).then(() => true, () => false);

/**
 * Guarda la foto en WebP. Las URL de Instagram caducan a los pocos días, por eso
 * se copian al sitio. El nombre lleva el id de la publicación: si ya existe no se
 * vuelve a bajar. Prueba las URL en orden hasta que una funcione.
 */
async function saveImage(urls, name) {
  const file = path.join(IMG_DIR, `${name}.webp`);
  const src = `${IMG_URL}/${name}.webp`;
  if (await exists(file)) {
    try {
      const { width, height } = await sharp(file).metadata();
      return { src, width, height };
    } catch {
      // Archivo dañado (p. ej. una ejecución interrumpida): se vuelve a bajar
    }
  }

  let lastError;
  for (const url of urls) {
    try {
      const { width, height } = await sharp(await download(url))
        .rotate()
        .resize({ width: MEDIA_WIDTH, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(file);
      return { src, width, height };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`no se pudo bajar la foto de ${name} (${lastError?.message ?? "sin URL"})`);
}

/** La foto de perfil se baja siempre, por si la cambiaron */
async function saveAvatar(url, name) {
  await sharp(await download(url))
    .resize({ width: AVATAR_SIZE, height: AVATAR_SIZE, fit: "cover" })
    .webp({ quality: 85 })
    .toFile(path.join(IMG_DIR, `${name}.webp`));
  return `${IMG_URL}/${name}.webp`;
}

/** Borra las fotos de publicaciones que ya no están en el muro */
async function removeUnusedImages(feed) {
  const used = new Set();
  if (feed.instagram?.avatar) used.add(path.basename(feed.instagram.avatar));
  for (const p of feed.instagram?.posts ?? []) if (p.image) used.add(path.basename(p.image.src));

  for (const file of await readdir(IMG_DIR).catch(() => [])) {
    if (/\.webp$/.test(file) && !used.has(file)) await rm(path.join(IMG_DIR, file));
  }
}

/* ------------------------------ Red ------------------------------ */

/** Llamada a la API de Meta. El mensaje de error no incluye el token; la URL (que sí lo lleva) no se muestra */
async function api(url, params) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return getJson(u);
}

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const message = typeof body.error === "string" ? body.error : body.error?.message;
    throw new Error(message ?? `HTTP ${res.status}`);
  }
  return body;
}

async function download(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

/* Al final: así todas las constantes de arriba ya están inicializadas */
if (args.has("--exchange")) {
  await exchangeToken();
} else {
  await main();
}
