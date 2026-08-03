import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Simulator } from "@/components/Simulator/Simulator";
import { WhyInvest } from "@/components/WhyInvest";

/**
 * Landing page comercial de Invictus × GEHsuites.
 *
 * Composición de secciones: todo el contenido es estático salvo el simulador
 * y los pocos componentes interactivos, que declaran su propio "use client".
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Simulator />
        <WhyInvest />
      </main>
      <Footer />
    </>
  );
}
