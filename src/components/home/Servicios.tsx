import { useEffect, useState, type CSSProperties } from "react";
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
 */
export default function Servicios({ lang = "es" }: Props) {
  const items = servicios[lang];
  const heading = home[lang].servicios.heading;
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : items[active];

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  const sectionStyle = { "--bg": current ? current.bg : "transparent" } as CSSProperties;

  return (
    <section id="servicios" className={`${styles.section} ${current ? styles.tinted : ""}`} style={sectionStyle} aria-labelledby="servicios-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          {current ? (
            <h2 id="servicios-title" className={`t-h1 ${styles.title}`} key={current.id}>
              {current.title}
            </h2>
          ) : (
            <h2 id="servicios-title" className={styles.depthTitle} key="base">
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
            </h2>
          )}
        </div>

        <ul className={styles.cards} onMouseLeave={() => setActive(null)}>
          {items.map((s, i) => {
            const isActive = active === i;
            const cardStyle = { "--overlay": s.overlay, "--text": s.textColor } as CSSProperties;
            return (
              <li key={s.id} className={`${styles.card} ${isActive ? styles.cardActive : ""}`} style={cardStyle}>
                <button
                  type="button"
                  className={styles.cardBtn}
                  aria-pressed={isActive}
                  aria-label={s.title}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(isActive ? null : i)}
                >
                  <img src={s.image} alt={s.alt} loading="lazy" decoding="async" />
                  <span className={styles.overlay} aria-hidden="true" />
                  <span className={`t-medium ${styles.text}`}>{s.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
