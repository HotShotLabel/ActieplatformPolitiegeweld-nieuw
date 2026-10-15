/* Geeft een LiveKit-toegangsbewijs: voor wie wil uitzenden (één tegelijk)
   en voor wie wil kijken. Geen account nodig, alleen een naam. */

import { randomUUID } from "crypto";
import {
  heeftUitzender,
  liveIngesteld,
  maakToken,
  zetRuimteKlaar,
} from "@/lib/livekit";
import { heeftToegang } from "@/lib/beheer-auth";

export const maxDuration = 30;

export async function POST(request: Request) {
  if (!liveIngesteld()) {
    return Response.json(
      { fout: "Live is nog niet ingesteld." },
      { status: 503 }
    );
  }

  let body: { rol?: string; naam?: string; titel?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const uitzender = body.rol === "uitzender";
  if (body.rol !== "uitzender" && body.rol !== "kijker") {
    return Response.json({ fout: "Onbekende rol." }, { status: 400 });
  }

  const naam = String(body.naam ?? "").trim().slice(0, 60) || "Anoniem";

  // Alleen de beheerder mag uitzenden; kijken blijft voor iedereen open.
  if (uitzender && !(await heeftToegang(request))) {
    return Response.json(
      { fout: "Uitzenden kan alleen met het uitzendwachtwoord." },
      { status: 401 }
    );
  }

  try {
    if (uitzender) {
      const bezet = await heeftUitzender().catch(() => false);
      if (bezet) {
        return Response.json(
          {
            fout:
              "Er is al iemand live op dit moment. Probeer het zo opnieuw.",
          },
          { status: 409 }
        );
      }
      await zetRuimteKlaar(String(body.titel ?? "").trim().slice(0, 120));
    }

    const token = await maakToken({
      identiteit: `${uitzender ? "uitzender" : "kijker"}-${randomUUID().slice(0, 8)}`,
      naam,
      uitzender,
      metadata: { naam },
    });

    return Response.json({
      token,
      url: process.env.LIVEKIT_URL,
    });
  } catch (fout) {
    console.error("live-token:", fout);
    return Response.json(
      { fout: "De uitzending kon niet worden gestart. Probeer het opnieuw." },
      { status: 502 }
    );
  }
}
