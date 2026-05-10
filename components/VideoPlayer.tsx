"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { IoClose, IoVideocam, IoExpand } from "react-icons/io5";

export default function VideoPlayer() {
  const { currentSong } = usePlayer();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const searchVideo = useCallback(async () => {
    if (!currentSong) return;
    setLoading(true);
    try {
      const q = `${currentSong.name} ${currentSong.artist}`;
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.videoIds && data.videoIds.length > 0) {
        setVideoId(data.videoIds[0]);
      } else {
        setVideoId(null);
      }
    } catch {
      setVideoId(null);
    } finally {
      setLoading(false);
    }
  }, [currentSong]);

  useEffect(() => {
    if (isOpen && currentSong) {
      searchVideo();
    }
  }, [isOpen, currentSong, searchVideo]);

  if (!currentSong) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all ${
          isOpen ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"
        }`}
        title="Music Video"
      >
        <IoVideocam className="text-lg" />
      </button>

      {/* Video panel */}
      {isOpen && (
        <div
          className={`fixed z-[100] ${
            isFullscreen
              ? "inset-0 bg-black"
              : "bottom-24 lg:bottom-[96px] right-4 w-[360px] sm:w-[480px] rounded-xl overflow-hidden shadow-2xl"
          } fade-in`}
        >
          <div className="relative w-full h-full">
            {/* Header */}
            <div className={`flex items-center justify-between p-3 ${isFullscreen ? "absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent" : "glass-strong"}`}>
              <div className="flex items-center gap-2 min-w-0">
                <IoVideocam className="text-spotify-green text-sm flex-shrink-0" />
                <span className="text-white text-sm font-medium truncate">
                  {currentSong.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                >
                  <IoExpand className="text-sm" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsFullscreen(false);
                  }}
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                >
                  <IoClose className="text-sm" />
                </button>
              </div>
            </div>

            {/* Video */}
            <div className={`${isFullscreen ? "w-full h-full" : "aspect-video"} bg-black`}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
                </div>
              ) : videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentSong.name}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-spotify-light-gray">
                  <IoVideocam className="text-4xl mb-2" />
                  <p className="text-sm">Video not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
