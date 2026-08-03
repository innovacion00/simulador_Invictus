"use client";

import { useCallback, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { AvisoLegal } from "@/components/Simulator/AvisoLegal";
import { ComparadorEscenarios } from "@/components/Simulator/ComparadorEscenarios";
import { CtaSimulador } from "@/components/Simulator/CtaSimulador";
import { GraficasSimulacion } from "@/components/Simulator/GraficasSimulacion";
import { MetodologiaCalculo } from "@/components/Simulator/MetodologiaCalculo";
import { ParametrosPanel } from "@/components/Simulator/ParametrosPanel";
import { ProyeccionRentabilidad } from "@/components/Simulator/ProyeccionRentabilidad";
import { TablaFinanciera } from "@/components/Simulator/TablaFinanciera";
import {
  ESTADO_INICIAL,
  nombreEscenario,
  type Actualizar,
  type EstadoSimulador,
} from "@/components/Simulator/estado";
import { simular } from "@/lib/finance/engine";
import type { SimulatorInputs } from "@/lib/types";

export function Simulator() {
  const [estado, setEstado] = useState<EstadoSimulador>(ESTADO_INICIAL);

  const actualizar = useCallback<Actualizar>(
    (parcial) => setEstado((prev) => ({ ...prev, ...parcial })),
    [],
  );

  // Recálculo reactivo: no hay botón "calcular". La moneda y la tasa de cambio
  // no entran al motor — sólo cambian cómo se presentan las cifras.
  const resultados = useMemo(() => {
    const inputs: SimulatorInputs = {
      escenario: estado.escenario,
      unidades: estado.unidades,
      horizonte: "anual",
      anio: estado.anio,
      modoPersonalizado: estado.modoPersonalizado,
      ocupacionCustom: estado.ocupacionCustom,
      adrCustom: estado.adrCustom,
      avanzados: estado.avanzados,
    };
    return simular(inputs);
  }, [
    estado.escenario,
    estado.unidades,
    estado.anio,
    estado.modoPersonalizado,
    estado.ocupacionCustom,
    estado.adrCustom,
    estado.avanzados,
  ]);

  const etiquetaEscenario = nombreEscenario(estado);

  return (
    <section id="simulador" className="scroll-mt-20 bg-sand-50 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-caribe-50 px-3 py-1 text-xs font-semibold text-caribe-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Modelo financiero real, por unidad
          </span>
          <h2 className="titular mt-4 text-3xl text-navy-900 sm:text-[2.6rem]">
            Simulador de rentabilidad
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            Proyecta los ingresos por renta hotelera, los costos operativos y la rentabilidad
            estimada —mensual y anual— de tu inversión en Invictus, con el modelo financiero real
            operado por GEHsuites.
          </p>
        </header>

        <div className="mt-10 space-y-5">
          <ParametrosPanel estado={estado} actualizar={actualizar} />

          <ProyeccionRentabilidad
            pnl={resultados.pnl}
            metricas={resultados.metricas}
            moneda={estado.moneda}
            tasaCambio={estado.tasaCambio}
            escenario={etiquetaEscenario}
            anio={estado.anio}
            esEstimacion={resultados.esEstimacion}
          />

          <TablaFinanciera
            pnl={resultados.pnl}
            metricas={resultados.metricas}
            tasaCambio={estado.tasaCambio}
            unidades={estado.unidades}
          />

          <ComparadorEscenarios
            unidades={estado.unidades}
            moneda={estado.moneda}
            tasaCambio={estado.tasaCambio}
            escenarioActivo={estado.escenario}
            modoPersonalizado={estado.modoPersonalizado}
          />

          <GraficasSimulacion
            pnl={resultados.pnl}
            metricas={resultados.metricas}
            moneda={estado.moneda}
            tasaCambio={estado.tasaCambio}
            unidades={estado.unidades}
          />

          <MetodologiaCalculo />

          <AvisoLegal />

          <CtaSimulador
            escenario={etiquetaEscenario}
            anio={estado.anio}
            unidades={estado.unidades}
            pnl={resultados.pnl}
            metricas={resultados.metricas}
            tasaCambio={estado.tasaCambio}
            esEstimacion={resultados.esEstimacion}
          />
        </div>
      </div>
    </section>
  );
}
