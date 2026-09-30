/**
 * Catálogo y configuración de la demo.
 * Todo lo que Kodarvia quiera ajustar (edificios, servicios, destinatarios de
 * alertas, enlace de reseñas, textos legales) está centralizado aquí.
 */

export interface ItemCatalogo {
  /** Identificador usado en los enlaces y códigos QR (?edificio=…&servicio=…). */
  slug: string;
  nombre: string;
}

export const EDIFICIOS: ItemCatalogo[] = [
  { slug: "torres-del-refugio", nombre: "Torres del Refugio" },
  { slug: "parque-residencial-normandia", nombre: "Parque Residencial Normandía" },
  { slug: "conjunto-residencial-los-almendros", nombre: "Conjunto Residencial Los Almendros" },
  { slug: "reservas-de-santa-barbara", nombre: "Reservas de Santa Bárbara" },
  { slug: "edificio-mirador-de-la-sabana", nombre: "Edificio Mirador de la Sabana" },
];

export const SERVICIOS: ItemCatalogo[] = [
  { slug: "mantenimiento-de-ascensores", nombre: "Mantenimiento de ascensores" },
  { slug: "jardineria", nombre: "Jardinería" },
  { slug: "seguridad-perimetral", nombre: "Seguridad perimetral" },
  { slug: "limpieza-de-areas-comunes", nombre: "Limpieza de áreas comunes" },
  { slug: "reparaciones", nombre: "Reparaciones" },
  { slug: "atencion-administrativa", nombre: "Atención administrativa" },
];

export function edificioPorSlug(slug: string | undefined): ItemCatalogo | undefined {
  return slug ? EDIFICIOS.find((e) => e.slug === slug) : undefined;
}

export function servicioPorSlug(slug: string | undefined): ItemCatalogo | undefined {
  return slug ? SERVICIOS.find((s) => s.slug === slug) : undefined;
}

export const EMPRESA = {
  nombre: "Gestión de Comunidades Convivir",
  nombreCorto: "Convivir",
};

/**
 * Configuración de alertas (SIMULADAS).
 * Kodarvia puede sustituir la simulación por un webhook o email real
 * editando `src/lib/alertas.ts` (ver `enviarAlerta`).
 */
export const CONFIG_ALERTAS = {
  destinatario: "Responsable de atención al residente",
  canales: ["whatsapp", "correo"] as const,
  /** URL de webhook para la futura integración real. Vacía = modo simulado. */
  webhookUrl: "",
};

/** Enlace SIMULADO a la ficha de reseñas de Google. */
export const ENLACE_RESENA_GOOGLE = "https://g.page/r/convivir-demo/review";

/** Textos de marcador: Kodarvia redactará los textos legales definitivos. */
export const TEXTOS_LEGALES = {
  consentimiento: "Acepto el tratamiento de mis datos personales para gestionar esta valoración.",
  politica:
    "[Texto marcador] Aquí se incluirá la política de tratamiento de datos personales de Gestión de Comunidades Convivir. El texto legal definitivo será redactado por Kodarvia.",
  pie: "[Texto marcador] Aviso de privacidad pendiente de redacción definitiva por Kodarvia.",
};
