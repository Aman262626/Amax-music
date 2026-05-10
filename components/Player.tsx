"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration, getBestDownloadUrl } from "@/lib/utils";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/storage";
import {
  IoPlayCircle,
  IoPauseCircle,
  IoPlaySkipForward,
  IoPlaySkipBack,
  IoShuffle,
  IoRepeat,
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeLow,
  IoVolumeMute,
  IoHeart,
  IoHeartOutline,
  IoChevronUp,
  IoChevronDown,
  IoCloudDownload,
  IoMusicalNotes,
} from "react-icons/io5";
import { MdRepeatOne, MdQueueMusic } from "react-icons/md";
import QueueDrawer from "./QueueDrawer";

export default function Player() {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    isBuffering,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSong) {
      setLiked(isFavorite(currentSong.id));
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

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(ratio * duration);
    },
    [duration, seek]
  );

  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!volumeRef.current) return;
      const rect = volumeRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(ratio);
    },
    [setVolume]
  );

  const handleDownload = useCallback(() => {
    if (!currentSong) return;
    const url = getBestDownloadUrl(currentSong.downloadUrl);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentSong.name} - ${currentSong.artist}.mp3`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [currentSong]);

  const VolumeIcon =
    volume === 0
      ? IoVolumeMute
      : volume < 0.33
      ? IoVolumeLow
      : volume < 0.66
      ? IoVolumeMedium
      : IoVolumeHigh;

  const RepeatIcon = repeat === "one" ? MdRepeatOne : IoRepeat;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <>
      {/* Desktop Player Bar */}
      <div className="hidden lg:grid grid-cols-3 items-center bg-black border-t border-spotify-gray/50 px-4 h-[90px] z-50">
        {/* Left: Song info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
            <Image
              src={currentSong.image}
              alt={currentSong.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {currentSong.name}
            </p>
            <p className="text-spotify-light-gray text-xs truncate">
              {currentSong.artist}
            </p>
          </div>
          <button
            onClick={handleLike}
            className="ml-2 flex-shrink-0 transition-colors"
          >
            {liked ? (
              <IoHeart className="text-spotify-green text-xl" />
            ) : (
              <IoHeartOutline className="text-spotify-light-gray text-xl hover:text-white" />
            )}
          </button>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${
                shuffle ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"
              }`}
            >
              <IoShuffle className="text-lg" />
            </button>
            <button onClick={previous} className="text-spotify-light-gray hover:text-white">
              <IoPlaySkipBack className="text-xl" />
            </button>
            <button
              onClick={togglePlay}
              className="text-white hover:scale-105 transition-transform"
            >
              {isBuffering ? (
                <div className="w-9 h-9 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <IoPauseCircle className="text-4xl" />
              ) : (
                <IoPlayCircle className="text-4xl" />
              )}
            </button>
            <button onClick={next} className="text-spotify-light-gray hover:text-white">
              <IoPlaySkipForward className="text-xl" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-colors ${
                repeat !== "off" ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"
              }`}
            >
              <RepeatIcon className="text-lg" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full max-w-lg">
            <span className="text-spotify-light-gray text-xs min-w-[35px] text-right">
              {formatDuration(progress)}
            </span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-spotify-gray rounded-full cursor-pointer group relative"
            >
              <div
                className="h-full bg-white group-hover:bg-spotify-green rounded-full transition-colors relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="hidden group-hover:block absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
              </div>
            </div>
            <span className="text-spotify-light-gray text-xs min-w-[35px]">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & extras */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleDownload}
            className="text-spotify-light-gray hover:text-white transition-colors"
            title="Download"
          >
            <IoCloudDownload className="text-lg" />
          </button>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`transition-colors ${
              showQueue ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"
            }`}
            title="Queue"
          >
            <MdQueueMusic className="text-lg" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="text-spotify-light-gray hover:text-white"
            >
              <VolumeIcon className="text-lg" />
            </button>
            <div
              ref={volumeRef}
              onClick={handleVolumeClick}
              className="w-24 h-1 bg-spotify-gray rounded-full cursor-pointer group"
            >
              <div
                className="h-full bg-white group-hover:bg-spotify-green rounded-full transition-colors relative"
                style={{ width: `${volume * 100}%` }}
              >
                <div className="hidden group-hover:block absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Mini Player */}
      {!showMobilePlayer && (
        <div
          className="lg:hidden fixed bottom-[52px] left-2 right-2 z-30 bg-spotify-gray rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setShowMobilePlayer(true)}
        >
          <div
            className="h-[2px] bg-spotify-green"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="flex items-center gap-3 p-2">
            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
              <Image
                src={currentSong.image}
                alt={currentSong.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {currentSong.name}
              </p>
              <p className="text-spotify-light-gray text-xs truncate">
                {currentSong.artist}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="p-2"
            >
              {liked ? (
                <IoHeart className="text-spotify-green text-xl" />
              ) : (
                <IoHeartOutline className="text-spotify-light-gray text-xl" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="p-2"
            >
              {isPlaying ? (
                <IoPauseCircle className="text-white text-3xl" />
              ) : (
                <IoPlayCircle className="text-white text-3xl" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Full Player */}
      {showMobilePlayer && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gradient-to-b from-spotify-gray to-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setShowMobilePlayer(false)}
              className="text-white p-2"
            >
              <IoChevronDown className="text-2xl" />
            </button>
            <p className="text-white text-xs font-bold uppercase tracking-wider">
              Now Playing
            </p>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="text-white p-2"
            >
              <MdQueueMusic className="text-2xl" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={currentSong.imageHigh || currentSong.image}
                alt={currentSong.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-white text-xl font-bold truncate">
                    {currentSong.name}
                  </p>
                  <p className="text-spotify-light-gray text-sm truncate">
                    {currentSong.artist}
                  </p>
                </div>
                <button onClick={handleLike}>
                  {liked ? (
                    <IoHeart className="text-spotify-green text-2xl" />
                  ) : (
                    <IoHeartOutline className="text-spotify-light-gray text-2xl" />
                  )}
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="w-full h-1 bg-spotify-gray/60 rounded-full cursor-pointer"
                >
                  <div
                    className="h-full bg-white rounded-full relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-spotify-light-gray text-xs">
                    {formatDuration(progress)}
                  </span>
                  <span className="text-spotify-light-gray text-xs">
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleShuffle}
                  className={shuffle ? "text-spotify-green" : "text-spotify-light-gray"}
                >
                  <IoShuffle className="text-2xl" />
                </button>
                <button onClick={previous} className="text-white">
                  <IoPlaySkipBack className="text-3xl" />
                </button>
                <button
                  onClick={togglePlay}
                  className="text-white bg-white rounded-full"
                >
                  {isBuffering ? (
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : isPlaying ? (
                    <IoPauseCircle className="text-[56px] text-black" />
                  ) : (
                    <IoPlayCircle className="text-[56px] text-black" />
                  )}
                </button>
                <button onClick={next} className="text-white">
                  <IoPlaySkipForward className="text-3xl" />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={
                    repeat !== "off" ? "text-spotify-green" : "text-spotify-light-gray"
                  }
                >
                  <RepeatIcon className="text-2xl" />
                </button>
              </div>

              {/* Extra controls */}
              <div className="flex items-center justify-center gap-8 mt-6">
                <button
                  onClick={handleDownload}
                  className="text-spotify-light-gray hover:text-white flex flex-col items-center gap-1"
                >
                  <IoCloudDownload className="text-xl" />
                  <span className="text-[10px]">Download</span>
                </button>
                <button className="text-spotify-light-gray flex flex-col items-center gap-1">
                  <IoMusicalNotes className="text-xl" />
                  <span className="text-[10px]">Lyrics</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobilePlayer(false);
                    setShowQueue(true);
                  }}
                  className="text-spotify-light-gray flex flex-col items-center gap-1"
                >
                  <MdQueueMusic className="text-xl" />
                  <span className="text-[10px]">Queue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Drawer */}
      {showQueue && <QueueDrawer onClose={() => setShowQueue(false)} />}
    </>
  );
}
