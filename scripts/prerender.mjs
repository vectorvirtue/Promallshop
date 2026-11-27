import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const BASE_URL = 'http://127.0.0.1:4173';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const excludedRoutes = [
  '/login',
  '/signup',
  '/dashboard',
  '/cart',
  '/checkout',
  '/forgotpassword',
];

let preview;
let browser;

async function waitForPreview(url, timeout = 60000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Preview server is still starting.
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Vite preview server failed to start.');
}

function getRoutesFromSitemap(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];

  return matches
    .map(match => {
      const url = match[1].trim();
      return new URL(url).pathname;
    })
    .filter(route => !excludedRoutes.includes(route.replace(/\/$/, '')));
}

function getOutputPath(route) {
  const cleanRoute = decodeURIComponent(route).replace(/^\/+|\/+$/g, '');

  if (!cleanRoute) {
    return path.join(DIST, 'index.html');
  }

  return path.join(DIST, cleanRoute, 'index.html');
}

async function prerenderRoute(page, route) {
  const url = `${BASE_URL}${route}`;

  console.log(`Rendering: ${route}`);

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // Allow React, API data and Helmet metadata to finish rendering.
  await new Promise(resolve => setTimeout(resolve, 3000));

  const html = await page.content();
  const outputPath = getOutputPath(route);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');

  console.log(`Saved: ${outputPath}`);
}

async function main() {
  console.log('Starting Vite preview...');

  preview = spawn(
    'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    [],
    {
      cwd: ROOT,
      shell: true,
      stdio: 'ignore',
    }
  );

  await waitForPreview(`${BASE_URL}/`);

  console.log('Preview server is ready.');
  console.log('Launching Chrome...');

  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  const sitemapResponse = await fetch(`${BASE_URL}/sitemap.xml`);

  if (!sitemapResponse.ok) {
    throw new Error('Could not load sitemap.xml from preview.');
  }

  const sitemapXml = await sitemapResponse.text();
  const routes = getRoutesFromSitemap(sitemapXml);

  console.log(`Found ${routes.length} sitemap routes.`);

  for (const route of routes) {
    try {
      await prerenderRoute(page, route);
    } catch (error) {
      console.error(`Failed route: ${route}`, error.message);
    }
  }

  console.log('Prerendering completed.');
}

main()
  .catch(error => {
    console.error('Prerender error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    if (preview) preview.kill();
  });
