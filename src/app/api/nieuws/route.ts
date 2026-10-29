import { createHash } from "crypto";
import { NIEUWS_ARCHIEF, type NieuwsSoort } from "@/lib/nieuws-archief";
import { NIEUWS_GEOOGST } from "@/lib/nieuws-geoogst";
import { NIEUWS_OFFICIEEL } from "@/lib/nieuws-officieel";
import { isPolitiegeweldNieuws } from "@/lib/nieuws-filter";
import { NL_PLAATSEN } from "@/lib/nl-plaatsen";
import { haalZoekBerichten } from "@/lib/exa-zoek";
import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 60;

const UA =
  "ActieplatformPolitiegeweld/1.0 (+https://actieplatform-politiegeweld-nieuw.vercel.app)";

/* Live feeds van Nederlandse nieuwsmedia: landelijk én regionaal. */
const FEEDS = [
  { bron: "NOS", url: "https://feeds.nos.nl/nosnieuwsalgemeen" },
  { bron: "NOS", url: "https://feeds.nos.nl/nosnieuwsbinnenland" },
  { bron: "NU.nl", url: "https://www.nu.nl/rss/Algemeen" },
  { bron: "NU.nl", url: "https://www.nu.nl/rss/Binnenland" },
  { bron: "AD", url: "https://www.ad.nl/rss.xml" },
  { bron: "De Telegraaf", url: "https://www.telegraaf.nl/rss" },
  { bron: "RTV Noord", url: "https://www.rtvnoord.nl/rss" },
  { bron: "RTV Drenthe", url: "https://www.rtvdrenthe.nl/rss/index.xml" },
  { bron: "Omrop Fryslân", url: "https://www.omropfryslan.nl/rss/nieuws" },
  { bron: "RTV Oost", url: "https://www.rtvoost.nl/rss" },
  { bron: "Omroep Gelderland", url: "https://www.gld.nl/rss" },
  { bron: "RTV Utrecht", url: "https://www.rtvutrecht.nl/rss/nieuws.xml" },
  { bron: "Omroep West", url: "https://www.omroepwest.nl/rss/nieuws" },
  { bron: "Rijnmond", url: "https://www.rijnmond.nl/rss/nieuws" },
  { bron: "Omroep Brabant", url: "https://www.omroepbrabant.nl/rss" },
  { bron: "Omroep Zeeland", url: "https://www.omroepzeeland.nl/rss/nieuws" },
  { bron: "L1", url: "https://www.l1.nl/rss/nieuws" },
  { bron: "Blik op Nieuws", url: "https://www.blikopnieuws.nl/feeds/1841/rss.xml" },
  // DPG-regiokranten en AD (stedelijke berichtgeving)
  { bron: "AD", url: "https://www.ad.nl/nieuws/rss.xml" },
  { bron: "De Gelderlander", url: "https://www.gelderlander.nl/nieuws/rss.xml" },
  { bron: "De Stentor", url: "https://www.destentor.nl/nieuws/rss.xml" },
  { bron: "Tubantia", url: "https://www.tubantia.nl/nieuws/rss.xml" },
  { bron: "Brabants Dagblad", url: "https://www.bd.nl/nieuws/rss.xml" },
  { bron: "Eindhovens Dagblad", url: "https://www.ed.nl/nieuws/rss.xml" },
  { bron: "PZC", url: "https://www.pzc.nl/nieuws/rss.xml" },
  { bron: "BN DeStem", url: "https://www.bndestem.nl/nieuws/rss.xml" },
  // Lokale en stedelijke nieuws- en burgerjournalistieksites
  { bron: "Sleutelstad", url: "https://www.sleutelstad.nl/feed" },
  { bron: "De Orkaan", url: "https://www.deorkaan.nl/feed" },
  { bron: "OPEN Rotterdam", url: "https://www.openrotterdam.nl/feed" },
  { bron: "DUIC", url: "https://www.duic.nl/rss" },
  { bron: "Oost", url: "https://www.oost.nl/rss" },
  // 112- en misdaadnieuws
  { bron: "112 Nederland", url: "https://www.112nederland.nl/rss" },
  { bron: "112 Vandaag", url: "https://www.112vdg.nl/rss" },
  { bron: "Crime Nieuws", url: "https://www.crime-nieuws.nl/feed" },
  { bron: "112 Fryslân", url: "https://www.112fryslan.nl/rss" },
  { bron: "Fryn", url: "https://www.fryn.nl/rss" },
  { bron: "112 Nieuws", url: "https://www.112nieuws.net/rss" },
  { bron: "112 Drachten", url: "https://www.112drachten.nl/rss" },
];

