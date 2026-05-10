"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface LyricsPanelProps {
  songId: string;
  songName: string;
  onClose: () => void;
}

export default function LyricsPanel({ songId, songName, onClose }: LyricsPanelProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setLyrics(null);
    fetch(`/api/songs/${songId}/lyrics`)
      .then((r) => r.json())
      .then((data) => {
        if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          setLyrics(null);
        }
      })
      .catch(() => setLyrics(null))
      .finally(() => setLoading(false));
  }, [songId]);

  return (
    <div className="fixed inset-0 z-[60] lg:inset-auto lg:fixed lg:right-4 lg:bottom-[100px] lg:w-[380px] lg:h-[500px] lg:rounded-2xl glass-strong overflow-hidden slide-up">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-lg">Lyrics</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1 glass rounded-full transition-colors">
          <IoClose className="text-xl" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        ) : lyrics ? (
          <div className="space-y-4">
            {lyrics.split("\n").map((line, i) => (
              <p
                key={i}
                className={`text-lg transition-colors ${
                  line.trim() === ""
                    ? "h-4"
                    : "text-white/80 hover:text-white cursor-default"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-white font-semibold mb-1">No lyrics available</p>
            <p className="text-spotify-light-gray text-sm">
              Lyrics for &ldquo;{songName}&rdquo; are not yet available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
