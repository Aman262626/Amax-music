"use client";

import { useEffect, useState, useCallback, use } from "react";
import SafeImage from "@/components/SafeImage";
import SongRow from "@/components/SongRow";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Album } from "@/lib/types";
import { IoPlay, IoShuffle, IoCloudDownload } from "react-icons/io5";
import { getBestDownloadUrl } from "@/lib/utils";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { playQueue } = usePlayer();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/albums/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setAlbum(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = useCallback(() => {
    if (album?.songs && album.songs.length > 0) {
      playQueue(album.songs);
    }
  }, [album, playQueue]);

  const handleShufflePlay = useCallback(() => {
    if (album?.songs && album.songs.length > 0) {
      const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
      playQueue(shuffled);
    }
  }, [album, playQueue]);

  const handleDownloadAll = useCallback(() => {
    if (!album?.songs) return;
    album.songs.forEach((song, i) => {
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
  }, [album]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="skeleton w-48 h-48 rounded-xl" />
          <div className="flex-1">
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-8 w-60 mb-2" />
            <div className="skeleton h-4 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-8 text-center">
        <p className="text-spotify-light-gray text-lg">Album not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with blurred album backdrop */}
      <div className="relative p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div
          className="song-backdrop"
          style={{ background: `url(${album.image}) center/cover no-repeat` }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
            <SafeImage
              src={album.image}
              alt={album.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-white text-xs uppercase tracking-widest mb-1">
              Album
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-lg">
              {album.name}
            </h1>
            <div className="flex flex-wrap items-center gap-1 text-sm text-spotify-light-gray justify-center sm:justify-start">
              <span className="text-white font-semibold">{album.artist}</span>
              {album.year && <span>• {album.year}</span>}
              {album.songCount && (
                <span>
                  • {album.songCount} song{album.songCount > 1 ? "s" : ""}
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
          className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg glow-green"
        >
          <IoPlay className="text-black text-2xl ml-1" />
        </button>
        <button
          onClick={handleShufflePlay}
          className="text-spotify-light-gray hover:text-white hover:scale-110 transition-all"
        >
          <IoShuffle className="text-3xl" />
        </button>
        <button
          onClick={handleDownloadAll}
          className="text-spotify-light-gray hover:text-white hover:scale-110 transition-all"
          title="Download All"
        >
          <IoCloudDownload className="text-2xl" />
        </button>
      </div>

      {/* Song list */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {album.songs?.map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            index={i}
            songs={album.songs}
            showAlbum={false}
          />
        ))}
      </div>
    </div>
  );
}
