"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHome, IoSearch, IoLibrary, IoPersonCircle, IoMusicalNotes } from "react-icons/io5";
import { IoMdTrendingUp } from "react-icons/io";
import SafeImage from "./SafeImage";
import NowPlayingBar from "./NowPlayingBar";
import ApiStatusBadge from "./ApiStatusBadge";

const NAV_ITEMS = [
  { href: "/", icon: IoHome, label: "Home" },
  { href: "/search", icon: IoSearch, label: "Search" },
  { href: "/now-playing", icon: IoMusicalNotes, label: "Now Playing" },
  { href: "/library", icon: IoLibrary, label: "Your Library" },
  { href: "/profile", icon: IoPersonCircle, label: "Profile" },
];

const QUICK_LINKS = [
  {
    href: "/search?q=trending",
    label: "Trending",
    sub: "Top charts",
    icon: IoMdTrendingUp,
    gradient: "from-accent-pink to-accent-red",
  },
  {
    href: "/search?q=bollywood hits",
    label: "Bollywood Hits",
    sub: "Latest & greatest",
    emoji: "🎶",
    gradient: "from-accent-orange to-accent-pink",
  },
  {
    href: "/search?q=chill lofi",
    label: "Chill Vibes",
    sub: "Lofi & relaxing",
    emoji: "🎧",
    gradient: "from-accent-purple to-accent-blue",
  },
  {
    href: "/search?q=party dance songs",
    label: "Party Mix",
    sub: "Dance & energy",
    emoji: "🔥",
    gradient: "from-fuchsia-500 to-accent-pink",
  },
  {
    href: "/search?q=retro bollywood",
    label: "Retro Classics",
    sub: "Timeless hits",
    emoji: "🎵",
    gradient: "from-amber-500 to-yellow-600",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] gap-2 p-2 flex-shrink-0">
      {/* Logo & Nav */}
      <div className="glass rounded-xl p-4 pb-2">
        <Link href="/" className="flex items-center gap-2 mb-5 px-2 group">
          <SafeImage src="/icon-96x96.png" alt="AMAX" width={32} height={32} className="rounded-lg shadow-lg group-hover:glow-green transition-all" />
          <span className="text-white font-bold text-xl tracking-tight gradient-text-holo">
            AMAX
          </span>
          <NowPlayingBar />
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  active
                    ? "text-white bg-white/10 sidebar-active"
                    : "text-spotify-light-gray hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`text-xl transition-transform group-hover:scale-110 ${active ? "text-spotify-green" : ""}`} />
                {item.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-spotify-green rounded-full glow-green" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Access */}
      <div className="glass rounded-xl p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-spotify-light-gray text-xs font-bold uppercase tracking-widest">
            Quick Access
          </p>
          <IoMusicalNotes className="text-spotify-light-gray text-xs" />
        </div>

        <div className="space-y-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-3 glass-card rounded-xl group"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${link.gradient} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 group-hover:shadow-lg`}>
                {link.icon ? (
                  <link.icon className="text-white text-lg" />
                ) : (
                  <span className="text-lg">{link.emoji}</span>
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{link.label}</p>
                <p className="text-spotify-light-gray text-xs">{link.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 p-4 glass-card holo-card rounded-xl text-center holo-border">
          <p className="text-white text-sm font-semibold mb-1 gradient-text-holo">AMAX Premium</p>
          <p className="text-spotify-light-gray text-xs">
            Unlimited music streaming with downloads
          </p>
        </div>

        {/* API Status & Keyboard shortcut hint */}
        <div className="mt-4 flex items-center justify-between">
          <ApiStatusBadge />
          <p className="text-spotify-light-gray text-[10px]">
            Press <kbd className="px-1 py-0.5 glass rounded text-white/60 text-[10px] font-mono">?</kbd> for shortcuts
          </p>
        </div>
      </div>
    </aside>
  );
}
