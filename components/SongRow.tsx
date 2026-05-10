"use client";

import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Song } from "@/lib/types";
import { formatDuration, getBestDownloadUrl } from "@/lib/utils";
import { IoPlay, IoPause, IoEllipsisHorizontal } from "react-icons/io5";
import { MdQueueMusic } from "react-icons/md";
import { IoMdDownload, IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useState, useCallback, useRef, useEffect } from "react";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/storage";

interface SongRowProps {
  song: Song;
  index: number;
  songs?: Song[];
  showAlbum?: boolean;
}

export default function SongRow({
  song,
  index,
  songs,
  showAlbum = true,
}: SongRowProps) {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } =
    usePlayer();
  const [liked, setLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = currentSong?.id === song.id;

  useEffect(() => {
    setLiked(isFavorite(song.id));
  }, [song.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      playSong(song, songs, index);
    }
  };

  const handleLike = useCallback(() => {
    if (liked) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
    setLiked(!liked);
  }, [song, liked]);

  const handleDownload = useCallback(() => {
    const url = getBestDownloadUrl(song.downloadUrl);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${song.name} - ${song.artist}.mp3`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [song]);

  return (
    <div
      className={`group grid gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors items-center ${
        showAlbum
          ? "grid-cols-[16px_minmax(0,4fr)_minmax(0,2fr)_minmax(0,1fr)]"
          : "grid-cols-[16px_minmax(0,4fr)_minmax(0,1fr)]"
      }`}
    >
      {/* Number / Play */}
      <div className="flex items-center justify-center">
        <span
          className={`text-sm group-hover:hidden ${
            isActive ? "text-spotify-green" : "text-spotify-light-gray"
          }`}
        >
          {index + 1}
        </span>
        <button
          onClick={handlePlay}
          className="hidden group-hover:block text-white"
        >
          {isActive && isPlaying ? (
            <IoPause className="text-sm" />
          ) : (
            <IoPlay className="text-sm" />
          )}
        </button>
      </div>

      {/* Song info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
          <Image
            src={song.image}
            alt={song.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate cursor-pointer ${
              isActive ? "text-spotify-green" : "text-white"
            }`}
            onClick={handlePlay}
          >
            {song.name}
          </p>
          <p className="text-spotify-light-gray text-xs truncate">
            {song.artist}
          </p>
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <p className="text-spotify-light-gray text-sm truncate hidden sm:block">
          {song.album}
        </p>
      )}

      {/* Duration & actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleLike}
          className={`opacity-0 group-hover:opacity-100 transition-opacity ${
            liked ? "opacity-100" : ""
          }`}
        >
          {liked ? (
            <IoMdHeart className="text-spotify-green text-lg" />
          ) : (
            <IoMdHeartEmpty className="text-spotify-light-gray text-lg hover:text-white" />
          )}
        </button>
        <span className="text-spotify-light-gray text-sm">
          {formatDuration(song.duration)}
        </span>

        {/* More menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 text-spotify-light-gray hover:text-white transition-opacity"
          >
            <IoEllipsisHorizontal className="text-lg" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-spotify-gray rounded-md shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  addToQueue(song);
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <MdQueueMusic className="text-lg" />
                Add to Queue
              </button>
              <button
                onClick={() => {
                  handleDownload();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <IoMdDownload className="text-lg" />
                Download
              </button>
              <button
                onClick={() => {
                  handleLike();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                {liked ? (
                  <>
                    <IoMdHeart className="text-lg text-spotify-green" />
                    Remove from Liked
                  </>
                ) : (
                  <>
                    <IoMdHeartEmpty className="text-lg" />
                    Add to Liked Songs
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
