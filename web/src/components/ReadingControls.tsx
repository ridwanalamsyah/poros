import { useEffect, useState } from "react";
import { useBookmarks } from "../hooks/useBookmarks";

export function ReadingControls({ slug, articleText }: { slug: string; articleText: string }) {
  const { has, toggle } = useBookmarks();
  const saved = has(slug);

  const [size, setSize] = useState<string>(() => {
    try {
      return (
        localStorage.getItem("vc-text-size") ??
        localStorage.getItem("poros-text-size") ??
        "1.08rem"
      );
    } catch {
      return "1.08rem";
    }
  });
  const [serif, setSerif] = useState<boolean>(() => {
    try {
      const v =
        localStorage.getItem("vc-text-family") ??
        localStorage.getItem("poros-text-family");
      return v !== "sans";
    } catch {
      return true;
    }
  });
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--reading-size", size);
    try {
      localStorage.setItem("vc-text-size", size);
      localStorage.removeItem("poros-text-size");
    } catch {}
  }, [size]);

  useEffect(() => {
    document.documentElement.classList.toggle("font-sans-reading", !serif);
    try {
      localStorage.setItem("vc-text-family", serif ? "serif" : "sans");
      localStorage.removeItem("poros-text-family");
    } catch {}
  }, [serif]);

  function bumpSize(d: number) {
    const cur = parseFloat(size);
    const next = Math.max(0.9, Math.min(1.5, parseFloat((cur + d).toFixed(2))));
    setSize(`${next}rem`);
  }

  function toggleSpeak() {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(articleText);
    const voices = window.speechSynthesis.getVoices();
    const id = voices.find((v) => v.lang.toLowerCase().startsWith("id"));
    if (id) u.voice = id;
    u.rate = 1.0;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap text-sm border-y rule-soft py-3 my-6">
      <div className="flex items-center gap-2">
        <span className="kicker text-muted">SIZE</span>
        <button onClick={() => bumpSize(-0.05)} className="w-7 h-7 border rule-soft hover:bg-ink/[0.05]" aria-label="Smaller text">A−</button>
        <button onClick={() => bumpSize(0.05)} className="w-7 h-7 border rule-soft hover:bg-ink/[0.05]" aria-label="Larger text">A+</button>
        <button onClick={() => setSerif((s) => !s)} className="px-2 h-7 border rule-soft hover:bg-ink/[0.05]">
          {serif ? "Serif" : "Sans"}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleSpeak} className="px-3 h-8 border rule-soft hover:bg-ink/[0.05]" aria-pressed={speaking}>
          {speaking ? "■ Stop" : "▶ Listen"}
        </button>
        <button
          onClick={() => toggle(slug)}
          className={`px-3 h-8 border ${saved ? "bg-ink text-paper border-ink" : "rule-soft hover:bg-ink/[0.05]"}`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
