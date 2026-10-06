import type { Locale } from "@/i18n";

/**
 * Contenido de la página "Casos de éxito" (Wireframe 6 del diseño), por idioma.
 *
 * NOTA: en el diseño, el bloque de Paola Pabón reutiliza los textos y cifras de
 * Sergio Fajardo como relleno. Se conservan tal cual para ser fieles al Figma;
 * deben reemplazarse con la información real antes de publicar.
 */

export type Caso = {
  id: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  name: string;
  role?: string;
  image: string;
  /** Posición del recorte de la foto de fondo */
  imagePosition?: string;
  objetivo: string;
  hicimos: string;
  stats: {
    instagram: string;
    followers: string;
    tiktok: string;
  };
  closing: string;
};

export type Stat = { value: string; label: string };

export type Testimonio = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

export type CasosContent = {
  meta: { title: string; description: string };
  hero: { title: string; text: string };
  labels: { goal: string; whatWeDid: string; statsBand: string; testimonials: string; results: string };
  casos: Caso[];
  statsBand: Stat[];
  bigStats: Stat[];
  testimonios: Testimonio[];
};

/** Parte visual, común a todos los idiomas */
const visual = {
  fajardo: {
    id: "fajardo",
    tagBg: "var(--c-verde)",
    tagColor: "var(--c-casi-negro)",
    name: "Sergio Fajardo",
    image: "/assets/img/caso-fajardo.jpg",
    imagePosition: "center 30%",
  },
  gomez: {
    id: "gomez",
    tagBg: "var(--c-naranja)",
    tagColor: "var(--c-casi-negro)",
    name: "Luis Ernesto Gómez",
    image: "/assets/img/caso-gomez.jpg",
    imagePosition: "center 20%",
  },
  pabon: {
    id: "pabon",
    tagBg: "var(--c-magenta)",
    tagColor: "var(--c-blanco)",
    name: "Paola Pabón",
    image: "/assets/img/caso-pabon.jpg",
    imagePosition: "center 25%",
  },
};

const heroText = {
  es: "Cada proyecto que acompañamos parte de un reto distinto: una decisión que explicar, un servicio que acercar, una historia que hacer comprensible. Detrás de cada uno hay instituciones, gobiernos y liderazgos que entendieron que comunicar bien no es hablar más fuerte, sino lograr que lo importante llegue y se entienda. Estos son algunos de los proyectos en los que ayudamos a que eso pasara.",
  en: "Every project we take on starts from a different challenge: a decision to explain, a service to bring closer, a story to make understandable. Behind each one are institutions, governments and leaders who understood that communicating well isn't about speaking louder, but about making sure what matters gets through and is understood. These are some of the projects where we helped make that happen.",
};

const fajardoEs = {
  objetivo: "Revitalizar la presencia digital de un candidato con una larga trayectoria política para conectar con el electorado.",
  hicimos:
    "Lideramos la estrategia digital de la campaña de principio a fin: construimos el equipo, definimos la línea de contenidos y tradujimos temas políticos complejos a lenguaje natural para cada red social.",
  stats: {
    instagram: "Durante la campaña creció +156%",
    followers: "3.5 Millones de seguidores",
    tiktok: "Durante la campaña creció +3.511%",
  },
  closing:
    "Sergio Fajardo se consolidó como un referente del manejo de redes sociales en política y al cierre del proceso electoral se posicionó como el candidato con más interacciones en TikTok del país.",
};

const fajardoEn = {
  objetivo: "Revitalize the digital presence of a candidate with a long political career to connect with voters.",
  hicimos:
    "We led the campaign's digital strategy from start to finish: we built the team, defined the content line and translated complex political issues into natural language for each social network.",
  stats: {
    instagram: "Grew +156% during the campaign",
    followers: "3.5 million followers",
    tiktok: "Grew +3,511% during the campaign",
  },
  closing:
    "Sergio Fajardo established himself as a benchmark for social media in politics and, by the end of the electoral process, ranked as the candidate with the most TikTok interactions in the country.",
};

