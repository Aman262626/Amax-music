"use client";

import { useState, useEffect } from "react";
import { IoColorPalette } from "react-icons/io5";

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

const THEME_KEY = "amax_color_theme";

export default function ThemePicker() {
  const [theme, setTheme] = useState("purple");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || "purple";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const selectTheme = (value: string) => {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
    document.documentElement.setAttribute("data-theme", value);
    setShowPicker(false);
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
          <div className="absolute bottom-full mb-2 left-0 glass-card rounded-xl p-3 z-50 shadow-xl">
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
