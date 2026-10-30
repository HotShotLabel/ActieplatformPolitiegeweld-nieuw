"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WordReveal } from "@/components/site/word-reveal";

type SceneQuote = {
  tekst: string;
  wie: string;
  rol: string;
  waar: string;
  bron: string;
  url: string;
};

const SCENE: SceneQuote[] = [
  {
    tekst: "Au. Ik heb suikerziekte. Au. Help.",
    wie: "Alfredo Goeloe",
    rol: "Slachtoffer",
    waar: "Rotterdam · 2026",
    bron: "de Volkskrant",
    url: "https://www.volkskrant.nl/binnenland/na-de-dood-van-alfredo-goeloe-groeit-het-wantrouwen-tegen-de-politie-in-charlois-ik-denk-dan-toch-dat-zijn-kleur-meespeelt~b83f5d64/",
  },
  {
    tekst: "Ik dacht dat ik doodging.",
    wie: "Piet Visser (72)",
    rol: "Slachtoffer",
    waar: "Den Haag · 2016",
    bron: "De Telegraaf",
    url: "https://www.telegraaf.nl/nieuws/1304358/ik-dacht-dat-ik-doodging",
  },
  {
    tekst: "Ik werd slachtoffer van geweld en geslagen door de Nederlandse politie.",
    wie: "Malak Mahmoud",
    rol: "Slachtoffer",
    waar: "Utrecht · 2025",
    bron: "RTV Utrecht",
    url: "https://www.rtvutrecht.nl/nieuws/4051472/hoogzwangere-vrouw-reageert-op-politiegeweld-in-azc-ik-wilde-gewoon-een-vraag-stellen",
  },
  {
    tekst: "Onze zoon had psychiatrische problemen.",
    wie: "Familie van Mateusz (32)",
    rol: "Familie",
    waar: "Rotterdam · 2023",
    bron: "AD",
    url: "https://www.ad.nl/rotterdam/familie-van-mateusz-32-in-shock-na-fatale-arrestatie-onze-zoon-had-psychiatrische-problemen~a9454c8b/",
  },
  {
    tekst: "Hij heeft geen kans gehad.",
    wie: "Moeder van Tim",
    rol: "Moeder",
    waar: "Dordrecht · 2022",
    bron: "AD",
    url: "https://www.ad.nl/dordrecht/dordtse-moeder-verbijsterd-over-doodschieten-van-zoon-tim-door-politie-hij-heeft-geen-kans-gehad~a67cc9d3/",
  },
  {
    tekst: "Hij is toegetakeld.",
    wie: "Familie van Raymon (38)",
    rol: "Familie",
    waar: "Emmeloord · 2019",
    bron: "De Stentor",
    url: "https://www.destentor.nl/noordoostpolder/overleed-goedzak-raymon-38-aan-hartfalen-familie-gelooft-politie-niet-hij-is-toegetakeld~a1ab7ebf/",
  },
  {
    tekst: "We zijn enorm bedroefd.",
    wie: "Ouders van een 28-jarige vrouw",
    rol: "Ouders",
    waar: "Roosendaal · 2025",
    bron: "BN DeStem",
    url: "https://www.bndestem.nl/roosendaal/ouders-van-roosendaalse-vrouw-28-die-overleed-in-de-politiecel-we-zijn-enorm-bedroefd~a4e2f5dce/",
  },
  {
    tekst: "Hij vocht voor zijn leven, maar ze deden niets voor hem.",
    wie: "Maria Henriquez",
    rol: "Moeder",
    waar: "Den Haag · 2015",
    bron: "RTL Nieuws",
    url: "https://www.rtl.nl/nieuws/nederland/artikel/778926/moeder-mitch-henriquez-hij-vocht-voor-zijn-leven-maar-ze-deden-niks",
  },
  {
    tekst: "We willen geen wraak en geen geweld. We willen gerechtigheid via de rechtbank.",
    wie: "Oudste dochter van Alfredo",
    rol: "Dochter",
    waar: "Rotterdam · 2026",
    bron: "AD",
    url: "https://www.ad.nl/rotterdam/emotioneel-afscheid-van-alfredo-rotterdammer-met-witte-koets-naar-laatste-rustplaats-gebracht~ada83b00a/",
  },
  {
    tekst: "Ze hebben hem levensreddende momenten ontnomen.",
    wie: "Lila, zus van Mitch",
    rol: "Zus",
    waar: "Den Haag · 2015",
    bron: "NOS",
    url: "https://nos.nl/artikel/2278830-familie-mitch-henriquez-wil-beroepsverbod-en-celstraf-voor-agenten",
  },
  {
    tekst: "Maar hij kwam maar niet terug.",
    wie: "Charnelle, partner van Alfredo",
    rol: "Partner",
    waar: "Rotterdam · 2026",
    bron: "AD",
    url: "https://www.ad.nl/rotterdam/zwangere-charnelle-wacht-op-alfredo-bij-hun-babyshower-maar-hij-overlijdt-vlakbij-bij-arrestatie~ae5179af4/",
  },
  {
    tekst: "Wij krijgen pas rust wanneer alle vijf agenten worden gestraft.",
    wie: "Familie van Mitch",
    rol: "Familie",
    waar: "Den Haag · 2015",
    bron: "de Volkskrant",
    url: "https://www.volkskrant.nl/nieuws-achtergrond/familie-mitch-henriquez-wij-krijgen-pas-rust-wanneer-alle-vijf-agenten-worden-gestraft~b0e925cb/",
  },
];

