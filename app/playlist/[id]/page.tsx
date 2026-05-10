"use client";

import { useEffect, useState, useCallback, use } from "react";
import Image from "next/image";
import SongRow from "@/components/SongRow";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Playlist } from "@/lib/types";
import { IoPlay, IoShuffle, IoCloudDownload } from "react-icons/io5";
import { formatCount, getBestDownloadUrl } from "@/lib/utils";

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { playQueue } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/playlists/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setPlaylist(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = useCallback(() => {
    if (playlist?.songs && playlist.songs.length > 0) {
      playQueue(playlist.songs);
    }
  }, [playlist, playQueue]);

  const handleShufflePlay = useCallback(() => {
    if (playlist?.songs && playlist.songs.length > 0) {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      playQueue(shuffled);
    }
  }, [playlist, playQueue]);

  const handleDownloadAll = useCallback(() => {
    if (!playlist?.songs) return;
    playlist.songs.forEach((song, i) => {
      setTimeout(() => {
        const url = getBestDownloadUrl(song.downloadUrl);
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = `${song.name} - ${song.artist}.mp3`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 500);
    });
  }, [playlist]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="skeleton w-48 h-48 rounded-lg" />
          <div className="flex-1">
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-8 w-60 mb-2" />
            <div className="skeleton h-4 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-8 text-center">
        <p className="text-spotify-light-gray text-lg">Playlist not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
            <Image
              src={playlist.image}
              alt={playlist.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-white text-xs uppercase tracking-wider mb-1">
              Playlist
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-spotify-light-gray text-sm mb-1 line-clamp-2">
                {playlist.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1 text-sm text-spotify-light-gray justify-center sm:justify-start">
              {playlist.username && (
                <span className="text-white font-semibold">
                  {playlist.username}
                </span>
              )}
              {playlist.followerCount && (
                <span>• {formatCount(playlist.followerCount)} likes</span>
              )}
              {playlist.songCount && (
                <span>
                  • {playlist.songCount} song
                  {playlist.songCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-4 mb-4">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          <IoPlay className="text-black text-2xl ml-1" />
        </button>
        <button
          onClick={handleShufflePlay}
          className="text-spotify-light-gray hover:text-white transition-colors"
        >
          <IoShuffle className="text-3xl" />
        </button>
        <button
          onClick={handleDownloadAll}
          className="text-spotify-light-gray hover:text-white transition-colors"
          title="Download All"
        >
          <IoCloudDownload className="text-2xl" />
        </button>
      </div>

      {/* Song list */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {playlist.songs?.map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            index={i}
            songs={playlist.songs}
          />
        ))}
      </div>
    </div>
  );
}
