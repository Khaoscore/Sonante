import type { LegalKey, Locale, RouteKey } from "./index";

/**
 * Textos de interfaz (navegación, footer, formulario, etiquetas de accesibilidad).
 * El contenido editorial de cada página vive en src/data/*.ts, también por idioma.
 */

export type CountryOption = { name: string; cities: string[] };

export type UiStrings = {
  skipLink: string;
  siteTitle: string;
  tagline: string;
  description: string;
  nav: {
    ariaLabel: string;
    logoLabel: string;
    openMenu: string;
    closeMenu: string;
    /** Código que muestra el botón de idioma (idioma actual) */
    langCode: string;
    /** Etiqueta accesible del conmutador de idioma */
    langSwitch: string;
    items: { key: RouteKey; label: string; cta?: boolean }[];
  };
  footer: {
    ariaLabel: string;
    whatWeDo: string;
    writeUs: string;
    socialLabel: string;
    copyright: string;
    poweredBy: string;
    menu: { key: RouteKey; label: string }[];
    /** Enlaces a los documentos legales (franja inferior) */
    legalLabel: string;
    legal: { key: LegalKey; label: string }[];
    /** Aviso en los enlaces legales cuando la página no está en español */
    legalLangNote?: string;
  };
  form: {
    aboutYou: string;
    fullName: string;
    phone: string;
    whereFrom: string;
    selectCountry: string;
    selectCity: string;
    country: string;
    city: string;
    emailLabel: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    success: string;
    error: string;
    /** Turnstile no pudo confirmar que es una persona */
    verify: string;
    mailSubject: string;
    mailFields: { name: string; phone: string; country: string; city: string; email: string };
    countries: CountryOption[];
    /** Casilla de autorización de datos personales (Ley 1581 de 2012) */
    consent: {
      before: string;
      data: string;
      and: string;
      privacy: string;
      after: string;
      /** Línea que se añade al mensaje como constancia de la autorización */
      record: string;
    };
  };
  a11y: {
    previous: string;
    next: string;
    verified: string;
    tags: string;
    instagram: string;
    tiktok: string;
  };
};

const otherCities = (lang: Locale) => (lang === "es" ? "Otra" : "Other");

