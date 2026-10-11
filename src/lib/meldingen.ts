import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

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
}

export function rondAfOpKilometer(coordinaat: number): number {
  return Math.round(coordinaat * 100) / 100;
}

export async function verstuurMelding(input: MeldingInput): Promise<string> {
  const db = getDb();
  const batch = writeBatch(db);

  const meldingRef = doc(collection(db, "meldingen"));
  batch.set(meldingRef, {
    soort: input.soort,
    datum: input.datum,
    plaats: input.plaats.trim(),
    beschrijving: input.beschrijving.trim(),
    opKaart: input.opKaart,
    contactEmail: input.contactEmail.trim(),
    createdAt: serverTimestamp(),
  });

  if (input.opKaart && input.lat !== undefined && input.lng !== undefined) {
    const puntRef = doc(collection(db, "kaartpunten"));
    const maand = (input.datum || new Date().toISOString().slice(0, 10)).slice(0, 7);
    batch.set(puntRef, {
      lat: rondAfOpKilometer(input.lat),
      lng: rondAfOpKilometer(input.lng),
      soort: input.soort,
      maand,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return meldingRef.id;
}
