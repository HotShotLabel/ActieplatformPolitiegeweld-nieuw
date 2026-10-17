/* Uitzendingen voor de live-pagina. Leest de opnames uit de database,
   verwijdert alles wat ouder is dan 30 dagen (document en bestand) en
   geeft de actuele lijst terug. Bezoekers houden de pagina vanzelf
   actueel; de opruiming gebeurt bij elk bezoek. */

import { getAdminDb } from "@/lib/firebase-admin";
import { liveStand } from "@/lib/livekit";
import { maakKijkUrl, r2Ingesteld, verwijderObject } from "@/lib/r2";

export const maxDuration = 60;

export interface Uitzending {
  id: string;
  titel: string;
  url: string;
  grootteMb: number;
  duurSec: number;
  toegevoegdOp: string;
  verlooptOp: string;
  youtubeUrl: string;
  dagenOver: number;
}

export interface LiveLink {
  id: string;
  url: string;
  host: string;
  titel: string;
  naam: string;
  toegevoegdOp: string;
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
    const verlopen: { id: string; url: string; sleutel: string }[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const verloopt = Date.parse(String(data.verlooptOp ?? ""));
      const sleutel = String(data.sleutel ?? "");
      const url = String(data.url ?? "");
      if (!Number.isNaN(verloopt) && verloopt < nu) {
        verlopen.push({ id: doc.id, url, sleutel });
        continue;
      }
      // Nieuwe opnames: ondertekende kijklink (7 dagen geldig).
      let kijkUrl = url;
      if (sleutel && r2Ingesteld()) {
        try {
          kijkUrl = await maakKijkUrl(sleutel);
        } catch {
          kijkUrl = url;
        }
      }
      actief.push({
        id: doc.id,
        titel: String(data.titel ?? "Uitzending"),
        url: kijkUrl,
        grootteMb: Number(data.grootteMb ?? 0),
        duurSec: Number(data.duurSec ?? 0),
        toegevoegdOp: String(data.toegevoegdOp ?? ""),
        verlooptOp: String(data.verlooptOp ?? ""),
        youtubeUrl: String(data.youtubeUrl ?? ""),
        dagenOver: Number.isNaN(verloopt)
          ? BEWAAR_DAGEN
          : Math.max(0, Math.ceil((verloopt - nu) / 86_400_000)),
      });
    }

    // Opruimen: verlopen opnames van de opslag en uit de database.
    if (verlopen.length > 0) {
      const oudeBlobs = verlopen.filter((rij) => !rij.sleutel && rij.url);
      if (oudeBlobs.length > 0) {
        await verwijderBestanden(oudeBlobs.map((rij) => rij.url)).catch(
          () => {}
        );
      }
      for (const rij of verlopen.filter((rij) => rij.sleutel)) {
        await verwijderObject(rij.sleutel).catch(() => {});
      }
      const batch = db.batch();
      for (const rij of verlopen) {
        batch.delete(db.collection("uitzendingen").doc(rij.id));
      }
      await batch.commit().catch(() => {});
    }

    // Ingestuurde live-links (48 uur geldig), met opruiming van verlopen.
    const linkSnapshot = await db
      .collection("livelinks")
      .orderBy("toegevoegdOp", "desc")
      .limit(50)
      .get();
    const linkLijst: LiveLink[] = [];
    const verlopenLinks: string[] = [];
    for (const doc of linkSnapshot.docs) {
      const data = doc.data();
      const verloopt = Date.parse(String(data.verlooptOp ?? ""));
      if (!Number.isNaN(verloopt) && verloopt < nu) {
        verlopenLinks.push(doc.id);
        continue;
      }
      linkLijst.push({
        id: doc.id,
        url: String(data.url ?? ""),
        host: String(data.host ?? ""),
        titel: String(data.titel ?? ""),
        naam: String(data.naam ?? ""),
        toegevoegdOp: String(data.toegevoegdOp ?? ""),
      });
    }
    if (verlopenLinks.length > 0) {
      const linkBatch = db.batch();
      for (const id of verlopenLinks) {
        linkBatch.delete(db.collection("livelinks").doc(id));
      }
      await linkBatch.commit().catch(() => {});
    }

    // Is er nu iemand live? Dat vragen we aan LiveKit zelf.
    const live = await liveStand();

    return Response.json(
      { uitzendingen: actief, links: linkLijst.slice(0, 30), live, bewaardagen: BEWAAR_DAGEN },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
        },
      }
    );
  } catch (fout) {
    console.error("live-route:", fout);
    return Response.json(
      {
        uitzendingen: [],
        links: [],
        live: { live: false, titel: "", kijkers: 0, gestartOp: "" },
        bewaardagen: BEWAAR_DAGEN,
      },
      { status: 200 }
    );
  }
}
