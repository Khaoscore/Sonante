import { home } from "@/data/home";
import type { Locale } from "@/i18n";
import styles from "./Marquee.module.css";

type Props = { lang?: Locale };

/**
 * Cinta de título bajo el hero. No se mueve sola: su desplazamiento horizontal
 * lo controla IntroSequence con GSAP ligado al scroll (empieza en "Somos" y
 * avanza hasta que se ha visto la frase completa).
 */
export default function Marquee({ lang = "es" }: Props) {
  const { ariaLabel, phrases } = home[lang].marquee;

  return (
    <section className={styles.marquee} aria-label={ariaLabel} data-anim="title">
      <p className={`t-h1 ${styles.line}`} data-anim="title-line">
        {phrases.map((p, i) => (
          <span key={i} className={styles.item}>
            {p}
            {i < phrases.length - 1 && (
              <span className={styles.sep} aria-hidden="true">
                •
              </span>
            )}
          </span>
        ))}
      </p>
    </section>
  );
}
