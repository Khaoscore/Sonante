/**
 * Cloudflare Turnstile: verificación anti-robots del formulario de contacto.
 * Solo se carga si existe PUBLIC_TURNSTILE_SITE_KEY. Con appearance "interaction-only"
 * no se ve nada salvo que Cloudflare tenga dudas y pida un clic.
 */

export type TurnstileOptions = {
  sitekey: string;
  action?: string;
  theme?: "light" | "dark" | "auto";
  language?: string;
  size?: "normal" | "flexible" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  "refresh-expired"?: "auto" | "manual" | "never";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: (code: string) => boolean | void;
  "before-interactive-callback"?: () => void;
  "after-interactive-callback"?: () => void;
};

export type Turnstile = {
  render(container: HTMLElement, options: TurnstileOptions): string | undefined;
  getResponse(widgetId?: string): string | undefined;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<Turnstile> | null = null;

export function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("turnstile"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Espera a que haya token (suele estar listo en 1–2 s); devuelve "" si no llega a tiempo. */
export function waitForToken(read: () => string, timeout = 8000): Promise<string> {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      const token = read();
      if (token || Date.now() - start >= timeout) resolve(token);
      else setTimeout(tick, 200);
    };
    tick();
  });
}
