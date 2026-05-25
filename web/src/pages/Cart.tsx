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

export function CartPage() {
  const { data: products } = useAsync(() => getProducts(), []);
  const { lines, setQty, remove, totalCount, clear } = useCart();

  const [stage, setStage] = useState<"review" | "form" | "done">("review");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "err">("idle");
  const [msg, setMsg] = useState("");

  const productMap = new Map((products ?? []).map((p) => [p.slug, p]));
  const cartItems = lines
    .map((l) => ({ line: l, product: productMap.get(l.slug) }))
    .filter((x): x is { line: typeof x.line; product: NonNullable<typeof x.product> } => Boolean(x.product));

  const subtotal = cartItems.reduce((s, { line, product }) => s + product.price * line.qty, 0);

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setStatus("err");
      setMsg("Semua field wajib diisi.");
      return;
    }
    setStatus("loading");
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
        const log = JSON.parse(localStorage.getItem("vc-orders") ?? "[]");
        log.push({ ...payload, ts: Date.now() });
        localStorage.setItem("vc-orders", JSON.stringify(log));
      } catch {}
      await new Promise((r) => setTimeout(r, 600));
      setStatus("idle");
      setStage("done");
      setMsg("Pesanan diterima. Redaksi akan mengirim link pembayaran ke emailmu dalam beberapa menit.");
      clear();
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
      setStatus("idle");
      setStage("done");
      setMsg("Pesanan dibuat. Cek email untuk instruksi pembayaran.");
      clear();
    } catch (err) {
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "Checkout gagal. Coba lagi.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="Cart" description="Review pesanan Velvet Collapse Magazine sebelum checkout." />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">CART</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Keranjang.</h1>
        <p className="text-muted mt-2">Review item, atur jumlah, lanjut ke pembayaran aman.</p>
      </header>

      {stage === "done" ? (
        <div className="border rule-soft p-6">
          <p className="kicker text-accent">PESANAN DITERIMA</p>
          <p className="mt-3">{msg}</p>
          <Link to="/" className="kicker mt-6 inline-block hover-underline">← KEMBALI KE BERANDA</Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">Keranjang kosong.</p>
          <Link to="/shop" className="kicker inline-block mt-6 border rule px-5 py-3 hover:bg-ink hover:text-paper transition-colors">
            JELAJAHI SHOP →
          </Link>
        </div>
      ) : stage === "review" ? (
        <>
          <ul className="divide-y rule-soft">
            {cartItems.map(({ line, product }) => (
              <li key={product._id} className="py-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-ink/[0.05] overflow-hidden shrink-0">
                  <SmartImage image={product.image} className="w-full h-full" width={200} />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to="/shop" className="block hover-underline">
                    <p className="headline text-base">{product.title}</p>
                  </Link>
                  <p className="byline mt-1">{formatIDR(product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => setQty(product.slug, line.qty - 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">−</button>
                    <span className="text-sm w-6 text-center">{line.qty}</span>
                    <button onClick={() => setQty(product.slug, line.qty + 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">+</button>
                    <button onClick={() => remove(product.slug)} className="ml-4 text-xs underline text-muted">Hapus</button>
                  </div>
                </div>
                <p className="byline whitespace-nowrap text-right">{formatIDR(product.price * line.qty)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t rule pt-4">
            <p className="kicker text-muted">SUBTOTAL ({totalCount} ITEM)</p>
            <p className="headline-display text-3xl">{formatIDR(subtotal)}</p>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-2 stat">
            {PAYMENT_METHODS.map((m) => (
              <span key={m.label} className="border rule-soft px-2 py-1 text-center truncate">{m.label}</span>
            ))}
          </div>
          <p className="text-xs text-muted mt-2 text-center">Pembayaran aman, terenkripsi. Pilih metode di langkah berikutnya.</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/shop" className="kicker border rule-soft hover:bg-ink/[0.05] px-5 py-3 text-center">
              ← LANJUT BELANJA
            </Link>
            <button onClick={() => setStage("form")} className="bg-ink text-paper px-5 py-3 kicker flex-1">
              CHECKOUT · {formatIDR(subtotal)} →
            </button>
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setStage("review")} className="kicker text-muted hover-underline mb-4">← KEMBALI KE KERANJANG</button>
          <section className="mb-8 border rule-soft p-4">
            <p className="kicker text-accent">PENGIRIMAN & PEMBAYARAN</p>
            <p className="headline-display text-xl mt-1 leading-tight">Sebentar lagi.</p>
            <p className="text-sm text-muted mt-2">
              Setelah klik <em>Lanjut bayar</em>, kamu diarahkan ke halaman pembayaran aman. Pilih bank / e-wallet / QRIS / kartu — selesai dalam 1 menit, konfirmasi pesanan dikirim ke email.
            </p>
          </section>

          <form onSubmit={checkout} className="space-y-3">
            <h2 className="kicker mb-2">PENGIRIMAN</h2>
            <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="No. WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <textarea className="w-full border rule-soft bg-transparent px-3 py-2" rows={3} placeholder="Alamat lengkap" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Kota" value={city} onChange={(e) => setCity(e.target.value)} />
            <button type="submit" disabled={status === "loading"} className="bg-ink text-paper px-4 py-3 w-full kicker disabled:opacity-50">
              {status === "loading" ? "MEMPROSES…" : `LANJUT BAYAR ${formatIDR(subtotal)}`}
            </button>
            {status === "err" && <p className="text-xs text-accent">{msg}</p>}
          </form>
        </>
      )}
    </div>
  );
}
