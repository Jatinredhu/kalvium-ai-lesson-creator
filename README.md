# 🎓 LessonCraft AI — Intelligent Lesson Studio & Dual QC Engine

A production-grade, AI-powered curriculum creation workflow built for modern educators and instructional designers. **LessonCraft AI** automates multi-source educational research (books, web specifications, YouTube tutorials), synthesizes a structured 45-minute lesson, audits the content through **two independent Quality Control (QC) layers**, and provides an instructor studio for review, live preview, and export.

---

## 🌟 Key Features

1. **Automated Multi-Source Research**:
   - **Books**: Queries **Google Books API** and **OpenLibrary** for foundational literature and textbooks.
   - **Web & Official Specs**: Integrates authoritative engineering sources like **IETF RFC standards**, **MDN Web Docs**, and **Wikipedia**.
   - **YouTube Resources**: Automated discovery of curated educational videos with view metrics, durations, and relevance notes.
2. **Pedagogical 45-Minute Lesson Output**:
   - Structured into 4 distinct phases:
     - **Phase 1 (00:00 - 10:00)**: Conceptual Foundations & Architecture
     - **Phase 2 (10:00 - 25:00)**: Deep Dive into Core Mechanisms (e.g. GET vs. POST, 2xx, 4xx, 5xx)
     - **Phase 3 (25:00 - 35:00)**: Hands-On Interactive Lab (Starter code & verified solution)
     - **Phase 4 (35:00 - 45:00)**: Formative Knowledge Checks & Diagnostic Quizzes
3. **Dual Quality Control (QC) Layers**:
   - **QC Layer 1: Research & Factual Accuracy**:
     - Audits method safety, idempotency rules, and source reliability.
     - Distinguishes tricky concepts (e.g., `401 Unauthorized` [unauthenticated] vs `403 Forbidden`).
     - Scored report with severity flags (`HIGH`, `MEDIUM`, `LOW`) and one-click application.
   - **QC Layer 2: Instructional Quality & Pacing**:
     - Evaluates alignment with the stated learning objective.
     - Audits cognitive pacing across the 45-minute timeline.
     - Evaluates scaffolding in exercises and diagnostic quizzes.
4. **Instructor Studio (Review, Edit & Export)**:
   - Split-screen live Markdown editor with instant preview.
   - One-click **"Apply Recommendation to Lesson"** action button for each QC finding.
   - Multi-format export: **Markdown (.md)**, **Print-Ready HTML (.html)**, and **Full JSON Bundle (.json)**.
5. **Production Architecture**:
   - **Zero-Key Default Mode**: Runs out of the box using an intelligent offline pedagogical synthesizer—evaluators never need an API key to test the app.
   - **Optional Live AI Integration**: Easily connect **Groq (Free Tier)**, **Google Gemini**, or **OpenAI** via the in-app **⚙️ Settings** modal or `backend/.env`.
   - **Resilient Dual Storage**: Connects to MongoDB if available, otherwise seamlessly persists to local JSON document storage without crashing.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher; tested on v22)
- **npm**

### Step 1: Clone and Install
```bash
git clone https://github.com/Jatinredhu/kalvium-ai-lesson-creator.git
cd kalvium-ai-lesson-creator

# Install dependencies
npm --prefix backend install
npm --prefix frontend install

# Build frontend
npm --prefix frontend run build
```

### Step 2: Start the Application
Run the unified application with a single command:
```bash
npm start
```
Open your browser at:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🧪 Automated Pipeline Verification

To run the automated test suite verifying both required test samples:
```bash
npm run test:pipeline
```

---

## 🎥 Demo Video Walkthrough Guide

When recording your demo video for submission, use the following outline:

| Section | Duration | Key Actions to Demonstrate |
|:---|:---|:---|
| **1. Intro & Architecture** | 0:00 - 0:45 | • Introduce **LessonCraft AI** as an automated curriculum creator and dual QC validation engine.<br>• Highlight the MERN stack, multi-source research pipeline, and 45-minute lesson structure. |
| **2. Lesson Creation** | 0:45 - 1:45 | • Click the **"Sample 1 (Kalvium Prompt)"** button to load `HTTP Requests and Responses`.<br>• Click **"Launch Lesson Generation Pipeline"**.<br>• Point out the visual pipeline stepper showing real-time step status. |
| **3. Research Sources** | 1:45 - 2:30 | • Switch to the **Automated Research Repository**.<br>• Showcase the researched **Books** (e.g., *HTTP: The Definitive Guide*), authoritative **Web Standards** (*RFC 9110*, *MDN Web Docs*), and curated **YouTube Tutorials**. |
| **4. Dual QC Layers** | 2:30 - 3:45 | • Navigate to the **QC Reports (Dual Layers)** tab.<br>• **QC Layer 1**: Show the Factual Accuracy audit score (e.g., 91/100) and RFC idempotency verification.<br>• Click **"Apply Recommendation to Lesson"** on an issue to show instant merging into the curriculum.<br>• **QC Layer 2**: Switch to Instructional Quality and explain the 45-minute pacing audit and Bloom's taxonomy check. |
| **5. Lesson Studio & 45m Pacing** | 3:45 - 4:45 | • Open the **Lesson Studio**.<br>• Demonstrate the 4-phase 45-minute timeline (0-10m, 10-25m, 25-35m, 35-45m).<br>• Show the interactive Lab challenge with starter and reference solution code.<br>• Edit a section in Markdown and click **"Save Edits"** to demonstrate version tracking (e.g., `v2`). |
| **6. Multi-Format Export** | 4:45 - 5:15 | • Click the **"Export"** button.<br>• Download the finalized **Markdown (.md)**, **HTML document**, or **JSON bundle** showing full lesson metadata and complete audit logs. |
