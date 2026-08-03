import {
  ESCENARIOS,
  ESCENARIO_POR_DEFECTO,
  TASA_CAMBIO_DEFECTO,
} from "@/lib/finance/constants";
import { AVANZADOS_POR_DEFECTO } from "@/lib/finance/engine";
import type { Moneda, ParametrosAvanzados, ScenarioKey } from "@/lib/types";

/**
 * Estado completo del simulador: cálculo y presentación en un solo objeto,
 * para que los paneles reciban `estado` + `actualizar` en vez de una docena
 * de props sueltas.
 */
export interface EstadoSimulador {
  escenario: ScenarioKey;
  unidades: number;
  /** Año de proyección: 1 = tabla oficial, 2–5 = proyección. */
  anio: number;
  modoPersonalizado: boolean;
  ocupacionCustom: number;
  adrCustom: number;
  moneda: Moneda;
  tasaCambio: number;
  avanzados: ParametrosAvanzados;
}

export type Actualizar = (parcial: Partial<EstadoSimulador>) => void;

const base = ESCENARIOS[ESCENARIO_POR_DEFECTO];

export const ESTADO_INICIAL: EstadoSimulador = {
  escenario: ESCENARIO_POR_DEFECTO,
  unidades: 1,
  anio: 1,
  modoPersonalizado: false,
  ocupacionCustom: base.ocupacion,
  adrCustom: base.adr,
  moneda: "COP",
  tasaCambio: TASA_CAMBIO_DEFECTO,
  avanzados: AVANZADOS_POR_DEFECTO,
};

/** Ocupación y ADR efectivos según el modo activo. */
export function parametrosEfectivos(estado: EstadoSimulador): {
  ocupacion: number;
  adr: number;
} {
  if (estado.modoPersonalizado) {
    return { ocupacion: estado.ocupacionCustom, adr: estado.adrCustom };
  }
  const e = ESCENARIOS[estado.escenario];
  return { ocupacion: e.ocupacion, adr: e.adr };
}

/** Nombre del escenario para títulos y resúmenes. */
export function nombreEscenario(estado: EstadoSimulador): string {
  return estado.modoPersonalizado ? "Personalizado" : ESCENARIOS[estado.escenario].label;
}
