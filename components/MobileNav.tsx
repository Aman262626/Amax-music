"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHome, IoSearch, IoLibrary } from "react-icons/io5";

const TABS = [
  { href: "/", icon: IoHome, label: "Home" },
  { href: "/search", icon: IoSearch, label: "Search" },
  { href: "/library", icon: IoLibrary, label: "Library" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent pt-4 pb-2 px-4">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
                isActive ? "text-white" : "text-spotify-light-gray"
              }`}
            >
              <tab.icon className="text-2xl" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
