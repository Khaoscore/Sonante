import { useEffect, useRef, type CSSProperties, type SVGProps } from "react";
import { home } from "@/data/home";
import { heroItems, platformName, type Platform } from "@/data/heroReels";
import type { Locale } from "@/i18n";
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
 *
 * Las piezas son reels y TikToks de clientes (src/data/heroReels.ts), como en
 * la galería de Elexa: se reproducen en bucle y sin sonido mientras están en
 * pantalla; el botón redondo les da sonido (carga el video completo, vuelve al
 * principio y calla a los demás); al pasar el mouse el video se difumina bajo
 * un velo verde y toda la pieza enlaza a la publicación. Arriba a la izquierda,
 * las visualizaciones y los me gusta. El giro se detiene mientras el mouse está sobre una
 * pieza, mientras hay foco del teclado dentro o mientras un video suena.
 */

/** Piezas mínimas en la pista: si hay pocas, la lista se repite para cubrir pantallas anchas */
const MIN_ITEMS = 16;
const COPIES = Math.max(1, Math.ceil(MIN_ITEMS / heroItems.length));
const ITEMS = Array.from({ length: COPIES }, () => heroItems).flat();

const AUTO_SPEED = 22; // px/s de rotación automática (hacia la izquierda)
const HOLD_EASE = 5; // rapidez con la que el giro se detiene / se reanuda (mayor = más brusco)
const DRAG_THRESHOLD = 6; // px que hay que mover el puntero para que un clic pase a ser arrastre
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

const PLATFORM_ICON: Record<Platform, string> = {
  instagram: "/assets/icons/icon-instagram-white.svg",
  tiktok: "/assets/icons/icon-tiktok-white.svg",
};

const svgBase = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: false } as const;

/** Triángulo de "reproducciones", como el contador de Instagram y TikTok */
const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...svgBase} {...props}>
    <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" fill="currentColor" />
  </svg>
);

/** Corazón de "me gusta" */
const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...svgBase} {...props}>
    <path
      d="M12 21.2 10.6 20C5.4 15.3 2 12.2 2 8.4 2 5.3 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.3 22 8.4c0 3.8-3.4 6.9-8.6 11.6L12 21.2Z"
      fill="currentColor"
    />
  </svg>
);

const MutedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...svgBase} {...props}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="m23 9-6 6M17 9l6 6" />
  </svg>
);

const SoundIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...svgBase} {...props}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

/** Video de una pieza y su botón de sonido (null en las piezas de imagen) */
type Slot = { video: HTMLVideoElement; button: HTMLButtonElement; full: string; visible: boolean };

type Props = { lang?: Locale };

