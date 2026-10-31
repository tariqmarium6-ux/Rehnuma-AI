import { InteractiveSimulatorScenario } from "../types";

export const REHNUMA_SCENARIOS: InteractiveSimulatorScenario[] = [
  {
    id: "electricity-bill",
    titleEn: "Download Electricity Bill (PDF)",
    titleUr: "بجلی کا بل ڈاؤن لوڈ کرنا",
    descriptionEn: "Learn how to find and download your monthly utility bill without visiting an office.",
    descriptionUr: "بغیر قطار میں لگے گھر بیٹھے اپنا بجلی کا بل حاصل کرنے کا آسان طریقہ۔",
    iconName: "Zap",
    defaultVoiceQueryEn: "I want to download my electricity bill, but I'm not sure which button to click.",
    defaultVoiceQueryUr: "مجھے اپنا بجلی کا بل ڈاؤن لوڈ کرنا ہے لیکن سمجھ نہیں آ رہا کہاں کلک کروں۔",
  },
  {
    id: "online-form",
    titleEn: "Fill an Online Application Form",
    titleUr: "آن لائن فارم اور معلومات درج کرنا",
    descriptionEn: "Step-by-step guidance on which fields to fill and how to proceed safely.",
    descriptionUr: "فارم میں صحیح خانے بھرنے اور محفوظ طریقے سے آگے بڑھنے کی رہنمائی۔",
    iconName: "FileText",
    defaultVoiceQueryEn: "Help me fill this online form, which field should I enter first?",
    defaultVoiceQueryUr: "اس فارم کو بھرنے میں میری مدد کریں، پہلے کیا لکھنا ہے؟",
  },
  {
    id: "document-upload",
    titleEn: "Attach & Upload a Document",
    titleUr: "دستاویز یا تصویر اپلوڈ کرنا",
    descriptionEn: "How to select and attach a certificate or photo without making errors.",
    descriptionUr: "کسی بھی ویب سائٹ پر اپنی تصویر یا دستاویز آسانی سے منسلک کرنے کا طریقہ۔",
    iconName: "Upload",
    defaultVoiceQueryEn: "How do I upload my document or file on this screen?",
    defaultVoiceQueryUr: "مجھے اس سکرین پر اپنی دستاویز اپلوڈ کرنی ہے، کیسے کروں؟",
  },
];

export const SHOW_ME_HOW_SCENARIOS = REHNUMA_SCENARIOS;
