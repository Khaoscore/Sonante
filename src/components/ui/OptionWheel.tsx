import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import "./OptionWheel.css";

/**
 * OptionWheel (React Bits) — lista de opciones dispuesta sobre una rueda que
 * gira con la rueda del ratón / touchpad, arrastre, clic o flechas.
 * Adaptado a TypeScript. Cambios respecto al original:
 * - `inset` admite unidades CSS además de px.
 * - `scale`: las opciones se encogen al alejarse del centro.
 * - `releaseScroll`: sin bucle, deja pasar el scroll a la página en los extremos.
 * - `wheelTarget`: otro elemento cuyo scroll también gira la rueda.
 * - `ariaLabel` y `aria-activedescendant` para lectores de pantalla.
 * - Posición inicial calculada en el render, para que el HTML del servidor ya
 *   muestre la rueda armada antes de hidratar.
 * - Con `prefers-reduced-motion` la rueda salta sin interpolar.
 * Origen: https://reactbits.dev
 */

const DEFAULT_ITEMS = ["Ambient", "House", "Techno", "Jazz", "Lo-Fi", "Synthwave", "Trance", "Funk", "Disco", "Hip-Hop", "Chillwave", "Drum & Bass"];

export type OptionWheelProps = {
  items?: string[];
  defaultSelected?: number;
  /** Se llama cada vez que la rueda se asienta en una opción nueva */
  onChange?: (index: number, item: string) => void;
  textColor?: string;
  /** Color hacia el que se mezcla la opción al llegar al centro */
  activeColor?: string;
  /** Borde del contenedor alrededor del que se curva la rueda */
  side?: "left" | "right";
  /** Tamaño de fuente en rem */
  fontSize?: number;
  /** Distancia vertical entre opciones, en múltiplos del tamaño de fuente */
  spacing?: number;
  /** Profundidad de la curva; 0 la aplana en una lista recta */
  curve?: number;
  /** Grados entre opciones vecinas */
  tilt?: number;
  /** Desenfoque en px por paso de distancia al centro */
  blur?: number;
  /** Opacidad perdida por paso de distancia al centro */
  fade?: number;
  minOpacity?: number;
  /** Escala perdida por paso de distancia al centro */
  scale?: number;
  /** Constante de suavizado en ms */
  smoothing?: number;
  /** Separación entre el borde anclado y la opción centrada (px o unidad CSS) */
  inset?: number | string;
  loop?: boolean;
  draggable?: boolean;
  /** Sin bucle: en los extremos, el scroll sigue hacia la página */
  releaseScroll?: boolean;
  /** Elemento externo cuyo scroll también gira la rueda (p. ej. su contenido asociado) */
  wheelTarget?: RefObject<HTMLElement | null>;
  soundUrl?: string;
  soundVolume?: number;
  ariaLabel?: string;
  className?: string;
};

type Cfg = {
  count: number;
  items: string[];
  rowH: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  scale: number;
  side: "left" | "right";
  loop: boolean;
  smoothing: number;
  draggable: boolean;
  releaseScroll: boolean;
  soundUrl: string;
  soundVolume: number;
};

type ItemLayout = { transform: string; opacity: string; filter: string; p: string };

// Las opciones se apoyan en un círculo cuyo radio mantiene la longitud de arco
// entre vecinas igual a una fila, así que `tilt` controla cuánto se enrosca.
const layoutItem = (d: number, cfg: Pick<Cfg, "rowH" | "curve" | "tilt" | "blur" | "fade" | "minOpacity" | "scale" | "side">): ItemLayout => {
  const mirror = cfg.side === "right" ? -1 : 1;
  const tiltRad = (cfg.tilt * Math.PI) / 180;
  const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;
  const dist = Math.abs(d);
  let x = 0;
  let y = d * cfg.rowH;
  let rot = 0;
  if (R > 0) {
    const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
    y = R * Math.sin(ang);
    x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
    rot = (mirror * ang * 180) / Math.PI;
  }
  const s = Math.max(0.2, 1 - dist * cfg.scale);
  return {
    transform: `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(4)})`,
    opacity: String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade)),
    filter: cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : "none",
    p: Math.max(0, 1 - Math.min(dist, 1)).toFixed(4),
  };
};

const wrapDistance = (d: number, n: number, loop: boolean) => {
  if (!loop || n <= 1) return d;
  let w = ((d % n) + n) % n;
  if (w > n / 2) w -= n;
  return w;
};

