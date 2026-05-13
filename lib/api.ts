import type { Song, Album, Playlist, Artist, DownloadUrl } from "./types";
import { decodeHtml, getBestImage } from "./utils";
import apiManager from "./apiManager";

async function saavnFetch(path: string, _init?: RequestInit): Promise<Response> {
  return apiManager.fetch(path, _init);
}

function mapSong(raw: Record<string, unknown>): Song {
  const artists = raw.artists as Record<string, unknown> | undefined;
  const primaryArtists = (artists?.primary as Record<string, unknown>[]) || [];
  const artistName =
    primaryArtists.map((a) => decodeHtml(a.name as string)).join(", ") ||
    decodeHtml((raw.artist as string) || "");
  const artistId = primaryArtists[0]?.id as string | undefined;
  const albumData = raw.album as Record<string, unknown> | undefined;

  return {
    id: raw.id as string,
    name: decodeHtml(raw.name as string),
    artist: artistName,
    artistId: artistId || undefined,
    album: decodeHtml((albumData?.name as string) || ""),
    albumId: (albumData?.id as string) || undefined,
    year: (raw.year as string) || (albumData?.year as string) || "",
    duration: parseInt(raw.duration as string, 10) || 0,
    image: getBestImage(raw.image as { quality: string; url: string }[]),
    imageHigh: getBestImage(raw.image as { quality: string; url: string }[]),
    url: (raw.url as string) || "",
    downloadUrl: (raw.downloadUrl as DownloadUrl[]) || [],
    hasLyrics: (raw.hasLyrics as boolean) || false,
    language: decodeHtml((raw.language as string) || ""),
    playCount: (raw.playCount as string) || "0",
  };
}

function mapAlbum(raw: Record<string, unknown>): Album {
  const artists = raw.artists as Record<string, unknown> | undefined;
  const primaryArtists = (artists?.primary as Record<string, unknown>[]) || [];
  const artistName =
    primaryArtists.map((a) => decodeHtml(a.name as string)).join(", ") ||
    decodeHtml((raw.artist as string) || "");

  return {
    id: raw.id as string,
    name: decodeHtml(raw.name as string),
    artist: artistName,
    image: getBestImage(raw.image as { quality: string; url: string }[]),
    year: (raw.year as string) || "",
    songCount: (raw.songCount as number) || 0,
    songs: ((raw.songs as Record<string, unknown>[]) || []).map(mapSong),
    language: decodeHtml((raw.language as string) || ""),
  };
}

function mapPlaylist(raw: Record<string, unknown>): Playlist {
  return {
    id: raw.id as string,
    name: decodeHtml(raw.name as string),
    description: decodeHtml((raw.description as string) || ""),
    image: getBestImage(raw.image as { quality: string; url: string }[]),
    songCount: (raw.songCount as number) || 0,
    songs: ((raw.songs as Record<string, unknown>[]) || []).map(mapSong),
    followerCount: (raw.followerCount as string) || "0",
    username: (raw.username as string) || "",
  };
}

function mapArtist(raw: Record<string, unknown>): Artist {
  return {
    id: raw.id as string,
    name: decodeHtml(raw.name as string),
    image: getBestImage(raw.image as { quality: string; url: string }[]),
    followerCount: (raw.followerCount as string) || "0",
    isVerified: (raw.isVerified as boolean) || false,
    bio: decodeHtml(
      (
        (raw.bio as { text: string; title: string; sequence: number }[]) || []
      )
        .map((b) => b.text)
        .join(" ")
    ),
    topSongs: ((raw.topSongs as Record<string, unknown>[]) || []).map(mapSong),
    topAlbums: ((raw.topAlbums as Record<string, unknown>[]) || []).map(
      mapAlbum
    ),
  };
}

export async function searchSongs(query: string, page = 1, limit = 20): Promise<Song[]> {
  const res = await saavnFetch(
    `/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } } as RequestInit
  );
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.data?.results as Record<string, unknown>[]) || []).map(mapSong);
}

export async function searchAlbums(query: string, page = 1, limit = 10): Promise<Album[]> {
  const res = await saavnFetch(
    `/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } } as RequestInit
  );
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.data?.results as Record<string, unknown>[]) || []).map(mapAlbum);
}

export async function searchArtists(query: string, page = 1, limit = 10): Promise<Artist[]> {
  const res = await saavnFetch(
    `/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } } as RequestInit
  );
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.data?.results as Record<string, unknown>[]) || []).map(mapArtist);
}

export async function searchPlaylists(query: string, page = 1, limit = 10): Promise<Playlist[]> {
  const res = await saavnFetch(
    `/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } } as RequestInit
  );
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.data?.results as Record<string, unknown>[]) || []).map(mapPlaylist);
}

export async function searchAll(query: string) {
  const [songs, albums, artists, playlists] = await Promise.all([
    searchSongs(query, 1, 10),
    searchAlbums(query, 1, 6),
    searchArtists(query, 1, 6),
    searchPlaylists(query, 1, 6),
  ]);
  return { songs, albums, artists, playlists };
}

export async function getSongById(id: string): Promise<Song | null> {
  const res = await saavnFetch(`/songs/${id}`, { next: { revalidate: 3600 } } as RequestInit);
  if (!res.ok) return null;
  const data = await res.json();
  const songs = (data.data as Record<string, unknown>[]) || [];
  return songs.length > 0 ? mapSong(songs[0]) : null;
}

export async function getSongLyrics(id: string): Promise<string | null> {
  const res = await saavnFetch(`/songs/${id}/lyrics`, { next: { revalidate: 86400 } } as RequestInit);
  if (!res.ok) return null;
  const data = await res.json();
  return (data.data?.lyrics as string) || null;
}

export async function getSongSuggestions(id: string, limit = 10): Promise<Song[]> {
  const res = await saavnFetch(`/songs/${id}/suggestions?limit=${limit}`, {
    next: { revalidate: 3600 },
  } as RequestInit);
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.data as Record<string, unknown>[]) || []).map(mapSong);
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const res = await saavnFetch(`/albums?id=${id}`, { next: { revalidate: 3600 } } as RequestInit);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data ? mapAlbum(data.data as Record<string, unknown>) : null;
}

export async function getPlaylistById(id: string): Promise<Playlist | null> {
  const res = await saavnFetch(`/playlists?id=${id}`, { next: { revalidate: 1800 } } as RequestInit);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data ? mapPlaylist(data.data as Record<string, unknown>) : null;
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const res = await saavnFetch(`/artists/${id}`, { next: { revalidate: 3600 } } as RequestInit);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data ? mapArtist(data.data as Record<string, unknown>) : null;
}

export async function getTrending(): Promise<{
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
}> {
  const [songs, albums, playlists] = await Promise.all([
    searchSongs("trending", 1, 20),
    searchAlbums("top", 1, 10),
    searchPlaylists("bollywood", 1, 10),
  ]);
  return { songs, albums, playlists };
}

export function getApiStatus() {
  return apiManager.getStatus();
}
