import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AMAX - Premium Music Player",
  description:
    "AMAX Music - Free premium music streaming. Search, play, download songs. Background playback, lyrics, smart recommendations.",
  keywords: ["amax", "music", "player", "streaming", "download", "songs", "lyrics", "premium"],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className={`${inter.className} bg-spotify-black`}>
        <PlayerProvider>
          <div className="h-screen flex flex-col overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto gradient-mesh lg:rounded-xl lg:m-2 lg:ml-0 pb-32 lg:pb-4">
                {children}
              </main>
            </div>
            <Player />
            <MobileNav />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
