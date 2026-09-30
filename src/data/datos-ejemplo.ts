import type { Alerta, EstadoAtencion, Estrellas, Respuesta } from "@/types/encuesta";
import { CONFIG_ALERTAS, EDIFICIOS, SERVICIOS } from "./catalogo";

/**
 * Datos de ejemplo precargados (30 respuestas).
 * Las fechas se calculan en relación con el momento de la primera carga para
 * que el dashboard y la vista de sala muestren siempre datos del mes en curso.
 */

type Plantilla = {
  e: number; // índice de edificio
  s: number; // índice de servicio
  v: [Estrellas, Estrellas, Estrellas, Estrellas]; // general, tiempo, trato, servicio
  comentario: string;
  contacto?: string;
  estado: EstadoAtencion;
  mesActual: boolean;
};

const PLANTILLAS: Plantilla[] = [
  // ——— Mes en curso ———
  {
    e: 0, s: 0, v: [1, 1, 2, 1], mesActual: true, estado: "Pendiente",
    comentario:
      "El ascensor de la torre 2 lleva cuatro días fuera de servicio y nadie nos informa cuándo lo arreglan. En el piso 14 vive una señora en silla de ruedas que no ha podido salir.",
    contacto: "Martha Lucía Restrepo · 310 000 4821",
  },
  {
    e: 1, s: 3, v: [5, 5, 5, 5], mesActual: true, estado: "Resuelto",
    comentario:
      "Las zonas comunes están impecables desde que llegó el nuevo equipo de aseo. Se nota la diferencia en el salón social y en los pasillos.",
  },
  {
    e: 2, s: 2, v: [2, 2, 3, 2], mesActual: true, estado: "En atención",
    comentario:
      "La portería de la entrada peatonal queda sola en el cambio de turno de la noche. El martes entró una persona sin registrarse y nadie se dio cuenta.",
    contacto: "Andrés Felipe Cárdenas · 315 000 7734",
  },
  {
    e: 3, s: 5, v: [4, 4, 5, 4], mesActual: true, estado: "Resuelto",
    comentario:
      "Me enviaron el paz y salvo en el mismo día que lo pedí. Muy amable la persona de administración.",
  },
  {
    e: 0, s: 4, v: [3, 2, 4, 3], mesActual: true, estado: "En atención",
    comentario:
      "Arreglaron la filtración del parqueadero, pero tardaron casi dos semanas en venir a revisar. El trabajo quedó bien.",
  },
  {
    e: 4, s: 1, v: [5, 4, 5, 5], mesActual: true, estado: "Resuelto",
    comentario:
      "Los jardines de la entrada quedaron preciosos con la nueva siembra. Felicitaciones a don Hernando.",
  },
  {
    e: 1, s: 0, v: [4, 3, 4, 4], mesActual: true, estado: "Resuelto",
    comentario:
      "El técnico del ascensor llegó puntual y explicó qué había pasado. Solo sugiero avisar por el grupo del conjunto cuando haya mantenimiento programado.",
  },
  {
    e: 2, s: 5, v: [1, 1, 1, 2], mesActual: true, estado: "Pendiente",
    comentario:
      "Llevo tres semanas esperando respuesta a un derecho de petición sobre el cobro de la cuota extraordinaria. Nadie contesta el teléfono de la oficina.",
    contacto: "Jorge Iván Salazar · 316 000 3390",
  },
  {
    e: 3, s: 3, v: [3, 3, 3, 3], mesActual: true, estado: "Resuelto",
    comentario:
      "La limpieza está bien entre semana, pero los lunes el shut de basuras huele muy mal después del fin de semana.",
  },
  {
    e: 0, s: 2, v: [5, 5, 5, 4], mesActual: true, estado: "Resuelto",
    comentario:
      "El vigilante de la noche me ayudó a recibir un domicilio y me avisó por citófono. Excelente servicio.",
  },
  {
    e: 4, s: 4, v: [2, 1, 3, 2], mesActual: true, estado: "Pendiente",
    comentario:
      "La puerta del parqueadero sigue fallando y hay que esperar hasta diez minutos para salir. Ya lo reporté dos veces.",
    contacto: "Paola Andrea Gómez · 301 000 2250",
  },
  {
    e: 1, s: 1, v: [4, 4, 4, 5], mesActual: true, estado: "Resuelto",
    comentario: "Muy bien la poda de los árboles del parque infantil, ya no hay ramas sobre los juegos.",
  },
  // ——— Meses anteriores ———
  {
    e: 0, s: 3, v: [5, 5, 5, 5], mesActual: false, estado: "Resuelto",
    comentario:
      "Gracias al equipo de aseo por la jornada de lavado de fachadas y pasillos. Todo quedó como nuevo.",
  },
  {
    e: 1, s: 2, v: [2, 2, 2, 3], mesActual: false, estado: "Resuelto",
    comentario:
      "Dejaron pasar a un domiciliario hasta la puerta del apartamento sin anunciarlo. Pido que se refuerce el protocolo de ingreso.",
    contacto: "Carolina Mejía · 320 000 1198",
  },
  {
    e: 2, s: 0, v: [4, 4, 5, 4], mesActual: false, estado: "Resuelto",
    comentario: "Cambiaron el tablero del ascensor y ahora funciona mucho más suave. Buen trabajo.",
  },
  {
    e: 3, s: 4, v: [1, 1, 2, 1], mesActual: false, estado: "En atención",
    comentario:
      "La humedad del techo de mi apartamento viene de la cubierta común. Vinieron a mirar hace un mes y no han vuelto. Ya se me dañó el cielo raso.",
    contacto: "Luis Eduardo Ramírez · 318 000 6607",
  },
  {
    e: 4, s: 5, v: [5, 5, 5, 5], mesActual: false, estado: "Resuelto",
    comentario:
      "La administradora resolvió mi duda sobre el cobro del parqueadero de visitantes muy rápido y con toda la paciencia.",
  },
  {
    e: 0, s: 1, v: [3, 3, 4, 3], mesActual: false, estado: "Resuelto",
    comentario: "El césped está bien cuidado, pero dejan los residuos de la poda varios días en la zona verde.",
  },
  {
    e: 1, s: 4, v: [4, 3, 4, 4], mesActual: false, estado: "Resuelto",
    comentario:
      "Repararon las luminarias del sendero peatonal. Tardaron un poco, pero ahora se siente más seguro caminar de noche.",
  },
  {
    e: 2, s: 3, v: [5, 4, 5, 5], mesActual: false, estado: "Resuelto",
    comentario: "Excelente el trabajo de doña Gloria en la limpieza de la torre B. Siempre muy atenta y amable.",
  },
  {
    e: 3, s: 0, v: [2, 1, 3, 2], mesActual: false, estado: "Resuelto",
    comentario:
      "El ascensor se detuvo entre pisos con dos niños adentro. El técnico tardó más de una hora en llegar.",
  },
  {
    e: 4, s: 2, v: [4, 4, 4, 4], mesActual: false, estado: "Resuelto",
    comentario: "Buena la instalación de las nuevas cámaras en el lobby. El personal de vigilancia es respetuoso.",
  },
  {
    e: 0, s: 5, v: [3, 2, 4, 3], mesActual: false, estado: "Resuelto",
    comentario:
      "La atención es amable, pero el acta de la asamblea tardó más de un mes en publicarse.",
  },
  {
    e: 1, s: 5, v: [5, 5, 4, 5], mesActual: false, estado: "Resuelto",
    comentario:
      "Muy clara la presentación del presupuesto en la asamblea. Se agradece la transparencia de la administración.",
  },
  {
    e: 2, s: 1, v: [4, 4, 4, 3], mesActual: false, estado: "Resuelto",
    comentario: "Los jardines se ven bien. Sería bueno regar más seguido en temporada seca.",
  },
  {
    e: 3, s: 2, v: [5, 5, 5, 5], mesActual: false, estado: "Resuelto",
    comentario:
      "El guarda de seguridad detectó un escape de gas en el sótano y actuó rapidísimo. Toda la gratitud del conjunto.",
    contacto: "Diana Marcela Rojas · 312 000 8843",
  },
  {
    e: 4, s: 0, v: [3, 3, 3, 3], mesActual: false, estado: "Resuelto",
    comentario: "El ascensor funciona, pero hace un ruido extraño al llegar al piso 9. Ojalá lo revisen en el próximo mantenimiento.",
  },
  {
    e: 0, s: 0, v: [1, 2, 1, 1], mesActual: false, estado: "Resuelto",
    comentario:
      "El técnico del ascensor fue grosero cuando le pregunté cuánto iba a demorar la reparación. No es la forma de tratar a los residentes.",
  },
  {
    e: 1, s: 3, v: [4, 5, 4, 4], mesActual: false, estado: "Resuelto",
    comentario: "Muy buena la desinfección de las áreas comunes. Solo pediría más frecuencia en el gimnasio.",
  },
  {
    e: 2, s: 4, v: [5, 5, 5, 4], mesActual: false, estado: "Resuelto",
    comentario:
      "Arreglaron la bomba de agua un domingo en la mañana, sin que nos quedáramos sin servicio. Muy agradecidos.",
  },
];

