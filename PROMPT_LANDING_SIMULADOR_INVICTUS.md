# PROMPT MAESTRO — Landing Page Simulador de Rentabilidad
## Proyecto Invictus × GEHsuites

Copia y pega todo el bloque de abajo (desde "ROL Y CONTEXTO" hasta el final) en Claude Code, Cursor, v0.dev o la herramienta que uses para generar el sitio.

---

## ROL Y CONTEXTO

Actúa como **arquitecto senior full-stack**, **diseñador UX/UI premium** y **experto en modelos financieros para inversión inmobiliaria turística**. Vas a construir una **landing page comercial** cuyo componente central es un **simulador interactivo de rentabilidad** para inversionistas del proyecto **Invictus**, operado y comercializado bajo la marca **GEHsuites** (operador único del proyecto).

El simulador debe traducir un modelo financiero real (P&G anual por unidad, 3 escenarios) en una experiencia visual simple, confiable y persuasiva para un inversionista que NO es financiero: debe entender en segundos cuánto podría ganar por cada apartamento que compra, cuál es su ROI y en cuántos años recupera la inversión, según el escenario de ocupación.

**Ventaja de este modelo:** el P&G ya está construido **por unidad (por apartamento)**, así que el ROI y el payback salen directos y son la métrica estrella del simulador.

---

## STACK TÉCNICO OBLIGATORIO

Crear una aplicación web moderna usando:
- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- Componentes reutilizables
- Estado local con **React hooks** (sin backend — toda la lógica del simulador corre en frontend)
- Formateo monetario profesional (COP, separador de miles, símbolo $)
- Código limpio, escalable y bien documentado (comentarios claros en el motor de cálculo)

**No usar backend inicialmente.** Toda la lógica financiera debe estar implementada como funciones puras de TypeScript, desacopladas de la UI, fáciles de testear y auditar.

---

## ESTILO VISUAL OBLIGATORIO

- Fondo claro con acentos **azul profundo**, **azul Caribe**, **blanco**, **arena** y **dorado suave**.
- Diseño premium tipo inversión inmobiliaria (no template genérico de SaaS).
- Tarjetas con **bordes redondeados**.
- **Sombras suaves** (elevación sutil, sin bordes duros).
- Íconos financieros y hoteleros (usar librería tipo `lucide-react`: gráficas, monedas, llave/habitación, edificio, playa/palmera, etc.).
- **Animaciones ligeras** (transición de números tipo count-up, entrada suave de gráficas y tarjetas al hacer scroll).
- **Layout mobile first.**
- 100% compatible con escritorio, tablet y celular.

---

## 1. DATOS GENERALES DEL PROYECTO (fuente: modelo financiero real, hoja "INVICTUS")

- **Tipología:** Apartamentos de 1 Habitación (proyecto de operador único).
- **Total de unidades productivas:** 500 apartamentos.
- **Precio Apartamento + Amueblamiento (inversión total por unidad):** **$1.180.000.000 COP**
  - Valor del inmueble (sin amueblamiento): $1.130.000.000
  - Valor del amueblamiento / dotación: $50.000.000
  - Vida útil del amueblamiento: 10 años
- **Días calendario del año:** 365 · **Días de goce del propietario:** 60 · **Días a comercializar:** 305
- **Crecimiento tarifa anual (ADR):** 5% · **Inflación de costos fijos:** 5%
- **Impuesto de renta:** el modelo contempla **35% sobre (EBITDA − Depreciación)**, pero en la versión actual la tarifa está aplicada en **0%** (depreciación = 0), por lo que Utilidad Neta = EBITDA. Deja la tarifa de impuesto como **parámetro configurable** (`tarifaImpuestoRenta`, default 0) para poder activarla fácilmente.
- Todas las cifras están en **COP** y son **por unidad / por apartamento**, en base **anual** (Año 1). El modelo también expone la vista mensual (anual ÷ 12).

---

## 2. VARIABLES OPERATIVAS POR ESCENARIO (Año 1, por unidad)

