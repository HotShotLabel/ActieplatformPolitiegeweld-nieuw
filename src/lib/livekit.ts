/* LiveKit-helper (server-side). Eén vaste ruimte waar iemand kan
   uitzenden zodra er iets gebeurt; kijkers kijken mee op /live. */

import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export const LIVE_RUIMTE = "actieplatform-live";

export function liveIngesteld(): boolean {
  return Boolean(
    process.env.LIVEKIT_URL &&
      process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET
  );
}

function roomService(): RoomServiceClient {
  const url = process.env.LIVEKIT_URL ?? "";
  // De REST-API wil https, het token kan wss zijn.
  const host = url.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
  return new RoomServiceClient(
    host,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );
}

export interface LiveStand {
  live: boolean;
  titel: string;
  kijkers: number;
  gestartOp: string;
}

export async function liveStand(): Promise<LiveStand> {
  const leeg: LiveStand = { live: false, titel: "", kijkers: 0, gestartOp: "" };
  if (!liveIngesteld()) return leeg;
  try {
    const kamers = await roomService().listRooms([LIVE_RUIMTE]);
    const kamer = kamers[0];
    if (!kamer || (kamer.numParticipants ?? 0) === 0) return leeg;
    let titel = "";
    let gestartOp = "";
    try {
      const meta = JSON.parse(kamer.metadata || "{}");
      titel = String(meta.titel ?? "");
      gestartOp = String(meta.gestartOp ?? "");
    } catch {
      titel = "";
    }
    return {
      live: true,
      titel: titel || "Live-uitzending",
      kijkers: Math.max(0, kamer.numParticipants - 1),
      gestartOp,
    };
  } catch (fout) {
    console.error("liveStand:", fout);
    return leeg;
  }
}

/* Is er al een uitzender bezig? Dan mag er geen tweede bij. */
export async function heeftUitzender(): Promise<boolean> {
  const deelnemers = await roomService().listParticipants(LIVE_RUIMTE);
  return deelnemers.some((deelnemer) => deelnemer.permission?.canPublish);
}

export async function zetRuimteKlaar(titel: string): Promise<void> {
  const metadata = JSON.stringify({
    titel: titel || "Live-uitzending",
    gestartOp: new Date().toISOString(),
  });
  const dienst = roomService();
  try {
    await dienst.createRoom({
      name: LIVE_RUIMTE,
      metadata,
      emptyTimeout: 120,
    });
  } catch {
    // Bestaat al: alleen de titel bijwerken.
    await dienst.updateRoomMetadata(LIVE_RUIMTE, metadata).catch(() => {});
  }
}

export async function stopUitzending(): Promise<void> {
  await roomService().deleteRoom(LIVE_RUIMTE);
}

export async function maakToken(opties: {
  identiteit: string;
  naam: string;
  uitzender: boolean;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: opties.identiteit,
      name: opties.naam,
      ttl: opties.uitzender ? "6h" : "4h",
      metadata: JSON.stringify(opties.metadata ?? {}),
    }
  );
  token.addGrant({
    roomJoin: true,
    room: LIVE_RUIMTE,
    canPublish: opties.uitzender,
    canSubscribe: true,
    canPublishData: false,
    roomCreate: opties.uitzender,
  });
  return token.toJwt();
}
