import { tipsContent, type Tip } from "@/data/tips";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import ProjectCard from "./ProjectCard";
import styles from "./TipsGrid.module.css";

type Props = {
  /** Tarjetas ya ordenadas (las arma la página a partir de los artículos del blog) */
  tips: Tip[];
  lang?: Locale;
};

/**
 * Rejilla de tips: una tarjeta destacada a todo el ancho y el resto en filas de tres.
 */
export default function TipsGrid({ tips, lang = "es" }: Props) {
  const { gridLabel, gridNote } = tipsContent[lang];
  const tagsLabel = ui[lang].a11y.tags;
  const featured = tips.find((t) => t.featured);
  const rest = tips.filter((t) => !t.featured);

  return (
    <section className={`container ${styles.grid}`} aria-label={gridLabel}>
      {gridNote && <p className={`t-body-bold ${styles.note}`}>{gridNote}</p>}
      {featured && <ProjectCard tip={featured} tagsLabel={tagsLabel} />}
      {rest.length > 0 && (
        <div className={styles.row}>
          {rest.map((t) => (
            <ProjectCard key={t.id} tip={t} tagsLabel={tagsLabel} />
          ))}
        </div>
      )}
    </section>
  );
}
