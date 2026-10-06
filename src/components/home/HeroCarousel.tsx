import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./HeroCarousel.module.css";

/**
 * Carrusel del hero: las piezas recorren la fila de forma continua y su forma
 * depende de la posición en pantalla, como en el diseño:
 *  - en los bordes: grandes y giradas en perspectiva hacia el centro;
 *  - en el centro: planas y más pequeñas.
 * La separación visible entre piezas vecinas es siempre la misma (GAP): cada
 * pieza se coloca resolviendo su posición para que su borde proyectado quede
 * exactamente a un hueco del borde de la anterior.
 * Gira solo, despacio, y se puede arrastrar (ratón o táctil) con inercia al soltar.
 */

const PHOTOS = Array.from({ length: 13 }, (_, i) => `/assets/img/hero/hero-${String(i + 1).padStart(2, "0")}.png`);
const COPIES = 2; // copias de la lista para que el bucle cubra pantallas anchas

const AUTO_SPEED = 22; // px/s de rotación automática (hacia la izquierda)
const MAX_ROTATION = 28; // grados de giro en los bordes
const MIN_SCALE = 0.74; // tamaño relativo en el centro (203×305 frente a 238×416)
const GAP_RATIO = 25 / 238; // separación visible entre piezas respecto al ancho de la pieza
const FRICTION = 3.2; // frenado de la inercia tras soltar (mayor = frena antes)

const PERSPECTIVE = 1200; // perspectiva CSS de la pista (px); se usa también para proyectar los bordes
const CARD_W_DESIGN = 238; // ancho de pieza en el diseño (1440)
const SSR_WIDTH = 1440; // ancho supuesto para el primer render (se corrige al hidratar)

type Placement = { visible: false } | { visible: true; transform: string; zIndex: number };
const HIDDEN: Placement = { visible: false };

type Layout = {
  step: number;
  /** Posiciones de todas las piezas para un desplazamiento virtual dado */
  placeAll(offset: number): Placement[];
  /** Relación entre avance virtual y avance en pantalla a distancia d del centro */
  kAt(d: number): number;
};

/**
 * Geometría del carrusel para un ancho de pista y de pieza dados.
 * Las piezas viven en un eje "virtual" de paso constante (ancho + hueco). La
 * pieza "ancla" (la que está entrando en el centro) se mueve de forma continua
 * y el resto se encadena a ella con huecos exactos, medidos sobre los bordes
 * proyectados con la misma perspectiva que aplica el CSS.
 */
function buildLayout(width: number, cardW: number, count: number): Layout {
  const gap = cardW * GAP_RATIO;
  const step = cardW + gap;
  const loop = step * count;
  const half = width / 2;
  const limit = half + cardW;

  const t = (d: number) => Math.min(Math.abs(d) / half, 1); // 0 centro → 1 borde
  const scaleAt = (d: number) => MIN_SCALE + (1 - MIN_SCALE) * t(d);
  const rotationAt = (d: number) => -Math.sign(d) * MAX_ROTATION * t(d); // grados, con signo (como en CSS)

  /** Borde izquierdo (−1) o derecho (+1) en pantalla de una pieza centrada en d */
  const edge = (d: number, side: -1 | 1) => {
    const x = (side * cardW * scaleAt(d)) / 2;
    const th = (rotationAt(d) * Math.PI) / 180;
    const X = d + x * Math.cos(th);
    const Z = -x * Math.sin(th);
    return (X * PERSPECTIVE) / (PERSPECTIVE - Z);
  };
  const leftEdge = (d: number) => edge(d, -1);
  const rightEdge = (d: number) => edge(d, 1);

  /** Resuelve fn(x) = target partiendo de guess (fn crece ≈ 1:1 con x) */
  const solve = (target: number, guess: number, fn: (x: number) => number) => {
    let x = guess;
    for (let k = 0; k < 10; k++) {
      const err = fn(x) - target;
      if (Math.abs(err) < 0.02) break;
      x -= err * 0.9;
    }
    return x;
  };
  const nextRight = (d: number) => solve(rightEdge(d) + gap, d + cardW * scaleAt(d) + gap, leftEdge);
  const nextLeft = (d: number) => solve(leftEdge(d) - gap, d - cardW * scaleAt(d) - gap, rightEdge);

  /** Distancia a la que queda la vecina derecha de una pieza centrada */
  const d1 = nextRight(0);

  const kAt = (d: number) => (rightEdge(d) - leftEdge(d) + gap) / step;

  const placement = (d: number): Placement => ({
    visible: true,
    transform: `translate3d(${(half + d - cardW / 2).toFixed(2)}px, -50%, 0) rotateY(${rotationAt(d).toFixed(2)}deg) scale(${scaleAt(d).toFixed(3)})`,
    zIndex: Math.round((1 - t(d)) * 10),
  });

  const placeAll = (offset: number): Placement[] => {
    const out: Placement[] = new Array<Placement>(count).fill(HIDDEN);
    // v de la pieza 0 en [0, loop); la ancla es la pieza con v en [0, step)
    const v0 = ((-offset % loop) + loop) % loop;
    const q = Math.floor(v0 / step);
    const f = (v0 - q * step) / step; // fase 0 → 1
    const anchor = (count - q) % count;

    let d = f * d1;
    out[anchor] = placement(d);
    let dr = d;
    for (let k = 1; k < count; k++) {
      dr = nextRight(dr);
      if (dr >= limit) break;
      out[(anchor + k) % count] = placement(dr);
    }
    let dl = d;
    for (let k = 1; k < count; k++) {
      dl = nextLeft(dl);
      if (dl <= -limit) break;
      out[(((anchor - k) % count) + count) % count] = placement(dl);
    }
    return out;
  };

  return { step, placeAll, kAt };
}

