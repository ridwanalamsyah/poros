import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { getProduct, getProducts } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { useCart } from "../hooks/useCart";
import { SEO } from "../components/SEO";
import { PortableBody } from "../components/PortableBody";
import { formatIDR } from "../utils/text";
import { trackEvent } from "../utils/analytics";
import { NotFoundPage } from "./NotFound";

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, loading } = useAsync(() => (slug ? getProduct(slug) : Promise.resolve(null)), [slug]);
  const { data: allProducts } = useAsync(() => getProducts(), []);
  const { add, lines, setQty } = useCart();
  const [qty, setLocalQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!loading && !product) {
    return <NotFoundPage />;
  }

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
        <p className="text-muted">Memuat…</p>
      </div>
    );
  }

  const gallery = [product.image, ...(product.gallery ?? [])].filter(
    (img): img is NonNullable<typeof img> => Boolean(img),
  );
  const active = gallery[activeImageIdx] ?? gallery[0];
  const inCart = lines.find((l) => l.slug === product.slug);
  const otherProducts = (allProducts ?? []).filter((p) => p.slug !== product.slug).slice(0, 3);
  const subtotal = product.price * qty;
  const soldOut = product.inStock === false;

  function handleAdd() {
    if (soldOut) return;
    add(product!.slug, qty);
    trackEvent("add_to_cart", { sku: product!.slug, qty, value: subtotal });
  }

  function handleBuyNow() {
    handleAdd();
    navigate("/cart");
  }

  return (
    <article className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO
        title={product.title}
        description={product.description ?? product.tagline ?? `${product.title} — POROS shop.`}
        image={product.image}
        breadcrumbs={[
          { name: "Shop", url: "/shop" },
          { name: product.title, url: `/shop/${product.slug}` },
        ]}
      />

      <nav className="kicker text-muted mb-6">
        <Link to="/shop" className="hover-underline">SHOP</Link>
        <span className="mx-2 opacity-60">/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-ink/[0.05] overflow-hidden">
            {active ? (
              <SmartImage image={active} className="w-full h-full" width={1200} fit="cover" />
            ) : (
              <div className="w-full h-full" aria-hidden />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`aspect-square overflow-hidden border ${i === activeImageIdx ? "rule" : "rule-soft opacity-70 hover:opacity-100"}`}
                  aria-label={`Lihat foto ${i + 1}`}
                  aria-current={i === activeImageIdx}
                >
                  <SmartImage image={img} className="w-full h-full" width={200} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="kicker text-accent">SHOP</p>
          <h1 className="headline-display text-3xl md:text-5xl mt-2 leading-tight">{product.title}</h1>
          {product.tagline && <p className="text-muted mt-2 text-lg">{product.tagline}</p>}

          <p className="headline-display text-2xl md:text-3xl mt-6">
            {formatIDR(product.price)}
            {soldOut && <span className="ml-3 kicker text-accent align-middle">SOLD OUT</span>}
          </p>

          {product.description && (
            <p className="mt-4 text-base leading-relaxed">{product.description}</p>
          )}

          {product.specs && product.specs.length > 0 && (
            <dl className="grid grid-cols-2 gap-y-2 gap-x-6 mt-6 border-t border-b rule-soft py-4 stat">
              {product.specs.map((spec, i) => (
                <div key={spec._key ?? i} className="contents">
                  <dt className="kicker text-muted">{spec.label}</dt>
                  <dd className="byline">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span className="kicker text-muted mr-2">QTY</span>
            <button
              onClick={() => setLocalQty(Math.max(1, qty - 1))}
              className="w-10 h-10 border rule-soft hover:bg-ink/[0.05]"
              aria-label="Kurangi jumlah"
              disabled={soldOut}
            >
              −
            </button>
            <span className="w-8 text-center byline">{qty}</span>
            <button
              onClick={() => setLocalQty(qty + 1)}
              className="w-10 h-10 border rule-soft hover:bg-ink/[0.05]"
              aria-label="Tambah jumlah"
              disabled={soldOut}
            >
              +
            </button>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              disabled={soldOut}
              className="border rule px-5 py-3 kicker hover:bg-ink hover:text-paper disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {soldOut ? "SOLD OUT" : inCart ? `DI KERANJANG (${inCart.qty}) · TAMBAH` : "+ TAMBAH KE KERANJANG"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={soldOut}
              className="bg-ink text-paper px-5 py-3 kicker disabled:opacity-50 disabled:cursor-not-allowed"
            >
              BELI SEKARANG · {formatIDR(subtotal)}
            </button>
          </div>

          {inCart && (
            <p className="kicker text-muted mt-3">
              Sudah {inCart.qty} di keranjang —{" "}
              <button onClick={() => setQty(product.slug, 0)} className="underline">hapus</button>
            </p>
          )}

          <p className="text-xs text-muted mt-6">
            {product.shippingNote ?? "Dikirim dari Bandung. Jabar 1–3 hari, luar Jabar 3–7 hari."}
          </p>
          <p className="text-xs text-muted mt-1">
            Pembayaran: transfer bank · e-wallet · QRIS · kartu kredit. Aman & terenkripsi.
          </p>
        </div>
      </div>

      {/* Long description */}
      {product.body && product.body.length > 0 && (
        <section className="mt-16 md:mt-24 max-w-3xl mx-auto">
          <p className="kicker text-accent mb-3">DETAIL</p>
          <div className="article-body">
            <PortableBody blocks={product.body} />
          </div>
        </section>
      )}

      {/* Related */}
      {otherProducts.length > 0 && (
        <section className="mt-16 md:mt-24 border-t rule-soft pt-10">
          <p className="kicker text-accent">JUGA DI SHOP</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4">
            {otherProducts.map((p) => (
              <Link key={p._id} to={`/shop/${p.slug}`} className="block group">
                <div className="aspect-square bg-ink/[0.05] mb-3 overflow-hidden">
                  <SmartImage image={p.image} className="w-full h-full group-hover:opacity-95" width={500} />
                </div>
                <h3 className="headline text-base group-hover:underline">{p.title}</h3>
                <p className="byline mt-1">{formatIDR(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
