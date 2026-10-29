import { useEffect, useRef } from "react";
import Marquee from "./Marquee";
import Intro from "./Intro";
import type { Locale } from "@/i18n";
import styles from "./IntroSequence.module.css";

type Props = { lang?: Locale };

/** Fracción del recorrido horizontal del título que se convierte en scroll vertical */
const SCROLL_RATIO = 0.9;

/**
 * Recorrido mínimo de la fijación, en alturas de ventana. En pantallas anchas
 * la frase casi cabe completa y su recorrido es muy corto: sin este mínimo la
 * animación de los párrafos pasaba en unos pocos píxeles de scroll.
 */
const MIN_PIN = 1;

/**
 * Secuencia con GSAP + ScrollTrigger ligada al scroll (scrub) y fijada en pantalla:
 *  - al llegar la sección al centro de la ventana se fija (pin) centrada;
 *  - el título arranca en "Somos" y se desplaza hacia la izquierda con el scroll
 *    hasta que se ha visto la frase completa; entonces la sección se libera;
 *  - al empezar el scroll fijado, las palabras de los párrafos aparecen con un
 *    desenfoque que se aclara, y después las gotas entran en diagonal como meteoros.
 * Con `prefers-reduced-motion` no hay fijación ni animación.
 */
/** Envuelve cada palabra del párrafo en un <span> (respetando los <em>) para animarlas por separado */
function splitWords(el: HTMLElement): HTMLElement[] {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    for (const part of (node.textContent ?? "").split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(part);
      } else {
        const span = document.createElement("span");
        span.textContent = part;
        span.style.display = "inline-block";
        span.dataset.word = "";
        frag.append(span);
      }
    }
    node.replaceWith(frag);
  }
  return Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
}

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
      let gsap: typeof import("gsap").gsap;
      let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
      try {
        [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      } catch {
        // Si GSAP no carga, mostrar los párrafos sin animación en vez de dejarlos ocultos
        root.classList.remove(styles.pending);
        return;
      }
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
            end: () => `+=${Math.round(Math.max(travel() * SCROLL_RATIO, window.innerHeight * MIN_PIN))}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // Título: de "Somos" (x = 0) hasta el final de la frase, a ritmo del scroll
        tl.to(line, { x: () => -travel(), ease: "none", duration: 1 }, 0);

        // Párrafos: las palabras aparecen de la nada, pasando de desenfocadas a nítidas
        texts.forEach((el, i) => {
          const words = splitWords(el);
          gsap.set(el, { opacity: 1 });
          tl.fromTo(
            words,
            { opacity: 0, filter: "blur(12px)" },
            { opacity: 1, filter: "blur(0px)", duration: 0.12, ease: "power1.out", stagger: 0.16 / words.length },
            0.03 + i * 0.14,
          );
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
