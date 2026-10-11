/* Een uitzending verwijderen: bestand van de opslag en het document uit
   de database. Alleen voor het beheer. */

import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 60;

function veiligGelijk(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function heeftToegang(request: NextRequest): boolean {
  const verwacht = process.env.ADMIN_TOKEN;
  if (!verwacht) return false;
  const meegegeven = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!meegegeven) return false;
  return veiligGelijk(meegegeven, verwacht);
}

async function verwijderBestand(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !url) return;
  await fetch("https://blob.vercel-storage.com/delete", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-api-version": "12",
    },
    body: JSON.stringify({ urls: [url] }),
  }).catch(() => {});
}

export async function POST(request: NextRequest) {
  if (!heeftToegang(request)) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
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
    const ref = db.collection("uitzendingen").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return Response.json({ fout: "Deze uitzending bestaat niet." }, { status: 404 });
    }
    const url = String(doc.data()?.url ?? "");
    await verwijderBestand(url);
    await ref.delete();
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("uitzending-verwijder:", fout);
    return Response.json(
      { fout: "Verwijderen lukte niet. Probeer het opnieuw." },
      { status: 502 }
    );
  }
}
