/**
 * Motor de cálculo — funciones puras, sin dependencias de React ni del DOM.
 *
 * Se usa para:
 *   1. El **modo personalizado** (el usuario mueve ocupación / ADR fuera de los
 *      tres escenarios oficiales).
 *   2. Las **proyecciones año 2–5** (crecimiento de tarifa e inflación al 5%).
 *   3. Cualquier cambio en los **parámetros avanzados** (precio de la unidad,
 *      impuesto de renta, depreciación, días base).
 *
 * Para el Año 1 de los tres escenarios oficiales con parámetros de modelo NO se
 * usa este motor: se leen los valores exactos de `constants.ts`. Aun así, el
 * motor está calibrado para reproducir esas tablas al peso (ver el script
 * `npm run verificar:modelo`).
 */

import {
  BASES,
  BASES_SEMIFIJAS_100,
  CRECIMIENTO_ADR,
  DEPRECIACION_ANUAL,
  DIAS_CALENDARIO,
  ESCENARIOS,
  FEE_ADMINISTRACION_ANUAL,
  GASTOS_FIJOS,
  INFLACION_COSTOS,
  PORCENTAJES,
  PRECIO_INMUEBLE,
  PRECIO_UNIDAD,
  TARIFA_IMPUESTO_RENTA,
  VALOR_AMUEBLAMIENTO,
} from "@/lib/finance/constants";
import type {
  LineItem,
  ParametrosAvanzados,
  PnLBreakdown,
  ReturnMetrics,
  ScenarioKey,
  SimulatorInputs,
  SimulatorResults,
} from "@/lib/types";

/** Valores de los parámetros avanzados tal como vienen del modelo financiero. */
export const AVANZADOS_POR_DEFECTO: ParametrosAvanzados = {
  precioUnidad: PRECIO_UNIDAD,
  tarifaImpuestoRenta: TARIFA_IMPUESTO_RENTA,
  depreciacionAnual: DEPRECIACION_ANUAL,
  diasBase: DIAS_CALENDARIO,
};

/** `true` si algún parámetro avanzado se movió respecto al modelo. */
export function avanzadosModificados(a: ParametrosAvanzados): boolean {
  return (
    a.precioUnidad !== AVANZADOS_POR_DEFECTO.precioUnidad ||
    a.tarifaImpuestoRenta !== AVANZADOS_POR_DEFECTO.tarifaImpuestoRenta ||
    a.depreciacionAnual !== AVANZADOS_POR_DEFECTO.depreciacionAnual ||
    a.diasBase !== AVANZADOS_POR_DEFECTO.diasBase
  );
}

/** Depreciación lineal del amueblamiento, para activarla desde la UI. */
export const DEPRECIACION_LINEAL = VALOR_AMUEBLAMIENTO / 10;

/** Parámetros opcionales del motor. */
export interface OpcionesMotor {
  tarifaImpuestoRenta?: number;
  depreciacion?: number;
  /** Días sobre los que se calculan las ventas de hospedaje. */
  diasBase?: number;
}

const suma = (lines: LineItem[]) => lines.reduce((acc, l) => acc + l.value, 0);

/**
 * Calcula el P&G anual completo de UNA unidad a partir de ocupación y ADR.
 *
 * ventasHospedaje = ADR × %ocupación × días base
 *
 * Las líneas se clasifican en tres comportamientos:
 *   · variables  → % de las ventas
 *   · semifijas  → base anual al 100% × % de ocupación
 *   · fijas      → constantes
 */
