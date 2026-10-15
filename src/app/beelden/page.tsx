import type { Metadata } from "next";
import { connection } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { platformVan, youtubeId } from "@/lib/beelden";
import { BeeldenTip } from "@/components/beelden/beelden-tip";

export const metadata: Metadata = {
  title: "Beelden",
  description:
    "Verzamelde video's over politiegeweld in Nederland: YouTube, TikTok, Instagram, Telegram en tips, met bron per beeld.",
};

interface BeeldRij {
  id: string;
  url: string;
  platform: string;
  titel: string;
  toelichting: string;
  plaats: string;
  datum: string;
  bron: string;
}

async function haalBeelden(): Promise<BeeldRij[]> {
  try {
    const snapshot = await getAdminDb()
      .collection("beelden")
      .orderBy("toegevoegdOp", "desc")
      .limit(300)
      .get();

    return snapshot.docs
      .map((document) => {
        const data = document.data();
        const url = String(data.url ?? "");
        return {
          id: document.id,
          url,
          platform: String(data.platform ?? platformVan(url)),
          titel: String(data.titel ?? url),
          toelichting: String(data.toelichting ?? ""),
          plaats: String(data.plaats ?? ""),
          datum: String(data.datum ?? ""),
          bron: String(data.bron ?? ""),
          zichtbaar: data.zichtbaar === true,
        };
      })
      .filter((beeld) => beeld.zichtbaar)
      .map(({ zichtbaar: _zichtbaar, ...beeld }) => beeld);
  } catch (fout) {
    console.error("beelden-pagina:", fout);
    return [];
  }
}

export default async function BeeldenPage() {
  await connection();
  const beelden = await haalBeelden();

  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          Verzameling
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Beelden
        </h1>
        <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-muted">
          Video&apos;s over politiegeweld in Nederland, verzameld van YouTube,
          TikTok, Instagram en Telegram en aangevuld met tips. Alles linkt naar
          de originele bron; wij bewaren zelf geen videobestanden. Tips worden
          nagelopen voordat ze hier komen te staan.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-4 py-1.5 text-sm">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
          Let op: deze beelden kunnen heftig zijn.
        </p>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          {beelden.length} {beelden.length === 1 ? "video" : "video's"} op de
          pagina
        </p>

        {beelden.length === 0 ? (
          <div className="mt-4 rounded-xl border border-line bg-surface p-8 text-center">
            <p className="font-display text-lg font-semibold tracking-tight">
              Er staan nog geen beelden op de pagina.
            </p>
            <p className="mt-2 text-sm text-muted">
              Nieuwe beelden verschijnen hier na controle. Tip hieronder een
              video die erbij hoort.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {beelden.map((beeld) => {
              const ytId = youtubeId(beeld.url);
              return (
                <a
                  key={beeld.id}
                  href={beeld.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent/60"
                >
                  {ytId ? (
                    // Kleine omslagfoto van de video zelf (geen bestand bij ons).
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                      {beeld.platform}
                      {beeld.bron && beeld.bron !== "tip"
                        ? ` · ${beeld.bron}`
                        : ""}
                    </p>
                    <h2 className="mt-2 font-medium leading-snug">
                      {beeld.titel}
                    </h2>
                    {beeld.plaats || beeld.datum ? (
                      <p className="mt-1.5 text-xs text-muted-2">
                        {[beeld.plaats, beeld.datum].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                    {beeld.toelichting ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                        {beeld.toelichting}
                      </p>
                    ) : null}
                    <p className="mt-auto pt-3 text-xs text-muted-2 underline underline-offset-4 group-hover:text-foreground">
                      Bekijk bij de bron
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        <section className="mt-16 rounded-xl border border-line bg-surface p-7">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Zelf een video tipen
          </h2>
          <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-muted">
            Zag je ergens een filmpje van politiegeweld in Nederland (TikTok,
            Instagram, YouTube, Telegram, X)? Plak de link hier. Ook
            TikTok- en Instagram-lives kun je melden via het link-formulier op
            de{" "}
            <a
              href="/live"
              className="underline underline-offset-4 hover:text-foreground"
            >
              live-pagina
            </a>
            .
          </p>
          <div className="mt-6">
            <BeeldenTip />
          </div>
        </section>

        <p className="mt-14 max-w-[70ch] text-sm leading-relaxed text-muted-2">
          Werkwijze: YouTube wordt automatisch geoogst (openbare zoekresultaten),
          overige platforms komen via tips. Elk beeld wordt met de hand
          gecontroleerd op relevantie en herleidbaarheid voordat het zichtbaar
          wordt. Wij hosten niets: elke kaart linkt naar het originele bericht.
          Zie ook de{" "}
          <a
            href="/live"
            className="underline underline-offset-4 hover:text-muted"
          >
            live-pagina
          </a>{" "}
          en de{" "}
          <a
            href="/melden"
            className="underline underline-offset-4 hover:text-muted"
          >
            meldpagina
          </a>
          .
        </p>
      </div>
    </main>
  );
}
