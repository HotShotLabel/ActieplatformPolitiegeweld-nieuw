/* Noodstop: het beheer stopt een lopende live-uitzending met één klik.
   Alle deelnemers worden verbonden meteen losgekoppeld. */

import { NextRequest } from "next/server";
import { liveIngesteld, stopUitzending } from "@/lib/livekit";
import { heeftToegang } from "@/lib/beheer-auth";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }
  if (!liveIngesteld()) {
    return Response.json({ fout: "Live is niet ingesteld." }, { status: 503 });
  }
  try {
    await stopUitzending();
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("live-stop:", fout);
    return Response.json(
      { fout: "De uitzending kon niet worden gestopt." },
      { status: 502 }
    );
  }
}
