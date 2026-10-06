import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import styles from "./BigStats.module.css";

type Props = { lang?: Locale };

/**
 * Franja amarilla con dos cifras (96 px) sobre el logotipo en contorno
 * (frame 45:2496).
 */
export default function BigStats({ lang = "es" }: Props) {
  const { bigStats, labels } = casosContent[lang];

  return (
    <section className={styles.band} aria-label={labels.results}>
      <ul className={`container ${styles.list}`}>
        {bigStats.map((s) => (
          <li key={s.label} className={styles.item}>
            <span className={`t-h1 ${styles.value}`}>{s.value}</span>
            <span className={`t-h4 ${styles.label}`}>{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
