"use client";

import { useState, useEffect } from "react";
import { IoColorPalette, IoDiamond, IoReturnDownBack } from "react-icons/io5";

const THEMES = [
  { name: "Purple", value: "purple", color: "bg-purple-500" },
  { name: "Green", value: "green", color: "bg-green-500" },
  { name: "Blue", value: "blue", color: "bg-blue-500" },
  { name: "Pink", value: "pink", color: "bg-pink-500" },
  { name: "Orange", value: "orange", color: "bg-orange-500" },
  { name: "Cyan", value: "cyan", color: "bg-cyan-500" },
  { name: "Red", value: "red", color: "bg-red-500" },
  { name: "Amber", value: "amber", color: "bg-amber-500" },
];

const DESIGN_MODES = [
  { name: "Classic", value: "classic", description: "Original dark theme" },
  { name: "Holographic", value: "holographic", description: "3D glass with white/red/blue" },
];

const THEME_KEY = "amax_color_theme";
const DESIGN_KEY = "amax_design_mode";

export default function ThemePicker() {
  const [theme, setTheme] = useState("purple");
  const [design, setDesign] = useState("holographic");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || "purple";
    const savedDesign = localStorage.getItem(DESIGN_KEY) || "holographic";
    setTheme(saved);
    setDesign(savedDesign);
    document.documentElement.setAttribute("data-theme", saved);
    document.documentElement.setAttribute("data-design", savedDesign);
  }, []);

  const selectTheme = (value: string) => {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
    document.documentElement.setAttribute("data-theme", value);
  };

  const selectDesign = (value: string) => {
    setDesign(value);
    localStorage.setItem(DESIGN_KEY, value);
    document.documentElement.setAttribute("data-design", value);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all"
        title="Theme"
      >
        <IoColorPalette className="text-sm" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="absolute bottom-full mb-2 left-0 glass-card rounded-xl p-3 z-50 shadow-xl min-w-[220px]">
            {/* Design Mode Toggle */}
            <p className="text-white text-xs font-bold mb-2 flex items-center gap-1.5">
              <IoDiamond className="text-blue-400" />
              Design Mode
            </p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {DESIGN_MODES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => selectDesign(d.value)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    design === d.value
                      ? "bg-gradient-to-r from-blue-500 to-red-500 text-white shadow-lg"
                      : "glass text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-1 justify-center">
                    {d.value === "classic" && <IoReturnDownBack className="text-xs" />}
                    {d.value === "holographic" && <IoDiamond className="text-xs" />}
                    {d.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Color Theme */}
            <p className="text-white text-xs font-bold mb-2">Color Theme</p>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => selectTheme(t.value)}
                  className={`w-8 h-8 rounded-full ${t.color} transition-transform ${
                    theme === t.value ? "ring-2 ring-white scale-110" : "hover:scale-110"
                  }`}
                  title={t.name}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
