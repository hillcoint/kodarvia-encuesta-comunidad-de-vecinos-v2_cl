import type { Alerta, EstadoAtencion, Respuesta } from "@/types/encuesta";
import { generarDatosEjemplo } from "@/data/datos-ejemplo";

/**
 * Almacén local de la demo. TODOS los datos viven en localStorage:
 *   - convivir.respuestas.v1 → respuestas de la encuesta
 *   - convivir.alertas.v1    → registro de alertas simuladas
 *
 * Expone un patrón "suscribir / leer" compatible con useSyncExternalStore,
 * de modo que cualquier cambio (incluso desde otra pestaña) se refleja al
 * instante en el panel sin recargar la página.
 */

export const CLAVE_RESPUESTAS = "convivir.respuestas.v1";
export const CLAVE_ALERTAS = "convivir.alertas.v1";

type Estado = { respuestas: Respuesta[]; alertas: Alerta[] };

const VACIO: Estado = { respuestas: [], alertas: [] };

let cache: Estado | null = null;
const oyentes = new Set<() => void>();

function hayNavegador(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function leerClave<T>(clave: string): T[] | null {
  try {
    const bruto = window.localStorage.getItem(clave);
    if (bruto === null) return null;
    const datos: unknown = JSON.parse(bruto);
    return Array.isArray(datos) ? (datos as T[]) : null;
  } catch {
    return null;
  }
}

function escribir(estado: Estado): void {
  try {
    window.localStorage.setItem(CLAVE_RESPUESTAS, JSON.stringify(estado.respuestas));
    window.localStorage.setItem(CLAVE_ALERTAS, JSON.stringify(estado.alertas));
  } catch {
    // Almacenamiento lleno o bloqueado: la demo sigue funcionando en memoria.
  }
}

/** Carga desde localStorage; si no hay datos, precarga los de ejemplo. */
function cargar(): Estado {
  const respuestas = leerClave<Respuesta>(CLAVE_RESPUESTAS);
  const alertas = leerClave<Alerta>(CLAVE_ALERTAS);
  if (respuestas === null) {
    const ejemplo = generarDatosEjemplo();
    escribir(ejemplo);
    return ejemplo;
  }
  return { respuestas, alertas: alertas ?? [] };
}

function emitir(): void {
  oyentes.forEach((fn) => fn());
}

function actualizar(fn: (e: Estado) => Estado): void {
  const siguiente = fn(obtenerEstado());
  cache = siguiente;
  escribir(siguiente);
  emitir();
}

export function obtenerEstado(): Estado {
  if (!hayNavegador()) return VACIO;
  if (cache === null) cache = cargar();
  return cache;
}

export function obtenerEstadoServidor(): Estado {
  return VACIO;
}

export function suscribir(fn: () => void): () => void {
  oyentes.add(fn);
  const alCambiarOtraPestana = (ev: StorageEvent) => {
    if (ev.key === null || ev.key === CLAVE_RESPUESTAS || ev.key === CLAVE_ALERTAS) {
      cache = cargar();
      emitir();
    }
  };
  if (hayNavegador()) window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(fn);
    if (hayNavegador()) window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

export function agregarRespuesta(respuesta: Respuesta): void {
  actualizar((e) => ({ ...e, respuestas: [respuesta, ...e.respuestas] }));
}

export function agregarAlerta(alerta: Alerta): void {
  actualizar((e) => ({ ...e, alertas: [alerta, ...e.alertas] }));
}

export function cambiarEstado(id: string, estado: EstadoAtencion): void {
  actualizar((e) => ({
    ...e,
    respuestas: e.respuestas.map((r) => (r.id === id ? { ...r, estado } : r)),
  }));
}

/** Borra todo y vuelve a cargar los datos de ejemplo (con fechas recalculadas). */
export function restablecerDatosEjemplo(): void {
  actualizar(() => generarDatosEjemplo());
}

export function generarId(prefijo: string): string {
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${prefijo}-${Date.now().toString(36)}-${aleatorio}`;
}
