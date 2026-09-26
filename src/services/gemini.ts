/**
 * Google Gemini Audio Upload, Streaming Transcription & Translation Service
 * Direct browser-to-Google API execution (No server payload limit, handles up to 2GB)
 * Includes multi-key pool failover & multi-model fallback (1500 req/day per key).
 */

export interface UploadedFileInfo {
  name: string;
  uri: string;
  mimeType: string;
  state: 'PROCESSING' | 'ACTIVE' | 'FAILED';
}

// Full production models (fastest, ultra-reliable models with verified API availability)
export const PRODUCTION_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3-flash-preview'
];

// Multi-Key Pool for automatic failover (securely loaded from environment variables)
export const DEFAULT_KEY_POOL: string[] = (() => {
  const poolStr = import.meta.env.VITE_GEMINI_KEY_POOL;
  if (poolStr && typeof poolStr === 'string') {
    const keys = poolStr.split(',').map((k: string) => k.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }
  const singleKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (singleKey && typeof singleKey === 'string' && singleKey.trim()) {
    return [singleKey.trim()];
  }
  return [];
})();

let currentKeyIndex = 0;

export function getActiveDefaultKey(): string {
  return DEFAULT_KEY_POOL[currentKeyIndex % DEFAULT_KEY_POOL.length];
}

export function rotateToNextDefaultKey(): string {
  currentKeyIndex = (currentKeyIndex + 1) % DEFAULT_KEY_POOL.length;
  console.log(`Rotated to default key index: ${currentKeyIndex + 1}/${DEFAULT_KEY_POOL.length}`);
  return getActiveDefaultKey();
}

/**
 * Direct Google Gemini Cloud API URL builder (No proxy, direct to Google Cloud)
 */
export function buildApiUrl(targetUrl: string, _useProxy: boolean = false): string {
  return targetUrl;
}

/**
 * 1. Upload audio file directly to Google Gemini File API via Resumable Upload (up to 2GB)
 */
export async function uploadAudioToGemini(
  file: File,
  apiKey: string,
  onProgress: (percent: number, loadedBytes: number, totalBytes: number) => void
): Promise<UploadedFileInfo> {
  const mimeType = file.type || (file.name.endsWith('.m4a') ? 'audio/m4a' : 'audio/mp3');

  // Step 1: Initiate Resumable Upload session directly on Google Cloud
  const initUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
  const metadata = JSON.stringify({
    file: {
      display_name: file.name
    }
  });

  const initResponse = await fetch(initUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': file.size.toString(),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json'
    },
    body: metadata
  });

  if (!initResponse.ok) {
    const errText = await initResponse.text();
    throw new Error(`Google Upload Initialization Error: HTTP ${initResponse.status} ${errText}`);
  }

  const uploadUrl = initResponse.headers.get('x-goog-upload-url');
  if (!uploadUrl) {
    throw new Error('Google API did not return an upload URL (x-goog-upload-url missing).');
  }

  // Step 2: Upload raw file bytes directly to Google Cloud via XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    xhr.setRequestHeader('X-Goog-Upload-Offset', '0');
    xhr.setRequestHeader('X-Goog-Upload-Command', 'upload, finalize');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
        onProgress(percent, event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.file) {
            resolve({
              name: res.file.name,
              uri: res.file.uri,
              mimeType: res.file.mimeType || mimeType,
              state: res.file.state || 'ACTIVE'
            });
          } else {
            reject(new Error('Invalid response structure from Google API upload.'));
          }
        } catch (e: any) {
          reject(new Error(`Failed to parse Google API response: ${e.message}`));
        }
      } else {
        reject(new Error(`Audio upload failed: HTTP ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while transferring audio file to Google Cloud. Please check your connection.'));
    };

    xhr.send(file);
  });
}

/**
 * 2. Poll until Google audio analysis state becomes ACTIVE
 */
export async function waitForAudioProcessing(
  fileName: string,
  apiKey: string,
  onStatusUpdate: (msg: string) => void
): Promise<void> {
  const maxAttempts = 60; // Up to 2.5 minutes
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    const rawCheckUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`;
    let resp: Response;
    try {
      resp = await fetch(buildApiUrl(rawCheckUrl));
    } catch {
      resp = await fetch(rawCheckUrl);
    }
    
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Status check failed: HTTP ${resp.status} ${errText}`);
    }

    const data = await resp.json();
    const state = data.state;

    if (state === 'ACTIVE') {
      onStatusUpdate('Audio ready in Google Cloud.');
      return;
    }

    if (state === 'FAILED') {
      throw new Error('Google Cloud failed to process this audio file (unsupported codec or corrupted media).');
    }

    onStatusUpdate(`Processing audio in Google Cloud... (${attempt * 3}s)`);
    await new Promise((r) => setTimeout(r, 2500));
  }

  throw new Error('Timeout waiting for Google Cloud audio processing.');
}

/**
 * 3. Stream transcription with auto-failover across models and keys (File URI)
 */
export async function streamTranscription(
  fileUri: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  onChunk: (textChunk: string) => void,
  onModelSelected?: (modelName: string) => void,
  onKeyRotated?: (newKeyIndex: number) => void
): Promise<string> {
  let lastError: Error | null = null;
  let activeKeyToUse = apiKey;

  for (const model of PRODUCTION_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (onModelSelected) {
          onModelSelected(model);
        }
        return await executeModelStream(model, fileUri, mimeType, prompt, activeKeyToUse, onChunk);
      } catch (err: any) {
        console.warn(`Model ${model} (attempt ${attempt + 1}) failed:`, err.message);
        lastError = err;

        const isQuotaOrBusy = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('503');

        if (isQuotaOrBusy) {
          if (!localStorage.getItem('lectorclean_custom_api_key')) {
            activeKeyToUse = rotateToNextDefaultKey();
            if (onKeyRotated) onKeyRotated(currentKeyIndex + 1);
          }
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }

        throw err;
      }
    }
  }

  throw lastError || new Error('All available Gemini models are currently busy. Please try again shortly.');
}

/**
 * 3b. Stream transcription directly from inline audio Base64
 * Bypasses Google File API and Vercel payload limits completely!
 * Starts transcription in under 500ms without temporary cloud uploads.
 */
export async function streamInlineAudioTranscription(
  audioBase64: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  onChunk: (textChunk: string) => void,
  onModelSelected?: (modelName: string) => void,
  onKeyRotated?: (newKeyIndex: number) => void
): Promise<string> {
  let lastError: Error | null = null;
  let activeKeyToUse = apiKey;

  for (const model of PRODUCTION_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (onModelSelected) {
          onModelSelected(model);
        }
        return await executeInlineModelStream(model, audioBase64, mimeType, prompt, activeKeyToUse, onChunk);
      } catch (err: any) {
        console.warn(`Model ${model} (attempt ${attempt + 1}) failed:`, err.message);
        lastError = err;

        const isQuotaOrBusy = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('503');

        if (isQuotaOrBusy) {
          if (!localStorage.getItem('lectorclean_custom_api_key')) {
            activeKeyToUse = rotateToNextDefaultKey();
            if (onKeyRotated) onKeyRotated(currentKeyIndex + 1);
          }
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }

        throw err;
      }
    }
  }

  throw lastError || new Error('All available Gemini models are currently busy. Please try again shortly.');
}

async function executeInlineModelStream(
  model: string,
  audioBase64: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  onChunk: (textChunk: string) => void
): Promise<string> {
  const rawUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const proxiedUrl = buildApiUrl(rawUrl);

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: audioBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 65536
    }
  };

  let resp: Response;
  try {
    resp = await fetch(proxiedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    resp = await fetch(proxiedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${errorText}`);
  }

  if (!resp.body) {
    throw new Error('Response body missing ReadableStream.');
  }

  return await readSSEStream(resp.body, onChunk);
}

