"use client";

import { useState, useRef, useCallback } from "react";
import { IoHeart } from "react-icons/io5";
import { addFavorite, isFavorite } from "@/lib/storage";
import type { Song } from "@/lib/types";

interface Props {
  song: Song;
  children: React.ReactNode;
  className?: string;
}

export default function DoubleTapLike({ song, children, className = "" }: Props) {
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap
      if (!isFavorite(song.id)) {
        addFavorite(song);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTapRef.current = now;
  }, [song]);

  return (
    <div onClick={handleClick} className={`relative ${className}`}>
      {children}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <IoHeart className="text-5xl text-accent-pink animate-ping" />
        </div>
      )}
    </div>
  );
}