export default function OptionWheel({
  items = DEFAULT_ITEMS,
  defaultSelected = 3,
  onChange,
  textColor = "#a6a6a6",
  activeColor = "#ffffff",
  side = "left",
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  scale = 0,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  releaseScroll = false,
  wheelTarget,
  soundUrl = "",
  soundVolume = 0.5,
  ariaLabel = "Option wheel",
  className = "",
}: OptionWheelProps) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const cfgRef = useRef<Cfg>({} as Cfg);
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef("");
  const lastTickRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  const remPx = typeof window !== "undefined" ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;

  onChangeRef.current = onChange;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    scale,
    side,
    loop,
    smoothing,
    draggable,
    releaseScroll,
    soundUrl,
    soundVolume,
  };

  // Disposición inicial (con 16 px por rem en servidor y cliente para que la
  // hidratación coincida); el bucle rAF la corrige en cuanto monta.
  const [initialLayout] = useState(() =>
    items.map((_, i) =>
      layoutItem(wrapDistance(i - defaultSelected, items.length, loop), {
        rowH: Math.max(fontSize * spacing * 16, 1),
        curve,
        tilt,
        blur,
        fade,
        minOpacity,
        scale,
        side,
      }),
    ),
  );

  // Un único bucle rAF acerca la posición a su objetivo con suavizado
  // exponencial independiente de los fps y coloca cada opción en la curva.
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = reducedMotionRef.current ? 1 : 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    posRef.current = next;

    const els = itemRefs.current;
    for (let i = 0; i < cfg.count; i++) {
      const el = els[i];
      if (!el) continue;
      const l = layoutItem(wrapDistance(i - next, cfg.count, cfg.loop), cfg);
      el.style.transform = l.transform;
      el.style.opacity = l.opacity;
      el.style.filter = l.filter;
      el.style.setProperty("--ow-p", l.p);
    }

    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  // Tic opcional al cambiar de opción, limitado para que el scroll rápido no lo
  // sature; los fallos de reproducción (políticas de autoplay) se ignoran.
  const playTick = useCallback(() => {
    const { soundUrl: url, soundVolume: volume } = cfgRef.current;
    if (!url) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== url) {
      audioRef.current = new Audio(url);
      audioRef.current.preload = "auto";
      audioUrlRef.current = url;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(volume, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        onChangeRef.current?.(idx, cfg.items[idx]);
        playTick();
      }
      startLoop();
    },
    [startLoop, playTick],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotionRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Rueda / touchpad, registrado a mano para poder ser no pasivo. También
  // escucha en `wheelTarget`, si se indica.
  useEffect(() => {
    const els = [rootRef.current, wheelTarget?.current].filter((el): el is HTMLElement => el != null);
    if (!els.length) return;
    const onWheel = (e: WheelEvent) => {
      const cfg = cfgRef.current;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      if (cfg.releaseScroll && !cfg.loop) {
        const t = targetRef.current;
        if ((delta > 0 && t >= cfg.count - 1) || (delta < 0 && t <= 0)) return;
      }
      e.preventDefault();
      // Máximo un paso por evento: las ruedas con muescas avanzan una opción por
      // clic y los touchpads siguen desplazándose de forma continua.
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    };
    els.forEach((el) => el.addEventListener("wheel", onWheel, { passive: false }));
    return () => {
      els.forEach((el) => el.removeEventListener("wheel", onWheel));
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget, wheelTarget]);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!cfgRef.current.draggable) return;
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        // La captura empieza solo con un arrastre real, para que los clics
        // simples sigan llegando a las opciones.
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) applyTarget(drag.start - dy / cfgRef.current.rowH, false);
    },
    [applyTarget],
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget]);

  const handleItemClick = useCallback(
    (index: number) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);
    },
    [applyTarget],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      let delta: number | null = null;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") delta = -1;
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") delta = 1;
      if (delta == null) return;
      e.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget],
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, scale, side, loop, smoothing, applyTarget]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      audioRef.current?.pause();
    },
    [],
  );

  const rootStyle = {
    "--ow-text-color": textColor,
    "--ow-active-color": activeColor,
    "--ow-font-size": `${fontSize}rem`,
    "--ow-inset": typeof inset === "number" ? `${inset}px` : inset,
  } as CSSProperties;

  const classes = [
    "option-wheel",
    side === "right" && "option-wheel--right",
    draggable && "option-wheel--draggable",
    isDragging && "option-wheel--dragging",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-activedescendant={`${baseId}-${selectedIndex}`}
      className={classes}
      style={rootStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => {
        const l = initialLayout[index];
        const style = l ? ({ transform: l.transform, opacity: l.opacity, filter: l.filter, "--ow-p": l.p } as CSSProperties) : undefined;
        return (
          <div
            key={`${label}-${index}`}
            id={`${baseId}-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="option"
            aria-selected={selectedIndex === index}
            className={`option-wheel__item${selectedIndex === index ? " option-wheel__item--selected" : ""}`}
            style={style}
            onClick={() => handleItemClick(index)}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
