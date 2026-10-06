import type { SVGProps } from "react";

/**
 * Iconos de la librería (Streamline Core) incrustados como SVG para poder
 * colorearlos con `currentColor`. Las rutas provienen de los exports de Figma.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

const base = (size: number | string | undefined, fallback: number) => ({
  width: size ?? fallback,
  height: size ?? fallback,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
});

export function ChevronRight({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...base(size, 14)} {...rest}>
      <path d="M3.85 0.5L10 6.65C10.0478 6.69489 10.086 6.74911 10.112 6.80931C10.1381 6.8695 10.1515 6.9344 10.1515 7C10.1515 7.0656 10.1381 7.1305 10.112 7.19069C10.086 7.25089 10.0478 7.30511 10 7.35L3.85 13.5" />
    </svg>
  );
}

export function ChevronLeft({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...base(size, 14)} {...rest}>
      <path d="M10.15 0.5L4 6.65C3.95217 6.69489 3.91404 6.74911 3.88798 6.80931C3.86192 6.8695 3.84848 6.9344 3.84848 7C3.84848 7.0656 3.86192 7.1305 3.88798 7.19069C3.91404 7.25089 3.95217 7.30511 4 7.35L10.15 13.5" />
    </svg>
  );
}

export function ChevronDown({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...base(size, 14)} {...rest}>
      <path d="M0.5 3.85L6.65 10C6.69489 10.0478 6.74911 10.086 6.80931 10.112C6.8695 10.1381 6.9344 10.1515 7 10.1515C7.0656 10.1515 7.1305 10.1381 7.19069 10.112C7.25089 10.086 7.30511 10.0478 7.35 10L13.5 3.85" />
    </svg>
  );
}

export function Globe({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...base(size, 14)} {...rest}>
      <path d="M7 13.5C10.5899 13.5 13.5 10.5899 13.5 7C13.5 3.41015 10.5899 0.5 7 0.5C3.41015 0.5 0.5 3.41015 0.5 7C0.5 10.5899 3.41015 13.5 7 13.5Z" />
      <path d="M0.5 7H13.5" />
      <path d="M9.5 7C9.3772 9.37699 8.50168 11.6533 7 13.5C5.49832 11.6533 4.6228 9.37699 4.5 7C4.6228 4.62301 5.49832 2.34665 7 0.5C8.50168 2.34665 9.3772 4.62301 9.5 7V7Z" />
    </svg>
  );
}

export function User({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 13.36 14" {...base(size, 14)} {...rest}>
      <path d="M6.68 7C8.47493 7 9.93 5.54493 9.93 3.75C9.93 1.95507 8.47493 0.5 6.68 0.5C4.88508 0.5 3.43 1.95507 3.43 3.75C3.43 5.54493 4.88508 7 6.68 7Z" />
      <path d="M12.86 13.5C12.4402 12.1909 11.6155 11.0489 10.5048 10.2386C9.3941 9.42842 8.05481 8.99184 6.68 8.99184C5.3052 8.99184 3.96591 9.42842 2.85522 10.2386C1.74453 11.0489 0.919826 12.1909 0.500004 13.5H12.86Z" />
    </svg>
  );
}

export function Phone({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" {...base(size, 14)} {...rest}>
      <path d="M8.76 13C9.37583 13.3973 10.1097 13.5704 10.8381 13.4903C11.5666 13.4102 12.2453 13.0817 12.76 12.56L13.21 12.12C13.4073 11.9182 13.5177 11.6472 13.5177 11.365C13.5177 11.0828 13.4073 10.8118 13.21 10.61L11.3 8.72C11.0999 8.52335 10.8306 8.41315 10.55 8.41315C10.2694 8.41315 10.0001 8.52335 9.8 8.72V8.72C9.59821 8.91728 9.32721 9.02775 9.045 9.02775C8.76279 9.02775 8.49179 8.91728 8.29 8.72L5.29 5.72C5.18992 5.62138 5.11045 5.50384 5.05621 5.37423C5.00196 5.24461 4.97403 5.10551 4.97403 4.965C4.97403 4.82449 5.00196 4.68539 5.05621 4.55577C5.11045 4.42616 5.18992 4.30862 5.29 4.21V4.21C5.48665 4.0099 5.59685 3.74056 5.59685 3.46C5.59685 3.17944 5.48665 2.9101 5.29 2.71L3.39 0.81C3.18821 0.612715 2.91721 0.502253 2.635 0.502253C2.35279 0.502253 2.08179 0.612715 1.88 0.81L1.44 1.26C0.918346 1.77474 0.589835 2.4534 0.509704 3.18187C0.429572 3.91033 0.602708 4.64417 1 5.26C3.07004 8.31073 5.70394 10.9378 8.76 13V13Z" />
    </svg>
  );
}

export function Mail({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 14 11.5" {...base(size, 14)} {...rest} height={typeof size === "number" ? size * (11.5 / 14) : rest.height ?? 11.5}>
      <path d="M12.5 0.5H1.50001C0.947725 0.5 0.50001 0.947715 0.50001 1.5V10C0.50001 10.5523 0.947725 11 1.50001 11H12.5C13.0523 11 13.5 10.5523 13.5 10V1.5C13.5 0.947715 13.0523 0.5 12.5 0.5Z" />
      <path d="M0.50001 1.75L6.36001 6.75C6.5397 6.89967 6.76616 6.98163 7.00001 6.98163C7.23386 6.98163 7.46032 6.89967 7.64001 6.75L13.5 1.75" />
    </svg>
  );
}

export function Pen({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 14.0058 14.0058" {...base(size, 14)} {...rest}>
      <path d="M0.5 13.5058H11.5" />
      <path d="M6.5 10.0058L3.5 10.5458L4 7.5058L10.73 0.795798C10.823 0.70207 10.9336 0.627676 11.0554 0.576907C11.1773 0.526138 11.308 0.5 11.44 0.5C11.572 0.5 11.7027 0.526138 11.8246 0.576907C11.9464 0.627676 12.057 0.70207 12.15 0.795798L13.21 1.8558C13.3037 1.94876 13.3781 2.05936 13.4289 2.18122C13.4797 2.30308 13.5058 2.43379 13.5058 2.5658C13.5058 2.69781 13.4797 2.82852 13.4289 2.95037C13.3781 3.07223 13.3037 3.18284 13.21 3.2758L6.5 10.0058Z" />
    </svg>
  );
}

export function ArrowUp({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, 24)} {...rest} strokeWidth={1.75}>
      <path d="M12 19V5" />
      <path d="M6 11L12 5L18 11" />
    </svg>
  );
}

export function Menu({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, 24)} {...rest} strokeWidth={2}>
      <path d="M3 6H21" />
      <path d="M3 12H21" />
      <path d="M3 18H21" />
    </svg>
  );
}

export function Close({ size, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(size, 24)} {...rest} strokeWidth={2}>
      <path d="M5 5L19 19" />
      <path d="M19 5L5 19" />
    </svg>
  );
}

/**
 * Símbolo "S" de Sonante. Usa currentColor; con `accent` pinta el trazo superior
 * de otro color, como el logo oficial (arriba verde, abajo blanco).
 */
