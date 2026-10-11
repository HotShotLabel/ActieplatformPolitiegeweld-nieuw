/* Noodstop: het beheer stopt een lopende live-uitzending met één klik.
   Alle deelnemers worden verbonden meteen losgekoppeld. */

import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { liveIngesteld, stopUitzending } from "@/lib/livekit";

export const maxDuration = 30;

function veiligGelijk(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function heeftToegang(request: NextRequest): boolean {
  const verwacht = process.env.ADMIN_TOKEN;
  if (!verwacht) return false;
  const meegegeven = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!meegegeven) return false;
  return veiligGelijk(meegegeven, verwacht);
}

export async function POST(request: NextRequest) {
  if (!heeftToegang(request)) {
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
