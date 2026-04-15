const { chromium } = require('playwright');

const BASE_URL = 'https://sooliva-hero.fermag.com.tr';
const OUTPUT_DIR = '/root/.openclaw/workspace/screenshots';
const PAGES = [
  { path: '/', name: 'hero-landing' },
  { path: '/login', name: 'hero-login' },
  { path: '/register', name: 'hero-register' },
  { path: '/pricing', name: 'hero-pricing' },
  { path: '/dashboard', name: 'hero-dashboard' },
  { path: '/dashboard/products', name: 'hero-products' },
  { path: '/dashboard/leads/history', name: 'hero-leads' },
  { path: '/dashboard/emails', name: 'hero-emails' },
  { path: '/dashboard/settings', name: 'hero-settings' },
  { path: '/admin', name: 'hero-admin' },
  { path: '/admin/users', name: 'hero-admin-users' },
  { path: '/checkout', name: 'hero-checkout' },
];

async function takeScreenshots() {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  
  for (const page of PAGES) {
    try {
      const p = await context.newPage();
      console.log(`📸 ${page.name}...`);
      await p.goto(BASE_URL + page.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await p.waitForTimeout(2000);
      await p.screenshot({ path: `${OUTPUT_DIR}/${page.name}.png`, fullPage: true });
      console.log(`✅ ${page.name}.png`);
      await p.close();
    } catch (err) {
      console.log(`❌ ${page.name}: ${err.message.substring(0, 80)}`);
    }
  }
  
  await browser.close();
  console.log('\nAll screenshots saved!');
}

takeScreenshots().catch(console.error);