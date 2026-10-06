import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import styles from "./CasosHero.module.css";

type Props = { lang?: Locale };

/**
 * Hero de "Casos de éxito": fondo amarillo con el recurso "S" degradado
 * (naranja → magenta) rotado −23° (frame 45:2065).
 */
export default function CasosHero({ lang = "es" }: Props) {
  const { hero } = casosContent[lang];

  return (
    <section className={styles.hero}>
      <img src="/assets/img/hero-s-gradient-01.png" alt="" className={styles.s} width={1550} height={2048} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <h1 className={`t-h1 ${styles.title}`}>{hero.title}</h1>
        <p className={`t-medium ${styles.text}`}>{hero.text}</p>
      </div>
    </section>
  );
}
