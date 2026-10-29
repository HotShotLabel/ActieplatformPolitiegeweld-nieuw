/* Publieke lijst met goedgekeurde beelden (video's). Alleen wat in beheer
   zichtbaar is gezet komt hier door. */

import { getAdminDb } from "@/lib/firebase-admin";
import { BEELDEN_FALLBACK } from "@/lib/beelden-fallback";
import { leesBlob } from "@/lib/blob-opslag";
import type { Beeld } from "@/lib/beelden";

export const maxDuration = 30;

/* Korte geheugencache: de CDN cachet al 30 s, maar elke edge-miss zou
   anders opnieuw alle documenten lezen. Bij quota-uitputting blijft de
   laatst gelezen lijst zo lang mogelijk bruikbaar. */
let geheugen: { tijd: number; beelden: unknown[] } | null = null;

/* Als Firestore op quota stuit, slaan we het tien minuten over en blijven
   we de blob gebruiken. Zo wordt /beelden niet traag bij een lege quota. */
let vuurwerkTot = 0;

export async function GET() {
  const nu = Date.now();
  if (geheugen && nu - geheugen.tijd < 120_000) {
    return Response.json(
      { beelden: geheugen.beelden },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  }

  // De blob is de noodlaag: geen Firestore-quota, wel de laatst bekende
  // openbare lijst. Firestore blijft leidend zodra hij leesbaar is.
  let blobZichtbaar: Beeld[] = [];
  try {
    const blob = await leesBlob<Beeld[]>("beelden");
    if (blob?.length) {
      blobZichtbaar = blob
        .filter((beeld) => beeld.zichtbaar !== false)
        .sort((a, b) => String(b.toegevoegdOp).localeCompare(String(a.toegevoegdOp)));
    }
  } catch (fout) {
    console.error("blob beelden:", fout);
  }

  if (blobZichtbaar.length && Date.now() < vuurwerkTot) {
    geheugen = { tijd: nu, beelden: blobZichtbaar };
    return Response.json(
      { beelden: blobZichtbaar, blob: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  }

  try {
    // Alleen zichtbare beelden opvragen (scheelt leesquota en is sneller).
    const snapshot = await getAdminDb()
      .collection("beelden")
      .where("zichtbaar", "==", true)
      .limit(500)
      .get();

    const beelden = snapshot.docs
      .map((document) => {
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
          zichtbaar: true,
          toegevoegdOp: String(data.toegevoegdOp ?? ""),
        };
      })
      .sort((a, b) => b.toegevoegdOp.localeCompare(a.toegevoegdOp));

    // Samenvoegen met de blob, zodat een net goedgekeurd beeld niet pas
    // na de volgende blob-import verschijnt.
    const samen = new Map<string, Beeld>();
    for (const beeld of [...beelden, ...blobZichtbaar]) samen.set(beeld.url, beeld);
    const alle = [...samen.values()].sort((a, b) =>
      String(b.toegevoegdOp).localeCompare(String(a.toegevoegdOp))
    );
    geheugen = { tijd: nu, beelden: alle };

    return Response.json(
      { beelden: alle, blob: blobZichtbaar.length > 0 },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (fout) {
    console.error("beelden lezen:", fout);
    vuurwerkTot = Date.now() + 600_000;
    if (blobZichtbaar.length) {
      geheugen = { tijd: nu, beelden: blobZichtbaar };
      return Response.json(
        { beelden: blobZichtbaar, blob: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
          },
        }
      );
    }
    if (geheugen) {
      return Response.json(
        { beelden: geheugen.beelden },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
          },
        }
      );
    }
    // Noodkopie: de laatst bekende openbare lijst, zodat /beelden blijft
    // werken als de database tijdelijk niet leesbaar is.
    return Response.json(
      { beelden: BEELDEN_FALLBACK, fallback: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  }
}
