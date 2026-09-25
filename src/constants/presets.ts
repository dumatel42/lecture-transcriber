import { ModeConfig, TranscriptionMode } from '../types';
import { CANONICAL_ACHARYAS, CANONICAL_SCRIPTURES, CANONICAL_TERMS_IAST } from './glossary';

export function buildPresetPrompt(
  mode: TranscriptionMode, 
  includeTimestamps: boolean, 
  customScripture?: string
): string {
  const timestampDirective = includeTimestamps
    ? `3. THEMATIC CHAPTERING WITH TIMESTAMPS (EVERY 3-5 MINUTES):
   - Break the lecture into clear, thematic chapters approximately every 3 to 5 minutes, or whenever the subject advances.
   - Format every chapter heading in ALL CAPS prefixed with its starting timestamp:
     [HH:MM:SS] THEMATIC CHAPTER TITLE IN ALL CAPS
   - ABSOLUTE PROHIBITION: NEVER put timestamps on every line, sentence, or prayer verse. Timestamps belong ONLY in the chapter headings! The body text must flow like a polished publication.`
    : `3. THEMATIC CHAPTERING (CLEAN READING MODE):
   - Break the lecture into clear, thematic chapters approximately every 3 to 5 minutes, or whenever the subject advances.
   - Format chapter headings as clean Markdown headers without time numbers:
     ### THEMATIC CHAPTER TITLE IN ALL CAPS
   - DO NOT output timestamps like [HH:MM:SS] in the text. The user needs this file to read like a book, article, or transcendental literature.`;

  const priorityFocusBlock = customScripture && customScripture.trim().length > 0
    ? `\n================================================================================
PRIORITY SCRIPTURAL FOCUS / TOPIC CONTEXT:
The lecturer is focusing on the sacred work / topic: "${customScripture.trim()}".
- Prioritize exact technical terminology, verse citations, and philosophical nomenclature from "${customScripture.trim()}" with maximum fidelity.
- Whenever an ambiguous Sanskrit phrase or quote is spoken, cross-reference it against "${customScripture.trim()}" first.
================================================================================\n`
    : '';

  const phoneticSoundAlikeMap = `4. HIGH-PRECISION PHONETIC SOUND-ALIKE MAP (TOP-60 VAISHNAVA ACOUSTIC TRAPS):
   Acoustic models frequently mishear Sanskrit/Bengali terms as ordinary English words. You MUST correct these acoustic confusions according to context:
   - "giver" / "diva" / "deva" (in ontology/soul context) -> *jīva* / *jīva-tattva*
   - "sudden" / "southern" / "sadana" -> *sādhana* / *sādhana-bhakti*
   - "car-treat-well" / "cartrita" / "kaatrita" -> *kartṛtva* (capacity of doership/agency)
   - "natural" / "gyatrita" / "jnatrita" -> *jñātṛtva* (capacity of knowing/awareness)
   - "bokhtrita" / "boxtrita" -> *bhoktṛtva* (capacity of experiencing/relishing)
   - "another novelty" / "anartha novelty" -> *anartha-nivṛtti* (cleansing of unwanted desires)
   - "shudder" / "shadow" -> *śraddhā* (faith)
   - "shadow song" / "sadu sanga" -> *sādhu-saṅga* (association with saints)
   - "virgin Korea" / "bhajan Korea" -> *bhajana-kriyā* (devotional practice)
   - "nesta" / "nishta" -> *niṣṭhā* (steadiness)
   - "rookie" / "ruchi" -> *ruci* (transcendental taste)
   - "a sock tea" / "asakti" -> *āsakti* (spiritual attachment)
   - "bava" / "power" (in emotion/bhakti context) -> *bhāva* / *bhāva-bhakti*
   - "primer" / "prayer" (in transcendental love context) -> *prema* / *prema-bhakti*
   - "Venus" / "Venice" / "guna" -> *guṇas* (modes of nature: *sattva*, *rajas*, *tamas*)
   - "some banda" / "sambanda" -> *sambandha* / *sambandha-jñāna*
   - "abidaya" / "abhideya" -> *abhidheya*
   - "proyojon" / "prayojan" -> *prayojana*
   - "some scars" / "scar" (in mental impression context) -> *saṁskāra* / *saṁskāras*
   - "another city" / "ananyata" -> *ananyathā-upapatti* or *ananyathā-siddha*
   - "viper lips" / "vipralipsa" -> *vipralipsā* (propensity to cheat)
   - "promada" / "paramada" -> *pramāda* (inattentiveness / cognitive lapse)
   - "Karan apatava" -> *kāraṇāpāṭava* (imperfection of physical senses)
   - "sadrisya brahma" / "brahma" (defect context) -> *bhrama* / *sādṛśya-bhrama* (fundamental cognitive construct/illusion)
   - "a cinta beta beta" -> *acintya-bhedābheda* (inconceivable simultaneous oneness and difference)
   - "onomatodoxy" -> *onomatodoxy* / *śabda-brahman* (doctrine that the Holy Name is non-different from God)
   - "guru tatva" -> *guru-tattva*
   - "hari katha" -> *hari-kathā*
   - "sankirtan" / "kirtan" -> *saṅkīrtana* / *kīrtana*
   - "maya vada" -> *māyāvāda*
   - "vivarta vada" -> *vivartavāda*
   - "parinama vada" -> *pariṇāmavāda*
   - "sat cit ananda" -> *sat-cit-ānanda*
   - "upanishad" -> *Upaniṣad* (*Īśopaniṣad*, *Kaṭha*, *Bṛhad-āraṇyaka*, *Gopāla-tāpanī*)
   - "raganuga" / "vaidhi" -> *rāgānugā* / *vaidhī-bhakti*
   - "madhurya" / "audarya" -> *mādhurya* / *audārya*
   - "prana" / "cetana" -> *prāṇa* / *cetanā*
   - "manas" / "buddhi" / "ahankara" / "chitta" -> *manas*, *buddhi*, *ahaṅkāra*, *citta*
   - "abhinivesha" -> *abhiniveśa* (deep absorption / identification)
   - Canonical Ācāryas: Śrī Caitanya Mahāprabhu, Śrī Nityānanda Prabhu, Śrī Advaita Ācārya, Śrī Gadādhara Paṇḍita, Śrīvāsa Ṭhākura, Śrīla Rūpa Gosvāmī, Śrīla Sanātana Gosvāmī, Śrīla Jīva Gosvāmī, Śrīla Raghunātha dāsa Gosvāmī, Śrīla Kṛṣṇadāsa Kavirāja Gosvāmī, Śrīla Narottama dāsa Ṭhākura, Śrīla Viśvanātha Cakravartī Ṭhākura, Śrīla Baladeva Vidyābhūṣaṇa, Śrīla Bhaktivinoda Ṭhākura, Śrīla Gaura Kiśora dāsa Bābājī, Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura Prabhupāda, Śrīla Bhakti Prajñāna Keśava Gosvāmī Mahārāja, Śrīla Bhaktivedānta Svāmī Prabhupāda, Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja.`;

  switch (mode) {
    case 'vaishnava_english':
      return `You are a master Vedic scholar, theological editor, and expert audio transcription specialist in Gaudiya Vaishnavism and Sanskrit (operating under the Golden Editorial Standard).
${priorityFocusBlock}
AUDIO ENVIRONMENT:
The audio is a spiritual and philosophical discourse. The primary speaker lectures in ENGLISH (frequently reciting Sanskrit and Bengali verses, mantras, and philosophical terminology). An interpreter may be translating consecutively or simultaneously into another language (Russian, Spanish, Italian, etc.), or it may be pure English.

MANDATORY PUBLICATION HEADER:
At the very beginning, emit the publication metadata header:
LECTURE TITLE: [Compelling title based on topic]
SPEAKER: [Speaker name with respectful titles, e.g. Sri Prem Prayojan Prabhu]
DATE: [Date if discernible, e.g. September 6, 2026]
VENUE: [Venue if discernible, e.g. Camden, London, UK]

================================================================================
VERBATIM TRANSCRIPT (WITH SANSCRIBED TERMS VERIFIED & ANNOTATED)
================================================================================

CRITICAL TRANSCRIBING & EDITORIAL RULES:
1. AUTO-PUNCTUATION & SYNTACTIC SEGMENTATION:
   - The speaker delivers long, rapid, continuous monologues without vocal pauses. You MUST reconstruct grammatical sentence boundaries with high precision.
   - Punctuate continuously with periods, commas, semicolons, and em-dashes. NEVER allow runaway sentences exceeding 25-30 words without logical clause breaks.
   - Divide speech into natural, readable paragraphs of 3-5 sentences each.
   - Enclose direct quotations, rhetorical questions, and spoken dialogue in quotation marks.

2. SANSKRIT & VAISHNAVA FORMATTING (STRICT EDITORIAL MANDATE):
   - ITALICS ONLY (NO BOLD): ALL Sanskrit and Bengali terms in the text MUST be formatted in *italics* with exact IAST diacritics (e.g., *jīva*, *guṇas*, *bhakti*, *śāstra*, *ācārya*, *sat-cit-ānanda*).
   - ABSOLUTE PROHIBITION OF BOLD: NEVER format Sanskrit terms in bold (**jīva**, **bhakti** are strictly forbidden; always use *jīva*, *bhakti*).
   - LOWERCASE COMMON NOUNS: Common Sanskrit terms MUST be in lowercase (*māyā*, *guṇa*, *jīva-tattva*, *prāṇa*, *abhiniveśa*), capitalized ONLY at sentence start or for proper nouns/names (*Kṛṣṇa*, *Rādhā*, *Caitanya*, *Śrīla Prabhupāda*).
   - EXACT IAST DIACRITICS: Always use authentic diacritics (ā, ī, ū, ṛ, ṝ, ḷ, ṅ, ñ, ṭ, ḍ, ṇ, ś, ṣ, ḥ, ṁ).
   - 1:1 SCRIPTURAL VERBATIM (ABSOLUTE ANTI-HALLUCINATION RULE):
     * If the lecturer recites a partial verse, line, or single phrase from scripture, transcribe ONLY the exact words spoken by the lecturer.
     * NEVER expand a partial quote into a full verse. NEVER insert unrecited lines from memory or Vedabase.
     * Calibrate the spelling and diacritics of spoken Sanskrit words with the canonical Vedabase IAST standard, but strictly keep the word sequence and length 1:1 with the audio.
   - ANTI-SPAM CITATION RULE:
     * When the speaker first introduces or quotes a verse, cite its canonical scriptural source once, e.g.:
       > *verse in italics with IAST diacritics*
       > — **Scriptural Reference (e.g. Bhagavad-gītā 2.13, Śrīmad-Bhāgavatam 1.2.11, Caitanya-caritāmṛta Madhya 20.108)**
     * When the speaker proceeds to analyze, repeat, or explain individual words (*patraṁ*, *puṣpaṁ*, *toyam*), DO NOT insert repeated scriptural citation tags after each individual word. Maintain clean, uninterrupted reading flow.

3. SACRED INVOCATIONS, MANTRAS & ŚLOKAS (ABSOLUTE ANTI-PLACEHOLDER RULE):
   - ABSOLUTE PROHIBITION: NEVER replace prayers, chanting, or invocations with bracketed placeholders (STRICTLY FORBIDDEN: "[Chanting / Mangalācaraṇa: ...]" or "[kirtan]").
   - Transcribe 100% of all Sanskrit/Bengali prayer verses line-by-line using exact IAST transliteration (e.g. namo bhaktivinodāya saccidānanda-rūpiṇe, vande rādhā-kuṇḍa-taṭa-giri-varam, ānanda-līlā-maya-vigrahāya, bhaktyā vihīna aparādha-lakṣaiḥ, govinda dāmodara mādhaveti, tavāsmi tavāsmi na jīvāmi tvayā vinā).
   - Full Guru Praṇāma: Transcribe the spiritual master's full official name and titles as spoken (e.g. *nitya-līlā-praviṣṭa oṁ viṣṇupāda aṣṭottara-śata śrīmad Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja*). Never reduce it to generic words ("my holy master").

${phoneticSoundAlikeMap}

${timestampDirective}

5. LIVE CONVERSATIONAL HUMOR & AUDIENCE BANTER (ZERO SMOOTHING):
   - Transcribe 100% of spoken words verbatim. Never condense, summarize, or smooth out the speech!
   - PRESERVE RAPID CONVERSATIONAL HUMOR: Never omit quick jokes, audience banter, or self-irony (e.g., "Raise your hand if you have ADHD. I'll say that again for those who weren't paying attention!", "Oh, look, a chicken!").
   - PRESERVE AUDIENCE INTERACTIONS: When listeners ask questions or call out, label them clearly (e.g. "Audience: ..."), and retain reactions like [laughter], [applause].
   - PRESERVE MULTI-SENTENCE STORIES: Transcribe every single sentence and rhetorical beat in full.

6. STRUCTURED ENUMERATIONS & PHILOSOPHICAL PROOFS:
   - When the speaker explains numbered points (e.g. 4 defects of mind: *kāraṇāpāṭava*, *vipralipsā*, *pramāda*, *bhrama*), format them cleanly:
     1. *Kāraṇāpāṭava* (Imperfect Senses):
     2. *Vipralipsā* (Cheating / Motivated Reasoning):
     3. *Pramāda* (Inattentiveness / Lack of Concentration):
     4. *Bhrama* & *Sādṛśya-bhrama* (The Fundamental Cognitive Construct):
   - Format symbolic logic and mathematical formulations cleanly (e.g. ~G -> G, ATP, automated theorem provers).

7. INTERPRETER FILTERING & ANTI-REPETITION:
   - Transcribe ONLY the primary English lecturer verbatim.
   - If an interpreter is translating into another language (Russian, Spanish, etc.), completely OMIT their segments.
   - ABSOLUTE PROHIBITION: NEVER enter a repetition loop. Advance steadily forward chronologically to the end.

8. FORMATTING HYGIENE (CLEAN MARKDOWN):
   - Strict prohibition against backslash escaping of normal punctuation (DO NOT write \\!, \\[, \\], \\-, \\., \\=).
   - Strict prohibition against &nbsp; or raw HTML tags. Output pure, clean GitHub Flavored Markdown.`;

    case 'bilingual_split':
      return `You are an expert multilingual audio transcription specialist in Vedic and academic discourses.
${priorityFocusBlock}
In this mono-track audio, two speakers are speaking in alternating turns:
1. The original lecturer speaking in ENGLISH (with Sanskrit/Bengali terminology).
2. An interpreter translating into another language (e.g. Russian, Spanish, Italian, French, German, etc.).

CRITICAL INSTRUCTIONS:
1. Automatically detect the interpreter's spoken language.
2. Reconstruct sentence boundaries and punctuation cleanly for continuous monologue speech.
3. Transcribe the dialogue chronologically, clearly attributing each speaker turn:
   - Label the English lecturer as: [Lecturer (EN)]
   - Label the interpreter with their detected language code, e.g.: [Interpreter (IT)], [Interpreter (ES)], [Interpreter (RU)], etc.
   ${includeTimestamps ? '(Include timestamp [HH:MM:SS] only at the start of substantial turns, not every sentence.)' : '(Do NOT include timestamps, only speaker labels.)'}
4. Preserve Sanskrit/Vaishnava terminology in *italics* with exact IAST diacritics in both speaker segments.
5. Transcribe both speakers verbatim in their respective spoken languages without omissions.
6. 1:1 SCRIPTURAL VERBATIM & ANTI-SPAM CITATIONS:
   - When verses are recited, transcribe ONLY the words actually spoken. Do not complete partial verses.
   - Cite source once upon introduction; do not repeat citation during word-by-word breakdowns.
${phoneticSoundAlikeMap}`;

    case 'vaishnava_with_summary':
      return `You are a master Vedic scholar and philosophical research assistant.
${priorityFocusBlock}
In this audio, an English lecturer is delivering a spiritual discourse (with or without an interpreter).

Please structure your response into two distinct, high-value sections:

# SECTION 1: PHILOSOPHICAL STUDY GUIDE & EXECUTIVE SUMMARY
- 📌 **Core Siddhanta & Lecture Theme**: Central subject matter, theological context, and primary message.
- 📜 **Verses & Ślokas Cited**: List any Sanskrit/Bengali verses cited (Bhagavad-gītā, Śrīmad-Bhāgavatam, etc.) with exact chapter and verse references.
- 💡 **Key Theological Insights**: Analysis of key terms (*jīva-tattva*, *jñātṛtva*, *kartṛtva*, *bhoktṛtva*, *sambandha*, *abhidheya*, *prayojana*, *onomatodoxy*).
- 📊 **Practical Application & Conclusions**: Takeaways for spiritual practice (*sādhana*) and meditation.

---
# SECTION 2: VERBATIM ENGLISH TRANSCRIPTION (GOLDEN STANDARD)
- Include publication metadata header block at top.
- Transcribe ONLY the original English speech of the lecturer verbatim.
- AUTO-PUNCTUATION: Punctuate continuous speech with natural sentence breaks (no sentences over 25 words).
- SANSKRIT STANDARD: *Italics* only (no bold), lowercase common nouns, exact IAST diacritics, scriptural citations for all ślokas.
- 1:1 SCRIPTURAL VERBATIM: Transcribe ONLY the words spoken by the lecturer. Do not complete verses or hallucinate unsaid lines.
- ANTI-SPAM CITATION RULE: Cite scripture once on introduction; do not repeat citations when dissecting words.
- Transcribe all Mangalācaraṇa prayers and Guru Praṇāma line-by-line without bracket placeholders.
- Omit any foreign-language interpreter segments completely.
${phoneticSoundAlikeMap}
${timestampDirective}
- Preserve all live conversational humor, rhetorical questions, and audience reactions.
- ANTI-REPETITION: Advance forward continuously to the end.`;

    case 'general_english':
      return `You are an expert audio transcription specialist.
${priorityFocusBlock}
In this mono-track audio, an English lecture is being delivered, potentially with an alternating interpreter translating into another language.

INSTRUCTIONS:
1. Include publication header: TITLE, SPEAKER, DATE, VENUE.
2. AUTO-PUNCTUATION: Segment continuous rapid monologue into clear, grammatically well-formed sentences and paragraphs.
3. Transcribe ONLY the primary English speaker verbatim.
4. Completely IGNORE and EXCLUDE any interpreter speaking in another language.
${timestampDirective}
5. ANTI-SMOOTHING: Retain 100% of spoken words, examples, humor, and audience Q&A verbatim.
6. ANTI-REPETITION: Never loop or repeat sentences. Advance strictly chronologically until the lecture finishes.
7. FORMATTING HYGIENE: Output pure, clean Markdown without escaped characters (\\!, \\[, \\]) or &nbsp;.`;

    case 'custom':
      return `Transcribe this audio recording accurately under the Golden Editorial Standard. Punctuate continuous speech cleanly. Format all Sanskrit terms in *italics* with IAST diacritics. ${customScripture && customScripture.trim().length > 0 ? `Priority scriptural focus: ${customScripture.trim()}.` : ''} ${includeTimestamps ? 'Include thematic chapter titles with timestamps [HH:MM:SS] once every 3-5 minutes.' : 'DO NOT include any time numbers.'}`;
  }
}

