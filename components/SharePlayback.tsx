"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { IoShareSocial } from "react-icons/io5";

export default function SharePlayback() {
  const { currentSong, progress } = usePlayer();

  const handleShare = async () => {
    if (!currentSong) return;

    const minutes = Math.floor(progress / 60);
    const seconds = Math.floor(progress % 60);
    const time = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const text = `Listening to "${currentSong.name}" by ${currentSong.artist} at ${time} on AMAX Music`;

    if (navigator.share) {
      try {
        await navigator.share({ text, url: window.location.href });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  if (!currentSong) return null;

  return (
    <button
      onClick={handleShare}
      className="text-white/40 hover:text-white transition-colors"
      title="Share"
    >
      <IoShareSocial className="text-lg" />
    </button>
  );
}
