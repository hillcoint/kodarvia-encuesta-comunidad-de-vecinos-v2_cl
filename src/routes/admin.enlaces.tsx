import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Info } from "lucide-react";

import { EDIFICIOS, SERVICIOS, edificioPorSlug, servicioPorSlug } from "@/data/catalogo";
import { generarQR, qrATrazadoSvg } from "@/lib/qr";
import { EncabezadoSeccion, Tarjeta } from "@/components/admin/ui-admin";
import { LogoConvivir } from "@/components/marca/LogoConvivir";

export const Route = createFileRoute("/admin/enlaces")({
  head: () => ({ meta: [{ title: "Enlaces y QR · Convivir" }] }),
  component: GeneradorEnlaces,
});

const claseCampo =
  "h-11 w-full rounded-lg border border-input bg-white px-3 text-sm text-pizarra outline-none transition focus:border-esmeralda focus:ring-2 focus:ring-esmeralda/20";

function construirEnlace(origen: string, edificio: string, servicio: string): string {
  const params = new URLSearchParams();
  if (edificio) params.set("edificio", edificio);
  if (servicio) params.set("servicio", servicio);
  const q = params.toString();
  return `${origen}/${q ? `?${q}` : ""}`;
}

function GeneradorEnlaces() {
  const [edificio, setEdificio] = useState(EDIFICIOS[0]?.slug ?? "");
  const [servicio, setServicio] = useState("");
  const [origen, setOrigen] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => setOrigen(window.location.origin), []);

  const enlace = construirEnlace(origen, edificio, servicio);
  const qr = useMemo(() => (origen ? qrATrazadoSvg(generarQR(enlace)) : null), [enlace, origen]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
    } catch {
      const t = document.createElement("textarea");
      t.value = enlace;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopiado(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopiado(false), 2000);
  };

  const nombreEdificio = edificioPorSlug(edificio)?.nombre;
  const nombreServicio = servicioPorSlug(servicio)?.nombre;

  return (
    <div className="space-y-5">
      <EncabezadoSeccion
        titulo="Enlaces y códigos QR"
        descripcion="Genera un enlace directo a la encuesta con el edificio y/o servicio ya seleccionados."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Tarjeta titulo="Parámetros del enlace">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-pizarra/70">Edificio o conjunto</span>
                <select className={claseCampo} value={edificio} onChange={(e) => setEdificio(e.target.value)}>
                  <option value="">Sin edificio (lo elige el residente)</option>
                  {EDIFICIOS.map((e) => (
                    <option key={e.slug} value={e.slug}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-pizarra/70">Tipo de servicio</span>
                <select className={claseCampo} value={servicio} onChange={(e) => setServicio(e.target.value)}>
                  <option value="">Sin servicio (lo elige el residente)</option>
                  {SERVICIOS.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Tarjeta>

          <Tarjeta titulo="Enlace generado">
            <div className="break-all rounded-lg border border-border bg-niebla px-3 py-3 font-mono text-[13px] text-pizarra">
              {origen ? enlace : "Generando…"}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copiar}
                disabled={!origen}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-esmeralda px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-esmeralda/90"
              >
                {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiado ? "Copiado" : "Copiar enlace"}
              </button>
              <a
                href={enlace}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-pizarra transition hover:bg-niebla"
              >
                <ExternalLink className="h-4 w-4" /> Abrir encuesta
              </a>
            </div>
            <p className="mt-4 flex gap-2 text-xs leading-relaxed text-pizarra/60">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Al abrir el enlace o escanear el QR, la encuesta muestra estos datos ya seleccionados. El código QR se genera
              en el propio navegador, sin servicios externos.
            </p>
          </Tarjeta>
        </div>

        {/* Previsualización del cartel con QR */}
        <Tarjeta titulo="Previsualización del código QR">
          <div className="mx-auto max-w-[320px] overflow-hidden rounded-2xl border border-border shadow-sm">
            <div className="bg-pizarra px-5 py-4 text-center text-niebla">
              <p className="font-display text-lg font-bold leading-tight">Valora tu comunidad</p>
              <p className="mt-0.5 text-xs text-niebla/70">en menos de 1 minuto</p>
            </div>
            <div className="bg-white px-6 pb-5 pt-4">
              {qr ? (
                <svg viewBox={qr.viewBox} className="mx-auto aspect-square w-full" role="img" aria-label="Código QR de la encuesta" shapeRendering="crispEdges">
                  <rect width="100%" height="100%" fill="#FFFFFF" />
                  <path d={qr.d} fill="#1E293B" />
                </svg>
              ) : (
                <div className="aspect-square w-full animate-pulse rounded-lg bg-pizarra/5" />
              )}
              <div className="mt-3 space-y-0.5 text-center">
                <p className="font-display text-sm font-bold text-pizarra">{nombreEdificio ?? "Todos los edificios"}</p>
                <p className="text-xs text-pizarra/60">{nombreServicio ?? "Todos los servicios"}</p>
              </div>
              <div className="mt-4 flex justify-center border-t border-border pt-3">
                <LogoConvivir />
              </div>
            </div>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
