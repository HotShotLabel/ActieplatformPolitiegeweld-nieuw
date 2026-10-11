/* YouTube-koppeling (server-side). Met een eenmalig opgeslagen
   refresh-token halen we korte toegangsbewijzen op waarmee de browser
   van de uitzender de opname direct privé naar het eigen kanaal zet. */

export function youtubeIngesteld(): boolean {
  return Boolean(
    process.env.YOUTUBE_CLIENT_ID &&
      process.env.YOUTUBE_CLIENT_SECRET &&
      process.env.YOUTUBE_REFRESH_TOKEN
  );
}

export async function haalYouTubeToken(): Promise<string | null> {
  if (!youtubeIngesteld()) return null;
  try {
    const antwoord = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID ?? "",
        client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN ?? "",
        grant_type: "refresh_token",
      }),
    });
    if (!antwoord.ok) {
      console.error("youtube-token:", antwoord.status, (await antwoord.text()).slice(0, 200));
      return null;
    }
    const data = await antwoord.json();
    return typeof data.access_token === "string" ? data.access_token : null;
  } catch (fout) {
    console.error("youtube-token:", fout);
    return null;
  }
}
