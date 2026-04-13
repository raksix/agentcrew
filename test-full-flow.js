const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1400, height: 900 });
  
  console.log('1. Navigating to app...');
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/01-homepage.png', fullPage: false });
  
  console.log('2. Clicking "New Session" button...');
  await page.click('button:has-text("+ New Session")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/02-new-session-modal.png', fullPage: false });
  
  console.log('3. Filling session name...');
  await page.fill('input[placeholder="My Agent Session"]', 'Test Session');
  await page.fill('input[placeholder="e.g., sooliva, finder"]', 'test-project');
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/03-filled-form.png', fullPage: false });
  
  console.log('4. Clicking Create...');
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/04-session-created.png', fullPage: false });
  
  console.log('5. Chat interface visible...');
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/05-chat-ready.png', fullPage: true });
  
  console.log('6. Typing a message...');
  await page.fill('textarea[placeholder*="Type your message"]', 'Hello! Run a simple ls command.');
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/06-message-typed.png', fullPage: true });
  
  console.log('7. Sending message...');
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/07-message-sent.png', fullPage: true });
  
  // Wait a bit more for streaming
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshots/08-after-send.png', fullPage: true });
  
  await browser.close();
  console.log('All screenshots saved!');
})();