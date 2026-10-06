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
    /** Etiqueta accesible de la ruleta de nombres */
    wheelLabel: string;
    /** Prefijo del enlace del post al caso: "Ver el caso de Sergio Fajardo" */
    viewCase: string;
    /** Orden de la ruleta, de arriba abajo */
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
        "Ayudamos a <em>instituciones, gobiernos y liderazgos</em> a comunicar lo que hacen de forma que la gente lo entienda.",
        "Analizamos el contexto, definimos a quién le hablamos y qué está en juego, y sobre esa base <em>construimos la estrategia, la narrativa y los canales</em>: en medios, en el territorio y en lo digital.",
      ],
    },
    servicios: { heading: "Servicios" },
    distintos: {
      title: "Lo que nos hace distintos",
      items: [
        {
          title: "Especialización en comunicación política",
          html: "Entendemos el poder, las instituciones, la opinión pública y el contexto antes de comunicar. Eso nos permite construir estrategias que no se quedan en el marketing, sino que <strong>acercan ideas, servicios y derechos a la gente.</strong>",
        },
        {
          title: "De la estrategia a la publicación",
          html: "<strong>Conectamos toda la cadena en un mismo equipo:</strong> diagnóstico, estrategia, concepto creativo, guion, producción, edición y publicación. Así, las ideas no se quedan en una presentación y los contenidos responden siempre a un objetivo.",
        },
        {
          title: "Profundidad con lenguaje digital",
          html: "Convertimos propuestas, datos y temas complejos en contenidos claros, atractivos y fáciles de entender, <strong>sin volverlos superficiales.</strong>",
        },
      ],
    },
    casosPreview: {
      title: "Casos de éxito",
      wheelLabel: "Elige un caso de éxito",
      viewCase: "Ver el caso de",
      cases: [
        {
          ...casosVisual.gomez,
          likedBy: "Liked by sonanteagencia and others",
          caption: "Construimos una voz que hoy es referente del análisis político en Colombia, sin perder el alcance y la agilidad de las redes.",
          imageAlt: "Luis Ernesto Gómez en una publicación de Instagram",
        },
        {
          ...casosVisual.fajardo,
          likedBy: "Liked by sonanteagencia and 3M others",
          caption: "Se consolidó como un referente del manejo de redes sociales en política, sumando una comunidad de casi 3.5 millones de seguidores.",
          imageAlt: "Sergio Fajardo en una publicación de Instagram",
        },
        {
          ...casosVisual.pabon,
          likedBy: "Liked by sonanteagencia and others",
          caption: "Acompañamos la campaña regional y la gestión de la Prefectura de Pichincha, Ecuador.",
          imageAlt: "Paola Pabón en una publicación de Instagram",
        },
      ],
    },
    contact: { title: "¿Quieres que hablemos?" },
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
        "We help <em>institutions, governments and leaders</em> communicate what they do in a way people understand.",
        "We analyze the context, define who we're talking to and what's at stake, and on that basis <em>we build the strategy, the narrative and the channels</em>: in the media, on the ground and online.",
      ],
    },
    servicios: { heading: "Services" },
    distintos: {
      title: "What makes us different",
      items: [
        {
          title: "Specialists in political communication",
          html: "We understand power, institutions, public opinion and context before we communicate. That lets us build strategies that go beyond marketing and <strong>bring ideas, services and rights closer to people.</strong>",
        },
        {
          title: "From strategy to publishing",
          html: "<strong>We connect the whole chain within one team:</strong> diagnosis, strategy, creative concept, script, production, editing and publishing. That way ideas don't get stuck in a slide deck, and every piece of content serves a goal.",
        },
        {
          title: "Depth in a digital language",
          html: "We turn proposals, data and complex issues into clear, engaging, easy-to-understand content <strong>without making them shallow.</strong>",
        },
      ],
    },
    casosPreview: {
      title: "Success stories",
      wheelLabel: "Choose a success story",
      viewCase: "See the case of",
      cases: [
        {
          ...casosVisual.gomez,
          likedBy: "Liked by sonanteagencia and others",
          caption: "We built a voice that is now a benchmark for political analysis in Colombia, without losing the reach and agility of social media.",
          imageAlt: "Luis Ernesto Gómez in an Instagram post",
        },
        {
          ...casosVisual.fajardo,
          likedBy: "Liked by sonanteagencia and 3M others",
          caption: "He established himself as a benchmark for social media in politics, building a community of nearly 3.5 million followers.",
          imageAlt: "Sergio Fajardo in an Instagram post",
        },
        {
          ...casosVisual.pabon,
          likedBy: "Liked by sonanteagencia and others",
          caption: "We supported the regional campaign and the administration of the Prefecture of Pichincha, Ecuador.",
          imageAlt: "Paola Pabón in an Instagram post",
        },
      ],
    },
    contact: { title: "Want to talk?" },
  },
};
