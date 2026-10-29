/**
 * Plugins de Markdown para los artículos del blog, con la API de Sätteri
 * (el procesador de Markdown por defecto de Astro 7).
 */

const isComment = (value) => /^\s*<!--[\s\S]*?-->\s*$/.test(value);

/**
 * Quita los comentarios HTML (notas internas tipo <!-- PENDIENTE … -->) para que
 * no lleguen al HTML publicado.
 */
export const stripComments = {
  name: "sonante-strip-comments",
  html(node, ctx) {
    if (isComment(node.value)) ctx.removeNode(node);
  },
};

/**
 * Si el documento termina en un encabezado sin contenido (p. ej. "Referencias"
 * todavía vacío porque solo tenía una nota interna), no se muestra.
 * Va después de stripComments, en su propio pase.
 */
export const dropTrailingHeading = {
  name: "sonante-drop-trailing-heading",
  heading(node, ctx) {
    const parent = ctx.parent(node);
    if (parent?.type === "root" && ctx.indexOf(node) === parent.children.length - 1) {
      ctx.removeNode(node);
    }
  },
};

/** Los enlaces externos (referencias, DOI) se abren en otra pestaña */
export const externalLinks = {
  name: "sonante-external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = String(node.properties?.href ?? "");
      if (/^https?:\/\//.test(href)) {
        ctx.setProperty(node, "target", "_blank");
        ctx.setProperty(node, "rel", ["noopener", "noreferrer"]);
      }
    },
  },
};
