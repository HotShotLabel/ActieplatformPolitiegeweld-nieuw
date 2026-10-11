/* Overledenen na politieoptreden: haalt de openbare database van Controle
   Alt Delete dagelijks automatisch op (met stadscoördinaten uit onze
   plaatsentabel) zodat de kaartlaag vanzelf actueel blijft. */

import { NL_PLAATSEN } from "@/lib/nl-plaatsen";

export const maxDuration = 60;

const BRON = "https://overleden.controlealtdelete.nl/data.json";
const UA =
  "ActieplatformPolitiegeweld/1.0 (+https://actieplatform-politiegeweld-nieuw.vercel.app)";

const NAAM_FIX: Record<string, string> = {
  Heereveen: "Heerenveen",
  "Den Bosch": "'s-Hertogenbosch",
  Ijmuiden: "IJmuiden",
};

const HANDMATIG: Record<string, [number, number]> = {
  "Mol (België)": [51.191, 5.1156],
};

export interface OverledenZaak {
  id: string;
  jaar: string;
  plaats: string;
  lat: number;
  lng: number;
  geweld: string;
  geschoten: string;
  vervolgd: string;
  veroordeeld: string;
  status: string;
  bronUrl: string;
  bronLabel: string;
}

export async function GET() {
  try {
    const antwoord = await fetch(BRON, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(30_000),
      next: { revalidate: 86400 },
    });
    if (!antwoord.ok) throw new Error(`status ${antwoord.status}`);
    const data = await antwoord.json();
    const mensen: Record<string, unknown>[] = Array.isArray(data?.people)
      ? data.people
      : [];

    const perPlaats: Record<string, number> = {};
    const zaken: OverledenZaak[] = [];
    const zonderPlaatsLijst: {
      id: string;
      jaar: string;
      status: string;
      bronUrl: string;
      bronLabel: string;
    }[] = [];
    const bronStandaard =
      String(data?.common?.link ?? "") ||
      "https://controlealtdelete.nl/dossier-politiedoden/";

    for (const mens of mensen) {
      const ruweStad = String(mens.city ?? "").trim();
      const artikel = String(mens.article_link ?? "").trim();
      if (!ruweStad || ruweStad === "Plaats onbekend") {
        zonderPlaatsLijst.push({
          id: String(mens.case_nr ?? ""),
          jaar: String(mens.year ?? ""),
          status: String(mens.investigation_status ?? ""),
          bronUrl: artikel || bronStandaard,
          bronLabel: artikel ? "nieuwsbericht" : "database Controle Alt Delete",
        });
        continue;
      }
      const stad = NAAM_FIX[ruweStad] ?? ruweStad;
      const coord = NL_PLAATSEN[stad] ?? HANDMATIG[stad];
      if (!coord) {
        zonderPlaatsLijst.push({
          id: String(mens.case_nr ?? ""),
          jaar: String(mens.year ?? ""),
          status: String(mens.investigation_status ?? ""),
          bronUrl: artikel || bronStandaard,
          bronLabel: artikel ? "nieuwsbericht" : "database Controle Alt Delete",
        });
        continue;
      }
      const index = perPlaats[stad] ?? 0;
      perPlaats[stad] = index + 1;
      let lat = coord[0];
      let lng = coord[1];
      if (index > 0) {
        const hoek = index * 2.39996;
        const straal = Math.min(0.004 + index * 0.0022, 0.03);
        lat += Math.sin(hoek) * straal;
        lng += Math.cos(hoek) * straal;
      }
      zaken.push({
        id: String(mens.case_nr ?? ""),
        jaar: String(mens.year ?? ""),
        plaats: stad,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        geweld: String(mens.police_violence ?? "Onbekend"),
        geschoten: String(mens.is_shot ?? "Onbekend"),
        vervolgd: String(mens.officer_persecuted ?? "Onbekend"),
        veroordeeld: String(mens.officer_convicted ?? "Onbekend"),
        status: String(mens.investigation_status ?? ""),
        bronUrl: artikel || bronStandaard,
        bronLabel: artikel ? "nieuwsbericht" : "database Controle Alt Delete",
      });
    }

    return Response.json(
      {
        zaken,
        totaal: mensen.length,
        metPlaats: zaken.length,
        zonderPlaats: zonderPlaatsLijst,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (fout) {
    console.error("Overledenen ophalen mislukte:", fout);
    return Response.json(
      { zaken: [], fout: "De lijst is even niet beschikbaar." },
      { status: 502 }
    );
  }
}
