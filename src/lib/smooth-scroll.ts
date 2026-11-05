import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type LenisType from "lenis";

/**
 * Scroll suave con Lenis, sincronizado con GSAP: Lenis avanza en el ticker de
 * GSAP y avisa a ScrollTrigger en cada frame. Devuelve la función que lo apaga.
 * Requiere los estilos de "lenis/dist/lenis.css".
 */
export function startSmoothScroll(
  Lenis: typeof LenisType,
  gsap: typeof Gsap,
  ScrollTrigger: typeof ScrollTriggerType,
): () => void {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}
