import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import InstagramPost from "@/components/shared/InstagramPost";
import { home } from "@/data/home";
import { pathFor, type Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import styles from "./CasosPreview.module.css";

type Props = { lang?: Locale };

/** Caso destacado al cargar (Sergio Fajardo, al centro) */
const DEFAULT_CASE = 1;

/** Distancia mínima (px) para que un arrastre cuente como deslizamiento */
const SWIPE_MIN = 40;

/**
 * "Casos de éxito" en el home: carrusel de tres posts de Instagram. El caso
 * activo va al centro con su usuario y descripción encima; los vecinos se ven
 * a los lados, atenuados, con flechas para avanzar. Es circular, responde a
 * las flechas del teclado y al deslizamiento táctil.
 * Isla de React (`client:visible`); el HTML del servidor ya muestra a Fajardo.
 */
export default function CasosPreview({ lang = "es" }: Props) {
  const c = home[lang].casosPreview;
  const casesPath = pathFor("cases", lang);
  const total = c.cases.length;
  const [active, setActive] = useState(DEFAULT_CASE);
  const dragStart = useRef<number | null>(null);

  const go = (step: number) => setActive((i) => (i + step + total) % total);

  /** Posición circular de cada post respecto al activo: -1, 0 o 1 */
  const offsetOf = (i: number) => {
    let d = i - active;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    dragStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) >= SWIPE_MIN) go(dx < 0 ? 1 : -1);
  };

  const current = c.cases[active];

  return (
    <section className={styles.section} aria-labelledby="casos-title">
      <div className="container">
        <h2 id="casos-title" className={`t-h2 ${styles.title}`}>
          {c.title}
        </h2>

        <div
          className={styles.carousel}
          role="region"
          aria-roledescription={lang === "en" ? "carousel" : "carrusel"}
          aria-label={c.title}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (dragStart.current = null)}
        >
          {/* Usuario y descripción del caso activo, sobre el post */}
          <div className={styles.headline} aria-live="polite">
            <p key={current.id} className={styles.headlineInner}>
              <span className={styles.handle}>@{current.handle}</span>
              <span className={styles.desc}>{current.caption}</span>
            </p>
          </div>

          <div className={styles.track}>
            {c.cases.map((caso, i) => {
              const offset = offsetOf(i);
              return (
                <a
                  key={caso.id}
                  href={`${casesPath}#${caso.id}`}
                  className={styles.postLink}
                  data-offset={offset}
                  aria-label={`${c.viewCase} ${caso.name}`}
                  aria-hidden={offset !== 0}
                  tabIndex={offset === 0 ? 0 : -1}
                  draggable={false}
                  onClick={(e) => {
                    // Un clic en un post lateral lo trae al centro
                    if (offset !== 0) {
                      e.preventDefault();
                      go(offset);
                    }
                  }}
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

            <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(-1)} aria-label={c.prevLabel}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(1)} aria-label={c.nextLabel}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className={styles.dots}>
            {c.cases.map((caso, i) => (
              <button
                key={caso.id}
                type="button"
                className={styles.dot}
                aria-label={caso.name}
                aria-current={i === active}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
