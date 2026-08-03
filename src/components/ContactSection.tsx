import { Check } from "lucide-react";

import { ContactForm } from "@/components/ContactForm";
import { ESCENARIOS, TOTAL_UNIDADES } from "@/lib/finance/constants";
import { formatAnios, formatCOP, formatPercent } from "@/lib/finance/formatters";
import { Reveal } from "@/components/ui/Reveal";

const conservador = ESCENARIOS.conservador;

const PUNTOS = [
  `Utilidad neta de ${formatCOP(conservador.pnl.utilidadNeta)} al año por apartamento en escenario conservador`,
  `${formatPercent(conservador.metricas.roiSobreInversionTotal)} de rentabilidad anual sobre la inversión total`,
  `Recuperación de la inversión en ${formatAnios(conservador.metricas.paybackAnios)}`,
  `Operación profesional de las ${TOTAL_UNIDADES} unidades a cargo de GEHsuites`,
];

export function ContactSection() {
  return (
    <section id="contacto" className="scroll-mt-20 bg-sand-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-xl shadow-navy-900/10">
          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* --- Argumento --- */}
            <Reveal className="bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-white sm:p-10">
              <h2 className="titular text-3xl sm:text-[2.6rem]">
                Da el siguiente paso
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">
                Un asesor de GEHsuites te acompaña a revisar el modelo financiero completo, la
                disponibilidad de unidades y el plan de pagos que se ajuste a ti.
              </p>

              <ul className="mt-8 space-y-3.5">
                {PUNTOS.map((punto) => (
                  <li key={punto} className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-verde-500/25">
                      <Check className="h-3 w-3 text-verde-100" aria-hidden />
                    </span>
                    {punto}
                  </li>
                ))}
              </ul>

              <p className="mt-8 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/50">
                Las cifras corresponden al Año 1 del modelo financiero por unidad y no constituyen
                garantía de rentabilidad.
              </p>
            </Reveal>

            {/* --- Formulario --- */}
            <Reveal delay={100} className="p-8 sm:p-10">
              <h3 className="text-lg font-semibold text-navy-900">Déjanos tus datos</h3>
              <p className="mt-1 mb-6 text-sm text-ink-600">
                Te contactamos en menos de 24 horas hábiles.
              </p>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
