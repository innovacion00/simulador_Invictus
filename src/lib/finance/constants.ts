/**
 * FUENTE DE VERDAD del modelo financiero Invictus (hoja "INVICTUS").
 *
 * Regla de oro: los tres escenarios oficiales (pesimista / conservador /
 * optimista) se muestran con los valores EXACTOS de este archivo. El motor de
 * `engine.ts` sólo se usa para el modo personalizado y para las proyecciones
 * año 2–5, y esos resultados se etiquetan como "estimación".
 */

import type { OfficialScenario, ScenarioKey } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* 1. Datos generales del proyecto                                      */
/* ------------------------------------------------------------------ */

/** Valor del inmueble sin amueblamiento (COP). Base del ROI "sobre precio apto". */
export const PRECIO_INMUEBLE = 1_130_000_000;

/** Valor del amueblamiento / dotación (COP). */
export const VALOR_AMUEBLAMIENTO = 50_000_000;

/** Inversión total por unidad = inmueble + amueblamiento (COP). */
export const PRECIO_UNIDAD = PRECIO_INMUEBLE + VALOR_AMUEBLAMIENTO; // 1.180.000.000

/** Vida útil del amueblamiento, en años (base de la depreciación). */
export const VIDA_UTIL_AMUEBLAMIENTO = 10;

/** Total de unidades productivas del proyecto. */
export const TOTAL_UNIDADES = 500;

/** Máximo de apartamentos seleccionables en el simulador. */
export const MAX_UNIDADES_SIMULADOR = 10;

export const DIAS_CALENDARIO = 365;
/** Días al año reservados para el uso del propietario. */
export const DIAS_GOCE_PROPIETARIO = 60;
/** Días efectivamente comercializados por el operador. */
export const DIAS_COMERCIALIZAR = 305;

/** Crecimiento anual de la tarifa (ADR). */
export const CRECIMIENTO_ADR = 0.05;
/** Inflación anual aplicada a costos y gastos fijos. */
export const INFLACION_COSTOS = 0.05;

/**
 * Tarifa de impuesto de renta sobre (EBITDA − Depreciación).
 * El modelo contempla 35% pero la versión vigente la aplica en 0%.
 * Parámetro configurable: subirlo a 0.35 activa el impuesto en todo el sitio.
 */
export const TARIFA_IMPUESTO_RENTA = 0;

/**
 * Depreciación anual del amueblamiento.
 * El modelo vigente la deja en 0, por eso Utilidad Neta = EBITDA.
 * Para activarla: `VALOR_AMUEBLAMIENTO / VIDA_UTIL_AMUEBLAMIENTO`.
 */
export const DEPRECIACION_ANUAL = 0;

/** Horizonte máximo del selector de año de proyección. */
export const MAX_ANIO_PROYECCION = 5;

/* ------------------------------------------------------------------ */
/* 2. Parámetros del motor de cálculo (modo personalizado)              */
/* ------------------------------------------------------------------ */

/** Líneas que escalan como % de las ventas de hospedaje. */
export const PORCENTAJES = {
  /** Booking, Airbnb, Web, Agencias y +20 canales. */
  comisionCanales: 0.18,
  /** Fondo de Reposición y Reparación de Activos. */
  fara: 0.03,
  /** Nómina, variables y dotación. */
  costosOperacion: 0.02,
  /** Fee del operador comercial GEHsuites. */
  feeOperadorGEH: 0.12,
  /** Datáfonos / pasarela de pagos. */
  datafonos: 0.022,
} as const;

/** Fee de administración: $300.000 mensuales, fijo. */
export const FEE_ADMINISTRACION_MENSUAL = 300_000;
export const FEE_ADMINISTRACION_ANUAL = FEE_ADMINISTRACION_MENSUAL * 12;

/**
 * Gastos varios fijos: no dependen de la ocupación ni de las ventas. Se
 * definen por su valor mensual — el anual es siempre mensual × 12 — para que
 * quede explícito que NO escalan con la ocupación, a diferencia de los
 * servicios públicos (`BASES_SEMIFIJAS_100`).
 */
export const GASTOS_MEDICOS_MENSUAL = 20_000;
export const SAYCO_MENSUAL = 15_000;
export const PREDIAL_MENSUAL = 850_000;

