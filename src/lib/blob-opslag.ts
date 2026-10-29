/* Noodopslag buiten Firestore om: publieke JSON in Vercel Blob.
   Alleen voor openbare inhoud (beelden, profielen), nooit voor meldingen
   met persoonsgegevens. De sleutel staat server-side in de omgeving. */

import { list, put } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const PREFIX = "data/";
const CACHE_MS = 60_000;

type Cache = { tijd: number; data: unknown };
const cache = new Map<string, Cache>();

export async function leesBlob<T>(naam: string): Promise<T | null> {
  if (!TOKEN) return null;
  const hit = cache.get(naam);
  if (hit && Date.now() - hit.tijd < CACHE_MS) return hit.data as T;
  try {
    const { blobs } = await list({
      prefix: `${PREFIX}${naam}.json`,
      limit: 1,
      token: TOKEN,
    });
    if (!blobs.length) return null;
    const antwoord = await fetch(blobs[0].url, { cache: "no-store" });
    if (!antwoord.ok) return null;
    const data = (await antwoord.json()) as T;
    cache.set(naam, { tijd: Date.now(), data });
    return data;
  } catch (fout) {
    console.error("blob lezen:", fout);
    return hit ? (hit.data as T) : null;
  }
}

export async function schrijfBlob(naam: string, data: unknown): Promise<string> {
  if (!TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN ontbreekt");
  const uitkomst = await put(`${PREFIX}${naam}.json`, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: TOKEN,
  });
  cache.set(naam, { tijd: Date.now(), data });
  return uitkomst.url;
}
