import type { CSSProperties } from "react";
import { coverSpec, SYMBOL_PATHS } from "@/lib/cover";
import styles from "./ArticleCover.module.css";

type Props = {
  slug: string;
  category: string;
  className?: string;
};

/**
 * Portada generada de un artículo (cuando no tiene foto): fondo oscuro con
 * brillos de la paleta de su categoría y el símbolo "S" en un círculo.
 * Ocupa todo su contenedor, que debe tener posición y alto definidos.
 */
export default function ArticleCover({ slug, category, className = "" }: Props) {
  const { palette: p, g1, g2 } = coverSpec(slug, category);
  const style = {
    "--glow1": p.glow1,
    "--glow2": p.glow2,
    "--disc": p.disc,
    "--g1x": `${g1[0]}%`,
    "--g1y": `${g1[1]}%`,
    "--g2x": `${g2[0]}%`,
    "--g2y": `${g2[1]}%`,
  } as CSSProperties;

  return (
    <div className={`${styles.cover} ${className}`} style={style} aria-hidden="true">
      <span className={styles.disc}>
        <svg className={styles.symbol} viewBox="0 0 75.058 99.23" focusable="false">
          <path d={SYMBOL_PATHS.bottom} fill={p.symbol} />
          <path d={SYMBOL_PATHS.top} fill={p.accent} />
        </svg>
      </span>
    </div>
  );
}
