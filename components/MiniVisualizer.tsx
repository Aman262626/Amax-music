"use client";

import { usePlayer } from "@/contexts/PlayerContext";

interface Props {
  barCount?: number;
  className?: string;
}

export default function MiniVisualizer({ barCount = 5, className = "" }: Props) {
  const { isPlaying } = usePlayer();

  if (!isPlaying) return null;

  return (
    <div className={`flex items-end gap-[2px] h-4 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] bg-spotify-green rounded-full"
          style={{
            animation: `visualizer-bar ${0.4 + Math.random() * 0.4}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.1}s`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}
