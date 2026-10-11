import { NextRequest } from "next/server";

export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
/* Als het eerste model tijdelijk vol zit, probeer dan de volgende. */
const FALLBACK_MODELLEN = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest"];
const MAX_BERICHT_LENGTE = 2000;
const MAX_GESCHIEDENIS = 12;
const LIMIET_PER_UUR = 30;

const SYSTEM_PROMPT = `Je bent de vraagbaak van het Actieplatform Politiegeweld, een Nederlands meldpunt en platform tegen politiegeweld. Je helpt bezoekers met vragen over politiegeweld, hun rechten en de stappen die ze kunnen zetten.

Wat je doet:
- Je legt in gewone taal uit welke routes er zijn: klacht bij de politie, klacht bij de klachtencommissie of de Nationale ombudsman, beklag bij het gerechtshof (artikel 12 Sv) als het Openbaar Ministerie niet vervolgt, een Woo-verzoek voor informatie, en schadevergoeding (bijvoorbeeld via de politie of het Waarborgfonds).
- Je verwijst naar het meldformulier op deze site als iemand een incident wil vastleggen, en naar het Juridisch Loket (0900 8020) of een advocaat voor persoonlijk advies.
- Je bent kort en concreet. Alinea's van twee tot vier zinnen.

Wat je nooit doet:
- Geen juridisch advies over een concrete zaak. Zeg eerlijk dat een jurist of advocaat moet meekijken bij echte keuzes.
- Nooit wetsartikelen, termijnen of procedures verzinnen. Weet je iets niet zeker, zeg dat dan en verwijs door.
- Nooit om persoonsgegevens vragen. Waarschuw vriendelijk als iemand gevoelige details deelt: dat is via deze chat niet nodig.
- Niet doen alsof je een hulplijn bent. Bij spoed of gevaar: bel 112. Voor de politie zonder spoed: 0900 8844.
- Je blijft bij het onderwerp politiegeweld, rechten en dit platform. Andere vragen wijk je vriendelijk af.
- Geen opmaaktekens zoals sterretjes of hekjes. Gewone zinnen, eventueel een kort streepje voor een opsomming.`;

type Bericht = { rol: "user" | "model"; tekst: string };

const bezoekers = new Map<string, { aantal: number; resetOp: number }>();

function toegestaan(ip: string): boolean {
  const nu = Date.now();
  const bezoeker = bezoekers.get(ip);
  if (!bezoeker || bezoeker.resetOp < nu) {
    bezoekers.set(ip, { aantal: 1, resetOp: nu + 3_600_000 });
    if (bezoekers.size > 5000) {
      for (const [sleutel, waarde] of bezoekers) {
        if (waarde.resetOp < nu) bezoekers.delete(sleutel);
      }
    }
    return true;
  }
  if (bezoeker.aantal >= LIMIET_PER_UUR) return false;
  bezoeker.aantal += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (!toegestaan(ip)) {
    return Response.json(
      { fout: "Je hebt het maximum aantal vragen voor nu bereikt. Probeer het over een uur weer." },
      { status: 429 }
    );
  }

  const sleutel = process.env.GEMINI_API_KEY;
  if (!sleutel) {
    return Response.json(
      { fout: "De vraagbaak is nog niet volledig ingesteld." },
      { status: 500 }
    );
  }

  let lichaamsTekst: string;
  try {
    lichaamsTekst = await request.text();
  } catch {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }
  if (lichaamsTekst.length > 16_000) {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  let payload: { berichten?: unknown };
  try {
    payload = JSON.parse(lichaamsTekst);
  } catch {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  if (!Array.isArray(payload.berichten) || payload.berichten.length === 0) {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  const berichten: Bericht[] = [];
  for (const item of payload.berichten.slice(-MAX_GESCHIEDENIS)) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("rol" in item) ||
      !("tekst" in item)
    ) {
      return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
    }
    const rol = (item as { rol: unknown }).rol;
    const tekst = (item as { tekst: unknown }).tekst;
    if ((rol !== "user" && rol !== "model") || typeof tekst !== "string") {
      return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
    }
    if (tekst.length > MAX_BERICHT_LENGTE) {
      return Response.json(
        { fout: "Je bericht is te lang. Hou het kort en bondig." },
        { status: 400 }
      );
    }
    berichten.push({ rol, tekst });
  }
  if (berichten[berichten.length - 1]?.rol !== "user") {
    return Response.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  }

  const vraagLichaam = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: berichten.map((bericht) => ({
      role: bericht.rol,
      parts: [{ text: bericht.tekst }],
    })),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 900,
    },
  });

  const modellen = [MODEL, ...FALLBACK_MODELLEN];
  let upstream: Response | null = null;
  let laatsteStatus = 0;

  for (const model of modellen) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${sleutel}`;
    const poging = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal,
      body: vraagLichaam,
    });
    if (poging.ok && poging.body) {
      upstream = poging;
      break;
    }
    laatsteStatus = poging.status;
    await poging.text().catch(() => "");
  }

  if (!upstream || !upstream.body) {
    console.error("Vraagbaak: upstream faalde, status", laatsteStatus);
    return Response.json(
      { fout: "De vraagbaak is even niet beschikbaar. Probeer het zo nog eens." },
      { status: 502 }
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const lezer = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await lezer.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const regels = buffer.split("\n");
          buffer = regels.pop() ?? "";
          for (const regel of regels) {
            if (!regel.startsWith("data:")) continue;
            const jsonTekst = regel.slice(5).trim();
            if (!jsonTekst || jsonTekst === "[DONE]") continue;
            try {
              const data = JSON.parse(jsonTekst);
              const parts =
                data?.candidates?.[0]?.content?.parts ?? [];
              for (const part of parts) {
                if (part?.thought === true) continue;
                if (typeof part?.text === "string" && part.text) {
                  controller.enqueue(encoder.encode(part.text));
                }
              }
            } catch {
              // onvolledige regel, volgende keer opnieuw
            }
          }
        }
      } catch {
        // verbinding weggevallen; deelantwoord is al verstuurd
      } finally {
        controller.close();
        lezer.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
