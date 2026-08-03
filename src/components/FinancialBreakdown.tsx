import { ChevronDown } from "lucide-react";

import { COLOR_ESCENARIO, ESCENARIOS, ORDEN_ESCENARIOS } from "@/lib/finance/constants";
import { formatCOP, formatPercent } from "@/lib/finance/formatters";
import { Reveal } from "@/components/ui/Reveal";
import type { PnLBreakdown, ScenarioKey } from "@/lib/types";

type GrupoKey = keyof Pick<
  PnLBreakdown,
  "ingresos" | "costosDirectos" | "serviciosPublicos" | "gastosVarios" | "otrosFijos"
>;

const GRUPOS: { key: GrupoKey; titulo: string; nota: string; abiertoPorDefecto?: boolean }[] = [
  {
    key: "ingresos",
    titulo: "Ingresos",
    nota: "Ventas de hospedaje = ADR × % de ocupación × 365 días.",
    abiertoPorDefecto: true,
  },
  {
    key: "costosDirectos",
    titulo: "Costos directos",
    nota: "Escalan con las ventas, salvo el fee de administración que es fijo.",
  },
  {
    key: "serviciosPublicos",
    titulo: "Gastos — servicios públicos",
    nota: "Semifijos: suben y bajan con la ocupación. Internet es fijo.",
  },
  {
    key: "gastosVarios",
    titulo: "Gastos — varios",
    nota: "Incluye el fee del operador comercial GEHsuites y el marketing.",
  },
  {
    key: "otrosFijos",
    titulo: "Otros gastos fijos",
    nota: "No dependen de la ocupación ni de las ventas.",
  },
];

/** Busca el valor de una línea por id dentro de un escenario. */
function valorLinea(escenario: ScenarioKey, grupo: GrupoKey, id: string): number {
  return ESCENARIOS[escenario].pnl[grupo].lines.find((l) => l.id === id)?.value ?? 0;
}

