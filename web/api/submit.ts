// POST /api/submit
// Handles both "pitch" and "letter" submissions from web/src/pages/Submit.tsx.
// Writes to Sanity server-side (write token never touches the browser) and
// emails the editorial team so they don't have to keep checking Sanity Studio.
import { getSanityAdmin } from "./_lib/sanityAdmin";
import { sendNotification } from "./_lib/email";

type SubmitBody = {
  mode?: unknown;
  name?: unknown;
  email?: unknown;
  title?: unknown;
  body?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let payload: SubmitBody;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { mode, name, email, title, body } = payload;
  const isPitch = mode !== "letter";

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(body)) {
    res.status(400).json({ error: "name, email, and body are required" });
    return;
  }
  if (name.length > 200 || email.length > 200 || (typeof title === "string" && title.length > 300) || body.length > 20000) {
    res.status(400).json({ error: "Field too long" });
    return;
  }

  const doc = {
    _type: isPitch ? "submission" : "letter",
    name,
    email,
    title: typeof title === "string" ? title : "",
    body,
    submittedAt: new Date().toISOString(),
  };

  const client = getSanityAdmin();
  let sanitySaved = false;
  if (client) {
    try {
      await client.create(doc);
      sanitySaved = true;
    } catch (err) {
      console.error("[api/submit] Sanity write failed:", err);
    }
  }

  const emailResult = await sendNotification({
    subject: isPitch ? `New pitch: ${title || "(no title)"} — from ${name}` : `New letter from ${name}`,
    text: `From: ${name} <${email}>\n\n${title ? `Title: ${title}\n\n` : ""}${body}\n\n---\n${sanitySaved ? "Saved to Sanity." : "NOTE: could not save to Sanity — check Vercel logs."}`,
    replyTo: email,
  });

  if (!sanitySaved && !emailResult.ok) {
    res.status(500).json({ error: "Failed to save submission" });
    return;
  }

  res.status(200).json({ ok: true, savedToSanity: sanitySaved, emailed: emailResult.ok });
}
