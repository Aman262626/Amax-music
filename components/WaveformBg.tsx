"use client";

import { usePlayer } from "@/contexts/PlayerContext";

export default function WaveformBg() {
  const { isPlaying } = usePlayer();

  if (!isPlaying) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[3px] h-full">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="bg-spotify-green rounded-t flex-shrink-0"
            style={{
              width: "4px",
              animation: `waveform ${0.8 + Math.random() * 1.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
