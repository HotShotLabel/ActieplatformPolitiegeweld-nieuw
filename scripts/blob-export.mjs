/* Exporteer de publieke blob-JSON naar een map (voor archief/back-up). */
import { list } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";

const token = process.env.BLOB_READ_WRITE_TOKEN;
const doel = process.argv[2];
if (!token || !doel) { console.error("gebruik: node --env-file=.env.local scripts/blob-export.mjs <map>"); process.exit(1); }
await fs.mkdir(doel, { recursive: true });
const { blobs } = await list({ prefix: "data/", token });
for (const blob of blobs) {
  const antwoord = await fetch(blob.url);
  if (!antwoord.ok) { console.error("faalde:", blob.pathname); continue; }
  const naam = blob.pathname.replaceAll("/", "_");
  await fs.writeFile(path.join(doel, naam), await antwoord.text());
  console.log("bewaard:", naam);
}
