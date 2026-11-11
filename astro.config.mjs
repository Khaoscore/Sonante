// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import react from "@astrojs/react";
import { satteri } from "@astrojs/markdown-satteri";
import { dropTrailingHeading, externalLinks, stripComments } from "./src/lib/markdown-plugins.mjs";
import { blogGraphics } from "./src/lib/graficas.mjs";

// Formulario de contacto: URL /exec del Apps Script, en la variable FORM_ENDPOINT (.env
// en local; Vercel → Settings → Environment Variables en producción). Vercel no deja
// marcar como sensible una variable PUBLIC_, así que aquí se lee FORM_ENDPOINT y se le
// pasa al formulario como PUBLIC_FORM_ENDPOINT. Ojo: la URL igual queda en el JavaScript
// del sitio, porque el navegador es el que envía el mensaje (ver README).
const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");
const formEndpoint = env.FORM_ENDPOINT || env.PUBLIC_FORM_ENDPOINT;
if (formEndpoint) process.env.PUBLIC_FORM_ENDPOINT = formEndpoint;

// Sin la variable el formulario no puede enviar nada. En el deploy de producción de
// Vercel se detiene el build, para que siga en línea la versión anterior en vez de
// publicar un formulario que no envía.
if (process.env.VERCEL_ENV === "production" && !formEndpoint) {
  throw new Error("Falta FORM_ENDPOINT en las variables de entorno de Vercel (Production).");
}

// https://astro.build/config
export default defineConfig({
  site: "https://sonanteagencia.com",
  integrations: [react()],
  markdown: {
    // Artículos del blog: gráficas, sin notas internas en el HTML y enlaces externos en otra pestaña
    processor: satteri({
      mdastPlugins: [blogGraphics, stripComments, dropTrailingHeading],
      hastPlugins: [externalLinks],
    }),
  },
  devToolbar: { enabled: false },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    // GSAP se carga con import() dinámico: pre-empaquetarlo al arrancar evita
    // que el servidor de desarrollo lo sirva desactualizado tras instalar paquetes.
    optimizeDeps: { include: ["gsap", "gsap/ScrollTrigger", "motion/react"] },
  },
});
