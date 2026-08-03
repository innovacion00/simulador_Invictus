"use client";

import { Coins, Hourglass, LineChart, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { useCountUp } from "@/components/ui/useCountUp";
import { totalCostosYGastos } from "@/lib/finance/engine";
import {
  aUSD,
  formatAnios,
  formatCOP,
  formatMoneda,
  formatPercent,
  formatUSD,
} from "@/lib/finance/formatters";
import type { Moneda, PnLBreakdown, ReturnMetrics } from "@/lib/types";

/** Escala del anillo de payback: 15 años = anillo completo. */
const PAYBACK_MAX = 15;

/**
 * Devuelve el valor en la moneda elegida y su equivalencia en la otra,
 * al estilo "$ 680.424.714 (≈ $168.006)".
 */
function doble(cop: number, moneda: Moneda, tasa: number) {
  return {
    principal: formatMoneda(cop, moneda, tasa),
    equivalencia: moneda === "COP" ? `≈ ${formatUSD(aUSD(cop, tasa))}` : `≈ ${formatCOP(cop)}`,
  };
}

/**
 * Anillo de recuperación de la inversión: se llena mientras MENOS años tarde
 * en recuperarse. El número en años acompaña siempre al color.
 */
function AnilloPayback({ anios }: { anios: number }) {
  const animado = useCountUp(Number.isFinite(anios) ? anios : 0);
  const proporcion = Math.max(0, Math.min(1, 1 - animado / PAYBACK_MAX));

  const radio = 46;
  const circunferencia = 2 * Math.PI * radio;
  const color =
    animado <= 9
      ? "var(--color-verde-500)"
      : animado <= 12
        ? "var(--color-caribe-500)"
        : "var(--color-gold-400)";

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 112 112" className="h-28 w-28 -rotate-90" aria-hidden>
        <circle cx="56" cy="56" r={radio} fill="none" stroke="var(--color-caribe-100)" strokeWidth="9" />
        <circle
          cx="56"
          cy="56"
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - proporcion)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-navy-900">
          {Number.isFinite(anios)
            ? animado.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            : "—"}
        </span>
        <span className="text-[11px] font-medium text-ink-400">años</span>
      </div>
    </div>
  );
}

/** Tarjeta con la cifra anual destacada y la mensual como apoyo. */
function TarjetaMetrica({
  icono: Icono,
  label,
  anual,
  mensual,
  moneda,
  tasa,
  tono = "neutro",
}: {
  icono: typeof Wallet;
  label: string;
  anual: number;
  mensual: number;
  moneda: Moneda;
  tasa: number;
  tono?: "neutro" | "positivo" | "costo";
}) {
  const a = doble(anual, moneda, tasa);
  const m = doble(mensual, moneda, tasa);

  const colorValor =
    tono === "positivo" ? "text-verde-700" : tono === "costo" ? "text-ink-700" : "text-navy-900";

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-ink-600">
        <Icono className="h-4 w-4 text-caribe-600" aria-hidden />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className={`mt-2.5 text-xl font-semibold leading-tight sm:text-[1.6rem] ${colorValor}`}>
        {tono === "costo" && anual > 0 ? "−" : ""}
        {a.principal}
      </p>
      <p className="cifra-tabular mt-0.5 text-[11px] text-ink-400">{a.equivalencia} · anual</p>

      <p className="cifra-tabular mt-2.5 border-t border-line pt-2.5 text-sm text-ink-600">
        <span className="text-ink-400">Mensual </span>
        <span className="font-semibold text-navy-900">
          {tono === "costo" && mensual > 0 ? "−" : ""}
          {m.principal}
        </span>
      </p>
    </div>
  );
}

