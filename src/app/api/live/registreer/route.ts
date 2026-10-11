/* Registreert de zojuist geüploade uitzendopname: 30 dagen online,
   daarna verwijdert /api/live hem automatisch. */

import { getAdminDb } from "@/lib/firebase-admin";

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
    url?: string;
    titel?: string;
    duurSec?: number;
    grootteMb?: number;
  } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const url = String(body.url ?? "");
  const titel = String(body.titel ?? "").trim().slice(0, 120) || "Live-uitzending";

  let pad: URL;
  try {
    pad = new URL(url);
  } catch {
    return Response.json({ fout: "Ongeldige url." }, { status: 400 });
  }
  const goedeOpslag =
    pad.hostname.endsWith(".public.blob.vercel-storage.com") &&
    pad.pathname.startsWith("/uitzendingen/");
  if (!goedeOpslag) {
    return Response.json(
      { fout: "Deze opslagplek hoort niet bij ons." },
      { status: 400 }
    );
  }

  // Bestaat het bestand echt en is het video?
  try {
    const kop = await fetch(url, { method: "HEAD" });
    const soort = kop.headers.get("content-type") ?? "";
    if (!kop.ok || !soort.startsWith("video/")) {
      return Response.json(
        { fout: "De opname is nog niet klaar met uploaden." },
        { status: 409 }
      );
    }
  } catch {
    return Response.json(
      { fout: "De opname kon niet worden gecontroleerd." },
      { status: 502 }
    );
  }

  try {
    const db = getAdminDb();
    const nu = new Date();
    const verloopt = new Date(nu.getTime() + 30 * 86_400_000);
    const document = await db.collection("uitzendingen").add({
      titel,
      url,
      grootteMb: Number(body.grootteMb ?? 0) || 0,
      duurSec: Number(body.duurSec ?? 0) || 0,
      toegevoegdOp: nu.toISOString(),
      verlooptOp: verloopt.toISOString(),
      logo: true,
    });
    return Response.json({ ok: true, id: document.id });
  } catch (fout) {
    console.error("live-registreer:", fout);
    return Response.json(
      { fout: "De opname kon niet worden geregistreerd." },
      { status: 502 }
    );
  }
}
