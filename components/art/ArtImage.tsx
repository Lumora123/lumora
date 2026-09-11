"use client";

import Image from "next/image";
import { useState } from "react";
import TitleArt, { type TitleArtProps } from "./TitleArt";

/**
 * Artwork slot: uses an authorized remote image when the catalog provides one
 * (with broken-image fallback), otherwise renders deterministic brand art.
 */
export default function ArtImage({
  src,
  alt,
  sizes = "200px",
  priority,
  className,
  ...art
}: {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
} & Omit<TitleArtProps, "className">) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        onError={() => setFailed(true)}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <TitleArt {...art} className={className} />;
}
