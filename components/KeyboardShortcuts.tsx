"use client";

import { useEffect, useState, useCallback } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { IoClose } from "react-icons/io5";

const SHORTCUTS = [
  { key: "Space", action: "Play / Pause" },
  { key: "→", action: "Skip forward 5s" },
  { key: "←", action: "Skip backward 5s" },
  { key: "↑", action: "Volume up" },
  { key: "↓", action: "Volume down" },
  { key: "N", action: "Next track" },
  { key: "P", action: "Previous track" },
  { key: "S", action: "Toggle shuffle" },
  { key: "R", action: "Toggle repeat" },
  { key: "M", action: "Mute / Unmute" },
  { key: "L", action: "Like / Unlike song" },
  { key: "?", action: "Show shortcuts" },
  { key: "Esc", action: "Close modals" },
];

export default function KeyboardShortcuts() {
  const {
    isPlaying,
    togglePlay,
    next,
    previous,
    seek,
    progress,
    volume,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    currentSong,
  } = usePlayer();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (!currentSong && e.key !== "?") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(Math.min(progress + 5));
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(Math.max(0, progress - 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case "n":
        case "N":
          next();
          break;
        case "p":
        case "P":
          previous();
          break;
        case "s":
        case "S":
          toggleShuffle();
          break;
        case "r":
        case "R":
          toggleRepeat();
          break;
        case "m":
        case "M":
          setVolume(volume === 0 ? 0.8 : 0);
          break;
        case "?":
          setShowHelp((prev) => !prev);
          break;
        case "Escape":
          setShowHelp(false);
          break;
      }
    },
    [
      currentSong,
      togglePlay,
      next,
      previous,
      seek,
      progress,
      volume,
      setVolume,
      toggleShuffle,
      toggleRepeat,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
      <div className="glass-strong rounded-2xl p-6 max-w-md w-full mx-4 slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={() => setShowHelp(false)}
            className="text-spotify-light-gray hover:text-white p-1"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5"
            >
              <span className="text-spotify-light-gray text-sm">{s.action}</span>
              <kbd className="px-2.5 py-1 rounded-lg glass text-white text-xs font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-spotify-light-gray text-xs mt-4 text-center">
          Press <kbd className="px-1.5 py-0.5 glass rounded text-white font-mono">?</kbd> to toggle
        </p>
      </div>
    </div>
  );
}
