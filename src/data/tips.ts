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

/**
 * Muro "No te pierdas de nada": las 3 últimas publicaciones de Instagram, tomadas
 * de src/data/social-feed.json (npm run social). Las maquetas de `placeholders`
 * solo se ven mientras ese archivo no tenga publicaciones.
 */
export type SocialWallContent = {
  title: string;
  kicker: string;
  /** Usuario que se muestra mientras no haya datos reales */
  handle: string;
  /** La cuenta tiene la insignia azul (la API no lo informa) */
  verified: boolean;
  placeholders: { image: string; caption: string }[];
  labels: {
    /** "345 Me gusta" */
    likes: (count: string) => string;
    imageAlt: string;
    viewPost: string;
    seeProfile: string;
  };
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
      handle: "sonanteagencia",
      verified: true,
      placeholders: [
        { image: "/assets/img/ig-post-1.png", caption: "¿Cómo es trabajar con Sergio Fajardo?" },
        { image: "/assets/img/ig-post-2.png", caption: "Sí, asesoramos a Sergio Fajardo en su estrategia de redes." },
        { image: "/assets/img/x-media.png", caption: "Hoy más que nunca: Colombia, ¡Adelante! 🇨🇴" },
      ],
      labels: {
        likes: (count) => `${count} Me gusta`,
        imageAlt: "Publicación de Sonante en Instagram",
        viewPost: "Ver publicación en Instagram",
        seeProfile: "Seguir a Sonante en Instagram",
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
      handle: "sonanteagencia",
      verified: true,
      placeholders: [
        { image: "/assets/img/ig-post-1.png", caption: "What is it like to work with Sergio Fajardo?" },
        { image: "/assets/img/ig-post-2.png", caption: "Yes, we advise Sergio Fajardo on his social media strategy." },
        { image: "/assets/img/x-media.png", caption: "Now more than ever: Colombia, onward! 🇨🇴" },
      ],
      labels: {
        likes: (count) => `${count} likes`,
        imageAlt: "Sonante post on Instagram",
        viewPost: "View post on Instagram",
        seeProfile: "Follow Sonante on Instagram",
      },
    },
  },
};
