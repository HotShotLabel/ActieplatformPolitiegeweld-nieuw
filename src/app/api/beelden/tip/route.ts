/* Een video tipen voor de beelden-pagina. Komt binnen als verborgen tip;
   het beheer zet hem zichtbaar na controle. */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { isHttpUrl, platformVan } from "@/lib/beelden";

export const maxDuration = 30;

const LIMIET_PER_UUR = 5;

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
      { fout: "Je hebt het maximum voor nu bereikt. Probeer het over een uur weer." },
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

  const url = String(invoer.url ?? "").trim().slice(0, 500);
  const titel = String(invoer.titel ?? "").trim().slice(0, 150);
  const toelichting = String(invoer.toelichting ?? "").trim().slice(0, 1000);
  const plaats = String(invoer.plaats ?? "").trim().slice(0, 120);
  const datum = String(invoer.datum ?? "").trim().slice(0, 40);

  if (!isHttpUrl(url)) {
    return Response.json(
      { fout: "Vul een geldige link in (beginnend met https://)." },
      { status: 400 }
    );
  }
  if (titel.length < 3) {
    return Response.json(
      { fout: "Geef een korte titel of omschrijving (minimaal 3 tekens)." },
      { status: 400 }
    );
  }

  try {
    await getAdminDb().collection("beelden").add({
      url,
      platform: platformVan(url),
      titel,
      toelichting,
      plaats,
      datum,
      bron: "tip",
      zichtbaar: false,
      toegevoegdOp: FieldValue.serverTimestamp(),
    });
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("beeld-tip opslaan:", fout);
    return Response.json(
      { fout: "Opslaan mislukte. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
