import type { Respuesta } from "@/types/encuesta";

/** Filtros del panel. Fechas en formato "AAAA-MM-DD" (hora local). */
export interface Filtros {
  desde: string;
  hasta: string;
  edificio: string; // nombre del edificio o "" para todos
  calificacion: number; // 1-5, o 0 para todas
}

export const FILTROS_VACIOS: Filtros = { desde: "", hasta: "", edificio: "", calificacion: 0 };

function claveDia(fecha: Date): string {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${a}-${m}-${d}`;
}

export function aplicarFiltros(respuestas: Respuesta[], f: Filtros): Respuesta[] {
  return respuestas.filter((r) => {
    const dia = claveDia(new Date(r.fecha));
    if (f.desde && dia < f.desde) return false;
    if (f.hasta && dia > f.hasta) return false;
    if (f.edificio && r.edificio !== f.edificio) return false;
    if (f.calificacion && r.valoracionGeneral !== f.calificacion) return false;
    return true;
  });
}

export function hayFiltrosActivos(f: Filtros): boolean {
  return Boolean(f.desde || f.hasta || f.edificio || f.calificacion);
}

function promedio(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export const ASPECTOS = [
  { clave: "tiempoRespuesta", etiqueta: "Tiempo de respuesta" },
  { clave: "tratoPersonal", etiqueta: "Trato del personal" },
  { clave: "valoracionServicio", etiqueta: "Valoración del servicio" },
] as const;

export interface PuntoEvolucion {
  clave: string;
  etiqueta: string;
  promedio: number;
  respuestas: number;
}

export interface Metricas {
  total: number;
  promedioGeneral: number;
  distribucion: { estrellas: number; cantidad: number; porcentaje: number }[];
  criticas: number;
  positivas: number;
  porcentajePositivas: number;
  pendientes: number;
  aspectos: { clave: string; etiqueta: string; promedio: number }[];
  mejorAspecto: { clave: string; etiqueta: string; promedio: number } | null;
  peorAspecto: { clave: string; etiqueta: string; promedio: number } | null;
  porServicio: { servicio: string; promedio: number; total: number }[];
  evolucion: PuntoEvolucion[];
}

/** Lunes de la semana de una fecha (hora local). */
function inicioSemana(fecha: Date): Date {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const dia = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dia);
  return d;
}

const formatoCorto = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" });

export function calcularEvolucion(respuestas: Respuesta[]): PuntoEvolucion[] {
  const grupos = new Map<string, { fecha: Date; valores: number[] }>();
  for (const r of respuestas) {
    const semana = inicioSemana(new Date(r.fecha));
    const clave = claveDia(semana);
    const g = grupos.get(clave) ?? { fecha: semana, valores: [] };
    g.valores.push(r.valoracionGeneral);
    grupos.set(clave, g);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([clave, g]) => ({
      clave,
      etiqueta: `Sem. ${formatoCorto.format(g.fecha)}`,
      promedio: Math.round(promedio(g.valores) * 100) / 100,
      respuestas: g.valores.length,
    }));
}

export function calcularMetricas(respuestas: Respuesta[]): Metricas {
  const total = respuestas.length;
  const distribucion = [1, 2, 3, 4, 5].map((estrellas) => {
    const cantidad = respuestas.filter((r) => r.valoracionGeneral === estrellas).length;
    return { estrellas, cantidad, porcentaje: total ? (cantidad / total) * 100 : 0 };
  });

  const aspectos = ASPECTOS.map((a) => ({
    clave: a.clave as string,
    etiqueta: a.etiqueta as string,
    promedio: promedio(respuestas.map((r) => r[a.clave])),
  }));
  const ordenados = [...aspectos].sort((a, b) => b.promedio - a.promedio);

  const servicios = new Map<string, number[]>();
  for (const r of respuestas) {
    const lista = servicios.get(r.servicio) ?? [];
    lista.push(r.valoracionGeneral);
    servicios.set(r.servicio, lista);
  }
  const porServicio = [...servicios.entries()]
    .map(([servicio, v]) => ({ servicio, promedio: promedio(v), total: v.length }))
    .sort((a, b) => b.promedio - a.promedio || b.total - a.total);

  const criticas = respuestas.filter((r) => r.valoracionGeneral <= 2).length;
  const positivas = respuestas.filter((r) => r.valoracionGeneral >= 4).length;

  return {
    total,
    promedioGeneral: promedio(respuestas.map((r) => r.valoracionGeneral)),
    distribucion,
    criticas,
    positivas,
    porcentajePositivas: total ? (positivas / total) * 100 : 0,
    pendientes: respuestas.filter((r) => r.estado === "Pendiente").length,
    aspectos,
    mejorAspecto: total ? (ordenados[0] ?? null) : null,
    peorAspecto: total ? (ordenados[ordenados.length - 1] ?? null) : null,
    porServicio,
    evolucion: calcularEvolucion(respuestas),
  };
}

/** Respuestas del mes natural en curso. */
export function respuestasDelMes(respuestas: Respuesta[], ahora: Date = new Date()): Respuesta[] {
  return respuestas.filter((r) => {
    const f = new Date(r.fecha);
    return f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth();
  });
}

export function formatearPromedio(valor: number): string {
  return valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
