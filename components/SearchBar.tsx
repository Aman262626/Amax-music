"use client";

import { useState, useRef, useEffect } from "react";
import { IoSearch, IoClose } from "react-icons/io5";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "What do you want to listen to?",
  autoFocus = false,
  initialValue = "",
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 400);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-lg">
      <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-light-gray text-xl" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-spotify-gray text-white text-sm rounded-full pl-10 pr-10 py-3 placeholder:text-spotify-light-gray focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-light-gray hover:text-white"
        >
          <IoClose className="text-xl" />
        </button>
      )}
    </div>
  );
}
