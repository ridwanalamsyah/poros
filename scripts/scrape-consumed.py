#!/usr/bin/env python3
"""Scrape Consumed Magazine via WP-JSON, download featured images, emit mock data."""
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import hashlib

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15"
HEADERS = {
    "User-Agent": UA,
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://consumedmagazine.com/",
}
PUBLIC = "/home/ubuntu/poros/web/public/covers"
os.makedirs(PUBLIC, exist_ok=True)

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def fetch_json(url):
    return json.loads(fetch(url).decode("utf-8"))

def download_image(url, name):
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".jpg"
    if ext.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
        ext = ".jpg"
    path = os.path.join(PUBLIC, name + ext)
    rel = f"/covers/{name}{ext}"
    if not os.path.exists(path):
        try:
            data = fetch(url)
            with open(path, "wb") as f:
                f.write(data)
            print(f"  ✓ {rel} ({len(data)//1024} KB)", file=sys.stderr)
        except Exception as e:
            print(f"  ✗ {name}: {e}", file=sys.stderr)
            return None
    return rel

def strip_html(s):
    s = re.sub(r"<[^>]+>", "", s or "")
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def safe_slug(s, fallback):
    s = re.sub(r"[^a-z0-9-]+", "-", (s or "").lower()).strip("-")
    return s or fallback

def main():
    per_page = 30
    print(f"Fetching {per_page} posts from Consumed…", file=sys.stderr)
    posts = fetch_json(f"https://consumedmagazine.com/wp-json/wp/v2/posts?per_page={per_page}&_embed=true")
    print(f"  got {len(posts)} posts", file=sys.stderr)

    articles = []
    for p in posts:
        slug = p.get("slug") or f"post-{p.get('id')}"
        title = strip_html(p.get("title", {}).get("rendered"))
        excerpt = strip_html(p.get("excerpt", {}).get("rendered"))
        content_html = p.get("content", {}).get("rendered", "")
        plain_body = strip_html(content_html)
        date = p.get("date") or ""

        cover = None
        embedded = p.get("_embedded", {}) or {}
        media = (embedded.get("wp:featuredmedia") or [{}])[0]
        if isinstance(media, dict):
            src = (media.get("media_details", {}).get("sizes", {}).get("large", {}).get("source_url")
                   or media.get("source_url"))
            if src:
                key = hashlib.md5(slug.encode()).hexdigest()[:10]
                cover = download_image(src, f"{key}-{safe_slug(slug, key)[:40]}")

        author_name = ""
        authors = embedded.get("author") or []
        if authors:
            author_name = strip_html(authors[0].get("name") or "")

        cats = []
        terms = embedded.get("wp:term") or []
        for group in terms:
            for t in group:
                if t.get("taxonomy") == "category":
                    cats.append(strip_html(t.get("name") or ""))

        articles.append({
            "slug": slug,
            "title": title,
            "excerpt": excerpt[:200] if excerpt else (plain_body[:200] if plain_body else ""),
            "body": plain_body[:2000],
            "date": date,
            "cover": cover,
            "author": author_name or "Redaksi",
            "category": (cats[0] if cats else "Society"),
        })

    out = "/home/ubuntu/poros/scripts/consumed-articles.json"
    with open(out, "w") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {out} ({len(articles)} articles)", file=sys.stderr)
    print(f"Downloaded covers in {PUBLIC}", file=sys.stderr)

if __name__ == "__main__":
    main()
