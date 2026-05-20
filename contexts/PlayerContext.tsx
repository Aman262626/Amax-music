"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import type { Song, RepeatMode } from "@/lib/types";
import { getBestDownloadUrl, shuffleArray } from "@/lib/utils";
import { addToHistory, getPreferredQuality, addListeningSeconds, getSavedVolume, setSavedVolume } from "@/lib/storage";
import { AudioEnhancer, type AudioMode } from "@/lib/audioEnhancer";

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  originalQueue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  isBuffering: boolean;
  playbackSpeed: number;
  sleepTimer: number;
  autoPlay: boolean;
  audioMode: AudioMode;

  playSong: (song: Song, songList?: Song[], index?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSleepTimer: (minutes: number) => void;
  toggleAutoPlay: () => void;
  setAudioMode: (mode: AudioMode) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleEndedRef = useRef<() => void>(() => {});
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [sleepTimer, setSleepTimerState] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [audioMode, setAudioModeState] = useState<AudioMode>("normal");
  const enhancerRef = useRef<AudioEnhancer | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      const savedVol = getSavedVolume();
      audio.volume = savedVol;
      audio.preload = "auto";
      audioRef.current = audio;
      setVolumeState(savedVol);
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => handleEndedRef.current();
    const onPlay = () => {
      setIsPlaying(true);
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "playing";
      }
    };
    const onPause = () => {
      setIsPlaying(false);
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track real listening time (save every 10 seconds while playing)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      addListeningSeconds(10);
    }, 10_000);
    return () => clearInterval(interval);
  }, [isPlaying]);


  const getStreamUrl = useCallback((song: Song): string => {
    if (!song.downloadUrl || song.downloadUrl.length === 0) return "";
    // Always try highest quality first (320kbps), then fall back to user preference
    const highest = song.downloadUrl.find((u) => u.quality === "320kbps");
    if (highest) return highest.url;
    const preferred = getPreferredQuality();
    const found = song.downloadUrl.find((u) => u.quality === preferred);
    if (found) return found.url;
    return getBestDownloadUrl(song.downloadUrl);
  }, []);

  const loadAndPlay = useCallback(
    async (song: Song) => {
      const audio = audioRef.current;
      if (!audio) return;
      const url = getStreamUrl(song);
      if (!url) return;

      audio.pause();
      audio.currentTime = 0;
      setCurrentSong(song);
      setProgress(0);
      setDuration(song.duration || 0);
      audio.src = url;
      audio.load();
      audio.playbackRate = playbackSpeed;

      try {
        await audio.play();
      } catch {
        const fallbackUrl = getBestDownloadUrl(song.downloadUrl);
        if (fallbackUrl && fallbackUrl !== url) {
          audio.src = fallbackUrl;
          audio.load();
          try { await audio.play(); } catch { /* final fallback failed */ }
        }
      }
      setIsPlaying(!audio.paused);
      addToHistory(song);

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.name,
          artist: song.artist,
          album: song.album,
          artwork: song.image
            ? [{ src: song.image, sizes: "500x500", type: "image/jpeg" }]
            : [],
        });
      }
    },
    [getStreamUrl, playbackSpeed]
  );

  const fetchSuggestions = useCallback(async (songId: string) => {
    try {
      const res = await fetch(`/api/songs/${songId}/suggestions`);
      const data = await res.json();
      if (data.songs && data.songs.length > 0) {
        const suggestions = data.songs as Song[];
        const nextSong = suggestions[0];
        setQueue((prev) => [...prev, ...suggestions]);
        setOriginalQueue((prev) => [...prev, ...suggestions]);
        setQueueIndex((prev) => prev + 1);
        loadAndPlay(nextSong);
      }
    } catch {
      // silently fail
    }
  }, [loadAndPlay]);

  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      setQueueIndex(nextIdx);
      loadAndPlay(queue[nextIdx]);
      return;
    }
    if (repeat === "all" && queue.length > 0) {
      setQueueIndex(0);
      loadAndPlay(queue[0]);
      return;
    }
    if (autoPlay && currentSong) {
      fetchSuggestions(currentSong.id);
      return;
    }
    setIsPlaying(false);
  }, [repeat, queue, queueIndex, autoPlay, currentSong, loadAndPlay, fetchSuggestions]);

  useEffect(() => {
    handleEndedRef.current = handleEnded;
  }, [handleEnded]);

  const playSong = useCallback(
    (song: Song, songList?: Song[], index?: number) => {
      if (songList && songList.length > 0) {
        const list = [...songList];
        const idx = index ?? list.findIndex((s) => s.id === song.id);
        setOriginalQueue(list);
        if (shuffle) {
          const before = list.filter((_, i) => i !== idx);
          const shuffled = [song, ...shuffleArray(before)];
          setQueue(shuffled);
          setQueueIndex(0);
        } else {
          setQueue(list);
          setQueueIndex(idx >= 0 ? idx : 0);
        }
      } else {
        setOriginalQueue([song]);
        setQueue([song]);
        setQueueIndex(0);
      }
      loadAndPlay(song);
    },
    [loadAndPlay, shuffle]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (nextIdx >= queue.length) {
      nextIdx = repeat === "all" ? 0 : queueIndex;
      if (repeat !== "all") {
        if (autoPlay && currentSong) {
          fetchSuggestions(currentSong.id);
        }
        return;
      }
    }
    setQueueIndex(nextIdx);
    loadAndPlay(queue[nextIdx]);
  }, [queue, queueIndex, repeat, loadAndPlay, autoPlay, currentSong, fetchSuggestions]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeat === "all" ? queue.length - 1 : 0;
    }
    setQueueIndex(prevIdx);
    loadAndPlay(queue[prevIdx]);
  }, [queue, queueIndex, repeat, loadAndPlay]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (enhancerRef.current) {
      enhancerRef.current.setUserVolume(vol);
    } else if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setSavedVolume(vol);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      if (!prev) {
        const current = queue[queueIndex];
        const rest = queue.filter((_, i) => i !== queueIndex);
        const shuffled = [current, ...shuffleArray(rest)];
        setQueue(shuffled);
        setQueueIndex(0);
      } else {
        const current = queue[queueIndex];
        const idx = originalQueue.findIndex((s) => s.id === current?.id);
        setQueue([...originalQueue]);
        setQueueIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }, [queue, queueIndex, originalQueue]);

  const toggleRepeat = useCallback(() => {
    setRepeat((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
    setOriginalQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => prev.filter((_, i) => i !== index));
      if (index < queueIndex) {
        setQueueIndex((prev) => prev - 1);
      }
    },
    [queueIndex]
  );

  const clearQueue = useCallback(() => {
    if (currentSong) {
      setQueue([currentSong]);
      setOriginalQueue([currentSong]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setOriginalQueue([]);
      setQueueIndex(-1);
    }
  }, [currentSong]);

  const playQueue = useCallback(
    (songs: Song[], startIndex = 0) => {
      setOriginalQueue(songs);
      if (shuffle) {
        const first = songs[startIndex];
        const rest = songs.filter((_, i) => i !== startIndex);
        setQueue([first, ...shuffleArray(rest)]);
        setQueueIndex(0);
        loadAndPlay(first);
      } else {
        setQueue(songs);
        setQueueIndex(startIndex);
        loadAndPlay(songs[startIndex]);
      }
    },
    [shuffle, loadAndPlay]
  );

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const setSleepTimer = useCallback((minutes: number) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerState(minutes);
    if (minutes > 0) {
      sleepTimerRef.current = setTimeout(() => {
        audioRef.current?.pause();
        setSleepTimerState(0);
      }, minutes * 60 * 1000);
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => !prev);
  }, []);

  const setAudioMode = useCallback((mode: AudioMode) => {
    setAudioModeState(mode);
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize enhancer if needed (no Web Audio API — just sets volume/effects)
    if (!enhancerRef.current) {
      enhancerRef.current = new AudioEnhancer();
      enhancerRef.current.init(audio);
    }
    enhancerRef.current.setMode(mode);
  }, []);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", resume);
      navigator.mediaSession.setActionHandler("pause", pause);
      navigator.mediaSession.setActionHandler("previoustrack", previous);
      navigator.mediaSession.setActionHandler("nexttrack", next);
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) seek(details.seekTime);
      });
    }
  }, [resume, pause, previous, next, seek]);

  // BroadcastChannel sync for multi-tab playback coordination
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("amax_player_sync");
    syncChannelRef.current = channel;

    channel.onmessage = (event) => {
      const { type } = event.data;
      if (type === "PLAY_STARTED") {
        audioRef.current?.pause();
      }
    };

    return () => {
      channel.close();
      syncChannelRef.current = null;
    };
  }, []);

  // Notify other tabs when this tab starts playing
  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    syncChannelRef.current?.postMessage({ type: "PLAY_STARTED", songId: currentSong.id });
  }, [isPlaying, currentSong]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        originalQueue,
        queueIndex,
        isPlaying,
        volume,
        progress,
        duration,
        shuffle,
        repeat,
        isBuffering,
        playbackSpeed,
        sleepTimer,
        autoPlay,
        audioMode,
        playSong,
        togglePlay,
        pause,
        resume,
        next,
        previous,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playQueue,
        setPlaybackSpeed,
        setSleepTimer,
        toggleAutoPlay,
        setAudioMode,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
