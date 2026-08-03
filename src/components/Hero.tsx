import Image from "next/image";
import { ArrowDown, Building2, Hourglass, Palmtree, TrendingUp } from "lucide-react";

import { ESCENARIOS, TOTAL_UNIDADES } from "@/lib/finance/constants";
import { formatAnios, formatCOP, formatPercent } from "@/lib/finance/formatters";
import { Reveal } from "@/components/ui/Reveal";

const conservador = ESCENARIOS.conservador;

/** Chip con una métrica del escenario conservador, flotando sobre la foto. */
function ChipMetrica({
  icon: Icon,
  valor,
  etiqueta,
  className = "",
}: {
  icon: typeof TrendingUp;
  valor: string;
  etiqueta: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border border-line bg-white/95 px-3.5 py-2.5 shadow-lg shadow-navy-900/10 backdrop-blur-sm ${className}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-caribe-50">
        <Icon className="h-4 w-4 text-caribe-700" aria-hidden />
      </span>
      <span>
        <span className="cifra-tabular block text-sm font-semibold leading-tight text-navy-900">
          {valor}
        </span>
        <span className="block text-[10px] leading-tight text-ink-400">{etiqueta}</span>
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-sand-100 via-sand-50 to-sand-50 pt-28 pb-16 sm:pt-32 sm:pb-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        {/* --- Copy --- */}
        <Reveal>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-gold-100 px-3 py-1 text-xs font-semibold text-navy-900">
            <Palmtree className="h-3.5 w-3.5 text-gold-400" aria-hidden />
            {TOTAL_UNIDADES} apartamentos · operador único GEHsuites
          </span>

          <h1 className="titular mt-5 text-4xl leading-[1.06] text-navy-900 sm:text-5xl lg:text-[3.7rem]">
            Compra un apartamento.
            <br />
            <span className="text-caribe-700">Nosotros lo operamos</span> y tú recibes la utilidad.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
            Invictus es un proyecto de renta hotelera con un modelo financiero construido{" "}
            <strong className="text-navy-900">apartamento por apartamento</strong>. En el escenario
            conservador cada unidad genera{" "}
            <strong className="text-navy-900">{formatCOP(conservador.pnl.utilidadNeta)}</strong> de
            utilidad neta al año — una rentabilidad de{" "}
            <strong className="text-navy-900">
              {formatPercent(conservador.metricas.roiSobreInversionTotal)}
            </strong>{" "}
            y recuperación de la inversión en{" "}
            <strong className="text-navy-900">
              {formatAnios(conservador.metricas.paybackAnios)}
            </strong>
            .
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#simulador"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy-900 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-700 hover:shadow-xl"
            >
              Simula tu inversión
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#tabla"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line-strong bg-white px-6 py-3.5 text-base font-semibold text-navy-900 transition hover:border-caribe-500 hover:text-caribe-700"
            >
              Ver el desglose financiero
            </a>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink-400">
            Incluso en el escenario pesimista ({formatPercent(ESCENARIOS.pesimista.ocupacion, 0)} de
            ocupación) el modelo entrega{" "}
            {formatPercent(ESCENARIOS.pesimista.metricas.roiSobreInversionTotal)} anual. Puedes verlo
            tú mismo en el simulador.
          </p>
        </Reveal>

        {/* --- Visual --- */}
        <Reveal delay={120} className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white shadow-2xl shadow-navy-900/15">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/espacios-lujosos.jpg"
                alt="Espacios lujosos de Invictus con vista al mar"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Chips de métricas — desplazados fuera de la tarjeta en pantallas grandes. */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:absolute lg:-left-6 lg:-bottom-6 lg:mt-0 lg:flex lg:flex-col lg:gap-3">
            <ChipMetrica
              icon={TrendingUp}
              valor={formatPercent(conservador.metricas.roiSobreInversionTotal)}
              etiqueta="ROI anual · conservador"
            />
            <ChipMetrica
              icon={Hourglass}
              valor={formatAnios(conservador.metricas.paybackAnios)}
              etiqueta="Recuperación"
            />
            <ChipMetrica
              icon={Building2}
              valor={formatPercent(conservador.pnl.margenEbitda)}
              etiqueta="Margen EBITDA"
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
