/* Publieke lijst met goedgekeurde beelden (video's). Alleen wat in beheer
   zichtbaar is gezet komt hier door. */

import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 30;

export async function GET() {
  try {
    const snapshot = await getAdminDb()
      .collection("beelden")
      .orderBy("toegevoegdOp", "desc")
      .limit(1000)
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
          zichtbaar: data.zichtbaar === true,
          toegevoegdOp: String(data.toegevoegdOp ?? ""),
        };
      })
      .filter((beeld) => beeld.zichtbaar);

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
    return Response.json(
      { fout: "Beelden konden niet worden geladen." },
      { status: 500 }
    );
  }
}
