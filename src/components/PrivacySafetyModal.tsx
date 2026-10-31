import React from "react";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  EyeOff,
  Cpu,
  Trash2,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { RehnumaLogo } from "./RehnumaLogo";

interface PrivacySafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearSessionData: () => void;
}

export const PrivacySafetyModal: React.FC<PrivacySafetyModalProps> = ({
  isOpen,
  onClose,
  onClearSessionData,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFFFF] border-2 border-[#1E4D3E] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5DEC9] bg-[#F7F2EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1E4D3E] text-white flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#8FB89A]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E4D3E]">
                تحفظ اور رازداری (Trust, Safety & Privacy)
              </h2>
              <p className="text-xs text-stone-600">
                رہنما آپ کے مکمل کنٹرول اور ذاتی ڈیٹا کے تحفظ کے لیے بنایا گیا ہے
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-800 text-sm sm:text-base leading-relaxed">
          {/* Pillar 1: No Registration / Login-Free */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5DEC9] flex items-start gap-3.5">
            <UserCheck className="w-6 h-6 text-[#1E4D3E] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#1E4D3E]">1. بغیر رجسٹریشن اور لاگ اِن (Login-Free Access)</h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                رہنما استعمال کرنے کے لیے کسی بھی ای میل، اکاؤنٹ، پاس ورڈ، یا شناختی معلومات کی ضرورت نہیں ہے۔ ہر سیشن مکمل طور پر گمنام اور عارضی ہوتا ہے۔
              </p>
            </div>
          </div>

          {/* Pillar 2: Ephemeral Processing & Zero Storage */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5DEC9] flex items-start gap-3.5">
            <Lock className="w-6 h-6 text-[#1E4D3E] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#1E4D3E]">2. عارضی پراسیسنگ اور زیرو مستقل سٹوریج (Zero Storage)</h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                آپ کے اپلوڈ کردہ سکرین شاٹس اور آواز کے پیغامات کسی بھی ڈیٹا بیس یا فائل سرور میں مستقل طور پر محفوظ نہیں کیے جاتے۔ رہنمائی کا جواب ملتے ہی میموری سے صاف کر دیا جاتا ہے۔
              </p>
            </div>
          </div>

          {/* Pillar 3: Sensitive Data Protection */}
          <div className="p-4 rounded-2xl bg-[#FCE8DC] border border-[#E07A48] flex items-start gap-3.5">
            <EyeOff className="w-6 h-6 text-[#D96B27] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#D96B27]">3. حساس ڈیٹا کا تحفظ (Sensitive Data Protection)</h4>
              <p className="text-xs sm:text-sm text-stone-800 mt-1">
                رہنما کبھی بھی پاس ورڈ، اے ٹی ایم پن (PIN)، یا او ٹی پی (OTP) کا تقاضا نہیں کرتا۔ ایپ میں موجود ریڈیکشن (Redaction) ٹول کے ذریعے آپ بھیجنے سے پہلے بینک بیلنس یا ذاتی نمبر خود چھپا سکتے ہیں۔
              </p>
            </div>
          </div>

          {/* Pillar 4: A Guide, Not a Takeover */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5DEC9] flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#1E4D3E] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#1E4D3E]">4. رہنمائی، نہ کہ قبضہ (A Guide, Not a Takeover)</h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                رہنما آپ کے موبائل یا کمپیوٹر پر کوئی ریموٹ کنٹرول حاصل نہیں کرتا اور نہ ہی آپ کی طرف سے کوئی خودکار کلک یا رقم منتقلی کر سکتا ہے۔ فیصلہ، عمل اور کنٹرول ہمیشہ صارف کے ہاتھ میں رہتا ہے۔
              </p>
            </div>
          </div>

          {/* Pillar 5: Third-party AI Transparency */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5DEC9] flex items-start gap-3.5">
            <Cpu className="w-6 h-6 text-stone-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-800">5. شفاف AI انضمام (AI Transparency)</h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                سکرین اور سوال کو سمجھنے کے لیے Google Gemini AI ماڈلز کو صرف پس پردہ (Server-Side) استعمال کیا جاتا ہے۔ آپ کی API کیز یا صارف کا ڈیٹا کبھی بھی عوامی نہیں ہوتا۔
              </p>
            </div>
          </div>

          {/* Instant Purge Button */}
          <div className="p-4 rounded-2xl bg-[#E6F0EB] border border-[#8FB89A] flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-bold text-[#1E4D3E] text-sm">کیا آپ فوری ڈیٹا ختم کرنا چاہتے ہیں؟</p>
              <p className="text-xs text-stone-600">ایک کلک سے موجودہ سکرین شاٹ اور تمام عارضی کیشے صاف کریں</p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClearSessionData();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#1E4D3E] hover:bg-[#163B2F] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#8FB89A]" />
              <span>تمام سیشن ڈیٹا صاف کریں</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F2EB] border-t border-[#E5DEC9] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#1E4D3E] hover:bg-[#163B2F] text-white font-bold text-sm cursor-pointer"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
