import { defineField, defineType } from "sanity";

export default defineType({
  name: "order",
  title: "Order",
  type: "document",
  description: "Pesanan dari /cart. Status di-update manual / via webhook.",
  fields: [
    defineField({ name: "orderNumber", title: "Order #", type: "string", validation: (r) => r.required() }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["pending", "paid", "shipped", "delivered", "cancelled"] },
      initialValue: "pending",
    }),
    defineField({
      name: "customer",
      title: "Customer",
      type: "object",
      fields: [
        defineField({ name: "name", type: "string", validation: (r) => r.required() }),
        defineField({ name: "email", type: "string", validation: (r) => r.required() }),
        defineField({ name: "phone", type: "string" }),
        defineField({ name: "address", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "lineItem",
          fields: [
            defineField({ name: "product", type: "reference", to: [{ type: "product" }] }),
            defineField({ name: "qty", type: "number", validation: (r) => r.required().integer().min(1) }),
            defineField({ name: "unitPrice", title: "Unit price (snapshot)", type: "number" }),
          ],
          preview: {
            select: { title: "product.title", qty: "qty", price: "unitPrice" },
            prepare({ title, qty, price }) {
              return { title: title ?? "(no product)", subtitle: `qty ${qty} \u00d7 ${price}` };
            },
          },
        },
      ],
    }),
    defineField({ name: "total", title: "Total", type: "number" }),
    defineField({ name: "paymentRef", title: "Payment reference (DOKU id)", type: "string" }),
    defineField({ name: "notes", title: "Notes (internal)", type: "text", rows: 3 }),
  ],
  orderings: [
    { name: "createdDesc", title: "Newest first", by: [{ field: "createdAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "orderNumber", subtitle: "customer.name", status: "status" },
    prepare({ title, subtitle, status }) {
      return { title: `#${title}`, subtitle: `${subtitle ?? "?"} \u2014 ${status}` };
    },
  },
});
