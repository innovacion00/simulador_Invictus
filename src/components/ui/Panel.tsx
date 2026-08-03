import type { LucideIcon } from "lucide-react";

/**
 * Tarjeta con encabezado titulado. Es la unidad de composición de todo el
 * simulador: cada bloque de la simulación es un Panel.
 */
export function Panel({
  titulo,
  subtitulo,
  icono: Icono,
  acciones,
  children,
  className = "",
  padding = "normal",
  id,
}: {
  titulo: string;
  subtitulo?: React.ReactNode;
  icono?: LucideIcon;
  /** Controles alineados a la derecha del encabezado. */
  acciones?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** `plano` deja el contenido pegado a los bordes (tablas a sangre). */
  padding?: "normal" | "plano";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`overflow-hidden rounded-3xl border border-line bg-white shadow-sm ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="min-w-0">
          <h3 className="titular flex items-center gap-2 text-lg text-navy-900 sm:text-xl">
            {Icono && <Icono className="h-[1.1rem] w-[1.1rem] shrink-0 text-caribe-600" aria-hidden />}
            {titulo}
          </h3>
          {subtitulo && (
            <p className="mt-1 text-xs leading-relaxed text-ink-400">{subtitulo}</p>
          )}
        </div>
        {acciones && <div className="shrink-0">{acciones}</div>}
      </header>

      <div className={padding === "normal" ? "p-5 sm:p-6" : "mt-5"}>{children}</div>
    </section>
  );
}

/** Fila etiqueta / control dentro de un panel de parámetros. */
export function CampoParametro({
  label,
  htmlFor,
  ayuda,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  ayuda?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-semibold text-navy-900"
      >
        {label}
      </label>
      {children}
      {ayuda && <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">{ayuda}</p>}
    </div>
  );
}

/** Grupo de botones tipo segmented control. */
export function GrupoOpciones<T extends string | number>({
  opciones,
  valor,
  onChange,
  etiquetaGrupo,
  columnas,
  size = "normal",
}: {
  opciones: { valor: T; label: string; sub?: string }[];
  valor: T;
  onChange: (v: T) => void;
  etiquetaGrupo: string;
  /** Nº de columnas del grid; por defecto se reparte entre las opciones. */
  columnas?: string;
  size?: "normal" | "compacto";
}) {
  return (
    <div
      role="radiogroup"
      aria-label={etiquetaGrupo}
      className={`grid gap-1.5 ${columnas ?? ""}`}
      style={columnas ? undefined : { gridTemplateColumns: `repeat(${opciones.length}, minmax(0,1fr))` }}
    >
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={String(o.valor)}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(o.valor)}
            className={[
              "rounded-xl border text-center transition-all",
              size === "compacto" ? "px-2 py-2" : "px-2.5 py-2.5",
              activo
                ? "border-navy-900 bg-navy-900 text-white shadow-sm"
                : "border-line bg-sand-50 text-ink-600 hover:border-caribe-300 hover:text-navy-900",
            ].join(" ")}
          >
            <span className="block text-[13px] font-semibold leading-tight">{o.label}</span>
            {o.sub && (
              <span
                className={`cifra-tabular mt-0.5 block text-[11px] leading-tight ${
                  activo ? "text-white/70" : "text-ink-400"
                }`}
              >
                {o.sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