export default function HeroCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = Array.from({ length: COPIES }, () => PHOTOS).flat();
  const ssrPlacements = buildLayout(SSR_WIDTH, CARD_W_DESIGN, items.length).placeAll(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const n = cards.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let layout = buildLayout(track.clientWidth, cards[0].offsetWidth, n);
    let half = track.clientWidth / 2;
    const measure = () => {
      layout = buildLayout(track.clientWidth, cards[0].offsetWidth, n);
      half = track.clientWidth / 2;
    };

    let offset = 0; // desplazamiento acumulado en el eje virtual (px)
    let velocity = 0; // px/s virtuales (inercia tras arrastrar)
    let dragging = false;
    let pointerId: number | null = null;
    let lastX = 0;
    let lastT = 0;
    let moved = 0;

    const render = () => {
      const placements = layout.placeAll(offset);
      for (let i = 0; i < n; i++) {
        const el = cards[i];
        const p = placements[i];
        if (!p.visible) {
          el.style.visibility = "hidden";
          continue;
        }
        el.style.visibility = "visible";
        el.style.transform = p.transform;
        el.style.zIndex = String(p.zIndex);
      }
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) {
        if (Math.abs(velocity) > 4) {
          offset += velocity * dt;
          velocity *= Math.exp(-FRICTION * dt);
        } else {
          velocity = 0;
          if (!reduced) offset += AUTO_SPEED * dt;
        }
      }
      render();
      raf = requestAnimationFrame(frame);
    };

    /** Convierte un desplazamiento del puntero en pantalla a unidades virtuales (≈1:1 bajo el puntero) */
    const toVirtual = (dx: number, clientX: number) => {
      const rect = track.getBoundingClientRect();
      const k = layout.kAt(clientX - rect.left - half);
      return dx / Math.max(k, 0.5);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      velocity = 0;
      moved = 0;
      lastX = e.clientX;
      lastT = performance.now();
      track.setPointerCapture(e.pointerId);
      track.classList.add(styles.grabbing);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max((now - lastT) / 1000, 1 / 240);
      const dv = toVirtual(dx, e.clientX);
      offset -= dv; // arrastrar a la derecha mueve las piezas a la derecha
      moved += Math.abs(dx);
      velocity = velocity * 0.6 + (-dv / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      track.classList.remove(styles.grabbing);
      if (performance.now() - lastT > 80) velocity = 0; // se soltó quieto: sin inercia
      velocity = Math.max(-2400, Math.min(2400, velocity));
    };

    const onClickCapture = (e: MouseEvent) => {
      // Evita que un arrastre termine en un clic accidental
      if (moved > 6) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onResize = () => {
      measure();
      render();
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    track.addEventListener("click", onClickCapture, true);
    window.addEventListener("resize", onResize);

    render();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      track.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={styles.carousel} aria-hidden="true" data-cursor="drag">
      <div ref={trackRef} className={styles.track} style={{ perspective: `${PERSPECTIVE}px` }}>
        {items.map((src, i) => {
          const p = ssrPlacements[i];
          const style: CSSProperties = p.visible ? { visibility: "visible", transform: p.transform, zIndex: p.zIndex } : { visibility: "hidden" };
          return (
            <div key={i} className={styles.card} style={style}>
              <img src={src} alt="" draggable={false} loading={i < 8 ? "eager" : "lazy"} decoding="async" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
