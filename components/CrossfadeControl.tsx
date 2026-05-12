"use client";

import { useState, useEffect } from "react";

const CROSSFADE_KEY = "amax_crossfade";

export function getCrossfadeDuration(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(CROSSFADE_KEY) || "0", 10);
}

export function setCrossfadeDuration(seconds: number): void {
  localStorage.setItem(CROSSFADE_KEY, seconds.toString());
}

export default function CrossfadeControl() {
  const [crossfade, setCrossfade] = useState(0);

  useEffect(() => {
    setCrossfade(getCrossfadeDuration());
  }, []);

  const handleChange = (val: number) => {
    setCrossfade(val);
    setCrossfadeDuration(val);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-white/50 text-xs whitespace-nowrap">Crossfade</span>
      <input
        type="range"
        min={0}
        max={12}
        step={1}
        value={crossfade}
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
        className="w-24 h-1 accent-spotify-green"
      />
      <span className="text-white/70 text-xs font-mono w-6">{crossfade}s</span>
    </div>
  );
}
