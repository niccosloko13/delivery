"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK = "/images/products/product-fallback.jpg";

export function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
  loading,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "lazy" | "eager";
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const isSvg = useMemo(() => currentSrc.toLowerCase().endsWith(".svg"), [currentSrc]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      priority={priority}
      loading={loading}
      sizes={sizes}
      unoptimized={isSvg}
      onError={() => setCurrentSrc(FALLBACK)}
    />
  );
}