| Variable | Pesimista | Conservador | Optimista |
|---|---|---|---|
| Base de días | 365 | 365 | 365 |
| % Ocupación | 60% | 75% | 80% |
| ADR (tarifa promedio/noche) | $985.000 | $994.850 | $1.014.550 |
| Ajuste ADR vs Pesimista | 0% | +1% | +3% |

---

## 3. P&G ANUAL POR UNIDAD (fuente de verdad — usar estos valores exactos, no inventar cifras)

### INGRESOS (COP/año por unidad)
| Concepto | Pesimista | Conservador | Optimista |
|---|---|---|---|
| Ventas de Hospedaje | 215.715.000 | 272.340.188 | 296.248.600 |
| **TOTAL INGRESOS** | **215.715.000** | **272.340.188** | **296.248.600** |

*(Fórmula base: ADR × %Ocupación × 365 días. Ej. Pesimista: 985.000 × 0,60 × 365 = 215.715.000)*

### COSTOS DIRECTOS (COP/año por unidad)
| Concepto | % / base | Pesimista | Conservador | Optimista |
|---|---|---|---|---|
| Comisión canales (Booking, Airbnb, Web, Agencias +20 canales) | 18% de ventas | 38.828.700 | 49.021.234 | 53.324.748 |
| Comisión Fee Administración | $300.000/mes | 3.600.000 | 3.600.000 | 3.600.000 |
| FARA (Fondo de Reposición y Reparación) | 3% de ventas | 6.471.450 | 8.170.206 | 8.887.458 |
| Costos de Operación (nómina, variables, dotación) | 2% de ventas | 4.314.300 | 5.446.804 | 5.924.972 |
| Bolsa de Empleo | — | 345.144 | 435.744 | 473.998 |
| **TOTAL COSTOS DIRECTOS** | | **53.559.594** | **66.673.987** | **72.211.176** |

### GASTOS — SERVICIOS PÚBLICOS (COP/año por unidad)
| Concepto | Pesimista | Conservador | Optimista |
|---|---|---|---|
| Energía | 6.840.000 | 8.550.000 | 9.120.000 |
| Agua | 3.240.000 | 4.050.000 | 4.320.000 |
| Gas | 720.000 | 900.000 | 960.000 |
| Internet / Cable / Telefonía | 840.000 | 840.000 | 840.000 |
| **Subtotal Servicios Públicos** | **11.640.000** | **14.340.000** | **15.240.000** |

### GASTOS — VARIOS (COP/año por unidad)
| Concepto | % / base | Pesimista | Conservador | Optimista |
|---|---|---|---|---|
| Papelería | — | 300.000 | 300.000 | 300.000 |
| Aseo | — | 1.080.000 | 1.350.000 | 1.440.000 |
| Lavandería | — | 2.400.000 | 3.000.000 | 3.200.000 |
| Marketing y Publicidad | 0,8% de ventas | 1.725.720 | 2.178.722 | 2.369.989 |
| Honorarios Firma Contable y Revisoría Fiscal | — | 240.000 | 240.000 | 240.000 |
| Operación — Fee Operador Comercial (GEHsuites) | 12% de ventas | 25.885.800 | 32.680.823 | 35.549.832 |
| Gastos Médicos y Ambulancia | — | 240.000 | 240.000 | 240.000 |
| Costos Datáfonos / Pasarela de Pagos | 2,2% de ventas | 4.745.730 | 5.991.484 | 6.517.469 |
| Agremiaciones (Cotelco / gremios) | — | 120.000 | 120.000 | 120.000 |
| Licencias y Software Administrativo | — | 120.000 | 120.000 | 120.000 |
| **Subtotal Gastos Varios** | | **36.857.250** | **46.221.028** | **50.097.290** |

