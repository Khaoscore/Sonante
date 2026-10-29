import { ChevronLeft } from "@/components/ui/Icons";
import ArticleCover from "./ArticleCover";
import styles from "./ArticleHero.module.css";

type Props = {
  /** Slug del artículo: define la variación de la portada generada */
  slug: string;
  backHref: string;
  backLabel: string;
  category: string;
  title: string;
  subtitle?: string;
  /** "Por Sonante" */
  byline: string;
  readingTime?: string;
  date?: { iso: string; label: string };
  /** Foto de portada; sin ella se usa la portada generada */
  cover?: { src: string; alt: string; credit?: string };
  photoLabel: string;
  /** Aviso de borrador (solo en desarrollo) */
  draftNote?: string;
};

/**
 * Cabecera de artículo: franja magenta de "Nuestros tips" con la gota degradada,
 * categoría, título, bajada y datos de lectura. La portada (foto o generada) se
 * monta sobre el borde inferior de la franja.
 */
export default function ArticleHero({
  slug,
  backHref,
  backLabel,
  category,
  title,
  subtitle,
  byline,
  readingTime,
  date,
  cover,
  photoLabel,
  draftNote,
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.band}>
        <img src="/assets/img/gradient-11.png" alt="" className={styles.drop} width={727} height={764} aria-hidden="true" />
        <div className={`container ${styles.inner}`}>
          <a href={backHref} className={`t-body-bold ${styles.back}`}>
            <ChevronLeft size={14} />
            <span>{backLabel}</span>
          </a>

          {draftNote && (
            <p className={`t-body-bold-sm ${styles.draft}`} role="note">
              {draftNote}
            </p>
          )}

          <p className={`t-body-bold-sm ${styles.category}`}>{category}</p>
          <h1 className={`t-h2 ${styles.title}`}>{title}</h1>
          {subtitle && <p className={`t-medium ${styles.subtitle}`}>{subtitle}</p>}

          <p className={`t-body-bold ${styles.meta}`}>
            <span>{byline}</span>
            {readingTime && <span>{readingTime}</span>}
            {date && <time dateTime={date.iso}>{date.label}</time>}
          </p>
        </div>
      </div>

      <figure className={`container ${styles.cover}`}>
        {cover ? (
          <img src={cover.src} alt={cover.alt} decoding="async" fetchPriority="high" />
        ) : (
          <div className={styles.generated}>
            <ArticleCover slug={slug} category={category} />
          </div>
        )}
        {cover?.credit && (
          <figcaption className="t-note">
            {photoLabel}: {cover.credit}
          </figcaption>
        )}
      </figure>
    </header>
  );
}
