"use client";

import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import { IoClose, IoTrash } from "react-icons/io5";
import AudioVisualizer from "./AudioVisualizer";

interface QueueDrawerProps {
  onClose: () => void;
}

export default function QueueDrawer({ onClose }: QueueDrawerProps) {
  const {
    currentSong,
    queue,
    queueIndex,
    isPlaying,
    autoPlay,
    removeFromQueue,
    clearQueue,
    playSong,
    toggleAutoPlay,
  } = usePlayer();

  const upcomingSongs = queue.slice(queueIndex + 1);

  return (
    <div className="fixed inset-0 z-[55] lg:inset-auto lg:fixed lg:right-4 lg:bottom-[100px] lg:w-[380px] lg:h-[500px] lg:rounded-2xl glass-strong overflow-hidden slide-up">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-lg">Queue</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAutoPlay}
            className={`text-xs px-3 py-1 rounded-full transition-all ${
              autoPlay ? "bg-spotify-green/20 text-spotify-green border border-spotify-green/30" : "glass text-spotify-light-gray"
            }`}
          >
            Autoplay {autoPlay ? "On" : "Off"}
          </button>
          {upcomingSongs.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-spotify-light-gray hover:text-white p-1.5 glass rounded-full transition-colors"
              title="Clear queue"
            >
              <IoTrash className="text-sm" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1.5 glass rounded-full transition-colors"
          >
            <IoClose className="text-lg" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-60px)] p-3">
        {/* Now playing */}
        {currentSong && (
          <div className="mb-4">
            <p className="text-spotify-light-gray text-xs font-bold uppercase tracking-widest mb-2 px-1">
              Now Playing
            </p>
            <div className="flex items-center gap-3 p-2 glass rounded-xl">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={currentSong.image}
                  alt={currentSong.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <AudioVisualizer size="tiny" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-spotify-green text-sm font-medium truncate">
                  {currentSong.name}
                </p>
                <p className="text-spotify-light-gray text-xs truncate">
                  {currentSong.artist}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcomingSongs.length > 0 ? (
          <div>
            <p className="text-spotify-light-gray text-xs font-bold uppercase tracking-widest mb-2 px-1">
              Next Up • {upcomingSongs.length} song{upcomingSongs.length > 1 ? "s" : ""}
            </p>
            <div className="space-y-1">
              {upcomingSongs.map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => playSong(song, queue, queueIndex + 1 + i)}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={song.image}
                      alt={song.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">{song.name}</p>
                    <p className="text-spotify-light-gray text-xs truncate">
                      {song.artist}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(queueIndex + 1 + i);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-spotify-light-gray hover:text-accent-red p-1 transition-all"
                  >
                    <IoClose className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-white font-semibold text-sm mb-1">Queue is empty</p>
            <p className="text-spotify-light-gray text-xs">
              {autoPlay ? "Songs will be added automatically" : "Add songs to play next"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
