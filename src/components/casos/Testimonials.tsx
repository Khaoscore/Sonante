import { useState } from "react";
import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import styles from "./Testimonials.module.css";

type Props = { lang?: Locale };

/**
 * Testimonios en tarjetas apiladas (verde al frente, naranja detrás), como en
 * los frames 45:2475 / 45:2486. Con más de un testimonio, las flechas rotan
 * la pila; con uno solo, la tarjeta trasera es decorativa.
 */
export default function Testimonials({ lang = "es" }: Props) {
  const { testimonios, labels } = casosContent[lang];
  const a11y = ui[lang].a11y;
  const [index, setIndex] = useState(0);
  const total = testimonios.length;
  const current = testimonios[index];
  const behind = total > 1 ? testimonios[(index + 1) % total] : null;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total);

  return (
    <section className={styles.section} aria-label={labels.testimonials}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.stack}>
          <div className={`${styles.card} ${styles.back}`} aria-hidden="true">
            {behind && <p className={styles.quote}>{behind.quote}</p>}
          </div>

          <figure className={`${styles.card} ${styles.front}`} key={current.name + index}>
            <blockquote className={styles.quote}>{current.quote}</blockquote>
            <figcaption className={styles.author}>
              <img src={current.avatar} alt="" className={styles.avatar} width={44} height={44} loading="lazy" />
              <div>
                <p className={styles.name}>{current.name}</p>
                <p className={styles.role}>{current.role}</p>
              </div>
            </figcaption>
          </figure>
        </div>

        {total > 1 && (
          <div className={styles.controls}>
            <button type="button" onClick={() => go(-1)} aria-label={a11y.previous}>
              <ChevronLeft />
            </button>
            <span className={styles.counter}>
              {index + 1} / {total}
            </span>
            <button type="button" onClick={() => go(1)} aria-label={a11y.next}>
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
