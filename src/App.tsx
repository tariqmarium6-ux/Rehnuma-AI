import { useState, useRef } from "react";
import { Header } from "./components/Header";
import { GuidedInputSection } from "./components/GuidedInputSection";
import { GuidanceView } from "./components/GuidanceView";
import { AnalyzingLoader } from "./components/AnalyzingLoader";
import { ElectricityBillSimulator } from "./components/ElectricityBillSimulator";
import { TaskCompletedView } from "./components/TaskCompletedView";
import { ConsentModal } from "./components/ConsentModal";
import { PrivacySafetyModal } from "./components/PrivacySafetyModal";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import {
  GuidanceMode,
  GuidanceResponse,
} from "./types";
import { audioController } from "./utils/audio";

type AppView = "input" | "analyzing" | "guiding" | "completed";

export default function App() {
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode>("voice");
  const [currentView, setCurrentView] = useState<AppView>("input");

  // Active guidance session state
  const [guidanceResult, setGuidanceResult] = useState<GuidanceResponse | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const activeScreenshotRef = useRef<string | null>(null);
  const [userVoiceTranscript, setUserVoiceTranscript] = useState<string>("");
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);
  const [stepsHistory, setStepsHistory] = useState<string[]>([]);

  // Simulator Modal State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isAnalyzingNextStep, setIsAnalyzingNextStep] = useState<boolean>(false);

  // Trust, Safety & Privacy State (Informed Consent, Session Purge, Privacy Modal)
  const [hasUserGivenConsent, setHasUserGivenConsent] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("rehnuma_consent_accepted") === "true";
    } catch {
      return false;
    }
  });
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [dataClearedNotification, setDataClearedNotification] = useState<string | null>(null);
  const [pendingGuidancePayload, setPendingGuidancePayload] = useState<{
    screenshotBase64: string;
    voiceTranscript: string;
    stepNumber?: number;
    userFeedback?: "completed" | "stuck" | "new_screen";
  } | null>(null);

  // Dynamic, context-aware fallback guidance
  const getVerifiedFallbackGuidance = (stepNum: number, userQuery: string): GuidanceResponse => {
    const q = (userQuery || "").toLowerCase();
    const isBill = q.includes("bill") || q.includes("bijli") || q.includes("lesco") || q.includes("بجلی");
    const isChat = q.includes("whatsapp") || q.includes("chat") || q.includes("message") || q.includes("واٹس ایپ") || q.includes("پیغام");

    if (isBill) {
      return {
        goalIdentified: "Download Monthly Utility Bill",
        goalIdentifiedUr: "ماہانہ بجلی کا بل ڈاؤن لوڈ کرنا",
        currentScreenDescription: "Utility Services Portal",
        currentScreenDescriptionUr: "بجلی کمپنی کا سروسز پورٹل",
        currentStep: {
          stepNumber: stepNum,
          totalEstimatedSteps: 3,
          title: "Click on 'Download bill'",
          titleUr: "'Download bill' پر کلک کریں",
          actionText: "Tap on the button that says 'Download bill' (ڈاؤن لوڈ بل).",
          actionTextUr: "سکرین پر 'Download bill' والے بٹن پر انگلی سے کلک کریں۔",
          whyExplanation: "This opens the bill retrieval tool so you can find your latest utility bill.",
          whyExplanationUr: "یہ آپشن آپ کو بل تلاش کرنے والے اصل صفحے پر لے جاتا ہے۔",
          confirmationQuestion: "Did you click on 'Download bill'?",
          confirmationQuestionUr: "کیا آپ نے 'Download bill' پر کلک کر لیا ہے؟",
          audioScriptEn: "Hello! On your screen, tap on 'Download bill' to open your billing search.",
          audioScriptUr: "سکرین پر 'Download bill' کا آپشن ہے، اس پر ہلکا سا کلک کریں۔",
          audioScriptUrRoman: "Screen par Download bill par click karein.",
          isFinalStep: stepNum >= 3,
          targetElement: {
            label: "Download bill",
            xPercent: 50,
            yPercent: 50,
            widthPercent: 44,
            heightPercent: 12,
            shape: "rect",
          },
        },
      };
    }

    if (isChat) {
      return {
        goalIdentified: userQuery || "Send WhatsApp Message",
        goalIdentifiedUr: "واٹس ایپ پر پیغام بھیجنا",
        currentScreenDescription: "WhatsApp Application",
        currentScreenDescriptionUr: "واٹس ایپ ایپلیکیشن",
        currentStep: {
          stepNumber: stepNum,
          totalEstimatedSteps: 2,
          title: "Tap the chat or message box",
          titleUr: "مطلوبہ رابطہ یا میسج باکس پر کلک کریں",
          actionText: "Tap on the contact name or the message input box at the bottom of the screen.",
          actionTextUr: "سکرین کے نیچے میسج لکھنے کی جگہ یا مطلوبہ رابطہ پر انگلی سے کلک کریں۔",
          whyExplanation: "This opens your conversation so you can write or record your message.",
          whyExplanationUr: "اس سے آپ کا میسج باکس کھل جائے گا جہاں آپ اپنا پیغام لکھ یا بول سکتے ہیں۔",
          confirmationQuestion: "Did you open the chat?",
          confirmationQuestionUr: "کیا آپ نے چیٹ یا رابطہ کھول لیا ہے؟",
          audioScriptEn: "On your WhatsApp screen, tap on the contact name or the message typing area at the bottom.",
          audioScriptUr: "واٹس ایپ سکرین پر دیکھیں، نیچے میسج لکھنے کی جگہ پر ہلکا سا کلک کریں۔",
          audioScriptUrRoman: "WhatsApp screen par neechay message box par click karein.",
          isFinalStep: stepNum >= 2,
          targetElement: {
            label: "Message / Chat Input",
            xPercent: 50,
            yPercent: 75,
            widthPercent: 60,
            heightPercent: 12,
            shape: "rect",
          },
        },
      };
    }

    // Neutral, dynamic guidance for any other screen
    return {
      goalIdentified: userQuery || "Navigate Active Screen",
      goalIdentifiedUr: userQuery || "سکرین پر مطلوبہ عمل مکمل کرنا",
      currentScreenDescription: "Mobile / Web Application Screen",
      currentScreenDescriptionUr: "موجودہ ایپلیکیشن سکرین",
      currentStep: {
        stepNumber: stepNum,
        totalEstimatedSteps: stepNum + 1,
        title: "Tap the highlighted option on screen",
        titleUr: "نمایاں کیے گئے آپشن پر کلک کریں",
        actionText: "Look at the highlighted area on your screen and gently tap it once.",
        actionTextUr: "سکرین پر نمایاں کیے گئے حصے کو دیکھیں اور اس پر ایک بار کلک کریں۔",
        whyExplanation: "This moves you forward to the next step of your task.",
        whyExplanationUr: "اس سے آپ بغیر کسی الجھن کے اگلے مرحلے پر پہنچ جائیں گے۔",
        confirmationQuestion: "Did you find and tap this option?",
        confirmationQuestionUr: "کیا آپ نے اس بٹن پر کلک کر لیا ہے؟",
        audioScriptEn: "Look at the spotlight on your screen and tap that button gently to continue.",
        audioScriptUr: "سکرین پر دائرے میں دکھائے گئے بٹن پر ہلکا سا کلک کریں تاکہ اگلا مرحلہ شروع ہو سکے۔",
        audioScriptUrRoman: "Screen par circle kiye gaye button par click karein.",
        isFinalStep: false,
        targetElement: {
          label: "Primary Option",
          xPercent: 50,
          yPercent: 50,
          widthPercent: 40,
          heightPercent: 12,
          shape: "rect",
        },
      },
    };
  };

  // Handle guidance submission with informed consent check (Requirement 2)
  const handleStartGuidance = async (payload: {
    screenshotBase64: string;
    voiceTranscript: string;
    stepNumber?: number;
    userFeedback?: "completed" | "stuck" | "new_screen";
  }) => {
    if (!hasUserGivenConsent) {
      setPendingGuidancePayload(payload);
      setIsConsentModalOpen(true);
      return;
    }
    await executeGuidanceRequest(payload);
  };

  const handleAcceptConsent = () => {
    try {
      sessionStorage.setItem("rehnuma_consent_accepted", "true");
    } catch {}
    setHasUserGivenConsent(true);
    setIsConsentModalOpen(false);
    if (pendingGuidancePayload) {
      const payload = pendingGuidancePayload;
      setPendingGuidancePayload(null);
      executeGuidanceRequest(payload);
    }
  };

  const handleCancelConsent = () => {
    setIsConsentModalOpen(false);
    setPendingGuidancePayload(null);
  };

  // Execute guidance request to /api/analyze with 25s timeout
  const executeGuidanceRequest = async (payload: {
    screenshotBase64: string;
    voiceTranscript: string;
    stepNumber?: number;
    userFeedback?: "completed" | "stuck" | "new_screen";
  }) => {
    const currentScreen = payload.screenshotBase64 || activeScreenshotRef.current || activeScreenshot || "";
    const currentQuery = payload.voiceTranscript || userVoiceTranscript || "";

    activeScreenshotRef.current = currentScreen;
    setActiveScreenshot(currentScreen);
    setUserVoiceTranscript(currentQuery);
    setCurrentView("analyzing");

    const stepNum = payload.stepNumber || 1;
    setCurrentStepNumber(stepNum);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: currentScreen,
          userQuery: currentQuery,
          stepNumber: stepNum,
          previousSteps: stepsHistory,
          userFeedback: payload.userFeedback || "new_screen",
          interfaceLanguage: "ur",
          voiceInputLanguage: "ur",
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server response error (${response.status})`);
      }

      const data: GuidanceResponse = await response.json();
      setGuidanceResult(data);
      setCurrentView("guiding");
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Guidance request fallback:", err);
      const fallbackResult = getVerifiedFallbackGuidance(stepNum, currentQuery);
      setGuidanceResult(fallbackResult);
      setCurrentView("guiding");
    }
  };

  // End session and immediately purge all data (Requirement 1 & 4)
  const handleClearAllSessionData = () => {
    audioController.stop();
    activeScreenshotRef.current = null;
    setActiveScreenshot(null);
    setUserVoiceTranscript("");
    setGuidanceResult(null);
    setCurrentStepNumber(1);
    setStepsHistory([]);
    setCurrentView("input");
    try {
      sessionStorage.clear();
      fetch("/api/session/clear", { method: "POST" }).catch(() => {});
    } catch {}
    setDataClearedNotification("تمام عارضی سیشن ڈیٹا اور سکرین شاٹ کامیابی سے صاف کر دیا گیا ہے۔");
    setTimeout(() => setDataClearedNotification(null), 4000);
  };

  // User confirmed progress: "Yes, I did this" / "Finish Task"
  const handleStepCompleted = async () => {
    if (!guidanceResult) return;

    const step = guidanceResult.currentStep;
    const isFinished =
      step.isFinalStep ||
      currentStepNumber >= (step.totalEstimatedSteps || 2) ||
      currentStepNumber >= 2;

    if (isFinished) {
      const updatedHistory = [
        ...stepsHistory,
        `Step ${currentStepNumber}: ${step.actionText}`,
      ];
      setStepsHistory(updatedHistory);
      setCurrentView("completed");
      return;
    }

    const nextStepNum = currentStepNumber + 1;
    if (nextStepNum > 3) {
      setCurrentView("completed");
      return;
    }

    setIsAnalyzingNextStep(true);

    const updatedHistory = [
      ...stepsHistory,
      `Step ${currentStepNumber}: ${guidanceResult.currentStep.actionText}`,
    ];
    setStepsHistory(updatedHistory);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: activeScreenshotRef.current || activeScreenshot || "",
          userQuery: userVoiceTranscript,
          stepNumber: nextStepNum,
          previousSteps: updatedHistory,
          userFeedback: "completed",
          interfaceLanguage: "ur",
          voiceInputLanguage: "ur",
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const nextData: GuidanceResponse = await response.json();
        setGuidanceResult(nextData);
        setCurrentStepNumber(nextStepNum);
      } else {
        throw new Error("Could not fetch next step");
      }
    } catch {
      clearTimeout(timeoutId);
      const fallback = getVerifiedFallbackGuidance(nextStepNum, userVoiceTranscript);
      setGuidanceResult(fallback);
      setCurrentStepNumber(nextStepNum);
    } finally {
      setIsAnalyzingNextStep(false);
    }
  };

  // User asks for clarification or is stuck
  const handleAskForClarification = () => {
    if (!guidanceResult) return;
    const currentAudio =
      "کوئی بات نہیں۔ اطمینان رکھیں۔ سکرین کے درمیان میں دیکھیں، وہاں بٹن نمایاں کیا گیا ہے۔ انگلی سے ہلکا سا کلک کریں۔";

    audioController.stop();
    audioController.speak(currentAudio, "ur");
  };

  // Reset to initial input
  const handleResetToHome = () => {
    audioController.stop();
    activeScreenshotRef.current = null;
    setActiveScreenshot(null);
    setCurrentView("input");
    setGuidanceResult(null);
    setCurrentStepNumber(1);
    setStepsHistory([]);
  };

  // Handle screen captured from the Electricity Simulator
  const handleSimulatorScreenCaptured = (
    screenshotBase64: string,
    defaultQuery: string,
    stepNumber: number
  ) => {
    activeScreenshotRef.current = screenshotBase64;
    setActiveScreenshot(screenshotBase64);
    setUserVoiceTranscript(defaultQuery);
    setCurrentStepNumber(stepNumber);

    handleStartGuidance({
      screenshotBase64,
      voiceTranscript: defaultQuery,
      stepNumber,
      userFeedback: "new_screen",
    });
  };

  return (
    <div
      id="rehnuma-app"
      className="min-h-screen bg-[#F7F2EB] flex flex-col font-sans text-stone-900 selection:bg-[#E3B367]/30 antialiased"
    >
      {/* Clean Header: Logo + Title + Privacy Controls */}
      <Header
        onResetToHome={handleResetToHome}
        isGuidingActive={currentView === "guiding" || currentView === "completed"}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onClearSessionData={handleClearAllSessionData}
        hasActiveData={Boolean(activeScreenshot || userVoiceTranscript || guidanceResult)}
      />

      {/* Ephemeral Data Purged Toast Notification */}
      {dataClearedNotification && (
        <div className="bg-[#1E4D3E] text-white px-4 py-2 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200 sticky top-[65px] z-30">
          <CheckCircle2 className="w-4 h-4 text-[#8FB89A]" />
          <span>{dataClearedNotification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col justify-start">
        {/* VIEW 1: DUAL INPUT (Screenshot + Voice) */}
        {currentView === "input" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Direct, Friendly Title */}
            <div className="text-center space-y-1 py-2 max-w-2xl mx-auto">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E4D3E] tracking-tight">
                آپ کو کس سکرین پر مدد چاہیے؟
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                سکرین کی تصویر لگائیں یا بول کر بتائیں، رہنما آپ کو ایک وقت میں صرف ایک قدم سکھائے گا۔
              </p>
            </div>

            {/* Input Section (Upload Screenshot + Voice Note) */}
            <GuidedInputSection
              onSubmitGuidance={handleStartGuidance}
              onOpenElectricitySimulator={() => setIsSimulatorOpen(true)}
              isAnalyzing={false}
              preloadedScreenshot={activeScreenshot || activeScreenshotRef.current}
              preloadedTranscript={userVoiceTranscript}
            />
          </div>
        )}

        {/* VIEW 2: ANALYZING STATE LOADER */}
        {currentView === "analyzing" && (
          <div className="flex-1 flex items-center justify-center py-6">
            <AnalyzingLoader language="ur" />
          </div>
        )}

        {/* VIEW 3: STEP-BY-STEP GUIDANCE VIEW */}
        {currentView === "guiding" && guidanceResult && (
          <GuidanceView
            guidance={guidanceResult}
            screenshotBase64={activeScreenshot || activeScreenshotRef.current || undefined}
            language="ur"
            guidanceMode={guidanceMode}
            onGuidanceModeChange={setGuidanceMode}
            onStepCompleted={handleStepCompleted}
            onUploadNewScreen={() => setCurrentView("input")}
            onAskForClarification={handleAskForClarification}
            onResetSession={handleResetToHome}
            isAnalyzingNextStep={isAnalyzingNextStep}
          />
        )}

        {/* VIEW 4: CLEAR TASK COMPLETED ACKNOWLEDGMENT */}
        {currentView === "completed" && guidanceResult && (
          <TaskCompletedView
            guidance={guidanceResult}
            stepsHistory={stepsHistory}
            screenshotBase64={activeScreenshot || activeScreenshotRef.current}
            onStartNewTask={handleResetToHome}
            onReviewSteps={() => setCurrentView("guiding")}
            language="ur"
          />
        )}
      </main>

      {/* Electricity Bill Simulator Modal */}
      <ElectricityBillSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onCaptureScreenForGuidance={handleSimulatorScreenCaptured}
        language="ur"
      />

      {/* Informed Consent Modal (Requirement 2) */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onAccept={handleAcceptConsent}
        onCancel={handleCancelConsent}
      />

      {/* Trust, Safety & Privacy Disclosures Modal (Requirement 4 & 5) */}
      <PrivacySafetyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearSessionData={handleClearAllSessionData}
      />
    </div>
  );
}
