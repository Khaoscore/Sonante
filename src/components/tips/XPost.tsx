import { tipsContent } from "@/data/tips";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import styles from "./XPost.module.css";

type Props = { lang?: Locale };

/**
 * Maqueta de publicación en X (frame 69:2736): decorativa, sin conexión a la API.
 */
export default function XPost({ lang = "es" }: Props) {
  const x = tipsContent[lang].follow.xPost;
  const a11y = ui[lang].a11y;

  return (
    <figure className={styles.post}>
      <header className={styles.header}>
        <img src="/assets/img/x-avatar.png" alt="" className={styles.avatar} width={46} height={48} loading="lazy" />
        <div className={styles.meta}>
          <p className={styles.name}>{x.name}</p>
          <p className={styles.handle}>{x.handle}</p>
        </div>
        <img src="/assets/icons/icon-x-logo.svg" alt="X" className={styles.logo} />
        <span className={styles.subscribe}>{x.subscribe}</span>
        <img src="/assets/icons/icon-x-more.svg" alt="" className={styles.more} />
      </header>

      <p className={styles.text}>{x.text}</p>

      <div className={styles.media}>
        <img src="/assets/img/x-media.png" alt={a11y.xPostAlt} loading="lazy" decoding="async" />
      </div>

      <p className={styles.info}>
        <span>{x.time}</span>
        <img src="/assets/icons/icon-dot.svg" alt="" />
        <span>{x.date}</span>
        <img src="/assets/icons/icon-dot.svg" alt="" />
        <span>{x.views}</span>
      </p>

      <ul className={styles.actions}>
        <li>
          <img src="/assets/icons/icon-x-comment.svg" alt={a11y.xComments} />
          <span>991</span>
        </li>
        <li>
          <img src="/assets/icons/icon-x-repost.svg" alt={a11y.xReposts} />
          <span>1,581</span>
        </li>
        <li>
          <img src="/assets/icons/icon-x-like.svg" alt={a11y.xLikes} />
          <span>9,867</span>
        </li>
        <li>
          <img src="/assets/icons/icon-x-bookmark.svg" alt={a11y.xBookmarks} />
          <span>90</span>
        </li>
        <li>
          <img src="/assets/icons/icon-x-share.svg" alt={a11y.xShare} />
        </li>
      </ul>
    </figure>
  );
}
