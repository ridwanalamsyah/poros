import { useEffect } from "react";
import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";

export function Comments({ pageId, pageUrl, pageTitle }: { pageId: string; pageUrl: string; pageTitle: string }) {
  const { data: settings } = useAsync(() => getSettings(), []);
  const appId = settings?.cusdisAppId;

  useEffect(() => {
    if (!appId) return;
    const id = "cusdis-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.src = "https://cusdis.com/js/cusdis.es.js";
    document.body.appendChild(s);
  }, [appId]);

  if (!appId) {
    return (
      <div className="mt-12 pt-8 border-t rule-soft text-muted text-sm">
        Komentar belum diaktifkan. Editor bisa mengatur Cusdis App ID di Sanity Studio → Settings.
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t rule-soft">
      <h3 className="kicker mb-4">DISKUSI</h3>
      <div
        id="cusdis_thread"
        data-host="https://cusdis.com"
        data-app-id={appId}
        data-page-id={pageId}
        data-page-url={pageUrl}
        data-page-title={pageTitle}
      />
    </div>
  );
}
