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

export async function GET(request: NextRequest) {
  if (!heeftToegang(request)) {
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

export async function DELETE(request: NextRequest) {
  if (!heeftToegang(request)) {
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
