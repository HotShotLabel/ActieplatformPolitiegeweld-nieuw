/* Importeer de lokale sociale kandidaten als verborgen beelden in Firestore.
   Droog: node --env-file=.env.local scripts/firestore-import-social.mjs
   Echt:  node --env-file=.env.local scripts/firestore-import-social.mjs --do */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ruw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!ruw) { console.error("FIREBASE_SERVICE_ACCOUNT ontbreekt"); process.exit(1); }
// De env is base64-JSON (zoals in src/lib/firebase-admin.ts).
const service = JSON.parse(Buffer.from(ruw, "base64").toString("utf-8"));
if (!getApps().length) initializeApp({ credential: cert(service) });
const db = getFirestore(undefined, "default");
const doen = process.argv.includes("--do");

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

const bestand = path.join(os.homedir(), "actieplatform-analyse", "social-kandidaten.json");
const kandidaten = JSON.parse(fs.readFileSync(bestand, "utf8"));
const snapshot = await db.collection("beelden").get();
const bestaand = new Set(snapshot.docs.map((d) => String(d.data().url ?? "")));
console.log(`Firestore nu: ${snapshot.size} beelden, waarvan ${snapshot.docs.filter((d) => d.data().zichtbaar === true).length} zichtbaar`);

const nieuw = kandidaten.filter((k) => k.url && !bestaand.has(k.url));
console.log(`kandidaten: ${kandidaten.length}, al aanwezig: ${kandidaten.length - nieuw.length}, nieuw: ${nieuw.length}`);
if (!doen) { console.log("droogloop; voeg --do toe om te schrijven"); process.exit(0); }

let batch = db.batch();
let n = 0;
const nu = new Date().toISOString();
for (const k of nieuw) {
  const ref = db.collection("beelden").doc();
  batch.set(ref, {
    url: k.url,
    platform: platform(k.url),
    titel: String(k.titel ?? "").slice(0, 220),
    toelichting: String(k.toelichting ?? ""),
    plaats: String(k.plaats ?? ""),
    datum: String(k.datum ?? ""),
    bron: String(k.bron ?? "Sociale oogst"),
    zichtbaar: false,
    toegevoegdOp: nu,
  });
  n += 1;
  if (n % 400 === 0) { await batch.commit(); batch = db.batch(); }
}
await batch.commit();
const na = await db.collection("beelden").get();
console.log(`klaar: ${n} toegevoegd; Firestore nu ${na.size}, waarvan ${na.docs.filter((d) => d.data().zichtbaar === true).length} zichtbaar`);