/**
 * Gastos semifijos: varían con la ocupación. Los valores son la base anual
 * al 100% de ocupación; el motor los multiplica por el % de ocupación.
 * (Calibrados contra las tres columnas de la sección 3 del modelo: los tres
 * escenarios oficiales se reproducen al peso con estas bases.)
 *
 * Internet/Cable/Telefonía: base $70.000/mes ($840.000/año) al 100% de
 * ocupación. Igual que energía/agua/gas: al 50% de ocupación el costo es la
 * mitad, mensual y anual (anual = mensual × 12).
 */
export const BASES_SEMIFIJAS_100 = {
  energia: 11_400_000,
  agua: 5_400_000,
  gas: 1_200_000,
  internet: 840_000,
  aseo: 1_800_000,
  lavanderia: 4_000_000,
} as const;

/** Gastos totalmente fijos, no dependen de ventas ni de ocupación (COP/año). */
export const GASTOS_FIJOS = {
  gastosMedicos: GASTOS_MEDICOS_MENSUAL * 12,
  sayco: SAYCO_MENSUAL * 12,
  predial: PREDIAL_MENSUAL * 12,
} as const;

/* ------------------------------------------------------------------ */
/* 3. Escenarios oficiales — valores exactos del modelo                 */
/* ------------------------------------------------------------------ */

/** Rangos permitidos para los sliders del modo personalizado. */
export const RANGO_OCUPACION = { min: 0.4, max: 0.95, step: 0.01 } as const;
export const RANGO_ADR = { min: 700_000, max: 1_400_000, step: 5_000 } as const;

/** Etiquetas de las líneas, compartidas entre escenarios oficiales y motor. */
const ETIQUETAS = {
  ventasHospedaje: "Ventas de Hospedaje",
  comisionCanales: "Comisión canales (Booking, Airbnb, Web, Agencias +20 canales)",
  feeAdministracion: "Comisión Fee Administración",
  fara: "FARA (Fondo de Reposición y Reparación)",
  costosOperacion: "Costos de Operación (nómina, variables, dotación)",
  energia: "Energía",
  agua: "Agua",
  gas: "Gas",
  internet: "Internet / Cable / Telefonía",
  aseo: "Aseo",
  lavanderia: "Lavandería",
  feeOperadorGEH: "Operación — Fee Operador Comercial (GEHsuites)",
  gastosMedicos: "Gastos Médicos y Ambulancia",
  datafonos: "Costos Datáfonos / Pasarela de Pagos",
  sayco: "Sayco y Acinpro",
  predial: "Predial",
} as const;

export const BASES = {
  comisionCanales: "18% de ventas",
  feeAdministracion: "$300.000/mes",
  fara: "3% de ventas",
  costosOperacion: "2% de ventas",
  feeOperadorGEH: "12% de ventas",
  datafonos: "2,2% de ventas",
  gastosMedicos: "$20.000/mes",
  sayco: "$15.000/mes",
  predial: "$850.000/mes",
  semifijo: "Varía con la ocupación",
} as const;

