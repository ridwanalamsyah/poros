import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const value = total > 0 ? (window.scrollY / total) * 100 : 0;
      setPct(Math.max(0, Math.min(100, value)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return <div className="reading-progress" style={{ width: `${pct}%` }} aria-hidden />;
}
