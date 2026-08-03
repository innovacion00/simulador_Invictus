/**
 * Verificación del modelo financiero.
 *
 *   npm run verificar:modelo
 *
 * Contrasta tres cosas:
 *   1. Que el motor de fórmulas reproduzca el EBITDA oficial de cada escenario.
 *   2. Que cada subtotal oficial cuadre con la suma de sus líneas.
 *   3. Que el ROI y el payback recalculados coincidan con la tabla del modelo.
 *
 * Tolerancia: 1 COP en cifras absolutas (la hoja original redondea al peso) y
 * 0,01 puntos porcentuales / 0,01 años en los indicadores.
 */

import {
  ESCENARIOS,
  ORDEN_ESCENARIOS,
  PRECIO_INMUEBLE,
  PRECIO_UNIDAD,
} from "../src/lib/finance/constants";
import { calcularPnL } from "../src/lib/finance/engine";
import type { PnLBreakdown, ScenarioKey } from "../src/lib/types";

const TOLERANCIA_COP = 1;
const TOLERANCIA_RATIO = 0.0001; // 0,01 puntos porcentuales
const TOLERANCIA_ANIOS = 0.01;

let fallos = 0;

function comprobar(nombre: string, obtenido: number, esperado: number, tolerancia: number) {
  const diff = Math.abs(obtenido - esperado);
  const ok = diff <= tolerancia;
  if (!ok) fallos++;
  const marca = ok ? "OK  " : "FALLA";
  console.log(
    `  [${marca}] ${nombre.padEnd(46)} obtenido ${obtenido.toFixed(4).padStart(18)} · esperado ${esperado
      .toFixed(4)
      .padStart(18)} · Δ ${diff.toFixed(4)}`,
  );
}

const GRUPOS = [
  "ingresos",
  "costosDirectos",
  "serviciosPublicos",
  "gastosVarios",
  "otrosFijos",
] as const satisfies readonly (keyof PnLBreakdown)[];

console.log("\n=== Verificación del modelo Invictus × GEHsuites ===\n");

for (const key of ORDEN_ESCENARIOS) {
  const oficial = ESCENARIOS[key as ScenarioKey];
  console.log(`── ${oficial.label} · ocupación ${(oficial.ocupacion * 100).toFixed(0)}% · ADR ${oficial.adr.toLocaleString("es-CO")}`);

  // 1. El motor reproduce el EBITDA de la tabla.
  const calculado = calcularPnL(oficial.ocupacion, oficial.adr);
  comprobar("motor → total ingresos", calculado.ingresos.total, oficial.pnl.ingresos.total, TOLERANCIA_COP);
  comprobar("motor → total costos directos", calculado.costosDirectos.total, oficial.pnl.costosDirectos.total, TOLERANCIA_COP);
  comprobar("motor → total servicios públicos", calculado.serviciosPublicos.total, oficial.pnl.serviciosPublicos.total, TOLERANCIA_COP);
  comprobar("motor → total gastos varios", calculado.gastosVarios.total, oficial.pnl.gastosVarios.total, TOLERANCIA_COP);
  comprobar("motor → total otros fijos", calculado.otrosFijos.total, oficial.pnl.otrosFijos.total, TOLERANCIA_COP);
  comprobar("motor → EBITDA", calculado.ebitda, oficial.pnl.ebitda, TOLERANCIA_COP);

  // 2. Cada subtotal oficial cuadra con sus líneas.
  for (const grupo of GRUPOS) {
    const g = oficial.pnl[grupo];
    const suma = g.lines.reduce((acc, l) => acc + l.value, 0);
    comprobar(`subtotal ${grupo} = suma de líneas`, suma, g.total, TOLERANCIA_COP);
  }

  // 3. EBITDA oficial = ingresos − todos los grupos de costo.
  const ebitdaDerivado =
    oficial.pnl.ingresos.total -
    oficial.pnl.costosDirectos.total -
    oficial.pnl.serviciosPublicos.total -
    oficial.pnl.gastosVarios.total -
    oficial.pnl.otrosFijos.total;
  comprobar("EBITDA = ingresos − costos − gastos", ebitdaDerivado, oficial.pnl.ebitda, TOLERANCIA_COP);

  // 4. Indicadores de retorno.
  comprobar("margen EBITDA", oficial.pnl.ebitda / oficial.pnl.ingresos.total, oficial.pnl.margenEbitda, TOLERANCIA_RATIO);
  comprobar("ROI sobre precio apto", oficial.pnl.utilidadNeta / PRECIO_INMUEBLE, oficial.metricas.roiSobrePrecioApto, TOLERANCIA_RATIO);
  comprobar("ROI sobre inversión total", oficial.pnl.utilidadNeta / PRECIO_UNIDAD, oficial.metricas.roiSobreInversionTotal, TOLERANCIA_RATIO);
  comprobar("payback (años)", PRECIO_UNIDAD / oficial.pnl.flujoCajaLibre, oficial.metricas.paybackAnios, TOLERANCIA_ANIOS);

  console.log("");
}

if (fallos > 0) {
  console.error(`✗ ${fallos} comprobación(es) fuera de tolerancia.\n`);
  process.exit(1);
}

console.log("✓ Todas las comprobaciones dentro de tolerancia.\n");
