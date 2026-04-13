const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1400, height: 900 });
  
  // Navigate to app
  console.log('Navigating to http://localhost:3005...');
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for content to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshot-1.png', fullPage: false });
  
  // Check if sidebar is visible
  const sidebarText = await page.textContent('body');
  console.log('Page loaded. Content includes:', sidebarText.substring(0, 200));
  
  // Check for elements
  const agentCrewTitle = await page.$('text=AgentCrew');
  console.log('AgentCrew title found:', !!agentCrewTitle);
  
  // Take screenshot of full page
  await page.screenshot({ path: '/root/.openclaw/workspace/agentcrew/screenshot-2-fullpage.png', fullPage: true });
  
  await browser.close();
  console.log('Done! Screenshots saved.');
})();