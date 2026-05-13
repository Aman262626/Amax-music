"use client";

import { useState, useEffect } from "react";
import { IoCloudOffline, IoRefresh } from "react-icons/io5";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-red-600 to-orange-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm">
      <IoCloudOffline className="text-lg" />
      <span>You are offline. Some features may not work.</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <IoRefresh className="text-lg" />
      </button>
    </div>
  );
}
