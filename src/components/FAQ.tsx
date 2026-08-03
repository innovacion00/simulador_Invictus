import { ChevronDown } from "lucide-react";

import {
  DIAS_COMERCIALIZAR,
  DIAS_GOCE_PROPIETARIO,
  ESCENARIOS,
  PORCENTAJES,
  PRECIO_INMUEBLE,
  PRECIO_UNIDAD,
  VALOR_AMUEBLAMIENTO,
} from "@/lib/finance/constants";
import { formatAnios, formatCOP, formatPercent } from "@/lib/finance/formatters";
import { Reveal } from "@/components/ui/Reveal";

const { pesimista, conservador } = ESCENARIOS;

const PREGUNTAS: { pregunta: string; respuesta: React.ReactNode }[] = [
  {
    pregunta: "¿Qué cubre exactamente el fee de GEHsuites?",
    respuesta: (
      <>
        El <strong>Fee Operador Comercial</strong> ({formatPercent(PORCENTAJES.feeOperadorGEH, 0)} de
        las ventas) cubre la operación comercial completa: estrategia de tarifas, revenue
        management, conexión y gestión de canales, atención al huésped y estándar de marca. Aparte
        se cobra un <strong>fee de administración</strong> fijo de {formatCOP(300_000)} mensuales por
        la administración del inmueble. Ambos ya están descontados en todas las cifras del
        simulador.
      </>
    ),
  },
  {
    pregunta: "¿Qué es el FARA y por qué me lo descuentan?",
    respuesta: (
      <>
        El FARA es el <strong>Fondo de Reposición y Reparación de Activos</strong>:{" "}
        {formatPercent(PORCENTAJES.fara, 0)} de las ventas que se reserva para renovar dotación y
        mantener el apartamento en estándar hotelero. No es un honorario para el operador — es tu
        propio dinero apartado para que, cuando el amueblamiento cumpla su vida útil de 10 años, no
        tengas que hacer un aporte extraordinario. Protege el valor de reventa del activo.
      </>
    ),
  },
  {
    pregunta: "¿Cómo se calculan el ROI y la recuperación de la inversión?",
    respuesta: (
      <>
        <strong>ROI anual</strong> = utilidad neta del año ÷ inversión total por unidad (
        {formatCOP(PRECIO_UNIDAD)}). En escenario conservador:{" "}
        {formatCOP(conservador.pnl.utilidadNeta)} ÷ {formatCOP(PRECIO_UNIDAD)} ={" "}
        {formatPercent(conservador.metricas.roiSobreInversionTotal)}.
        <br />
        <br />
        <strong>Recuperación (payback)</strong> = inversión total ÷ flujo de caja libre anual, es
        decir {formatCOP(PRECIO_UNIDAD)} ÷ {formatCOP(conservador.pnl.flujoCajaLibre)} ={" "}
        {formatAnios(conservador.metricas.paybackAnios)}. Es un cálculo conservador: asume que la
        utilidad se mantiene plana, sin el crecimiento anual de tarifa del 5% que contempla el
        modelo.
      </>
    ),
  },
  {
    pregunta: "¿Qué pasa si la ocupación queda baja?",
    respuesta: (
      <>
        Es justamente lo que muestra el <strong>escenario pesimista</strong>, y lo dejamos siempre
        visible en el simulador. Con {formatPercent(pesimista.ocupacion, 0)} de ocupación el modelo
        entrega {formatCOP(pesimista.pnl.utilidadNeta)} de utilidad neta anual por apartamento —{" "}
        {formatPercent(pesimista.metricas.roiSobreInversionTotal)} de rentabilidad, con recuperación
        en {formatAnios(pesimista.metricas.paybackAnios)}. El margen EBITDA se mantiene en{" "}
        {formatPercent(pesimista.pnl.margenEbitda)} porque buena parte de la estructura de costos es
        variable: si baja la venta, bajan también las comisiones, el FARA y el fee del operador.
      </>
    ),
  },
  {
    pregunta: `¿Cómo funcionan los ${DIAS_GOCE_PROPIETARIO} días de goce del propietario?`,
    respuesta: (
      <>
        De los 365 días del año, el modelo reserva {DIAS_GOCE_PROPIETARIO} para uso del propietario
        y comercializa los {DIAS_COMERCIALIZAR} restantes. Ese uso ya está contemplado dentro de los
        escenarios: cuando el simulador dice{" "}
        {formatPercent(conservador.ocupacion, 0)} de ocupación, está midiendo sobre la base de 365
        días, con los días de goce ya considerados en el modelo comercial.
      </>
    ),
  },
  {
    pregunta: "¿Qué incluye el precio de la unidad?",
    respuesta: (
      <>
        La inversión total por apartamento es {formatCOP(PRECIO_UNIDAD)}: {formatCOP(PRECIO_INMUEBLE)}{" "}
        del inmueble más {formatCOP(VALOR_AMUEBLAMIENTO)} de amueblamiento y dotación completa. Sale
        listo para operar — no hay una inversión adicional para poder recibir al primer huésped.
      </>
    ),
  },
  {
    pregunta: "¿Por qué el impuesto de renta aparece en cero?",
    respuesta: (
      <>
        El modelo contempla una tarifa del <strong>35% sobre (EBITDA − depreciación)</strong>, pero
        la versión vigente la aplica en 0% junto con una depreciación en cero, por lo que la utilidad
        neta iguala al EBITDA. La tarifa está dejada como parámetro configurable del modelo: si tu
        estructura tributaria la hace aplicable, se activa y todas las cifras se recalculan. Consulta
        tu situación fiscal particular con tu asesor tributario.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="titular text-3xl text-navy-900 sm:text-[2.6rem]">
            Preguntas frecuentes
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            Las que hace todo inversionista antes de firmar.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-10 space-y-3">
          {PREGUNTAS.map((item) => (
            <details
              key={item.pregunta}
              className="group rounded-2xl border border-line bg-sand-50 transition-colors open:bg-white open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-semibold text-navy-900">{item.pregunta}</h3>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-line px-5 pb-5 pt-4 text-sm leading-relaxed text-ink-600">
                {item.respuesta}
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
