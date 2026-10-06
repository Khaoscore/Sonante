import { tipsContent } from "@/data/tips";
import type { Locale } from "@/i18n";
import styles from "./TweetCard.module.css";

type Props = { lang?: Locale };

/**
 * Maqueta compacta de publicación (frame 69:2773 "Twitter Post"): decorativa.
 */
export default function TweetCard({ lang = "es" }: Props) {
  const tw = tipsContent[lang].follow.tweet;

  return (
    <figure className={styles.card}>
      <header className={styles.author}>
        <img src="/assets/img/tw-avatar.png" alt="" className={styles.avatar} width={49} height={49} loading="lazy" />
        <div>
          <p className={styles.name}>{tw.name}</p>
          <p className={styles.handle}>{tw.handle}</p>
        </div>
        <span className={styles.dots} aria-hidden="true">
          <img src="/assets/icons/icon-tw-dot.svg" alt="" />
          <img src="/assets/icons/icon-tw-dot.svg" alt="" />
          <img src="/assets/icons/icon-tw-dot.svg" alt="" />
        </span>
      </header>
      <p className={styles.text}>{tw.text}</p>
      <div className={styles.icons} aria-hidden="true">
        <img src="/assets/icons/icon-heart.svg" alt="" />
        <img src="/assets/icons/icon-message-square.svg" alt="" />
        <img src="/assets/icons/icon-share.svg" alt="" />
      </div>
    </figure>
  );
}
