import reelsJson from "./hero-reels.json";

/**
 * Piezas del carrusel del hero: reels y TikToks de clientes, en el orden de
 * `hero-reels.json` (el primero arranca centrado). Los videos se listan ahí y se
 * descargan con `npm run reels` (ver scripts/reels.mjs), que deja en
 * public/assets/video/hero/ tres archivos por video, en WebM (VP9 + Opus):
 *  - <id>-loop.webm  primeros segundos sin audio: el bucle que se ve siempre;
 *  - <id>.webm       el video completo con audio: se carga al activar el sonido;
 *  - <id>.webp       el póster (primer cuadro), visible mientras carga.
 * Safari lee WebM desde macOS 11.3 / iOS 17.4; antes de eso se ve el póster.
 */

export type Platform = "instagram" | "tiktok";

type ReelEntry = {
  /** Nombre de archivo (kebab-case), único */
  id: string;
  /** Enlace público del reel o TikTok */
  url: string;
  /** Visualizaciones; null si aún no se conocen (no se muestra la etiqueta) */
  views: number | null;
  /** Me gusta; null o ausente si no se conocen (no se muestra la etiqueta) */
  likes?: number | null;
  /** Cuenta o persona del video (para la etiqueta accesible) */
  author?: string;
  /** El script ya dejó sus archivos en public/: sólo se muestran los listos */
  ready?: boolean;
};

export type HeroReel = ReelEntry & {
  kind: "reel";
  platform: Platform;
  loop: string;
  full: string;
  poster: string;
};

export type HeroImage = { kind: "image"; src: string };

export type HeroItem = HeroReel | HeroImage;

const VIDEO_DIR = "/assets/video/hero";

export const platformOf = (url: string): Platform => (/tiktok\.com/i.test(url) ? "tiktok" : "instagram");

export const platformName: Record<Platform, string> = { instagram: "Instagram", tiktok: "TikTok" };

export const heroReels: HeroReel[] = (reelsJson as ReelEntry[])
  .filter((r) => r.ready)
  .map((r) => ({
  ...r,
  kind: "reel",
  platform: platformOf(r.url),
  loop: `${VIDEO_DIR}/${r.id}-loop.webm`,
  full: `${VIDEO_DIR}/${r.id}.webm`,
  poster: `${VIDEO_DIR}/${r.id}.webp`,
}));

/** Capturas fijas de la versión anterior, mientras no haya reels descargados */
const FALLBACK: HeroImage[] = Array.from({ length: 13 }, (_, i) => ({
  kind: "image",
  src: `/assets/img/hero/hero-${String(i + 1).padStart(2, "0")}.png`,
}));

export const heroItems: HeroItem[] = heroReels.length ? heroReels : FALLBACK;
