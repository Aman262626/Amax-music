"use client";

import { useState, useEffect } from "react";
import { IoLink } from "react-icons/io5";

const GAPLESS_KEY = "amax_gapless";

export function isGaplessEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(GAPLESS_KEY) !== "false";
}

export default function GaplessToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isGaplessEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(GAPLESS_KEY, next.toString());
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all ${
        enabled
          ? "bg-spotify-green/20 text-spotify-green"
          : "text-white/40 hover:text-white/60 hover:bg-white/5"
      }`}
      title="Gapless Playback"
    >
      <IoLink className="text-sm" />
      <span className="hidden sm:inline">Gapless</span>
    </button>
  );
}
