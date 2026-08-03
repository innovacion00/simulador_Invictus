# Invictus × GEHsuites — Landing + Simulador de rentabilidad

Landing page comercial cuyo componente central es un **simulador interactivo de
rentabilidad** para inversionistas del proyecto Invictus, operado por GEHsuites.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · sin backend.

## Empezar

```bash
npm install
npm run dev              # http://localhost:3000
npm run build            # build de producción
npm run lint
npm run verificar:modelo # contrasta el motor contra las tablas oficiales
```

## Arquitectura

```
src/
  app/
    layout.tsx                 metadata, fuente, html lang="es-CO"
    page.tsx                   composición de las secciones
    globals.css                sistema de diseño (@theme de Tailwind 4)
  lib/
    types.ts                   Scenario, PnLBreakdown, SimulatorInputs, SimulatorResults…
    finance/
      constants.ts             FUENTE DE VERDAD: datos generales + tablas oficiales
      engine.ts                funciones puras: calcularPnL, proyectarPnL, calcularRetorno, simular
      formatters.ts            formatCOP, formatPercent, formatAnios, porHorizonte
  components/
    Nav · Hero · WhyInvest · FinancialBreakdown
    GEHSuitesFeeExplainer · FAQ · ContactSection · ContactForm · Footer
    Simulator/
      Simulator.tsx            orquestador: estado único + useMemo
      estado.ts                EstadoSimulador, valores iniciales, helpers
      ParametrosPanel.tsx      «Parámetros de la simulación» + acordeón avanzado
      ProyeccionRentabilidad.tsx  resultados mensuales y anuales simultáneos
      WaterfallBreakdown.tsx   cascada de ingresos a utilidad
      TablaFinanciera.tsx      «Tabla financiera detallada» (COP y USD, editable)
      ComparadorEscenarios.tsx  las tres tarjetas de escenario
      GraficasSimulacion.tsx   las tres gráficas + vista de tabla
      MetodologiaCalculo.tsx   «¿Cómo se calcula la rentabilidad?»
      AvisoLegal.tsx · CtaSimulador.tsx
    ui/
      Panel.tsx                tarjeta titulada, campo y grupo de opciones
      Reveal.tsx               entrada al hacer scroll (IntersectionObserver)
      useCountUp.ts            animación de números
scripts/
  verificar-modelo.ts          verificación del modelo financiero
```

Todo el cálculo vive en `src/lib/finance`, sin dependencias de React ni del DOM:
es auditable y testeable por separado de la UI.

## La regla de oro del modelo

Los tres escenarios oficiales (**pesimista / conservador / optimista**) se
muestran con los **valores exactos** de `constants.ts`, tomados del modelo
financiero real. No se recalculan ni se redondean.

El motor de `engine.ts` se usa sólo en dos casos, y ambos se etiquetan en la UI
como **estimación**:

1. **Modo personalizado** — el usuario mueve los sliders de ocupación y ADR
   fuera de los tres escenarios oficiales.
2. **Años 2 a 5** — proyección con crecimiento de tarifa e inflación del 5%.
   El Año 1 siempre es la tabla oficial.

Aun así, el motor está calibrado para reproducir las tablas al peso.
`npm run verificar:modelo` lo comprueba: reproduce el EBITDA de los tres
escenarios con una diferencia máxima de **0,5 COP** (redondeo de la hoja
original), y confirma que ROI, margen y payback coinciden con la tabla.

## Parámetros que se cambian en un solo sitio

Todos en `src/lib/finance/constants.ts`:

| Constante | Valor actual | Efecto |
|---|---|---|
| `PRECIO_INMUEBLE` | `1_130_000_000` | base del ROI «sobre precio apto» |
| `VALOR_AMUEBLAMIENTO` | `50_000_000` | se suma al precio de la unidad |
| `PRECIO_UNIDAD` | `1_180_000_000` | inversión total; base del ROI y del payback |
| `TARIFA_IMPUESTO_RENTA` | `0` | subir a `0.35` activa el impuesto en todo el sitio |
| `DEPRECIACION_ANUAL` | `0` | usar `VALOR_AMUEBLAMIENTO / VIDA_UTIL_AMUEBLAMIENTO` para activarla |
| `TOTAL_UNIDADES` | `500` | unidades productivas del proyecto |
| `MAX_UNIDADES_SIMULADOR` | `10` | tope del selector de apartamentos |
| `CRECIMIENTO_ADR` / `INFLACION_COSTOS` | `0.05` | proyección años 2–5 |
| `TASA_CAMBIO_DEFECTO` | `4050` | punto de partida de la vista en USD, editable por el usuario |
| `WHATSAPP_ASESOR` | placeholder | **pendiente**: número real de GEHsuites |
| `ESCENARIOS` | — | las tablas oficiales del P&G |

Los cuatro parámetros del acordeón «Parámetros avanzados» (precio de la unidad,
días base, impuesto de renta y depreciación) se editan desde la propia interfaz.
Cambiar cualquiera marca el resultado como estimación y deja de usar los
indicadores exactos de la tabla oficial.

