"use client";

import { useState, useCallback } from "react";
import SafeImage from "./SafeImage";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration, getBestDownloadUrl } from "@/lib/utils";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/storage";
import type { Song } from "@/lib/types";
import {
  IoPlay,
  IoCloudDownload,
  IoEllipsisHorizontal,
  IoShareSocial,
} from "react-icons/io5";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { MdPlaylistAdd } from "react-icons/md";
import AudioVisualizer from "./AudioVisualizer";

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
  const { playSong, addToQueue, currentSong, isPlaying } = usePlayer();
  const [liked, setLiked] = useState(isFavorite(song.id));
  const [showMenu, setShowMenu] = useState(false);

  const isActive = currentSong?.id === song.id;

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (liked) {
        removeFavorite(song.id);
      } else {
        addFavorite(song);
      }
      setLiked(!liked);
    },
    [song, liked]
  );

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
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
      setShowMenu(false);
    },
    [song]
  );

  const handleAddToQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addToQueue(song);
      setShowMenu(false);
    },
    [song, addToQueue]
  );

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.share) {
        navigator.share({
          title: song.name,
          text: `Listen to ${song.name} by ${song.artist} on AMAX Music`,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${song.name} - ${song.artist}`).catch(() => {});
      }
      setShowMenu(false);
    },
    [song]
  );

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-white/5 ${
        isActive ? "bg-white/5" : ""
      }`}
      onClick={() => playSong(song, songs, index)}
    >
      {/* Number / Play */}
      <div className="w-8 text-center flex-shrink-0">
        {isActive && isPlaying ? (
          <AudioVisualizer size="small" />
        ) : (
          <>
            <span
              className={`group-hover:hidden text-sm ${
                isActive ? "text-spotify-green" : "text-spotify-light-gray"
              }`}
            >
              {index + 1}
            </span>
            <IoPlay className="hidden group-hover:block text-white text-sm mx-auto" />
          </>
        )}
      </div>

      {/* Image */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow">
        <SafeImage
          src={song.image}
          alt={song.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? "text-spotify-green" : "text-white"
          }`}
        >
          {song.name}
        </p>
        <p className="text-spotify-light-gray text-xs truncate">
          {song.artist}
        </p>
      </div>

      {/* Album name */}
      {showAlbum && song.album && (
        <p className="text-spotify-light-gray text-sm truncate hidden sm:block max-w-[150px]">
          {song.album}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleLike}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {liked ? (
            <IoMdHeart className="text-accent-pink text-lg" />
          ) : (
            <IoMdHeartEmpty className="text-spotify-light-gray text-lg hover:text-white" />
          )}
        </button>
        <span className="text-spotify-light-gray text-xs min-w-[35px] text-right">
          {formatDuration(song.duration)}
        </span>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 text-spotify-light-gray hover:text-white transition-all p-1"
          >
            <IoEllipsisHorizontal className="text-lg" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 glass-strong rounded-xl py-1 min-w-[160px] z-20 fade-in shadow-xl">
              <button
                onClick={handleAddToQueue}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 transition-colors"
              >
                <MdPlaylistAdd className="text-lg" />
                Add to Queue
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 transition-colors"
              >
                <IoCloudDownload className="text-lg" />
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 transition-colors"
              >
                <IoShareSocial className="text-lg" />
                Share
              </button>
              <button
                onClick={handleLike}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 transition-colors"
              >
                {liked ? (
                  <>
                    <IoMdHeart className="text-accent-pink text-lg" />
                    Unlike
                  </>
                ) : (
                  <>
                    <IoMdHeartEmpty className="text-lg" />
                    Like
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
