/* Publieke lijst met goedgekeurde beelden (video's). Alleen wat in beheer
   zichtbaar is gezet komt hier door. */

import { getAdminDb } from "@/lib/firebase-admin";
import { BEELDEN_FALLBACK } from "@/lib/beelden-fallback";

export const maxDuration = 30;

/* Korte geheugencache: de CDN cachet al 30 s, maar elke edge-miss zou
   anders opnieuw alle documenten lezen. Bij quota-uitputting blijft de
   laatst gelezen lijst zo lang mogelijk bruikbaar. */
let geheugen: { tijd: number; beelden: unknown[] } | null = null;

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

    geheugen = { tijd: nu, beelden };

    return Response.json(
      { beelden },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (fout) {
    console.error("beelden lezen:", fout);
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
