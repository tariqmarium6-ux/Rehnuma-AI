import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Camera,
  ArrowRight,
  Sparkles,
  Info,
  Maximize2,
  Radio,
  FileText,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { GuidanceResponse, AppLanguage, GuidanceMode } from "../types";
import { audioController } from "../utils/audio";

interface GuidanceViewProps {
  guidance: GuidanceResponse;
  screenshotBase64?: string;
  language: AppLanguage;
  guidanceMode: GuidanceMode;
  onGuidanceModeChange: (mode: GuidanceMode) => void;
  onStepCompleted: () => void;
  onUploadNewScreen: () => void;
  onAskForClarification: () => void;
  onResetSession: () => void;
  isAnalyzingNextStep: boolean;
}

export const GuidanceView: React.FC<GuidanceViewProps> = ({
  guidance,
  screenshotBase64,
  language,
  guidanceMode,
  onGuidanceModeChange,
  onStepCompleted,
  onUploadNewScreen,
  onAskForClarification,
  onResetSession,
  isAnalyzingNextStep,
}) => {
  const isUrdu = language === "ur";
  const step = guidance.currentStep;

  // Voice player state
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [showEnlargedImage, setShowEnlargedImage] = useState<boolean>(false);

  // Play audio when entering step if in voice mode
  useEffect(() => {
    if (guidanceMode === "voice") {
      playCurrentVoiceGuidance();
    }
    return () => {
      audioController.stop();
      setIsPlayingVoice(false);
    };
  }, [step.stepNumber, guidanceMode]);

  const playCurrentVoiceGuidance = () => {
    audioController.stop();
    setIsPlayingVoice(true);

    const spokenText = isUrdu ? step.audioScriptUr : step.audioScriptEn;
    const romanText = step.audioScriptUrRoman;

    audioController.speak(
      spokenText,
      language,
      romanText,
      () => setIsPlayingVoice(true),
      () => setIsPlayingVoice(false),
      () => setIsPlayingVoice(false)
    );
  };

  const handleToggleVoicePlayback = () => {
    if (isPlayingVoice) {
      audioController.stop();
      setIsPlayingVoice(false);
    } else {
      playCurrentVoiceGuidance();
    }
  };

  const target = step.targetElement;

  return (
    <div className="w-full space-y-6 max-w-6xl xl:max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">

      {/* Top Banner: Identified Goal & Step Progress */}
      <div className="bg-[#FFFFFF] rounded-3xl border-2 border-[#E5DEC9] p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#1E4D3E] text-white flex items-center justify-center font-serif font-bold text-lg shadow-xs">
            {step.stepNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#D96B27] uppercase tracking-wider">
                {isUrdu
                  ? `مرحلہ ${step.stepNumber} از ${step.totalEstimatedSteps}`
                  : `Step ${step.stepNumber} of ${step.totalEstimatedSteps}`}
              </span>
              {step.isFinalStep && (
                <span className="text-[10px] bg-[#E6F0EB] text-[#1E4D3E] font-extrabold px-2 py-0.5 rounded-full border border-[#8FB89A]">
                  {isUrdu ? "آخری مرحلہ" : "Final Step"}
                </span>
              )}
            </div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#1E4D3E] leading-tight">
              {isUrdu ? guidance.goalIdentifiedUr : guidance.goalIdentified}
            </h2>
          </div>
        </div>

        {/* Dual Output Mode Switcher: Voice Guidance vs Written Guidance (Slide 3) */}
        <div className="flex items-center gap-1 bg-[#F7F2EB] p-1 rounded-2xl border border-[#E5DEC9] text-xs font-bold">
          <button
            onClick={() => onGuidanceModeChange("voice")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              guidanceMode === "voice"
                ? "bg-[#D96B27] text-white font-extrabold shadow-2xs"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isUrdu ? "صوتی رہنمائی (آواز)" : "Voice Guidance"}</span>
          </button>
          <button
            onClick={() => onGuidanceModeChange("written")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              guidanceMode === "written"
                ? "bg-[#1E4D3E] text-white font-extrabold shadow-2xs"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isUrdu ? "تحریری رہنمائی" : "Written Guidance"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left = Visual Spotlight Canvas, Right = Guidance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Screenshot with Spotlight Beacon */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-[#1E4D3E] rounded-3xl p-3 sm:p-4 border-2 border-[#163B2F] shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-[#8FB89A] text-xs font-bold pb-2 px-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E3B367]" />
                <span>{isUrdu ? "سکرین پر کہاں کلک کرنا ہے" : "Target Spotlight"}</span>
              </span>
              {screenshotBase64 && (
                <button
                  onClick={() => setShowEnlargedImage(true)}
                  className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>{isUrdu ? "بڑا کریں" : "Enlarge"}</span>
                </button>
              )}
            </div>

            {/* The Image Canvas with Dynamic Animated Beacon Spotlight */}
            <div className="relative rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center min-h-[300px]">
              {screenshotBase64 ? (
                <>
                  <img
                    src={screenshotBase64}
                    alt="Current step screen"
                    className="w-full max-h-[500px] object-contain rounded-xl select-none"
                  />

                  {/* Visual Spotlight / Glowing Pointer Ring on Target Coordinates */}
                  {target && (
                    <div
                      className="absolute pointer-events-none transition-all duration-500"
                      style={{
                        left: `${target.xPercent}%`,
                        top: `${target.yPercent}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {/* Outer Radiating Pulse Ring */}
                      <div className="w-20 h-20 rounded-full border-4 border-[#E07A48] bg-[#E07A48]/30 animate-ping absolute -top-10 -left-10" />

                      {/* Sharp Focus Target Box */}
                      <div className="w-16 h-12 rounded-xl border-3 border-[#D96B27] bg-[#E07A48]/35 shadow-lg flex items-center justify-center -translate-x-1/2 -translate-y-1/2 backdrop-blur-2xs">
                        <span className="w-3 h-3 rounded-full bg-[#D96B27] shadow-xs" />
                      </div>

                      {/* Floating Tooltip Label */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#1E4D3E] text-[#E3B367] text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg whitespace-nowrap border border-[#E3B367]/40 flex items-center gap-1">
                        <span>👇 {target.label}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-stone-300 text-xs p-8 text-center space-y-2">
                  <Camera className="w-8 h-8 mx-auto text-stone-400" />
                  <p>{isUrdu ? "تصویر دستیاب نہیں ہے" : "No screenshot attached"}</p>
                </div>
              )}
            </div>

            {target && (
              <p className="text-[11px] text-[#F0EBE1] text-center pt-2 font-medium">
                {isUrdu
                  ? `دائرے والے نشان کو دیکھیں: "${target.label}"`
                  : `Look for the glowing spotlight on "${target.label}"`}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: The ONE Action Step + Why Explanation */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Mode Card 1: VOICE GUIDANCE PLAYER (Soft Peach/Terracotta like Slide 1) */}
          {guidanceMode === "voice" && (
            <div className="bg-[#FCE8DC] rounded-3xl border-2 border-[#E07A48] p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    {isPlayingVoice && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D96B27] opacity-75" />
                    )}
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D96B27]" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#1E4D3E]">
                    {isPlayingVoice
                      ? isUrdu
                        ? "رہنما آواز میں سمجھا رہا ہے..."
                        : "Speaking instructions now..."
                      : isUrdu
                      ? "صوتی رہنمائی تیار ہے"
                      : "Voice guidance ready"}
                  </span>
                </div>

                <button
                  onClick={playCurrentVoiceGuidance}
                  className="p-1.5 text-[#1E4D3E] hover:text-black rounded-lg hover:bg-[#F5D8C6] flex items-center gap-1 text-xs font-bold cursor-pointer"
                  title="Replay from beginning"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isUrdu ? "دوبارہ سنیں" : "Replay"}</span>
                </button>
              </div>

              {/* Senior-Friendly Play / Pause Voice Button */}
              <div className="flex items-center gap-4 py-2">
                <button
                  type="button"
                  onClick={handleToggleVoicePlayback}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#D96B27] hover:bg-[#C25A1A] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer ring-4 ring-[#E07A48]/40 shrink-0"
                  aria-label={isPlayingVoice ? "Pause voice" : "Play voice"}
                >
                  {isPlayingVoice ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>

                <div>
                  <p className="font-serif font-bold text-base sm:text-lg text-[#1E4D3E]">
                    {isPlayingVoice
                      ? isUrdu
                        ? "غور سے سنیں، رہنمائی جاری ہے"
                        : "Listen carefully to the instructions"
                      : isUrdu
                      ? "سننے کے لیے پلے بٹن دبائیں"
                      : "Tap play to hear spoken guidance"}
                  </p>
                  <p className="text-xs text-stone-700 mt-0.5">
                    {isUrdu
                      ? "آپ جب چاہیں روک کر دوبارہ سن سکتے ہیں"
                      : "Clear, conversational audio in your selected language"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Core Instruction Card */}
          <div className="bg-[#FFFFFF] rounded-3xl border-2 border-[#E5DEC9] p-6 sm:p-7 space-y-5 shadow-sm">
            {/* Action Headline: Exactly ONE next action */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E4D3E] bg-[#E6F0EB] px-3 py-1 rounded-full border border-[#8FB89A] inline-block">
                {isUrdu ? "آپ کا اگلا قدم:" : "Your Next Action:"}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E4D3E] leading-tight">
                {isUrdu ? step.actionTextUr : step.actionText}
              </h1>
            </div>

            {/* The "WHY" Card: Explains why this action is necessary */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F2EB] border-2 border-[#E5DEC9] text-[#1E4D3E] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D96B27] uppercase tracking-wide">
                <Lightbulb className="w-4 h-4 text-[#D96B27] fill-[#D96B27] shrink-0" />
                <span>{isUrdu ? "یہ قدم کیوں ضروری ہے؟" : "Why this step is necessary:"}</span>
              </div>
              <p className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed">
                {isUrdu ? step.whyExplanationUr : step.whyExplanation}
              </p>
            </div>

            {/* Confirmation Question: Verify user completion */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5DEC9] space-y-3">
              <p className="font-serif font-bold text-sm sm:text-base text-[#1E4D3E] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#D96B27] shrink-0" />
                <span>{isUrdu ? step.confirmationQuestionUr : step.confirmationQuestion}</span>
              </p>

              {/* Action Buttons: Next Step vs Need Help */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onStepCompleted}
                  disabled={isAnalyzingNextStep}
                  className="w-full py-4 px-5 rounded-2xl bg-[#1E4D3E] hover:bg-[#163B2F] text-white font-serif font-bold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#8FB89A]" />
                  <span>
                    {isAnalyzingNextStep
                      ? isUrdu
                        ? "اگلا مرحلہ لایا جا رہا ہے..."
                        : "Loading next step..."
                      : step.isFinalStep || step.stepNumber >= (step.totalEstimatedSteps || 2)
                      ? isUrdu
                        ? "کام مکمل ہو گیا! (Finish Task)"
                        : "Task Complete! (Finish)"
                      : isUrdu
                      ? "جی ہاں، میں نے یہ کر لیا ہے"
                      : "Yes, I completed this"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onAskForClarification}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#F7F2EB] hover:bg-[#EAE4D7] text-stone-800 font-bold text-xs sm:text-sm border border-[#E5DEC9] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#D96B27]" />
                  <span>
                    {isUrdu ? "مجھے سمجھ نہیں آیا / مدد کریں" : "I'm stuck / I can't find it"}
                  </span>
                </button>
              </div>
            </div>

            {/* User Control: Cancel Guidance or Upload Updated Screenshot (Requirement 5) */}
            <div className="pt-2 flex items-center justify-between border-t border-[#F0EBE1] flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={onResetSession}
                className="text-stone-500 hover:text-red-700 font-bold flex items-center gap-1.5 cursor-pointer hover:underline"
                title="Cancel guidance and return home"
              >
                <span>✕ {isUrdu ? "رہنمائی منسوخ کریں (Cancel)" : "Cancel Guidance"}</span>
              </button>

              <button
                type="button"
                onClick={onUploadNewScreen}
                className="text-[#D96B27] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{isUrdu ? "نئی سکرین لگائیں" : "Upload New Screenshot"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 4 Bottom Banner */}
      <div className="w-full py-3.5 px-6 rounded-2xl bg-[#1E4D3E] text-white text-center font-serif text-sm sm:text-base font-semibold shadow-xs">
        {isUrdu
          ? "رہنما رہنمائی فراہم کرتا ہے۔ فیصلہ، عمل اور سیکھنا صارف کا اپنا کام ہے۔"
          : "Rehnuma guides. The user decides, acts and learns."}
      </div>

      {/* Enlarged Screenshot Modal if user taps "Enlarge" */}
      {showEnlargedImage && screenshotBase64 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-stone-900 rounded-3xl p-4 overflow-hidden flex flex-col">
            <button
              onClick={() => setShowEnlargedImage(false)}
              className="absolute top-4 right-4 z-10 px-4 py-2 rounded-full bg-white text-stone-900 font-bold text-xs cursor-pointer shadow-md"
            >
              ✕ {isUrdu ? "بند کریں" : "Close"}
            </button>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2">
              <img
                src={screenshotBase64}
                alt="Enlarged screenshot"
                className="max-h-[80vh] max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
