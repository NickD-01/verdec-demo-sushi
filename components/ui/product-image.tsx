"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/images";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  fill = true,
  className,
  sizes,
  priority,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const isLocal = imgSrc.startsWith("/");

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      unoptimized={isLocal}
      className={cn("object-cover", className)}
      onError={() => {
        if (imgSrc !== PLACEHOLDER_IMAGE) setImgSrc(PLACEHOLDER_IMAGE);
      }}
    />
  );
}
