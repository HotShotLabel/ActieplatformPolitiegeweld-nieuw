/* Na een geslaagde YouTube-upload: de video-id vastleggen bij de
   uitzending, zodat het beheer hem terugziet. */

import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 30;

export async function POST(request: Request) {
  let body: { id?: string; youtubeId?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }
  const id = String(body.id ?? "").trim();
  const youtubeId = String(body.youtubeId ?? "").trim();
  const idGeldig = /^[A-Za-z0-9_-]{6,20}$/.test(youtubeId);
  if (!id || id.includes("/") || !idGeldig) {
    return Response.json({ fout: "Ongeldige gegevens." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("uitzendingen").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return Response.json({ fout: "Deze uitzending bestaat niet." }, { status: 404 });
    }
    if (doc.data()?.youtubeUrl) {
      return Response.json({ ok: true, alGemeld: true });
    }
    await ref.update({
      youtubeId,
      youtubeUrl: `https://youtu.be/${youtubeId}`,
      youtubeOp: new Date().toISOString(),
    });
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("youtube-klaar:", fout);
    return Response.json(
      { fout: "Kon de YouTube-status niet opslaan." },
      { status: 502 }
    );
  }
}
