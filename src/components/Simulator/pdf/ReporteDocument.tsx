import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { TIPOLOGIA } from "@/lib/finance/constants";
import { aUSD, formatCOP, formatPercent, formatUSD } from "@/lib/finance/formatters";
import type { PnLBreakdown, ReturnMetrics } from "@/lib/types";

/**
 * Genera el PDF de la simulación como documento real (vectorial, con color),
 * en vez de depender del diálogo de impresión del navegador. Se renderiza
 * bajo demanda desde `CtaSimulador` con `pdf(<ReporteDocument .../>).toBlob()`.
 */

const NAVY = "#0c2340";
const GOLD = "#c9a227";
const GOLD_DARK = "#a37c15";
const SAND = "#f6efe2";
const SAND_LINE = "#cfc4ae";
const BLUE = "#1c5cab";
const RED = "#c2603a";
const INK = "#0f1c28";
const INK_SOFT = "#8092a4";

// Fondos de fila translúcidos (no los de las barras de marca) para que la
// marca de agua se alcance a ver detrás de las tablas.
const ROW_WHITE = "rgba(255, 255, 255, 0.9)";
const ROW_SAND = "rgba(246, 239, 226, 0.9)";
const ROW_SAND_ALT = "rgba(251, 248, 241, 0.9)";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 8.5, color: INK, paddingBottom: 14 },
  marcaAgua: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.1,
  },
  header: { backgroundColor: NAVY, color: "#ffffff", paddingHorizontal: 28, paddingVertical: 14 },
  kicker: { fontSize: 8, letterSpacing: 1.4, color: GOLD, marginBottom: 4 },
  titulo: { fontSize: 17, fontFamily: "Helvetica-Bold" },
  subhead: {
    backgroundColor: SAND,
    paddingHorizontal: 28,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: SAND_LINE,
  },
  subheadLabel: { fontSize: 7, letterSpacing: 1, color: GOLD_DARK, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subheadValue: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: NAVY },
  body: { paddingHorizontal: 28, paddingTop: 12 },
  seccion: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    borderBottomWidth: 1.4,
    borderBottomColor: GOLD,
    paddingBottom: 4,
    marginBottom: 6,
    marginTop: 4,
  },
  disclaimer: { fontSize: 6.5, color: INK_SOFT, marginTop: 10, fontFamily: "Helvetica-Oblique" },
});

interface Celda {
  texto: string;
  width: `${number}%`;
  bold?: boolean;
  color?: string;
  align?: "left" | "right";
}

function FilaCabecera({ celdas, bg }: { celdas: Celda[]; bg: string }) {
  return (
    <View style={{ flexDirection: "row", backgroundColor: bg }}>
      {celdas.map((c, i) => (
        <Text
          key={i}
          style={{
            width: c.width,
            paddingVertical: 3.5,
            paddingHorizontal: 8,
            textAlign: c.align ?? "left",
            fontFamily: "Helvetica-Bold",
            color: c.color ?? "#ffffff",
            fontSize: 8,
          }}
        >
          {c.texto}
        </Text>
      ))}
    </View>
  );
}

function FilaTabla({ celdas, bg, borderTop }: { celdas: Celda[]; bg: string; borderTop?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: bg,
        borderTopWidth: borderTop ? 1 : 0,
        borderTopColor: SAND_LINE,
      }}
    >
      {celdas.map((c, i) => (
        <Text
          key={i}
          style={{
            width: c.width,
            paddingVertical: 3.5,
            paddingHorizontal: 8,
            textAlign: c.align ?? "left",
            fontFamily: c.bold ? "Helvetica-Bold" : "Helvetica",
            color: c.color ?? INK,
          }}
        >
          {c.texto}
        </Text>
      ))}
    </View>
  );
}

interface FilaIndicador {
  label: string;
  cop: number;
  pct?: number;
  estilo: "normal" | "utilidad" | "rentabilidad";
}

interface FilaEstado {
  concepto: string;
  mensual: number | null;
  anual: number | null;
  pct: number | null;
  tipo: "linea" | "subtotal" | "resultado";
}

function filaCosto(label: string, valorUnidad: number, unidades: number, base: number): FilaEstado {
  const anual = -valorUnidad * unidades;
  return { concepto: label, mensual: anual / 12, anual, pct: anual / base, tipo: "linea" };
}

