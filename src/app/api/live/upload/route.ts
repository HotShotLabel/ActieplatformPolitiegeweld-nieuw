/* Geeft de telefoon van de uitzender een tijdelijke uploadlink voor de
   opslag (Cloudflare R2). Grote bestanden gaan rechtstreeks naar de
   opslag, niet via onze server. */

import { maakSleutel, maakUploadUrl, r2Ingesteld } from "@/lib/r2";

export const maxDuration = 30;

const TOEGESTANE_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
};

export async function POST(request: Request) {
  if (!r2Ingesteld()) {
    return Response.json(
      { fout: "De opslag is nog niet ingesteld." },
      { status: 503 }
    );
  }
  let body: { extensie?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const extensie = String(body.extensie ?? "").toLowerCase();
  const contentType = TOEGESTANE_TYPES[extensie];
  if (!contentType) {
    return Response.json(
      { fout: "Alleen mp4 of webm opnames." },
      { status: 400 }
    );
  }
  try {
    const sleutel = maakSleutel(extensie);
    const uploadUrl = await maakUploadUrl(sleutel, contentType);
    return Response.json({ uploadUrl, sleutel });
  } catch (fout) {
    console.error("upload-url:", fout);
    return Response.json(
      { fout: "Uploadlink maken mislukte. Probeer het opnieuw." },
      { status: 502 }
    );
  }
}