/* Alleen berichten die echt over politiegeweld of grensoverschrijdend
   politieoptreden gaan; zie lib/nieuws-filter.ts. */

export interface Bericht {
  titel: string;
  bron: string;
  url: string;
  datum: string;
  live: boolean;
  soort: NieuwsSoort;
  auteur?: string;
  plaats?: string;
  lat?: number;
  lng?: number;
}

const PLAATSNAMEN = Object.keys(NL_PLAATSEN).sort((a, b) => b.length - a.length);

/* Namen die bijna altijd verkeerd vallen: het dorp "Nederland" in een
   landelijk artikel, het dorp "Een" op het lidwoord. */
const PLAATS_BLOKLIJST = new Set(["Nederland", "Een"]);

function escapeRegex(tekst: string) {
  return tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* Koppel een live bericht aan een plaats als die in de tabel staat.
   Korte namen alleen op woordgrens (anders matcht "Berg" in elk woord);
   langere namen mogen ook als deel van een afleiding (Rotterdammer). */
function plaatsVoorTitel(titel: string): { plaats: string; lat: number; lng: number } | null {
  for (const naam of PLAATSNAMEN) {
    if (PLAATS_BLOKLIJST.has(naam)) continue;
    let gevonden = false;
    if (naam.length >= 8) {
      gevonden = titel.includes(naam);
    } else {
      gevonden = new RegExp(`(^|\\W)${escapeRegex(naam)}(\\W|$)`).test(titel);
    }
    if (gevonden) {
      const coord = NL_PLAATSEN[naam];
      return { plaats: naam, lat: coord[0], lng: coord[1] };
    }
  }
  return null;
}

/* Plaats uit de openingszin van een feed-beschrijving. Alleen het begin,
   zodat menu's en zijbalken geen valse plaatsen opleveren. */
function plaatsVoorLead(tekst: string): { plaats: string; lat: number; lng: number } | null {
  if (!tekst) return null;
  return plaatsVoorTitel(tekst.slice(0, 200));
}

/* Live berichten grofweg indelen op onderwerp. */
function soortVoorLive(titel: string): NieuwsSoort {
  if (/overleed|overleden|doodgeschoten|dodelijk|dood/i.test(titel)) {
    return "overleden";
  }
  if (/(politie|agent)[^.]{0,60}(vervolgd|veroordeeld)|vervolging/i.test(titel)) {
    return "agent-vervolgd";
  }
  if (
    /(politiegeweld|geweldsexces|mishandel|geslagen|slaat|sloeg|schopt|schopte|trapt|trapte|duwt|duwde|sleurt|sleurde|wurgt|verwurgt|nekklem|klemgreep|taser|pepperspray|wapenstok|vuurwapen|schiet|schoot|schoten|neergeschoten|doodgeschoten)/i.test(
      titel
    )
  ) {
    return "geweld";
  }
  if (
    /(politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor|aanrijding|geschept|aangereden|overreden|ongeval|ongeluk|botsing|schepte|achtervolging)/i.test(
      titel
    )
  ) {
    return "gevaar";
  }
  return "overig";
}

function ontstrip(tekst: string) {
  return tekst
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFeed(xml: string, bron: string): Bericht[] {
  const berichten: Bericht[] = [];
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  for (const item of items) {
    const titelMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/);
    const datumMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/);
    const omsMatch = item.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    if (!titelMatch || !linkMatch) continue;
    const titel = ontstrip(titelMatch[1]);
    const url = ontstrip(linkMatch[1]);
    const oms = omsMatch ? ontstrip(omsMatch[1]) : "";
    if (!titel || !url.startsWith("http")) continue;
    if (!isPolitiegeweldNieuws(`${titel} ${oms}`)) continue;
    let datum = "";
    if (datumMatch) {
      const parsed = new Date(ontstrip(datumMatch[1]));
      if (!Number.isNaN(parsed.getTime())) {
        datum = parsed.toISOString().slice(0, 10);
      }
    }
    berichten.push({
      titel,
      bron,
      url,
      datum,
      live: true,
      soort: soortVoorLive(titel),
      ...(plaatsVoorTitel(titel) ?? plaatsVoorLead(oms) ?? {}),
    });
  }
  return berichten;
}

