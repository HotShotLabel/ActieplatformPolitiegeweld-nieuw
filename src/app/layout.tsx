import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { ChatWidget } from "@/components/chat/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://actieplatform-politiegeweld-nieuw.vercel.app"),
  title: {
    default: "Actieplatform Politiegeweld",
    template: "%s · Actieplatform Politiegeweld",
  },
  description:
    "Het Actieplatform verzamelt meldingen van politiegeweld, ondersteunt wie het meemaakt en werkt aan openbare verantwoording.",
  openGraph: {
    title: "Actieplatform Politiegeweld",
    description:
      "Meldingen van politiegeweld vastleggen, wie het meemaakt ondersteunen en verantwoording afdwingen.",
    type: "website",
    locale: "nl_NL",
  },
  other: {
    robots: "noai, noimageai",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <SmoothScroll />
        <SiteNav />
        {children}
        <SiteFooter />
        <ChatWidget />
      </body>
    </html>
  );
}
