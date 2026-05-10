"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHome, IoSearch, IoLibrary } from "react-icons/io5";

const NAV_ITEMS = [
  { href: "/", icon: IoHome, label: "Home" },
  { href: "/search", icon: IoSearch, label: "Search" },
  { href: "/library", icon: IoLibrary, label: "Library" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong">
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
              <item.icon className={`text-xl ${active ? "text-spotify-green" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <div className="w-1 h-1 bg-spotify-green rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
