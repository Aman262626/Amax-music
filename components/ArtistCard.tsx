"use client";

import Image from "next/image";
import Link from "next/link";
import type { Artist } from "@/lib/types";

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artist/${artist.id}`}
      className="group bg-spotify-dark-gray hover:bg-spotify-card-hover rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer block"
    >
      <div className="relative aspect-square rounded-full overflow-hidden mb-3 shadow-lg mx-auto">
        <Image
          src={artist.image}
          alt={artist.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <p className="text-white text-sm font-semibold truncate text-center mb-1">
        {artist.name}
      </p>
      <p className="text-spotify-light-gray text-xs truncate text-center">
        Artist
      </p>
    </Link>
  );
}
