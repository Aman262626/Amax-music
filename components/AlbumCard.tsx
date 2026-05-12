"use client";

import SafeImage from "./SafeImage";
import Link from "next/link";
import type { Album } from "@/lib/types";
import { IoDisc } from "react-icons/io5";

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/album/${album.id}`}
      className="group glass-card holo-card rounded-xl p-3 sm:p-4 block hover-lift"
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-lg album-art-3d">
        <SafeImage
          src={album.image}
          alt={album.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
          <div className="flex items-center gap-1">
            <IoDisc className="text-white/80 text-xs" />
            {album.songCount && (
              <span className="text-white/80 text-[10px]">{album.songCount} songs</span>
            )}
          </div>
          {album.year && (
            <span className="text-white/60 text-[10px]">{album.year}</span>
          )}
        </div>
        {album.language && (
          <div className="absolute top-2 left-2">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white/90 bg-black/50 backdrop-blur-sm uppercase tracking-wider">
              {album.language}
            </span>
          </div>
        )}
      </div>
      <p className="text-white text-sm font-medium truncate">{album.name}</p>
      <p className="text-spotify-light-gray text-xs truncate mt-0.5">
        {album.artist || "Album"}
      </p>
    </Link>
  );
}