### OTROS GASTOS FIJOS (COP/año por unidad)
| Concepto | Pesimista | Conservador | Optimista |
|---|---|---|---|
| Sayco y Acinpro | 180.000 | 180.000 | 180.000 |
| PMS y Channel Manager | 350.000 | 350.000 | 350.000 |
| Predial | 10.200.000 | 10.200.000 | 10.200.000 |

### RESULTADO (COP/año por unidad)
| Concepto | Pesimista | Conservador | Optimista |
|---|---|---|---|
| **UTILIDAD BRUTA / EBITDA** | **102.928.156** | **134.375.172** | **147.970.134** |
| Margen EBITDA (%) | 47,71% | 49,34% | 49,95% |
| (−) Depreciación Amueblamiento | 0 | 0 | 0 |
| (−) Impuesto de Renta (35% s/ EBITDA−Depr; tarifa actual 0%) | 0 | 0 | 0 |
| **UTILIDAD NETA** | **102.928.156** | **134.375.172** | **147.970.134** |

---

## 4. INDICADORES DE RETORNO POR UNIDAD (Año 1) — ¡las métricas estrella!

| Indicador | Pesimista | Conservador | Optimista |
|---|---|---|---|
| Total Ingresos | 215.715.000 | 272.340.188 | 296.248.600 |
| EBITDA | 102.928.156 | 134.375.172 | 147.970.134 |
| Utilidad Neta | 102.928.156 | 134.375.172 | 147.970.134 |
| Flujo de Caja Libre (Utilidad Neta + Depreciación) | 102.928.156 | 134.375.172 | 147.970.134 |
| Margen EBITDA (%) | 47,71% | 49,34% | 49,95% |
| Margen Neto (%) | 47,71% | 49,34% | 49,95% |
| **Rentabilidad anual (Utilidad Neta / Precio Apto)** | **9,11%** | **11,89%** | **13,09%** |
| **Rentabilidad anual (Utilidad Neta / Inversión Total)** | **8,72%** | **11,39%** | **12,54%** |
| **Recuperación de la inversión (años, sobre Flujo de Caja Libre)** | **11,46** | **8,78** | **7,97** |

*(Inversión total por unidad = $1.180.000.000. Payback = Inversión Total ÷ Flujo de Caja Libre anual.)*

---

## 5. LÓGICA DEL MOTOR DE CÁLCULO (funciones puras en TypeScript)

```
// --- Ingresos (por unidad, anual) ---
ventasHospedaje = ADR × %Ocupacion × 365
totalIngresos = ventasHospedaje   // (+ otros ingresos no operacionales si se agregan)

// --- Costos directos (escalan con ventas) ---
comisionCanales   = totalIngresos × 0.18
feeAdministracion = 3.600.000            // fijo (300.000/mes)
fara              = totalIngresos × 0.03
costosOperacion   = totalIngresos × 0.02
bolsaEmpleo       = valor tabulado (≈0,16% de ventas; usar tabla sección 3 como calibración)
totalCostosDirectos = comisionCanales + feeAdministracion + fara + costosOperacion + bolsaEmpleo

// --- Gastos servicios públicos (semifijos, leve variación por ocupación; usar tabla) ---
serviciosPublicos = energia + agua + gas + internet

// --- Gastos varios ---
marketing        = totalIngresos × 0.008
feeOperadorGEH   = totalIngresos × 0.12          // Fee Operador Comercial GEHsuites
datafonos        = totalIngresos × 0.022
// papeleria, aseo, lavanderia, honorarios, medicos, agremiaciones, licencias -> semifijos (tabla)
gastosVarios     = suma de líneas de gastos varios (sección 3)

// --- Otros fijos ---
otrosFijos = sayco + pmsChannelManager + predial   // 180.000 + 350.000 + 10.200.000

// --- Resultado ---
ebitda = totalIngresos − totalCostosDirectos − serviciosPublicos − gastosVarios − otrosFijos
margenEbitda = ebitda / totalIngresos

depreciacion = 0                                   // amueblamiento; configurable (valorAmueblamiento / vidaUtil)
impuestoRenta = max(0, (ebitda − depreciacion)) × tarifaImpuestoRenta   // tarifaImpuestoRenta default = 0
utilidadNeta = ebitda − depreciacion − impuestoRenta
flujoCajaLibre = utilidadNeta + depreciacion

// --- Retorno del inversionista ---
PRECIO_UNIDAD = 1.180.000.000
utilidadInversionista(año) = utilidadNeta × numeroUnidadesCompradas
inversionTotal = PRECIO_UNIDAD × numeroUnidadesCompradas
roiAnual(%) = utilidadNeta / PRECIO_UNIDAD
paybackAños = PRECIO_UNIDAD / flujoCajaLibre

// --- Proyección multi-año (opcional) ---
// ADR crece 5% anual, costos fijos crecen 5% (inflación). Año N:
//   ADR_N = ADR_1 × (1.05)^(N-1);  costosFijos_N = costosFijos_1 × (1.05)^(N-1)
// Año 1 es la fuente de verdad; los años 2+ son proyección.
```

