import { useEffect, useMemo, useRef, useState } from "react";
import InstagramPost from "@/components/shared/InstagramPost";
import OptionWheel from "@/components/ui/OptionWheel";
import { home } from "@/data/home";
import { pathFor, type Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import styles from "./CasosPreview.module.css";

type Props = { lang?: Locale };

/** Caso destacado al cargar (Sergio Fajardo, como en el Figma) */
const DEFAULT_CASE = 1;

/** Equivale al clamp(2.25rem, 1rem + 3vw, 3.75rem) del diseño, en rem */
const wheelFontSize = (viewportWidth: number) => Math.min(3.75, Math.max(2.25, 1 + (viewportWidth * 0.03) / 16));

/**
 * Avance de "Casos de éxito" en el home (Wireframe 1, frames 35:786-788 y
 * 35:794): ruleta de nombres (React Bits OptionWheel) con el caso activo en
 * amarillo y los demás en verde oscuro, girados sobre la curva. Al girarla, el
 * post de Instagram del caso entra rodando en la misma dirección.
 * Isla de React (`client:visible`); el HTML del servidor ya muestra a Fajardo.
 */
export default function CasosPreview({ lang = "es" }: Props) {
  const c = home[lang].casosPreview;
  const casesPath = pathFor("cases", lang);
  const names = useMemo(() => c.cases.map((caso) => caso.name), [c]);
  const [active, setActive] = useState(DEFAULT_CASE);
  // El scroll sobre la tarjeta también gira la ruleta
  const postsRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(3.75);
  // El arrastre solo con puntero fino: en táctil, el dedo desplaza la página
  // y la rueda se gira tocando los nombres.
  const [draggable, setDraggable] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setFontSize(wheelFontSize(window.innerWidth));
      setDraggable(fine.matches);
    };
    sync();
    window.addEventListener("resize", sync);
    fine.addEventListener("change", sync);
    return () => {
      window.removeEventListener("resize", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="casos-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <h2 id="casos-title" className={`t-h2 ${styles.title}`}>
            {c.title}
          </h2>
          <div className={styles.names}>
            <OptionWheel
              className={styles.wheel}
              items={names}
              defaultSelected={DEFAULT_CASE}
              onChange={(index) => setActive(index)}
              ariaLabel={c.wheelLabel}
              textColor="var(--casos-muted)"
              activeColor="var(--c-amarillo)"
              side="left"
              fontSize={fontSize}
              spacing={1.6}
              curve={3}
              tilt={20}
              scale={0.18}
              blur={0.6}
              fade={0.15}
              minOpacity={0.2}
              smoothing={200}
              inset="20%"
              draggable={draggable}
              releaseScroll
              wheelTarget={postsRef}
            />
          </div>
        </div>

        <div ref={postsRef} className={styles.posts}>
          {c.cases.map((caso, i) => {
            const offset = Math.sign(i - active);
            return (
              <a
                key={caso.id}
                href={`${casesPath}#${caso.id}`}
                className={styles.postLink}
                data-offset={offset}
                aria-label={`${c.viewCase} ${caso.name}`}
                inert={offset !== 0}
              >
                <InstagramPost
                  className={styles.post}
                  size="lg"
                  handle={caso.handle}
                  avatar={caso.avatar}
                  image={caso.image}
                  imageAlt={caso.imageAlt}
                  likedBy={caso.likedBy}
                  caption={caso.caption}
                  verifiedLabel={ui[lang].a11y.verified}
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
