#!/usr/bin/env python3
"""Generate web/src/data/mock.ts from scraped Consumed JSON.

Re-attributes content to Velvet Collapse, Bandung-flavored:
- Same titles + excerpts (Consumed is Indonesia-based too, mostly music/culture).
- Authors mapped to Velvet Collapse bylines.
- Categories: most → "culture" / "music" (new), interviews / city tags → "society", labor topics
  if any → "labor".
- Cover images use local /covers/*.jpg from the scraper.
"""
import json
import re
import sys

VC_AUTHORS = [
    ("auth-tirta", "Tirta Anggara", "tirta-anggara",
     "Jurnalis lepas berbasis Bandung. Menulis soal serikat pekerja dan ekonomi platform.",
     "tirtaanggara", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"),
    ("auth-rara", "Rara Sugiarti", "rara-sugiarti",
     "Editor Velvet Collapse. Sebelumnya menulis untuk Magdalene dan Project Multatuli.",
     "rarasugiarti", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"),
    ("auth-bagas", "Bagas Prasetyo", "bagas-prasetyo",
     "Fotografer dan penulis. Tinggal di Antapani, Bandung Timur.",
     "bagasprasetyo", "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400"),
    ("auth-mira", "Mira Wulansari", "mira-wulansari",
     "Mahasiswa antropologi Unpad yang menulis soal pasar dan ruang kota.",
     "", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"),
    ("auth-dirga", "Dirga Saputra", "dirga-saputra",
     "Penulis musik dan kontributor di kanal Bandung Underground Archive.",
     "dirgasaputra", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400"),
    ("auth-ima", "Ima Hidayanti", "ima-hidayanti",
     "Editor lepas. Menulis kolom budaya populer dan musik bawah tanah.",
     "imahidayanti", "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400"),
]


def pick_author(idx: int):
    return VC_AUTHORS[idx % len(VC_AUTHORS)]


def pick_category(title: str, excerpt: str) -> str:
    text = (title + " " + excerpt).lower()
    if any(k in text for k in ["track talk", "album", "ep", "band", "rilis", "musik", "hardcore", "metal", "punk", "post-punk"]):
        return "culture"
    if any(k in text for k in ["wawancara", "interview", "obrolan", "celoteh", "balcony", "dom 65", "the glad", "biohazard", "seinfeld"]):
        return "society"
    if any(k in text for k in ["kota", "tempat", "club", "party", "bandung", "lembang", "venue", "nongkrong"]):
        return "society"
    if any(k in text for k in ["industrial", "scene", "underground"]):
        return "culture"
    return "culture"


def pick_tags(title: str, excerpt: str) -> list:
    text = (title + " " + excerpt).lower()
    tags = []
    for kw in ["hardcore", "punk", "metal", "indonesia", "bandung", "yogyakarta", "rilisan", "wawancara", "indie", "underground"]:
        if kw in text:
            tags.append(kw)
    if not tags:
        tags = ["catatan", "esai"]
    return tags[:4]


def view_count(title: str, idx: int) -> int:
    base = 200 + (sum(ord(c) for c in title) % 1500)
    return base + idx * 67


def make_paragraphs(excerpt: str, body: str) -> list:
    parts = []
    if excerpt:
        parts.append(excerpt.strip())
    # Split body into 2-3 paragraphs of ~250 chars each, but cap length
    body_clean = re.sub(r"\s+", " ", (body or "").strip())
    if body_clean:
        chunks = re.split(r"(?<=[.!?])\s+(?=[A-Z“\"])", body_clean)
        buf = ""
        for s in chunks:
            buf += s + " "
            if len(buf) > 320:
                parts.append(buf.strip())
                buf = ""
                if len(parts) >= 5:
                    break
        if buf.strip() and len(parts) < 5:
            parts.append(buf.strip())
    if not parts:
        parts = ["[…]"]
    return parts


def escape_ts(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")


def main():
    with open("/home/ubuntu/velvet-collapse-magazine/scripts/consumed-articles.json") as f:
        scraped = json.load(f)

    articles_ts = []
    for i, a in enumerate(scraped):
        cat = pick_category(a["title"], a["excerpt"])
        author_idx = i % len(VC_AUTHORS)
        tags = pick_tags(a["title"], a["excerpt"])
        edition_ref = "mockEditions[0]" if i % 3 == 0 else ("mockEditions[1]" if i % 3 == 1 else "undefined")
        editors_pick = "true" if i < 6 else "false"
        views = view_count(a["title"], i)
        cover_path = a["cover"] or "/covers/placeholder.jpg"
        alt = escape_ts(a["title"][:80])
        title = escape_ts(a["title"])
        excerpt = escape_ts(a["excerpt"][:240])
        slug = a["slug"]
        date = (a["date"] or "2026-04-01T00:00:00").split("T")[0]

        body_parts = make_paragraphs(a["excerpt"], a["body"])
        body_arr = "[\n      " + ",\n      ".join(f'"{escape_ts(p)}"' for p in body_parts) + "\n    ]"

        cat_idx = {"labor": 0, "society": 1, "culture": 2, "music": 3}.get(cat, 2)

        entry = f"""  {{
    _id: "art-{i+1}",
    title: "{title}",
    slug: "{slug}",
    excerpt: "{excerpt}",
    coverImage: img("{cover_path}", "{alt}"),
    category: mockCategories[{cat_idx}],
    author: mockAuthors[{author_idx}],
    edition: {edition_ref},
    tags: {json.dumps(tags)},
    publishedAt: "{date}",
    editorsPick: {editors_pick},
    views: {views},
    body: longBody({body_arr}),
  }}"""
        articles_ts.append(entry)

    authors_ts = ",\n  ".join(
        f'{{ _id: "{a[0]}", name: "{escape_ts(a[1])}", slug: "{a[2]}", bio: "{escape_ts(a[3])}", twitter: "{a[4]}", image: img("{a[5]}", "{escape_ts(a[1])}") }}'
        for a in VC_AUTHORS
    )

    out = f'''import type {{ Article, Author, Category, Edition, Note, Product, Settings, SanityImage }} from "../types";

const img = (url: string, alt = ""): SanityImage =>
  ({{
    _type: "image",
    alt,
    _placeholderUrl: url,
    asset: {{ _ref: url, _type: "reference", metadata: {{ lqip: "" }} }},
  }}) as unknown as SanityImage;

export const mockCategories: Category[] = [
  {{ _id: "cat-labor", title: "LABOR", slug: "labor", description: "Suara dari ruang kerja Bandung dan sekitarnya — buruh, pekerja platform, hingga organisasi serikat.", sortOrder: 10 }},
  {{ _id: "cat-society", title: "SOCIETY", slug: "society", description: "Kondisi sosial Bandung dan kota-kota Jawa Barat — kebijakan, ruang publik, marjinalisasi.", sortOrder: 20 }},
  {{ _id: "cat-culture", title: "CULTURE", slug: "culture", description: "Esai, kritik, dan reportase soal musik, film, sastra, dan ekspresi populer dari Bandung.", sortOrder: 30 }},
  {{ _id: "cat-music", title: "MUSIC", slug: "music", description: "Kanal khusus untuk musik bawah tanah, ulasan rilisan, dan obrolan dengan band.", sortOrder: 40 }},
];

export const mockAuthors: Author[] = [
  {authors_ts}
];

export const mockEditions: Edition[] = [
  {{ _id: "ed-001", title: "Edisi 001 — Kota yang Berhenti Sopan", slug: "001-kota-yang-berhenti-sopan", issueNumber: "001", description: "Edisi perdana Velvet Collapse. Tentang Bandung yang sedang berdamai dengan dirinya sendiri.", publishedAt: "2026-03-01" }},
  {{ _id: "ed-002", title: "Edisi 002 — Para Pekerja Tanpa Kantor", slug: "002-pekerja-tanpa-kantor", issueNumber: "002", description: "Pekerja gig, freelancer, kurir di seputar Bandung Raya — siapa yang melindungi mereka.", publishedAt: "2026-04-15" }},
];

const longBody = (paragraphs: string[]): {{ _type: "block"; _key: string; style?: string; children: {{ _type: "span"; text: string }}[] }}[] =>
  paragraphs.map((p, i) => ({{
    _type: "block",
    _key: `b${{i}}`,
    style: "normal",
    children: [{{ _type: "span", text: p }}],
  }}));

export const mockArticles: Article[] = [
{",\n".join(articles_ts)},
];

export const mockNotes: Note[] = [
  {{ _id: "n1", body: "Sedang menyiapkan reportase tentang penutupan SDN di Antapani. Kalau ada warga yang anaknya kena dampak, DM kami.", author: mockAuthors[1], publishedAt: "2026-05-10" }},
  {{ _id: "n2", body: "Membaca ulang Pramoedya. Setiap kali balik, selalu menemukan kalimat yang sebelumnya seperti tidak ada.", author: mockAuthors[0], publishedAt: "2026-05-08" }},
  {{ _id: "n3", body: "Edisi 003 sudah masuk tahap editing. Tema: ruang-ruang yang menghilang di Bandung Utara.", author: mockAuthors[1], publishedAt: "2026-05-05" }},
];

export const mockProducts: Product[] = [
  {{ _id: "p1", title: "Velvet Collapse — Edisi 001", slug: "edisi-001", description: "Cetakan terbatas. 96 halaman, kertas matte 100gsm.", price: 85000, inStock: true, image: img("/covers/4a9cb24ad4-partying-in-nature-ketika-bersenang-sena.jpeg", "Velvet Collapse Edisi 001") }},
  {{ _id: "p2", title: "Velvet Collapse — Edisi 002", slug: "edisi-002", description: "Edisi tema pekerja platform. 104 halaman.", price: 85000, inStock: true, image: img("/covers/16fe1cae2d-remuk-siap-ledakan-ep-program-unit-hardc.jpeg", "Velvet Collapse Edisi 002") }},
  {{ _id: "p3", title: "Tote Bag Velvet Collapse", slug: "tote-bag", description: "Kanvas 12 oz, sablon manual di Bandung.", price: 95000, inStock: true, image: img("https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800", "Velvet Collapse tote bag") }},
  {{ _id: "p4", title: "Bundle Edisi 001 + 002", slug: "bundle-001-002", description: "Hemat Rp 25.000. Termasuk ongkir Bandung Raya.", price: 145000, inStock: true, image: img("/covers/c002238c40-the-only-way-to-end-q1-2026-check-out-so.jpg", "Velvet Collapse bundle") }},
];

export const mockSettings: Settings = {{
  siteTitle: "Velvet Collapse Magazine",
  siteDescription: "Velvet Collapse — majalah online dari Bandung. Labor · society · culture.",
  tipJarSaweria: "https://saweria.co/velcolmagazine",
  tipJarTrakteer: "https://trakteer.id/velcolmagazine",
  tipJarPatreon: "",
  cusdisAppId: "",
  newsletterEndpoint: "",
}};
'''
    with open("/home/ubuntu/velvet-collapse-magazine/web/src/data/mock.ts", "w") as f:
        f.write(out)
    print(f"Wrote mock.ts with {len(scraped)} articles", file=sys.stderr)


if __name__ == "__main__":
    main()
