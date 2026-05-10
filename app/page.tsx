"use client";

import { useEffect, useState, useCallback } from "react";
import SongCard from "@/components/SongCard";
import AlbumCard from "@/components/AlbumCard";
import PlaylistCard from "@/components/PlaylistCard";
import type { Song, Album, Playlist } from "@/lib/types";

const CATEGORIES = [
  { label: "Trending", query: "trending hits" },
  { label: "Bollywood", query: "bollywood hits" },
  { label: "Pop", query: "pop hits 2024" },
  { label: "Hip Hop", query: "hip hop rap" },
  { label: "Punjabi", query: "punjabi hits" },
  { label: "Romantic", query: "romantic love songs" },
  { label: "Party", query: "party dance songs" },
  { label: "Chill", query: "lofi chill" },
];

const GREETINGS: Record<string, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS.morning;
  if (hour < 18) return GREETINGS.afternoon;
  return GREETINGS.evening;
}

export default function HomePage() {
  const [greeting] = useState(getGreeting);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [categorySongs, setCategorySongs] = useState<Record<string, Song[]>>({});
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].label);
  const [loading, setLoading] = useState(true);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch("/api/trending");
      const data = await res.json();
      setSongs(data.songs || []);
      setAlbums(data.albums || []);
      setPlaylists(data.playlists || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategory = useCallback(async (label: string, query: string) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=songs`);
      const data = await res.json();
      setCategorySongs((prev) => ({ ...prev, [label]: data.songs || [] }));
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchTrending();
    fetchCategory(CATEGORIES[0].label, CATEGORIES[0].query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!categorySongs[activeCategory]) {
      const cat = CATEGORIES.find((c) => c.label === activeCategory);
      if (cat) fetchCategory(cat.label, cat.query);
    }
  }, [activeCategory, categorySongs, fetchCategory]);

  const SkeletonCard = () => (
    <div className="bg-spotify-dark-gray rounded-lg p-3 sm:p-4">
      <div className="aspect-square skeleton rounded-md mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
        {greeting}
      </h1>

      {/* Category Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.label
                ? "bg-spotify-green text-black"
                : "bg-spotify-gray text-white hover:bg-spotify-gray/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Category Songs */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          {activeCategory}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {(categorySongs[activeCategory] || []).slice(0, 12).map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              songs={categorySongs[activeCategory]}
              index={i}
            />
          ))}
          {!categorySongs[activeCategory] &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>

      {/* Trending Songs */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Popular Right Now
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {songs.slice(0, 12).map((song, i) => (
              <SongCard key={song.id} song={song} songs={songs} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Albums */}
      {albums.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Top Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {albums.slice(0, 6).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Featured Playlists
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {playlists.slice(0, 6).map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-spotify-light-gray text-xs">
        <p className="mb-1">
          All copyrights reserved to cantarellabots and its affiliated parties.
        </p>
        <p>
          Powered by{" "}
          <span className="text-spotify-green font-semibold">Spotify Music</span>
        </p>
      </footer>
    </div>
  );
}
