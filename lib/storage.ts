import type { Song } from "./types";

const FAVORITES_KEY = "amax_favorites";
const HISTORY_KEY = "amax_history";
const QUALITY_KEY = "amax_quality";
const VOLUME_KEY = "amax_volume";
const THEME_KEY = "amax_theme";
const MAX_HISTORY = 100;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function getFavorites(): Song[] {
  return getItem<Song[]>(FAVORITES_KEY, []);
}

export function addFavorite(song: Song): Song[] {
  const favorites = getFavorites().filter((s) => s.id !== song.id);
  favorites.unshift(song);
  setItem(FAVORITES_KEY, favorites);
  return favorites;
}

export function removeFavorite(songId: string): Song[] {
  const favorites = getFavorites().filter((s) => s.id !== songId);
  setItem(FAVORITES_KEY, favorites);
  return favorites;
}

export function isFavorite(songId: string): boolean {
  return getFavorites().some((s) => s.id === songId);
}

export function getHistory(): Song[] {
  return getItem<Song[]>(HISTORY_KEY, []);
}

export function addToHistory(song: Song): Song[] {
  const history = getHistory().filter((s) => s.id !== song.id);
  history.unshift(song);
  if (history.length > MAX_HISTORY) history.pop();
  setItem(HISTORY_KEY, history);
  return history;
}

export function clearHistory(): void {
  setItem(HISTORY_KEY, []);
}

export function getPreferredQuality(): string {
  return getItem<string>(QUALITY_KEY, "320kbps");
}

export function setPreferredQuality(quality: string): void {
  setItem(QUALITY_KEY, quality);
}

export function getSavedVolume(): number {
  return getItem<number>(VOLUME_KEY, 0.8);
}

export function setSavedVolume(volume: number): void {
  setItem(VOLUME_KEY, volume);
}

export type ThemeAccent = "purple" | "blue" | "pink" | "green" | "orange" | "cyan";

export function getThemeAccent(): ThemeAccent {
  return getItem<ThemeAccent>(THEME_KEY, "purple");
}

export function setThemeAccent(accent: ThemeAccent): void {
  setItem(THEME_KEY, accent);
}
