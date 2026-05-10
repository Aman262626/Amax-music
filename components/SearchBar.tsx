"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoSearch, IoClose } from "react-icons/io5";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = useCallback(
    (val: string) => {
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (val.trim()) {
          router.push(`/search?q=${encodeURIComponent(val.trim())}`);
        }
      }, 400);
    },
    [router]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative max-w-md w-full">
      <div className="relative flex items-center">
        <IoSearch className="absolute left-3 text-spotify-light-gray text-lg" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search songs, albums, artists..."
          className="w-full pl-10 pr-10 py-2.5 glass rounded-xl text-white text-sm placeholder-spotify-light-gray focus:outline-none focus:ring-1 focus:ring-spotify-green/50 transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 text-spotify-light-gray hover:text-white transition-colors"
          >
            <IoClose className="text-lg" />
          </button>
        )}
      </div>
    </div>
  );
}
