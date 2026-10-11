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

export interface MeldingInput {
  soort: Soort;
  datum: string;
  plaats: string;
  beschrijving: string;
  opKaart: boolean;
  contactEmail: string;
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
