import { createFileRoute } from "@tanstack/react-router";
import { Encuesta } from "@/components/encuesta/Encuesta";

type BusquedaEncuesta = { edificio?: string; servicio?: string };

export const Route = createFileRoute("/")({
  // Parámetros de los enlaces/QR: /?edificio=<slug>&servicio=<slug>
  validateSearch: (search: Record<string, unknown>): BusquedaEncuesta => {
    const r: BusquedaEncuesta = {};
    if (typeof search["edificio"] === "string") r.edificio = search["edificio"];
    if (typeof search["servicio"] === "string") r.servicio = search["servicio"];
    return r;
  },
  head: () => ({
    meta: [
      { title: "Valora tu comunidad · Convivir" },
      {
        name: "description",
        content: "Valora en menos de 1 minuto los servicios técnicos y administrativos de tu comunidad.",
      },
      { property: "og:title", content: "Valora tu comunidad · Convivir" },
      {
        property: "og:description",
        content: "Valora en menos de 1 minuto los servicios técnicos y administrativos de tu comunidad.",
      },
    ],
  }),
  component: PaginaEncuesta,
});

function PaginaEncuesta() {
  const { edificio, servicio } = Route.useSearch();
  return <Encuesta {...(edificio ? { edificioSlug: edificio } : {})} {...(servicio ? { servicioSlug: servicio } : {})} />;
}
