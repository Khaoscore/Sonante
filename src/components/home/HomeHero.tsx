import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import { home } from "@/data/home";
import { pathFor, type Locale } from "@/i18n";
import styles from "./HomeHero.module.css";

type Props = {
  lang?: Locale;
  /** Carrusel interactivo (isla React) insertado desde la página Astro */
  children?: ReactNode;
};

/**
 * Hero del home (Wireframe 1): título, subtítulo, carrusel de piezas de
 * contenido y CTA "Escríbenos". El carrusel llega como hijo para poder
 * hidratarse de forma independiente (HeroCarousel con client:load).
 */
export default function HomeHero({ lang = "es", children }: Props) {
  const c = home[lang].hero;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.content}`}>
        <h1 id="hero-title" className={`t-hero ${styles.title}`}>
          {c.title}
        </h1>
        <p className={`t-medium ${styles.subtitle}`}>{c.subtitle}</p>
      </div>

      {children}

      <div className={styles.cta}>
        <Button href={pathFor("contact", lang)}>{c.cta}</Button>
      </div>
    </section>
  );
}
