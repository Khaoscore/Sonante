import type { ReactNode } from "react";
import styles from "./PageHero.module.css";

type Props = {
  /** Color de fondo del hero: naranja (Quiénes somos) o magenta (Nuestros tips) */
  color: "naranja" | "magenta";
  /** Título principal (H1). Si se usa `kicker`, se muestra la palabra + el logotipo como H1. */
  title?: string;
  /** Variante "Somos SONANTE": palabra introductoria + logotipo como H1 */
  kicker?: string;
  text: ReactNode;
};

/**
 * Hero de página interior con la gota degradada (Gradient-11) a la derecha.
 * Corresponde a los frames 45:1680 (Quiénes somos) y 45:1853 (Nuestros tips).
 */
export default function PageHero({ color, title, kicker, text }: Props) {
  return (
    <section className={`${styles.hero} ${styles[color]}`}>
      <img src="/assets/img/gradient-11.png" alt="" className={styles.drop} width={727} height={764} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        {kicker ? (
          <h1 className={styles.logoTitle}>
            <span className="t-h1">{kicker}</span>
            <img src="/assets/icons/logo-sonante.svg" alt="Sonante" className={styles.wordmark} width={997} height={163} />
          </h1>
        ) : (
          <h1 className={`t-h1 ${styles.title}`}>{title}</h1>
        )}
        <p className={`t-medium ${styles.text}`}>{text}</p>
      </div>
    </section>
  );
}
