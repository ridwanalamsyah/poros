import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";

type TipLink = { label: string; url: string };

export function TipJar({ variant = "footer" }: { variant?: "footer" | "inline" }) {
  const { data: settings } = useAsync(() => getSettings(), []);

  const links: TipLink[] = [
    { label: "Saweria", url: settings?.tipJarSaweria ?? "" },
    { label: "Trakteer", url: settings?.tipJarTrakteer ?? "" },
    { label: "Patreon", url: settings?.tipJarPatreon ?? "" },
  ].filter((l) => l.url && l.url.trim().length > 0);

  if (links.length === 0) return null;

  if (variant === "footer") {
    return (
      <div className="mt-8 pt-6 border-t border-paper/15">
        <p className="kicker text-paper/70">DUKUNG REDAKSI</p>
        <p className="text-paper/75 text-sm mt-2 max-w-md mx-auto">
          Kami mandiri. Sumbangan pembaca bikin Velvet Collapse bisa terus bayar penulis, fotografer, dan editor.
        </p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="kicker tracking-[0.18em] border border-paper/40 px-4 py-2 hover:bg-paper hover:text-ink transition-colors"
              >
                {l.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="border rule-soft p-5">
      <p className="kicker text-accent">DUKUNG REDAKSI</p>
      <p className="text-muted mt-2 text-sm">
        Kalau tulisan ini berarti buatmu, pertimbangkan untuk menyumbang. Tidak wajib, tidak menjadi paywall.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="kicker tracking-[0.18em] border border-ink/60 px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
            >
              {l.label.toUpperCase()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
