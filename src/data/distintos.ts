import type { DriftWallItem } from "@/components/ui/DriftWall";

/**
 * Imágenes del muro de "Lo que nos hace distintos".
 *
 * Carpeta: src/assets/distintos/
 * Cualquier archivo .jpg, .jpeg, .png, .webp o .avif que se deje ahí entra
 * automáticamente en el muro (orden alfabético). El nombre del archivo, sin
 * extensión, se usa como título de la ficha.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>("/src/assets/distintos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}", {
  eager: true,
});

export const distintosItems: DriftWallItem[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, mod]) => {
    const file = path.split("/").pop() ?? "";
    const title = file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    return { image: mod.default.src, title };
  });
