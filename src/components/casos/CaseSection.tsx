import type { CSSProperties } from "react";
import type { Caso } from "@/data/casos";
import { casosContent } from "@/data/casos";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import styles from "./CaseSection.module.css";

type Props = { caso: Caso; lang?: Locale };

/**
 * Bloque de caso de éxito a pantalla completa (946 px): foto de fondo con velo
 * al 50 %, etiqueta de categoría, objetivo / lo que hicimos y cifras.
 */
export default function CaseSection({ caso, lang = "es" }: Props) {
  const labels = casosContent[lang].labels;
  const a11y = ui[lang].a11y;
  const tagStyle = { background: caso.tagBg, color: caso.tagColor } as CSSProperties;

  return (
    <section id={caso.id} className={styles.case} aria-labelledby={`caso-${caso.id}`}>
      <img src={caso.image} alt="" className={styles.bg} style={{ objectPosition: caso.imagePosition ?? "center" }} loading="lazy" decoding="async" />
      <div className={styles.veil} aria-hidden="true" />

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
    </section>
  );
}
