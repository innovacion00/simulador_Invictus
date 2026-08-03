"use client";

import { Columns3 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { COLOR_ESCENARIO, ESCENARIOS, ORDEN_ESCENARIOS } from "@/lib/finance/constants";
import { formatAnios, formatMoneda, formatPercent } from "@/lib/finance/formatters";
import type { Moneda, ScenarioKey } from "@/lib/types";

/** Una fila de dato dentro de la tarjeta de escenario. */
function Dato({
  label,
  valor,
  fuerte = false,
}: {
  label: string;
  valor: string;
  fuerte?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/70 py-2 last:border-0">
      <span className="text-xs text-ink-400">{label}</span>
      <span
        className={`cifra-tabular shrink-0 text-right ${
          fuerte ? "text-sm font-semibold text-navy-900" : "text-[13px] text-ink-700"
        }`}
      >
        {valor}
      </span>
    </div>
  );
}

export function ComparadorEscenarios({
  unidades,
  moneda,
  tasaCambio,
  escenarioActivo,
  modoPersonalizado,
}: {
  unidades: number;
  moneda: Moneda;
  tasaCambio: number;
  escenarioActivo: ScenarioKey;
  /** En modo personalizado ninguna tarjeta se marca como «la tuya». */
  modoPersonalizado: boolean;
}) {
  return (
    <Panel
      titulo="Comparador de escenarios"
      subtitulo="Los tres escenarios oficiales del modelo, siempre visibles. Cifras del Año 1, para el número de apartamentos que elegiste."
      icono={Columns3}
      id="comparador"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {ORDEN_ESCENARIOS.map((key) => {
          const e = ESCENARIOS[key];
          const activo = !modoPersonalizado && key === escenarioActivo;
          const utilidadAnual = e.pnl.utilidadNeta * unidades;

          const money = (v: number) => formatMoneda(v, moneda, tasaCambio);

          return (
            <article
              key={key}
              className={[
                "overflow-hidden rounded-2xl border transition-all",
                activo
                  ? "border-navy-900 bg-white shadow-lg shadow-navy-900/10"
                  : "border-line bg-sand-50",
              ].join(" ")}
            >
              {/* Franja de color: identidad del escenario, reforzada por el nombre. */}
              <div className="h-1.5 w-full" style={{ backgroundColor: COLOR_ESCENARIO[key] }} />

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="titular flex items-center gap-2 text-base text-navy-900">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: COLOR_ESCENARIO[key] }}
                      aria-hidden
                    />
                    {e.label}
                  </h4>
                  {activo && (
                    <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Tu escenario
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-ink-400">{e.descripcion}</p>

                {/* Cifra destacada de la tarjeta */}
                <p className="mt-3 text-2xl font-semibold leading-tight text-navy-900">
                  {money(utilidadAnual)}
                </p>
                <p className="text-[11px] text-ink-400">Utilidad neta anual</p>

                <div className="mt-3">
                  <Dato label="Ocupación" valor={formatPercent(e.ocupacion, 0)} />
                  <Dato label="ADR" valor={money(e.adr)} />
                  <Dato label="Ingresos anuales" valor={money(e.pnl.ingresos.total * unidades)} />
                  <Dato label="Utilidad neta mensual" valor={money(utilidadAnual / 12)} fuerte />
                  <Dato label="Margen EBITDA" valor={formatPercent(e.pnl.margenEbitda)} />
                  <Dato
                    label="ROI anual"
                    valor={formatPercent(e.metricas.roiSobreInversionTotal)}
                    fuerte
                  />
                  <Dato
                    label="ROI mensual"
                    valor={formatPercent(e.metricas.roiSobreInversionTotal / 12)}
                  />
                  <Dato label="Recuperación" valor={formatAnios(e.metricas.paybackAnios)} fuerte />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl bg-sand-100 p-3.5 text-[11px] leading-relaxed text-ink-600">
        Mostramos el escenario pesimista con la misma prominencia que los otros dos a propósito: con{" "}
        {formatPercent(ESCENARIOS.pesimista.ocupacion, 0)} de ocupación el modelo sigue entregando{" "}
        <strong className="font-semibold text-navy-900">
          {formatPercent(ESCENARIOS.pesimista.metricas.roiSobreInversionTotal)}
        </strong>{" "}
        anual. Que el piso del modelo siga siendo rentable es el argumento, no un detalle a esconder.
      </p>
    </Panel>
  );
}
