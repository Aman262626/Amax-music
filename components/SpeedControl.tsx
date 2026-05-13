"use client";

import { usePlayer } from "@/contexts/PlayerContext";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function SpeedControl() {
  const { playbackSpeed, setPlaybackSpeed } = usePlayer();

  return (
    <div className="flex items-center gap-1">
      {SPEEDS.map((speed) => (
        <button
          key={speed}
          onClick={() => setPlaybackSpeed(speed)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
            playbackSpeed === speed
              ? "bg-spotify-green text-black font-bold"
              : "text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          {speed}x
        </button>
      ))}
    </div>
  );
}
