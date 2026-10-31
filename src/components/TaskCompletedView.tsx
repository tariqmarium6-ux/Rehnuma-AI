import React, { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw, Volume2, Sparkles, ArrowRight, Eye } from "lucide-react";
import { GuidanceResponse, AppLanguage } from "../types";
import { RehnumaLogo } from "./RehnumaLogo";
import { audioController } from "../utils/audio";

interface TaskCompletedViewProps {
  guidance: GuidanceResponse;
  stepsHistory: string[];
  screenshotBase64?: string | null;
  onStartNewTask: () => void;
  onReviewSteps: () => void;
  language?: AppLanguage;
}

export const TaskCompletedView: React.FC<TaskCompletedViewProps> = ({
  guidance,
  stepsHistory,
  screenshotBase64,
  onStartNewTask,
  onReviewSteps,
  language = "ur",
}) => {
  const isUrdu = language === "ur";
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const celebrationUrdu = "شاباش! آپ نے یہ کام کامیابی کے ساتھ مکمل کر لیا ہے۔ اگر آپ کو کسی اور چیز میں مدد چاہیے تو نیا کام شروع کریں۔";
  const celebrationEnglish = "Well done! You have successfully completed this task in just a couple of easy steps.";

  useEffect(() => {
    // Play celebratory message on mount
    playCelebrationAudio();
    return () => {
      audioController.stop();
      setIsPlayingAudio(false);
    };
  }, []);

  const playCelebrationAudio = () => {
    audioController.stop();
    setIsPlayingAudio(true);
    const activeLang: "en" | "ur" = isUrdu ? "ur" : "en";
    audioController.speak(
      isUrdu ? celebrationUrdu : celebrationEnglish,
      activeLang,
      "Shabash! Aap ne yeh kaam kamyabi ke saath mukammal kar liya hai.",
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Celebratory Hero Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border-2 border-[#E5DEC9] p-6 sm:p-10 text-center space-y-6 shadow-sm relative overflow-hidden">
        {/* Subtle Decorative Background Rosette */}
        <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
          <RehnumaLogo size={200} />
        </div>

        {/* Central Celebratory Rosette Badge */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#E6F0EB] border-3 border-[#8FB89A] flex items-center justify-center text-[#1E4D3E] shadow-sm transform hover:scale-105 transition-transform">
            <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-[#1E4D3E]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#D96B27] text-white p-2 rounded-2xl shadow-md border-2 border-white">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Title and Congratulations */}
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-[#D96B27] bg-[#FCE8DC] px-4 py-1.5 rounded-full border border-[#E07A48]">
            {isUrdu ? "کام کامیابی سے مکمل!" : "Task Completed Successfully!"}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E4D3E] tracking-tight leading-tight">
            {isUrdu ? "شاباش! آپ کا کام مکمل ہو گیا ہے" : "Well done! You did it!"}
          </h1>
          <p className="text-base sm:text-lg text-stone-700 font-medium">
            {isUrdu
              ? "آپ نے رہنما کی مدد سے صرف دو سے تین آسان مراحل میں یہ کام خود مکمل کر لیا ہے۔"
              : "You completed this digital task independently in just a few simple, guided steps."}
          </p>
        </div>

        {/* Audio Celebration Player */}
        <div className="inline-flex items-center gap-3 bg-[#F7F2EB] px-5 py-2.5 rounded-2xl border border-[#E5DEC9]">
          <button
            type="button"
            onClick={playCelebrationAudio}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1E4D3E] hover:text-[#D96B27] cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#D96B27]" />
            <span>{isPlayingAudio ? (isUrdu ? "آواز جاری ہے..." : "Playing...") : (isUrdu ? "مبارکباد دوبارہ سنیں" : "Listen again")}</span>
          </button>
        </div>

        {/* Accomplished Goal Card */}
        <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#F7F2EB] border-2 border-[#E5DEC9] text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D96B27] uppercase tracking-wider">
            <span>{isUrdu ? "مکمل کیا گیا کام:" : "Completed Task:"}</span>
          </div>
          <p className="font-serif font-bold text-lg sm:text-xl text-[#1E4D3E]">
            {isUrdu ? guidance.goalIdentifiedUr : guidance.goalIdentified}
          </p>
          <p className="text-xs text-stone-600">
            {isUrdu ? guidance.currentScreenDescriptionUr : guidance.currentScreenDescription}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto pt-2 space-y-3">
          <button
            type="button"
            onClick={onStartNewTask}
            className="w-full py-4 px-6 rounded-2xl bg-[#1E4D3E] hover:bg-[#163B2F] text-white font-serif font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-5 h-5 text-[#8FB89A]" />
            <span>{isUrdu ? "نیا کام شروع کریں (Start New Task)" : "Start Another Task"}</span>
          </button>

          <button
            type="button"
            onClick={onReviewSteps}
            className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-sm border border-[#E5DEC9] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Eye className="w-4 h-4 text-[#D96B27]" />
            <span>{isUrdu ? "پچھلا مرحلہ دوبارہ دیکھیں (Review Steps)" : "Review Step Details"}</span>
          </button>
        </div>

        {/* Data Purge Reassurance Note */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-stone-500">
          <Sparkles className="w-3.5 h-3.5 text-[#1E4D3E]" />
          <span>
            {isUrdu
              ? "عارضی سیشن ختم: کوئی سکرین شاٹ یا ڈیٹا مستقل محفوظ نہیں کیا جاتا۔"
              : "Session Ephemeral: No screenshots or personal data are permanently stored."}
          </span>
        </div>
      </div>
    </div>
  );
};
