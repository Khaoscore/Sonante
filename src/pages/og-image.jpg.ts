import type { APIRoute } from "astro";
import sharp from "sharp";
import { SYMBOL_PATHS } from "@/lib/cover";
import wordmarkSvg from "../../public/assets/icons/logo-sonante.svg?raw";

/**
 * Imagen para compartir el sitio en redes y mensajería (1200×630): /og-image.jpg.
 * Es la que usan todas las páginas salvo los artículos, que tienen portada propia.
 * Logotipo "SONANTE" en blanco y la "S" grande con degradado verde del hero.
 * Sin texto, para no depender de fuentes al renderizar con sharp.
 */

const W = 1200;
const H = 630;

/** Trazos del logotipo (viewBox 0 0 384 62.95), los mismos del footer */
const WORDMARK = { width: 384, height: 62.9509, paths: [...wordmarkSvg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]) };

function svg() {
  // "S" grande a la derecha, con las puntas desvanecidas como en el hero
  const symH = 560;
  const symScale = symH / 99.23;
  const symW = 75.058 * symScale;
  const symX = W - 40 - symW;
  const symY = (H - symH) / 2;

  // Logotipo a la izquierda, centrado en vertical
  const wmW = 600;
  const wmScale = wmW / WORDMARK.width;
  const wmY = (H - WORDMARK.height * wmScale) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#03130f"/><stop offset="0.6" stop-color="#00211d"/><stop offset="1" stop-color="#021713"/>
    </linearGradient>
    <radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="${symX + symW / 2}" cy="${H / 2}" r="520">
      <stop offset="0" stop-color="#0bb730" stop-opacity="0.22"/><stop offset="1" stop-color="#0bb730" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="top" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0.05" stop-color="#0bb730"/><stop offset="0.95" stop-color="#0bb730" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bottom" x1="1" y1="0" x2="0" y2="-0.35">
      <stop offset="0.05" stop-color="#0bb730"/><stop offset="0.95" stop-color="#0bb730" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <g transform="translate(${symX} ${symY}) scale(${symScale})">
    <path d="${SYMBOL_PATHS.top}" fill="url(#top)"/>
    <path d="${SYMBOL_PATHS.bottom}" fill="url(#bottom)"/>
  </g>
  <g transform="translate(96 ${wmY}) scale(${wmScale})" fill="#ffffff">
    ${WORDMARK.paths.map((d) => `<path d="${d}"/>`).join("")}
  </g>
</svg>`;
}

export const GET: APIRoute = async () => {
  const jpg = await sharp(Buffer.from(svg())).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg" } });
};
