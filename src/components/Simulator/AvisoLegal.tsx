import { Scale } from "lucide-react";

export function AvisoLegal() {
  return (
    <section
      id="aviso-legal"
      className="rounded-3xl border border-gold-200 bg-gold-100/50 p-5 sm:p-6"
    >
      <h3 className="titular flex items-center gap-2 text-lg text-navy-900">
        <Scale className="h-[1.1rem] w-[1.1rem] shrink-0 text-gold-600" aria-hidden />
        Aviso legal y comercial
      </h3>

      <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-ink-700">
        <p>
          Las cifras de este simulador son <strong>proyecciones estimadas</strong> construidas sobre
          el modelo financiero P&amp;G por unidad del proyecto Invictus, operado por GEHsuites.{" "}
          <strong>
            No constituyen promesa de rentabilidad fija, garantía financiera ni oferta pública de
            valores.
          </strong>
        </p>
        <p>
          Los resultados reales pueden variar por ocupación efectiva, tarifa promedio alcanzada,
          comportamiento del mercado turístico, cambios en la estructura de costos, variaciones de la
          tasa de cambio y modificaciones en las condiciones tributarias aplicables.
        </p>
        <p>
          El escenario personalizado y cualquier cambio en los parámetros avanzados producen
          estimaciones propias del usuario que no forman parte del modelo oficial. La conversión a
          dólares usa la tasa digitada por el usuario y es sólo una referencia de lectura.
        </p>
        <p>
          Antes de tomar una decisión de inversión, revisa los documentos contractuales del proyecto
          y consulta con tu asesor financiero y tributario. Tratamiento de datos personales conforme
          a la Ley 1581 de 2012.
        </p>
      </div>
    </section>
  );
}
