"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import SongRow from "@/components/SongRow";
import AlbumCard from "@/components/AlbumCard";
import ArtistCard from "@/components/ArtistCard";
import PlaylistCard from "@/components/PlaylistCard";
import type { Song, Album, Artist, Playlist } from "@/lib/types";
import { IoMusicalNotes, IoDisc, IoPerson, IoList } from "react-icons/io5";

type TabType = "all" | "songs" | "albums" | "artists" | "playlists";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: IoMusicalNotes },
  { key: "songs", label: "Songs", icon: IoMusicalNotes },
  { key: "albums", label: "Albums", icon: IoDisc },
  { key: "artists", label: "Artists", icon: IoPerson },
  { key: "playlists", label: "Playlists", icon: IoList },
];

const BROWSE_CATEGORIES = [
  { label: "Bollywood", color: "from-pink-500 to-rose-600", query: "bollywood" },
  { label: "Pop", color: "from-indigo-500 to-blue-600", query: "pop hits" },
  { label: "Hip Hop", color: "from-yellow-600 to-orange-700", query: "hip hop" },
  { label: "Punjabi", color: "from-green-500 to-emerald-600", query: "punjabi" },
  { label: "Romantic", color: "from-red-500 to-pink-600", query: "romantic" },
  { label: "Party", color: "from-purple-500 to-violet-600", query: "party" },
  { label: "Devotional", color: "from-amber-500 to-yellow-600", query: "devotional" },
  { label: "Lofi", color: "from-teal-500 to-cyan-600", query: "lofi" },
  { label: "Classical", color: "from-stone-500 to-neutral-600", query: "classical" },
  { label: "EDM", color: "from-fuchsia-500 to-pink-600", query: "edm electronic" },
  { label: "Rock", color: "from-red-600 to-red-800", query: "rock" },
  { label: "Indie", color: "from-sky-500 to-blue-600", query: "indie" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabType>("all");
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      setPlaylists([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSongs(data.songs || []);
      setAlbums(data.albums || []);
      setArtists(data.artists || []);
      setPlaylists(data.playlists || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoryClick = useCallback(
    (categoryQuery: string) => {
      handleSearch(categoryQuery);
    },
    [handleSearch]
  );

  const hasResults =
    songs.length > 0 ||
    albums.length > 0 ||
    artists.length > 0 ||
    playlists.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Search header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Search
        </h1>
        <SearchBar
          onSearch={handleSearch}
          autoFocus
          initialValue={query}
        />
      </div>

      {/* Show browse categories when no search */}
      {!searched && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Browse All</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {BROWSE_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.query)}
                className={`relative h-28 sm:h-36 rounded-lg overflow-hidden bg-gradient-to-br ${cat.color} p-4 text-left hover:scale-[1.02] transition-transform`}
              >
                <span className="text-white font-bold text-base sm:text-lg">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Search results */}
      {searched && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? "bg-spotify-green text-black"
                    : "bg-spotify-gray text-white hover:bg-spotify-gray/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !hasResults ? (
            <div className="text-center py-20">
              <p className="text-spotify-light-gray text-lg mb-2">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-spotify-light-gray text-sm">
                Try different keywords or check the spelling.
              </p>
            </div>
          ) : (
            <>
              {/* Songs */}
              {(tab === "all" || tab === "songs") && songs.length > 0 && (
                <section className="mb-8">
                  {tab === "all" && (
                    <h2 className="text-xl font-bold text-white mb-3">Songs</h2>
                  )}
                  {tab === "all" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {songs.slice(0, 6).map((song, i) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          songs={songs}
                          index={i}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      {songs.map((song, i) => (
                        <SongRow
                          key={song.id}
                          song={song}
                          index={i}
                          songs={songs}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Albums */}
              {(tab === "all" || tab === "albums") && albums.length > 0 && (
                <section className="mb-8">
                  {tab === "all" && (
                    <h2 className="text-xl font-bold text-white mb-3">Albums</h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {albums
                      .slice(0, tab === "all" ? 6 : albums.length)
                      .map((album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                  </div>
                </section>
              )}

              {/* Artists */}
              {(tab === "all" || tab === "artists") && artists.length > 0 && (
                <section className="mb-8">
                  {tab === "all" && (
                    <h2 className="text-xl font-bold text-white mb-3">
                      Artists
                    </h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {artists
                      .slice(0, tab === "all" ? 6 : artists.length)
                      .map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                  </div>
                </section>
              )}

              {/* Playlists */}
              {(tab === "all" || tab === "playlists") &&
                playlists.length > 0 && (
                  <section className="mb-8">
                    {tab === "all" && (
                      <h2 className="text-xl font-bold text-white mb-3">
                        Playlists
                      </h2>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {playlists
                        .slice(0, tab === "all" ? 6 : playlists.length)
                        .map((pl) => (
                          <PlaylistCard key={pl.id} playlist={pl} />
                        ))}
                    </div>
                  </section>
                )}
            </>
          )}
        </>
      )}
    </div>
  );
}
