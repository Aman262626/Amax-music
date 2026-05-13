"use client";

import { useState, useEffect } from "react";
import { IoMusicalNotes, IoRefresh } from "react-icons/io5";

interface Props {
  songId: string;
  songName: string;
  artist: string;
}

export default function LyricsDisplay({ songId, songName, artist }: Props) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLyrics(null);
    setSource("");
  }, [songId]);

  const fetchLyrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ id: songId, name: songName, artist });
      const res = await fetch(`/api/lyrics?${params}`);
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        setSource(data.sources?.[0]?.source || "");
      } else {
        setLyrics("");
      }
    } catch {
      setLyrics("");
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => {
          setExpanded(true);
          if (lyrics === null) fetchLyrics();
        }}
        className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white/60 hover:text-white transition-all text-sm w-full justify-center"
      >
        <IoMusicalNotes />
        Show Lyrics
      </button>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-bold">Lyrics</h3>
        <div className="flex items-center gap-2">
          {source && <span className="text-white/30 text-[10px]">{source}</span>}
          <button onClick={fetchLyrics} className="text-white/40 hover:text-white transition-colors">
            <IoRefresh className={`text-sm ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setExpanded(false)}
            className="text-white/40 hover:text-white transition-colors text-xs"
          >
            Hide
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-spotify-green/30 border-t-spotify-green rounded-full animate-spin" />
        </div>
      )}

      {!loading && lyrics === "" && (
        <p className="text-white/30 text-sm text-center py-4">No lyrics available</p>
      )}

      {!loading && lyrics && (
        <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto scrollbar-thin">
          {lyrics}
        </div>
      )}
    </div>
  );
}
