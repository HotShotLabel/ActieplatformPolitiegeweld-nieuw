/* Levert de kaartstijl voor de meldingenkaart, maar zonder de
   herkomst-verwijzingen in de databronnen. Zo blijft er in de kaart zelf
   alleen de verplichte datacredit over, die we compact zelf zetten.
   Bron van de stijlen: OpenFreeMap (open source; eigen vermelding niet
   verplicht volgens hun documentatie). */

const BRONNEN: Record<string, string> = {
  donker: "https://tiles.openfreemap.org/styles/dark",
  licht: "https://tiles.openfreemap.org/styles/positron",
  nood: "https://tiles.openfreemap.org/styles/bright",
};

export async function GET(request: Request) {
  const naam = new URL(request.url).searchParams.get("stijl") ?? "donker";
  const bron = BRONNEN[naam] ?? BRONNEN.donker;

  try {
    const antwoord = await fetch(bron);
    if (!antwoord.ok) throw new Error(String(antwoord.status));

    const stijl = (await antwoord.json()) as Record<string, unknown>;
    const bronnen = stijl.sources as
      | Record<string, { attribution?: unknown }>
      | undefined;
    if (bronnen) {
      for (const sleutel of Object.keys(bronnen)) {
        const item = bronnen[sleutel];
        if (item && typeof item === "object") delete item.attribution;
      }
    }

    return Response.json(stijl, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return Response.json({ fout: "stijl niet beschikbaar" }, { status: 502 });
  }
}
