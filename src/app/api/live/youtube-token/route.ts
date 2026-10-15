/* Een kort YouTube-toegangsbewijs voor één bepaalde uitzending.
   Alleen als die uitzending bestaat en nog niet op YouTube staat. */

import { getAdminDb } from "@/lib/firebase-admin";
import { haalYouTubeToken, youtubeIngesteld } from "@/lib/youtube";
import { heeftToegang } from "@/lib/beheer-auth";

export const maxDuration = 30;

/* Lichte rem: maximaal 8 per uur per serverinstantie. */
const recent: number[] = [];
function mag(): boolean {
  const nu = Date.now();
  while (recent.length > 0 && nu - recent[0] > 60 * 60 * 1000) recent.shift();
  if (recent.length >= 8) return false;
  recent.push(nu);
  return true;
}

export async function POST(request: Request) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }
  if (!youtubeIngesteld()) {
    return Response.json(
      { fout: "De YouTube-koppeling is nog niet ingesteld." },
      { status: 503 }
    );
  }
  if (!mag()) {
    return Response.json(
      { fout: "Te veel aanvragen. Probeer het later opnieuw." },
      { status: 429 }
    );
  }

  let body: { id?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }
  const id = String(body.id ?? "").trim();
  if (!id || id.includes("/")) {
    return Response.json({ fout: "Onbekende uitzending." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const doc = await db.collection("uitzendingen").doc(id).get();
    if (!doc.exists) {
      return Response.json({ fout: "Deze uitzending bestaat niet." }, { status: 404 });
    }
    if (doc.data()?.youtubeUrl) {
      return Response.json(
        { fout: "Deze uitzending staat al op YouTube." },
        { status: 409 }
      );
    }
    const token = await haalYouTubeToken();
    if (!token) {
      return Response.json(
        { fout: "Geen YouTube-toegang. Controleer de koppeling." },
        { status: 502 }
      );
    }
    return Response.json({ token });
  } catch (fout) {
    console.error("youtube-token-route:", fout);
    return Response.json(
      { fout: "Er ging iets mis bij het ophalen van de toegang." },
      { status: 502 }
    );
  }
}
