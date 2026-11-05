import styles from "./LegalHero.module.css";

type Props = {
  kicker: string;
  title: string;
  text: string;
  /** Versión y fecha de vigencia (o aviso de borrador) */
  meta: string;
  /** Pestañas para pasar de un documento legal a otro */
  docsLabel: string;
  docs: { href: string; label: string; current: boolean }[];
};

/**
 * Cabecera de los documentos legales: más baja que los heroes de sección,
 * en verde oscuro, con la gota verde de la marca a la derecha y pestañas
 * hacia los demás documentos.
 */
export default function LegalHero({ kicker, title, text, meta, docsLabel, docs }: Props) {
  return (
    <section className={styles.hero}>
      <img src="/assets/img/gota-verde-grande.svg" alt="" className={styles.drop} width={1060} height={1060} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <p className={`t-note ${styles.kicker}`}>{kicker}</p>
        <h1 className={`t-h2 ${styles.title}`}>{title}</h1>
        <p className={styles.text}>{text}</p>
        <p className={`t-body-bold-sm ${styles.meta}`}>{meta}</p>

        {docs.length > 1 && (
          <nav aria-label={docsLabel}>
            <ul className={styles.docs}>
              {docs.map((d) => (
                <li key={d.href}>
                  <a href={d.href} className={styles.doc} aria-current={d.current ? "page" : undefined}>
                    {d.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