export const casosContent: Record<Locale, CasosContent> = {
  es: {
    meta: { title: "Casos de éxito", description: heroText.es.slice(0, 155) },
    hero: { title: "Proyectos que nos enorgullecen", text: heroText.es },
    labels: { goal: "Objetivo", whatWeDid: "Lo que hicimos", statsBand: "Campañas acompañadas", testimonials: "Testimonios", results: "Resultados" },
    casos: [
      { ...visual.fajardo, tag: "Campaña presidencial", role: "Excandidato presidencial en Colombia", ...fajardoEs },
      {
        ...visual.gomez,
        tag: "Liderazgo de opinión",
        objetivo:
          "Construir una voz que se consolidara como referente del análisis político en Colombia, sin sacrificar el alcance y la agilidad que exigen las redes sociales.",
        hicimos:
          "Lideramos la estrategia digital y de contenidos, identificando en la coyuntura oportunidades de análisis político con potencial de generar conversaciones de valor.",
        stats: {
          instagram: "Ha venido creciendo +249,89%",
          followers: "600 Mil seguidores",
          tiktok: "Ha venido creciendo +723,48%",
        },
        closing: "Luis Ernesto es hoy un referente de opinión en Colombia",
      },
      // Texto de relleno heredado del diseño (ver nota superior).
      { ...visual.pabon, tag: "Campaña regional y acompañamiento en gestión", role: "Prefecta de Pichincha, Ecuador", ...fajardoEs },
    ],
    statsBand: [
      { value: "3", label: "Campañas presidenciales" },
      { value: "2", label: "Campañas al Congreso de la República" },
      { value: "4", label: "Campañas a gobiernos locales" },
    ],
    bigStats: [
      { value: "+84.000.000", label: "de vistas en Instagram en un mes" },
      { value: "+14.000.000", label: "Campañas a gobiernos locales" },
    ],
    testimonios: [
      {
        quote:
          "Los conozco desde el día que crearon la empresa. Para mi el trabajo de ellos tiene las siguientes características: seriedad, rigor y disciplina. Esa fue la manera en la que trabajaron en la campaña presidencial, donde la presencia en el mundo digital fue una característica extraordinaria que nos permitió obtener el resultado que tuvimos. Con Jessica y José y su equipo son de la mejor calidad que se puede conseguir.",
        name: "Sergio Fajardo",
        role: "Excandidato presidencial",
        avatar: "/assets/img/caso-fajardo.jpg",
      },
    ],
  },
  en: {
    meta: { title: "Success stories", description: heroText.en.slice(0, 155) },
    hero: { title: "Projects we're proud of", text: heroText.en },
    labels: { goal: "Goal", whatWeDid: "What we did", statsBand: "Campaigns supported", testimonials: "Testimonials", results: "Results" },
    casos: [
      { ...visual.fajardo, tag: "Presidential campaign", role: "Former presidential candidate in Colombia", ...fajardoEn },
      {
        ...visual.gomez,
        tag: "Thought leadership",
        objetivo:
          "Build a voice that would become a benchmark for political analysis in Colombia, without sacrificing the reach and agility social media demands.",
        hicimos:
          "We led the digital and content strategy, spotting opportunities in current events for political analysis with the potential to spark valuable conversations.",
        stats: {
          instagram: "Has been growing +249.89%",
          followers: "600K followers",
          tiktok: "Has been growing +723.48%",
        },
        closing: "Luis Ernesto is now a leading opinion voice in Colombia.",
      },
      // Placeholder copy inherited from the design (see note above).
      { ...visual.pabon, tag: "Regional campaign and governance support", role: "Prefect of Pichincha, Ecuador", ...fajardoEn },
    ],
    statsBand: [
      { value: "3", label: "Presidential campaigns" },
      { value: "2", label: "Campaigns for the Congress of the Republic" },
      { value: "4", label: "Local government campaigns" },
    ],
    bigStats: [
      { value: "+84,000,000", label: "Instagram views in a single month" },
      { value: "+14,000,000", label: "Local government campaigns" },
    ],
    testimonios: [
      {
        quote:
          "I've known them since the day they founded the company. To me, their work has these qualities: seriousness, rigor and discipline. That's how they worked on the presidential campaign, where our presence in the digital world was an extraordinary strength that allowed us to achieve the result we did. Jessica, José and their team are the best quality you can find.",
        name: "Sergio Fajardo",
        role: "Former presidential candidate",
        avatar: "/assets/img/caso-fajardo.jpg",
      },
    ],
  },
};
