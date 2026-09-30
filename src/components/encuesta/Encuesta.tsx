import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  HeartHandshake,
  Mail,
  MessageCircle,
  Send,
  Wrench,
} from "lucide-react";

import type { Alerta, Estrellas as TipoEstrellas, Respuesta } from "@/types/encuesta";
import { EDIFICIOS, ENLACE_RESENA_GOOGLE, SERVICIOS, TEXTOS_LEGALES, edificioPorSlug, servicioPorSlug } from "@/data/catalogo";
import { agregarRespuesta, generarId } from "@/lib/almacen";
import { dispararAlerta, tipoResultado } from "@/lib/alertas";
import { cn } from "@/lib/utils";
import { LogoConvivir } from "@/components/marca/LogoConvivir";
import { SelectorEstrellas } from "./Estrellas";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ClaveEstrellas = "valoracionGeneral" | "tiempoRespuesta" | "tratoPersonal" | "valoracionServicio";

const PREGUNTAS_ESTRELLAS: { clave: ClaveEstrellas; titulo: string; ayuda: string }[] = [
  {
    clave: "valoracionGeneral",
    titulo: "¿Cómo valoras en general el servicio recibido?",
    ayuda: "Valoración general",
  },
  { clave: "tiempoRespuesta", titulo: "¿Qué tal fue el tiempo de respuesta?", ayuda: "Tiempo de respuesta" },
  { clave: "tratoPersonal", titulo: "¿Cómo fue el trato del personal?", ayuda: "Trato del personal" },
  {
    clave: "valoracionServicio",
    titulo: "¿Cómo valoras la calidad del servicio realizado?",
    ayuda: "Valoración del servicio",
  },
];

const TOTAL_PREGUNTAS = 6;

type Paso = "bienvenida" | 1 | 2 | 3 | 4 | 5 | 6 | "resultado";

interface Borrador {
  edificio: string;
  servicio: string;
  valoracionGeneral: number;
  tiempoRespuesta: number;
  tratoPersonal: number;
  valoracionServicio: number;
  comentario: string;
  nombre: string;
  medioContacto: string;
  consentimiento: boolean;
}

function borradorInicial(edificioSlug?: string, servicioSlug?: string): Borrador {
  return {
    edificio: edificioPorSlug(edificioSlug)?.nombre ?? "",
    servicio: servicioPorSlug(servicioSlug)?.nombre ?? "",
    valoracionGeneral: 0,
    tiempoRespuesta: 0,
    tratoPersonal: 0,
    valoracionServicio: 0,
    comentario: "",
    nombre: "",
    medioContacto: "",
    consentimiento: false,
  };
}

const claseSelect =
  "h-14 w-full appearance-none rounded-xl border border-input bg-white px-4 pr-10 text-base text-pizarra shadow-sm outline-none transition focus:border-esmeralda focus:ring-2 focus:ring-esmeralda/25";

const claseInput =
  "h-14 w-full rounded-xl border border-input bg-white px-4 text-base text-pizarra shadow-sm outline-none transition placeholder:text-pizarra/40 focus:border-esmeralda focus:ring-2 focus:ring-esmeralda/25";

