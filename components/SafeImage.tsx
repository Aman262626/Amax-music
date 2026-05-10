"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

const PLACEHOLDER = "/placeholder.svg";

type SafeImageProps = Omit<ImageProps, "onError"> & {
  fallback?: string;
};

export default function SafeImage({ src, fallback, alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback || PLACEHOLDER);

  return (
    <Image
      {...props}
      src={imgSrc || PLACEHOLDER}
      alt={alt || ""}
      onError={() => setImgSrc(fallback || PLACEHOLDER)}
    />
  );
}
