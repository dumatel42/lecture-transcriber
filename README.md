<div align="center">

# 🎙️ VaniVoice AI
### Specialized Lecture Transcription & Literary Translation Platform

**[🇬🇧 Read in English](#-english-documentation) • [🇷🇺 Читать на русском языке](#-документация-на-русском)**

[![English Version](https://img.shields.io/badge/Documentation-English-2563eb?style=for-the-badge&logo=google-chrome&logoColor=white)](#-english-documentation)
[![Русская версия](https://img.shields.io/badge/Документация-Русский-dc2626?style=for-the-badge&logo=readme&logoColor=white)](#-документация-на-русском)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Live Web App](https://img.shields.io/badge/Live_App-lecture--transcriber-amber?style=for-the-badge&logo=vercel&logoColor=white)](https://lecture-transcriber-eta.vercel.app)

<br/>

🌐 **Live Web App:** [https://lecture-transcriber-eta.vercel.app](https://lecture-transcriber-eta.vercel.app)  
📦 **GitHub Repository:** [https://github.com/dumatel42/lecture-transcriber](https://github.com/dumatel42/lecture-transcriber)

---
</div>

## 🌐 Quick Language Jump / Быстрый переход:
- 👉 **[English Documentation](#-english-documentation)**
  - [Tier 1: User Guide (How to use the web service)](#tier-1-user-guide)
  - [Tier 2: Developer & Maker Guide (Self-host your clone in 5 minutes)](#tier-2-developer--maker-guide)
  - [Architecture & Tech Stack](#architecture--tech-stack)
- 👉 **[Документация на русском языке](#-документация-на-русском)**
  - [Уровень 1: Руководство пользователя (Как пользоваться сайтом)](#уровень-1-руководство-пользователя)
  - [Уровень 2: Для разработчиков (Как развернуть свой проект бесплатно)](#уровень-2-для-разработчиков-и-энтузиастов)
  - [Архитектура и технологические решения](#архитектура-и-технологический-стек)

---
---

# 🇬🇧 English Documentation

> **Specialized open-source AI platform for long-form spiritual, philosophical, and academic lecture transcription with authentic Sanskrit (IAST) diacritics calibration and literary Russian translation.**

---

## Tier 1: User Guide

If you simply want to transcribe lecture recordings or translate them into polished Russian prose, no coding is required — open the web service directly:  
👉 **[Open VaniVoice AI Online](https://lecture-transcriber-eta.vercel.app)**

### 🌟 Core Capabilities
1. **Audio to Text (Lectures up to 2+ Hours):**
   * **Broad Format Support:** `MP3`, `M4A`, `WAV`, `AAC`, `OGG`, `WEBM`, `FLAC`.
   * **Simultaneous Interpreter Filtering:** If the original lecturer speaks English and an interpreter translates into Russian/Spanish during pauses, the system transcribes **only the original English speaker**.
   * **Authentic Sanskrit (IAST Standard):** Philosophical terms (*jīva*, *guṇas*, *bhakti*, *śāstra*) are formatted in clean *italics* with canonical diacritics (ā, ī, ū, ṛ, ṝ, ḷ, ṅ, ñ, ṭ, ḍ, ṇ, ś, ṣ, ḥ, ṁ).
   * **1:1 Verbatim Scriptural Precision (Anti-Hallucination):** If the speaker quotes only 2–3 words of a verse, the AI records **only the exact words spoken** — never hallucinating or auto-completing unsaid lines from memory.
   * **Anti-Spam Citation Rule:** Cites scripture sources once upon introduction, but does not spam citation tags during word-by-word anatomical analysis.
   * **Monologue Auto-Punctuation:** Rapid continuous monologues without vocal pauses are automatically punctuated into balanced sentences (under 25–30 words) and clean paragraphs.
   * **Book-Ready Contraction Expansion:** Converts colloquial spoken forms (`I'm`, `you're`, `we've`) into formal book prose (`I am`, `you are`, `we have`), preserving contractions only inside quoted speech.

2. **Text to Literary Russian Translation:**
   * Full, unabridged translation of transcripts and Microsoft Word (`.docx`) documents.
   * Preserves 100% of theological depth, chapter organization, Sanskrit verses, and book layout.
   * One-click download of styled `.docx` Word documents ready for publication.

---

### 📋 How to Use the Web App Step-by-Step

1. **Upload Audio:** Drag and drop your audio file onto the upload zone. The system detects duration and confirms readiness.
2. **Select Preset:**
   * **Vaishnava / Vedic Lecture (Recommended):** Full standard for spiritual discourses with IAST diacritics and Sanskrit glossary calibration.
   * **Both Speakers (Lecturer + Interpreter):** Chronological transcript labeling turns: `[Lecturer (EN)]` and `[Interpreter (RU)]`.
   * **Lecture + Executive Summary:** Analytic study notes (theological themes, verses, concepts) followed by verbatim text.
   * **General Academic Lecture:** Optimized for university, science, or business talks.
3. **Focus Scripture / Topic (Optional):**
   * If the lecturer focuses on a specific scripture (e.g. *Jaiva-dharma*, *Bhakti-rasāmṛta-sindhu*), enter its name in the dedicated field with the book icon. The AI anchors its vocabulary to this text with maximum priority.
4. **Timestamps Switch:**
   * Keep OFF for clean publication reading mode, or switch ON to generate timestamps `[HH:MM:SS]` once every 3–5 minutes at chapter headings.
5. **Start & Export:** Click **Start Transcription**. Read in real time, translate to Russian, or download as Microsoft Word (`.docx`).

---

## Tier 2: Developer & Maker Guide

Want to run your own instance for your community, adapt the prompts for another tradition, or host it on your custom domain? It takes **5 minutes** and costs **$0/month** (100% Free Tier).

### 🛠️ Architecture & Tech Stack
* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Lucide Icons
* **AI Engine:** Google Gemini Flash API (`gemini-2.5-flash`, `gemini-1.5-flash`)
* **Audio Pipeline:** Google Gemini Resumable File API (direct browser-to-cloud upload up to 2GB)
* **Word Generator:** `docx` library with styled tables, headers, and publication formatting
* **Hosting:** Vercel (Edge Network)

---

### 🚀 Self-Host in 5 Minutes (Step-by-Step)

#### Step 1: Obtain a Free Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account and click **"Get API key"** ➔ **"Create API key"**.
3. Copy the key (`AIzaSy...` or `AQ.Ab8...`). Google provides a generous free tier of up to 1,500 requests per day.

#### Step 2: Clone the Repository
```bash
git clone https://github.com/dumatel42/lecture-transcriber.git
cd lecture-transcriber
```

#### Step 3: Install & Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. You can enter your API key directly via the **"API Key"** button in the top navigation bar.

#### Step 4: Deploy to Vercel (1 Command)
```bash
npm install -g vercel
vercel
```
*(Optional)* Add `VITE_GEMINI_API_KEY` to **Vercel Project Settings** ➔ **Environment Variables** so your site visitors don't need to supply their own key.

---
---

# 🇷🇺 Документация на русском

> **Специализированная открытая ИИ-платформа для расшифровки длинных духовных, философских и академических лекций с прецизионной верификацией санскрита (стандарт IAST) и глубоким литературным переводом на русский язык.**

---

## Уровень 1: Руководство пользователя

Если вам нужно расшифровать запись лекции или получить качественный перевод, программировать не требуется — перейдите на работающий сайт:  
👉 **[Открыть VaniVoice AI онлайн](https://lecture-transcriber-eta.vercel.app)**

### 🌟 Ключевые возможности
1. **Аудио в текст (Лекции длительностью до 2+ часов):**
   * **Поддержка любых форматов:** `MP3`, `M4A`, `WAV`, `AAC`, `OGG`, `WEBM`, `FLAC`.
   * **Отсечение синхронного переводчика:** Если в аудио лектор говорит по-английски, а в паузах говорит русский переводчик, сервис распознаёт **только оригинальную речь лектора**.
   * **Прецизионный санскрит (стандарт Vedabase IAST):** Термины (*jīva*, *guṇas*, *bhakti*, *śāstra*) форматируются курсивом с аутентичной диакритикой (ā, ī, ū, ṛ, ṝ, ḷ, ṅ, ñ, ṭ, ḍ, ṇ, ś, ṣ, ḥ, ṁ).
   * **Правило 1:1 для священных шлок (Anti-Hallucination):** Если лектор цитирует лишь пару слов из стиха, сервис записывает **ровно произнесённые слова**, не дописывая несказанные строки из памяти.
   * **Защита от спама цитатами:** Ссылка на источник даётся один раз при цитировании шлоки, но не дублируется при пословном разборе каждого слова.
   * **Автопунктуация непрерывной речи:** Быстрые монологи без пауз автоматически делятся на гармоничные предложения (до 25–30 слов) и удобные абзацы.
   * **Разворот сокращений:** Разговорные `I'm`, `you're`, `we've` приводятся к книжному литературному стандарту `I am`, `you are`, `we have`.

2. **Текст на русский язык (Литературный перевод):**
   * Полный перевод английских транскриптов и документов Microsoft Word (`.docx`).
   * 100% сохранение объёма без сокращений, структурированные главы и экспорт в готовый `.docx` файл для верстки книги.

---

### 📋 Пошаговая инструкция по работе с сайтом

1. **Загрузка аудио:** Перетащите файл лекции в окно загрузчика. Сервис отобразит длительность и подтвердит готовность.
2. **Выбор режима:**
   * **Вайшнавская / Ведическая лекция (Рекомендуется):** Полный канонический словарь терминов, ачарьев и шлок.
   * **Оба спикера (Лектор + Переводчик):** Поочерёдная запись диалога с разделением спикеров `[Lecturer (EN)]` и `[Interpreter (RU)]`.
   * **Лекция + Конспект:** Аналитический конспект лекции (тезисы, шлоки, термины) + полный дословный текст.
   * **Академическая лекция:** Для научных и общегуманитарных лекций.
3. **Поле «Специфика / Писание лекции» (Опционально):**
   * Если лектор читает курс по конкретной книге (*«Джайва-дхарма»*, *«Бхакти-расамрита-синдху»*, *«Упадешамрита»*), впишите название в это поле. ИИ возьмёт этот контекст с наивысшим приоритетом.
4. **Таймкоды:**
   * Выключены по умолчанию для чистого книжного чтения. Включите тумблер, если требуются метки `[ЧЧ:ММ:СС]` в заголовках глав.
5. **Экспорт:**
   * Готовый текст можно в один клик перевести на русский язык, скопировать или скачать в формате Microsoft Word (`.docx`) с готовой вёрсткой.

---

## Уровень 2: Для разработчиков и энтузиастов

Хотите развернуть собственную копию сервиса для своей команды или разместить на своём домене? Это займёт **5 минут** и **не требует платных серверов** (100% Free Tier).

### 🛠️ Архитектура и стек
* **Frontend:** React 18, TypeScript, Vite
* **Стилизация:** Tailwind CSS, Lucide Icons
* **ИИ-ядро:** Google Gemini Flash API (`gemini-2.5-flash`, `gemini-1.5-flash`)
* **Аудио-пайплайн:** Google Gemini Resumable File API (прямая загрузка файлов до 2 ГБ напрямую из браузера без промежуточных серверов)
* **Экспорт:** `docx` (генератор документов Microsoft Word с колонтитулами и стилями)
* **Хостинг:** Vercel (Edge Network)

---

### 🚀 Как развернуть свой клон за 5 минут

#### Шаг 1. Получите бесплатный API ключ Gemini
1. Перейдите на [Google AI Studio](https://aistudio.google.com/).
2. Войдите через Google-аккаунт и нажмите **«Get API key»** ➔ **«Create API key»**.
3. Скопируйте полученный ключ. Бесплатный тариф Google даёт до 1500 запросов в сутки.

#### Шаг 2. Клонируйте репозиторий
```bash
git clone https://github.com/dumatel42/lecture-transcriber.git
cd lecture-transcriber
```

#### Шаг 3. Установите зависимости и запустите локально
```bash
npm install
npm run dev
```
Откройте в браузере `http://localhost:5173`. Ключ можно ввести прямо в интерфейсе через кнопку **«API ключ»** в верхнем меню.

#### Шаг 4. Бесплатная публикация на Vercel (в 1 команду)
```bash
npm install -g vercel
vercel
```
*(Опционально)* Добавьте переменную `VITE_GEMINI_API_KEY` в **Settings** ➔ **Environment Variables** вашего проекта на Vercel, чтобы вашим пользователям не приходилось вводить личные ключи.

---

## 📄 Лицензия

Проект распространяется под свободной лицензией **MIT License**. Разрешено свободное использование, модификация и распространение.

* Исходный код: [https://github.com/dumatel42/lecture-transcriber](https://github.com/dumatel42/lecture-transcriber)
* Онлайн-сервис: [https://lecture-transcriber-eta.vercel.app](https://lecture-transcriber-eta.vercel.app)
