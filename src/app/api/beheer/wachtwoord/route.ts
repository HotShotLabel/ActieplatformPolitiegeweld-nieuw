/* Eigen beheerwachtwoord instellen (of wissen met een leeg wachtwoord).
   Het standaardwachtwoord uit de omgeving blijft altijd werken als
   herstelmogelijkheid. */

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { heeftToegang, wachtwoordHashen } from "@/lib/beheer-auth";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  let body: { nieuwWachtwoord?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const nieuw = String(body.nieuwWachtwoord ?? "");

  try {
    if (!nieuw) {
      await getAdminDb().collection("beheer").doc("auth").delete();
      return Response.json({ ok: true, gewist: true });
    }
    if (nieuw.length < 12 || nieuw.length > 200) {
      return Response.json(
        { fout: "Kies een wachtwoord van minimaal 12 tekens." },
        { status: 400 }
      );
    }
    const { salt, hash } = wachtwoordHashen(nieuw);
    await getAdminDb()
      .collection("beheer")
      .doc("auth")
      .set({ salt, hash, updatedAt: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("Wachtwoord instellen mislukt:", fout);
    return Response.json({ fout: "Opslaan mislukt." }, { status: 500 });
  }
}
