import React from "react";
import { ShieldCheck, AlertCircle, CheckCircle2, Lock, X } from "lucide-react";
import { RehnumaLogo } from "./RehnumaLogo";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFFFF] border-2 border-[#1E4D3E] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle Decorative Background Rosette */}
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
          <RehnumaLogo size={180} />
        </div>

        {/* Header with Shield Icon */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F0EB] text-[#1E4D3E] flex items-center justify-center shrink-0 border border-[#8FB89A]">
            <ShieldCheck className="w-8 h-8 text-[#1E4D3E]" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#D96B27]">
              آپ کی رازداری اور تحفظ (Informed Consent)
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E4D3E] leading-tight">
              رہنما استعمال کرنے سے پہلے
            </h2>
          </div>
        </div>

        {/* Clear, Plain-Language Disclosures */}
        <div className="space-y-3.5 text-stone-800 text-sm sm:text-base">
          {/* Item 1: Purpose */}
          <div className="p-3.5 rounded-2xl bg-[#F7F2EB] border border-[#E5DEC9] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1E4D3E] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1E4D3E]">صرف رہنمائی کے لیے پراسیسنگ:</p>
              <p className="text-xs sm:text-sm text-stone-700">
                آپ کا سکرین شاٹ اور آواز صرف اس لیے دیکھی جاتی ہے تاکہ آپ کو مطلوبہ بٹن یا اگلا مرحلہ سکھایا جا سکے۔
              </p>
            </div>
          </div>

          {/* Item 2: Sensitive Data Protection Warning */}
          <div className="p-3.5 rounded-2xl bg-[#FCE8DC] border border-[#E07A48] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#D96B27] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#D96B27]">پاس ورڈ اور ذاتی راز کبھی مت بتائیں:</p>
              <p className="text-xs sm:text-sm text-stone-800">
                براہ کرم پاس ورڈ، پن (PIN)، او ٹی پی (OTP) کوڈز، یا شناختی کارڈ نمبر مت بھیجیں۔ رہنما کبھی بھی آپ کے پاس ورڈ کا تقاضا نہیں کرتا۔
              </p>
            </div>
          </div>

          {/* Item 3: Zero Permanent Storage */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5DEC9] flex items-start gap-3">
            <Lock className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-800">عارضی سیشن اور کوئی مستقل ریکارڈنگ نہیں:</p>
              <p className="text-xs sm:text-sm text-stone-600">
                یہاں کوئی رجسٹریشن یا لاگ اِن درکار نہیں ہے۔ کام مکمل ہونے پر یا "ڈیٹا صاف کریں" دبانے پر آپ کا سکرین شاٹ اور تمام عارضی ڈیٹا فوری مٹا دیا جاتا ہے۔
              </p>
            </div>
          </div>
        </div>

        {/* Large, Touch-Friendly Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onAccept}
            className="w-full py-4 px-6 rounded-2xl bg-[#1E4D3E] hover:bg-[#163B2F] text-white font-serif font-bold text-base shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5 text-[#8FB89A]" />
            <span>سمجھ گیا، جاری رکھیں</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#F7F2EB] hover:bg-[#EAE4D7] text-stone-800 font-bold text-sm border border-[#E5DEC9] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 text-stone-500" />
            <span>منسوخ کریں (Cancel)</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-500 text-center">
          محفوظ Google Cloud Run بیک اینڈ پر AI پروسیسنگ، بغیر کسی مستقل ڈیٹا سٹوریج کے۔
        </p>
      </div>
    </div>
  );
};
