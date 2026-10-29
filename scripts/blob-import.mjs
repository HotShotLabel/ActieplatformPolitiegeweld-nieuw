/* Zet de lokale sociale kandidaten in Vercel Blob, buiten Firestore om.
   Draai: node --env-file=.env.local scripts/blob-import.mjs
   De kandidaten komen er verborgen in; de publieke API filtert ze. */
import { put } from "@vercel/blob";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) { console.error("BLOB_READ_WRITE_TOKEN ontbreekt"); process.exit(1); }

const SITE = process.env.SITE_URL || "https://actieplatform-politiegeweld-nieuw.vercel.app";
const BESTAND = path.join(os.homedir(), "actieplatform-analyse", "social-kandidaten.json");
const kandidaten = JSON.parse(fs.readFileSync(BESTAND, "utf8"));

function platform(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (h.endsWith("tiktok.com")) return "TikTok";
    if (h.endsWith("instagram.com")) return "Instagram";
    if (h.endsWith("facebook.com") || h === "fb.watch") return "Facebook";
    if (h.endsWith("youtube.com") || h === "youtu.be") return "YouTube";
    return "Anders";
  } catch { return "Anders"; }
}

const antwoord = await fetch(`${SITE}/api/beelden`, { cache: "no-store" });
const bestaand = antwoord.ok ? (await antwoord.json()).beelden ?? [] : [];
const urls = new Set(bestaand.map((b) => b.url));
const nu = new Date().toISOString();
let nieuw = 0;

for (const k of kandidaten) {
  if (!k.url || urls.has(k.url)) continue;
  urls.add(k.url);
  bestaand.push({
    id: `blob-${Buffer.from(k.url).toString("base64url").slice(0, 14)}`,
    url: k.url,
    platform: platform(k.url),
    titel: String(k.titel ?? "").slice(0, 200),
    toelichting: String(k.toelichting ?? ""),
    plaats: String(k.plaats ?? ""),
    datum: String(k.datum ?? ""),
    bron: String(k.bron ?? "Blob-import"),
    zichtbaar: false,
    toegevoegdOp: nu,
  });
  nieuw += 1;
}

const zichtbaar = bestaand.filter((b) => b.zichtbaar !== false).length;
const inhoud = JSON.stringify(bestaand);
const url = await put("data/beelden.json", inhoud, {
  access: "public", addRandomSuffix: false, allowOverwrite: true,
  contentType: "application/json", token: TOKEN,
});
await put("data/beelden-alle.json", inhoud, {
  access: "public", addRandomSuffix: false, allowOverwrite: true,
  contentType: "application/json", token: TOKEN,
});
console.log(`blob: ${nieuw} nieuw, ${bestaand.length} totaal, ${zichtbaar} zichtbaar`);
console.log(url);
