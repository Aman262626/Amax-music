import type { Song } from "./types";

export interface LocalPlaylist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt: number;
  updatedAt: number;
}

const PLAYLISTS_KEY = "amax_local_playlists";

function getPlaylists(): LocalPlaylist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlaylists(playlists: LocalPlaylist[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch { /* storage full */ }
}

export function getLocalPlaylists(): LocalPlaylist[] {
  return getPlaylists();
}

export function createPlaylist(name: string, description?: string): LocalPlaylist {
  const playlist: LocalPlaylist = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    songs: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const playlists = getPlaylists();
  playlists.unshift(playlist);
  savePlaylists(playlists);
  return playlist;
}

export function addSongToPlaylist(playlistId: string, song: Song): LocalPlaylist | null {
  const playlists = getPlaylists();
  const idx = playlists.findIndex((p) => p.id === playlistId);
  if (idx === -1) return null;
  if (playlists[idx].songs.some((s) => s.id === song.id)) return playlists[idx];
  playlists[idx].songs.push(song);
  playlists[idx].updatedAt = Date.now();
  savePlaylists(playlists);
  return playlists[idx];
}

export function removeSongFromPlaylist(playlistId: string, songId: string): LocalPlaylist | null {
  const playlists = getPlaylists();
  const idx = playlists.findIndex((p) => p.id === playlistId);
  if (idx === -1) return null;
  playlists[idx].songs = playlists[idx].songs.filter((s) => s.id !== songId);
  playlists[idx].updatedAt = Date.now();
  savePlaylists(playlists);
  return playlists[idx];
}

export function deletePlaylist(playlistId: string): void {
  const playlists = getPlaylists().filter((p) => p.id !== playlistId);
  savePlaylists(playlists);
}

export function renamePlaylist(playlistId: string, name: string): LocalPlaylist | null {
  const playlists = getPlaylists();
  const idx = playlists.findIndex((p) => p.id === playlistId);
  if (idx === -1) return null;
  playlists[idx].name = name;
  playlists[idx].updatedAt = Date.now();
  savePlaylists(playlists);
  return playlists[idx];
}
