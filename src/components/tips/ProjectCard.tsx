import type { Tip } from "@/data/tips";
import { ArrowUp } from "@/components/ui/Icons";
import ArticleCover from "./ArticleCover";
import styles from "./ProjectCard.module.css";

type Props = { tip: Tip; tagsLabel?: string };

/** Primera letra en mayúscula, como las píldoras del diseño ("Etiqueta") */
const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase("es") + s.slice(1);

/**
 * Componente "Project card" del diseño: imagen, botón circular verde con flecha,
 * título y etiquetas. Sin foto, los artículos usan su portada generada y el
 * resto de tarjetas el bloque amarillo del diseño.
 * La categoría, si existe, va como primera píldora con el color invertido.
 */
export default function ProjectCard({ tip, tagsLabel = "Etiquetas" }: Props) {
  const Title = tip.featured ? "h2" : "h3";
  return (
    <article className={`${styles.card} ${tip.featured ? styles.featured : ""}`}>
      <a href={tip.href} className={styles.link}>
        <div className={styles.media}>
          {tip.image ? (
            <img src={tip.image} alt="" loading="lazy" decoding="async" />
          ) : (
            tip.category && <ArticleCover slug={tip.id} category={tip.category} />
          )}
          <span className={styles.arrow} aria-hidden="true">
            <ArrowUp size={28} />
          </span>
        </div>
        <Title className={`${tip.featured ? "t-h3" : "t-medium"} ${styles.title}`}>{tip.title}</Title>
      </a>
      <ul className={styles.tags} aria-label={tagsLabel}>
        {tip.category && <li className={`t-body-bold-sm ${styles.tag} ${styles.category}`}>{tip.category}</li>}
        {tip.tags.map((t) => (
          <li key={t} className={`t-body-bold-sm ${styles.tag}`}>
            {capitalize(t)}
          </li>
        ))}
      </ul>
    </article>
  );
}
