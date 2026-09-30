import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Inbox, LayoutDashboard, MonitorPlay, QrCode, RotateCcw } from "lucide-react";

import { LogoConvivir } from "@/components/marca/LogoConvivir";
import { ProveedorFiltros } from "@/components/admin/filtros-contexto";
import { restablecerDatosEjemplo } from "@/lib/almacen";
import { useAlmacen, useHidratado } from "@/hooks/use-almacen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Panel de administración · Convivir" }] }),
  component: LayoutAdmin,
});

const NAV = [
  { to: "/admin", etiqueta: "Dashboard", corta: "Resumen", icono: LayoutDashboard, exacto: true },
  { to: "/admin/respuestas", etiqueta: "Bandeja de respuestas", corta: "Bandeja", icono: Inbox, exacto: false },
  { to: "/admin/enlaces", etiqueta: "Enlaces y QR", corta: "Enlaces", icono: QrCode, exacto: false },
] as const;

function LayoutAdmin() {
  const [confirmar, setConfirmar] = useState(false);
  const { respuestas } = useAlmacen();
  const hidratado = useHidratado();
  const pendientes = hidratado ? respuestas.filter((r) => r.estado === "Pendiente").length : 0;

  const restablecer = () => {
    restablecerDatosEjemplo();
    toast.success("Datos de ejemplo restablecidos", {
      description: "Se cargaron de nuevo las 30 respuestas precargadas.",
    });
  };

  return (
    <ProveedorFiltros>
      <div className="min-h-dvh bg-niebla lg:flex">
        {/* Barra lateral (escritorio) */}
        <aside className="hidden w-64 shrink-0 flex-col bg-pizarra text-niebla lg:sticky lg:top-0 lg:flex lg:h-dvh">
          <div className="px-5 py-6">
            <LogoConvivir variante="oscuro" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-niebla/45">
              Panel de administración
            </p>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exacto }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-sm font-semibold text-niebla/70 transition hover:bg-white/5 hover:text-niebla"
                activeProps={{ className: "bg-white/10 !text-niebla" }}
              >
                <item.icono className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.etiqueta}</span>
                {item.to === "/admin/respuestas" && pendientes > 0 && (
                  <span className="rounded-full bg-alerta px-2 py-0.5 text-[11px] font-bold text-white">{pendientes}</span>
                )}
              </Link>
            ))}
            <Link
              to="/sala"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-sm font-semibold text-niebla/70 transition hover:bg-white/5 hover:text-niebla"
            >
              <MonitorPlay className="h-[18px] w-[18px]" />
              <span className="flex-1">Vista de sala</span>
            </Link>
          </nav>
          <div className="space-y-1 border-t border-white/10 p-3">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-niebla/60 transition hover:bg-white/5 hover:text-niebla"
            >
              <ExternalLink className="h-4 w-4" /> Ver encuesta pública
            </Link>
            <button
              type="button"
              onClick={() => setConfirmar(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-niebla/60 transition hover:bg-white/5 hover:text-niebla"
            >
              <RotateCcw className="h-4 w-4" /> Restablecer datos de ejemplo
            </button>
          </div>
        </aside>

        {/* Cabecera (móvil y tableta) */}
        <header className="sticky top-0 z-30 bg-pizarra text-niebla lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <LogoConvivir variante="oscuro" />
            <div className="flex items-center gap-1">
              <Link to="/sala" aria-label="Vista de sala" className="rounded-lg p-2.5 text-niebla/80 hover:bg-white/10">
                <MonitorPlay className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => setConfirmar(true)}
                aria-label="Restablecer datos de ejemplo"
                className="rounded-lg p-2.5 text-niebla/80 hover:bg-white/10"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>

        {/* Navegación inferior (móvil) */}
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exacto }}
              className="relative flex flex-col items-center gap-1 py-2.5 font-display text-[11px] font-semibold text-pizarra/50"
              activeProps={{ className: "!text-esmeralda" }}
            >
              <item.icono className="h-5 w-5" />
              {item.corta}
              {item.to === "/admin/respuestas" && pendientes > 0 && (
                <span className="absolute right-[22%] top-1.5 h-2 w-2 rounded-full bg-alerta" />
              )}
            </Link>
          ))}
          <Link
            to="/"
            className="flex flex-col items-center gap-1 py-2.5 font-display text-[11px] font-semibold text-pizarra/50"
          >
            <ExternalLink className="h-5 w-5" />
            Encuesta
          </Link>
        </nav>

        <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">¿Restablecer los datos de ejemplo?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borrarán las respuestas, estados y alertas guardados en este navegador y se volverán a cargar las 30
                respuestas de ejemplo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={restablecer} className="bg-pizarra text-niebla hover:bg-pizarra/90">
                Restablecer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProveedorFiltros>
  );
}
