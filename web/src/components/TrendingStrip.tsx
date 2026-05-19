import { Link } from "react-router-dom";
import type { Article } from "../types";

export function TrendingStrip({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="border-y rule-soft py-3 md:py-4 bg-paper">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex items-center gap-4 md:gap-6">
        <span className="kicker shrink-0 text-accent tracking-[0.18em]">TRENDING NOW</span>
        <div className="flex gap-5 md:gap-8 overflow-x-auto no-scrollbar">
          {articles.slice(0, 6).map((a, i) => (
            <Link key={a._id} to={`/article/${a.slug}`} className="flex items-center gap-2 shrink-0 hover-underline text-[0.92rem] leading-tight">
              <span className="font-logo text-accent text-lg leading-none" style={{ fontFamily: "Pirata One, serif" }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="truncate max-w-[260px] md:max-w-[320px]">{a.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
