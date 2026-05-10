"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { IoClose, IoPeople, IoCheckmarkCircle } from "react-icons/io5";

export default function PartyJoinHandler() {
  const searchParams = useSearchParams();
  const partyCode = searchParams.get("party");
  const [show, setShow] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const joinParty = useCallback(async () => {
    if (!partyCode) return;

    let deviceId = localStorage.getItem("amax_device_id");
    if (!deviceId) {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("amax_device_id", deviceId);
    }

    const ua = navigator.userAgent;
    let deviceName = "Browser";
    if (/iPhone/.test(ua)) deviceName = "iPhone";
    else if (/iPad/.test(ua)) deviceName = "iPad";
    else if (/Android.*Mobile/.test(ua)) deviceName = "Android Phone";
    else if (/Android/.test(ua)) deviceName = "Android Tablet";
    else if (/Macintosh/.test(ua)) deviceName = "Mac";
    else if (/Windows/.test(ua)) deviceName = "Windows PC";

    try {
      const res = await fetch(
        `/api/party?room=${partyCode.toUpperCase()}&deviceId=${deviceId}&deviceName=${encodeURIComponent(deviceName)}`
      );
      if (res.ok) {
        setJoined(true);
      } else {
        setError("Party not found or expired");
      }
    } catch {
      setError("Failed to join party");
    }
  }, [partyCode]);

  useEffect(() => {
    if (partyCode) {
      setShow(true);
      joinParty();
    }
  }, [partyCode, joinParty]);

  if (!show || !partyCode) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] glass-strong rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl fade-in max-w-xs">
      {joined ? (
        <>
          <IoCheckmarkCircle className="text-spotify-green text-xl flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Joined party!</p>
            <p className="text-spotify-light-gray text-xs">Code: {partyCode.toUpperCase()}</p>
          </div>
        </>
      ) : error ? (
        <>
          <IoPeople className="text-accent-red text-xl flex-shrink-0" />
          <p className="text-white text-sm">{error}</p>
        </>
      ) : (
        <>
          <IoPeople className="text-spotify-green text-xl flex-shrink-0 animate-pulse" />
          <p className="text-white text-sm">Joining party {partyCode.toUpperCase()}...</p>
        </>
      )}
      <button onClick={() => setShow(false)} className="text-white/50 hover:text-white ml-auto">
        <IoClose />
      </button>
    </div>
  );
}
