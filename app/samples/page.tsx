"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  IoPlaySkipBack,
  IoMusicalNotes,
  IoVideocam,
  IoMusicalNote,
  IoChevronUp,
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
  const {
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
    pause,
    next,
    previous,
    progress,
    duration,
  } = usePlayer();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // Fetch songs on mount
  useEffect(() => {
    let cancelled = false;
    const fetchSongs = async () => {
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
        if (cancelled) return;
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
        if (!cancelled) setLoading(false);
      }
    };
    fetchSongs();
    return () => {
      cancelled = true;
      pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive displayed song from PlayerContext (single source of truth)
  const song = useMemo(() => {
    if (currentSong && songs.some((s) => s.id === currentSong.id)) {
      return currentSong;
    }
    return songs[0] || null;
  }, [currentSong, songs]);

  const songIndex = useMemo(() => {
    if (!song) return 0;
    const idx = songs.findIndex((s) => s.id === song.id);
    return idx >= 0 ? idx : 0;
  }, [song, songs]);

  const isCurrentPlaying = currentSong?.id === song?.id && isPlaying;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Update liked state
  useEffect(() => {
    if (song) setLiked(isFavorite(song.id));
  }, [song]);

  // Fetch video when in video mode
  const fetchVideo = useCallback(async (s: Song) => {
    setVideoLoading(true);
    setVideoId(null);
    try {
      const q = `${s.name} ${s.artist}`;
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.videoIds && data.videoIds.length > 0) {
        setVideoId(data.videoIds[0]);
      }
    } catch {
      // ignore
    } finally {
      setVideoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === "video" && song) {
      pause();
      fetchVideo(song);
    } else {
      setVideoId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, song?.id]);

  // Navigation
  const goToSong = useCallback(
    (index: number) => {
      if (index < 0 || index >= songs.length) return;
      pause();
      if (mode === "audio") {
        playSong(songs[index], songs, index);
      }
    },
    [songs, playSong, mode, pause]
  );

  const handleNext = useCallback(() => {
    if (songIndex + 1 < songs.length) {
      goToSong(songIndex + 1);
    }
  }, [songIndex, songs.length, goToSong]);

  const handlePrev = useCallback(() => {
    if (songIndex - 1 >= 0) {
      goToSong(songIndex - 1);
    }
  }, [songIndex, goToSong]);

  // Touch handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 60) {
        if (diff > 0) handleNext();
        else handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  // Actions
  const handlePlayPause = useCallback(() => {
    if (!song) return;
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, songs, songIndex);
    }
  }, [song, currentSong, togglePlay, playSong, songs, songIndex]);

  const handleLike = useCallback(() => {
    if (!song) return;
    if (liked) removeFavorite(song.id);
    else addFavorite(song);
    setLiked(!liked);
  }, [song, liked]);

  const handleShare = useCallback(async () => {
    if (!song || !navigator.share) return;
    try {
      await navigator.share({
        title: song.name,
        text: `${song.name} - ${song.artist}`,
        url: window.location.href,
      });
    } catch {
      // user cancelled
    }
  }, [song]);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-20 bg-gradient-to-b from-[#1a0a2e] via-[#0a0a0a] to-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-fuchsia-500 border-r-cyan-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-fuchsia-400 border-l-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <p className="text-white/60 text-sm font-medium tracking-wide">Discovering music...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (songs.length === 0) {
    return (
      <div className="fixed inset-0 z-20 bg-gradient-to-b from-[#1a0a2e] via-[#0a0a0a] to-[#0a0a0a] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <IoMusicalNotes className="text-3xl text-white/30" />
          </div>
          <p className="text-white font-semibold text-lg">No samples available</p>
          <p className="text-white/40 text-sm mt-1">Try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-20 select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic gradient background based on mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#0d0d1a] to-[#0a0a0a]" />

      {/* Album art as blurred background */}
      {song && mode === "audio" && (
        <div className="absolute inset-0 overflow-hidden">
          <SafeImage
            src={song.imageHigh || song.image}
            alt=""
            fill
            className="object-cover scale-125 blur-3xl opacity-25"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
        </div>
      )}

      {/* Video background */}
      {mode === "video" && videoId && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&mute=0&playsinline=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            style={{ minHeight: "100vh" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Music Video"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        </div>
      )}

      {/* Video loading */}
      {mode === "video" && videoLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="w-8" />
          <h1 className="text-white font-bold text-base tracking-wide">Samples</h1>
          <div className="w-8" />
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-white/[0.07] rounded-full p-0.5 backdrop-blur-xl">
            <button
              onClick={() => {
                setMode("audio");
                if (song) playSong(song, songs, songIndex);
              }}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                mode === "audio"
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/25"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <IoMusicalNote className="text-sm" />
              Audio
            </button>
            <button
              onClick={() => {
                pause();
                setMode("video");
              }}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                mode === "video"
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/25"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <IoVideocam className="text-sm" />
              Video
            </button>
          </div>
        </div>

        {/* Song content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Album art with vinyl effect */}
          {song && (mode === "audio" || !videoId) && (
            <div className="relative mb-8">
              {/* Glow ring */}
              {isCurrentPlaying && (
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-fuchsia-500/30 via-purple-500/20 to-cyan-500/30 blur-xl animate-pulse-slow" />
              )}

              {/* Album art */}
              <div
                className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 ${
                  isCurrentPlaying ? "scale-100" : "scale-95"
                }`}
                onClick={handlePlayPause}
              >
                <SafeImage
                  src={song.imageHigh || song.image}
                  alt={song.name}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Play/Pause overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isCurrentPlaying ? "bg-black/10" : "bg-black/30"
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrentPlaying
                      ? "bg-white/20 backdrop-blur-sm scale-90"
                      : "bg-white/25 backdrop-blur-sm"
                  }`}>
                    {isCurrentPlaying ? (
                      <IoPause className="text-white text-2xl" />
                    ) : (
                      <IoPlay className="text-white text-2xl ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Song info */}
          {song && (
            <div className="text-center w-full max-w-sm">
              <h2 className="text-white text-2xl font-bold truncate mb-1">
                {song.name}
              </h2>
              <p className="text-white/60 text-sm truncate mb-0.5">
                {song.artist}
              </p>
              <p className="text-white/30 text-xs">
                {song.album} &middot; {formatDuration(song.duration)}
              </p>
            </div>
          )}

          {/* Progress bar */}
          {mode === "audio" && (
            <div className="w-full max-w-sm mt-6">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/30 text-[10px] font-mono">{formatDuration(Math.floor(progress))}</span>
                <span className="text-white/30 text-[10px] font-mono">{formatDuration(Math.floor(duration))}</span>
              </div>
            </div>
          )}

          {/* Playback controls */}
          {mode === "audio" && (
            <div className="flex items-center gap-8 mt-4">
              <button
                onClick={handlePrev}
                disabled={songIndex <= 0}
                className="text-white/60 hover:text-white transition-colors disabled:text-white/20"
              >
                <IoPlaySkipBack className="text-2xl" />
              </button>

              <button
                onClick={handlePlayPause}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all active:scale-95"
              >
                {isCurrentPlaying ? (
                  <IoPause className="text-white text-xl" />
                ) : (
                  <IoPlay className="text-white text-xl ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={songIndex >= songs.length - 1}
                className="text-white/60 hover:text-white transition-colors disabled:text-white/20"
              >
                <IoPlaySkipForward className="text-2xl" />
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-10 pb-4 px-8">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
            {liked ? (
              <IoHeart className="text-2xl text-accent-pink drop-shadow-lg" />
            ) : (
              <IoHeartOutline className="text-2xl text-white/50 group-hover:text-white transition-colors" />
            )}
            <span className="text-white/40 text-[10px]">Like</span>
          </button>

          <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
            <IoShareSocial className="text-2xl text-white/50 group-hover:text-white transition-colors" />
            <span className="text-white/40 text-[10px]">Share</span>
          </button>
        </div>

        {/* Song position indicator */}
        <div className="flex items-center justify-center gap-1 pb-2">
          {songs.slice(Math.max(0, songIndex - 3), songIndex + 4).map((s, i) => {
            const actualIndex = Math.max(0, songIndex - 3) + i;
            return (
              <div
                key={s.id}
                className={`rounded-full transition-all duration-300 ${
                  actualIndex === songIndex
                    ? "w-5 h-1.5 bg-gradient-to-r from-fuchsia-500 to-purple-500"
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            );
          })}
        </div>

        {/* Swipe hint */}
        <div className="flex flex-col items-center pb-20 text-white/20">
          <IoChevronUp className="text-sm animate-bounce" />
          <span className="text-[10px] mt-0.5">Swipe for more</span>
        </div>
      </div>
    </div>
  );
}
