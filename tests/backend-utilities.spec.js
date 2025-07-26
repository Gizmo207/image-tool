import { test, expect } from '@playwright/test';

test.describe('SnapForge - Backend Utilities Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Bulletproof GIF Creator utility availability', async ({ page }) => {
    // Check if our bulletproof GIF creator is available in the browser
    const utilityCheck = await page.evaluate(() => {
      // Check if bulletproofGifCreator module is loaded
      const scripts = Array.from(document.scripts);
      const hasGifCreator = scripts.some(script => 
        script.src.includes('bulletproofGifCreator') || 
        script.innerHTML.includes('bulletproofGifCreator')
      );
      
      return {
        hasGifCreator,
        hasGifshot: typeof window.gifshot !== 'undefined',
        hasCanvas: !!document.createElement('canvas').getContext,
        hasVideo: !!document.createElement('video').canPlayType,
        scriptsCount: scripts.length
      };
    });
    
    console.log('🔧 Utility Check Results:');
    console.log(`   - GIF Creator Module: ${utilityCheck.hasGifCreator ? '✅' : '❌'}`);
    console.log(`   - Gifshot Library: ${utilityCheck.hasGifshot ? '✅' : '❌'}`);
    console.log(`   - Canvas Support: ${utilityCheck.hasCanvas ? '✅' : '❌'}`);
    console.log(`   - Video Support: ${utilityCheck.hasVideo ? '✅' : '❌'}`);
    console.log(`   - Total Scripts: ${utilityCheck.scriptsCount}`);
    
    // Canvas and Video support are critical
    expect(utilityCheck.hasCanvas).toBe(true);
    expect(utilityCheck.hasVideo).toBe(true);
    
    console.log('✅ Backend utilities check completed');
  });

  test('Background removal utility check', async ({ page }) => {
    // Upload an image first
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/transparency.png');
    await page.waitForTimeout(2000);
    
    // Check for background removal utilities in console
    const consoleMessages = [];
    page.on('console', (msg) => {
      if (msg.text().includes('background') || msg.text().includes('removal')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Try to trigger background removal
    const bgRemovalButton = page.locator('text=Remove Background').or(page.locator('text=Background Removal')).first();
    if (await bgRemovalButton.isVisible({ timeout: 3000 })) {
      await bgRemovalButton.click();
      await page.waitForTimeout(3000);
    }
    
    console.log(`📊 Background removal console messages: ${consoleMessages.length}`);
    consoleMessages.forEach(msg => console.log(`   - ${msg}`));
    
    console.log('✅ Background removal utility check completed');
  });

  test('Image processor utilities', async ({ page }) => {
    // Check if image processing utilities are available
    const processorCheck = await page.evaluate(() => {
      return {
        hasFileReader: !!window.FileReader,
        hasURL: !!window.URL,
        createObjectURL: !!window.URL.createObjectURL,
        hasLocalStorage: !!window.localStorage,
        hasImageConstructor: !!window.Image
      };
    });
    
    console.log('🖼️ Image Processor Check:');
    console.log(`   - FileReader: ${processorCheck.hasFileReader ? '✅' : '❌'}`);
    console.log(`   - URL API: ${processorCheck.hasURL ? '✅' : '❌'}`);
    console.log(`   - Object URL: ${processorCheck.createObjectURL ? '✅' : '❌'}`);
    console.log(`   - LocalStorage: ${processorCheck.hasLocalStorage ? '✅' : '❌'}`);
    console.log(`   - Image Constructor: ${processorCheck.hasImageConstructor ? '✅' : '❌'}`);
    
    // All of these should be available in modern browsers
    expect(processorCheck.hasFileReader).toBe(true);
    expect(processorCheck.hasURL).toBe(true);
    expect(processorCheck.createObjectURL).toBe(true);
    
    console.log('✅ Image processor utilities check completed');
  });

  test('Usage limiter and trial system', async ({ page }) => {
    // Check if usage limiter is available and working
    const usageLimiterCheck = await page.evaluate(() => {
      return {
        hasUsageLimiter: !!window.usageLimiter,
        hasLocalStorage: !!window.localStorage,
        trialData: localStorage.getItem('snapforge_trial_usage')
      };
    });
    
    console.log('🎯 Usage Limiter Check:');
    console.log(`   - Usage Limiter Available: ${usageLimiterCheck.hasUsageLimiter ? '✅' : '❌'}`);
    console.log(`   - LocalStorage: ${usageLimiterCheck.hasLocalStorage ? '✅' : '❌'}`);
    console.log(`   - Trial Data Present: ${usageLimiterCheck.trialData ? '✅' : '❌'}`);
    
    // Look for dev reset button (our testing utility)
    const devResetButton = page.locator('text=Dev Reset').or(page.locator('[data-testid="dev-reset"]')).first();
    if (await devResetButton.isVisible({ timeout: 2000 })) {
      console.log('✅ Dev Reset button found (testing utility available)');
      
      // Test the dev reset functionality
      await devResetButton.click();
      await page.waitForTimeout(1000);
      
      // Check if trial was reset
      const afterResetCheck = await page.evaluate(() => {
        return localStorage.getItem('snapforge_trial_usage');
      });
      
      console.log(`   - Trial data after reset: ${afterResetCheck ? 'Still present' : 'Cleared ✅'}`);
    }
    
    console.log('✅ Usage limiter and trial system check completed');
  });
});
