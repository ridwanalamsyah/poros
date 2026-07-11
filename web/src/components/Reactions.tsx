import { useEffect, useMemo, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";

const DEFAULT_LABELS = ["Like", "Dislike"] as const;

const PICKED_KEY = "vc-reaction-picked";

function readPickedMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PICKED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writePicked(articleId: string, label: string | null) {
  if (typeof window === "undefined") return;
  try {
    const map = readPickedMap();
    if (label) map[articleId] = label;
    else delete map[articleId];
    window.localStorage.setItem(PICKED_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

export function Reactions({ articleId, initialCounts }: { articleId: string; initialCounts?: Record<string, number> }) {
  const { data: settings } = useAsync(() => getSettings(), []);
  const labels = useMemo<string[]>(() => {
    const fromSettings = settings?.reactionLabels?.filter((s) => s && s.trim().length > 0);
    if (fromSettings && fromSettings.length > 0) return fromSettings;
    return [...DEFAULT_LABELS];
  }, [settings]);

  const [counts, setCounts] = useState<Record<string, number>>(initialCounts ?? {});
  const [picked, setPicked] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCounts(initialCounts ?? {});
  }, [articleId, initialCounts]);

  useEffect(() => {
    setPicked(readPickedMap()[articleId] ?? null);
  }, [articleId]);

  async function toggle(label: string) {
    if (pending) return;
    const next = picked === label ? null : label;
    const previous = picked;

    // Optimistic UI update — feels instant, gets corrected if the request fails.
    const optimisticCounts = { ...counts };
    if (previous) optimisticCounts[previous] = Math.max(0, (optimisticCounts[previous] ?? 0) - 1);
    if (next) optimisticCounts[next] = (optimisticCounts[next] ?? 0) + 1;

    setCounts(optimisticCounts);
    setPicked(next);
    writePicked(articleId, next);
    setPending(true);
    setError(false);

    try {
      const res = await fetch("/api/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, next, previous }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data?.counts) setCounts(data.counts);
    } catch {
      // Roll back on failure so the count never lies about what's saved.
      setCounts(counts);
      setPicked(previous);
      writePicked(articleId, previous);
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-12 pt-8 border-t rule-soft" aria-label="Reader reactions">
      <p className="kicker text-muted mb-3">READER REACTIONS</p>
      <ul className="flex flex-wrap gap-2">
        {labels.map((label) => {
          const count = counts[label] ?? 0;
          const active = picked === label;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => toggle(label)}
                disabled={pending}
                aria-pressed={active}
                className={`kicker tracking-[0.16em] border px-4 py-2 transition-colors disabled:opacity-60 ${
                  active
                    ? "bg-ink text-paper border-ink"
                    : "border-ink/40 hover:bg-ink hover:text-paper"
                }`}
              >
                <span>{label.toUpperCase()}</span>
                <span className="ml-2 opacity-70">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted mt-3">
        {error ? "Reaksi gagal tersimpan, coba lagi." : "Reaksi tersimpan untuk semua pembaca."}
      </p>
    </section>
  );
}
