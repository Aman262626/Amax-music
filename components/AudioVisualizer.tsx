"use client";

interface AudioVisualizerProps {
  size?: "tiny" | "small" | "medium" | "large";
}

export default function AudioVisualizer({ size = "small" }: AudioVisualizerProps) {
  const heights = {
    tiny: { bars: "h-1 h-2 h-1.5 h-2.5", gap: "gap-[1px]", barW: "w-[2px]" },
    small: { bars: "h-1 h-2 h-1.5 h-3", gap: "gap-[2px]", barW: "w-[2px]" },
    medium: { bars: "h-2 h-4 h-3 h-5", gap: "gap-[2px]", barW: "w-[3px]" },
    large: { bars: "h-3 h-6 h-4 h-7", gap: "gap-[3px]", barW: "w-[4px]" },
  };

  const config = heights[size];

  const colors = {
    tiny: ["bg-spotify-green", "bg-spotify-green", "bg-spotify-green", "bg-spotify-green"],
    small: ["bg-spotify-green", "bg-accent-cyan", "bg-spotify-green", "bg-accent-purple"],
    medium: ["bg-spotify-green", "bg-accent-cyan", "bg-accent-purple", "bg-accent-pink"],
    large: ["bg-spotify-green", "bg-accent-cyan", "bg-accent-purple", "bg-accent-pink"],
  };

  const barColors = colors[size];

  return (
    <div className={`flex items-end ${config.gap}`}>
      <div className={`${config.barW} ${barColors[0]} rounded-full audio-bar-1`} />
      <div className={`${config.barW} ${barColors[1]} rounded-full audio-bar-2`} />
      <div className={`${config.barW} ${barColors[2]} rounded-full audio-bar-3`} />
      <div className={`${config.barW} ${barColors[3]} rounded-full audio-bar-4`} />
    </div>
  );
}
