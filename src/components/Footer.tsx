import Image from "next/image";

import { DISCLAIMER, PRECIO_UNIDAD, TOTAL_UNIDADES } from "@/lib/finance/constants";
import { formatCOP } from "@/lib/finance/formatters";

const ENLACES = [
  { href: "#simulador", label: "Simulador" },
  { href: "#por-que-invictus", label: "Por qué Invictus" },
  { href: "#contacto", label: "Contacto" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-navy-900">
      {/* Franja de marca: mismo tratamiento navy + hairline que el header. */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 px-4 py-8 sm:px-6">
          <Image
            src="/invictus-logo.png"
            alt="Invictus"
            width={421}
            height={98}
            className="h-7 w-auto"
          />
          <span className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />
          <Image
            src="/smart-stay.svg"
            alt="GEHsuites Hotels"
            width={375}
            height={218}
            className="h-8 w-auto"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Proyecto de renta hotelera de {TOTAL_UNIDADES} apartamentos de 1 habitación, operado y
              comercializado por GEHsuites como operador único. Inversión por unidad:{" "}
              <span className="cifra-tabular">{formatCOP(PRECIO_UNIDAD)}</span>.
            </p>
          </div>

          <nav aria-label="Pie de página">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">Secciones</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {ENLACES.map((e) => (
                <li key={e.href}>
                  <a
                    href={e.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {e.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 space-y-3 border-t border-white/10 pt-6 text-[11px] leading-relaxed text-white/45">
          <p>{DISCLAIMER}</p>
          <p>
            La información de este sitio tiene fines exclusivamente informativos y comerciales; no
            constituye una oferta pública de valores, asesoría financiera, legal ni tributaria. Las
            proyecciones dependen de variables de mercado —ocupación, tarifa, costos, regulación—
            que pueden cambiar. Antes de invertir, consulta con tu asesor financiero y tributario y
            revisa los documentos contractuales del proyecto. Tratamiento de datos personales
            conforme a la Ley 1581 de 2012.
          </p>
          <p className="pt-2">
            © {new Date().getFullYear()} GEHsuites. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
