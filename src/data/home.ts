import type { Locale } from "@/i18n";

/**
 * Contenido del home (Wireframe 1) por idioma.
 * Los campos `html` admiten <em> / <strong> tal como en Figma.
 */

export type DistintoItem = { title: string; html: string };

/** Caso de la ruleta del home y su post de Instagram (maqueta decorativa) */
export type CasoPreview = {
  /** Ancla del caso en la página "Casos de éxito" */
  id: string;
  name: string;
  handle: string;
  avatar: string;
  image: string;
  imageAlt: string;
  likedBy: string;
  caption: string;
};

export type HomeContent = {
  meta: { title: string; description: string };
  hero: { title: string; subtitle: string; cta: string };
  marquee: { ariaLabel: string; phrases: string[] };
  intro: { ariaLabel: string; paragraphs: string[] };
  servicios: { heading: string };
  distintos: { title: string; items: DistintoItem[] };
  casosPreview: {
    title: string;
    /** Etiquetas accesibles de las flechas del carrusel */
    prevLabel: string;
    nextLabel: string;
    /** Prefijo del enlace del post al caso: "Ver el caso de Sergio Fajardo" */
    viewCase: string;
    /** Orden del carrusel, de izquierda a derecha */
    cases: CasoPreview[];
  };
  contact: { title: string };
};

/**
 * Parte visual de la ruleta, común a todos los idiomas.
 * PENDIENTE: los posts de Gómez y Pabón usan las fotos de la página de casos
 * como provisionales; reemplazar por los posts reales que elija el cliente.
 */
const casosVisual = {
  gomez: {
    id: "gomez",
    name: "Luis E. Gómez",
    handle: "luisernestogl",
    avatar: "/assets/img/ig-avatar-gomez.png",
    image: "/assets/img/ig-post-gomez.jpg",
  },
  fajardo: {
    id: "fajardo",
    name: "Sergio Fajardo",
    handle: "sergiofajardovalderrama",
    avatar: "/assets/img/ig-avatar-fajardo.png",
    image: "/assets/img/ig-post-fajardo.jpg",
  },
  pabon: {
    id: "pabon",
    name: "Paola Pabón",
    handle: "paolapabonc",
    avatar: "/assets/img/ig-avatar-pabon.png",
    image: "/assets/img/ig-post-pabon.jpg",
  },
};

