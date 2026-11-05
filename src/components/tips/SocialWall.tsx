import InstagramPost from "@/components/shared/InstagramPost";
import { social } from "@/data/site";
import { tipsContent } from "@/data/tips";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import { compactNumber, oneLine, postDate, socialFeed } from "@/lib/social";
import styles from "./SocialWall.module.css";

type Props = { lang?: Locale };

/** Número de publicaciones del muro */
const POSTS = 3;

/**
 * Bloque "No te pierdas de nada / Síguenos" (frames 134:774 y 69:2642): las 3
 * últimas publicaciones de Instagram, tomadas de src/data/social-feed.json
 * (npm run social), cada una enlazada a la publicación. Mientras no haya datos
 * se ven las maquetas del diseño, enlazadas al perfil.
 */
export default function SocialWall({ lang = "es" }: Props) {
  const { follow } = tipsContent[lang];
  const { labels } = follow;
  const profile = social.find((s) => s.id === "instagram")?.href ?? "";

  const feed = socialFeed.instagram;
  const posts = (feed?.posts ?? []).filter((p) => p.image).slice(0, POSTS);
  const common = {
    size: "md" as const,
    aspect: "portrait" as const,
    handle: feed?.username ?? follow.handle,
    avatar: feed?.avatar ?? "/assets/img/ig-avatar-sonante.png",
    imageAlt: labels.imageAlt,
    verified: follow.verified,
    verifiedLabel: ui[lang].a11y.verified,
    likedAvatars: false,
    clampCaption: true,
    className: styles.post,
  };

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
          {posts.length > 0
            ? posts.map((post) => (
                <InstagramPost
                  key={post.id}
                  {...common}
                  image={post.image!.src}
                  likedBy={post.likes ? labels.likes(compactNumber(post.likes, lang)) : undefined}
                  caption={oneLine(post.caption) || undefined}
                  date={postDate(post.timestamp, lang)}
                  href={post.permalink}
                  linkLabel={labels.viewPost}
                />
              ))
            : follow.placeholders.map((mock) => (
                <InstagramPost
                  key={mock.image}
                  {...common}
                  image={mock.image}
                  caption={mock.caption}
                  href={profile}
                  linkLabel={labels.seeProfile}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
