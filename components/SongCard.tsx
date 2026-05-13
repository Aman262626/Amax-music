"use client";

import SafeImage from "./SafeImage";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song } from "@/lib/types";
import { IoPlay } from "react-icons/io5";
import AudioVisualizer from "./AudioVisualizer";
import GenreTag from "./GenreTag";
import { formatDuration, formatCount } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  songs?: Song[];
}

export default function SongCard({ song, songs }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <button
      onClick={() => playSong(song, songs)}
      className="group glass-card holo-card rounded-xl p-3 sm:p-4 text-left w-full"
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-lg album-art-3d">
        <SafeImage
          src={song.image}
          alt={song.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          {isActive && isPlaying ? (
            <div className="bg-spotify-green rounded-full w-10 h-10 flex items-center justify-center shadow-lg glow-green">
              <AudioVisualizer size="small" />
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-spotify-green rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <IoPlay className="text-black text-lg ml-0.5" />
            </div>
          )}
        </div>
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-spotify-green rounded-full pulse-glow" />
          </div>
        )}
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium backdrop-blur-sm">
            {formatDuration(song.duration)}
          </span>
        </div>
        {/* Genre tag */}
        {song.language && (
          <div className="absolute top-2 left-2">
            <GenreTag language={song.language} />
          </div>
        )}
      </div>
      <p className={`text-sm font-medium truncate ${isActive ? "gradient-text-holo" : "text-white"}`}>
        {song.name}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-spotify-light-gray text-xs truncate flex-1">
          {song.artist}
        </p>
        {song.playCount && (
          <span className="text-spotify-light-gray/60 text-[10px] ml-1 flex-shrink-0">
            {formatCount(song.playCount)} plays
          </span>
        )}
      </div>
    </button>
  );
}
