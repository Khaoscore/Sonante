/**
 * Genera los Word (.docx) de los documentos legales para enviar al cliente.
 *
 *   npm run legal:docx
 *   npm run legal:docx -- --out <carpeta>
 *
 * Lee legal-sonante/documentos/*.md (los mismos textos de la web),
 * legal-sonante/instrucciones-para-el-cliente.md y legal-sonante/datos.json, y
 * escribe en legal-sonante/para-el-cliente/:
 *   00 - Instrucciones y datos por completar.docx
 *   01, 02, 03 - un documento por cada .md, con el control de cambios activado
 *
 * Cuando todos los datos de datos.json están llenos y confirmados, los Word salen
 * como versión final (vigentes, sin resaltados ni control de cambios).
 *
 * Los campos {{clave}} se resaltan: amarillo = falta, verde = por confirmar,
 * gris = lo completa Khaos Core. Las notas <!-- NOTA: … --> (que la web no
 * muestra) salen como recuadros azules. Solo entiende el Markdown que usan
 * esos archivos: títulos ##/###, párrafos, listas (- y 1.), **negrita**,
 * *cursiva* y [enlaces](url).
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "legal-sonante");
// --out <carpeta> genera en otra carpeta (por ejemplo, para revisar sin tocar la del cliente)
const outArg = process.argv.indexOf("--out");
const outDir = outArg > 0 ? process.argv[outArg + 1] : join(dir, "para-el-cliente");
const SITE = "https://sonante.co";
const AGENCIA = "Khaos Core";

const COLOR = {
  verdeOscuro: "003833",
  pendiente: "FFE066",
  confirmar: "C6EFCE",
  agencia: "E3E3E3",
  nota: "E4ECFB",
  notaBorde: "5180E2",
  leyenda: "F4F4F4",
  gris: "7F7F7F",
};

const { campos } = JSON.parse(readFileSync(join(dir, "datos.json"), "utf8"));
const fecha = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

/**
 * Versión final: todos los datos llenos y confirmados. Los Word salen sin leyenda,
 * sin control de cambios y con la fecha de vigencia en lugar de "Borrador".
 */
const final = Object.values(campos).every((c) => c.valor.trim() && c.confirmado);

/* ---------- Lectura de los .md ---------- */

function leer(path) {
  const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const data = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
      if (kv) data[kv[1]] = kv[2].replace(/^["'](.*)["']$/, "$1");
    }
  }
  return { data, bloques: bloques(m ? raw.slice(m[0].length) : raw) };
}

const INICIO_BLOQUE = /^(#{1,4}\s|[-*]\s|\d+\.\s|<!--)/;

function bloques(body) {
  const lines = body.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    if (t.startsWith("<!--")) {
      let text = t;
      while (!text.includes("-->") && i + 1 < lines.length) text += " " + lines[++i].trim();
      i++;
      const nota = text.replace(/^<!--\s*/, "").replace(/\s*-->$/, "").replace(/^NOTA:\s*/, "");
      out.push({ tipo: "nota", texto: nota });
      continue;
    }
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      out.push({ tipo: "titulo", nivel: h[1].length, texto: h[2] });
      i++;
      continue;
    }
    if (t === "{{tabla_datos}}") {
      out.push({ tipo: "tabla" });
      i++;
      continue;
    }
    const li = line.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordenada = /\d/.test(li[1]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^([-*]|\d+\.)\s+(.*)$/);
        if (m && /\d/.test(m[1]) === ordenada) {
          items.push([m[2]]);
          i++;
        } else if (items.length && /^\s{2,}\S/.test(lines[i])) {
          items.at(-1).push(lines[i].trim());
          i++;
        } else break;
      }
      out.push({ tipo: "lista", ordenada, items });
      continue;
    }
    let texto = t;
    i++;
    while (i < lines.length && lines[i].trim() && !INICIO_BLOQUE.test(lines[i].trim())) texto += " " + lines[i++].trim();
    out.push({ tipo: "parrafo", texto });
  }
  return out;
}

