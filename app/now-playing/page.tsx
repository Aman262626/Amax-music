"use client";

import { useEffect, useState, useCallback } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import SafeImage from "@/components/SafeImage";
import AudioVisualizer from "@/components/AudioVisualizer";
import GenreTag from "@/components/GenreTag";
import { formatDuration, formatCount } from "@/lib/utils";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/storage";
import type { Song } from "@/lib/types";
import {
  IoHeart,
  IoHeartOutline,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoShuffle,
  IoRepeat,
  IoCloudDownload,
  IoShareSocial,
  IoMusicalNotes,
  IoChevronBack,
} from "react-icons/io5";
import { MdRepeatOne, MdQueueMusic } from "react-icons/md";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import Link from "next/link";

export default function NowPlayingPage() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    shuffle,
    repeat,
    queue,
    queueIndex,
    togglePlay,
    next,
    previous,
    seek,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [suggestions, setSuggestions] = useState<Song[]>([]);

  useEffect(() => {
    if (currentSong) {
      setLiked(isFavorite(currentSong.id));
      fetch(`/api/songs/${currentSong.id}/suggestions`)
        .then((r) => r.json())
        .then((d) => setSuggestions((d.songs as Song[]) || []))
        .catch(() => {});
    }
  }, [currentSong]);

  const handleLike = useCallback(() => {
    if (!currentSong) return;
    if (liked) {
      removeFavorite(currentSong.id);
    } else {
      addFavorite(currentSong);
    }
    setLiked(!liked);
  }, [currentSong, liked]);

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const RepeatIcon = repeat === "one" ? MdRepeatOne : IoRepeat;

  if (!currentSong) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center py-20 page-enter">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-spotify-green/20 to-accent-cyan/20 flex items-center justify-center">
          <IoMusicalNotes className="text-spotify-green text-5xl" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Nothing Playing</h1>
        <p className="text-spotify-light-gray text-sm mb-6">Search for a song to start listening</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-spotify-green to-accent-cyan rounded-full text-white font-medium hover:scale-105 transition-transform"
        >
          Discover Music
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-enter">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-spotify-light-gray hover:text-white transition-colors">
          <IoChevronBack className="text-2xl" />
        </Link>
        <h1 className="text-lg font-bold text-white uppercase tracking-widest">Now Playing</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Album Art */}
        <div className="w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0">
          <div className={`relative aspect-square rounded-2xl overflow-hidden shadow-2xl ${isPlaying ? "breathe-glow" : ""}`}>
            <SafeImage
              src={currentSong.imageHigh || currentSong.image}
              alt={currentSong.name}
              fill
              className="object-cover"
              unoptimized
            />
            {isPlaying && (
              <div className="absolute inset-0 holo-card pointer-events-none" />
            )}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              {currentSong.language && <GenreTag language={currentSong.language} />}
              {isPlaying && (
                <div className="flex items-end gap-[2px]">
                  <AudioVisualizer size="medium" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Song Info & Controls */}
        <div className="w-full lg:w-1/2 lg:pt-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{currentSong.name}</h2>
            <p className="text-spotify-light-gray text-lg">{currentSong.artist}</p>
            {currentSong.album && (
              <p className="text-spotify-light-gray/60 text-sm mt-1">{currentSong.album}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              {currentSong.playCount && (
                <span className="text-spotify-light-gray/60 text-xs">{formatCount(currentSong.playCount)} plays</span>
              )}
              {currentSong.year && (
                <span className="text-spotify-light-gray/60 text-xs">{currentSong.year}</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div
              className="w-full h-2 bg-white/10 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                seek(ratio * duration);
              }}
            >
              <div
                className="h-full progress-gradient rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="hidden group-hover:block absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-spotify-light-gray text-sm">{formatDuration(progress)}</span>
              <span className="text-spotify-light-gray text-sm">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              onClick={toggleShuffle}
              className={`hover:scale-110 transition-all ${shuffle ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"}`}
            >
              <IoShuffle className="text-2xl" />
            </button>
            <button onClick={previous} className="text-white hover:scale-110 transition-all">
              <IoPlaySkipBack className="text-3xl" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all shadow-lg glow-green"
            >
              {isPlaying ? (
                <IoMdPause className="text-black text-3xl" />
              ) : (
                <IoMdPlay className="text-black text-3xl ml-1" />
              )}
            </button>
            <button onClick={next} className="text-white hover:scale-110 transition-all">
              <IoPlaySkipForward className="text-3xl" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`hover:scale-110 transition-all ${repeat !== "off" ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"}`}
            >
              <RepeatIcon className="text-2xl" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm transition-all hover:bg-white/10"
            >
              {liked ? (
                <IoHeart className="text-accent-pink text-lg" />
              ) : (
                <IoHeartOutline className="text-spotify-light-gray text-lg" />
              )}
              <span className="text-white">{liked ? "Liked" : "Like"}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-white transition-all hover:bg-white/10">
              <IoShareSocial className="text-lg" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-white transition-all hover:bg-white/10">
              <IoCloudDownload className="text-lg" /> Download
            </button>
          </div>

          {/* Queue Info */}
          {queue.length > 1 && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MdQueueMusic className="text-spotify-green" />
                <span className="text-white text-sm font-medium">Queue</span>
                <span className="text-spotify-light-gray text-xs">({queueIndex + 1} of {queue.length})</span>
              </div>
              {queue.slice(queueIndex + 1, queueIndex + 4).map((s, i) => (
                <div key={`q-${s.id}-${i}`} className="flex items-center gap-3 py-1.5">
                  <span className="text-spotify-light-gray text-xs w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 relative">
                    <SafeImage src={s.image} alt={s.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs truncate">{s.name}</p>
                    <p className="text-spotify-light-gray text-[10px] truncate">{s.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {suggestions.slice(0, 6).map((s) => (
              <div key={s.id} className="glass-card rounded-xl p-3">
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  <SafeImage src={s.image} alt={s.name} fill className="object-cover" unoptimized />
                </div>
                <p className="text-white text-xs font-medium truncate">{s.name}</p>
                <p className="text-spotify-light-gray text-[10px] truncate">{s.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
