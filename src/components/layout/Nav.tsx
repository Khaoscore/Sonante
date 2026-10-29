import { useEffect, useId, useRef, useState } from "react";
import type { gsap as Gsap } from "gsap";
import { alternatePath, otherLocale, pathFor, routeKeyFromPath, type Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import { Globe, Menu, Close, SonanteSymbol } from "@/components/ui/Icons";
import styles from "./Nav.module.css";

type Props = {
  /** Ruta actual (Astro.url.pathname) para marcar el enlace activo */
  currentPath: string;
  lang?: Locale;
};

const EASE = "power3.out";
/**
 * El hover animado solo aplica con ratón en escritorio y sin reduced-motion.
 * En el panel móvil (≤ 900 px) se mantiene el hover CSS.
 */
const FX_QUERY = "(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** Desplazamiento (px) a partir del cual el menú fijo pasa a la barra compacta. */
const COMPACT_AFTER = 60;

/**
 * Componente "Menu" de la librería: logo circular + píldora de botones + selector de idioma.
 * En pantallas pequeñas la píldora se convierte en un panel desplegable.
 * El botón de idioma muestra el idioma actual y enlaza a la misma página en el otro idioma.
 *
 * Hover inspirado en React Bits "PillNav": un círculo sube desde el borde inferior de cada
 * botón mientras la etiqueta se desliza hacia arriba y entra una copia con el color de hover.
 * El símbolo del logo da una vuelta al pasar el ratón.
 *
 * El menú es fijo: al bajar se compacta en una barra ovalada verde oscuro que envuelve
 * logo, botones e idioma, y en escritorio se estrecha hasta el ancho de su contenido.
 */
export default function Nav({ currentPath, lang = "es" }: Props) {
  const [open, setOpen] = useState(false);
  const [fx, setFx] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const t = ui[lang];
  const currentKey = routeKeyFromPath(currentPath);
  const target = otherLocale(lang);
  const switchHref = alternatePath(currentPath, target);

  const gsapRef = useRef<typeof Gsap | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const tweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const symbolRef = useRef<SVGSVGElement>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);

  // Cierra el panel con Escape y bloquea el scroll del body mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Activa la barra compacta según el desplazamiento (un cálculo por frame como máximo).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > COMPACT_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Mide píldora + idioma para que la barra compacta se ajuste a su contenido.
  useEffect(() => {
    const header = headerRef.current;
    const list = listRef.current;
    const right = rightRef.current;
    if (!header || !list || !right) return;
    const measure = () => {
      const w = list.getBoundingClientRect().width + right.getBoundingClientRect().width;
      header.style.setProperty("--nav-inner-w", `${Math.ceil(w) + 1}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    ro.observe(right);
    return () => ro.disconnect();
  }, []);

  // Construye un timeline pausado por botón; se recalcula al cambiar tamaño o fuentes.
  useEffect(() => {
    const mq = window.matchMedia(FX_QUERY);
    let disposed = false;

    const killAll = () => {
      tweenRefs.current.forEach((tw) => tw?.kill());
      tlRefs.current.forEach((tl) => tl?.kill());
      tweenRefs.current = [];
      tlRefs.current = [];
    };

    const layout = () => {
      const gsap = gsapRef.current;
      if (!gsap || disposed) return;
      killAll();

      itemRefs.current.forEach((pill, i) => {
        if (!pill) return;
        const circle = pill.querySelector<HTMLElement>("[data-pill='circle']");
        const label = pill.querySelector<HTMLElement>("[data-pill='label']");
        const hover = pill.querySelector<HTMLElement>("[data-pill='hover']");
        if (!circle || !label || !hover) return;

        gsap.set(pill, { clearProps: "backgroundColor" });
        if (!mq.matches) {
          gsap.set([circle, label, hover], { clearProps: "all" });
          return;
        }

        // Círculo cuyo arco pasa por las esquinas superiores del botón al escalar desde su borde inferior.
        const { width: w, height: h } = pill.getBoundingClientRect();
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;

        gsap.set(circle, { width: D, height: D, bottom: -delta, xPercent: -50, scale: 0, transformOrigin: `50% ${D - delta}px` });
        gsap.set(label, { y: 0 });
        gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });

        tlRefs.current[i] = gsap
          .timeline({ paused: true })
          .to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: EASE }, 0)
          .to(label, { y: -(h + 8), duration: 2, ease: EASE }, 0)
          .to(hover, { y: 0, opacity: 1, duration: 2, ease: EASE }, 0)
          // Con el círculo ya cubriendo el botón, el fondo toma su color para evitar el filo claro del borde.
          .to(pill, { backgroundColor: getComputedStyle(circle).backgroundColor, duration: 0.6, ease: "none" }, 1.4);
      });

      setFx(mq.matches);
    };

    window.addEventListener("resize", layout);
    mq.addEventListener("change", layout);

    import("gsap").then(({ gsap }) => {
      if (disposed) return;
      gsapRef.current = gsap;
      layout();
      document.fonts?.ready.then(layout).catch(() => {});
    });

    return () => {
      disposed = true;
      window.removeEventListener("resize", layout);
      mq.removeEventListener("change", layout);
      killAll();
      logoTweenRef.current?.kill();
    };
  }, [lang]);

  const animatePill = (i: number, hovered: boolean) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    tweenRefs.current[i]?.kill();
    tweenRefs.current[i] = tl.tweenTo(hovered ? tl.duration() : 0, {
      duration: hovered ? 0.3 : 0.2,
      ease: EASE,
      overwrite: "auto",
    });
  };

  const spinLogo = () => {
    const gsap = gsapRef.current;
    const symbol = symbolRef.current;
    if (!fx || !gsap || !symbol) return;
    logoTweenRef.current?.kill();
    gsap.set(symbol, { rotate: 0 });
    logoTweenRef.current = gsap.to(symbol, { rotate: 360, duration: 0.2, ease: EASE });
  };

  const LangSwitch = ({ className = "" }: { className?: string }) => (
    <a href={switchHref} className={`${styles.lang} ${className}`} hrefLang={target} lang={target} aria-label={t.nav.langSwitch} title={t.nav.langSwitch}>
      <span>{t.nav.langCode}</span>
      <Globe />
    </a>
  );

  return (
    <header ref={headerRef} className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className="container">
        <nav className={styles.nav} aria-label={t.nav.ariaLabel}>
          <a href={pathFor("home", lang)} className={styles.logo} aria-label={t.nav.logoLabel} onMouseEnter={spinLogo}>
            <SonanteSymbol ref={symbolRef} className={styles.symbol} accent="var(--nav-logo-accent, var(--c-verde))" />
          </a>

          <ul ref={listRef} id={panelId} className={[styles.pill, open && styles.pillOpen, fx && styles.fx].filter(Boolean).join(" ")}>
            {t.nav.items.map((item, i) => {
              const href = pathFor(item.key, lang);
              const active = currentKey === item.key;
              const cls = [styles.item, item.cta && styles.cta, active && styles.active].filter(Boolean).join(" ");
              return (
                <li key={item.key}>
                  <a
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    href={href}
                    className={cls}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => animatePill(i, true)}
                    onMouseLeave={() => animatePill(i, false)}
                    onFocus={() => animatePill(i, true)}
                    onBlur={() => animatePill(i, false)}
                  >
                    <span className={styles.circle} data-pill="circle" aria-hidden="true" />
                    <span className={styles.labelStack}>
                      <span className={styles.label} data-pill="label">
                        {item.label}
                      </span>
                      <span className={styles.labelHover} data-pill="hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
            <li className={styles.langMobile}>
              <LangSwitch />
            </li>
          </ul>

          <div ref={rightRef} className={styles.right}>
            <LangSwitch className={styles.langDesktop} />
            <button
              type="button"
              className={styles.burger}
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </nav>
      </div>
      {open && <button type="button" className={styles.backdrop} aria-label={t.nav.closeMenu} onClick={() => setOpen(false)} />}
    </header>
  );
}