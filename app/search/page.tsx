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
import { IoMusicalNotes, IoDisc, IoPerson, IoList, IoSearch, IoMic, IoMicOff, IoPlay, IoShuffle } from "react-icons/io5";
import { MdLyrics } from "react-icons/md";
import SearchHistory, { addSearchHistory } from "@/components/SearchHistory";
import { usePlayer } from "@/contexts/PlayerContext";

type TabType = "all" | "songs" | "albums" | "artists" | "playlists" | "lyrics";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: IoMusicalNotes },
  { key: "songs", label: "Songs", icon: IoMusicalNotes },
  { key: "lyrics", label: "Lyrics", icon: MdLyrics },
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

function SearchInput({ urlQuery, router, onSearch }: { urlQuery: string; router: ReturnType<typeof useRouter>; onSearch: (q: string) => void }) {
  const [inputValue, setInputValue] = useState(urlQuery);
  const [isListening, setIsListening] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    // Only sync from URL if user isn't actively typing
    if (!isTypingRef.current) {
      setInputValue(urlQuery);
    }
  }, [urlQuery]);

  const handleChange = useCallback(
    (val: string) => {
      setInputValue(val);
      isTypingRef.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        isTypingRef.current = false;
        const trimmed = val.trim();
        if (trimmed) {
          onSearch(trimmed);
          router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
        }
      }, 500);
    },
    [router, onSearch]
  );

  const toggleVoiceSearch = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInputValue(transcript);
      if (event.results[0].isFinal) {
        router.push(`/search?q=${encodeURIComponent(transcript.trim())}`);
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }, [isListening, router]);

  return (
    <div className="relative max-w-lg w-full">
      <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-light-gray text-lg" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && inputValue.trim()) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            isTypingRef.current = false;
            onSearch(inputValue.trim());
            router.replace(`/search?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
          }
        }}
        placeholder="Search songs, lyrics, albums, artists..."
        className="w-full pl-10 pr-12 py-3 glass rounded-xl text-white text-sm placeholder-spotify-light-gray focus:outline-none focus:ring-2 focus:ring-spotify-green/30 focus:bg-white/[0.07] transition-all"
        autoFocus
      />
      {inputValue && (
        <button
          onClick={() => { setInputValue(""); isTypingRef.current = false; router.push("/search"); }}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-spotify-light-gray hover:text-white text-sm"
        >
          &times;
        </button>
      )}
      <button onClick={toggleVoiceSearch} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors">
        {isListening ? (
          <IoMicOff className="text-red-500 animate-pulse" />
        ) : (
          <IoMic className="text-spotify-light-gray hover:text-spotify-green cursor-pointer" />
        )}
      </button>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playQueue } = usePlayer();
  const urlQuery = searchParams.get("q") || "";
  const [tab, setTab] = useState<TabType>("all");
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [lyricsSongs, setLyricsSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const doSearch = useCallback(async (q: string, searchTab?: TabType) => {
    if (!q.trim()) {
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      setPlaylists([]);
      setLyricsSongs([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setPage(1);
    setHasMore(false);
    addSearchHistory(q);
    try {
      const activeTab = searchTab || tab;
      if (activeTab === "lyrics") {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=lyrics`);
        const data = await res.json();
        setLyricsSongs(data.songs || []);
      } else {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const newSongs = data.songs || [];
        setSongs(newSongs);
        setAlbums(data.albums || []);
        setArtists(data.artists || []);
        setPlaylists(data.playlists || []);
        setHasMore(newSongs.length >= 10);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [tab]);

  const loadMore = useCallback(async () => {
    if (!urlQuery || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(urlQuery)}&type=songs&page=${nextPage}`);
      const data = await res.json();
      const moreSongs = (data.songs || []) as Song[];
      if (moreSongs.length > 0) {
        setSongs((prev) => {
          const ids = new Set(prev.map((s) => s.id));
          return [...prev, ...moreSongs.filter((s) => !ids.has(s.id))];
        });
        setPage(nextPage);
        setHasMore(moreSongs.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [urlQuery, page, loadingMore]);

  // Search triggered by URL (initial load, category click, history click)
  const lastSearchedRef = useRef("");
  useEffect(() => {
    if (urlQuery && urlQuery !== lastSearchedRef.current) {
      lastSearchedRef.current = urlQuery;
      doSearch(urlQuery);
    }
    if (!urlQuery) {
      lastSearchedRef.current = "";
      doSearch("");
    }
  }, [urlQuery, doSearch]);

  // Direct search callback for SearchInput (avoids URL sync delay)
  const handleDirectSearch = useCallback((q: string) => {
    lastSearchedRef.current = q;
    doSearch(q);
  }, [doSearch]);

  const handleCategoryClick = useCallback(
    (query: string) => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    },
    [router]
  );

  const handleTabChange = useCallback((newTab: TabType) => {
    setTab(newTab);
    if (newTab === "lyrics" && urlQuery && lyricsSongs.length === 0) {
      doSearch(urlQuery, "lyrics");
    }
  }, [urlQuery, lyricsSongs.length, doSearch]);

  const hasResults =
    songs.length > 0 ||
    albums.length > 0 ||
    artists.length > 0 ||
    playlists.length > 0 ||
    lyricsSongs.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Search header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Search
        </h1>
        <SearchInput urlQuery={urlQuery} router={router} onSearch={handleDirectSearch} />
      </div>

      {/* Search History */}
      {!searched && (
        <SearchHistory
          onSelect={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
        />
      )}

      {/* Browse categories when no search */}
      {!searched && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Browse All</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {BROWSE_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.query)}
                className={`relative h-28 sm:h-36 rounded-xl overflow-hidden bg-gradient-to-br ${cat.gradient} p-4 text-left hover:scale-[1.02] transition-all shadow-lg hover-lift group`}
              >
                <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                  {cat.label}
                </span>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IoSearch className="text-white/50 text-xl" />
                </div>
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
                onClick={() => handleTabChange(t.key)}
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

          {/* Result count */}
          {!loading && hasResults && (
            <p className="text-spotify-light-gray text-xs mb-4">
              {tab === "lyrics"
                ? `${lyricsSongs.length} result${lyricsSongs.length !== 1 ? "s" : ""}`
                : `${songs.length} song${songs.length !== 1 ? "s" : ""}${albums.length > 0 ? `, ${albums.length} album${albums.length !== 1 ? "s" : ""}` : ""}${artists.length > 0 ? `, ${artists.length} artist${artists.length !== 1 ? "s" : ""}` : ""}`}
            </p>
          )}

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
                  <div className="flex items-center justify-between mb-3">
                    {tab === "all" && (
                      <h2 className="text-xl font-bold text-white">Songs</h2>
                    )}
                    {songs.length > 1 && (
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={() => playQueue(songs, 0)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-spotify-green/20 text-spotify-green text-xs font-medium hover:bg-spotify-green/30 transition-colors"
                        >
                          <IoPlay className="text-sm" /> Play All
                        </button>
                        <button
                          onClick={() => {
                            const shuffled = [...songs].sort(() => Math.random() - 0.5);
                            playQueue(shuffled, 0);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-white text-xs font-medium hover:bg-white/10 transition-colors"
                        >
                          <IoShuffle className="text-sm" /> Shuffle
                        </button>
                      </div>
                    )}
                  </div>
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
                      {hasMore && (
                        <button
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="w-full mt-4 py-3 glass rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loadingMore ? (
                            <div className="w-4 h-4 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Load More Songs"
                          )}
                        </button>
                      )}
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

              {/* Lyrics search results */}
              {tab === "lyrics" && lyricsSongs.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-1">Lyrics Results</h2>
                  <p className="text-spotify-light-gray text-xs mb-3">Songs matching lyrics: &ldquo;{urlQuery}&rdquo;</p>
                  <div>
                    {lyricsSongs.map((song, i) => (
                      <SongRow key={song.id} song={song} index={i} songs={lyricsSongs} />
                    ))}
                  </div>
                </section>
              )}

              {tab === "lyrics" && lyricsSongs.length === 0 && !loading && (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">🎤</p>
                  <p className="text-white text-lg font-semibold mb-2">
                    No lyrics match for &ldquo;{urlQuery}&rdquo;
                  </p>
                  <p className="text-spotify-light-gray text-sm">
                    Try typing a line from the song you&apos;re looking for.
                  </p>
                </div>
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
