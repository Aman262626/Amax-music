"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHome, IoSearch, IoLibrary, IoPersonCircle } from "react-icons/io5";
import { BiMusic } from "react-icons/bi";
import { IoMdTrendingUp } from "react-icons/io";

const NAV_ITEMS = [
  { href: "/", icon: IoHome, label: "Home" },
  { href: "/search", icon: IoSearch, label: "Search" },
  { href: "/library", icon: IoLibrary, label: "Your Library" },
  { href: "/profile", icon: IoPersonCircle, label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] gap-2 p-2 flex-shrink-0">
      {/* Logo & Nav */}
      <div className="glass rounded-xl p-4 pb-2">
        <Link href="/" className="flex items-center gap-2 mb-5 px-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-accent-cyan rounded-lg flex items-center justify-center shadow-lg group-hover:glow-green transition-all">
            <BiMusic className="text-black text-lg" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight gradient-text">
            AMAX
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? "text-white bg-white/10"
                    : "text-spotify-light-gray hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`text-xl ${active ? "text-spotify-green" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-spotify-light-gray text-xs font-bold uppercase tracking-widest">
            Quick Access
          </p>
        </div>

        <div className="space-y-2">
          <Link
            href="/search?q=trending"
            className="flex items-center gap-3 p-3 glass-card rounded-xl"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-accent-pink to-accent-red rounded-lg flex items-center justify-center">
              <IoMdTrendingUp className="text-white text-lg" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Trending</p>
              <p className="text-spotify-light-gray text-xs">Top charts</p>
            </div>
          </Link>

          <Link
            href="/search?q=bollywood hits"
            className="flex items-center gap-3 p-3 glass-card rounded-xl"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-pink rounded-lg flex items-center justify-center">
              <span className="text-lg">🎶</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Bollywood Hits</p>
              <p className="text-spotify-light-gray text-xs">Latest & greatest</p>
            </div>
          </Link>

          <Link
            href="/search?q=chill lofi"
            className="flex items-center gap-3 p-3 glass-card rounded-xl"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center">
              <span className="text-lg">🎧</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Chill Vibes</p>
              <p className="text-spotify-light-gray text-xs">Lofi & relaxing</p>
            </div>
          </Link>
        </div>

        <div className="mt-6 p-4 glass-card rounded-xl text-center">
          <p className="text-white text-sm font-semibold mb-1">AMAX Premium</p>
          <p className="text-spotify-light-gray text-xs">
            Unlimited music streaming with downloads
          </p>
        </div>
      </div>
    </aside>
  );
}
