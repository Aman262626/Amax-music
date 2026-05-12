"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SongCard from "@/components/SongCard";
import SongRow from "@/components/SongRow";
import AlbumCard from "@/components/AlbumCard";
import ArtistCard from "@/components/ArtistCard";
import PlaylistCard from "@/components/PlaylistCard";
import VideoPreviewScroll from "@/components/VideoPreviewScroll";
import type { Song, Album, Artist, Playlist } from "@/lib/types";
import { IoMusicalNotes, IoDisc, IoPerson, IoList, IoSearch } from "react-icons/io5";

type TabType = "all" | "songs" | "albums" | "artists" | "playlists";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: IoMusicalNotes },
  { key: "songs", label: "Songs", icon: IoMusicalNotes },
  { key: "albums", label: "Albums", icon: IoDisc },
  { key: "artists", label: "Artists", icon: IoPerson },
  { key: "playlists", label: "Playlists", icon: IoList },
];

const BROWSE_CATEGORIES = [
  { label: "Bollywood", gradient: "from-accent-pink to-accent-red", query: "bollywood" },
  { label: "Pop", gradient: "from-accent-blue to-accent-purple", query: "pop hits" },
  { label: "Hip Hop", gradient: "from-yellow-500 to-accent-orange", query: "hip hop" },
  { label: "Punjabi", gradient: "from-spotify-green to-accent-cyan", query: "punjabi" },
  { label: "Romantic", gradient: "from-accent-red to-accent-pink", query: "romantic" },
  { label: "Party", gradient: "from-accent-purple to-accent-pink", query: "party" },
  { label: "Devotional", gradient: "from-amber-500 to-yellow-600", query: "devotional" },
  { label: "Lofi", gradient: "from-accent-cyan to-accent-blue", query: "lofi" },
  { label: "Classical", gradient: "from-stone-400 to-neutral-600", query: "classical" },
  { label: "EDM", gradient: "from-fuchsia-500 to-accent-pink", query: "edm electronic" },
  { label: "Rock", gradient: "from-red-600 to-red-800", query: "rock" },
  { label: "Indie", gradient: "from-sky-500 to-accent-blue", query: "indie" },
];

function SearchInput({ urlQuery, router }: { urlQuery: string; router: ReturnType<typeof useRouter> }) {
  const [inputValue, setInputValue] = useState(urlQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  const handleChange = useCallback(
    (val: string) => {
      setInputValue(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (val.trim()) {
          router.push(`/search?q=${encodeURIComponent(val.trim())}`);
        }
      }, 400);
    },
    [router]
  );

  return (
    <div className="relative max-w-lg w-full">
      <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-light-gray text-lg" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search songs, albums, artists..."
        className="w-full pl-10 pr-4 py-3 glass rounded-xl text-white text-sm placeholder-spotify-light-gray focus:outline-none focus:ring-1 focus:ring-spotify-green/50 transition-all"
        autoFocus
      />
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get("q") || "";
  const [tab, setTab] = useState<TabType>("all");
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
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

  useEffect(() => {
    if (urlQuery) {
      doSearch(urlQuery);
    }
  }, [urlQuery, doSearch]);

  const handleCategoryClick = useCallback(
    (query: string) => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    },
    [router]
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
        <SearchInput urlQuery={urlQuery} router={router} />
      </div>

      {/* Browse categories when no search */}
      {!searched && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Browse All</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {BROWSE_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.query)}
                className={`relative h-28 sm:h-36 rounded-xl overflow-hidden bg-gradient-to-br ${cat.gradient} p-4 text-left hover:scale-[1.02] transition-all shadow-lg`}
              >
                <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.key
                    ? "bg-white text-black"
                    : "glass text-white hover:bg-white/10"
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
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-white text-lg font-semibold mb-2">
                No results found for &ldquo;{urlQuery}&rdquo;
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
                      {songs.slice(0, 6).map((song) => (
                        <SongCard key={song.id} song={song} songs={songs} />
                      ))}
                    </div>
                  ) : (
                    <div>
                      {songs.map((song, i) => (
                        <SongRow key={song.id} song={song} index={i} songs={songs} />
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
                    {albums.slice(0, tab === "all" ? 6 : albums.length).map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>
                </section>
              )}

              {/* Artists */}
              {(tab === "all" || tab === "artists") && artists.length > 0 && (
                <section className="mb-8">
                  {tab === "all" && (
                    <h2 className="text-xl font-bold text-white mb-3">Artists</h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {artists.slice(0, tab === "all" ? 6 : artists.length).map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              )}

              {/* Playlists */}
              {(tab === "all" || tab === "playlists") && playlists.length > 0 && (
                <section className="mb-8">
                  {tab === "all" && (
                    <h2 className="text-xl font-bold text-white mb-3">Playlists</h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {playlists.slice(0, tab === "all" ? 6 : playlists.length).map((pl) => (
                      <PlaylistCard key={pl.id} playlist={pl} />
                    ))}
                  </div>
                </section>
              )}

              {/* Video Previews for search results */}
              {tab === "all" && songs.length > 0 && (
                <VideoPreviewScroll songs={songs.slice(0, 8)} title="Video Results" />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
