"use client";

import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { AUDIO_MODES, type AudioMode } from "@/lib/audioEnhancer";
import { IoMusicalNotes, IoClose } from "react-icons/io5";

export default function AudioModeSelector() {
  const { audioMode, setAudioMode } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);

  const currentModeInfo = AUDIO_MODES.find((m) => m.id === audioMode) || AUDIO_MODES[0];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all ${
          audioMode !== "normal"
            ? "text-spotify-green glow-green"
            : "text-spotify-light-gray hover:text-white"
        }`}
        title={`Audio Mode: ${currentModeInfo.name}`}
      >
        <IoMusicalNotes className="text-lg" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md mx-4 mb-28 sm:mb-0 glass-strong rounded-2xl overflow-hidden fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-white font-bold text-lg">Audio Mode</h3>
                <p className="text-spotify-light-gray text-xs mt-0.5">
                  Enhance your listening experience
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            {/* Mode grid */}
            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {AUDIO_MODES.map((mode) => (
                <ModeCard
                  key={mode.id}
                  mode={mode}
                  isActive={audioMode === mode.id}
                  onSelect={(id) => {
                    setAudioMode(id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>

            {/* Current mode indicator */}
            <div className="px-4 pb-4">
              <div className="glass rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{currentModeInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    Active: {currentModeInfo.name}
                  </p>
                  <p className="text-spotify-light-gray text-xs truncate">
                    {currentModeInfo.description}
                  </p>
                </div>
                {audioMode !== "normal" && (
                  <div className="w-2 h-2 bg-spotify-green rounded-full pulse-glow" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ModeCard({
  mode,
  isActive,
  onSelect,
}: {
  mode: (typeof AUDIO_MODES)[number];
  isActive: boolean;
  onSelect: (id: AudioMode) => void;
}) {
  const gradients: Record<AudioMode, string> = {
    normal: "from-gray-600 to-gray-800",
    ultra_hd: "from-yellow-400 to-amber-600",
    crystal_clear: "from-cyan-500 to-blue-600",
    "3d_surround": "from-purple-500 to-indigo-600",
    volume_boost: "from-red-500 to-orange-600",
    dj_mode: "from-pink-500 to-purple-600",
    bass_boost: "from-amber-500 to-red-600",
    vocal_boost: "from-emerald-500 to-teal-600",
    night_mode: "from-slate-600 to-indigo-900",
  };

  return (
    <button
      onClick={() => onSelect(mode.id)}
      className={`relative p-3 rounded-xl text-left transition-all ${
        isActive
          ? `bg-gradient-to-br ${gradients[mode.id]} ring-2 ring-white/30 shadow-lg scale-[1.02]`
          : "glass hover:bg-white/10"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl">{mode.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/90"}`}>
            {mode.name}
          </p>
          <p className={`text-xs mt-0.5 ${isActive ? "text-white/80" : "text-white/50"}`}>
            {mode.description}
          </p>
        </div>
      </div>
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
      )}
    </button>
  );
}
