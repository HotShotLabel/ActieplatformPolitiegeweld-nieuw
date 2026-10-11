/* Registreert de zojuist geüploade uitzendopname: 30 dagen online,
   daarna verwijdert /api/live hem automatisch. */

import { getAdminDb } from "@/lib/firebase-admin";
import { bestaatObject, r2Ingesteld, sleutelGeldig } from "@/lib/r2";
import { haalYouTubeToken, youtubeIngesteld } from "@/lib/youtube";

export const maxDuration = 30;

/* Lichte rem tegen misbruik: per serverinstantie maximaal 10 per uur. */
const recent: number[] = [];
function magRegistreren(): boolean {
  const nu = Date.now();
  while (recent.length > 0 && nu - recent[0] > 60 * 60 * 1000) recent.shift();
  if (recent.length >= 10) return false;
  recent.push(nu);
  return true;
}

export async function POST(request: Request) {
  if (!magRegistreren()) {
    return Response.json(
      { fout: "Te veel registraties. Probeer het later opnieuw." },
      { status: 429 }
    );
  }

  let body: {
    sleutel?: string;
    titel?: string;
    duurSec?: number;
    grootteMb?: number;
  } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const sleutel = String(body.sleutel ?? "").trim();
  const titel = String(body.titel ?? "").trim().slice(0, 120) || "Live-uitzending";

  if (!r2Ingesteld() || !sleutelGeldig(sleutel)) {
    return Response.json({ fout: "Onbekende opslagplek." }, { status: 400 });
  }

  // Bestaat het bestand echt en is het video?
  const kop = await bestaatObject(sleutel);
  if (!kop.bestaat || !kop.soort.startsWith("video/")) {
    return Response.json(
      { fout: "De opname is nog niet klaar met uploaden." },
      { status: 409 }
    );
  }
  const grootteMb =
    Number(body.grootteMb ?? 0) || Math.round((kop.grootte / (1024 * 1024)) * 10) / 10;

  try {
    const db = getAdminDb();
    const nu = new Date();
    const verloopt = new Date(nu.getTime() + 30 * 86_400_000);
    const document = await db.collection("uitzendingen").add({
      titel,
      sleutel,
      grootteMb,
      duurSec: Number(body.duurSec ?? 0) || 0,
      toegevoegdOp: nu.toISOString(),
      verlooptOp: verloopt.toISOString(),
      logo: true,
    });

    // Mag de opname ook naar YouTube? Dan krijgt de uitzender hier het
    // toegangsbewijs meteen mee (eenmalig, hoort bij deze registratie).
    const youtubeToken = youtubeIngesteld() ? await haalYouTubeToken() : null;

    return Response.json({ ok: true, id: document.id, youtubeToken });
  } catch (fout) {
    console.error("live-registreer:", fout);
    return Response.json(
      { fout: "De opname kon niet worden geregistreerd." },
      { status: 502 }
    );
  }
}
