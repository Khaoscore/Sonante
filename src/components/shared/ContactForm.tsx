import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { legalPaths, type Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import { loadTurnstile, waitForToken } from "@/lib/turnstile";
import Button from "@/components/ui/Button";
import { ChevronDown, Globe, Mail, Pen, Phone, User } from "@/components/ui/Icons";
import styles from "./ContactForm.module.css";

type Status = "idle" | "sending" | "ok" | "error" | "verify";

type Props = { lang?: Locale };

const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;
const captchaKey = endpoint ? (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) : undefined;

/**
 * Formulario de contacto (frame 43:977 del diseño). Si existe la variable
 * PUBLIC_FORM_ENDPOINT se envía por POST (application/x-www-form-urlencoded) al
 * Apps Script de apps-script/formulario-contacto/, que guarda el mensaje en Google
 * Sheets y envía los correos; el endpoint debe responder { "ok": true }. Sin
 * endpoint, abre el cliente de correo con el mensaje prellenado.
 *
 * Contra robots: campo trampa oculto, tiempo mínimo de llenado y, si existe
 * PUBLIC_TURNSTILE_SITE_KEY, Cloudflare Turnstile.
 *
 * La casilla de autorización es obligatoria (Ley 1581 de 2012: autorización previa,
 * expresa e informada) y su constancia viaja con cada mensaje.
 */
export default function ContactForm({ lang = "es" }: Props) {
  const f = ui[lang].form;
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const cityOptions = f.countries.find((c) => c.name === country)?.cities ?? [];
  const startedAt = useRef(0);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const token = useRef("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!captchaKey) return;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !captchaRef.current) return;
        widgetId.current = turnstile.render(captchaRef.current, {
          sitekey: captchaKey,
          action: "contacto",
          theme: "light",
          language: lang,
          appearance: "interaction-only",
          "refresh-expired": "auto",
          callback: (t) => (token.current = t),
          "expired-callback": () => (token.current = ""),
          "error-callback": () => {
            token.current = "";
          },
          "before-interactive-callback": () => setCaptchaVisible(true),
          "after-interactive-callback": () => setCaptchaVisible(false),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
      token.current = "";
    };
  }, [lang]);

  /** Los tokens de Turnstile son de un solo uso: se pide uno nuevo tras cada envío. */
  function resetCaptcha() {
    token.current = "";
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }

  async function onSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("idioma", lang);
    data.set("autorizacion_datos", f.consent.record);
    setStatus("sending");

    if (endpoint) {
      data.set("pagina", window.location.pathname);
      data.set("t", String(Date.now() - startedAt.current));
      if (captchaKey) {
        const t = await waitForToken(() => token.current || window.turnstile?.getResponse(widgetId.current) || "");
        if (!t) {
          setStatus("verify");
          return;
        }
        data.set("cf-turnstile-response", t);
      }

      const body = new URLSearchParams();
      data.forEach((value, key) => {
        if (typeof value === "string") body.append(key, value);
      });

      try {
        const res = await fetch(endpoint, { method: "POST", body, headers: { Accept: "application/json" } });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!res.ok || !json?.ok) {
          setStatus(json?.error === "verificacion" ? "verify" : "error");
          return;
        }
        setStatus("ok");
        form.reset();
        setCountry("");
      } catch {
        setStatus("error");
      } finally {
        resetCaptcha();
      }
      return;
    }

    const lines = [
      `${f.mailFields.name}: ${data.get("nombre")}`,
      `${f.mailFields.phone}: ${data.get("telefono")}`,
      `${f.mailFields.country}: ${data.get("pais")}`,
      `${f.mailFields.city}: ${data.get("ciudad")}`,
      `${f.mailFields.email}: ${data.get("correo")}`,
      "",
      String(data.get("mensaje") ?? ""),
      "",
      f.consent.record,
    ];
    const subject = encodeURIComponent(`${f.mailSubject} — ${data.get("nombre")}`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setStatus("ok");
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {/* Campo trampa: invisible para las personas; si llega lleno, es un robot */}
      <div className={styles.trap} aria-hidden="true">
        <label>
          Sitio web
          <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className={styles.label} id="lbl-sobre-ti">
        {f.aboutYou}
      </p>
      <div className={styles.row} role="group" aria-labelledby="lbl-sobre-ti">
        <label className={styles.field}>
          <User className={styles.icon} />
          <input type="text" name="nombre" placeholder={f.fullName} aria-label={f.fullName} autoComplete="name" required />
        </label>
        <label className={styles.field}>
          <Phone className={styles.icon} />
          <input type="tel" name="telefono" placeholder={f.phone} aria-label={f.phone} autoComplete="tel" inputMode="tel" required />
        </label>
      </div>

      <p className={styles.label} id="lbl-donde">
        {f.whereFrom}
      </p>
      <div className={styles.row} role="group" aria-labelledby="lbl-donde">
        <label className={`${styles.field} ${styles.select}`}>
          <Globe className={styles.icon} />
          <select name="pais" value={country} onChange={(e) => setCountry(e.target.value)} required aria-label={f.country}>
            <option value="" disabled>
              {f.selectCountry}
            </option>
            {f.countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.chevron} />
        </label>
        <label className={`${styles.field} ${styles.select}`}>
          <Globe className={styles.icon} />
          <select name="ciudad" defaultValue="" required aria-label={f.city} disabled={!country}>
            <option value="" disabled>
              {f.selectCity}
            </option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.chevron} />
        </label>
      </div>

      <label className={styles.label} htmlFor="correo">
        {f.emailLabel}
      </label>
      <div className={styles.row}>
        <span className={`${styles.field} ${styles.full}`}>
          <Mail className={styles.icon} />
          <input id="correo" type="email" name="correo" placeholder={f.emailPlaceholder} autoComplete="email" inputMode="email" required />
        </span>
      </div>

      <label className={styles.label} htmlFor="mensaje">
        {f.message}
      </label>
      <span className={`${styles.field} ${styles.textarea}`}>
        <Pen className={styles.icon} />
        <textarea id="mensaje" name="mensaje" placeholder={f.messagePlaceholder} rows={6} required />
      </span>

      <label className={styles.consent}>
        <input type="checkbox" name="autorizacion_datos" required />
        <span>
          {f.consent.before}
          <a href={legalPaths.data} target="_blank" rel="noopener" hrefLang="es">
            {f.consent.data}
          </a>
          {f.consent.and}
          <a href={legalPaths.privacy} target="_blank" rel="noopener" hrefLang="es">
            {f.consent.privacy}
          </a>
          {f.consent.after}
        </span>
      </label>

      {captchaKey && <div ref={captchaRef} className={`${styles.captcha} ${captchaVisible ? styles.captchaVisible : ""}`} />}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={status === "sending"}>
          {status === "sending" ? f.sending : f.send}
        </Button>
        <p className={styles.status} role="status" aria-live="polite">
          {status === "ok" && f.success}
          {status === "error" && `${f.error} ${site.email}`}
          {status === "verify" && f.verify}
        </p>
      </div>
    </form>
  );
}