export async function GET() {
  const [rssResultaten, zoekBerichten] = await Promise.all([
    Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const antwoord = await fetch(feed.url, {
            headers: {
              "User-Agent": UA,
              Accept: "application/rss+xml, application/xml, text/xml",
            },
            signal: AbortSignal.timeout(15_000),
            next: { revalidate: 1800 },
          });
          if (!antwoord.ok) return [];
          return parseFeed(await antwoord.text(), feed.bron);
        } catch {
          return [];
        }
      })
    ),
    haalZoekBerichten(),
  ]);

  // Doorlopende zoekvondsten opslaan zodat alles wat nieuw is bewaard blijft
  // en de lijst zichzelf opbouwt (de database groeit vanzelf).
  let opgeslagen: Bericht[] = [];
  try {
    const db = getAdminDb();
    const verzameling = db.collection("nieuws");
    const snapshot = await verzameling.orderBy("datum", "desc").limit(200).get();
    opgeslagen = snapshot.docs.map((document) => {
      const data = document.data();
      const bericht: Bericht = {
        titel: String(data.titel ?? ""),
        bron: String(data.bron ?? ""),
        url: String(data.url ?? ""),
        datum: String(data.datum ?? ""),
        live: false,
        // Classificatie dynamisch uit de titel, zodat opgeslagen berichten
        // meegaan met verbeterde categorieën (geweld/gevaar).
        soort: soortVoorLive(String(data.titel ?? "")),
      };
      if (data.auteur) bericht.auteur = String(data.auteur);
      if (data.plaats) bericht.plaats = String(data.plaats);
      if (typeof data.lat === "number") bericht.lat = data.lat;
      if (typeof data.lng === "number") bericht.lng = data.lng;
      return bericht;
    }).filter((bericht) => isPolitiegeweldNieuws(bericht.titel));

    const bekend = new Set(opgeslagen.map((bericht) => bericht.url));
    const nieuwe = zoekBerichten.filter((bericht) => !bekend.has(bericht.url));
    if (nieuwe.length > 0) {
      const batch = db.batch();
      for (const bericht of nieuwe) {
        const id = createHash("sha1").update(bericht.url).digest("hex").slice(0, 32);
        const plaats = plaatsVoorTitel(bericht.titel);
        batch.set(
          verzameling.doc(id),
          {
            titel: bericht.titel,
            bron: bericht.bron,
            url: bericht.url,
            datum: bericht.datum,
            auteur: bericht.auteur ?? "",
            soort: soortVoorLive(bericht.titel),
            plaats: plaats?.plaats ?? "",
            lat: plaats?.lat ?? null,
            lng: plaats?.lng ?? null,
          },
          { merge: true }
        );
      }
      await batch.commit();
      opgeslagen = [
        ...nieuwe.map((bericht) => ({
          titel: bericht.titel,
          bron: bericht.bron,
          url: bericht.url,
          datum: bericht.datum,
          live: false,
          soort: soortVoorLive(bericht.titel),
          ...(bericht.auteur ? { auteur: bericht.auteur } : {}),
          ...(plaatsVoorTitel(bericht.titel) ?? {}),
        })),
        ...opgeslagen,
      ];
    }
  } catch (fout) {
    console.error("Nieuws opslaan mislukte:", fout);
  }

  const nu = Date.now();
  const metLiveVlag = (bericht: Bericht, basis: boolean): Bericht => ({
    ...bericht,
    live:
      basis ||
      (bericht.datum !== "" &&
        nu - new Date(`${bericht.datum}T12:00:00Z`).getTime() < 3 * 86_400_000),
  });

  const gezienLive = new Set<string>();
  const live: Bericht[] = [];
  const voegLiveToe = (bericht: Bericht) => {
    if (!bericht.url || gezienLive.has(bericht.url)) return;
    gezienLive.add(bericht.url);
    live.push(bericht);
  };

  /* Verrijkte plaatsen uit de geoogste set doorwerken op dubbels: staat
     hetzelfde artikel ook als live- of opgeslagen bericht zonder plaats,
     dan krijgt die versie de plaats alsnog. */
  const plaatsPerUrl = new Map<
    string,
    { plaats: string; lat: number; lng: number }
  >();
  for (const bericht of NIEUWS_GEOOGST) {
    if (typeof bericht.lat === "number" && typeof bericht.lng === "number") {
      plaatsPerUrl.set(bericht.url, {
        plaats: bericht.plaats ?? "",
        lat: bericht.lat,
        lng: bericht.lng,
      });
    }
  }
  const metPlaatsBij = <T extends { url: string; lat?: number }>(bericht: T): T => {
    if (typeof bericht.lat === "number") return bericht;
    const extra = plaatsPerUrl.get(bericht.url);
    return extra ? { ...bericht, ...extra } : bericht;
  };

  rssResultaten.flat().forEach((bericht) =>
    voegLiveToe(metLiveVlag(metPlaatsBij(bericht), true))
  );
  opgeslagen.forEach((bericht) =>
    voegLiveToe(metLiveVlag(metPlaatsBij(bericht), false))
  );
  /* Officiële bronnen zonder RSS: OM, Rechtspraak, Politie, Rijksoverheid
     en Inspectie JenV. De lijst komt uit scripts/officiele-nieuws.py. */
  NIEUWS_OFFICIEEL.forEach((bericht) =>
    voegLiveToe(
      metLiveVlag(
        metPlaatsBij({
          ...bericht,
          live: false,
          soort: soortVoorLive(bericht.titel),
        }),
        false
      )
    )
  );  zoekBerichten.forEach((bericht) =>
    voegLiveToe({
      titel: bericht.titel,
      bron: bericht.bron,
      url: bericht.url,
      datum: bericht.datum,
      live: bericht.live,
      soort: soortVoorLive(bericht.titel),
      auteur: bericht.auteur,
      ...(plaatsVoorTitel(bericht.titel) ?? {}),
    })
  );

  const liveUrls = gezienLive;
  const archiefUrls = new Set(NIEUWS_ARCHIEF.map((bericht) => bericht.url));

  const archief: Bericht[] = NIEUWS_ARCHIEF.filter(
    (bericht) => !liveUrls.has(bericht.url)
  ).map((bericht) => ({ ...metPlaatsBij(bericht), live: false }));

  const geoogst: Bericht[] = NIEUWS_GEOOGST.filter(
    (bericht) => !liveUrls.has(bericht.url) && !archiefUrls.has(bericht.url)
  ).map((bericht) => ({ ...bericht, live: false }));

  const alles = [...live, ...archief, ...geoogst].sort((a, b) =>
    (b.datum || "").localeCompare(a.datum || "")
  );

  return Response.json(
    {
      berichten: alles,
      liveAantal: alles.filter((bericht) => bericht.live).length,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
