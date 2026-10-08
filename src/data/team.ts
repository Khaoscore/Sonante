import type { Locale } from "@/i18n";

/**
 * Contenido de "¿Quiénes somos?" (Wireframe 5 del diseño), por idioma.
 * `body` admite HTML sencillo (<strong>) tal como aparece en Figma.
 *
 * El wireframe repite la misma foto de equipo en las seis filas; aquí se usan
 * los retratos de Jessica y José (del component set "Component 1" del archivo)
 * y las fotos de equipo disponibles para el resto.
 */

export type TeamRow = {
  id: string;
  title: string;
  color: string;
  image: string;
  alt: string;
  imagePosition?: string;
  body: string;
};

export type AboutContent = {
  meta: { title: string; description: string };
  hero: { kicker: string; text: string };
  teamLabel: string;
  rows: TeamRow[];
};

const visual = [
  { id: "jessica", color: "#E94B24", image: "/assets/img/jessica-blanco.png", imagePosition: "center top" },
  { id: "jose", color: "#FF9024", image: "/assets/img/jose-paz.png", imagePosition: "center top" },
  { id: "dato-jessica", color: "#E94B24", image: "/assets/img/team-calibrando.png" },
  { id: "dato-jose", color: "#FF9024", image: "/assets/img/team-1595.png" },
  { id: "ruptura", color: "#E94B24", image: "/assets/img/team-1594.png" },
  { id: "esto-es-sonante", color: "#FF9024", image: "/assets/img/team-image-4.png" },
];

const heroText = {
  es: "Sonante nació de una convicción: la comunicación política es muy distinta a vender un producto. Cuando una institución, un gobierno o un liderazgo comunica bien, puede acercar servicios, explicar decisiones, hacer comprensibles temas complejos y ayudar a que más personas conozcan y ejerzan sus derechos. Por eso llegamos a este trabajo desde la política, con la responsabilidad de entender primero qué está en juego y para quién estamos comunicando.",
  en: "Sonante was born from a conviction: political communication is very different from selling a product. When an institution, a government or a leader communicates well, they can bring services closer, explain decisions, make complex issues understandable and help more people know and exercise their rights. That's why we came to this work from politics, with the responsibility of first understanding what's at stake and who we're communicating for.",
};

export { heroText as aboutHeroText };

type Copy = Pick<TeamRow, "title" | "alt" | "body">;

