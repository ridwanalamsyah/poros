import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Pos = { top: number; left: number } | null;

export function HighlightShare({ containerRef, title, slug }: { containerRef: React.RefObject<HTMLElement>; title: string; slug?: string }) {
  const navigate = useNavigate();
  const [pos, setPos] = useState<Pos>(null);
  const [text, setText] = useState("");
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

  return (
    <div ref={popRef} className="hl-popover" style={{ top: pos.top, left: pos.left }} role="toolbar">
      <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(quote)}`, "_blank")}>WhatsApp</button>
      <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(quote)}`, "_blank")}>Telegram</button>
      {slug && (
        <button onClick={() => navigate(`/share/${slug}?q=${encodeURIComponent(text)}`)}>Instagram</button>
      )}
      <button onClick={() => navigator.clipboard.writeText(quote)}>Copy</button>
    </div>
  );
}