export function SonanteSymbol({ size, accent, ...rest }: IconProps & { accent?: string }) {
  return (
    <svg viewBox="0 0 75.058 99.23" width={size ?? 35} height={typeof size === "number" ? size * (99.23 / 75.058) : 47} fill="currentColor" aria-hidden focusable={false} {...rest}>
      <path d="M52.204 45.87C47.496 45.813 43.14 46.866 38.05 47.682C47.923 53.068 58.047 58.396 58.047 69.027C58.047 81.556 47.249 86.267 37.53 86.267C17.252 86.267 15.88 64.078 15.88 64.078H0C0 64.078 -0.602001 99.23 37.529 99.23C57.535 99.23 75.058 89.22 75.058 70.954C75.058 56.489 66.235 46.039 52.204 45.87Z" />
      <path style={accent ? { fill: accent } : undefined} d="M19.484 27.53C19.484 19.436 27.143 13.084 37.53 13.084C49.078 13.084 55.667 22.864 55.667 30.155H71.426C71.426 19.538 64.292 0 37.53 0C18.795 0 2.944 10.991 2.944 25.995C2.944 40.999 14.802 47.996 24.231 48.516C29.635 48.814 34.068 48.321 38.05 47.682C28.653 42.556 19.484 37.379 19.484 27.53Z" />
    </svg>
  );
}
