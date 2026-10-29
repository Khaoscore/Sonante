import type { CSSProperties } from "react";
import type { Caso } from "@/data/casos";
import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import ScrollExpand from "@/components/ui/ScrollExpand";
import styles from "./CaseSection.module.css";

type Props = { caso: Caso; lang?: Locale };

/**
 * Bloque de caso de éxito: la foto empieza como un marco pequeño con el nombre
 * y se abre con el scroll hasta ocupar la pantalla (React Bits ScrollExpand).
 * Ya abierta, con un velo al 50 %, el contenido del caso (etiqueta, objetivo /
 * lo que hicimos y cifras) sube por encima.
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
        src={caso.image}
        mediaPosition={caso.imagePosition ?? "center"}
        restShiftY={caso.frameShiftY ?? 0}
        title={caso.name}
        aria-hidden="true"
        useWindowScroll
        startWidth={46}
        startHeight={62}
        startRadius={24}
        mediaZoom={1.1}
        scrollDistance={0.5}
        holdDistance={1}
        overlayScrim={0.5}
        smoothing={0.06}
      />

      {/* Misma foto como fondo fijo del texto: coincide con la foto abierta y
          la acompaña aunque el texto mida más que la pantalla */}
      <div
        className={styles.body}
        style={
          {
            "--case-bg": `url("${caso.image}")`,
            "--case-bg-pos": caso.imagePosition ?? "center",
          } as CSSProperties
        }
      >
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

          <p className={`t-body-bold ${styles.closing}`}>{caso.closing}</p>
        </div>
      </div>
    </section>
  );
}
