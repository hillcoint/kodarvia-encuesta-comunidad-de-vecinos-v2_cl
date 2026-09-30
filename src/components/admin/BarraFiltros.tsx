import { CalendarDays, FilterX, Star, Building2 } from "lucide-react";
import { EDIFICIOS } from "@/data/catalogo";
import { hayFiltrosActivos } from "@/lib/metricas";
import { useFiltros } from "./filtros-contexto";

const claseCampo =
  "h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-pizarra outline-none transition focus:border-esmeralda focus:ring-2 focus:ring-esmeralda/20";

/** Barra de filtros en tiempo real: fecha, edificio y calificación. */
export function BarraFiltros({ total, filtradas }: { total: number; filtradas: number }) {
  const { filtros, cambiar, limpiar } = useFiltros();
  const activos = hayFiltrosActivos(filtros);

  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-sm sm:p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1fr_1.4fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-pizarra/70">
            <CalendarDays className="h-3.5 w-3.5" /> Desde
          </span>
          <input
            type="date"
            className={claseCampo}
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={(e) => cambiar("desde", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-pizarra/70">
            <CalendarDays className="h-3.5 w-3.5" /> Hasta
          </span>
          <input
            type="date"
            className={claseCampo}
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={(e) => cambiar("hasta", e.target.value)}
          />
        </label>
        <label className="col-span-2 block lg:col-span-1">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-pizarra/70">
            <Building2 className="h-3.5 w-3.5" /> Edificio
          </span>
          <select className={claseCampo} value={filtros.edificio} onChange={(e) => cambiar("edificio", e.target.value)}>
            <option value="">Todos los edificios</option>
            {EDIFICIOS.map((e) => (
              <option key={e.slug} value={e.nombre}>
                {e.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-pizarra/70">
            <Star className="h-3.5 w-3.5" /> Calificación
          </span>
          <select
            className={claseCampo}
            value={filtros.calificacion}
            onChange={(e) => cambiar("calificacion", Number(e.target.value))}
          >
            <option value={0}>Todas</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "estrella" : "estrellas"}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={limpiar}
          disabled={!activos}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-pizarra transition hover:bg-niebla disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FilterX className="h-4 w-4" /> Limpiar
        </button>
      </div>
      <p className="mt-3 text-xs text-pizarra/60">
        {activos ? (
          <>
            Mostrando <strong className="text-pizarra">{filtradas}</strong> de {total} respuestas según los filtros.
          </>
        ) : (
          <>
            Mostrando las <strong className="text-pizarra">{total}</strong> respuestas registradas.
          </>
        )}
      </p>
    </div>
  );
}
