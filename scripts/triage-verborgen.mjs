/* Rangschik verborgen beelden op geweldstaal en bron. Schrijft Markdown + CSV
   naar ~/actieplatform-analyse. Geen Firestore-writes.
   Draai: node --env-file=.env.local scripts/triage-verborgen.mjs */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ruw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!ruw) { console.error("FIREBASE_SERVICE_ACCOUNT ontbreekt"); process.exit(1); }
const service = JSON.parse(Buffer.from(ruw, "base64").toString("utf-8"));
if (!getApps().length) initializeApp({ credential: cert(service) });
const db = getFirestore(undefined, "default");

const STERK = ["slaat","sloeg","geslagen","mishandel","schopt","schopte","trapt","trapte","duwt","duwde","sleurt","sleurde","taser","wapenstok","pepperspray","nekklem","wurg","hardhandig","geweld","arrestatie","aanhouding","profiler","discrimin","racisme","overleden","dood","schiet","gewond","natrap","knijpt"];
const ANALYSE = ["wat gebeurt","hoe werkt","uitgelegd","onderzoek","rapport","interview","opinie","column","documentaire","vacature","opleiding","training","stage","politie zoekt","getuigen gezocht","recherche","sollicit","bureau","vlog","podcast","college","les","quiz","spel"];
const BRON = { "Nieuws-video": 3, "Zoekmachine": 2, "TikTok": 1, "Instagram": 1, "Facebook": 1, "Blob-import": 0 };

const snapshot = await db.collection("beelden").where("zichtbaar", "==", false).limit(1000).get();
const rijen = snapshot.docs.map((d) => {
  const x = d.data();
  const tekst = `${x.titel ?? ""} ${x.toelichting ?? ""}`.toLowerCase();
  const sterk = STERK.filter((w) => tekst.includes(w)).length;
  const analyse = ANALYSE.filter((w) => tekst.includes(w)).length;
  let score = Math.min(sterk, 3) * 3 + (BRON[x.bron] ?? 0) + (x.platform === "TikTok" || x.platform === "Instagram" || x.platform === "Facebook" ? 1 : 0) - analyse * 4;
  if (sterk === 0) score -= 3;
  // Politie moet de dader van het geweld zijn, niet het slachtoffer of de onderzoeker.
  const daad = /(politie|agent|agenten|politieagent|marechaussee)[^.]{0,80}(slaat|sloeg|geslagen|mishandel|schopt|schopte|trapt|trapte|duwt|duwde|sleurt|sleurde|taser|wapenstok|pepperspray|nekklem|wurg|hardhandig|profileer|profiler|discrimin|racisme|schiet|geweld)/i;
  const daadOmgekeerd = /(slaat|sloeg|geslagen|mishandel|schopt|schopte|trapt|trapte|duwt|duwde|sleurt|sleurde|taser|wapenstok|pepperspray|nekklem|wurg|hardhandig|profileer|profiler|discrimin|racisme|schiet|geweld)[^.]{0,80}(politie|agent|agenten|politieagent)/i;
  const politiegeweld = /politiegeweld|buitensporig geweld|excessief geweld|gewelddadige aanhouding/i.test(tekst);
  const slachtoffer = /geweld tegen politie|agent mishandeld|agenten mishandeld|agent aangerand|agenten aangerand|bekogeld|beledigd|bedreigd|politie zoekt|getuigen gezocht|invallen|arrestatieteam/i.test(tekst);
  if (daad.test(tekst) || daadOmgekeerd.test(tekst) || politiegeweld) score += 8;
  else score -= 6;
  if (slachtoffer) score -= 12;
  return { ...x, score, sterk, analyse };
});
rijen.sort((a, b) => b.score - a.score);

const basis = path.join(os.homedir(), "actieplatform-analyse");
const md = [];
md.push(`# Sterkste verborgen kandidaten (${new Date().toISOString().slice(0, 10)})`, "");
md.push(`Totaal verborgen: ${rijen.length}. Score = geweldstaal (max 9) + bron + platform - analyse-signalen.`, "");
for (const x of rijen.slice(0, 80)) {
  md.push(`- **[${String(x.titel || "zonder titel").replace(/[\[\]]/g, "")}](${x.url})** — ${x.platform || "?"} · ${x.bron || "?"} · score ${x.score}`);
}
fs.writeFileSync(path.join(basis, "triage-29okt.md"), md.join("\n") + "\n");
const csv = ["score,platform,bron,titel,url"];
for (const x of rijen) csv.push([x.score, x.platform, x.bron, `"${String(x.titel ?? "").replaceAll('"', '""')}"`, x.url].join(","));
fs.writeFileSync(path.join(basis, "triage-29okt.csv"), csv.join("\n") + "\n");

console.log(`verborgen: ${rijen.length}`);
for (const x of rijen.slice(0, 20)) console.log(`${x.score}\t${x.platform}\t${String(x.titel).slice(0, 70)}\t${x.url.slice(0, 60)}`);
console.log("geschreven: triage-29okt.md + .csv");
