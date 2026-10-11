"use client";

/* Meekijken met een live-uitzending. Krijgt een toegangsbewijs van de
   server en verbindt met de uitzending. Stopt de uitzender, dan meldt
   de component dat netjes. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";

export function LiveKijker({
  titel,
  onEinde,
}: {
  titel: string;
  onEinde: () => void;
}) {
  const [gestart, setGestart] = useState(false);
  const [fout, setFout] = useState("");
  const [geluidAan, setGeluidAan] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const kamerRef = useRef<Room | null>(null);

  const begin = useCallback(async () => {
    setFout("");
    setGestart(true);
    try {
      const antwoord = await fetch("/api/live/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rol: "kijker" }),
      });
      const data = await antwoord.json();
      if (!antwoord.ok) throw new Error(data.fout ?? "Kon niet verbinden.");

      const kamer = new Room();
      kamer.on(RoomEvent.TrackSubscribed, (spoor) => {
        if (spoor.kind === "video" && videoRef.current) {
          spoor.attach(videoRef.current);
        } else if (spoor.kind === "audio" && audioRef.current) {
          spoor.attach(audioRef.current);
          audioRef.current.play().catch(() => {
            // Safari wil soms een klik voordat er geluid is.
            setGeluidAan(false);
          });
        }
      });
      kamer.on(RoomEvent.Disconnected, () => onEinde());
      await kamer.connect(data.url, data.token);
      kamerRef.current = kamer;
      videoRef.current?.play().catch(() => {});
    } catch (foutMelding) {
      setFout((foutMelding as Error).message || "Kon niet verbinden.");
      setGestart(false);
    }
  }, [onEinde]);

  useEffect(() => {
    return () => {
      kamerRef.current?.disconnect().catch(() => {});
    };
  }, []);

  if (!gestart) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-8 md:p-10">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          <span
            aria-hidden
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent"
          />
          Er is nu een live-uitzending
        </p>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          {titel}
        </h2>
        <button
          type="button"
          onClick={begin}
          className={cn(btnPrimary, "mt-6 h-12 bg-accent px-7 text-base hover:bg-[#d0431f]")}
        >
          Kijk nu live
        </button>
        {fout && (
          <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
            {fout}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-accent/40 bg-black">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="aspect-video w-full bg-black"
        />
        <audio ref={audioRef} autoPlay />
        <p className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white">
          <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Live
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted">{titel}</p>
        {!geluidAan && (
          <button
            type="button"
            onClick={() => {
              audioRef.current?.play().catch(() => {});
              setGeluidAan(true);
            }}
            className="rounded-lg border border-line-strong px-4 py-2 text-xs transition-colors hover:bg-white/5"
          >
            Geluid aanzetten
          </button>
        )}
      </div>
    </div>
  );
}
