/* Beheer van de beelden: lijst (ook verborgen), goedkeuren/verbergen,
   verwijderen, handmatig toevoegen en bulk-import (voor het oogstscript). */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { heeftToegang } from "@/lib/beheer-auth";
import { isHttpUrl, platformVan } from "@/lib/beelden";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  try {
    const snapshot = await getAdminDb()
      .collection("beelden")
      .orderBy("toegevoegdOp", "desc")
      .limit(1000)
      .get();

    const beelden = snapshot.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        url: String(data.url ?? ""),
        platform: String(data.platform ?? ""),
        titel: String(data.titel ?? ""),
        toelichting: String(data.toelichting ?? ""),
        plaats: String(data.plaats ?? ""),
        datum: String(data.datum ?? ""),
        bron: String(data.bron ?? ""),
        agentKenmerk: String(data.agentKenmerk ?? ""),
        zichtbaar: data.zichtbaar === true,
        toegevoegdOp:
          typeof data.toegevoegdOp?.toDate === "function"
            ? (data.toegevoegdOp.toDate() as Date).toISOString()
            : "",
      };
    });

    return Response.json({ beelden });
  } catch (fout) {
    console.error("beheer beelden lezen:", fout);
    return Response.json(
      { fout: "Beelden konden niet worden geladen." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  let body: { id?: string; zichtbaar?: boolean; agentKenmerk?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!/^[A-Za-z0-9]{10,30}$/.test(id)) {
    return Response.json({ fout: "Ongeldig id." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.zichtbaar !== undefined) {
    update.zichtbaar = body.zichtbaar === true;
  }
  if (body.agentKenmerk !== undefined) {
    update.agentKenmerk = String(body.agentKenmerk).trim().slice(0, 300);
  }
  if (Object.keys(update).length === 0) {
    return Response.json({ fout: "Niets om bij te werken." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("beelden").doc(id).update(update);
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("beeld bijwerken:", fout);
    return Response.json({ fout: "Bijwerken mislukt." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9]{10,30}$/.test(id)) {
    return Response.json({ fout: "Ongeldig id." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("beelden").doc(id).delete();
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("beeld verwijderen:", fout);
    return Response.json({ fout: "Verwijderen mislukt." }, { status: 500 });
  }
}

type NieuweBeelden = {
  url?: unknown;
  titel?: unknown;
  toelichting?: unknown;
  plaats?: unknown;
  datum?: unknown;
  bron?: unknown;
};

export async function POST(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  let body: { items?: NieuweBeelden[] } & NieuweBeelden = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, 100) : [body];
  if (items.length === 0) {
    return Response.json({ fout: "Niets om toe te voegen." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const bestaand = await db
      .collection("beelden")
      .orderBy("toegevoegdOp", "desc")
      .limit(1000)
      .get();
    const bestaandeUrls = new Set(
      bestaand.docs.map((document) => String(document.data().url ?? ""))
    );

    let toegevoegd = 0;
    let overgeslagen = 0;
    const batch = db.batch();

    for (const item of items) {
      const url = String(item.url ?? "").trim().slice(0, 500);
      const titel = String(item.titel ?? "").trim().slice(0, 150);
      if (!isHttpUrl(url) || titel.length < 3) {
        overgeslagen += 1;
        continue;
      }
      if (bestaandeUrls.has(url)) {
        overgeslagen += 1;
        continue;
      }
      bestaandeUrls.add(url);
      const ref = db.collection("beelden").doc();
      batch.set(ref, {
        url,
        platform: platformVan(url),
        titel,
        toelichting: String(item.toelichting ?? "").trim().slice(0, 1000),
        plaats: String(item.plaats ?? "").trim().slice(0, 120),
        datum: String(item.datum ?? "").trim().slice(0, 40),
        bron: String(item.bron ?? "beheer").trim().slice(0, 120),
        zichtbaar: false,
        toegevoegdOp: FieldValue.serverTimestamp(),
      });
      toegevoegd += 1;
    }

    await batch.commit();
    return Response.json({ ok: true, toegevoegd, overgeslagen });
  } catch (fout) {
    console.error("beelden toevoegen:", fout);
    return Response.json({ fout: "Toevoegen mislukt." }, { status: 500 });
  }
}
