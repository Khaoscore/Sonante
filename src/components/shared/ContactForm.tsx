import { useState } from "react";
import { site } from "@/data/site";
import type { Locale } from "@/i18n";
import { ui } from "@/i18n/ui";
import Button from "@/components/ui/Button";
import { ChevronDown, Globe, Mail, Pen, Phone, User } from "@/components/ui/Icons";
import styles from "./ContactForm.module.css";

type Status = "idle" | "sending" | "ok" | "error";

type Props = { lang?: Locale };

/**
 * Formulario de contacto (frame 43:977 del diseño). Si existe la variable
 * PUBLIC_FORM_ENDPOINT se envía por POST (Formspree, Getform, n8n, etc.);
 * si no, abre el cliente de correo con el mensaje prellenado.
 */
export default function ContactForm({ lang = "es" }: Props) {
  const f = ui[lang].form;
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const cityOptions = f.countries.find((c) => c.name === country)?.cities ?? [];
  const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

  async function onSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("idioma", lang);
    setStatus("sending");

    if (endpoint) {
      try {
        const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        setStatus("ok");
        form.reset();
        setCountry("");
      } catch {
        setStatus("error");
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
    ];
    const subject = encodeURIComponent(`${f.mailSubject} — ${data.get("nombre")}`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setStatus("ok");
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
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

      <div className={styles.actions}>
        <Button type="submit" variant="white" disabled={status === "sending"}>
          {status === "sending" ? f.sending : f.send}
        </Button>
        <p className={styles.status} role="status" aria-live="polite">
          {status === "ok" && f.success}
          {status === "error" && `${f.error} ${site.email}`}
        </p>
      </div>
    </form>
  );
}
