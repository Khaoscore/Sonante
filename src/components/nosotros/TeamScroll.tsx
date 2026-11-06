import { useEffect, useId, useRef } from "react";
import "lenis/dist/lenis.css";
import { aboutContent, type TeamRow } from "@/data/team";
import type { Locale } from "@/i18n";
import { scramble, splitLinesAndChars } from "@/lib/scramble";
import { startSmoothScroll } from "@/lib/smooth-scroll";
import styles from "./TeamScroll.module.css";

type Props = { lang?: Locale };

const DESKTOP = "(min-width: 1024px)";
const MOBILE = "(max-width: 1023.98px)";
const REDUCE = "(prefers-reduced-motion: reduce)";

/**
 * Tramo de la cortina, medido con el borde superior de cada bloque de texto.
 * Empieza cuando el texto anterior ya se leyó (sube por la mitad superior) y
 * termina justo cuando el título nuevo llega a la zona de lectura: así cada
 * texto se lee siempre junto a su foto, nunca con la tarjeta a medio cambiar.
 * (La referencia usa "top 45%" → "bottom 45%": la foto cambia durante todo el
 * bloque y queda a medias mientras se lee.)
 */
const CURTAIN = { start: "top 70%", end: "top 25%" };
/** Con movimiento reducido: punto medio del tramo, donde se hace el fundido */
const CROSSFADE_AT = "top 48%";

/** GIF transparente de 1×1: la <source> que lo elige evita descargar la foto en el breakpoint donde no se ve */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Foto o video de un cofundador. `only` indica dónde se ve: en la tarjeta fija
 * (desktop) o arriba de cada bloque del carrusel (mobile).
 * Los videos no llevan src: se cargan desde JS (`data-src`) al acercarse.
 */
function Media({ row, only, first = false }: { row: TeamRow; only: "desktop" | "mobile"; first?: boolean }) {
  const objectPosition = row.imagePosition ?? "center";

  if (row.video) {
    return (
      <video
        className={styles.mediaEl}
        data-src={row.video}
        poster={row.image}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        aria-label={row.alt}
        style={{ objectPosition }}
      />
    );
  }

  return (
    <picture className={styles.picture}>
      <source media={only === "desktop" ? MOBILE : DESKTOP} srcSet={BLANK} />
      <img
        className={styles.mediaEl}
        src={row.image}
        alt={row.alt}
        // Las capas de la tarjeta están recortadas por la máscara: el lazy-load
        // nativo no las vería hasta que empieza la cortina
        loading={only === "desktop" ? "eager" : "lazy"}
        fetchPriority={only === "desktop" && !first ? "low" : "auto"}
        decoding="async"
        style={{ objectPosition }}
      />
    </picture>
  );
}

/**
 * "¿Quiénes somos?": todo el equipo (cofundadores, datos, "ruptura" y "Esto es
 * Sonante") con tarjeta fija y cortina, réplica de la sección "Nos expertises"
 * de sharebien.com. Cada bloque de texto tiene su foto en la tarjeta.
 *
 * Desktop (≥1024): la tarjeta de la izquierda queda fija (sticky) mientras
 * pasan los bloques de texto. Cada foto nueva entra de abajo hacia arriba como
 * una cortina ligada al scroll: la capa sube (yPercent 100 → 0) y su contenido
 * baja lo mismo (-100 → 0), así la foto queda quieta y solo se mueve la máscara.
 * Mobile (<1024): carrusel horizontal con scroll-snap, foto arriba de cada bloque.
 * En los dos, el título se "decodifica" letra por letra una sola vez.
 * Con prefers-reduced-motion: sin scramble, sin Lenis y la tarjeta cambia con un fundido.
 *
 * Además activa Lenis (scroll suave) en la página. Necesita `client:load`.
 */
