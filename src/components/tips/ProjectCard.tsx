import type { Tip } from "@/data/tips";
import { ArrowUp } from "@/components/ui/Icons";
import styles from "./ProjectCard.module.css";

type Props = { tip: Tip; tagsLabel?: string };

/**
 * Componente "Project card" del diseño: bloque de imagen (amarillo si no hay
 * imagen), botón circular verde con flecha, título y etiquetas.
 */
export default function ProjectCard({ tip, tagsLabel = "Etiquetas" }: Props) {
  const Title = tip.featured ? "h2" : "h3";
  return (
    <article className={`${styles.card} ${tip.featured ? styles.featured : ""}`}>
      <a href={tip.href} className={styles.link}>
        <div className={styles.media}>
          {tip.image && <img src={tip.image} alt="" loading="lazy" decoding="async" />}
          <span className={styles.arrow} aria-hidden="true">
            <ArrowUp size={28} />
          </span>
        </div>
        <Title className={`${tip.featured ? "t-h3" : "t-medium"} ${styles.title}`}>{tip.title}</Title>
      </a>
      <ul className={styles.tags} aria-label={tagsLabel}>
        {tip.tags.map((t) => (
          <li key={t} className={`t-body-bold-sm ${styles.tag}`}>
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}
