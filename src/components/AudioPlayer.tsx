import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { audioController } from "../utils/audio";
import { AppLanguage } from "../types";

interface AudioPlayerProps {
  script: string;
  scriptEn?: string;
  scriptUr?: string;
  scriptUrRoman?: string;
  currentLanguage: AppLanguage;
  riskLevel: "safe" | "caution" | "danger";
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  script,
  scriptEn,
  scriptUr,
  scriptUrRoman,
  currentLanguage,
  riskLevel,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioLang, setAudioLang] = useState<"ur" | "en">(
    currentLanguage === "ur" ? "ur" : "en"
  );

  // Synchronize when top-level app language changes
  useEffect(() => {
    setAudioLang(currentLanguage === "ur" ? "ur" : "en");
    audioController.stop();
    setIsPlaying(false);
  }, [currentLanguage]);

  const activeScript =
    audioLang === "ur"
      ? scriptUr || script
      : scriptEn || script;

  const activeScriptRoman = scriptUrRoman || script;

  const isUrdu = audioLang === "ur";

  // Visual styling mapped to the user's screenshot
  const theme = {
    danger: {
      cardBg: "bg-[#FFF5F2] border border-[#FADCD5] text-stone-900",
      playBtn: "bg-[#E06D53] text-white hover:bg-[#D45E45] shadow-md",
      waveBar: "bg-[#E06D53]",
      waveInactive: "bg-[#E06D53]/30",
      pillActive: "bg-[#E06D53] text-white",
      pillInactive: "bg-white text-stone-600 border border-stone-200",
      tagLabel: isUrdu ? "آواز میں رہنمائی (خطرہ)" : "Voice Guidance (Danger)",
      duration: "0:20s",
    },
    caution: {
      cardBg: "bg-[#FFF9F0] border border-[#FDE6C8] text-stone-900",
      playBtn: "bg-[#E06D53] text-white hover:bg-[#D45E45] shadow-md",
      waveBar: "bg-[#E06D53]",
      waveInactive: "bg-[#E06D53]/30",
      pillActive: "bg-[#E06D53] text-white",
      pillInactive: "bg-white text-stone-600 border border-stone-200",
      tagLabel: isUrdu ? "آواز میں رہنمائی (احتیاط)" : "Voice Guidance (Caution)",
      duration: "0:18s",
    },
    safe: {
      cardBg: "bg-[#FFF5F2] border border-[#FADCD5] text-stone-900",
      playBtn: "bg-[#E06D53] text-white hover:bg-[#D45E45] shadow-md",
      waveBar: "bg-[#E06D53]",
      waveInactive: "bg-[#E06D53]/30",
      pillActive: "bg-[#E06D53] text-white",
      pillInactive: "bg-white text-stone-600 border border-stone-200",
      tagLabel: isUrdu ? "آواز میں رہنمائی (محفوظ)" : "Voice Guidance (Safe)",
      duration: "0:15s",
    },
  }[riskLevel];

  useEffect(() => {
    let timer: any = null;
    if (autoPlay && activeScript) {
      timer = setTimeout(() => {
        handlePlay();
      }, 400);
    }
    return () => {
      clearTimeout(timer);
      audioController.stop();
    };
  }, [activeScript]);

  const handlePlay = () => {
    if (isPlaying) {
      audioController.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    audioController.speak(
      activeScript,
      audioLang,
      activeScriptRoman,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  const handleReplay = () => {
    audioController.stop();
    setIsPlaying(false);
    setTimeout(() => {
      handlePlay();
    }, 100);
  };

  const switchLanguage = (newLang: "ur" | "en") => {
    audioController.stop();
    setIsPlaying(false);
    setAudioLang(newLang);
  };

  return (
    <div
      id="verdict-audio-player"
      className={`rounded-2xl p-4 shadow-sm ${theme.cardBg} transition-all`}
    >
      {/* Top row: Label & Audio Language Switcher */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#E06D53]" />
          <span className="font-extrabold text-xs sm:text-sm text-stone-900 font-urdu">
            {theme.tagLabel}
          </span>
          <span className="text-[11px] font-bold text-stone-500">
            {theme.duration}
          </span>
        </div>

        {/* Separate Urdu / English Switcher on Player */}
        <div className="flex items-center gap-1 text-[11px] font-bold">
          <button
            onClick={() => switchLanguage("ur")}
            className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
              audioLang === "ur" ? theme.pillActive : theme.pillInactive
            }`}
          >
            اردو
          </button>
          <button
            onClick={() => switchLanguage("en")}
            className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
              audioLang === "en" ? theme.pillActive : theme.pillInactive
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Center Waveform & Controls */}
      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <button
          id="audio-play-pause-btn"
          onClick={handlePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${theme.playBtn}`}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Dynamic Waveform Bars */}
        <div className="flex-1 flex items-center justify-between gap-1 h-8 px-1">
          {[25, 45, 75, 35, 90, 60, 100, 50, 80, 40, 95, 30, 85, 55, 70, 40, 90, 65, 30].map(
            (height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying ? `${theme.waveBar} animate-pulse` : theme.waveInactive
                }`}
                style={{
                  height: isPlaying
                    ? `${Math.max(25, (height * (1 + Math.sin(i + Date.now() / 250))) % 100)}%`
                    : `${height * 0.45}%`,
                }}
              />
            )
          )}
        </div>

        {/* Replay */}
        <button
          id="audio-replay-btn"
          onClick={handleReplay}
          className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 transition-colors cursor-pointer"
          title="Replay from beginning"
          aria-label="Replay audio"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Subtitles text: Enlarge so judges can read clearly from a distance */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/60">
        <p
          className={`leading-relaxed transition-all ${
            audioLang === "ur"
              ? "font-urdu text-base sm:text-lg md:text-xl font-bold text-stone-900 leading-loose"
              : "text-sm sm:text-base md:text-lg text-stone-800 font-semibold"
          }`}
        >
          "{activeScript}"
        </p>
      </div>
    </div>
  );
};
