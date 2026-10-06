import type { ReactNode } from "react";
import { home } from "@/data/home";
import type { Locale } from "@/i18n";
import styles from "./Distintos.module.css";

type Props = {
  lang?: Locale;
  /** Fondo animado (isla DistintosWall) insertado desde la página Astro */
  children?: ReactNode;
};

/**
 * Sección "Lo que nos hace distintos": muro de fotos en perspectiva de fondo
 * (DriftWall, llega como hijo para hidratarse aparte) y columna de texto a la
 * izquierda (Wireframe 1, frames 11:784 y 11:767-771).
 */
export default function Distintos({ lang = "es", children }: Props) {
  const { title, items } = home[lang].distintos;

  return (
    <section className={styles.section} aria-labelledby="distintos-title">
      <div className={styles.wall}>{children}</div>
      <div className={styles.veil} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <h2 id="distintos-title" className={`t-h2 ${styles.title}`}>
          {title}
        </h2>
        <div className={styles.items}>
          {items.map((it) => (
            <article key={it.title} className={styles.item}>
              <h3 className={`t-h4 ${styles.itemTitle}`}>{it.title}</h3>
              <p className={`t-body ${styles.itemBody}`} dangerouslySetInnerHTML={{ __html: it.html }} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