Al activar impuesto o depreciación, actualiza también las cifras de `ESCENARIOS`
si el modelo financiero de origen cambia: son la fuente de verdad, no un
resultado calculado.

## Líneas fijas vs. editables (`LineItem.fijo`)

Cada línea del P&G lleva `fijo?: boolean` (`types.ts`). Es `true` sólo en los
montos fijos mensuales que no dependen de ventas ni de ocupación (fee de
administración, gastos médicos, Sayco y Acinpro, predial). Todo lo demás
—ya sea semifijo por ocupación (energía, agua, gas, internet, aseo,
lavandería) o un % de ventas (comisión de canales, FARA, costos de operación,
fee operador GEHsuites, datáfonos)— queda sin marcar y es editable.

La **Tabla financiera detallada** (`TablaFinanciera.tsx`) usa esta marca para
su columna «Incluir» y su columna «%»:

- **Incluir** (checkbox): apaga cualquier línea de costo/gasto — fija o no —
  excluyéndola de su subtotal, del EBITDA y de la utilidad neta.
- **%**: sólo las líneas sin `fijo` muestran un input; escribir un nuevo %
  reemplaza esa línea por `% × ventas`, y todo se recalcula en cascada
  (subtotales → EBITDA → impuesto → utilidad neta → márgenes → ROI → payback).

Los ajustes viven en estado local del componente (`useState`), se reinician
al cambiar de escenario/año/unidades, y **no afectan** al resto del sitio
(hero, comparador, gráficas): es un sandbox de "qué pasaría si", no una
segunda fuente de verdad. Por eso, en cuanto hay algún ajuste activo, la tabla
muestra un aviso y un botón «Restablecer».

## Decisiones de diseño

- **Fondo arena** (`#fdfaf4`) con acentos azul profundo, azul Caribe y dorado
  suave; tarjetas redondeadas, sombras suaves, animaciones ligeras, mobile first.
- **Titulares en serif** (Spectral) sobre **interfaz y cifras en sans**
  (Plus Jakarta Sans). Ninguna cifra usa la serif: los números viven siempre en
  la sans, incluidas las de las gráficas.
- Las escalas de color siguen la arquitectura `navy` / `caribe` / `gold` /
  `sand` / `ink`, con los valores propios de Invictus definidos en
  `globals.css`. Cambiar la marca es editar ese bloque `@theme`.
- **Paleta de series validada para daltonismo.** Los colores de los tres
  escenarios (`#eda100` / `#2a78d6` / `#1baf7a`) superan las pruebas de
  separación CVD en todos los pares (ΔE ≥ 9,1) y de visión normal (ΔE ≥ 22,9)
  sobre superficie blanca. La identidad nunca depende sólo del color: cada
  gráfica lleva leyenda, etiquetas directas y una vista de tabla equivalente.
- **Una escala por gráfica.** Pesos, porcentajes y años nunca comparten eje: el
  comparativo son tres paneles separados.
- Se respeta `prefers-reduced-motion` en las animaciones de entrada y de números.

## Pendientes de integración

- **Formulario de contacto** (`ContactForm.tsx`): hoy valida en cliente y muestra
  el estado de éxito. El punto de integración está marcado con un comentario —
  reemplaza la espera simulada por un Server Action, `/api/contacto`, el CRM o el
  servicio de email. El resto del componente no cambia.
- **Imagen del hero** (`Hero.tsx`): `public/espacios-lujosos.jpg`, con `next/image`
  en modo `fill` + `object-cover` dentro de un contenedor `aspect-[4/3]`.
  Sustituible por otra foto o por un `<video>` con las mismas clases.
- **WhatsApp del asesor** (`WHATSAPP_ASESOR` en `constants.ts`): hoy es un número
  de relleno. El botón «Solicitar asesoría» ya arma el mensaje con el resumen de
  la simulación; sólo falta el número real.
- **Tasa de cambio**: no se consulta ninguna fuente en vivo. El usuario digita la
  tasa; `TASA_CAMBIO_DEFECTO` es sólo el punto de partida y conviene revisarlo.
- **«Descargar PDF»** genera un PDF real (vectorial, a color) en el navegador con
  `@react-pdf/renderer` — ver `components/Simulator/pdf/ReporteDocument.tsx` — y
  lo descarga directamente, sin pasar por el diálogo de impresión. Usa los
  colores de marca en hex fijo (no las variables CSS de `globals.css`, que
  `@react-pdf/renderer` no puede leer) y la fuente base Helvetica en vez de
  Spectral/Jakarta, para no depender de cargar archivos de fuente adicionales.

## Aviso

Las cifras corresponden al Año 1 del modelo financiero P&G por unidad de
Invictus, operado por GEHsuites. No constituyen garantía de rentabilidad.
#   s i m u l a d o r _ I n v i c t u s  
 