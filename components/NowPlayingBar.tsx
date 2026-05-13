"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { IoMusicalNotes } from "react-icons/io5";

export default function NowPlayingBar() {
  const { currentSong, isPlaying } = usePlayer();

  if (!currentSong || !isPlaying) return null;

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs">
      <IoMusicalNotes className="text-spotify-green animate-pulse" />
      <span className="text-white/80 max-w-[120px] truncate">{currentSong.name}</span>
      <div className="flex items-end gap-[2px] h-3">
        <div className="w-[2px] bg-spotify-green rounded-full audio-bar-1" style={{ height: "4px" }} />
        <div className="w-[2px] bg-spotify-green rounded-full audio-bar-2" style={{ height: "8px" }} />
        <div className="w-[2px] bg-spotify-green rounded-full audio-bar-3" style={{ height: "6px" }} />
      </div>
    </div>
  );
}
