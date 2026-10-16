/* Koppelingen zoeken: één zoekterm (dienstnummer, naam, kenteken, eenheid,
   plaats) tegen al onze eigen gegevens: meldingen, beelden en rechtszaken.
   Zo zie je of hetzelfde kenmerk in meerdere zaken terugkomt. Bevestigen
   doet de beheerder met de hand; dit register koppelt niets automatisch
   en gebruikt geen biometrie. */

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { heeftToegang } from "@/lib/beheer-auth";
import { AGENT_ZAKEN, OVERIGE_AGENT_ZAKEN } from "@/lib/agent-zaken";

export const maxDuration = 30;

function bevat(waarde: unknown, term: string): boolean {
  return String(waarde ?? "").toLowerCase().includes(term);
}

export async function GET(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  const term = String(request.nextUrl.searchParams.get("zoek") ?? "")
    .trim()
    .toLowerCase();
  if (term.length < 2) {
    return Response.json(
      { fout: "Vul minimaal twee tekens in." },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();
    const [meldingenSnap, beeldenSnap] = await Promise.all([
      db.collection("meldingen").orderBy("createdAt", "desc").limit(1000).get(),
      db.collection("beelden").orderBy("toegevoegdOp", "desc").limit(1000).get(),
    ]);

    const meldingen = meldingenSnap.docs
      .filter((doc) => {
        const d = doc.data();
        return [
          d.plaats,
          d.beschrijving,
          d.agentNaam,
          d.dienstnummers,
          d.kentekens,
          d.agentBeschrijving,
          d.notitie,
          d.eenheid,
          d.soortAgent,
        ].some((waarde) => bevat(waarde, term));
      })
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          plaats: String(d.plaats ?? ""),
          datum: String(d.datum ?? ""),
          beschrijving: String(d.beschrijving ?? "").slice(0, 200),
          agent: [d.agentNaam, d.dienstnummers, d.kentekens]
            .filter(Boolean)
            .join(" · "),
          eenheid: String(d.eenheid ?? ""),
        };
      });

    const beelden = beeldenSnap.docs
      .filter((doc) => {
        const d = doc.data();
        return [d.titel, d.toelichting, d.bron, d.agentKenmerk, d.plaats].some(
          (waarde) => bevat(waarde, term)
        );
      })
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          titel: String(d.titel ?? ""),
          bron: String(d.bron ?? ""),
          url: String(d.url ?? ""),
          agentKenmerk: String(d.agentKenmerk ?? ""),
        };
      });

    const zaken = AGENT_ZAKEN.filter((zaak) =>
      [
        zaak.titel,
        zaak.plaats,
        zaak.eenheid,
        zaak.uitkomst,
        String(zaak.jaar),
        zaak.bronLabel,
      ].some((waarde) => bevat(waarde, term))
    ).map((zaak) => ({
      id: zaak.id,
      titel: zaak.titel,
      plaats: zaak.plaats,
      jaar: zaak.jaar,
      uitkomst: zaak.uitkomst,
    }));

    const overige = OVERIGE_AGENT_ZAKEN.filter(
      (zaak) => bevat(zaak.omschrijving, term) || bevat(zaak.ecli, term)
    ).map((zaak) => ({
      ecli: zaak.ecli,
      datum: zaak.datum,
      omschrijving: zaak.omschrijving,
    }));

    return Response.json({ meldingen, beelden, zaken, overige });
  } catch (fout) {
    console.error("koppelingen zoeken:", fout);
    return Response.json({ fout: "Zoeken mislukte." }, { status: 500 });
  }
}
