import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "./Icons";
import styles from "./Button.module.css";

type Variant = "primary" | "white" | "outline";

type CommonProps = {
  variant?: Variant;
  /** Muestra la flecha "›" a la derecha (como en el componente "Primary button" de Figma) */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type NativeButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type ButtonProps = AnchorProps | NativeButtonProps;

/**
 * Componente "Primary button" de la librería Sonante.
 * - primary: fondo verde, texto verde oscuro (CTA del hero).
 * - white: fondo blanco, texto verde oscuro (enviar formulario).
 * - outline: fondo verde oscuro, texto verde (selector de idioma).
 */
export default function Button(props: ButtonProps) {
  const { variant = "primary", arrow = true, className = "", children, ...rest } = props;
  const cls = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  if ("href" in rest && rest.href) {
    const { href, ...a } = rest as AnchorProps;
    return (
      <a href={href} className={cls} {...a}>
        <span>{children}</span>
        {arrow && <ChevronRight className={styles.icon} />}
      </a>
    );
  }

  const b = rest as NativeButtonProps;
  return (
    <button type={b.type ?? "button"} className={cls} {...b}>
      <span>{children}</span>
      {arrow && <ChevronRight className={styles.icon} />}
    </button>
  );
}
