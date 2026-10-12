import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { heeftToegang } from "@/lib/beheer-auth";

export const maxDuration = 30;

const STATUSSEN = ["nieuw", "in-behandeling", "afgehandeld"];

export async function GET(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("meldingen")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const puntenSnapshot = await db
      .collection("kaartpunten")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();
    const puntPerMelding = new Map<string, { lat: number; lng: number }>();
    for (const punt of puntenSnapshot.docs) {
      const puntData = punt.data();
      const meldingId = String(puntData.meldingId ?? "");
      if (meldingId && !puntPerMelding.has(meldingId)) {
        puntPerMelding.set(meldingId, {
          lat: Number(puntData.lat),
          lng: Number(puntData.lng),
        });
      }
    }

    const meldingen = snapshot.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        soort: String(data.soort ?? ""),
        datum: String(data.datum ?? ""),
        plaats: String(data.plaats ?? ""),
        beschrijving: String(data.beschrijving ?? ""),
        opKaart: Boolean(data.opKaart),
        contactEmail: String(data.contactEmail ?? ""),
        agentGeslacht: String(data.agentGeslacht ?? ""),
        agentLeeftijd: String(data.agentLeeftijd ?? ""),
        agentNaam: String(data.agentNaam ?? ""),
        eenheid: String(data.eenheid ?? ""),
        voertuig: String(data.voertuig ?? ""),
        kentekens: String(data.kentekens ?? ""),
        dienstnummers: String(data.dienstnummers ?? ""),
        soortAgent: String(data.soortAgent ?? ""),
        aantalAgenten: String(data.aantalAgenten ?? ""),
        agentBeschrijving: String(data.agentBeschrijving ?? ""),
        status: String(data.status ?? "nieuw"),
        notitie: String(data.notitie ?? ""),
        kaartpunt: puntPerMelding.get(document.id) ?? null,
        createdAt:
          typeof data.createdAt?.toDate === "function"
            ? (data.createdAt.toDate() as Date).toISOString()
            : "",
      };
    });

    return Response.json({ meldingen });
  } catch (fout) {
    console.error("Meldingen lezen mislukt:", fout);
    return Response.json(
      { fout: "Meldingen konden niet worden geladen." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }

  let body: { id?: string; status?: string; notitie?: string } = {};
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
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!STATUSSEN.includes(status)) {
      return Response.json({ fout: "Onbekende status." }, { status: 400 });
    }
    update.status = status;
  }
  if (body.notitie !== undefined) {
    update.notitie = String(body.notitie).trim().slice(0, 2000);
  }
  if (Object.keys(update).length === 0) {
    return Response.json({ fout: "Niets om bij te werken." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("meldingen").doc(id).update(update);
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("Melding bijwerken mislukt:", fout);
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
    const db = getAdminDb();

    const puntSnapshot = await db
      .collection("kaartpunten")
      .where("meldingId", "==", id)
      .get();
    const batch = db.batch();
    puntSnapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });
    batch.delete(db.collection("meldingen").doc(id));
    await batch.commit();

    return Response.json({
      ok: true,
      kaartpuntenVerwijderd: puntSnapshot.size,
    });
  } catch (fout) {
    console.error("Melding verwijderen mislukt:", fout);
    return Response.json(
      { fout: "Verwijderen mislukte." },
      { status: 500 }
    );
  }
}
