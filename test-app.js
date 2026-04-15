const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('1. Opening AgentCrew...');
  await page.goto('https://agentcrew.fermag.com.tr');
  await page.waitForLoadState('networkidle');
  
  console.log('2. Checking page title...');
  const title = await page.title();
  console.log('   Title:', title);
  
  console.log('3. Looking for + New Session button...');
  const newSessionBtn = page.locator('button:has-text("+ New Session")');
  if (await newSessionBtn.isVisible()) {
    console.log('   ✓ New Session button found');
    
    console.log('4. Clicking New Session...');
    await newSessionBtn.click();
    await page.waitForTimeout(500);
    
    console.log('5. Looking for input...');
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('Playwright Test Session');
    }
    
    console.log('6. Clicking Create...');
    const createBtn = page.locator('button:has-text("Create")').first();
    await createBtn.click();
    await page.waitForTimeout(1000);
  }
  
  console.log('7. Checking for session in sidebar...');
  const sessionItem = page.locator('text=Playwright Test Session');
  if (await sessionItem.isVisible({ timeout: 3000 })) {
    console.log('   ✓ Session created successfully');
    
    console.log('8. Clicking on session...');
    await sessionItem.click();
    await page.waitForTimeout(500);
    
    console.log('9. Looking for chat input...');
    const chatInput = page.locator('textarea').first();
    if (await chatInput.isVisible()) {
      console.log('   ✓ Chat input found');
      
      console.log('10. Typing a message...');
      await chatInput.fill('say hello');
      
      console.log('11. Clicking Send...');
      const sendBtn = page.locator('button:has-text("Send")');
      await sendBtn.click();
      
      console.log('12. Waiting for response...');
      await page.waitForTimeout(3000);
      
      console.log('13. Waiting for completion (10s)...');
      await page.waitForTimeout(10000);
      
      // Check status
      const statusEl = page.locator('text=/idle|done|running|error/').first();
      if (await statusEl.isVisible()) {
        const status = await statusEl.textContent();
        console.log('   → Session status:', status);
      }
    }
  }
  
  console.log('\n✅ Test completed!');
  await browser.close();
})();
