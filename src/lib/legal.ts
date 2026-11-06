import { getCollection, type CollectionEntry } from "astro:content";
import datos from "../../legal-sonante/datos.json";

/**
 * Documentos legales: helpers para la colección `legal` (legal-sonante/documentos/*.md).
 *
 * El texto lleva campos {{clave}} que se llenan con legal-sonante/datos.json al
 * construir la página (no en el procesador de Markdown, que guarda en caché el
 * HTML de cada .md y no notaría los cambios en datos.json). Los campos sin valor
 * se muestran resaltados como pendientes.
 */

export type LegalDoc = CollectionEntry<"legal">;

type Campo = {
  etiqueta: string;
  ayuda: string;
  valor: string;
  confirmado?: boolean;
  responde?: string;
  /** Convierte el valor en enlace: mailto:, tel: o https:// */
  tipo?: "correo" | "telefono" | "web";
};

const campos = datos.campos as Record<string, Campo>;

/** Documentos ordenados como en el menú lateral */
export async function getLegalDocs(): Promise<LegalDoc[]> {
  const docs = await getCollection("legal");
  return docs.sort((a, b) => a.data.orden - b.data.orden);
}

export const legalPath = (id: string) => `/${id}/`;

/** Valor de un campo, o undefined si sigue pendiente */
export function valorCampo(clave: string): string | undefined {
  return campos[clave]?.valor.trim() || undefined;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function enlace(campo: Campo, valor: string): string {
  const texto = escapeHtml(valor);
  switch (campo.tipo) {
    case "correo":
      return `<a href="mailto:${texto}">${texto}</a>`;
    case "telefono":
      return `<a href="tel:${valor.replace(/[^\d+]/g, "")}">${texto}</a>`;
    case "web":
      return `<a href="https://${texto.replace(/^https?:\/\//, "")}">${texto}</a>`;
    default:
      return texto;
  }
}

/**
 * Reemplaza los {{clave}} del HTML por su valor. Devuelve también las etiquetas
 * de los campos pendientes, para avisar que el documento es un borrador.
 */
export function llenarCampos(html: string): { html: string; pendientes: string[] } {
  const pendientes = new Set<string>();
  const out = html.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_, clave: string) => {
    const campo = campos[clave];
    const valor = campo?.valor.trim();
    if (campo && valor) return enlace(campo, valor);
    const etiqueta = campo?.etiqueta ?? clave;
    pendientes.add(etiqueta);
    return `<mark class="pendiente" title="Dato pendiente">[${escapeHtml(etiqueta)}]</mark>`;
  });
  return { html: out, pendientes: [...pendientes] };
}
