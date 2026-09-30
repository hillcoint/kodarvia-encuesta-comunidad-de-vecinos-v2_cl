import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kodarvia — Comunidad de Vecinos" },
      {
        name: "description",
        content: "Proyecto base de Kodarvia, comunidad de vecinos. Aplicación en construcción.",
      },
      { property: "og:title", content: "Kodarvia — Comunidad de Vecinos" },
      {
        property: "og:description",
        content: "Proyecto base de Kodarvia, comunidad de vecinos. Aplicación en construcción.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Comunidad de Vecinos
      </h1>
      <p className="mt-3 text-lg text-foreground sm:text-xl">Proyecto base</p>
      <p className="mt-6 text-sm text-muted-foreground">Aplicación en construcción</p>
    </main>
  );
}
