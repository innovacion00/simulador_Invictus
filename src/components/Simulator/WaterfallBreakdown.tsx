"use client";

import { Waves } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { formatMoneda, formatPercent } from "@/lib/finance/formatters";
import type { Moneda, PnLBreakdown } from "@/lib/types";

type Tipo = "entrada" | "salida" | "total";

interface Paso {
  id: string;
  label: string;
  valor: number;
  tipo: Tipo;
  /** Inicio y fin del segmento en la escala 0 → ingresos totales. */
  desde: number;
  hasta: number;
}

const COLOR: Record<Tipo, string> = {
  entrada: "var(--color-flujo-entrada)",
  salida: "var(--color-flujo-salida)",
  total: "var(--color-flujo-total)",
};

/**
 * Construye la cascada Ingresos → … → Utilidad Neta.
 * Cada gasto arranca donde termina el saldo acumulado, de modo que la caída
 * se lee como un tramo del total y no como una barra suelta.
 */
function construirPasos(pnl: PnLBreakdown): Paso[] {
  const pasos: Paso[] = [];
  const ingresos = pnl.ingresos.total;

  pasos.push({
    id: "ingresos",
    label: "Total ingresos",
    valor: ingresos,
    tipo: "entrada",
    desde: 0,
    hasta: ingresos,
  });

  let saldo = ingresos;
  const deducciones: [string, string, number][] = [
    ["costosDirectos", "Costos directos", pnl.costosDirectos.total],
    ["serviciosPublicos", "Servicios públicos", pnl.serviciosPublicos.total],
    ["gastosVarios", "Gastos varios", pnl.gastosVarios.total],
    ["otrosFijos", "Otros gastos fijos", pnl.otrosFijos.total],
  ];

  for (const [id, label, valor] of deducciones) {
    pasos.push({ id, label, valor: -valor, tipo: "salida", desde: saldo - valor, hasta: saldo });
    saldo -= valor;
  }

  pasos.push({ id: "ebitda", label: "EBITDA", valor: saldo, tipo: "total", desde: 0, hasta: saldo });

  if (pnl.depreciacion > 0) {
    pasos.push({
      id: "depreciacion",
      label: "Depreciación amueblamiento",
      valor: -pnl.depreciacion,
      tipo: "salida",
      desde: saldo - pnl.depreciacion,
      hasta: saldo,
    });
    saldo -= pnl.depreciacion;
  }

  pasos.push({
    id: "impuesto",
    label: "Impuesto de renta",
    valor: -pnl.impuestoRenta,
    tipo: "salida",
    desde: saldo - pnl.impuestoRenta,
    hasta: saldo,
  });
  saldo -= pnl.impuestoRenta;

  pasos.push({
    id: "utilidadNeta",
    label: "Utilidad neta",
    valor: saldo,
    tipo: "total",
    desde: 0,
    hasta: saldo,
  });

  return pasos;
}

export function WaterfallBreakdown({
  pnl,
  unidades,
  moneda,
  tasaCambio,
}: {
  pnl: PnLBreakdown;
  unidades: number;
  moneda: Moneda;
  tasaCambio: number;
}) {
  const pasos = construirPasos(pnl);
  const escala = pnl.ingresos.total || 1;

  const mostrar = (v: number) => formatMoneda(Math.abs(v) * unidades, moneda, tasaCambio);

  return (
    <Panel
      titulo="De los ingresos a tu utilidad"
      subtitulo={`Cascada anual para ${unidades === 1 ? "1 apartamento" : `${unidades} apartamentos`}. Cada tramo se descuenta del saldo anterior.`}
      icono={Waves}
      id="cascada"
    >
      {/* Leyenda: la identidad nunca depende sólo del color. */}
      <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-600">
        {(
          [
            ["entrada", "Ingreso"],
            ["salida", "Costo / gasto"],
            ["total", "Resultado"],
          ] as [Tipo, string][]
        ).map(([tipo, label]) => (
          <li key={tipo} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: COLOR[tipo] }}
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>

      <ol className="space-y-3">
        {pasos.map((paso) => {
          const ancho = Math.abs(paso.hasta - paso.desde) / escala;
          // Un tramo de valor cero no se dibuja, pero la fila se mantiene:
          // ver "Impuesto de renta $0" es parte de la transparencia del modelo.
          const anchoPct = paso.valor === 0 ? 0 : Math.max(ancho * 100, 0.6);
          const izquierdaPct = (Math.min(paso.desde, paso.hasta) / escala) * 100;
          const esTotal = paso.tipo === "total";
          const pctIngresos = paso.valor / escala;

          return (
            <li key={paso.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className={esTotal ? "text-sm font-semibold text-navy-900" : "text-sm text-ink-600"}>
                  {paso.label}
                </span>
                <span className="flex shrink-0 items-baseline gap-2">
                  <span className="cifra-tabular text-[11px] text-ink-400">
                    {formatPercent(Math.abs(pctIngresos), 1)}
                  </span>
                  <span
                    className={`cifra-tabular text-sm ${
                      esTotal ? "font-semibold text-navy-900" : "text-ink-700"
                    }`}
                  >
                    {paso.valor < 0 ? "−" : ""}
                    {mostrar(paso.valor)}
                  </span>
                </span>
              </div>

              <div className="relative mt-1.5 h-3 w-full overflow-hidden rounded-full bg-sand-100">
                {anchoPct > 0 && (
                  <div
                    className="absolute inset-y-0 transition-all duration-500 ease-out"
                    style={{
                      left: `${izquierdaPct}%`,
                      width: `${anchoPct}%`,
                      backgroundColor: COLOR[paso.tipo],
                      // Los totales nacen en la línea base (extremo izquierdo recto);
                      // los tramos intermedios flotan y se redondean por ambos lados.
                      borderRadius: esTotal ? "0 4px 4px 0" : "4px",
                    }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 border-t border-line pt-3 text-[11px] leading-relaxed text-ink-400">
        Margen EBITDA <strong className="text-ink-700">{formatPercent(pnl.margenEbitda)}</strong> ·
        Margen neto <strong className="text-ink-700">{formatPercent(pnl.margenNeto)}</strong>. Los
        porcentajes de cada fila se calculan sobre el total de ingresos.
      </p>
    </Panel>
  );
}
