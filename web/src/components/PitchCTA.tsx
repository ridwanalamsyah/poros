import { Link } from "react-router-dom";

/** Prominent call-to-action inviting readers to pitch / contribute. */
export function PitchCTA({ className = "" }: { className?: string }) {
  return (
    <aside className={`section-rule bg-ink text-paper p-6 md:p-8 ${className}`}>
      <p className="kicker opacity-70">CONTRIBUTE</p>
      <h3 className="headline-display text-2xl md:text-3xl mt-2 leading-tight">
        Got a story we should run?
      </h3>
      <p className="mt-3 max-w-xl opacity-80">
        Velvet Collapse is built from the mess — by writers, photographers, and contributors across
        the scene. Send a short pitch; the editorial team reads every one.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/submit" className="bg-paper text-ink px-4 py-3 kicker hover:opacity-90">
          PITCH A STORY →
        </Link>
        <Link to="/letters" className="border border-paper/50 px-4 py-3 kicker hover:bg-paper/10">
          WRITE A LETTER
        </Link>
      </div>
    </aside>
  );
}
