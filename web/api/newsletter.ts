// POST /api/newsletter
// Newsletter signup. If BUTTONDOWN_API_KEY is set, subscribes the reader via
// Buttondown's authenticated API (server-side, so the key never reaches the
// browser). Either way, notifies the editorial team of the new signup.
import { sendNotification } from "./_lib/email";

function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 300 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

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

  const { email } = payload;
  if (!isValidEmail(email)) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }

  const buttondownKey = process.env.BUTTONDOWN_API_KEY;
  let subscribed = false;

  if (buttondownKey) {
    try {
      const r = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${buttondownKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      subscribed = r.ok;
      if (!r.ok) console.error("[api/newsletter] Buttondown error:", r.status, await r.text().catch(() => ""));
    } catch (err) {
      console.error("[api/newsletter] Buttondown request failed:", err);
    }
  }

  await sendNotification({
    subject: `New newsletter signup: ${email}`,
    text: `${email} just subscribed to the newsletter.\n\n${buttondownKey ? (subscribed ? "Synced to Buttondown." : "NOTE: Buttondown sync failed — add them manually.") : "NOTE: BUTTONDOWN_API_KEY not set — add them manually."}`,
  });

  res.status(200).json({ ok: true, subscribed });
}