export function ProyeccionRentabilidad({
  pnl,
  metricas,
  moneda,
  tasaCambio,
  escenario,
  anio,
  esEstimacion,
}: {
  pnl: PnLBreakdown;
  metricas: ReturnMetrics;
  moneda: Moneda;
  tasaCambio: number;
  escenario: string;
  anio: number;
  esEstimacion: boolean;
}) {
  const utilidadAnual = metricas.utilidadNetaTotal;
  const utilidadMensual = utilidadAnual / 12;
  const utilidadAnimada = useCountUp(utilidadAnual);
  const roiAnimado = useCountUp(metricas.roiSobreInversionTotal);

  // Sólo costos y gastos operativos: la depreciación y el impuesto tienen su
  // propia línea en la tabla y en la cascada, y no se mezclan aquí.
  const costosAnual = totalCostosYGastos(pnl) * metricas.unidades;
  const inversion = doble(metricas.inversionTotal, moneda, tasaCambio);
  const heroe = doble(utilidadAnimada, moneda, tasaCambio);
  const heroeMes = doble(utilidadMensual, moneda, tasaCambio);

  const sufijoUnidades =
    metricas.unidades === 1 ? "1 apartamento" : `${metricas.unidades} apartamentos`;

  return (
    <Panel
      titulo="Proyección de rentabilidad"
      subtitulo={
        <>
          {escenario} · {sufijoUnidades} · Año {anio}
          {esEstimacion && (
            <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-600">
              Estimación
            </span>
          )}
        </>
      }
      icono={LineChart}
      id="proyeccion"
    >
      {/* --- Cifra estrella --------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-5 text-white sm:p-7">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-30 blur-2xl"
          style={{ background: "radial-gradient(circle, #2a78d6 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-caribe-300">
              Utilidad neta del propietario
            </p>

            <p className="mt-2 text-[2.4rem] font-semibold leading-none tracking-tight sm:text-5xl">
              {heroe.principal}
            </p>
            <p className="cifra-tabular mt-1.5 text-sm text-white/55">
              {heroe.equivalencia} · anual
            </p>

            <p className="cifra-tabular mt-4 text-sm text-white/75">
              Mensual{" "}
              <strong className="font-semibold text-white">{heroeMes.principal}</strong>{" "}
              <span className="text-white/45">{heroeMes.equivalencia}</span>
            </p>
          </div>

          {/* ROI mensual y anual, en la misma tarjeta */}
          <div className="flex gap-4 rounded-2xl bg-white/[0.07] p-4 sm:flex-col sm:gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-caribe-300">ROI anual</p>
              <p className="text-2xl font-semibold sm:text-3xl">{formatPercent(roiAnimado)}</p>
            </div>
            <div className="border-l border-white/15 pl-4 sm:border-l-0 sm:border-t sm:pl-0 sm:pt-3">
              <p className="text-[11px] uppercase tracking-wider text-caribe-300">ROI mensual</p>
              <p className="text-lg font-semibold sm:text-xl">
                {formatPercent(metricas.roiSobreInversionTotal / 12)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Métricas de apoyo ------------------------------------- */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-sand-50 p-4">
          <div className="flex items-center gap-2 text-ink-600">
            <Coins className="h-4 w-4 text-caribe-600" aria-hidden />
            <span className="text-xs font-medium">Inversión total</span>
          </div>
          <p className="mt-2.5 text-xl font-semibold leading-tight text-navy-900 sm:text-[1.6rem]">
            {inversion.principal}
          </p>
          <p className="cifra-tabular mt-0.5 text-[11px] text-ink-400">{inversion.equivalencia}</p>
          <p className="cifra-tabular mt-2.5 border-t border-line pt-2.5 text-sm text-ink-600">
            <span className="text-ink-400">Por unidad </span>
            <span className="font-semibold text-navy-900">
              {formatMoneda(metricas.inversionTotal / metricas.unidades, moneda, tasaCambio)}
            </span>
          </p>
        </div>

        <TarjetaMetrica
          icono={TrendingUp}
          label="Ingresos proyectados"
          anual={metricas.ingresosTotal}
          mensual={metricas.ingresosTotal / 12}
          moneda={moneda}
          tasa={tasaCambio}
        />

        <TarjetaMetrica
          icono={TrendingDown}
          label="Costos y gastos"
          anual={costosAnual}
          mensual={costosAnual / 12}
          moneda={moneda}
          tasa={tasaCambio}
          tono="costo"
        />

        <TarjetaMetrica
          icono={Wallet}
          label="EBITDA"
          anual={metricas.ebitdaTotal}
          mensual={metricas.ebitdaTotal / 12}
          moneda={moneda}
          tasa={tasaCambio}
        />

        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-ink-600">
            <TrendingUp className="h-4 w-4 text-caribe-600" aria-hidden />
            <span className="text-xs font-medium">Márgenes sobre ingresos</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-4">
            <span>
              <span className="block text-xl font-semibold text-navy-900 sm:text-[1.6rem]">
                {formatPercent(metricas.margenEbitda)}
              </span>
              <span className="text-[11px] text-ink-400">EBITDA</span>
            </span>
            <span>
              <span className="block text-xl font-semibold text-navy-900 sm:text-[1.6rem]">
                {formatPercent(metricas.margenNeto)}
              </span>
              <span className="text-[11px] text-ink-400">Neto</span>
            </span>
          </div>
          <p className="mt-2.5 border-t border-line pt-2.5 text-[11px] leading-snug text-ink-400">
            Un margen EBITDA por encima del 40% se considera saludable en operación hotelera.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
          <AnilloPayback anios={metricas.paybackAnios} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-ink-600">
              <Hourglass className="h-4 w-4 text-caribe-600" aria-hidden />
              <span className="text-xs font-medium">Recuperación</span>
            </div>
            <p className="mt-1.5 text-base font-semibold text-navy-900">
              {formatAnios(metricas.paybackAnios)}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink-400">
              Inversión total ÷ flujo de caja libre anual.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
