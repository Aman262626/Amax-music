"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUser, loginUser, updateUser, logoutUser, AVATARS, getProfileImage, setProfileImage, removeProfileImage } from "@/lib/auth";
import { getFavorites, getHistory, clearHistory, getPreferredQuality, setPreferredQuality, getListeningSeconds } from "@/lib/storage";
import { usePlayer } from "@/contexts/PlayerContext";
import { AUDIO_MODES } from "@/lib/audioEnhancer";
import type { UserProfile } from "@/lib/auth";
import type { Song } from "@/lib/types";
import SafeImage from "@/components/SafeImage";
import {
  IoPersonCircle,
  IoLogOut,
  IoHeart,
  IoTime,
  IoMusicalNotes,
  IoCheckmark,
  IoCamera,
  IoTrash,
  IoChevronForward,
  IoSettings,
  IoSpeedometer,
  IoVolumeHigh,
  IoColorPalette,
  IoShield,
  IoInformationCircle,
  IoClose,
  IoPlay,
} from "react-icons/io5";

export default function ProfilePage() {
  const router = useRouter();
  const { audioMode, playbackSpeed, currentSong, isPlaying, playSong } = usePlayer();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [stats, setStats] = useState({ favorites: 0, history: 0, totalMinutes: 0 });
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [quality, setQuality] = useState("320kbps");
  const [showSettings, setShowSettings] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (u) {
      const favs = getFavorites();
      const history = getHistory();
      const listeningSeconds = getListeningSeconds();
      setStats({
        favorites: favs.length,
        history: history.length,
        totalMinutes: Math.floor(listeningSeconds / 60),
      });
      setRecentSongs(history.slice(0, 5));
      setProfileImg(getProfileImage());
      setQuality(getPreferredQuality());
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
    const favs = getFavorites();
    const history = getHistory();
    const totalDuration = history.reduce((sum, s) => sum + (s.duration || 0), 0);
    setStats({
      favorites: favs.length,
      history: history.length,
      totalMinutes: Math.floor(totalDuration / 60),
    });
    setRecentSongs(history.slice(0, 5));
  }, [username, displayName]);

  const handleLogout = useCallback(() => {
    logoutUser();
    removeProfileImage();
    setUser(null);
    setUsername("");
    setDisplayName("");
    setProfileImg(null);
  }, []);

  const handleAvatarChange = useCallback((avatar: string) => {
    const updated = updateUser({ avatar });
    if (updated) setUser(updated);
    setEditingAvatar(false);
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setProfileImage(dataUrl);
        setProfileImg(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleRemoveImage = useCallback(() => {
    removeProfileImage();
    setProfileImg(null);
  }, []);

  const handleNameUpdate = useCallback(() => {
    if (!newDisplayName.trim()) return;
    const updated = updateUser({ displayName: newDisplayName.trim() });
    if (updated) setUser(updated);
    setEditingName(false);
  }, [newDisplayName]);

  const handleQualityChange = useCallback((q: string) => {
    setQuality(q);
    setPreferredQuality(q);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setRecentSongs([]);
    setStats((prev) => ({ ...prev, history: 0, totalMinutes: 0 }));
  }, []);

  const currentModeInfo = AUDIO_MODES.find((m) => m.id === audioMode);

  // Login / Sign up screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <IoMusicalNotes className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {isLogin ? "Welcome Back" : "Join AMAX"}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {isLogin ? "Sign in to your account" : "Create your music profile"}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-white/70 text-xs font-medium mb-1.5 block uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/[0.07] transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-white/70 text-xs font-medium mb-1.5 block uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/[0.07] transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && <p className="text-accent-red text-xs">{error}</p>}

            <button
              onClick={handleLogin}
              className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all active:scale-[0.98]"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-white/40 text-xs hover:text-white/70 transition-colors"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const memberDays = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

  return (
    <div className="pb-32 overflow-y-auto">
      {/* Profile header with gradient background */}
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-b from-fuchsia-900/40 via-purple-900/20 to-transparent" />

        <div className="relative px-5 pt-8 pb-4">
          {/* Avatar + Info */}
          <div className="flex items-start gap-4">
            {/* Profile picture */}
            <div className="relative">
              <button
                onClick={() => {
                  if (profileImg) {
                    setEditingAvatar(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl ring-2 ring-fuchsia-500/30 hover:ring-fuchsia-500/60 transition-all group"
              >
                {profileImg ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-4xl">
                    {user.avatar}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <IoCamera className="text-white text-xl" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Name and info */}
            <div className="flex-1 pt-2">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-bold focus:outline-none focus:border-fuchsia-500/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleNameUpdate();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                  />
                  <button onClick={handleNameUpdate} className="text-fuchsia-400 text-xl"><IoCheckmark /></button>
                  <button onClick={() => setEditingName(false)} className="text-white/40 text-xl"><IoClose /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setNewDisplayName(user.displayName); setEditingName(true); }}
                  className="text-left group"
                >
                  <h1 className="text-2xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                    {user.displayName}
                  </h1>
                </button>
              )}
              <p className="text-white/40 text-sm">@{user.username}</p>
              <p className="text-white/25 text-xs mt-0.5">
                {memberDays === 0 ? "Joined today" : `${memberDays} day${memberDays !== 1 ? "s" : ""} on AMAX`}
              </p>
            </div>
          </div>

          {/* Image actions when editing avatar */}
          {editingAvatar && (
            <div className="mt-4 glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">Change profile picture</p>
                <button onClick={() => setEditingAvatar(false)} className="text-white/40 hover:text-white">
                  <IoClose className="text-lg" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-lg text-white text-sm font-medium"
                >
                  <IoCamera className="text-base" />
                  Upload Photo
                </button>
                {profileImg && (
                  <button
                    onClick={handleRemoveImage}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-accent-red text-sm font-medium hover:bg-accent-red/10 transition-colors"
                  >
                    <IoTrash className="text-base" />
                  </button>
                )}
              </div>

              <div>
                <p className="text-white/40 text-xs mb-2">Or choose an emoji avatar</p>
                <div className="grid grid-cols-8 gap-1.5">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => { handleAvatarChange(a); handleRemoveImage(); }}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                        !profileImg && user.avatar === a
                          ? "bg-fuchsia-500/20 ring-1 ring-fuchsia-500"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/10 rounded-2xl p-3.5 text-center">
            <IoHeart className="text-pink-400 text-xl mx-auto mb-1.5" />
            <p className="text-white text-2xl font-bold">{stats.favorites}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Liked</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10 rounded-2xl p-3.5 text-center">
            <IoTime className="text-purple-400 text-xl mx-auto mb-1.5" />
            <p className="text-white text-2xl font-bold">{stats.history}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Played</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/10 rounded-2xl p-3.5 text-center">
            <IoMusicalNotes className="text-cyan-400 text-xl mx-auto mb-1.5" />
            <p className="text-white text-2xl font-bold">{stats.totalMinutes}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Minutes</p>
          </div>
        </div>
      </div>

      {/* Now Playing section */}
      {currentSong && (
        <div className="px-5 mb-6">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2.5">Now Playing</h3>
          <div className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <SafeImage src={currentSong.image} alt={currentSong.name} fill className="object-cover" unoptimized />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <div className="w-0.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ height: "60%", animationDelay: "0ms" }} />
                    <div className="w-0.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
                    <div className="w-0.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ height: "40%", animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentSong.name}</p>
              <p className="text-white/40 text-xs truncate">{currentSong.artist}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded-full">
                {currentModeInfo?.name || "Normal"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Recently Played</h3>
            <button onClick={handleClearHistory} className="text-white/30 text-xs hover:text-accent-red transition-colors">
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {recentSongs.map((song, i) => (
              <button
                key={`${song.id}-${i}`}
                onClick={() => playSong(song)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <SafeImage src={song.image} alt={song.name} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <IoPlay className="text-white text-xs" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-sm truncate">{song.name}</p>
                  <p className="text-white/30 text-xs truncate">{song.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings section */}
      <div className="px-5 mb-6">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2.5">Settings</h3>
        <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/5">
          {/* Audio Quality */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
          >
            <IoVolumeHigh className="text-fuchsia-400 text-lg" />
            <span className="flex-1 text-white text-sm text-left">Audio Quality</span>
            <span className="text-white/40 text-xs">{quality}</span>
            <IoChevronForward className={`text-white/20 text-sm transition-transform ${showSettings ? "rotate-90" : ""}`} />
          </button>

          {showSettings && (
            <div className="px-4 py-3 bg-white/[0.02]">
              <div className="grid grid-cols-3 gap-2">
                {["96kbps", "160kbps", "320kbps"].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQualityChange(q)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      quality === q
                        ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current audio mode */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <IoColorPalette className="text-cyan-400 text-lg" />
            <span className="flex-1 text-white text-sm">Audio Mode</span>
            <span className="text-white/40 text-xs">{currentModeInfo?.icon} {currentModeInfo?.name}</span>
          </div>

          {/* Playback speed */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <IoSpeedometer className="text-orange-400 text-lg" />
            <span className="flex-1 text-white text-sm">Playback Speed</span>
            <span className="text-white/40 text-xs">{playbackSpeed}x</span>
          </div>

          {/* Library */}
          <button
            onClick={() => router.push("/library")}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
          >
            <IoHeart className="text-pink-400 text-lg" />
            <span className="flex-1 text-white text-sm text-left">Your Library</span>
            <IoChevronForward className="text-white/20 text-sm" />
          </button>

          {/* Discover */}
          <button
            onClick={() => router.push("/search")}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
          >
            <IoMusicalNotes className="text-fuchsia-400 text-lg" />
            <span className="flex-1 text-white text-sm text-left">Discover Music</span>
            <IoChevronForward className="text-white/20 text-sm" />
          </button>
        </div>
      </div>

      {/* About section */}
      <div className="px-5 mb-6">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2.5">About</h3>
        <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/5">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <IoInformationCircle className="text-blue-400 text-lg" />
            <span className="flex-1 text-white text-sm">Version</span>
            <span className="text-white/40 text-xs">1.0.0</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <IoShield className="text-green-400 text-lg" />
            <span className="flex-1 text-white text-sm">Storage Used</span>
            <span className="text-white/40 text-xs">
              {typeof window !== "undefined" ? `${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-5 pb-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 border border-accent-red/20 rounded-xl text-accent-red text-sm font-medium hover:bg-accent-red/10 transition-colors"
        >
          <IoLogOut className="text-base" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
