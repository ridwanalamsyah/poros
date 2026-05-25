import { useSettings } from "../hooks/useSettings";

export function TipJar({ compact = false }: { compact?: boolean }) {
  const s = useSettings();
  const links: { label: string; href?: string }[] = [
    { label: "Saweria", href: s.tipJarSaweria },
    { label: "Trakteer", href: s.tipJarTrakteer },
    { label: "Patreon", href: s.tipJarPatreon },
  ].filter((l) => !!l.href);
  if (links.length === 0) return null;
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="kicker text-muted">DUKUNG:</span>
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="hover-underline kicker">{l.label}</a>
        ))}
      </div>
    );
  }
  return (
    <section className="mt-12 pt-8 border-t rule-soft">
      <p className="kicker text-muted mb-2">DUKUNG KAMI</p>
      <p className="text-muted mb-4 max-w-2xl">Kalau tulisan ini berarti buat kamu, pertimbangin sumbangan satu kali atau bulanan. Bantu nutup biaya editorial.</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="border-2 border-accent text-accent px-4 py-2 kicker hover:bg-accent hover:text-paper transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
