import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const envCandidates = [
    { name: "GEMINI_API_KEY", val: process.env.GEMINI_API_KEY },
    { name: "GOOGLE_API_KEY", val: process.env.GOOGLE_API_KEY },
    { name: "VITE_GEMINI_API_KEY", val: process.env.VITE_GEMINI_API_KEY },
    { name: "VITE_GOOGLE_API_KEY", val: process.env.VITE_GOOGLE_API_KEY },
    { name: "NEXT_PUBLIC_GEMINI_API_KEY", val: process.env.NEXT_PUBLIC_GEMINI_API_KEY },
    { name: "API_KEY", val: process.env.API_KEY },
  ];

  const matched = envCandidates.find((c) => c.val && c.val.trim().length > 0);
  const rawKey = matched?.val ? matched.val.trim().replace(/^["']|["']$/g, "").trim() : "";
  const hasApiKey = Boolean(rawKey && rawKey.length > 5);

  let liveTestResult: any = null;

  // If query has ?test=true, verify real connection to Google Gemini API
  if (hasApiKey && (req.query?.test === "true" || req.query?.test === "1")) {
    try {
      const ai = new GoogleGenAI({ apiKey: rawKey });
      const testRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Respond with single word: OK",
      });
      liveTestResult = {
        success: true,
        model: "gemini-2.5-flash",
        response: (testRes.text || "").trim(),
      };
    } catch (testErr: any) {
      liveTestResult = {
        success: false,
        error: testErr?.message || String(testErr),
      };
    }
  }

  const maskedPreview = hasApiKey
    ? `${rawKey.slice(0, 6)}...${rawKey.slice(-4)}`
    : null;

  return res.status(200).json({
    status: "ok",
    hasApiKey,
    keyVarName: matched?.name || null,
    keyPreview: maskedPreview,
    platform: "Vercel Serverless Function",
    service: "Rehnuma AI Guidance Core",
    liveTest: liveTestResult,
    message: hasApiKey
      ? (liveTestResult && !liveTestResult.success
          ? `API key found (${matched?.name}) but Google Gemini returned error: ${liveTestResult.error}`
          : `Gemini AI Brain is connected and active using ${matched?.name}.`)
      : "GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in Vercel Settings > Environment Variables, then click Redeploy.",
  });
}
