"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHome, IoSearch, IoLibrary, IoPersonCircle, IoPlay } from "react-icons/io5";
import { usePlayer } from "@/contexts/PlayerContext";

const NAV_ITEMS = [
  { href: "/", icon: IoHome, label: "Home" },
  { href: "/samples", icon: IoPlay, label: "Samples" },
  { href: "/search", icon: IoSearch, label: "Search" },
  { href: "/library", icon: IoLibrary, label: "Library" },
  { href: "/profile", icon: IoPersonCircle, label: "Profile" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { currentSong, isPlaying } = usePlayer();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {/* Gradient accent line at top */}
      {currentSong && isPlaying && (
        <div className="h-[1px] progress-gradient" />
      )}
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
                active ? "text-white" : "text-spotify-light-gray"
              }`}
            >
              <div className="relative">
                <item.icon className={`text-xl transition-transform ${active ? "text-spotify-green scale-110" : ""}`} />
                {active && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-spotify-green rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-spotify-green" : ""}`}>{item.label}</span>
              {active && (
                <div className="w-4 h-[2px] bg-gradient-to-r from-spotify-green to-accent-cyan rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
