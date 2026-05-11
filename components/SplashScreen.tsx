"use client";

import { useState, useEffect } from "react";
import SafeImage from "./SafeImage";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "welcome" | "done">("logo");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show logo for 2s, then welcome for 3s, then fade out
    const t1 = setTimeout(() => setPhase("welcome"), 2000);
    const t2 = setTimeout(() => setFadeOut(true), 5000);
    const t3 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 5800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin-slow"
          style={{
            background: "conic-gradient(from 0deg, #c026d3, #7c3aed, #c026d3, #ec4899, #c026d3)",
            opacity: 0.15,
          }}
        />
      </div>

      {/* Subtle particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-8">
        {phase === "logo" && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            {/* Logo */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 animate-scale-in">
              <SafeImage
                src="/icon-512x512.png"
                alt="AMAX Music"
                width={192}
                height={192}
                className="rounded-3xl shadow-2xl"
                style={{
                  boxShadow: "0 0 60px rgba(192, 38, 211, 0.4), 0 0 120px rgba(124, 58, 237, 0.2)",
                }}
                unoptimized
              />
            </div>

            {/* App name */}
            <div className="text-center">
              <h1
                className="text-4xl sm:text-5xl font-black tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #c026d3, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AMAX
              </h1>
              <p className="text-white/60 text-sm tracking-[0.3em] mt-1">MUSIC</p>
            </div>
          </div>
        )}

        {phase === "welcome" && (
          <div className="flex flex-col items-center gap-6 animate-fade-in max-w-sm">
            {/* Admin photo */}
            <div className="relative">
              <div
                className="absolute -inset-1 rounded-full animate-pulse"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #c026d3, #7c3aed)",
                  filter: "blur(8px)",
                  opacity: 0.6,
                }}
              />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/20">
                <SafeImage
                  src="/admin-photo-small.png"
                  alt="Aman Kumar"
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
              </div>
            </div>

            {/* Welcome text */}
            <div className="text-center space-y-3">
              <p className="text-white/50 text-xs tracking-[0.2em] uppercase">Created by</p>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #c026d3, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Aman Kumar
              </h2>
              <div className="space-y-2 pt-2">
                <p className="text-white/80 text-sm leading-relaxed">
                  Welcome to <span className="font-semibold text-white">AMAX Music</span> — where every beat tells a story.
                </p>
                <p className="text-white/50 text-xs leading-relaxed italic">
                  &quot;Music is the universal language of the soul. Let it speak to yours.&quot;
                </p>
              </div>
            </div>

            {/* Small logo at bottom */}
            <div className="flex items-center gap-2 mt-4">
              <SafeImage
                src="/icon-96x96.png"
                alt="AMAX"
                width={24}
                height={24}
                className="rounded-md"
                unoptimized
              />
              <span className="text-white/40 text-xs tracking-wider">AMAX MUSIC</span>
            </div>
          </div>
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={() => {
          setFadeOut(true);
          setTimeout(() => {
            setPhase("done");
            onComplete();
          }, 700);
        }}
        className="absolute bottom-8 text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors"
      >
        TAP TO SKIP
      </button>
    </div>
  );
}
