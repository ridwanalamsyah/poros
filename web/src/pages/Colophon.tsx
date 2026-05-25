import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";
import { SEO } from "../components/SEO";
import { PortableBody } from "../components/PortableBody";

export function ColophonPage() {
  const { data: settings } = useAsync(() => getSettings(), []);
  const colophon = settings?.colophon;
  const hasCustom = Array.isArray(colophon) && colophon.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO
        title="Colophon"
        description="Production credits for Velvet Collapse — who did what, the tech stack, and acknowledgements."
      />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">COLOPHON</p>
        <h1 className="headline-display text-4xl md:text-6xl mt-2">Production credits.</h1>
        <p className="text-muted mt-3 italic">
          The magazine is made by a small team in Bandung. This page lists who did what.
        </p>
      </header>

      {hasCustom ? (
        <PortableBody blocks={colophon} />
      ) : (
        <div className="article-body">
          <h2>Editorial</h2>
          <p>
            <strong>Raditya Fitra</strong> — Editor. Covers labour, platform economy, and social
            issues. Based in Bandung.
          </p>
          <p>
            <strong>Ridwan Alamsyah</strong> — Editor. Covers popular culture, underground music,
            and archives. Based in Bandung.
          </p>

          <h2>Production</h2>
          <p>
            Design, layout, and the site front-end are done in-house. The editorial studio runs on
            Sanity v3 as the CMS, with a custom desk to fit daily editor workflow. The front-end is
            built with React + Vite and deployed as a static bundle.
          </p>
          <p>
            Staff and freelance contributors are credited inside each article. Article cover
            photography is mostly contributor work; stock photography, when used, comes from
            Unsplash and is hand-picked by an editor.
          </p>

          <h2>Tech stack</h2>
          <ul>
            <li>Frontend: React 18 + Vite 5 + TypeScript + Tailwind CSS</li>
            <li>CMS: Sanity v3 (project lyo17dt8 / dataset production)</li>
            <li>Shop payments: DOKU (sandbox / production via backend endpoint)</li>
            <li>Comments: Cusdis embed</li>
            <li>Newsletter: Buttondown</li>
            <li>Sitemap, RSS, OG stubs generated at build time from Sanity / mock data</li>
          </ul>

          <h2>Funding</h2>
          <p>
            Velvet Collapse is independent. Not affiliated with any political party. Not affiliated
            with any large media company. Funding comes from print edition sales, merchandise in
            the <Link to="/shop">Shop</Link>, and reader contributions via Saweria / Trakteer /
            Patreon. Paid editorial collaborations are always transparently labeled in the article
            header.
          </p>

          <h2>Contact</h2>
          <p>
            Article pitches: <Link to="/submit">submit a pitch</Link>. Feedback for the editorial:{" "}
            <Link to="/letters">letters to editor</Link>. Collaboration, advertising, or correction
            requests: email the editorial (address listed in Sanity Settings).
          </p>
        </div>
      )}
    </div>
  );
}
