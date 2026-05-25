import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";

export function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <SEO title="404 — Halaman tidak ditemukan" />
      <p className="kicker text-accent">404</p>
      <h1 className="headline-display text-5xl md:text-7xl mt-4 leading-[0.9]">Halaman yang kamu cari sudah pindah, dihapus, atau memang tidak pernah ada.</h1>
      <p className="text-muted mt-4">Kalau yakin link-nya benar, kirim screenshot ke <a className="underline" href="mailto:hello@velvetcollapse.id">hello@velvetcollapse.id</a>.</p>
      <Link to="/" className="kicker mt-8 inline-block hover-underline">← KEMBALI KE BERANDA</Link>
    </div>
  );
}
