import { useState, type CSSProperties } from "react";
import { casosContent, type Testimonio } from "@/data/casos";
import type { Locale } from "@/i18n";
import Stack from "@/components/ui/Stack";
import styles from "./Testimonials.module.css";

type Props = { lang?: Locale };

function Card({ t }: { t: Testimonio }) {
  const style = { "--card-bg": t.bg, "--card-text": t.textColor, "--card-name": t.nameColor } as CSSProperties;
  return (
    <figure className={styles.card} style={style}>
      <blockquote className={styles.quote}>{t.quote}</blockquote>
      <figcaption className={styles.author}>
        <img src={t.avatar} alt="" className={styles.avatar} width={44} height={44} loading="lazy" draggable={false} />
        <div>
          <p className={styles.name}>{t.name}</p>
          <p className={styles.role}>{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/**
 * Testimonios en una pila de tarjetas (React Bits Stack): cada una con su
 * color (Fajardo naranja, Pabón amarilla). La de arriba se arrastra, se pulsa
 * o se pasa con el teclado para mandarla al fondo.
 * Copias invisibles de todas las tarjetas fijan el alto de la pila, porque
 * Stack coloca las tarjetas en absoluto.
 */
export default function Testimonials({ lang = "es" }: Props) {
  const { testimonios, labels } = casosContent[lang];
  const [index, setIndex] = useState(0);
  const total = testimonios.length;

  return (
    <section className={styles.section} aria-label={labels.testimonials}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.stackWrap}>
          <div className={styles.sizer} aria-hidden="true">
            {testimonios.map((t) => (
              <Card key={t.name} t={t} />
            ))}
          </div>
          <Stack
            className={styles.stack}
            ariaLabel={labels.testimonials}
            cards={testimonios.map((t) => (
              <Card key={t.name} t={t} />
            ))}
            layout="cascade"
            spread={0.45}
            depth={0}
            radius={18}
            shadow={false}
            tilt={14}
            sendToBackOnClick
            onChange={setIndex}
          />
        </div>

        {total > 1 && (
          <div className={styles.controls}>
            <span className={styles.counter} aria-live="polite">
              {index + 1} / {total}
            </span>
            <span className={styles.hint}>{labels.testimonialsHint}</span>
          </div>
        )}
      </div>
    </section>
  );
}
