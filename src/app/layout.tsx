import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Spectral } from "next/font/google";
import "./globals.css";

/** Sans de interfaz y cifras. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

/** Serif de titulares. */
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invictus × GEHsuites — Simulador de rentabilidad para inversionistas",
  description:
    "Simula la rentabilidad de tu inversión en Invictus: utilidad neta mensual y anual, ROI y años de recuperación por apartamento, con el modelo financiero real operado por GEHsuites.",
  keywords: [
    "Invictus",
    "GEHsuites",
    "inversión inmobiliaria",
    "rentabilidad hotelera",
    "simulador de inversión",
    "ROI apartamentos",
    "renta corta",
  ],
  openGraph: {
    title: "Invictus × GEHsuites — Simulador de rentabilidad",
    description:
      "Rentabilidad de doble dígito y recuperación de la inversión en ~8 años en escenario conservador. Simula tu inversión apartamento por apartamento.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CO"
      className={`${jakarta.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand-50 text-ink-900">{children}</body>
    </html>
  );
}
