/**
 * Fotos de "¿Quiénes somos?" para la tarjeta fija y el carrusel (TeamScroll).
 *
 * Recorta cada foto a la proporción de la tarjeta (100/137) con su punto de
 * interés, la limita a 960 px de ancho (sin agrandar) y la guarda en WebP en
 * public/assets/img/equipo/<id>.webp. El recorte también elimina las esquinas
 * redondeadas que traen algunas exportaciones de Figma.
 *
 * Uso: npm run team:img   (después de cambiar una foto o su encuadre)
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/assets/img";
const OUT = "public/assets/img/equipo";
const RATIO = 100 / 137; // ancho / alto de la tarjeta
const MAX_W = 960;

/** x, y: punto de interés (0 = izquierda/arriba, 1 = derecha/abajo), como object-position */
const photos = [
  { id: "jessica", file: "Frame 9.png", x: 0.5, y: 0.45 },
  { id: "jose", file: "jose-paz.png", x: 0.5, y: 0.45 },
  { id: "dato-jessica", file: "Frame 47.jpg", x: 0.5, y: 0.5 },
  { id: "dato-jose", file: "team-1595.png", x: 0.5, y: 0.5 },
  { id: "ruptura", file: "team-1594.png", x: 0.5, y: 0.5 },
  { id: "esto-es-sonante", file: "Frame 53.png", x: 0.5, y: 0.6 },
];

await mkdir(OUT, { recursive: true });

for (const { id, file, x, y } of photos) {
  const input = path.join(SRC, file);
  const { width: w, height: h } = await sharp(input).metadata();
  // Caja más grande con la proporción de la tarjeta que entra en la foto
  let cw = w;
  let ch = Math.round(w / RATIO);
  if (ch > h) {
    ch = h;
    cw = Math.round(h * RATIO);
  }
  const left = Math.round((w - cw) * x);
  const top = Math.round((h - ch) * y);
  const out = path.join(OUT, `${id}.webp`);
  const info = await sharp(input)
    .extract({ left, top, width: cw, height: ch })
    .resize({ width: Math.min(MAX_W, cw), withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`${out}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB  (de ${file}, ${w}×${h})`);
}
