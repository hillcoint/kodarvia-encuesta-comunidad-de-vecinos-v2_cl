import type { Alerta, Respuesta, TipoResultado } from "@/types/encuesta";
import { CONFIG_ALERTAS } from "@/data/catalogo";
import { agregarAlerta, generarId } from "./almacen";

/**
 * ALERTAS SIMULADAS
 * -----------------
 * Una valoración general de 1 o 2 estrellas dispara una alerta al responsable.
 * En esta demo NO se envía nada: la alerta se registra en localStorage y se
 * muestra en pantalla.
 *
 * Para conectar un envío real (webhook, email, WhatsApp Business API…),
 * Kodarvia solo tiene que implementar `enviarReal` y rellenar
 * `CONFIG_ALERTAS.webhookUrl` en `src/data/catalogo.ts`. El resto de la app
 * no necesita cambios.
 */

/** Regla de negocio: qué ve el residente según su valoración general. */
export function tipoResultado(valoracionGeneral: number): TipoResultado {
  if (valoracionGeneral <= 2) return "critica";
  if (valoracionGeneral === 3) return "neutra";
  return "positiva";
}

export function requiereAlerta(valoracionGeneral: number): boolean {
  return tipoResultado(valoracionGeneral) === "critica";
}

export function muestraResenaGoogle(valoracionGeneral: number): boolean {
  return tipoResultado(valoracionGeneral) === "positiva";
}

export function construirAlerta(respuesta: Respuesta): Alerta {
  return {
    id: generarId("al"),
    fecha: new Date().toISOString(),
    respuestaId: respuesta.id,
    edificio: respuesta.edificio,
    servicio: respuesta.servicio,
    valoracionGeneral: respuesta.valoracionGeneral,
    canales: [...CONFIG_ALERTAS.canales],
    destinatario: CONFIG_ALERTAS.destinatario,
    mensaje: `Valoración de ${respuesta.valoracionGeneral} ★ en ${respuesta.edificio} (${respuesta.servicio}).`,
    resultado: "simulado",
  };
}

/**
 * Punto de integración para el envío real. Ejemplo de implementación:
 *
 *   await fetch(CONFIG_ALERTAS.webhookUrl, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ alerta, respuesta }),
 *   });
 */
async function enviarReal(_alerta: Alerta, _respuesta: Respuesta): Promise<"enviado" | "error"> {
  return "error";
}

/**
 * Dispara la alerta de una respuesta crítica: la registra y la "envía".
 * Devuelve la alerta registrada para mostrarla en pantalla.
 */
export async function dispararAlerta(respuesta: Respuesta): Promise<Alerta> {
  const alerta = construirAlerta(respuesta);
  if (CONFIG_ALERTAS.webhookUrl) {
    alerta.resultado = await enviarReal(alerta, respuesta);
  }
  agregarAlerta(alerta);
  return alerta;
}