/* ---------- Texto en línea ---------- */

const sombra = (fill) => ({ type: ShadingType.CLEAR, color: "auto", fill });

const EJEMPLOS = {
  _ejemplo_pendiente: ["Amarillo", COLOR.pendiente],
  _ejemplo_confirmar: ["Verde", COLOR.confirmar],
  _ejemplo_agencia: ["Gris", COLOR.agencia],
  _ejemplo_nota: ["Recuadro azul", COLOR.nota],
};

function campo(clave, fmt = {}) {
  if (clave === "_respuesta") {
    return [new TextRun({ text: "[Escriban aquí su respuesta]", shading: sombra(COLOR.pendiente) })];
  }
  if (EJEMPLOS[clave]) {
    const [text, fill] = EJEMPLOS[clave];
    return [new TextRun({ text, bold: true, shading: sombra(fill) })];
  }
  const c = campos[clave];
  if (!c) throw new Error(`Campo desconocido en el texto: {{${clave}}} (agréguelo a legal-sonante/datos.json)`);
  const valor = c.valor.trim();
  if (!valor) {
    const agencia = c.responde === AGENCIA;
    const text = `[${c.etiqueta}${agencia ? ` — lo completa ${AGENCIA}` : ""}]`;
    return [new TextRun({ text, bold: true, shading: sombra(agencia ? COLOR.agencia : COLOR.pendiente) })];
  }
  return [new TextRun({ text: valor, ...fmt, ...(c.confirmado ? {} : { shading: sombra(COLOR.confirmar) }) })];
}

const INLINE = /(\*\*|\*|\{\{\s*([a-z_]+)\s*\}\}|\[([^\]]+)\]\(([^)\s]+)\))/g;

function enLinea(texto, base = {}) {
  const src = texto.replace(/"([^"]+)"/g, "“$1”");
  const runs = [];
  let bold = !!base.bold;
  let italics = !!base.italics;
  let last = 0;
  const plano = (t) => t && runs.push(new TextRun({ text: t, bold, italics }));
  INLINE.lastIndex = 0;
  for (let m; (m = INLINE.exec(src)); ) {
    plano(src.slice(last, m.index));
    last = INLINE.lastIndex;
    if (m[1] === "**") bold = !bold;
    else if (m[1] === "*") italics = !italics;
    else if (m[2]) runs.push(...campo(m[2], { bold, italics }));
    else {
      const link = m[4].startsWith("/") ? SITE + m[4] : m[4];
      runs.push(new ExternalHyperlink({ link, children: [new TextRun({ text: m[3], style: "Hyperlink", bold, italics })] }));
    }
  }
  plano(src.slice(last));
  return runs;
}

/* ---------- Bloques ---------- */

/**
 * Cada lista numerada tiene su propia definición ("numeros-1", "numeros-2"…) para
 * que empiece en 1: si varias comparten una con reinicio (startOverride), Word
 * numera mal la segunda línea (1, 1, 2…). Se reinicia en cada documento.
 */
let listasNumeradas = 0;

function nota(texto) {
  return new Paragraph({
    children: [new TextRun({ text: "Nota para Sonante: ", bold: true, color: "1F3F8F" }), ...enLinea(texto)],
    shading: sombra(COLOR.nota),
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: COLOR.notaBorde, space: 8 } },
    indent: { left: 160, right: 160 },
    spacing: { before: 120, after: 200 },
  });
}

