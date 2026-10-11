/* Doorlopende zoekopdrachten: haalt automatisch nieuwe berichten op via de
   Exa-zoekservice (MCP, zonder sleutel). Elke keer dat de nieuws-API
   ververst, worden een paar zoektermen gedraaid; zo komt alles wat nieuw is
   vanzelf binnen, zonder handwerk. */

import { isPolitiegeweldNieuws } from "@/lib/nieuws-filter";
import { bronVoorUrl } from "@/lib/nieuws-bronnen";

const MCP = "https://mcp.exa.ai/mcp";
const UA = "Mozilla/5.0 ActieplatformPolitiegeweld";

/* Dezelfde zoektermen als het oogst-script; per verversing draait er een
   aansluitend blok, zodat alle termen door de tijd heen langskomen. */
const ZOEKTERMEN = [
  "politiegeweld",
  "politie geweld aanhouding",
  "overleden na aanhouding politie",
  "doodgeschoten door politie",
  "politie schiet slachtoffer",
  "politieagent veroordeeld geweld",
  "politieagent vervolgd",
  "rijksrecherche onderzoek politie",
  "politie mishandeling arrestant",
  "nekklem politie",
  "politie taser geweld incident",
  "dodelijk politieoptreden",
  "politiegeweld demonstratie",
  "geweld tegen politieagent",
  "agent mishandeld aanhouding",
  "politie achtervolging dodelijk ongeval",
  "politie aansprakelijk geweld",
  "artikel 12 Sv politie",
];

const PER_RONDE = 4;

export interface ExaBericht {
  titel: string;
  bron: string;
  url: string;
  datum: string;
  auteur?: string;
  live: boolean;
}

async function startSessie(): Promise<string | null> {
  try {
    const antwoord = await fetch(MCP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "User-Agent": UA,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "actieplatform", version: "1.0" },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    return antwoord.headers.get("mcp-session-id");
  } catch {
    return null;
  }
}

function parseResultaten(tekst: string) {
  const items: { titel: string; url: string; datum: string; auteur?: string }[] = [];
  for (const blok of tekst.split(/\n?Title: /).slice(1)) {
    const titel = blok.split("\n", 1)[0].trim();
    const urlMatch = blok.match(/\nURL:\s*(\S+)/);
    const datumMatch = blok.match(/\nPublished:\s*(\S+)/);
    const auteurMatch = blok.match(/\nAuthor:\s*(.+)/);
    if (!titel || !urlMatch) continue;
    const datum = datumMatch ? datumMatch[1].slice(0, 10) : "";
    const auteur = auteurMatch ? auteurMatch[1].trim() : "";
    items.push({
      titel,
      url: urlMatch[1].trim(),
      datum: datum.startsWith("N/A") ? "" : datum,
      auteur: ["N/A", "Unknown", "N/A "].includes(auteur) ? undefined : auteur,
    });
  }
  return items;
}

async function zoek(sessie: string, term: string, id: number) {
  try {
    const antwoord = await fetch(MCP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "User-Agent": UA,
        "Mcp-Session-Id": sessie,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: { name: "web_search_exa", arguments: { query: term, numResults: 50 } },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const tekst = await antwoord.text();
    for (const regel of tekst.split("\n")) {
      if (!regel.startsWith("data: ")) continue;
      const data = JSON.parse(regel.slice(6));
      const inhoud = data?.result?.content?.[0]?.text;
      if (typeof inhoud === "string") return parseResultaten(inhoud);
    }
  } catch {
    // stil: deze term levert dan niets op
  }
  return [];
}

export async function haalZoekBerichten(): Promise<ExaBericht[]> {
  const sessie = await startSessie();
  if (!sessie) return [];

  const uurBlok = Math.floor(Date.now() / 3_600_000);
  const begin = (uurBlok * PER_RONDE) % ZOEKTERMEN.length;
  const termen = Array.from(
    { length: PER_RONDE },
    (_, i) => ZOEKTERMEN[(begin + i) % ZOEKTERMEN.length]
  );

  const gezien = new Set<string>();
  const uit: ExaBericht[] = [];
  let id = 10;
  for (const term of termen) {
    const items = await zoek(sessie, term, id);
    id += 1;
    for (const item of items) {
      const sleutel = item.url.replace(/\/$/, "");
      if (gezien.has(sleutel)) continue;
      gezien.add(sleutel);
      if (!isPolitiegeweldNieuws(item.titel)) continue;
      const bron = bronVoorUrl(item.url);
      if (!bron) continue;
      const recent =
        item.datum !== "" &&
        Date.now() - new Date(`${item.datum}T12:00:00Z`).getTime() < 3 * 86_400_000;
      uit.push({ ...item, bron, live: recent });
    }
  }
  return uit;
}
