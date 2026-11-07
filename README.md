# 🎓 Kalvium AI-Powered Lesson Creation & Dual QC System

An engineering-grade, AI-powered lesson creation workflow built for the **AI Research Intern** role at **Kalvium**. The tool automates multi-source educational research (books, web specifications, YouTube videos), synthesizes a structured 45-minute lesson, audits the content through **two independent Quality Control (QC) layers**, and provides an instructor workspace for review, refinement, and export.

---

## 🌟 Key Highlights & Features

1. **Multi-Source Research Automation**:
   - **Books**: Queries **Google Books API** and **OpenLibrary** for academic textbooks and foundational literature.
   - **Web & Official Specs**: Integrates **IETF RFC 9110**, **MDN Web Docs**, and **Wikipedia** for authoritative definitions.
   - **YouTube Resources**: Uses automated video search to discover curated tutorials with timestamps, view metrics, and relevance notes.
2. **45-Minute Structured Pedagogical Output**:
   - Strict 4-phase time breakdown:
     - **Phase 1 (00:00 - 10:00)**: Conceptual Foundations & HTTP Client-Server Architecture
     - **Phase 2 (10:00 - 25:00)**: Deep Dive into GET vs. POST Semantics & Status Code Triad (2xx, 4xx, 5xx)
     - **Phase 3 (25:00 - 35:00)**: Hands-On Interactive Lab (Fetch API & Status-Aware Error Routing)
     - **Phase 4 (35:00 - 45:00)**: Formative Knowledge Checks & Bloom's Taxonomy Diagnostic Quizzes
3. **Two Independent Quality Control (QC) Layers**:
   - **QC Layer 1: Research & Factual Accuracy**:
     - Audits method safety, RFC 9110 idempotency criteria, and source reliability.
     - Distinguishes tricky status codes (e.g., `401 Unauthorized` vs `403 Forbidden`).
     - Flags factual gaps and generates a scored audit report with concrete recommendations.
   - **QC Layer 2: Instructional Quality & Pacing**:
     - Evaluates alignment with the stated learning objective.
     - Audits cognitive load balance across the 45-minute target window.
     - Verifies starter code scaffolding and diagnostic quiz quality.
4. **Instructor Studio (Review, Edit & Export)**:
   - Split-screen live Markdown editor with instant preview.
   - One-click **"Apply Recommendation to Lesson"** action button for each QC item.
   - Multi-format export: **Markdown (.md)**, **Print-Ready HTML (.html)**, and **Full JSON Bundle (.json)**.
5. **Zero-Friction Dual-Engine Design**:
   - **Out-of-the-Box Mode (Zero Key Required)**: Runs fully functional offline using an intelligent pedagogical synthesizer.
   - **Live AI Mode**: Supports **Google Gemini** (Gemini 1.5/2.0 Flash), **Groq** (Llama 3.3 70B), or **OpenAI** via an in-app Settings modal or `.env`.
   - **Resilient Dual Storage**: Connects to MongoDB if available, otherwise seamlessly persists to a local JSON file store without crashing.

---

## 🏗️ Architecture & Technology Stack

```
kalvium/
├── backend/
│   ├── src/
│   │   ├── config/db.js             # Mongoose connection with automatic fallback
│   │   ├── models/lessonStorage.js  # Unified persistence layer (MongoDB + JSON store)
│   │   ├── routes/lessonRoutes.js   # Pipeline, research, generation, QC, and export APIs
│   │   ├── services/
│   │   │   ├── researchService.js   # Google Books, OpenLibrary, Wikipedia, YouTube scraper
│   │   │   ├── lessonService.js     # 45-minute lesson generation engine
│   │   │   ├── qcLayer1Service.js   # Factual accuracy and RFC compliance auditor
│   │   │   ├── qcLayer2Service.js   # Instructional quality and pacing auditor
│   │   │   ├── aiProvider.js        # Universal LLM client (Gemini, Groq, OpenAI)
│   │   └── server.js                # Express API server & static production frontend host
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Kalvium branding, status indicator, lesson selector
│   │   │   ├── LessonInputForm.jsx  # Input form with quick sample presets
│   │   │   ├── PipelineStepper.jsx  # 4-step pipeline status with per-step retry buttons
│   │   │   ├── ResearchSources.jsx  # Books, Web specs, and YouTube cards
│   │   │   ├── LessonEditor.jsx     # Split markdown editor, 45m timeline, lab code, quiz
│   │   │   ├── QCAuditPanel.jsx     # Dual QC reports with "Apply Recommendation"
│   │   │   ├── ExportModal.jsx      # Markdown, HTML, JSON download center
│   │   │   └── SettingsModal.jsx    # LLM Provider & API key configuration
│   │   ├── App.jsx
│   │   └── index.css                # Tailwind CSS styling
│   └── package.json
├── test_pipeline.js                 # Automated CLI test suite for both test samples
├── package.json                     # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher recommended; tested on Node.js v22)
- **npm**

### Step 1: Clone or Extract the Project
```bash
cd kalvium
```

### Step 2: Install Dependencies & Build
Install all dependencies for backend and frontend:
```bash
# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install