export function ReporteDocument({
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
  const unidadesTexto = unidades === 1 ? "1 apartamento" : `${unidades} apartamentos`;
  const costosYGastosAnuales = metricas.ingresosTotal - metricas.ebitdaTotal;

  const indicadores: FilaIndicador[] = [
    { label: "Inversión total", cop: metricas.inversionTotal, estilo: "normal" },
    { label: "Ingresos anuales", cop: metricas.ingresosTotal, estilo: "normal" },
    { label: "Costos y gastos anuales", cop: costosYGastosAnuales, estilo: "normal" },
    { label: "Utilidad neta anual", cop: metricas.utilidadNetaTotal, estilo: "utilidad" },
    { label: "Utilidad neta mensual", cop: metricas.utilidadNetaTotal / 12, estilo: "utilidad" },
    { label: "Rentabilidad anual", cop: 0, pct: metricas.roiSobreInversionTotal, estilo: "rentabilidad" },
    {
      label: "Rentabilidad mensual",
      cop: 0,
      pct: metricas.roiSobreInversionTotal / 12,
      estilo: "rentabilidad",
    },
  ];

  const ventasBrutas = pnl.ingresos.total * unidades;

  const lineasCostoVentas = pnl.costosDirectos.lines.map((l) =>
    filaCosto(l.label, l.value, unidades, ventasBrutas),
  );
  const totalCostoVentas = -pnl.costosDirectos.total * unidades;
  const utilidadBruta = ventasBrutas + totalCostoVentas;

  const lineasGastosOperacion = [
    filaCosto("Servicios públicos", pnl.serviciosPublicos.total, unidades, ventasBrutas),
    ...pnl.gastosVarios.lines.map((l) => filaCosto(l.label, l.value, unidades, ventasBrutas)),
    ...pnl.otrosFijos.lines.map((l) => filaCosto(l.label, l.value, unidades, ventasBrutas)),
  ];
  const totalGastosOperacion =
    -(pnl.serviciosPublicos.total + pnl.gastosVarios.total + pnl.otrosFijos.total) * unidades;
  const utilidadOperacional = utilidadBruta + totalGastosOperacion;

  const impuestoRenta = -pnl.impuestoRenta * unidades;
  const utilidadNetaPropietario = utilidadOperacional + impuestoRenta;

  const filas: FilaEstado[] = [
    { concepto: "Ventas brutas", mensual: ventasBrutas / 12, anual: ventasBrutas, pct: 1, tipo: "resultado" },
    ...lineasCostoVentas,
    {
      concepto: "Total costo de ventas",
      mensual: totalCostoVentas / 12,
      anual: totalCostoVentas,
      pct: totalCostoVentas / ventasBrutas,
      tipo: "subtotal",
    },
    {
      concepto: "Utilidad bruta",
      mensual: utilidadBruta / 12,
      anual: utilidadBruta,
      pct: utilidadBruta / ventasBrutas,
      tipo: "resultado",
    },
    ...lineasGastosOperacion,
    {
      concepto: "Total gastos de operación",
      mensual: totalGastosOperacion / 12,
      anual: totalGastosOperacion,
      pct: totalGastosOperacion / ventasBrutas,
      tipo: "subtotal",
    },
    {
      concepto: "Utilidad operacional",
      mensual: utilidadOperacional / 12,
      anual: utilidadOperacional,
      pct: utilidadOperacional / ventasBrutas,
      tipo: "resultado",
    },
    {
      concepto: "Impuesto de renta",
      mensual: impuestoRenta / 12,
      anual: impuestoRenta,
      pct: impuestoRenta / ventasBrutas,
      tipo: "linea",
    },
    {
      concepto: "Utilidad neta propietario",
      mensual: utilidadNetaPropietario / 12,
      anual: utilidadNetaPropietario,
      pct: utilidadNetaPropietario / ventasBrutas,
      tipo: "resultado",
    },
    {
      concepto: "Rentabilidad sobre inversión",
      mensual: null,
      anual: null,
      pct: metricas.roiSobreInversionTotal,
      tipo: "resultado",
    },
  ];

  return (
    <Document title={`Simulación Invictus × GEHsuites — ${escenario}`}>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de @react-pdf/renderer, no <img>: no es un nodo del DOM ni tiene concepto de accesibilidad web. */}
        <Image src="/invitvs_fondo.jpg" style={styles.marcaAgua} fixed />

        <View style={styles.header}>
          <Text style={styles.kicker}>INVICTUS · GEHSUITES</Text>
          <Text style={styles.titulo}>Simulador de Rentabilidad — Escenario {escenario}</Text>
        </View>

        <View style={styles.subhead}>
          <View>
            <Text style={styles.subheadLabel}>TIPOLOGÍA</Text>
            <Text style={styles.subheadValue}>{TIPOLOGIA}</Text>
          </View>
          <View>
            <Text style={{ ...styles.subheadLabel, textAlign: "right" }}>PROYECCIÓN DE RENTABILIDAD</Text>
            <Text style={styles.subheadValue}>
              Año {anio} · {unidadesTexto}
              {esEstimacion ? " · estimación" : ""}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.seccion}>INDICADORES FINANCIEROS</Text>
          <View>
            <FilaCabecera
              bg={NAVY}
              celdas={[
                { texto: "Indicador", width: "46%" },
                { texto: "COP", width: "27%", align: "right" },
                { texto: "USD", width: "27%", align: "right" },
              ]}
            />
            {indicadores.map((fila, i) => {
              const negrita = fila.estilo !== "normal";
              const color =
                fila.estilo === "utilidad" ? GOLD_DARK : fila.estilo === "rentabilidad" ? NAVY : BLUE;
              const bg = i % 2 === 0 ? ROW_WHITE : ROW_SAND;
              if (fila.pct != null) {
                return (
                  <FilaTabla
                    key={fila.label}
                    bg={bg}
                    celdas={[
                      { texto: fila.label, width: "46%", bold: true, color },
                      { texto: formatPercent(fila.pct, 1), width: "54%", align: "right", bold: true, color: NAVY },
                    ]}
                  />
                );
              }
              return (
                <FilaTabla
                  key={fila.label}
                  bg={bg}
                  celdas={[
                    { texto: fila.label, width: "46%", bold: negrita, color },
                    { texto: formatCOP(fila.cop), width: "27%", align: "right", bold: negrita },
                    { texto: formatUSD(aUSD(fila.cop, tasaCambio)), width: "27%", align: "right", bold: negrita },
                  ]}
                />
              );
            })}
          </View>

          <Text style={styles.seccion}>ESTADO DE RESULTADOS</Text>
          <View>
            <FilaCabecera
              bg="#e0c675"
              celdas={[
                { texto: "Concepto", width: "40%", color: NAVY },
                { texto: "Mensual COP", width: "20%", align: "right", color: NAVY },
                { texto: "Anual COP", width: "20%", align: "right", color: NAVY },
                { texto: "%", width: "20%", align: "right", color: NAVY },
              ]}
            />
            {filas.map((fila, i) => {
              const esResultado = fila.tipo !== "linea";
              const negativo = (fila.anual ?? 0) < 0;
              const color = negativo ? RED : NAVY;
              const bg = esResultado ? ROW_SAND : i % 2 === 0 ? ROW_WHITE : ROW_SAND_ALT;
              return (
                <FilaTabla
                  key={`${fila.concepto}-${i}`}
                  bg={bg}
                  borderTop={fila.tipo === "subtotal" || fila.tipo === "resultado"}
                  celdas={[
                    { texto: fila.concepto, width: "40%", bold: esResultado, color: NAVY },
                    {
                      texto: fila.mensual == null ? "—" : formatCOP(fila.mensual),
                      width: "20%",
                      align: "right",
                      bold: esResultado,
                      color,
                    },
                    {
                      texto: fila.anual == null ? "—" : formatCOP(fila.anual),
                      width: "20%",
                      align: "right",
                      bold: esResultado,
                      color,
                    },
                    {
                      texto: fila.pct == null ? "—" : formatPercent(fila.pct, 1),
                      width: "20%",
                      align: "right",
                      bold: esResultado,
                      color,
                    },
                  ]}
                />
              );
            })}
          </View>

          <Text style={styles.disclaimer}>
            Proyecciones estimadas del modelo financiero por unidad de Invictus, operado por GEHsuites. No
            constituyen garantía de rentabilidad ni oferta pública de valores; sujetas a variaciones
            comerciales, operativas y de mercado.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
