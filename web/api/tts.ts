// POST /api/tts
// Converts article text to natural-sounding Indonesian speech using Google
// Cloud Text-to-Speech (WaveNet voice), instead of relying on whatever
// speechSynthesis voice happens to be installed on the reader's device
// (often missing an Indonesian voice entirely, or robotic-sounding).
//
// Required Vercel env var: GOOGLE_TTS_API_KEY
//   1. console.cloud.google.com -> create/select a project
//   2. Enable "Cloud Text-to-Speech API"
//   3. APIs & Services -> Credentials -> Create API Key
//   4. (Recommended) restrict the key to the Text-to-Speech API only
//
// Free tier: 1,000,000 characters/month for WaveNet voices, 4,000,000/month
// for Standard voices. A typical article (~4,000-8,000 characters) costs
// nothing until well past 100+ articles read per month.
//
// Google's synthesize endpoint caps input at 5,000 bytes per request, so
// long articles are split into chunks (on sentence boundaries) and returned
// as separate audio clips for the client to play back-to-back.

const MAX_CHUNK_BYTES = 4500; // stay safely under Google's 5000-byte limit
const VOICE_NAME = "id-ID-Wavenet-D";
const LANGUAGE_CODE = "id-ID";

function chunkText(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (Buffer.byteLength(candidate, "utf8") > MAX_CHUNK_BYTES) {
      if (current) chunks.push(current);
      // A single sentence longer than the limit (rare) — hard-split it.
      if (Buffer.byteLength(sentence, "utf8") > MAX_CHUNK_BYTES) {
        let remaining = sentence;
        while (Buffer.byteLength(remaining, "utf8") > MAX_CHUNK_BYTES) {
          chunks.push(remaining.slice(0, 800));
          remaining = remaining.slice(800);
        }
        current = remaining;
      } else {
        current = sentence;
      }
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Text-to-speech is not configured (missing GOOGLE_TTS_API_KEY)." });
    return;
  }

  let payload: any;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const text = payload?.text;
  if (typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  if (text.length > 40000) {
    res.status(400).json({ error: "Article too long for read-aloud (max ~40,000 characters)." });
    return;
  }

  const chunks = chunkText(text);

  try {
    const audioChunks = await Promise.all(
      chunks.map(async (chunk) => {
        const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text: chunk },
            voice: { languageCode: LANGUAGE_CODE, name: VOICE_NAME },
            audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
          }),
        });
        if (!r.ok) {
          const errBody = await r.text().catch(() => "");
          throw new Error(`Google TTS HTTP ${r.status}: ${errBody}`);
        }
        const data = await r.json();
        return data.audioContent as string; // base64 MP3
      }),
    );

    res.status(200).json({ audioChunks });
  } catch (err) {
    console.error("[api/tts] synthesis failed:", err);
    res.status(500).json({ error: "Failed to generate audio" });
  }
}
