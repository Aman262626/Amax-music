import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import MobileNav from "@/components/MobileNav";
import PartyJoinHandler from "@/components/PartyJoinHandler";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppShell from "@/components/AppShell";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { ToastProvider } from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";
import QuickPlayFAB from "@/components/QuickPlayFAB";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AMAX - Premium Music Player",
  description:
    "AMAX Music - Free premium music streaming. Search, play, download songs. Background playback, lyrics, smart recommendations.",
  keywords: ["amax", "music", "player", "streaming", "download", "songs", "lyrics", "premium"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AMAX Music",
  },
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-spotify-black`}>
        <ErrorBoundary>
          <AppShell>
          <ToastProvider>
          <PlayerProvider>
            <div className="h-screen flex flex-col overflow-hidden">
              <Suspense fallback={null}>
                <PartyJoinHandler />
              </Suspense>
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto gradient-mesh lg:rounded-xl lg:m-2 lg:ml-0 pb-36 lg:pb-4">
                  {children}
                </main>
              </div>
              <Player />
              <MobileNav />
              <KeyboardShortcuts />
              <ScrollToTop />
              <QuickPlayFAB />
            </div>
          </PlayerProvider>
          </ToastProvider>
          </AppShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
