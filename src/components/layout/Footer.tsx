import { site, social } from "@/data/site";
import { pathFor, type Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import styles from "./Footer.module.css";

type Props = { lang?: Locale };

/**
 * Componente "Footer" del diseño: bloque verde oscuro con logotipo, columnas de
 * información y redes, más barra amarilla de copyright.
 */
export default function Footer({ lang = "es" }: Props) {
  const t = ui[lang];

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <a href={pathFor("home", lang)} aria-label={t.nav.logoLabel}>
            <span role="img" aria-label="Sonante" className={styles.wordmark} />
          </a>
          <p className={styles.legal}>
            © {site.legalName} &nbsp;-&nbsp; {site.nit} &nbsp;-&nbsp; {site.city}
          </p>
        </div>

        <div className={styles.info}>
          <div className={styles.about}>
            <h2 className={styles.aboutTitle}>{t.footer.whatWeDo}</h2>
            <p>{t.tagline}</p>
            <p>
              {t.footer.book}
              <br />
              <a href={`mailto:${site.email}`} className={styles.mail}>
                {site.email}
              </a>
            </p>
          </div>

          <nav className={styles.menu} aria-label={t.footer.ariaLabel}>
            <ul>
              {t.footer.menu.map((item) => (
                <li key={item.key}>
                  <a href={pathFor(item.key, lang)}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className={styles.social} aria-label={t.footer.socialLabel}>
            {social.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name}>
                    <span className={styles.socialIcon} style={{ WebkitMaskImage: `url(${s.icon})`, maskImage: `url(${s.icon})` }}/>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>
          © {t.footer.copyright} {site.copyrightYear} {site.legalName} &nbsp;-&nbsp; {t.footer.poweredBy}{" "}
          <a href={site.poweredBy.href} target="_blank" rel="noopener noreferrer">
            {site.poweredBy.label}
          </a>
        </p>
      </div>
    </footer>
  );
}