> **Regla de oro:** los 3 escenarios (Pesimista/Conservador/Optimista) deben mostrarse con los **valores exactos** de las tablas de las secciones 3 y 4 — NO recalcular ni redondear. El motor de fórmulas de arriba se usa solo para el **modo personalizado** (cuando el usuario mueve sliders de ocupación/ADR fuera de los 3 escenarios oficiales), y esos resultados deben etiquetarse como **"estimación personalizada"**.

---

## 6. FUNCIONALIDAD DEL SIMULADOR (obligatorio)

### Inputs del usuario:
1. **Escenario**: Pesimista / Conservador / Optimista (tabs, Conservador por defecto) — valores exactos de la tabla.
2. **N° de apartamentos a invertir** (stepper/slider) — multiplica la utilidad y la inversión total.
3. **Modo personalizado** (toggle opcional): sliders de % Ocupación y ADR que recalculan con el motor de la sección 5 (etiquetado como estimación).
4. **Horizonte**: Mensual / Anual (toggle). Opcional: selector Año 1–5 con crecimiento ADR/inflación 5%.

### Outputs en tiempo real (recálculo reactivo, sin botón "calcular"):
- **Utilidad neta anual estimada** (por el N° de apartamentos elegido) — tarjeta destacada, número más grande de la página.
- **ROI anual (%)** — grande y claro (usar el rango 8,72% – 12,54% como referencia por escenario).
- **Recuperación de la inversión (años)** — indicador visual tipo termómetro/anillo (7,97 a 11,46 años según escenario).
- **Inversión total** = N° apartamentos × $1.180.000.000, claramente visible.
- Desglose visual tipo waterfall: Ingresos → Costos Directos → Servicios Públicos → Gastos Varios → Otros Fijos → EBITDA → (Impuesto) → Utilidad Neta.
- Gráfica comparativa de los 3 escenarios (barras) para Utilidad Neta, ROI y Payback, siempre visible como referencia de transparencia.
- Tarjeta que explica el **Fee Operador GEHsuites (12% de ventas)** y el resto de la estructura de costos, como transparencia del modelo.
- Indicadores de **Margen EBITDA %** y **Margen Neto %** con código de color (los tres escenarios son saludables: ~47–50%).

### Reglas de UX:
- Recalcular instantáneamente al cambiar cualquier control.
- Formateo COP: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.
- Mostrar SIEMPRE los 3 escenarios como referencia (transparencia); el Pesimista sigue siendo rentable, lo cual es un punto fuerte de venta — destácalo.
- Disclaimer permanente y visible: *"Cifras basadas en el modelo financiero P&G por unidad de Invictus, operado por GEHsuites. Proyecciones Año 1; no constituyen garantía de rentabilidad. El escenario personalizado es una estimación y no forma parte del modelo oficial."*

---

## 7. ESTRUCTURA DE LA LANDING PAGE

