import { Calculator } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import {
  DIAS_CALENDARIO,
  FEE_ADMINISTRACION_MENSUAL,
  PORCENTAJES,
  PRECIO_UNIDAD,
} from "@/lib/finance/constants";
import { formatCOP, formatPercent } from "@/lib/finance/formatters";

const PASOS: { titulo: string; formula?: string; texto: React.ReactNode }[] = [
  {
    titulo: "Ingresos por hospedaje",
    formula: `ADR × ${DIAS_CALENDARIO} días × % de ocupación`,
    texto: (
      <>
        La tarifa promedio por noche (ADR) multiplicada por los días base del año y por la ocupación
        proyectada del escenario. Es el único ingreso del modelo: no se cuentan ingresos no
        operacionales.
      </>
    ),
  },
  {
    titulo: "Costos comerciales",
    formula: `${formatPercent(PORCENTAJES.comisionCanales, 0)} canales + ${formatPercent(PORCENTAJES.fara, 0)} FARA + ${formatPercent(PORCENTAJES.costosOperacion, 0)} operación`,
    texto: (
      <>
        Se descuentan sobre las ventas brutas: la comisión de Booking, Airbnb, web propia, agencias y
        más de 20 canales; el aporte al FARA —el fondo que repone la dotación—; y los costos de
        operación. Se suma el fee de administración fijo de{" "}
        {formatCOP(FEE_ADMINISTRACION_MENSUAL)} mensuales.
      </>
    ),
  },
  {
    titulo: "Gastos operativos",
    formula: "Servicios públicos + gastos varios + fijos",
    texto: (
      <>
        Energía, agua, gas, internet, aseo, lavandería, gastos médicos, datáfonos, Sayco y Acinpro,
        y predial. Unos suben y bajan con la ocupación; otros son fijos todo el año.
      </>
    ),
  },
  {
    titulo: "Fee del operador",
    formula: `${formatPercent(PORCENTAJES.feeOperadorGEH, 0)} de las ventas`,
    texto: (
      <>
        El honorario de GEHsuites por la gestión hotelera completa: estrategia comercial, revenue
        management, canales, atención al huésped y estándar de marca. Se cobra sobre lo que
        efectivamente se vende.
      </>
    ),
  },
  {
    titulo: "Rentabilidad del propietario",
    formula: `Utilidad neta ÷ ${formatCOP(PRECIO_UNIDAD)}`,
    texto: (
      <>
        Lo que queda después de todo lo anterior es la utilidad neta del propietario. Dividida entre
        la inversión total por unidad da el ROI anual; y la inversión dividida entre el flujo de caja
        libre anual da los años de recuperación.
      </>
    ),
  },
];

export function MetodologiaCalculo() {
  return (
    <Panel
      titulo="¿Cómo se calcula la rentabilidad?"
      subtitulo="Los cinco pasos que van de una noche vendida a tu utilidad. Sin cajas negras."
      icono={Calculator}
      id="metodologia"
    >
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PASOS.map((paso, i) => (
          <li
            key={paso.titulo}
            className="rounded-2xl border border-line bg-sand-50 p-4 last:md:col-span-2 last:xl:col-span-1"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <h4 className="text-sm font-semibold text-navy-900">{paso.titulo}</h4>
            </div>

            {paso.formula && (
              <p className="cifra-tabular mt-3 rounded-lg bg-white px-3 py-2 text-[11px] font-medium text-caribe-700">
                {paso.formula}
              </p>
            )}

            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-600">{paso.texto}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
