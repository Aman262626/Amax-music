"use client";

import { useState, useEffect, useCallback } from "react";
import SongRow from "@/components/SongRow";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  getFavorites,
  getHistory,
  clearHistory,
  getPreferredQuality,
  setPreferredQuality,
} from "@/lib/storage";
import type { Song } from "@/lib/types";
import {
  IoHeart,
  IoTime,
  IoSettings,
  IoPlay,
  IoShuffle,
  IoTrash,
} from "react-icons/io5";

type LibraryTab = "favorites" | "history" | "settings";

const QUALITY_OPTIONS = [
  { label: "Low (48 kbps)", value: "48kbps" },
  { label: "Normal (96 kbps)", value: "96kbps" },
  { label: "High (160 kbps)", value: "160kbps" },
  { label: "Very High (320 kbps)", value: "320kbps" },
];

export default function LibraryPage() {
  const { playQueue } = usePlayer();
  const [tab, setTab] = useState<LibraryTab>("favorites");
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [quality, setQuality] = useState("320kbps");

  useEffect(() => {
    setFavorites(getFavorites());
    setHistory(getHistory());
    setQuality(getPreferredQuality());
  }, []);

  const handlePlayAll = useCallback(
    (songs: Song[]) => {
      if (songs.length > 0) playQueue(songs);
    },
    [playQueue]
  );

  const handleShufflePlay = useCallback(
    (songs: Song[]) => {
      if (songs.length > 0) {
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        playQueue(shuffled);
      }
    },
    [playQueue]
  );

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const handleQualityChange = useCallback((value: string) => {
    setQuality(value);
    setPreferredQuality(value);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
        Your Library
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("favorites")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "favorites"
              ? "bg-spotify-green text-black"
              : "bg-spotify-gray text-white hover:bg-spotify-gray/80"
          }`}
        >
          <IoHeart /> Liked Songs
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "history"
              ? "bg-spotify-green text-black"
              : "bg-spotify-gray text-white hover:bg-spotify-gray/80"
          }`}
        >
          <IoTime /> History
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "settings"
              ? "bg-spotify-green text-black"
              : "bg-spotify-gray text-white hover:bg-spotify-gray/80"
          }`}
        >
          <IoSettings /> Settings
        </button>
      </div>

      {/* Favorites */}
      {tab === "favorites" && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-48 h-48 bg-gradient-to-br from-indigo-600 to-spotify-green rounded-lg flex items-center justify-center shadow-xl">
              <IoHeart className="text-white text-7xl" />
            </div>
            <div>
              <p className="text-spotify-light-gray text-xs uppercase tracking-wider">
                Playlist
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2">
                Liked Songs
              </h2>
              <p className="text-spotify-light-gray text-sm">
                {favorites.length} song{favorites.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => handlePlayAll(favorites)}
                className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                <IoPlay className="text-black text-xl ml-0.5" />
              </button>
              <button
                onClick={() => handleShufflePlay(favorites)}
                className="text-spotify-light-gray hover:text-white transition-colors"
              >
                <IoShuffle className="text-2xl" />
              </button>
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <IoHeart className="text-spotify-light-gray text-5xl mx-auto mb-4" />
              <p className="text-white text-lg font-semibold mb-2">
                Songs you like will appear here
              </p>
              <p className="text-spotify-light-gray text-sm">
                Save songs by tapping the heart icon.
              </p>
            </div>
          ) : (
            <div>
              {favorites.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  songs={favorites}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recently Played</h2>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 text-spotify-light-gray hover:text-white text-sm transition-colors"
              >
                <IoTrash /> Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16">
              <IoTime className="text-spotify-light-gray text-5xl mx-auto mb-4" />
              <p className="text-white text-lg font-semibold mb-2">
                No listening history yet
              </p>
              <p className="text-spotify-light-gray text-sm">
                Songs you play will appear here.
              </p>
            </div>
          ) : (
            <div>
              {history.map((song, i) => (
                <SongRow
                  key={`${song.id}-${i}`}
                  song={song}
                  index={i}
                  songs={history}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

          <div className="bg-spotify-gray rounded-lg p-4 mb-4">
            <h3 className="text-white font-semibold mb-3">Audio Quality</h3>
            <p className="text-spotify-light-gray text-sm mb-4">
              Higher quality uses more data. Download quality also follows this
              setting.
            </p>
            <div className="flex flex-col gap-2">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleQualityChange(opt.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    quality === opt.value
                      ? "bg-spotify-green/20 border border-spotify-green"
                      : "bg-spotify-dark-gray hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      quality === opt.value ? "text-spotify-green" : "text-white"
                    }`}
                  >
                    {opt.label}
                  </span>
                  {quality === opt.value && (
                    <div className="w-4 h-4 bg-spotify-green rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-spotify-gray rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">About</h3>
            <p className="text-spotify-light-gray text-sm mb-1">
              Spotify Music Player v1.0.0
            </p>
            <p className="text-spotify-light-gray text-xs">
              All copyrights reserved to cantarellabots and its affiliated parties.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
