import { useCallback, useEffect, useState } from "react";

const KEY = "poros-theme";

export function useTheme(): { theme: "light" | "dark"; toggle: () => void } {
  const [theme, setTheme] = useState<"light" | "dark">(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return { theme, toggle };
}
