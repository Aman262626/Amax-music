"use client";

const GENRE_COLORS: Record<string, string> = {
  hindi: "from-accent-orange to-accent-pink",
  english: "from-accent-blue to-accent-purple",
  punjabi: "from-fuchsia-500 to-accent-cyan",
  tamil: "from-yellow-500 to-accent-orange",
  telugu: "from-red-500 to-accent-pink",
  bengali: "from-green-500 to-accent-cyan",
  kannada: "from-accent-purple to-accent-blue",
  marathi: "from-amber-500 to-yellow-600",
  default: "from-spotify-green to-accent-cyan",
};

export default function GenreTag({ language }: { language?: string }) {
  if (!language) return null;

  const lang = language.toLowerCase();
  const gradient = GENRE_COLORS[lang] || GENRE_COLORS.default;

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${gradient} uppercase tracking-wider`}>
      {language}
    </span>
  );
}
