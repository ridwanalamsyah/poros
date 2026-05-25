import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getProducts } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { useCart } from "../hooks/useCart";
import { SEO } from "../components/SEO";
import { formatIDR } from "../utils/text";

const PAYMENT_METHODS: { label: string; sub: string }[] = [
  { label: "Transfer Bank", sub: "BCA · Mandiri · BRI · BNI · CIMB" },
  { label: "E-Wallet", sub: "OVO · DANA · LinkAja · ShopeePay" },
  { label: "QRIS", sub: "Scan satu kode, semua bank" },
  { label: "Kartu Kredit", sub: "Visa · Mastercard · JCB" },
  { label: "Cicilan 0%", sub: "Tenor 3 / 6 / 12 bulan" },
];

export function ShopPage() {
  const { data: products, loading } = useAsync(() => getProducts(), []);
  const { add, lines, setQty, remove, totalCount } = useCart();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO title="Shop" description="Edisi cetak dan merchandise Velvet Collapse Magazine, dikirim dari Bandung. Pembayaran aman: bank, e-wallet, QRIS, kartu kredit." />
      <header className="border-b rule-soft pb-6 mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="kicker text-accent">SHOP</p>
          <h1 className="headline-display text-4xl md:text-5xl mt-2">Cetakan terbatas & merch.</h1>
          <p className="text-muted mt-2 max-w-2xl">Dikirim dari Bandung. Pengiriman Jabar 1–3 hari, luar Jabar 3–7 hari. Pembayaran aman: transfer bank, e-wallet, QRIS, kartu kredit, atau cicilan 0%.</p>
        </div>
        {totalCount > 0 && (
          <Link to="/cart" className="bg-ink text-paper px-4 py-2 kicker shrink-0">
            CHECKOUT · {totalCount}
          </Link>
        )}
      </header>

      {/* Payment methods banner */}
      <div className="border rule-soft mb-10 p-4 md:p-5 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="col-span-2 md:col-span-1 flex flex-col justify-center md:border-r rule-soft md:pr-4">
          <p className="kicker text-accent">SECURE PAYMENT</p>
          <p className="headline-display text-xl md:text-2xl mt-1 leading-tight">Bayar dengan cara apa saja.</p>
          <p className="stat mt-1 opacity-70">Transaksi aman, terenkripsi.</p>
        </div>
        {PAYMENT_METHODS.map((m) => (
          <div key={m.label} className="min-w-0">
            <p className="kicker">{m.label}</p>
            <p className="text-xs text-muted mt-1 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {loading ? <p className="text-muted">Memuat produk…</p> : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products?.map((p) => {
            const inCart = lines.find((l) => l.slug === p.slug);
            const soldOut = p.inStock === false;
            return (
              <div key={p._id} className="flex flex-col">
                <Link to={`/shop/${p.slug}`} className="block group" aria-label={`Lihat detail ${p.title}`}>
                  <div className="aspect-square bg-ink/[0.05] mb-3 overflow-hidden">
                    <SmartImage image={p.image} className="w-full h-full group-hover:opacity-95" width={600} />
                  </div>
                  <h3 className="headline text-lg group-hover:underline">{p.title}</h3>
                  {(p.tagline || p.description) && (
                    <p className="text-sm text-muted mt-1 flex-1">{p.tagline ?? p.description}</p>
                  )}
                  <p className="mt-3 byline">
                    {formatIDR(p.price)}
                    {soldOut && <span className="ml-2 kicker text-accent align-middle">SOLD OUT</span>}
                  </p>
                </Link>
                {inCart ? (
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setQty(p.slug, inCart.qty - 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">−</button>
                    <span className="text-sm">{inCart.qty}</span>
                    <button onClick={() => setQty(p.slug, inCart.qty + 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">+</button>
                    <button onClick={() => remove(p.slug)} className="ml-auto text-xs underline text-muted">Remove</button>
                  </div>
                ) : (
                  <button
                    onClick={() => add(p.slug)}
                    disabled={soldOut}
                    className="mt-3 border rule-soft hover:bg-ink hover:text-paper px-3 py-2 kicker self-start disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {soldOut ? "SOLD OUT" : "+ ADD"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-xs text-muted">
        Untuk pertanyaan pesanan: <a className="underline" href="mailto:shop@porosmagazine.id">shop@porosmagazine.id</a>
      </p>
    </div>
  );
}
