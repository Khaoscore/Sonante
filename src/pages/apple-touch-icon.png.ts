import type { APIRoute } from "astro";
import sharp from "sharp";
import { SYMBOL_PATHS } from "@/lib/cover";

/**
 * Icono de 180×180 para iPhone/iPad (menú de compartir, pantalla de inicio):
 * /apple-touch-icon.png. Mismo diseño que favicon.svg; iOS redondea las esquinas.
 */

const SIZE = 180;

function svg() {
  const symH = SIZE * 0.6;
  const scale = symH / 99.23;
  const x = (SIZE - 75.058 * scale) / 2;
  const y = (SIZE - symH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="100%" height="100%" fill="#003833"/>
  <g transform="translate(${x} ${y}) scale(${scale})" fill="#0bb730">
    <path d="${SYMBOL_PATHS.bottom}"/><path d="${SYMBOL_PATHS.top}"/>
  </g>
</svg>`;
}

export const GET: APIRoute = async () => {
  const png = await sharp(Buffer.from(svg())).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
