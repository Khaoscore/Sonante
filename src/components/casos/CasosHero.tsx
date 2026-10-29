import { useEffect, useRef } from "react";
import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import styles from "./CasosHero.module.css";

type Props = { lang?: Locale };

/** Vueltas completas que da la "S" mientras se recorre el hero */
const TURNS = 1.2;
/** Suavizado del giro respecto al scroll (segundos que tarda en alcanzarlo) */
const SCRUB = 0.8;

/**
 * Hero de "Casos de éxito": fondo amarillo con el recurso "S" degradado
 * (naranja → magenta) rotado −23° (frame 45:2065).
 *
 * Al hacer scroll el hero queda fijo en pantalla (sticky, ver `.spacer` en el
 * CSS) mientras la "S" da `TURNS` vueltas; después sale con el resto de la
 * página. El giro va ligado al scroll con GSAP ScrollTrigger y termina en la
 * misma posición del diseño. Con `prefers-reduced-motion` ni se fija ni gira.
 * Isla de React (`client:load`).
 */
export default function CasosHero({ lang = "es" }: Props) {
  const { hero } = casosContent[lang];
  const trackRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const s = spinRef.current;
    if (!track || !s || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let ctx: { revert(): void } | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Desde que el hero toca el borde superior hasta que ha salido del todo
        gsap.fromTo(
          s,
          { "--spin": 0 },
          {
            "--spin": TURNS * 360,
            ease: "none",
            scrollTrigger: { trigger: track, start: "top top", end: "bottom top", scrub: SCRUB },
          },
        );
      }, track);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={trackRef} className={styles.track}>
      <section className={styles.hero}>
        <img ref={spinRef} src="/assets/img/hero-s-gradient-01.png" alt="" className={styles.s} width={1550} height={2048} aria-hidden="true" />
        <div className={`container ${styles.inner}`}>
          <h1 className={`t-h1 ${styles.title}`}>{hero.title}</h1>
          <p className={`t-medium ${styles.text}`}>{hero.text}</p>
        </div>
      </section>
      <div className={styles.spacer} aria-hidden="true" />
    </div>
  );
}
