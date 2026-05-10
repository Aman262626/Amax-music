"use client";

import { useEffect, useState, useCallback } from "react";
import SongCard from "@/components/SongCard";
import AlbumCard from "@/components/AlbumCard";
import PlaylistCard from "@/components/PlaylistCard";
import SongRow from "@/components/SongRow";
import SongPreviewScroll from "@/components/SongPreviewScroll";
import VideoPreviewScroll from "@/components/VideoPreviewScroll";
import { getHistory } from "@/lib/storage";
import type { Song, Album, Playlist } from "@/lib/types";

const CATEGORIES = [
  { label: "Trending", query: "trending hits", gradient: "from-accent-pink to-accent-red" },
  { label: "Bollywood", query: "bollywood hits", gradient: "from-accent-orange to-accent-pink" },
  { label: "Pop", query: "pop hits 2024", gradient: "from-accent-blue to-accent-purple" },
  { label: "Hip Hop", query: "hip hop rap", gradient: "from-yellow-500 to-accent-orange" },
  { label: "Punjabi", query: "punjabi hits", gradient: "from-spotify-green to-accent-cyan" },
  { label: "Romantic", query: "romantic love songs", gradient: "from-accent-red to-accent-pink" },
  { label: "Party", query: "party dance songs", gradient: "from-accent-purple to-accent-pink" },
  { label: "Chill", query: "lofi chill", gradient: "from-accent-cyan to-accent-blue" },
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
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [previewSongs, setPreviewSongs] = useState<Song[]>([]);
  const [romanticSongs, setRomanticSongs] = useState<Song[]>([]);
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

  const fetchPreviewSongs = useCallback(async () => {
    try {
      const [newRes, romanticRes] = await Promise.all([
        fetch("/api/search?q=new releases&type=songs"),
        fetch("/api/search?q=romantic love songs hindi&type=songs"),
      ]);
      const newData = await newRes.json();
      const romanticData = await romanticRes.json();
      setPreviewSongs(newData.songs || []);
      setRomanticSongs(romanticData.songs || []);
    } catch {
      // silently fail
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
    fetchPreviewSongs();
    fetchCategory(CATEGORIES[0].label, CATEGORIES[0].query);
    setRecentlyPlayed(getHistory().slice(0, 8));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!categorySongs[activeCategory]) {
      const cat = CATEGORIES.find((c) => c.label === activeCategory);
      if (cat) fetchCategory(cat.label, cat.query);
    }
  }, [activeCategory, categorySongs, fetchCategory]);

  const SkeletonCard = () => (
    <div className="glass-card rounded-xl p-3 sm:p-4">
      <div className="aspect-square skeleton rounded-lg mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {greeting}
        </h1>
        <p className="text-spotify-light-gray text-sm">Discover music that moves you</p>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3">
            Recently Played
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {recentlyPlayed.map((song, i) => (
              <SongRow key={`recent-${song.id}-${i}`} song={song} index={i} songs={recentlyPlayed} showAlbum={false} />
            ))}
          </div>
        </section>
      )}

      {/* Preview Scroll - YouTube Music style */}
      <SongPreviewScroll songs={previewSongs} title="Quick Preview — New Releases" />

      {/* Category Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.label
                ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                : "glass text-white hover:bg-white/10"
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
          {(categorySongs[activeCategory] || []).slice(0, 12).map((song) => (
            <SongCard
              key={song.id}
              song={song}
              songs={categorySongs[activeCategory]}
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
            {songs.slice(0, 12).map((song) => (
              <SongCard key={song.id} song={song} songs={songs} />
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

      {/* Video Preview Scroll */}
      {songs.length > 0 && (
        <VideoPreviewScroll songs={songs.slice(0, 10)} title="Music Videos" />
      )}

      {/* More Sample Scrolls at bottom */}
      {romanticSongs.length > 0 && (
        <SongPreviewScroll songs={romanticSongs} title="Romantic Hits — Quick Listen" />
      )}

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="text-spotify-light-gray text-xs mb-1">
          All copyrights reserved to cantarellabots and its affiliated parties.
        </p>
        <p className="text-xs">
          Powered by{" "}
          <span className="gradient-text font-bold">AMAX Music</span>
        </p>
      </footer>
    </div>
  );
}
