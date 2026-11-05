import styles from "./LegalAside.module.css";

type Props = {
  title: string;
  toc: { slug: string; text: string }[];
};

/**
 * Columna lateral de los documentos legales: índice del documento, fijo al
 * hacer scroll en escritorio. En móvil se oculta y el contenido muestra su
 * propio índice desplegable arriba.
 */
export default function LegalAside({ title, toc }: Props) {
  if (toc.length < 2) return <aside className={styles.aside} />;

  return (
    <aside className={styles.aside}>
      <nav className={styles.sticky} aria-labelledby="legal-toc-title">
        <h2 id="legal-toc-title" className={`t-note ${styles.heading}`}>
          {title}
        </h2>
        <ol className={styles.toc}>
          {toc.map((h) => (
            <li key={h.slug}>
              <a href={`#${h.slug}`} className={styles.tocLink}>
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
