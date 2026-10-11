/* Uitzendingen voor de live-pagina. Leest de opnames uit de database,
   verwijdert alles wat ouder is dan 30 dagen (document en bestand) en
   geeft de actuele lijst terug. Bezoekers houden de pagina vanzelf
   actueel; de opruiming gebeurt bij elk bezoek. */

import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 60;

export interface Uitzending {
  id: string;
  titel: string;
  url: string;
  grootteMb: number;
  duurSec: number;
  toegevoegdOp: string;
  verlooptOp: string;
  dagenOver: number;
}

const BEWAAR_DAGEN = 30;

async function verwijderBestanden(urls: string[]): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || urls.length === 0) return;
  await fetch("https://blob.vercel-storage.com/delete", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-api-version": "12",
    },
    body: JSON.stringify({ urls }),
  });
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("uitzendingen")
      .orderBy("toegevoegdOp", "desc")
      .limit(100)
      .get();

    const nu = Date.now();
    const actief: Uitzending[] = [];
    const verlopen: { id: string; url: string }[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const verloopt = Date.parse(String(data.verlooptOp ?? ""));
      const url = String(data.url ?? "");
      if (!Number.isNaN(verloopt) && verloopt < nu) {
        verlopen.push({ id: doc.id, url });
        continue;
      }
      actief.push({
        id: doc.id,
        titel: String(data.titel ?? "Uitzending"),
        url,
        grootteMb: Number(data.grootteMb ?? 0),
        duurSec: Number(data.duurSec ?? 0),
        toegevoegdOp: String(data.toegevoegdOp ?? ""),
        verlooptOp: String(data.verlooptOp ?? ""),
        dagenOver: Number.isNaN(verloopt)
          ? BEWAAR_DAGEN
          : Math.max(0, Math.ceil((verloopt - nu) / 86_400_000)),
      });
    }

    // Opruimen: verlopen opnames van de opslag en uit de database.
    if (verlopen.length > 0) {
      await verwijderBestanden(
        verlopen.map((rij) => rij.url).filter(Boolean)
      ).catch(() => {});
      const batch = db.batch();
      for (const rij of verlopen) {
        batch.delete(db.collection("uitzendingen").doc(rij.id));
      }
      await batch.commit().catch(() => {});
    }

    // Staat er een live-uitzending gepland of aan? Dan tonen we hem.
    let liveEmbed = "";
    try {
      const instelling = await db.doc("instellingen/live").get();
      liveEmbed = String(instelling.data()?.embedUrl ?? "");
    } catch {
      liveEmbed = "";
    }

    return Response.json(
      { uitzendingen: actief, liveEmbed, bewaardagen: BEWAAR_DAGEN },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (fout) {
    console.error("live-route:", fout);
    return Response.json(
      { uitzendingen: [], liveEmbed: "", bewaardagen: BEWAAR_DAGEN },
      { status: 502 }
    );
  }
}