/** Construye un escenario oficial a partir de las cifras exactas de la tabla. */
function crearEscenarioOficial(args: {
  key: ScenarioKey;
  label: string;
  descripcion: string;
  ocupacion: number;
  adr: number;
  ajusteAdr: number;
  ventasHospedaje: number;
  comisionCanales: number;
  fara: number;
  costosOperacion: number;
  totalCostosDirectos: number;
  energia: number;
  agua: number;
  gas: number;
  aseo: number;
  lavanderia: number;
  feeOperadorGEH: number;
  datafonos: number;
  totalGastosVarios: number;
  ebitda: number;
  margen: number;
  roiSobrePrecioApto: number;
  roiSobreInversionTotal: number;
  paybackAnios: number;
}): OfficialScenario {
  const otrosFijosTotal = GASTOS_FIJOS.sayco + GASTOS_FIJOS.predial;

  // Internet/Cable/Telefonía escala con la ocupación igual que energía, agua
  // y gas: base al 100% × % de ocupación (mensual y anual, anual = mensual × 12).
  const internet = BASES_SEMIFIJAS_100.internet * args.ocupacion;
  const totalServiciosPublicos = args.energia + args.agua + args.gas + internet;

  // El modelo vigente deja depreciación e impuesto en cero,
  // por lo que Utilidad Neta = Flujo de Caja Libre = EBITDA.
  const depreciacion = DEPRECIACION_ANUAL;
  const impuestoRenta = Math.max(0, args.ebitda - depreciacion) * TARIFA_IMPUESTO_RENTA;
  const utilidadNeta = args.ebitda - depreciacion - impuestoRenta;

  return {
    key: args.key,
    label: args.label,
    descripcion: args.descripcion,
    ocupacion: args.ocupacion,
    adr: args.adr,
    ajusteAdr: args.ajusteAdr,
    metricas: {
      roiSobrePrecioApto: args.roiSobrePrecioApto,
      roiSobreInversionTotal: args.roiSobreInversionTotal,
      paybackAnios: args.paybackAnios,
    },
    pnl: {
      ocupacion: args.ocupacion,
      adr: args.adr,
      ingresos: {
        lines: [
          {
            id: "ventasHospedaje",
            label: ETIQUETAS.ventasHospedaje,
            basis: "ADR × % ocupación × 365",
            value: args.ventasHospedaje,
          },
        ],
        total: args.ventasHospedaje,
      },
      costosDirectos: {
        lines: [
          { id: "comisionCanales", label: ETIQUETAS.comisionCanales, basis: BASES.comisionCanales, value: args.comisionCanales },
          { id: "feeAdministracion", label: ETIQUETAS.feeAdministracion, basis: BASES.feeAdministracion, value: FEE_ADMINISTRACION_ANUAL, fijo: true },
          { id: "fara", label: ETIQUETAS.fara, basis: BASES.fara, value: args.fara },
          { id: "costosOperacion", label: ETIQUETAS.costosOperacion, basis: BASES.costosOperacion, value: args.costosOperacion },
        ],
        total: args.totalCostosDirectos,
      },
      serviciosPublicos: {
        lines: [
          { id: "energia", label: ETIQUETAS.energia, basis: BASES.semifijo, value: args.energia },
          { id: "agua", label: ETIQUETAS.agua, basis: BASES.semifijo, value: args.agua },
          { id: "gas", label: ETIQUETAS.gas, basis: BASES.semifijo, value: args.gas },
          { id: "internet", label: ETIQUETAS.internet, basis: BASES.semifijo, value: internet },
        ],
        total: totalServiciosPublicos,
      },
      gastosVarios: {
        lines: [
          { id: "aseo", label: ETIQUETAS.aseo, basis: BASES.semifijo, value: args.aseo },
          { id: "lavanderia", label: ETIQUETAS.lavanderia, basis: BASES.semifijo, value: args.lavanderia },
          { id: "feeOperadorGEH", label: ETIQUETAS.feeOperadorGEH, basis: BASES.feeOperadorGEH, value: args.feeOperadorGEH },
          { id: "gastosMedicos", label: ETIQUETAS.gastosMedicos, basis: BASES.gastosMedicos, value: GASTOS_FIJOS.gastosMedicos, fijo: true },
          { id: "datafonos", label: ETIQUETAS.datafonos, basis: BASES.datafonos, value: args.datafonos },
        ],
        total: args.totalGastosVarios,
      },
      otrosFijos: {
        lines: [
          { id: "sayco", label: ETIQUETAS.sayco, basis: BASES.sayco, value: GASTOS_FIJOS.sayco, fijo: true },
          { id: "predial", label: ETIQUETAS.predial, basis: BASES.predial, value: GASTOS_FIJOS.predial, fijo: true },
        ],
        total: otrosFijosTotal,
      },
      ebitda: args.ebitda,
      margenEbitda: args.margen,
      depreciacion,
      impuestoRenta,
      utilidadNeta,
      margenNeto: args.margen,
      flujoCajaLibre: utilidadNeta + depreciacion,
    },
  };
}

/**
 * Los tres escenarios oficiales, Año 1, por unidad.
 * Cifras tomadas literalmente de las secciones 3 y 4 del modelo.
 */
