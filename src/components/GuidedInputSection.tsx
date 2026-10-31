import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  Zap,
  RefreshCw,
  Image as ImageIcon,
  EyeOff,
  AlertCircle,
  Shield,
} from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { optimizeScreenshot } from "../utils/imageCompressor";
import { RedactScreenshotModal } from "./RedactScreenshotModal";

interface GuidedInputSectionProps {
  onSubmitGuidance: (payload: {
    screenshotBase64: string;
    voiceTranscript: string;
    stepNumber?: number;
  }) => void;
  onOpenElectricitySimulator: () => void;
  isAnalyzing: boolean;
  preloadedScreenshot?: string | null;
  preloadedTranscript?: string;
}

export const GuidedInputSection: React.FC<GuidedInputSectionProps> = ({
  onSubmitGuidance,
  onOpenElectricitySimulator,
  isAnalyzing,
  preloadedScreenshot = null,
  preloadedTranscript = "",
}) => {
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(preloadedScreenshot);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [voiceTranscript, setVoiceTranscript] = useState<string>(preloadedTranscript);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isRedactModalOpen, setIsRedactModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proactive scanner: detect if user mentions sensitive credential terms
  const sensitiveKeywords = ["password", "pin", "otp", "code", "cvv", "cnic", "پاس ورڈ", "او ٹی پی", "پن", "کارڈ نمبر", "شناختی کارڈ"];
  const hasSensitivePrompt = useMemo(() => {
    const text = (voiceTranscript || "").toLowerCase();
    return sensitiveKeywords.some((kw) => text.includes(kw));
  }, [voiceTranscript]);

  // Keep state in sync if preloadedScreenshot changes (e.g. from simulator or back button)
  useEffect(() => {
    if (preloadedScreenshot && preloadedScreenshot !== screenshotBase64) {
      setScreenshotBase64(preloadedScreenshot);
      setImageFileName("سکرین شاٹ (Captured Screen)");
    }
  }, [preloadedScreenshot]);

  // Handle image file selection: read immediately so user sees it right away!
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("براہ کرم تصویر منتخب کریں۔ (Please select an image file)");
      return;
    }

    setImageFileName(file.name || "screenshot.png");
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawDataUrl = (e.target?.result as string) || "";
      // 1. Immediately show the image on the screen so the user sees it without delay!
      setScreenshotBase64(rawDataUrl);
      setIsProcessingImage(false);

      // 2. Perform safe background compression for fast upload
      try {
        const optimized = await optimizeScreenshot(rawDataUrl, 1280, 1280, 0.85);
        if (optimized && optimized.length > 500) {
          setScreenshotBase64(optimized);
        }
      } catch (err) {
        console.warn("Background optimization notice:", err);
      }
    };

    reader.onerror = () => {
      setIsProcessingImage(false);
      alert("تصویر لوڈ نہیں ہو سکی، براہ کرم دوبارہ کوشش کریں۔");
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotBase64 && !voiceTranscript.trim()) {
      alert("براہ کرم پہلے سکرین شاٹ کی تصویر منتخب کریں یا بول کر بتائیں۔");
      return;
    }

    onSubmitGuidance({
      screenshotBase64: screenshotBase64 || "",
      voiceTranscript: voiceTranscript.trim(),
      stepNumber: 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 max-w-6xl xl:max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 1. SCREENSHOT UPLOAD (CLEAR & VISIBLE) */}
        <div className="bg-[#FFFFFF] rounded-3xl border-2 border-[#E5DEC9] p-5 sm:p-6 space-y-4 shadow-xs h-full flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E4D3E]/10 text-[#1E4D3E] flex items-center justify-center font-bold shrink-0">
              <Camera className="w-5 h-5 text-[#1E4D3E]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1E4D3E] leading-tight">
                1. سکرین کی تصویر لگائیں (Screenshot)
              </h3>
              <p className="text-xs text-stone-600">
                اس سکرین کی تصویر جہاں آپ کو سمجھ نہیں آ رہا
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenElectricitySimulator}
            className="text-xs font-bold text-[#D96B27] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-[#D96B27]" />
            <span>بجلی بل کی مثال آزمائیں</span>
          </button>
        </div>

        {/* Large, Clear Visual Screenshot Preview */}
        {screenshotBase64 ? (
          <div className="space-y-3">
            {/* Visual Confirmation Banner with Redact & Change Options */}
            <div className="flex items-center justify-between bg-[#E6F0EB] px-3.5 py-2 rounded-xl border border-[#8FB89A] flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E4D3E]">
                <CheckCircle2 className="w-4 h-4 text-[#1E4D3E] shrink-0" />
                <span>تصویر تیار ہے ({imageFileName || "Screenshot Ready"})</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Sensitive Info Redaction Tool Button (Requirement 3) */}
                <button
                  type="button"
                  onClick={() => setIsRedactModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-[#1E4D3E] text-xs font-bold border border-[#8FB89A] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Hide passwords, account balances or sensitive details"
                >
                  <EyeOff className="w-3.5 h-3.5 text-[#D96B27]" />
                  <span>معلومات چھپائیں (Redact)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                      fileInputRef.current.click();
                    }
                  }}
                  className="text-xs font-bold text-[#D96B27] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>تبدیل کریں</span>
                </button>
              </div>
            </div>

            {/* Clear Image Display */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#1E4D3E]/30 bg-[#F7F2EB] p-2 flex items-center justify-center shadow-xs">
              <img
                src={screenshotBase64}
                alt="Selected Screen"
                className="w-full max-h-80 object-contain rounded-xl mx-auto block shadow-xs"
              />

              <button
                type="button"
                onClick={() => {
                  setScreenshotBase64(null);
                  setImageFileName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/95 text-stone-800 shadow-md cursor-pointer hover:text-red-600 hover:bg-white transition-all flex items-center gap-1 text-xs font-bold border border-stone-200"
                title="Remove image"
              >
                <X className="w-4 h-4 text-red-500" />
                <span>ہٹائیں (Remove)</span>
              </button>
            </div>

            {/* Proactive Sensitive Term Alert Banner if user speaks/types sensitive terms */}
            {hasSensitivePrompt && (
              <div className="bg-[#FCE8DC] border border-[#E07A48] rounded-xl p-3 flex items-start gap-2 text-xs text-[#1E4D3E] animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-[#D96B27] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#D96B27]">حفاظتی انتباہ: </span>
                  <span>
                    آپ نے پاس ورڈ یا او ٹی پی کا ذکر کیا۔ رہنما کو کبھی بھی آپ کے پاس ورڈ کی ضرورت نہیں ہوتی۔ اوپر دیے گئے بٹن سے حساس نمبر چھپا لیں۔
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 sm:p-9 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? "border-[#1E4D3E] bg-[#E6F0EB]"
                : "border-[#E5DEC9] bg-[#FBF9F5] hover:bg-[#F5EFE4]"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E6F0EB] text-[#1E4D3E] flex items-center justify-center mb-3 shadow-2xs">
              <Upload className="w-7 h-7 text-[#1E4D3E]" />
            </div>

            <p className="font-serif font-bold text-[#1E4D3E] text-base sm:text-lg mb-1">
              تصویر منتخب کرنے کے لیے یہاں دبائیں
            </p>
            <p className="text-xs text-stone-600">
              موبائل یا کمپیوٹر سے سکرین شاٹ لگائیں (یا فائل یہاں لا کر چھوڑیں)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />
      </div>

        {/* 2. VOICE RECORDER */}
        <div className="h-full flex flex-col justify-between">
          <VoiceRecorder
            onTranscriptChange={setVoiceTranscript}
            currentTranscript={voiceTranscript}
          />
        </div>
      </div>

      {/* CTA BUTTON */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isAnalyzing || isProcessingImage}
          className={`w-full py-4 px-6 rounded-2xl font-serif text-lg font-bold text-white flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer ${
            isAnalyzing || isProcessingImage
              ? "bg-[#8FB89A] cursor-not-allowed opacity-80"
              : "bg-[#1E4D3E] hover:bg-[#163B2F] active:scale-[0.99] hover:shadow-lg"
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>رہنما سکرین دیکھ رہا ہے...</span>
            </>
          ) : (
            <>
              <span>اگلا قدم بتائیں (Start Guidance)</span>
              <ArrowRight className="w-5 h-5 text-[#8FB89A]" />
            </>
          )}
        </button>
      </div>

      {/* Interactive Sensitive Information Redaction Tool (Requirement 3) */}
      {screenshotBase64 && (
        <RedactScreenshotModal
          isOpen={isRedactModalOpen}
          imageBase64={screenshotBase64}
          onApplyRedaction={(redacted) => setScreenshotBase64(redacted)}
          onClose={() => setIsRedactModalOpen(false)}
        />
      )}
    </form>
  );
};
