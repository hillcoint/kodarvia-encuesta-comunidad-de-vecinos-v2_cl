import type { Respuesta } from "@/types/encuesta";

/** Columnas del CSV, en orden. */
const COLUMNAS: { clave: keyof Respuesta; titulo: string }[] = [
  { clave: "id", titulo: "id" },
  { clave: "fecha", titulo: "fecha" },
  { clave: "edificio", titulo: "edificio" },
  { clave: "servicio", titulo: "servicio" },
  { clave: "valoracionGeneral", titulo: "valoracionGeneral" },
  { clave: "tiempoRespuesta", titulo: "tiempoRespuesta" },
  { clave: "tratoPersonal", titulo: "tratoPersonal" },
  { clave: "valoracionServicio", titulo: "valoracionServicio" },
  { clave: "comentario", titulo: "comentario" },
  { clave: "contacto", titulo: "contacto" },
  { clave: "consentimiento", titulo: "consentimiento" },
  { clave: "estado", titulo: "estado" },
];

function celdaCsv(valor: unknown): string {
  const texto = typeof valor === "boolean" ? (valor ? "si" : "no") : String(valor ?? "");
  return /[",\n\r;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function respuestasACsv(respuestas: Respuesta[]): string {
  const cabecera = COLUMNAS.map((c) => c.titulo).join(",");
  const filas = respuestas.map((r) => COLUMNAS.map((c) => celdaCsv(r[c.clave])).join(","));
  return [cabecera, ...filas].join("\r\n");
}

export function respuestasAJson(respuestas: Respuesta[]): string {
  return JSON.stringify(respuestas, null, 2);
}

function descargar(contenido: string, nombre: string, tipo: string): void {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sello(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/** Exporta TODAS las respuestas almacenadas. El BOM hace que Excel lea bien las tildes. */
export function exportarCsv(respuestas: Respuesta[]): void {
  descargar("﻿" + respuestasACsv(respuestas), `respuestas-convivir-${sello()}.csv`, "text/csv;charset=utf-8");
}

export function exportarJson(respuestas: Respuesta[]): void {
  descargar(respuestasAJson(respuestas), `respuestas-convivir-${sello()}.json`, "application/json;charset=utf-8");
}
