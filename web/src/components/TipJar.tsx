import { useEffect, useRef, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";
import type { TipJarPlacement } from "../types";

type TipLink = { label: string; url: string };

type Variant = "footer" | "inline";

type TipJarProps = {
  variant?: Variant;
  /** When variant="footer", overrides the placement from Settings. Pass "force-stacked" to render the full stacked list regardless of admin setting (e.g. inside a right-column grid). */
  placementOverride?: TipJarPlacement | "force-stacked";
};

function useLinks() {
  const { data: settings } = useAsync(() => getSettings(), []);
  const heading = settings?.tipJarHeading?.trim() || "DUKUNG REDAKSI";
  const blurb =
    settings?.tipJarBlurb?.trim() ||
    "Kami mandiri. Sumbangan pembaca bikin Velvet Collapse Magazine bisa terus bayar penulis, fotografer, dan editor.";
  const placement: TipJarPlacement = settings?.tipJarPlacement ?? "button";

  const links: TipLink[] = [
    { label: "Saweria", url: settings?.tipJarSaweria ?? "" },
    { label: "Trakteer", url: settings?.tipJarTrakteer ?? "" },
    { label: "Patreon", url: settings?.tipJarPatreon ?? "" },
  ].filter((l) => l.url && l.url.trim().length > 0);

  return { heading, blurb, placement, links };
}

export function TipJar({ variant = "footer", placementOverride }: TipJarProps) {
  const { heading, blurb, placement: configured, links } = useLinks();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (links.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className="border rule-soft p-5">
        <p className="kicker text-accent">{heading}</p>
        <p className="text-muted mt-2 text-sm">
          Kalau tulisan ini berarti buatmu, pertimbangkan untuk menyumbang. Tidak wajib, tidak menjadi paywall.
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="kicker tracking-[0.18em] border border-ink/60 px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
              >
                {l.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const placement: TipJarPlacement | "force-stacked" = placementOverride ?? configured;

  if (placement === "hidden") return null;

  const stackedList = (
    <ul className="mt-4 flex flex-wrap items-center justify-center gap-3">
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="kicker tracking-[0.18em] border border-paper/40 px-4 py-2 hover:bg-paper hover:text-ink transition-colors"
          >
            {l.label.toUpperCase()}
          </a>
        </li>
      ))}
    </ul>
  );

  if (placement === "footer-center" || placement === "force-stacked") {
    return (
      <div className="mt-8 pt-6 border-t border-paper/15">
        <p className="kicker text-paper/70">{heading}</p>
        <p className="text-paper/75 text-sm mt-2 max-w-md mx-auto">{blurb}</p>
        {stackedList}
      </div>
    );
  }

  if (placement === "footer-right") {
    return (
      <div className="text-left">
        <p className="kicker text-paper/70">{heading}</p>
        <p className="text-paper/75 text-sm mt-2">{blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="kicker tracking-[0.18em] border border-paper/40 px-3 py-1.5 hover:bg-paper hover:text-ink transition-colors"
              >
                {l.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // placement === "button" (default)
  return (
    <div className="mt-8 pt-6 border-t border-paper/15 relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="kicker tracking-[0.18em] border border-paper/40 px-5 py-2 hover:bg-paper hover:text-ink transition-colors"
      >
        {heading}
        <span aria-hidden className="ml-2 text-paper/60">{open ? "—" : "+"}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="mt-3 mx-auto max-w-md text-paper/85 text-sm"
        >
          <p>{blurb}</p>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="kicker tracking-[0.18em] border border-paper/40 px-3 py-1.5 hover:bg-paper hover:text-ink transition-colors"
                >
                  {l.label.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