function tablaDatos() {
  const anchos = [2300, 4060, 3000];
  const celda = (children, i, fill) =>
    new TableCell({
      children,
      width: { size: anchos[i], type: WidthType.DXA },
      shading: fill ? sombra(fill) : undefined,
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
    });
  const p = (runs) => new Paragraph({ children: runs, spacing: { after: 0 } });
  const cabecera = new TableRow({
    tableHeader: true,
    children: ["Dato", "Qué necesitamos", "Respuesta"].map((t, i) =>
      celda([p([new TextRun({ text: t, bold: true, color: "FFFFFF" })])], i, COLOR.verdeOscuro),
    ),
  });
  const filas = Object.values(campos)
    .filter((c) => c.responde !== AGENCIA)
    .map((c) => {
      const valor = c.valor.trim();
      return new TableRow({
        children: [
          celda([p([new TextRun({ text: c.etiqueta, bold: true })])], 0),
          celda([p([new TextRun({ text: c.ayuda, size: 18 })])], 1),
          celda([p([new TextRun(valor)])], 2, !valor ? COLOR.pendiente : c.confirmado ? undefined : COLOR.confirmar),
        ],
      });
    });
  const agencia = Object.values(campos)
    .filter((c) => c.responde === AGENCIA)
    .map((c) => c.etiqueta.charAt(0).toLowerCase() + c.etiqueta.slice(1));
  return [
    new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: anchos, rows: [cabecera, ...filas] }),
    new Paragraph({
      children: [new TextRun({ text: `Los completa ${AGENCIA}: ${agencia.join(", ")}.`, italics: true, color: COLOR.gris, size: 18 })],
      spacing: { before: 120 },
    }),
  ];
}

function cuerpo(bs) {
  const out = [];
  for (const b of bs) {
    if (b.tipo === "titulo") {
      const heading = b.nivel <= 2 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2;
      out.push(new Paragraph({ heading, children: enLinea(b.texto) }));
    } else if (b.tipo === "parrafo") {
      out.push(new Paragraph({ children: enLinea(b.texto) }));
    } else if (b.tipo === "nota") {
      out.push(nota(b.texto));
    } else if (b.tipo === "tabla") {
      out.push(...tablaDatos());
    } else if (b.tipo === "lista") {
      const reference = b.ordenada ? `numeros-${++listasNumeradas}` : "vinetas";
      for (const [primero, ...resto] of b.items) {
        // Las líneas extra del ítem (p. ej. "Respuesta:") van en el mismo párrafo con
        // salto de línea: un párrafo intermedio hace que Word reinicie la numeración.
        const children = enLinea(primero);
        for (const extra of resto) children.push(new TextRun({ break: 1 }), ...enLinea(extra));
        out.push(
          new Paragraph({
            children,
            numbering: { reference, level: 0 },
            spacing: { after: resto.length ? 200 : 80 },
          }),
        );
      }
      out.push(new Paragraph({ children: [], spacing: { after: 40 } }));
    }
  }
  return out;
}

/* ---------- Documento ---------- */

function leyenda(conNotas) {
  const linea = (clave, texto) => new Paragraph({ children: [...campo(clave), new TextRun(texto)], ...caja, spacing: { after: 40 } });
  const caja = {
    shading: sombra(COLOR.leyenda),
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: "BFBFBF", space: 8 } },
    indent: { left: 160, right: 160 },
  };
  return [
    new Paragraph({ children: [new TextRun({ text: "Cómo revisar este borrador", bold: true })], ...caja, spacing: { before: 200, after: 60 } }),
    linea("_ejemplo_pendiente", ": dato que falta. Escríbanlo encima."),
    linea("_ejemplo_confirmar", ": dato que ya teníamos. Confirmen que está bien o corríjanlo."),
    linea("_ejemplo_agencia", `: lo completa ${AGENCIA} al publicar.`),
    ...(conNotas ? [linea("_ejemplo_nota", ": nota para Sonante. No se publica en el sitio.")] : []),
    new Paragraph({
      children: [new TextRun({ text: "El control de cambios está activado: los ajustes que hagan al texto quedan marcados.", italics: true })],
      ...caja,
      spacing: { after: 240 },
    }),
  ];
}

