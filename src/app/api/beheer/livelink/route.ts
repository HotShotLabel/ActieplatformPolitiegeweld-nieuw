/* Een ingestuurde live-link verwijderen. Alleen voor het beheer. */

import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 30;

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
    return Response.json({ fout: "Onbekende link." }, { status: 400 });
  }
  try {
    const db = getAdminDb();
    await db.collection("livelinks").doc(id).delete();
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("livelink-verwijder:", fout);
    return Response.json(
      { fout: "Verwijderen lukte niet. Probeer het opnieuw." },
      { status: 502 }
    );
  }
}
