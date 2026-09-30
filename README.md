# Convivir · Encuesta de satisfacción y panel de métricas

Aplicación web **mobile-first** para **Gestión de Comunidades Convivir** (Colombia): los residentes valoran en menos de un minuto los servicios técnicos y administrativos de su comunidad, y la administración consulta métricas, gráficos, respuestas y alertas en un panel.

**Todo funciona en el navegador con `localStorage`.** No hay backend, base de datos ni servicios externos.

- **URL pública de previsualización:** _pendiente de publicar desde Lovable (Publish)_
- **Proyecto Lovable:** https://lovable.dev/projects/9d46b214-3e04-4798-b2f9-3f955096c994

---

## Arranque

**En Lovable:** abrir el proyecto; la previsualización se genera sola. La app funciona sin configurar nada: al primer acceso se cargan 30 respuestas de ejemplo.

**En local** (Node.js 20+ o Bun):

```sh
npm install      # o: bun install
npm run dev      # servidor de desarrollo
npm run build    # compilación de producción
```

## Pantallas y rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Encuesta pública: bienvenida con selector de edificio y servicio, 6 preguntas (una por pantalla), consentimiento y resultado |
| `/?edificio=<slug>&servicio=<slug>` | Encuesta con edificio y/o servicio prellenados (enlaces y QR) |
| `/admin` | Dashboard: KPIs, distribución de estrellas, evolución temporal, aspectos mejor y peor valorados, alertas recientes |
| `/admin/respuestas` | Bandeja: filtros por fecha, edificio y calificación, detalle con comentario completo, cambio de estado y exportación CSV/JSON |
| `/admin/enlaces` | Generador de enlaces y códigos QR por edificio y/o servicio |
| `/sala` | Vista de sala para proyectar los indicadores del mes en curso |

El panel no tiene login (no se pidió); el acceso está en el pie de la encuesta ("Acceso administración").

## Dónde está cada cosa

```
src/
├── routes/                  Pantallas (enrutado por archivos de TanStack Start)
│   ├── index.tsx            Encuesta pública (lee ?edificio y ?servicio)
│   ├── admin.tsx            Estructura del panel: navegación, filtros compartidos, reinicio de datos
│   ├── admin.index.tsx      Dashboard
│   ├── admin.respuestas.tsx Bandeja de respuestas y exportación
│   ├── admin.enlaces.tsx    Generador de enlaces y QR
│   └── sala.tsx             Vista de sala
├── components/
│   ├── encuesta/            Flujo de la encuesta y selector de estrellas
│   ├── admin/               Filtros, tarjetas KPI, estados
│   └── marca/               Logotipo provisional (SVG)
├── data/
│   ├── catalogo.ts          Edificios, servicios, configuración de alertas, enlace de Google y textos legales
│   └── datos-ejemplo.ts     30 respuestas de ejemplo precargadas
├── lib/
│   ├── almacen.ts           Lectura y escritura en localStorage (reactivo, sin recargar)
│   ├── alertas.ts           Reglas 1-2 / 3 / 4-5 estrellas y alerta simulada (punto de integración)
│   ├── metricas.ts          Filtros, promedios, distribución y evolución
│   ├── exportar.ts          Exportación CSV y JSON
│   └── qr.ts                Generador de códigos QR propio (sin dependencias)
└── types/encuesta.ts        Modelo de datos (Respuesta, Alerta, estados)
```

**Claves de `localStorage`:** `convivir.respuestas.v1` (respuestas) y `convivir.alertas.v1` (registro de alertas).

## Qué está simulado

| Elemento | Simulación actual | Cómo hacerlo real |
| --- | --- | --- |
| Alerta por WhatsApp/correo (1-2 ★) | Se muestra un modal y una notificación, y se registra en `convivir.alertas.v1` (visible en el dashboard y en el detalle de la respuesta) | Implementar `enviarReal()` en `src/lib/alertas.ts` y rellenar `CONFIG_ALERTAS.webhookUrl` en `src/data/catalogo.ts` |
| Reseña pública en Google (4-5 ★) | El botón muestra un aviso con el enlace simulado | Sustituir `ENLACE_RESENA_GOOGLE` en `src/data/catalogo.ts` y quitar el `preventDefault` del botón en `src/components/encuesta/Encuesta.tsx` |
| Persistencia | `localStorage` del navegador (cada navegador tiene sus propios datos) | Reemplazar las funciones de `src/lib/almacen.ts` por llamadas al backend |
| Textos legales | Textos de marcador | Editar `TEXTOS_LEGALES` en `src/data/catalogo.ts` |
| Logotipo | Marca provisional en SVG | Sustituir `src/components/marca/LogoConvivir.tsx` |

Reglas de resultado (en `src/lib/alertas.ts`): **1-2 ★** muestra un mensaje empático y dispara la alerta; **3 ★** muestra un agradecimiento neutro; **4-5 ★** muestra un agradecimiento y el botón de reseña en Google.

## Reiniciar los datos de ejemplo

- **Desde la app:** Panel → **"Restablecer datos de ejemplo"** (en la barra lateral en escritorio o con el icono ↺ de la cabecera en el celular) y confirmar.
- **Manualmente:** borrar las claves `convivir.respuestas.v1` y `convivir.alertas.v1` del `localStorage` (DevTools → Application → Local Storage) y recargar.

Al reiniciar, las fechas de ejemplo se recalculan respecto al día actual, para que el mes en curso siempre tenga datos en la vista de sala.

## Notas técnicas

- **Stack:** React 19, TanStack Start (plantilla de Lovable sobre Vite), Tailwind CSS 4, shadcn/ui, Recharts.
- **Identidad visual:** paleta #1E293B, #059669, #D97706, #DC2626 y #F8FAFC (tokens `pizarra`, `esmeralda`, `ambar`, `alerta` y `niebla` en `src/styles.css`). Tipografías Plus Jakarta Sans (títulos y botones) e Inter (textos y formularios), cargadas desde Google Fonts. Es el único recurso externo y solo afecta a la tipografía.
- **Códigos QR:** se generan en el navegador (`src/lib/qr.ts`), sin librerías ni servicios externos.
