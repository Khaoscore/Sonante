import DriftWall, { type DriftWallItem } from "@/components/ui/DriftWall";

type Props = { items: DriftWallItem[] };

/**
 * Muro de fotos en perspectiva (DriftWall de React Bits) usado como fondo de
 * "Lo que nos hace distintos". Las imágenes provienen de src/assets/distintos/
 * (ver src/data/distintos.ts). Es una isla: se hidrata cuando entra en pantalla.
 */
export default function DistintosWall({ items }: Props) {
  if (!items.length) return null;
  return (
    <DriftWall
      items={items}
      columns={5}
      tileWidth={280}
      tileHeight={186}
      gap={22}
      radius={16}
      tilt={14}
      turn={-12}
      perspective={1400}
      depth={160}
      speed={26}
      direction="up"
      variance={0.4}
      parallax={0.45}
      lift={60}
      fade={0.55}
      dim={0.55}
      overlayColor="#00211d"
      decorative
    />
  );
}
