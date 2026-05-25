import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getAuthors } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";

export function AboutPage() {
  const { data: authors } = useAsync(() => getAuthors(), []);
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="About" description="Tentang Velvet Collapse Magazine — built from the mess. Sebuah majalah dari Bandung." />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">ABOUT</p>
        <h1 className="headline-display text-4xl md:text-6xl mt-2">Built from the mess.</h1>
        <p className="text-muted mt-3 italic">Velvet Collapse Magazine — dari Bandung, untuk yang bekerja.</p>
      </header>
      <div className="article-body">
        <p>Velvet Collapse Magazine adalah majalah online — independen, berbasis di Bandung. Kami menulis tentang dunia kerja, kondisi sosial, dan budaya populer; soal orang-orang yang lebih sering disebut sebagai data ketimbang sebagai manusia.</p>
        <p>Setiap dua bulan kami menyusun satu edisi tematik. Di antara edisi, kami menerbitkan tulisan pendek dan Notes. Newsletter mingguan adalah cara paling cepat untuk mengikuti.</p>
        <p>Tidak terafiliasi partai. Tidak terafiliasi perusahaan media besar. Pendanaan datang dari penjualan edisi cetak, sumbangan pembaca, dan kerja sama editorial yang transparan.</p>
        <p>Pitch tulisan atau foto: <Link to="/submit">submit pitch</Link>. Tanggapan: <Link to="/letters">letters to editor</Link>.</p>
      </div>

      <section className="mt-12 pt-10 border-t rule-soft">
        <p className="kicker text-accent mb-2">MASTHEAD</p>
        <h2 className="headline-display text-3xl mt-1">Redaktur.</h2>
        <ul className="mt-6 grid sm:grid-cols-2 gap-6">
          <li>
            <p className="headline text-lg">Raditya Fitra</p>
            <p className="kicker text-muted mt-1">EDITOR</p>
          </li>
          <li>
            <p className="headline text-lg">Ridwan Alamsyah</p>
            <p className="kicker text-muted mt-1">EDITOR</p>
          </li>
        </ul>
      </section>

      {authors && authors.length > 0 && (
        <section className="mt-12 pt-10 border-t rule-soft">
          <h2 className="kicker mb-6">REDAKSI & KONTRIBUTOR</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {authors.map((a) => (
              <Link key={a._id} to={`/author/${a.slug}`} className="flex gap-3 items-start hover:opacity-80">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-ink/[0.06] shrink-0">
                  <SmartImage image={a.image} className="w-full h-full" width={120} />
                </div>
                <div>
                  <p className="headline text-sm">{a.name}</p>
                  {a.bio && <p className="text-xs text-muted mt-1 line-clamp-3">{a.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
