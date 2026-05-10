"use client";

import { useState, useEffect, useCallback } from "react";
import { IoClose, IoLanguage, IoRefresh } from "react-icons/io5";

interface LyricsPanelProps {
  songId: string;
  songName: string;
  artist?: string;
  onClose: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  Hindi: "हिन्दी",
  English: "English",
  Punjabi: "ਪੰਜਾਬੀ",
  Urdu: "اردو",
  Bengali: "বাংলা",
  Tamil: "தமிழ்",
  Telugu: "తెలుగు",
  Unknown: "Original",
};

export default function LyricsPanel({ songId, songName, artist, onClose }: LyricsPanelProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>("Unknown");
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");

  const fetchLyrics = useCallback(async () => {
    setLoading(true);
    setLyrics(null);
    try {
      const params = new URLSearchParams({ id: songId });
      if (songName) params.set("name", songName);
      if (artist) params.set("artist", artist);
      const res = await fetch(`/api/lyrics?${params}`);
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        setDetectedLang(data.language || "Unknown");
      }
    } catch {
      setLyrics(null);
    } finally {
      setLoading(false);
    }
  }, [songId, songName, artist]);

  useEffect(() => {
    fetchLyrics();
  }, [fetchLyrics]);

  const fontSizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }[fontSize];

  return (
    <div className="fixed inset-0 z-[60] lg:inset-auto lg:fixed lg:right-4 lg:bottom-[100px] lg:w-[380px] lg:h-[500px] lg:rounded-2xl glass-strong overflow-hidden slide-up">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-white font-bold text-lg">Lyrics</h3>
          {detectedLang !== "Unknown" && lyrics && (
            <span className="text-xs px-2 py-0.5 glass rounded-full text-spotify-green flex items-center gap-1">
              <IoLanguage className="text-xs" />
              {LANGUAGE_LABELS[detectedLang] || detectedLang}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {lyrics && (
            <>
              <button
                onClick={() => {
                  const sizes: ("sm" | "base" | "lg" | "xl")[] = ["sm", "base", "lg", "xl"];
                  const idx = sizes.indexOf(fontSize);
                  setFontSize(sizes[(idx + 1) % sizes.length]);
                }}
                className="text-white/60 hover:text-white p-1 glass rounded-full transition-colors text-xs w-7 h-7 flex items-center justify-center"
                title="Font size"
              >
                A
              </button>
              <button
                onClick={fetchLyrics}
                className="text-white/60 hover:text-white p-1 glass rounded-full transition-colors"
                title="Refresh"
              >
                <IoRefresh className="text-sm" />
              </button>
            </>
          )}
          <button onClick={onClose} className="text-white/60 hover:text-white p-1 glass rounded-full transition-colors">
            <IoClose className="text-xl" />
          </button>
        </div>
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
                className={`${fontSizeClass} transition-colors ${
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
            <p className="text-spotify-light-gray text-sm mb-4">
              Lyrics for &ldquo;{songName}&rdquo; are not yet available
            </p>
            <button
              onClick={fetchLyrics}
              className="px-4 py-2 glass rounded-xl text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <IoRefresh /> Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
