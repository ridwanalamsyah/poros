import { useEffect } from "react";
import { createPortal } from "react-dom";
import { SmartImage } from "./SmartImage";
import type { SanityImage } from "../types";

type Props = {
  image: SanityImage;
  caption?: string;
  onClose: () => void;
};

export function Lightbox({ image, caption, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[80] bg-black/90 flex flex-col items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 kicker text-white/80 hover:text-white border border-white/40 px-3 py-1.5"
        aria-label="Close image viewer"
      >
        CLOSE
      </button>
      <figure
        className="max-w-[95vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[80vh] flex items-center">
          <SmartImage
            image={image}
            width={2200}
            className="max-h-[80vh] w-auto object-contain"
          />
        </div>
        {caption && (
          <figcaption className="byline italic text-white/80 mt-3 text-center max-w-3xl">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>,
    document.body,
  );
}
