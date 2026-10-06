import { aboutContent } from "@/data/team";
import type { Locale } from "@/i18n";
import styles from "./TeamRows.module.css";

type Props = { lang?: Locale };

/**
 * Filas de "¿Quiénes somos?": imagen 488×740 a la izquierda y bloque de texto
 * (título H3 de color + párrafo) a la derecha (frames 134:1074-1098).
 */
export default function TeamRows({ lang = "es" }: Props) {
  const { rows, teamLabel } = aboutContent[lang];

  return (
    <section className={`container ${styles.rows}`} aria-label={teamLabel}>
      {rows.map((row) => (
        <article key={row.id} id={row.id} className={styles.row}>
          <div className={styles.media}>
            <img src={row.image} alt={row.alt} loading="lazy" decoding="async" style={{ objectPosition: row.imagePosition ?? "center" }} />
          </div>
          <div className={styles.text}>
            <h2 className={`t-h3 ${styles.title}`} style={{ color: row.color }}>
              {row.title}
            </h2>
            <p className={`t-body ${styles.body}`} dangerouslySetInnerHTML={{ __html: row.body }} />
          </div>
        </article>
      ))}
    </section>
  );
}
