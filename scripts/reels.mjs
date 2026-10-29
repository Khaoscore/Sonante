#!/usr/bin/env node
/**
 * Descarga los reels / TikToks del carrusel del hero y los prepara para la web.
 *
 * Lee src/data/hero-reels.json ([{ id, url, views, author? }]) y por cada video
 * que falte deja en public/assets/video/hero/, en WebM (VP9 + Opus):
 *   <id>-loop.webm  los primeros LOOP_SECONDS sin audio (el bucle del carrusel)
 *   <id>.webm       el video completo con audio (se carga al activar el sonido)
 *   <id>.webp       el póster: primer cuadro
 * VP9 a dos pasadas con tope de bitrate pesa ~40 % menos que el H.264
 * equivalente; a cambio, codificar tarda (unos 3 s por segundo de video).
 * Si `views` está vacío (null) lo completa con las visualizaciones que reporta
 * la plataforma, y `author` con la cuenta que publicó el video. Marca con
 * `ready: true` los que quedaron listos: el carrusel sólo muestra esos.
 *
 * Si la plataforma no deja descargar (TikTok a veces responde con una
 * verificación anti-bots), basta con dejar el archivo original en
 * videos-originales/<id>.mp4 (o .mov, .webm…): se usa ese en lugar de descargar.
 *
 * Uso:
 *   npm run reels                 descarga sólo lo que falta
 *   npm run reels -- --force      vuelve a descargar todo
 *   npm run reels -- --views      actualiza las visualizaciones de todos
 *   npm run reels -- --cookies-from-browser chrome
 *                                 usa la sesión del navegador (Instagram a veces
 *                                 pide iniciar sesión para descargar o ver cifras)
 *
 * Requiere yt-dlp y ffmpeg en el PATH.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "src/data/hero-reels.json");
const OUT = join(ROOT, "public/assets/video/hero");
const SOURCES = join(ROOT, "videos-originales"); // originales locales (no se publican)

const WIDTH = 480; // ancho máximo: la pieza más grande mide 238 px (×2 en pantallas retina)
const LOOP_SECONDS = 10;

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const refreshViews = argv.includes("--views");
const cookiesAt = argv.indexOf("--cookies-from-browser");
const cookies = cookiesAt >= 0 ? ["--cookies-from-browser", argv[cookiesAt + 1]] : [];

function run(cmd, args) {
  // PYTHONUTF8: yt-dlp (Python) escribe en UTF-8 aunque la consola de Windows use otra página de códigos
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, PYTHONUTF8: "1" } });
  if (r.error) throw new Error(`No se pudo ejecutar ${cmd}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`${cmd} falló:\n${(r.stderr || r.stdout).trim().slice(-1500)}`);
  return r.stdout;
}

/** Descarga el video en una carpeta temporal propia; devuelve la ruta y los metadatos */
function download(url) {
  const dir = mkdtempSync(join(tmpdir(), "sonante-reel-"));
  const stdout = run("yt-dlp", [
    ...cookies,
    "--no-playlist",
    "--no-progress",
    "--no-warnings",
    "-f",
    "bv*+ba/b",
    "--merge-output-format",
    "mkv",
    "-o",
    join(dir, "source.%(ext)s"),
    "--dump-json",
    "--no-simulate",
    url,
  ]);
  const info = JSON.parse(stdout.trim().split("\n").pop());
  const file = readdirSync(dir).find((f) => f.startsWith("source."));
  if (!file) throw new Error("yt-dlp no dejó ningún archivo");
  return { dir, file: join(dir, file), info };
}

/** Sólo metadatos (para actualizar visualizaciones sin volver a descargar) */
function metadata(url) {
  const stdout = run("yt-dlp", [...cookies, "--no-playlist", "--no-warnings", "--dump-json", "--skip-download", url]);
  return JSON.parse(stdout.trim().split("\n").pop());
}

const scale = `scale='min(${WIDTH},iw)':-2,setsar=1`;
const NULL = process.platform === "win32" ? "NUL" : "/dev/null";
const vp9 = ["-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", "-row-mt", "1", "-tile-columns", "1", "-deadline", "good"];

/**
 * VP9 a dos pasadas en "calidad restringida": `crf` fija la calidad y
 * `bitrate` pone el tope (las escenas simples quedan por debajo).
 */
