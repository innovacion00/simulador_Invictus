"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CONSULTA_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

/** Suscripción a la preferencia de movimiento reducido del sistema. */
function usePrefiereMenosMovimiento(): boolean {
  return useSyncExternalStore(
    (notificar) => {
      const mq = window.matchMedia(CONSULTA_MOVIMIENTO);
      mq.addEventListener("change", notificar);
      return () => mq.removeEventListener("change", notificar);
    },
    () => window.matchMedia(CONSULTA_MOVIMIENTO).matches,
    // En el servidor asumimos animación normal; el cliente corrige al hidratar.
    () => false,
  );
}

/**
 * Anima un número desde su valor anterior hasta el nuevo.
 *
 * Se usa en las tarjetas de resultados del simulador para que el cambio de
 * escenario o de N° de apartamentos se lea como una transición y no como un
 * salto. Si el usuario pide movimiento reducido, salta al valor final.
 */
export function useCountUp(target: number, duration = 550): number {
  const reducido = usePrefiereMenosMovimiento();
  const [valor, setValor] = useState(target);
  const desde = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const saltar = reducido || duration <= 0 || !Number.isFinite(target);
    const origen = Number.isFinite(desde.current) ? desde.current : 0;

    if (saltar || target === origen) {
      desde.current = target;
      // El salto se aplica en el siguiente frame en vez de en el cuerpo del
      // efecto, para no encadenar renders.
      frame.current = requestAnimationFrame(() => setValor(target));
      return () => {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
      };
    }

    const inicio = performance.now();
    const delta = target - origen;

    // easeOutCubic: arranca rápido y se asienta al final.
    const easing = (t: number) => 1 - Math.pow(1 - t, 3);

    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duration);
      setValor(origen + delta * easing(t));
      if (t < 1) {
        frame.current = requestAnimationFrame(paso);
      } else {
        desde.current = target;
      }
    };

    frame.current = requestAnimationFrame(paso);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      desde.current = target;
    };
  }, [target, duration, reducido]);

  return valor;
}
