import InstagramPost from "@/components/shared/InstagramPost";
import XPost from "./XPost";
import TweetCard from "./TweetCard";
import { tipsContent } from "@/data/tips";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import styles from "./SocialWall.module.css";

type Props = { lang?: Locale };

/**
 * Bloque "No te pierdas de nada / Síguenos" con tres columnas de maquetas de
 * publicaciones (frames 134:774 y 69:2642).
 */
export default function SocialWall({ lang = "es" }: Props) {
  const { follow } = tipsContent[lang];
  const verified = ui[lang].a11y.verified;

  return (
    <section className={styles.section} aria-labelledby="follow-title">
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <h2 id="follow-title" className={`t-h1 ${styles.title}`}>
            {follow.title}
          </h2>
          <p className={`t-h4 ${styles.kicker}`}>{follow.kicker}</p>
        </header>

        <div className={styles.wall}>
          <InstagramPost
            size="md"
            handle={follow.igPost.handle}
            avatar="/assets/img/ig-avatar-sonante.png"
            image="/assets/img/ig-post-1.png"
            imageAlt={follow.igPost.imageAlt}
            subtitle={follow.igPost.subtitle}
            likedBy={follow.igPost.likedBy}
            caption={follow.igPost.caption}
            date={follow.igPost.date}
            verifiedLabel={verified}
          />
          <InstagramPost
            size="md"
            aspect="reel"
            handle={follow.igReel.handle}
            avatar="/assets/img/ig-avatar-sonante.png"
            image="/assets/img/ig-post-2.png"
            imageAlt={follow.igReel.imageAlt}
            subtitle={follow.igReel.subtitle}
            verifiedLabel={verified}
          />
          <div className={styles.column}>
            <XPost lang={lang} />
            <TweetCard lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
