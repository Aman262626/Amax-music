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
  IoVideocam,
  IoMusicalNote,
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
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
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

  // Fetch video for current song when in video mode
  const fetchVideo = useCallback(async (song: Song) => {
    setVideoLoading(true);
    setVideoId(null);
    try {
      const q = `${song.name} ${song.artist}`;
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
    if (mode === "video" && songs[currentIndex]) {
      pause();
      fetchVideo(songs[currentIndex]);
    } else {
      setVideoId(null);
    }
  }, [mode, currentIndex, songs, fetchVideo, pause]);

  const goToSong = useCallback(
    (index: number) => {
      if (index < 0 || index >= songs.length) return;
      setCurrentIndex(index);
      if (mode === "audio") {
        playSong(songs[index], songs, index);
      }
    },
    [songs, playSong, mode]
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
      {/* Background */}
      {song && mode === "audio" && (
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

      {/* Video background for video mode */}
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
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>
      )}

      {/* Video loading */}
      {mode === "video" && videoLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Video not found */}
      {mode === "video" && !videoLoading && !videoId && song && (
        <div className="absolute inset-0">
          <SafeImage
            src={song.imageHigh || song.image}
            alt={song.name}
            fill
            className="object-cover blur-sm scale-110 opacity-40"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/50 text-sm">No video available for this song</p>
          </div>
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Top bar */}
        <div className="flex items-center justify-center p-4 pt-6 pointer-events-auto">
          <h1 className="text-white font-bold text-lg">Samples</h1>
        </div>

        {/* Audio/Video toggle */}
        <div className="flex justify-center mb-4 pointer-events-auto">
          <div className="flex bg-white/10 rounded-full p-1 backdrop-blur-lg">
            <button
              onClick={() => {
                setMode("audio");
                if (songs[currentIndex]) {
                  playSong(songs[currentIndex], songs, currentIndex);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === "audio"
                  ? "bg-spotify-green text-black"
                  : "text-white/70 hover:text-white"
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
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === "video"
                  ? "bg-spotify-green text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <IoVideocam className="text-sm" />
              Video
            </button>
          </div>
        </div>

        {/* Main song area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pointer-events-auto">
          {/* Album art (shown in audio mode or when no video) */}
          {song && (mode === "audio" || !videoId) && (
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
            <div className={`text-center max-w-sm w-full ${mode === "video" && videoId ? "mt-auto" : ""}`}>
              <p className="text-white text-xl font-bold truncate mb-1 drop-shadow-lg">
                {song.name}
              </p>
              <p className="text-white/70 text-sm truncate mb-1 drop-shadow-lg">
                {song.artist}
              </p>
              <p className="text-white/40 text-xs drop-shadow-lg">
                {song.album} • {formatDuration(song.duration)}
              </p>
            </div>
          )}
        </div>

        {/* Side actions */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 pointer-events-auto">
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
            {liked ? (
              <IoHeart className="text-accent-pink text-3xl drop-shadow-lg" />
            ) : (
              <IoHeartOutline className="text-white text-3xl drop-shadow-lg" />
            )}
            <span className="text-white text-[10px] drop-shadow-lg">Like</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1"
          >
            <IoShareSocial className="text-white text-3xl drop-shadow-lg" />
            <span className="text-white text-[10px] drop-shadow-lg">Share</span>
          </button>
          <button
            onClick={() => goToSong(currentIndex + 1)}
            className="flex flex-col items-center gap-1"
          >
            <IoPlaySkipForward className="text-white text-3xl drop-shadow-lg" />
            <span className="text-white text-[10px] drop-shadow-lg">Next</span>
          </button>
        </div>

        {/* Bottom indicator */}
        <div className="px-6 pb-20 flex items-center justify-center gap-1 pointer-events-auto">
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
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-xs animate-bounce pointer-events-none">
          ↑ Swipe up for next
        </div>
      </div>
    </div>
  );
}
