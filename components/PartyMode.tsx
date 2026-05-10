"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  IoClose,
  IoPeople,
  IoCopy,
  IoPhonePortrait,
  IoDesktop,
  IoTabletPortrait,
  IoMusicalNotes,
  IoPlay,
  IoPause,
  IoCheckmark,
} from "react-icons/io5";

interface PartyDevice {
  id: string;
  name: string;
  lastSeen: number;
}

interface PartyRoom {
  id: string;
  hostId: string;
  songId: string | null;
  songName: string | null;
  songArtist: string | null;
  songImage: string | null;
  isPlaying: boolean;
  progress: number;
  devices: PartyDevice[];
  updatedAt: number;
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "unknown";
  let id = localStorage.getItem("amax_device_id");
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("amax_device_id", id);
  }
  return id;
}

function getDeviceName(): string {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/iPad/.test(ua)) return "iPad";
  if (/iPhone/.test(ua)) return "iPhone";
  if (/Android.*Mobile/.test(ua)) return "Android Phone";
  if (/Android/.test(ua)) return "Android Tablet";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Linux/.test(ua)) return "Linux PC";
  return "Browser";
}

function DeviceIcon({ name }: { name: string }) {
  const lc = name.toLowerCase();
  if (lc.includes("iphone") || lc.includes("android phone") || lc.includes("phone")) {
    return <IoPhonePortrait className="text-lg" />;
  }
  if (lc.includes("ipad") || lc.includes("tablet")) {
    return <IoTabletPortrait className="text-lg" />;
  }
  return <IoDesktop className="text-lg" />;
}

