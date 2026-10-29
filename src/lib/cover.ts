/**
 * Portadas generadas de los artículos: fondo oscuro con dos brillos de color de la
 * marca, el símbolo "S" en un círculo y un destello. La paleta depende de la
 * categoría y la posición de los brillos se deriva del slug, así cada artículo
 * tiene una portada propia y estable.
 *
 * La usan el componente ArticleCover (tarjetas y cabecera, en CSS) y el endpoint
 * /og/<slug>.png (imagen para compartir, en SVG renderizado con sharp).
 */

export type CoverPalette = {
  /** Brillo principal y secundario */
  glow1: string;
  glow2: string;
  /** Círculo del símbolo */
  disc: string;
  /** Trazo inferior y superior de la "S" */
  symbol: string;
  accent: string;
  /** Destello de cuatro puntas */
  spark: string;
};

const PALETTES: Record<string, CoverPalette> = {
  "Estrategia electoral": { glow1: "#b61075", glow2: "#ffd148", disc: "#b61075", symbol: "#ffffff", accent: "#ffd148", spark: "#ffd148" },
  "Comunicación digital": { glow1: "#5180e2", glow2: "#0bb730", disc: "#0bb730", symbol: "#00211d", accent: "#f8ffe5", spark: "#0bb730" },
  "Comunicación pública": { glow1: "#e94b24", glow2: "#ff9024", disc: "#e94b24", symbol: "#ffffff", accent: "#ffd148", spark: "#ff9024" },
  Oficio: { glow1: "#72beb0", glow2: "#ffd148", disc: "#ffd148", symbol: "#00211d", accent: "#b61075", spark: "#72beb0" },
};

const FALLBACK = PALETTES["Estrategia electoral"];

/** Brillos en esquinas opuestas; el destello, cerca del brillo principal */
const LAYOUTS = [
  { g1: [16, 14], g2: [88, 96], spark: [74, 18] },
  { g1: [84, 12], g2: [10, 94], spark: [24, 20] },
  { g1: [14, 90], g2: [90, 8], spark: [78, 80] },
  { g1: [86, 88], g2: [12, 10], spark: [22, 78] },
] as const;

/** FNV-1a: número estable a partir del slug */
function hash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type CoverSpec = {
  palette: CoverPalette;
  /** Posiciones en % del ancho y alto */
  g1: [number, number];
  g2: [number, number];
  spark: [number, number];
  /** Giro del destello en grados */
  sparkRotate: number;
};

export function coverSpec(slug: string, category: string): CoverSpec {
  const h = hash(slug);
  const layout = LAYOUTS[h % LAYOUTS.length];
  // Pequeño desplazamiento propio de cada artículo (±6 %)
  const jitter = (shift: number) => (((h >>> shift) & 0xff) / 255) * 12 - 6;
  return {
    palette: PALETTES[category] ?? FALLBACK,
    g1: [layout.g1[0] + jitter(4), layout.g1[1] + jitter(12)],
    g2: [layout.g2[0] + jitter(20), layout.g2[1] + jitter(8)],
    spark: [layout.spark[0] + jitter(16), layout.spark[1] + jitter(24)],
    sparkRotate: ((h >>> 9) % 4) * 11,
  };
}

/** Destello de cuatro puntas (viewBox 0 0 24 24) */
export const SPARK_PATH =
  "M12 0C12.8 6.5 17.5 11.2 24 12C17.5 12.8 12.8 17.5 12 24C11.2 17.5 6.5 12.8 0 12C6.5 11.2 11.2 6.5 12 0Z";

/** Trazos del símbolo "S" (viewBox 0 0 75.058 99.23): inferior y superior */
export const SYMBOL_PATHS = {
  bottom:
    "M52.204 45.87C47.496 45.813 43.14 46.866 38.05 47.682C47.923 53.068 58.047 58.396 58.047 69.027C58.047 81.556 47.249 86.267 37.53 86.267C17.252 86.267 15.88 64.078 15.88 64.078H0C0 64.078 -0.602001 99.23 37.529 99.23C57.535 99.23 75.058 89.22 75.058 70.954C75.058 56.489 66.235 46.039 52.204 45.87Z",
  top: "M19.484 27.53C19.484 19.436 27.143 13.084 37.53 13.084C49.078 13.084 55.667 22.864 55.667 30.155H71.426C71.426 19.538 64.292 0 37.53 0C18.795 0 2.944 10.991 2.944 25.995C2.944 40.999 14.802 47.996 24.231 48.516C29.635 48.814 34.068 48.321 38.05 47.682C28.653 42.556 19.484 37.379 19.484 27.53Z",
};

/**
 * La misma portada como SVG de tamaño fijo, para la imagen que se comparte en
 * redes (1200×630). Sin texto, para no depender de fuentes al renderizar.
 */
export function coverSvg(slug: string, category: string, width = 1200, height = 630) {
  const { palette: p, g1, g2, spark, sparkRotate } = coverSpec(slug, category);
  const px = ([x, y]: [number, number]) => [(x / 100) * width, (y / 100) * height] as const;
  const [g1x, g1y] = px(g1);
  const [g2x, g2y] = px(g2);
  const [sx, sy] = px(spark);
  const diag = Math.hypot(width, height);
  const r = height * 0.27;
  const symH = r * 1.08;
  const symScale = symH / 99.23;
  const sparkSize = height * 0.075;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#03130f"/><stop offset="0.6" stop-color="#00211d"/><stop offset="1" stop-color="#021713"/>
    </linearGradient>
    <radialGradient id="g1" gradientUnits="userSpaceOnUse" cx="${g1x}" cy="${g1y}" r="${diag * 0.5}">
      <stop offset="0" stop-color="${p.glow1}" stop-opacity="0.9"/><stop offset="1" stop-color="${p.glow1}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" gradientUnits="userSpaceOnUse" cx="${g2x}" cy="${g2y}" r="${diag * 0.42}">
      <stop offset="0" stop-color="${p.glow2}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.glow2}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${r * 0.12}" stdDeviation="${r * 0.18}" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#g1)"/>
  <rect width="100%" height="100%" fill="url(#g2)"/>
  <circle cx="${width / 2}" cy="${height / 2}" r="${r}" fill="${p.disc}" filter="url(#shadow)"/>
  <g transform="translate(${width / 2 - (75.058 * symScale) / 2} ${height / 2 - symH / 2}) scale(${symScale})">
    <path d="${SYMBOL_PATHS.bottom}" fill="${p.symbol}"/>
    <path d="${SYMBOL_PATHS.top}" fill="${p.accent}"/>
  </g>
  <g transform="translate(${sx - sparkSize / 2} ${sy - sparkSize / 2}) rotate(${sparkRotate} ${sparkSize / 2} ${sparkSize / 2}) scale(${sparkSize / 24})">
    <path d="${SPARK_PATH}" fill="${p.spark}"/>
  </g>
</svg>`;
}
