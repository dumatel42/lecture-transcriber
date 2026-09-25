const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Launching Chrome browser via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });

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
    console.log(`✅ Page Title: "${title}"`);

    // Attach audio file
    const audioFilePath = '/Users/alex/Downloads/London 2026 6th Sept. bhakti in a digital age.mp3';
    console.log(`📁 Attaching file: ${audioFilePath} (${(fs.statSync(audioFilePath).size / 1024 / 1024).toFixed(1)} MB)...`);

    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('Could not find file input element');
    await fileInput.uploadFile(audioFilePath);

    console.log('⏳ Waiting 2s for audio metadata detection...');
    await new Promise(r => setTimeout(r, 2000));

    // Find Start button
    console.log('🔍 Looking for Start Transcription button...');
    let startBtn = null;
    for (let i = 0; i < 15; i++) {
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

    if (!startBtn) throw new Error('Start Transcription button did not become available.');

    console.log('▶️ Clicking "Start Transcription"...');
    await startBtn.click();

    // Now monitor the entire pipeline
    let isComplete = false;
    let lastProgressMsg = '';
    let lastCharCount = 0;
    let stagnationCounter = 0;
    const startTime = Date.now();

    console.log('📡 Monitoring live pipeline progress across all parts...');

    while (!isComplete) {
      await new Promise(r => setTimeout(r, 6000));
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);

      const status = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        // Check for error messages
        const errorEl = document.querySelector('.text-rose-300, .text-rose-400');
        const errorMessage = errorEl ? errorEl.textContent : null;

        // Extract progress text
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
        const completed = bodyText.includes('All parts successfully transcribed') || (bodyText.includes('Completed') && bodyText.includes('Download .TXT'));

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
        console.error(`❌ Error detected in browser UI: ${status.errorMessage}`);
      }

      if (status.progressMsg !== lastProgressMsg || Math.abs(status.transcriptLength - lastCharCount) > 50) {
        console.log(`⏱️ [${elapsedSec}s] Status: "${status.progressMsg || 'Working...'}" | Text: ${status.transcriptLength} chars`);
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
        console.log(`\n🎉 All parts successfully completed!`);
        console.log(`📊 Final Length: ${status.transcriptLength} characters (${status.fullTranscript.split(/\s+/).length} words).`);

        const outputPath = '/Users/alex/Downloads/London 2026 6th Sept. bhakti in a digital age_VERIFIED_RESULT.md';
        fs.writeFileSync(outputPath, status.fullTranscript, 'utf-8');
        console.log(`💾 Saved complete verified transcript to: ${outputPath}`);
        isComplete = true;
        break;
      }

      // Safeguard: if stagnant for more than 5 minutes
      if (stagnationCounter > 50) {
        console.log('⚠️ Stagnation detected over 5 minutes. Snapshot captured.');
        if (status.transcriptLength > 5000) {
          const outputPath = '/Users/alex/Downloads/London 2026 6th Sept. bhakti in a digital age_VERIFIED_RESULT.md';
          fs.writeFileSync(outputPath, status.fullTranscript, 'utf-8');
          console.log(`💾 Saved transcript snapshot to: ${outputPath}`);
        }
        break;
      }
    }

  } catch (err) {
    console.error('Fatal error during test run:', err);
  } finally {
    await browser.close();
    console.log('🛑 Browser closed.');
  }
}

main();
