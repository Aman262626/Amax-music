"use client";

import SafeImage from "./SafeImage";
import Link from "next/link";
import type { Artist } from "@/lib/types";

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artist/${artist.id}`}
      className="group glass-card rounded-xl p-3 sm:p-4 block text-center"
    >
      <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 shadow-lg mx-auto">
        <SafeImage
          src={artist.image}
          alt={artist.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
      </div>
      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
      <p className="text-spotify-light-gray text-xs mt-0.5">Artist</p>
    </Link>
  );
}
