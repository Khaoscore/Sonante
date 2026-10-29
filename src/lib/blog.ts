import fs from "node:fs";
import path from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import type { Tip } from "@/data/tips";

/**
 * Utilidades del blog: lectura y orden de los artículos, portadas y datos derivados.
 * Solo se usan en el servidor (frontmatter de las páginas .astro).
 */

export type Article = CollectionEntry<"blog">;

export const articlePath = (slug: string) => `/nuestros-tips/${slug}/`;

/** Número del archivo (01-…, 02-…) para ordenar los artículos sin fecha */
const fileOrder = (a: Article) => Number(a.filePath?.split(/[\\/]/).pop()?.match(/^(\d+)/)?.[1] ?? 999);

/** Con fecha, del más reciente al más antiguo; sin fecha, en el orden de los archivos */
function compare(a: Article, b: Article) {
  const da = a.data.publishDate?.getTime();
  const db = b.data.publishDate?.getTime();
  if (da !== undefined && db !== undefined && da !== db) return db - da;
  if (da !== undefined && db === undefined) return -1;
  if (da === undefined && db !== undefined) return 1;
  return fileOrder(a) - fileOrder(b);
}

/**
 * Artículos visibles, ya ordenados. Los marcados `status: "incompleto"` solo
 * aparecen en desarrollo: no se generan en el build de producción.
 */
export async function getArticles(): Promise<Article[]> {
  const entries = await getCollection("blog", ({ data }) => import.meta.env.DEV || data.status !== "incompleto");
  return entries.sort(compare);
}

const COVER_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/**
 * Devuelve la portada solo si el archivo existe en /public. Acepta la misma ruta
 * con otra extensión (p. ej. .webp en lugar de .jpg). Sin archivo, la plantilla
 * muestra el bloque amarillo del diseño.
 */
export function resolveCover(cover: Article["data"]["cover"]) {
  if (!cover?.src) return undefined;
  const publicDir = path.join(process.cwd(), "public");
  const ext = path.extname(cover.src);
  const stem = ext ? cover.src.slice(0, -ext.length) : cover.src;
  const candidates = [cover.src, ...COVER_EXTENSIONS.map((e) => stem + e)];
  const found = candidates.find((src) => fs.existsSync(path.join(publicDir, src)));
  return found ? { ...cover, src: found } : undefined;
}

/** Fecha en letras, con el mes en minúscula: "12 de septiembre de 2026" */
export function formatDate(date: Date, locale = "es-CO") {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

/** Datos de tarjeta para la rejilla de tips */
export function toTip(article: Article, featured = false): Tip {
  const cover = resolveCover(article.data.cover);
  return {
    id: article.id,
    title: article.data.title,
    category: article.data.category,
    tags: article.data.tags.slice(0, 2),
    href: articlePath(article.id),
    image: cover?.src,
    featured,
  };
}

/** Hasta `count` artículos relacionados: primero los de la misma categoría */
export function relatedArticles(current: Article, all: Article[], count = 3): Article[] {
  const others = all.filter((a) => a.id !== current.id);
  const same = others.filter((a) => a.data.category === current.data.category);
  const rest = others.filter((a) => a.data.category !== current.data.category);
  return [...same, ...rest].slice(0, count);
}
