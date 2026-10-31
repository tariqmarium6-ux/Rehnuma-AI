import React, { useState, useRef } from "react";
import {
  FileText,
  Zap,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  Building2,
  X,
  Camera,
  RefreshCw,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { AppLanguage } from "../types";

interface ElectricityBillSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureScreenForGuidance: (screenshotBase64: string, defaultQuery: string, stepNumber: number) => void;
  language: AppLanguage;
}

export const ElectricityBillSimulator: React.FC<ElectricityBillSimulatorProps> = ({
  isOpen,
  onClose,
  onCaptureScreenForGuidance,
  language,
}) => {
  const [simulatorStage, setSimulatorStage] = useState<1 | 2 | 3>(1);
  const [referenceNumber, setReferenceNumber] = useState<string>("12115249876543");
  const portalRef = useRef<HTMLDivElement>(null);
  const isUrdu = language === "ur";

  if (!isOpen) return null;

  // Generates an SVG-backed clean base64 image representing the simulated screen from Slide 2
  const generateSimulatedScreenshot = (): string => {
    let stageTitle = "Electricity Services";
    let stageContentSvg = "";

    if (simulatorStage === 1) {
      stageTitle = "Electricity Services";
      stageContentSvg = `
        <rect x="50" y="140" width="380" height="60" rx="12" fill="#FAF5ED" stroke="#E5DEC9" stroke-width="2" />
        <text x="80" y="178" fill="#1E4D3E" font-size="18" font-family="sans-serif">Pay a bill</text>

        <rect x="50" y="220" width="380" height="60" rx="12" fill="#FAF5ED" stroke="#E07A48" stroke-width="3" />
        <text x="80" y="258" fill="#1E4D3E" font-size="18" font-weight="bold" font-family="sans-serif">Download bill (ڈاؤن لوڈ بل)</text>

        <!-- Peach Which One highlight bubble from Slide 2 -->
        <rect x="470" y="215" width="180" height="70" rx="16" fill="#FCE8DC" stroke="#E07A48" stroke-width="2" />
        <text x="515" y="258" fill="#D96B27" font-size="18" font-weight="bold" font-family="sans-serif">Which one?</text>

        <rect x="50" y="300" width="380" height="60" rx="12" fill="#FAF5ED" stroke="#E5DEC9" stroke-width="2" />
        <text x="80" y="338" fill="#1E4D3E" font-size="18" font-family="sans-serif">View history</text>
      `;
    } else if (simulatorStage === 2) {
      stageTitle = "Enter 14-digit Reference Number";
      stageContentSvg = `
        <rect x="40" y="120" width="680" height="280" rx="20" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="2" />
        <text x="80" y="175" fill="#1E4D3E" font-size="18" font-weight="bold" font-family="sans-serif">Enter 14-Digit Reference Number (ریفرنس نمبر)</text>
        <rect x="80" y="200" width="540" height="54" rx="10" fill="#FAF5ED" stroke="#1E4D3E" stroke-width="3" />
        <text x="100" y="235" fill="#1E4D3E" font-size="18" font-family="monospace">${referenceNumber}</text>

        <rect x="80" y="280" width="220" height="50" rx="12" fill="#1E4D3E" />
        <text x="130" y="312" fill="#FFFFFF" font-size="16" font-weight="bold" font-family="sans-serif">🔍 Search Bill</text>
      `;
    } else {
      stageTitle = "Official Bill Ready - Download PDF";
      stageContentSvg = `
        <rect x="40" y="120" width="680" height="300" rx="20" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="2" />
        <text x="80" y="165" fill="#1E4D3E" font-size="20" font-weight="bold" font-family="sans-serif">LESCO / MEPCO Electricity Bill - Oct 2026</text>
        <text x="80" y="200" fill="#666666" font-size="15" font-family="sans-serif">Consumer: Muhammad Tariq | Ref: 12-11524-9876543-U</text>
        <text x="80" y="235" fill="#1E4D3E" font-size="22" font-weight="bold" font-family="sans-serif">Payable Amount: Rs. 14,850</text>

        <rect x="80" y="270" width="280" height="54" rx="14" fill="#1E4D3E" />
        <text x="120" y="304" fill="#FFFFFF" font-size="17" font-weight="bold" font-family="sans-serif">📥 Download PDF Bill</text>
      `;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="760" height="480" viewBox="0 0 760 480">
        <rect width="760" height="480" fill="#F7F2EB" />
        <!-- Forest Green Browser Bar with Window Dots from Slide 2 -->
        <rect width="760" height="90" fill="#1E4D3E" />
        <circle cx="30" cy="45" r="7" fill="#E07A48" />
        <circle cx="50" cy="45" r="7" fill="#E3B367" />
        <circle cx="70" cy="45" r="7" fill="#8FB89A" />
        <text x="100" y="52" fill="#FFFFFF" font-size="20" font-weight="bold" font-family="sans-serif">Electricity Services (بجلی خدمات)</text>
        ${stageContentSvg}
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  const handleCaptureScreen = () => {
    const screenshot = generateSimulatedScreenshot();
    const query = isUrdu
      ? "مجھے اپنا بجلی کا بل ڈاؤن لوڈ کرنا ہے، بتائیں مجھے کیا کرنا ہے۔"
      : "I want to download my electricity bill, show me what to do next.";

    onCaptureScreenForGuidance(screenshot, query, simulatorStage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-[#E5DEC9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Simulator Top Nav with Slide 2 Aesthetic */}
        <div className="bg-[#1E4D3E] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#163B2F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D96B27] text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base tracking-tight">
                  {isUrdu ? "بجلی کی خدمات پورٹل (Electricity Services)" : "Electricity Services Website (Slide 2)"}
                </span>
                <span className="text-[10px] font-bold bg-[#E07A48] text-white px-2 py-0.5 rounded-full">
                  THE CHALLENGE
                </span>
              </div>
              <p className="text-[11px] text-[#8FB89A]">
                {isUrdu
                  ? "لوگوں کو کام چھیننے والے کی نہیں، بلکہ اگلے قدم کو سمجھانے والے رہنما کی ضرورت ہے۔"
                  : "People don't need someone to take over. They need help understanding what to do next."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-full hover:bg-[#163B2F] transition-colors cursor-pointer"
            aria-label="Close Simulator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Progress Bar inside Simulator */}
        <div className="bg-[#F7F2EB] px-5 py-2.5 border-b border-[#E5DEC9] flex items-center justify-between text-xs font-bold text-[#1E4D3E]">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">{isUrdu ? "مرحلہ:" : "Simulated Stage:"}</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSimulatorStage(1)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  simulatorStage === 1 ? "bg-[#1E4D3E] text-white font-bold shadow-xs" : "bg-white hover:bg-[#EAE4D7]"
                }`}
              >
                1. {isUrdu ? "خدمات مینو (Which one?)" : "Services Menu"}
              </button>
              <button
                onClick={() => setSimulatorStage(2)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  simulatorStage === 2 ? "bg-[#1E4D3E] text-white font-bold shadow-xs" : "bg-white hover:bg-[#EAE4D7]"
                }`}
              >
                2. {isUrdu ? "ریفرنس نمبر" : "Enter Reference #"}
              </button>
              <button
                onClick={() => setSimulatorStage(3)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  simulatorStage === 3 ? "bg-[#1E4D3E] text-white font-bold shadow-xs" : "bg-white hover:bg-[#EAE4D7]"
                }`}
              >
                3. {isUrdu ? "بل ڈاؤن لوڈ" : "Download Bill"}
              </button>
            </div>
          </div>

          <button
            onClick={() => setSimulatorStage(1)}
            className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isUrdu ? "شروع سے دیکھیں" : "Reset"}</span>
          </button>
        </div>

        {/* Simulated Website Body (From Slide 2: Electricity Services) */}
        <div ref={portalRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F7F2EB]">
          <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#E5DEC9] shadow-xs overflow-hidden max-w-2xl mx-auto">
            {/* Dark green header with 3 window dots */}
            <div className="bg-[#1E4D3E] text-white p-3.5 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E07A48]" />
                <span className="w-3 h-3 rounded-full bg-[#E3B367]" />
                <span className="w-3 h-3 rounded-full bg-[#8FB89A]" />
                <span className="ml-2 font-serif font-bold text-sm sm:text-base text-white">
                  Electricity Services
                </span>
              </div>
            </div>

            {/* Stage 1 Content: Services Menu with "Which one?" highlight */}
            {simulatorStage === 1 && (
              <div className="p-5 sm:p-6 space-y-4">
                <div className="text-center sm:text-left">
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#1E4D3E]">
                    Online Electricity Services (آن لائن بجلی خدمات)
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Select a service below to proceed with bill inquiries or applications.
                  </p>
                </div>

                <div className="space-y-3 pt-2 max-w-md">
                  {/* Option 1: Pay a bill */}
                  <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E5DEC9] text-stone-700 font-semibold text-sm">
                    Pay a bill
                  </div>

                  {/* Option 2: Download bill (with peach 'Which one?' pointer) */}
                  <div className="relative">
                    <div
                      onClick={() => setSimulatorStage(2)}
                      className="p-3.5 rounded-xl bg-[#FAF5ED] border-2 border-[#E07A48] text-[#1E4D3E] font-bold text-sm cursor-pointer hover:bg-[#FCE8DC] transition-colors flex items-center justify-between"
                    >
                      <span>Download bill (ڈپلیکیٹ بل ڈاؤن لوڈ)</span>
                      <ArrowRight className="w-4 h-4 text-[#D96B27]" />
                    </div>

                    <div className="hidden sm:flex absolute -right-36 top-1/2 -translate-y-1/2 bg-[#FCE8DC] border border-[#E07A48] text-[#D96B27] text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs items-center gap-1">
                      <span>Which one? 👈</span>
                    </div>
                  </div>

                  {/* Option 3: View history */}
                  <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E5DEC9] text-stone-700 font-semibold text-sm">
                    View history
                  </div>
                </div>
              </div>
            )}

            {/* Stage 2 Content: Reference Number Input Form */}
            {simulatorStage === 2 && (
              <div className="p-5 sm:p-6 space-y-4">
                <div className="text-center sm:text-left">
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#1E4D3E]">
                    Search Duplicate Electricity Bill
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Enter your 14-digit numeric reference number from any past paper bill.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5ED] border border-[#E5DEC9] space-y-3">
                  <label className="block text-xs font-bold text-[#1E4D3E]">
                    Reference Number (14 Digits):
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border-2 border-[#1E4D3E] font-mono text-base font-bold text-[#1E4D3E]"
                  />
                  <button
                    onClick={() => setSimulatorStage(3)}
                    className="py-2.5 px-5 rounded-xl bg-[#1E4D3E] text-white font-bold text-sm cursor-pointer hover:bg-[#163B2F] transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4 text-[#8FB89A]" />
                    <span>Search Bill</span>
                  </button>
                </div>
              </div>
            )}

            {/* Stage 3 Content: Bill Download Page */}
            {simulatorStage === 3 && (
              <div className="p-5 sm:p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-[#E6F0EB] border border-[#BBD7C7] flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h5 className="font-serif font-bold text-[#1E4D3E] text-base">
                      LESCO / MEPCO Electricity Bill — Ready
                    </h5>
                    <p className="text-xs text-stone-600">Consumer: Muhammad Tariq | Ref: 12-11524-9876543-U</p>
                    <p className="text-sm font-bold text-[#1E4D3E] mt-1">Amount Due: Rs. 14,850</p>
                  </div>
                  <button
                    onClick={() => alert(isUrdu ? "بل کامیابی کے ساتھ ڈاؤن لوڈ ہو گیا ہے!" : "Bill PDF downloaded successfully!")}
                    className="py-2.5 px-4 rounded-xl bg-[#1E4D3E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer hover:bg-[#163B2F]"
                  >
                    <Download className="w-4 h-4 text-[#8FB89A]" />
                    <span>Download PDF Bill</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer: Send to Rehnuma */}
        <div className="bg-[#FFFFFF] p-4 border-t-2 border-[#E5DEC9] flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-stone-600">
            {isUrdu
              ? "اس سکرین کی تصویر لیں تاکہ رہنما آپ کو اگلا قدم سکھا سکے:"
              : "Capture this simulated screen to test Rehnuma's guidance:"}
          </p>

          <button
            onClick={handleCaptureScreen}
            className="py-2.5 px-5 rounded-2xl bg-[#D96B27] hover:bg-[#C25A1A] text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-95"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>{isUrdu ? "یہ سکرین رہنما کو بھیجیں" : "Send Screen to Rehnuma"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
