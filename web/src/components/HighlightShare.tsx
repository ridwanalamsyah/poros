import { useEffect, useRef, useState } from "react";

type Pos = { top: number; left: number } | null;

export type SavedHighlight = {
  id: string;
  text: string;
  title: string;
  slug?: string;
  url: string;
  ts: number;
};

const STORAGE_KEY = "vc-highlights-v1";

function loadHighlights(): SavedHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedHighlight[];
  } catch {
    return [];
  }
}

function saveHighlight(h: SavedHighlight) {
  const list = loadHighlights();
  list.unshift(h);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    // ignore quota errors
  }
}

export function getSavedHighlights(): SavedHighlight[] {
  return loadHighlights();
}

export function removeSavedHighlight(id: string) {
  const list = loadHighlights().filter((h) => h.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function HighlightShare({ containerRef, title, slug }: { containerRef: React.RefObject<HTMLElement>; title: string; slug?: string }) {
  const [pos, setPos] = useState<Pos>(null);
  const [text, setText] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onSelect() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { setPos(null); return; }
      const range = sel.getRangeAt(0);
      const container = containerRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) { setPos(null); return; }
      const rect = range.getBoundingClientRect();
      if (rect.width < 4) { setPos(null); return; }
      const selected = sel.toString().trim();
      if (selected.length < 8) { setPos(null); return; }
      setText(selected);
      setPos({ top: rect.top + window.scrollY - 10, left: rect.left + rect.width / 2 });
    }
    document.addEventListener("selectionchange", onSelect);
    return () => document.removeEventListener("selectionchange", onSelect);
  }, [containerRef]);

  if (!pos) return null;

  const url = typeof window !== "undefined" ? window.location.href : "";
  const quote = `"${text}" — ${title}\n${url}`;

  function save() {
    saveHighlight({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, title, slug, url, ts: Date.now() });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1400);
  }

  return (
    <div ref={popRef} className="hl-popover" style={{ top: pos.top, left: pos.left }} role="toolbar">
      <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(quote)}`, "_blank")}>WhatsApp</button>
      <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}`, "_blank")}>X</button>
      <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(quote)}`, "_blank")}>Telegram</button>
      <button onClick={() => navigator.clipboard.writeText(quote)}>Copy</button>
      <button onClick={save}>{savedFlash ? "Saved" : "Simpan"}</button>
    </div>
  );
}
