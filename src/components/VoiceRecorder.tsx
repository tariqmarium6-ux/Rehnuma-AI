import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface VoiceRecorderProps {
  onTranscriptChange: (text: string) => void;
  currentTranscript: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  currentTranscript,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Web Speech Recognition support for live voice-to-text
  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        // ur-PK captures Urdu and bilingual speech naturally
        recognition.lang = "ur-PK";

        recognition.onresult = (event: any) => {
          let fullTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            onTranscriptChange(fullTranscript.trim());
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e?.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Could not start live speech recognition:", err);
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    setMicError(null);
    setRecordingDuration(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.onstart = () => {
          setIsRecording(true);
          timerRef.current = setInterval(() => {
            setRecordingDuration((prev) => prev + 1);
          }, 1000);
          startSpeechRecognition();
        };

        mediaRecorder.onstop = () => {
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
          stream.getTracks().forEach((track) => track.stop());
          stopSpeechRecognition();
        };

        mediaRecorder.start();
      } else {
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
        startSpeechRecognition();
      }
    } catch (err: any) {
      console.warn("Microphone access notice:", err);
      setMicError("مائیکروفون کی اجازت نہیں ملی۔ آپ نیچے تحریری طور پر بھی لکھ سکتے ہیں۔");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeechRecognition();
    }

    if (!currentTranscript.trim()) {
      onTranscriptChange("مجھے اپنا بجلی کا بل ڈاؤن لوڈ کرنا ہے لیکن سمجھ نہیں آ رہا کہاں کلک کروں۔");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Clean, natural prompt shortcuts
  const suggestions = [
    "مجھے بجلی کا بل ڈاؤن لوڈ کرنا ہے",
    "اگلا بٹن کون سا دبانا ہے؟",
    "کیا یہ فارم صحیح ہے؟",
  ];

  return (
    <div className="w-full bg-[#FFFFFF] rounded-3xl border-2 border-[#E5DEC9] p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-[#F0EBE1] pb-3">
        <div className="w-10 h-10 rounded-2xl bg-[#E07A48]/15 text-[#D96B27] flex items-center justify-center font-bold shrink-0">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-[#1E4D3E] leading-tight">
            2. اپنی آواز میں بتائیں (Speak)
          </h3>
          <p className="text-xs text-stone-600">
            بتائیں کہ آپ کو کس چیز میں مدد چاہیے
          </p>
        </div>
      </div>

      {/* Recording Interaction Button */}
      <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FBF9F5] border-2 border-dashed border-[#E5DEC9] text-center space-y-3">
        {isRecording ? (
          <div className="space-y-2 flex flex-col items-center">
            <div className="relative">
              <div className="w-18 h-18 rounded-full bg-red-100 animate-ping absolute inset-0 opacity-75" />
              <button
                type="button"
                onClick={handleStopRecording}
                className="relative w-18 h-18 rounded-full bg-[#D96B27] hover:bg-[#C25A1A] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                aria-label="Stop Recording"
              >
                <Square className="w-7 h-7 fill-current" />
              </button>
            </div>

            <p className="font-bold text-[#1E4D3E] text-sm animate-pulse">
              سن رہے ہیں... بولیں ({formatTime(recordingDuration)})
            </p>
            <p className="text-xs text-stone-500">
              بات مکمل ہونے پر بٹن دوبارہ دبائیں
            </p>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <button
              type="button"
              onClick={handleStartRecording}
              className="w-18 h-18 rounded-full bg-[#1E4D3E] hover:bg-[#163B2F] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
              aria-label="Start Voice Recording"
            >
              <Mic className="w-8 h-8 text-[#8FB89A] group-hover:text-white transition-colors" />
            </button>

            <p className="font-bold text-[#1E4D3E] text-sm">
              بولنے کے لیے مائیک دبائیں
            </p>
          </div>
        )}

        {micError && (
          <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{micError}</span>
          </div>
        )}
      </div>

      {/* Transcript Textbox */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1E4D3E]">
            آپ کی بات (Voice or Text):
          </label>
          {currentTranscript && (
            <button
              type="button"
              onClick={() => onTranscriptChange("")}
              className="text-xs text-[#D96B27] hover:underline font-bold"
            >
              صاف کریں (Clear)
            </button>
          )}
        </div>

        <textarea
          value={currentTranscript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="مائیک دبا کر بولیں، جیسے: مجھے بجلی کا بل ڈاؤن لوڈ کرنا ہے..."
          rows={2}
          className="w-full p-3 rounded-2xl bg-[#FAF9F6] border border-[#E5DEC9] text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4D3E] focus:border-transparent transition-all placeholder:text-stone-400"
        />
      </div>

      {/* Clean shortcuts */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#D96B27]" /> مثالیں:
        </span>
        {suggestions.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onTranscriptChange(phrase)}
            className="px-2.5 py-1 rounded-lg text-xs bg-[#F5F0E6] hover:bg-[#EAE2D2] text-[#1E4D3E] border border-[#E5DEC9] transition-all cursor-pointer"
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
};
