import { NIEUWS_ARCHIEF, type NieuwsSoort } from "@/lib/nieuws-archief";
import { NIEUWS_GEOOGST } from "@/lib/nieuws-geoogst";
import { isPolitiegeweldNieuws } from "@/lib/nieuws-filter";
import { NL_PLAATSEN } from "@/lib/nl-plaatsen";

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

/* Koppel een live bericht aan een plaats als die in de tabel staat. */
function plaatsVoorTitel(titel: string): { plaats: string; lat: number; lng: number } | null {
  for (const naam of PLAATSNAMEN) {
    if (titel.includes(naam)) {
      const coord = NL_PLAATSEN[naam];
      return { plaats: naam, lat: coord[0], lng: coord[1] };
    }
  }
  const treffer = titel.match(/\b(?:in|te) ([A-Z][A-Za-zé'’-]{2,20})/);
  if (treffer && NL_PLAATSEN[treffer[1]]) {
    const coord = NL_PLAATSEN[treffer[1]];
    return { plaats: treffer[1], lat: coord[0], lng: coord[1] };
  }
  return null;
}

/* Live berichten grofweg indelen op onderwerp. */
function soortVoorLive(titel: string): NieuwsSoort {
  if (/overleed|overleden|doodgeschoten|dodelijk|dood/i.test(titel)) {
    return "overleden";
  }
  if (/(politie|agent)[^.]{0,60}(vervolgd|veroordeeld)|vervolging/i.test(titel)) {
    return "agent-vervolgd";
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
      ...(plaatsVoorTitel(titel) ?? {}),
    });
  }
  return berichten;
}

export async function GET() {
  const resultaten = await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const antwoord = await fetch(feed.url, {
          headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
          signal: AbortSignal.timeout(15_000),
          next: { revalidate: 1800 },
        });
        if (!antwoord.ok) return [];
        return parseFeed(await antwoord.text(), feed.bron);
      } catch {
        return [];
      }
    })
  );

  const live = resultaten.flat();
  const liveUrls = new Set(live.map((bericht) => bericht.url));
  const archiefUrls = new Set(NIEUWS_ARCHIEF.map((bericht) => bericht.url));

  const archief: Bericht[] = NIEUWS_ARCHIEF.filter(
    (bericht) => !liveUrls.has(bericht.url)
  ).map((bericht) => ({ ...bericht, live: false }));

  const geoogst: Bericht[] = NIEUWS_GEOOGST.filter(
    (bericht) => !liveUrls.has(bericht.url) && !archiefUrls.has(bericht.url)
  ).map((bericht) => ({ ...bericht, live: false }));

  const alles = [...live, ...archief, ...geoogst].sort((a, b) =>
    (b.datum || "").localeCompare(a.datum || "")
  );

  return Response.json(
    { berichten: alles, liveAantal: live.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}