export default function HeroCarousel({ lang = "es" }: Props) {
  const t = home[lang].hero.reels;
  const trackRef = useRef<HTMLDivElement>(null);
  const ssrPlacements = buildLayout(SSR_WIDTH, CARD_W_DESIGN, ITEMS.length).placeAll(0);
  const locale = lang === "es" ? "es-CO" : "en-US";
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const exact = new Intl.NumberFormat(locale);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const n = cards.length;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    let reduced = reducedQuery.matches;

    let layout = buildLayout(track.clientWidth, cards[0].offsetWidth, n);
    let half = track.clientWidth / 2;
    const measure = () => {
      layout = buildLayout(track.clientWidth, cards[0].offsetWidth, n);
      half = track.clientWidth / 2;
    };

    /* ---------- Videos ---------- */

    const slots: (Slot | null)[] = cards.map((card, i) => {
      const item = ITEMS[i];
      const video = card.querySelector("video");
      const button = card.querySelector("button");
      if (item.kind !== "reel" || !video || !button) return null;
      video.muted = true; // React no escribe el atributo `muted` en el HTML del servidor
      return { video, button, full: item.full, visible: false };
    });

    let inView = true; // el carrusel está en la ventana
    let soundIdx = -1; // pieza con sonido (una a la vez)
    // Los bucles esperan a que la página termine de cargar para no quitarle
    // ancho de banda a las fuentes y al resto del primer pantallazo (los pósters
    // ya se ven mientras tanto)
    let loaded = document.readyState === "complete";

    /** Con menos movimiento o ahorro de datos no hay bucles: sólo suena lo que se activa a mano */
    const sync = (i: number) => {
      const s = slots[i];
      if (!s) return;
      const loops = loaded && !(reduced || saveData);
      const play = s.visible && inView && !document.hidden && (i === soundIdx || loops);
      if (play) {
        if (s.video.paused) s.video.play().catch(() => {});
      } else if (!s.video.paused) {
        s.video.pause();
      }
    };
    const syncAll = () => slots.forEach((_, i) => sync(i));

    const setSound = (i: number, on: boolean) => {
      const s = slots[i];
      if (!s) return;
      s.button.setAttribute("aria-pressed", String(on));
      cards[i].classList.toggle(styles.hasSound, on);
      if (!on) {
        if (soundIdx === i) soundIdx = -1;
        s.video.muted = true;
        sync(i);
        return;
      }
      if (soundIdx >= 0 && soundIdx !== i) setSound(soundIdx, false);
      soundIdx = i;
      const v = s.video;
      // El bucle es un recorte mudo: para escucharlo se cambia al video completo
      if (!v.currentSrc.endsWith(s.full)) v.src = s.full;
      v.currentTime = 0;
      v.muted = false;
      v.play().catch(() => setSound(i, false));
    };

    // Pausas del giro además del sonido: mouse sobre una pieza o foco del teclado dentro
    let hovering = false;
    let skipHover: Element | null = null; // pieza recién silenciada: no detiene el giro aunque el mouse siga encima
    let focused = false;

    const soundHandlers = slots.map((s, i) => {
      if (!s) return null;
      const onClick = () => {
        const on = soundIdx !== i;
        setSound(i, on);
        // Al quitar el sonido el carrusel sigue girando de inmediato: el mouse
        // sobre esta misma pieza deja de detenerlo hasta que pase a otra
        if (!on) {
          skipHover = cards[i];
          hovering = false;
        }
      };
      s.button.addEventListener("click", onClick);
      return onClick;
    });

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAll();
    });
    io.observe(track);

    const onVisibility = () => syncAll();
    const onReducedChange = () => {
      reduced = reducedQuery.matches;
      syncAll();
    };
    const onLoad = () => {
      loaded = true;
      syncAll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    reducedQuery.addEventListener("change", onReducedChange);
    if (!loaded) window.addEventListener("load", onLoad, { once: true });

    /* ---------- Movimiento ---------- */

    let offset = 0; // desplazamiento acumulado en el eje virtual (px)
    let velocity = 0; // px/s virtuales (inercia tras arrastrar)
    let auto = 1; // factor de la rotación automática (0 detenida → 1 a velocidad normal)
    let pressed = false; // puntero presionado (aún puede ser un clic)
    let dragging = false; // superó el umbral: es un arrastre
    let dragged = false; // el último gesto fue un arrastre (anula el clic)
    let pointerId: number | null = null;
    let startX = 0;
    let lastX = 0;
    let lastT = 0;

    const render = () => {
      const placements = layout.placeAll(offset);
      for (let i = 0; i < n; i++) {
        const el = cards[i];
        const p = placements[i];
        const s = slots[i];
        if (s && s.visible !== p.visible) {
          s.visible = p.visible;
          if (!p.visible && i === soundIdx) setSound(i, false);
          else sync(i);
        }
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
      const hold = hovering || focused || soundIdx >= 0;
      auto += ((hold ? 0 : 1) - auto) * (1 - Math.exp(-HOLD_EASE * dt));
      if (!dragging) {
        if (Math.abs(velocity) > 4) {
          offset += velocity * dt;
          velocity *= Math.exp(-FRICTION * dt);
        } else {
          velocity = 0;
          if (!reduced) offset += AUTO_SPEED * auto * dt;
        }
      }
      if (inView) render();
      raf = requestAnimationFrame(frame);
    };

    /** Convierte un desplazamiento del puntero en pantalla a unidades virtuales (≈1:1 bajo el puntero) */
    const toVirtual = (dx: number, clientX: number) => {
      const rect = track.getBoundingClientRect();
      const k = layout.kAt(clientX - rect.left - half);
      return dx / Math.max(k, 0.5);
    };

    // La captura del puntero espera a que el gesto sea un arrastre: si se
    // tomara al presionar, el clic dejaría de llegar a los enlaces y botones.
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pressed = true;
      dragged = false;
      pointerId = e.pointerId;
      velocity = 0;
      startX = lastX = e.clientX;
      lastT = performance.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        const card = (e.target as Element).closest(`.${styles.card}`);
        if (card !== skipHover) skipHover = null;
        hovering = !!card && card !== skipHover;
      }
      if (!pressed || e.pointerId !== pointerId) return;
      const now = performance.now();
      if (!dragging) {
        if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD) return;
        dragging = dragged = true;
        track.setPointerCapture(e.pointerId);
        track.classList.add(styles.grabbing);
      }
      const dx = e.clientX - lastX;
      const dt = Math.max((now - lastT) / 1000, 1 / 240);
      const dv = toVirtual(dx, e.clientX);
      offset -= dv; // arrastrar a la derecha mueve las piezas a la derecha
      velocity = velocity * 0.6 + (-dv / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pressed || e.pointerId !== pointerId) return;
      pressed = false;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      track.classList.remove(styles.grabbing);
      setTimeout(() => (dragged = false), 0); // por si el clic no llega (se soltó fuera)
      if (performance.now() - lastT > 80) velocity = 0; // se soltó quieto: sin inercia
      velocity = Math.max(-2400, Math.min(2400, velocity));
    };

    const onPointerLeave = () => {
      hovering = false;
      skipHover = null;
    };

    const onClickCapture = (e: MouseEvent) => {
      // Un arrastre no debe terminar abriendo el video ni activando el sonido
      if (dragged) {
        e.stopPropagation();
        e.preventDefault();
        dragged = false;
      }
    };

    const onDragStart = (e: DragEvent) => e.preventDefault();

    // Sólo el foco del teclado detiene el giro: un clic también enfoca el botón
    // de sonido, y ese foco no debe dejar el carrusel quieto al quitar el audio
    const onFocusIn = (e: FocusEvent) => {
      try {
        focused = (e.target as Element).matches(":focus-visible");
      } catch {
        focused = true; // navegador sin :focus-visible
      }
    };
    const onFocusOut = () => {
      focused = false;
    };

    const onResize = () => {
      measure();
      render();
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    track.addEventListener("pointerleave", onPointerLeave);
    track.addEventListener("click", onClickCapture, true);
    track.addEventListener("dragstart", onDragStart);
    track.addEventListener("focusin", onFocusIn);
    track.addEventListener("focusout", onFocusOut);
    window.addEventListener("resize", onResize);

    render();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedQuery.removeEventListener("change", onReducedChange);
      window.removeEventListener("load", onLoad);
      slots.forEach((s, i) => {
        const h = soundHandlers[i];
        if (s && h) s.button.removeEventListener("click", h);
        s?.video.pause();
      });
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      track.removeEventListener("pointerleave", onPointerLeave);
      track.removeEventListener("click", onClickCapture, true);
      track.removeEventListener("dragstart", onDragStart);
      track.removeEventListener("focusin", onFocusIn);
      track.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={styles.carousel} role="region" aria-label={t.label} data-cursor="drag">
      <div ref={trackRef} className={styles.track} style={{ perspective: `${PERSPECTIVE}px` }}>
        {ITEMS.map((item, i) => {
          const p = ssrPlacements[i];
          const style: CSSProperties = p.visible ? { visibility: "visible", transform: p.transform, zIndex: p.zIndex } : { visibility: "hidden" };

          if (item.kind === "image") {
            return (
              <div key={i} className={styles.card} style={style} aria-hidden="true">
                <img src={item.src} alt="" draggable={false} loading={i < 8 ? "eager" : "lazy"} decoding="async" />
              </div>
            );
          }

          // Las repeticiones de la lista quedan fuera del lector de pantalla y del tabulador
          const copy = i >= heroItems.length;
          const where = platformName[item.platform];
          const label = [
            `${t.watchOn} ${where}`,
            item.author,
            item.views != null ? `${exact.format(item.views)} ${t.views}` : null,
            item.likes != null ? `${exact.format(item.likes)} ${t.likes}` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <div key={i} className={styles.card} style={style} aria-hidden={copy || undefined}>
              <a
                className={styles.link}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                tabIndex={copy ? -1 : undefined}
                aria-label={label}
              >
                <video
                  className={styles.video}
                  src={item.loop}
                  poster={item.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  disablePictureInPicture
                  aria-hidden="true"
                />
                <span className={styles.veil} aria-hidden="true">
                  <img src={PLATFORM_ICON[item.platform]} alt="" draggable={false} />
                  {t.watchOn} {where}
                </span>
              </a>
              {(item.views != null || item.likes != null) && (
                <span className={styles.stats} aria-hidden="true">
                  {item.views != null && (
                    <span className={styles.stat}>
                      <PlayIcon className={styles.iconViews} />
                      {compact.format(item.views)}
                    </span>
                  )}
                  {item.likes != null && (
                    <span className={styles.stat}>
                      <HeartIcon className={styles.iconLikes} />
                      {compact.format(item.likes)}
                    </span>
                  )}
                </span>
              )}
              <button
                className={styles.sound}
                type="button"
                aria-pressed="false"
                aria-label={item.author ? `${t.sound} · ${item.author}` : t.sound}
                tabIndex={copy ? -1 : undefined}
              >
                <MutedIcon className={styles.iconMuted} />
                <SoundIcon className={styles.iconSound} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
