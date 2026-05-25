import { useEffect } from "react";

type Props = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export function Lightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau gambar"
      className="fixed inset-0 z-[100] bg-ink/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="absolute top-4 right-4 text-paper kicker hover-underline"
      >
        TUTUP ×
      </button>
      <img
        src={src}
        alt={alt ?? ""}
        className="max-h-[90vh] max-w-[95vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {alt && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-paper byline italic max-w-[90vw] text-center">
          {alt}
        </p>
      )}
    </div>
  );
}
