"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser, loginUser, updateUser, logoutUser, AVATARS } from "@/lib/auth";
import { getFavorites, getHistory } from "@/lib/storage";
import type { UserProfile } from "@/lib/auth";
import {
  IoPersonCircle,
  IoLogOut,
  IoHeart,
  IoTime,
  IoMusicalNotes,
  IoCheckmark,
} from "react-icons/io5";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [stats, setStats] = useState({ favorites: 0, history: 0 });

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (u) {
      setStats({
        favorites: getFavorites().length,
        history: getHistory().length,
      });
    }
  }, []);

  const handleLogin = useCallback(() => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    setError("");
    const u = loginUser(username, displayName);
    setUser(u);
    setStats({
      favorites: getFavorites().length,
      history: getHistory().length,
    });
  }, [username, displayName]);

  const handleLogout = useCallback(() => {
    logoutUser();
    setUser(null);
    setUsername("");
    setDisplayName("");
  }, []);

  const handleAvatarChange = useCallback(
    (avatar: string) => {
      const updated = updateUser({ avatar });
      if (updated) setUser(updated);
      setEditingAvatar(false);
    },
    []
  );

  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-spotify-light-gray text-sm mb-8">
          {isLogin ? "Sign in to your AMAX account" : "Join AMAX Music today"}
        </p>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 glass rounded-xl text-white text-sm placeholder-spotify-light-gray focus:outline-none focus:ring-1 focus:ring-spotify-green/50"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-1 block">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="w-full px-4 py-3 glass rounded-xl text-white text-sm placeholder-spotify-light-gray focus:outline-none focus:ring-1 focus:ring-spotify-green/50"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && <p className="text-accent-red text-xs">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-spotify-green text-black font-bold rounded-xl text-sm hover:scale-[1.02] transition-transform"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-spotify-light-gray text-xs hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setEditingAvatar(!editingAvatar)}
          className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-spotify-green to-accent-cyan rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-2xl glow-green hover:scale-105 transition-transform"
        >
          {user.avatar}
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {user.displayName}
          </h1>
          <p className="text-spotify-light-gray text-sm">@{user.username}</p>
          <p className="text-spotify-light-gray text-xs mt-1">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Avatar Picker */}
      {editingAvatar && (
        <div className="glass-card rounded-xl p-4 mb-6 fade-in">
          <p className="text-white text-sm font-medium mb-3">Choose your avatar</p>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => handleAvatarChange(a)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                  user.avatar === a ? "bg-spotify-green/20 ring-1 ring-spotify-green" : "glass hover:bg-white/10"
                }`}
              >
                {a}
                {user.avatar === a && (
                  <IoCheckmark className="absolute text-spotify-green text-xs" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="glass-card rounded-xl p-4 text-center">
          <IoHeart className="text-accent-pink text-2xl mx-auto mb-2" />
          <p className="text-white text-xl font-bold">{stats.favorites}</p>
          <p className="text-spotify-light-gray text-xs">Liked Songs</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <IoTime className="text-accent-purple text-2xl mx-auto mb-2" />
          <p className="text-white text-xl font-bold">{stats.history}</p>
          <p className="text-spotify-light-gray text-xs">Songs Played</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <IoMusicalNotes className="text-spotify-green text-2xl mx-auto mb-2" />
          <p className="text-white text-xl font-bold">320</p>
          <p className="text-spotify-light-gray text-xs">Quality (kbps)</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2 mb-8">
        <button
          onClick={() => router.push("/library")}
          className="w-full flex items-center gap-3 px-4 py-3 glass rounded-xl text-white text-sm hover:bg-white/10 transition-colors text-left"
        >
          <IoHeart className="text-accent-pink" />
          Your Library
        </button>
        <button
          onClick={() => router.push("/search")}
          className="w-full flex items-center gap-3 px-4 py-3 glass rounded-xl text-white text-sm hover:bg-white/10 transition-colors text-left"
        >
          <IoMusicalNotes className="text-spotify-green" />
          Discover Music
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-accent-red text-sm hover:bg-accent-red/10 transition-colors"
      >
        <IoLogOut />
        Sign Out
      </button>
    </div>
  );
}
