import { performGuidance } from "./_lib/analysisCore";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Please use POST.",
      code: "HTTP_405_METHOD_NOT_ALLOWED",
      endpoint: "/api/analyze",
      platform: "Vercel Serverless Function",
    });
  }

  const startTime = Date.now();

  try {
    const rawBody = req.body;
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : (rawBody || {});

    const result = await performGuidance(body);
    const executionDurationMs = Date.now() - startTime;

    return res.status(200).json({
      ...result,
      technicalDetails: {
        ...(result.technicalDetails || {}),
        endpoint: "/api/analyze",
        httpStatus: 200,
        responseTimingMs: executionDurationMs,
        serverPlatform: "Vercel Serverless Function",
        hasScreenshot: Boolean(body?.imageBase64 && body.imageBase64.length > 50),
      },
    });
  } catch (error: any) {
    const executionDurationMs = Date.now() - startTime;
    console.error("Vercel Serverless Function /api/analyze error:", error);

    const errorMessage = error?.message || String(error);
    return res.status(500).json({
      error: "Guidance generation error",
      message: errorMessage,
      executionTimingMs: executionDurationMs,
      endpoint: "/api/analyze",
      platform: "Vercel Serverless Function",
    });
  }
}