1. **Hero**: propuesta de valor + CTA "Simula tu inversión" (scroll al simulador). Imagen/video estilo edificio/resort premium caribeño, marca GEHsuites visible. Gancho: rentabilidad de doble dígito y payback ~8 años en escenario conservador.
2. **Simulador interactivo** (sección ancla, componente central, descrito en sección 6).
3. **Por qué invertir en Invictus**: operador único GEHsuites, 500 unidades, márgenes EBITDA ~50%, rentabilidad positiva incluso en escenario pesimista, tecnología incluida (PMS, Channel Manager), FARA para proteger el activo.
4. **Desglose financiero transparente**: acordeón o tabla con costos directos + gastos (secciones 3) para inversionistas que quieran profundidad.
5. **Comparativo de escenarios**: gráfica de Utilidad Neta / ROI / Payback en los 3 escenarios.
6. **Modelo de comercialización GEHsuites**: explicar el fee operador comercial (12% de ventas) + fee administración, en lenguaje simple.
7. **FAQ**: qué cubre el fee de GEHsuites, cómo funciona el FARA, cómo se calcula el ROI y el payback, qué pasa con la ocupación baja (mostrar el Pesimista con transparencia), rol de los 60 días de goce del propietario.
8. **CTA final + formulario de contacto** (nombre, email, teléfono, N° de apartamentos de interés).
9. **Footer** con disclaimers legales y datos de la marca GEHsuites.

---

## 8. ARQUITECTURA DE CÓDIGO SUGERIDA

```
/app
  /page.tsx                     -> Landing page (composición de secciones)
/components
  /Hero.tsx
  /Simulator/
    Simulator.tsx                -> Contenedor con estado (React hooks + useMemo)
    ScenarioSelector.tsx
    UnitsInput.tsx               -> N° de apartamentos
    CustomModeSliders.tsx        -> % ocupación y ADR (modo personalizado)
    ResultsSummaryCard.tsx       -> Utilidad neta, ROI, Payback, Inversión total
    WaterfallBreakdown.tsx
    ScenarioComparisonChart.tsx
  /WhyInvest.tsx
  /FinancialBreakdown.tsx
  /GEHSuitesFeeExplainer.tsx
  /FAQ.tsx
  /ContactForm.tsx
  /Footer.tsx
/lib
  /finance
    constants.ts                 -> Datos generales + tablas de las secciones 2,3,4 (fuente de verdad)
    engine.ts                    -> Funciones puras de la sección 5 (ingresos, ebitda, utilidadNeta, roi, payback, proyección multi-año)
    formatters.ts                -> formatCurrencyCOP, formatPercent
  /types.ts                      -> Scenario, PnLBreakdown, SimulatorInputs, SimulatorResults
```

- Todo cálculo vive en `/lib/finance`, 100% desacoplado de la UI, con funciones puras testeables.
- Usar `useMemo` en `Simulator.tsx` para recalcular solo cuando cambien los inputs.
- Las constantes clave (`PRECIO_UNIDAD = 1_180_000_000`, `TARIFA_IMPUESTO_RENTA = 0`, `TOTAL_UNIDADES = 500`, `DIAS_GOCE_PROPIETARIO = 60`) deben estar centralizadas y comentadas en `constants.ts`.

---

## 9. ENTREGABLE ESPERADO

Un proyecto Next.js + TypeScript + Tailwind funcional con:
- Landing page completa según la sección 7.
- Simulador 100% interactivo, motor de cálculo según sección 5, usando las tablas exactas de las secciones 3 y 4 como fuente de verdad para los 3 escenarios oficiales.
- Métricas estrella bien visibles: Utilidad Neta, ROI anual y Recuperación de la inversión (años), escalables por N° de apartamentos.
- Diseño premium acorde a la paleta y estilo visual especificados (azul profundo, azul Caribe, blanco, arena, dorado suave; tarjetas redondeadas; sombras suaves; animaciones ligeras).
- Responsive completo, mobile first.
- Código limpio, tipado y documentado, listo para escalar (agregar backend/CMS más adelante sin refactor mayor).
