/* Opslag op Cloudflare R2 (S3-koppeling). Opnames gaan rechtstreeks van
   de telefoon naar R2 met een tijdelijke uploadlink; kijken en downloaden
   gebeurt met ondertekende links, zodat de opslag niet openbaar hoeft. */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const UPLOAD_GELDIG_SECONDEN = 2 * 60 * 60; // uploadlink: 2 uur
const KIJK_GELDIG_SECONDEN = 7 * 24 * 60 * 60; // kijklink: 7 dagen

export function r2Ingesteld(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );
}

let cached: S3Client | null = null;
function client(): S3Client {
  if (!cached) {
    cached = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return cached;
}

export function maakSleutel(extensie: string): string {
  const datum = new Date().toISOString().slice(0, 10);
  return `uitzendingen/${datum}-${randomUUID().slice(0, 16)}.${extensie}`;
}

export function sleutelGeldig(sleutel: string): boolean {
  return /^uitzendingen\/[a-z0-9-]+\.(mp4|webm)$/.test(sleutel);
}

export async function maakUploadUrl(
  sleutel: string,
  contentType: string
): Promise<string> {
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: sleutel,
      ContentType: contentType,
    }),
    { expiresIn: UPLOAD_GELDIG_SECONDEN }
  );
}

export async function maakKijkUrl(sleutel: string): Promise<string> {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: sleutel,
      ResponseContentDisposition: "inline",
    }),
    { expiresIn: KIJK_GELDIG_SECONDEN }
  );
}

export async function bestaatObject(sleutel: string): Promise<{
  bestaat: boolean;
  grootte: number;
  soort: string;
}> {
  try {
    const kop = await client().send(
      new HeadObjectCommand({ Bucket: process.env.R2_BUCKET, Key: sleutel })
    );
    return {
      bestaat: true,
      grootte: Number(kop.ContentLength ?? 0),
      soort: String(kop.ContentType ?? ""),
    };
  } catch {
    return { bestaat: false, grootte: 0, soort: "" };
  }
}

export async function verwijderObject(sleutel: string): Promise<void> {
  await client().send(
    new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: sleutel })
  );
}
