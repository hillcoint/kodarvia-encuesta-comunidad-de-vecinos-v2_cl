import { useEffect, useState, useSyncExternalStore } from "react";
import { obtenerEstado, obtenerEstadoServidor, suscribir } from "@/lib/almacen";

/**
 * Devuelve respuestas y alertas guardadas en localStorage y se re-renderiza
 * automáticamente ante cualquier cambio (nueva respuesta, cambio de estado,
 * otra pestaña…), sin recargar la página.
 */
export function useAlmacen() {
  return useSyncExternalStore(suscribir, obtenerEstado, obtenerEstadoServidor);
}

/** true una vez montado en el navegador (localStorage disponible). */
export function useHidratado(): boolean {
  const [hidratado, setHidratado] = useState(false);
  useEffect(() => setHidratado(true), []);
  return hidratado;
}
