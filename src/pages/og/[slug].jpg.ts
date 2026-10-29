import type { APIRoute, GetStaticPaths } from "astro";
import sharp from "sharp";
import { getArticles } from "@/lib/blog";
import { coverSvg } from "@/lib/cover";

/**
 * Imagen para compartir en redes (1200×630) de cada artículo: /og/<slug>.jpg.
 * Se genera en el build a partir de la misma portada que se ve en la web.
 */
export const getStaticPaths = (async () => {
  const articles = await getArticles();
  return articles.map((article) => ({
    params: { slug: article.id },
    props: { category: article.data.category },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params, props }) => {
  const svg = coverSvg(String(params.slug), String(props.category));
  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg" } });
};
