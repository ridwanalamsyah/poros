import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getProduct, getProducts } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";
import { useCart } from "../hooks/useCart";
import { formatIDR } from "../utils/text";

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { data: product, loading } = useAsync(() => getProduct(slug), [slug]);
  const { data: others } = useAsync(() => getProducts(), []);
  const { add, lines, setQty, remove } = useCart();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-12 grid md:grid-cols-2 gap-10">
        <div className="skeleton aspect-square" />
        <div className="space-y-3">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-5 w-5/6" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <p className="kicker text-muted">404</p>
        <h1 className="headline-display text-4xl mt-4">Produk tidak ditemukan.</h1>
        <Link to="/shop" className="kicker mt-6 inline-block hover-underline">← Kembali ke shop</Link>
      </div>
    );
  }

  const inCart = lines.find((l) => l.slug === product.slug);
  const more = (others ?? []).filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-12 pb-12">
      <SEO
        title={product.title}
        description={product.description ?? `Cetak terbatas Velvet Collapse Magazine. ${formatIDR(product.price)}.`}
        image={product.image}
      />

      <p className="kicker text-muted mb-6">
        <Link to="/shop" className="hover-underline">SHOP</Link> / <span className="text-accent">{product.title.toUpperCase()}</span>
      </p>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="aspect-square bg-ink/[0.05] overflow-hidden">
          <SmartImage image={product.image} className="w-full h-full" width={900} />
        </div>

        <div>
          <h1 className="headline-display text-3xl md:text-5xl leading-[0.96]">{product.title}</h1>
          <p className="byline mt-4 text-lg">{formatIDR(product.price)}</p>
          {product.description && <p className="text-muted mt-4 max-w-prose whitespace-pre-line">{product.description}</p>}

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            {inCart ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(product.slug, inCart.qty - 1)} className="w-10 h-10 border rule-soft hover:bg-ink/[0.05]">−</button>
                <span className="text-base w-8 text-center">{inCart.qty}</span>
                <button onClick={() => setQty(product.slug, inCart.qty + 1)} className="w-10 h-10 border rule-soft hover:bg-ink/[0.05]">+</button>
                <button onClick={() => remove(product.slug)} className="ml-2 text-xs underline text-muted">Hapus dari keranjang</button>
              </div>
            ) : (
              <button onClick={() => add(product.slug)} className="bg-ink text-paper px-5 py-3 kicker">
                + TAMBAH KE KERANJANG
              </button>
            )}
            <Link to="/cart" className="kicker border rule-soft px-5 py-3 hover:bg-ink/[0.05]">LIHAT KERANJANG →</Link>
          </div>

          <div className="mt-8 border-t rule-soft pt-6 text-sm text-muted space-y-2">
            <p><span className="kicker mr-2">PENGIRIMAN</span> Dari Bandung. Jabar 1–3 hari, luar Jabar 3–7 hari.</p>
            <p><span className="kicker mr-2">PEMBAYARAN</span> Transfer bank · e-wallet · QRIS · kartu kredit.</p>
            <p><span className="kicker mr-2">TANYA</span> <a className="underline" href="mailto:shop@porosmagazine.id">shop@porosmagazine.id</a></p>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="mt-16 pt-8 border-t rule-soft">
          <h2 className="kicker text-muted mb-4">JUGA DI SHOP</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {more.map((p) => (
              <Link key={p._id} to={`/shop/${p.slug}`} className="group block">
                <div className="aspect-square bg-ink/[0.05] overflow-hidden mb-2">
                  <SmartImage image={p.image} className="w-full h-full group-hover:opacity-90 transition-opacity" width={500} />
                </div>
                <p className="headline text-base">{p.title}</p>
                <p className="byline mt-1">{formatIDR(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
