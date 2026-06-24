"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/** next/image with a graceful fallback when the remote media fails to load. */
export function ProjectImage({
  src,
  fallback = "/no-image.png",
  alt,
  ...props
}: Omit<ImageProps, "src"> & { src: string; fallback?: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <Image
      src={errored || !src ? fallback : src}
      alt={alt}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
