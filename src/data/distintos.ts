import { getImage } from "astro:assets";
import type { DriftWallItem } from "@/components/ui/DriftWall";

/**
 * Imágenes del muro de "Lo que nos hace distintos".
 *
 * Carpeta: src/assets/distintos/
 * Cualquier archivo .jpg, .jpeg, .png, .webp o .avif que se deje ahí entra
 * automáticamente en el muro (orden alfabético). Al compilar, cada foto se
 * reduce a un .webp de 800 px de ancho, así que los originales pueden pesar
 * lo que sea.
 *
 * El nombre del archivo, sin extensión, se usa como texto alternativo; los
 * nombres de cámara (DSCF0043…) se reemplazan por una descripción genérica.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>("/src/assets/distintos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}", {
  eager: true,
});

const GENERIC_ALT = "Equipo de Sonante";

export const distintosItems: DriftWallItem[] = await Promise.all(
  Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(async ([path, mod]) => {
      const file = path.split("/").pop() ?? "";
      const name = file.replace(/\.[^.]+$/, "");
      const title = /^(DSCF|DSC|IMG|PXL)[_\s-]?\d+/i.test(name) ? GENERIC_ALT : name.replace(/[-_]+/g, " ");
      const optimized = await getImage({ src: mod.default, width: 800, format: "webp", quality: 78 });
      return { image: optimized.src, title };
    }),
);
