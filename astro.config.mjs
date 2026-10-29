// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://sonante.co",
  integrations: [react()],
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
