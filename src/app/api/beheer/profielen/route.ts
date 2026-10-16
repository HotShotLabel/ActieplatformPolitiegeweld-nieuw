/* Agent-profielen: openbaar gemaakte kenmerken (dienstnummer, eenheid,
   signalement) die in meerdere zaken terugkomen. De beheerder maakt en
   bevestigt ze met de hand; pas na bevestiging horen ze op de openbare
   pagina. Geen biometrie, geen automatische matching. */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { heeftToegang } from "@/lib/beheer-auth";

export const maxDuration = 30;

interface Bron {
  label: string;
  url: string;
}

interface Item {
  url: string;
  titel: string;
}

function schoonBronnen(waarde: unknown): Bron[] {
  if (!Array.isArray(waarde)) return [];
  return waarde
    .slice(0, 20)
    .map((item) => ({
      label: String((item as Bron)?.label ?? "").trim().slice(0, 120),
      url: String((item as Bron)?.url ?? "").trim().slice(0, 500),
    }))
    .filter((bron) => bron.url.startsWith("http"));
}

function schoonItems(waarde: unknown): Item[] {
  if (!Array.isArray(waarde)) return [];
  return waarde
    .slice(0, 50)
    .map((item) => ({
      url: String((item as Item)?.url ?? "").trim().slice(0, 500),
      titel: String((item as Item)?.titel ?? "").trim().slice(0, 200),
    }))
    .filter((item) => item.url.startsWith("http"));
}

export async function GET(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }
  try {
    const snapshot = await getAdminDb()
      .collection("profielen")
      .orderBy("aangemaaktOp", "desc")
      .limit(300)
      .get();
    const profielen = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        label: String(data.label ?? ""),
        kenmerk: String(data.kenmerk ?? ""),
        eenheid: String(data.eenheid ?? ""),
        notities: String(data.notities ?? ""),
        bronnen: schoonBronnen(data.bronnen),
        items: schoonItems(data.items),
        status: String(data.status ?? "mogelijk"),
        zichtbaar: data.zichtbaar === true,
        aangemaaktOp:
          typeof data.aangemaaktOp?.toDate === "function"
            ? (data.aangemaaktOp.toDate() as Date).toISOString()
            : "",
      };
    });
    return Response.json({ profielen });
  } catch (fout) {
    console.error("profielen lezen:", fout);
    return Response.json({ fout: "Laden mislukte." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }
  const label = String(body.label ?? "").trim().slice(0, 150);
  const kenmerk = String(body.kenmerk ?? "").trim().slice(0, 300);
  const eenheid = String(body.eenheid ?? "").trim().slice(0, 120);
  const notities = String(body.notities ?? "").trim().slice(0, 4000);
  const status = String(body.status ?? "mogelijk");
  if (label.length < 3) {
    return Response.json(
      { fout: "Geef het profiel een duidelijke titel (minimaal 3 tekens)." },
      { status: 400 }
    );
  }
  if (status !== "mogelijk" && status !== "bevestigd") {
    return Response.json({ fout: "Onbekende status." }, { status: 400 });
  }
  try {
    await getAdminDb().collection("profielen").add({
      label,
      kenmerk,
      eenheid,
      notities,
      bronnen: schoonBronnen(body.bronnen),
      items: schoonItems(body.items),
      status,
      zichtbaar: false,
      aangemaaktOp: FieldValue.serverTimestamp(),
    });
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("profiel opslaan:", fout);
    return Response.json({ fout: "Opslaan mislukte." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }
  let body: { id?: string; zichtbaar?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }
  const id = String(body.id ?? "").trim();
  if (!/^[A-Za-z0-9]{10,30}$/.test(id)) {
    return Response.json({ fout: "Ongeldig id." }, { status: 400 });
  }
  try {
    await getAdminDb()
      .collection("profielen")
      .doc(id)
      .update({ zichtbaar: body.zichtbaar === true });
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("profiel bijwerken:", fout);
    return Response.json({ fout: "Bijwerken mislukt." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await heeftToegang(request))) {
    return Response.json({ fout: "Geen toegang." }, { status: 401 });
  }
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9]{10,30}$/.test(id)) {
    return Response.json({ fout: "Ongeldig id." }, { status: 400 });
  }
  try {
    await getAdminDb().collection("profielen").doc(id).delete();
    return Response.json({ ok: true });
  } catch (fout) {
    console.error("profiel verwijderen:", fout);
    return Response.json({ fout: "Verwijderen mislukt." }, { status: 500 });
  }
}
