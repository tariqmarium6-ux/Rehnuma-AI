import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { RehnumaLogo } from "./RehnumaLogo";
import { AppLanguage } from "../types";

interface AnalyzingLoaderProps {
  language: AppLanguage;
}

export const AnalyzingLoader: React.FC<AnalyzingLoaderProps> = ({ language }) => {
  const isUrdu = language === "ur";
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="analyzing-state-container"
      className="w-full flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-300 max-w-md mx-auto"
    >
      {/* 8-Point Rosette Beacon Pulse Animation */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-36 h-36 rounded-full bg-[#E07A48]/20 animate-ping opacity-35" />
        <div className="absolute w-28 h-28 rounded-full bg-[#8FB89A]/30 animate-pulse opacity-60" />
        <div className="relative w-24 h-24 rounded-3xl bg-[#F7F2EB] border-2 border-[#E5DEC9] text-[#1E4D3E] flex items-center justify-center shadow-lg">
          <RehnumaLogo size={60} className="animate-spin" />
        </div>
      </div>

      {/* Main simple reassurance */}
      <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#1E4D3E] text-white tracking-widest mb-3">
        02 UNDERSTAND & GUIDE
      </span>

      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E4D3E] tracking-tight mb-2">
        {isUrdu ? "سکرین اور آپ کے مقصد کا جائزہ..." : "Understanding your screen..."}
      </h2>

      {/* Spoken / Reassuring Urdu & English text */}
      <p className="text-sm sm:text-base font-medium text-stone-600 max-w-sm">
        {isUrdu
          ? "تھوڑا سا انتظار فرمائیں۔ رہنما آپ کے لیے ایک وقت میں صرف ایک واضح اگلا قدم تیار کر رہا ہے۔"
          : "Please hold on a moment. Rehnuma is finding the single clearest next step for you."}
      </p>

      {/* Step animation checklist */}
      <div className="w-full bg-white rounded-2xl border border-[#E5DEC9] p-3.5 mt-5 space-y-2 text-xs text-left">
        <div className="flex items-center gap-2 text-[#1E4D3E] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#1E4D3E]" />
          <span>{isUrdu ? "سکرین کی تصویر کا مطالعہ" : "Inspecting screen elements"}</span>
        </div>
        <div className="flex items-center gap-2 text-[#D96B27] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#D96B27] animate-ping" />
          <span>{isUrdu ? "آپ کے صوتی پیغام کا مفہوم" : "Interpreting your voice description"}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-400">
          <span className="w-2 h-2 rounded-full bg-stone-300" />
          <span>{isUrdu ? "ایک وقت میں ایک اگلا قدم منتخب کرنا" : "Generating one clear next action"}</span>
        </div>
      </div>

      {/* Subtle reassurance on time */}
      <p className="text-[11px] text-stone-600 mt-4">
        {isUrdu
          ? "چند سیکنڈز میں رہنمائی سکرین پر آ جائے گی..."
          : `Preparing your guidance (${secondsElapsed}s)...`}
      </p>
    </div>
  );
};
