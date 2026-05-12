"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SafeImage from "./SafeImage";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song } from "@/lib/types";
import { formatDuration, getBestDownloadUrl } from "@/lib/utils";
import { IoPlay, IoPause, IoChevronBack, IoChevronForward } from "react-icons/io5";

interface SongPreviewScrollProps {
  songs: Song[];
  title: string;
}

export default function SongPreviewScroll({ songs, title }: SongPreviewScrollProps) {
  const { playSong, currentSong, isPlaying, pause } = usePlayer();
  const [previewSongId, setPreviewSongId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setPreviewSongId(null);
    setPreviewProgress(0);
  }, []);

  useEffect(() => {
    if (currentSong && previewSongId) {
      stopPreview();
    }
  }, [currentSong, previewSongId, stopPreview]);

  const playPreview = useCallback(
    (song: Song) => {
      if (previewSongId === song.id) {
        stopPreview();
        return;
      }

      stopPreview();

      const url = getBestDownloadUrl(song.downloadUrl);
      if (!url) return;

      if (isPlaying) {
        pause();
      }

      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.volume = 0.5;
      audio.currentTime = Math.min(30, (song.duration || 60) * 0.3);

      audio.play().catch(() => {});
      setPreviewSongId(song.id);

      progressIntervalRef.current = setInterval(() => {
        if (audio.duration > 0) {
          const startTime = Math.min(30, (song.duration || 60) * 0.3);
          const elapsed = audio.currentTime - startTime;
          const maxDuration = 30;
          setPreviewProgress(Math.min(100, (elapsed / maxDuration) * 100));

          if (elapsed >= maxDuration) {
            stopPreview();
          }
        }
      }, 200);

      audio.addEventListener("ended", stopPreview);
    },
    [previewSongId, stopPreview, isPlaying, pause]
  );

  const handleFullPlay = useCallback(
    (song: Song) => {
      stopPreview();
      playSong(song, songs);
    },
    [playSong, songs, stopPreview]
  );

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  if (songs.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 glass rounded-full text-white/70 hover:text-white transition-colors"
          >
            <IoChevronBack className="text-sm" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 glass rounded-full text-white/70 hover:text-white transition-colors"
          >
            <IoChevronForward className="text-sm" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
      >
        {songs.map((song) => {
          const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
          const isPreviewing = previewSongId === song.id;

          return (
            <div
              key={song.id}
              className={`flex-shrink-0 w-44 sm:w-52 glass-card rounded-xl overflow-hidden group ${
                isPreviewing ? "ring-1 ring-spotify-green/50 glow-green" : ""
              }`}
            >
              {/* Album art with preview button */}
              <div className="relative aspect-square">
                <SafeImage
                  src={song.image}
                  alt={song.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Preview progress ring */}
                {isPreviewing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16" viewBox="0 0 64 64">
                      <circle
                        cx="32" cy="32" r="28"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="32" cy="32" r="28"
                        fill="none"
                        stroke="#c026d3"
                        strokeWidth="3"
                        strokeDasharray={`${previewProgress * 1.76} 176`}
                        strokeLinecap="round"
                        transform="rotate(-90 32 32)"
                        className="transition-all duration-200"
                      />
                    </svg>
                  </div>
                )}

                {/* Overlay buttons */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity ${
                  isPreviewing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  {/* Preview button */}
                  <button
                    onClick={() => playPreview(song)}
                    className="w-10 h-10 glass-strong rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                    title={isPreviewing ? "Stop preview" : "Preview 30s"}
                  >
                    {isPreviewing ? (
                      <IoPause className="text-sm" />
                    ) : (
                      <IoPlay className="text-sm ml-0.5" />
                    )}
                  </button>
                  {/* Full play button */}
                  <button
                    onClick={() => handleFullPlay(song)}
                    className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform"
                    title="Play full song"
                  >
                    <IoPlay className="text-sm ml-0.5" />
                  </button>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 glass-strong rounded text-[10px] text-white/90">
                  {formatDuration(song.duration)}
                </div>

                {/* Currently playing indicator */}
                {isCurrentPlaying && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-spotify-green rounded text-[10px] text-black font-bold">
                    NOW
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-white text-sm font-medium truncate">{song.name}</p>
                <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
                {isPreviewing && (
                  <div className="mt-1.5 h-0.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full progress-gradient rounded-full transition-all duration-200"
                      style={{ width: `${previewProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