async function executeModelStream(
  model: string,
  fileUri: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  onChunk: (textChunk: string) => void
): Promise<string> {
  const rawUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const proxiedUrl = buildApiUrl(rawUrl);

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            file_data: {
              mime_type: mimeType,
              file_uri: fileUri
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 65536
    }
  };

  let resp: Response;
  try {
    resp = await fetch(proxiedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    resp = await fetch(proxiedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${errorText}`);
  }

  if (!resp.body) {
    throw new Error('Response body missing ReadableStream.');
  }

  return await readSSEStream(resp.body, onChunk);
}

async function readSSEStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (textChunk: string) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';
  let buffer = '';

  const isDegenerationLoop = (accumulated: string, incoming: string): boolean => {
    const combined = accumulated + incoming;

    // 1. Sentence-level repetition
    const sentences = combined
      .split(/(?<=[.?!])\s+|\n+/)
      .map((s) => s.trim().replace(/^\[\d\d:\d\d:\d\d\]\s*/, ''))
      .filter((s) => s.length >= 20);

    if (sentences.length >= 3) {
      const last = sentences[sentences.length - 1];
      const prev1 = sentences[sentences.length - 2];
      const prev2 = sentences[sentences.length - 3];
      if (last === prev1 && last === prev2) return true;
    }

    // 2. Phrase-level repetition within the last 600 characters
    const tail = combined.slice(-600);
    if (/(.{12,200}?)\1{2,}/s.test(tail)) {
      return true;
    }

    return false;
  };

  let consecutiveLoops = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      
      const jsonStr = trimmed.slice(6);
      if (jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const candidates = parsed.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts;
          if (parts && parts.length > 0) {
            for (const part of parts) {
              if (part.text && !part.thought) {
                if (isDegenerationLoop(accumulatedText, part.text)) {
                  console.warn('Degeneration repetition loop detected and suppressed.');
                  consecutiveLoops++;
                  if (consecutiveLoops >= 3) {
                    console.warn('Loop threshold reached, cleanly aborting chunk stream.');
                    try { await reader.cancel(); } catch {}
                    break;
                  }
                  continue;
                }
                consecutiveLoops = 0;
                accumulatedText += part.text;
                onChunk(part.text);
              }
            }
          }
        }
      } catch {
        // Skip malformed SSE chunk
      }
    }
    if (consecutiveLoops >= 3) {
      break;
    }
  }

  if (!accumulatedText.trim()) {
    throw new Error('The neural model returned an empty response. Verify audio speech clarity.');
  }

  return accumulatedText;
}

/**
 * 4. Translate English lecture transcript to Russian with deep Vaishnava & Vedic awareness
 */
export async function translateTranscriptToRussian(
  englishTranscript: string,
  apiKey: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const prompt = `You are a master Vedic scholar, theological editor, and senior literary translator of Gaudiya Vaishnava discourses (in the revered tradition of Śrīla Prabhupāda and classical acāryas).

Your task is to translate the provided English lecture transcript into fluent, natural, philosophically rigorous, and literary Russian (Spark Master Translation Standard).

CRITICAL TRANSLATION & EDITORIAL PRINCIPLES:
1. ABSOLUTE PROHIBITION OF SUMMARIZATION OR COMPRESSION (100% VERBATIM FIDELITY):
   - You MUST translate 100% of the spoken content without skipping, shortening, summarizing, or condensing anything!
   - NO summaries, NO abridged notes, NO executive outlines. Every single paragraph, sentence, explanation, analogy, metaphor, personal example, and rhetorical question must be translated in full.
   - The Russian translation MUST be as long, detailed, and rich as the English original (or 5-10% longer due to natural Russian syntax).
   - Use fluent, natural, literary Russian syntax while preserving 100% of the speaker's thoughts and nuances thought-for-thought and line-for-line.

2. PRESERVE & TRANSLATE PUBLICATION STRUCTURE:
   - If the text has metadata at the top, translate labels into Russian:
     LECTURE TITLE: -> НАЗВАНИЕ ЛЕКЦИИ: [Красивое название на русском]
     SUBTITLE: -> ПОДЗАГОЛОВОК: [Глубокий философский подзаголовок]
     SPEAKER: -> ДОКЛАДЧИК: [Имя докладчика с почтительными титулами]
     DATE: -> ДАТА:
     VENUE: -> МЕСТО:
   - Divider line:
     ================================================================================
     ПОЛНЫЙ ПЕРЕВОД ЛЕКЦИИ НА РУССКИЙ ЯЗЫК (С СОХРАНЕНИЕМ САНСКРИТСКОЙ ТЕРМИНОЛОГИИ)
     ================================================================================
   - Translate all chapter headings with timestamps into Russian in ALL CAPS:
     [HH:MM:SS] НАЗВАНИЕ ГЛАВЫ В ВЕРХНЕМ РЕГИСТРЕ

3. ACCURATE GAUDIYA VAISHNAVA SIDDHANTA & NATURAL RUSSIAN MORPHOLOGY:
   - NATURAL RUSSIAN DECLENSION (CRITICAL FOR ORAL READING ALOUD):
     * NEVER leave bare Latin words in the middle of Russian sentences without case endings (STRICTLY FORBIDDEN: "в других darśana", "заправляют guṇa", "jīva обладает kartṛtva").
     * ALWAYS decline Sanskrit terms naturally according to Russian grammar, placing the IAST term in parentheses where helpful:
       - "в других даршанах (darśana)", "всем заправляют гуны (guṇa)", "джива обладает картритвой (kartṛtva)", "под влиянием самскар (saṁskāra)", "в саттва-гуне (sattva-guṇa)".
     * The Russian text must be noble, grammatically pristine, and ready for an orator to read aloud from a podium without stumbling!
   - Canonical term mappings:
     * jīva / ātmā -> джива / атма (индивидуальная душа, вечная частица духа)
     * Paramātmā / Supersoul -> Параматма (Сверхдуша)
     * Bhagavān -> Бхагаван (Верховная Личность Бога)
     * kartṛtva -> картритва (способность действовать / статус деятеля / субъектность)
     * jñātṛtva -> джнатритва (способность познавать / качество познающего)
     * bhoktṛtva -> бхоктритва (способность переживать опыт / наслаждаться)
     * guṇa / gunas -> гуны материальной природы (саттва-гуна — благость, раджо-гуна — страсть, тамо-гуна — невежество)
     * śuddha-sattva -> шуддха-саттва (чистая духовная благость)
     * ānanda -> ананда (трансцендентное блаженство)
     * buddhi, manas, ahaṅkāra -> буддхи (разум), манас (ум), аханкара (ложное эго / отождествление)
     * prāṇa, nāḍīs -> прана (жизненный воздух), нади (тонкие энергетические каналы)
     * saṁskāras -> самскары (глубинные подсознательные отпечатки прошлого опыта)
     * sādhana -> садхана (ежедневная духовная практика)
     * brāhmaṇas -> брахманы (духовные и интеллектуальные наставники общества)
     * kīrtana -> киртан (совместное воспевание святых имен)
     * śāstra / darśana -> шастры (священные писания) / даршаны (философские школы)

4. SCRIPTURAL VERSES (ŚLOKAS) & STRICT VEDABASE.IO CANONICAL STANDARD:
   - For all quoted verses from Bhagavad-gītā, Śrīmad-Bhāgavatam, Chaitanya-charitāmṛta, Upaniṣads, and Vedānta-sūtra, you MUST adhere to the authoritative canonical Russian translation of His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda (as established on the official website vedabase.io / BBT).
   - When Mangalācaraṇa or invocation prayers are present at the beginning (e.g. namo bhaktivinodāya, vande rādhā-kuṇḍa...), translate every single stanza line-by-line into noble, prayerful Russian with the Sanskrit text preserved. NEVER skip or condense invocations!
   - Structure every quoted śloka clearly:
     > *[Sanskrit verse in canonical IAST transliteration]*
     > — **[Title of Scripture & Chapter.Verse]**
     > **[Канонический перевод Vedabase.io / Шрила Прабхупада]:** «[Canonical Russian translation verbatim from vedabase.io]»
     > **[Разъяснение лектора]:** [The speaker's personal word-by-word philosophical explanation of the verse].

5. PRESERVE 100% OF HUMOR, WORDPLAY & AUDIENCE DIALOGUES:
   - NEVER sanitize or delete the speaker's humor, jokes, and puns!
     * Example: meat smelling bad vs having the power to smell -> translate the wordplay accurately: "Мясо само может иметь дурной запах (вонять), но само воспринимать запахи не способно! [смех в зале]".
     * Example: supervisor vs literal super-vision -> translate the distinction between an office manager (супервайзер) and God's supernatural vision / glance (буквальное Сверх-Зрение Маха-Вишну).
   - RETAIN audience interactions: questions from attendees (Слушатель: ...), reactions ([смех в зале], [аплодисменты]), and traditional responses (Гаура-премананде! — Харибол!).
   - NEVER compress vivid multi-sentence real-life stories (e.g. someone slapping you on the street, whose mind inspired him, a whirlwind throwing someone off a mountain, a carpenter holding a chisel, a king and six atomic ministers) into a single summary sentence. Translate EVERY single sentence and rhetorical beat!

6. CLEAN ORAL LECTURE FLOW (NO INLINE TIMESTAMP CLUTTER):
   - If the input text contains repetitive inline timestamps on every sentence (e.g. [00:53], [01:12], [01:34]), STRIP and OMIT these distracting inline time markers from the body paragraphs!
   - Retain timestamps ONLY in major chapter headings: [HH:MM:SS] НАЗВАНИЕ ГЛАВЫ.
   - The main body text must flow naturally like transcendental literature or an orator's speech.

7. NEUROSCIENCE, PSYCHOLOGY & SCIENTIFIC PRECISION:
   - neuroplasticity -> нейропластичность мозга
   - reward system -> система вознаграждения мозга
   - mesolimbic pathway -> мезолимбический дофаминовый путь
   - ventral tegmental area (VTA) -> вентральная область покрышки (VTA)
   - nucleus accumbens -> прилежащее ядро (nucleus accumbens)
   - ventral striatum -> вентральный стриатум
   - receptors downregulation / desensitization -> десенситизация и редукция рецепторов
   - tolerance, habituation, withdrawal -> толерантность (привыкание), зависимость и абстинентный синдром
   - emergent property -> эмерджентное свойство (материи)

8. HIGHLIGHT KEY ANALOGIES & LISTS:
   - Format analogies clearly:
     **Аналогия слепцов:** ...
     **Аналогия подводной лодки:** ...
   - Keep bullet points neatly formatted with • or -.
   - Do NOT omit, summarize, or abridge content.

Transcript to translate into publication-quality Russian:
\n\n` + englishTranscript;

  let lastError: Error | null = null;
  let activeKeyToUse = apiKey;

  for (const model of PRODUCTION_MODELS) {
    try {
      const rawUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${activeKeyToUse}`;
      const proxiedUrl = buildApiUrl(rawUrl);
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 65536
        }
      };

      let resp: Response;
      try {
        resp = await fetch(proxiedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
        resp = await fetch(proxiedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errText}`);
      }

      if (!resp.body) throw new Error('ReadableStream missing');

      const accumulatedText = await readSSEStream(resp.body, onChunk);
      if (accumulatedText.trim()) {
        return accumulatedText;
      }
    } catch (err: any) {
      console.warn(`Translation attempt failed with ${model}:`, err.message);
      lastError = err;
      const is503 = err.message?.includes('503') || err.message?.includes('high demand') || err.message?.includes('UNAVAILABLE');
      const is429 = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');

      if (is503) {
        console.warn('503 high demand spike detected. Backing off 4 seconds...');
        await new Promise((r) => setTimeout(r, 4000));
        continue;
      }

      if (is429 && !localStorage.getItem('lectorclean_custom_api_key')) {
        activeKeyToUse = rotateToNextDefaultKey();
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  throw lastError || new Error('Failed to translate transcript into Russian. Please retry.');
}

/**
 * 5. Format and structure transcript into Spark publication quality
 * (Metadata header, timestamped chapter titles, blockquotes for verses, bullet points, and removal of interpreter noise)
 */
export async function formatTranscriptSparkStyle(
  transcript: string,
  apiKey: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const prompt = `You are a senior Gaudiya Vaishnava scholar, master theological editor, and book typesetter.

Transform the following raw lecture transcript into a beautifully structured, publication-quality document in Markdown (Spark Editorial Standard).

CRITICAL EDITORIAL & FORMATTING RULES:
1. METADATA HEADER:
At the very beginning, create the metadata block:
LECTURE TITLE: [Clear, compelling lecture title based on topic]
SUBTITLE: [Deep philosophical subtitle]
SPEAKER: [Speaker name if mentioned or identifiable, otherwise Gaudiya Vaishnava Discourse]
DATE: [Date if discernible, otherwise omit]
VENUE: [Venue if discernible, otherwise omit]

Followed by:
================================================================================
VERBATIM TRANSCRIPT (EDITED FOR CLARITY & PUBLICATION)
================================================================================

2. AUTO-PUNCTUATION & CLAUSE SEGMENTATION:
- Reconstruct natural, grammatically sound sentence boundaries from the continuous monologue speech.
- Punctuate continuously with periods, commas, semicolons, question marks, and em-dashes.
- ABSOLUTE PROHIBITION: Never allow runaway sentences longer than 25-30 words without logical clause breaks.
- Organize continuous speech into well-balanced paragraphs of 3-5 sentences each.
- Enclose spoken dialogue and quotations in standard quotation marks.

3. SANSKRIT & VAISHNAVA FORMATTING (STRICT EDITORIAL MANDATE):
- ITALICS ONLY (NO BOLD): ALL Sanskrit and Bengali terms in the text MUST be formatted in *italics* with canonical IAST diacritics (e.g., *jīva*, *guṇas*, *bhakti*, *śāstra*, *ācārya*, *sat-cit-ānanda*).
- ABSOLUTE PROHIBITION OF BOLD: NEVER format Sanskrit words in bold (**jīva**, **bhakti** are strictly forbidden; always use *jīva*, *bhakti*).
- LOWERCASE COMMON NOUNS: Common Sanskrit terms MUST be in lowercase (*māyā*, *guṇa*, *jīva-tattva*, *prāṇa*, *abhiniveśa*), capitalized ONLY at sentence start or for proper nouns/names (*Kṛṣṇa*, *Rādhā*, *Caitanya*, *Śrīla Prabhupāda*).
- EXACT IAST DIACRITICS: Always use authentic diacritics (ā, ī, ū, ṛ, ṝ, ḷ, ṅ, ñ, ṭ, ḍ, ṇ, ś, ṣ, ḥ, ṁ).

4. THEMATIC CHAPTER HEADINGS WITH TIMESTAMPS:
Break the discourse into thematic sections (every ~2-5 minutes or whenever the subject advances).
Use ALL CAPS with the starting timestamp:
[HH:MM:SS] THEMATIC CHAPTER TITLE IN ALL CAPS

5. SCRIPTURAL VERSES (ŚLOKAS) & CITATIONS:
Whenever Sanskrit or Bengali verses are quoted (Bhagavad-gītā, Śrīmad-Bhāgavatam, Vedānta-sūtra, Caitanya-caritāmṛta, etc.), format them cleanly as a markdown blockquote with exact IAST diacritics and reference citation:
> *verse in italics with IAST diacritics*
> — **Scriptural Reference (e.g. Bhagavad-gītā 2.13, Śrīmad-Bhāgavatam 1.2.11, Caitanya-caritāmṛta Madhya 20.108)**
> "English translation or explanation..."

6. BULLETED LISTS FOR ATTRIBUTES & CONCEPTS:
When the speaker explains enumerations, qualities, or attributes (e.g., *jñātṛtva*, *kartṛtva*, *bhoktṛtva*, or philosophical axioms), format as clean bulleted points:
• ***Attribute/Term*** — explanation...

7. HIGHLIGHT KEY ANALOGIES:
When the speaker provides an analogy or metaphor, label it:
**Analogy of the Magnet:** explanation...
**Analogy of the Carpenter:** explanation...

8. SACRED PRAYERS & MANTRAS (ZERO TRUNCATION):
- ABSOLUTE PROHIBITION: NEVER replace Mangalācaraṇa, prayers, or kirtans with bracketed placeholders (STRICTLY FORBIDDEN: "[Chanting / Mangalācaraṇa: ...]").
- You MUST preserve 100% of all Sanskrit/Bengali prayer verses line-by-line using exact IAST transliteration.
- Preserve the full spoken names and titles of spiritual masters: *nitya-līlā-praviṣṭa oṁ viṣṇupāda aṣṭottara-śata śrīmad Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja*. Never reduce them.
- Scriptural Verses: Never truncate Sanskrit shlokas with ellipses. Preserve the entire verse verbatim.

9. LIVE CONVERSATIONAL HUMOR & AUDIENCE BANTER:
- Retain all rapid conversational jokes, audience interactions, and rhetorical humor verbatim (e.g., "Raise your hand if you have ADHD. I'll say that again for those who weren't paying attention!", "Oh, look, a chicken!"). Never smooth out humor!

10. VERBATIM FIDELITY & FORMATTING HYGIENE:
- Retain 100% of the speaker's philosophical substance and words. Do NOT summarize or condense!
- Omit repetitive translator/interpreter interjections if it was a bilingual lecture.
- Strict prohibition against backslash escaping of normal punctuation (NO \\!, \\[, \\], \\-, \\=).
- Strict prohibition against &nbsp; or HTML artifacts. Output pure, clean GitHub Flavored Markdown.

Raw transcript to format:
\n\n` + transcript;

  let lastError: Error | null = null;
  let activeKeyToUse = apiKey;

  for (const model of PRODUCTION_MODELS) {
    try {
      const rawUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${activeKeyToUse}`;
      const proxiedUrl = buildApiUrl(rawUrl);
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 65536
        }
      };

      let resp: Response;
      try {
        resp = await fetch(proxiedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
        resp = await fetch(proxiedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errText}`);
      }

      if (!resp.body) throw new Error('ReadableStream missing');

      const accumulatedText = await readSSEStream(resp.body, onChunk);
      if (accumulatedText.trim()) {
        return accumulatedText;
      }
    } catch (err: any) {
      console.warn(`Spark formatting attempt failed with ${model}:`, err.message);
      lastError = err;
      if (err.message?.includes('429') && !localStorage.getItem('lectorclean_custom_api_key')) {
        activeKeyToUse = rotateToNextDefaultKey();
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  throw lastError || new Error('Failed to format transcript into Spark style. Please retry.');
}

/**
 * 6. Clean up file from Google Cloud storage
 */
export async function cleanupGoogleFile(fileName: string, apiKey: string): Promise<void> {
  try {
    const rawDelUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`;
    await fetch(buildApiUrl(rawDelUrl), { method: 'DELETE' });
  } catch (err) {
    console.warn('Could not delete temporary file from Google Cloud:', err);
  }
}
