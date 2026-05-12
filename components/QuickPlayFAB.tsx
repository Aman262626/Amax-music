"use client";

import { useState, useCallback } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song } from "@/lib/types";
import { getHistory, getFavorites } from "@/lib/storage";
import { IoShuffle, IoDice, IoHeart, IoTime, IoClose } from "react-icons/io5";

export default function QuickPlayFAB() {
  const { playQueue, currentSong } = usePlayer();
  const [open, setOpen] = useState(false);

  const playRandom = useCallback(async () => {
    try {
      const queries = ["trending hits", "new bollywood", "pop hits 2024", "party songs", "chill lofi"];
      const q = queries[Math.floor(Math.random() * queries.length)];
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=songs`);
      const data = await res.json();
      const songs = (data.songs as Song[]) || [];
      if (songs.length > 0) {
        const shuffled = songs.sort(() => Math.random() - 0.5);
        playQueue(shuffled, 0);
      }
    } catch { /* ignore */ }
    setOpen(false);
  }, [playQueue]);

  const playFavorites = useCallback(() => {
    const favs = getFavorites();
    if (favs.length > 0) {
      const shuffled = [...favs].sort(() => Math.random() - 0.5);
      playQueue(shuffled, 0);
    }
    setOpen(false);
  }, [playQueue]);

  const playHistory = useCallback(() => {
    const history = getHistory();
    if (history.length > 0) {
      playQueue(history.slice(0, 20), 0);
    }
    setOpen(false);
  }, [playQueue]);

  if (currentSong) return null;

  return (
    <div className="fixed bottom-36 lg:bottom-8 right-4 z-30">
      {open && (
        <div className="absolute bottom-14 right-0 flex flex-col gap-2 slide-up">
          <button
            onClick={playRandom}
            className="flex items-center gap-2 px-4 py-2.5 glass-strong rounded-xl text-white text-sm whitespace-nowrap hover:bg-white/10 transition-all shadow-lg"
          >
            <IoDice className="text-accent-cyan" /> Surprise Me
          </button>
          <button
            onClick={playFavorites}
            className="flex items-center gap-2 px-4 py-2.5 glass-strong rounded-xl text-white text-sm whitespace-nowrap hover:bg-white/10 transition-all shadow-lg"
          >
            <IoHeart className="text-accent-pink" /> Play Favorites
          </button>
          <button
            onClick={playHistory}
            className="flex items-center gap-2 px-4 py-2.5 glass-strong rounded-xl text-white text-sm whitespace-nowrap hover:bg-white/10 transition-all shadow-lg"
          >
            <IoTime className="text-accent-purple" /> Play Recent
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${
          open
            ? "bg-white/20 rotate-45"
            : "bg-gradient-to-br from-spotify-green to-accent-cyan glow-green"
        }`}
      >
        {open ? (
          <IoClose className="text-white text-2xl" />
        ) : (
          <IoShuffle className="text-white text-2xl" />
        )}
      </button>
    </div>
  );
}
