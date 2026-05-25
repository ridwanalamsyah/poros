import { useEffect, useState } from "react";
import { getSettings } from "../data/api";
import type { Settings } from "../types";
import { mockSettings } from "../data/mock";

let cached: Settings | null = null;
let inflight: Promise<Settings> | null = null;

export function useSettings(): Settings {
  const [settings, setSettings] = useState<Settings>(cached ?? mockSettings);
  useEffect(() => {
    if (cached) {
      setSettings(cached);
      return;
    }
    if (!inflight) inflight = getSettings();
    inflight.then((s) => {
      cached = s;
      setSettings(s);
    });
  }, []);
  return settings;
}
