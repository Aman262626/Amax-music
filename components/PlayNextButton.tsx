"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { IoPlaySkipForward } from "react-icons/io5";
import type { Song } from "@/lib/types";

interface Props {
  song: Song;
  className?: string;
  showLabel?: boolean;
}

export default function PlayNextButton({ song, className = "", showLabel = false }: Props) {
  const { queue, queueIndex, addToQueue } = usePlayer();

  const handlePlayNext = () => {
    // Insert after current song in queue
    const newQueue = [...queue];
    newQueue.splice(queueIndex + 1, 0, song);
    addToQueue(song);
  };

  return (
    <button
      onClick={handlePlayNext}
      className={`flex items-center gap-1.5 text-white/60 hover:text-white transition-colors ${className}`}
      title="Play Next"
    >
      <IoPlaySkipForward className="text-sm" />
      {showLabel && <span className="text-xs">Play Next</span>}
    </button>
  );
}
