import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Author } from "../types";
import { SmartImage } from "./SmartImage";

type Props = {
  author: Author;
  className?: string;
};

export function AuthorPopover({ author, className }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className={`relative inline-flex ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="hover-underline"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {author.name}
      </button>

      {open && (
        <span
          role="dialog"
          aria-label={`Tentang ${author.name}`}
          className="absolute left-0 top-full mt-2 z-40 w-72 bg-paper border rule-soft shadow-lg p-4 text-left"
          onMouseEnter={() => setOpen(true)}
        >
          <span className="flex items-start gap-3">
            <span className="w-12 h-12 rounded-full overflow-hidden bg-ink/[0.06] shrink-0 block">
              <SmartImage image={author.image} className="w-full h-full" width={120} />
            </span>
            <span className="flex-1 min-w-0 block">
              <span className="kicker text-muted block">PENULIS</span>
              <Link
                to={`/author/${author.slug}`}
                className="headline-display text-base mt-0.5 inline-block hover-underline"
              >
                {author.name}
              </Link>
            </span>
          </span>
          {author.bio && (
            <span className="mt-3 text-xs text-muted leading-snug line-clamp-4 block">
              {author.bio}
            </span>
          )}
          <Link
            to={`/author/${author.slug}`}
            className="kicker mt-3 inline-block hover-underline"
          >
            LIHAT SEMUA TULISAN →
          </Link>
        </span>
      )}
    </span>
  );
}
