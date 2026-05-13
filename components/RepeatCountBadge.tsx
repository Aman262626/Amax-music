"use client";

import { usePlayer } from "@/contexts/PlayerContext";

export default function RepeatCountBadge() {
  const { repeat } = usePlayer();

  if (repeat === "off") return null;

  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-spotify-green text-black text-[9px] font-bold">
      {repeat === "one" ? "1" : "A"}
    </span>
  );
}
