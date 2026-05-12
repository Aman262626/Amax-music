"use client";

import { useState, useEffect } from "react";
import SafeImage from "./SafeImage";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "welcome" | "done">("logo");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("welcome"), 3000);
    const t2 = setTimeout(() => setFadeOut(true), 7000);
    const t3 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 7800);

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
            background: "conic-gradient(from 0deg, #c026d3, #22d3ee, #7c3aed, #ff6b9d, #c026d3, #60a5fa, #c026d3)",
            opacity: 0.15,
          }}
        />
      </div>

      {/* Grid lines for 3D depth */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(192,38,211,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(192,38,211,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "center top",
        }} />
      </div>

      {/* Holographic orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 orb bg-purple-600/25" />
        <div className="absolute bottom-1/4 right-1/4 w-36 h-36 orb bg-cyan-400/20" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-28 h-28 orb bg-pink-500/20" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/3 right-1/5 w-20 h-20 orb bg-blue-400/15" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 left-1/5 w-32 h-32 orb bg-fuchsia-500/15" style={{ animationDelay: "3s" }} />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              background: ["#c026d3", "#22d3ee", "#7c3aed", "#ff6b9d", "#60a5fa"][i % 5],
              opacity: 0.15 + Math.random() * 0.2,
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
          <div className="flex flex-col items-center gap-8 splash-enter">
            {/* 3D Holographic Logo */}
            <div className="relative splash-logo-3d">
              {/* Outer holographic rings */}
              <div className="absolute -inset-8 splash-ring-1">
                <div className="w-full h-full rounded-full border border-purple-500/20" />
              </div>
              <div className="absolute -inset-12 splash-ring-2">
                <div className="w-full h-full rounded-full border border-cyan-400/15" />
              </div>
              <div className="absolute -inset-16 splash-ring-3">
                <div className="w-full h-full rounded-full border border-pink-400/10" />
              </div>

              {/* Glow layers */}
              <div
                className="absolute -inset-4 rounded-3xl splash-glow"
                style={{
                  background: "conic-gradient(from 0deg, #c026d3, #22d3ee, #7c3aed, #ff6b9d, #c026d3)",
                  opacity: 0.3,
                  filter: "blur(20px)",
                }}
              />
              <div
                className="absolute -inset-2 rounded-3xl splash-glow-pulse"
                style={{
                  background: "radial-gradient(circle, rgba(192,38,211,0.4), transparent 70%)",
                }}
              />

              {/* Logo image with 3D effect */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 splash-logo-float">
                <SafeImage
                  src="/icon-512x512.png"
                  alt="AMAX Music"
                  width={208}
                  height={208}
                  className="rounded-3xl"
                  style={{
                    boxShadow: "0 0 40px rgba(192,38,211,0.5), 0 0 80px rgba(34,211,238,0.3), 0 0 120px rgba(124,58,237,0.2), 0 20px 60px rgba(0,0,0,0.6)",
                  }}
                  unoptimized
                />
                {/* Holographic shimmer on logo */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 splash-shimmer" style={{
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 38%, rgba(255,255,255,0.25) 42%, rgba(255,255,255,0.15) 46%, transparent 54%)",
                    backgroundSize: "200% 100%",
                  }} />
                </div>
              </div>
            </div>

            {/* App name with holographic text */}
            <div className="text-center splash-text-enter">
              <h1 className="text-5xl sm:text-6xl font-black tracking-wider gradient-text-holo splash-text-glow">
                AMAX
              </h1>
              <p className="text-white/40 text-sm tracking-[0.4em] mt-2 uppercase">
                Music Player
              </p>
              {/* Animated line under text */}
              <div className="mt-3 mx-auto splash-line-expand">
                <div className="h-[2px] rounded-full" style={{
                  background: "linear-gradient(90deg, transparent, #c026d3, #22d3ee, #c026d3, transparent)",
                }} />
              </div>
            </div>
          </div>
        )}

        {phase === "welcome" && (
          <div className="flex flex-col items-center gap-6 splash-enter max-w-sm">
            {/* Admin photo with 3D holographic 360° effect */}
            <div className="relative splash-admin-container">
              {/* 360° rotating holographic rings */}
              <div className="absolute -inset-6 splash-holo-ring-x">
                <div className="w-full h-full rounded-full border-2 border-transparent" style={{
                  borderImage: "linear-gradient(135deg, rgba(192,38,211,0.6), rgba(34,211,238,0.6), rgba(255,107,157,0.6)) 1",
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "rgba(192,38,211,0.4)",
                }} />
              </div>
              <div className="absolute -inset-10 splash-holo-ring-y">
                <div className="w-full h-full rounded-full" style={{
                  border: "1.5px solid rgba(34,211,238,0.3)",
                }} />
              </div>
              <div className="absolute -inset-14 splash-holo-ring-z">
                <div className="w-full h-full rounded-full" style={{
                  border: "1px solid rgba(124,58,237,0.2)",
                }} />
              </div>

              {/* Scanning light effect */}
              <div className="absolute -inset-4 rounded-full overflow-hidden">
                <div className="absolute inset-0 splash-scan-light" style={{
                  background: "conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(34,211,238,0.3) 85%, transparent 100%)",
                }} />
              </div>

              {/* Holographic glow behind photo */}
              <div
                className="absolute -inset-3 rounded-full splash-photo-glow"
                style={{
                  background: "conic-gradient(from 0deg, #ec4899, #c026d3, #7c3aed, #22d3ee, #ec4899)",
                  filter: "blur(15px)",
                  opacity: 0.5,
                }}
              />

              {/* Diamond particles around photo */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute splash-diamond-particle"
                  style={{
                    width: "4px",
                    height: "4px",
                    background: ["#c026d3", "#22d3ee", "#7c3aed", "#ff6b9d", "#60a5fa", "#ec4899", "#a855f7", "#06b6d4"][i],
                    borderRadius: "1px",
                    transform: `rotate(45deg) translate(${70 + Math.random() * 10}px)`,
                    top: "50%",
                    left: "50%",
                    animationDelay: `${i * 0.4}s`,
                    boxShadow: `0 0 6px ${["#c026d3", "#22d3ee", "#7c3aed", "#ff6b9d", "#60a5fa", "#ec4899", "#a855f7", "#06b6d4"][i]}`,
                  }}
                />
              ))}

              {/* Photo with 3D holographic border */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 splash-photo-3d">
                <div className="absolute inset-0 rounded-full splash-border-rotate" style={{
                  background: "conic-gradient(from 0deg, #ec4899, #c026d3, #7c3aed, #22d3ee, #60a5fa, #ec4899)",
                  padding: "3px",
                }} >
                  <div className="w-full h-full rounded-full bg-black" />
                </div>
                <div className="absolute inset-[3px] rounded-full overflow-hidden">
                  <SafeImage
                    src="/admin-photo-small.png"
                    alt="Aman Kumar"
                    fill
                    className="object-cover object-top"
                    unoptimized
                  />
                  {/* Holographic overlay on photo */}
                  <div className="absolute inset-0 splash-photo-shimmer" style={{
                    background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
                    backgroundSize: "200% 200%",
                  }} />
                </div>
              </div>
            </div>

            {/* Welcome text */}
            <div className="text-center space-y-3 splash-text-enter">
              <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase splash-label-glow">
                Created & Designed by
              </p>
              <h2 className="text-3xl sm:text-4xl font-black splash-admin-name">
                Aman Kumar
              </h2>
              <div className="space-y-2 pt-1">
                <p className="text-white/70 text-sm leading-relaxed">
                  Welcome to <span className="font-semibold text-white">AMAX Music</span> — where every beat tells a story.
                </p>
                <p className="text-white/40 text-xs leading-relaxed italic">
                  &quot;Music is the universal language of the soul.&quot;
                </p>
              </div>
            </div>

            {/* Small logo at bottom */}
            <div className="flex items-center gap-2 mt-2">
              <SafeImage
                src="/icon-96x96.png"
                alt="AMAX"
                width={20}
                height={20}
                className="rounded-md"
                unoptimized
              />
              <span className="text-white/30 text-[10px] tracking-[0.2em]">AMAX MUSIC v1.0</span>
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
        className="absolute bottom-8 text-white/20 text-xs tracking-wider hover:text-white/50 transition-colors"
      >
        TAP TO SKIP
      </button>
    </div>
  );
}
