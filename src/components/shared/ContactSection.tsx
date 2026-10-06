import ContactForm from "./ContactForm";
import { home } from "@/data/home";
import type { Locale } from "@/i18n";
import styles from "./ContactSection.module.css";

type Props = {
  /** home: con título "¿Quieres que hablemos?"; page: variante de la página Contacto */
  variant?: "home" | "page";
  lang?: Locale;
  ariaLabel?: string;
};

/**
 * Sección de contacto con la gota degradada (Gradient-11) de fondo.
 * Se usa en el home y en la página /contacto con distinta posición del degradado.
 */
export default function ContactSection({ variant = "home", lang = "es", ariaLabel }: Props) {
  const title = home[lang].contact.title;

  return (
    <section
      id="contacto"
      className={`${styles.section} ${styles[variant]}`}
      aria-labelledby={variant === "home" ? "contacto-title" : undefined}
      aria-label={variant === "page" ? ariaLabel : undefined}
    >
      <img src="/assets/img/gradient-11.png" alt="" className={styles.drop} width={1016} height={1068} loading="lazy" aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        {variant === "home" && (
          <h2 id="contacto-title" className={`t-h2 ${styles.title}`}>
            {title}
          </h2>
        )}
        <ContactForm lang={lang} />
      </div>
    </section>
  );
}
