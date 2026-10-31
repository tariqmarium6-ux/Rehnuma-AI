# Rehnuma (رہنما)

> **Technology, one step at a time.**  
> **ٹیکنالوجی، ایک وقت میں ایک قدم۔**
>
> *A guide, not a takeover.*

Rehnuma is a context-aware digital learning companion designed to help people understand unfamiliar digital screens and complete everyday technology tasks with greater confidence. Instead of taking control or simply completing a task for someone, Rehnuma explains what to do next, why it matters, and guides the user one step at a time.

---

## Project & Team Details

| Detail | Information |
|---|---|
| Project | **Rehnuma (رہنما)** |
| Event | **Build4Better — CodeSphere 3.0** |
| Team | **FourBidden** |
| Team lead | Marium Tariq |
| Team members | Faarid Amir Sheikh, Ahmed Raza |
| Track focus | Making technology easier and less intimidating for people who need guidance with everyday digital tasks |

## 1. Target Users & Problem

### Who Rehnuma is for

Rehnuma is designed for people who find unfamiliar digital tasks difficult, especially:

- **Grandparents and older adults** who may need more time or clearer explanations when using unfamiliar apps and websites.
- **Parents** who use digital services but sometimes get stuck on unfamiliar screens, forms, or options.
- **Other non-technical users** who want patient, plain-language guidance rather than technical instructions.

Age alone does not define the audience. Rehnuma is for anyone who needs additional clarity and confidence with technology.

### The problem

Everyday tasks increasingly happen through apps, websites, and online portals. When a user encounters an unfamiliar screen, they may wonder:

- Which option should I select?
- What does this message mean?
- What should I do next?
- Did I complete the step correctly?

People may ask someone else to do the task for them or struggle through lengthy instructions that do not match the screen in front of them. This can reduce independence and make digital services feel intimidating.

### The user scenario guiding the design

A parent or grandparent wants to download an electricity bill but is unsure which option to select on the provider's website. They share a screenshot and explain the goal in their own words. Rehnuma uses that context to explain the next action in simple language.

This is a design scenario, not a claim that formal user interviews or a user study have been completed.

### Our design principle

> **People don't need someone to take over. They need help understanding what to do next.**

## 2. Solution & Core Features

Rehnuma combines the user's visual context (a screenshot) with their stated goal (voice input) to provide contextual, step-by-step coaching.

### 1. Show us — screenshot context

- The user uploads a screenshot of the app, website, or screen where they are stuck.
- The interface provides a preview before the screenshot is submitted.
- Client-side image processing resizes large screenshots before sending them for analysis.

### 2. Tell us — voice and intent

- The user explains what they want to do or what is confusing them.
- Voice input supports Urdu (`ur-PK`) and English through the browser's Web Speech API, subject to browser support.
- The screenshot and voice request are considered together so the guidance reflects both what the user sees and what they want to accomplish.

### 3. Understand and guide — contextual next steps

- The Gemini API analyses the screenshot and the user's stated goal.
- The response uses a structured format to identify relevant interface elements and generate concise guidance.
- Rehnuma provides a small number of steps (up to the configured 2–3-step limit), with a plain-language explanation of why an action is useful.
- Where supported by the response and interface, the relevant screen area can be highlighted using percentage-based coordinates.
- The user remains responsible for carrying out each action. Rehnuma does not remotely operate the device.

### 4. Choose how to receive guidance

- **Written guidance:** clear, readable instructions with simple wording.
- **Voice guidance:** spoken instructions with playback controls, subject to browser and device support.
- Guidance is designed for Urdu and English. The exact availability of speech recognition and speech playback depends on the browser and its language support.

### 5. Confirm progress

- The user can indicate whether they have completed the suggested action.
- The guidance flow can continue based on the user's response and the next screen they share.
- The goal is to help users understand the process, not just reach the end of a task.

### 6. Consent before sharing — Trust, Safety & Privacy

Before the user's first screenshot or voice upload, Rehnuma displays a short consent notice explaining why the information is needed and reminding the user to hide sensitive information.

The notice warns users not to share:
- Passwords or PINs
- OTPs or verification codes
- CNIC or other identity numbers
- Other private account or personal information

The user can choose **I Understand & Continue** or **Cancel**. This consent step is intended to make the purpose of sharing clear and give the user a choice before submitting information.

Rehnuma does not ask users to provide passwords, PINs, or OTPs, and it does not take control of their devices. Screenshots and voice requests are sent for AI processing to provide guidance. Users should review the screenshot before uploading it. Do not interpret this consent notice as a guarantee that information is never retained by the AI service provider; data handling is subject to the relevant service and provider terms.

## 3. Originality & Design Approach

Rehnuma is not intended to be a general-purpose chatbot or an automated task-completion tool. Its central idea is **contextual digital coaching**:

1. **Screen-aware:** guidance is based on the screen the user is currently viewing.
2. **Intent-aware:** the user explains their goal in their own words.
3. **Explain-before-action:** each instruction includes a simple explanation of why the action matters.
4. **User-led:** the user performs the action and decides when to continue.
5. **Confidence-building:** the experience aims to help users understand the process so they can become more comfortable with similar tasks.

The interface uses a warm, high-contrast visual palette, readable text, simple language, clear controls, and voice support to reduce unnecessary complexity.

## 4. Technology Stack & Dependencies

### Frontend

