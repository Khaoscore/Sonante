import { home } from "@/data/home";
import type { Locale } from "@/i18n";
import styles from "./Intro.module.css";

type Props = { lang?: Locale };

/**
 * Bloque introductorio del home: dos párrafos con viñetas degradadas y
 * resaltes en coral (Wireframe 1, frames 70:3305 y 134:1071/1072).
 */
export default function Intro({ lang = "es" }: Props) {
  const { ariaLabel, paragraphs } = home[lang].intro;

  return (
    <section className={`container ${styles.intro}`} aria-label={ariaLabel}>
      {paragraphs.map((html, i) => (
        <div key={i} className={styles.row}>
          <img src="/assets/img/gradient-03.png" alt="" width={68} height={71} className={styles.bullet} loading="eager" data-anim="bullet" />
          <p className={`t-h4 ${styles.text}`} data-anim="text" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ))}
    </section>
  );
}
