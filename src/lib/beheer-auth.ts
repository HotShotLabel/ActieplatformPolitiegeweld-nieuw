/* Beheer-toegang. Het standaardwachtwoord uit de omgeving (ADMIN_TOKEN)
   blijft altijd werken; daarnaast kan in /beheer een eigen wachtwoord worden
   ingesteld. Dat eigen wachtwoord staat gehasht (scrypt) in de database. */

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

function veiligGelijk(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function wachtwoordHashen(wachtwoord: string): {
  salt: string;
  hash: string;
} {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(wachtwoord, salt, 64).toString("hex");
  return { salt, hash };
}

async function dbWachtwoordKlopt(meegegeven: string): Promise<boolean> {
  try {
    const doc = await getAdminDb().collection("beheer").doc("auth").get();
    if (!doc.exists) return false;
    const data = doc.data() ?? {};
    const salt = String(data.salt ?? "");
    const hash = String(data.hash ?? "");
    if (!salt || !hash) return false;
    const berekend = scryptSync(meegegeven, salt, 64).toString("hex");
    return veiligGelijk(berekend, hash);
  } catch {
    return false;
  }
}

export async function heeftToegang(request: Request): Promise<boolean> {
  const meegegeven =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!meegegeven) return false;

  const verwacht = process.env.ADMIN_TOKEN;
  if (verwacht && veiligGelijk(meegegeven, verwacht)) return true;

  return dbWachtwoordKlopt(meegegeven);
}
