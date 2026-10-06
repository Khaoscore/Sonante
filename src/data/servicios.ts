import type { Locale } from "@/i18n";

/**
 * Component set "Servicios" del diseño: 4 variantes de color, una por servicio.
 * Cada tarjeta, al activarse, tiñe la sección con su color y muestra la descripción.
 */
export type Servicio = {
  id: string;
  title: string;
  /** Color de fondo de la sección cuando el servicio está activo */
  bg: string;
  /** Velo de color sobre la foto de la tarjeta activa */
  overlay: string;
  /** Color del texto sobre la tarjeta activa */
  textColor: string;
  image: string;
  alt: string;
  text: string;
};

/** Parte visual, común a todos los idiomas */
const base = [
  {
    id: "estrategia",
    bg: "var(--c-magenta)",
    overlay: "var(--ov-magenta-30)",
    textColor: "var(--c-blanco)",
    image: "/assets/img/team-calibrando.jpg",
  },
  {
    id: "contenido",
    bg: "var(--c-amarillo)",
    overlay: "var(--ov-naranja-claro-20)",
    textColor: "var(--c-blanco)",
    image: "/assets/img/team-1595.jpg",
  },
  {
    id: "proyectos",
    bg: "var(--c-verde)",
    overlay: "var(--ov-verde-oscuro-30)",
    textColor: "var(--c-blanco)",
    image: "/assets/img/team-1594.jpg",
  },
  {
    id: "formacion",
    bg: "var(--c-naranja)",
    overlay: "var(--ov-naranja-20)",
    textColor: "var(--c-blanco)",
    image: "/assets/img/team-image-4.png",
  },
] as const;

type Copy = Pick<Servicio, "title" | "alt" | "text">;

const copy: Record<Locale, Copy[]> = {
  es: [
    {
      title: "Estrategia digital integral",
      alt: "Equipo de Sonante grabando contenido",
      text:
        "Para organizaciones, campañas y liderazgos que comunican mucho, pero sin una dirección clara. Definimos el posicionamiento, las narrativas, los públicos y una ruta de trabajo que permita ordenar la comunicación, tomar mejores decisiones y sostener una dirección estratégica en el tiempo.",
    },
    {
      title: "Creación de contenido para redes sociales",
      alt: "Equipo de Sonante en sesión de producción",
      text:
        "Para quienes tienen algo importante que contar, pero necesitan convertirlo en contenido capaz de conectar y funcionar en redes. Integramos concepto creativo, guión, producción, edición y publicación para que la estrategia llegue completa hasta la audiencia.",
    },
    {
      title: "Proyectos estratégicos especiales",
      alt: "Equipo de Sonante trabajando en un proyecto",
      text:
        "Para momentos que exigen una mirada externa, especializada y rápida: una crisis, un lanzamiento, una campaña puntual, una auditoría o una nueva narrativa. Entramos con un objetivo concreto, resolvemos el problema y dejamos una ruta clara para continuar.",
    },
    {
      title: "Formación de equipos digitales",
      alt: "Integrante del equipo de Sonante",
      text:
        "Para organizaciones que quieren fortalecer las capacidades de sus equipos de comunicación y redes. Diseñamos talleres y capacitaciones prácticas que convierten nuestra experiencia en herramientas, criterios y metodologías que puedan aplicar en su trabajo cotidiano.",
    },
  ],
  en: [
    {
      title: "Comprehensive digital strategy",
      alt: "Sonante team recording content",
      text:
        "For organizations, campaigns and leaders that communicate a lot, but without a clear direction. We define the positioning, the narratives, the audiences and a roadmap that brings order to communication, enables better decisions and sustains a strategic direction over time.",
    },
    {
      title: "Content creation for social media",
      alt: "Sonante team during a production session",
      text:
        "For those who have something important to say but need to turn it into content that connects and performs on social media. We integrate creative concept, scripting, production, editing and publishing so the strategy reaches the audience intact.",
    },
    {
      title: "Special strategic projects",
      alt: "Sonante team working on a project",
      text:
        "For moments that call for an outside, specialized and fast perspective: a crisis, a launch, a one-off campaign, an audit or a new narrative. We come in with a concrete goal, solve the problem and leave a clear path forward.",
    },
    {
      title: "Digital team training",
      alt: "Member of the Sonante team",
      text:
        "For organizations that want to strengthen the skills of their communication and social media teams. We design hands-on workshops and training sessions that turn our experience into tools, criteria and methods they can apply in their daily work.",
    },
  ],
};

export const servicios: Record<Locale, Servicio[]> = {
  es: base.map((b, i) => ({ ...b, ...copy.es[i] })),
  en: base.map((b, i) => ({ ...b, ...copy.en[i] })),
};
