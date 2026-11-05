import type { CSSProperties, ReactNode } from "react";
import styles from "./InstagramPost.module.css";

export type InstagramPostProps = {
  handle: string;
  avatar: string;
  image: string;
  imageAlt?: string;
  /** Línea secundaria bajo el usuario (p. ej. audio del reel) */
  subtitle?: string;
  verified?: boolean;
  /** Texto alternativo de la insignia de verificación */
  verifiedLabel?: string;
  likedBy?: string;
  /** Avatares de "les gusta a…" junto a likedBy (solo en las maquetas) */
  likedAvatars?: boolean;
  caption?: ReactNode;
  /** Recorta el caption a dos líneas (captions reales, que pueden ser largos) */
  clampCaption?: boolean;
  date?: string;
  /** Formato del medio: cuadrado (post), vertical del diseño (reel) o 4:5 (feed actual de Instagram) */
  aspect?: "square" | "reel" | "portrait";
  /** lg = 508 px de referencia (home); md = 387 px (tips) */
  size?: "lg" | "md";
  /** Enlace a la publicación: toda la tarjeta se vuelve clicable */
  href?: string;
  /** Nombre accesible del enlace (p. ej. "Ver publicación en Instagram") */
  linkLabel?: string;
  className?: string;
};

/**
 * Publicación de Instagram con el diseño de la librería. En el home es una pieza
 * gráfica; en "Nuestros tips" muestra los posts reales de src/data/social-feed.json
 * (con `href` a la publicación) o, sin datos, la maqueta del diseño.
 */
export default function InstagramPost({
  handle,
  avatar,
  image,
  imageAlt = "",
  subtitle,
  verified = true,
  verifiedLabel = "Verificado",
  likedBy,
  likedAvatars = true,
  caption,
  clampCaption = false,
  date,
  aspect = "square",
  size = "lg",
  href,
  linkLabel,
  className = "",
}: InstagramPostProps) {
  const style = { "--s": size === "lg" ? 1 : 0.7616 } as CSSProperties;

  return (
    <figure className={`${styles.post} ${href ? styles.linked : ""} ${className}`} style={style}>
      <header className={styles.header}>
        <img src={avatar} alt="" className={styles.avatar} width={46} height={46} loading="lazy" />
        <div className={styles.meta}>
          <p className={styles.handle}>
            <span>{handle}</span>
            {verified && <img src="/assets/icons/icon-verified.svg" alt={verifiedLabel} className={styles.verified} />}
          </p>
          {subtitle && (
            <p className={styles.subtitle}>
              <img src="/assets/icons/icon-ig-audio-1.svg" alt="" className={styles.audio} />
              <span>{subtitle}</span>
            </p>
          )}
        </div>
        <img src="/assets/icons/icon-more.svg" alt="" className={styles.more} />
      </header>

      <div className={`${styles.media} ${aspect !== "square" ? styles[aspect] : ""}`}>
        <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
        <img src="/assets/icons/icon-tagged.svg" alt="" className={styles.tagged} />
        <img src="/assets/icons/icon-volume.svg" alt="" className={styles.volume} />
      </div>

      <div className={styles.actions}>
        <div className={styles.actionsLeft}>
          <img src="/assets/icons/icon-ig-like.svg" alt="" />
          <img src="/assets/icons/icon-ig-comment.svg" alt="" />
          <img src="/assets/icons/icon-ig-share.svg" alt="" />
        </div>
        <img src="/assets/icons/icon-ig-save.svg" alt="" className={styles.save} />
      </div>

      {(likedBy || caption || date) && (
        <figcaption className={styles.body}>
          {likedBy && (
            <p className={styles.liked}>
              {likedAvatars && (
                <span className={styles.likedAvatars}>
                  <img src="/assets/img/ig-liked-1.png" alt="" />
                  <img src="/assets/img/ig-liked-2.png" alt="" />
                  <img src="/assets/img/ig-liked-3.png" alt="" />
                </span>
              )}
              <strong>{likedBy}</strong>
            </p>
          )}
          {caption && (
            <p className={`${styles.caption} ${clampCaption ? styles.clamp : ""}`}>
              <strong>{handle}</strong>
              <br />
              {caption}
            </p>
          )}
          {date && <p className={styles.date}>{date}</p>}
        </figcaption>
      )}

      {href && (
        <a className={styles.stretched} href={href} target="_blank" rel="noopener noreferrer" aria-label={linkLabel} />
      )}
    </figure>
  );
}
