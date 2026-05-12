"use client";

import { useState, useEffect } from "react";
import { getHistory, getFavorites, getListeningSeconds } from "@/lib/storage";
import { IoMusicalNotes, IoHeart, IoTime, IoFlame } from "react-icons/io5";

function formatTime(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours < 24) return `${hours}h ${remainingMins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export default function StatsBar() {
  const [stats, setStats] = useState({ songs: 0, favorites: 0, seconds: 0, streak: 0 });

  useEffect(() => {
    const history = getHistory();
    const favorites = getFavorites();
    const listeningSeconds = getListeningSeconds();

    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem("amax_last_played_date");
    const currentStreak = parseInt(localStorage.getItem("amax_streak") || "0", 10);

    let streak = currentStreak;
    if (lastPlayed !== today && history.length > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPlayed === yesterday.toDateString()) {
        streak = currentStreak + 1;
      } else if (!lastPlayed) {
        streak = 1;
      } else {
        streak = 1;
      }
      localStorage.setItem("amax_last_played_date", today);
      localStorage.setItem("amax_streak", streak.toString());
    }

    setStats({
      songs: history.length,
      favorites: favorites.length,
      seconds: listeningSeconds,
      streak,
    });
  }, []);

  const items = [
    { icon: IoMusicalNotes, label: "Songs Played", value: stats.songs.toString(), color: "text-spotify-green" },
    { icon: IoHeart, label: "Liked", value: stats.favorites.toString(), color: "text-accent-pink" },
    { icon: IoTime, label: "Listened", value: formatTime(stats.seconds), color: "text-accent-cyan" },
    { icon: IoFlame, label: "Day Streak", value: stats.streak.toString(), color: "text-accent-orange" },
  ];

  if (stats.songs === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {items.map((item) => (
        <div key={item.label} className="glass-card holo-card rounded-xl p-4 text-center">
          <item.icon className={`text-2xl mx-auto mb-2 ${item.color}`} />
          <p className="text-white text-xl font-bold">{item.value}</p>
          <p className="text-spotify-light-gray text-xs">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
