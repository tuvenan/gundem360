"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

export const DEFAULT_NEWS_IMAGE = "/uploads/default-news.jpg";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_NEWS_IMAGE,
  className = "",
  ...rest
}: SafeImageProps) {
  // src geçerli mi kontrol et
  const isValidSrc = typeof src === "string" && src.trim().length > 0;
  const initialSrc = isValidSrc ? src.trim() : fallbackSrc;

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState<boolean>(!isValidSrc);

  useEffect(() => {
    if (typeof src === "string" && src.trim().length > 0) {
      setImgSrc(src.trim());
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  }, [src, fallbackSrc]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt || "Gündem360 Haber Görseli"}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
