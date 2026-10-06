import { tipsContent } from "@/data/tips";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import ProjectCard from "./ProjectCard";
import styles from "./TipsGrid.module.css";

type Props = { lang?: Locale };

/**
 * Rejilla de tips: una tarjeta destacada a todo el ancho y tres tarjetas en fila.
 */
export default function TipsGrid({ lang = "es" }: Props) {
  const { tips, gridLabel } = tipsContent[lang];
  const tagsLabel = ui[lang].a11y.tags;
  const featured = tips.find((t) => t.featured);
  const rest = tips.filter((t) => !t.featured);

  return (
    <section className={`container ${styles.grid}`} aria-label={gridLabel}>
      {featured && <ProjectCard tip={featured} tagsLabel={tagsLabel} />}
      <div className={styles.row}>
        {rest.map((t) => (
          <ProjectCard key={t.id} tip={t} tagsLabel={tagsLabel} />
        ))}
      </div>
    </section>
  );
}
