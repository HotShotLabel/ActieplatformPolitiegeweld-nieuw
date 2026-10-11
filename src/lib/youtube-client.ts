/* Opname vanaf de site privé naar YouTube zetten (kanaal van het
   platform). Draait in de browser van de uitzender: geen limieten van
   de server, en grote bestanden gaan rechtstreeks naar Google. */

export async function uploadNaarYouTube(
  bestand: Blob,
  toegangstoken: string,
  titel: string
): Promise<string> {
  const omschrijving = [
    "Live-uitzending van Actieplatform Politiegeweld.",
    "",
    "Site: https://actieplatform-politiegeweld-nieuw.vercel.app/live",
    "De opname draagt het logo van het platform en staat hier privé bewaard.",
  ].join("\n");

  const start = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${toegangstoken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title: titel.slice(0, 100),
          description: omschrijving.slice(0, 5000),
          categoryId: "25", // Nieuws en politiek
        },
        status: {
          privacyStatus: "private",
          selfDeclaredMadeForKids: false,
        },
      }),
    }
  );
  if (!start.ok) {
    const tekst = await start.text().catch(() => "");
    throw new Error(
      `YouTube weigerde de upload (${start.status}${tekst ? `: ${tekst.slice(0, 120)}` : ""})`
    );
  }
  const adres = start.headers.get("location");
  if (!adres) throw new Error("YouTube gaf geen uploadadres terug.");

  const upload = await fetch(adres, {
    method: "PUT",
    headers: { "content-type": "video/*" },
    body: bestand,
  });
  if (!upload.ok) {
    throw new Error(`De YouTube-upload mislukte (${upload.status}).`);
  }
  const video = await upload.json();
  return String(video?.id ?? "");
}
