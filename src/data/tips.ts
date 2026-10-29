import type { Locale } from "@/i18n";

/**
 * Contenido de "Nuestros tips" (Wireframe 7 del diseño), por idioma.
 * Las tarjetas salen de los artículos del blog (blog-sonante/articulos/*.md),
 * que se cargan en src/content.config.ts; aquí quedan los textos de la página.
 */

export type Tip = {
  id: string;
  title: string;
  /** Categoría del artículo: primera píldora de la tarjeta, resaltada */
  category?: string;
  tags: string[];
  href: string;
  /** Imagen opcional; si no hay, se muestra el bloque amarillo del diseño */
  image?: string;
  featured?: boolean;
};

/** Textos de la plantilla de artículo */
export type ArticleLabels = {
  back: string;
  by: string;
  readingTime: (min: number) => string;
  photo: string;
  toc: string;
  tags: string;
  share: string;
  shareOn: (network: string) => string;
  related: string;
  allTips: string;
  draft: string;
};

export type SocialWallContent = {
  title: string;
  kicker: string;
  igPost: { handle: string; subtitle: string; likedBy: string; caption: string; date: string; imageAlt: string };
  igReel: { handle: string; subtitle: string; imageAlt: string };
  xPost: { name: string; handle: string; subscribe: string; text: string; time: string; date: string; views: string };
  tweet: { name: string; handle: string; text: string };
};

export type TipsContent = {
  meta: { title: string; description: string };
  hero: { title: string; text: string };
  gridLabel: string;
  /** Aviso opcional sobre la rejilla (p. ej. artículos solo en español) */
  gridNote?: string;
  article: ArticleLabels;
  follow: SocialWallContent;
};

/** Texto del hero (frame 45:1853), también usado como meta description */
const heroText: Record<Locale, string> = {
  es: "Consejos para quienes están construyendo su presencia digital, aprendizajes de campañas y análisis de estrategias que ya funcionaron para entender qué puedes aplicar en la tuya.",
  en: "Advice for anyone building their digital presence, lessons from our campaigns and breakdowns of strategies that already worked, so you can see what to apply to yours.",
};

export const tipsContent: Record<Locale, TipsContent> = {
  es: {
    meta: { title: "Nuestros tips", description: heroText.es },
    hero: { title: "Todo lo que nos hubiera gustado saber antes de empezar", text: heroText.es },
    gridLabel: "Artículos y tips",
    article: {
      back: "Nuestros tips",
      by: "Por",
      readingTime: (min) => `${min} min de lectura`,
      photo: "Foto",
      toc: "En este artículo",
      tags: "Etiquetas",
      share: "Compartir",
      shareOn: (network) => `Compartir en ${network}`,
      related: "Sigue leyendo",
      allTips: "Ver todos los tips",
      draft: "Borrador: este artículo está marcado como incompleto y no se publica en producción.",
    },
    follow: {
      title: "No te pierdas de nada",
      kicker: "Síguenos",
      igPost: {
        handle: "sonanteagencia",
        subtitle: "Ram Sanap • Soulful Company",
        likedBy: "Liked by khaoscore_____ and 345 others",
        caption: "Profesor, administrador y muy pronto...",
        date: "Septiembre 23",
        imageAlt: "Publicación de Sonante en Instagram",
      },
      igReel: { handle: "sonanteagencia", subtitle: "Ram Sanap • Soulful Company", imageAlt: "Reel de Sonante en Instagram" },
      xPost: {
        name: "sonanteagencia",
        handle: "@sonante_agencia",
        subscribe: "Suscribirse",
        text: "Hoy más que nunca: Colombia, ¡Adelante! 🇨🇴",
        time: "12:00 PM",
        date: "14 oct 2023",
        views: "200.1K vistas",
      },
      tweet: {
        name: "sonanteagencia",
        handle: "@sonante_agencia",
        text: "Transformamos las redes de políticos, empresas y marcas personales en referentes digitales.",
      },
    },
  },
  en: {
    meta: { title: "Our tips", description: heroText.en },
    hero: { title: "Everything we wish we'd known before we started", text: heroText.en },
    gridLabel: "Articles and tips",
    gridNote: "Our articles are currently published in Spanish.",
    article: {
      back: "Our tips",
      by: "By",
      readingTime: (min) => `${min} min read`,
      photo: "Photo",
      toc: "In this article",
      tags: "Tags",
      share: "Share",
      shareOn: (network) => `Share on ${network}`,
      related: "Keep reading",
      allTips: "See all tips",
      draft: "Draft: this article is marked as incomplete and is not published in production.",
    },
    follow: {
      title: "Don't miss a thing",
      kicker: "Follow us",
      igPost: {
        handle: "sonanteagencia",
        subtitle: "Ram Sanap • Soulful Company",
        likedBy: "Liked by khaoscore_____ and 345 others",
        caption: "Professor, administrator and very soon...",
        date: "September 23",
        imageAlt: "Sonante post on Instagram",
      },
      igReel: { handle: "sonanteagencia", subtitle: "Ram Sanap • Soulful Company", imageAlt: "Sonante reel on Instagram" },
      xPost: {
        name: "sonanteagencia",
        handle: "@sonante_agencia",
        subscribe: "Subscribe",
        text: "Now more than ever: Colombia, onward! 🇨🇴",
        time: "12:00 PM",
        date: "Oct 14, 2023",
        views: "200.1K Views",
      },
      tweet: {
        name: "sonanteagencia",
        handle: "@sonante_agencia",
        text: "We turn politicians, companies and personal brands into leading voices on social media.",
      },
    },
  },
};
