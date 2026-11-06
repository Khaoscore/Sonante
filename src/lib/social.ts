import feedJson from "@/data/social-feed.json";
import type { Locale } from "@/i18n";

/**
 * Últimas publicaciones de Instagram para el muro de "Nuestros tips". Las escribe
 * `npm run social` (scripts/social-feed.mjs), que corre solo en GitHub Actions;
 * mientras `instagram` sea null, el muro muestra las maquetas del diseño.
 */

export type FeedImage = { src: string; width: number; height: number };

export type InstagramFeedPost = {
  id: string;
  permalink: string;
  kind: "image" | "carousel" | "reel";
  caption: string;
  timestamp: string;
  likes: number | null;
  comments: number | null;
  image: FeedImage | null;
};

export type SocialFeed = {
  updatedAt: string | null;
  instagram: { username: string; avatar: string | null; posts: InstagramFeedPost[] } | null;
};

export const socialFeed = feedJson as unknown as SocialFeed;

const intlLocale: Record<Locale, string> = { es: "es-CO", en: "en-US" };

/** "23 de septiembre" / "September 23" (hora de Bogotá); con año si no es del año en curso */
export function postDate(iso: string, lang: Locale, now = new Date()): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(intlLocale[lang], {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "America/Bogota",
  }).format(date);
}

/** Cifras como las muestra Instagram: 1.581 · 12,3 mil · 3,5 M (es) / 1,581 · 12.3K · 3.5M (en) */
export function compactNumber(n: number, lang: Locale): string {
  const locale = intlLocale[lang];
  const short = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: value < 100 ? 1 : 0 }).format(Math.floor(value * 10) / 10);
  if (n < 10_000) return new Intl.NumberFormat(locale).format(n);
  if (n < 1_000_000) return lang === "es" ? `${short(n / 1000)} mil` : `${short(n / 1000)}K`;
  return lang === "es" ? `${short(n / 1_000_000)} M` : `${short(n / 1_000_000)}M`;
}

/** Texto en una sola línea, para recortar captions largos */
export function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
