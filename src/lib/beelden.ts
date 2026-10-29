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
    if (host.endsWith("instagram.com") || host === "instagr.am") return "Instagram";
    if (host === "t.me" || host.endsWith("telegram.me")) return "Telegram";
    if (host === "x.com" || host.endsWith("twitter.com")) return "X";
    if (host.endsWith("facebook.com") || host === "fb.watch") return "Facebook";
    if (host.endsWith("linkedin.com") || host === "lnkd.in") return "LinkedIn";
    if (host.endsWith("vimeo.com")) return "Vimeo";
    return "Anders";
  } catch {
    return "Anders";
  }
}

export interface BeeldEmbed {
  soort: "youtube" | "tiktok" | "instagram" | "facebook" | "geen";
  src: string;
}

/* Een echte speler-url per platform, zodat het filmpje op onze pagina zelf te
   zien is. Alleen met strikt gevalideerde id's; nooit de ruwe url. */
export function embedVan(url: string): BeeldEmbed {
  const yt = youtubeId(url);
  if (yt && /^[A-Za-z0-9_-]{6,20}$/.test(yt)) {
    return {
      soort: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${yt}?rel=0`,
    };
  }
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host.endsWith("tiktok.com")) {
      const m = u.pathname.match(/\/video\/(\d{6,25})/);
      if (m) {
        return { soort: "tiktok", src: `https://www.tiktok.com/embed/v2/${m[1]}` };
      }
    }
    if (host.endsWith("instagram.com") || host === "instagr.am") {
      const m = u.pathname.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]{5,30})/);
      if (m) {
        const soortPad = m[1] === "reels" ? "reel" : m[1];
        return {
          soort: "instagram",
          src: `https://www.instagram.com/${soortPad}/${m[2]}/embed`,
        };
      }
    }
    if (host.endsWith("facebook.com") || host === "fb.watch") {
      return {
        soort: "facebook",
        src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          u.href
        )}&show_text=false&width=560&locale=nl_NL`,
      };
    }
  } catch {
    // ongeldige url
  }
  return { soort: "geen", src: "" };
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
