import { useEffect, useRef, useState } from "react";
import type { SanityImage } from "../types";
import { focalPointStyle, imageUrl, lqipFor } from "../sanity";

type Props = {
  image?: SanityImage;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: "lazy" | "eager";
  fit?: "cover" | "contain";
  fallbackUrl?: string;
};

export function SmartImage({ image, alt, className = "", width = 1200, height, loading = "lazy", fit = "cover", fallbackUrl }: Props) {
  const src = imageUrl(image, width, height) ?? fallbackUrl;
  const lqip = lqipFor(image);
  const focal = fit === "cover" ? focalPointStyle(image) : undefined;
  const ref = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  if (!src) {
    return <div className={`${className} bg-ink/[0.06]`} aria-label={alt} />;
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {lqip && !loaded && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: `url(${lqip})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(20px)", transform: "scale(1.05)" }}
        />
      )}
      <img
        ref={ref}
        src={src}
        alt={alt ?? image?.alt ?? ""}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={focal}
        className={`block w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"} ${loaded ? "image-loaded" : "image-blur"}`}
      />
    </div>
  );
}
