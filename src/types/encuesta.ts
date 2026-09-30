/** Estados de atención de una respuesta/incidencia. */
export const ESTADOS = ["Pendiente", "En atención", "Resuelto"] as const;
export type EstadoAtencion = (typeof ESTADOS)[number];

/** Valoración en estrellas (1 a 5). */
export type Estrellas = 1 | 2 | 3 | 4 | 5;

/** Respuesta de la encuesta tal y como se guarda en localStorage. */
export interface Respuesta {
  id: string;
  /** Fecha y hora en formato ISO 8601. */
  fecha: string;
  edificio: string;
  servicio: string;
  valoracionGeneral: Estrellas;
  tiempoRespuesta: Estrellas;
  tratoPersonal: Estrellas;
  valoracionServicio: Estrellas;
  comentario: string;
  /** Datos de contacto opcionales (nombre y teléfono/correo). Cadena vacía si no se facilitan. */
  contacto: string;
  consentimiento: boolean;
  estado: EstadoAtencion;
}

/** Canales por los que se envía (de forma simulada) una alerta. */
export type CanalAlerta = "whatsapp" | "correo";

/** Registro de una alerta simulada disparada por una valoración de 1 o 2 estrellas. */
export interface Alerta {
  id: string;
  fecha: string;
  respuestaId: string;
  edificio: string;
  servicio: string;
  valoracionGeneral: Estrellas;
  canales: CanalAlerta[];
  destinatario: string;
  mensaje: string;
  /** Siempre "simulado" en esta demo; un envío real devolvería "enviado" o "error". */
  resultado: "simulado" | "enviado" | "error";
}

/** Tipo de resultado que ve el residente tras enviar la encuesta. */
export type TipoResultado = "critica" | "neutra" | "positiva";
