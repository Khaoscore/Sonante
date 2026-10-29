// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { satteri } from "@astrojs/markdown-satteri";
import { dropTrailingHeading, externalLinks, stripComments } from "./src/lib/markdown-plugins.mjs";
import { blogGraphics } from "./src/lib/graficas.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://sonante.co",
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
