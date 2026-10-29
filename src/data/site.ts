/**
 * Datos globales no traducibles del sitio (identidad, contacto, redes).
 * Los textos de interfaz están en src/i18n/ui.ts y las rutas en src/i18n/index.ts.
 *
 * Los enlaces de redes sociales que no aparecen en el diseño quedan como URL de
 * perfil genéricas: ajustar con los datos reales del cliente.
 */

export const site = {
  name: "Sonante",
  legalName: "Sonante SAS",
  nit: "901821689",
  city: "Bogotá D.C.",
  url: "https://sonante.co",
  email: "sonanteagencia@gmail.com",
  poweredBy: { label: "Khaos Core", href: "https://khaoscore.com" },
  copyrightYear: 2026,
} as const;

/** Redes con icono animado en src/components/layout/SocialIcon.tsx */
export type SocialId = "whatsapp" | "tiktok" | "instagram" | "linkedin" | "threads" | "facebook";

export type SocialLink = {
  id: SocialId;
  name: string;
  href: string;
};

export const social: SocialLink[] = [
  { id: "whatsapp", name: "WhatsApp", href: "https://wa.me/" },
  { id: "tiktok", name: "TikTok", href: "https://www.tiktok.com/@sonanteagencia" },
  { id: "instagram", name: "Instagram", href: "https://www.instagram.com/sonanteagencia" },
  { id: "linkedin", name: "LinkedIn", href: "https://www.linkedin.com/company/sonante" },
  { id: "threads", name: "Threads", href: "https://www.threads.net/@sonanteagencia" },
  { id: "facebook", name: "Facebook", href: "https://www.facebook.com/sonanteagencia" },
];
