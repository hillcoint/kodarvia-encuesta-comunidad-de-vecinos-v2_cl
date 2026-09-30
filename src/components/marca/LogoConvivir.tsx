import { cn } from "@/lib/utils";

/**
 * Marca provisional de Gestión de Comunidades Convivir (SVG propio).
 * Sustituible por el logotipo oficial cuando Kodarvia lo facilite.
 */
export function LogoConvivir({
  className,
  variante = "claro",
  compacto = false,
}: {
  className?: string;
  /** "claro" sobre fondos claros, "oscuro" sobre fondo pizarra. */
  variante?: "claro" | "oscuro";
  compacto?: boolean;
}) {
  const texto = variante === "oscuro" ? "text-niebla" : "text-pizarra";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill={variante === "oscuro" ? "#F8FAFC" : "#1E293B"} />
        <path
          d="M11 29V17.5L20 11l9 6.5V29"
          fill="none"
          stroke={variante === "oscuro" ? "#1E293B" : "#F8FAFC"}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M15.5 23.5l3.2 3.2 6-6.4"
          fill="none"
          stroke="#059669"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compacto && (
        <div className="leading-none">
          <div className={cn("font-display text-lg font-bold tracking-tight", texto)}>Convivir</div>
          <div
            className={cn(
              "mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
              variante === "oscuro" ? "text-niebla/60" : "text-pizarra/55",
            )}
          >
            Gestión de Comunidades
          </div>
        </div>
      )}
    </div>
  );
}