const copy: Record<Locale, Copy[]> = {
  es: [
    {
      title: "Jessica Blanco",
      alt: "Jessica Blanco, cofundadora de Sonante",
      body:
        "<strong>Es politóloga, estratega digital, consultora en comunicación política y creadora de contenido.</strong> Según el Panel de Opinión de Cifras &amp; Conceptos, fue reconocida como una de las creadoras de contenido <strong>más influyentes</strong> en temas políticos en Colombia en 2022 y 2023.",
    },
    {
      title: "José Paz",
      alt: "José Paz, cofundador de Sonante",
      body:
        "<strong>Es politólogo e internacionalista, especialista en Política, Análisis de Redes y Big Data.</strong> Juntos creamos Sonante para unir dos capacidades que pocas veces aparecen en el mismo lugar: <strong>comprender el poder</strong>, las instituciones y el contexto, <strong>y saber convertir todo eso en contenidos</strong> que la gente quiera escuchar y pueda entender.",
    },
    {
      title: "Dato Jessica Blanco",
      alt: "Equipo de Sonante grabando contenido",
      body:
        "Jessica es una boyacense orgullosa que empezó a crear contenido durante la pandemia como una forma de expresar sus ideas, en un momento en el que salir a las calles o ir a la universidad no era posible.<br> Esa experiencia le permitió conocer de primera mano lo que implica exponerse, crear y construir una comunidad. En Sonante sabemos que detrás del proceso creativo no solo hay estrategia, también hay emociones e inseguridades, y por eso acompañamos cada proyecto entendiendo también esa parte del camino.",
    },
    {
      title: "Dato José Paz",
      alt: "Equipo de Sonante en sesión de producción",
      body:
        "José es cruceño, aunque Bogotá ya lleva más de ocho años siendo su casa. Habla cuatro idiomas, le gusta mucho la fotografía y su formación en ciencia política y relaciones internacionales hace que conecte constantemente lo que pasa aquí con lo que ocurre en otros lugares del mundo. <br> Eso también se nota en Sonante. Muchas veces una conversación local termina cruzándose con referencias, tendencias o aprendizajes de América Latina y de otros contextos que nos ayudan a mirar los problemas desde más de un ángulo.",
    },
    {
      title: "También quisimos cerrar una ruptura muy común en la comunicación",
      alt: "Equipo de Sonante trabajando",
      body:
        "Por un lado están <strong>quienes diseñan estrategias que nunca llegan bien a la pantalla</strong> y, por otro, <strong>quienes producen contenidos sin comprender del todo la estrategia que los sostiene.</strong> En Sonante conectamos ambos procesos. Pensamos el camino, construimos la narrativa y sabemos convertirla en piezas, formatos y conversaciones capaces de moverse en internet.",
    },
    {
      title: "Esto es Sonante",
      alt: "Integrante del equipo de Sonante",
      body:
        "Esa forma de trabajar nos ha permitido <strong>liderar y acompañar estrategias presidenciales, legislativas y regionales en Colombia y Ecuador</strong>, junto a figuras como Sergio Fajardo, Francia Márquez, Gustavo Bolívar, Paola Pabón, Mauricio Toro y Luis Ernesto Gómez. <strong>Nuestra experiencia combina análisis político, estrategia digital y creación de contenido,</strong> porque creemos que las mejores ideas necesitan profundidad para construirse y creatividad para llegar a la gente.",
    },
  ],
  en: [
    {
      title: "Jessica Blanco",
      alt: "Jessica Blanco, co-founder of Sonante",
      body:
        "<strong>She is a political scientist, digital strategist, political communication consultant and content creator.</strong> According to the Cifras &amp; Conceptos Opinion Panel, she was recognized as one of the <strong>most influential</strong> content creators on political issues in Colombia in 2022 and 2023.",
    },
    {
      title: "José Paz",
      alt: "José Paz, co-founder of Sonante",
      body:
        "<strong>He is a political scientist and internationalist, specializing in Politics, Network Analysis and Big Data.</strong> Together we created Sonante to bring together two abilities that rarely appear in the same place: <strong>understanding power</strong>, institutions and context, <strong>and knowing how to turn all of that into content</strong> people want to hear and can understand.",
    },
    {
      title: "Fact: Jessica Blanco",
      alt: "Sonante team recording content",
      body:
        "is a political scientist, digital strategist, political communication consultant and content creator. According to the Cifras &amp; Conceptos Opinion Panel, she was recognized as one of the most influential content creators on political issues in Colombia in 2022 and 2023.",
    },
    {
      title: "Fact: José Paz",
      alt: "Sonante team during a production session",
      body:
        "is a political scientist, digital strategist, political communication consultant and content creator. According to the Cifras &amp; Conceptos Opinion Panel, she was recognized as one of the most influential content creators on political issues in Colombia in 2022 and 2023.",
    },
    {
      title: "We also wanted to close a very common gap in communication",
      alt: "Sonante team at work",
      body:
        "On one side are <strong>those who design strategies that never quite make it to the screen</strong>, and on the other, <strong>those who produce content without fully understanding the strategy behind it.</strong> At Sonante we connect both processes. We think through the path, build the narrative and know how to turn it into pieces, formats and conversations that can travel across the internet.",
    },
    {
      title: "This is Sonante",
      alt: "Member of the Sonante team",
      body:
        "That way of working has allowed us to <strong>lead and support presidential, legislative and regional strategies in Colombia and Ecuador</strong>, alongside figures such as Sergio Fajardo, Francia Márquez, Gustavo Bolívar, Paola Pabón, Mauricio Toro and Luis Ernesto Gómez. <strong>Our experience combines political analysis, digital strategy and content creation,</strong> because we believe the best ideas need depth to be built and creativity to reach people.",
    },
  ],
};

const rows = (lang: Locale): TeamRow[] => visual.map((v, i) => ({ ...v, ...copy[lang][i] }));

export const aboutContent: Record<Locale, AboutContent> = {
  es: {
    meta: { title: "¿Quiénes somos?", description: heroText.es.slice(0, 155) },
    hero: { kicker: "Somos", text: heroText.es },
    teamLabel: "Nuestro equipo",
    rows: rows("es"),
  },
  en: {
    meta: { title: "About us", description: heroText.en.slice(0, 155) },
    hero: { kicker: "We are", text: heroText.en },
    teamLabel: "Our team",
    rows: rows("en"),
  },
};
