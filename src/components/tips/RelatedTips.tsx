import type { Tip } from "@/data/tips";
import Button from "@/components/ui/Button";
import ProjectCard from "./ProjectCard";
import styles from "./RelatedTips.module.css";

type Props = {
  title: string;
  tips: Tip[];
  allHref: string;
  allLabel: string;
  tagsLabel: string;
};

/** "Sigue leyendo": tres tarjetas de tips relacionados y enlace a la rejilla completa */
export default function RelatedTips({ title, tips, allHref, allLabel, tagsLabel }: Props) {
  if (tips.length === 0) return null;
  return (
    <section className={`container ${styles.section}`} aria-labelledby="related-title">
      <div className={styles.head}>
        <h2 id="related-title" className={`t-h3 ${styles.title}`}>
          {title}
        </h2>
        <Button href={allHref} variant="outline">
          {allLabel}
        </Button>
      </div>
      <div className={styles.row}>
        {tips.map((t) => (
          <ProjectCard key={t.id} tip={t} tagsLabel={tagsLabel} />
        ))}
      </div>
    </section>
  );
}