/** Pseudoaleatorio determinista para que los datos sean estables entre recargas. */
function aleatorio(semilla: number): number {
  const x = Math.sin(semilla * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function fechaParaIndice(ahora: Date, indice: number, mesActual: boolean, totalMes: number, posMes: number): Date {
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0);
  const hora = 7 + Math.floor(aleatorio(indice + 1) * 13); // entre 7:00 y 19:59
  const minuto = Math.floor(aleatorio(indice + 101) * 60);

  if (mesActual) {
    // Reparte las respuestas entre el día 1 del mes y hoy (sin pasar de "ahora").
    const diasTranscurridos = Math.max(0, Math.floor((ahora.getTime() - inicioMes.getTime()) / 86_400_000));
    const dia = Math.round((diasTranscurridos * posMes) / Math.max(1, totalMes - 1));
    const fecha = new Date(inicioMes);
    fecha.setDate(1 + dia);
    fecha.setHours(hora, minuto, 0, 0);
    if (fecha.getTime() > ahora.getTime()) {
      // Si es hoy y la hora aún no ha llegado, se sitúa unos minutos antes de "ahora".
      return new Date(Math.max(inicioMes.getTime(), ahora.getTime() - (posMes + 1) * 7 * 60_000));
    }
    return fecha;
  }

  // Meses anteriores: entre 2 y 75 días antes del inicio del mes en curso.
  const diasAtras = 2 + Math.floor(aleatorio(indice + 1001) * 73);
  const fecha = new Date(inicioMes);
  fecha.setDate(fecha.getDate() - diasAtras);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha;
}

export function generarDatosEjemplo(ahora: Date = new Date()): { respuestas: Respuesta[]; alertas: Alerta[] } {
  const totalMes = PLANTILLAS.filter((p) => p.mesActual).length;
  let posMes = 0;

  const respuestas: Respuesta[] = PLANTILLAS.map((p, i) => {
    const fecha = fechaParaIndice(ahora, i, p.mesActual, totalMes, p.mesActual ? posMes++ : 0);
    const edificio = EDIFICIOS[p.e]?.nombre ?? "";
    const servicio = SERVICIOS[p.s]?.nombre ?? "";
    return {
      id: `ej-${String(i + 1).padStart(3, "0")}`,
      fecha: fecha.toISOString(),
      edificio,
      servicio,
      valoracionGeneral: p.v[0],
      tiempoRespuesta: p.v[1],
      tratoPersonal: p.v[2],
      valoracionServicio: p.v[3],
      comentario: p.comentario,
      contacto: p.contacto ?? "",
      consentimiento: true,
      estado: p.estado,
    };
  });

  respuestas.sort((a, b) => b.fecha.localeCompare(a.fecha));

  const alertas: Alerta[] = respuestas
    .filter((r) => r.valoracionGeneral <= 2)
    .map((r) => ({
      id: `al-${r.id}`,
      fecha: r.fecha,
      respuestaId: r.id,
      edificio: r.edificio,
      servicio: r.servicio,
      valoracionGeneral: r.valoracionGeneral,
      canales: [...CONFIG_ALERTAS.canales],
      destinatario: CONFIG_ALERTAS.destinatario,
      mensaje: `Valoración de ${r.valoracionGeneral} ★ en ${r.edificio} (${r.servicio}).`,
      resultado: "simulado" as const,
    }));

  return { respuestas, alertas };
}
