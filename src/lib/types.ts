/**
 * Tipos del dominio financiero del simulador Invictus × GEHsuites.
 *
 * Todas las cifras monetarias están en COP, expresadas **por unidad
 * (por apartamento)** y en base **anual**, salvo que el nombre indique lo
 * contrario. La conversión a mensual es siempre `anual / 12`.
 */

/** Los tres escenarios oficiales del modelo financiero. */
export type ScenarioKey = "pesimista" | "conservador" | "optimista";

/** Horizonte de presentación de las cifras. */
export type Horizonte = "mensual" | "anual";

/**
 * Una línea del P&G. `basis` documenta de dónde sale el valor
 * (ej. "18% de ventas") para poder auditar el modelo desde la UI.
 */
export interface LineItem {
  id: string;
  label: string;
  /** Descripción de la base de cálculo. Se muestra en el desglose detallado. */
  basis?: string;
  value: number;
  /**
   * `true` si es un monto fijo mensual que NO depende de ventas ni de
   * ocupación (ej. predial, honorarios). Las líneas sin esta marca varían
   * con la ocupación o son un % de ventas, y son las únicas editables en la
   * columna "%" de la tabla financiera detallada.
   */
  fijo?: boolean;
}

/** Un grupo de líneas del P&G con su subtotal. */
export interface PnLGroup {
  lines: LineItem[];
  /**
   * Subtotal del grupo. Para los escenarios oficiales es el valor **exacto**
   * de las tablas del modelo, que puede diferir en ±1 COP de la suma de las
   * líneas por redondeo de la hoja de cálculo original.
   */
  total: number;
}

/** P&G anual completo de UNA unidad. */
export interface PnLBreakdown {
  /** % de ocupación (0–1). */
  ocupacion: number;
  /** Tarifa promedio por noche (COP). */
  adr: number;

  ingresos: PnLGroup;
  costosDirectos: PnLGroup;
  serviciosPublicos: PnLGroup;
  gastosVarios: PnLGroup;
  otrosFijos: PnLGroup;

  ebitda: number;
  margenEbitda: number;

  depreciacion: number;
  impuestoRenta: number;

  utilidadNeta: number;
  margenNeto: number;
  flujoCajaLibre: number;
}

/** Indicadores de retorno para el inversionista, ya escalados por N° de unidades. */
export interface ReturnMetrics {
  unidades: number;
  /** N° de unidades × precio de la unidad (inmueble + amueblamiento). */
  inversionTotal: number;

  ingresosTotal: number;
  ebitdaTotal: number;
  utilidadNetaTotal: number;
  flujoCajaLibreTotal: number;

  margenEbitda: number;
  margenNeto: number;

  /** Utilidad neta / valor del inmueble sin amueblamiento ($1.130.000.000). */
  roiSobrePrecioApto: number;
  /** Utilidad neta / inversión total por unidad ($1.180.000.000). */
  roiSobreInversionTotal: number;

  /** Inversión total ÷ flujo de caja libre anual, en años. */
  paybackAnios: number;
}

/** Escenario oficial: P&G exacto + indicadores exactos del modelo. */
export interface OfficialScenario {
  key: ScenarioKey;
  label: string;
  /** Texto corto para la UI (ej. "Ocupación 60%"). */
  descripcion: string;
  ocupacion: number;
  adr: number;
  /** Ajuste de ADR respecto al escenario pesimista (0–1). */
  ajusteAdr: number;
  pnl: PnLBreakdown;
  /** Indicadores tal cual aparecen en el modelo (sección 4). No recalcular. */
  metricas: {
    roiSobrePrecioApto: number;
    roiSobreInversionTotal: number;
    paybackAnios: number;
  };
}

/** Moneda de visualización. El modelo siempre calcula en COP. */
export type Moneda = "COP" | "USD";

/**
 * Parámetros que normalmente se dejan en su valor de modelo y sólo se tocan
 * desde el acordeón «Parámetros avanzados». Cambiar cualquiera de ellos
 * convierte el resultado en una estimación.
 */
export interface ParametrosAvanzados {
  /** Inversión total por unidad (inmueble + amueblamiento). */
  precioUnidad: number;
  /** Tarifa de impuesto de renta sobre (EBITDA − depreciación). */
  tarifaImpuestoRenta: number;
  /** Depreciación anual del amueblamiento. */
  depreciacionAnual: number;
  /** Días base de cálculo de las ventas de hospedaje. */
  diasBase: number;
}

/** Entradas del simulador controladas por el usuario. */
export interface SimulatorInputs {
  escenario: ScenarioKey;
  unidades: number;
  horizonte: Horizonte;
  /** Año de proyección (1 = fuente de verdad; 2–5 = proyección). */
  anio: number;
  /** Si está activo, el P&G se recalcula con el motor en vez de usar la tabla. */
  modoPersonalizado: boolean;
  ocupacionCustom: number;
  adrCustom: number;
  avanzados: ParametrosAvanzados;
}

/** Estado de presentación: no altera el cálculo, sólo cómo se muestra. */
export interface PresentacionInputs {
  moneda: Moneda;
  tasaCambio: number;
  horizonte: Horizonte;
}

/** Salida completa del simulador. */
export interface SimulatorResults {
  pnl: PnLBreakdown;
  metricas: ReturnMetrics;
  /**
   * `true` cuando las cifras NO provienen de las tablas oficiales
   * (modo personalizado o año de proyección > 1).
   */
  esEstimacion: boolean;
}
