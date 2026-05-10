export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatCount(count: string | number | undefined): string {
  if (!count) return "0";
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function decodeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function getBestImage(images: { quality: string; url: string }[]): string {
  if (!images || images.length === 0) return "/placeholder.svg";
  const preferred = ["500x500", "400x400", "150x150", "50x50"];
  for (const q of preferred) {
    const found = images.find((img) => img.quality === q);
    if (found?.url) return found.url;
  }
  return images[images.length - 1]?.url || "/placeholder.svg";
}

export function getBestDownloadUrl(
  urls: { quality: string; url: string }[]
): string {
  if (!urls || urls.length === 0) return "";
  const preferred = ["320kbps", "160kbps", "96kbps", "48kbps", "12kbps"];
  for (const q of preferred) {
    const found = urls.find((u) => u.quality === q);
    if (found) return found.url;
  }
  return urls[urls.length - 1]?.url || "";
}

export function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
