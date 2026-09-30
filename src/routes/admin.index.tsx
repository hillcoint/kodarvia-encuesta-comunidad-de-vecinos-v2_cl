import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, BellRing, MessageSquareText, Star, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react";

import { useAlmacen, useHidratado } from "@/hooks/use-almacen";
import { aplicarFiltros, calcularMetricas, formatearPromedio } from "@/lib/metricas";
import { useFiltros } from "@/components/admin/filtros-contexto";
import { BarraFiltros } from "@/components/admin/BarraFiltros";
import { Cargando, EncabezadoSeccion, Tarjeta, TarjetaKpi, formatearFecha } from "@/components/admin/ui-admin";
import { Estrellas, colorValoracion } from "@/components/encuesta/Estrellas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard · Convivir" }] }),
  component: Dashboard,
});

const COLOR_ESTRELLAS: Record<number, string> = {
  1: "#DC2626",
  2: "#DC2626",
  3: "#D97706",
  4: "#059669",
  5: "#059669",
};

const estiloTooltip = {
  borderRadius: 10,
  border: "1px solid rgba(30,41,59,0.12)",
  boxShadow: "0 8px 24px rgba(30,41,59,0.12)",
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
};

function Dashboard() {
  const hidratado = useHidratado();
  const { respuestas, alertas } = useAlmacen();
  const { filtros, cambiar } = useFiltros();

  const filtradas = useMemo(() => aplicarFiltros(respuestas, filtros), [respuestas, filtros]);
  const m = useMemo(() => calcularMetricas(filtradas), [filtradas]);

  if (!hidratado) return <Cargando />;

  const idsFiltradas = new Set(filtradas.map((r) => r.id));
  const alertasFiltradas = alertas.filter((a) => idsFiltradas.has(a.respuestaId));
  const datosDistribucion = [...m.distribucion].reverse().map((d) => ({ ...d, etiqueta: `${d.estrellas} ★` }));

  return (
    <div className="space-y-5">
      <EncabezadoSeccion
        titulo="Resumen de satisfacción"
        descripcion="Métricas de las valoraciones de residentes. Se actualizan al instante con cada nueva respuesta."
      />

      <BarraFiltros total={respuestas.length} filtradas={filtradas.length} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi
          etiqueta="Promedio general"
          icono={<Star className="h-4 w-4" />}
          tono={m.total ? (m.promedioGeneral >= 4 ? "esmeralda" : m.promedioGeneral >= 3 ? "ambar" : "alerta") : "pizarra"}
          valor={
            <span className="flex items-baseline gap-1">
              {m.total ? formatearPromedio(m.promedioGeneral) : "—"}
              <span className="text-base font-semibold text-pizarra/40">/ 5</span>
            </span>
          }
          detalle={m.total ? <Estrellas valor={Math.round(m.promedioGeneral)} /> : "Sin respuestas"}
        />
        <TarjetaKpi
          etiqueta="Respuestas"
          icono={<MessageSquareText className="h-4 w-4" />}
          valor={m.total}
          detalle={`${Math.round(m.porcentajePositivas)} % con 4 o 5 estrellas`}
        />
        <TarjetaKpi
          etiqueta="Valoraciones críticas"
          icono={<TriangleAlert className="h-4 w-4" />}
          tono="alerta"
          valor={m.criticas}
          detalle="1 o 2 estrellas · generan alerta"
        />
        <TarjetaKpi
          etiqueta="Pendientes de atención"
          icono={<BellRing className="h-4 w-4" />}
          tono="ambar"
          valor={m.pendientes}
          detalle={
            <Link to="/admin/respuestas" className="font-semibold text-esmeralda hover:underline">
              Ir a la bandeja
            </Link>
          }
        />
      </div>

      {m.total === 0 ? (
        <Tarjeta>
          <p className="py-10 text-center text-sm text-pizarra/60">
            No hay respuestas que coincidan con los filtros seleccionados.
          </p>
        </Tarjeta>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-5">
            <Tarjeta
              className="xl:col-span-2"
              titulo="Distribución de estrellas"
              subtitulo="Valoración general · toca una barra para filtrar"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosDistribucion} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }}>
                    <CartesianGrid horizontal={false} stroke="rgba(30,41,59,0.07)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "rgba(30,41,59,0.55)" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="etiqueta" width={40} tick={{ fontSize: 12, fill: "#1E293B", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(30,41,59,0.04)" }}
                      contentStyle={estiloTooltip}
                      formatter={(valor, _n, item) => [
                        `${String(valor)} respuestas (${Math.round(Number((item.payload as { porcentaje?: number } | undefined)?.porcentaje ?? 0))} %)`,
                        "Cantidad",
                      ]}
                    />
                    <Bar
                      dataKey="cantidad"
                      radius={[0, 6, 6, 0]}
                      barSize={26}
                      className="cursor-pointer"
                      label={{ position: "right", fontSize: 12, fill: "#1E293B", fontWeight: 600 }}
                      onClick={(_d: unknown, indice: number) => {
                        const est = datosDistribucion[indice]?.estrellas ?? 0;
                        cambiar("calificacion", filtros.calificacion === est ? 0 : est);
                      }}
                    >
                      {datosDistribucion.map((d) => (
                        <Cell
                          key={d.estrellas}
                          fill={COLOR_ESTRELLAS[d.estrellas]}
                          fillOpacity={filtros.calificacion && filtros.calificacion !== d.estrellas ? 0.25 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tarjeta>

            <Tarjeta className="xl:col-span-3" titulo="Evolución temporal" subtitulo="Promedio semanal y número de respuestas">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={m.evolucion} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                    <CartesianGrid vertical={false} stroke="rgba(30,41,59,0.07)" />
                    <XAxis dataKey="etiqueta" tick={{ fontSize: 10, fill: "rgba(30,41,59,0.55)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={12} />
                    <YAxis yAxisId="prom" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "rgba(30,41,59,0.55)" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="cant" orientation="right" allowDecimals={false} hide />
                    <Tooltip
                      contentStyle={estiloTooltip}
                      formatter={(valor, nombre) =>
                        nombre === "promedio"
                          ? [`${formatearPromedio(Number(valor))} ★`, "Promedio"]
                          : [String(valor), "Respuestas"]
                      }
                    />
                    <Bar yAxisId="cant" dataKey="respuestas" fill="#1E293B" fillOpacity={0.1} radius={[4, 4, 0, 0]} barSize={18} />
                    <Line
                      yAxisId="prom"
                      type="monotone"
                      dataKey="promedio"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#059669", strokeWidth: 0 }}
                      activeDot={{ r: 5.5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Tarjeta>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Tarjeta titulo="Aspectos mejor y peor valorados" subtitulo="Promedio de cada aspecto (1 a 5)">
              <ul className="space-y-4">
                {[...m.aspectos]
                  .sort((a, b) => b.promedio - a.promedio)
                  .map((a) => {
                    const mejor = m.mejorAspecto?.clave === a.clave;
                    const peor = m.peorAspecto?.clave === a.clave && !mejor;
                    const c = colorValoracion(a.promedio);
                    return (
                      <li key={a.clave}>
                        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2 font-medium text-pizarra">
                            {a.etiqueta}
                            {mejor && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-esmeralda/10 px-2 py-0.5 text-[11px] font-semibold text-esmeralda">
                                <ThumbsUp className="h-3 w-3" /> Mejor
                              </span>
                            )}
                            {peor && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-alerta/10 px-2 py-0.5 text-[11px] font-semibold text-alerta">
                                <ThumbsDown className="h-3 w-3" /> A mejorar
                              </span>
                            )}
                          </span>
                          <span className={cn("font-display font-bold", c.texto)}>{formatearPromedio(a.promedio)}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-pizarra/8">
                          <div className={cn("h-full rounded-full transition-all", c.fondo)} style={{ width: `${(a.promedio / 5) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
              </ul>

              <h3 className="mb-3 mt-6 font-display text-sm font-bold text-pizarra">Por tipo de servicio</h3>
              <ul className="divide-y divide-border">
                {m.porServicio.map((s, i) => {
                  const c = colorValoracion(s.promedio);
                  return (
                    <li key={s.servicio} className="flex items-center gap-3 py-2 text-sm">
                      <span className="w-5 text-xs font-semibold text-pizarra/40">{i + 1}</span>
                      <span className="flex-1 text-pizarra">{s.servicio}</span>
                      <span className="text-xs text-pizarra/50">{s.total} resp.</span>
                      <span className={cn("w-10 text-right font-display font-bold", c.texto)}>{formatearPromedio(s.promedio)}</span>
                    </li>
                  );
                })}
              </ul>
            </Tarjeta>

            <Tarjeta
              titulo="Alertas recientes"
              subtitulo="Avisos simulados por valoraciones de 1 o 2 estrellas"
              accion={
                <Link to="/admin/respuestas" className="inline-flex items-center gap-1 text-xs font-semibold text-esmeralda hover:underline">
                  Bandeja <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              {alertasFiltradas.length === 0 ? (
                <p className="py-6 text-center text-sm text-pizarra/55">Sin alertas en el periodo seleccionado.</p>
              ) : (
                <ul className="space-y-2.5">
                  {alertasFiltradas.slice(0, 6).map((a) => {
                    const r = respuestas.find((x) => x.id === a.respuestaId);
                    return (
                      <li key={a.id} className="flex gap-3 rounded-lg border border-alerta/15 bg-alerta/[0.03] p-3">
                        <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-alerta" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 text-sm">
                            <span className="font-semibold text-pizarra">{a.edificio}</span>
                            <span className="text-xs text-pizarra/50">{formatearFecha(a.fecha)}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-pizarra/65">
                            {a.servicio} · {a.valoracionGeneral} ★ · WhatsApp y correo (simulado)
                          </p>
                          {r?.comentario && <p className="mt-1 line-clamp-2 text-xs italic text-pizarra/70">“{r.comentario}”</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Tarjeta>
          </div>
        </>
      )}
    </div>
  );
}
