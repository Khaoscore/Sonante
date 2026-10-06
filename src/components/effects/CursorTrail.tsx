import { useEffect, useRef } from "react";
import styles from "./CursorTrail.module.css";

/**
 * Cursor personalizado + estela tipo "cometa" (misma forma que el recurso
 * Gradient-03 del diseño): un círculo coral que deja una cinta afilada que se
 * desvanece hacia la cola. Al hacer clic, el círculo late y emite una onda.
 *
 * Solo se activa con puntero fino (ratón) y sin `prefers-reduced-motion`;
 * en táctil no se monta nada y se conserva el cursor nativo.
 */

const HEAD_RADIUS = 10; // radio del círculo del cursor (px)
const MAX_POINTS = 36; // puntos máximos de la estela (≈ frames)
const MAX_LENGTH = 150; // longitud máxima de la estela (px)
const TAPER = 0.85; // exponente del afilado (1 = lineal; <1 = cola más gruesa)
const FOLLOW = 0.32; // suavizado del seguimiento (0–1)
const HEAD = { r: 255, g: 113, b: 102 }; // --c-coral
const TAIL = { r: 233, g: 75, b: 36 }; // --c-naranja

type P = { x: number; y: number };

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const layer = layerRef.current;
    if (!fine || reduced || !canvas || !cursor || !dot || !layer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mouse: P = { x: -100, y: -100 };
    const pos: P = { x: -100, y: -100 };
    const points: P[] = [];
    let visible = false;
    let running = false;
    let raf = 0;

    const clear = () => ctx.clearRect(0, 0, width, height);

    /** Cinta afilada desde la cola (ancho 0, transparente) hasta la cabeza (2R, coral) */
    const drawTrail = () => {
      clear();
      const n = points.length;
      if (n < 2) return;
      const head = points[n - 1];
      const tail = points[0];
      if (Math.hypot(head.x - tail.x, head.y - tail.y) < 1) return;

      const left: P[] = [];
      const right: P[] = [];
      for (let i = 0; i < n; i++) {
        const p = points[i];
        const prev = points[Math.max(i - 1, 0)];
        const next = points[Math.min(i + 1, n - 1)];
        let dx = next.x - prev.x;
        let dy = next.y - prev.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const t = i / (n - 1);
        const w = HEAD_RADIUS * Math.pow(t, TAPER);
        left.push({ x: p.x - dy * w, y: p.y + dx * w });
        right.push({ x: p.x + dy * w, y: p.y - dx * w });
      }

      const last = points[n - 2];
      const angle = Math.atan2(head.y - last.y, head.x - last.x);

      ctx.beginPath();
      ctx.moveTo(left[0].x, left[0].y);
      for (let i = 1; i < n; i++) ctx.lineTo(left[i].x, left[i].y);
      // Cabeza redondeada: arco desde el borde izquierdo al derecho pasando por el frente
      ctx.arc(head.x, head.y, HEAD_RADIUS, angle + Math.PI / 2, angle - Math.PI / 2, true);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
      ctx.closePath();

      const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      g.addColorStop(0, `rgba(${TAIL.r}, ${TAIL.g}, ${TAIL.b}, 0)`);
      g.addColorStop(0.35, `rgba(${TAIL.r}, ${TAIL.g}, ${TAIL.b}, 0.55)`);
      g.addColorStop(0.75, `rgba(${HEAD.r}, ${HEAD.g}, ${HEAD.b}, 0.9)`);
      g.addColorStop(1, `rgba(${HEAD.r}, ${HEAD.g}, ${HEAD.b}, 1)`);
      ctx.fillStyle = g;
      ctx.fill();
    };

    /** Recorta la estela por número de puntos y por longitud geométrica */
    const trim = () => {
      while (points.length > MAX_POINTS) points.shift();
      let length = 0;
      for (let i = points.length - 1; i > 0; i--) {
        length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        if (length > MAX_LENGTH) {
          points.splice(0, i);
          break;
        }
      }
    };

    const loop = () => {
      pos.x += (mouse.x - pos.x) * FOLLOW;
      pos.y += (mouse.y - pos.y) * FOLLOW;
      points.push({ x: pos.x, y: pos.y });
      trim();
      cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      drawTrail();

      const settled =
        Math.hypot(mouse.x - pos.x, mouse.y - pos.y) < 0.15 && points.every((p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 0.5);
      if (settled) {
        running = false;
        points.length = 0;
        clear();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        cursor.classList.add(styles.visible);
      }
      start();
    };

    const onLeave = () => {
      visible = false;
      cursor.classList.remove(styles.visible);
      points.length = 0;
      clear();
    };

    const spawnRipple = (x: number, y: number) => {
      const ring = document.createElement("span");
      ring.className = styles.ripple;
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
      layer.appendChild(ring);
    };

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dot.classList.add(styles.press);
      spawnRipple(e.clientX, e.clientY);
    };
    const onUp = () => dot.classList.remove(styles.press);

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const link = !!target?.closest('a, button, [role="button"], summary, label, [data-cursor="drag"]');
      const text = !!target?.closest("input, textarea, select");
      dot.classList.toggle(styles.link, link && !text);
      dot.classList.toggle(styles.text, text);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div ref={layerRef} className={styles.ripples} aria-hidden="true" />
      <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
        <span ref={dotRef} className={styles.dot} />
      </div>
    </>
  );
}
