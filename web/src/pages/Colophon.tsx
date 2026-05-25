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
        description="Kredit produksi Velvet Collapse Magazine — siapa mengerjakan apa, tech stack, dan ucapan terima kasih."
      />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">COLOPHON</p>
        <h1 className="headline-display text-4xl md:text-6xl mt-2">Kredit produksi.</h1>
        <p className="text-muted mt-3 italic">
          Magazine dikerjakan oleh tim kecil di Bandung. Halaman ini mencatat siapa mengerjakan apa.
        </p>
      </header>

      {hasCustom ? (
        <PortableBody blocks={colophon} />
      ) : (
        <div className="article-body">
          <h2>Redaksi</h2>
          <p>
            <strong>Raditya Fitra</strong> — Editor. Mengurus dunia kerja, ekonomi platform, dan masalah
            sosial. Berbasis di Bandung.
          </p>
          <p>
            <strong>Ridwan Alamsyah</strong> — Editor. Mengurus budaya populer, musik bawah tanah, dan
            arsip. Berbasis di Bandung.
          </p>

          <h2>Produksi</h2>
          <p>
            Desain, layout, dan front-end situs dikerjakan in-house. Studio editorial menggunakan
            Sanity v3 sebagai CMS, dengan kustomisasi desk untuk alur kerja editor harian. Front-end
            dibangun dengan React + Vite, lalu dideploy sebagai static bundle.
          </p>
          <p>
            Kontributor tetap dan kontributor lepas dikredit di setiap artikel masing-masing. Foto
            cover artikel sebagian besar adalah karya kontributor; foto stok yang dipakai berasal
            dari Unsplash dan dipilih secara manual oleh redaktur.
          </p>

          <h2>Tech stack</h2>
          <ul>
            <li>Frontend: React 18 + Vite 5 + TypeScript + Tailwind CSS</li>
            <li>CMS: Sanity v3 (project lyo17dt8 / dataset production)</li>
            <li>Pembayaran shop: DOKU (sandbox / production via endpoint backend)</li>
            <li>Komentar: Cusdis embed</li>
            <li>Newsletter: Buttondown</li>
            <li>Sitemap, RSS, OG stubs digenerate saat build dari data Sanity / mock</li>
          </ul>

          <h2>Pendanaan</h2>
          <p>
            Velvet Collapse Magazine independen. Tidak terafiliasi partai. Tidak terafiliasi
            perusahaan media besar. Pendanaan datang dari penjualan edisi cetak, merchandise di{" "}
            <Link to="/shop">Shop</Link>, dan sumbangan pembaca via Saweria / Trakteer / Patreon.
            Kerja sama editorial yang berbayar selalu dilabeli transparan di header artikel.
          </p>

          <h2>Kontak</h2>
          <p>
            Pitch artikel: <Link to="/submit">submit pitch</Link>. Tanggapan untuk redaksi:{" "}
            <Link to="/letters">letters to editor</Link>. Permintaan kerja sama, advertorial, atau
            permintaan koreksi: email ke redaksi (alamat di Sanity Settings).
          </p>
        </div>
      )}
    </div>
  );
}
