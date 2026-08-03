"use client";

import { Fragment, useState } from "react";
import { BarChart3, Table2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { COLOR_ESCENARIO, ESCENARIOS, ORDEN_ESCENARIOS } from "@/lib/finance/constants";
import { totalCostosYGastos } from "@/lib/finance/engine";
import { formatMoneda, formatMonedaCompact, formatPercent } from "@/lib/finance/formatters";
import type { Moneda, PnLBreakdown, ReturnMetrics } from "@/lib/types";

interface Serie {
  id: string;
  label: string;
  valor: number;
  color: string;
}

/**
 * Barras horizontales, una sola escala por gráfica.
 *
 * Cada barra lleva su valor como etiqueta directa: la identidad y la magnitud
 * nunca dependen sólo del color, lo que además cubre el caso de los tonos con
 * poco contraste sobre fondo claro.
 */
function BarrasHorizontales({
  series,
  formato,
  maximo,
}: {
  series: Serie[];
  formato: (v: number) => string;
  /** Tope de la escala; por defecto, el mayor valor de la serie. */
  maximo?: number;
}) {
  const max = maximo ?? Math.max(...series.map((s) => Math.abs(s.valor)), 1);

  return (
    <ul className="space-y-3">
      {series.map((s) => (
        <li key={s.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="cifra-tabular shrink-0 text-xs font-semibold text-navy-900">
              {formato(s.valor)}
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-sand-100">
            <div
              className="h-full rounded-r-[4px] transition-[width] duration-500 ease-out"
              style={{
                width: `${Math.max((Math.abs(s.valor) / max) * 100, 1.5)}%`,
                backgroundColor: s.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Barra apilada 100%: composición de un total. */
function BarraApilada({
  series,
  total,
  formato,
}: {
  series: Serie[];
  total: number;
  formato: (v: number) => string;
}) {
  return (
    <div>
      {/* 2px de superficie separando cada segmento: el blanco hace de borde. */}
      <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-lg bg-sand-100">
        {series.map((s) => (
          <div
            key={s.id}
            className="h-full transition-[width] duration-500 ease-out first:rounded-l-lg last:rounded-r-lg"
            style={{
              width: `${(s.valor / total) * 100}%`,
              backgroundColor: s.color,
            }}
            title={`${s.label}: ${formato(s.valor)}`}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {series.map((s) => (
          <li key={s.id} className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="cifra-tabular shrink-0 text-xs text-ink-700">
              <span className="font-semibold text-navy-900">{formato(s.valor)}</span>
              <span className="ml-2 text-ink-400">{formatPercent(s.valor / total, 1)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tarjeta contenedora de una gráfica. */
function Grafica({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="rounded-2xl border border-line bg-sand-50 p-4">
      <figcaption className="mb-4">
        <h4 className="text-sm font-semibold text-navy-900">{titulo}</h4>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">{nota}</p>
      </figcaption>
      {children}
    </figure>
  );
}

export function GraficasSimulacion({
  pnl,
  metricas,
  moneda,
  tasaCambio,
  unidades,
}: {
  pnl: PnLBreakdown;
  metricas: ReturnMetrics;
  moneda: Moneda;
  tasaCambio: number;
  unidades: number;
}) {
  const [vista, setVista] = useState<"grafica" | "tabla">("grafica");

  const money = (v: number) => formatMoneda(v, moneda, tasaCambio);
  const moneyCompact = (v: number) => formatMonedaCompact(v, moneda, tasaCambio);

  /* --- 1. Ingresos, gastos y utilidad neta ---------------------- */
  const costosTotales = totalCostosYGastos(pnl) * unidades;
  const seriesResultado: Serie[] = ([] as Serie[]).concat([
    {
      id: "ingresos",
      label: "Ingresos",
      valor: metricas.ingresosTotal,
      color: "var(--color-flujo-entrada)",
    },
    {
      id: "costos",
      label: "Costos y gastos",
      valor: costosTotales,
      color: "var(--color-flujo-salida)",
    },
    {
      id: "utilidad",
      label: "Utilidad neta",
      valor: metricas.utilidadNetaTotal,
      color: "var(--color-flujo-total)",
    },
  ]);

  // Con los parámetros del modelo ambos valen cero y la barra no aparece; si el
  // usuario los activa, entra como cuarta barra para que Ingresos − Costos −
  // Depreciación e impuestos = Utilidad neta siga cuadrando a la vista.
  const fiscalidad = (pnl.depreciacion + pnl.impuestoRenta) * unidades;
  if (fiscalidad > 0) {
    seriesResultado.splice(2, 0, {
      id: "fiscalidad",
      label: "Depreciación e impuestos",
      valor: fiscalidad,
      color: "var(--color-gold-500)",
    });
  }

  /* --- 2. Distribución de costos y gastos ----------------------- */
  type GrupoPnL = "costosDirectos" | "serviciosPublicos" | "gastosVarios" | "otrosFijos";
  const linea = (grupo: GrupoPnL, id: string): number =>
    pnl[grupo].lines.find((l) => l.id === id)?.value ?? 0;

  const comisionCanales = linea("costosDirectos", "comisionCanales") * unidades;
  const feeOperador = linea("gastosVarios", "feeOperadorGEH") * unidades;
  const otrosDirectos = pnl.costosDirectos.total * unidades - comisionCanales;
  const servicios = pnl.serviciosPublicos.total * unidades;
  const otrosGastos = pnl.gastosVarios.total * unidades - feeOperador + pnl.otrosFijos.total * unidades;

  // Rampa ordinal de un solo tono: el segmento más grande recibe el paso más
  // oscuro, así el color refuerza la magnitud en vez de inventar categorías.
  const RAMPA = [
    "var(--color-ramp-5)",
    "var(--color-ramp-4)",
    "var(--color-ramp-3)",
    "var(--color-ramp-2)",
    "var(--color-ramp-1)",
  ];

  const seriesCostos: Serie[] = [
    { id: "canales", label: "Comisión de canales", valor: comisionCanales, color: "" },
    { id: "operador", label: "Fee Operador GEHsuites", valor: feeOperador, color: "" },
    { id: "otrosDirectos", label: "Otros costos directos (FARA, admin., operación)", valor: otrosDirectos, color: "" },
    { id: "servicios", label: "Servicios públicos", valor: servicios, color: "" },
    { id: "otrosGastos", label: "Otros gastos y fijos (predial, aseo, lavandería…)", valor: otrosGastos, color: "" },
  ]
    .sort((a, b) => b.valor - a.valor)
    .map((s, i) => ({ ...s, color: RAMPA[i] }));

  /* --- 3. Rentabilidad anual por escenario ---------------------- */
  const seriesRoi: Serie[] = ORDEN_ESCENARIOS.map((k) => ({
    id: k,
    label: ESCENARIOS[k].label,
    valor: ESCENARIOS[k].metricas.roiSobreInversionTotal,
    color: COLOR_ESCENARIO[k],
  }));

  const filasTabla = [
    { grupo: "Resultado", items: seriesResultado, fmt: money },
    { grupo: "Distribución de costos y gastos", items: seriesCostos, fmt: money },
    {
      grupo: "Rentabilidad anual por escenario",
      items: seriesRoi,
      fmt: (v: number) => formatPercent(v),
    },
  ];

  return (
    <Panel
      titulo="Gráficas de la simulación"
      subtitulo="Tres lecturas del mismo escenario. Cada gráfica usa una sola escala."
      icono={BarChart3}
      id="graficas"
      acciones={
        <div className="flex rounded-xl border border-line bg-white p-0.5">
          {(
            [
              ["grafica", "Gráfica", BarChart3],
              ["tabla", "Tabla", Table2],
            ] as const
          ).map(([id, label, Icono]) => (
            <button
              key={id}
              type="button"
              onClick={() => setVista(id)}
              aria-pressed={vista === id}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                vista === id ? "bg-navy-900 text-white" : "text-ink-600 hover:text-navy-900",
              ].join(" ")}
            >
              <Icono className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      }
    >
      {vista === "grafica" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Grafica
            titulo="Ingresos, gastos y utilidad neta"
            nota={`Anual, por ${unidades === 1 ? "1 apartamento" : `${unidades} apartamentos`}.`}
          >
            <BarrasHorizontales series={seriesResultado} formato={moneyCompact} />
          </Grafica>

          <Grafica
            titulo="Distribución de costos y gastos"
            nota={`Total anual ${money(costosTotales)}, ordenado de mayor a menor.`}
          >
            <BarraApilada series={seriesCostos} total={costosTotales} formato={moneyCompact} />
          </Grafica>

          <Grafica
            titulo="Rentabilidad anual por escenario"
            nota="ROI sobre la inversión total. Cifras oficiales del Año 1."
          >
            <BarrasHorizontales
              series={seriesRoi}
              formato={(v) => formatPercent(v)}
              maximo={Math.max(...seriesRoi.map((s) => s.valor)) * 1.05}
            />
          </Grafica>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Datos de las tres gráficas de la simulación</caption>
            <thead className="bg-sand-100">
              <tr className="text-left">
                <th scope="col" className="px-4 py-2.5 font-semibold text-navy-900">
                  Concepto
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold text-navy-900">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="cifra-tabular">
              {filasTabla.map((bloque) => (
                <Fragment key={bloque.grupo}>
                  <tr className="bg-sand-50">
                    <th
                      scope="colgroup"
                      colSpan={2}
                      className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400"
                    >
                      {bloque.grupo}
                    </th>
                  </tr>
                  {bloque.items.map((s) => (
                    <tr key={`${bloque.grupo}-${s.id}`} className="border-b border-line/70">
                      <th scope="row" className="px-4 py-2.5 text-left font-normal text-ink-600">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: s.color }}
                            aria-hidden
                          />
                          {s.label}
                        </span>
                      </th>
                      <td className="px-4 py-2.5 text-right font-semibold text-navy-900">
                        {bloque.fmt(s.valor)}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
