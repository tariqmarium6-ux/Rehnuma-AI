export type AppLanguage = "en" | "ur";
export type VoiceInputLanguage = "en" | "ur";
export type GuidanceMode = "voice" | "written";

export interface TargetElementHighlight {
  label: string;
  xPercent: number; // 0 to 100% horizontal coordinate of highlight center
  yPercent: number; // 0 to 100% vertical coordinate of highlight center
  widthPercent?: number; // Approximate width of target element
  heightPercent?: number; // Approximate height of target element
  shape?: "rect" | "circle" | "arrow";
}

export interface GuidanceStep {
  stepNumber: number;
  totalEstimatedSteps: number;
  title: string;
  titleUr: string;
  actionText: string;
  actionTextUr: string;
  whyExplanation: string;
  whyExplanationUr: string;
  confirmationQuestion: string;
  confirmationQuestionUr: string;
  audioScriptEn: string;
  audioScriptUr: string;
  audioScriptUrRoman?: string;
  targetElement?: TargetElementHighlight;
  isFinalStep: boolean;
  clarificationNeeded?: boolean;
  clarificationQuestion?: string;
  clarificationQuestionUr?: string;
}

export interface GuidanceResponse {
  goalIdentified: string;
  goalIdentifiedUr: string;
  currentScreenDescription: string;
  currentScreenDescriptionUr: string;
  currentStep: GuidanceStep;
  stepsHistory?: { stepNumber: number; actionSummary: string }[];
  technicalDetails?: {
    modelUsed: string;
    responseTimingMs?: number;
    hasScreenshot: boolean;
    hasVoicePrompt: boolean;
    interfaceLanguage: string;
    voiceInputLanguage: string;
  };
}

export interface InteractiveSimulatorScenario {
  id: string;
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  iconName: string;
  initialScreenshotUrl?: string;
  defaultVoiceQueryEn: string;
  defaultVoiceQueryUr: string;
}
