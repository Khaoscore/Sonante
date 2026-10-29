import styles from "./ArticleAside.module.css";

type Props = {
  tocTitle: string;
  toc: { slug: string; text: string }[];
  tagsTitle: string;
  tags: string[];
  shareTitle: string;
  share: { name: string; href: string; label: string }[];
};

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase("es") + s.slice(1);

/**
 * Columna lateral del artículo: índice de secciones (fijo al hacer scroll en
 * escritorio), etiquetas y enlaces para compartir. En móvil va al final del texto
 * y el índice se oculta.
 */
export default function ArticleAside({ tocTitle, toc, tagsTitle, tags, shareTitle, share }: Props) {
  return (
    <aside className={styles.aside}>
      <div className={styles.sticky}>
        {toc.length > 1 && (
          <nav className={styles.toc} aria-labelledby="toc-title">
            <h2 id="toc-title" className={`t-note ${styles.heading}`}>
              {tocTitle}
            </h2>
            <ol>
              {toc.map((h) => (
                <li key={h.slug}>
                  <a href={`#${h.slug}`} className={styles.tocLink}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {tags.length > 0 && (
          <div className={styles.block}>
            <h2 className={`t-note ${styles.heading}`}>{tagsTitle}</h2>
            <ul className={styles.tags}>
              {tags.map((t) => (
                <li key={t} className={`t-body-bold-sm ${styles.tag}`}>
                  {capitalize(t)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.block}>
          <h2 className={`t-note ${styles.heading}`}>{shareTitle}</h2>
          <ul className={styles.share}>
            {share.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`t-body-bold-sm ${styles.shareLink}`}
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
