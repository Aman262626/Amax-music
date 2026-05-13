"use client";

import { useState, useEffect } from "react";
import { IoTime, IoClose } from "react-icons/io5";

const SEARCH_HISTORY_KEY = "amax_search_history";
const MAX_HISTORY = 10;

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const history = getSearchHistory().filter((q) => q !== trimmed);
  history.unshift(trimmed);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

export function clearSearchHistory(): void {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

interface Props {
  onSelect: (query: string) => void;
}

export default function SearchHistory({ onSelect }: Props) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const handleRemove = (query: string) => {
    const updated = history.filter((q) => q !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-bold">Recent Searches</h3>
        <button
          onClick={() => {
            clearSearchHistory();
            setHistory([]);
          }}
          className="text-white/40 text-xs hover:text-white transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((query) => (
          <button
            key={query}
            onClick={() => onSelect(query)}
            className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all group"
          >
            <IoTime className="text-xs text-white/40" />
            {query}
            <IoClose
              className="text-xs text-white/30 group-hover:text-white/60 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(query);
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
