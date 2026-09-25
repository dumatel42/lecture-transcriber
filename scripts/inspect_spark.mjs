// scripts/inspect_spark.mjs
import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function main() {
  console.log('1. Launching Google Chrome via Puppeteer with Profile 3...');
  
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: '/Users/alex/Library/Application Support/Google/Chrome',
    headless: false,
    defaultViewport: null,
    args: [
      '--profile-directory=Profile 3',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-allow-origins=*'
    ]
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  
  console.log('2. Navigating to gemini.google.com/app/gems...');
  await page.goto('https://gemini.google.com/app/gems', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));

  const title = await page.title();
  const currentUrl = page.url();
  console.log(`Page Loaded: ${title} (${currentUrl})`);

  // Take screenshot of Gems page
  await page.screenshot({ path: '/tmp/gemini_gems_page.png' });
  console.log('Saved screenshot to /tmp/gemini_gems_page.png');

  // Find all links or text containing Spark
  const pageData = await page.evaluate(() => {
    const text = document.body.innerText;
    const elements = Array.from(document.querySelectorAll('*'));
    const sparkElements = elements.filter(el => {
      const t = el.innerText || '';
      return t.toLowerCase().includes('spark') || t.toLowerCase().includes('спарк');
    }).map(el => ({
      tagName: el.tagName,
      className: el.className,
      text: (el.innerText || '').slice(0, 100),
      href: el.getAttribute('href') || el.closest('a')?.getAttribute('href')
    }));

    return {
      bodySnippet: text.slice(0, 1500),
      sparkElements: sparkElements.slice(0, 20)
    };
  });

  console.log('--- PAGE BODY SNIPPET ---');
  console.log(pageData.bodySnippet);
  console.log('--- SPARK ELEMENTS FOUND ---');
  console.log(JSON.stringify(pageData.sparkElements, null, 2));

  fs.writeFileSync('/tmp/spark_inspection_data.json', JSON.stringify(pageData, null, 2));

  const sparkLink = pageData.sparkElements.find(e => e.href && (e.href.includes('gem') || e.href.includes('spark')));
  if (sparkLink) {
    console.log(`Found direct Spark link: ${sparkLink.href}`);
    await page.goto(new URL(sparkLink.href, currentUrl).href, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: '/tmp/spark_details_page.png' });
  }

  console.log('Inspection complete. Data saved.');
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
