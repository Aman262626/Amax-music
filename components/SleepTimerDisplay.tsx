"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { IoMoon } from "react-icons/io5";

export default function SleepTimerDisplay() {
  const { sleepTimer } = usePlayer();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (sleepTimer <= 0) {
      setRemaining(0);
      return;
    }

    setRemaining(sleepTimer);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  if (remaining <= 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 glass rounded-lg text-xs">
      <IoMoon className="text-accent-purple text-sm" />
      <span className="text-white/70">{remaining}m</span>
    </div>
  );
}
