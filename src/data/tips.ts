import type { Locale } from "@/i18n";
import { aboutHeroText } from "./team";

/**
 * Contenido de "Nuestros tips" (Wireframe 7 del diseño), por idioma.
 * Las tarjetas del wireframe son marcadores de posición: título y etiquetas
 * genéricas y un bloque amarillo en lugar de imagen.
 */

export type Tip = {
  id: string;
  title: string;
  tags: string[];
  href: string;
  /** Imagen opcional; si no hay, se muestra el bloque amarillo del diseño */
  image?: string;
  featured?: boolean;
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
  tips: Tip[];
  follow: SocialWallContent;
};

const makeTips = (title: string, tags: string[]): Tip[] => [
  { id: "tip-destacado", title, tags, href: "#", featured: true },
  { id: "tip-1", title, tags, href: "#" },
  { id: "tip-2", title, tags, href: "#" },
  { id: "tip-3", title, tags, href: "#" },
];

export const tipsContent: Record<Locale, TipsContent> = {
  es: {
    meta: { title: "Nuestros tips", description: aboutHeroText.es.slice(0, 155) },
    hero: { title: "Nuestros tips", text: aboutHeroText.es },
    gridLabel: "Artículos y tips",
    tips: makeTips("Tips sobre algo súper importante en COM política", ["Etiqueta", "Etiqueta 2", "Etiqueta 3"]),
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
    meta: { title: "Our tips", description: aboutHeroText.en.slice(0, 155) },
    hero: { title: "Our tips", text: aboutHeroText.en },
    gridLabel: "Articles and tips",
    tips: makeTips("Tips on something super important in political communication", ["Tag", "Tag 2", "Tag 3"]),
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
