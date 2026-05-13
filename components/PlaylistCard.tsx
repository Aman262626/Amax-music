"use client";

import SafeImage from "./SafeImage";
import Link from "next/link";
import type { Playlist } from "@/lib/types";
import { formatCount } from "@/lib/utils";
import { IoMusicalNotes, IoPeople } from "react-icons/io5";

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group glass-card holo-card rounded-xl p-3 sm:p-4 block hover-lift"
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-lg album-art-3d">
        <SafeImage
          src={playlist.image}
          alt={playlist.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <div className="flex items-center gap-3 w-full">
            {playlist.songCount && (
              <div className="flex items-center gap-1">
                <IoMusicalNotes className="text-white/80 text-xs" />
                <span className="text-white/80 text-[10px]">{playlist.songCount}</span>
              </div>
            )}
            {playlist.followerCount && (
              <div className="flex items-center gap-1">
                <IoPeople className="text-white/80 text-xs" />
                <span className="text-white/80 text-[10px]">{formatCount(playlist.followerCount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
      <p className="text-spotify-light-gray text-xs truncate mt-0.5 line-clamp-2">
        {playlist.description || playlist.username || "Playlist"}
      </p>
    </Link>
  );
}
