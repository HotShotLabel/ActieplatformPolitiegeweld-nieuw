"use client";

/* Zelf live gaan, direct vanaf de telefoon. Eén knop:
   camera aan, beeld met logo erin wordt uitgezonden én opgenomen.
   Bij stoppen gaat de opname automatisch online (30 dagen). */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  RoomEvent,
} from "livekit-client";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";
import { uploadNaarYouTube } from "@/lib/youtube-client";
import {
  HartjesLaag,
  LiveChat,
  maakId,
  type LiveBericht,
  type LiveHart,
} from "@/components/live/live-chat";

const MAX_SECONDEN = 60 * 60; // harde grens: 60 minuten
const WAARSCHUWING_SECONDEN = 55 * 60;

function titelVoorYouTube(basis: string): string {
  const datum = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${(basis || "Live-uitzending").slice(0, 80)} - ${datum}`;
}

type Fase =
  | "klaar"
  | "bezig"
  | "live"
  | "stoppen"
  | "uploaden"
  | "online"
  | "fout";

export function LiveUitzender() {
  const [fase, setFase] = useState<Fase>("klaar");
  const [melding, setMelding] = useState("");
  const [naam, setNaam] = useState("");
  const [titel, setTitel] = useState("");
  const [kijkers, setKijkers] = useState(0);
  const [seconden, setSeconden] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [heeftBeeld, setHeeftBeeld] = useState(true);
  const [berichten, setBerichten] = useState<LiveBericht[]>([]);
  const [harten, setHarten] = useState<LiveHart[]>([]);
  const [youtubeStand, setYoutubeStand] = useState<
    "" | "bezig" | "klaar" | "mislukt"
  >("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cameraRef = useRef<MediaStream | null>(null);
  const composietRef = useRef<MediaStream | null>(null);
  const animateRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const blobRef = useRef<Blob | null>(null);
  const opnameIdRef = useRef("");
  const opnameTypeRef = useRef("video/webm");
  const duurRef = useRef(0);
  const startTijdRef = useRef(0);
  const faseRef = useRef<Fase>("klaar");
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const zetFase = useCallback((nieuw: Fase) => {
    faseRef.current = nieuw;
    setFase(nieuw);
  }, []);

  const voegHartToe = useCallback(() => {
    const nieuw: LiveHart = {
      id: maakId(),
      links: 6 + Math.round(Math.random() * 78),
      groot: Math.random() > 0.5,
    };
    setHarten((huidig) => [...huidig.slice(-14), nieuw]);
    window.setTimeout(
      () => setHarten((huidig) => huidig.filter((hart) => hart.id !== nieuw.id)),
      2400
    );
  }, []);

  const verwerkData = useCallback(
    (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data?.soort === "chat" && typeof data.tekst === "string") {
          setBerichten((huidig) => [
            ...huidig.slice(-79),
            {
              id: maakId(),
              naam: String(data.naam ?? "Kijker").slice(0, 30),
              tekst: data.tekst.slice(0, 200),
            },
          ]);
        } else if (data?.soort === "hart") {
          voegHartToe();
        }
      } catch {
        // onbekend bericht; negeren
      }
    },
    [voegHartToe]
  );

  const stuurData = useCallback((inhoud: Record<string, unknown>) => {
    const kamer = roomRef.current;
    if (!kamer) return;
    kamer.localParticipant
      .publishData(new TextEncoder().encode(JSON.stringify(inhoud)), {
        reliable: true,
        topic: "live-bericht",
      })
      .catch(() => {});
  }, []);

  const stuurChat = useCallback(
    (tekst: string) => {
      const berichtNaam = naam.trim() || "Uitzender";
      setBerichten((huidig) => [
        ...huidig.slice(-79),
        { id: maakId(), naam: berichtNaam, tekst },
      ]);
      stuurData({ soort: "chat", naam: berichtNaam, tekst });
    },
    [naam, stuurData]
  );

  const stuurHart = useCallback(() => {
    voegHartToe();
    stuurData({ soort: "hart", naam: naam.trim() || "Uitzender" });
  }, [naam, stuurData, voegHartToe]);

  const allesStoppen = useCallback(() => {
    window.clearInterval(timerRef.current);
    cancelAnimationFrame(animateRef.current);
    roomRef.current?.disconnect().catch(() => {});
    roomRef.current = null;
    cameraRef.current?.getTracks().forEach((spoor) => spoor.stop());
    cameraRef.current = null;
    composietRef.current?.getVideoTracks().forEach((spoor) => spoor.stop());
    composietRef.current = null;
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      cancelAnimationFrame(animateRef.current);
      roomRef.current?.disconnect().catch(() => {});
      cameraRef.current?.getTracks().forEach((spoor) => spoor.stop());
      composietRef.current?.getVideoTracks().forEach((spoor) => spoor.stop());
    };
  }, []);

  // Waarschuwen als je het tabblad sluit tijdens een uitzending.
  useEffect(() => {
    const bijSluiten = (gebeurtenis: BeforeUnloadEvent) => {
      if (faseRef.current === "live" || faseRef.current === "uploaden") {
        gebeurtenis.preventDefault();
      }
    };
    window.addEventListener("beforeunload", bijSluiten);
    return () => window.removeEventListener("beforeunload", bijSluiten);
  }, []);

  const kiesMime = useCallback(() => {
    if (typeof MediaRecorder === "undefined") return "";
    const kandidaten = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    return kandidaten.find((kandidaat) => MediaRecorder.isTypeSupported(kandidaat)) ?? "";
  }, []);

  const verstuurOpname = useCallback(
    async (blob: Blob) => {
      zetFase("uploaden");
      setUploadPct(0);
      blobRef.current = blob;
      const extensie = opnameTypeRef.current === "video/mp4" ? "mp4" : "webm";
      try {
        // Tijdelijke uploadlink van onze server; het bestand gaat als
        // ondertekend formulier rechtstreeks naar de opslag (Cloudflare R2).
        const start = await fetch("/api/live/upload", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ extensie }),
        });
        const startData = await start.json();
        if (!start.ok) {
          throw new Error(startData.fout ?? "Uploadlink mislukte.");
        }
        await new Promise<void>((klaar, mislukt) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", String(startData.uploadUrl));
          xhr.setRequestHeader("content-type", opnameTypeRef.current);
          xhr.upload.onprogress = (gebeurtenis) => {
            if (gebeurtenis.lengthComputable) {
              setUploadPct(
                Math.round((gebeurtenis.loaded / gebeurtenis.total) * 100)
              );
            }
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? klaar()
              : mislukt(new Error(`Upload mislukte (${xhr.status}).`));
          xhr.onerror = () =>
            mislukt(new Error("Netwerkfout tijdens de upload."));
          xhr.send(blob);
        });

        // Registreren, met herkansingen zolang het bestand nog landt.
        type RegistratieAntwoord = {
          ok?: boolean;
          id?: string;
          youtubeToken?: string;
          fout?: string;
        };
        let antwoord: RegistratieAntwoord = {};
        for (let poging = 0; poging < 6; poging += 1) {
          const registratie = await fetch("/api/live/registreer", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              sleutel: String(startData.sleutel),
              titel: titel || "Live-uitzending",
              duurSec: duurRef.current,
              grootteMb: Math.round((blob.size / (1024 * 1024)) * 10) / 10,
            }),
          });
          antwoord = await registratie.json();
          if (registratie.ok) break;
          if (registratie.status !== 409) {
            throw new Error(antwoord.fout ?? "registreren mislukte");
          }
          await new Promise((wacht) => setTimeout(wacht, 2000));
        }
        if (!antwoord.ok) {
          throw new Error(
            antwoord.fout ?? "De opname kwam niet aan bij de opslag."
          );
        }
        opnameIdRef.current = String(antwoord.id ?? "");
        zetFase("online");

        // Nog een stap: privé naar YouTube op het eigen kanaal.
        if (antwoord.youtubeToken && blob.size > 0) {
          setYoutubeStand("bezig");
          try {
            const videoId = await uploadNaarYouTube(
              blob,
              String(antwoord.youtubeToken),
              titelVoorYouTube(titel)
            );
            if (!videoId) throw new Error("geen video-id");
            await fetch("/api/live/youtube-klaar", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: opnameIdRef.current,
                youtubeId: videoId,
              }),
            });
            setYoutubeVideoId(videoId);
            setYoutubeStand("klaar");
          } catch (fout) {
            console.error("youtube-upload:", fout);
            setYoutubeStand("mislukt");
          }
        }
      } catch (fout) {
        setMelding(
          (fout as Error).message ||
            "De opname kon niet worden geüpload. Probeer het opnieuw."
        );
        zetFase("fout");
      }
    },
    [titel, zetFase]
  );

  const naarYouTube = useCallback(async () => {
    const blob = blobRef.current;
    const id = opnameIdRef.current;
    if (!blob || !id) return;
    setYoutubeStand("bezig");
    try {
      const antwoord = await fetch("/api/live/youtube-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await antwoord.json();
      if (!antwoord.ok || !data.token) {
        throw new Error(data.fout ?? "geen YouTube-toegang");
      }
      const videoId = await uploadNaarYouTube(
        blob,
        String(data.token),
        titelVoorYouTube(titel)
      );
      if (!videoId) throw new Error("geen video-id");
      await fetch("/api/live/youtube-klaar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, youtubeId: videoId }),
      });
      setYoutubeVideoId(videoId);
      setYoutubeStand("klaar");
    } catch (fout) {
      console.error("youtube-opnieuw:", fout);
      setYoutubeStand("mislukt");
    }
  }, [titel]);

  const stop = useCallback(() => {
    if (faseRef.current !== "live") return;
    zetFase("stoppen");
    if (startTijdRef.current > 0) {
      duurRef.current = Math.round(
        (Date.now() - startTijdRef.current) / 1000
      );
    }
    // Kijkers meteen laten weten dat het klaar is.
    stuurData({ soort: "einde" });
    window.clearInterval(timerRef.current);
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const type = opnameTypeRef.current;
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        allesStoppen();
        if (blob.size > 0) {
          void verstuurOpname(blob);
        } else {
          setMelding("De opname is leeg gebleven.");
          zetFase("fout");
        }
      };
      recorder.stop();
    } else {
      allesStoppen();
      setMelding("Er is niets opgenomen.");
      zetFase("fout");
    }
  }, [allesStoppen, stuurData, verstuurOpname, zetFase]);

  const start = useCallback(async () => {
    if (faseRef.current === "bezig" || faseRef.current === "live") return;
    setMelding("");
    setSeconden(0);
    setKijkers(0);
    setBerichten([]);
    setHarten([]);
    setYoutubeStand("");
    setYoutubeVideoId("");
    chunksRef.current = [];
    zetFase("bezig");

    try {
      // 1. Camera en microfoon
      const camera = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      cameraRef.current = camera;

      // Scherm aan houden zodat het beeld blijft lopen.
      try {
        const wakker = (
          navigator as Navigator & {
            wakeLock?: { request: (soort: string) => Promise<{ release: () => Promise<void> }> };
          }
        ).wakeLock;
        if (wakker) {
          wakeLockRef.current = await wakker.request("screen");
        }
      } catch {
        // geen wake lock, geen probleem
      }

      // 2. Toegangsbewijs van de server (één uitzender tegelijk)
      const tokenAntwoord = await fetch("/api/live/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rol: "uitzender", naam, titel }),
      });
      const tokenData = await tokenAntwoord.json();
      if (!tokenAntwoord.ok) {
        throw new Error(tokenData.fout ?? "De uitzending kon niet starten.");
      }

      // 3. Beeld met logo via een canvas, plus de microfoon erbij
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) throw new Error("Beeld niet gevonden.");
      video.srcObject = camera;
      await video.play();
      await new Promise<void>((klaar) => {
        if (video.videoWidth > 0) return klaar();
        video.onloadedmetadata = () => klaar();
      });

      const breed = Math.min(1280, video.videoWidth || 1280);
      const hoog =
        Math.round(((video.videoHeight || 720) / (video.videoWidth || 1280)) * breed / 2) * 2;
      canvas.width = breed;
      canvas.height = hoog;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas niet beschikbaar.");

      const logo = new Image();
      logo.src = "/logo-watermerk.png";
      await logo.decode();

      const teken = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const marge = 24;
        const logoBreed = Math.min(logo.width, canvas.width - 2 * marge);
        const logoHoog = (logo.height / logo.width) * logoBreed;
        ctx.drawImage(
          logo,
          canvas.width - logoBreed - marge,
          canvas.height - logoHoog - marge,
          logoBreed,
          logoHoog
        );
        animateRef.current = requestAnimationFrame(teken);
      };
      teken();

      // 4. Stream voor uitzending en opname
      let composiet: MediaStream;
      if (typeof canvas.captureStream === "function") {
        const canvasStream = canvas.captureStream(30);
        composiet = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...camera.getAudioTracks(),
        ]);
      } else {
        // Hele oude browser: zonder logo, maar wel live.
        composiet = camera;
        setHeeftBeeld(false);
      }
      composietRef.current = composiet;

      // 5. Opnemen
      const mime = kiesMime();
      opnameTypeRef.current = mime.startsWith("video/mp4") ? "video/mp4" : "video/webm";
      // Bewust HD en laag: max 720p (canvas hierboven) en ~1,2 Mbps.
      // Geen 4K, zodat opnames klein blijven (ongeveer 90 MB per 10 minuten)
      // en binnen de gratis opslag passen.
      const recorder = new MediaRecorder(composiet, {
        mimeType: mime || undefined,
        videoBitsPerSecond: 1_200_000,
        audioBitsPerSecond: 64_000,
      });
      recorder.ondataavailable = (gebeurtenis) => {
        if (gebeurtenis.data.size > 0) chunksRef.current.push(gebeurtenis.data);
      };
      recorder.start(4000);
      recorderRef.current = recorder;

      // 6. Uitzenden via LiveKit
      const kamer = new Room();
      kamer.on(RoomEvent.ParticipantConnected, () =>
        setKijkers(kamer.remoteParticipants.size)
      );
      kamer.on(RoomEvent.ParticipantDisconnected, () =>
        setKijkers(kamer.remoteParticipants.size)
      );
      kamer.on(RoomEvent.DataReceived, (payload: Uint8Array) =>
        verwerkData(payload)
      );
      kamer.on(RoomEvent.Disconnected, () => {
        if (faseRef.current === "live") {
          setMelding(
            "De uitzending is van buitenaf gestopt. Je opname wordt alsnog geüpload."
          );
          stop();
        }
      });
      await kamer.connect(tokenData.url, tokenData.token);
      roomRef.current = kamer;

      const videoSpoor = composiet.getVideoTracks()[0];
      const audioSpoor = composiet.getAudioTracks()[0];
      if (videoSpoor) {
        await kamer.localParticipant.publishTrack(
          new LocalVideoTrack(videoSpoor),
          { simulcast: false }
        );
      }
      if (audioSpoor) {
        await kamer.localParticipant.publishTrack(
          new LocalAudioTrack(audioSpoor)
        );
      }

      // 7. Klok en grens (op echte kloktijd, niet op interval-tellen)
      duurRef.current = 0;
      startTijdRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        duurRef.current = Math.round(
          (Date.now() - startTijdRef.current) / 1000
        );
        setSeconden(duurRef.current);
        if (duurRef.current >= MAX_SECONDEN) {
          setMelding("De maximale duur van 60 minuten is bereikt.");
          stop();
        }
      }, 1000);

      setKijkers(kamer.remoteParticipants.size);
      zetFase("live");
    } catch (fout) {
      allesStoppen();
      const tekst = (fout as Error).message ?? "";
      setMelding(
        tekst.includes("Permission") || tekst.includes("NotAllowed")
          ? "Geen toegang tot camera of microfoon. Sta dit toe in je browser."
          : tekst || "Er ging iets mis bij het starten."
      );
      zetFase("fout");
    }
  }, [allesStoppen, kiesMime, naam, stop, titel, verwerkData, zetFase]);

  const minuten = Math.floor(seconden / 60);
  const restSeconden = seconden % 60;

  return (
    <div className="space-y-6">
      <video ref={videoRef} muted playsInline className="hidden" />
      <div
        className={cn(
          "relative",
          fase === "live" || fase === "stoppen" ? "block" : "hidden"
        )}
      >
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl border border-accent/40 bg-black"
        />
        <HartjesLaag harten={harten} />
        <p className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white">
          <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Live
        </p>
      </div>

      {(fase === "klaar" || fase === "bezig" || fase === "fout") && (
        <div className="rounded-2xl border border-line bg-white/[0.02] p-8 md:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            Direct beginnen
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Ga nu live vanaf je telefoon
          </h2>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-muted">
            Je camera gaat aan, kijkers zien je meteen op de live-pagina en
            het beeld wordt opgenomen. Alles in <span className="text-foreground">HD
            (max 720p, bewust geen 4K)</span>, zodat het klein en gratis
            blijft. Als je stopt, staat de opname er binnen een minuut, met
            het logo erin, 30 dagen online.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">
                Je naam (mag ook leeg blijven)
              </span>
              <input
                type="text"
                value={naam}
                onChange={(gebeurtenis) => setNaam(gebeurtenis.target.value)}
                maxLength={60}
                className="h-11 w-full rounded-lg border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-muted-2"
                placeholder="Bijv. je voornaam"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">
                Wat is er aan de hand? (korte titel)
              </span>
              <input
                type="text"
                value={titel}
                onChange={(gebeurtenis) => setTitel(gebeurtenis.target.value)}
                maxLength={120}
                className="h-11 w-full rounded-lg border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-muted-2"
                placeholder="Bijv. Live vanaf het politiebureau"
              />
            </label>
          </div>

          {melding && (
            <p className="mt-5 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
              {melding}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={start}
              disabled={fase === "bezig"}
              className={cn(
                btnPrimary,
                "h-12 bg-accent px-7 text-base hover:bg-[#d0431f]",
                fase === "bezig" && "opacity-60"
              )}
            >
              {fase === "bezig" ? "Bezig met starten..." : "Ga nu live"}
            </button>
            <p className="text-xs text-muted-2">
              Je locatie wordt niet gedeeld. Alleen beeld en geluid.
            </p>
          </div>
        </div>
      )}

      {(fase === "live" || fase === "stoppen") && (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-8 md:p-10">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
            <span
              aria-hidden
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent"
            />
            Je bent live
          </p>
          <p className="mt-4 font-mono text-4xl font-semibold tabular-nums">
            {String(minuten).padStart(2, "0")}:{String(restSeconden).padStart(2, "0")}
          </p>
          <p className="mt-3 text-sm text-muted">
            {kijkers === 0
              ? "Nog geen kijkers. Deel /live met wie moet meekijken."
              : `${kijkers} ${kijkers === 1 ? "kijker" : "kijkers"} nu aan het meekijken.`}
            {seconden >= WAARSCHUWING_SECONDEN &&
              " De uitzending stopt automatisch bij 60 minuten."}
          </p>
          <button
            type="button"
            onClick={stop}
            disabled={fase === "stoppen"}
            className={cn(
              btnPrimary,
              "mt-6 h-12 bg-foreground px-7 text-base text-background hover:bg-foreground/90",
              fase === "stoppen" && "opacity-60"
            )}
          >
            {fase === "stoppen" ? "Stoppen..." : "Stop de uitzending"}
          </button>
          {melding && (
            <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
              {melding}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-2">
            Laat het scherm aan en houd deze pagina open; het scherm blijft
            vanzelf wakker. Na het stoppen wordt de opname automatisch
            geüpload.
          </p>
          <div className="mt-6">
            <LiveChat
              berichten={berichten}
              naam={naam}
              zetNaam={setNaam}
              onVerstuur={stuurChat}
              onHart={stuurHart}
            />
          </div>
        </div>
      )}

      {fase === "uploaden" && (
        <div className="rounded-2xl border border-line bg-white/[0.02] p-8 md:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Opname wordt geüpload...
          </h2>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
          <p className="mt-3 font-mono text-sm text-muted">{uploadPct}%</p>
          <p className="mt-3 text-xs text-muted-2">
            Laat dit tabblad open tot de upload klaar is.
          </p>
          {melding && (
            <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
              {melding}
            </p>
          )}
        </div>
      )}

      {fase === "fout" && blobRef.current && (
        <button
          type="button"
          onClick={() => {
            if (blobRef.current) void verstuurOpname(blobRef.current);
          }}
          className={btnGhost}
        >
          Upload opnieuw proberen
        </button>
      )}

      {fase === "online" && (
        <div className="rounded-2xl border border-line bg-white/[0.02] p-8 md:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            De uitzending staat online
          </h2>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-muted">
            Je opname staat bij de eerdere uitzendingen, met het logo erin.
            Hij blijft 30 dagen online en is vrij te downloaden.
            {!heeftBeeld &&
              " Let op: jouw browser kon het logo niet in de video zetten."}
          </p>
          {melding && (
            <p className="mt-4 rounded-lg border border-line bg-white/[0.03] px-4 py-3 text-sm text-muted">
              {melding}
            </p>
          )}

          {youtubeStand === "bezig" && (
            <p className="mt-4 rounded-lg border border-line bg-white/[0.03] px-4 py-3 text-sm text-muted">
              Bezig met een privé-kopie naar YouTube op je eigen kanaal...
            </p>
          )}
          {youtubeStand === "klaar" && (
            <p className="mt-4 rounded-lg border border-line bg-white/[0.03] px-4 py-3 text-sm text-muted">
              Privé op YouTube gezet op je kanaal. Alleen jij ziet hem daar.{" "}
              {youtubeVideoId && (
                <a
                  className="underline"
                  href={`https://studio.youtube.com/video/${youtubeVideoId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in YouTube Studio
                </a>
              )}
            </p>
          )}
          {youtubeStand === "mislukt" && (
            <div className="mt-4 rounded-lg border border-line bg-white/[0.03] px-4 py-3 text-sm text-muted">
              <p>
                De privé-upload naar YouTube lukte niet. De opname staat wel
                op de site.
              </p>
              <button
                type="button"
                onClick={naarYouTube}
                className={cn(btnGhost, "mt-3 h-9 px-4 text-xs")}
              >
                Opnieuw naar YouTube
              </button>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/live" className={btnPrimary}>
              Bekijk op de live-pagina
            </a>
            <button type="button" onClick={start} className={btnGhost}>
              Nog een uitzending
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
