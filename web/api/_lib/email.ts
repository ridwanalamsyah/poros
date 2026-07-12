// Server-only email helper using Resend (resend.com). RESEND_API_KEY lives
// only in Vercel's server env, never sent to the client.
//
// Notifications for every form on the site (pitch, letters, orders,
// newsletter) go to these two inboxes. Change them here if that ever needs
// to be different per form.
const NOTIFY_TO = ["raditfitra4@gmail.com", "ridwanalamsyah122@gmail.com"];

// Resend requires the "from" address to be on a domain you've verified with
// them. Until a custom domain is verified, Resend's shared "onboarding@resend.dev"
// sender works for testing but can only send to the account owner's own email.
// See RESEND-SETUP note in the deploy guide.
const FROM = process.env.RESEND_FROM ?? "Velvet Collapse <onboarding@resend.dev>";

export async function sendNotification(opts: { subject: string; text: string; replyTo?: string }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping notification:", opts.subject);
    return { ok: false, error: "Email not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: NOTIFY_TO,
        subject: opts.subject,
        text: opts.text,
        reply_to: opts.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] Resend error:", res.status, body);
      return { ok: false, error: `Resend HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: "Network error" };
  }
}
