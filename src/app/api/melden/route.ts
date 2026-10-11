import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 30;

const SOORTEN = ["aanhouding", "demonstratie", "cel", "profileren", "anders"];
const LIMIET_PER_UUR = 10;

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

function rondeCoordinaat(waarde: number): number {
  return Math.round(waarde * 100) / 100;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (!toegestaan(ip)) {
    return Response.json(
      {
        fout: "Je hebt het maximum aantal meldingen voor nu bereikt. Probeer het over een uur weer.",
      },
      { status: 429 }
    );
  }

  let lichaam: string;
  try {
    lichaam = await request.text();
  } catch {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }
  if (lichaam.length > 32_000) {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  let invoer: Record<string, unknown>;
  try {
    invoer = JSON.parse(lichaam);
  } catch {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  // Honeypot: bots vullen dit verborgen veld in. Doe alsof het gelukt is.
  if (typeof invoer.website === "string" && invoer.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const soort = String(invoer.soort ?? "");
  const datum = String(invoer.datum ?? "").slice(0, 10);
  const plaats = String(invoer.plaats ?? "").trim().slice(0, 120);
  const beschrijving = String(invoer.beschrijving ?? "").trim();
  const opKaart = invoer.opKaart === true;
  const contactEmail = String(invoer.contactEmail ?? "").trim().slice(0, 254);
  const lat = typeof invoer.lat === "number" ? invoer.lat : undefined;
  const lng = typeof invoer.lng === "number" ? invoer.lng : undefined;

  if (!SOORTEN.includes(soort)) {
    return Response.json({ fout: "Kies wat er is gebeurd." }, { status: 400 });
  }
  if (beschrijving.length < 10 || beschrijving.length > 4000) {
    return Response.json(
      { fout: "Vertel kort wat er is gebeurd (minimaal 10 tekens)." },
      { status: 400 }
    );
  }
  if (contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return Response.json(
      { fout: "Vul een geldig e-mailadres in, of laat contact leeg." },
      { status: 400 }
    );
  }
  if (
    opKaart &&
    (lat === undefined ||
      lng === undefined ||
      lat < 50 ||
      lat > 54 ||
      lng < 3 ||
      lng > 7.5)
  ) {
    return Response.json(
      { fout: "Kies de plek op de kaart, of zet de kaartoptie uit." },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();
    const batch = db.batch();

    const meldingRef = db.collection("meldingen").doc();
    batch.set(meldingRef, {
      soort,
      datum,
      plaats,
      beschrijving,
      opKaart,
      contactEmail,
      createdAt: FieldValue.serverTimestamp(),
    });

    if (opKaart && lat !== undefined && lng !== undefined) {
      const puntRef = db.collection("kaartpunten").doc();
      const maand = (datum || new Date().toISOString().slice(0, 10)).slice(0, 7);
      batch.set(puntRef, {
        lat: rondeCoordinaat(lat),
        lng: rondeCoordinaat(lng),
        soort,
        maand,
        meldingId: meldingRef.id,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    return Response.json({ ok: true, id: meldingRef.id });
  } catch (fout) {
    console.error("Melding opslaan mislukt:", fout);
    return Response.json(
      { fout: "Er ging iets mis bij het versturen. Probeer het nog een keer." },
      { status: 500 }
    );
  }
}
