import { useEffect, useState } from "react";
import { getReactions, incrementReaction } from "../data/api";
import type { Reactions } from "../types";

const KEY = "vc-reacted-v1";
function getReacted(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function setReacted(map: Record<string, string[]>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

const KINDS: { kind: keyof Reactions; emoji: string; label: string }[] = [
  { kind: "heart", emoji: "♥", label: "Heart" },
  { kind: "fire", emoji: "✷", label: "Fire" },
  { kind: "skull", emoji: "✕", label: "Skull" },
];

export function ReactionsBar({ articleId }: { articleId: string }) {
  const [counts, setCounts] = useState<Reactions>({ heart: 0, fire: 0, skull: 0 });
  const [used, setUsed] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getReactions(articleId).then(setCounts);
    setUsed(getReacted()[articleId] ?? []);
  }, [articleId]);

  async function react(kind: keyof Reactions) {
    if (used.includes(kind) || busy) return;
    setBusy(kind);
    const next = await incrementReaction(articleId, kind);
    setCounts(next);
    const map = getReacted();
    map[articleId] = [...(map[articleId] ?? []), kind];
    setReacted(map);
    setUsed(map[articleId]);
    setBusy(null);
  }

  return (
    <section className="mt-12 pt-8 border-t rule-soft">
      <p className="kicker text-muted mb-3">REACT</p>
      <div className="flex gap-2 flex-wrap">
        {KINDS.map(({ kind, emoji, label }) => {
          const active = used.includes(kind);
          return (
            <button
              key={kind}
              onClick={() => react(kind)}
              disabled={active || busy === kind}
              aria-label={label}
              className={`flex items-center gap-2 border px-4 py-2 transition-colors ${active ? "border-accent text-accent" : "rule-soft hover:bg-ink hover:text-paper"} disabled:cursor-default`}
            >
              <span className="text-lg leading-none">{emoji}</span>
              <span className="kicker">{counts[kind] ?? 0}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-3">Reaksi tersimpan agregat di Sanity. Satu reaksi per browser per artikel.</p>
    </section>
  );
}
