"use client";

import { ChevronDown, Minus, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";

import { CampoParametro, GrupoOpciones, Panel } from "@/components/ui/Panel";
import {
  ADR_PRESETS,
  DIAS_CALENDARIO,
  DIAS_GOCE_PROPIETARIO,
  ESCENARIOS,
  MAX_ANIO_PROYECCION,
  MAX_UNIDADES_SIMULADOR,
  ORDEN_ESCENARIOS,
  RANGO_ADR,
  RANGO_OCUPACION,
  RANGO_TASA_CAMBIO,
  TIPOLOGIA,
  VALOR_AMUEBLAMIENTO,
} from "@/lib/finance/constants";
import { AVANZADOS_POR_DEFECTO, DEPRECIACION_LINEAL } from "@/lib/finance/engine";
import { formatCOP, formatPercent, formatUSD } from "@/lib/finance/formatters";
import type { Actualizar, EstadoSimulador } from "@/components/Simulator/estado";
import { parametrosEfectivos } from "@/components/Simulator/estado";
import type { Moneda } from "@/lib/types";

const claseInput =
  "w-full rounded-xl border border-line bg-sand-50 px-3.5 py-2.5 text-sm text-ink-900 transition focus:border-caribe-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-caribe-500/20";

/** Valor 0–1 de ocupación seleccionado, o `null` si está en personalizado. */
type OcupacionOpcion = string;

export function ParametrosPanel({
  estado,
  actualizar,
}: {
  estado: EstadoSimulador;
  actualizar: Actualizar;
}) {
  const { ocupacion, adr } = parametrosEfectivos(estado);
  const avanzadosTocados =
    estado.avanzados.precioUnidad !== AVANZADOS_POR_DEFECTO.precioUnidad ||
    estado.avanzados.tarifaImpuestoRenta !== AVANZADOS_POR_DEFECTO.tarifaImpuestoRenta ||
    estado.avanzados.depreciacionAnual !== AVANZADOS_POR_DEFECTO.depreciacionAnual ||
    estado.avanzados.diasBase !== AVANZADOS_POR_DEFECTO.diasBase;

  /* --- Ocupación: 3 escenarios oficiales + personalizado --------- */
  const opcionesOcupacion: { valor: OcupacionOpcion; label: string; sub: string }[] = [
    ...ORDEN_ESCENARIOS.map((k) => ({
      valor: k as OcupacionOpcion,
      label: ESCENARIOS[k].label,
      sub: formatPercent(ESCENARIOS[k].ocupacion, 0),
    })),
    { valor: "personalizado", label: "Personalizado", sub: "Tú eliges" },
  ];

  const ocupacionSeleccionada: OcupacionOpcion = estado.modoPersonalizado
    ? "personalizado"
    : estado.escenario;

  const cambiarOcupacion = (v: OcupacionOpcion) => {
    if (v === "personalizado") {
      // Al entrar en personalizado se arranca desde el escenario visible,
      // para que el cambio se sienta continuo.
      actualizar({
        modoPersonalizado: true,
        ocupacionCustom: ocupacion,
        adrCustom: adr,
      });
    } else {
      actualizar({ modoPersonalizado: false, escenario: v as EstadoSimulador["escenario"] });
    }
  };

  const fijarUnidades = (n: number) =>
    actualizar({ unidades: Math.min(MAX_UNIDADES_SIMULADOR, Math.max(1, n)) });

  return (
    <Panel
      titulo="Parámetros de la simulación"
      subtitulo="Ajusta cualquier control y las cifras se recalculan al instante."
      icono={SlidersHorizontal}
      id="parametros"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* --- Tipología ------------------------------------------- */}
        <CampoParametro label="Tipología" ayuda={`Proyecto de operador único · ${TIPOLOGIA}.`}>
          <div className={`${claseInput} flex items-center justify-between bg-sand-100`}>
            <span className="font-medium">{TIPOLOGIA}</span>
            <span className="text-xs text-ink-400">Única</span>
          </div>
        </CampoParametro>

        {/* --- N° de apartamentos ---------------------------------- */}
        <CampoParametro
          label="Apartamentos a invertir"
          htmlFor="unidades"
          ayuda={`Inversión total: ${formatCOP(estado.unidades * estado.avanzados.precioUnidad)}`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fijarUnidades(estado.unidades - 1)}
              disabled={estado.unidades <= 1}
              aria-label="Quitar un apartamento"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-navy-900 transition hover:border-caribe-500 hover:text-caribe-600 disabled:opacity-35"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>

            <input
              id="unidades"
              type="range"
              className="slider-invictus flex-1"
              min={1}
              max={MAX_UNIDADES_SIMULADOR}
              step={1}
              value={estado.unidades}
              onChange={(e) => fijarUnidades(Number(e.target.value))}
              aria-valuetext={`${estado.unidades} ${estado.unidades === 1 ? "apartamento" : "apartamentos"}`}
            />

            <button
              type="button"
              onClick={() => fijarUnidades(estado.unidades + 1)}
              disabled={estado.unidades >= MAX_UNIDADES_SIMULADOR}
              aria-label="Agregar un apartamento"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-navy-900 transition hover:border-caribe-500 hover:text-caribe-600 disabled:opacity-35"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>

            <output
              htmlFor="unidades"
              className="cifra-tabular flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-lg font-semibold text-white"
            >
              {estado.unidades}
            </output>
          </div>
        </CampoParametro>

        {/* --- Moneda de visualización ------------------------------ */}
        <CampoParametro
          label="Moneda de visualización"
          ayuda="El modelo siempre calcula en COP; el dólar es una conversión de lectura."
        >
          <GrupoOpciones<Moneda>
            etiquetaGrupo="Moneda de visualización"
            opciones={[
              { valor: "COP", label: "COP" },
              { valor: "USD", label: "USD" },
            ]}
            valor={estado.moneda}
            onChange={(m) => actualizar({ moneda: m })}
          />
        </CampoParametro>

        {/* --- Tasa de cambio -------------------------------------- */}
        <CampoParametro
          label="Tasa de cambio (COP por USD)"
          htmlFor="tasa"
          ayuda={
            estado.moneda === "USD"
              ? `Digite la tasa vigente o de referencia. Hoy: ${formatCOP(estado.avanzados.precioUnidad)} = ${formatUSD(estado.avanzados.precioUnidad / estado.tasaCambio)}.`
              : "Se usa sólo si cambias la moneda de visualización a USD."
          }
        >
          <input
            id="tasa"
            type="number"
            className={`${claseInput} cifra-tabular`}
            min={RANGO_TASA_CAMBIO.min}
            max={RANGO_TASA_CAMBIO.max}
            step={RANGO_TASA_CAMBIO.step}
            value={estado.tasaCambio}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v > 0) actualizar({ tasaCambio: v });
            }}
          />
        </CampoParametro>

        {/* --- Ocupación ------------------------------------------- */}
        <CampoParametro
          label="Ocupación estimada"
          ayuda={
            estado.modoPersonalizado
              ? "Estimación propia: no forma parte del modelo oficial."
              : `Escenario ${ESCENARIOS[estado.escenario].label} del modelo financiero.`
          }
          className="md:col-span-2"
        >
          <GrupoOpciones<OcupacionOpcion>
            etiquetaGrupo="Ocupación estimada"
            opciones={opcionesOcupacion}
            valor={ocupacionSeleccionada}
            onChange={cambiarOcupacion}
            columnas="grid-cols-2 sm:grid-cols-4"
          />
        </CampoParametro>

        {/* --- Controles del modo personalizado --------------------- */}
        {estado.modoPersonalizado ? (
          <>
            <CampoParametro
              label="% de ocupación"
              htmlFor="ocupacion-custom"
              ayuda={`Equivale a ${Math.round(estado.ocupacionCustom * estado.avanzados.diasBase)} noches vendidas al año.`}
            >
              <div className="flex items-center gap-3">
                <input
                  id="ocupacion-custom"
                  type="range"
                  className="slider-invictus"
                  min={RANGO_OCUPACION.min}
                  max={RANGO_OCUPACION.max}
                  step={RANGO_OCUPACION.step}
                  value={estado.ocupacionCustom}
                  onChange={(e) => actualizar({ ocupacionCustom: Number(e.target.value) })}
                  aria-valuetext={formatPercent(estado.ocupacionCustom, 0)}
                />
                <span className="cifra-tabular w-14 shrink-0 rounded-lg bg-sand-100 py-1.5 text-center text-sm font-semibold text-navy-900">
                  {formatPercent(estado.ocupacionCustom, 0)}
                </span>
              </div>
            </CampoParametro>

            <CampoParametro
              label="ADR — tarifa promedio por noche"
              htmlFor="adr-custom"
              ayuda="Elige un valor de referencia o ajusta con precisión en la barra."
            >
              <div className="flex items-center gap-3">
                <input
                  id="adr-custom"
                  type="range"
                  className="slider-invictus"
                  min={RANGO_ADR.min}
                  max={RANGO_ADR.max}
                  step={RANGO_ADR.step}
                  value={estado.adrCustom}
                  onChange={(e) => actualizar({ adrCustom: Number(e.target.value) })}
                  aria-valuetext={formatCOP(estado.adrCustom)}
                />
                <span className="cifra-tabular w-24 shrink-0 rounded-lg bg-sand-100 py-1.5 text-center text-sm font-semibold text-navy-900">
                  {formatCOP(estado.adrCustom)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {ADR_PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => actualizar({ adrCustom: v })}
                    aria-pressed={estado.adrCustom === v}
                    className={[
                      "cifra-tabular rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                      estado.adrCustom === v
                        ? "border-caribe-500 bg-caribe-50 text-caribe-700"
                        : "border-line bg-white text-ink-600 hover:border-caribe-300",
                    ].join(" ")}
                  >
                    {formatCOP(v)}
                  </button>
                ))}
              </div>
            </CampoParametro>
          </>
        ) : (
          <CampoParametro
            label="ADR — tarifa promedio por noche"
            ayuda={`Definida por el escenario ${ESCENARIOS[estado.escenario].label} (ajuste ${formatPercent(ESCENARIOS[estado.escenario].ajusteAdr, 0)} sobre la tarifa base).`}
            className="md:col-span-2"
          >
            <div className={`${claseInput} cifra-tabular flex items-center justify-between bg-sand-100`}>
              <span className="font-semibold text-navy-900">{formatCOP(adr)}</span>
              <span className="text-xs text-ink-400">
                × {formatPercent(ocupacion, 0)} × {estado.avanzados.diasBase} días
              </span>
            </div>
          </CampoParametro>
        )}

        {/* --- Año de proyección ------------------------------------ */}
        <CampoParametro
          label="Año de la proyección"
          ayuda={
            estado.anio === 1
              ? "El Año 1 es la fuente de verdad del modelo financiero."
              : "Proyección con crecimiento de tarifa e inflación del 5% anual."
          }
          className="md:col-span-2"
        >
          <GrupoOpciones<number>
            etiquetaGrupo="Año de la proyección"
            opciones={Array.from({ length: MAX_ANIO_PROYECCION }, (_, i) => ({
              valor: i + 1,
              label: `Año ${i + 1}`,
            }))}
            valor={estado.anio}
            onChange={(a) => actualizar({ anio: a })}
            columnas="grid-cols-5"
            size="compacto"
          />
        </CampoParametro>
      </div>

      {/* --- Parámetros avanzados ----------------------------------- */}
      <details className="group mt-5 rounded-2xl border border-line bg-sand-50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
            Parámetros avanzados de gastos e impuestos
            {avanzadosTocados && (
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-600">
                Modificado
              </span>
            )}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>

        <div className="border-t border-line p-4">
          <p className="mb-4 text-[11px] leading-relaxed text-ink-400">
            Estos valores vienen del modelo financiero. Si cambias alguno, el resultado deja de ser
            la cifra oficial y se marca como estimación.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <CampoParametro
              label="Valor de compra por unidad (COP)"
              htmlFor="precio-unidad"
              ayuda={`Inmueble + amueblamiento (${formatCOP(VALOR_AMUEBLAMIENTO)}). Base del ROI y del payback.`}
            >
              <input
                id="precio-unidad"
                type="number"
                className={`${claseInput} cifra-tabular bg-white`}
                min={100_000_000}
                step={10_000_000}
                value={estado.avanzados.precioUnidad}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v > 0) {
                    actualizar({ avanzados: { ...estado.avanzados, precioUnidad: v } });
                  }
                }}
              />
            </CampoParametro>

            <CampoParametro
              label="Días base de cálculo al año"
              htmlFor="dias-base"
              ayuda={`El modelo usa ${DIAS_CALENDARIO} días; los ${DIAS_GOCE_PROPIETARIO} días de goce del propietario ya están contemplados en el % de ocupación.`}
            >
              <input
                id="dias-base"
                type="number"
                className={`${claseInput} cifra-tabular bg-white`}
                min={1}
                max={365}
                step={1}
                value={estado.avanzados.diasBase}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v >= 1 && v <= 365) {
                    actualizar({ avanzados: { ...estado.avanzados, diasBase: v } });
                  }
                }}
              />
            </CampoParametro>

            <CampoParametro
              label="Impuesto de renta"
              ayuda="El modelo contempla 35% sobre (EBITDA − depreciación), aplicado hoy en 0%."
            >
              <GrupoOpciones<number>
                etiquetaGrupo="Tarifa de impuesto de renta"
                opciones={[
                  { valor: 0, label: "0%", sub: "Modelo" },
                  { valor: 0.35, label: "35%", sub: "Contemplado" },
                ]}
                valor={estado.avanzados.tarifaImpuestoRenta}
                onChange={(t) =>
                  actualizar({ avanzados: { ...estado.avanzados, tarifaImpuestoRenta: t } })
                }
              />
            </CampoParametro>

            <CampoParametro
              label="Depreciación del amueblamiento"
              ayuda={`Lineal a 10 años: ${formatCOP(DEPRECIACION_LINEAL)} al año.`}
            >
              <GrupoOpciones<number>
                etiquetaGrupo="Depreciación anual"
                opciones={[
                  { valor: 0, label: "Sin depreciar", sub: "Modelo" },
                  { valor: DEPRECIACION_LINEAL, label: "Lineal 10 años", sub: formatCOP(DEPRECIACION_LINEAL) },
                ]}
                valor={estado.avanzados.depreciacionAnual}
                onChange={(d) =>
                  actualizar({ avanzados: { ...estado.avanzados, depreciacionAnual: d } })
                }
              />
            </CampoParametro>
          </div>

          {avanzadosTocados && (
            <button
              type="button"
              onClick={() => actualizar({ avanzados: AVANZADOS_POR_DEFECTO })}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-caribe-700 underline underline-offset-4 hover:text-navy-900"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Restaurar los valores del modelo
            </button>
          )}
        </div>
      </details>
    </Panel>
  );
}
