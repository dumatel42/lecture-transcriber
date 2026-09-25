const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, ShadingType } = docx;

const INPUT_MD = '/Users/alex/Downloads/Nauka_Schastya_Sri_Prem_Prayojan_SPARK.md';
const OUTPUT_RU_MD = '/Users/alex/Downloads/Nauka_Schastya_Sri_Prem_Prayojan_RUSSIAN_SPARK.md';
const OUTPUT_RU_DOCX = '/Users/alex/Downloads/Nauka_Schastya_Sri_Prem_Prayojan_RUSSIAN_SPARK.docx';

const API_KEY = 'AQ.Ab8RN6KFaNx8nF1bPtMj_lVZzDj5xxirdbPgiksDwzPL-yOWgA';
const GATEWAY_URL = 'https://lecture-transcriber-eta.vercel.app/api/proxy?url=';

function parseInlineRuns(text, baseColor = '1E293B', isQuote = false) {
  const runs = [];
  const pattern = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|_.*?_|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.substring(lastIndex, match.index), font: 'Georgia', size: isQuote ? 21 : 22, color: baseColor, italics: isQuote }));
    }
    const m = match[0];
    if (m.startsWith('***') && m.endsWith('***')) {
      runs.push(new TextRun({ text: m.slice(3, -3), font: 'Georgia', size: isQuote ? 21 : 22, bold: true, italics: true, color: baseColor }));
    } else if (m.startsWith('**') && m.endsWith('**')) {
      runs.push(new TextRun({ text: m.slice(2, -2), font: 'Georgia', size: isQuote ? 21 : 22, bold: true, italics: isQuote, color: baseColor }));
    } else if (m.startsWith('*') && m.endsWith('*')) {
      runs.push(new TextRun({ text: m.slice(1, -1), font: 'Georgia', size: isQuote ? 21 : 22, italics: true, color: baseColor }));
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.substring(lastIndex), font: 'Georgia', size: isQuote ? 21 : 22, color: baseColor, italics: isQuote }));
  }
  return runs.length > 0 ? runs : [new TextRun({ text, font: 'Georgia', size: isQuote ? 21 : 22, color: baseColor, italics: isQuote })];
}