export function calcularPnL(
  ocupacion: number,
  adr: number,
  opciones: OpcionesMotor = {},
): PnLBreakdown {
  const {
    tarifaImpuestoRenta = TARIFA_IMPUESTO_RENTA,
    depreciacion = DEPRECIACION_ANUAL,
    diasBase = DIAS_CALENDARIO,
  } = opciones;

  /* --- Ingresos --------------------------------------------------- */
  const ventasHospedaje = adr * ocupacion * diasBase;
  const ingresosLines: LineItem[] = [
    {
      id: "ventasHospedaje",
      label: "Ventas de Hospedaje",
      basis: `ADR × % ocupación × ${diasBase} días`,
      value: ventasHospedaje,
    },
  ];
  const totalIngresos = ventasHospedaje;

  /* --- Costos directos (escalan con ventas) ----------------------- */
  const costosDirectosLines: LineItem[] = [
    {
      id: "comisionCanales",
      label: "Comisión canales (Booking, Airbnb, Web, Agencias +20 canales)",
      basis: BASES.comisionCanales,
      value: totalIngresos * PORCENTAJES.comisionCanales,
    },
    {
      id: "feeAdministracion",
      label: "Comisión Fee Administración",
      basis: BASES.feeAdministracion,
      value: FEE_ADMINISTRACION_ANUAL,
      fijo: true,
    },
    {
      id: "fara",
      label: "FARA (Fondo de Reposición y Reparación)",
      basis: BASES.fara,
      value: totalIngresos * PORCENTAJES.fara,
    },
    {
      id: "costosOperacion",
      label: "Costos de Operación (nómina, variables, dotación)",
      basis: BASES.costosOperacion,
      value: totalIngresos * PORCENTAJES.costosOperacion,
    },
  ];

  /* --- Servicios públicos (todos semifijos: escalan con ocupación) --- */
  const serviciosPublicosLines: LineItem[] = [
    { id: "energia", label: "Energía", basis: BASES.semifijo, value: BASES_SEMIFIJAS_100.energia * ocupacion },
    { id: "agua", label: "Agua", basis: BASES.semifijo, value: BASES_SEMIFIJAS_100.agua * ocupacion },
    { id: "gas", label: "Gas", basis: BASES.semifijo, value: BASES_SEMIFIJAS_100.gas * ocupacion },
    { id: "internet", label: "Internet / Cable / Telefonía", basis: BASES.semifijo, value: BASES_SEMIFIJAS_100.internet * ocupacion },
  ];

  /* --- Gastos varios ---------------------------------------------- */
  const gastosVariosLines: LineItem[] = [
    { id: "aseo", label: "Aseo", basis: BASES.semifijo, value: BASES_SEMIFIJAS_100.aseo * ocupacion },
    { id: "lavanderia", label: "Lavandería", basis: BASES.semifijo, value: BASES_SEMIFIJAS_100.lavanderia * ocupacion },
    {
      id: "feeOperadorGEH",
      label: "Operación — Fee Operador Comercial (GEHsuites)",
      basis: BASES.feeOperadorGEH,
      value: totalIngresos * PORCENTAJES.feeOperadorGEH,
    },
    { id: "gastosMedicos", label: "Gastos Médicos y Ambulancia", basis: BASES.gastosMedicos, value: GASTOS_FIJOS.gastosMedicos, fijo: true },
    { id: "datafonos", label: "Costos Datáfonos / Pasarela de Pagos", basis: BASES.datafonos, value: totalIngresos * PORCENTAJES.datafonos },
  ];

  /* --- Otros gastos fijos ----------------------------------------- */
  const otrosFijosLines: LineItem[] = [
    { id: "sayco", label: "Sayco y Acinpro", basis: BASES.sayco, value: GASTOS_FIJOS.sayco, fijo: true },
    { id: "predial", label: "Predial", basis: BASES.predial, value: GASTOS_FIJOS.predial, fijo: true },
  ];

  /* --- Resultado --------------------------------------------------- */
  const totalCostosDirectos = suma(costosDirectosLines);
  const totalServiciosPublicos = suma(serviciosPublicosLines);
  const totalGastosVarios = suma(gastosVariosLines);
  const totalOtrosFijos = suma(otrosFijosLines);

  const ebitda =
    totalIngresos - totalCostosDirectos - totalServiciosPublicos - totalGastosVarios - totalOtrosFijos;

  const impuestoRenta = Math.max(0, ebitda - depreciacion) * tarifaImpuestoRenta;
  const utilidadNeta = ebitda - depreciacion - impuestoRenta;
  const flujoCajaLibre = utilidadNeta + depreciacion;

  return {
    ocupacion,
    adr,
    ingresos: { lines: ingresosLines, total: totalIngresos },
    costosDirectos: { lines: costosDirectosLines, total: totalCostosDirectos },
    serviciosPublicos: { lines: serviciosPublicosLines, total: totalServiciosPublicos },
    gastosVarios: { lines: gastosVariosLines, total: totalGastosVarios },
    otrosFijos: { lines: otrosFijosLines, total: totalOtrosFijos },
    ebitda,
    margenEbitda: totalIngresos > 0 ? ebitda / totalIngresos : 0,
    depreciacion,
    impuestoRenta,
    utilidadNeta,
    margenNeto: totalIngresos > 0 ? utilidadNeta / totalIngresos : 0,
    flujoCajaLibre,
  };
}

/**
 * Reaplica depreciación e impuesto sobre un P&G ya construido.
 * Permite activar el impuesto de renta sin abandonar las cifras oficiales
 * de ingresos, costos y gastos.
 */
