import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import styles from "./StatsBand.module.css";

type Props = { lang?: Locale };

/**
 * Franja magenta con tres cifras grandes (200 px) y el logotipo en contorno de
 * fondo (frame 45:2434).
 */
export default function StatsBand({ lang = "es" }: Props) {
  const { statsBand, labels } = casosContent[lang];

  return (
    <section className={styles.band} aria-label={labels.statsBand}>
      <ul className={`container ${styles.list}`}>
        {statsBand.map((s) => (
          <li key={s.label} className={styles.item}>
            <span className={styles.value}>{s.value}</span>
            <span className={`t-h4 ${styles.label}`}>{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