function vp9TwoPass(src, out, { seconds, bitrate, crf, audio }) {
  const logDir = mkdtempSync(join(tmpdir(), "sonante-vp9-"));
  const log = join(logDir, "pass");
  const input = ["-y", "-v", "error", "-i", src, ...(seconds ? ["-t", String(seconds)] : []), "-map", "0:v:0", "-vf", scale];
  const rate = ["-b:v", bitrate, "-crf", String(crf)];
  const sound = audio ? ["-map", "0:a:0?", "-c:a", "libopus", "-b:a", "80k", "-ac", "2"] : ["-an"];
  try {
    run("ffmpeg", [...input, ...vp9, ...rate, "-cpu-used", "4", "-pass", "1", "-passlogfile", log, "-an", "-f", "null", NULL]);
    run("ffmpeg", [...input, ...sound, ...vp9, ...rate, "-cpu-used", "2", "-auto-alt-ref", "1", "-lag-in-frames", "25", "-pass", "2", "-passlogfile", log, out]);
  } finally {
    rmSync(logDir, { recursive: true, force: true });
  }
}

const OUTPUTS = ["-loop.webm", ".webm", ".webp"];
const STALE = [".mp4", "-loop.mp4"]; // versiones anteriores en H.264

function encode(src, id) {
  const loop = join(OUT, `${id}-loop.webm`);
  vp9TwoPass(src, loop, { seconds: LOOP_SECONDS, bitrate: "350k", crf: 38, audio: false });
  vp9TwoPass(src, join(OUT, `${id}.webm`), { bitrate: "500k", crf: 34, audio: true });
  run("ffmpeg", ["-y", "-v", "error", "-i", loop, "-frames:v", "1", "-c:v", "libwebp", "-quality", "75", join(OUT, `${id}.webp`)]);
  for (const ext of STALE) rmSync(join(OUT, `${id}${ext}`), { force: true });
}

const views = (info) => {
  const n = info.view_count ?? info.play_count;
  return typeof n === "number" && n > 0 ? n : null;
};

const kb = (path) => `${Math.round(readFileSync(path).length / 1024)} KB`;

/** Original local del video, si existe: videos-originales/<id>.<ext> */
const localSource = (id) => {
  if (!existsSync(SOURCES)) return null;
  const file = readdirSync(SOURCES).find((f) => f.slice(0, f.lastIndexOf(".")) === id);
  return file ? join(SOURCES, file) : null;
};

const reels = JSON.parse(readFileSync(DATA, "utf8"));
mkdirSync(OUT, { recursive: true });

let changed = false;
let failures = 0;

/** Guarda después de cada video: el sitio los muestra a medida que quedan listos */
const save = () => {
  if (!changed) return;
  writeFileSync(DATA, `${JSON.stringify(reels, null, 2)}\n`);
  changed = false;
};

for (const reel of reels) {
  const has = OUTPUTS.every((ext) => existsSync(join(OUT, `${reel.id}${ext}`)));
  const wantViews = refreshViews || reel.views == null;
  process.stdout.write(`· ${reel.id} … `);
  try {
    let info = null;
    const local = localSource(reel.id);
    if (!has || force) {
      if (local) {
        encode(local, reel.id);
      } else {
        const { dir, file, info: meta } = download(reel.url);
        try {
          encode(file, reel.id);
        } finally {
          rmSync(dir, { recursive: true, force: true });
        }
        info = meta;
      }
    } else if (wantViews && !local) {
      info = metadata(reel.url);
    }
    if (!reel.ready) {
      reel.ready = true;
      changed = true;
    }
    if (info) {
      const n = views(info);
      if (wantViews && n != null && n !== reel.views) {
        reel.views = n;
        changed = true;
      }
      // En Instagram `channel` es la cuenta (@usuario); `uploader`, el nombre largo del perfil
      const who = info.channel || info.uploader;
      if (!reel.author && who) {
        reel.author = who;
        changed = true;
      }
    }
    const base = join(OUT, reel.id);
    const sizes = `loop ${kb(`${base}-loop.webm`)}, completo ${kb(`${base}.webm`)}, póster ${kb(`${base}.webp`)}`;
    console.log(`ok (${sizes}; vistas: ${reel.views ?? "sin dato"})`);
    if (reel.views == null && /instagram\.com/i.test(reel.url)) {
      console.log("  Instagram no entrega las visualizaciones sin sesión: escríbelas en hero-reels.json o usa --cookies-from-browser");
    }
  } catch (err) {
    failures++;
    console.log("error");
    console.error(`  ${String(err.message).replace(/\n/g, "\n  ")}`);
    console.error(`  → Si no se puede descargar, deja el original en videos-originales/${reel.id}.mp4 y vuelve a correr el script.`);
  }
  save();
}

if (failures) process.exitCode = 1;
