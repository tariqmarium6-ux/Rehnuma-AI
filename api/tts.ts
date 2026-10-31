export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const text = (req.query?.text as string) || "";
    const lang = (req.query?.lang as string) === "en" ? "en" : "ur";

    if (!text.trim()) {
      return res.status(400).send("Text parameter is required");
    }

    const cleanText = text.trim().slice(0, 400);
    const encoded = encodeURIComponent(cleanText);
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encoded}`;

    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send("Upstream voice service error");
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length.toString());
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Accept-Ranges", "bytes");

    return res.status(200).send(audioBuffer);
  } catch (err: any) {
    console.error("Vercel TTS error:", err?.message || err);
    return res.status(500).send("TTS generation failed");
  }
}
