import { defineArrayMember, defineField, defineType } from "sanity";

const STATUSES = [
  { title: "Pending payment", value: "pending" },
  { title: "Paid", value: "paid" },
  { title: "Shipped", value: "shipped" },
  { title: "Delivered", value: "delivered" },
  { title: "Cancelled", value: "cancelled" },
  { title: "Refunded", value: "refunded" },
];

export default defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order number",
      type: "string",
      readOnly: true,
      description: "Auto-generated short id, mirrored from the document id.",
    }),
    defineField({
      name: "status",
      type: "string",
      options: { list: STATUSES, layout: "radio" },
      initialValue: "pending",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "customer",
      type: "object",
      fields: [
        defineField({ name: "name", type: "string", validation: (r) => r.required() }),
        defineField({ name: "email", type: "string", validation: (r) => r.required().email() }),
        defineField({ name: "phone", type: "string" }),
        defineField({ name: "address", type: "text", rows: 3 }),
        defineField({ name: "city", type: "string" }),
        defineField({ name: "postalCode", type: "string" }),
      ],
    }),
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "orderItem",
          fields: [
            defineField({ name: "sku", title: "SKU / slug", type: "string", validation: (r) => r.required() }),
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "price", title: "Unit price (IDR)", type: "number", validation: (r) => r.required().positive() }),
            defineField({ name: "qty", type: "number", validation: (r) => r.required().positive().integer() }),
            defineField({
              name: "product",
              type: "reference",
              to: [{ type: "product" }],
              description: "Optional link back to the catalog entry — useful for reporting.",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "qty", price: "price" },
            prepare({ title, subtitle, price }) {
              return {
                title: title ?? "(item)",
                subtitle: `× ${subtitle ?? 0} · Rp${(price ?? 0).toLocaleString("id-ID")}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "subtotal",
      title: "Subtotal (IDR)",
      type: "number",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "shipping",
      title: "Shipping fee (IDR)",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "total",
      title: "Total (IDR)",
      type: "number",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "paymentProvider",
      type: "string",
      options: { list: [{ title: "DOKU", value: "doku" }, { title: "Manual", value: "manual" }] },
      initialValue: "doku",
    }),
    defineField({
      name: "paymentRef",
      title: "Payment reference",
      type: "string",
      description: "DOKU invoice id, midtrans order id, or whatever the processor returned.",
    }),
    defineField({
      name: "paymentUrl",
      title: "Payment URL",
      type: "url",
      description: "Optional — link to the hosted payment page for this order.",
    }),
    defineField({
      name: "notes",
      type: "text",
      rows: 3,
      description: "Internal notes from editors.",
    }),
    defineField({ name: "placedAt", title: "Placed at", type: "datetime" }),
    defineField({ name: "paidAt", title: "Paid at", type: "datetime" }),
    defineField({ name: "shippedAt", title: "Shipped at", type: "datetime" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "placedAtDesc",
      by: [{ field: "placedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "customer.name",
      email: "customer.email",
      total: "total",
      status: "status",
      placedAt: "placedAt",
    },
    prepare({ name, email, total, status, placedAt }) {
      const when = placedAt ? new Date(placedAt).toLocaleDateString("id-ID") : "—";
      const formatted = typeof total === "number" ? `Rp${total.toLocaleString("id-ID")}` : "—";
      return {
        title: name ? `${name} — ${formatted}` : `(order) ${formatted}`,
        subtitle: `${status ?? "pending"} · ${when}${email ? ` · ${email}` : ""}`,
      };
    },
  },
});