function ProtestVideo({
  className,
  compact = false,
}: {
  className: string;
  compact?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (reduce) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      poster="/nieuw/protest-frame.jpg"
      aria-label={
        compact
          ? "Stockvideo van een demonstratie"
          : "Stockvideo van een demonstratie met een menigte"
      }
    >
      <source src="/nieuw/protest-video.mp4" type="video/mp4" />
    </video>
  );
}

function Bubbel({ quote, index, reduce }: { quote: SceneQuote; index: number; reduce: boolean | null }) {
  return (
    <motion.div
      className="relative rounded-2xl border-2 border-[#111]/25 bg-[#fbf7f0] p-3 shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={
        reduce
          ? undefined
          : { duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }
      }
    >
      <blockquote className="font-serif text-[12.5px] leading-[1.22] tracking-tight">
        “{quote.tekst}”
      </blockquote>
      <div className="mt-2 border-t border-[#111]/15 pt-2">
        <p className="font-display text-[9.5px] font-semibold leading-tight">{quote.wie}</p>
        <p className="mt-0.5 text-[8px] leading-tight text-[#5c574e]">{quote.waar}</p>
        <a
          href={quote.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-[7.5px] uppercase tracking-[0.08em] text-[#004c9d] underline underline-offset-2"
        >
          Bron: {quote.bron} →
        </a>
      </div>
      <span
        aria-hidden="true"
        className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#111]/25 bg-[#fbf7f0]"
      />
    </motion.div>
  );
}

function Spandoek({ reduce, compact = false }: { reduce: boolean | null; compact?: boolean }) {
  return (
    <motion.div
      className={
        compact
          ? "w-full border-[3px] border-[#111] bg-[#f2eadc] px-4 py-3 shadow-[0_8px_0_rgba(17,17,17,0.12)]"
          : "w-full border-[3px] border-[#111] bg-[#f2eadc] px-8 py-5 shadow-[0_12px_0_rgba(17,17,17,0.12)]"
      }
      animate={reduce ? undefined : { rotate: [-1.2, -0.4, -1.2] }}
      transition={reduce ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <p
        className={
          compact
            ? "text-center font-display text-xl font-bold leading-tight tracking-tight text-[#111]"
            : "text-center font-display text-3xl font-bold leading-tight tracking-tight text-[#111]"
        }
      >
        GEEN GEWELD. <span className="text-[#c92a25]">WEL GERECHTIGHEID.</span>
      </p>
      <p className="mt-1 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-[#004c9d]">
        Niet vergeten · niet wegkijken
      </p>
    </motion.div>
  );
}

export function QuoteWall() {
  const reduce = useReducedMotion();

  return (
    <section className="border-y border-line bg-[#f2eee6] text-[#111]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-20 md:py-24 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#004c9d]">
          Uitspraken · 12 stemmen
        </p>
        <h2 className="mt-4 max-w-[16ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
          <WordReveal text="Twaalf stemmen op één plein." />
        </h2>
        <p className="mt-5 max-w-[62ch] leading-relaxed text-[#5c574e]">
          Mensen die naast elkaar lopen, achter één doek. Negen uitspraken uit de
          berichtgeving, met de bron bij de wolk.
        </p>

        {/* Desktop: één brede scène */}
        <div className="mt-9 hidden xl:block">
          <div className="relative h-[790px] w-full overflow-hidden rounded-xl border border-[#111]/20 bg-[#d9d0c2]">
            <ProtestVideo className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,29,0.24),transparent_30%,transparent_72%,rgba(8,17,29,0.5))]" />

            {[
              { left: "2%", top: "2%", rotate: "-1.4deg", width: 216 },
              { left: "26%", top: "3%", rotate: "1.2deg", width: 216 },
              { left: "50%", top: "2%", rotate: "1.6deg", width: 216 },
              { left: "74%", top: "3%", rotate: "-1.1deg", width: 216 },
              { left: "8%", top: "22%", rotate: "1deg", width: 216 },
              { left: "32%", top: "21%", rotate: "-1.6deg", width: 216 },
              { left: "56%", top: "23%", rotate: "1.4deg", width: 216 },
              { left: "80%", top: "21%", rotate: "-1.2deg", width: 216 },
              { left: "2%", top: "42%", rotate: "1.4deg", width: 216 },
              { left: "26%", top: "43%", rotate: "-1.2deg", width: 216 },
              { left: "50%", top: "42%", rotate: "1.1deg", width: 216 },
              { left: "74%", top: "43%", rotate: "-1.4deg", width: 216 },
            ].map((pos, index) => {
              const quote = SCENE[index];
              return (
                <div
                  key={quote.tekst}
                  className="absolute z-30"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    width: pos.width,
                    transform: `rotate(${pos.rotate})`,
                  }}
                >
                  <Bubbel quote={quote} index={index} reduce={reduce} />
                </div>
              );
            })}

            <div className="absolute bottom-[24px] left-1/2 z-20 w-[620px] -translate-x-1/2">
              <Spandoek reduce={reduce} />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(0deg,rgba(8,17,29,0.55),transparent)]" />
          </div>
        </div>

        {/* Mobiel/tablet: verticaal, geen horizontale scroll */}
        <div className="mt-9 xl:hidden">
          <div className="relative h-[420px] overflow-hidden rounded-xl border border-[#111]/20 bg-[#d9d0c2]">
            <ProtestVideo
              className="absolute inset-0 h-full w-full object-cover object-center"
              compact
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,29,0.18),transparent_45%,rgba(8,17,29,0.58))]" />
            <div className="absolute inset-x-4 bottom-4">
              <Spandoek reduce={reduce} compact />
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-xl bg-[#07090c] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.12)] sm:grid-cols-2">
            {SCENE.map((quote, index) => (
              <motion.article
                key={quote.tekst}
                className="rounded-xl border-2 border-[#111]/20 bg-[#fbf7f0] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
                animate={reduce ? undefined : { y: [0, -2, 0] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }
                }
              >
                <blockquote className="font-serif text-base leading-[1.25] tracking-tight">
                  “{quote.tekst}”
                </blockquote>
                <div className="mt-3 border-t border-[#111]/15 pt-2">
                  <p className="font-display text-sm font-semibold">{quote.wie}</p>
                  <p className="mt-0.5 text-[11px] text-[#5c574e]">{quote.waar}</p>
                  <a
                    href={quote.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-mono text-[9px] uppercase tracking-[0.08em] text-[#004c9d] underline underline-offset-2"
                  >
                    Bron: {quote.bron} →
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#5c574e]">
            Stockvideo: Coverr (vrij gebruik)
          </p>
          <a
            href="/overleden"
            className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#004c9d] underline underline-offset-4"
          >
            Alle namen en zaken →
          </a>
        </div>
      </div>
    </section>
  );
}
