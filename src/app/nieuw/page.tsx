import type { Metadata } from "next";
import Link from "next/link";
import { HeroFotos } from "@/components/nieuw/hero-fotos";
import { Logo } from "@/components/site/logo";
import { RightsTicker } from "@/components/home/rights-ticker";
import { Mission } from "@/components/home/mission";
import { Tools } from "@/components/home/tools";
import { QuoteWall } from "@/components/nieuw/quote-wall";
import { Globe } from "@/components/nieuw/globe";
import { Aanbod } from "@/components/nieuw/aanbod";
import { Gedenk } from "@/components/nieuw/gedenk";
import { Steun } from "@/components/nieuw/steun";
import { UITSPRAKEN } from "@/lib/uitspraken";

export const metadata: Metadata = {
  title: "Politiegeweld in Nederland",
  description:
    "Politiegeweld in Nederland vastgelegd: meldingen, kaart, beelden, uitspraken en een platform dat blijft.",
};

const FOTOSTROOK = [
  {
    src: "/nieuw/charge-amsterdam.jpg",
    titel: "De charge",
    caption: "Amsterdam · Anefo / Nationaal Archief · CC0",
  },
  {
    src: "/nieuw/waterkanon.jpg",
    titel: "Het waterkanon",
    caption: "Wikimedia Commons · publiek domein",
  },
  {
    src: "/nieuw/boeren-politie.jpg",
    titel: "De staat treedt op",
    caption: "Boerenprotest · Ministerie van Defensie · CC0",
  },
  {
    src: "/nieuw/azc-protest.jpg",
    titel: "Mensen blijven komen",
    caption: "Nieuwerkerk · Kniesoor · CC BY-SA 4.0",
  },
];

export default function NieuwPage() {
  return (
    <main id="main" className="flex-1 bg-[radial-gradient(circle_at_18%_8%,rgba(0,76,157,0.18),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(216,48,44,0.08),transparent_30%)]">
      <HeroFotos
        counts={{
          meldingen: 512,
          uitspraken: UITSPRAKEN.length,
          beelden: 156,
          om: 34,
        }}
      />

      <RightsTicker />

      <section className="border-y border-line bg-[#f2eee6] text-[#111]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-6 px-6 py-9 lg:px-10">
          <Logo className="h-20 w-20 rounded-sm md:h-24 md:w-24" />
          <p className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Niet vergeten. Niet wegkijken.
          </p>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5c574e]">
            Sinds 2012 · Nederland
          </span>
        </div>
      </section>

      <Mission />
      <Tools />
      <QuoteWall />

      <div className="border-y border-line bg-[#07090c]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-2 lg:px-10">
          <span className="text-accent">Laatste</span>
          <span>OM seponeert zaak na dodelijke arrestatie Rotterdam</span>
          <span className="hidden md:inline">Artikel 12 Sv: beklag over verbalisanten afgewezen</span>
          <Link href="/nieuws" className="ml-auto text-muted hover:text-foreground">
            Alles bekijken →
          </Link>
        </div>
      </div>

      <section className="border-y border-line">
        <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-6 py-20 md:grid-cols-[.9fr_1.1fr] md:items-center md:py-24 lg:px-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-blue">
              De kaart is het geheugen
            </p>
            <h2 className="mt-4 max-w-[12ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
              Elke stip is een plek. Geen plek is te klein.
            </h2>
            <p className="mt-5 max-w-[48ch] leading-relaxed text-muted">
              De 3D-bol laat zien waar het gebeurt. Niet als decor, maar als
              dossier: locaties met bron en context.
            </p>
            <Link href="/kaart" className="mt-6 inline-flex text-sm text-brand-blue underline underline-offset-4">
              Bekijk de live kaart →
            </Link>
          </div>
          <Globe />
        </div>
      </section>

      <Aanbod />

      <section className="border-y border-line">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-20 md:py-24 lg:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-blue">
            Beeld als bewijs
          </p>
          <h2 className="mt-4 max-w-[16ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
            Dit is niet abstract.
          </h2>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">
            Politiegeweld is geen cijfer. Het is een moment, een straat, een
            lichaam. Deze opname is openbaar en met licentie; kijk met zorg.
          </p>
          <div className="mt-6">
            <video
              controls
              preload="metadata"
              poster="/nieuw/utrecht-politie.jpg"
              className="aspect-video w-full border border-line bg-[#07090c]"
            >
              <source src="/nieuw/utrecht-politie.webm" type="video/webm" />
              Je browser kan deze video niet tonen.{" "}
              <a href="/nieuw/utrecht-politie.webm">Download de opname</a>.
            </video>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-accent">
              Kan confronterend zijn · 19 mei 2025 · Utrecht
            </p>
            <p className="mt-1 max-w-[90ch] font-mono text-[9px] leading-relaxed text-muted-2">
              Politiegeweld op de Drift, Utrecht, 19 mei 2025. Beeld: Afonso
              Dimas Martins / Wikimedia Commons · CC BY-SA 4.0. Ongewijzigd
              geplaatst, met bron en context.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
            {FOTOSTROOK.map((foto) => (
              <figure key={foto.src} className="relative overflow-hidden border border-line bg-surface">
                <img
                  src={foto.src}
                  alt={foto.titel}
                  className="h-52 w-full object-cover grayscale-[.55] transition duration-500 hover:grayscale-0 md:h-60"
                  loading="lazy"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 font-mono text-[8px] leading-relaxed text-white/80">
                  <b className="block font-sans text-[11px] font-semibold text-white">{foto.titel}</b>
                  {foto.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Gedenk />
      <Steun />
    </main>
  );
}
