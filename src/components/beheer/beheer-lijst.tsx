"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";
import { SOORT_LABEL } from "@/lib/meldingen";
import { uploadNaarYouTube } from "@/lib/youtube-client";
import { BeheerKaart } from "@/components/beheer/beheer-kaart";

interface BeheerMelding {
  id: string;
  soort: string;
  datum: string;
  plaats: string;
  beschrijving: string;
  opKaart: boolean;
  contactEmail: string;
  agentGeslacht: string;
  agentLeeftijd: string;
  agentNaam: string;
  eenheid: string;
  voertuig: string;
  kentekens: string;
  dienstnummers: string;
  soortAgent: string;
  aantalAgenten: string;
  agentBeschrijving: string;
  status: string;
  notitie: string;
  kaartpunt: { lat: number; lng: number } | null;
  createdAt: string;
}

function agentRijen(melding: BeheerMelding): [string, string][] {
  const rijen: [string, string][] = [
    ["Aantal agenten", melding.aantalAgenten],
    ["Geslacht", melding.agentGeslacht],
    ["Leeftijd (schatting)", melding.agentLeeftijd],
    ["Naam", melding.agentNaam],
    ["Eenheid", melding.eenheid],
    ["Soort agent", melding.soortAgent],
    ["Voertuig", melding.voertuig],
    ["Kenteken(s)", melding.kentekens],
    ["Dienstnummer(s)", melding.dienstnummers],
  ];
  return rijen.filter((rij) => rij[1] !== "");
}

interface BeheerUitzending {
  id: string;
  titel: string;
  url: string;
  grootteMb: number;
  duurSec: number;
  dagenOver: number;
  youtubeUrl: string;
}

interface BeheerLink {
  id: string;
  url: string;
  host: string;
  titel: string;
  naam: string;
}

interface BeheerBeeld {
  id: string;
  url: string;
  platform: string;
  titel: string;
  toelichting: string;
  plaats: string;
  datum: string;
  bron: string;
  agentKenmerk: string;
  analyse: string;
  zichtbaar: boolean;
  toegevoegdOp: string;
}

interface BeheerProfiel {
  id: string;
  label: string;
  kenmerk: string;
  eenheid: string;
  notities: string;
  bronnen: { label: string; url: string }[];
  items: { url: string; titel: string }[];
  status: string;
  zichtbaar: boolean;
  aangemaaktOp: string;
}

const beeldInput =
  "h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none";

const datumFormatter = new Intl.DateTimeFormat("nl-NL", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Amsterdam",
});

