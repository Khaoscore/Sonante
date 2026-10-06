import { useEffect, useRef } from "react";
import Marquee from "./Marquee";
import Intro from "./Intro";
import type { Locale } from "@/i18n";
import styles from "./IntroSequence.module.css";

type Props = { lang?: Locale };

/** Fracción del recorrido horizontal del título que se convierte en scroll vertical */
const SCROLL_RATIO = 0.9;

/**
 * Secuencia con GSAP + ScrollTrigger ligada al scroll (scrub) y fijada en pantalla:
 *  - al llegar la sección al centro de la ventana se fija (pin) centrada;
 *  - el título arranca en "Somos" y se desplaza hacia la izquierda con el scroll
 *    hasta que se ha visto la frase completa; entonces la sección se libera;
 *  - al empezar el scroll fijado, los párrafos caen desde arriba a la izquierda y
 *    rebotan, y después las gotas entran en diagonal como meteoros.
 * Con `prefers-reduced-motion` no hay fijación ni animación.
 */
export default function IntroSequence({ lang = "es" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.classList.remove(styles.pending);
      return;
    }

    let cancelled = false;
    let ctx: { revert(): void } | undefined;
    let refresh: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const title = root.querySelector<HTMLElement>("[data-anim='title']");
      const line = root.querySelector<HTMLElement>("[data-anim='title-line']");
      const texts = gsap.utils.toArray<HTMLElement>("[data-anim='text']", root);
      const bullets = gsap.utils.toArray<HTMLElement>("[data-anim='bullet']", root);
      if (!title || !line) return;

      /** Recorrido en px para que el final de la frase quede a un margen del borde derecho */
      const travel = () => {
        const gutter = parseFloat(getComputedStyle(title).paddingLeft) || 0;
        return Math.max(0, line.offsetWidth + gutter * 2 - title.clientWidth);
      };

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { overwrite: "auto" },
          scrollTrigger: {
            trigger: root,
            start: "center center",
            end: () => `+=${Math.round(travel() * SCROLL_RATIO)}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // Título: de "Somos" (x = 0) hasta el final de la frase, a ritmo del scroll
        tl.to(line, { x: () => -travel(), ease: "none", duration: 1 }, 0);

        // Párrafos: caen desde arriba a la izquierda y rebotan (primer tramo del scroll)
        texts.forEach((el, i) => {
          const at = 0.03 + i * 0.09;
          tl.fromTo(el, { x: -180, opacity: 0, rotation: -5 }, { x: 0, opacity: 1, rotation: 0, duration: 0.26, ease: "power2.out" }, at);
          tl.fromTo(el, { y: -200 }, { y: 0, duration: 0.26, ease: "bounce.out" }, at);
        });

        // Gotas: meteoro en diagonal (la cola del recurso apunta arriba-izquierda)
        bullets.forEach((el, i) => {
          const at = 0.28 + i * 0.08;
          tl.fromTo(el, { x: -280, y: -280, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.18, ease: "expo.out" }, at);
          tl.fromTo(el, { scale: 0.45 }, { scale: 1, duration: 0.22, ease: "back.out(2.2)" }, at);
        });

        root.classList.remove(styles.pending);
      }, root);

      // El ancho del título cambia cuando cargan las fuentes: recalcular el recorrido
      refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(() => {
        if (!cancelled) refresh?.();
      });
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={`${styles.sequence} ${styles.pending}`}>
      <Marquee lang={lang} />
      <Intro lang={lang} />
    </div>
  );
}