export function Encuesta({ edificioSlug, servicioSlug }: { edificioSlug?: string; servicioSlug?: string }) {
  const [paso, setPaso] = useState<Paso>("bienvenida");
  const [b, setB] = useState<Borrador>(() => borradorInicial(edificioSlug, servicioSlug));
  const [enviada, setEnviada] = useState<Respuesta | null>(null);
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [modalAlerta, setModalAlerta] = useState(false);
  const [verPolitica, setVerPolitica] = useState(false);
  const avance = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viaEnlace = Boolean(edificioPorSlug(edificioSlug) || servicioPorSlug(servicioSlug));

  // Si cambian los parámetros del enlace, se reinicia el borrador.
  useEffect(() => {
    setB(borradorInicial(edificioSlug, servicioSlug));
    setPaso("bienvenida");
  }, [edificioSlug, servicioSlug]);

  useEffect(() => () => {
    if (avance.current) clearTimeout(avance.current);
  }, []);

  const actualizar = <K extends keyof Borrador>(clave: K, valor: Borrador[K]) =>
    setB((prev) => ({ ...prev, [clave]: valor }));

  const irA = (p: Paso) => {
    if (avance.current) clearTimeout(avance.current);
    setPaso(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const elegirEstrellas = (numPaso: 1 | 2 | 3 | 4, clave: ClaveEstrellas, v: number) => {
    actualizar(clave, v);
    // Avance automático para completar la encuesta en pocos toques.
    if (avance.current) clearTimeout(avance.current);
    avance.current = setTimeout(() => irA((numPaso + 1) as Paso), 380);
  };

  const enviar = async () => {
    if (!b.consentimiento) return;
    const respuesta: Respuesta = {
      id: generarId("r"),
      fecha: new Date().toISOString(),
      edificio: b.edificio,
      servicio: b.servicio,
      valoracionGeneral: b.valoracionGeneral as TipoEstrellas,
      tiempoRespuesta: b.tiempoRespuesta as TipoEstrellas,
      tratoPersonal: b.tratoPersonal as TipoEstrellas,
      valoracionServicio: b.valoracionServicio as TipoEstrellas,
      comentario: b.comentario.trim(),
      contacto: [b.nombre.trim(), b.medioContacto.trim()].filter(Boolean).join(" · "),
      consentimiento: true,
      estado: "Pendiente",
    };
    agregarRespuesta(respuesta);
    setEnviada(respuesta);
    irA("resultado");

    if (tipoResultado(respuesta.valoracionGeneral) === "critica") {
      const al = await dispararAlerta(respuesta);
      setAlerta(al);
      setModalAlerta(true);
      toast.error("Aviso enviado al equipo por WhatsApp y correo", {
        description: "Simulación: el responsable de atención recibió la alerta.",
      });
    }
  };

  const reiniciar = () => {
    setB(borradorInicial(edificioSlug, servicioSlug));
    setEnviada(null);
    setAlerta(null);
    setModalAlerta(false);
    setVerPolitica(false);
    irA("bienvenida");
  };

  const numPregunta = typeof paso === "number" ? paso : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-niebla">
      {/* Cabecera pública */}
      <header className="border-b border-pizarra/8 bg-white">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-5">
          <LogoConvivir />
          {typeof paso === "number" && (
            <span className="font-display text-sm font-semibold text-pizarra/60">
              {numPregunta} de {TOTAL_PREGUNTAS}
            </span>
          )}
        </div>
        {typeof paso === "number" && (
          <div className="h-1 w-full bg-pizarra/5">
            <div
              className="h-full bg-esmeralda transition-all duration-300"
              style={{ width: `${(numPregunta / TOTAL_PREGUNTAS) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-8 pt-6">
        {paso !== "bienvenida" && paso !== "resultado" && (
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-pizarra/70">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-pizarra/10">
              <Building2 className="h-3.5 w-3.5" /> {b.edificio}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-pizarra/10">
              <Wrench className="h-3.5 w-3.5" /> {b.servicio}
            </span>
          </div>
        )}

        {/* ——— Bienvenida ——— */}
        {paso === "bienvenida" && (
          <section className="flex flex-1 flex-col">
            <div className="rounded-3xl bg-pizarra px-6 py-8 text-niebla shadow-lg shadow-pizarra/10">
              <p className="text-sm font-medium text-niebla/70">Gestión de Comunidades Convivir</p>
              <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-tight">
                Valora tu comunidad en menos de 1 minuto
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-niebla/80">
                Tu opinión sobre los servicios técnicos y administrativos nos ayuda a mejorar la convivencia en tu
                conjunto.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-pizarra">Tu edificio o conjunto</span>
                <div className="relative">
                  <select
                    className={claseSelect}
                    value={b.edificio}
                    onChange={(e) => actualizar("edificio", e.target.value)}
                  >
                    <option value="">Selecciona tu edificio</option>
                    {EDIFICIOS.map((e) => (
                      <option key={e.slug} value={e.nombre}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                  <Building2 className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pizarra/40" />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-pizarra">Servicio que quieres valorar</span>
                <div className="relative">
                  <select
                    className={claseSelect}
                    value={b.servicio}
                    onChange={(e) => actualizar("servicio", e.target.value)}
                  >
                    <option value="">Selecciona el servicio</option>
                    {SERVICIOS.map((s) => (
                      <option key={s.slug} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                  <Wrench className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pizarra/40" />
                </div>
              </label>
              {viaEnlace && (
                <p className="text-xs text-pizarra/60">Datos completados automáticamente desde tu enlace o código QR.</p>
              )}
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                disabled={!b.edificio || !b.servicio}
                onClick={() => irA(1)}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-esmeralda text-lg font-semibold text-white shadow-md shadow-esmeralda/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-pizarra/15 disabled:text-pizarra/40 disabled:shadow-none"
              >
                Comenzar <ArrowRight className="h-5 w-5" />
              </button>
              <p className="mt-4 text-center text-xs text-pizarra/50">6 preguntas breves · Contacto opcional</p>
            </div>
          </section>
        )}

        {/* ——— Preguntas de estrellas (1 a 4) ——— */}
        {typeof paso === "number" && paso <= 4 && (() => {
          const pregunta = PREGUNTAS_ESTRELLAS[paso - 1];
          if (!pregunta) return null;
          return (
            <section key={paso} className="flex flex-1 flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm font-semibold uppercase tracking-wide text-esmeralda">{pregunta.ayuda}</p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-pizarra">{pregunta.titulo}</h2>
              <div className="mt-10">
                <SelectorEstrellas
                  etiqueta={pregunta.ayuda}
                  valor={b[pregunta.clave]}
                  onChange={(v) => elegirEstrellas(paso as 1 | 2 | 3 | 4, pregunta.clave, v)}
                />
              </div>
              <Navegacion
                onAtras={() => irA(paso === 1 ? "bienvenida" : ((paso - 1) as Paso))}
                onSiguiente={() => irA((paso + 1) as Paso)}
                puedeSeguir={b[pregunta.clave] > 0}
              />
            </section>
          );
        })()}

        {/* ——— 5. Comentario libre ——— */}
        {paso === 5 && (
          <section className="flex flex-1 flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm font-semibold uppercase tracking-wide text-esmeralda">Comentario</p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-pizarra">
              ¿Quieres contarnos algo más?
            </h2>
            <textarea
              value={b.comentario}
              onChange={(e) => actualizar("comentario", e.target.value)}
              placeholder="Cuéntanos más..."
              rows={5}
              maxLength={1000}
              className="mt-6 w-full resize-none rounded-2xl border border-input bg-white p-4 text-base leading-relaxed text-pizarra shadow-sm outline-none transition placeholder:text-pizarra/40 focus:border-esmeralda focus:ring-2 focus:ring-esmeralda/25"
            />
            <p className="mt-2 text-right text-xs text-pizarra/45">{b.comentario.length}/1000 · Opcional</p>
            <Navegacion
              onAtras={() => irA(4)}
              onSiguiente={() => irA(6)}
              puedeSeguir
              textoSiguiente={b.comentario.trim() ? "Continuar" : "Omitir"}
            />
          </section>
        )}

        {/* ——— 6. Contacto opcional + consentimiento ——— */}
        {paso === 6 && (
          <section className="flex flex-1 flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm font-semibold uppercase tracking-wide text-esmeralda">Contacto opcional</p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-pizarra">
              ¿Quieres que te contactemos?
            </h2>
            <p className="mt-1 text-sm text-pizarra/60">Déjanos tus datos solo si deseas seguimiento.</p>
            <div className="mt-5 space-y-3">
              <input
                className={claseInput}
                value={b.nombre}
                onChange={(e) => actualizar("nombre", e.target.value)}
                placeholder="Nombre"
                autoComplete="name"
              />
              <input
                className={claseInput}
                value={b.medioContacto}
                onChange={(e) => actualizar("medioContacto", e.target.value)}
                placeholder="Teléfono o correo"
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div
              className={cn(
                "mt-6 rounded-2xl border-2 bg-white p-4 transition-colors",
                b.consentimiento ? "border-esmeralda/60" : "border-pizarra/10",
              )}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  required
                  checked={b.consentimiento}
                  onChange={(e) => actualizar("consentimiento", e.target.checked)}
                  className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-esmeralda"
                />
                <span className="text-[15px] leading-snug text-pizarra">
                  {TEXTOS_LEGALES.consentimiento} <span className="text-alerta">*</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setVerPolitica((v) => !v)}
                className="ml-9 mt-2 text-sm font-medium text-esmeralda underline underline-offset-2"
              >
                {verPolitica ? "Ocultar política de datos" : "Ver política de datos"}
              </button>
              {verPolitica && (
                <p className="ml-9 mt-2 rounded-lg bg-niebla p-3 text-xs leading-relaxed text-pizarra/70">
                  {TEXTOS_LEGALES.politica}
                </p>
              )}
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={enviar}
                disabled={!b.consentimiento}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-esmeralda text-lg font-semibold text-white shadow-md shadow-esmeralda/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-pizarra/15 disabled:text-pizarra/40 disabled:shadow-none"
              >
                <Send className="h-5 w-5" /> Enviar valoración
              </button>
              {!b.consentimiento && (
                <p className="mt-3 text-center text-xs text-pizarra/55">
                  Para enviar debes aceptar el tratamiento de datos.
                </p>
              )}
              <button
                type="button"
                onClick={() => irA(5)}
                className="mx-auto mt-3 flex h-11 items-center gap-1.5 px-4 text-sm font-semibold text-pizarra/60"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
            </div>
          </section>
        )}

        {/* ——— Resultado ——— */}
        {paso === "resultado" && enviada && (
          <Resultado respuesta={enviada} alerta={alerta} onOtra={reiniciar} onVerAviso={() => setModalAlerta(true)} />
        )}
      </main>

      <footer className="px-5 pb-6 text-center text-[11px] leading-relaxed text-pizarra/45">
        <p>{TEXTOS_LEGALES.pie}</p>
        {paso === "bienvenida" && (
          <Link to="/admin" className="mt-2 inline-block font-medium text-pizarra/55 underline underline-offset-2">
            Acceso administración
          </Link>
        )}
      </footer>

      {/* Modal de alerta simulada (1-2 estrellas) */}
      <Dialog open={modalAlerta} onOpenChange={setModalAlerta}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl border-alerta/20 sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-alerta/10 sm:mx-0">
              <BellRing className="h-7 w-7 text-alerta" />
            </div>
            <DialogTitle className="font-display text-xl text-pizarra">Aviso enviado al equipo</DialogTitle>
            <DialogDescription className="text-pizarra/70">
              Se notificó al responsable por WhatsApp y correo para que haga seguimiento de tu caso.
            </DialogDescription>
          </DialogHeader>
          {alerta && <DetalleAlerta alerta={alerta} />}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setModalAlerta(false)}
              className="h-12 w-full rounded-xl bg-pizarra font-semibold text-niebla"
            >
              Entendido
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Navegacion({
  onAtras,
  onSiguiente,
  puedeSeguir,
  textoSiguiente = "Siguiente",
}: {
  onAtras: () => void;
  onSiguiente: () => void;
  puedeSeguir: boolean;
  textoSiguiente?: string;
}) {
  return (
    <div className="mt-auto flex gap-3 pt-10">
      <button
        type="button"
        onClick={onAtras}
        aria-label="Atrás"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-pizarra/15 bg-white text-pizarra transition active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onSiguiente}
        disabled={!puedeSeguir}
        className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-pizarra text-lg font-semibold text-niebla transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-pizarra/15 disabled:text-pizarra/40"
      >
        {textoSiguiente} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function DetalleAlerta({ alerta }: { alerta: Alerta }) {
  const hora = new Date(alerta.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="space-y-3 rounded-xl bg-niebla p-4 text-sm text-pizarra">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-esmeralda/10 px-2.5 py-1 text-xs font-semibold text-esmeralda">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pizarra/10 px-2.5 py-1 text-xs font-semibold text-pizarra">
          <Mail className="h-3.5 w-3.5" /> Correo
        </span>
        <span className="inline-flex items-center rounded-full bg-ambar/10 px-2.5 py-1 text-xs font-semibold text-ambar">
          Simulado
        </span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-pizarra/55">Para</dt>
        <dd className="font-medium">{alerta.destinatario}</dd>
        <dt className="text-pizarra/55">Motivo</dt>
        <dd className="font-medium">{alerta.mensaje}</dd>
        <dt className="text-pizarra/55">Hora</dt>
        <dd className="font-medium">{hora}</dd>
      </dl>
    </div>
  );
}

function Resultado({
  respuesta,
  alerta,
  onOtra,
  onVerAviso,
}: {
  respuesta: Respuesta;
  alerta: Alerta | null;
  onOtra: () => void;
  onVerAviso: () => void;
}) {
  const tipo = tipoResultado(respuesta.valoracionGeneral);

  return (
    <section className="flex flex-1 flex-col animate-in fade-in zoom-in-95 duration-300">
      {tipo === "critica" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-alerta/10">
            <HeartHandshake className="h-8 w-8 text-alerta" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold leading-snug text-pizarra">
            Lamentamos que tu experiencia no haya sido buena
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-pizarra/75">
            Gracias por decírnoslo. Tu valoración ya llegó al equipo responsable para revisar lo ocurrido en{" "}
            <strong className="text-pizarra">{respuesta.edificio}</strong> y darle seguimiento lo antes posible.
          </p>
          <button
            type="button"
            onClick={onVerAviso}
            className="mt-6 flex w-full items-start gap-3 rounded-2xl border border-alerta/25 bg-alerta/5 p-4 text-left"
          >
            <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-alerta" />
            <span>
              <span className="block font-display font-semibold text-alerta">
                Aviso enviado al equipo por WhatsApp/correo
              </span>
              <span className="mt-0.5 block text-sm text-pizarra/70">
                {alerta ? "Alerta registrada (simulación). Toca para ver el detalle." : "Registrando alerta…"}
              </span>
            </span>
          </button>
        </>
      )}

      {tipo === "neutra" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ambar/10">
            <CheckCircle2 className="h-8 w-8 text-ambar" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold leading-snug text-pizarra">Gracias por tu valoración</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-pizarra/75">
            Hemos registrado tu opinión. La tendremos en cuenta para seguir mejorando los servicios de tu comunidad.
          </p>
        </>
      )}

      {tipo === "positiva" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-esmeralda/10">
            <CheckCircle2 className="h-8 w-8 text-esmeralda" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold leading-snug text-pizarra">
            ¡Gracias! Nos alegra que estés satisfecho
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-pizarra/75">
            Tu valoración motiva al equipo. Si tienes un momento, compartir tu experiencia en Google ayuda a otros
            vecinos a conocernos.
          </p>
          <a
            href={ENLACE_RESENA_GOOGLE}
            onClick={(e) => {
              e.preventDefault();
              toast.success("Enlace simulado a la reseña de Google", {
                description: `En producción se abrirá: ${ENLACE_RESENA_GOOGLE}`,
              });
            }}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-esmeralda font-display text-lg font-semibold text-white shadow-md shadow-esmeralda/25 transition active:scale-[0.98]"
          >
            <GoogleG /> Dejar reseña en Google
          </a>
          <p className="mt-2 text-center text-xs text-pizarra/50">Enlace simulado para la demo</p>
        </>
      )}

      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={onOtra}
          className="flex h-14 w-full items-center justify-center rounded-2xl border border-pizarra/15 bg-white text-base font-semibold text-pizarra transition active:scale-[0.98]"
        >
          Enviar otra valoración
        </button>
      </div>
    </section>
  );
}

/** Icono "G" neutro (sin logotipo oficial) para el botón de reseña. */
function GoogleG() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-display text-base font-bold text-esmeralda">
      G
    </span>
  );
}
