"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { MAX_UNIDADES_SIMULADOR, PRECIO_UNIDAD } from "@/lib/finance/constants";
import { formatCOP } from "@/lib/finance/formatters";

interface Datos {
  nombre: string;
  email: string;
  telefono: string;
  unidades: number;
  mensaje: string;
}

const VACIO: Datos = { nombre: "", email: "", telefono: "", unidades: 1, mensaje: "" };

type Errores = Partial<Record<keyof Datos, string>>;

function validar(datos: Datos): Errores {
  const errores: Errores = {};

  if (datos.nombre.trim().length < 3) {
    errores.nombre = "Escribe tu nombre completo.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email.trim())) {
    errores.email = "Revisa el correo: no parece válido.";
  }
  // Acepta formatos colombianos con o sin indicativo: +57 300 123 4567, 3001234567…
  if (datos.telefono.replace(/\D/g, "").length < 7) {
    errores.telefono = "Ingresa un teléfono de contacto válido.";
  }
  return errores;
}

const claseCampo =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-caribe-500 focus:outline-none focus:ring-2 focus:ring-caribe-500/25";

export function ContactForm() {
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado">("idle");

  const actualizar = <K extends keyof Datos>(campo: K, valor: Datos[K]) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();

    const encontrados = validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEstado("enviando");

    // ── Punto de integración ──────────────────────────────────────────
    // El sitio corre sin backend. Para conectar el formulario, reemplaza
    // esta espera por la llamada real (Server Action, /api/contacto, CRM
    // o servicio de email) — el resto del componente no cambia.
    await new Promise((r) => setTimeout(r, 700));

    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <div className="rounded-3xl border border-verde-500/30 bg-verde-100/60 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-verde-700" aria-hidden />
        <h3 className="mt-4 text-xl font-semibold text-navy-900">Gracias, {datos.nombre.split(" ")[0]}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
          Recibimos tu interés por {datos.unidades === 1 ? "1 apartamento" : `${datos.unidades} apartamentos`}.
          Un asesor de GEHsuites te contactará para revisar contigo el modelo financiero completo.
        </p>
        <button
          type="button"
          onClick={() => {
            setDatos(VACIO);
            setEstado("idle");
          }}
          className="mt-6 text-sm font-semibold text-caribe-700 underline underline-offset-4 hover:text-navy-900"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-navy-900">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            className={claseCampo}
            placeholder="María Fernanda Ríos"
            value={datos.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={errores.nombre ? "error-nombre" : undefined}
          />
          {errores.nombre && (
            <p id="error-nombre" role="alert" className="mt-1.5 text-xs text-[#c0392b]">
              {errores.nombre}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-900">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={claseCampo}
            placeholder="maria@correo.com"
            value={datos.email}
            onChange={(e) => actualizar("email", e.target.value)}
            aria-invalid={Boolean(errores.email)}
            aria-describedby={errores.email ? "error-email" : undefined}
          />
          {errores.email && (
            <p id="error-email" role="alert" className="mt-1.5 text-xs text-[#c0392b]">
              {errores.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-navy-900">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={claseCampo}
            placeholder="+57 300 123 4567"
            value={datos.telefono}
            onChange={(e) => actualizar("telefono", e.target.value)}
            aria-invalid={Boolean(errores.telefono)}
            aria-describedby={errores.telefono ? "error-telefono" : undefined}
          />
          {errores.telefono && (
            <p id="error-telefono" role="alert" className="mt-1.5 text-xs text-[#c0392b]">
              {errores.telefono}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="unidades-interes" className="mb-1.5 block text-sm font-medium text-navy-900">
            Apartamentos de interés
          </label>
          <select
            id="unidades-interes"
            name="unidades"
            className={claseCampo}
            value={datos.unidades}
            onChange={(e) => actualizar("unidades", Number(e.target.value))}
          >
            {Array.from({ length: MAX_UNIDADES_SIMULADOR }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "apartamento" : "apartamentos"} · {formatCOP(n * PRECIO_UNIDAD)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-navy-900">
          Mensaje <span className="font-normal text-ink-400">(opcional)</span>
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={3}
          className={`${claseCampo} resize-y`}
          placeholder="Cuéntanos qué te gustaría revisar con el asesor."
          value={datos.mensaje}
          onChange={(e) => actualizar("mensaje", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-700 disabled:opacity-70 sm:w-auto"
      >
        {estado === "enviando" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Enviando…
          </>
        ) : (
          <>
            Quiero hablar con un asesor
            <Send className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>

      <p className="text-[11px] leading-relaxed text-ink-400">
        Al enviar aceptas ser contactado por GEHsuites sobre el proyecto Invictus. Tus datos se
        tratan conforme a la política de tratamiento de datos personales (Ley 1581 de 2012).
      </p>
    </form>
  );
}