- **React 19** (`react`, `react-dom`) — component-based user interface.
- **TypeScript 5.8** — typed application logic and guidance data.
- **Vite 6** — development server and frontend build tooling.
- **Tailwind CSS v4** (`@tailwindcss/vite`) — styling and brand design system.
- **Lucide React** (`lucide-react`) — interface icons.
- **Motion** (`motion`) — interface transitions and animations.

Brand palette:
- Warm Cream: `#F7F2EB`
- Forest Green: `#1E4D3E`
- Terracotta: `#D96B27`
- Sage Green: `#8FB89A`

### AI & multimodal analysis

- **Google Gemini API** using the `@google/genai` SDK (`v2.4.0`).
- Configured model options listed in the project: `gemini-flash-lite-latest`, `gemini-3.5-flash`, and `gemini-3.5-flash-lite`.
- Screenshot understanding and contextual guidance generation.
- Structured JSON responses for concise, user-friendly instructions and relevant interface coordinates.

*The model actually used at runtime depends on the application's configuration.*

### Voice & audio

- **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) — browser-based speech recognition, including Urdu (`ur-PK`) and English where supported.
- **SpeechSynthesis** — browser-based spoken guidance where supported.
- **Web Audio API** — interface audio feedback.

### Backend

- **Node.js 22** — server runtime.
- **Express.js** — backend API server.
- **TSX** — TypeScript execution for server-side development.
- **esbuild** — server-side bundling.

### Image processing

- **HTML5 Canvas** — client-side screenshot resizing before upload.

## 5. API Endpoints

| Endpoint | Purpose |
|---|---|
| `/api/analyze` | Receives the user's task context and screenshot for AI analysis and guidance generation. |
| `/api/health` | Checks API/service health. |
| `/api/tts` | Voice/audio support route, where enabled by the current implementation. |

The Express backend acts as the server-side integration point for the Gemini API. The Gemini API key should be configured on the server and must not be exposed in frontend code or committed to the repository.

## 6. Setup & Run Instructions

### Prerequisites

- Node.js **20.x or higher** (Node.js 22 is the project runtime specified for this build)
- npm **10.x or higher**
- A Google Gemini API key

### 1. Clone the repository

Replace `<repository-url>` with the actual GitHub repository URL.

```bash
git clone <repository-url>
cd rehnuma
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

Keep `.env` private. Make sure it is included in `.gitignore`; never commit a real API key.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by the development server. If the application is configured to use port `3000`, it will typically be:

```text
http://localhost:3000
```

### 4. Build and run the production version

```bash
npm run build
npm start
```

The production start command depends on the scripts defined in `package.json`.

## 7. AI Tools & Third-Party Credits

- **Google Gemini API / `@google/genai`** — screenshot understanding and AI-generated guidance.
- **Google AI Studio** — AI-assisted prototyping and development.
- **Lucide React** — interface icons.
- **React, Vite, Tailwind CSS, Express and other listed dependencies** — application framework and development tooling.
- **Web Speech API, SpeechSynthesis and Web Audio API** — browser-provided speech and audio capabilities.

AI tools were used to assist development. The team is responsible for reviewing, testing, understanding, and explaining the submitted implementation.

## 8. Demo Scenario, Limitations & Known Issues

### Electricity bill demonstration

The project includes an electricity-bill portal simulator as a demonstration scenario. It gives judges a consistent way to test the guidance flow without using a real utility account or sharing a real bill.

The simulator is a demonstration environment; it is not a live integration with an electricity provider.

### Known limitations

- Speech recognition and speech playback depend on browser, device, and language support. Chrome and Edge may provide the most suitable experience for the current implementation.
- AI guidance depends on the clarity and completeness of the screenshot and the user's description. Unclear screenshots or ambiguous requests may lead to clarification being needed.
- Model responses can be incorrect. Users should review instructions before acting, especially on financial, health, identity, or other sensitive screens.
- The electricity-bill portal is simulated; real utility-service integration is not claimed.
- Internet access and a valid Gemini API key are required for Gemini-powered analysis.
- This project is a guidance and learning companion, not a substitute for official support from banks, government departments, healthcare providers, or utility companies.

### Privacy and safety limitations

- The consent notice asks users to review their screenshot and hide sensitive information before uploading.
- Users should never submit passwords, PINs, OTPs, or verification codes.
- The app sends submitted content to the configured AI service for processing. Do not claim that uploads are never stored or are immediately deleted unless that behaviour has been verified against the implementation and provider terms.
- Rehnuma provides instructions; it does not take control of the user's device or accounts.

## 9. Submission Information

- **Applet ID:** `87ffdef0-a45e-4763-8d38-c355d7439e2d`
- **Release identifier:** `v1.0.0-final-codesphere-3.0`
- **Team:** FourBidden
- **Final submitted commit:** `[ADD THE EXACT FINAL COMMIT HASH HERE]`

---

## Before submitting

- [ ] Replace `<repository-url>` with the actual public GitHub repository URL.
- [ ] Confirm the setup commands match the scripts in `package.json`.
- [ ] Confirm the listed model IDs and versions match the code that runs in the submitted build.
- [ ] Check that the consent notice appears before the first screenshot or voice upload.
- [ ] Check that `.env` and API keys are not committed.
- [ ] Add the exact final commit hash after the build window ends.
- [ ] Make sure every feature described as implemented is present and working in the submitted version.
