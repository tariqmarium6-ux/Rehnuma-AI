/**
 * Audio synthesis and accessibility playback utility for AwaazShield.
 * Uses high-definition server-side Urdu/English voice streaming (/api/tts)
 * with graceful fallback to client-side Web Speech API & Web Audio API chimes.
 */

class AudioController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private audioCtx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Plays accessible harmonic cues depending on risk state.
   */
  public playRiskChime(level: "safe" | "caution" | "danger") {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (level === "danger") {
        // Urgent, low-frequency warning tone (two pulses)
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.4);
      } else if (level === "caution") {
        // Two gentle cautionary pings
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Peaceful, reassuring major triad chord
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn("Audio chime play notice:", e);
    }
  }

  /**
   * Speaks the provided safety guidance.
   * Prioritizes high-definition native Urdu/English voice audio stream (/api/tts),
   * and falls back cleanly to client Web Speech API if offline or unsupported.
   */
  public speak(
    text: string,
    lang: "en" | "ur" = "en",
    textRomanOrOnStart?: string | (() => void),
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    let textRoman: string | undefined;
    let startCb = onStart;
    let endCb = onEnd;
    let errCb = onError;

    if (typeof textRomanOrOnStart === "function") {
      startCb = textRomanOrOnStart;
      endCb = onStart;
      errCb = onEnd as any;
      textRoman = undefined;
    } else {
      textRoman = textRomanOrOnStart;
    }

    this.stop();
    this.getAudioContext();

    const cleanText = (text || "").trim();
    if (!cleanText) {
      if (errCb) errCb(new Error("No text provided to speak"));
      return;
    }

    // Step 1: Try Native High-Definition Audio Stream from /api/tts
    try {
      const audioUrl = `/api/tts?lang=${lang}&text=${encodeURIComponent(cleanText.slice(0, 350))}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        if (startCb) startCb();
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        if (endCb) endCb();
      };

      audio.onerror = (e) => {
        console.warn("TTS audio streaming failed, falling back to Web Speech:", e);
        this.currentAudio = null;
        this.speakWebSpeech(cleanText, lang, textRoman, startCb, endCb, errCb);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio play blocked or unavailable, using Web Speech fallback:", err);
          this.currentAudio = null;
          this.speakWebSpeech(cleanText, lang, textRoman, startCb, endCb, errCb);
        });
      }
    } catch (err) {
      console.warn("Audio element setup failed, using Web Speech fallback:", err);
      this.speakWebSpeech(cleanText, lang, textRoman, startCb, endCb, errCb);
    }
  }

  /**
   * Client-side Web Speech fallback
   */
  private speakWebSpeech(
    text: string,
    lang: "en" | "ur",
    textRoman?: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      if (onError) onError(new Error("Speech synthesis not supported on this browser"));
      return;
    }

    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const voices = this.voices.length > 0 ? this.voices : this.synth.getVoices();
    let textToSpeak = text;
    let targetLang = lang === "ur" ? "ur-PK" : "en-US";
    let chosenVoice: SpeechSynthesisVoice | null = null;

    if (lang === "ur") {
      // Look for native Urdu or Hindi voices
      const urVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith("ur") ||
          v.name.toLowerCase().includes("urdu") ||
          v.lang.toLowerCase().startsWith("hi") ||
          v.name.toLowerCase().includes("hindi")
      );

      if (urVoice) {
        chosenVoice = urVoice;
        targetLang = urVoice.lang;
        textToSpeak = text;
      } else {
        // If device has no Urdu voice pack, use Roman Urdu so English/Universal voice speaks audibly
        textToSpeak = textRoman || this.toRomanUrdu(text);
        targetLang = "en-US";
        chosenVoice =
          voices.find((v) => v.lang.startsWith("en-IN")) ||
          voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0] ||
          null;
      }
    } else {
      targetLang = "en-US";
      chosenVoice =
        voices.find(
          (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.default)
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0] ||
        null;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
    utterance.lang = targetLang;
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    (window as any).__awaazUtterance = utterance;

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Speech speak error:", err);
      if (onError) onError(err);
    }
  }

  /**
   * Helper to ensure Arabic-script Urdu isn't fed to an English TTS
   */
  private toRomanUrdu(urduText: string): string {
    // If it already contains Latin letters, return as is
    if (!/[\u0600-\u06FF]/.test(urduText)) {
      return urduText;
    }

    // Common danger / caution phrases mapped phonetically
    return urduText
      .replace(/خبردار/g, "Khabardaar")
      .replace(/سُنیں|سنیں/g, "Sunein")
      .replace(/فوراً/g, "Foran")
      .replace(/رک جائیں/g, "Ruk jayein")
      .replace(/یہ پیغام|یہ میسج/g, "Yeh message")
      .replace(/خطرناک/g, "Khatarnaak")
      .replace(/فراڈ|دھوکہ/g, "Fraud")
      .replace(/پیسے/g, "Paise")
      .replace(/نہ بھیجیں/g, "Na bhejein")
      .replace(/کلک نہ کریں/g, "Click na karein")
      .replace(/بااعتماد فرد/g, "Baa-aetemaad fard")
      .replace(/محفوظ/g, "Mehfooz")
      .replace(/احتیاط/g, "Ahtiyaat")
      .replace(/بجلی/g, "Bijli")
      .replace(/بل/g, "Bill")
      .replace(/بینک/g, "Bank")
      .replace(/او ٹی پی/g, "OTP")
      .replace(/[\u0600-\u06FF]+/g, " ");
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.removeAttribute("src");
      } catch (e) {
        console.warn("Audio element stop notice:", e);
      }
      this.currentAudio = null;
    }

    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
    this.isSpeaking = false;
  }

  public resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(() => {});
      this.isSpeaking = true;
    } else if (this.synth) {
      this.synth.resume();
      this.isSpeaking = true;
    }
  }

  public getSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const audioController = new AudioController();
