// POST /api/orders
// Handles order creation and payment-status updates from web/src/pages/Cart.tsx,
// replacing the old client-side write that used the (insecure, browser-exposed)
// VITE_SANITY_WRITE_TOKEN.
import { getSanityAdmin } from "./_lib/sanityAdmin";
import { sendNotification } from "./_lib/email";

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let payload: any;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const client = getSanityAdmin();
  if (!client) {
    res.status(500).json({ error: "Order storage is not configured (missing SANITY_WRITE_TOKEN)." });
    return;
  }

  const action = payload?.action;

  if (action === "create") {
    const order = payload?.order;
    if (!order || typeof order !== "object") {
      res.status(400).json({ error: "order is required" });
      return;
    }
    try {
      const placedAt = order.placedAt ?? new Date().toISOString();
      const doc = await client.create({ _type: "order", ...order, placedAt });
      const orderNumber = String(doc._id).slice(-8).toUpperCase();
      await client.patch(doc._id).set({ orderNumber }).commit().catch(() => undefined);

      const itemsText = Array.isArray(order.items)
        ? order.items.map((it: any) => `- ${it.title ?? it.productId ?? "item"} x${it.qty ?? 1}`).join("\n")
        : "";
      await sendNotification({
        subject: `New order #${orderNumber} — ${order.customer?.name ?? "unknown customer"}`,
        text: `Order #${orderNumber}\n\nCustomer: ${order.customer?.name ?? "-"} <${order.customer?.email ?? "-"}>\n\n${itemsText}\n\nTotal: ${order.total ?? "-"}\n\n---\nSaved to Sanity.`,
        replyTo: order.customer?.email,
      });

      res.status(200).json({ id: doc._id, orderNumber });
    } catch (err) {
      console.error("[api/orders] create failed:", err);
      res.status(500).json({ error: "Failed to create order" });
    }
    return;
  }

  if (action === "updatePayment") {
    const { orderId, patch } = payload;
    if (typeof orderId !== "string" || !orderId) {
      res.status(400).json({ error: "orderId is required" });
      return;
    }
    try {
      await client.patch(orderId).set(patch ?? {}).commit();
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[api/orders] updatePayment failed:", err);
      res.status(500).json({ error: "Failed to update order" });
    }
    return;
  }

  res.status(400).json({ error: "Unknown action" });
}