export function aplicarFiscalidad(
  base: PnLBreakdown,
  tarifaImpuestoRenta: number,
  depreciacion: number,
): PnLBreakdown {
  if (tarifaImpuestoRenta === base.impuestoRenta && depreciacion === base.depreciacion) {
    return base;
  }

  const impuestoRenta = Math.max(0, base.ebitda - depreciacion) * tarifaImpuestoRenta;
  const utilidadNeta = base.ebitda - depreciacion - impuestoRenta;

  return {
    ...base,
    depreciacion,
    impuestoRenta,
    utilidadNeta,
    margenNeto: base.ingresos.total > 0 ? utilidadNeta / base.ingresos.total : 0,
    flujoCajaLibre: utilidadNeta + depreciacion,
  };
}

/**
 * Proyecta un P&G del Año 1 al año N.
 *
 * La tarifa (ADR) crece 5% anual y los costos fijos se inflactan 5% anual. Como
 * las líneas variables son un % de unas ventas que crecen al mismo 5%, todas las
 * líneas del P&G escalan por el mismo factor `1,05^(N−1)`. Partir del Año 1 en
 * vez de recalcular garantiza que el Año 1 quede idéntico a la tabla oficial.
 */
export function proyectarPnL(base: PnLBreakdown, anio: number): PnLBreakdown {
  if (anio <= 1) return base;

  const factorAdr = Math.pow(1 + CRECIMIENTO_ADR, anio - 1);
  const factorCostos = Math.pow(1 + INFLACION_COSTOS, anio - 1);

  const escalar = (group: { lines: LineItem[]; total: number }, factor: number) => ({
    lines: group.lines.map((l) => ({ ...l, value: l.value * factor })),
    total: group.total * factor,
  });

  const ingresos = escalar(base.ingresos, factorAdr);
  const costosDirectos = escalar(base.costosDirectos, factorCostos);
  const serviciosPublicos = escalar(base.serviciosPublicos, factorCostos);
  const gastosVarios = escalar(base.gastosVarios, factorCostos);
  const otrosFijos = escalar(base.otrosFijos, factorCostos);

  const ebitda =
    ingresos.total - costosDirectos.total - serviciosPublicos.total - gastosVarios.total - otrosFijos.total;

  // La tarifa efectiva del año base se conserva; la depreciación no se inflacta
  // porque el amueblamiento se deprecia sobre su costo histórico.
  const depreciacion = base.depreciacion;
  const tarifa =
    base.ebitda > base.depreciacion
      ? base.impuestoRenta / (base.ebitda - base.depreciacion)
      : 0;
  const impuestoRenta = Math.max(0, ebitda - depreciacion) * tarifa;
  const utilidadNeta = ebitda - depreciacion - impuestoRenta;

  return {
    ...base,
    adr: base.adr * factorAdr,
    ingresos,
    costosDirectos,
    serviciosPublicos,
    gastosVarios,
    otrosFijos,
    ebitda,
    margenEbitda: ingresos.total > 0 ? ebitda / ingresos.total : 0,
    depreciacion,
    impuestoRenta,
    utilidadNeta,
    margenNeto: ingresos.total > 0 ? utilidadNeta / ingresos.total : 0,
    flujoCajaLibre: utilidadNeta + depreciacion,
  };
}

/**
 * Escala un P&G por unidad al número de apartamentos comprados y calcula los
 * indicadores de retorno del inversionista.
 *
 * `metricasOficiales` permite inyectar el ROI y el payback exactos del modelo
 * para los escenarios oficiales, en vez de recalcularlos.
 */
export function calcularRetorno(
  pnl: PnLBreakdown,
  unidades: number,
  precioUnidad: number = PRECIO_UNIDAD,
  metricasOficiales?: {
    roiSobrePrecioApto: number;
    roiSobreInversionTotal: number;
    paybackAnios: number;
  },
): ReturnMetrics {
  const inversionTotal = precioUnidad * unidades;

  // Si se cambia el precio de la unidad, el valor del inmueble se ajusta
  // manteniendo constante el amueblamiento.
  const precioInmueble = Math.max(1, precioUnidad - VALOR_AMUEBLAMIENTO);

  const roiSobrePrecioApto =
    metricasOficiales?.roiSobrePrecioApto ?? pnl.utilidadNeta / precioInmueble;
  const roiSobreInversionTotal =
    metricasOficiales?.roiSobreInversionTotal ?? pnl.utilidadNeta / precioUnidad;
  const paybackAnios =
    metricasOficiales?.paybackAnios ??
    (pnl.flujoCajaLibre > 0 ? precioUnidad / pnl.flujoCajaLibre : Infinity);

  return {
    unidades,
    inversionTotal,
    ingresosTotal: pnl.ingresos.total * unidades,
    ebitdaTotal: pnl.ebitda * unidades,
    utilidadNetaTotal: pnl.utilidadNeta * unidades,
    flujoCajaLibreTotal: pnl.flujoCajaLibre * unidades,
    margenEbitda: pnl.margenEbitda,
    margenNeto: pnl.margenNeto,
    // El ROI y el payback son ratios: no cambian con el número de unidades,
    // porque utilidad e inversión escalan juntas.
    roiSobrePrecioApto,
    roiSobreInversionTotal,
    paybackAnios,
  };
}

