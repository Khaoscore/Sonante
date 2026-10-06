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
  caption?: ReactNode;
  date?: string;
  /** Formato del medio: cuadrado (post) o vertical (reel) */
  aspect?: "square" | "reel";
  /** lg = 508 px de referencia (home); md = 387 px (tips) */
  size?: "lg" | "md";
  className?: string;
};

/**
 * Maqueta de publicación de Instagram usada como pieza gráfica en el home y en
 * "Nuestros tips". Es decorativa: no se conecta con la API de Instagram.
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
  caption,
  date,
  aspect = "square",
  size = "lg",
  className = "",
}: InstagramPostProps) {
  const style = { "--s": size === "lg" ? 1 : 0.7616 } as CSSProperties;

  return (
    <figure className={`${styles.post} ${className}`} style={style}>
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

      <div className={`${styles.media} ${aspect === "reel" ? styles.reel : ""}`}>
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
              <span className={styles.likedAvatars}>
                <img src="/assets/img/ig-liked-1.png" alt="" />
                <img src="/assets/img/ig-liked-2.png" alt="" />
                <img src="/assets/img/ig-liked-3.png" alt="" />
              </span>
              <strong>{likedBy}</strong>
            </p>
          )}
          {caption && (
            <p className={styles.caption}>
              <strong>{handle}</strong>
              <br />
              {caption}
            </p>
          )}
          {date && <p className={styles.date}>{date}</p>}
        </figcaption>
      )}
    </figure>
  );
}
