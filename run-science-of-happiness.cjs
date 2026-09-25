const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, ShadingType } = docx;

const AUDIO_PATH = '/Users/alex/Downloads/Nauka_Schastya_Sri_Prem_Prayojan.mp3';
const OUTPUT_MD = '/Users/alex/Downloads/Nauka_Schastya_Sri_Prem_Prayojan_SPARK.md';
const OUTPUT_DOCX = '/Users/alex/Downloads/Nauka_Schastya_Sri_Prem_Prayojan_SPARK.docx';

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

    if (
      trimmed.startsWith('LECTURE TITLE:') ||
      trimmed.startsWith('SUBTITLE:') ||
      trimmed.startsWith('SPEAKER:') ||
      trimmed.startsWith('DATE:') ||
      trimmed.startsWith('VENUE:') ||
      trimmed.startsWith('SOURCE FILE:')
    ) {
      const colonIdx = trimmed.indexOf(':');
      const label = trimmed.substring(0, colonIdx + 1);
      const val = trimmed.substring(colonIdx + 1).trim();

      if (label.startsWith('LECTURE TITLE')) {
        paragraphs.push(new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { before: 200, after: 120 },
          children: [new TextRun({ text: val, bold: true, size: 36, color: '7C2D12', font: 'Georgia' })]
        }));
      } else if (label.startsWith('SUBTITLE')) {
        paragraphs.push(new Paragraph({
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: val, italics: true, size: 24, color: '475569', font: 'Georgia' })]
        }));
      } else {
        paragraphs.push(new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({ text: `${label} `, bold: true, size: 20, color: '64748B', font: 'Georgia' }),
            new TextRun({ text: val, size: 20, color: '334155', font: 'Georgia' })
          ]
        }));
      }
      i++;
      continue;
    }

    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 180 },
        children: [new TextRun({ text: trimmed.replace(/^#\s+/, ''), bold: true, size: 32, color: '7C2D12', font: 'Georgia' })]
      }));
      i++;
      continue;
    }

    const headingMatch = trimmed.match(/^(?:##\s+)?(\[\d{1,2}:\d{2}(?::\d{2})?\])\s*(.*)$/);
    if (headingMatch && (trimmed.startsWith('##') || /^[A-Z0-9\s:—\-,'()]+$/.test(headingMatch[2]))) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 140 },
        children: [
          new TextRun({ text: `${headingMatch[1]} `, bold: true, size: 22, color: 'B45309', font: 'Georgia' }),
          new TextRun({ text: headingMatch[2] || '', bold: true, size: 24, color: '1E293B', font: 'Georgia' })
        ]
      }));
      i++;
      continue;
    }

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

    if (/^[•\-\*]\s+/.test(trimmed)) {
      paragraphs.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 60, after: 60, line: 276 },
        children: parseInlineRuns(trimmed.replace(/^[•\-\*]\s+/, ''))
      }));
      i++;
      continue;
    }

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
  console.log(`✅ Word .docx successfully saved to: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('🚀 Starting end-to-end verification for "Наука счастья - Шри Прем Прайоджан"...');
  console.log(`📁 Audio file: ${AUDIO_PATH} (${(fs.statSync(AUDIO_PATH).size / 1024 / 1024).toFixed(1)} MB)`);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: '/Users/alex/Downloads'
    });

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Download the React DevTools')) return;
      console.log(`[Browser Console ${msg.type()}]: ${text}`);
    });

    page.on('pageerror', err => {
      console.error('[Browser Page Error]:', err.message);
    });

    console.log('🌐 Opening https://lecture-transcriber-eta.vercel.app ...');
    await page.goto('https://lecture-transcriber-eta.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });

    const title = await page.title();
    console.log(`✅ Connected to: "${title}"`);

    // Attach audio file
    console.log('📁 Attaching audio file to web uploader...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    await fileInput.uploadFile(AUDIO_PATH);

    console.log('⏳ Waiting 4s for audio metadata analysis and chunk slicing...');
    await new Promise(r => setTimeout(r, 4000));

    // Find and click "Start Transcription"
    console.log('🔍 Looking for Start Transcription button...');
    let startBtn = null;
    for (let i = 0; i < 20; i++) {
      const buttons = await page.$$('button');
      for (const b of buttons) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && text.includes('Start Transcription')) {
          startBtn = b;
          break;
        }
      }
      if (startBtn) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!startBtn) throw new Error('Start Transcription button not found');

    console.log('▶️ Clicking "Start Transcription"...');
    await startBtn.click();

    // Monitor pipeline across all chunks
    let isTranscriptionComplete = false;
    let lastProgressMsg = '';
    let lastCharCount = 0;
    let stagnationCounter = 0;
    const startTime = Date.now();

    console.log('📡 Monitoring multi-part chunk processing & streaming transcription...');

    while (!isTranscriptionComplete) {
      await new Promise(r => setTimeout(r, 5000));
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);

      const status = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const errorEl = document.querySelector('.text-rose-300, .text-rose-400');
        const errorMessage = errorEl ? errorEl.textContent : null;

        let progressMsg = '';
        const allTextNodes = Array.from(document.querySelectorAll('div, p, span'));
        for (const el of allTextNodes) {
          const t = (el.textContent || '').trim();
          if (t.includes('Part ') || t.startsWith('Uploading') || t.includes('Activating') || t.startsWith('Engine:') || t.includes('Transcribing') || t.includes('All parts') || t.includes('complete')) {
            progressMsg = t;
            break;
          }
        }

        const viewer = document.querySelector('.whitespace-pre-wrap');
        const transcriptText = viewer ? viewer.textContent || '' : '';
        const completed = bodyText.includes('All parts successfully transcribed') || bodyText.includes('Transcription 100% Complete');

        return {
          progressMsg,
          errorMessage,
          transcriptLength: transcriptText.length,
          transcriptSnippet: transcriptText.slice(-200),
          fullTranscript: transcriptText,
          completed
        };
      });

      if (status.errorMessage) {
        console.error(`❌ UI Error: ${status.errorMessage}`);
      }

      if (status.progressMsg !== lastProgressMsg || Math.abs(status.transcriptLength - lastCharCount) > 40) {
        console.log(`⏱️ [${elapsedSec}s] Status: "${status.progressMsg || 'Working...'}" | Transcript: ${status.transcriptLength} chars`);
        if (status.transcriptLength > lastCharCount) {
          console.log(`   📝 Tail: "...${status.transcriptSnippet.replace(/\n/g, ' ')}"`);
        }
        lastProgressMsg = status.progressMsg;
        lastCharCount = status.transcriptLength;
        stagnationCounter = 0;
      } else {
        stagnationCounter++;
      }

      if (status.completed) {
        console.log('\n🎉 Raw transcription complete!');
        console.log(`📊 Transcript Length: ${status.transcriptLength} chars (~${status.fullTranscript.split(/\s+/).length} words).`);
        isTranscriptionComplete = true;
        break;
      }

      if (stagnationCounter > 70) {
        console.log('⚠️ Stagnation threshold reached, proceeding with current text.');
        isTranscriptionComplete = true;
        break;
      }
    }

    // Step 2: Click "✨ Spark Книга"
    console.log('\n✨ Step 2: Triggering Spark Book Formatting...');
    await new Promise(r => setTimeout(r, 2000));

    let sparkBtn = null;
    const currentButtons = await page.$$('button');
    for (const b of currentButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Spark Книга')) {
        sparkBtn = b;
        break;
      }
    }

    if (sparkBtn) {
      console.log('▶️ Clicking "✨ Spark Книга"...');
      await sparkBtn.click();

      // Wait for Spark formatting to finish
      console.log('⏳ Formatting into chapters, quotes, and book layout...');
      let isSparkDone = false;
      let lastSparkLen = 0;
      let sparkStag = 0;

      for (let s = 0; s < 45; s++) {
        await new Promise(r => setTimeout(r, 3000));
        const sparkState = await page.evaluate(() => {
          const body = document.body.innerText;
          const isFormatting = body.includes('Spark Book Structuring') || body.includes('Верстка книги');
          // Check for SparkRenderer element or meta card
          const hasMeta = !!document.querySelector('.prose-print');
          const proseEl = document.querySelector('.prose-print');
          const sparkLen = proseEl ? proseEl.textContent.length : 0;
          return { isFormatting, hasMeta, sparkLen };
        });

        console.log(`   ✨ Spark formatting progress: ${sparkState.sparkLen} chars (formatting: ${sparkState.isFormatting})`);

        if (!sparkState.isFormatting && sparkState.sparkLen > 1000) {
          console.log('✅ Spark book formatting completed!');
          isSparkDone = true;
          break;
        }

        if (sparkState.sparkLen === lastSparkLen && sparkState.sparkLen > 1000) {
          sparkStag++;
          if (sparkStag > 4) {
            console.log('✅ Spark stream concluded.');
            isSparkDone = true;
            break;
          }
        } else {
          lastSparkLen = sparkState.sparkLen;
          sparkStag = 0;
        }
      }
    } else {
      console.warn('Could not locate Spark Книга button, will format raw text directly.');
    }

    // Retrieve final formatted text
    const finalResult = await page.evaluate(() => {
      const prose = document.querySelector('.prose-print');
      const viewer = document.querySelector('.whitespace-pre-wrap');
      return prose ? prose.innerText : (viewer ? viewer.innerText : '');
    });

    console.log(`\n📖 Final Publication Text Length: ${finalResult.length} characters.`);

    // Save Markdown
    fs.writeFileSync(OUTPUT_MD, finalResult, 'utf-8');
    console.log(`💾 Markdown saved to: ${OUTPUT_MD}`);

    // Generate and save Word .DOCX
    await saveDocxFile(finalResult, OUTPUT_DOCX);

    // Open file on user's screen
    console.log(`🖥️ Opening "${OUTPUT_DOCX}" on macOS screen...`);
    execSync(`open "${OUTPUT_DOCX}"`);
    console.log('🌟 File successfully opened in Microsoft Word / Pages!');

  } catch (err) {
    console.error('Fatal error during pipeline:', err);
  } finally {
    await browser.close();
    console.log('🛑 Browser closed.');
  }
}

main();
