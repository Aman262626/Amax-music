"use client";

import SafeImage from "./SafeImage";
import Link from "next/link";
import type { Album } from "@/lib/types";

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/album/${album.id}`}
      className="group glass-card holo-card rounded-xl p-3 sm:p-4 block"
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-lg album-art-3d">
        <SafeImage
          src={album.image}
          alt={album.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-white text-sm font-medium truncate">{album.name}</p>
      <p className="text-spotify-light-gray text-xs truncate mt-0.5">
        {album.artist || "Album"}
      </p>
    </Link>
  );
}
