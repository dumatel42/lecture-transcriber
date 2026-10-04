<div align="center">

# 🎙️ VaniVoice AI (`lecture-transcriber`)

### **[ 🇬🇧 Read in English (Current Document) ](#-documentation-navigator-pyramid-principle) &nbsp;•&nbsp; [ 🇷🇺 Читать на русском языке (README.ru.md) ](README.ru.md)**

[![Language: English](https://img.shields.io/badge/Language-English-blue.svg?style=for-the-badge)](README.md)
[![Language: Russian](https://img.shields.io/badge/Язык-Русский-red.svg?style=for-the-badge)](README.ru.md)
<br/>
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Google Gemini API](https://img.shields.io/badge/AI-Google%20Gemini%20Flash%20(1M%20Context)-orange.svg)](https://aistudio.google.com/)
[![Zero Cost](https://img.shields.io/badge/Cost-%240%2Fmonth%20(Free%20Tier)-brightgreen.svg)](https://aistudio.google.com/)
[![Status](https://img.shields.io/badge/Deployment-Vercel%20Edge-black.svg)](https://lecture-transcriber-eta.vercel.app)

> **Industrial-grade monolithic transcription & theological translation platform for 2–3 hour audio discourses with precision Sanskrit (IAST) powered by Google Gemini Flash.**  
> Built for the flawless preservation of oral philosophical traditions, spiritual discourses, and academic lectures without omissions, hallucinations, or phonetic corruption.

🌐 **Live Web Application:** [https://lecture-transcriber-eta.vercel.app](https://lecture-transcriber-eta.vercel.app)  
📦 **GitHub Repository:** [https://github.com/dumatel42/lecture-transcriber](https://github.com/dumatel42/lecture-transcriber)

---
</div>

## 🧭 Documentation Navigator (Pyramid Principle)

This documentation follows Barbara Minto’s **Pyramid Principle of Progressive Disclosure** — transitioning seamlessly from high-level understanding down into rigorous neural physics:

* 🟢 [**Level 1: Bird's-Eye View (Quick Start in 2 Minutes)**](#-level-1-birds-eye-view-quick-start) — For listeners, book editors, and transcribers: what this is, why it costs $0 / month, and how to get results immediately (via web UI or Google AI Studio).
* 🟡 [**Level 2: Engineering Depth & AI Physics**](#-level-2-engineering-depth--physics-of-ai) — For architects and engineers: why Whisper and 15-minute chunk slicing fail, anatomy of Lite model cutoffs, the mechanics of Chrono-Anchors, our 3-tiered fault-tolerant cascade, and bypassing `RECITATION` false positives.
* 🔴 [**Level 3: Technical Passport & AI Agent Guidelines**](#-level-3-technical-passport-deployment--ai-agent-guide) — For developers looking to self-host, configure multi-key rotation pools, or continue development using **Cursor, Antigravity, Claude Code, or Cline**.

---

## 🟢 Level 1: Bird's-Eye View (Quick Start)

### 1. What Pain Point Does This Solve?
Standard speech-to-text tools (Whisper, Otter.ai, commercial $20–$50/mo APIs) fail catastrophically on philosophical discourse and Eastern theology:
1. **Phonetic Deafness:** They mutilate sacred terminology beyond recognition (*"smart"* instead of *smārta*, *"bucket"* instead of *bhakti*, *"pro pad"* instead of *Prabhupāda*).
2. **Scriptural Hallucinations:** If a speaker quotes half a line of an ancient Sanskrit verse (*śloka*), generic AI invents the rest of the stanza from its training memory, destroying the authenticity of the live recording (1:1 Verbatim).
3. **Premature Cutoff:** On long 1–3 hour recordings, standard tools lose synchronization, skip paragraphs, or enter infinite repetition loops.

**VaniVoice AI** listens directly to the raw multimodal audio spectrogram through **Google Gemini Flash**, matches phonemes against a canonical Vedabase IAST glossary, expands colloquial contractions (`I'm` ➔ `I am`), and formats blockquotes with bold citations ready for academic book publishing.

---

### 2. How Much Does It Cost?
**100% Free ($0 / Month).**  
You **do not need** Google One AI Premium ($20/mo), ChatGPT Plus, or paid Google Cloud billing.  
The system operates entirely on **Google AI Studio's Free Tier**:
* **1,500 Requests Per Day (RPD)** per free API key.
* **15 Requests Per Minute (RPM)**.
* **1,000,000 Token Context Window** (accommodates up to 9.5 hours of audio in one shot; a typical 2-hour lecture consumes only ~250,000 tokens).

---

### 3. Two Ways to Use It Right Now

#### Option A: Free VaniVoice AI Web App (Easiest)
1. Open the web app: 👉 **[lecture-transcriber-eta.vercel.app](https://lecture-transcriber-eta.vercel.app)**
2. Drag and drop your audio file (`MP3`, `M4A`, `WAV`, `AAC` up to 2 GB).
3. Select your preset:
   * **Vaishnava Lecture (English)** — for native English discourse.
   * **Vaishnava Lecture (Russian)** — for native Russian discourses.
   * **Both Speakers (Lecturer + Interpreter)** — dialogue mode tagging `[Lecturer (EN)]` and `[Interpreter (RU)]`.
4. Click **"Start Transcription"**.
5. Download publication-ready Microsoft Word (`.docx`) files or translate to Russian in 1 click.

#### Option B: Directly in Google AI Studio (Zero-Setup Alternative)
If you prefer running directly in Google's cloud console without third-party web apps:
1. Open [https://aistudio.google.com/](https://aistudio.google.com/) and log in with any Gmail account.
2. Open our public master prompt guides on Google Drive (permanent share links):
   * 📄 **[English Guide (Master Transcription Prompt)](https://docs.google.com/document/d/1m5J94BLrehIXnki9rBEUSGut5qZ3BOm5qkveXpd0gac/edit)**
   * 📄 **[Russian Guide (Transcription + Literary Translation)](https://docs.google.com/document/d/1Xh2MpfwDCqePLlpF6t0suv941MWh75OABBocoDJ9M9Q/edit)**
3. Copy the System Prompt into the **System Instructions** box, upload your audio file, and run.

---

## 🟡 Level 2: Engineering Depth & Physics of AI

This section details the critical breakthroughs and neural mechanics formulated across hundreds of hours of empirical stress-testing on archival audio.

```
[User Audio up to 2 GB]
           │
           ▼  (Direct upload via Google Resumable File API)
┌─────────────────────────────────────────────────────────────────────────────┐
│ Google Cloud Gemini File API (State: ACTIVE, 1,000,000 Token Context Window)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼  (SSE Streaming Pipeline)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3-TIERED FAULT-TOLERANT MODEL CASCADE (Zero-Downtime Fallback)              │
│                                                                             │
│ Tier 1: gemini-flash-latest / gemini-2.5-flash (Auto-updating flagships)    │
│       │ Quota 429 / Server Overload 503 / Deprecation 404?                  │
│       ▼                                                                     │
│ Tier 2: gemini-3.7-flash / gemini-3.5-flash / gemini-1.5-flash              │
│       │ Secondary infrastructure outage?                                    │
│       ▼                                                                     │
│ Tier 3: gemini-pro-latest / gemini-2.5-pro (Heavy Emergency Reserve)        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼  (Mandatory Chrono-Anchors ### [HH:MM:SS])
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND & POST-PROCESSING ENGINE                                           │
│ • Degenerative loop detection & suppression (isDegenerationLoop)            │
│ • Bypass copyright safety false alarms (threshold: BLOCK_NONE)              │
│ • Clean Book Mode client-side timestamp stripping                           │
│ • Academic Microsoft Word (.docx) generator with styled typography          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 1. Why Chunk Slicing Fails (The 100% Monolithic Standard)
Early audio transcription pipelines sliced files via `ffmpeg` into 10–15 minute segments.  
**For rigorous philosophical discourse, chunking is fatal for two reasons:**
1. **Splitting Verses & Syntax:** Cuts inevitably slice through the middle of recited Sanskrit poetry or complex philosophical syllogisms.
2. **Context Collapse:** In empirical tests, an isolated chunk from `01:15:00` to `01:30:00` without the preceding 75 minutes of contextual grounding was treated by the AI as disconnected babble, collapsing 15 minutes of speech into just 4 empty bullet points (50 words).

**The VaniVoice Standard:** Audio is fed **strictly as a 100% unified monolith in 1 single pass (1-Pass Unified)** through the Google Gemini File API. The neural net holds the entire multi-hour discourse in its active 1M-token attention window, retaining full awareness of terminology introduced at minute one.

---

### 2. Anatomy of the "Premature Cutoff": 3 Hidden Traps

Many users find that an AI transcribes the first 10 minutes of a 2-hour recording, then abruptly outputs "Thank you for listening!" and terminates with an HTTP 200 OK.  
Here is the exact neural mechanics behind this bug:

#### Trap A: The "Lite" Model Taboo (Early Completion Bias)
* **Root Cause:** Models branded `Lite` (`gemini-2.5-flash-lite`, `8b`, `gemini-3.5-flash-lite`) have stripped attention heads. On continuous audio exceeding 15 minutes, the attention mechanism suffers cognitive drift. Upon encountering any pause or interim summary, it hallucinates an artificial conclusion and returns `finishReason: STOP`.
* **Fix:** The codebase enforces a strict runtime barrier: `!name.includes('lite') && !name.includes('8b')`. **Only full-weight Flash models are permitted.**

#### Trap B: Chronological Anchors (Chrono-Anchors)
* **Root Cause:** Autoregressive audio decoders lose temporal synchronization during prolonged speech pauses.
* **Fix:** The system prompt mandates injecting Markdown headers **every 3 to 5 minutes: `### [HH:MM:SS]`**. These serve as temporal guardrails locking attention across the timeline.  
* *What if the user wants clean book prose without timestamps?* Timestamps are **always requested from the model under the hood**, and the frontend's Clean Book Mode seamlessly strips them before rendering or exporting to Word!

#### Trap C: Default Output Token Limits
* **Root Cause:** Default output budgets in many developer consoles default to 8,192 tokens. A 2-hour verbatim lecture produces 20,000–35,000 tokens. Once 8,192 is reached, generation abruptly cuts off mid-sentence.
* **Fix:** All API payloads enforce `maxOutputTokens: 65536`.

---

### 3. 3-Tiered Fault-Tolerant Model Cascade
To guarantee 99.9% availability, VaniVoice AI employs an intelligent tiered pool:
1. **Tier 1 (Flagships & Auto-Update):** `gemini-flash-latest`, `gemini-2.5-flash`, `gemini-3.6-flash`, `gemini-3.8-flash`.
2. **Tier 2 (High-Stability Backups):** `gemini-3.7-flash`, `gemini-3.5-flash`, `gemini-1.5-flash-latest`, `gemini-1.5-flash`.
3. **Tier 3 (Emergency Pro Reserve):** `gemini-pro-latest`, `gemini-2.5-pro` (activated if all Flash clusters experience regional overload).

**Dynamic Model Discovery (`discoverAvailableModels`):**  
On startup, the system queries `GET /v1beta/models`, verifies which models are operational for the current API key, purges deprecated revisions, and sorts by resilience tiers.

**Zero-Downtime Error Handling:**
* **HTTP 404 (Model Renamed/Deprecated by Google):** Bypasses immediately to the next tier without stalling.
* **HTTP 429 / 503 (Quota Limit or Server Busy):** Automatically rotates to the next API key from the environment pool and smoothly transitions to the backup model. Users see real-time UI feedback: `gemini-2.5-flash (fallback) active`.

---

### 4. Bypassing False Copyright Halts (`RECITATION`)
When a speaker chants ancient Sanskrit prayers, bhajans, or stanzas from the *Bhagavad-gītā*, Google's default safety filter may trigger a false positive copyright alert, resulting in `finishReason: RECITATION`.  
* **Fix:** All streaming calls pass `SACRED_TEXT_SAFETY_SETTINGS` setting `threshold: BLOCK_NONE` across all 5 safety categories.

---

### 5. Golden Editorial Standard v1.2.1
* **1:1 Verbatim Fidelity:** Captures every sentence, humorous anecdote, rhetorical beat, and audience reaction (`[laughter]`).
* **Contraction Expansion:** Formal written English (`I'm` ➔ `I am`, `didn't` ➔ `did not`, `won't` ➔ `will not`).
* **Sanskrit IAST Phonetic Correction Map (Top-40):**
  * `smart / smarter` ➔ *smārta*
  * `back the / bucket` ➔ *bhakti*
  * `propad / pro pad` ➔ *Prabhupāda*
  * `kartritva / kartrtva` ➔ *kartṛtva*
  * `purusha / prakriti` ➔ *puruṣa / prakṛti*
  * `shastra / darshan` ➔ *śāstra / darśana*
* **Verse Formatting:** Canonical stanzas formatted as clean blockquotes with bold citations:
  > sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja  
  > — **Bhagavad-gītā 18.66**

---

## 🔴 Level 3: Technical Passport, Deployment & AI Agent Guide

### 1. Technology Stack
* **Frontend:** React 19, TypeScript 5.7, Vite 6
* **Styling:** Tailwind CSS 4, Lucide Icons
* **AI Engine:** Google Gemini Flash API (`streamGenerateContent` via SSE)
* **Audio Pipeline:** Google Resumable File API (direct client-to-Google Cloud streaming with zero hosting payload overhead)
* **Export:** `docx` library generating styled Microsoft Word documents with headers, footers, and page numbers
* **Hosting:** Vercel Edge Network

---

### 2. 3-Minute Local Setup

```bash
# 1. Clone repository
git clone https://github.com/dumatel42/lecture-transcriber.git
cd lecture-transcriber

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open `http://localhost:5173` in your browser.  
Enter your API key via the **"API Key"** modal (persisted securely in local `localStorage`).

---

### 3. Environment Variables (`.env`)

For production self-hosting, create `.env` from `.env.example`:

```env
# Primary Google Gemini API Key
VITE_GEMINI_API_KEY="AIzaSy..."

# Multi-Key Pool for automatic quota failover (comma-separated)
# 3 keys yield 4,500 free requests per day
VITE_GEMINI_KEY_POOL="AIzaSyKey1...,AIzaSyKey2...,AIzaSyKey3..."
```

---

### 4. 1-Click Vercel Deployment

```bash
npm install -g vercel
vercel --prod
```
Add `VITE_GEMINI_API_KEY` and `VITE_GEMINI_KEY_POOL` under **Settings ➔ Environment Variables** in your Vercel project dashboard.

---

### 5. Architectural Guide for AI Agents (Cursor, Antigravity, Claude Code, Cline)

If you are an autonomous AI agent maintaining this codebase, you MUST adhere to the following architectural laws:

#### 🗺️ Key Files Map:
* [`src/services/gemini.ts`](file:///Users/alex/my_projects/lecture-transcriber/src/services/gemini.ts) — Core engine. Houses File API upload, SSE streaming, tiered cascade `PRODUCTION_MODELS`, dynamic discovery `discoverAvailableModels`, repetition loop suppression `isDegenerationLoop`, and `SACRED_TEXT_SAFETY_SETTINGS`.
* [`src/constants/presets.ts`](file:///Users/alex/my_projects/lecture-transcriber/src/constants/presets.ts) — Master prompt engineering (Golden Standard v1.2.1), IAST rules, Vedabase.io translation canons, and mandatory chrono-anchors.
* [`src/App.tsx`](file:///Users/alex/my_projects/lecture-transcriber/src/App.tsx) — Main UI component: drag-and-drop, model badge updates (`onModelSelected`), Clean Book mode toggle, and transcription/translation triggers.
* [`src/utils/docxExport.ts`](file:///Users/alex/my_projects/lecture-transcriber/src/utils/docxExport.ts) — Word document generator: typography, cover page, running headers, and clean formatting.

#### ⛔ Strict Taboos for AI Agents:
1. **TABOO ON CHUNKING:** Never implement ffmpeg chunk slicing for philosophical lectures. Audio must remain 100% monolithic through the File API.
2. **TABOO ON LITE MODELS:** Never reintroduce `lite` or `8b` models into `PRODUCTION_MODELS`. They induce early completion bias.
3. **TABOO ON REMOVING TIMESTAMPS FROM PROMPTS:** In `presets.ts`, the mandate for `### [HH:MM:SS]` must always remain in the AI prompt. For Clean Book mode, timestamps are stripped client-side via `cleanTimestamps()`.
4. **TABOO ON UNCONDITIONAL `throw err`:** Never break out of the model cascade loop upon non-429 errors. Errors 404, 429, 503 must cascade gracefully to the next model tier.

---

## 📄 License & Community

Released under the permissive **MIT License**.  
Free for use, modification, and distribution by researchers, translators, scholars, and spiritual communities worldwide.

* **GitHub:** [https://github.com/dumatel42/lecture-transcriber](https://github.com/dumatel42/lecture-transcriber)
* **Live Service:** [https://lecture-transcriber-eta.vercel.app](https://lecture-transcriber-eta.vercel.app)
