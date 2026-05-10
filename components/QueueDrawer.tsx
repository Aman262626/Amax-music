"use client";

import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration } from "@/lib/utils";
import { IoClose, IoTrash } from "react-icons/io5";
import { IoMdPlay } from "react-icons/io";

interface QueueDrawerProps {
  onClose: () => void;
}

export default function QueueDrawer({ onClose }: QueueDrawerProps) {
  const { queue, queueIndex, currentSong, removeFromQueue, clearQueue, playSong } =
    usePlayer();

  const upcomingSongs = queue.slice(queueIndex + 1);

  return (
    <div className="fixed inset-0 z-50 lg:absolute lg:right-0 lg:top-auto lg:bottom-full lg:left-auto lg:w-[380px] lg:h-[500px] lg:inset-auto">
      <div
        className="absolute inset-0 bg-black/50 lg:hidden"
        onClick={onClose}
      />
      <div className="relative h-full lg:h-auto lg:max-h-[500px] bg-spotify-dark-gray lg:rounded-lg overflow-hidden flex flex-col ml-auto w-full max-w-md lg:max-w-none shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-spotify-gray/30">
          <h2 className="text-white font-bold text-lg">Queue</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearQueue}
              className="text-spotify-light-gray hover:text-white text-sm px-3 py-1 rounded-full border border-spotify-gray/50 hover:border-white/30 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="text-spotify-light-gray hover:text-white p-1"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>

        {/* Now Playing */}
        {currentSong && (
          <div className="p-4 pb-2">
            <p className="text-spotify-light-gray text-xs font-bold uppercase tracking-wider mb-2">
              Now Playing
            </p>
            <div className="flex items-center gap-3 bg-spotify-gray/50 rounded-lg p-2">
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={currentSong.image}
                  alt={currentSong.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-spotify-green text-sm font-medium truncate">
                  {currentSong.name}
                </p>
                <p className="text-spotify-light-gray text-xs truncate">
                  {currentSong.artist}
                </p>
              </div>
              <span className="text-spotify-light-gray text-xs">
                {formatDuration(currentSong.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Up Next */}
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          <p className="text-spotify-light-gray text-xs font-bold uppercase tracking-wider mb-2">
            Next Up ({upcomingSongs.length})
          </p>
          {upcomingSongs.length === 0 ? (
            <p className="text-spotify-light-gray text-sm text-center py-8">
              Queue is empty. Add songs to queue!
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {upcomingSongs.map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-spotify-gray/50 group transition-colors"
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={song.image}
                      alt={song.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => playSong(song, queue, queueIndex + 1 + i)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IoMdPlay className="text-white text-lg" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">{song.name}</p>
                    <p className="text-spotify-light-gray text-xs truncate">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-spotify-light-gray text-xs">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    onClick={() => removeFromQueue(queueIndex + 1 + i)}
                    className="text-spotify-light-gray hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
