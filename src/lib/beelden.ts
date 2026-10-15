/* Beelden: verzamelde video's over politiegeweld in Nederland (YouTube,
   TikTok, Instagram, Telegram, X en tips van bezoekers). De server beheert
   alles; alleen wat in beheer zichtbaar is gezet komt op de pagina. */

export interface Beeld {
  id: string;
  url: string;
  platform: string;
  titel: string;
  toelichting: string;
  plaats: string;
  datum: string;
  bron: string;
  zichtbaar: boolean;
  toegevoegdOp: string;
}

export function platformVan(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be" || host.endsWith("youtube.com")) return "YouTube";
    if (host.endsWith("tiktok.com")) return "TikTok";
    if (host.endsWith("instagram.com")) return "Instagram";
    if (host === "t.me" || host.endsWith("telegram.me")) return "Telegram";
    if (host === "x.com" || host.endsWith("twitter.com")) return "X";
    if (host.endsWith("facebook.com") || host === "fb.watch") return "Facebook";
    if (host.endsWith("vimeo.com")) return "Vimeo";
    return "Anders";
  } catch {
    return "Anders";
  }
}

export function youtubeId(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] ?? "";
    }
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v") ?? "";
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] ?? "";
      }
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] ?? "";
      }
    }
  } catch {
    // ongeldige url
  }
  return "";
}

export function isHttpUrl(waarde: string): boolean {
  try {
    const url = new URL(waarde);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