/** Suma de todos los costos y gastos de un P&G (sin depreciación ni impuesto). */
export function totalCostosYGastos(pnl: PnLBreakdown): number {
  return (
    pnl.costosDirectos.total +
    pnl.serviciosPublicos.total +
    pnl.gastosVarios.total +
    pnl.otrosFijos.total
  );
}

/**
 * Punto de entrada del simulador: entradas de la UI → resultados completos.
 *
 * Devuelve `esEstimacion: true` cuando las cifras no salen de las tablas
 * oficiales: modo personalizado, año de proyección > 1, o algún parámetro
 * avanzado movido respecto al modelo.
 */
export function simular(inputs: SimulatorInputs): SimulatorResults {
  const { escenario, unidades, anio, modoPersonalizado, ocupacionCustom, adrCustom, avanzados } =
    inputs;

  const tocado = avanzadosModificados(avanzados);

  // El modo personalizado recalcula todo; en modo oficial se parte de la tabla
  // y sólo se reaplica la fiscalidad si el usuario la cambió.
  const base = modoPersonalizado
    ? calcularPnL(ocupacionCustom, adrCustom, {
        tarifaImpuestoRenta: avanzados.tarifaImpuestoRenta,
        depreciacion: avanzados.depreciacionAnual,
        diasBase: avanzados.diasBase,
      })
    : aplicarFiscalidad(
        ESCENARIOS[escenario].pnl,
        avanzados.tarifaImpuestoRenta,
        avanzados.depreciacionAnual,
      );

  const pnl = proyectarPnL(base, anio);

  // Sólo el Año 1 de un escenario oficial con parámetros de modelo usa los
  // indicadores exactos de la tabla.
  const usarOficiales = !modoPersonalizado && anio === 1 && !tocado;
  const metricas = calcularRetorno(
    pnl,
    unidades,
    avanzados.precioUnidad,
    usarOficiales ? ESCENARIOS[escenario].metricas : undefined,
  );

  return { pnl, metricas, esEstimacion: modoPersonalizado || anio > 1 || tocado };
}

/**
 * Flujo de caja acumulado año a año (con crecimiento del 5%), y el año en que
 * la inversión queda recuperada. Complementa al payback simple del modelo.
 */
export function proyeccionAcumulada(
  base: PnLBreakdown,
  unidades: number,
  anios: number,
  precioUnidad: number = PRECIO_UNIDAD,
): { anio: number; flujoAnual: number; acumulado: number; recuperado: boolean }[] {
  const inversionTotal = precioUnidad * unidades;
  let acumulado = 0;

  return Array.from({ length: anios }, (_, i) => {
    const anio = i + 1;
    const flujoAnual = proyectarPnL(base, anio).flujoCajaLibre * unidades;
    acumulado += flujoAnual;
    return { anio, flujoAnual, acumulado, recuperado: acumulado >= inversionTotal };
  });
}

/**
 * Comprobación de calibración: el motor reproduce las tablas oficiales.
 *
 * Devuelve la diferencia en COP entre el EBITDA calculado y el EBITDA oficial
 * de cada escenario. Tolerancia esperada: < 1 COP (la hoja original redondea
 * al peso).
 */
export function verificarCalibracion(): Record<ScenarioKey, number> {
  const diffs = {} as Record<ScenarioKey, number>;
  (Object.keys(ESCENARIOS) as ScenarioKey[]).forEach((key) => {
    const oficial = ESCENARIOS[key];
    const calculado = calcularPnL(oficial.ocupacion, oficial.adr);
    diffs[key] = calculado.ebitda - oficial.pnl.ebitda;
  });
  return diffs;
}

/** Reexportado para que la UI no tenga que importar de dos sitios. */
export { PRECIO_INMUEBLE, PRECIO_UNIDAD };
