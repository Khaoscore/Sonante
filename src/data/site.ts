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

export type SocialLink = {
  name: string;
  href: string;
  icon: string;
};

export const social: SocialLink[] = [
  { name: "WhatsApp", href: "https://wa.me/", icon: "/assets/icons/icon-whatsapp.svg" },
  { name: "TikTok", href: "https://www.tiktok.com/@sonanteagencia", icon: "/assets/icons/icon-tiktok.svg" },
  { name: "Instagram", href: "https://www.instagram.com/sonanteagencia", icon: "/assets/icons/icon-instagram.svg" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/sonante", icon: "/assets/icons/icon-linkedin.svg" },
  { name: "Threads", href: "https://www.threads.net/@sonanteagencia", icon: "/assets/icons/icon-threads.svg" },
  { name: "Facebook", href: "https://www.facebook.com/sonanteagencia", icon: "/assets/icons/icon-facebook.svg" },
];
