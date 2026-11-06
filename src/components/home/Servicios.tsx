import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import { servicios } from "@/data/servicios";
import { home } from "@/data/home";
import type { Locale } from "@/i18n";
import DepthText from "@/components/ui/DepthText";
import styles from "./Servicios.module.css";

type Props = { lang?: Locale };

/**
 * Sección "Servicios" (component set con 5 variantes en Figma).
 * Estado base: título extruido en 3D (DepthText, reacciona al puntero) sobre
 * cuatro tarjetas de fotos. Al pasar el cursor / tocar / enfocar una tarjeta,
 * la sección toma el color del servicio, aparece su título y la tarjeta crece
 * mostrando la descripción.
 * En mobile las tarjetas no se mueven ni cambia el título de la sección: el
 * título del servicio y su texto aparecen dentro de la propia tarjeta.
 */
const MOBILE_QUERY = "(max-width: 560px)";

export default function Servicios({ lang = "es" }: Props) {
  const items = servicios[lang];
  const heading = home[lang].servicios.heading;
  const [active, setActive] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  // Tipo del último puntero que pulsó una tarjeta: el ratón activa con hover, el dedo con tap
  const lastPointer = useRef("");
  const current = active === null ? null : items[active];
  const headingItem = mobile ? null : current;

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    // Tocar fuera de las tarjetas las cierra (en touch no hay "mouse leave")
    const onClickOutside = (e: globalThis.MouseEvent) => {
      if (!listRef.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClickOutside);
    };
  }, [active]);

  // Un tap dispara hover, foco y click seguidos; solo el click debe decidir en touch.
  const onCardClick = (i: number) => (e: MouseEvent) => {
    const mouse = e.detail > 0 && lastPointer.current === "mouse";
    // Con ratón la tarjeta ya está abierta por el hover; con dedo o teclado alterna
    setActive(mouse || active !== i ? i : null);
  };
  const onCardFocus = (i: number) => (e: FocusEvent<HTMLButtonElement>) => {
    // Solo el foco con teclado abre la tarjeta (el foco de un tap lo gestiona el click)
    let keyboard = true;
    try {
      keyboard = e.currentTarget.matches(":focus-visible");
    } catch {}
    if (keyboard) setActive(i);
  };

  const sectionStyle = { "--bg": current ? current.bg : "transparent" } as CSSProperties;

  return (
    <section id="servicios" className={`${styles.section} ${current ? styles.tinted : ""}`} style={sectionStyle} aria-labelledby="servicios-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          {headingItem ? (
            <h2 id="servicios-title" className={`t-h1 ${styles.title}`} key={headingItem.id}>
              {headingItem.title}
            </h2>
          ) : (
            <h2 id="servicios-title" className={styles.depthTitle} key="base">
              {/* En mobile se muestra el título plano (frame 383:3277) en vez del 3D */}
              <span className={`t-h1 ${styles.plainTitle}`}>{heading}</span>
              <span className={styles.depthWrap}>
                <DepthText
                  text={heading}
                  layers={34}
                  depth={2.4}
                  faceColor="#ffffff"
                  depthColor="#0bb730"
                  tilt={7.5}
                  pointerTracking
                  smoothing={0.14}
                  perspective={900}
                  autoOrbit
                  orbitSpeed={0.35}
                  fontSize="clamp(3.5rem, 1.5rem + 8vw, 8.5rem)"
                  fontWeight={800}
                  shadow
                />
              </span>
            </h2>
          )}
        </div>

        <ul ref={listRef} className={styles.cards} onPointerLeave={(e: PointerEvent) => e.pointerType === "mouse" && setActive(null)}>
          {items.map((s, i) => {
            const isActive = active === i;
            const cardStyle = { "--overlay": s.overlay, "--tint": s.tint, "--text": s.textColor } as CSSProperties;
            return (
              <li key={s.id} className={`${styles.card} ${isActive ? styles.cardActive : ""}`} style={cardStyle}>
                <button
                  type="button"
                  className={styles.cardBtn}
                  aria-pressed={isActive}
                  aria-label={s.title}
                  onPointerDown={(e) => (lastPointer.current = e.pointerType)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onFocus={onCardFocus(i)}
                  onClick={onCardClick(i)}
                >
                  <img src={s.image} alt={s.alt} loading="lazy" decoding="async" style={{ objectPosition: s.imagePosition }} />
                  <span className={styles.tint} aria-hidden="true" />
                  <span className={styles.overlay} aria-hidden="true" />
                  {/* Nombre del servicio: arriba en las tarjetas impares, abajo en las pares */}
                  <span className={`${styles.label} ${i % 2 ? styles.labelBottom : styles.labelTop}`} aria-hidden="true">
                    {s.label}
                  </span>
                  <span className={styles.content}>
                    {/* Título dentro de la tarjeta: solo en mobile, donde no cambia el título de la sección */}
                    <span className={styles.cardTitle} aria-hidden="true">
                      {s.title}
                    </span>
                    <span className={`t-medium ${styles.text}`}>{s.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
