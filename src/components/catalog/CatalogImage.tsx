"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  getFramedImageStyle,
  normalizeImageDisplay,
  type ImageDisplay,
} from "@/lib/imageDisplay";
import { hasStoredImage, resolveImageSrc } from "@/lib/upload/path";

type CatalogImageProps = {
  image?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  cacheKey?: number | string;
  /** Optional pan/zoom metadata from admin Set Image. */
  imageDisplay?: ImageDisplay | null;
  /**
   * How the photo fills the preview frame when no imageDisplay is set.
   * Defaults to cover for consistent square/thumbnail framing.
   */
  objectFit?: "cover" | "contain";
};

export function CatalogImage({
  image,
  alt,
  className,
  fill = false,
  cacheKey,
  imageDisplay,
  objectFit = "cover",
}: CatalogImageProps) {
  const src = hasStoredImage(image) ? resolveImageSrc(image, cacheKey) : "";
  const display = normalizeImageDisplay(imageDisplay);
  const resetKey = `${src}|${fill ? "fill" : "nofill"}|${objectFit}|${display?.zoom ?? ""}|${display?.x ?? ""}|${display?.y ?? ""}`;

  return (
    <CatalogImageInner
      key={resetKey}
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      imageDisplay={display}
      objectFit={objectFit}
    />
  );
}

function CatalogImageInner({
  src,
  alt,
  className,
  fill,
  imageDisplay,
  objectFit,
}: {
  src: string;
  alt: string;
  className?: string;
  fill: boolean;
  imageDisplay?: ImageDisplay;
  objectFit: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-brand-pink-lighter text-xs font-medium text-brand-muted",
          fill && "absolute inset-0",
          className,
        )}
      >
        No image
      </span>
    );
  }

  if (imageDisplay) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={getFramedImageStyle(imageDisplay)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        fill ? "absolute inset-0 h-full w-full" : "h-full w-full",
        objectFit === "contain"
          ? "object-contain object-center"
          : "object-cover object-[center_40%]",
        className,
      )}
      onError={() => setFailed(true)}
    />
  );
}
