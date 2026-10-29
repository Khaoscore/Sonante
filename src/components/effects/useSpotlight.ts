import { useEffect, type RefObject } from "react";

/**
 * Reflector que sigue al puntero: gira el haz (gradient-11.png) alrededor de su
 * extremo estrecho para que apunte al ratón, y lo alarga o acorta un poco según
 * la distancia, de modo que el círculo de luz se acerque al cursor.
 * Al salir el ratón de la ventana vuelve a su posición del diseño.
 *
 * Solo con ratón (hover + puntero fino) y sin `prefers-reduced-motion`;
 * en táctil el haz queda estático.
 */

/** Centro del extremo estrecho del haz (punto de giro), en fracción de la imagen */
const PIVOT = { x: 0.063, y: 0.075 };
/** Centro del círculo de luz, en fracción de la imagen */
const POOL = { x: 0.757, y: 0.768 };

const MIN_TURN = -50; // giro máximo hacia la derecha (grados)
const MAX_TURN = 100; // giro máximo hacia la izquierda (grados)
const MIN_SCALE = 0.82;
const MAX_SCALE = 1.08;
const EASE = 0.08; // suavizado por frame a 60 fps (0–1): bajo = más inercia
/** Distancia mínima bajo el pivote usada para el ángulo: evita que el haz salte de lado con el puntero por encima */
const FLOOR = 60;

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function useSpotlight(beamRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const beam = beamRef.current;
    const section = beam?.offsetParent as HTMLElement | null;
    if (!beam || !section || !window.matchMedia(QUERY).matches) return;

    beam.style.transformOrigin = `${PIVOT.x * 100}% ${PIVOT.y * 100}%`;
    beam.style.willChange = "transform";

    let pointer: { x: number; y: number } | null = null;
    let turn = 0;
    let scale = 1;
    let inView = true;
    let running = false;
    let raf = 0;
    let last = 0;

    /** Giro y escala objetivo según la posición del puntero respecto al pivote */
    const target = () => {
      if (!pointer) return { turn: 0, scale: 1 };
      const w = beam.offsetWidth;
      const h = beam.offsetHeight;
      const rect = section.getBoundingClientRect();
      const px = rect.left + beam.offsetLeft + w * PIVOT.x;
      const py = rect.top + beam.offsetTop + h * PIVOT.y;
      const axisX = (POOL.x - PIVOT.x) * w;
      const axisY = (POOL.y - PIVOT.y) * h;
      const base = Math.atan2(axisY, axisX);
      const dx = pointer.x - px;
      const dy = Math.max(pointer.y - py, FLOOR);
      const deg = ((Math.atan2(dy, dx) - base) * 180) / Math.PI;
      return {
        turn: clamp(deg, MIN_TURN, MAX_TURN),
        scale: clamp(Math.hypot(dx, dy) / Math.hypot(axisX, axisY), MIN_SCALE, MAX_SCALE),
      };
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16.7;
      last = now;
      const k = 1 - Math.pow(1 - EASE, dt / 16.7);
      const t = target();
      turn += (t.turn - turn) * k;
      scale += (t.scale - scale) * k;
      beam.style.transform = `rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      if (Math.abs(t.turn - turn) < 0.02 && Math.abs(t.scale - scale) < 0.0005) {
        running = false;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !inView) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      running = false;
      last = 0;
    };

    const onMove = (e: MouseEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      start();
    };
    const onLeave = () => {
      pointer = null;
      start();
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    observer.observe(section);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", start);
    window.addEventListener("blur", onLeave);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", start);
      window.removeEventListener("resize", start);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      beam.style.transform = "";
      beam.style.transformOrigin = "";
      beam.style.willChange = "";
    };
  }, [beamRef]);
}
