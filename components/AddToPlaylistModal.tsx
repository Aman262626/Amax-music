"use client";

import { useState, useEffect, useCallback } from "react";
import type { Song } from "@/lib/types";
import { getLocalPlaylists, createPlaylist, addSongToPlaylist } from "@/lib/playlists";
import type { LocalPlaylist } from "@/lib/playlists";
import { useToast } from "./Toast";
import { IoClose, IoAdd, IoMusicalNotes } from "react-icons/io5";

interface AddToPlaylistModalProps {
  song: Song;
  onClose: () => void;
}

export default function AddToPlaylistModal({ song, onClose }: AddToPlaylistModalProps) {
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState<LocalPlaylist[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setPlaylists(getLocalPlaylists());
  }, []);

  const handleAdd = useCallback((playlistId: string, playlistName: string) => {
    addSongToPlaylist(playlistId, song);
    showToast(`Added to "${playlistName}"`, "success");
    onClose();
  }, [song, showToast, onClose]);

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    const pl = createPlaylist(newName.trim());
    addSongToPlaylist(pl.id, song);
    showToast(`Created "${pl.name}" and added song`, "success");
    onClose();
  }, [newName, song, showToast, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in" onClick={onClose}>
      <div className="glass-strong rounded-2xl p-6 max-w-sm w-full mx-4 scale-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Add to Playlist</h2>
          <button onClick={onClose} className="text-spotify-light-gray hover:text-white p-1">
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Song preview */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <IoMusicalNotes className="text-spotify-green" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{song.name}</p>
            <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
          </div>
        </div>

        {/* Create new playlist */}
        {showCreate ? (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              className="flex-1 px-3 py-2 glass rounded-lg text-white text-sm placeholder-spotify-light-gray focus:outline-none focus:ring-1 focus:ring-spotify-green/50"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-spotify-green rounded-lg text-black text-sm font-medium hover:scale-105 transition-transform"
            >
              Create
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 w-full px-3 py-3 glass rounded-xl text-white text-sm mb-3 hover:bg-white/10 transition-colors"
          >
            <IoAdd className="text-spotify-green text-xl" />
            Create New Playlist
          </button>
        )}

        {/* Existing playlists */}
        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => handleAdd(pl.id, pl.name)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
                  <IoMusicalNotes className="text-white text-xs" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{pl.name}</p>
                  <p className="text-spotify-light-gray text-xs">{pl.songs.length} songs</p>
                </div>
              </div>
              <IoAdd className="text-spotify-light-gray" />
            </button>
          ))}
          {playlists.length === 0 && !showCreate && (
            <p className="text-spotify-light-gray text-xs text-center py-4">No playlists yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