export const ESCENARIOS: Record<ScenarioKey, OfficialScenario> = {
  pesimista: crearEscenarioOficial({
    key: "pesimista",
    label: "Pesimista",
    descripcion: "Ocupación 60% · ADR base",
    ocupacion: 0.6,
    adr: 985_000,
    ajusteAdr: 0,
    ventasHospedaje: 215_715_000,
    comisionCanales: 38_828_700,
    fara: 6_471_450,
    costosOperacion: 4_314_300,
    totalCostosDirectos: 53_214_450,
    energia: 6_840_000,
    agua: 3_240_000,
    gas: 720_000,
    aseo: 1_080_000,
    lavanderia: 2_400_000,
    feeOperadorGEH: 25_885_800,
    datafonos: 4_745_730,
    totalGastosVarios: 34_351_530,
    ebitda: 106_465_020,
    margen: 0.4935,
    roiSobrePrecioApto: 0.0942,
    roiSobreInversionTotal: 0.0902,
    paybackAnios: 11.08,
  }),
  conservador: crearEscenarioOficial({
    key: "conservador",
    label: "Conservador",
    descripcion: "Ocupación 75% · ADR +1%",
    ocupacion: 0.75,
    adr: 994_850,
    ajusteAdr: 0.01,
    ventasHospedaje: 272_340_188,
    comisionCanales: 49_021_234,
    fara: 8_170_206,
    costosOperacion: 5_446_804,
    totalCostosDirectos: 66_238_244,
    energia: 8_550_000,
    agua: 4_050_000,
    gas: 900_000,
    aseo: 1_350_000,
    lavanderia: 3_000_000,
    feeOperadorGEH: 32_680_823,
    datafonos: 5_991_484,
    totalGastosVarios: 43_262_307,
    ebitda: 138_329_638,
    margen: 0.5079,
    roiSobrePrecioApto: 0.1224,
    roiSobreInversionTotal: 0.1172,
    paybackAnios: 8.53,
  }),
  optimista: crearEscenarioOficial({
    key: "optimista",
    label: "Optimista",
    descripcion: "Ocupación 80% · ADR +3%",
    ocupacion: 0.8,
    adr: 1_014_550,
    ajusteAdr: 0.03,
    ventasHospedaje: 296_248_600,
    comisionCanales: 53_324_748,
    fara: 8_887_458,
    costosOperacion: 5_924_972,
    totalCostosDirectos: 71_737_178,
    energia: 9_120_000,
    agua: 4_320_000,
    gas: 960_000,
    aseo: 1_440_000,
    lavanderia: 3_200_000,
    feeOperadorGEH: 35_549_832,
    datafonos: 6_517_469,
    totalGastosVarios: 46_947_301,
    ebitda: 152_112_121,
    margen: 0.5135,
    roiSobrePrecioApto: 0.1346,
    roiSobreInversionTotal: 0.1289,
    paybackAnios: 7.76,
  }),
};

/** Orden de presentación de los escenarios en toda la UI. */
export const ORDEN_ESCENARIOS: ScenarioKey[] = ["pesimista", "conservador", "optimista"];

export const ESCENARIO_POR_DEFECTO: ScenarioKey = "conservador";

/**
 * Color de serie por escenario. Paleta validada para daltonismo
 * (ΔE CVD ≥ 9,1 en todos los pares, modo claro sobre #ffffff).
 * Se reexpone como variable CSS en `globals.css`.
 */
export const COLOR_ESCENARIO: Record<ScenarioKey, string> = {
  pesimista: "#eda100",
  conservador: "#2a78d6",
  optimista: "#1baf7a",
};

/* ------------------------------------------------------------------ */
/* 4. Presentación: moneda, tipología y contacto                        */
/* ------------------------------------------------------------------ */

/** Tipología única del proyecto. */
export const TIPOLOGIA = "Apartamento 1 Habitación";

/**
 * Tasa de cambio COP/USD de referencia para la vista en dólares.
 * Es un valor de partida editable por el usuario en el simulador:
 * NO se consulta ninguna fuente en vivo, así que conviene actualizarlo
 * o dejar que el inversionista digite la tasa vigente.
 */
export const TASA_CAMBIO_DEFECTO = 4050;

export const RANGO_TASA_CAMBIO = { min: 3000, max: 6000, step: 10 } as const;

/** Valores de ADR ofrecidos como atajo en el modo personalizado. */
export const ADR_PRESETS = [
  700_000, 800_000, 900_000, 1_000_000, 1_100_000, 1_200_000, 1_300_000,
] as const;

/**
 * Número de WhatsApp del asesor comercial, en formato internacional sin signos.
 * PENDIENTE: reemplazar por el número real de GEHsuites antes de publicar.
 */
export const WHATSAPP_ASESOR = "573000000000";

export const DISCLAIMER =
  "Cifras basadas en el modelo financiero P&G por unidad de Invictus, operado por GEHsuites. " +
  "Proyecciones Año 1; no constituyen garantía de rentabilidad. El escenario personalizado " +
  "es una estimación y no forma parte del modelo oficial.";