function markdownToDocxParagraphs(markdownText) {
  const paragraphs = [];
  const lines = markdownText.split('\n');
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || /^={5,}|^-{3,}|^\*{3,}$/.test(trimmed)) {
      i++;
      continue;
    }

    // Metadata lines (English & Russian)
    const isMetaTitle = trimmed.startsWith('LECTURE TITLE:') || trimmed.startsWith('НАЗВАНИЕ ЛЕКЦИИ:');
    const isMetaSubtitle = trimmed.startsWith('SUBTITLE:') || trimmed.startsWith('ПОДЗАГОЛОВОК:');
    const isOtherMeta =
      trimmed.startsWith('SPEAKER:') || trimmed.startsWith('ДОКЛАДЧИК:') ||
      trimmed.startsWith('DATE:') || trimmed.startsWith('ДАТА:') ||
      trimmed.startsWith('VENUE:') || trimmed.startsWith('МЕСТО:') ||
      trimmed.startsWith('SOURCE FILE:') || trimmed.startsWith('ИСТОЧНИК:') ||
      trimmed.startsWith('ПОЛНЫЙ ПЕРЕВОД') || trimmed.startsWith('VERBATIM TRANSCRIPT') ||
      trimmed.startsWith('Spark Edition') || trimmed.startsWith('Версия Spark');

    if (isMetaTitle || isMetaSubtitle || isOtherMeta) {
      const colonIdx = trimmed.indexOf(':');
      const label = colonIdx !== -1 ? trimmed.substring(0, colonIdx + 1) : '';
      const val = colonIdx !== -1 ? trimmed.substring(colonIdx + 1).trim() : trimmed;

      if (isMetaTitle) {
        paragraphs.push(new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { before: 200, after: 120 },
          children: [new TextRun({ text: val, bold: true, size: 36, color: '7C2D12', font: 'Georgia' })]
        }));
      } else if (isMetaSubtitle) {
        paragraphs.push(new Paragraph({
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: val, italics: true, size: 24, color: '475569', font: 'Georgia' })]
        }));
      } else {
        paragraphs.push(new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            ...(label ? [new TextRun({ text: `${label} `, bold: true, size: 20, color: '64748B', font: 'Georgia' })] : []),
            new TextRun({ text: val, size: 20, color: '334155', font: 'Georgia' })
          ]
        }));
      }
      i++;
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 180 },
        children: [new TextRun({ text: trimmed.replace(/^#\s+/, ''), bold: true, size: 32, color: '7C2D12', font: 'Georgia' })]
      }));
      i++;
      continue;
    }

    // Chapter Headings with Timestamps
    const headingMatch = trimmed.match(/^(?:##\s+)?(\[?\d{1,2}:\d{2}(?::\d{2})?\]?)\s*(.*)$/);
    if (headingMatch && (headingMatch[1].startsWith('[') || headingMatch[2].length > 0 || (i + 1 < lines.length && lines[i + 1].trim().length > 0))) {
      let timestamp = headingMatch[1];
      if (!timestamp.startsWith('[')) timestamp = `[${timestamp}]`;
      let title = headingMatch[2] || '';

      if (!title && i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].trim().startsWith('[')) {
        i++;
        title = lines[i].trim();
      }

      const isHeadingCandidate =
        trimmed.startsWith('##') ||
        (title.length > 0 && (title === title.toUpperCase() || /^[\p{Lu}0-9\s:—\-,'()]+$/u.test(title)));

      if (isHeadingCandidate && title.length > 0) {
        paragraphs.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 140 },
          children: [
            new TextRun({ text: `${timestamp} `, bold: true, size: 22, color: 'B45309', font: 'Georgia' }),
            new TextRun({ text: title, bold: true, size: 24, color: '1E293B', font: 'Georgia' })
          ]
        }));
        i++;
        continue;
      }
    }

    // Blockquotes / Verses
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      quoteLines.forEach((qLine, idx) => {
        const isAttribution = qLine.startsWith('—') || qLine.startsWith('--');
        paragraphs.push(new Paragraph({
          border: { left: { color: 'D97706', space: 14, style: BorderStyle.SINGLE, size: 24 } },
          shading: { type: ShadingType.CLEAR, fill: 'FAF7F2' },
          indent: { left: 400, right: 300 },
          spacing: { before: idx === 0 ? 140 : 40, after: idx === quoteLines.length - 1 ? 160 : 40, line: 280 },
          children: parseInlineRuns(qLine, isAttribution ? '78350F' : '1E293B', !isAttribution)
        }));
      });
      continue;
    }

    // Bullet points
    if (/^[•\-\*]\s+/.test(trimmed)) {
      paragraphs.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 60, after: 60, line: 276 },
        children: parseInlineRuns(trimmed.replace(/^[•\-\*]\s+/, ''))
      }));
      i++;
      continue;
    }

    // Standard body paragraph
    paragraphs.push(new Paragraph({
      spacing: { before: 80, after: 160, line: 280 },
      children: parseInlineRuns(trimmed)
    }));
    i++;
  }

  return paragraphs;
}

