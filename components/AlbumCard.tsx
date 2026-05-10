"use client";

import Image from "next/image";
import Link from "next/link";
import type { Album } from "@/lib/types";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/album/${album.id}`}
      className="group bg-spotify-dark-gray hover:bg-spotify-card-hover rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer block"
    >
      <div className="relative aspect-square rounded-md overflow-hidden mb-3 shadow-lg">
        <Image
          src={album.image}
          alt={album.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <p className="text-white text-sm font-semibold truncate mb-1">
        {album.name}
      </p>
      <p className="text-spotify-light-gray text-xs truncate">
        {album.year ? `${album.year} • ` : ""}
        {album.artist}
      </p>
    </Link>
  );
}
