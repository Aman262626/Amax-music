"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHome, IoSearch, IoLibrary } from "react-icons/io5";
import { BiMusic } from "react-icons/bi";

const NAV_ITEMS = [
  { href: "/", icon: IoHome, label: "Home" },
  { href: "/search", icon: IoSearch, label: "Search" },
  { href: "/library", icon: IoLibrary, label: "Your Library" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] min-w-[280px] bg-black h-full gap-2 p-2">
      {/* Logo */}
      <div className="bg-spotify-dark-gray rounded-lg p-4 pb-2">
        <Link href="/" className="flex items-center gap-2 mb-4 px-2">
          <BiMusic className="text-spotify-green text-3xl" />
          <span className="text-white font-bold text-xl tracking-tight">
            Spotify
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-2 rounded-md transition-colors font-semibold text-sm ${
                  isActive
                    ? "text-white"
                    : "text-spotify-light-gray hover:text-white"
                }`}
              >
                <item.icon className="text-2xl" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Library section */}
      <div className="bg-spotify-dark-gray rounded-lg flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-spotify-light-gray font-bold text-sm flex items-center gap-2">
            <IoLibrary className="text-xl" />
            Your Library
          </h2>
        </div>

        <div className="bg-spotify-gray rounded-lg p-4 mb-4">
          <h3 className="text-white font-bold text-sm mb-1">
            Create your first playlist
          </h3>
          <p className="text-spotify-light-gray text-xs mb-3">
            It&apos;s easy, we&apos;ll help you
          </p>
          <Link
            href="/library"
            className="inline-block bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform"
          >
            Browse Library
          </Link>
        </div>

        <div className="bg-spotify-gray rounded-lg p-4">
          <h3 className="text-white font-bold text-sm mb-1">
            Find some songs
          </h3>
          <p className="text-spotify-light-gray text-xs mb-3">
            We&apos;ll keep you updated on new songs
          </p>
          <Link
            href="/search"
            className="inline-block bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform"
          >
            Browse Songs
          </Link>
        </div>
      </div>
    </aside>
  );
}