function TablaGrupo({ grupo }: { grupo: (typeof GRUPOS)[number] }) {
  // Las líneas son las mismas en los tres escenarios; el pesimista sirve de plantilla.
  const lineas = ESCENARIOS.pesimista.pnl[grupo.key].lines;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] text-sm">
        <caption className="sr-only">
          {grupo.titulo} por escenario, cifras anuales por unidad
        </caption>
        <thead>
          <tr className="border-b border-line text-left">
            <th scope="col" className="py-2.5 pr-4 font-semibold text-navy-900">Concepto</th>
            <th scope="col" className="py-2.5 pr-4 font-medium text-ink-400">Base</th>
            {ORDEN_ESCENARIOS.map((k) => (
              <th key={k} scope="col" className="py-2.5 pl-4 text-right font-semibold text-navy-900">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={{ backgroundColor: COLOR_ESCENARIO[k] }}
                    aria-hidden
                  />
                  {ESCENARIOS[k].label}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="cifra-tabular">
          {lineas.map((linea) => (
            <tr key={linea.id} className="border-b border-line/60">
              <th scope="row" className="max-w-xs py-2.5 pr-4 text-left font-normal text-ink-600">
                {linea.label}
              </th>
              <td className="py-2.5 pr-4 text-xs text-ink-400">{linea.basis}</td>
              {ORDEN_ESCENARIOS.map((k) => (
                <td key={k} className="py-2.5 pl-4 text-right text-ink-600">
                  {formatCOP(valorLinea(k, grupo.key, linea.id))}
                </td>
              ))}
            </tr>
          ))}

          <tr className="bg-sand-100/40">
            <th scope="row" className="py-2.5 pr-4 text-left font-semibold text-navy-900">
              Total {grupo.titulo.toLowerCase()}
            </th>
            <td />
            {ORDEN_ESCENARIOS.map((k) => (
              <td
                key={k}
                className="cifra-tabular py-2.5 pl-4 text-right font-semibold text-navy-900"
              >
                {formatCOP(ESCENARIOS[k].pnl[grupo.key].total)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function FinancialBreakdown() {
  return (
    <section id="desglose" className="scroll-mt-20 bg-sand-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="titular text-3xl text-navy-900 sm:text-[2.6rem]">
            Desglose financiero, sin letra pequeña
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            El P&amp;G completo del Año 1, línea por línea y por unidad, en los tres escenarios.
            Todo lo que el simulador calcula sale de aquí.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-10 space-y-3">
          {GRUPOS.map((grupo) => (
            <details
              key={grupo.key}
              open={grupo.abiertoPorDefecto}
              className="group rounded-3xl border border-line bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-base font-semibold text-navy-900">{grupo.titulo}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-400">
                    {grupo.nota}
                  </span>
                </span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>

              <div className="border-t border-line px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
                <TablaGrupo grupo={grupo} />
              </div>
            </details>
          ))}

          {/* Resultado — siempre visible, no colapsado. */}
          <div className="overflow-hidden rounded-3xl border-2 border-navy-900 bg-white shadow-md">
            <div className="p-5 sm:p-6">
              <h3 className="text-base font-semibold text-navy-900">Resultado por unidad · Año 1</h3>
              <p className="mt-0.5 text-xs text-ink-400">
                El modelo vigente aplica depreciación e impuesto de renta en cero, por eso la
                utilidad neta iguala al EBITDA.
              </p>
            </div>

            <div className="overflow-x-auto border-t border-line">
              <table className="w-full min-w-[36rem] text-sm">
                <caption className="sr-only">Resultado anual por unidad en los tres escenarios</caption>
                <thead>
                  <tr className="border-b border-line text-left">
                    <th scope="col" className="px-5 py-2.5 font-semibold text-navy-900 sm:px-6">
                      Concepto
                    </th>
                    {ORDEN_ESCENARIOS.map((k) => (
                      <th key={k} scope="col" className="px-5 py-2.5 text-right font-semibold text-navy-900 sm:px-6">
                        {ESCENARIOS[k].label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="cifra-tabular">
                  {[
                    { label: "Utilidad bruta / EBITDA", valor: (k: ScenarioKey) => formatCOP(ESCENARIOS[k].pnl.ebitda), fuerte: true },
                    { label: "Margen EBITDA", valor: (k: ScenarioKey) => formatPercent(ESCENARIOS[k].pnl.margenEbitda) },
                    { label: "(−) Depreciación amueblamiento", valor: (k: ScenarioKey) => formatCOP(ESCENARIOS[k].pnl.depreciacion) },
                    { label: "(−) Impuesto de renta", valor: (k: ScenarioKey) => formatCOP(ESCENARIOS[k].pnl.impuestoRenta) },
                    { label: "Utilidad neta", valor: (k: ScenarioKey) => formatCOP(ESCENARIOS[k].pnl.utilidadNeta), fuerte: true },
                    { label: "Flujo de caja libre", valor: (k: ScenarioKey) => formatCOP(ESCENARIOS[k].pnl.flujoCajaLibre) },
                    { label: "Rentabilidad sobre inversión total", valor: (k: ScenarioKey) => formatPercent(ESCENARIOS[k].metricas.roiSobreInversionTotal), fuerte: true },
                    { label: "Recuperación de la inversión", valor: (k: ScenarioKey) => `${ESCENARIOS[k].metricas.paybackAnios.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} años`, fuerte: true },
                  ].map((fila) => (
                    <tr key={fila.label} className="border-b border-line/60 last:border-0">
                      <th
                        scope="row"
                        className={`px-5 py-2.5 text-left sm:px-6 ${
                          fila.fuerte ? "font-semibold text-navy-900" : "font-normal text-ink-600"
                        }`}
                      >
                        {fila.label}
                      </th>
                      {ORDEN_ESCENARIOS.map((k) => (
                        <td
                          key={k}
                          className={`px-5 py-2.5 text-right sm:px-6 ${
                            fila.fuerte ? "font-semibold text-navy-900" : "text-ink-600"
                          }`}
                        >
                          {fila.valor(k)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
