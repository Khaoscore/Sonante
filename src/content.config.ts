import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/* ---------- Gráficas dentro de los artículos (ver src/lib/graficas.mjs) ---------- */
const item = z.object({ title: z.string(), text: z.string().optional() });
const common = { title: z.string(), caption: z.string().optional(), source: z.string().optional() };
const quadrant = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

const grafica = z.discriminatedUnion("type", [
  z.object({
    ...common,
    type: z.literal("bars"),
    items: z.array(z.object({ label: z.string(), value: z.number(), display: z.string().optional() })).min(2),
    /** Índice de la barra resaltada */
    highlight: z.number().int().optional(),
    /** Valor que llena la barra completa (por defecto, el mayor) */
    max: z.number().optional(),
  }),
  z.object({
    ...common,
    type: z.literal("stats"),
    items: z.array(z.object({ value: z.string(), label: z.string() })).min(1).max(4),
  }),
  z.object({ ...common, type: z.literal("flow"), steps: z.array(item).min(2).max(5) }),
  z.object({ ...common, type: z.literal("cards"), items: z.array(item).min(2).max(4) }),
  z.object({
    ...common,
    type: z.literal("matrix"),
    xAxis: z.object({ label: z.string(), low: z.string(), high: z.string() }),
    yAxis: z.object({ label: z.string(), low: z.string(), high: z.string() }),
    quadrants: z.object({ topLeft: item, topRight: item, bottomLeft: item, bottomRight: item }),
    highlight: z.enum(quadrant).optional(),
  }),
  z.object({ ...common, type: z.literal("hub"), center: z.string(), items: z.array(item).min(3).max(6) }),
  /** Foto de uso libre, con su crédito y licencia (obligatorios para CC BY / CC BY-SA) */
  z.object({
    type: z.literal("foto"),
    src: z.string(),
    alt: z.string().min(1),
    width: z.number().int(),
    height: z.number().int(),
    caption: z.string().optional(),
    credit: z.object({
      author: z.string(),
      license: z.string(),
      licenseUrl: z.string(),
      sourceUrl: z.string(),
      /** Banco o repositorio, p. ej. "Wikimedia Commons" */
      via: z.string().optional(),
      /** Cambios hechos a la imagen, p. ej. "recortada" */
      modified: z.string().optional(),
    }),
  }),
]);

/**
 * Artículos del blog ("Nuestros tips").
 * Se leen directamente de blog-sonante/articulos/*.md: para publicar uno nuevo basta con
 * agregar el .md a esa carpeta siguiendo blog-sonante/_criterios-de-edicion.md.
 * El `slug` del frontmatter se usa como id y como URL: /nuestros-tips/<slug>/.
 */
const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./blog-sonante/articulos" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().default(""),
    description: z.string(),
    author: z.string().default("Sonante"),
    /** Vacío mientras el equipo no programe la fecha */
    publishDate: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.date().optional()),
    /** Categorías definidas en _criterios-de-edicion.md (agregar aquí si se crea una nueva) */
    category: z.enum(["Estrategia electoral", "Comunicación digital", "Comunicación pública", "Oficio"]),
    tags: z.array(z.string()).default([]),
    cover: z
      .object({
        src: z.string(),
        alt: z.string().default(""),
        credit: z.string().default(""),
      })
      .optional(),
    readingTime: z.number().optional(),
    /** listo | revisar se publican; incompleto solo se ve en desarrollo */
    status: z.enum(["listo", "revisar", "incompleto"]).default("listo"),
    /** Gráficas del artículo; en el texto: <figure data-grafica="id"></figure> */
    graficas: z.record(z.string(), grafica).optional(),
  }),
});

export const collections = { blog };
