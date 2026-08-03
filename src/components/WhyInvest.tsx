import {
  Building2,
  CalendarHeart,
  KeyRound,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import {
  DIAS_GOCE_PROPIETARIO,
  ESCENARIOS,
  PORCENTAJES,
  TOTAL_UNIDADES,
} from "@/lib/finance/constants";
import { formatPercent } from "@/lib/finance/formatters";
import { Reveal } from "@/components/ui/Reveal";

const RAZONES = [
  {
    icon: KeyRound,
    titulo: "Operador único: GEHsuites",
    texto:
      "Una sola marca opera las " +
      TOTAL_UNIDADES +
      " unidades. Sin propietarios compitiendo entre sí por el mismo huésped, sin tarifas canibalizadas y con una estrategia comercial coherente para todo el edificio.",
  },
  {
    icon: TrendingUp,
    titulo: "Margen EBITDA cercano al 50%",
    texto:
      "Los tres escenarios del modelo se mueven entre " +
      formatPercent(ESCENARIOS.pesimista.pnl.margenEbitda) +
      " y " +
      formatPercent(ESCENARIOS.optimista.pnl.margenEbitda) +
      " de margen EBITDA. Es un colchón amplio frente a variaciones de ocupación o de costos.",
  },
  {
    icon: ShieldCheck,
    titulo: "Rentable incluso en el peor escenario",
    texto:
      "Con apenas " +
      formatPercent(ESCENARIOS.pesimista.ocupacion, 0) +
      " de ocupación, el modelo sigue entregando " +
      formatPercent(ESCENARIOS.pesimista.metricas.roiSobreInversionTotal) +
      " anual. El escenario pesimista no es un escenario de pérdida.",
  },
  {
    icon: PiggyBank,
    titulo: "FARA: el activo se mantiene solo",
    texto:
      "Un " +
      formatPercent(PORCENTAJES.fara, 0) +
      " de las ventas va a un Fondo de Reposición y Reparación. La dotación se renueva con la operación, no con aportes extra del propietario.",
  },
  {
    icon: Building2,
    titulo: "Tecnología hotelera incluida",
    texto:
      "PMS, Channel Manager y conexión a Booking, Airbnb, web propia, agencias y más de 20 canales. Ya está dentro del modelo — no es un costo que aparezca después.",
  },
  {
    icon: CalendarHeart,
    titulo: DIAS_GOCE_PROPIETARIO + " días al año para ti",
    texto:
      "El modelo reserva " +
      DIAS_GOCE_PROPIETARIO +
      " días de goce del propietario. Es tu apartamento: lo disfrutas y el resto del año trabaja.",
  },
];

export function WhyInvest() {
  return (
    <section id="por-que-invictus" className="scroll-mt-20 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="titular text-3xl text-navy-900 sm:text-[2.6rem]">
            Por qué invertir en Invictus
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            No es un apartamento que esperas arrendar. Es una unidad productiva dentro de una
            operación hotelera profesional, con las cuentas abiertas desde el primer día.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RAZONES.map((razon, i) => (
            <Reveal as="li" key={razon.titulo} delay={i * 70}>
              <div className="h-full rounded-3xl border border-line bg-sand-50 p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-caribe-50">
                  <razon.icon className="h-5 w-5 text-caribe-700" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy-900">{razon.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{razon.texto}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
