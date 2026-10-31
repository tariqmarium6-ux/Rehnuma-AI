import { GoogleGenAI, Type } from "@google/genai";
import type { GuidanceResponse, GuidanceStep } from "../../src/types";

let geminiClient: GoogleGenAI | null = null;
let currentKeyCached = "";

export function getApiKey(): { key: string; varName: string } | null {
  const envCandidates = [
    { name: "GEMINI_API_KEY", val: process.env.GEMINI_API_KEY },
    { name: "GOOGLE_API_KEY", val: process.env.GOOGLE_API_KEY },
    { name: "VITE_GEMINI_API_KEY", val: process.env.VITE_GEMINI_API_KEY },
    { name: "VITE_GOOGLE_API_KEY", val: process.env.VITE_GOOGLE_API_KEY },
    { name: "NEXT_PUBLIC_GEMINI_API_KEY", val: process.env.NEXT_PUBLIC_GEMINI_API_KEY },
    { name: "API_KEY", val: process.env.API_KEY },
  ];

  for (const candidate of envCandidates) {
    if (candidate.val && candidate.val.trim().length > 0) {
      const cleaned = candidate.val.trim().replace(/^["']|["']$/g, "").trim();
      if (cleaned.length > 5) {
        return { key: cleaned, varName: candidate.name };
      }
    }
  }
  return null;
}

export function getGeminiClient(): GoogleGenAI | null {
  const keyInfo = getApiKey();
  if (!keyInfo) return null;
  if (!geminiClient || currentKeyCached !== keyInfo.key) {
    geminiClient = new GoogleGenAI({ apiKey: keyInfo.key });
    currentKeyCached = keyInfo.key;
  }
  return geminiClient;
}

export function extractMimeAndBase64(dataUriOrRaw: string): { mimeType: string; cleanBase64: string } {
  if (!dataUriOrRaw) return { mimeType: "image/jpeg", cleanBase64: "" };

  const match = dataUriOrRaw.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    let mime = match[1].toLowerCase().trim();
    if (mime.includes("png")) mime = "image/png";
    else if (mime.includes("webp")) mime = "image/webp";
    else if (mime.includes("gif")) mime = "image/gif";
    else mime = "image/jpeg";
    return { mimeType: mime, cleanBase64: match[2].trim() };
  }

  const cleaned = dataUriOrRaw.replace(/^data:image\/[^;]+;base64,/i, "").trim();
  return { mimeType: "image/jpeg", cleanBase64: cleaned };
}

export interface GuidanceRequestInput {
  imageBase64?: string;
  imageMimeType?: string;
  userQuery?: string;
  stepNumber?: number;
  previousSteps?: string[];
  userFeedback?: "completed" | "stuck" | "new_screen";
  interfaceLanguage?: "en" | "ur";
  voiceInputLanguage?: "en" | "ur";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export async function performGuidance(input: GuidanceRequestInput): Promise<GuidanceResponse> {
  const {
    imageBase64,
    userQuery = "",
    stepNumber = 1,
    previousSteps = [],
    userFeedback = "new_screen",
    interfaceLanguage = "ur",
    voiceInputLanguage = "ur",
  } = input;

  const ai = getGeminiClient();

  if (!ai) {
    console.warn("GEMINI_API_KEY not configured, using fallback heuristics");
    return generateOfflineGuidance(input);
  }

  const systemInstruction = `You are the AI guidance intelligence for "Rehnuma" (رہنما) — "Your personal guide to everyday technology" (ٹیکنالوجی، ایک وقت میں ایک قدم۔ رہنمائی، نہ کہ قبضہ).
Rehnuma is designed for parents, grandparents, and non-technical users who struggle with digital tasks on mobile apps, messengers (WhatsApp, Telegram, etc.), social media, banking apps, online portals, and forms.
Your mission is to look at the user's uploaded screenshot and their voice/text description, understand the EXACT context of the app or screen they are on, and guide them with ONE clear, friendly next step.

CRITICAL RULES:
1. NEVER assume the screen is an electricity bill unless the screen or text explicitly shows a utility bill!
   If the screen is a banking app, guide them on the banking app. If it is WhatsApp, Facebook, YouTube, email, or settings, guide them on that exact screen.
2. STRICT 2-TO-3 STEP LIMIT (NEVER ENDLESS):
   - Every task must be complete in 2 to 3 steps maximum! Total estimated steps must be between 1 and 3 (never more than 3).
   - If the task is straightforward (e.g. "How to send money" -> tapping "Send Money" / "Transfer"), 1 or 2 steps is completely enough.
   - When the primary action is shown, or when stepNumber >= 2, mark "isFinalStep": true immediately!
   - Do NOT drag the user through endless micro-steps. Respect their time and keep it simple.
3. Provide ONLY ONE single next action. Never overwhelm them with multiple steps at once.
4. Explain WHY that action is necessary in simple, respectful everyday Urdu and English (avoid technical jargon like "DOM", "POST", "URL", "cache", "token", "payload").
5. Visual localization: pinpoint the exact button, input field, or icon to tap on this screen. Estimate its coordinate percentages (xPercent: 0-100, yPercent: 0-100, widthPercent: 0-100, heightPercent: 0-100) so Rehnuma can place a glowing spotlight beacon on it.
6. Provide a gentle confirmation question in Urdu and English.
7. Provide natural audio scripts for text-to-speech in both Urdu and English.`;

  const promptText = `User Description / Goal: "${userQuery || "Please look at this screen and show me what to do next."}"
Current Step Number: ${stepNumber} (Maximum allowed steps: 3)
Feedback: ${userFeedback}
Previous steps: ${previousSteps.length > 0 ? previousSteps.join(" -> ") : "None (Starting step)"}

Look carefully at the uploaded screenshot. Identify what application or screen this is, understand what the user wants to accomplish, and give the single clearest next action on this screen. Keep the journey to 2-3 steps maximum. If this step completes their main goal, set isFinalStep: true.`;

  let contents: any;

  if (imageBase64 && imageBase64.length > 50) {
    const { mimeType, cleanBase64 } = extractMimeAndBase64(imageBase64);
    contents = {
      parts: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        { text: promptText },
      ],
    };
  } else {
    contents = {
      parts: [{ text: promptText }],
    };
  }

  // Active, high-quota models with multimodal support in priority order
  const candidateModels = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ];

  let response: any = null;
  let modelUsed = "";
  let lastError: any = null;

  for (const modelCandidate of candidateModels) {
    try {
      response = await withTimeout(
        ai.models.generateContent({
          model: modelCandidate,
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                goalIdentified: { type: Type.STRING, description: "Clear goal summary in English based on the screenshot" },
                goalIdentifiedUr: { type: Type.STRING, description: "Clear goal summary in Urdu script" },
                currentScreenDescription: { type: Type.STRING, description: "The actual app or website showing in screenshot in English" },
                currentScreenDescriptionUr: { type: Type.STRING, description: "The actual app or website showing in screenshot in Urdu" },
                currentStep: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    totalEstimatedSteps: { type: Type.INTEGER },
                    title: { type: Type.STRING, description: "Short step title in English" },
                    titleUr: { type: Type.STRING, description: "Short step title in Urdu script" },
                    actionText: { type: Type.STRING, description: "The ONE single clear next action in English" },
                    actionTextUr: { type: Type.STRING, description: "The ONE single clear next action in Urdu script" },
                    whyExplanation: { type: Type.STRING, description: "Simple explanation of why this step is needed" },
                    whyExplanationUr: { type: Type.STRING, description: "Simple explanation of why in Urdu" },
                    confirmationQuestion: { type: Type.STRING, description: "Gentle question asking if user completed step" },
                    confirmationQuestionUr: { type: Type.STRING, description: "Gentle question in Urdu" },
                    audioScriptEn: { type: Type.STRING, description: "Spoken voice guide in English" },
                    audioScriptUr: { type: Type.STRING, description: "Spoken voice guide in Urdu script" },
                    audioScriptUrRoman: { type: Type.STRING, description: "Spoken voice guide in Roman Urdu" },
                    isFinalStep: { type: Type.BOOLEAN },
                    targetElement: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        xPercent: { type: Type.NUMBER, description: "X coordinate percentage from left (0 to 100)" },
                        yPercent: { type: Type.NUMBER, description: "Y coordinate percentage from top (0 to 100)" },
                        widthPercent: { type: Type.NUMBER, description: "Width percentage (0 to 100)" },
                        heightPercent: { type: Type.NUMBER, description: "Height percentage (0 to 100)" },
                        shape: { type: Type.STRING, description: "rect or circle" },
                      },
                      required: ["label", "xPercent", "yPercent"],
                    },
                  },
                  required: [
                    "stepNumber",
                    "totalEstimatedSteps",
                    "title",
                    "titleUr",
                    "actionText",
                    "actionTextUr",
                    "whyExplanation",
                    "whyExplanationUr",
                    "confirmationQuestion",
                    "confirmationQuestionUr",
                    "audioScriptEn",
                    "audioScriptUr",
                    "isFinalStep",
                  ],
                },
              },
              required: [
                "goalIdentified",
                "goalIdentifiedUr",
                "currentScreenDescription",
                "currentScreenDescriptionUr",
                "currentStep",
              ],
            },
          },
        }),
        18000
      );

      if (response && response.text) {
        modelUsed = modelCandidate;
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model candidate ${modelCandidate} notice:`, err?.message || err);
    }
  }

  if (!response || !response.text) {
    console.warn("Gemini call fell back to context guidance:", lastError?.message);
    return generateOfflineGuidance(input);
  }

  try {
    const parsed: GuidanceResponse = JSON.parse(response.text);
    
    // Enforce 2-3 step cap strictly
    const stepNum = input.stepNumber || 1;
    const rawTotal = parsed.currentStep?.totalEstimatedSteps || 2;
    const totalSteps = Math.min(Math.max(rawTotal, stepNum), 3);
    const isFinal = stepNum >= totalSteps || stepNum >= 2 || Boolean(parsed.currentStep?.isFinalStep);

    if (parsed.currentStep) {
      parsed.currentStep.stepNumber = stepNum;
      parsed.currentStep.totalEstimatedSteps = totalSteps;
      parsed.currentStep.isFinalStep = isFinal;
    }

    return {
      ...parsed,
      technicalDetails: {
        modelUsed: modelUsed || "gemini-flash-lite-latest",
        hasScreenshot: Boolean(imageBase64 && imageBase64.length > 50),
        hasVoicePrompt: Boolean(userQuery),
        interfaceLanguage,
        voiceInputLanguage,
      },
    };
  } catch (parseError) {
    console.error("JSON parse error from Gemini guidance output:", parseError);
    return generateOfflineGuidance(input);
  }
}

/**
 * Dynamic, neutral fallback guidance based on what the user actually asked
 */
export function generateOfflineGuidance(input: GuidanceRequestInput): GuidanceResponse {
  const query = (input.userQuery || "").toLowerCase();
  const step = input.stepNumber || 1;

  // ONLY return electricity bill if the user explicitly mentioned bill keywords!
  const isExplicitBillQuery =
    query.includes("bijli") ||
    query.includes("lesco") ||
    query.includes("wapda") ||
    query.includes("mepco") ||
    query.includes("electric bill") ||
    query.includes("بجلی کا بل");

  if (isExplicitBillQuery) {
    return {
      goalIdentified: "Download Monthly Electricity Bill (PDF)",
      goalIdentifiedUr: "ماہانہ بجلی کا بل (PDF) ڈاؤن لوڈ کرنا",
      currentScreenDescription: "Utility Portal Main Services Page",
      currentScreenDescriptionUr: "بجلی کمپنی کا سروسز صفحہ",
      currentStep: {
        stepNumber: step,
        totalEstimatedSteps: 3,
        title: step === 1 ? "Click on 'Download bill'" : step === 2 ? "Enter Reference Number" : "Download PDF Bill",
        titleUr: step === 1 ? "'Download bill' پر کلک کریں" : step === 2 ? "14 ہندسوں والا ریفرنس نمبر لکھیں" : "بل ڈاؤن لوڈ کریں",
        actionText: step === 1 ? "Tap on the button that says 'Download bill' (ڈاؤن لوڈ بل)." : step === 2 ? "Tap the input box labeled 'Reference Number', type your 14 digits, and tap 'Search Bill'." : "Tap the green button that says 'Download PDF Bill'.",
        actionTextUr: step === 1 ? "سکرین پر 'Download bill' والے بٹن پر انگلی سے کلک کریں۔" : step === 2 ? "خالی ڈبے پر کلک کر کے اپنے پرانے بل سے 14 ہندسے لکھیں اور سرچ دبائیں۔" : "سبز رنگ کا 'Download PDF Bill' بٹن دبائیں۔",
        whyExplanation: "This service opens the official bill retrieval tool.",
        whyExplanationUr: "یہ آپشن آپ کو بل تلاش کرنے والے اصل صفحے پر لے جاتا ہے۔",
        confirmationQuestion: "Did you click on 'Download bill'?",
        confirmationQuestionUr: "کیا آپ نے 'Download bill' پر کلک کر لیا ہے؟",
        audioScriptEn: "Hello! On your screen, look at the options. There is a button labeled 'Download bill'. Tap on it to open your billing search.",
        audioScriptUr: "السلام علیکم! سکرین پر سامنے دیکھیں، 'Download bill' کا کارڈ نظر آ رہا ہے۔ اس پر انگلی سے ہلکا سا کلک کریں۔",
        audioScriptUrRoman: "Screen par saamnay dekhein, 'Download bill' likha hua hai. Is par click karein.",
        isFinalStep: step >= 3,
        targetElement: {
          label: "Download bill Button",
          xPercent: 50,
          yPercent: 46,
          widthPercent: 32,
          heightPercent: 12,
          shape: "rect",
        },
      },
    };
  }

  // Messenger / WhatsApp or general app task
  const isChatQuery = query.includes("whatsapp") || query.includes("chat") || query.includes("message") || query.includes("پیغام") || query.includes("واٹس ایپ");

  if (isChatQuery) {
    return {
      goalIdentified: "Send WhatsApp / App Message",
      goalIdentifiedUr: "پیغام یا چیٹ بھیجنا",
      currentScreenDescription: "Chat Application Screen",
      currentScreenDescriptionUr: "چیٹ اور میسجنگ سکرین",
      currentStep: {
        stepNumber: step,
        totalEstimatedSteps: 2,
        title: "Tap the message box or contact",
        titleUr: "مطلوبہ رابطہ یا میسج باکس پر کلک کریں",
        actionText: "Tap on the contact name or the message typing area at the bottom of your screen.",
        actionTextUr: "سکرین کے نیچے میسج لکھنے کی جگہ یا مطلوبہ شخص کے نام پر انگلی سے کلک کریں۔",
        whyExplanation: "This opens the conversation so you can send your message.",
        whyExplanationUr: "اس سے چیٹ کھل جائے گی اور آپ اپنا پیغام یا صوتی نوٹ بھیج سکیں گے۔",
        confirmationQuestion: "Did you tap on the chat area?",
        confirmationQuestionUr: "کیا آپ نے چیٹ یا رابطہ پر کلک کیا؟",
        audioScriptEn: "On your screen, look for the contact name or message box at the bottom. Tap on it once to begin.",
        audioScriptUr: "سکرین کے نیچے دیکھیں جہاں میسج لکھنے کی جگہ یا رابطہ کا نام ہے۔ اس پر ہلکا سا کلک کریں۔",
        audioScriptUrRoman: "Screen ke neechay message box ya contact par click karein.",
        isFinalStep: false,
        targetElement: {
          label: "Chat Input / Contact",
          xPercent: 50,
          yPercent: 70,
          widthPercent: 60,
          heightPercent: 12,
          shape: "rect",
        },
      },
    };
  }

  // General, neutral guidance for any other screen
  const maxSteps = 2;
  const isFinal = step >= maxSteps;

  return {
    goalIdentified: input.userQuery ? input.userQuery.slice(0, 60) : "Screen Navigation Guidance",
    goalIdentifiedUr: input.userQuery ? input.userQuery.slice(0, 60) : "سکرین پر مطلوبہ عمل کی رہنمائی",
    currentScreenDescription: "Active Application Screen",
    currentScreenDescriptionUr: "موجودہ ایپلیکیشن سکرین",
    currentStep: {
      stepNumber: step,
      totalEstimatedSteps: maxSteps,
      title: isFinal ? "Complete your task" : "Tap the highlighted option on screen",
      titleUr: isFinal ? "اپنا کام مکمل کریں" : "سکرین پر نمایاں کیے گئے حصے پر کلک کریں",
      actionText: isFinal
        ? "Tap the confirmed action or finish button to complete your task."
        : "Look at the highlighted area on your screen and gently tap it once.",
      actionTextUr: isFinal
        ? "سکرین پر تصدیقی بٹن پر کلک کر کے اپنا کام مکمل کریں۔"
        : "سکرین پر نمایاں کیے گئے حصے کو دیکھیں اور اس پر ایک بار کلک کریں۔",
      whyExplanation: "This takes you directly to your goal without extra unnecessary steps.",
      whyExplanationUr: "اس سے آپ بغیر کسی الجھن یا فالتو مراحل کے سیدھا مقصد تک پہنچ جاتے ہیں۔",
      confirmationQuestion: isFinal ? "Did you finish this action?" : "Were you able to find and tap this option?",
      confirmationQuestionUr: isFinal ? "کیا آپ کا کام مکمل ہو گیا ہے؟" : "کیا آپ کو یہ بٹن مل گیا اور آپ نے کلک کیا؟",
      audioScriptEn: isFinal
        ? "Great job! Tap the confirmation button to finish."
        : "Take your time. Notice the spotlight on your screen. Tap that button gently to continue.",
      audioScriptUr: isFinal
        ? "بہت خوب! کام مکمل کرنے کے لیے تصدیقی بٹن پر کلک کریں۔"
        : "پرسکون رہیں۔ سکرین پر دائرے میں دکھائے گئے بٹن پر ہلکا سا کلک کریں تاکہ اگلا مرحلہ شروع ہو سکے۔",
      audioScriptUrRoman: isFinal ? "Bohot khoob! Kaam mukammal karne ke liye click karein." : "Screen par circle kiye gaye button par click karein.",
      isFinalStep: isFinal,
      targetElement: {
        label: "Primary Option",
        xPercent: 50,
        yPercent: 50,
        widthPercent: 40,
        heightPercent: 12,
        shape: "rect",
      },
    },
  };
}
