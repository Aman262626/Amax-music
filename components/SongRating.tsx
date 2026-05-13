"use client";

import { useState, useEffect } from "react";
import { IoStar, IoStarOutline } from "react-icons/io5";

interface Props {
  songId: string;
  size?: "sm" | "md";
}

function getRatings(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("amax_ratings") || "{}");
  } catch {
    return {};
  }
}

function setRating(songId: string, rating: number): void {
  const ratings = getRatings();
  ratings[songId] = rating;
  localStorage.setItem("amax_ratings", JSON.stringify(ratings));
}

export default function SongRating({ songId, size = "sm" }: Props) {
  const [rating, setRatingState] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    const ratings = getRatings();
    setRatingState(ratings[songId] || 0);
  }, [songId]);

  const handleClick = (star: number) => {
    const newRating = star === rating ? 0 : star;
    setRatingState(newRating);
    setRating(songId, newRating);
  };

  const iconSize = size === "sm" ? "text-sm" : "text-lg";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`transition-colors ${iconSize} ${
              filled ? "text-yellow-400" : "text-white/20 hover:text-yellow-400/50"
            }`}
          >
            {filled ? <IoStar /> : <IoStarOutline />}
          </button>
        );
      })}
    </div>
  );
}
