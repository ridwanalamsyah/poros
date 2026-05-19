import { useCallback, useEffect, useState } from "react";

const KEY = "poros-cart";

export type CartLine = { slug: string; qty: number };

function read(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("poros-cart"));
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(read());
    const onUpdate = () => setLines(read());
    window.addEventListener("poros-cart", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("poros-cart", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const add = useCallback((slug: string, qty = 1) => {
    const current = read();
    const idx = current.findIndex((l) => l.slug === slug);
    if (idx >= 0) {
      current[idx] = { ...current[idx], qty: current[idx].qty + qty };
    } else {
      current.push({ slug, qty });
    }
    write(current);
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((l) => l.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    if (qty <= 0) return remove(slug);
    const current = read().map((l) => (l.slug === slug ? { ...l, qty } : l));
    write(current);
  }, [remove]);

  const clear = useCallback(() => write([]), []);

  const totalCount = lines.reduce((s, l) => s + l.qty, 0);

  return { lines, add, remove, setQty, clear, totalCount };
}
