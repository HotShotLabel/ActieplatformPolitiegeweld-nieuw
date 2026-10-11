import { NIEUWS_ARCHIEF, type NieuwsSoort } from "@/lib/nieuws-archief";

export const maxDuration = 60;

const UA =
  "ActieplatformPolitiegeweld/1.0 (+https://actieplatform-politiegeweld-nieuw.vercel.app)";

/* Live feeds van Nederlandse nieuwsmedia (eigen RSS-feeds). */
const FEEDS = [
  { bron: "NOS", url: "https://feeds.nos.nl/nosnieuwsalgemeen" },
  { bron: "NOS", url: "https://feeds.nos.nl/nosnieuwsbinnenland" },
  { bron: "NU.nl", url: "https://www.nu.nl/rss/Algemeen" },
  { bron: "NU.nl", url: "https://www.nu.nl/rss/Binnenland" },
  { bron: "AD", url: "https://www.ad.nl/rss.xml" },
  { bron: "De Telegraaf", url: "https://www.telegraaf.nl/rss" },
];

/* Alleen berichten die echt over politiegeweld of politieoptreden gaan. */
const RELEVANT =
  /politiegeweld|rijksrecherche|(politie|politieagent|agent|agenten|verbalisant)[^.]{0,80}(geweld|aanhouding|aangehouden|overleden|overleed|dood|dodelijk|mishandel|geschoten|schiet|nekklem|achtervolging|stroomstoot|taser|pepperspray|wapenstok|politiecel|cel|bureau)/i;

export interface Bericht {
  titel: string;
  bron: string;
  url: string;
  datum: string;
  live: boolean;
  soort: NieuwsSoort;
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
    if (!RELEVANT.test(`${titel} ${oms}`)) continue;
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

  const archief: Bericht[] = NIEUWS_ARCHIEF.filter(
    (bericht) => !liveUrls.has(bericht.url)
  ).map((bericht) => ({ ...bericht, live: false }));

  const alles = [...live, ...archief].sort((a, b) =>
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
