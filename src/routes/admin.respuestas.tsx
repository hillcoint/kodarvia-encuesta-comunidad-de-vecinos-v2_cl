import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, Building2, CalendarDays, ChevronRight, FileJson, FileSpreadsheet, Phone, ShieldCheck, Wrench } from "lucide-react";

import type { EstadoAtencion, Respuesta } from "@/types/encuesta";
import { ESTADOS } from "@/types/encuesta";
import { useAlmacen, useHidratado } from "@/hooks/use-almacen";
import { cambiarEstado } from "@/lib/almacen";
import { aplicarFiltros, ASPECTOS } from "@/lib/metricas";
import { exportarCsv, exportarJson } from "@/lib/exportar";
import { useFiltros } from "@/components/admin/filtros-contexto";
import { BarraFiltros } from "@/components/admin/BarraFiltros";
import { Cargando, EncabezadoSeccion, ESTILO_ESTADO, InsigniaEstado, Tarjeta, formatearFecha } from "@/components/admin/ui-admin";
import { Estrellas } from "@/components/encuesta/Estrellas";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/respuestas")({
  head: () => ({ meta: [{ title: "Bandeja de respuestas · Convivir" }] }),
  component: Bandeja,
});

function Bandeja() {
  const hidratado = useHidratado();
  const { respuestas, alertas } = useAlmacen();
  const { filtros } = useFiltros();
  const [seleccionId, setSeleccionId] = useState<string | null>(null);

  const filtradas = useMemo(
    () => [...aplicarFiltros(respuestas, filtros)].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [respuestas, filtros],
  );
  const seleccion = seleccionId ? (respuestas.find((r) => r.id === seleccionId) ?? null) : null;

  if (!hidratado) return <Cargando />;

  const exportar = (formato: "csv" | "json") => {
    if (formato === "csv") exportarCsv(respuestas);
    else exportarJson(respuestas);
    toast.success(`Exportación ${formato.toUpperCase()} generada`, {
      description: `${respuestas.length} respuestas con fechas, edificio, servicio, puntuaciones, comentario y estado.`,
    });
  };

  const actualizarEstado = (id: string, estado: EstadoAtencion) => {
    cambiarEstado(id, estado);
    toast.success(`Estado actualizado a «${estado}»`);
  };

  return (
    <div className="space-y-5">
      <EncabezadoSeccion
        titulo="Bandeja de respuestas"
        descripcion="Consulta cada valoración, su comentario completo y gestiona su estado de atención."
        acciones={
          <>
            <button
              type="button"
              onClick={() => exportar("csv")}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-pizarra px-4 text-sm font-semibold text-niebla shadow-sm transition hover:bg-pizarra/90"
            >
              <FileSpreadsheet className="h-4 w-4" /> Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => exportar("json")}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-pizarra shadow-sm transition hover:bg-niebla"
            >
              <FileJson className="h-4 w-4" /> Exportar JSON
            </button>
          </>
        }
      />

      <BarraFiltros total={respuestas.length} filtradas={filtradas.length} />
      <p className="-mt-2 text-xs text-pizarra/55">La exportación incluye siempre todas las respuestas almacenadas.</p>

      {filtradas.length === 0 ? (
        <Tarjeta>
          <p className="py-10 text-center text-sm text-pizarra/60">No hay respuestas que coincidan con los filtros.</p>
        </Tarjeta>
      ) : (
        <>
          {/* Tabla (escritorio) */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-niebla/70 text-xs uppercase tracking-wide text-pizarra/55">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Edificio</th>
                  <th className="px-4 py-3 font-semibold">Servicio</th>
                  <th className="px-4 py-3 font-semibold">Puntuación</th>
                  <th className="hidden px-4 py-3 font-semibold xl:table-cell">Comentario</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="w-8 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtradas.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSeleccionId(r.id)}
                    className={cn(
                      "cursor-pointer transition hover:bg-niebla",
                      r.valoracionGeneral <= 2 && r.estado !== "Resuelto" && "bg-alerta/[0.03]",
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-pizarra/70">{formatearFecha(r.fecha)}</td>
                    <td className="px-4 py-3 font-medium text-pizarra">{r.edificio}</td>
                    <td className="px-4 py-3 text-pizarra/80">{r.servicio}</td>
                    <td className="px-4 py-3">
                      <Estrellas valor={r.valoracionGeneral} />
                    </td>
                    <td className="hidden max-w-xs px-4 py-3 xl:table-cell">
                      <p className="line-clamp-1 text-pizarra/70">{r.comentario || <span className="italic text-pizarra/40">Sin comentario</span>}</p>
                    </td>
                    <td className="px-4 py-3">
                      <InsigniaEstado estado={r.estado} />
                    </td>
                    <td className="px-2 py-3 text-pizarra/30">
                      <ChevronRight className="h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas (móvil) */}
          <ul className="space-y-3 md:hidden">
            {filtradas.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSeleccionId(r.id)}
                  className={cn(
                    "w-full rounded-xl border bg-white p-4 text-left shadow-sm transition active:scale-[0.99]",
                    r.valoracionGeneral <= 2 && r.estado !== "Resuelto" ? "border-alerta/25" : "border-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-[15px] font-semibold text-pizarra">{r.edificio}</p>
                      <p className="text-xs text-pizarra/60">{r.servicio}</p>
                    </div>
                    <InsigniaEstado estado={r.estado} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Estrellas valor={r.valoracionGeneral} />
                    <span className="text-xs text-pizarra/50">{formatearFecha(r.fecha)}</span>
                  </div>
                  {r.comentario && <p className="mt-2 line-clamp-2 text-sm text-pizarra/75">{r.comentario}</p>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Sheet open={seleccion !== null} onOpenChange={(abierto) => !abierto && setSeleccionId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto bg-white p-0 sm:max-w-lg">
          {seleccion && (
            <DetalleRespuesta
              respuesta={seleccion}
              conAlerta={alertas.some((a) => a.respuestaId === seleccion.id)}
              onEstado={(e) => actualizarEstado(seleccion.id, e)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetalleRespuesta({
  respuesta: r,
  conAlerta,
  onEstado,
}: {
  respuesta: Respuesta;
  conAlerta: boolean;
  onEstado: (e: EstadoAtencion) => void;
}) {
  return (
    <div>
      <SheetHeader className="border-b border-border bg-niebla px-5 pb-4 pt-6 text-left">
        <SheetTitle className="font-display text-lg text-pizarra">Detalle de la valoración</SheetTitle>
        <SheetDescription className="text-xs text-pizarra/55">Ref. {r.id}</SheetDescription>
        <div className="mt-3 space-y-1.5 text-sm text-pizarra">
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-pizarra/45" /> {r.edificio}
          </p>
          <p className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-pizarra/45" /> {r.servicio}
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-pizarra/45" /> {formatearFecha(r.fecha)}
          </p>
        </div>
      </SheetHeader>

      <div className="space-y-6 px-5 py-5">
        {conAlerta && (
          <div className="flex gap-3 rounded-lg border border-alerta/20 bg-alerta/5 p-3 text-sm">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-alerta" />
            <p className="text-pizarra/80">
              <strong className="text-alerta">Alerta enviada</strong> al responsable por WhatsApp y correo (simulado).
            </p>
          </div>
        )}

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-pizarra/55">Estado de atención</h3>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Estado de atención">
            {ESTADOS.map((e) => {
              const activo = r.estado === e;
              return (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => !activo && onEstado(e)}
                  className={cn(
                    "flex h-11 items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold transition",
                    activo ? cn(ESTILO_ESTADO[e].clase, "border-transparent ring-2") : "border-border text-pizarra/60 hover:bg-niebla",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", ESTILO_ESTADO[e].punto)} />
                  {e}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-pizarra/55">Puntuación</h3>
          <div className="divide-y divide-border rounded-lg border border-border">
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-semibold text-pizarra">Valoración general</span>
              <span className="flex items-center gap-2">
                <Estrellas valor={r.valoracionGeneral} tamano="md" />
                <span className="w-4 text-right font-display font-bold text-pizarra">{r.valoracionGeneral}</span>
              </span>
            </div>
            {ASPECTOS.map((a) => (
              <div key={a.clave} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm text-pizarra/75">{a.etiqueta}</span>
                <span className="flex items-center gap-2">
                  <Estrellas valor={r[a.clave]} />
                  <span className="w-4 text-right text-sm font-semibold text-pizarra">{r[a.clave]}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-pizarra/55">Comentario</h3>
          {r.comentario ? (
            <p className="whitespace-pre-line rounded-lg bg-niebla p-4 text-[15px] leading-relaxed text-pizarra">{r.comentario}</p>
          ) : (
            <p className="text-sm italic text-pizarra/45">El residente no dejó comentario.</p>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-pizarra/55">Contacto</h3>
            <p className="flex items-start gap-2 text-sm text-pizarra">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-pizarra/45" />
              {r.contacto || <span className="italic text-pizarra/45">No facilitado</span>}
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-pizarra/55">Consentimiento</h3>
            <p className="flex items-center gap-2 text-sm text-pizarra">
              <ShieldCheck className="h-4 w-4 text-esmeralda" /> {r.consentimiento ? "Aceptado" : "No aceptado"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
