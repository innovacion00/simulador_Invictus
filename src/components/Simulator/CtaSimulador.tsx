"use client";

import { useState } from "react";
import { Check, Copy, FileDown, Loader2, MessageCircle } from "lucide-react";

import { TIPOLOGIA, WHATSAPP_ASESOR } from "@/lib/finance/constants";
import { formatAnios, formatCOP, formatPercent } from "@/lib/finance/formatters";
import type { PnLBreakdown, ReturnMetrics } from "@/lib/types";

// Rango Unicode de marcas diacríticas combinantes (U+0300–U+036F), construido
// por código de punto para no depender de caracteres combinantes literales en
// el código fuente.
const MARCAS_DIACRITICAS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g",
);

/** Sin tildes/ñ ni espacios: seguro para nombre de archivo. */
function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Resumen en texto plano de la simulación, para portapapeles y WhatsApp. */
function construirResumen(args: {
  escenario: string;
  anio: number;
  unidades: number;
  pnl: PnLBreakdown;
  metricas: ReturnMetrics;
  esEstimacion: boolean;
}): string {
  const { escenario, anio, unidades, pnl, metricas, esEstimacion } = args;

  return [
    `Simulación de rentabilidad — Invictus × GEHsuites`,
    `${TIPOLOGIA} · ${unidades === 1 ? "1 apartamento" : `${unidades} apartamentos`}`,
    `Escenario: ${escenario} · Año ${anio}${esEstimacion ? " (estimación)" : ""}`,
    `Ocupación: ${formatPercent(pnl.ocupacion, 0)} · ADR: ${formatCOP(pnl.adr)}`,
    ``,
    `Inversión total: ${formatCOP(metricas.inversionTotal)}`,
    `Ingresos anuales: ${formatCOP(metricas.ingresosTotal)}`,
    `EBITDA anual: ${formatCOP(metricas.ebitdaTotal)} (margen ${formatPercent(metricas.margenEbitda)})`,
    `Utilidad neta anual: ${formatCOP(metricas.utilidadNetaTotal)}`,
    `Utilidad neta mensual: ${formatCOP(metricas.utilidadNetaTotal / 12)}`,
    `ROI anual: ${formatPercent(metricas.roiSobreInversionTotal)}`,
    `Recuperación de la inversión: ${formatAnios(metricas.paybackAnios)}`,
    ``,
    `Cifras estimadas del modelo financiero por unidad. No constituyen garantía de rentabilidad.`,
  ].join("\n");
}

export function CtaSimulador({
  escenario,
  anio,
  unidades,
  pnl,
  metricas,
  tasaCambio,
  esEstimacion,
}: {
  escenario: string;
  anio: number;
  unidades: number;
  pnl: PnLBreakdown;
  metricas: ReturnMetrics;
  tasaCambio: number;
  esEstimacion: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const resumen = construirResumen({ escenario, anio, unidades, pnl, metricas, esEstimacion });

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, simulé mi inversión en Invictus y me interesa recibir asesoría.\n\n${resumen}`,
  );

  async function copiar() {
    try {
      await navigator.clipboard.writeText(resumen);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin permiso de portapapeles: no hay nada que hacer más que no romper.
      setCopiado(false);
    }
  }

  /** Genera el PDF (vectorial, con color) en el navegador y descarga el archivo. */
  async function descargarPdf() {
    if (generandoPdf) return;
    setGenerandoPdf(true);
    try {
      const [{ pdf }, { ReporteDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/Simulator/pdf/ReporteDocument"),
      ]);
      const blob = await pdf(
        <ReporteDocument
          escenario={escenario}
          anio={anio}
          unidades={unidades}
          pnl={pnl}
          metricas={metricas}
          tasaCambio={tasaCambio}
          esEstimacion={esEstimacion}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `invictus-simulacion-${slug(escenario)}-anio-${anio}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGenerandoPdf(false);
    }
  }

  return (
    <section
      id="contacto"
      className="no-imprimir scroll-mt-20 overflow-hidden rounded-3xl bg-navy-900 p-6 text-white sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h3 className="titular text-2xl sm:text-3xl">
            ¿Listo para invertir en tu apartamento Invictus?
          </h3>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/70">
            Llévate esta simulación y compártela con nuestro equipo. Un asesor de GEHsuites la revisa
            contigo, ajusta los supuestos a tu caso y te muestra la disponibilidad real de unidades.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={descargarPdf}
            disabled={generandoPdf}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-70"
          >
            {generandoPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FileDown className="h-4 w-4" aria-hidden />
            )}
            {generandoPdf ? "Generando…" : "Descargar PDF"}
          </button>

          <button
            type="button"
            onClick={copiar}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {copiado ? (
              <>
                <Check className="h-4 w-4 text-verde-500" aria-hidden />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden />
                Copiar resumen
              </>
            )}
          </button>

          <a
            href={`https://wa.me/${WHATSAPP_ASESOR}?text=${mensajeWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-verde-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-verde-500/20 transition hover:bg-verde-700"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Solicitar asesoría
          </a>
        </div>
      </div>

      <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/45">
        «Descargar PDF» genera y descarga directamente el archivo con los indicadores financieros y el
        estado de resultados de esta simulación. El resumen copiado incluye escenario, supuestos y
        resultados.
      </p>
    </section>
  );
}
