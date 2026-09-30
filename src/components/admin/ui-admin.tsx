import type { ReactNode } from "react";
import type { EstadoAtencion } from "@/types/encuesta";
import { cn } from "@/lib/utils";

export function EncabezadoSeccion({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-pizarra sm:text-[26px]">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-pizarra/60">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

export function Tarjeta({
  titulo,
  subtitulo,
  children,
  className,
  accion,
}: {
  titulo?: string;
  subtitulo?: string;
  children: ReactNode;
  className?: string;
  accion?: ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5", className)}>
      {(titulo || accion) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="font-display text-[15px] font-bold text-pizarra">{titulo}</h2>}
            {subtitulo && <p className="mt-0.5 text-xs text-pizarra/55">{subtitulo}</p>}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

export function TarjetaKpi({
  etiqueta,
  valor,
  detalle,
  icono,
  tono = "pizarra",
}: {
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  icono: ReactNode;
  tono?: "pizarra" | "esmeralda" | "ambar" | "alerta";
}) {
  const tonos = {
    pizarra: "bg-pizarra/8 text-pizarra",
    esmeralda: "bg-esmeralda/10 text-esmeralda",
    ambar: "bg-ambar/10 text-ambar",
    alerta: "bg-alerta/10 text-alerta",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-pizarra/55">{etiqueta}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tonos[tono])}>{icono}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-bold tracking-tight text-pizarra">{valor}</div>
      {detalle && <div className="mt-1 text-xs text-pizarra/60">{detalle}</div>}
    </div>
  );
}

export const ESTILO_ESTADO: Record<EstadoAtencion, { clase: string; punto: string }> = {
  Pendiente: { clase: "bg-alerta/10 text-alerta ring-alerta/20", punto: "bg-alerta" },
  "En atención": { clase: "bg-ambar/10 text-ambar ring-ambar/25", punto: "bg-ambar" },
  Resuelto: { clase: "bg-esmeralda/10 text-esmeralda ring-esmeralda/20", punto: "bg-esmeralda" },
};

export function InsigniaEstado({ estado }: { estado: EstadoAtencion }) {
  const e = ESTILO_ESTADO[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        e.clase,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", e.punto)} />
      {estado}
    </span>
  );
}

export function Cargando() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando datos">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-pizarra/8" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-pizarra/5" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-pizarra/5" />
    </div>
  );
}

export function formatearFecha(iso: string, conHora = true): string {
  const f = new Date(iso);
  return f.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(conHora ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}
