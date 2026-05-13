"use client";

import { usePlayer } from "@/contexts/PlayerContext";

interface Props {
  showRemaining?: boolean;
  className?: string;
}

function formatTime(sec: number): string {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SongProgress({ showRemaining = true, className = "" }: Props) {
  const { progress, duration } = usePlayer();
  const remaining = duration - progress;

  return (
    <div className={`flex items-center gap-2 text-xs font-mono text-white/50 ${className}`}>
      <span>{formatTime(progress)}</span>
      {showRemaining && duration > 0 && (
        <span>-{formatTime(remaining)}</span>
      )}
    </div>
  );
}
