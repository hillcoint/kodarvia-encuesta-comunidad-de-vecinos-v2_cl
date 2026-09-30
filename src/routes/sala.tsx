import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

import { useAlmacen, useHidratado } from "@/hooks/use-almacen";
import { calcularMetricas, formatearPromedio, respuestasDelMes } from "@/lib/metricas";
import { EDIFICIOS } from "@/data/catalogo";
import { LogoConvivir } from "@/components/marca/LogoConvivir";
import { colorValoracion } from "@/components/encuesta/Estrellas";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export const Route = createFileRoute("/sala")({
  head: () => ({ meta: [{ title: "Vista de sala · Convivir" }] }),
  component: VistaSala,
});

/** Vista simplificada para proyectar en reuniones: indicadores y promedios del mes en curso. */
function VistaSala() {
  const hidratado = useHidratado();
  const { respuestas } = useAlmacen();
  const [ahora, setAhora] = useState(() => new Date());
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  // Refresca la hora (y el cambio de mes) cada minuto.
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 60_000);
    const alCambiar = () => setPantallaCompleta(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", alCambiar);
    return () => {
      clearInterval(t);
      document.removeEventListener("fullscreenchange", alCambiar);
    };
  }, []);

  const delMes = useMemo(() => respuestasDelMes(respuestas, ahora), [respuestas, ahora]);
  const m = useMemo(() => calcularMetricas(delMes), [delMes]);
  const porEdificio = useMemo(
    () =>
      EDIFICIOS.map((e) => {
        const rs = delMes.filter((r) => r.edificio === e.nombre);
        return {
          nombre: e.nombre,
          total: rs.length,
          promedio: rs.length ? rs.reduce((s, r) => s + r.valoracionGeneral, 0) / rs.length : 0,
        };
      })
        .filter((e) => e.total > 0)
        .sort((a, b) => b.promedio - a.promedio),
    [delMes],
  );

  const mes = ahora.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const alternarPantalla = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  const colorProm = colorValoracion(m.promedioGeneral);

  return (
    <div className="min-h-dvh bg-pizarra text-niebla">
      <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-10 sm:py-6">
        <LogoConvivir variante="oscuro" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={alternarPantalla}
            className="hidden items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-niebla hover:bg-white/15 sm:inline-flex"
          >
            {pantallaCompleta ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {pantallaCompleta ? "Salir" : "Pantalla completa"}
          </button>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-niebla hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
        </div>
      </header>

      <main className="px-5 pb-10 sm:px-10">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-esmeralda">Satisfacción de residentes</p>
          <h1 className="mt-1 font-display text-3xl font-bold capitalize tracking-tight sm:text-5xl">{mes}</h1>
        </div>

        {!hidratado ? (
          <div className="h-80 animate-pulse rounded-3xl bg-white/5" />
        ) : m.total === 0 ? (
          <div className="rounded-3xl bg-white/5 p-10 text-center text-lg text-niebla/70">
            Aún no hay valoraciones registradas este mes.
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Promedio del mes */}
            <div className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 sm:p-8 lg:row-span-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-niebla/60">Promedio general del mes</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className={cn("font-display text-7xl font-extrabold leading-none sm:text-8xl", colorProm.texto)}>
                  {formatearPromedio(m.promedioGeneral)}
                </span>
                <span className="font-display text-2xl font-bold text-niebla/40">/ 5</span>
              </div>
              <div className="mt-4 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="h-8 w-8"
                    fill={n <= Math.round(m.promedioGeneral) ? colorProm.relleno : "transparent"}
                    stroke={n <= Math.round(m.promedioGeneral) ? colorProm.relleno : "#F8FAFC"}
                    strokeOpacity={n <= Math.round(m.promedioGeneral) ? 1 : 0.3}
                  />
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {[...m.distribucion].reverse().map((d) => (
                  <div key={d.estrellas} className="flex items-center gap-3">
                    <span className="w-8 font-display text-sm font-bold text-niebla/80">{d.estrellas} ★</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn("h-full rounded-full", colorValoracion(d.estrellas).fondo)}
                        style={{ width: `${d.porcentaje}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-display text-sm font-bold">{d.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-2 lg:grid-cols-4">
              <IndicadorSala etiqueta="Respuestas" valor={String(m.total)} />
              <IndicadorSala
                etiqueta="Satisfechos (4-5 ★)"
                valor={`${Math.round(m.porcentajePositivas)} %`}
                clase="text-esmeralda"
              />
              <IndicadorSala etiqueta="Críticas (1-2 ★)" valor={String(m.criticas)} clase="text-alerta" />
              <IndicadorSala etiqueta="Pendientes" valor={String(m.pendientes)} clase="text-ambar" />
            </div>

            {/* Aspectos */}
            <div className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 sm:p-8">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-niebla/60">Promedio por aspecto</p>
              <ul className="space-y-5">
                {m.aspectos.map((a) => (
                  <li key={a.clave}>
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-base font-medium text-niebla/85">{a.etiqueta}</span>
                      <span className={cn("font-display text-2xl font-bold", colorValoracion(a.promedio).texto)}>
                        {formatearPromedio(a.promedio)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn("h-full rounded-full", colorValoracion(a.promedio).fondo)}
                        style={{ width: `${(a.promedio / 5) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Por edificio */}
            <div className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 sm:p-8">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-niebla/60">Promedio por edificio</p>
              <ul className="space-y-3.5">
                {porEdificio.map((e) => (
                  <li key={e.nombre} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-base text-niebla/85">{e.nombre}</span>
                    <span className="flex shrink-0 items-baseline gap-2">
                      <span className="text-xs text-niebla/45">{e.total} resp.</span>
                      <span className={cn("font-display text-2xl font-bold", colorValoracion(e.promedio).texto)}>
                        {formatearPromedio(e.promedio)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function IndicadorSala({ etiqueta, valor, clase }: { etiqueta: string; valor: string; clase?: string }) {
  return (
    <div className="rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-niebla/60 sm:text-sm">{etiqueta}</p>
      <p className={cn("mt-2 font-display text-4xl font-extrabold sm:text-5xl", clase ?? "text-niebla")}>{valor}</p>
    </div>
  );
}
