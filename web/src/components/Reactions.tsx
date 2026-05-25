import { useEffect, useMemo, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";

const DEFAULT_LABELS = ["Like", "Dislike"] as const;

type Counts = Record<string, number>;
type State = { counts: Counts; picked: string | null };

const COUNTS_KEY = "vc-reaction-counts";
const PICKED_KEY = "vc-reaction-picked";
const LEGACY_COUNTS_KEY = "poros-reaction-counts";
const LEGACY_PICKED_KEY = "poros-reaction-picked";

function migrateOnce(): void {
  if (typeof window === "undefined") return;
  try {
    for (const [next, legacy] of [
      [COUNTS_KEY, LEGACY_COUNTS_KEY],
      [PICKED_KEY, LEGACY_PICKED_KEY],
    ] as const) {
      if (window.localStorage.getItem(next) !== null) continue;
      const old = window.localStorage.getItem(legacy);
      if (old !== null) {
        window.localStorage.setItem(next, old);
        window.localStorage.removeItem(legacy);
      }
    }
  } catch {
    // ignore
  }
}

function readMap(key: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    migrateOnce();
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function writeMap(key: string, value: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

function loadState(articleId: string): State {
  const countsMap = readMap(COUNTS_KEY);
  const pickedMap = readMap(PICKED_KEY);
  const counts = (countsMap[articleId] as Counts | undefined) ?? {};
  const picked = (pickedMap[articleId] as string | undefined) ?? null;
  return { counts, picked };
}

function persist(articleId: string, next: State) {
  const countsMap = readMap(COUNTS_KEY);
  const pickedMap = readMap(PICKED_KEY);
  countsMap[articleId] = next.counts;
  if (next.picked) {
    pickedMap[articleId] = next.picked;
  } else {
    delete pickedMap[articleId];
  }
  writeMap(COUNTS_KEY, countsMap);
  writeMap(PICKED_KEY, pickedMap);
}

export function Reactions({ articleId }: { articleId: string }) {
  const { data: settings } = useAsync(() => getSettings(), []);
  const labels = useMemo<string[]>(() => {
    const fromSettings = settings?.reactionLabels?.filter((s) => s && s.trim().length > 0);
    if (fromSettings && fromSettings.length > 0) return fromSettings;
    return [...DEFAULT_LABELS];
  }, [settings]);

  const [state, setState] = useState<State>({ counts: {}, picked: null });

  useEffect(() => {
    setState(loadState(articleId));
  }, [articleId]);

  function toggle(label: string) {
    setState((prev) => {
      const counts: Counts = { ...prev.counts };
      let picked: string | null = prev.picked;
      if (prev.picked === label) {
        counts[label] = Math.max(0, (counts[label] ?? 1) - 1);
        picked = null;
      } else {
        if (prev.picked) {
          counts[prev.picked] = Math.max(0, (counts[prev.picked] ?? 1) - 1);
        }
        counts[label] = (counts[label] ?? 0) + 1;
        picked = label;
      }
      const next: State = { counts, picked };
      persist(articleId, next);
      return next;
    });
  }

  return (
    <section className="mt-12 pt-8 border-t rule-soft" aria-label="Reader reactions">
      <p className="kicker text-muted mb-3">READER REACTIONS</p>
      <ul className="flex flex-wrap gap-2">
        {labels.map((label) => {
          const count = state.counts[label] ?? 0;
          const active = state.picked === label;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => toggle(label)}
                aria-pressed={active}
                className={`kicker tracking-[0.16em] border px-4 py-2 transition-colors ${
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
        Your reaction is stored in this browser. One reaction per article.
      </p>
    </section>
  );
}
