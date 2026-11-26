// NestEgg — take the entry's screenshots with Playwright (Chromium).
// Serves app/ on a local port, opens each page, waits for the render, and
// saves a real screenshot of the site's own code. Run: `node shots.mjs`

import { spawn } from 'node:child_process';
import { chromium } from '/home/hatch/workspace/makefun/gta6-01/test/node_modules/playwright/index.mjs';

const PORT = 8091;
const BASE = `http://localhost:${PORT}`;

const server = spawn(process.execPath, ['serve.ts', '--port', String(PORT)], {
  cwd: new URL('.', import.meta.url).pathname,
  stdio: 'pipe',
});

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(BASE + '/index.html');
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('server did not come up');
}

const SHOTS = [
  { file: 'screenshots/01-dashboard.png', url: BASE + '/#/dashboard', width: 1280, height: 800 },
  { file: 'screenshots/02-budget.png', url: BASE + '/#/budget', width: 1280, height: 800 },
  { file: 'screenshots/03-reports.png', url: BASE + '/#/reports', width: 1280, height: 800 },
  { file: 'screenshots/04-mobile-dashboard.png', url: BASE + '/#/dashboard', width: 390, height: 844 },
];

try {
  await waitForServer();
  const browser = await chromium.launch({
    executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
    args: ['--no-sandbox'],
  });
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } });
    await page.goto(shot.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: shot.file });
    console.log('saved', shot.file);
    await page.close();
  }
  await browser.close();
} finally {
  server.kill();
}