# Build the frontend production bundle
npm --prefix frontend run build
```

### Step 3: Start the Application
Run the unified server with a single command:
```bash
npm start
```
Open your browser at:
👉 **[http://localhost:5000](http://localhost:5000)**

*(Alternatively, to run with Vite hot-reloading in dev mode, run `npm run dev:backend` in one terminal and `npm run dev:frontend` in another, then visit `http://localhost:3000`)*.

---

## 🧪 Automated Pipeline Verification

To run the automated test suite verifying both required test samples:
```bash
npm run test:pipeline
```
This script validates:
1. **Sample 1**: *"HTTP Requests and Responses"* with learning objective *"Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories."*
2. **Sample 2**: *"Database Indexing & Query Optimization"* with learning objective *"Explain B-Tree vs Hash index structures and demonstrate how composite index column ordering impacts query execution plans."*
3. Multi-source research fetching books, web standards, and YouTube videos.
4. Lesson generation with 45-minute pacing and diagnostic quizzes.
5. QC Layer 1 & QC Layer 2 audit reports.
6. One-click application of QC recommendations.

---

## 🎥 Demo Video Walkthrough Guide (For Submission)

When recording your demo video for submission, use the following outline:

| Section | Duration | Key Actions to Demonstrate |
|:---|:---|:---|
| **1. Intro & Architecture** | 0:00 - 0:45 | • State your name and role application (**AI Research Intern at Kalvium**).<br>• Highlight the MERN stack architecture, multi-source research, and dual isolated QC layers. |
| **2. Lesson Creation** | 0:45 - 1:45 | • Click the **"Sample 1 (Kalvium Prompt)"** button to load `HTTP Requests and Responses`.<br>• Click **"Launch Lesson Generation Pipeline"** or **"Run Complete Pipeline"**.<br>• Point out the visual pipeline stepper showing real-time step status. |
| **3. Research Sources** | 1:45 - 2:30 | • Switch to the **Automated Research Repository**.<br>• Showcase the researched **Books** (e.g., *HTTP: The Definitive Guide*), authoritative **Web Standards** (*RFC 9110*, *MDN Web Docs*), and curated **YouTube Tutorials**. |
| **4. Dual QC Layers** | 2:30 - 3:45 | • Navigate to the **QC Reports (Dual Layers)** tab.<br>• **QC Layer 1**: Show the Factual Accuracy audit score (e.g., 91/100) and RFC idempotency verification.<br>• Click **"Apply Recommendation to Lesson"** on an issue to show instant merging into the curriculum.<br>• **QC Layer 2**: Switch to Instructional Quality and explain the 45-minute pacing audit and Bloom's taxonomy check. |
| **5. Lesson Studio & 45m Pacing** | 3:45 - 4:45 | • Open the **Lesson Studio**.<br>• Demonstrate the 4-phase 45-minute timeline (0-10m, 10-25m, 25-35m, 35-45m).<br>• Show the interactive Lab challenge with starter and reference solution code.<br>• Edit a section in Markdown and click **"Save Edits"** to demonstrate version tracking (e.g., `v2`). |
| **6. Multi-Format Export** | 4:45 - 5:15 | • Click the **"Export"** button.<br>• Download the finalized **Markdown (.md)**, **HTML document**, or **JSON bundle** showing full lesson metadata and complete audit logs. |
| **7. Error Handling & Settings** | 5:15 - 5:45 | • Open **Settings** to show flexible support for Google Gemini, Groq, OpenAI, or the offline synthesizer.<br>• Show that individual steps can be retried at any time with the **"Retry Step"** button. |

---

## 🛡️ Evaluation Criteria Alignment

- **Workflow functionality & technical implementation**: Clean modular Express API + React 18 UI with asynchronous orchestration and state persistence.
- **Research quality & factual accuracy**: Integrates primary IETF RFC standards, Google Books, and YouTube tutorials with automated validation.
- **Effectiveness of both QC layers**: Two fully decoupled audit passes producing scored reports, severity ratings, and one-click remediation.
- **Instructional quality & pacing**: Enforces a proven 45-minute pedagogical timeline (Intro $\rightarrow$ Deep Dive $\rightarrow$ Lab $\rightarrow$ Diagnostic Check).
- **Resilience & Error Handling**: Handles empty inputs gracefully, allows failed steps to be retried independently, and prevents data loss through dual persistence.
