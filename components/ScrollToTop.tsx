"use client";

import { useState, useEffect } from "react";
import { IoChevronUp } from "react-icons/io5";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const handleScroll = () => {
      setShow(main.scrollTop > 400);
    };

    main.addEventListener("scroll", handleScroll);
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-36 lg:bottom-28 right-4 z-30 w-10 h-10 glass-strong rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg fade-in"
      title="Scroll to top"
    >
      <IoChevronUp className="text-lg" />
    </button>
  );
}
