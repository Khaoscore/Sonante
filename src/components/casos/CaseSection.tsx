import type { CSSProperties } from "react";
import type { Caso } from "@/data/casos";
import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import ScrollExpand from "@/components/ui/ScrollExpand";
import styles from "./CaseSection.module.css";

type Props = { caso: Caso; lang?: Locale };

/**
 * Bloque de caso de éxito con React Bits ScrollExpand: la foto empieza como un
 * marco pequeño con el nombre y se abre con el scroll hasta ocupar la pantalla.
 * Mientras se abre, el nombre sube y se desvanece, y el contenido del caso
 * (etiqueta, objetivo / lo que hicimos y cifras) aparece encima de la foto
 * con un velo al 50 %. Si el contenido no cabe en la pantalla, sube con el
 * scroll antes de soltar la foto.
 * Isla de React (`client:visible`).
 */
export default function CaseSection({ caso, lang = "es" }: Props) {
  const labels = casosContent[lang].labels;
  const a11y = ui[lang].a11y;
  const tagStyle = { background: caso.tagBg, color: caso.tagColor } as CSSProperties;

  return (
    <section id={caso.id} className={styles.case} aria-labelledby={`caso-${caso.id}`}>
      <ScrollExpand
        className={styles.expand}
        titleClassName={styles.expandTitle}
        overlayClassName={styles.overlay}
        src={caso.image}
        mediaPosition={caso.imagePosition ?? "center"}
        restShiftY={caso.frameShiftY ?? 0}
        restFocusX={caso.frameFocusX}
        title={caso.name}
        titleAriaHidden
        useWindowScroll
        startWidth={46}
        startHeight={62}
        startRadius={24}
        mediaZoom={1.15}
        scrollDistance={1.2}
        holdDistance={0.5}
        overlayScrim={0.5}
        smoothing={0.1}
      >
        <div className={styles.body}>
          <span className={`t-button ${styles.tag}`} style={tagStyle}>
            {caso.tag}
          </span>

          <div className={`container ${styles.content}`}>
            <header className={styles.header}>
              <h2 id={`caso-${caso.id}`} className="t-h2">
                {caso.name}
              </h2>
              {caso.role && <p className="t-h4">{caso.role}</p>}
            </header>

            <div className={styles.cols}>
              <div className={styles.col}>
                <h3 className="t-h4">{labels.goal}</h3>
                <p className={`t-body-bold ${styles.colText}`}>{caso.objetivo}</p>
              </div>
              <div className={`${styles.col} ${styles.colWide}`}>
                <h3 className="t-h4">{labels.whatWeDid}</h3>
                <p className={`t-body-bold ${styles.colText}`}>{caso.hicimos}</p>
              </div>
            </div>

            {Array.isArray(caso.stats) ? (
              <ul className={`${styles.stats} ${styles.figures}`}>
                {caso.stats.map((stat) => (
                  <li key={stat.value} className={styles.figure}>
                    <span className="t-h4">{stat.value}</span>
                    <span className="t-medium">{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={styles.stats}>
                <li className={styles.stat}>
                  <img src="/assets/icons/icon-instagram-white.svg" alt={a11y.instagram} width={32} height={32} />
                  <span className="t-h4">{caso.stats.instagram}</span>
                </li>
                <li className={`${styles.stat} ${styles.statCenter}`}>
                  <span className="t-h4">{caso.stats.followers}</span>
                </li>
                <li className={styles.stat}>
                  <img src="/assets/icons/icon-tiktok-white.svg" alt={a11y.tiktok} width={32} height={32} />
                  <span className="t-h4">{caso.stats.tiktok}</span>
                </li>
              </ul>
            )}

            <p className={`t-body-bold ${styles.closing}`}>{caso.closing}</p>
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
}
