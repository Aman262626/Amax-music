"use client";

import { useState, useRef, useCallback } from "react";
import SafeImage from "./SafeImage";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song } from "@/lib/types";
import { IoPlay, IoChevronBack, IoChevronForward, IoVideocam } from "react-icons/io5";

interface VideoPreviewScrollProps {
  songs: Song[];
  title: string;
}

export default function VideoPreviewScroll({ songs, title }: VideoPreviewScrollProps) {
  const { playSong } = usePlayer();
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoSongId, setVideoSongId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadVideo = useCallback(async (song: Song) => {
    if (videoSongId === song.id) {
      setVideoId(null);
      setVideoSongId(null);
      return;
    }
    setLoadingVideo(song.id);
    try {
      const q = `${song.name} ${song.artist}`;
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.videoIds && data.videoIds.length > 0) {
        setVideoId(data.videoIds[0]);
        setVideoSongId(song.id);
      }
    } catch {
      // ignore
    } finally {
      setLoadingVideo(null);
    }
  }, [videoSongId]);

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
        <div className="flex items-center gap-2">
          <IoVideocam className="text-spotify-green" />
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button onClick={() => scroll("left")} className="p-1.5 glass rounded-full text-white/70 hover:text-white transition-colors">
            <IoChevronBack className="text-sm" />
          </button>
          <button onClick={() => scroll("right")} className="p-1.5 glass rounded-full text-white/70 hover:text-white transition-colors">
            <IoChevronForward className="text-sm" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {songs.slice(0, 12).map((song) => {
          const isActive = videoSongId === song.id;
          const isLoading = loadingVideo === song.id;

          return (
            <div key={song.id} className="flex-shrink-0 w-56 sm:w-64">
              <div
                className={`glass-card rounded-xl overflow-hidden ${isActive ? "ring-1 ring-spotify-green/50 glow-green" : ""}`}
              >
                {isActive && videoId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={song.name}
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video cursor-pointer group" onClick={() => loadVideo(song)}>
                    <SafeImage
                      src={song.image}
                      alt={song.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isLoading ? (
                        <div className="w-10 h-10 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <IoVideocam className="text-white text-xl" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-white text-sm font-medium truncate">{song.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-spotify-light-gray text-xs truncate flex-1">{song.artist}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong(song, songs);
                      }}
                      className="ml-2 p-1 text-spotify-green hover:scale-110 transition-transform"
                      title="Play audio"
                    >
                      <IoPlay className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
