import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";

export function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <SEO title="404 — Page not found" />
      <p className="kicker text-accent">404</p>
      <h1 className="headline-display text-5xl md:text-7xl mt-4 leading-[0.9]">The page you're looking for has moved, been deleted, or never existed.</h1>
      <p className="text-muted mt-4">If you're sure the link is correct, send a screenshot to <a className="underline" href="mailto:hello@velcolmagazine.com">hello@velcolmagazine.com</a>.</p>
      <Link to="/" className="kicker mt-8 inline-block hover-underline">← BACK TO HOME</Link>
    </div>
  );
}
