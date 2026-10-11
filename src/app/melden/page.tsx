import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import { MeldForm } from "@/components/melden/meld-form";

export const metadata: Metadata = {
  title: "Melden",
  description:
    "Meld een incident met politiegeweld. Anoniem kan. Op de kaart komt alleen een afgerond punt, nooit je verhaal.",
};

export default function MeldenPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[840px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Melding maken
        </h1>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          Vertel wat er is gebeurd, in je eigen woorden. Je kunt anoniem
          blijven en je bepaalt zelf of er een punt op de kaart komt. Je mag
          ook alleen je verhaal delen, zonder zaak of vervolg.
        </p>
        <div className="mt-12">
          <MeldForm />
        </div>
      </div>
    </main>
  );
}
