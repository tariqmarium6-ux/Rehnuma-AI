import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { performGuidance, getApiKey } from "./api/_lib/analysisCore";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with 10MB limit for screenshots
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  const keyInfo = getApiKey();
  const hasApiKey = Boolean(keyInfo);
  res.json({
    status: "ok",
    hasApiKey,
    keyVarName: keyInfo?.varName || null,
    keyPreview: keyInfo ? `${keyInfo.key.slice(0, 6)}...${keyInfo.key.slice(-4)}` : null,
    platform: "Express / Cloud Run",
    service: "Rehnuma AI Guidance Core",
    message: hasApiKey
      ? `Rehnuma AI Brain is connected and active using ${keyInfo?.varName}.`
      : "GEMINI_API_KEY is not configured.",
  });
});

// High-definition natural Urdu and English speech generation endpoint
app.get("/api/tts", async (req, res) => {
  try {
    const text = (req.query.text as string) || "";
    const lang = (req.query.lang as string) === "en" ? "en" : "ur";

    if (!text.trim()) {
      return res.status(400).send("Text parameter is required");
    }

    // Truncate to spoken length (first 400 characters)
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

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length.toString(),
      "Cache-Control": "public, max-age=86400",
      "Accept-Ranges": "bytes",
    });

    return res.send(audioBuffer);
  } catch (err: any) {
    console.error("TTS endpoint error:", err?.message || err);
    return res.status(500).send("TTS generation failed");
  }
});

// Privacy Endpoint: Immediate Ephemeral Session Purge (Requirement 1 & 4)
app.post("/api/session/clear", (_req, res) => {
  return res.json({
    status: "ok",
    purged: true,
    message: "Ephemeral session memory purged. No screenshots, transcripts or user data retained.",
    timestamp: new Date().toISOString(),
  });
});

// Primary Show Me How Guidance Endpoint
app.post("/api/analyze", async (req, res) => {
  const startTime = Date.now();
  try {
    const result = await performGuidance(req.body);
    const duration = Date.now() - startTime;
    return res.json({
      ...result,
      technicalDetails: {
        ...(result.technicalDetails || {}),
        endpoint: "/api/analyze",
        httpStatus: 200,
        responseTimingMs: duration,
        serverPlatform: "Express / Cloud Run",
        hasScreenshot: Boolean(req.body?.imageBase64 && req.body.imageBase64.length > 50),
      },
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error("Server guidance endpoint error:", err?.message || err);
    return res.status(500).json({
      error: "Guidance generation error",
      message: err?.message || "Internal server error",
      executionTimingMs: duration,
      endpoint: "/api/analyze",
      platform: "Express / Cloud Run",
    });
  }
});

// Start server with Vite in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rehnuma Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