export default function TeamScroll({ lang = "es" }: Props) {
  const { rows, teamLabel } = aboutContent[lang];
  const rootRef = useRef<HTMLElement>(null);
  const headingId = useId();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const names = Array.from(root.querySelectorAll<HTMLElement>("[data-name]"));

    let cancelled = false;
    let dispose: (() => void) | undefined;

    (async () => {
      let gsap: typeof import("gsap").gsap;
      let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
      let Lenis: typeof import("lenis").default;
      try {
        [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);
      } catch {
        // Si GSAP no carga, mostrar los nombres en vez de dejarlos ocultos
        names.forEach((n) => (n.style.opacity = "1"));
        return;
      }
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", root);
      const blocks = gsap.utils.toArray<HTMLElement>("[data-block]", root);
      const list = root.querySelector<HTMLElement>("[data-list]");
      /** Nombres que ya se animaron: no se repiten al cambiar de breakpoint */
      const played = new WeakSet<HTMLElement>();

      const loadVideo = (video: HTMLVideoElement | null) => {
        const src = video?.dataset.src;
        if (!video || !src || video.getAttribute("src")) return;
        video.muted = true;
        video.src = src;
        video.play().catch(() => {});
      };

      const mm = gsap.matchMedia();

      // Scroll suave en toda la página (no con movimiento reducido)
      mm.add("(prefers-reduced-motion: no-preference)", () => startSmoothScroll(Lenis, gsap, ScrollTrigger));

      mm.add({ desktop: DESKTOP, mobile: MOBILE, reduce: REDUCE }, (context) => {
        const { desktop, reduce } = context.conditions as Record<"desktop" | "mobile" | "reduce", boolean>;
        let active = true;
        const cleanups: (() => void)[] = [() => (active = false)];

        // ---------- Nombres: scramble/decode una sola vez ----------
        const show = (h3: HTMLElement) => {
          played.add(h3);
          h3.style.opacity = "1";
        };
        const play = (h3: HTMLElement) => {
          if (played.has(h3)) return;
          played.add(h3);
          const run = () => {
            if (!active) return; // cambió el breakpoint mientras cargaba la fuente: el siguiente ya lo muestra
            const split = splitLinesAndChars(h3);
            h3.style.opacity = "1";
            const stop = scramble(split.chars);
            cleanups.push(() => {
              stop();
              split.revert();
            });
          };
          // Partir en líneas con la tipografía final, no con la de respaldo
          if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(run);
          else run();
        };

        names.forEach((h3) => {
          if (reduce || played.has(h3)) show(h3);
        });
        const pendingNames = names.filter((h3) => !played.has(h3));

        if (desktop) {
          pendingNames.forEach((h3) => {
            ScrollTrigger.create({ trigger: h3, start: "top 85%", once: true, onEnter: () => play(h3) });
          });
        } else if (pendingNames.length) {
          // En el carrusel, además de entrar en pantalla, el nombre tiene que
          // estar a la vista en horizontal: IntersectionObserver ve las dos cosas
          const io = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                const h3 = entry.target as HTMLElement;
                if (entry.isIntersecting) {
                  io.unobserve(h3);
                  play(h3);
                } else if (entry.boundingClientRect.bottom < 0) {
                  // Ya quedó arriba (p. ej. al recargar a mitad de página)
                  io.unobserve(h3);
                  show(h3);
                }
              }
            },
            { rootMargin: "0px 0px -15% 0px", threshold: 0.6 },
          );
          pendingNames.forEach((h3) => io.observe(h3));
          cleanups.push(() => io.disconnect());
        }

        // ---------- Tarjeta fija: cortina (desktop) ----------
        if (desktop) {
          layers.forEach((layer, i) => {
            const block = blocks[i];
            if (i === 0 || !block) return;
            const inner = layer.querySelector<HTMLElement>("[data-layer-inner]");

            if (reduce) {
              gsap.fromTo(
                layer,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 0.35,
                  ease: "none",
                  scrollTrigger: { trigger: block, start: CROSSFADE_AT, toggleActions: "play none none reverse" },
                },
              );
              return;
            }

            // y: 0 descarta el translate del CSS inicial (si no, GSAP lo sumaría al yPercent)
            gsap.set(layer, { y: 0, yPercent: 100 });
            gsap.set(inner, { y: 0, yPercent: -100 });
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: block, ...CURTAIN, scrub: true },
              })
              .to(layer, { yPercent: 0 }, 0)
              .to(inner, { yPercent: 0 }, 0);
          });
        }

        // ---------- Videos: el primero de una vez, el resto al acercarse ----------
        if (!reduce) {
          if (desktop) {
            layers.forEach((layer, i) => {
              const video = layer.querySelector("video");
              if (!video) return;
              if (i === 0) loadVideo(video);
              else
                ScrollTrigger.create({ trigger: blocks[i], start: "top 150%", once: true, onEnter: () => loadVideo(video) });
            });
          } else {
            const videos = blocks.map((b) => b.querySelector("video")).filter((v): v is HTMLVideoElement => !!v);
            if (videos.length) {
              const io = new IntersectionObserver(
                (entries) =>
                  entries.forEach((e) => {
                    if (!e.isIntersecting) return;
                    io.unobserve(e.target);
                    loadVideo(e.target as HTMLVideoElement);
                  }),
                { rootMargin: "50% 0px" },
              );
              videos.forEach((v) => io.observe(v));
              cleanups.push(() => io.disconnect());
            }
          }
        }

        // ---------- Carrusel (mobile): que se pueda recorrer con el teclado ----------
        if (!desktop && list) {
          list.tabIndex = 0;
          cleanups.push(() => list.removeAttribute("tabindex"));
        }

        return () => cleanups.forEach((fn) => fn());
      });

      // Recalcular posiciones cuando cargan las imágenes y la tipografía
      let refreshTimer: number | undefined;
      const refresh = () => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => {
          if (!cancelled) ScrollTrigger.refresh();
        }, 120);
      };
      root.querySelectorAll("img").forEach((img) => {
        if (!img.complete) img.addEventListener("load", refresh, { once: true });
      });
      document.fonts?.ready.then(refresh);

      dispose = () => {
        window.clearTimeout(refreshTimer);
        mm.revert();
      };
    })();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className="visually-hidden">
        {teamLabel}
      </h2>
      <div className={styles.grid}>
        {/* Tarjeta fija (solo desktop): una capa por cofundador */}
        <div className={styles.aside}>
          <div className={styles.card}>
            {rows.map((row, i) => (
              <div key={row.id} className={styles.layer} data-layer>
                <div className={styles.layerInner} data-layer-inner>
                  <Media row={row} only="desktop" first={i === 0} />
                </div>
              </div>
            ))}
          </div>
          <p className={styles.label} aria-hidden="true">
            {teamLabel}
          </p>
        </div>

        <div className={styles.list} data-list>
          {rows.map((row) => (
            <article key={row.id} id={row.id} className={styles.block} data-block>
              <div className={styles.blockMedia}>
                <Media row={row} only="mobile" />
              </div>
              <h3 className={styles.name} aria-label={row.title} data-name>
                {row.title}
              </h3>
              {row.role && (
                <p className={styles.role} style={{ color: row.color }}>
                  {row.role}
                </p>
              )}
              <p className={styles.bio} dangerouslySetInnerHTML={{ __html: row.body }} />
            </article>
          ))}
          {/* Deja la última tarjeta fija un rato antes de soltar la sección */}
          <div className={styles.spacer} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
