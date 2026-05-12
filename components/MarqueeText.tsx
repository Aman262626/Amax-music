"use client";

import { useRef, useEffect, useState } from "react";

interface MarqueeTextProps {
  text: string;
  className?: string;
}

export default function MarqueeText({ text, className = "" }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setShouldScroll(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <span
        ref={textRef}
        className={shouldScroll ? "inline-block marquee-scroll" : ""}
      >
        {text}
        {shouldScroll && <span className="mx-8">{text}</span>}
      </span>
    </div>
  );
}
