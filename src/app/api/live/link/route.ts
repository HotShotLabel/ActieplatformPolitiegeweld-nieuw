/* Iemand zet zijn eigen live-link (TikTok, YouTube, Instagram) op onze
   site. Gratis, geen account. De link blijft 48 uur staan en gaat
   daarna automatisch weg. */

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 30;

const LIMIET_PER_UUR = 5;
const BEWAAR_UREN = 48;

const bezoekers = new Map<string, { aantal: number; resetOp: number }>();

function toegestaan(ip: string): boolean {
  const nu = Date.now();
  const bezoeker = bezoekers.get(ip);
  if (!bezoeker || bezoeker.resetOp < nu) {
    bezoekers.set(ip, { aantal: 1, resetOp: nu + 3_600_000 });
    if (bezoekers.size > 5000) {
      for (const [sleutel, waarde] of bezoekers) {
        if (waarde.resetOp < nu) bezoekers.delete(sleutel);
      }
    }
    return true;
  }
  if (bezoeker.aantal >= LIMIET_PER_UUR) return false;
  bezoeker.aantal += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (!toegestaan(ip)) {
    return Response.json(
      {
        fout: "Je hebt het maximum voor nu bereikt. Probeer het over een uur weer.",
      },
      { status: 429 }
    );
  }

  let invoer: Record<string, unknown>;
  try {
    invoer = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  // Honingpot: alleen bots vullen dit in.
  if (String(invoer.honing ?? "").trim() !== "") {
    return Response.json({ ok: true });
  }

  const ruweUrl = String(invoer.url ?? "").trim();
  const titel = String(invoer.titel ?? "").trim().slice(0, 120);
  const naam = String(invoer.naam ?? "").trim().slice(0, 40);

  if (titel.length < 3) {
    return Response.json(
      { fout: "Geef een korte titel (minimaal 3 tekens)." },
      { status: 400 }
    );
  }

  let adres: URL;
  try {
    adres = new URL(ruweUrl);
  } catch {
    return Response.json({ fout: "Dat is geen geldige link." }, { status: 400 });
  }
  if (adres.protocol !== "https:" && adres.protocol !== "http:") {
    return Response.json({ fout: "Dat is geen geldige link." }, { status: 400 });
  }
  if (ruweUrl.length > 500) {
    return Response.json({ fout: "De link is te lang." }, { status: 400 });
  }

  const host = adres.hostname.replace(/^www\./, "");

  try {
    const db = getAdminDb();
    // Staat hij er al?
    const bestaand = await db
      .collection("livelinks")
      .where("url", "==", ruweUrl)
      .limit(1)
      .get();
    if (!bestaand.empty) {
      return Response.json(
        { fout: "Deze link staat er al bij." },
        { status: 409 }
      );
    }

    const nu = new Date();
    const verloopt = new Date(nu.getTime() + BEWAAR_UREN * 3_600_000);
    const document = await db.collection("livelinks").add({
      url: ruweUrl,
      host,
      titel,
      naam,
      toegevoegdOp: nu.toISOString(),
      verlooptOp: verloopt.toISOString(),
    });
    return Response.json({ ok: true, id: document.id });
  } catch (fout) {
    console.error("live-link:", fout);
    return Response.json(
      { fout: "De link kon niet worden opgeslagen. Probeer het opnieuw." },
      { status: 502 }
    );
  }
}