function documento({ titulo, subtitulo, cabecera, children, controlDeCambios }) {
  return new Document({
    creator: AGENCIA,
    title: titulo,
    description: subtitulo,
    features: { trackRevisions: controlDeCambios },
    styles: {
      default: { document: { run: { font: "Arial", size: 21 }, paragraph: { spacing: { line: 276, after: 120 } } } },
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          next: "Normal",
          run: { font: "Georgia", size: 44, bold: true, color: COLOR.verdeOscuro },
          paragraph: { spacing: { after: 80 } },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Georgia", size: 28, bold: true, color: COLOR.verdeOscuro },
          paragraph: { spacing: { before: 360, after: 120 }, keepNext: true, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 23, bold: true, color: COLOR.verdeOscuro },
          paragraph: { spacing: { before: 240, after: 80 }, keepNext: true, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "vinetas",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 540, hanging: 270 } } },
            },
          ],
        },
        ...Array.from({ length: listasNumeradas }, (_, i) => ({
          reference: `numeros-${i + 1}`,
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 540, hanging: 360 } } },
            },
          ],
        })),
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: cabecera, size: 16, color: COLOR.gris })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES], size: 16, color: COLOR.gris }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(titulo)] }),
          new Paragraph({
            children: [new TextRun({ text: subtitulo, color: COLOR.gris })],
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF", space: 8 } },
            spacing: { after: 240 },
          }),
          ...children,
        ],
      },
    ],
  });
}

const sinTildes = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const nombre = (orden, texto) => `${String(orden).padStart(2, "0")} - ${sinTildes(texto)}.docx`;

/** Archivos que no se pudieron escribir porque están abiertos en Word */
const abiertos = [];

async function guardar(archivo, doc) {
  try {
    writeFileSync(join(outDir, archivo), await Packer.toBuffer(doc));
  } catch (err) {
    if (err.code !== "EBUSY" && err.code !== "EPERM") throw err;
    abiertos.push(archivo);
    console.log(`  ✗ ${archivo} (está abierto en Word)`);
    return;
  }
  console.log(`  ✓ ${archivo}`);
}

mkdirSync(outDir, { recursive: true });
console.log(`Generando en ${outDir}`);

const instrucciones = leer(join(dir, "instrucciones-para-el-cliente.md"));
listasNumeradas = 0;
await guardar(
  nombre(0, instrucciones.data.archivo ?? instrucciones.data.titulo),
  documento({
    titulo: instrucciones.data.titulo,
    subtitulo: `${instrucciones.data.archivo} · ${fecha}`,
    cabecera: "Sonante · Documentos legales del sitio web",
    children: cuerpo(instrucciones.bloques),
    controlDeCambios: false,
  }),
);

const documentos = readdirSync(join(dir, "documentos"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => leer(join(dir, "documentos", f)))
  .sort((a, b) => Number(a.data.orden) - Number(b.data.orden));

for (const { data, bloques: bs } of documentos) {
  const razon = campos.razon_social.valor || "Sonante";
  const corto = data.corto ?? data.titulo;
  listasNumeradas = 0;
  await guardar(
    nombre(data.orden, data.titulo),
    documento({
      titulo: data.titulo,
      subtitulo: final
        ? `${razon} · Versión ${data.version} · Vigente desde el ${campos.fecha_vigencia.valor}`
        : `${razon} · Versión ${data.version} · Borrador para revisión del ${fecha}`,
      cabecera: final ? `Sonante · ${corto}` : `Sonante · ${corto} · Borrador para revisión`,
      children: final ? cuerpo(bs) : [...leyenda(bs.some((b) => b.tipo === "nota")), ...cuerpo(bs)],
      controlDeCambios: !final,
    }),
  );
}

if (abiertos.length) {
  console.error(`
No se actualizaron ${abiertos.length} archivo(s) abiertos en Word. Ciérrenlos y vuelvan a correr: npm run legal:docx`);
  process.exitCode = 1;
}
