import { Banknote, Globe2, Handshake, Wrench } from "lucide-react";

import {
  ESCENARIOS,
  FEE_ADMINISTRACION_MENSUAL,
  PORCENTAJES,
} from "@/lib/finance/constants";
import { formatCOP, formatPercent } from "@/lib/finance/formatters";
import { Reveal } from "@/components/ui/Reveal";

const conservador = ESCENARIOS.conservador;

/** Cada bloque nombra el cargo, cuánto es y qué recibe el propietario a cambio. */
const BLOQUES = [
  {
    icon: Handshake,
    titulo: "Fee Operador Comercial GEHsuites",
    cuanto: formatPercent(PORCENTAJES.feeOperadorGEH, 0) + " de las ventas",
    equivalente: conservador.pnl.gastosVarios.lines.find((l) => l.id === "feeOperadorGEH")?.value ?? 0,
    texto:
      "Es el honorario del operador por poner a producir tu apartamento: estrategia comercial, revenue management, atención al huésped y estándar de marca. Se cobra sobre lo que efectivamente se vende — si no hay venta, no hay fee.",
  },
  {
    icon: Banknote,
    titulo: "Fee de administración",
    cuanto: formatCOP(FEE_ADMINISTRACION_MENSUAL) + " al mes",
    equivalente: FEE_ADMINISTRACION_MENSUAL * 12,
    texto:
      "Cargo fijo mensual por la administración del inmueble dentro de la operación. Es el único componente del modelo que no depende de las ventas.",
  },
  {
    icon: Globe2,
    titulo: "Comisión de canales",
    cuanto: formatPercent(PORCENTAJES.comisionCanales, 0) + " de las ventas",
    equivalente: conservador.pnl.costosDirectos.lines.find((l) => l.id === "comisionCanales")?.value ?? 0,
    texto:
      "Lo que cobran Booking, Airbnb, agencias y los más de 20 canales conectados. No lo cobra GEHsuites: es el costo de estar donde el huésped busca.",
  },
  {
    icon: Wrench,
    titulo: "FARA — fondo de reposición",
    cuanto: formatPercent(PORCENTAJES.fara, 0) + " de las ventas",
    equivalente: conservador.pnl.costosDirectos.lines.find((l) => l.id === "fara")?.value ?? 0,
    texto:
      "No es un gasto que se pierda: es tu propio dinero reservado para reponer dotación y mantener el apartamento en estándar. Protege el valor del activo que compraste.",
  },
];

export function GEHSuitesFeeExplainer() {
  return (
    <section id="modelo-gehsuites" className="scroll-mt-20 bg-navy-900 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-caribe-300">
            Modelo de comercialización
          </span>
          <h2 className="titular mt-4 text-3xl sm:text-[2.6rem]">
            Cómo cobra GEHsuites
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            Todo lo que sigue ya está descontado en las cifras del simulador. Lo explicamos aquí
            porque un inversionista tiene derecho a saber exactamente por qué paga.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {BLOQUES.map((bloque, i) => (
            <Reveal as="li" key={bloque.titulo} delay={i * 70}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-caribe-500/20">
                    <bloque.icon className="h-5 w-5 text-caribe-300" aria-hidden />
                  </span>
                  <span className="cifra-tabular rounded-full bg-gold-300/15 px-3 py-1 text-xs font-semibold text-gold-300">
                    {bloque.cuanto}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-semibold">{bloque.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{bloque.texto}</p>

                <p className="cifra-tabular mt-4 border-t border-white/10 pt-3 text-xs text-white/55">
                  En escenario conservador equivale a{" "}
                  <strong className="font-semibold text-white/90">
                    {formatCOP(bloque.equivalente)}
                  </strong>{" "}
                  al año por apartamento.
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={200}>
          <p className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm leading-relaxed text-white/70">
            Suma total de costos y gastos en escenario conservador:{" "}
            <strong className="cifra-tabular font-semibold text-white">
              {formatCOP(
                conservador.pnl.costosDirectos.total +
                  conservador.pnl.serviciosPublicos.total +
                  conservador.pnl.gastosVarios.total +
                  conservador.pnl.otrosFijos.total,
              )}
            </strong>{" "}
            sobre ingresos de{" "}
            <strong className="cifra-tabular font-semibold text-white">
              {formatCOP(conservador.pnl.ingresos.total)}
            </strong>
            . Lo que queda —{" "}
            <strong className="cifra-tabular font-semibold text-gold-300">
              {formatCOP(conservador.pnl.utilidadNeta)}
            </strong>{" "}
            — es tuyo.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
