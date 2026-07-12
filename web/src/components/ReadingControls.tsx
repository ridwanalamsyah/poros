import { useEffect, useRef, useState } from "react";
import { useBookmarks } from "../hooks/useBookmarks";

export function ReadingControls({ slug, articleText }: { slug: string; articleText: string }) {
  const { has, toggle } = useBookmarks();
  const saved = has(slug);

  const [size, setSize] = useState<string>(() => {
    try {
      return localStorage.getItem("vc-text-size") ?? "1.08rem";
    } catch {
      return "1.08rem";
    }
  });
  const [serif, setSerif] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("vc-text-family");
      return v !== "sans";
    } catch {
      return true;
    }
  });
  const [speaking, setSpeaking] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const stoppedRef = useRef(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--reading-size", size);
    try {
      localStorage.setItem("vc-text-size", size);
    } catch {}
  }, [size]);

  useEffect(() => {
    document.documentElement.classList.toggle("font-sans-reading", !serif);
    try {
      localStorage.setItem("vc-text-family", serif ? "serif" : "sans");
    } catch {}
  }, [serif]);

  // Stop any playback if the user navigates away from the article.
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      audioRef.current?.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [slug]);

  function playNextChunk() {
    if (stoppedRef.current) return;
    const next = queueRef.current.shift();
    if (!next) {
      setSpeaking(false);
      return;
    }
    const audio = new Audio(`data:audio/mp3;base64,${next}`);
    audioRef.current = audio;
    audio.onended = playNextChunk;
    audio.onerror = () => {
      setAudioError("Audio gagal diputar.");
      setSpeaking(false);
    };
    audio.play().catch(() => {
      setAudioError("Audio gagal diputar.");
      setSpeaking(false);
    });
  }

  function speakWithBrowserFallback() {
    if (!("speechSynthesis" in window)) return;
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

  async function toggleSpeak() {
    if (speaking || loadingAudio) {
      stoppedRef.current = true;
      audioRef.current?.pause();
      audioRef.current = null;
      queueRef.current = [];
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeaking(false);
      setLoadingAudio(false);
      return;
    }

    setAudioError(null);
    stoppedRef.current = false;
    setLoadingAudio(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!data?.audioChunks?.length) throw new Error("No audio returned");

      queueRef.current = data.audioChunks;
      setLoadingAudio(false);
      setSpeaking(true);
      playNextChunk();
    } catch {
      // Google TTS not configured yet, or the request failed — fall back to
      // the browser's built-in voice so "Listen" still does something.
      setLoadingAudio(false);
      speakWithBrowserFallback();
    }
  }

  function bumpSize(d: number) {
    const cur = parseFloat(size);
    const next = Math.max(0.9, Math.min(1.5, parseFloat((cur + d).toFixed(2))));
    setSize(`${next}rem`);
  }

  return (
    <div className="flex flex-col gap-2 border-y rule-soft py-3 my-6">
      <div className="flex items-center justify-between gap-3 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <span className="kicker text-muted">SIZE</span>
          <button onClick={() => bumpSize(-0.05)} className="w-7 h-7 border rule-soft hover:bg-ink/[0.05]" aria-label="Smaller text">A−</button>
          <button onClick={() => bumpSize(0.05)} className="w-7 h-7 border rule-soft hover:bg-ink/[0.05]" aria-label="Larger text">A+</button>
          <button onClick={() => setSerif((s) => !s)} className="px-2 h-7 border rule-soft hover:bg-ink/[0.05]">
            {serif ? "Serif" : "Sans"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleSpeak} className="px-3 h-8 border rule-soft hover:bg-ink/[0.05] disabled:opacity-60" aria-pressed={speaking} disabled={loadingAudio}>
            {loadingAudio ? "Menyiapkan…" : speaking ? "■ Stop" : "▶ Listen"}
          </button>
          <button
            onClick={() => toggle(slug)}
            className={`px-3 h-8 border ${saved ? "bg-ink text-paper border-ink" : "rule-soft hover:bg-ink/[0.05]"}`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      {audioError && <p className="text-xs text-accent">{audioError}</p>}
    </div>
  );
}