export default function PartyMode() {
  const { currentSong, isPlaying, playSong, togglePlay, progress } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<PartyRoom | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const deviceId = typeof window !== "undefined" ? getDeviceId() : "unknown";
  const deviceName = typeof window !== "undefined" ? getDeviceName() : "Unknown";

  const createRoom = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          deviceId,
          deviceName,
          hostId: deviceId,
          songId: currentSong?.id || null,
          songName: currentSong?.name || null,
          songArtist: currentSong?.artist || null,
          songImage: currentSong?.image || null,
          isPlaying,
          progress,
        }),
      });
      const data = await res.json();
      if (data.roomId) {
        setRoomId(data.roomId);
        setRoom(data.room);
        setIsHost(true);
      }
    } catch {
      setError("Failed to create party");
    }
  }, [currentSong, isPlaying, progress, deviceId, deviceName]);

  const joinRoom = useCallback(async () => {
    if (!joinCode.trim()) return;
    setError("");
    try {
      const res = await fetch(
        `/api/party?room=${joinCode.trim().toUpperCase()}&deviceId=${deviceId}&deviceName=${encodeURIComponent(deviceName)}`
      );
      if (!res.ok) {
        setError("Room not found");
        return;
      }
      const data = await res.json();
      setRoomId(data.id);
      setRoom(data);
      setIsHost(data.hostId === deviceId);
    } catch {
      setError("Failed to join party");
    }
  }, [joinCode, deviceId, deviceName]);

  const leaveRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave", roomId, deviceId }),
      });
    } catch {
      // ignore
    }
    setRoomId(null);
    setRoom(null);
    setIsHost(false);
  }, [roomId, deviceId]);

  const syncToRoom = useCallback(async () => {
    if (!roomId || !isHost) return;
    try {
      await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          roomId,
          deviceId,
          songId: currentSong?.id || null,
          songName: currentSong?.name || null,
          songArtist: currentSong?.artist || null,
          songImage: currentSong?.image || null,
          isPlaying,
          progress,
        }),
      });
    } catch {
      // ignore
    }
  }, [roomId, isHost, currentSong, isPlaying, progress, deviceId]);

  useEffect(() => {
    if (roomId && isHost) {
      syncToRoom();
    }
  }, [currentSong?.id, isPlaying, syncToRoom, roomId, isHost]);

  useEffect(() => {
    if (!roomId) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    let justLoadedSong = false;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/party?room=${roomId}&deviceId=${deviceId}&deviceName=${encodeURIComponent(deviceName)}`
        );
        if (!res.ok) {
          setRoomId(null);
          setRoom(null);
          return;
        }
        const data = await res.json();
        setRoom(data);

        if (!isHost && data.songId && data.songId !== currentSong?.id) {
          try {
            const songRes = await fetch(`/api/songs/${data.songId}`);
            const song = await songRes.json();
            if (song && !song.error) {
              playSong(song);
              justLoadedSong = true;
            }
          } catch {
            // ignore
          }
        }

        if (!isHost && !justLoadedSong && data.isPlaying !== isPlaying) {
          togglePlay();
        }
        justLoadedSong = false;
      } catch {
        // ignore
      }
    };

    pollRef.current = setInterval(poll, 3000);
    poll();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, deviceId, deviceName, isHost]);

  const handleCopyCode = useCallback(() => {
    if (!roomId) return;
    const link = `${window.location.origin}?party=${roomId}`;
    const shareText = `Join my AMAX Music party!\nCode: ${roomId}\nLink: ${link}`;
    if (navigator.share) {
      navigator.share({ title: "AMAX Party", text: shareText, url: link }).catch(() => {
        navigator.clipboard.writeText(shareText).catch(() => {});
      });
    } else {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all ${
          roomId
            ? "text-spotify-green"
            : "text-spotify-light-gray hover:text-white"
        }`}
        title="Party Mode"
      >
        <IoPeople className="text-lg" />
        {room && room.devices.length > 1 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-accent-pink rounded-full text-[8px] text-white font-bold flex items-center justify-center">
            {room.devices.length}
          </span>
        )}
      </button>

      {/* Party panel */}
      {isOpen && (
        <div className="fixed bottom-24 lg:bottom-[96px] right-4 w-80 sm:w-96 glass-strong rounded-xl shadow-2xl z-[90] fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <IoPeople className="text-spotify-green" />
              <span className="text-white font-semibold text-sm">
                {roomId ? "Party Active" : "Party Mode"}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <IoClose className="text-lg" />
            </button>
          </div>

          <div className="p-4">
            {!roomId ? (
              <>
                {/* Create or Join */}
                <p className="text-spotify-light-gray text-xs mb-4">
                  Listen together with friends! Create a party or join with a code.
                </p>

                <button
                  onClick={createRoom}
                  className="w-full py-2.5 bg-spotify-green text-black font-semibold rounded-xl text-sm hover:scale-[1.02] transition-transform mb-3"
                >
                  Create Party
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 glass rounded-xl text-white text-sm placeholder-spotify-light-gray focus:outline-none focus:ring-1 focus:ring-spotify-green/50 uppercase tracking-widest text-center"
                    maxLength={6}
                  />
                  <button
                    onClick={joinRoom}
                    className="px-4 py-2 bg-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/20 transition-colors"
                  >
                    Join
                  </button>
                </div>

                {error && (
                  <p className="text-accent-red text-xs mt-2">{error}</p>
                )}
              </>
            ) : (
              <>
                {/* Active party */}
                <div className="glass rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-spotify-light-gray text-xs">Party Code</span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 text-xs text-spotify-green hover:text-spotify-green/80 transition-colors"
                    >
                      {copied ? <IoCheckmark /> : <IoCopy />}
                      {copied ? "Copied!" : "Share"}
                    </button>
                  </div>
                  <p className="text-white text-2xl font-bold tracking-[0.3em] text-center">
                    {roomId}
                  </p>
                </div>

                {/* Now playing in party */}
                {room?.songName && (
                  <div className="glass rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-3">
                      {room.songImage && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={room.songImage}
                            alt={room.songName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate">
                          {room.songName}
                        </p>
                        <p className="text-spotify-light-gray text-xs truncate">
                          {room.songArtist}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {room.isPlaying ? (
                          <IoPlay className="text-spotify-green" />
                        ) : (
                          <IoPause className="text-spotify-light-gray" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Connected devices */}
                <div className="mb-3">
                  <p className="text-spotify-light-gray text-xs mb-2 flex items-center gap-1">
                    <IoMusicalNotes className="text-spotify-green" />
                    Connected Devices ({room?.devices.length || 0})
                  </p>
                  <div className="space-y-1.5">
                    {room?.devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center gap-2 px-3 py-2 glass rounded-lg"
                      >
                        <DeviceIcon name={device.name} />
                        <span className="text-white text-sm flex-1 truncate">
                          {device.name}
                        </span>
                        {device.id === room.hostId && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-spotify-green/20 text-spotify-green rounded-full font-medium">
                            HOST
                          </span>
                        )}
                        {device.id === deviceId && device.id !== room.hostId && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-accent-cyan/20 text-accent-cyan rounded-full font-medium">
                            YOU
                          </span>
                        )}
                        <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leave button */}
                <button
                  onClick={leaveRoom}
                  className="w-full py-2 glass text-accent-red text-sm font-medium rounded-xl hover:bg-accent-red/10 transition-colors"
                >
                  Leave Party
                </button>

                {isHost && (
                  <p className="text-spotify-light-gray text-[10px] text-center mt-2">
                    You are the host. Other devices sync to your playback.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
