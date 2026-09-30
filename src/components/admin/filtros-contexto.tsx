import { createContext, useContext, useState, type ReactNode } from "react";
import { FILTROS_VACIOS, type Filtros } from "@/lib/metricas";

type ValorFiltros = {
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  cambiar: <K extends keyof Filtros>(clave: K, valor: Filtros[K]) => void;
  limpiar: () => void;
};

const Contexto = createContext<ValorFiltros | null>(null);

/** Filtros compartidos por el dashboard y la bandeja (se mantienen al cambiar de sección). */
export function ProveedorFiltros({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  const valor: ValorFiltros = {
    filtros,
    setFiltros,
    cambiar: (clave, v) => setFiltros((f) => ({ ...f, [clave]: v })),
    limpiar: () => setFiltros(FILTROS_VACIOS),
  };
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFiltros(): ValorFiltros {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useFiltros debe usarse dentro de ProveedorFiltros");
  return ctx;
}