function formatDatum(iso: string): string {
  if (!iso) return "onbekend";
  try {
    return datumFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
}

export function BeheerLijst() {
  const [token, setToken] = useState("");
  const [meldingen, setMeldingen] = useState<BeheerMelding[] | null>(null);
  const [status, setStatus] = useState<"login" | "laden" | "klaar" | "fout">(
    "login"
  );
  const [foutmelding, setFoutmelding] = useState("");
  const [verwijderBezig, setVerwijderBezig] = useState("");
  const [liveStand, setLiveStand] = useState<{
    live: boolean;
    titel: string;
    kijkers: number;
  } | null>(null);
  const [stopBezig, setStopBezig] = useState(false);
  const [liveMelding, setLiveMelding] = useState("");
  const [uitzendingen, setUitzendingen] = useState<BeheerUitzending[]>([]);
  const [opnameBezig, setOpnameBezig] = useState("");
  const [uitzendingMelding, setUitzendingMelding] = useState("");
  const [links, setLinks] = useState<BeheerLink[]>([]);
  const [linkBezig, setLinkBezig] = useState("");
  const [linkMelding, setLinkMelding] = useState("");
  const [zoek, setZoek] = useState("");
  const [statusBezig, setStatusBezig] = useState("");
  const [notitieBezig, setNotitieBezig] = useState("");
  const [notitieConcepten, setNotitieConcepten] = useState<
    Record<string, string>
  >({});
  const [pwNieuw, setPwNieuw] = useState("");
  const [pwHerhaal, setPwHerhaal] = useState("");
  const [pwBezig, setPwBezig] = useState(false);
  const [pwMelding, setPwMelding] = useState("");
  const [beelden, setBeelden] = useState<BeheerBeeld[] | null>(null);
  const [beeldBezig, setBeeldBezig] = useState("");
  const [beeldMelding, setBeeldMelding] = useState("");
  const [nieuwBeeld, setNieuwBeeld] = useState({
    url: "",
    titel: "",
    plaats: "",
  });
  const [nieuwBeeldBezig, setNieuwBeeldBezig] = useState(false);
  const [kenmerkConcepten, setKenmerkConcepten] = useState<
    Record<string, string>
  >({});
  const [kenmerkBezig, setKenmerkBezig] = useState("");
  const [koppelZoek, setKoppelZoek] = useState("");
  const [koppelBezig, setKoppelBezig] = useState(false);
  const [koppelFout, setKoppelFout] = useState("");
  const [koppelResultaat, setKoppelResultaat] = useState<{
    meldingen: {
      id: string;
      plaats: string;
      datum: string;
      beschrijving: string;
      agent: string;
      eenheid: string;
    }[];
    beelden: {
      id: string;
      titel: string;
      bron: string;
      url: string;
      agentKenmerk: string;
    }[];
    zaken: {
      id: string;
      titel: string;
      plaats: string;
      jaar: string;
      uitkomst: string;
    }[];
    overige: { ecli: string; datum: string; omschrijving: string }[];
  } | null>(null);
  const [profielen, setProfielen] = useState<BeheerProfiel[] | null>(null);
  const [profielBezig, setProfielBezig] = useState("");
  const [profielZichtBezig, setProfielZichtBezig] = useState("");
  const [profielMelding, setProfielMelding] = useState("");
  const [nieuwProfielBezig, setNieuwProfielBezig] = useState(false);
  const [nieuwProfiel, setNieuwProfiel] = useState({
    label: "",
    kenmerk: "",
    eenheid: "",
    notities: "",
    status: "mogelijk",
    bronRegels: "",
    itemRegels: "",
  });

  const laadLive = useCallback(async () => {
    try {
      const antwoord = await fetch("/api/live", { cache: "no-store" });
      if (!antwoord.ok) return;
      const data = await antwoord.json();
      setLiveStand({
        live: Boolean(data?.live?.live),
        titel: String(data?.live?.titel ?? ""),
        kijkers: Number(data?.live?.kijkers ?? 0),
      });
      setUitzendingen(
        Array.isArray(data?.uitzendingen) ? data.uitzendingen : []
      );
      setLinks(Array.isArray(data?.links) ? data.links : []);
    } catch {
      // stil blijven; het is een hulpmiddel
    }
  }, []);

  const verversMeldingenStil = useCallback(async () => {
    try {
      const antwoord = await fetch("/api/beheer/meldingen", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (antwoord.status === 401) {
        setToken("");
        setStatus("login");
        try {
          sessionStorage.removeItem("beheer-token");
        } catch {
          // niets
        }
        return;
      }
      if (!antwoord.ok) return;
      const data = (await antwoord.json()) as { meldingen: BeheerMelding[] };
      setMeldingen(data.meldingen);
    } catch {
      // stil; de volgende ronde probeert het opnieuw
    }
  }, [token]);

  const laadBeeldenStil = useCallback(async () => {
    try {
      const antwoord = await fetch("/api/beheer/beelden", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!antwoord.ok) return;
      const data = (await antwoord.json()) as { beelden: BeheerBeeld[] };
      setBeelden(data.beelden);
    } catch {
      // stil; proberen we later opnieuw
    }
  }, [token]);

  const laadProfielenStil = useCallback(async () => {
    try {
      const antwoord = await fetch("/api/beheer/profielen", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!antwoord.ok) return;
      const data = (await antwoord.json()) as { profielen: BeheerProfiel[] };
      setProfielen(data.profielen);
    } catch {
      // stil; proberen we later opnieuw
    }
  }, [token]);

  useEffect(() => {
    if (status !== "klaar") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    laadLive();
     
    verversMeldingenStil();
     
    laadBeeldenStil();
     
    laadProfielenStil();
    const timerLive = window.setInterval(laadLive, 15 * 1000);
    const timerMeldingen = window.setInterval(() => {
      void verversMeldingenStil();
      void laadBeeldenStil();
    }, 60 * 1000);
    return () => {
      window.clearInterval(timerLive);
      window.clearInterval(timerMeldingen);
    };
  }, [status, laadLive, verversMeldingenStil, laadBeeldenStil, laadProfielenStil]);

  // Na verversen: het bewaarde wachtwoord opnieuw gebruiken (zelfde tab).
  useEffect(() => {
    let bewaard = "";
    try {
      bewaard = sessionStorage.getItem("beheer-token") ?? "";
    } catch {
      bewaard = "";
    }
    if (!bewaard) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(bewaard);
     
    void laadMeldingen(bewaard);
     
  }, []);

  async function stopUitzending() {
    if (!window.confirm("De live-uitzending meteen stoppen voor iedereen?")) {
      return;
    }
    setStopBezig(true);
    setLiveMelding("");
    try {
      const antwoord = await fetch("/api/beheer/live-stop", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await antwoord.json().catch(() => ({}));
      if (antwoord.ok) {
        setLiveMelding("De uitzending is gestopt.");
        await laadLive();
      } else {
        setLiveMelding(data.fout ?? "Stoppen mislukte.");
      }
    } catch {
      setLiveMelding("Stoppen mislukte. Probeer het opnieuw.");
    } finally {
      setStopBezig(false);
    }
  }

  async function verwijderUitzending(id: string) {
    if (
      !window.confirm(
        "Deze uitzending voorgoed verwijderen? Het bestand en de registratie verdwijnen."
      )
    ) {
      return;
    }
    setOpnameBezig(id);
    setUitzendingMelding("");
    try {
      const antwoord = await fetch("/api/beheer/uitzending", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (antwoord.ok) {
        setUitzendingMelding("De uitzending is verwijderd.");
        await laadLive();
      } else {
        setUitzendingMelding(data.fout ?? "Verwijderen mislukte.");
      }
    } catch {
      setUitzendingMelding("Verwijderen mislukte. Probeer het opnieuw.");
    } finally {
      setOpnameBezig("");
    }
  }

  async function naarYouTubeBeheer(uitzending: BeheerUitzending) {
    setOpnameBezig(uitzending.id);
    setUitzendingMelding("");
    try {
      const tokenAntwoord = await fetch("/api/live/youtube-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: uitzending.id }),
      });
      const tokenData = await tokenAntwoord.json();
      if (!tokenAntwoord.ok || !tokenData.token) {
        throw new Error(tokenData.fout ?? "Geen YouTube-toegang.");
      }
      const bestand = await fetch(uitzending.url);
      if (!bestand.ok) throw new Error("Het bestand kon niet worden geladen.");
      const blob = await bestand.blob();
      const videoId = await uploadNaarYouTube(
        blob,
        String(tokenData.token),
        `${uitzending.titel} - ${new Date().toLocaleDateString("nl-NL")}`
      );
      if (!videoId) throw new Error("Geen video-id van YouTube.");
      const klaar = await fetch("/api/live/youtube-klaar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: uitzending.id, youtubeId: videoId }),
      });
      if (!klaar.ok) throw new Error("Opslaan van de YouTube-status mislukte.");
      setUitzendingMelding("Privé op YouTube gezet.");
      await laadLive();
    } catch (fout) {
      setUitzendingMelding(
        (fout as Error).message || "De YouTube-upload mislukte."
      );
    } finally {
      setOpnameBezig("");
    }
  }

  async function verwijderLink(id: string) {
    if (!window.confirm("Deze ingestuurde link verwijderen?")) return;
    setLinkBezig(id);
    setLinkMelding("");
    try {
      const antwoord = await fetch("/api/beheer/livelink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (antwoord.ok) {
        setLinkMelding("De link is verwijderd.");
        await laadLive();
      } else {
        setLinkMelding(data.fout ?? "Verwijderen mislukte.");
      }
    } catch {
      setLinkMelding("Verwijderen mislukte. Probeer het opnieuw.");
    } finally {
      setLinkBezig("");
    }
  }

  async function laadMeldingen(gebruikToken: string) {
    setStatus("laden");
    setFoutmelding("");
    try {
      const antwoord = await fetch("/api/beheer/meldingen", {
        headers: { Authorization: `Bearer ${gebruikToken}` },
      });
      if (antwoord.status === 401) {
        setStatus("fout");
        setFoutmelding("Onjuist wachtwoord.");
        setToken("");
        try {
          sessionStorage.removeItem("beheer-token");
        } catch {
          // niets
        }
        return;
      }
      if (!antwoord.ok) {
        setStatus("fout");
        setFoutmelding("Meldingen konden niet worden geladen.");
        return;
      }
      const data = (await antwoord.json()) as { meldingen: BeheerMelding[] };
      setMeldingen(data.meldingen);
      setStatus("klaar");
      try {
        sessionStorage.setItem("beheer-token", gebruikToken);
      } catch {
        // geen sessionStorage, geen probleem
      }
    } catch {
      setStatus("fout");
      setFoutmelding("Meldingen konden niet worden geladen.");
    }
  }

  async function verwijder(melding: BeheerMelding) {
    if (
      !window.confirm(
        "Weet je zeker dat je deze melding definitief wilt verwijderen? Een gekoppeld kaartpunt gaat ook weg."
      )
    ) {
      return;
    }
    setVerwijderBezig(melding.id);
    try {
      const antwoord = await fetch(
        `/api/beheer/meldingen?id=${encodeURIComponent(melding.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (antwoord.ok) {
        setMeldingen((huidig) =>
          huidig ? huidig.filter((item) => item.id !== melding.id) : huidig
        );
      } else {
        setFoutmelding("Verwijderen mislukte. Probeer het opnieuw.");
      }
    } catch {
      setFoutmelding("Verwijderen mislukte. Probeer het opnieuw.");
    } finally {
      setVerwijderBezig("");
    }
  }

  async function zetStatus(melding: BeheerMelding, status: string) {
    setStatusBezig(melding.id);
    setFoutmelding("");
    try {
      const antwoord = await fetch("/api/beheer/meldingen", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: melding.id, status }),
      });
      if (!antwoord.ok) throw new Error();
      setMeldingen((huidig) =>
        huidig
          ? huidig.map((item) =>
              item.id === melding.id ? { ...item, status } : item
            )
          : huidig
      );
    } catch {
      setFoutmelding("Status opslaan mislukte. Probeer het opnieuw.");
    } finally {
      setStatusBezig("");
    }
  }

  async function bewaarNotitie(melding: BeheerMelding) {
    const notitie = notitieConcepten[melding.id] ?? melding.notitie;
    setNotitieBezig(melding.id);
    setFoutmelding("");
    try {
      const antwoord = await fetch("/api/beheer/meldingen", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: melding.id, notitie }),
      });
      if (!antwoord.ok) throw new Error();
      setMeldingen((huidig) =>
        huidig
          ? huidig.map((item) =>
              item.id === melding.id ? { ...item, notitie } : item
            )
          : huidig
      );
      setNotitieConcepten((huidig) => {
        const kopie = { ...huidig };
        delete kopie[melding.id];
        return kopie;
      });
    } catch {
      setFoutmelding("Notitie opslaan mislukte. Probeer het opnieuw.");
    } finally {
      setNotitieBezig("");
    }
  }

  function downloadCsv() {
    if (!meldingen) return;
    const koppen = [
      "id",
      "binnen",
      "soort",
      "datum",
      "plaats",
      "beschrijving",
      "agentGeslacht",
      "agentLeeftijd",
      "agentNaam",
      "eenheid",
      "voertuig",
      "kentekens",
      "dienstnummers",
      "soortAgent",
      "aantalAgenten",
      "agentBeschrijving",
      "contactEmail",
      "opKaart",
      "status",
      "notitie",
      "lat",
      "lng",
    ];
    const regels = meldingen.map((melding) =>
      [
        melding.id,
        melding.createdAt,
        SOORT_LABEL[melding.soort] ?? melding.soort,
        melding.datum,
        melding.plaats,
        melding.beschrijving,
        melding.agentGeslacht,
        melding.agentLeeftijd,
        melding.agentNaam,
        melding.eenheid,
        melding.voertuig,
        melding.kentekens,
        melding.dienstnummers,
        melding.soortAgent,
        melding.aantalAgenten,
        melding.agentBeschrijving,
        melding.contactEmail,
        melding.opKaart ? "ja" : "nee",
        melding.status,
        melding.notitie,
        melding.kaartpunt ? String(melding.kaartpunt.lat) : "",
        melding.kaartpunt ? String(melding.kaartpunt.lng) : "",
      ]
        .map((waarde) => `"${String(waarde).replaceAll('"', '""')}"`)
        .join(";")
    );
    const inhoud = "\uFEFF" + [koppen.join(";"), ...regels].join("\n");
    const blob = new Blob([inhoud], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meldingen-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function wijzigWachtwoord() {
    if (pwNieuw.length < 12) {
      setPwMelding("Kies een wachtwoord van minimaal 12 tekens.");
      return;
    }
    if (pwNieuw !== pwHerhaal) {
      setPwMelding("De twee wachtwoorden zijn niet gelijk.");
      return;
    }
    setPwBezig(true);
    setPwMelding("");
    try {
      const antwoord = await fetch("/api/beheer/wachtwoord", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ nieuwWachtwoord: pwNieuw }),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (!antwoord.ok || !data.ok) {
        setPwMelding(data.fout ?? "Opslaan mislukte.");
        return;
      }
      setToken(pwNieuw);
      try {
        sessionStorage.setItem("beheer-token", pwNieuw);
      } catch {
        // niets
      }
      setPwNieuw("");
      setPwHerhaal("");
      setPwMelding("Het nieuwe wachtwoord is ingesteld. Bewaar het goed.");
    } catch {
      setPwMelding("Opslaan mislukte. Probeer het opnieuw.");
    } finally {
      setPwBezig(false);
    }
  }

  async function keurBeeld(id: string, zichtbaar: boolean) {
    setBeeldBezig(id);
    setBeeldMelding("");
    try {
      const antwoord = await fetch("/api/beheer/beelden", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id, zichtbaar }),
      });
      if (!antwoord.ok) throw new Error();
      setBeelden((huidig) =>
        huidig
          ? huidig.map((beeld) =>
              beeld.id === id ? { ...beeld, zichtbaar } : beeld
            )
          : huidig
      );
    } catch {
      setBeeldMelding("Bijwerken mislukte.");
    } finally {
      setBeeldBezig("");
    }
  }

  async function verwijderBeeld(id: string) {
    if (!window.confirm("Dit beeld definitief verwijderen?")) return;
    setBeeldBezig(id);
    setBeeldMelding("");
    try {
      const antwoord = await fetch(
        `/api/beheer/beelden?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!antwoord.ok) throw new Error();
      setBeelden((huidig) =>
        huidig ? huidig.filter((beeld) => beeld.id !== id) : huidig
      );
    } catch {
      setBeeldMelding("Verwijderen mislukte.");
    } finally {
      setBeeldBezig("");
    }
  }

  async function voegBeeldToe() {
    if (!nieuwBeeld.url.trim() || nieuwBeeld.titel.trim().length < 3) {
      setBeeldMelding("Vul een link en een titel in.");
      return;
    }
    setNieuwBeeldBezig(true);
    setBeeldMelding("");
    try {
      const antwoord = await fetch("/api/beheer/beelden", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(nieuwBeeld),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (!antwoord.ok) {
        throw new Error(data.fout ?? "mislukt");
      }
      setNieuwBeeld({ url: "", titel: "", plaats: "" });
      setBeeldMelding("Toegevoegd (nog verborgen; zet hem hieronder zichtbaar).");
      await laadBeeldenStil();
    } catch {
      setBeeldMelding("Toevoegen mislukte.");
    } finally {
      setNieuwBeeldBezig(false);
    }
  }

  async function bewaarKenmerk(beeld: BeheerBeeld) {
    const waarde = kenmerkConcepten[beeld.id] ?? beeld.agentKenmerk;
    setKenmerkBezig(beeld.id);
    setBeeldMelding("");
    try {
      const antwoord = await fetch("/api/beheer/beelden", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: beeld.id, agentKenmerk: waarde }),
      });
      if (!antwoord.ok) throw new Error();
      setBeelden((huidig) =>
        huidig
          ? huidig.map((item) =>
              item.id === beeld.id ? { ...item, agentKenmerk: waarde } : item
            )
          : huidig
      );
      setKenmerkConcepten((huidig) => {
        const kopie = { ...huidig };
        delete kopie[beeld.id];
        return kopie;
      });
    } catch {
      setBeeldMelding("Kenmerk opslaan mislukte.");
    } finally {
      setKenmerkBezig("");
    }
  }

  async function zoekKoppelingen() {
    const term = koppelZoek.trim();
    if (term.length < 2) {
      setKoppelFout("Vul minimaal twee tekens in.");
      return;
    }
    setKoppelBezig(true);
    setKoppelFout("");
    try {
      const antwoord = await fetch(
        `/api/beheer/koppelingen?zoek=${encodeURIComponent(term)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await antwoord.json().catch(() => ({}));
      if (!antwoord.ok) {
        setKoppelFout(data.fout ?? "Zoeken mislukte.");
        return;
      }
      setKoppelResultaat(data);
    } catch {
      setKoppelFout("Zoeken mislukte.");
    } finally {
      setKoppelBezig(false);
    }
  }

  function parseProfielRegels(tekst: string): { label: string; url: string }[] {
    return tekst
      .split(/\r?\n/)
      .map((regel) => regel.trim())
      .filter(Boolean)
      .map((regel) => {
        const delen = regel.split("|");
        return { url: delen[0].trim(), label: delen.slice(1).join("|").trim() };
      })
      .filter((bron) => bron.url.startsWith("http"))
      .slice(0, 20);
  }

  function parseProfielItems(tekst: string): { url: string; titel: string }[] {
    return tekst
      .split(/\r?\n/)
      .map((regel) => regel.trim())
      .filter(Boolean)
      .map((regel) => {
        const delen = regel.split("|");
        return { url: delen[0].trim(), titel: delen.slice(1).join("|").trim() };
      })
      .filter((item) => item.url.startsWith("http"))
      .slice(0, 50);
  }

  async function maakProfiel() {
    if (nieuwProfiel.label.trim().length < 3) {
      setProfielMelding("Geef het profiel een titel van minimaal drie tekens.");
      return;
    }
    setNieuwProfielBezig(true);
    setProfielMelding("");
    try {
      const antwoord = await fetch("/api/beheer/profielen", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          label: nieuwProfiel.label.trim(),
          kenmerk: nieuwProfiel.kenmerk.trim(),
          eenheid: nieuwProfiel.eenheid.trim(),
          notities: nieuwProfiel.notities.trim(),
          status: nieuwProfiel.status,
          bronnen: parseProfielRegels(nieuwProfiel.bronRegels),
          items: parseProfielItems(nieuwProfiel.itemRegels),
        }),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (!antwoord.ok) {
        setProfielMelding(data.fout ?? "Opslaan mislukte.");
        return;
      }
      setNieuwProfiel({
        label: "",
        kenmerk: "",
        eenheid: "",
        notities: "",
        status: "mogelijk",
        bronRegels: "",
        itemRegels: "",
      });
      setProfielMelding(
        "Profiel opgeslagen. Het staat nog verborgen tot je het zichtbaar maakt."
      );
      await laadProfielenStil();
    } catch {
      setProfielMelding("Opslaan mislukte.");
    } finally {
      setNieuwProfielBezig(false);
    }
  }

  async function zetProfielZichtbaar(profiel: BeheerProfiel, zichtbaar: boolean) {
    setProfielZichtBezig(profiel.id);
    setProfielMelding("");
    try {
      const antwoord = await fetch("/api/beheer/profielen", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: profiel.id, zichtbaar }),
      });
      if (!antwoord.ok) throw new Error();
      setProfielen((huidig) =>
        huidig
          ? huidig.map((item) =>
              item.id === profiel.id ? { ...item, zichtbaar } : item
            )
          : huidig
      );
    } catch {
      setProfielMelding("Zichtbaarheid aanpassen mislukte.");
    } finally {
      setProfielZichtBezig("");
    }
  }

  async function verwijderProfiel(profiel: BeheerProfiel) {
    if (!window.confirm(`Profiel "${profiel.label}" definitief verwijderen?`)) {
      return;
    }
    setProfielBezig(profiel.id);
    setProfielMelding("");
    try {
      const antwoord = await fetch(
        `/api/beheer/profielen?id=${encodeURIComponent(profiel.id)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!antwoord.ok) throw new Error();
      setProfielen((huidig) =>
        huidig ? huidig.filter((item) => item.id !== profiel.id) : huidig
      );
    } catch {
      setProfielMelding("Verwijderen mislukte.");
    } finally {
      setProfielBezig("");
    }
  }

  function uitloggen() {
    setToken("");
    setMeldingen(null);
    setStatus("login");
    try {
      sessionStorage.removeItem("beheer-token");
    } catch {
      // niets
    }
  }

  if (status !== "klaar" || !meldingen) {
    return (
      <div className="max-w-md rounded-xl border border-line bg-surface p-7">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Inloggen
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Vul het beheerderswachtwoord in om de binnengekomen meldingen te
          bekijken.
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (token.trim()) laadMeldingen(token.trim());
          }}
        >
          <div>
            <label htmlFor="beheer-token" className="mb-1.5 block text-sm text-muted">
              Wachtwoord
            </label>
            <input
              id="beheer-token"
              type="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground focus:border-accent focus:outline-none"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>
          {foutmelding ? (
            <p
              aria-live="polite"
              className="rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
            >
              {foutmelding}
            </p>
          ) : null}
          <button
            type="submit"
            className={btnPrimary}
            disabled={status === "laden" || !token.trim()}
          >
            {status === "laden" ? "Laden…" : "Open beheer"}
          </button>
        </form>
      </div>
    );
  }

  const totaleOpslagMb = uitzendingen.reduce(
    (som, uitzending) => som + (Number(uitzending.grootteMb) || 0),
    0
  );

  const zoekTerm = zoek.trim().toLowerCase();
  const zichtbaar = zoekTerm
    ? meldingen.filter((melding) =>
        [
          SOORT_LABEL[melding.soort] ?? melding.soort,
          melding.plaats,
          melding.datum,
          melding.beschrijving,
          melding.contactEmail,
          melding.agentNaam,
          melding.eenheid,
          melding.voertuig,
          melding.kentekens,
          melding.dienstnummers,
          melding.soortAgent,
          melding.agentBeschrijving,
          melding.notitie,
          melding.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(zoekTerm)
      )
    : meldingen;

  const kaartpunten = meldingen.flatMap((melding) =>
    melding.kaartpunt
      ? [
          {
            lat: melding.kaartpunt.lat,
            lng: melding.kaartpunt.lng,
            label: `${SOORT_LABEL[melding.soort] ?? melding.soort} · ${
              melding.plaats || "onbekend"
            }`,
          },
        ]
      : []
  );

  return (
    <div>
      {/* Live-uitzending: status en noodstop */}
      <section
        aria-label="Live-uitzending"
        className={cn(
          "mb-8 rounded-xl border p-6",
          liveStand?.live
            ? "border-accent/50 bg-accent-soft"
            : "border-line bg-surface"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {liveStand?.live ? "Er is nu een uitzending live" : "Geen live-uitzending"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {liveStand?.live
                ? `${liveStand.titel || "Live-uitzending"} · ${liveStand.kijkers} ${
                    liveStand.kijkers === 1 ? "kijker" : "kijkers"
                  }`
                : "Zodra iemand vanaf /live/start uitzendt, verschijnt dat hier."}
            </p>
            {liveMelding ? (
              <p aria-live="polite" className="mt-2 text-sm">
                {liveMelding}
              </p>
            ) : null}
          </div>
          {liveStand?.live ? (
            <button
              type="button"
              onClick={stopUitzending}
              disabled={stopBezig}
              className={cn(
                btnPrimary,
                "bg-foreground text-background hover:bg-foreground/90",
                stopBezig && "opacity-60"
              )}
            >
              {stopBezig ? "Stoppen…" : "Stop de uitzending"}
            </button>
          ) : null}
        </div>
      </section>

      {/* Uitzendingen: verwijderen of alsnog naar YouTube */}
      <section
        aria-label="Uitzendingen"
        className="mb-8 rounded-xl border border-line bg-surface p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            Uitzendingen
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            {uitzendingen.length} online · opslag{" "}
            <span
              className={cn(totaleOpslagMb > 8500 && "text-accent")}
              title="Cloudflare R2 geeft 10 GB gratis opslag. Ruim op wanneer je er dicht bij zit."
            >
              {Math.round(totaleOpslagMb)} MB / ±10.240 MB (10 GB gratis)
            </span>
          </p>
        </div>
        {uitzendingen.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Er staan nu geen opnames online.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {uitzendingen.map((uitzending) => {
              const youtubeId = uitzending.youtubeUrl
                ? uitzending.youtubeUrl.split("/").pop() ?? ""
                : "";
              return (
                <li
                  key={uitzending.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {uitzending.titel}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-2">
                      nog {uitzending.dagenOver}{" "}
                      {uitzending.dagenOver === 1 ? "dag" : "dagen"} ·{" "}
                      {uitzending.grootteMb.toLocaleString("nl-NL")} MB ·{" "}
                      {uitzending.youtubeUrl
                        ? "privé op YouTube"
                        : "nog niet op YouTube"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {youtubeId ? (
                      <a
                        href={`https://studio.youtube.com/video/${youtubeId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(btnGhost, "h-9 px-4 text-xs")}
                      >
                        YouTube Studio
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => naarYouTubeBeheer(uitzending)}
                        disabled={opnameBezig === uitzending.id}
                        className={cn(
                          btnGhost,
                          "h-9 px-4 text-xs",
                          opnameBezig === uitzending.id && "opacity-60"
                        )}
                      >
                        {opnameBezig === uitzending.id
                          ? "Bezig…"
                          : "Naar YouTube"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => verwijderUitzending(uitzending.id)}
                      disabled={opnameBezig === uitzending.id}
                      className={cn(
                        btnGhost,
                        "h-9 px-4 text-xs text-accent hover:text-accent",
                        opnameBezig === uitzending.id && "opacity-60"
                      )}
                    >
                      Verwijder
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {uitzendingMelding ? (
          <p aria-live="polite" className="mt-3 text-sm">
            {uitzendingMelding}
          </p>
        ) : null}
      </section>

      {/* Ingestuurde live-links */}
      <section
        aria-label="Live-links van bezoekers"
        className="mb-8 rounded-xl border border-line bg-surface p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            Live-links van bezoekers
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            {links.length} online
          </p>
        </div>
        {links.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Er staan nu geen ingestuurde links.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{link.titel}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-2">
                    {link.host}
                    {link.naam ? ` · ${link.naam}` : ""} · {link.url}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(btnGhost, "h-9 px-4 text-xs")}
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => verwijderLink(link.id)}
                    disabled={linkBezig === link.id}
                    className={cn(
                      btnGhost,
                      "h-9 px-4 text-xs text-accent hover:text-accent",
                      linkBezig === link.id && "opacity-60"
                    )}
                  >
                    {linkBezig === link.id ? "Bezig…" : "Verwijder"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {linkMelding ? (
          <p aria-live="polite" className="mt-3 text-sm">
            {linkMelding}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {meldingen.length}{" "}
          {meldingen.length === 1 ? "melding" : "meldingen"} (nieuwste eerst,
          max. 200)
          {zoekTerm ? ` · ${zichtbaar.length} gevonden` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={zoek}
            onChange={(event) => setZoek(event.target.value)}
            placeholder="Zoek in meldingen"
            aria-label="Zoek in meldingen"
            className="h-10 w-52 rounded-lg border border-line-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
          />
          <button type="button" className={btnGhost} onClick={downloadCsv}>
            Download CSV
          </button>
          <button
            type="button"
            className={btnGhost}
            onClick={() => void verversMeldingenStil()}
          >
            Verversen
          </button>
          <button type="button" className={btnGhost} onClick={uitloggen}>
            Uitloggen
          </button>
        </div>
      </div>

      {foutmelding ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
        >
          {foutmelding}
        </p>
      ) : null}

      {zichtbaar.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold tracking-tight">
            {meldingen.length === 0
              ? "Nog geen meldingen."
              : "Geen meldingen gevonden."}
          </p>
          <p className="mt-2 text-sm text-muted">
            {meldingen.length === 0
              ? "Nieuwe meldingen verschijnen hier vanzelf, binnen een minuut."
              : "Pas je zoekterm aan om meer te zien."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {zichtbaar.map((melding) => (
            <article
              key={melding.id}
              className="rounded-xl border border-line bg-surface p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {SOORT_LABEL[melding.soort] ?? melding.soort}
                  </p>
                  <p className="mt-1 font-mono text-xs tracking-wide text-muted-2">
                    binnen: {formatDatum(melding.createdAt)}
                    {melding.datum ? ` · gebeurd: ${melding.datum}` : ""}
                    {melding.plaats ? ` · ${melding.plaats}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]",
                      melding.status === "afgehandeld"
                        ? "border-line-strong text-muted"
                        : melding.status === "in-behandeling"
                          ? "border-accent/60 text-accent"
                          : "border-accent bg-accent-soft"
                    )}
                  >
                    {melding.status === "in-behandeling"
                      ? "in behandeling"
                      : melding.status}
                  </span>
                  {melding.opKaart ? (
                    <span className="rounded-full border border-accent/50 bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]">
                      op de kaart
                    </span>
                  ) : null}
                  {melding.contactEmail ? (
                    <a
                      href={`mailto:${melding.contactEmail}`}
                      className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] tracking-wide text-muted hover:text-foreground"
                    >
                      {melding.contactEmail}
                    </a>
                  ) : (
                    <span className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      anoniem
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {melding.beschrijving}
              </p>
              {(() => {
                const rijen = agentRijen(melding);
                if (rijen.length === 0 && !melding.agentBeschrijving) {
                  return null;
                }
                return (
                  <div className="mt-4 rounded-lg border border-line bg-surface-2 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                      Over de agent(en)
                    </p>
                    {rijen.length > 0 ? (
                      <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-muted sm:grid-cols-2">
                        {rijen.map(([label, waarde]) => (
                          <div key={label} className="flex gap-2">
                            <dt className="shrink-0 text-muted-2">{label}:</dt>
                            <dd>{waarde}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {melding.agentBeschrijving ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                        {melding.agentBeschrijving}
                      </p>
                    ) : null}
                  </div>
                );
              })()}
              {melding.kaartpunt ? (
                <p className="mt-3 text-xs text-muted-2">
                  Kaartpunt: {melding.kaartpunt.lat.toFixed(2)},{" "}
                  {melding.kaartpunt.lng.toFixed(2)} ·{" "}
                  <a
                    className="underline underline-offset-4 hover:text-foreground"
                    href={`https://www.openstreetmap.org/?mlat=${melding.kaartpunt.lat}&mlon=${melding.kaartpunt.lng}#map=15/${melding.kaartpunt.lat}/${melding.kaartpunt.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    bekijk op kaart
                  </a>
                </p>
              ) : null}
              <div className="mt-4 grid gap-3 rounded-lg border border-line bg-surface-2 p-4 sm:grid-cols-[200px_1fr]">
                <div>
                  <label
                    htmlFor={`status-${melding.id}`}
                    className="mb-1.5 block text-xs text-muted-2"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${melding.id}`}
                    className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none"
                    value={melding.status}
                    onChange={(event) => zetStatus(melding, event.target.value)}
                    disabled={statusBezig === melding.id}
                  >
                    <option value="nieuw">Nieuw</option>
                    <option value="in-behandeling">In behandeling</option>
                    <option value="afgehandeld">Afgehandeld</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`notitie-${melding.id}`}
                    className="mb-1.5 block text-xs text-muted-2"
                  >
                    Interne notitie (niet zichtbaar voor de melder)
                  </label>
                  <textarea
                    id={`notitie-${melding.id}`}
                    className="min-h-20 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
                    placeholder="Wat heb je met deze melding gedaan?"
                    value={notitieConcepten[melding.id] ?? melding.notitie}
                    onChange={(event) =>
                      setNotitieConcepten((huidig) => ({
                        ...huidig,
                        [melding.id]: event.target.value,
                      }))
                    }
                    maxLength={2000}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => bewaarNotitie(melding)}
                      disabled={notitieBezig === melding.id}
                      className={cn(
                        btnGhost,
                        "h-9 px-4 text-xs",
                        notitieBezig === melding.id && "opacity-60"
                      )}
                    >
                      {notitieBezig === melding.id
                        ? "Opslaan…"
                        : "Notitie opslaan"}
                    </button>
                    {(notitieConcepten[melding.id] ?? melding.notitie) !==
                    melding.notitie ? (
                      <span className="text-xs text-muted-2">
                        nog niet opgeslagen
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-2">
                  id: {melding.id}
                </span>
                <button
                  type="button"
                  onClick={() => verwijder(melding)}
                  disabled={verwijderBezig === melding.id}
                  className={cn(
                    "rounded-lg border border-line-strong px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground",
                    verwijderBezig === melding.id && "opacity-50"
                  )}
                >
                  {verwijderBezig === melding.id
                    ? "Verwijderen…"
                    : "Verwijderen"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section
        aria-label="Beelden"
        className="mt-10 rounded-xl border border-line bg-surface p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            Beelden (video&apos;s)
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            {beelden
              ? `${beelden.filter((beeld) => !beeld.zichtbaar).length} te controleren · ${beelden.filter((beeld) => beeld.zichtbaar).length} zichtbaar`
              : "laden…"}
          </p>
        </div>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">
          Tips en de YouTube-oogst komen hier verborgen binnen. Zet ze
          zichtbaar na controle; dan verschijnen ze op /beelden.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr_0.8fr_auto]">
          <input
            value={nieuwBeeld.url}
            onChange={(gebeurtenis) =>
              setNieuwBeeld((huidig) => ({
                ...huidig,
                url: gebeurtenis.target.value,
              }))
            }
            placeholder="Link (https://…)"
            aria-label="Link naar het beeld"
            className={beeldInput}
          />
          <input
            value={nieuwBeeld.titel}
            onChange={(gebeurtenis) =>
              setNieuwBeeld((huidig) => ({
                ...huidig,
                titel: gebeurtenis.target.value,
              }))
            }
            placeholder="Titel"
            aria-label="Titel van het beeld"
            className={beeldInput}
          />
          <input
            value={nieuwBeeld.plaats}
            onChange={(gebeurtenis) =>
              setNieuwBeeld((huidig) => ({
                ...huidig,
                plaats: gebeurtenis.target.value,
              }))
            }
            placeholder="Plaats"
            aria-label="Plaats van het beeld"
            className={beeldInput}
          />
          <button
            type="button"
            onClick={voegBeeldToe}
            disabled={nieuwBeeldBezig}
            className={cn(
              btnGhost,
              "h-10 px-4 text-sm",
              nieuwBeeldBezig && "opacity-60"
            )}
          >
            {nieuwBeeldBezig ? "Bezig…" : "Toevoegen"}
          </button>
        </div>
        {beeldMelding ? (
          <p aria-live="polite" className="mt-2 text-sm">
            {beeldMelding}
          </p>
        ) : null}
        {beelden && beelden.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {beelden.map((beeld) => (
              <li
                key={beeld.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {beeld.titel}
                    {!beeld.zichtbaar ? " (verborgen)" : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-2">
                    {beeld.platform} · {beeld.plaats || "plaats onbekend"} ·{" "}
                    {beeld.bron} · {beeld.toegevoegdOp.slice(0, 10)}
                  </p>
                  {beeld.analyse ? (
                    <p className="mt-1 max-w-xl text-xs text-muted">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-2">
                        transcriptie-suggestie:
                      </span>{" "}
                      {beeld.analyse}{" "}
                      <button
                        type="button"
                        onClick={() =>
                          setKenmerkConcepten((huidig) => ({
                            ...huidig,
                            [beeld.id]: beeld.analyse,
                          }))
                        }
                        className="underline underline-offset-4 hover:text-foreground"
                      >
                        neem over in kenmerk
                      </button>
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      value={kenmerkConcepten[beeld.id] ?? beeld.agentKenmerk}
                      onChange={(gebeurtenis) =>
                        setKenmerkConcepten((huidig) => ({
                          ...huidig,
                          [beeld.id]: gebeurtenis.target.value,
                        }))
                      }
                      placeholder="Agent-kenmerk (dienstnummer, opvallend detail)"
                      aria-label={`Agent-kenmerk voor ${beeld.titel}`}
                      className={cn(beeldInput, "h-9 max-w-xs text-xs")}
                    />
                    {(kenmerkConcepten[beeld.id] ?? beeld.agentKenmerk) !==
                    beeld.agentKenmerk ? (
                      <button
                        type="button"
                        onClick={() => bewaarKenmerk(beeld)}
                        disabled={kenmerkBezig === beeld.id}
                        className={cn(
                          btnGhost,
                          "h-9 px-3 text-xs",
                          kenmerkBezig === beeld.id && "opacity-60"
                        )}
                      >
                        {kenmerkBezig === beeld.id
                          ? "Opslaan…"
                          : "Kenmerk opslaan"}
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={beeld.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(btnGhost, "h-9 px-3 text-xs")}
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => keurBeeld(beeld.id, !beeld.zichtbaar)}
                    disabled={beeldBezig === beeld.id}
                    className={cn(
                      btnGhost,
                      "h-9 px-3 text-xs",
                      !beeld.zichtbaar && "text-accent"
                    )}
                  >
                    {beeld.zichtbaar ? "Verbergen" : "Zichtbaar maken"}
                  </button>
                  <button
                    type="button"
                    onClick={() => verwijderBeeld(beeld.id)}
                    disabled={beeldBezig === beeld.id}
                    className={cn(
                      btnGhost,
                      "h-9 px-3 text-xs text-accent hover:text-accent"
                    )}
                  >
                    Verwijder
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Nog geen beelden binnengekomen.
          </p>
        )}
      </section>

      <section
        aria-label="Koppelingen zoeken"
        className="mt-10 rounded-xl border border-line bg-surface p-6"
      >
        <p className="font-display text-lg font-semibold tracking-tight">
          Koppelingen zoeken
        </p>
        <p className="mt-1 max-w-[75ch] text-sm text-muted">
          Zoek op een dienstnummer, naam, kenteken, eenheid of plaats en zie of
          hetzelfde kenmerk in meerdere meldingen, video&apos;s of rechtszaken
          terugkomt. Bevestig een koppeling altijd zelf, met de bron erbij;
          koppelen op openbare kenmerken, geen biometrie.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={koppelZoek}
            onChange={(gebeurtenis) => setKoppelZoek(gebeurtenis.target.value)}
            onKeyDown={(gebeurtenis) => {
              if (gebeurtenis.key === "Enter") void zoekKoppelingen();
            }}
            placeholder="Bijv. dienstnummer, naam of eenheid"
            aria-label="Zoekterm voor koppelingen"
            className={cn(beeldInput, "max-w-sm")}
          />
          <button
            type="button"
            onClick={zoekKoppelingen}
            disabled={koppelBezig}
            className={cn(btnGhost, koppelBezig && "opacity-60")}
          >
            {koppelBezig ? "Zoeken…" : "Zoeken"}
          </button>
          {koppelFout ? (
            <p className="text-sm text-accent">{koppelFout}</p>
          ) : null}
        </div>
        {koppelResultaat ? (
          <div className="mt-5 grid gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                Meldingen ({koppelResultaat.meldingen.length})
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {koppelResultaat.meldingen.map((melding) => (
                  <li key={melding.id}>
                    {melding.plaats} · {melding.datum || "datum onbekend"} ·{" "}
                    {melding.agent || "geen agentgegeven"} —{" "}
                    {melding.beschrijving}
                  </li>
                ))}
                {koppelResultaat.meldingen.length === 0 ? (
                  <li className="text-muted-2">geen</li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                Beelden ({koppelResultaat.beelden.length})
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {koppelResultaat.beelden.map((beeld) => (
                  <li key={beeld.id} className="truncate">
                    {beeld.titel}
                    {beeld.agentKenmerk ? ` · kenmerk: ${beeld.agentKenmerk}` : ""}{" "}
                    ·{" "}
                    <a
                      href={beeld.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      bron
                    </a>
                  </li>
                ))}
                {koppelResultaat.beelden.length === 0 ? (
                  <li className="text-muted-2">geen</li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                Rechtszaken op de kaart ({koppelResultaat.zaken.length})
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {koppelResultaat.zaken.map((zaak) => (
                  <li key={zaak.id}>
                    {zaak.jaar} · {zaak.plaats} — {zaak.titel} ({zaak.uitkomst})
                  </li>
                ))}
                {koppelResultaat.zaken.length === 0 ? (
                  <li className="text-muted-2">geen</li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                Overige rechtspraak ({koppelResultaat.overige.length})
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {koppelResultaat.overige.map((zaak) => (
                  <li key={zaak.ecli}>
                    {zaak.datum} · {zaak.omschrijving}
                  </li>
                ))}
                {koppelResultaat.overige.length === 0 ? (
                  <li className="text-muted-2">geen</li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section
        aria-label="Agent-profielen"
        className="mt-10 rounded-xl border border-line bg-surface p-6"
      >
        <p className="font-display text-lg font-semibold tracking-tight">
          Agent-profielen (openbaar register)
        </p>
        <p className="mt-1 max-w-[75ch] text-sm text-muted">
          Bundel één agent — op openbare kenmerken (dienstnummer, eenheid,
          signalement) — met de zaken waarin hij terugkomt. Een profiel is pas
          openbaar als jij het zichtbaar maakt; tot die tijd staat het
          verborgen. Koppelen met bron erbij, geen biometrie.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={nieuwProfiel.label}
            onChange={(gebeurtenis) =>
              setNieuwProfiel((huidig) => ({
                ...huidig,
                label: gebeurtenis.target.value,
              }))
            }
            placeholder="Titel, bijv. Agent met dienstnummer 12345"
            aria-label="Titel van het profiel"
            className={beeldInput}
          />
          <input
            value={nieuwProfiel.kenmerk}
            onChange={(gebeurtenis) =>
              setNieuwProfiel((huidig) => ({
                ...huidig,
                kenmerk: gebeurtenis.target.value,
              }))
            }
            placeholder="Kenmerk, bijv. dienstnummer of signalement"
            aria-label="Kenmerk van het profiel"
            className={beeldInput}
          />
          <input
            value={nieuwProfiel.eenheid}
            onChange={(gebeurtenis) =>
              setNieuwProfiel((huidig) => ({
                ...huidig,
                eenheid: gebeurtenis.target.value,
              }))
            }
            placeholder="Eenheid, bijv. Rotterdam"
            aria-label="Eenheid van het profiel"
            className={beeldInput}
          />
          <select
            value={nieuwProfiel.status}
            onChange={(gebeurtenis) =>
              setNieuwProfiel((huidig) => ({
                ...huidig,
                status: gebeurtenis.target.value,
              }))
            }
            aria-label="Status van het profiel"
            className={beeldInput}
          >
            <option value="mogelijk">Mogelijk dezelfde (niet bevestigd)</option>
            <option value="bevestigd">Bevestigd met bron</option>
          </select>
        </div>
        <textarea
          value={nieuwProfiel.notities}
          onChange={(gebeurtenis) =>
            setNieuwProfiel((huidig) => ({
              ...huidig,
              notities: gebeurtenis.target.value,
            }))
          }
          placeholder="Wat zie je steeds terug? (bijv. zelfde werkwijze, zelfde eenheid, opvallende uitspraak)"
          aria-label="Notities bij het profiel"
          className={cn(beeldInput, "mt-3 h-auto min-h-[84px] py-2")}
        />
        <textarea
          value={nieuwProfiel.bronRegels}
          onChange={(gebeurtenis) =>
            setNieuwProfiel((huidig) => ({
              ...huidig,
              bronRegels: gebeurtenis.target.value,
            }))
          }
          placeholder={"Bronnen, één per regel: URL | korte omschrijving"}
          aria-label="Bronnen bij het profiel"
          className={cn(beeldInput, "mt-3 h-auto min-h-[84px] py-2")}
        />
        <textarea
          value={nieuwProfiel.itemRegels}
          onChange={(gebeurtenis) =>
            setNieuwProfiel((huidig) => ({
              ...huidig,
              itemRegels: gebeurtenis.target.value,
            }))
          }
          placeholder={"Terugkerend in, één per regel: URL | titel"}
          aria-label="Gekoppelde items bij het profiel"
          className={cn(beeldInput, "mt-3 h-auto min-h-[84px] py-2")}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={maakProfiel}
            disabled={nieuwProfielBezig}
            className={cn(
              btnPrimary,
              "h-10 px-4 text-sm",
              nieuwProfielBezig && "opacity-60"
            )}
          >
            {nieuwProfielBezig ? "Bezig…" : "Profiel opslaan"}
          </button>
          {profielMelding ? (
            <p aria-live="polite" className="text-sm">
              {profielMelding}
            </p>
          ) : null}
        </div>
        {profielen && profielen.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {profielen.map((profiel) => (
              <li
                key={profiel.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {profiel.label}
                    {profiel.zichtbaar ? " (openbaar)" : " (verborgen)"}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-2">
                    {profiel.status === "bevestigd"
                      ? "bevestigd met bron"
                      : "mogelijk dezelfde"}{" "}
                    · {profiel.items.length} items · {profiel.bronnen.length}{" "}
                    bronnen
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      zetProfielZichtbaar(profiel, !profiel.zichtbaar)
                    }
                    disabled={profielZichtBezig === profiel.id}
                    className={cn(
                      btnGhost,
                      "h-9 px-4 text-xs",
                      profielZichtBezig === profiel.id && "opacity-60"
                    )}
                  >
                    {profiel.zichtbaar ? "Verbergen" : "Zichtbaar maken"}
                  </button>
                  <button
                    type="button"
                    onClick={() => verwijderProfiel(profiel)}
                    disabled={profielBezig === profiel.id}
                    className={cn(
                      btnGhost,
                      "h-9 px-4 text-xs text-accent",
                      profielBezig === profiel.id && "opacity-60"
                    )}
                  >
                    {profielBezig === profiel.id ? "Bezig…" : "Verwijderen"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Nog geen profielen.</p>
        )}
      </section>

      {kaartpunten.length > 0 ? (
        <section
          aria-label="Meldingen op de kaart"
          className="mt-10 rounded-xl border border-line bg-surface p-6"
        >
          <p className="font-display text-lg font-semibold tracking-tight">
            Meldingen op de kaart
          </p>
          <p className="mt-1 text-sm text-muted">
            {kaartpunten.length}{" "}
            {kaartpunten.length === 1 ? "kaartpunt" : "kaartpunten"} van
            binnengekomen meldingen.
          </p>
          <div className="mt-4">
            <BeheerKaart punten={kaartpunten} />
          </div>
        </section>
      ) : null}

      <section
        aria-label="Beveiliging"
        className="mt-10 rounded-xl border border-line bg-surface p-6"
      >
        <p className="font-display text-lg font-semibold tracking-tight">
          Beveiliging
        </p>
        <p className="mt-1 max-w-[70ch] text-sm text-muted">
          Stel hier een eigen beheerwachtwoord in. Het oude standaardwachtwoord
          blijft daarnaast werken als herstelmogelijkheid. Minimaal 12 tekens.
        </p>
        <div className="mt-4 grid max-w-md gap-3">
          <input
            type="password"
            value={pwNieuw}
            onChange={(event) => setPwNieuw(event.target.value)}
            placeholder="Nieuw wachtwoord"
            autoComplete="new-password"
            className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
          />
          <input
            type="password"
            value={pwHerhaal}
            onChange={(event) => setPwHerhaal(event.target.value)}
            placeholder="Herhaal nieuw wachtwoord"
            autoComplete="new-password"
            className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={wijzigWachtwoord}
              disabled={pwBezig}
              className={cn(btnGhost, pwBezig && "opacity-60")}
            >
              {pwBezig ? "Opslaan…" : "Wachtwoord instellen"}
            </button>
            {pwMelding ? (
              <p aria-live="polite" className="text-sm text-muted">
                {pwMelding}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