export const home: Record<Locale, HomeContent> = {
  es: {
    meta: {
      title: "Sonante",
      description: "Transformamos las redes de políticos, empresas y marcas personales en referentes digitales.",
    },
    hero: {
      title: "Sabemos de redes porque no conocemos un mundo sin ellas",
      subtitle: "Transformamos las redes de políticos, empresas y marcas personales en referentes digitales.",
      cta: "Escríbenos",
    },
    marquee: {
      ariaLabel: "Quiénes somos en una frase",
      phrases: [
        "Somos personas que construyen comunidades",
      ],
    },
    intro: {
      ariaLabel: "Qué hacemos",
      paragraphs: [
        "Entendemos lo que cada cliente necesita comunicar y <em>lo traducimos al lenguaje, los códigos y los formatos</em> con los que hoy las audiencias se informan, conversan y construyen opinión.",
        "Hacemos simple lo complejo sin perder el fondo. <em>Porque para conectar con la gente, hay que hablar en el formato de la gente.</em>",
      ],
    },
    servicios: { heading: "Servicios" },
    distintos: {
      title: "Así trabajamos",
      items: [
        {
          title: "Leemos lo que está pasando",
          html: "Seguimos la conversación pública, las tendencias y el desempeño digital <strong>para detectar oportunidades y tomar decisiones con contexto.</strong>",
        },
        {
          title: "De la estrategia a las redes",
          html: "Desarrollamos conceptos, guiones y formatos y los llevamos a producción audiovisual <strong>para convertir la estrategia en contenidos pensados para funcionar en digital.</strong>",
        },
        {
          title: "Medimos para tomar mejores decisiones",
          html: "Seguimos el rendimiento de los contenidos y los canales <strong>para entender qué funciona, reforzarlo y ajustar con rapidez cuando los resultados lo exigen.</strong>",
        },
      ],
    },
    casosPreview: {
      title: "Casos de éxito",
      prevLabel: "Caso anterior",
      nextLabel: "Caso siguiente",
      viewCase: "Ver el caso de",
      cases: [
        {
          ...casosVisual.pabon,
          likedBy: "Liked by sonanteagencia and others",
          caption: "Acompañamos la campaña regional y la gestión de la Prefectura de Pichincha, Ecuador.",
          imageAlt: "Paola Pabón en una publicación de Instagram",
        },
        {
          ...casosVisual.fajardo,
          likedBy: "Liked by sonanteagencia and 3M others",
          caption: "Se consolidó como un referente del manejo de redes sociales en política, sumando una comunidad de casi 3.5 millones de seguidores.",
          imageAlt: "Sergio Fajardo en una publicación de Instagram",
        },
        {
          ...casosVisual.gomez,
          likedBy: "Liked by sonanteagencia and others",
          caption: "Construimos una voz que hoy es referente del análisis político en Colombia, sin perder el alcance y la agilidad de las redes.",
          imageAlt: "Luis Ernesto Gómez en una publicación de Instagram",
        },
      ],
    },
    contact: { title: "Hablemos de tu proyecto" },
  },
  en: {
    meta: {
      title: "Sonante",
      description: "We turn politicians, companies and personal brands into leading voices on social media.",
    },
    hero: {
      title: "We know social media because we've never known a world without it",
      subtitle: "We turn politicians, companies and personal brands into leading voices on social media.",
      cta: "Write to us",
    },
    marquee: {
      ariaLabel: "Who we are in one sentence",
      phrases: [
        "We are people who build communities",
      ],
    },
    intro: {
      ariaLabel: "What we do",
      paragraphs: [
        "We understand what each client needs to communicate and <em>translate it into the language, codes and formats</em> that audiences use today to get informed, talk and form opinions.",
        "We make the complex simple without losing the substance. <em>Because to connect with people, you have to speak in their format.</em>",
      ],
    },
    servicios: { heading: "Services" },
    distintos: {
      title: "How we work",
      items: [
        {
          title: "We read what's happening",
          html: "We follow the public conversation, trends and digital performance <strong>to spot opportunities and make decisions with context.</strong>",
        },
        {
          title: "From strategy to social media",
          html: "We develop concepts, scripts and formats and take them to audiovisual production <strong>to turn strategy into content designed to work in digital.</strong>",
        },
        {
          title: "We measure to make better decisions",
          html: "We track the performance of content and channels <strong>to understand what works, strengthen it and adjust quickly when results demand it.</strong>",
        },
      ],
    },
    casosPreview: {
      title: "Success stories",
      prevLabel: "Previous story",
      nextLabel: "Next story",
      viewCase: "See the case of",
      cases: [
        {
          ...casosVisual.pabon,
          likedBy: "Liked by sonanteagencia and others",
          caption: "We supported the regional campaign and the administration of the Prefecture of Pichincha, Ecuador.",
          imageAlt: "Paola Pabón in an Instagram post",
        },
        {
          ...casosVisual.fajardo,
          likedBy: "Liked by sonanteagencia and 3M others",
          caption: "He established himself as a benchmark for social media in politics, building a community of nearly 3.5 million followers.",
          imageAlt: "Sergio Fajardo in an Instagram post",
        },
        {
          ...casosVisual.gomez,
          likedBy: "Liked by sonanteagencia and others",
          caption: "We built a voice that is now a benchmark for political analysis in Colombia, without losing the reach and agility of social media.",
          imageAlt: "Luis Ernesto Gómez in an Instagram post",
        },
      ],
    },
    contact: { title: "Let's talk about your project" },
  },
};
