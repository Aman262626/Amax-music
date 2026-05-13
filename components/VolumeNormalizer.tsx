"use client";

import { useState, useEffect } from "react";
import { IoVolumeHigh } from "react-icons/io5";

const NORMALIZER_KEY = "amax_volume_normalizer";

export function isNormalizerEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(NORMALIZER_KEY) === "true";
}

export default function VolumeNormalizer() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isNormalizerEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(NORMALIZER_KEY, next.toString());
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all ${
        enabled
          ? "bg-spotify-green/20 text-spotify-green"
          : "text-white/40 hover:text-white/60 hover:bg-white/5"
      }`}
      title="Volume Normalization"
    >
      <IoVolumeHigh className="text-sm" />
      <span className="hidden sm:inline">Normalize</span>
    </button>
  );
}
