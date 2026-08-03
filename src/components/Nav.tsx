import Image from "next/image";

const ENLACES = [
  { href: "#simulador", label: "Simulador" },
  { href: "#por-que-invictus", label: "Por qué Invictus" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-navy-900">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a href="#inicio" className="flex items-center gap-3">
          <Image
            src="/invictus-logo.png"
            alt="Invictus"
            width={421}
            height={98}
            priority
            className="h-6 w-auto sm:h-7"
          />
          <span className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden />
          <Image
            src="/smart-stay.svg"
            alt="GEHsuites Hotels"
            width={375}
            height={218}
            priority
            className="hidden h-7 w-auto sm:block sm:h-8"
          />
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
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

        <a
          href="#contacto"
          className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-sand-100"
        >
          Hablar con un asesor
        </a>
      </nav>
    </header>
  );
}
