"use client";

import Image from "next/image";
import Link from "next/link";
import type { Playlist } from "@/lib/types";

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group bg-spotify-dark-gray hover:bg-spotify-card-hover rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer block"
    >
      <div className="relative aspect-square rounded-md overflow-hidden mb-3 shadow-lg">
        <Image
          src={playlist.image}
          alt={playlist.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <p className="text-white text-sm font-semibold truncate mb-1">
        {playlist.name}
      </p>
      <p className="text-spotify-light-gray text-xs truncate line-clamp-2">
        {playlist.description || `${playlist.songCount || 0} songs`}
      </p>
    </Link>
  );
}
