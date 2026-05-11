"use client";

import { useEffect, useState, useCallback } from "react";
import SongCard from "@/components/SongCard";
import AlbumCard from "@/components/AlbumCard";
import PlaylistCard from "@/components/PlaylistCard";
import SongRow from "@/components/SongRow";
import SongPreviewScroll from "@/components/SongPreviewScroll";
import VideoPreviewScroll from "@/components/VideoPreviewScroll";
import { usePlayer } from "@/contexts/PlayerContext";
import { getHistory, getFavorites } from "@/lib/storage";
import type { Song, Album, Playlist } from "@/lib/types";
import { IoMusicalNotes, IoHappy, IoSad, IoFlame, IoMoon, IoCafe, IoFitness } from "react-icons/io5";

const MOODS = [
  { label: "Happy", icon: IoHappy, query: "happy upbeat bollywood songs", color: "from-yellow-400 to-orange-500" },
  { label: "Sad", icon: IoSad, query: "sad emotional hindi songs", color: "from-blue-400 to-indigo-600" },
  { label: "Party", icon: IoFlame, query: "party dance hindi songs", color: "from-red-500 to-pink-500" },
  { label: "Chill", icon: IoMoon, query: "chill lofi hindi songs", color: "from-purple-400 to-indigo-500" },
  { label: "Workout", icon: IoFitness, query: "workout gym motivation songs", color: "from-fuchsia-500 to-purple-600" },
  { label: "Focus", icon: IoCafe, query: "instrumental focus study music", color: "from-amber-400 to-orange-500" },
];

const CATEGORIES = [
  { label: "Trending", query: "trending hits", gradient: "from-accent-pink to-accent-red" },
  { label: "Bollywood", query: "bollywood hits", gradient: "from-accent-orange to-accent-pink" },
  { label: "Pop", query: "pop hits 2024", gradient: "from-accent-blue to-accent-purple" },
  { label: "Hip Hop", query: "hip hop rap", gradient: "from-yellow-500 to-accent-orange" },
  { label: "Punjabi", query: "punjabi hits", gradient: "from-fuchsia-500 to-accent-cyan" },
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
  const { playSong, playQueue } = usePlayer();
  const [greeting] = useState(getGreeting);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [categorySongs, setCategorySongs] = useState<Record<string, Song[]>>({});
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].label);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [previewSongs, setPreviewSongs] = useState<Song[]>([]);
  const [romanticSongs, setRomanticSongs] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [artistMix, setArtistMix] = useState<{ artist: string; songs: Song[] }>({ artist: "", songs: [] });
  const [discoverSongs, setDiscoverSongs] = useState<Song[]>([]);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const playMood = useCallback(async (label: string, query: string) => {
    setActiveMood(label);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=songs`);
      const data = await res.json();
      const moodSongs = (data.songs as Song[]) || [];
      if (moodSongs.length > 0) {
        const shuffled = moodSongs.sort(() => Math.random() - 0.5);
        playQueue(shuffled, 0);
      }
    } catch {
      // ignore
    }
  }, [playQueue]);

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

  const fetchRecommendations = useCallback(async () => {
    const history = getHistory();
    const favorites = getFavorites();
    const seeds = [...history.slice(0, 5), ...favorites.slice(0, 3)];
    if (seeds.length === 0) return;

    const seen = new Set(history.map((s) => s.id));
    const recs: Song[] = [];

    const seedIds = Array.from(new Set(seeds.map((s) => s.id))).slice(0, 3);
    const fetches = seedIds.map((id) =>
      fetch(`/api/songs/${id}/suggestions`)
        .then((r) => r.json())
        .then((d) => d.songs as Song[] || [])
        .catch(() => [] as Song[])
    );
    const results = await Promise.all(fetches);
    for (const songs of results) {
      for (const s of songs) {
        if (!seen.has(s.id)) {
          seen.add(s.id);
          recs.push(s);
        }
      }
    }
    setRecommendedSongs(recs.slice(0, 12));

    const artistCounts: Record<string, number> = {};
    for (const s of history.slice(0, 20)) {
      const name = s.artist.split(",")[0].trim();
      if (name) artistCounts[name] = (artistCounts[name] || 0) + 1;
    }
    const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topArtist) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(topArtist + " songs")}&type=songs`);
        const data = await res.json();
        const artistSongs = (data.songs as Song[] || []).filter((s: Song) => !seen.has(s.id));
        setArtistMix({ artist: topArtist, songs: artistSongs.slice(0, 10) });
      } catch { /* ignore */ }
    }
  }, []);

  const fetchDiscover = useCallback(async () => {
    const queries = [
      "latest hindi songs 2025", "new bollywood releases", "indie pop hindi",
      "punjabi new songs", "top english songs", "retro bollywood hits",
      "sufi songs", "desi hip hop", "ghazal hits", "classical fusion",
    ];
    const pick = queries[Math.floor(Math.random() * queries.length)];
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(pick)}&type=songs`);
      const data = await res.json();
      setDiscoverSongs(data.songs || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchTrending();
    fetchPreviewSongs();
    fetchRecommendations();
    fetchDiscover();
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

      {/* Mood Radio */}
      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
          <IoMusicalNotes className="text-spotify-green" />
          Mood Radio
        </h2>
        <p className="text-spotify-light-gray text-xs mb-3">Tap a mood to start playing</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              onClick={() => playMood(mood.label, mood.query)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105 ${
                activeMood === mood.label
                  ? `bg-gradient-to-br ${mood.color} shadow-lg`
                  : "glass hover:bg-white/10"
              }`}
            >
              <mood.icon className={`text-2xl ${activeMood === mood.label ? "text-white" : "text-white/70"}`} />
              <span className={`text-xs font-medium ${activeMood === mood.label ? "text-white" : "text-white/70"}`}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </section>

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

      {/* Recommended For You */}
      {recommendedSongs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">🎯 Recommended For You</h2>
          <p className="text-spotify-light-gray text-xs mb-4">Based on what you listen to</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {recommendedSongs.map((song) => (
              <SongCard key={`rec-${song.id}`} song={song} songs={recommendedSongs} />
            ))}
          </div>
        </section>
      )}

      {/* More from top artist */}
      {artistMix.songs.length > 0 && (
        <SongPreviewScroll songs={artistMix.songs} title={`More from ${artistMix.artist}`} />
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

      {/* Discover New */}
      {discoverSongs.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">🔀 Discover Something New</h2>
              <p className="text-spotify-light-gray text-xs">Fresh picks every time you visit</p>
            </div>
            <button
              onClick={fetchDiscover}
              className="px-3 py-1.5 glass rounded-full text-xs text-white/70 hover:text-white transition-colors"
            >
              Refresh ↻
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {discoverSongs.slice(0, 12).map((song) => (
              <SongCard key={`disc-${song.id}`} song={song} songs={discoverSongs} />
            ))}
          </div>
        </section>
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
