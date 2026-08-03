/** Formateo monetario y numérico en convención colombiana (es-CO). */

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const NUM = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** $1.180.000.000 */
export function formatCOP(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return COP.format(Math.round(value));
}

/** 1.180.000.000 (sin símbolo) */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return NUM.format(Math.round(value));
}

/**
 * Versión compacta para ejes y etiquetas estrechas: $1.180 M / $1,18 MM.
 * Mantiene el símbolo para que nunca se lea como una cifra sin unidad.
 */
export function formatCOPCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const signo = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${signo}$${(abs / 1_000_000_000).toLocaleString("es-CO", { maximumFractionDigits: 2 })} MM`;
  }
  if (abs >= 1_000_000) {
    return `${signo}$${(abs / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`;
  }
  if (abs >= 1_000) {
    return `${signo}$${(abs / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 0 })} K`;
  }
  return `${signo}$${NUM.format(abs)}`;
}

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Convierte COP a USD con la tasa dada. */
export function aUSD(valorCOP: number, tasa: number): number {
  if (!Number.isFinite(valorCOP) || !Number.isFinite(tasa) || tasa <= 0) return NaN;
  return valorCOP / tasa;
}

/** $168,006 — siempre en convención en-US para no confundir con COP. */
export function formatUSD(valorUSD: number): string {
  if (!Number.isFinite(valorUSD)) return "—";
  return USD.format(Math.round(valorUSD));
}

/** Formatea un valor en COP según la moneda de visualización elegida. */
export function formatMoneda(valorCOP: number, moneda: "COP" | "USD", tasa: number): string {
  return moneda === "USD" ? formatUSD(aUSD(valorCOP, tasa)) : formatCOP(valorCOP);
}

/** Versión compacta en USD: $168 K / $1,2 M */
export function formatUSDCompact(valorUSD: number): string {
  if (!Number.isFinite(valorUSD)) return "—";
  const abs = Math.abs(valorUSD);
  const signo = valorUSD < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${signo}$${(abs / 1_000_000).toFixed(2)} M`;
  if (abs >= 1_000) return `${signo}$${Math.round(abs / 1_000)} K`;
  return `${signo}$${Math.round(abs)}`;
}

/** Compacto según moneda, para ejes y etiquetas estrechas. */
export function formatMonedaCompact(
  valorCOP: number,
  moneda: "COP" | "USD",
  tasa: number,
): string {
  return moneda === "USD" ? formatUSDCompact(aUSD(valorCOP, tasa)) : formatCOPCompact(valorCOP);
}

/** 0,1189 → "11,89%" */
export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/** 8.77 → "8,77 años" */
export function formatAnios(value: number, sufijo = true): string {
  if (!Number.isFinite(value)) return "—";
  const n = value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return sufijo ? `${n} años` : n;
}

/** Convierte una cifra anual al horizonte pedido. */
export function porHorizonte(valorAnual: number, horizonte: "mensual" | "anual"): number {
  return horizonte === "mensual" ? valorAnual / 12 : valorAnual;
}