const countriesEs: CountryOption[] = [
  { name: "Colombia", cities: ["Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Otra"] },
  { name: "Ecuador", cities: ["Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Otra"] },
  { name: "México", cities: ["Ciudad de México", "Guadalajara", "Monterrey", "Otra"] },
  { name: "Perú", cities: ["Lima", "Arequipa", "Cusco", "Otra"] },
  { name: "Chile", cities: ["Santiago", "Valparaíso", "Concepción", "Otra"] },
  { name: "Argentina", cities: ["Buenos Aires", "Córdoba", "Rosario", "Otra"] },
  { name: "Bolivia", cities: ["La Paz", "Santa Cruz", "Cochabamba", "Otra"] },
  { name: "Venezuela", cities: ["Caracas", "Maracaibo", "Valencia", "Otra"] },
  { name: "Panamá", cities: ["Ciudad de Panamá", "Otra"] },
  { name: "Costa Rica", cities: ["San José", "Otra"] },
  { name: "Guatemala", cities: ["Ciudad de Guatemala", "Otra"] },
  { name: "Honduras", cities: ["Tegucigalpa", "San Pedro Sula", "Otra"] },
  { name: "El Salvador", cities: ["San Salvador", "Otra"] },
  { name: "Nicaragua", cities: ["Managua", "Otra"] },
  { name: "República Dominicana", cities: ["Santo Domingo", "Otra"] },
  { name: "Uruguay", cities: ["Montevideo", "Otra"] },
  { name: "Paraguay", cities: ["Asunción", "Otra"] },
  { name: "España", cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Otra"] },
  { name: "Estados Unidos", cities: ["Miami", "Nueva York", "Washington D.C.", "Los Ángeles", "Otra"] },
  { name: "Otro", cities: ["Otra"] },
];

const countriesEn: CountryOption[] = [
  { name: "Colombia", cities: ["Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Other"] },
  { name: "Ecuador", cities: ["Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Other"] },
  { name: "Mexico", cities: ["Mexico City", "Guadalajara", "Monterrey", "Other"] },
  { name: "Peru", cities: ["Lima", "Arequipa", "Cusco", "Other"] },
  { name: "Chile", cities: ["Santiago", "Valparaíso", "Concepción", "Other"] },
  { name: "Argentina", cities: ["Buenos Aires", "Córdoba", "Rosario", "Other"] },
  { name: "Bolivia", cities: ["La Paz", "Santa Cruz", "Cochabamba", "Other"] },
  { name: "Venezuela", cities: ["Caracas", "Maracaibo", "Valencia", "Other"] },
  { name: "Panama", cities: ["Panama City", "Other"] },
  { name: "Costa Rica", cities: ["San José", "Other"] },
  { name: "Guatemala", cities: ["Guatemala City", "Other"] },
  { name: "Honduras", cities: ["Tegucigalpa", "San Pedro Sula", "Other"] },
  { name: "El Salvador", cities: ["San Salvador", "Other"] },
  { name: "Nicaragua", cities: ["Managua", "Other"] },
  { name: "Dominican Republic", cities: ["Santo Domingo", "Other"] },
  { name: "Uruguay", cities: ["Montevideo", "Other"] },
  { name: "Paraguay", cities: ["Asunción", "Other"] },
  { name: "Spain", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Other"] },
  { name: "United States", cities: ["Miami", "New York", "Washington D.C.", "Los Angeles", "Other"] },
  { name: "Other", cities: ["Other"] },
];

export const ui: Record<Locale, UiStrings> = {
  es: {
    skipLink: "Ir al contenido",
    siteTitle: "Sonante",
    tagline: "Estrategia y comunicación digital para líderes, campañas, gobiernos e instituciones.",
    description:
      "Sonante es una agencia de comunicación política. Ayudamos a instituciones, gobiernos y liderazgos a comunicar lo que hacen de forma que la gente lo entienda.",
    nav: {
      ariaLabel: "Principal",
      logoLabel: "Sonante — inicio",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      langCode: "ES",
      langSwitch: "Switch to English",
      items: [
        { key: "about", label: "¿Quiénes somos?" },
        { key: "cases", label: "Casos de éxito" },
        { key: "tips", label: "Nuestros tips" },
        { key: "contact", label: "¿Conversamos?", cta: true },
      ],
    },
    footer: {
      ariaLabel: "Pie de página",
      whatWeDo: "¿Qué hacemos?",
      writeUs: "Escríbenos:",
      socialLabel: "Redes sociales",
      copyright: "Copyright",
      poweredBy: "Powered by",
      menu: [
        { key: "about", label: "¿Quienes somos?" },
        { key: "cases", label: "Casos de éxito" },
        { key: "tips", label: "Nuestros tips" },
        { key: "contact", label: "¿Conversamos?" },
      ],
      legalLabel: "Documentos legales",
      legal: [
        { key: "privacy", label: "Política de privacidad" },
        { key: "terms", label: "Términos de uso" },
        { key: "data", label: "Tratamiento de datos" },
      ],
    },
    form: {
      aboutYou: "Cuéntanos qué necesitas y encontraremos la mejor manera de trabajarlo juntos.",
      fullName: "Nombre completo*",
      phone: "Teléfono*",
      whereFrom: "¿De dónde eres?",
      selectCountry: "Selecciona un país*",
      selectCity: "Selecciona una ciudad*",
      country: "País",
      city: "Ciudad",
      emailLabel: "Déjanos tu correo para contactarte",
      emailPlaceholder: "ejemplo@correo.com",
      message: "Sobre tu proyecto",
      messagePlaceholder: "¿Qué necesitas comunicar, construir o resolver?",
      send: "Hablemos",
      sending: "Enviando…",
      success: "¡Gracias! Te escribiremos muy pronto.",
      error: "No pudimos enviar el mensaje. Inténtalo de nuevo o escríbenos a",
      verify: "No pudimos confirmar que no eres un robot. Completa la verificación y vuelve a enviar.",
      mailSubject: "Contacto desde la web",
      mailFields: { name: "Nombre", phone: "Teléfono", country: "País", city: "Ciudad", email: "Correo" },
      countries: countriesEs,
      consent: {
        before: "Autorizo a Sonante a usar mis datos para responder mi mensaje, según su ",
        data: "Política de tratamiento de datos personales",
        and: " y su ",
        privacy: "Política de privacidad",
        after: ".",
        record: "Autorización de datos personales: Sí (Política de tratamiento de datos personales)",
      },
    },
    a11y: {
      previous: "Testimonio anterior",
      next: "Testimonio siguiente",
      verified: "Verificado",
      tags: "Etiquetas",
      instagram: "Instagram",
      tiktok: "TikTok",
    },
  },
  en: {
    skipLink: "Skip to content",
    siteTitle: "Sonante",
    tagline: "Digital strategy and communication for leaders, campaigns, governments and institutions.",
    description:
      "Sonante is a political communication agency. We help institutions, governments and leaders communicate what they do in a way people understand.",
    nav: {
      ariaLabel: "Main",
      logoLabel: "Sonante — home",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      langCode: "EN",
      langSwitch: "Cambiar a español",
      items: [
        { key: "about", label: "About us" },
        { key: "cases", label: "Success stories" },
        { key: "tips", label: "Our tips" },
        { key: "contact", label: "Let's talk", cta: true },
      ],
    },
    footer: {
      ariaLabel: "Footer",
      whatWeDo: "What we do",
      writeUs: "Write to us:",
      socialLabel: "Social media",
      copyright: "Copyright",
      poweredBy: "Powered by",
      menu: [
        { key: "about", label: "About us" },
        { key: "cases", label: "Success stories" },
        { key: "tips", label: "Our tips" },
        { key: "contact", label: "Let's talk" },
      ],
      legalLabel: "Legal documents",
      legal: [
        { key: "privacy", label: "Privacy policy" },
        { key: "terms", label: "Terms of use" },
        { key: "data", label: "Personal data policy" },
      ],
      legalLangNote: "Document in Spanish",
    },
    form: {
      aboutYou: "Tell us what you need and we'll find the best way to work on it together.",
      fullName: "Full name*",
      phone: "Phone*",
      whereFrom: "Where are you from?",
      selectCountry: "Select a country*",
      selectCity: "Select a city*",
      country: "Country",
      city: "City",
      emailLabel: "Leave us your email so we can reach you",
      emailPlaceholder: "example@email.com",
      message: "About your project",
      messagePlaceholder: "What do you need to communicate, build or solve?",
      send: "Let's talk",
      sending: "Sending…",
      success: "Thank you! We'll get back to you very soon.",
      error: "We couldn't send your message. Please try again or write to us at",
      verify: "We couldn't confirm you're not a robot. Complete the check and send it again.",
      mailSubject: "Website contact",
      mailFields: { name: "Name", phone: "Phone", country: "Country", city: "City", email: "Email" },
      countries: countriesEn,
      consent: {
        before: "I authorize Sonante to use my data to answer my message, under its ",
        data: "Personal data policy",
        and: " and ",
        privacy: "Privacy policy",
        after: " (in Spanish).",
        record: "Personal data authorization: Yes (Personal data policy)",
      },
    },
    a11y: {
      previous: "Previous testimonial",
      next: "Next testimonial",
      verified: "Verified",
      tags: "Tags",
      instagram: "Instagram",
      tiktok: "TikTok",
    },
  },
};

export const t = (lang: Locale) => ui[lang];

export { otherCities };
