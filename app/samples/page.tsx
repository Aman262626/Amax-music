"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SafeImage from "@/components/SafeImage";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import {
  IoPlay,
  IoPause,
  IoHeart,
  IoHeartOutline,
  IoShareSocial,
  IoPlaySkipForward,
  IoMusicalNotes,
} from "react-icons/io5";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/storage";

const SAMPLE_QUERIES = [
  "trending hindi songs",
  "latest bollywood hits",
  "punjabi new songs 2025",
  "romantic hindi songs",
  "party dance songs hindi",
  "arijit singh hits",
  "desi hip hop",
  "new english pop songs",
];

export default function SamplesPage() {
  const { playSong, currentSong, isPlaying, togglePlay, pause } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const fetchSongs = useCallback(async () => {
    const queries = SAMPLE_QUERIES.sort(() => Math.random() - 0.5).slice(0, 3);
    try {
      const results = await Promise.all(
        queries.map((q) =>
          fetch(`/api/search?q=${encodeURIComponent(q)}&type=songs`)
            .then((r) => r.json())
            .then((d) => (d.songs as Song[]) || [])
            .catch(() => [] as Song[])
        )
      );
      const all: Song[] = [];
      const seen = new Set<string>();
      for (const batch of results) {
        for (const s of batch) {
          if (!seen.has(s.id)) {
            seen.add(s.id);
            all.push(s);
          }
        }
      }
      const shuffled = all.sort(() => Math.random() - 0.5);
      setSongs(shuffled);
      if (shuffled.length > 0) {
        playSong(shuffled[0], shuffled, 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [playSong]);

  useEffect(() => {
    fetchSongs();
    return () => {
      pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (songs[currentIndex]) {
      setLiked(isFavorite(songs[currentIndex].id));
    }
  }, [currentIndex, songs]);

  const goToSong = useCallback(
    (index: number) => {
      if (index < 0 || index >= songs.length) return;
      setCurrentIndex(index);
      playSong(songs[index], songs, index);
    },
    [songs, playSong]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 60) {
        isSwiping.current = true;
        if (diff > 0) {
          goToSong(currentIndex + 1);
        } else {
          goToSong(currentIndex - 1);
        }
      }
    },
    [currentIndex, goToSong]
  );

  const handleLike = useCallback(() => {
    const song = songs[currentIndex];
    if (!song) return;
    if (liked) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
    setLiked(!liked);
  }, [songs, currentIndex, liked]);

  const handleShare = useCallback(async () => {
    const song = songs[currentIndex];
    if (!song) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.name,
          text: `${song.name} - ${song.artist}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    }
  }, [songs, currentIndex]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-20 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm">Loading samples...</p>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="p-8 text-center">
        <IoMusicalNotes className="text-4xl text-spotify-light-gray mx-auto mb-3" />
        <p className="text-white font-semibold">No samples available</p>
        <p className="text-spotify-light-gray text-sm">Try again later</p>
      </div>
    );
  }

  const song = songs[currentIndex];
  const isCurrentPlaying = currentSong?.id === song?.id && isPlaying;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-20 bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background image */}
      {song && (
        <div className="absolute inset-0">
          <SafeImage
            src={song.imageHigh || song.image}
            alt={song.name}
            fill
            className="object-cover blur-sm scale-110 opacity-40"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-center p-4 pt-6">
          <h1 className="text-white font-bold text-lg">Samples</h1>
        </div>

        {/* Main song area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Album art */}
          {song && (
            <div
              className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl mb-8 ${
                isCurrentPlaying ? "animate-pulse-slow glow-green" : ""
              }`}
              onClick={() => {
                if (currentSong?.id === song.id) {
                  togglePlay();
                } else {
                  playSong(song, songs, currentIndex);
                }
              }}
            >
              <SafeImage
                src={song.imageHigh || song.image}
                alt={song.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                {isCurrentPlaying ? (
                  <IoPause className="text-white/80 text-5xl drop-shadow-lg" />
                ) : (
                  <IoPlay className="text-white/80 text-5xl drop-shadow-lg ml-1" />
                )}
              </div>
            </div>
          )}

          {/* Song info */}
          {song && (
            <div className="text-center max-w-sm w-full">
              <p className="text-white text-xl font-bold truncate mb-1">
                {song.name}
              </p>
              <p className="text-spotify-light-gray text-sm truncate mb-1">
                {song.artist}
              </p>
              <p className="text-spotify-light-gray/60 text-xs">
                {song.album} • {formatDuration(song.duration)}
              </p>
            </div>
          )}
        </div>

        {/* Side actions */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
            {liked ? (
              <IoHeart className="text-accent-pink text-3xl" />
            ) : (
              <IoHeartOutline className="text-white text-3xl" />
            )}
            <span className="text-white text-[10px]">Like</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1"
          >
            <IoShareSocial className="text-white text-3xl" />
            <span className="text-white text-[10px]">Share</span>
          </button>
          <button
            onClick={() => goToSong(currentIndex + 1)}
            className="flex flex-col items-center gap-1"
          >
            <IoPlaySkipForward className="text-white text-3xl" />
            <span className="text-white text-[10px]">Next</span>
          </button>
        </div>

        {/* Bottom indicator */}
        <div className="px-6 pb-20 flex items-center justify-center gap-1">
          {songs.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((s, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            return (
              <div
                key={s.id}
                className={`rounded-full transition-all ${
                  actualIndex === currentIndex
                    ? "w-6 h-1.5 bg-spotify-green"
                    : "w-1.5 h-1.5 bg-white/30"
                }`}
              />
            );
          })}
        </div>

        {/* Swipe hint */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-xs animate-bounce">
          ↑ Swipe up for next
        </div>
      </div>
    </div>
  );
}
