"use client";

import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song } from "@/lib/types";
import { IoPlay, IoPause } from "react-icons/io5";

interface SongCardProps {
  song: Song;
  songs?: Song[];
  index?: number;
}

export default function SongCard({ song, songs, index }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handleClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playSong(song, songs, index);
    }
  };

  return (
    <div className="group bg-spotify-dark-gray hover:bg-spotify-card-hover rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer relative">
      <div onClick={handleClick}>
        <div className="relative aspect-square rounded-md overflow-hidden mb-3 shadow-lg">
          <Image
            src={song.image}
            alt={song.name}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button
            className="absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {isActive && isPlaying ? (
              <IoPause className="text-black text-lg sm:text-xl" />
            ) : (
              <IoPlay className="text-black text-lg sm:text-xl ml-0.5" />
            )}
          </button>
        </div>

        <p
          className={`text-sm font-semibold truncate mb-1 ${
            isActive ? "text-spotify-green" : "text-white"
          }`}
        >
          {song.name}
        </p>
        <p className="text-spotify-light-gray text-xs truncate">
          {song.artist}
        </p>
      </div>
    </div>
  );
}
