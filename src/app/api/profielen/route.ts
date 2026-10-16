/* Openbare agent-profielen: alleen wat het beheer zichtbaar heeft gemaakt. */

import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 30;

export async function GET() {
  try {
    const snapshot = await getAdminDb()
      .collection("profielen")
      .orderBy("aangemaaktOp", "desc")
      .limit(300)
      .get();

    const profielen = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          label: String(data.label ?? ""),
          kenmerk: String(data.kenmerk ?? ""),
          eenheid: String(data.eenheid ?? ""),
          notities: String(data.notities ?? ""),
          bronnen: Array.isArray(data.bronnen)
            ? data.bronnen
                .slice(0, 20)
                .map((bron: { label?: string; url?: string }) => ({
                  label: String(bron?.label ?? ""),
                  url: String(bron?.url ?? ""),
                }))
                .filter((bron: { url: string }) => bron.url.startsWith("http"))
            : [],
          items: Array.isArray(data.items)
            ? data.items
                .slice(0, 50)
                .map((item: { url?: string; titel?: string }) => ({
                  url: String(item?.url ?? ""),
                  titel: String(item?.titel ?? ""),
                }))
                .filter((item: { url: string }) => item.url.startsWith("http"))
            : [],
          status: String(data.status ?? "mogelijk"),
          zichtbaar: data.zichtbaar === true,
          aangemaaktOp:
            typeof data.aangemaaktOp?.toDate === "function"
              ? (data.aangemaaktOp.toDate() as Date).toISOString()
              : "",
        };
      })
      .filter((profiel) => profiel.zichtbaar);

    return Response.json(
      { profielen },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (fout) {
    console.error("publieke profielen:", fout);
    return Response.json({ fout: "Laden mislukte." }, { status: 500 });
  }
}
