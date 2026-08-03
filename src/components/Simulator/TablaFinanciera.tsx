"use client";

import { useMemo, useState } from "react";
import { RotateCcw, SlidersHorizontal, Table2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { aUSD, formatAnios, formatCOP, formatPercent, formatUSD } from "@/lib/finance/formatters";
import type { LineItem, PnLBreakdown, PnLGroup, ReturnMetrics } from "@/lib/types";

type Tipo = "seccion" | "linea" | "subtotal" | "resultado";

/** Ajuste local de una línea: se puede apagar o forzar a un % de ventas propio. */
interface Ajuste {
  activo: boolean;
  /** Porcentaje (0–100) que reemplaza el valor original de la línea. `null` = sin editar. */
  pctOverride: number | null;
}

const AJUSTE_POR_DEFECTO: Ajuste = { activo: true, pctOverride: null };

/** Las cuatro secciones de costos/gastos cuyas líneas se pueden apagar o editar. */
const GRUPOS_EDITABLES: { key: keyof Pick<PnLBreakdown, "costosDirectos" | "serviciosPublicos" | "gastosVarios" | "otrosFijos">; seccion: string }[] = [
  { key: "costosDirectos", seccion: "Costo de ventas" },
  { key: "serviciosPublicos", seccion: "Gastos — servicios públicos" },
  { key: "gastosVarios", seccion: "Gastos — varios" },
  { key: "otrosFijos", seccion: "Otros gastos fijos" },
];

interface Fila {
  id: string;
  concepto: string;
  /** Valor por unidad (sin multiplicar por N° de apartamentos), con signo. */
  valorUnidad: number;
  tipo: Tipo;
  /** Línea fuente, sólo presente en filas editables de los 4 grupos de costos. */
  lineaOriginal?: LineItem;
  /** Sobrescribe la columna de porcentaje (ej. el ROI al final). */
  porcentajeTexto?: string;
}

/** Suma las líneas de un grupo aplicando los ajustes activos (apagado / % propio). */
function totalGrupoAjustado(
  grupo: PnLGroup,
  ajustes: Record<string, Ajuste>,
  ingresosUnidad: number,
): number {
  return grupo.lines.reduce((acc, l) => acc + valorEfectivo(l, ajustes, ingresosUnidad), 0);
}

/** Valor por unidad de una línea, ya aplicado su ajuste si tiene uno. */
function valorEfectivo(l: LineItem, ajustes: Record<string, Ajuste>, ingresosUnidad: number): number {
  const a = ajustes[l.id] ?? AJUSTE_POR_DEFECTO;
  if (!a.activo) return 0;
  if (a.pctOverride != null) return (a.pctOverride / 100) * ingresosUnidad;
  return l.value;
}

/**
 * Recalcula el P&G completo (por unidad) a partir de los ajustes locales:
 * apagar una línea la excluye de su subtotal; editar el % la reemplaza por
 * ese % de ventas. EBITDA, impuesto, utilidad neta y márgenes se derivan de
 * los nuevos subtotales — es un sandbox local, no toca el resto del sitio.
 */
function recalcular(pnl: PnLBreakdown, ajustes: Record<string, Ajuste>) {
  const ingresosUnidad = pnl.ingresos.total;

  const totalCostosDirectos = totalGrupoAjustado(pnl.costosDirectos, ajustes, ingresosUnidad);
  const totalServiciosPublicos = totalGrupoAjustado(pnl.serviciosPublicos, ajustes, ingresosUnidad);
  const totalGastosVarios = totalGrupoAjustado(pnl.gastosVarios, ajustes, ingresosUnidad);
  const totalOtrosFijos = totalGrupoAjustado(pnl.otrosFijos, ajustes, ingresosUnidad);

  const ebitda =
    ingresosUnidad - totalCostosDirectos - totalServiciosPublicos - totalGastosVarios - totalOtrosFijos;

  // Conserva la tarifa efectiva de impuesto del P&G base (puede ser 0%).
  const tarifaEfectiva =
    pnl.ebitda > pnl.depreciacion ? pnl.impuestoRenta / (pnl.ebitda - pnl.depreciacion) : 0;
  const impuestoRenta = Math.max(0, ebitda - pnl.depreciacion) * tarifaEfectiva;
  const utilidadNeta = ebitda - pnl.depreciacion - impuestoRenta;
  const flujoCajaLibre = utilidadNeta + pnl.depreciacion;

  return {
    ingresosUnidad,
    totalCostosDirectos,
    totalServiciosPublicos,
    totalGastosVarios,
    totalOtrosFijos,
    ebitda,
    impuestoRenta,
    utilidadNeta,
    flujoCajaLibre,
    margenEbitda: ingresosUnidad > 0 ? ebitda / ingresosUnidad : 0,
    margenNeto: ingresosUnidad > 0 ? utilidadNeta / ingresosUnidad : 0,
  };
}

export function TablaFinanciera({
  pnl,
  metricas,
  tasaCambio,
  unidades,
}: {
  pnl: PnLBreakdown;
  metricas: ReturnMetrics;
  tasaCambio: number;
  unidades: number;
}) {
  const [ajustes, setAjustes] = useState<Record<string, Ajuste>>({});

  // Un cambio de escenario/año/unidades trae un P&G distinto: los ajustes
  // locales dejan de tener sentido y se reinician. Se compara durante el
  // render (patrón "adjusting state when a prop changes") en vez de un
  // efecto, para no disparar un segundo render.
  const [pnlPrevio, setPnlPrevio] = useState(pnl);
  if (pnl !== pnlPrevio) {
    setPnlPrevio(pnl);
    setAjustes({});
  }

  const hayAjustes = Object.values(ajustes).some(
    (a) => !a.activo || a.pctOverride != null,
  );

  const vista = useMemo(() => recalcular(pnl, ajustes), [pnl, ajustes]);

  const x = (v: number) => v * unidades;
  const baseIngresos = vista.ingresosUnidad * unidades || 1;

  const utilidadNetaTotal = vista.utilidadNeta * unidades;
  const flujoCajaLibreTotal = vista.flujoCajaLibre * unidades;
  const roiSobreInversionTotal =
    metricas.inversionTotal > 0 ? utilidadNetaTotal / metricas.inversionTotal : 0;
  const paybackAnios =
    flujoCajaLibreTotal > 0 ? metricas.inversionTotal / flujoCajaLibreTotal : Infinity;

  const actualizarAjuste = (id: string, parcial: Partial<Ajuste>) => {
    setAjustes((prev) => ({
      ...prev,
      [id]: { ...AJUSTE_POR_DEFECTO, ...prev[id], ...parcial },
    }));
  };

  /* --- Construcción de filas ---------------------------------------- */
  const filas: Fila[] = [
    { id: "s-ingresos", concepto: "Ingresos", valorUnidad: 0, tipo: "seccion" },
    ...pnl.ingresos.lines.map((l) => ({
      id: l.id,
      concepto: l.label,
      valorUnidad: l.value,
      tipo: "linea" as const,
    })),
    { id: "t-ingresos", concepto: "Total ingresos", valorUnidad: vista.ingresosUnidad, tipo: "subtotal" as const },
  ];

  const totalesGrupo = {
    costosDirectos: vista.totalCostosDirectos,
    serviciosPublicos: vista.totalServiciosPublicos,
    gastosVarios: vista.totalGastosVarios,
    otrosFijos: vista.totalOtrosFijos,
  };
  const etiquetasTotal: Record<string, string> = {
    costosDirectos: "Total costo de ventas",
    serviciosPublicos: "Total servicios públicos",
    gastosVarios: "Total gastos varios",
    otrosFijos: "Total otros gastos fijos",
  };

  for (const { key, seccion } of GRUPOS_EDITABLES) {
    filas.push({ id: `s-${key}`, concepto: seccion, valorUnidad: 0, tipo: "seccion" });
    for (const l of pnl[key].lines) {
      filas.push({
        id: l.id,
        concepto: l.label,
        valorUnidad: -valorEfectivo(l, ajustes, vista.ingresosUnidad),
        tipo: "linea",
        lineaOriginal: l,
      });
    }
    filas.push({
      id: `t-${key}`,
      concepto: etiquetasTotal[key],
      valorUnidad: -totalesGrupo[key as keyof typeof totalesGrupo],
      tipo: "subtotal",
    });
  }

  filas.push(
    { id: "ebitda", concepto: "Utilidad bruta / EBITDA", valorUnidad: vista.ebitda, tipo: "resultado" },
    { id: "depreciacion", concepto: "(−) Depreciación amueblamiento", valorUnidad: -pnl.depreciacion, tipo: "linea" },
    { id: "impuesto", concepto: "(−) Impuesto de renta", valorUnidad: -vista.impuestoRenta, tipo: "linea" },
    { id: "utilidadNeta", concepto: "Utilidad neta propietario", valorUnidad: vista.utilidadNeta, tipo: "resultado" },
  );

  return (
    <Panel
      titulo="Tabla financiera detallada"
      subtitulo="Todas las líneas del P&G, en pesos y en dólares, mensual y anual. Apaga o edita el % de cualquier línea variable para explorar tu propio escenario."
      icono={Table2}
      padding="plano"
      id="tabla"
      acciones={
        hayAjustes ? (
          <button
            type="button"
            onClick={() => setAjustes({})}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-caribe-700 transition hover:border-caribe-500"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Restablecer
          </button>
        ) : undefined
      }
    >
      {hayAjustes && (
        <p className="mx-5 mb-4 mt-1 flex items-center gap-2 rounded-xl bg-gold-100 px-3.5 py-2.5 text-xs font-medium text-gold-600 sm:mx-6">
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Estimación local: hay líneas apagadas o con % editado. Los totales de esta tabla ya no
          corresponden al escenario oficial de arriba.
        </p>
      )}

      <div className="overflow-x-auto border-t border-line">
        <table className="w-full min-w-[58rem] text-sm">
          <caption className="sr-only">
            Detalle financiero del escenario simulado, por {unidades === 1 ? "1 apartamento" : `${unidades} apartamentos`}
          </caption>

          <thead className="bg-sand-100">
            <tr className="text-left">
              <th scope="col" className="w-10 px-3 py-3">
                <span className="sr-only">Incluir</span>
              </th>
              <th scope="col" className="px-2 py-3 font-semibold text-navy-900">
                Concepto
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold text-navy-900">
                Mensual COP
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold text-navy-900">
                Anual COP
              </th>
              <th scope="col" className="px-3 py-3 text-right font-medium text-ink-600">
                Mensual USD
              </th>
              <th scope="col" className="px-3 py-3 text-right font-medium text-ink-600">
                Anual USD
              </th>
              <th scope="col" className="px-5 py-3 text-right font-medium text-ink-600 sm:px-6">
                %
              </th>
            </tr>
          </thead>

          <tbody className="cifra-tabular">
            {filas.map((fila) => {
              if (fila.tipo === "seccion") {
                return (
                  <tr key={fila.id} className="bg-sand-50">
                    <th
                      scope="colgroup"
                      colSpan={7}
                      className="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400 sm:px-6"
                    >
                      {fila.concepto}
                    </th>
                  </tr>
                );
              }

              const anual = x(fila.valorUnidad);
              const mensual = anual / 12;
              const pct = anual / baseIngresos;

              const esResultado = fila.tipo === "resultado";
              const esSubtotal = fila.tipo === "subtotal";
              const fuerte = esResultado || esSubtotal;

              const l = fila.lineaOriginal;
              const editable = l && !l.fijo;
              const ajuste = l ? (ajustes[l.id] ?? AJUSTE_POR_DEFECTO) : AJUSTE_POR_DEFECTO;
              const apagada = Boolean(l) && !ajuste.activo;

              return (
                <tr
                  key={fila.id}
                  className={[
                    "border-b border-line/70",
                    esResultado ? "bg-caribe-50" : "",
                    apagada ? "opacity-45" : "",
                  ].join(" ")}
                >
                  <td className="px-3 py-2.5 text-center">
                    {l && (
                      <label className="inline-flex cursor-pointer items-center">
                        <span className="sr-only">
                          {ajuste.activo ? `Excluir ${fila.concepto} del cálculo` : `Incluir ${fila.concepto} en el cálculo`}
                        </span>
                        <input
                          type="checkbox"
                          checked={ajuste.activo}
                          onChange={(e) => actualizarAjuste(l.id, { activo: e.target.checked })}
                          className="h-4 w-4 rounded border-line-strong text-caribe-600 accent-caribe-600"
                        />
                      </label>
                    )}
                  </td>

                  <th
                    scope="row"
                    className={[
                      "max-w-[20rem] px-2 py-2.5 text-left",
                      apagada ? "line-through" : "",
                      esResultado
                        ? "font-semibold text-navy-900"
                        : esSubtotal
                          ? "font-semibold text-ink-700"
                          : "font-normal text-ink-600",
                    ].join(" ")}
                  >
                    {fila.concepto}
                  </th>

                  <td className={`px-3 py-2.5 text-right ${fuerte ? "font-semibold text-navy-900" : "text-ink-600"}`}>
                    {formatCOP(mensual)}
                  </td>
                  <td className={`px-3 py-2.5 text-right ${fuerte ? "font-semibold text-navy-900" : "text-ink-600"}`}>
                    {formatCOP(anual)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-ink-400">
                    {formatUSD(aUSD(mensual, tasaCambio))}
                  </td>
                  <td className="px-3 py-2.5 text-right text-ink-400">
                    {formatUSD(aUSD(anual, tasaCambio))}
                  </td>
                  <td
                    className={`px-5 py-2.5 text-right sm:px-6 ${fuerte ? "font-semibold text-navy-900" : "text-ink-400"}`}
                  >
                    {editable ? (
                      <span className="inline-flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step={0.1}
                          min={0}
                          max={100}
                          disabled={apagada}
                          value={ajuste.pctOverride ?? Number((pct * 100).toFixed(1))}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            actualizarAjuste(l!.id, { pctOverride: Number.isFinite(v) ? v : null });
                          }}
                          aria-label={`Editar % de ventas de ${fila.concepto}`}
                          className="w-16 rounded-lg border border-line bg-white px-1.5 py-1 text-right text-xs text-navy-900 transition focus:border-caribe-500 focus:outline-none focus:ring-2 focus:ring-caribe-500/20 disabled:bg-sand-100 disabled:text-ink-400"
                        />
                        <span className="text-ink-400">%</span>
                      </span>
                    ) : (
                      (fila.porcentajeTexto ?? formatPercent(pct, 1))
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Rentabilidad — no es una línea del P&G, es el indicador final. */}
            <tr className="bg-navy-900 text-white">
              <td />
              <th scope="row" className="px-2 py-3 text-left font-semibold">
                Rentabilidad sobre la inversión
              </th>
              <td className="px-3 py-3 text-right font-semibold">
                {formatPercent(roiSobreInversionTotal / 12)}
              </td>
              <td className="px-3 py-3 text-right font-semibold">
                {formatPercent(roiSobreInversionTotal)}
              </td>
              <td colSpan={2} className="px-3 py-3 text-right text-white/60">
                Recuperación en {formatAnios(paybackAnios)}
              </td>
              <td className="px-5 py-3 text-right text-white/60 sm:px-6">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="border-t border-line px-5 py-3 text-[11px] leading-relaxed text-ink-400 sm:px-6">
        Cifras para {unidades === 1 ? "1 apartamento" : `${unidades} apartamentos`}. La conversión a
        dólares usa una tasa de {formatCOP(tasaCambio)} por USD, digitada por ti: es una referencia
        de lectura, no una cotización. Sólo se pueden apagar o editar las líneas de costos y gastos
        que no son fijas; los montos fijos mensuales (predial, honorarios, Sayco y Acinpro, etc.) se
        pueden apagar pero no cambiar de %.
      </p>
    </Panel>
  );
}
