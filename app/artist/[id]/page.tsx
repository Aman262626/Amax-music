"use client";

import { useEffect, useState, useCallback } from "react";
import SafeImage from "@/components/SafeImage";
import SongRow from "@/components/SongRow";
import AlbumCard from "@/components/AlbumCard";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Artist } from "@/lib/types";
import { IoPlay, IoShuffle } from "react-icons/io5";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { formatCount } from "@/lib/utils";

export default function ArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { playQueue } = usePlayer();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSongs, setShowAllSongs] = useState(false);

  useEffect(() => {
    fetch(`/api/artists/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setArtist(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = useCallback(() => {
    if (artist?.topSongs && artist.topSongs.length > 0) {
      playQueue(artist.topSongs);
    }
  }, [artist, playQueue]);

  const handleShufflePlay = useCallback(() => {
    if (artist?.topSongs && artist.topSongs.length > 0) {
      const shuffled = [...artist.topSongs].sort(() => Math.random() - 0.5);
      playQueue(shuffled);
    }
  }, [artist, playQueue]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="skeleton w-48 h-48 rounded-full mx-auto mb-4" />
        <div className="skeleton h-8 w-48 mx-auto mb-2" />
        <div className="skeleton h-4 w-32 mx-auto" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-8 text-center">
        <p className="text-spotify-light-gray text-lg">Artist not found</p>
      </div>
    );
  }

  const displaySongs = showAllSongs
    ? artist.topSongs || []
    : (artist.topSongs || []).slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 sm:h-80 gradient-mesh-alt">
        {artist.image && (
          <SafeImage
            src={artist.image}
            alt={artist.name}
            fill
            className="object-cover opacity-30"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-2">
            {artist.isVerified && (
              <IoMdCheckmarkCircle className="text-blue-400 text-xl" />
            )}
            <span className="text-white text-xs">Verified Artist</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-2">
            {artist.name}
          </h1>
          {artist.followerCount && (
            <p className="text-spotify-light-gray text-sm">
              {formatCount(artist.followerCount)} followers
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-4 py-4">
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
      </div>

      {/* Popular songs */}
      {artist.topSongs && artist.topSongs.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Popular</h2>
          {displaySongs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              songs={artist.topSongs}
              showAlbum={false}
            />
          ))}
          {(artist.topSongs?.length || 0) > 5 && (
            <button
              onClick={() => setShowAllSongs(!showAllSongs)}
              className="text-spotify-light-gray hover:text-white text-sm font-bold mt-2 transition-colors"
            >
              {showAllSongs ? "Show Less" : "See More"}
            </button>
          )}
        </section>
      )}

      {/* Albums */}
      {artist.topAlbums && artist.topAlbums.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {artist.topAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Bio */}
      {artist.bio && (
        <section className="px-4 sm:px-6 lg:px-8 pb-8">
          <h2 className="text-xl font-bold text-white mb-3">About</h2>
          <div className="glass rounded-xl p-4">
            <p className="text-spotify-light-gray text-sm leading-relaxed">
              {artist.bio}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
