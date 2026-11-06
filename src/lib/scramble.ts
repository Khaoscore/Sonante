/**
 * Efecto "decode" para títulos: cada carácter aparece con letras minúsculas al
 * azar y parpadeos secos de opacidad hasta resolverse en su letra real.
 *
 * Tiempos (ms) para el carácter i, contados sin espacios:
 *   aparece en i × STEP (opacidad 0 → 0.6 → 1 en ~35 ms),
 *   cambia de letra cada TICK y se resuelve en RESOLVE + i × STEP.
 * Con 7 letras dura ≈ 700 ms. Sin easing: son saltos, tipo terminal.
 * En títulos largos (más de 22 letras) el paso se acorta para no pasar de
 * MAX_TOTAL: una frase de 55 letras no tarda 4 s en aparecer.
 */

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const STEP = 60;
const MAX_TOTAL = 1600;
const RESOLVE = 320;
const TICK = 65;
/** Entrada: a 0.6 a los IN_HALF ms y a 1 a los IN_FULL ms */
const IN_HALF = 12;
const IN_FULL = 35;
/** Parpadeo a 0.6 durante FLICKER ms en una fracción de los cambios de letra */
const FLICKER = 30;
const FLICKER_CHANCE = 0.35;

export type SplitResult = {
  /** Spans de cada carácter visible (sin espacios), de izquierda a derecha */
  chars: HTMLElement[];
  /** Devuelve el elemento a su contenido original */
  revert: () => void;
};

/** Grafemas completos, para no separar una tilde de su letra ("José") */
function graphemes(text: string): string[] {
  const nfc = text.normalize("NFC");
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(nfc), (s) => s.segment);
  }
  return Array.from(nfc);
}

/**
 * Divide el texto de `el` en líneas (según cómo se ve ahora) y cada línea en
 * caracteres. Los spans llevan aria-hidden: el nombre accesible del elemento
 * debe venir de su aria-label.
 */
export function splitLinesAndChars(el: HTMLElement): SplitResult {
  const original = el.innerHTML;
  const words = (el.textContent ?? "").replace(/\s+/g, " ").trim().split(" ");

  // 1) Medir: una span por palabra y agrupar por posición vertical
  el.textContent = "";
  const probes = words.map((word, i) => {
    const span = document.createElement("span");
    span.textContent = word;
    el.append(span);
    if (i < words.length - 1) el.append(" ");
    return span;
  });
  const lines: string[][] = [];
  let lastTop = Number.NEGATIVE_INFINITY;
  probes.forEach((span, i) => {
    const top = span.getBoundingClientRect().top;
    if (Math.abs(top - lastTop) > 2) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(words[i]);
  });

  // 2) Construir líneas y caracteres
  el.textContent = "";
  const chars: HTMLElement[] = [];
  for (const [lineIndex, lineWords] of lines.entries()) {
    const line = document.createElement("span");
    line.setAttribute("aria-hidden", "true");
    line.style.display = "block";
    line.style.whiteSpace = "nowrap";
    for (const g of graphemes(lineWords.join(" "))) {
      if (/^\s+$/.test(g)) {
        line.append(" ");
        continue;
      }
      const char = document.createElement("span");
      char.setAttribute("aria-hidden", "true");
      char.style.display = "inline-block";
      char.style.position = "relative";
      char.style.opacity = "0";
      char.textContent = g;
      line.append(char);
      chars.push(char);
    }
    // Espacio al final de cada línea (no se ve: el corte lo absorbe) para que
    // el texto copiado no junte palabras ("JessicaBlanco")
    if (lineIndex < lines.length - 1) line.append(" ");
    el.append(line);
  }

  return {
    chars,
    revert: () => {
      el.innerHTML = original;
    },
  };
}

const randomLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];

/**
 * Anima los caracteres de `splitLinesAndChars`. Devuelve una función que
 * detiene la animación (no restaura el texto: para eso está `revert`).
 */
export function scramble(chars: HTMLElement[], onComplete?: () => void): () => void {
  // Los caracteres se resuelven de izquierda a derecha: lo ya resuelto no se
  // mueve aunque las letras al azar cambien de ancho
  const finals = chars.map((c) => c.textContent ?? "");
  const step = chars.length > 1 ? Math.min(STEP, (MAX_TOTAL - RESOLVE) / (chars.length - 1)) : STEP;
  const ticks = Math.ceil(RESOLVE / TICK) + 1;
  const plans = chars.map(() => ({
    letters: Array.from({ length: ticks }, randomLetter),
    flicker: Array.from({ length: ticks }, (_, k) => k > 0 && Math.random() < FLICKER_CHANCE),
  }));
  const shown = chars.map(() => ({ text: "", opacity: "" }));

  let raf = 0;
  let t0 = -1;

  const frame = (now: number) => {
    if (t0 < 0) t0 = now;
    const t = now - t0;
    let pending = false;

    chars.forEach((c, i) => {
      const local = t - i * step;
      let text: string;
      let opacity: string;

      if (local >= RESOLVE) {
        text = finals[i];
        opacity = "1";
      } else {
        pending = true;
        const k = Math.max(0, Math.floor(local / TICK));
        text = plans[i].letters[k];
        if (local < IN_HALF) opacity = "0";
        else if (local < IN_FULL) opacity = "0.6";
        else opacity = plans[i].flicker[k] && local - k * TICK < FLICKER ? "0.6" : "1";
      }

      if (shown[i].text !== text) {
        c.textContent = text;
        shown[i].text = text;
      }
      if (shown[i].opacity !== opacity) {
        c.style.opacity = opacity;
        shown[i].opacity = opacity;
      }
    });

    if (pending) raf = requestAnimationFrame(frame);
    else onComplete?.();
  };

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