async function saveDocxFile(markdownContent, outputPath) {
  const paragraphs = markdownToDocxParagraphs(markdownContent);
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Georgia', size: 22, color: '1E293B' },
          paragraph: { spacing: { line: 280, after: 140 } }
        }
      }
    },
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: paragraphs
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Russian Word .docx successfully saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function streamTranslateWithGemini(text) {
  const prompt = `You are a master Vedic scholar, theological editor, and senior literary translator of Gaudiya Vaishnava discourses (in the revered tradition of Śrīla Prabhupāda and classical ācāryas).

Your task is to translate the provided English lecture into fluent, natural, philosophically rigorous, and literary Russian (Spark Master Translation Standard).

CRITICAL TRANSLATION & EDITORIAL PRINCIPLES:
1. DEEP CONTEXT & SENSE OVER MECHANICAL LITERALISM:
   - Do NOT produce mechanical word-for-word translation. Reflect the speaker's true thought, philosophical depth, and spiritual gravitas.
   - Use natural Russian syntax, rich vocabulary, and appropriate theological nuance. The language should read as an authoritative published book.

2. PRESERVE & TRANSLATE PUBLICATION STRUCTURE:
   - At the beginning, output the metadata block in Russian:
НАЗВАНИЕ ЛЕКЦИИ: Принцип счастья: ведическая мудрость и современная наука
ПОДЗАГОЛОВОК: Наука о сознании, нейропластичность и три гуны материальной природы
ДОКЛАДЧИК: Шри Прем Прайоджан Прабху
ДАТА: Публичный философский семинар
МЕСТО: Практическая философия и сравнительный анализ

================================================================================
ПОЛНЫЙ ПЕРЕВОД ЛЕКЦИИ НА РУССКИЙ ЯЗЫК (С СОХРАНЕНИЕМ САНСКРИТСКОЙ ТЕРМИНОЛОГИИ)
================================================================================

   - Translate all chapter headings with timestamps into Russian in ALL CAPS:
     [00:00:00] ВВЕДЕНИЕ: ВСЕОБЩИЙ ПОИСК СЧАСТЬЯ
     [00:04:12] ПРИРОДА ДУШИ: СОЗНАНИЕ ВНЕ МАТЕРИИ
     [00:11:30] ДХАРМА ДУШИ И ТРИ МАТЕРИАЛЬНЫЕ ОБОЛОЧКИ
     [00:23:45] ИСТИННАЯ КУЛЬТУРА ПРОТИВ ГЕДОНИЗМА
     [00:30:15] ФИЗИОЛОГИЯ АНАНДЫ: ЙОГА, ПРАНАЯМА И ТОНКИЕ КАНАЛЫ (НАДИ)
     [00:41:00] ТРИ ГУНЫ ПРИРОДЫ И ТИПОЛОГИЯ СЧАСТЬЯ
     [00:50:20] НЕЙРОБИОЛОГИЯ И НЕЙРОПЛАСТИЧНОСТЬ: СИСТЕМА ВОЗНАГРАЖДЕНИЯ МОЗГА
     [01:05:15] ВЛИЯНИЕ ПИТАНИЯ НА СОЗНАНИЕ
     [01:14:00] ОБЩЕСТВЕННЫЕ ПАРАДИГМЫ: ФИНАНСОВО-ПОТРЕБИТЕЛЬСКАЯ МОДЕЛЬ И ВЕДИЧЕСКАЯ МОДЕЛЬ

3. ACCURATE GAUDIYA VAISHNAVA SIDDHANTA & TERMINOLOGY:
   - jīva / ātmā -> джива / атма (индивидуальная душа, вечная частица сознания)
   - Paramātmā / Supersoul -> Параматма (Сверхдуша)
   - Bhagavān -> Бхагаван (Верховная Личность Бога)
   - kartṛtva -> картритва (способность действовать)
   - jñātṛtva -> джнятритва (способность познавать)
   - bhoktṛtva -> бхоктритва (способность переживать опыт и испытывать радость)
   - guṇa / gunas -> гуны материальной природы (саттва-гуна — благость, раджо-гуна — страсть, тамо-гуна — невежество)
   - śuddha-sattva -> шуддха-саттва (чистая духовная благость)
   - ānanda -> ананда (трансцендентное блаженство)
   - buddhi, manas, ahaṅkāra -> буддхи (разум), манас (ум), аханкара (ложное эго)
   - prāṇa, nāḍīs -> прана (жизненная энергия), нади (72 000 тонких энергетических каналов)
   - saṁskāras -> самскары (глубинные подсознательные отпечатки прошлого опыта)
   - sādhana -> садхана (регулярная духовная практика)
   - brāhmaṇas -> брахманы (духовные и интеллектуальные наставники общества)
   - kīrtana -> киртан (совместное воспевание святых имен)
   - śāstra / darśana -> шастры (священные писания) / даршаны (философские системы)

4. NEUROSCIENCE & SCIENTIFIC PRECISION:
   - neuroplasticity -> нейропластичность мозга
   - reward system -> система вознаграждения мозга
   - mesolimbic pathway -> мезолимбический дофаминовый путь
   - ventral tegmental area (VTA) -> вентральная область покрышки (VTA)
   - nucleus accumbens -> прилежащее ядро (nucleus accumbens)
   - ventral striatum -> вентральный стриатум
   - receptors downregulation / desensitization -> десенситизация и редукция рецепторов
   - tolerance, habituation, withdrawal -> толерантность (привыкание), зависимость и синдром отмены
   - emergent property -> эмерджентное свойство (материи)

5. SCRIPTURAL VERSES (ŚLOKAS):
   Format verses cleanly in blockquotes with Sanskrit in italics and Russian translation:
> *nityo nityānāṁ cetanaś cetanānām eko bahūnāṁ yo vidadhāti kāmān*
> — **Катха-упанишад 2.2.13**
> «Среди всех вечных существ есть одно Высшее Вечное; среди всех сознающих существ есть одно Высшее Сознающее. Будучи единым, Господь исполняет желания бесчисленного множества живых существ».

> *yad agre viṣam iva pariṇāme ’mṛtopamam*
> *tat sukhaṁ sāttvikaṁ proktam ātma-buddhi-prasādajam*
> — **Бхагавад-гита 18.37**
> «То, что вначале подобно яду, но в конце обращается в чистый нектар, и что пробуждает человека к осознанию своей истинной природы, называют счастьем в гуне благости (саттве)».

6. HIGHLIGHT KEY ANALOGIES & BULLET POINTS:
   **Аналогия ста тысяч слепцов:** ...
   **Аналогия двух пассажиров самолета:** ...
   **Аналогия перископа подводной лодки:** ...

Do not summarize. Render the complete, profound discourse.

Document to translate:
\n\n` + text;

  const rawUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent?alt=sse&key=' + API_KEY;
  const proxyUrl = GATEWAY_URL + encodeURIComponent(rawUrl);

  console.log('📡 Streaming request to Gemini via Frankfurt Gateway (SSE)...');
  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 65536 }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Translation API error: HTTP ${res.status} ${err}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulated = '';
  let buffer = '';

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
          if (parts) {
            for (const p of parts) {
              if (p.text && !p.thought) {
                accumulated += p.text;
                process.stdout.write(p.text);
              }
            }
          }
        }
      } catch {}
    }
  }

  return accumulated;
}

async function main() {
  console.log('🚀 Loading English Spark document...');
  const text = fs.readFileSync(INPUT_MD, 'utf-8');
  console.log(`📖 Input length: ${text.length} chars.`);

  console.log('🌐 Streaming translation into Russian Master Spark Standard...');
  const russianSpark = await streamTranslateWithGemini(text);

  console.log(`\n\n✅ Translation completed! Output length: ${russianSpark.length} chars.`);
  fs.writeFileSync(OUTPUT_RU_MD, russianSpark, 'utf-8');
  console.log(`💾 Russian Markdown saved: ${OUTPUT_RU_MD}`);

  console.log('📑 Building styled Microsoft Word (.docx) document...');
  await saveDocxFile(russianSpark, OUTPUT_RU_DOCX);

  console.log(`🖥️ Opening "${OUTPUT_RU_DOCX}" on macOS screen...`);
  execSync(`open "${OUTPUT_RU_DOCX}"`);
  console.log('🌟 All done! Document is now open on the user screen.');
}

main().catch(console.error);
