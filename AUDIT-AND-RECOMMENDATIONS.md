# Velvet Collapse Magazine — Audit & Saran Komprehensif

**Tanggal**: 31 Mei 2026
**Disusun untuk**: Ridwan Alamsyah
**Status repo saat ini**: 4 PR merged (#19, #20, #21, #22) — dependency hygiene + logo center fix done. Belum implementasi fitur baru.

---

## TL;DR — Saran prioritas (urutan rekomendasi)

| # | Item | Effort | Impact | Tipe |
|---|------|--------|--------|------|
| 1 | **Fix image fitting + hotspot/focal point** | Kecil (1–2 jam) | Tinggi (visual quality) | Bug fix |
| 2 | **Reconnect Vercel + Sanity Studio deploy** (resolve 404) | Manual user action | Critical | Ops |
| 3 | **Move /covers/* (21 MB local) → Sanity Asset CDN** | Sedang | Tinggi (perf, deploy size) | Tech |
| 4 | **Wordmark identity refresh** (lean ke zine vibe) | Kecil | Tinggi (brand) | Design |
| 5 | **Homepage typographic refactor** (display headlines lebih besar, asymmetric grid) | Sedang | Tinggi (vibe) | Design |
| 6 | **Issue/Edition viewer** (PDF/longform reader) | Sedang | Sedang | Feature |
| 7 | **Audio interview / podcast feed** | Sedang | Sedang | Feature |
| 8 | **Pitch & Letter form prominence** + visible kontributor CTA | Kecil | Sedang | UX |
| 9 | **Tests + monitoring** (Vitest, Playwright, Sentry, analytics) | Sedang | Tinggi (reliability) | Tech |
| 10 | **Security: Sanity write token → CF Worker + Turnstile + CSP** | Besar | Critical | Security |

Detail di bawah.

---

## 1. State of the site — apa yang udah works, apa yang belum

### Yang sudah kuat
- **Editorial info architecture**: Articles, Authors, Categories, Editions, Notes, Tags, Shop, Submit, Letters, Saved, Cart, Colophon — semua routes ada. Sanity Studio sudah ada singleton untuk Settings + Homepage layout config.
- **Typography stack**: Fraunces (display serif), Inter (sans), Pirata One (logo). Solid editorial choice — exactly the kind of pairing The Quietus / Pitchfork / Crack Magazine pakai.
- **Color system**: Ink (`#0D0D0D`), Paper (`#FFFFFF`), Accent merah (`#C1272D`). Cleanly tokenized via CSS vars. Dark mode pakai swap variable, bukan rewrite — bagus.
- **Reading experience**:
  - Reading progress bar
  - Font size / serif-vs-sans toggle
  - Highlight & share (pop-over) — feature mahal yang udah jadi
  - Related articles
  - Reactions
  - Comments (Cusdis embedded)
  - Margin notes for desktop
  - Pull quotes, callouts, drop caps, footnotes
- **A11y groundwork**: skip link, 44×44 tap targets, `prefers-reduced-motion`, focus rings, ARIA on icon buttons. Bagus banget.
- **CMS-driven layout**: Editor bisa drag-reorder section homepage + ganti hero article via Settings singleton. Powerful.

### Yang masih lemah / broken
- **Image fitting**: penyebab pasti di bawah. Singkatnya: hotspot di-set di Sanity tapi nggak dipakai pas build URL → semua gambar di-center-crop blindly.
- **Vercel `velvet-collapse-magazine.vercel.app` → 404** (NOT_FOUND). Project Vercel kemungkinan di-delete pas import ulang GitHub repo. Perlu re-link manual.
- **Sanity Studio `velvet-collapse-magazine.sanity.studio` → 404** ("Studio not found"). Perlu `sanity deploy` ulang dari folder studio.
- **Bundle size lokal**: `/covers/` di repo 21 MB. Ini ke-bundle ke Vercel build (slow deploy, gak ada CDN benefit). Sanity Asset CDN udah aktif — harusnya dipindah.
- **Sanity write token** (`VITE_SANITY_WRITE_TOKEN`) ada di env client → exposed di browser. Risk: orang lain bisa pakai token kamu untuk write ke dataset.
- **Tests**: zero. Vitest configured tapi belum ada test. Playwright belum.
- **Monitoring/analytics**: Sentry config ada di code (placeholder DSN), Plausible/Umami/dll belum.

---

## 2. Image fitting — diagnosis lengkap

Ini bagian yang kamu nanyain ("kalau gambarnya engga ngefit").

**Root cause** (3 layer):

1. **Layer Sanity** — schema `coverImage` sudah `options: { hotspot: true }` ✓ (editor bisa drag titik focal di Studio).
2. **Layer URL builder** (`web/src/sanity.ts` line 22):
   ```ts
   const b = urlFor(image);
   return b ? b.width(w).auto("format").quality(80).url() : undefined;
   ```
   **Cuma `.width()`** — gak ada `.height()` + `.fit('crop')` + `.crop('focalpoint')`. Berarti Sanity ngasih original aspect ratio, hotspot di-ignore.
3. **Layer CSS** (`web/src/components/SmartImage.tsx` line 38):
   ```tsx
   className={`block w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
   ```
   `object-cover` selalu **center-crop**, gak respect hotspot. Subject di pinggir kepotong.

**Plus**: aspect ratio per variant nggak konsisten:
- Hero: `aspect-[16/10] sm:aspect-[16/9]` (landscape lebar)
- Feature: `aspect-[4/3]` (landscape moderate)
- Compact/Row: `w-24 h-24` (square)

Cover yang upload dengan aspect-ratio random (portrait vs landscape vs square) bakal crop beda-beda di tiap variant — gak ada way untuk editor preview.

**Fix yang aku rekomendasiin (1–2 jam kerja)**:

**A. Pass hotspot ke URL builder + ke CSS:**
```ts
// web/src/sanity.ts
export function imageUrl(image, { w, h }: { w: number; h?: number } = { w: 1200 }) {
  if (!image) return undefined;
  let b = urlFor(image)?.width(w).auto("format").quality(80);
  if (h) b = b?.height(h).fit("crop").crop("focalpoint");
  return b?.url();
}

export function focalPointStyle(image) {
  const hot = image?.hotspot;
  if (!hot) return undefined;
  return { objectPosition: `${hot.x * 100}% ${hot.y * 100}%` };
}
```

**B. SmartImage pakai style + matched dimensions:**
```tsx
<img
  src={imageUrl(image, { w, h })}
  style={focalPointStyle(image)}
  className="block w-full h-full object-cover ..."
/>
```

**C. Tambahin editor guidance di schema:**
```ts
description: "Min 2400×1600. Drag hotspot ke wajah/subjek utama supaya gak kepotong di thumbnail."
```

**D. Optional: kasih editor preview crop di Studio** lewat `media` plugin atau custom preview component.

Hasil: gambar bakal di-server-crop di Sanity (smaller payload), focal point dihormati, dan object-position di-CSS jadi safety net kalau client size beda dari yang di-request.

---

## 3. Design audit — vibe "Consumed Magazine / underground media"

**Konteks**: Consumed Magazine (UK indie, post-punk/noise/experimental scene) — minimalis monokrom dengan satu accent warna, headline serif besar, single-column reading flow, white space yang luas, gak ada animasi/transisi yang ke-show-off. Vibe-nya "editorial as architecture" — confident, gak butuh dekorasi.

### A. Wordmark & identity
- **Current**: "Velvet Collapse" pakai Pirata One (blackletter-ish), centered, dengan kicker "MAGAZINE".
- **Saran**:
  - Pirata One agak "Halloween" feel. Untuk underground music/post-punk vibe yang kamu maksud, pertimbangkan:
    - **Custom hand-drawn / brutalist logo** (1 SVG file, di-commission ke illustrator IDR 500k–1.5jt sekali) — paling autentik
    - Atau switch ke **typeface yang lebih editorial-zine**: PP Editorial Old, Migra, Sligoil, Apoc Revelations (Pangram Pangram), atau even custom display variant of Fraunces dengan letter-spacing -3%
  - Logo bisa kasih sedikit "wear" (subtle paper texture, slightly off-baseline) — bikin feel kayak letterpress
  - Tagline current "Built from the mess" — kuat, biarin. Bisa kasih dia ruang sendiri di top hero (kayak masthead)

### B. Typography hierarchy
- **Current**: hero headline `text-4xl → text-7xl` (Fraunces 0.96 line-height, -3% letter-spacing) — udah bagus
- **Saran**:
  - Headlines **lebih besar lagi** di desktop (`text-8xl` atau bahkan custom 9rem) — magazine confidence
  - Pakai **tighter leading** (`leading-[0.9]`) di hero
  - Add **deck/subhead** style (sized antara headline dan body, italic Fraunces) — sekarang excerpt langsung pakai sans
  - Body reading: bagus, Fraunces 1.08rem / 1.65 line-height — leave it

### C. Layout & spacing
- **Current**: grid 3-column convensional, container `max-w-5xl` mostly center-aligned, generous vertical rhythm
- **Saran**:
  - **Asymmetric grid hero**: hero image 60% width, headline overlap ke kanan 40%. Atau hero full-bleed (`w-screen` breakout) dengan headline di bottom-left ala billboard
  - **Heavy ruled lines**: sekarang `rule-soft` 18% opacity. Coba `border-t-2 border-ink` di section header untuk dignified weight
  - **Sidebar ratio**: feed 2/3 + sidebar 1/3 sekarang ya? Coba balance ke 3/4 + 1/4 atau split-screen 50/50 untuk dramatic spread di edition viewer
  - **Whitespace**: tambah breathing room antar section (`mt-20` → `mt-32`) di desktop

### D. Color & texture
- **Current**: monokrom + 1 accent (`#C1272D`)
- **Saran**:
  - Accent merah udah perfect — TIDAK perlu ganti
  - Tambahin **paper grain texture** di body bg (subtle SVG/PNG, 8–10% opacity, fixed background)
  - **Halftone dot patterns** untuk decorative dividers
  - Per-edition **color accent override**: setiap edition bisa punya warna sendiri (issue 001 = merah, 002 = cyan, etc.). Toggle via Sanity. Bikin tiap issue feel distinct.
  - Dark mode: sekarang inverted langsung. Coba mood "newsprint" — bg `#0a0a0c` (sedikit blue-tint biru-hitam) instead of pure `#0D0D0D`

### E. Image treatment
- Selain hotspot fix di section 2, pertimbangkan:
  - **B&W default for thumbnails**, color saat hover (newsroom classic)
  - **Halftone overlay** untuk hero image opsi (CSS filter atau pre-processed)
  - **Caption typography**: italic Fraunces 0.78rem (sekarang Inter italic) — lebih editorial

### F. Interaction
- **Current**: hover scale `1.03` smooth, dark/light toggle, sticky header
- **Saran**:
  - **Cursor reactions**: gak perlu fancy cursor, tapi pertimbangkan **invert cursor on dark images** (mix-blend-mode)
  - **Pull-quote modal**: klik pull-quote → expand jadi share card
  - **Reading time on hover**: muncul slowly di article cards
  - Hindari **flash transitions** atau bouncy animation — itu malah ngerusak vibe editorial
  - **Page transitions**: optional, pakai `view-transition-name` API (modern Chrome) untuk fade headline saat navigate — subtle, magazine-quality

---

## 4. Features audit — apa yang ada, apa yang kurang

### Yang sudah dibangun
- Article reader (longform, blocks, footnotes, callouts, pullquotes, embed, image+caption)
- Categories (LABOR, SOCIETY, CULTURE, MUSIC)
- Editions (issue-based)
- Notes (short notebook entries)
- Shop (products dengan price, gallery, specs, DOKU payment)
- Cart
- Saved articles (localStorage)
- Submit pitch / letter forms
- Newsletter signup form
- Tip jar (Saweria/Trakteer/Patreon)
- Author pages
- Tag pages
- Search (icon ada di header)
- Share + highlight & share
- Reactions (likes/emojis)
- Comments (Cusdis)
- RSS feed
- SEO meta
- Sitemap (di scripts/)
- Reading controls (font size, serif/sans toggle, reading progress)

### Yang missing (high-value untuk underground media magazine)
1. **Issue/Edition reader** — sekarang Edition cuma list articles. Untuk feel "buka majalah", kasih:
   - Cover art besar
   - Editor's letter (sudah ada di schema?)
   - Table of contents
   - Tombol "READ NEXT" yang traversal antar artikel dalam satu edition
   - Optional: PDF/EPUB export untuk download
2. **Audio interview / podcast feed**: schema `episode` baru dengan title, guest, audio file (Sanity asset), notes, transcript. Embed player. Distribute ke Spotify/Apple via RSS-to-podcast generator.
3. **Live blog / event coverage**: schema `liveBlog` dengan timestamped entries — buat coverage gig/festival real-time
4. **Mixtape / playlist embed**: dedicated section untuk Spotify/Soundcloud/Bandcamp embeds (sekarang lewat embed block, bisa di-curate jadi section)
5. **Contributor profiles + open call**: prominent "PITCH US" button di nav, halaman `/contribute` dengan guidelines + pay rate (kalau ada)
6. **Tag clouds + topic series**: artikel grouped ke "series" multi-part (e.g., "Bandung Skena Diary" — 5 episodes)
7. **Archive page**: chronological list semua artikel (kayak `/archive/2025-10`)
8. **From the archive**: random old artikel di footer/sidebar — bikin discovery
9. **Print run / merch drops**: kalau shop mau lean ke zine printing/vinyl, kasih countdown timer + "pre-order" workflow
10. **Calendar / event listings**: schema `event` (date, venue, lineup, ticket link)
11. **Comments moderation queue di Studio**: Cusdis embed bagus, tapi kalau mau full control bikin schema `comment` sendiri (custom CF Worker submit endpoint)
12. **Reader letters / Surat pembaca**: udah ada Letters schema — kasih dedicated `/letters` page (sekarang `/letters` cuma form)
13. **Bilingual support**: artikel campur Indo+English. Kasih `lang` field di schema, filter homepage by lang, RSS feed per-language
14. **Save-for-later cross-device**: sekarang localStorage only. Bikin Sanity-backed reading list per-user (butuh login → bisa lewat magic link / Discord OAuth / email)
15. **"Drop" notifications**: kalau ada print issue baru, email blast otomatis (Buttondown / Listmonk / Resend)

### Lower priority
- AI summarization per artikel
- Personalized recommendations
- Forum / discussion thread
- Member-only content (paywall)

---

## 5. Tech stack assessment

| Layer | Current | Verdict | Notes |
|-------|---------|---------|-------|
| Build | Vite 8 | ✓ excellent | Cutting-edge, fast HMR, RSC-ready |
| Framework | React 19 | ✓ excellent | Concurrent features, async transitions |
| Router | react-router 7 | ✓ ok | Bisa pertimbangkan TanStack Router untuk file-based routing kalau scale |
| CSS | Tailwind v4 | ✓ excellent | Migrasi v3→v4 udah done (#22) |
| Type system | TS 6 strict | ✓ excellent | Tight |
| CMS | Sanity v5 | ✓ excellent | Real-time, GROQ, hotspot — choice tepat |
| Hosting (web) | Vercel | ⚠ broken (404) | Re-link required |
| Hosting (studio) | sanity.studio | ⚠ broken (404) | `sanity deploy` required |
| Image | Sanity Asset CDN + local fallback | ⚠ underused | Move /covers → CDN |
| Comments | Cusdis | ✓ ok | Self-host opsi |
| Payments | DOKU | ✓ ok | Bagus untuk audience ID |
| Newsletter | TBD endpoint | ⚠ unconfigured | Pilih: Buttondown / Listmonk / Resend |
| Tests | None | ✗ missing | Add Vitest unit + Playwright e2e |
| Monitoring | Sentry placeholder | ✗ missing | Set DSN + frontend tracing |
| Analytics | None | ✗ missing | Pilih privacy-first: Plausible / Umami self-hosted |
| Security | Write token in client | ✗ CRITICAL | Move to CF Worker proxy ASAP |
| CI | GitHub Actions (typecheck + lint + build) | ✓ ok | Tambah e2e job nanti |

**Saran utama tech**:
1. **Image CDN migrasi** — `/covers/` (21 MB) sekarang di-bundle ke build. Pindah ke Sanity Assets, atau (kalau mau pisah dari Sanity untuk control penuh) ke Cloudflare R2 + Images.
2. **Sanity write proxy via CF Worker**: client kirim form ke `worker.velvetcollapse.workers.dev/submit`, worker validate Turnstile + sanitize + write ke Sanity dengan server-side token. Hapus `VITE_SANITY_WRITE_TOKEN` dari .env client. (Ini yang kamu sebut di chat — set up dulu)
3. **CSP**: tambah `Content-Security-Policy` header di Vercel `vercel.json` — block inline scripts, restrict img-src ke Sanity/CDN, dst.
4. **Web vitals**: tambah `web-vitals` lib + log ke Sentry transaction
5. **Sitemap.xml + robots.txt**: scripts/ udah ada generator, pastikan diregisterin ke Vercel build
6. **Open Graph image generation**: dynamic OG card per article (next/og bisa di port ke Vite via `og-image` package, atau Vercel OG Image API)
7. **PWA opsional**: cache shell + read-later offline. Underground zine vibe banget.

---

## 6. UI/UX improvements (prioritized)

### Quick wins (1–4 jam masing-masing)
- **Cart icon count badge**: sekarang icon doang tanpa angka — tambah `<sup>` jumlah item
- **Search overlay**: tombol search di header gak ada modal yang muncul (atau gak terlihat). Pastikan kbd shortcut "/" + "Esc" untuk close
- **Saved indicator on cards**: bookmark icon kecil di pojok kartu kalau sudah di-save
- **Header collapse smoother**: scroll-collapse logo center sekarang bagus (PR #19). Tambahin **fade out kicker** smoothly bukan abrupt
- **Empty states**: page Saved, Cart, dst kalau kosong kasih illustration + CTA "Browse latest"
- **404 page**: ada NotFoundPage tapi pastikan branded (judul besar serif, link kembali ke editions)
- **Image alt text validation**: Sanity already validates, tapi tampilin warning kalau editor lupa di Studio dengan custom badge
- **Skeleton consistency**: Skeleton di home udah ada, pastikan di Article, Editions, Shop juga

### Medium
- **Mobile menu**: sekarang nav inline horizontal scroll(?). Untuk mobile pertimbangkan hamburger → full-screen menu drawer dengan editorial layout
- **Footer**: compact. Tambahin "stay close" section (newsletter form + socials + RSS) + masthead lengkap (editor-in-chief, contributing writers)
- **Article TOC**: long articles butuh sticky TOC sidebar (auto-generate dari h2/h3)
- **Reading time per section**: progress bar global udah ada, tambahin "X min left" floating indicator
- **Print stylesheet**: bikin print-friendly CSS biar bisa di-print zine-style

### Accessibility deeper
- **Focus management on route change**: pastikan `<main tabIndex={-1}>` di-focus saat navigate (mungkin udah ada lewat ScrollToTop?)
- **Live regions**: untuk reactions, comments submit, etc — `aria-live="polite"` announce
- **Reduced motion**: hover scale `1.03` di card pakai `motion-safe:` prefix
- **High contrast mode** opsional: tema ke-3 (di luar light/dark) → high contrast yellow-on-black untuk low vision readers

---

## 7. Deployment / Ops resolution (yang 404)

Yang sekarang harus dilakuin (kamu manual, bukan aku):

**Vercel main site** (`velvet-collapse-magazine.vercel.app` → 404):
1. Login Vercel
2. Import project lagi: New Project → pilih repo `ridwanalamsyah/velvet-collapse-magazine`
3. **Root directory**: `web/`
4. **Build command**: `npm run build` (atau apa yang di `web/package.json`)
5. **Output directory**: `web/dist`
6. **Env vars** (set di Vercel dashboard):
   - `VITE_SANITY_PROJECT_ID=lyo17dt8`
   - `VITE_SANITY_DATASET=production`
   - `VITE_DOKU_*` (kalau pakai payment)
7. **Domain**: assign ke `velvet-collapse-magazine.vercel.app` (atau custom)
8. Push commit → auto-deploy

**Sanity Studio** (`velvet-collapse-magazine.sanity.studio` → 404):
```bash
cd studio
npx sanity login
npx sanity deploy
# pilih studio hostname: velvet-collapse-magazine
```

Aku bisa bantu draft `vercel.json` + env var checklist, tapi reconnect-nya harus dari akun kamu.

---

## 8. Implementation roadmap (kalau kamu approve)

**Sprint A — Foundation (this week)**
- A1. Image hotspot fix (Sanity URL builder + SmartImage + schema description) — 2 jam
- A2. Migrate `/covers/` → Sanity Assets CDN (upload script di `scripts/` ada(?), kalau enggak aku bikin) — 4 jam
- A3. Reconnect Vercel + Sanity Studio (kamu manual, aku kasih checklist) — kamu

**Sprint B — Security & reliability (next week)**
- B1. CF Worker proxy untuk Sanity writes + Turnstile + CSP — 1–2 hari
- B2. Vitest config + 10 unit tests untuk utils, hooks — 1 hari
- B3. Playwright smoke tests (5 critical paths: home → article → comment → search → cart) — 1 hari
- B4. Sentry setup (kasih DSN dulu) — 2 jam
- B5. Plausible/Umami integration (kalau mau) — 2 jam

**Sprint C — Design refresh (when comfortable)**
- C1. Asymmetric hero layout (homepage hero variant baru) — 4 jam
- C2. Typography pump (display sizes, deck style, drop cap polish) — 4 jam
- C3. Paper grain texture + halftone dividers — 2 jam
- C4. Per-edition color accent system — 4 jam
- C5. Wordmark refresh (pakai font baru atau commission SVG) — depends

**Sprint D — New features (prioritized by impact)**
- D1. Issue/Edition reader enhanced (TOC, next/prev within edition) — 1 hari
- D2. Contributor profile pages + pitch CTA prominent — 4 jam
- D3. Live blog schema + page — 1 hari
- D4. Podcast/episode schema + player — 1 hari
- D5. CSV bulk import (yang kamu sebut #19) — depends scope
- D6. Audit log (yang kamu sebut #20) — depends scope
- D7. Backup Sanity → R2 — butuh R2 creds
- D8. Event/calendar schema — 1 hari

---

## 9. Hal yang aku BUTUH dari kamu sebelum lanjut

1. **Approve / reject / revisi** saran-saran di atas — terutama design direction (zine wordmark, asymmetric layout, per-edition color)
2. **Klarifikasi feature-baru** (CSV import, audit log) — kamu mau scope-nya apa?
3. **R2 credentials** kalau mau backup ke Cloudflare R2 (Access Key + Secret + bucket + endpoint URL)
4. **Sentry DSN** kalau mau enable Sentry
5. **Referensi visual** opsional: link ke 2–3 site/print magazine yang vibe-nya kamu suka (Crack, The Quietus, Adbusters, Apartamento, Toilet Paper, dst) — aku bisa lebih targeted kalau ada referensi
6. **Decision on Vercel + Sanity Studio**: reconnect sendiri atau mau aku buatin step-by-step + draft config dulu?

---

## 10. Catatan akhir

Repo ini udah punya **fondasi yang sangat solid** — schema design, component architecture, A11y groundwork, dark mode, reading experience, semua udah serius. Yang kurang sebetulnya cuma:
- **Polish detail** (image fitting, wordmark, asymmetric layout) — bikin feel lebih "underground" daripada "neutral editorial"
- **Tooling reliability** (tests, monitoring, security) — bikin maintain dan scale lebih tenang
- **Ops housekeeping** (Vercel + Studio re-deploy) — biar dunia bisa baca

Tinggal eksekusi. Tunggu kabar.

— Devin
