/** Convert a #rgb or #rrggbb hex string to a space-separated "r g b" triplet
 * for use with the `--accent-rgb` CSS variable. Returns null when invalid. */
export function hexToRgbTriplet(hex?: string): string | null {
  if (!hex) return null;
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
