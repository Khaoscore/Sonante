import { useCallback, useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import "./ScrollExpand.css";

/**
 * ScrollExpand (React Bits, variante JS + CSS) — un marco con la foto que se
 * abre con el scroll hasta ocupar toda la pantalla; el título se aleja y el
 * contenido (children) aparece encima de la foto abierta.
 * Adaptado a TypeScript. Cambios respecto al original:
 * - `mediaPosition`: encuadre de la foto (object-position).
 * - `restShiftY`: desplaza la foto en vertical (en % del escenario) mientras el
 *   marco está cerrado, para centrar una cara que queda arriba o abajo.
 * - `restFocusX`: punto de la foto (0 = borde izquierdo, 1 = derecho) que se
 *   centra en el marco cerrado; se suelta a medida que el marco se abre.
 * - `titleClassName` / `overlayClassName` para estilos del proyecto.
 * - `titleAriaHidden`: oculta el título a lectores de pantalla cuando el
 *   contenido ya lo repite.
 * - Si el contenido mide más que la pantalla, con la foto ya abierta y fija el
 *   contenido sube al ritmo del scroll hasta verse entero; la pista se alarga
 *   en esa misma medida.
 * - El alto de la pista y del escenario tiene un valor por CSS antes de
 *   hidratar, para que el HTML del servidor no salte al cargar.
 * Origen: https://reactbits.dev
 */

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

type Props = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  src?: string;
  mediaType?: "image" | "video";
  poster?: string;
  alt?: string;
  title?: ReactNode;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  mediaPosition?: string;
  restShiftY?: number;
  restFocusX?: number;
  titleClassName?: string;
  titleAriaHidden?: boolean;
  overlayClassName?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function ScrollExpand({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  mediaPosition = "center",
  restShiftY = 0,
  restFocusX,
  titleClassName = "",
  titleAriaHidden = false,
  overlayClassName = "",
  children,
  className = "",
  style,
  ...rest
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement & HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  /** Para `restFocusX`: ancho del escenario y bordes de la foto respecto al centro, en px */
  const focusRef = useRef({ dx: 0, stageW: 0, left: 0, right: 0 });

  const propsRef = useRef({
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    restShiftY,
  });
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    restShiftY,
  };

  const restFocusRef = useRef(restFocusX);
  restFocusRef.current = restFocusX;

  /** p: avance de la apertura (0 → 1). shift: px que sube el contenido que no cabe. */
  const applyProgress = useCallback((p: number, shift = 0) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;

    const e = smoothstep(0, 1, p);

    const w = c.startWidth + (100 - c.startWidth) * e;
    const h = c.startHeight + (100 - c.startHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    const s = c.mediaZoom + (1 - c.mediaZoom) * e;
    // Lleva el punto elegido al centro sin dejar ver un borde de la foto dentro del marco
    const f = focusRef.current;
    let tx = -f.dx * s * (1 - e);
    if (tx) {
      const half = (f.stageW * w) / 200;
      tx = clamp(tx, half - s * f.right, -half - s * f.left);
    }
    media.style.transform = `translate3d(${tx}px, ${c.restShiftY * (1 - e)}%, 0) scale(${s})`;

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`;

    if (titleRef.current) {
      const out = smoothstep(0.4, 0.88, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      const inn = smoothstep(0.68, 1, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
    }

    if (contentRef.current) contentRef.current.style.transform = shift ? `translate3d(0, ${-shift}px, 0)` : "";
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    // Recorrido en px desde que el escenario se fija (la apertura y, después,
    // lo que sube el contenido que no cabe)
    let current = 0;
    let target = 0;
    let stageH = 0;
    let overflow = 0;
    let running = false;

    const span = () => stageH * Math.max(0.01, propsRef.current.scrollDistance);

    const render = (px: number) => {
      if (!propsRef.current.enabled) return applyProgress(1, 0);
      const s = span();
      applyProgress(clamp(px / s, 0, 1), clamp(px - s, 0, overflow));
    };

    const measure = () => {
      const c = propsRef.current;
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;

      // Lo que el contenido mide de más respecto al espacio del overlay
      overflow = 0;
      const overlay = overlayRef.current;
      const content = contentRef.current;
      if (overlay && content) {
        const cs = getComputedStyle(overlay);
        const room = stageH - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        overflow = Math.max(0, Math.ceil(content.offsetHeight - room));
      }

      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance)) + overflow}px`;

      // Posición del punto de `restFocusX` con la foto en `object-fit: cover`
      const f = focusRef.current;
      f.dx = 0;
      const m = mediaRef.current;
      const fx = restFocusRef.current;
      if (fx != null && m) {
        const nw = m.naturalWidth || m.videoWidth;
        const nh = m.naturalHeight || m.videoHeight;
        const W = stage.clientWidth;
        if (nw && nh && W) {
          const rw = nw * Math.max(W / nw, stageH / nh);
          const pos = parseFloat(getComputedStyle(m).objectPosition);
          const left = (W - rw) * (Number.isFinite(pos) ? pos / 100 : 0.5);
          f.stageW = W;
          f.left = left - W / 2;
          f.right = left + rw - W / 2;
          f.dx = left + clamp(fx, 0, 1) * rw - W / 2;
        }
      }

      const w = root.clientWidth || stageH;
      stage.style.setProperty("--se-title-size", `${clamp(w * 0.075, 20, 84)}px`);
    };

    const readScroll = () => {
      const max = span() + overflow;
      if (propsRef.current.useWindowScroll) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top, 0, max);
      }
      return clamp(root.scrollTop, 0, max);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.25) {
        current = target;
        running = false;
      }
      render(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readScroll();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        render(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readScroll();
      current = target;
      render(current);
    };

    measure();
    target = readScroll();
    current = target;
    render(current);

    const scroller: Window | HTMLDivElement = useWindowScroll ? window : root;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Las medidas de la foto llegan al cargarla
    const mediaEl = mediaRef.current;
    mediaEl?.addEventListener("load", onResize);
    mediaEl?.addEventListener("loadedmetadata", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(root);
    // El contenido cambia de alto al cargar las fuentes o al cambiar el ancho
    if (contentRef.current) ro.observe(contentRef.current);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mediaEl?.removeEventListener("load", onResize);
      mediaEl?.removeEventListener("loadedmetadata", onResize);
      ro.disconnect();
    };
  }, [applyProgress, useWindowScroll]);

  const mediaStyle = { objectPosition: mediaPosition } as CSSProperties;
  const media =
    mediaType === "video" ? (
      <video ref={mediaRef} className="scroll-expand__media" style={mediaStyle} src={src} poster={poster} autoPlay muted loop playsInline />
    ) : (
      <img ref={mediaRef} className="scroll-expand__media" style={mediaStyle} src={src} alt={alt} draggable={false} decoding="async" />
    );

  const rootStyle = {
    "--se-track": 1 + Math.max(0, scrollDistance) + Math.max(0, holdDistance),
    "--se-start-w": startWidth,
    "--se-start-h": startHeight,
    "--se-start-r": `${startRadius}px`,
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? "scroll-expand--window" : "scroll-expand--scroller"} ${className}`.trim()}
      style={rootStyle}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {children ? (
              <div ref={overlayRef} className={`scroll-expand__overlay ${overlayClassName}`.trim()}>
                <div ref={contentRef} className="scroll-expand__content">
                  {children}
                </div>
              </div>
            ) : null}
          </div>
          {title ? (
            <div
              ref={titleRef}
              className={`scroll-expand__title ${titleClassName}`.trim()}
              aria-hidden={titleAriaHidden || undefined}
            >
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
