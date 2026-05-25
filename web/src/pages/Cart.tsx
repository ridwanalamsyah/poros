import { Link } from "react-router-dom";
import { useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { createOrder, getProducts, updateOrderPayment } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { useCart } from "../hooks/useCart";
import { SEO } from "../components/SEO";
import { formatIDR } from "../utils/text";
import { trackEvent } from "../utils/analytics";
import { captureException } from "../utils/sentry";
import type { Order } from "../types";

export function CartPage() {
  const { data: products } = useAsync(() => getProducts(), []);
  const { lines, setQty, remove, totalCount, clear } = useCart();

  const [stage, setStage] = useState<"review" | "form" | "done">("review");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "err">("idle");
  const [msg, setMsg] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const productMap = new Map((products ?? []).map((p) => [p.slug, p]));
  const cartItems = lines
    .map((l) => ({ line: l, product: productMap.get(l.slug) }))
    .filter((x): x is { line: typeof x.line; product: NonNullable<typeof x.product> } => Boolean(x.product));

  const subtotal = cartItems.reduce((s, { line, product }) => s + product.price * line.qty, 0);

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      setStatus("err");
      setMsg("All required fields must be filled in.");
      return;
    }
    setStatus("loading");

    const order: Order = {
      status: "pending",
      customer: { name, email, phone, address, city, postalCode },
      items: cartItems.map(({ line, product }) => ({
        sku: product.slug,
        title: product.title,
        price: product.price,
        qty: line.qty,
      })),
      subtotal,
      shipping: 0,
      total: subtotal,
      paymentProvider: "doku",
      placedAt: new Date().toISOString(),
    };

    // Always log locally as a safety net so the editor never loses an order.
    try {
      const KEY = "vc-orders";
      const legacy = localStorage.getItem("poros-orders");
      const log = JSON.parse(localStorage.getItem(KEY) ?? legacy ?? "[]");
      log.push(order);
      localStorage.setItem(KEY, JSON.stringify(log));
      if (legacy !== null) localStorage.removeItem("poros-orders");
    } catch {}

    // 1. Persist a "pending" order to Sanity (if writable). This means
    //    editors see the order in the Studio even if DOKU never gets called.
    const sanityResult = await createOrder(order).catch((err) => {
      void captureException(err, { stage: "createOrder" });
      return null;
    });
    const orderNum = sanityResult?.orderNumber ?? `local-${Date.now().toString(36).slice(-6)}`;

    trackEvent("checkout_started", {
      orderNumber: orderNum,
      itemCount: cartItems.length,
      subtotal,
    });

    // 2. Forward to DOKU (or compatible) checkout endpoint if configured.
    const endpoint = import.meta.env.VITE_DOKU_CHECKOUT_ENDPOINT as string | undefined;
    if (!endpoint) {
      setStatus("idle");
      setStage("done");
      setOrderNumber(orderNum);
      setMsg(
        sanityResult
          ? `Order created (#${orderNum}). The editorial team will send a payment link to your email within a few minutes.`
          : "Order received. The editorial team will send a payment link to your email within a few minutes.",
      );
      clear();
      return;
    }

    try {
      const payload = {
        ...order,
        orderId: sanityResult?.id,
        orderNumber: orderNum,
        customer: order.customer,
        items: order.items,
        subtotal,
      };
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as { paymentUrl?: string; redirect?: string; paymentRef?: string };
      const url = data.paymentUrl ?? data.redirect;

      if (sanityResult && (url || data.paymentRef)) {
        await updateOrderPayment(sanityResult.id, {
          paymentRef: data.paymentRef,
          paymentUrl: url,
        });
      }

      if (url) {
        window.location.href = url;
        return;
      }
      setStatus("idle");
      setStage("done");
      setOrderNumber(orderNum);
      setMsg(`Order created (#${orderNum}). Check your email for payment instructions.`);
      clear();
    } catch (err) {
      void captureException(err, { stage: "doku_checkout" });
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="Cart" description="Review your Velvet Collapse order before checkout." />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">CART</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">Your cart.</h1>
        <p className="text-muted mt-2">Review items, set quantities, continue to secure checkout.</p>
      </header>

      {stage === "done" ? (
        <div className="border rule-soft p-6">
          <p className="kicker text-accent">ORDER RECEIVED</p>
          {orderNumber && <p className="byline mt-2">Order no.: <span className="font-mono">{orderNumber}</span></p>}
          <p className="mt-3">{msg}</p>
          <Link to="/" className="kicker mt-6 inline-block hover-underline">← BACK TO HOME</Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">Your cart is empty.</p>
          <Link to="/shop" className="kicker inline-block mt-6 border rule px-5 py-3 hover:bg-ink hover:text-paper transition-colors">
            BROWSE THE SHOP →
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
                  <Link to={`/shop/${product.slug}`} className="block hover-underline">
                    <p className="headline text-base">{product.title}</p>
                  </Link>
                  <p className="byline mt-1">{formatIDR(product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => setQty(product.slug, line.qty - 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">−</button>
                    <span className="text-sm w-6 text-center">{line.qty}</span>
                    <button onClick={() => setQty(product.slug, line.qty + 1)} className="w-8 h-8 border rule-soft hover:bg-ink/[0.05]">+</button>
                    <button onClick={() => remove(product.slug)} className="ml-4 text-xs underline text-muted">Remove</button>
                  </div>
                </div>
                <p className="byline whitespace-nowrap text-right">{formatIDR(product.price * line.qty)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t rule pt-4">
            <p className="kicker text-muted">SUBTOTAL ({totalCount} {totalCount === 1 ? "ITEM" : "ITEMS"})</p>
            <p className="headline-display text-3xl">{formatIDR(subtotal)}</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/shop" className="kicker border rule-soft hover:bg-ink/[0.05] px-5 py-3 text-center">
              ← CONTINUE SHOPPING
            </Link>
            <button onClick={() => setStage("form")} className="bg-ink text-paper px-5 py-3 kicker flex-1">
              CHECKOUT · {formatIDR(subtotal)} →
            </button>
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setStage("review")} className="kicker text-muted hover-underline mb-4">← BACK TO CART</button>
          <section className="mb-8 border rule-soft p-4">
            <p className="kicker text-accent">SHIPPING & PAYMENT</p>
            <p className="headline-display text-xl mt-1 leading-tight">Almost there.</p>
            <p className="text-sm text-muted mt-2">
              After you click <em>Continue to payment</em>, you'll be redirected to the secure checkout page. Pick your method — done in a minute, order confirmation lands in your inbox.
            </p>
          </section>

          <form onSubmit={checkout} className="space-y-3">
            <h2 className="kicker mb-2">SHIPPING</h2>
            <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <textarea className="w-full border rule-soft bg-transparent px-3 py-2" rows={3} placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className="border rule-soft bg-transparent px-3 py-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input className="border rule-soft bg-transparent px-3 py-2" placeholder="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <button type="submit" disabled={status === "loading"} className="bg-ink text-paper px-4 py-3 w-full kicker disabled:opacity-50">
              {status === "loading" ? "PROCESSING…" : `CONTINUE TO PAYMENT · ${formatIDR(subtotal)}`}
            </button>
            {status === "err" && <p className="text-xs text-accent">{msg}</p>}
          </form>
        </>
      )}
    </div>
  );
}
