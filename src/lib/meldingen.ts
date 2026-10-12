export const SOORTEN = [
  { waarde: "aanhouding", label: "Tijdens een aanhouding" },
  { waarde: "demonstratie", label: "Tijdens een demonstratie" },
  { waarde: "cel", label: "In de cel of op het bureau" },
  { waarde: "profileren", label: "Etnisch profileren of onterecht staande houden" },
  { waarde: "anders", label: "Anders" },
] as const;

export type Soort = (typeof SOORTEN)[number]["waarde"];

export const SOORT_LABEL: Record<string, string> = Object.fromEntries(
  SOORTEN.map((soort) => [soort.waarde, soort.label])
);

export const EENHEDEN = [
  "Amsterdam",
  "Den Haag",
  "Rotterdam",
  "Midden-Nederland",
  "Oost-Nederland",
  "Noord-Nederland",
  "Oost-Brabant",
  "Zeeland-West-Brabant",
  "Limburg",
  "Noord-Holland",
  "Landelijke Eenheid",
  "Weet ik niet",
] as const;

export const VOERTUIGEN = [
  "Politieauto",
  "Busje",
  "Motor",
  "Fiets",
  "Te voet",
  "Meerdere voertuigen",
  "Anders",
  "Weet ik niet",
] as const;

export const SOORTEN_AGENT = [
  "Wijkagent",
  "Noodhulp",
  "Mobiele Eenheid",
  "Arrestatieteam",
  "Overig",
  "Weet ik niet",
] as const;

export const GESLACHTEN_AGENT = [
  "Man",
  "Vrouw",
  "Meerdere",
  "Weet ik niet",
] as const;

export interface MeldingInput {
  soort: Soort;
  datum: string;
  plaats: string;
  beschrijving: string;
  opKaart: boolean;
  contactEmail: string;
  agentGeslacht: string;
  agentLeeftijd: string;
  agentNaam: string;
  eenheid: string;
  voertuig: string;
  kentekens: string;
  dienstnummers: string;
  soortAgent: string;
  aantalAgenten: string;
  agentBeschrijving: string;
  lat?: number;
  lng?: number;
  website?: string;
}

export async function verstuurMelding(input: MeldingInput): Promise<string> {
  const antwoord = await fetch("/api/melden", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  let data: { ok?: boolean; id?: string; fout?: string } = {};
  try {
    data = await antwoord.json();
  } catch {
    // geen json
  }

  if (!antwoord.ok || !data.ok) {
    throw new Error(
      data.fout ??
        "Er ging iets mis bij het versturen. Probeer het nog een keer."
    );
  }

  return data.id ?? "";
}
