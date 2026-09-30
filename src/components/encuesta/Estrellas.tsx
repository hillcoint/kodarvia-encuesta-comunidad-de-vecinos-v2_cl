import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const ETIQUETAS_ESTRELLAS: Record<number, string> = {
  1: "Muy malo",
  2: "Malo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

/** Color semántico según la valoración: rojo (1-2), ámbar (3), esmeralda (4-5). */
export function colorValoracion(valor: number): { texto: string; fondo: string; relleno: string } {
  if (valor <= 2) return { texto: "text-alerta", fondo: "bg-alerta", relleno: "#DC2626" };
  if (valor < 4) return { texto: "text-ambar", fondo: "bg-ambar", relleno: "#D97706" };
  return { texto: "text-esmeralda", fondo: "bg-esmeralda", relleno: "#059669" };
}

/** Selector grande de 1 a 5 estrellas, cómodo para el pulgar. */
export function SelectorEstrellas({
  valor,
  onChange,
  etiqueta,
}: {
  valor: number;
  onChange: (v: number) => void;
  etiqueta: string;
}) {
  const color = colorValoracion(valor);
  return (
    <div>
      <div role="radiogroup" aria-label={etiqueta} className="flex justify-between gap-1 sm:justify-center sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => {
          const activa = n <= valor;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={valor === n}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}: ${ETIQUETAS_ESTRELLAS[n]}`}
              onClick={() => onChange(n)}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all active:scale-95 sm:h-[72px] sm:w-[72px]",
                activa ? "border-transparent bg-white shadow-sm" : "border-pizarra/10 bg-white hover:border-pizarra/25",
              )}
            >
              <Star
                className="h-9 w-9 transition-colors"
                strokeWidth={1.6}
                fill={activa ? color.relleno : "transparent"}
                stroke={activa ? color.relleno : "#1E293B"}
                strokeOpacity={activa ? 1 : 0.35}
              />
            </button>
          );
        })}
      </div>
      <p className={cn("mt-4 h-6 text-center font-display text-base font-semibold", valor ? color.texto : "text-pizarra/40")}>
        {valor ? ETIQUETAS_ESTRELLAS[valor] : "Toca una estrella"}
      </p>
    </div>
  );
}

/** Estrellas de solo lectura (tablas, detalle). */
export function Estrellas({ valor, tamano = "sm" }: { valor: number; tamano?: "sm" | "md" }) {
  const color = colorValoracion(valor);
  const clase = tamano === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={clase}
          strokeWidth={1.8}
          fill={n <= valor ? color.relleno : "transparent"}
          stroke={n <= valor ? color.relleno : "#1E293B"}
          strokeOpacity={n <= valor ? 1 : 0.25}
        />
      ))}
    </span>
  );
}
