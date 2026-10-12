/* Een ingestuurde live-link verwijderen. Alleen voor het beheer. */

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { heeftToegang } from "@/lib/beheer-auth";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!(await heeftToegang(request))) {
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