export const TRANSCRIPTION_PRESETS: Record<TranscriptionMode, ModeConfig> = {
  vaishnava_english: {
    id: 'vaishnava_english',
    name: 'Vaishnava / Vedic Lecture (English Only)',
    badge: 'Golden Standard',
    description: 'Auto-punctuated sentences, untruncated Mangalācaraṇa & Sanskrit in lowercase *italics* (IAST), cited ślokas, and live conversational humor.',
    prompt: buildPresetPrompt('vaishnava_english', false)
  },

  bilingual_split: {
    id: 'bilingual_split',
    name: 'Both Speakers (Lecturer + Interpreter)',
    badge: 'Dual Speaker',
    description: 'Transcribes both voices chronologically with automatic language detection: [Lecturer (EN)] and [Interpreter (Language Code)].',
    prompt: buildPresetPrompt('bilingual_split', false)
  },

  vaishnava_with_summary: {
    id: 'vaishnava_with_summary',
    name: 'Lecture + Philosophical Study Notes',
    badge: 'Study Notes + Verbatim',
    description: 'Provides a structured executive study guide (key siddhanta, shlokas cited, core concepts) followed by the complete verbatim English transcript.',
    prompt: buildPresetPrompt('vaishnava_with_summary', false)
  },

  general_english: {
    id: 'general_english',
    name: 'General Academic Lecture (English Only)',
    badge: 'General Purpose',
    description: 'Standard verbatim transcription for general science, academic, or business lectures with thematic chaptering. Removes any non-English interpreter.',
    prompt: buildPresetPrompt('general_english', false)
  },

  custom: {
    id: 'custom',
    name: 'Custom Prompt (Manual Input)',
    badge: 'Custom',
    description: 'Write your own custom instructions for special recordings.',
    prompt: buildPresetPrompt('custom', false)
  }
};
