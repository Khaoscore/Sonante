/**
 * Gráficas y esquemas de los artículos del blog.
 *
 * Cada artículo define sus gráficas en el frontmatter, bajo `graficas:` (clave = id),
 * y marca en el texto dónde va cada una con una línea propia:
 *
 *   <figure data-grafica="exploracion-explotacion"></figure>
 *
 * El plugin `blogGraphics` cambia la marca por el HTML que genera `renderGraphic`.
 * El esquema se valida en src/content.config.ts y los estilos están en
 * src/components/tips/ArticleGraphics.css.
 *
 * Tipos: bars (barras), stats (cifras), flow (pasos), cards (ideas en paralelo),
 * matrix (2×2), hub (sistema con un centro y sus partes) y foto (imagen de uso
 * libre con su crédito y licencia).
 */
const MARKER = /^\s*<figure\s+data-grafica="([^"]+)"\s*>\s*<\/figure>\s*$/;

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Texto con *cursiva* y **negrita** */
const inline = (s = "") =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

const KICKER = { bars: "Datos", stats: "Datos" };

function body(spec) {
  switch (spec.type) {
    case "bars": {
      const max = spec.max ?? Math.max(...spec.items.map((i) => i.value));
      const rows = spec.items
        .map((item, i) => {
          const v = Math.max(0, Math.min(1, item.value / max)).toFixed(3);
          const hl = spec.highlight === i ? " is-highlight" : "";
          return `<li class="g__bar${hl}" style="--v:${v}"><span class="g__bar-label">${inline(item.label)}</span><span class="g__bar-track"><span class="g__bar-fill"></span></span><span class="g__bar-value">${esc(item.display ?? String(item.value))}</span></li>`;
        })
        .join("");
      return `<ul class="g__bars">${rows}</ul>`;
    }
    case "stats": {
      const items = spec.items
        .map((item) => `<div class="g__stat"><dt>${inline(item.label)}</dt><dd>${esc(item.value)}</dd></div>`)
        .join("");
      return `<dl class="g__stats" data-count="${spec.items.length}">${items}</dl>`;
    }
    case "flow": {
      const steps = spec.steps
        .map(
          (s, i) =>
            `<li class="g__step"><span class="g__step-num" aria-hidden="true">${i + 1}</span><p class="g__step-title">${inline(s.title)}</p>${s.text ? `<p class="g__step-text">${inline(s.text)}</p>` : ""}</li>`,
        )
        .join("");
      return `<ol class="g__flow" data-count="${spec.steps.length}">${steps}</ol>`;
    }
    case "cards": {
      const items = spec.items
        .map(
          (c, i) =>
            `<li class="g__card"><span class="g__card-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><p class="g__card-title">${inline(c.title)}</p>${c.text ? `<p class="g__card-text">${inline(c.text)}</p>` : ""}</li>`,
        )
        .join("");
      return `<ol class="g__cards" data-count="${spec.items.length}">${items}</ol>`;
    }
    case "matrix": {
      const q = spec.quadrants;
      const quad = (key, cls) => {
        const hl = spec.highlight === key ? " is-highlight" : "";
        return `<div class="g__quad g__quad--${cls}${hl}"><p class="g__quad-title">${inline(q[key].title)}</p>${q[key].text ? `<p class="g__quad-text">${inline(q[key].text)}</p>` : ""}</div>`;
      };
      const { xAxis: x, yAxis: y } = spec;
      return `<div class="g__matrix">
<p class="g__axis g__axis--y"><span>${inline(y.low)}</span><strong>${inline(y.label)}</strong><span>${inline(y.high)}</span></p>
<div class="g__quads">${quad("topLeft", "tl")}${quad("topRight", "tr")}${quad("bottomLeft", "bl")}${quad("bottomRight", "br")}</div>
<p class="g__axis g__axis--x"><span>${inline(x.low)}</span><strong>${inline(x.label)}</strong><span>${inline(x.high)}</span></p>
</div>`;
    }
    case "hub": {
      const items = spec.items
        .map((c) => `<li class="g__hub-item"><p class="g__hub-title">${inline(c.title)}</p>${c.text ? `<p class="g__hub-text">${inline(c.text)}</p>` : ""}</li>`)
        .join("");
      return `<div class="g__hub"><p class="g__hub-center">${inline(spec.center)}</p><ul class="g__hub-items" data-count="${spec.items.length}">${items}</ul></div>`;
    }
    default:
      throw new Error(`Tipo de gráfica desconocido: ${spec.type}`);
  }
}

const link = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`;

/** Foto con pie y crédito: "Foto: Autor · Licencia, vía Repositorio (cambios)" */
function renderPhoto(spec) {
  const c = spec.credit;
  const via = c.via ? `, vía ${esc(c.via)}` : "";
  const modified = c.modified ? ` (${esc(c.modified)})` : "";
  const caption = spec.caption ? `<span class="g-photo__caption">${inline(spec.caption)}</span>` : "";
  return `<figure class="g-photo">
<img src="${esc(spec.src)}" alt="${esc(spec.alt)}" width="${spec.width}" height="${spec.height}" loading="lazy" decoding="async">
<figcaption>${caption}<span class="g-photo__credit">Foto: ${link(c.sourceUrl, c.author)} · ${link(c.licenseUrl, c.license)}${via}${modified}</span></figcaption>
</figure>`;
}

export function renderGraphic(id, spec) {
  if (spec.type === "foto") return renderPhoto(spec);
  const titleId = `g-${id}`;
  const kicker = KICKER[spec.type] ?? "Esquema";
  const caption = spec.caption ? `<p class="g__caption">${inline(spec.caption)}</p>` : "";
  const source = spec.source ? `<p class="g__source">Fuente: ${inline(spec.source)}</p>` : "";
  return `<figure class="g g--${spec.type}" aria-labelledby="${titleId}">
<div class="g__head"><span class="g__kicker">${kicker}</span><p class="g__title" id="${titleId}">${inline(spec.title)}</p></div>
${body(spec)}
${caption || source ? `<figcaption class="g__foot">${caption}${source}</figcaption>` : ""}
</figure>`;
}

/** Plugin mdast (Sätteri): cambia cada marca <figure data-grafica="…"></figure> por su gráfica */
export const blogGraphics = {
  name: "sonante-blog-graphics",
  html(node, ctx) {
    const match = MARKER.exec(node.value);
    if (!match) return;
    const id = match[1];
    const spec = ctx.data?.astro?.frontmatter?.graficas?.[id];
    if (!spec) {
      console.warn(`[blog] No hay gráfica "${id}" en el frontmatter (graficas:) del artículo.`);
      ctx.removeNode(node);
      return;
    }
    ctx.replaceNode(node, { type: "html", value: renderGraphic(id, spec) });
  },
};
