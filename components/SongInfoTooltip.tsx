"use client";

import { useState } from "react";
import { IoInformationCircle } from "react-icons/io5";
import type { Song } from "@/lib/types";

interface Props {
  song: Song;
}

export default function SongInfoTooltip({ song }: Props) {
  const [show, setShow] = useState(false);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-white/30 hover:text-white/60 transition-colors"
      >
        <IoInformationCircle className="text-sm" />
      </button>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 glass-card rounded-xl p-3 z-50 shadow-xl text-xs space-y-1.5">
          <p className="text-white font-medium truncate">{song.name}</p>
          <p className="text-white/60 truncate">{song.artist}</p>
          {song.album && (
            <p className="text-white/40 truncate">Album: {song.album}</p>
          )}
          {song.duration > 0 && (
            <p className="text-white/40">Duration: {formatDuration(song.duration)}</p>
          )}
          {song.year && <p className="text-white/40">Year: {song.year}</p>}
          {song.language && <p className="text-white/40">Language: {song.language}</p>}
          {song.playCount && (
            <p className="text-white/40">
              Plays: {song.playCount}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
