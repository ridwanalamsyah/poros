import { Link } from "react-router-dom";
import { useState } from "react";
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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [checkoutMsg, setCheckoutMsg] = useState("");

  const productMap = new Map((products ?? []).map((p) => [p.slug, p]));
  const cartItems = lines
    .map((l) => ({ line: l, product: productMap.get(l.slug) }))
    .filter((x): x is { line: typeof x.line; product: NonNullable<typeof x.product> } => Boolean(x.product));

  const subtotal = cartItems.reduce((s, { line, product }) => s + product.price * line.qty, 0);

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setCheckoutStatus("err");
      setCheckoutMsg("Semua field wajib diisi.");
      return;
    }
    setCheckoutStatus("loading");
    const endpoint = import.meta.env.VITE_DOKU_CHECKOUT_ENDPOINT as string | undefined;
    const payload = {
      customer: { name, email, phone, address, city },
      items: cartItems.map(({ line, product }) => ({
        sku: product.slug,
        name: product.title,
        price: product.price,
        qty: line.qty,
      })),
      subtotal,
    };
    if (!endpoint) {
      try {
        const log = JSON.parse(localStorage.getItem("poros-orders") ?? "[]");
        log.push({ ...payload, ts: Date.now() });
        localStorage.setItem("poros-orders", JSON.stringify(log));
      } catch {}
      await new Promise((r) => setTimeout(r, 600));
      setCheckoutStatus("ok");
      setCheckoutMsg(
        "Pesanan diterima. Redaksi akan mengirim link pembayaran manual ke emailmu dalam beberapa menit.",
      );
      return;
    }
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as { paymentUrl?: string; redirect?: string };
      const url = data.paymentUrl ?? data.redirect;
      if (url) {
        window.location.href = url;
        return;
      }
      setCheckoutStatus("ok");
      setCheckoutMsg("Pesanan dibuat. Cek email untuk instruksi pembayaran.");
    } catch (err) {
      setCheckoutStatus("err");
      setCheckoutMsg(err instanceof Error ? err.message : "Checkout gagal. Coba lagi.");
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-14 pb-10">
      <SEO title="Shop" description="Edisi cetak dan merchandise POROS, dikirim dari Bandung. Pembayaran aman: bank, e-wallet, QRIS, kartu kredit." />
      <header className="border-b rule-soft pb-6 mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="kicker text-accent">SHOP</p>
          <h1 className="headline-display text-4xl md:text-5xl mt-2">Cetakan terbatas & merch.</h1>
          <p className="text-muted mt-2 max-w-2xl">Dikirim dari Bandung. Pengiriman Jabar 1–3 hari, luar Jabar 3–7 hari. Pembayaran aman: transfer bank, e-wallet, QRIS, kartu kredit, atau cicilan 0%.</p>
        </div>
        {totalCount > 0 && (
          <button onClick={() => setCheckoutOpen(true)} className="bg-ink text-paper px-4 py-2 kicker shrink-0">
            CHECKOUT · {totalCount}
          </button>
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
            return (
              <div key={p._id} className="flex flex-col">
                <div className="aspect-square bg-ink/[0.05] mb-3 overflow-hidden">
                  <SmartImage image={p.image} className="w-full h-full" width={600} />
                </div>
                <h3 className="headline text-lg">{p.title}</h3>
                {p.description && <p className="text-sm text-muted mt-1 flex-1">{p.description}</p>}
                <p className="mt-3 byline">{formatIDR(p.price)}</p>
                {inCart ? (
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setQty(p.slug, inCart.qty - 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">−</button>
                    <span className="text-sm">{inCart.qty}</span>
                    <button onClick={() => setQty(p.slug, inCart.qty + 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">+</button>
                    <button onClick={() => remove(p.slug)} className="ml-auto text-xs underline text-muted">Remove</button>
                  </div>
                ) : (
                  <button onClick={() => add(p.slug)} className="mt-3 border rule-soft hover:bg-ink hover:text-paper px-3 py-2 kicker self-start">+ ADD</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-xs text-muted">
        Untuk pertanyaan pesanan: <a className="underline" href="mailto:shop@porosmagazine.id">shop@porosmagazine.id</a>
      </p>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-paper text-ink overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 md:px-0 py-10">
            <div className="flex items-center justify-between mb-6">
              <p className="kicker">CHECKOUT</p>
              <button onClick={() => setCheckoutOpen(false)} className="kicker hover-underline">CLOSE ×</button>
            </div>
            {checkoutStatus === "ok" ? (
              <div className="border rule-soft p-6">
                <p className="kicker text-accent">PESANAN DITERIMA</p>
                <p className="mt-3">{checkoutMsg}</p>
                <Link to="/" className="kicker mt-6 inline-block hover-underline">← KEMBALI KE BERANDA</Link>
              </div>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="kicker mb-3">ITEM</h2>
                  <ul className="divide-y rule-soft">
                    {cartItems.map(({ line, product }) => (
                      <li key={product._id} className="py-3 flex items-center gap-4">
                        <div className="w-14 h-14 bg-ink/[0.05] overflow-hidden shrink-0">
                          <SmartImage image={product.image} className="w-full h-full" width={150} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{product.title}</p>
                          <p className="byline">{formatIDR(product.price)}</p>
                        </div>
                        <span className="byline">× {line.qty}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-right mt-4 headline">Subtotal: {formatIDR(subtotal)}</p>
                </section>

                <section className="mb-8 border rule-soft p-4">
                  <p className="kicker text-accent">METODE PEMBAYARAN</p>
                  <p className="headline-display text-xl mt-1 leading-tight">Lanjut ke pembayaran aman.</p>
                  <p className="text-sm text-muted mt-2">
                    Setelah klik <em>Lanjut bayar</em>, kamu akan diarahkan ke halaman pembayaran. Pilih bank / e-wallet / QRIS / kartu — selesai dalam 1 menit, link konfirmasi pesanan dikirim ke email.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 stat">
                    {PAYMENT_METHODS.map((m) => (
                      <span key={m.label} className="border rule-soft px-2 py-1 text-center truncate">{m.label}</span>
                    ))}
                  </div>
                </section>

                <form onSubmit={checkout} className="space-y-3">
                  <h2 className="kicker mb-2">PENGIRIMAN</h2>
                  <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
                  <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="No. WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <textarea className="w-full border rule-soft bg-transparent px-3 py-2" rows={3} placeholder="Alamat lengkap" value={address} onChange={(e) => setAddress(e.target.value)} />
                  <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Kota" value={city} onChange={(e) => setCity(e.target.value)} />
                  <button type="submit" disabled={checkoutStatus === "loading"} className="bg-ink text-paper px-4 py-3 w-full kicker disabled:opacity-50">
                    {checkoutStatus === "loading" ? "MEMPROSES…" : `LANJUT BAYAR ${formatIDR(subtotal)}`}
                  </button>
                  {checkoutStatus === "err" && <p className="text-xs text-accent">{checkoutMsg}</p>}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
