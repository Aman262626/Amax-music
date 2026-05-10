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
  IoChevronDown,
  IoCloudDownload,
  IoMusicalNotes,
  IoShareSocial,
  IoTimer,
  IoSpeedometer,
} from "react-icons/io5";
import { MdRepeatOne, MdQueueMusic, MdLyrics } from "react-icons/md";
import QueueDrawer from "./QueueDrawer";
import LyricsPanel from "./LyricsPanel";
import AudioVisualizer from "./AudioVisualizer";
import VideoPlayer from "./VideoPlayer";
import PartyMode from "./PartyMode";

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
    playbackSpeed,
    sleepTimer,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    setPlaybackSpeed,
    setSleepTimer,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
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

  const handleShare = useCallback(() => {
    if (!currentSong) return;
    if (navigator.share) {
      navigator.share({
        title: currentSong.name,
        text: `Listen to ${currentSong.name} by ${currentSong.artist} on AMAX Music`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${currentSong.name} - ${currentSong.artist} | AMAX Music`
      ).catch(() => {});
    }
  }, [currentSong]);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const timerOptions = [
    { label: "Off", value: 0 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
  ];

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
      <div className="hidden lg:grid grid-cols-3 items-center glass-strong px-4 h-[90px] z-50 relative">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] progress-gradient" />

        {/* Left: Song info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
            <Image
              src={currentSong.image}
              alt={currentSong.name}
              fill
              className="object-cover"
              unoptimized
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center pb-1 bg-black/20">
                <AudioVisualizer size="small" />
              </div>
            )}
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
            className="ml-2 flex-shrink-0 transition-all hover:scale-110"
          >
            {liked ? (
              <IoHeart className="text-accent-pink text-xl" />
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
              className={`transition-all hover:scale-110 ${
                shuffle ? "text-spotify-green neon-green" : "text-spotify-light-gray hover:text-white"
              }`}
            >
              <IoShuffle className="text-lg" />
            </button>
            <button onClick={previous} className="text-spotify-light-gray hover:text-white hover:scale-110 transition-all">
              <IoPlaySkipBack className="text-xl" />
            </button>
            <button
              onClick={togglePlay}
              className="text-white hover:scale-110 transition-all"
            >
              {isBuffering ? (
                <div className="w-9 h-9 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <IoPauseCircle className="text-4xl" />
              ) : (
                <IoPlayCircle className="text-4xl" />
              )}
            </button>
            <button onClick={next} className="text-spotify-light-gray hover:text-white hover:scale-110 transition-all">
              <IoPlaySkipForward className="text-xl" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-all hover:scale-110 ${
                repeat !== "off" ? "text-spotify-green neon-green" : "text-spotify-light-gray hover:text-white"
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
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
            >
              <div
                className="h-full progress-gradient rounded-full transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="hidden group-hover:block absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg glow-green" />
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
            onClick={() => setShowLyrics(!showLyrics)}
            className={`transition-all hover:scale-110 ${
              showLyrics ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"
            }`}
            title="Lyrics"
          >
            <MdLyrics className="text-lg" />
          </button>
          <button
            onClick={handleDownload}
            className="text-spotify-light-gray hover:text-white hover:scale-110 transition-all"
            title="Download"
          >
            <IoCloudDownload className="text-lg" />
          </button>
          <div className="relative">
            <button
              onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowTimerMenu(false); }}
              className={`transition-all hover:scale-110 ${
                playbackSpeed !== 1 ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"
              }`}
              title="Playback Speed"
            >
              <IoSpeedometer className="text-lg" />
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-2 min-w-[120px] fade-in">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setPlaybackSpeed(s); setShowSpeedMenu(false); }}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      playbackSpeed === s
                        ? "text-spotify-green bg-white/10"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setShowTimerMenu(!showTimerMenu); setShowSpeedMenu(false); }}
              className={`transition-all hover:scale-110 ${
                sleepTimer > 0 ? "text-accent-purple" : "text-spotify-light-gray hover:text-white"
              }`}
              title="Sleep Timer"
            >
              <IoTimer className="text-lg" />
            </button>
            {showTimerMenu && (
              <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-2 min-w-[120px] fade-in">
                {timerOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => { setSleepTimer(t.value); setShowTimerMenu(false); }}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      sleepTimer === t.value
                        ? "text-accent-purple bg-white/10"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <VideoPlayer />
          <PartyMode />
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`transition-all hover:scale-110 ${
              showQueue ? "text-spotify-green" : "text-spotify-light-gray hover:text-white"
            }`}
            title="Queue"
          >
            <MdQueueMusic className="text-lg" />
          </button>
          <button
            onClick={handleShare}
            className="text-spotify-light-gray hover:text-white hover:scale-110 transition-all"
            title="Share"
          >
            <IoShareSocial className="text-lg" />
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
              className="w-24 h-1 bg-white/10 rounded-full cursor-pointer group"
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
          className="lg:hidden fixed left-2 right-2 z-30 glass-strong rounded-xl overflow-hidden cursor-pointer"
          style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
          onClick={() => setShowMobilePlayer(true)}
        >
          <div
            className="h-[2px] progress-gradient"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="flex items-center gap-3 p-2">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={currentSong.image}
                alt={currentSong.name}
                fill
                className="object-cover"
                unoptimized
              />
              {isPlaying && (
                <div className="absolute inset-0 flex items-end justify-center pb-0.5 bg-black/20">
                  <AudioVisualizer size="tiny" />
                </div>
              )}
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
                <IoHeart className="text-accent-pink text-xl" />
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
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col slide-up overflow-hidden">
          {/* Dynamic background */}
          <div className="absolute inset-0 bg-gradient-to-b from-spotify-gray to-black" />
          <div className="absolute inset-0 gradient-mesh opacity-60" />

          {/* Song image blurred backdrop */}
          <div
            className="song-backdrop"
            style={{
              background: `url(${currentSong.image}) center/cover no-repeat`,
            }}
          />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setShowMobilePlayer(false)}
                className="text-white p-2 glass rounded-full"
              >
                <IoChevronDown className="text-xl" />
              </button>
              <p className="text-white text-xs font-bold uppercase tracking-widest">
                Now Playing
              </p>
              <button
                onClick={() => setShowQueue(!showQueue)}
                className="text-white p-2 glass rounded-full"
              >
                <MdQueueMusic className="text-xl" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
              {/* Album art with vinyl effect */}
              <div className="relative">
                <div className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl ${isPlaying ? 'glow-green' : ''}`}>
                  <Image
                    src={currentSong.imageHigh || currentSong.image}
                    alt={currentSong.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {isPlaying && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-[3px]">
                    <AudioVisualizer size="medium" />
                  </div>
                )}
              </div>

              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-white text-xl font-bold truncate">
                      {currentSong.name}
                    </p>
                    <p className="text-spotify-light-gray text-sm truncate">
                      {currentSong.artist}
                    </p>
                  </div>
                  <button onClick={handleLike} className="hover:scale-110 transition-transform">
                    {liked ? (
                      <IoHeart className="text-accent-pink text-2xl" />
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
                    className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer"
                  >
                    <div
                      className="h-full progress-gradient rounded-full relative"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg glow-green" />
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

                {/* Main Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleShuffle}
                    className={`hover:scale-110 transition-all ${shuffle ? "text-spotify-green neon-green" : "text-spotify-light-gray"}`}
                  >
                    <IoShuffle className="text-2xl" />
                  </button>
                  <button onClick={previous} className="text-white hover:scale-110 transition-all">
                    <IoPlaySkipBack className="text-3xl" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="text-white hover:scale-105 transition-all"
                  >
                    {isBuffering ? (
                      <div className="w-16 h-16 glass rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : isPlaying ? (
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center glow-green">
                        <IoPauseCircle className="text-[64px] text-black" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <IoPlayCircle className="text-[64px] text-black" />
                      </div>
                    )}
                  </button>
                  <button onClick={next} className="text-white hover:scale-110 transition-all">
                    <IoPlaySkipForward className="text-3xl" />
                  </button>
                  <button
                    onClick={toggleRepeat}
                    className={`hover:scale-110 transition-all ${
                      repeat !== "off" ? "text-spotify-green neon-green" : "text-spotify-light-gray"
                    }`}
                  >
                    <RepeatIcon className="text-2xl" />
                  </button>
                </div>

                {/* Extra controls row */}
                <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
                  <button
                    onClick={handleDownload}
                    className="text-spotify-light-gray hover:text-white flex flex-col items-center gap-1 transition-colors"
                  >
                    <IoCloudDownload className="text-xl" />
                    <span className="text-[10px]">Download</span>
                  </button>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`flex flex-col items-center gap-1 transition-colors ${showLyrics ? 'text-spotify-green' : 'text-spotify-light-gray hover:text-white'}`}
                  >
                    <MdLyrics className="text-xl" />
                    <span className="text-[10px]">Lyrics</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="text-spotify-light-gray hover:text-white flex flex-col items-center gap-1 transition-colors"
                  >
                    <IoShareSocial className="text-xl" />
                    <span className="text-[10px]">Share</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMobilePlayer(false);
                      setShowQueue(true);
                    }}
                    className="text-spotify-light-gray hover:text-white flex flex-col items-center gap-1 transition-colors"
                  >
                    <MdQueueMusic className="text-xl" />
                    <span className="text-[10px]">Queue</span>
                  </button>
                  <button
                    onClick={() => setShowTimerMenu(!showTimerMenu)}
                    className={`flex flex-col items-center gap-1 transition-colors ${sleepTimer > 0 ? 'text-accent-purple' : 'text-spotify-light-gray hover:text-white'}`}
                  >
                    <IoTimer className="text-xl" />
                    <span className="text-[10px]">{sleepTimer > 0 ? `${sleepTimer}m` : 'Timer'}</span>
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <VideoPlayer />
                    <span className="text-spotify-light-gray text-[10px]">Video</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <PartyMode />
                    <span className="text-spotify-light-gray text-[10px]">Party</span>
                  </div>
                </div>

                {/* Timer menu overlay */}
                {showTimerMenu && (
                  <div className="mt-4 glass rounded-xl p-3 fade-in">
                    <p className="text-white text-sm font-semibold mb-2">Sleep Timer</p>
                    <div className="flex flex-wrap gap-2">
                      {timerOptions.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => { setSleepTimer(t.value); setShowTimerMenu(false); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            sleepTimer === t.value
                              ? "bg-accent-purple text-white"
                              : "glass text-white hover:bg-white/10"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Panel */}
      {showLyrics && currentSong && (
        <LyricsPanel songId={currentSong.id} songName={currentSong.name} artist={currentSong.artist} onClose={() => setShowLyrics(false)} />
      )}

      {/* Queue Drawer */}
      {showQueue && <QueueDrawer onClose={() => setShowQueue(false)} />}
    </>
  );
}
