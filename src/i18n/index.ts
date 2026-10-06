/**
 * Configuración de idiomas y rutas.
 * - Español (por defecto) en la raíz: /quienes-somos/
 * - Inglés bajo /en/ con slugs en inglés: /en/about-us/
 */

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const ogLocale: Record<Locale, string> = {
  es: "es_CO",
  en: "en_US",
};

export type RouteKey = "home" | "about" | "cases" | "tips" | "contact";

export const routes: Record<RouteKey, Record<Locale, string>> = {
  home: { es: "/", en: "/en/" },
  about: { es: "/quienes-somos/", en: "/en/about-us/" },
  cases: { es: "/casos-de-exito/", en: "/en/success-stories/" },
  tips: { es: "/nuestros-tips/", en: "/en/our-tips/" },
  contact: { es: "/contacto/", en: "/en/contact/" },
};

const normalize = (p: string) => {
  const withSlash = p.endsWith("/") ? p : `${p}/`;
  return withSlash.startsWith("/") ? withSlash : `/${withSlash}`;
};

/** Ruta localizada para una clave de página */
export function pathFor(key: RouteKey, lang: Locale): string {
  return routes[key][lang];
}

/** Clave de página a partir de una ruta (en cualquier idioma) */
export function routeKeyFromPath(path: string): RouteKey | undefined {
  const p = normalize(path);
  return (Object.keys(routes) as RouteKey[]).find((key) => locales.some((l) => routes[key][l] === p));
}

/** Idioma detectado a partir de la ruta */
export function localeFromPath(path: string): Locale {
  const p = normalize(path);
  return p === "/en/" || p.startsWith("/en/") ? "en" : "es";
}

export function otherLocale(lang: Locale): Locale {
  return lang === "es" ? "en" : "es";
}

/** Ruta equivalente de la página actual en otro idioma (home si no existe) */
export function alternatePath(path: string, target: Locale): string {
  const key = routeKeyFromPath(path);
  return key ? routes[key][target] : routes.home[target];
}

/** true si `path` corresponde a la página `key` en cualquier idioma */
export function isRoute(path: string, key: RouteKey): boolean {
  return routeKeyFromPath(path) === key;
}
