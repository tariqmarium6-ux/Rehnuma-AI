import React from "react";
import { RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { RehnumaLogo } from "./RehnumaLogo";

interface HeaderProps {
  onResetToHome: () => void;
  isGuidingActive: boolean;
  onOpenPrivacyModal: () => void;
  onClearSessionData: () => void;
  hasActiveData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onResetToHome,
  isGuidingActive,
  onOpenPrivacyModal,
  onClearSessionData,
  hasActiveData = false,
}) => {
  return (
    <header className="w-full bg-[#FFFFFF] border-b-2 border-[#E5DEC9] sticky top-0 z-40 shadow-2xs">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between flex-wrap gap-2">
        {/* Brand Logo & Name */}
        <button
          onClick={onResetToHome}
          className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
          aria-label="Rehnuma Home"
        >
          <RehnumaLogo size={40} className="group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1E4D3E]">
                Rehnuma
              </span>
              <span className="font-serif text-lg font-bold text-[#1E4D3E]/80">
                (رہنما)
              </span>
            </div>
            <p className="text-xs text-[#D96B27] font-bold mt-0.5">
              ٹیکنالوجی، ایک وقت میں ایک قدم۔
            </p>
          </div>
        </button>

        {/* Right Action Controls: Trust & Safety, Clear Data, New Task */}
        <div className="flex items-center gap-2">
          {/* Privacy & Safety Information Modal Button */}
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="px-3 py-1.5 rounded-xl bg-[#E6F0EB] hover:bg-[#d5e7dd] text-[#1E4D3E] text-xs font-bold border border-[#8FB89A] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Privacy, Safety & Data Disclosures"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E4D3E]" />
            <span className="hidden sm:inline">تحفظ و رازداری</span>
            <span className="sm:hidden">رازداری</span>
          </button>

          {/* End Session & Clear Data Action (Requirement 1) */}
          {(hasActiveData || isGuidingActive) && (
            <button
              type="button"
              onClick={onClearSessionData}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-bold border border-[#E5DEC9] hover:border-red-300 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="End active session and purge temporary screenshots/data"
            >
              <Trash2 className="w-3.5 h-3.5 text-stone-500 hover:text-red-600" />
              <span>ڈیٹا صاف کریں</span>
            </button>
          )}

          {/* New Guidance Session Reset Button when guiding */}
          {isGuidingActive && (
            <button
              onClick={onResetToHome}
              className="px-3 py-1.5 rounded-xl bg-[#F7F2EB] hover:bg-[#EAE4D7] text-[#1E4D3E] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E5DEC9]"
              title="Start a new guidance session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>نیا کام</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
