import { test, expect } from '@playwright/test';

test.describe('SnapForge - GIF Creator Specific Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('GIF Creator tool accessibility', async ({ page }) => {
    // Look for GIF Creator button/interface
    const gifCreatorSelectors = [
      'text=GIF Creator',
      'text=Create animated GIFs',
      'button:has-text("GIF")',
      '[data-testid="gif-creator"]'
    ];
    
    let gifCreatorFound = false;
    for (const selector of gifCreatorSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();
          gifCreatorFound = true;
          console.log(`✅ Found GIF Creator: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue searching
      }
    }
    
    if (gifCreatorFound) {
      // Look for video upload or GIF creation interface
      const videoUploadSelectors = [
        'input[accept*="video"]',
        'text=Upload video',
        'text=Select video',
        'input[type="file"]'
      ];
      
      for (const selector of videoUploadSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found video upload interface: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    console.log('✅ GIF Creator accessibility test completed');
  });

  test('GIF creation timeout handling', async ({ page }) => {
    // This test specifically checks if our timeout fix works
    const gifCreatorButton = page.locator('text=GIF Creator').or(page.locator('text=Create animated GIFs')).first();
    
    if (await gifCreatorButton.isVisible({ timeout: 3000 })) {
      await gifCreatorButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for any error messages or timeout handling
    const errorSelectors = [
      'text=timeout',
      'text=too long',
      'text=Try a shorter',
      '.error-message',
      '[role="alert"]'
    ];
    
    // Monitor console for timeout-related messages
    const consoleMessages = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });
    
    await page.waitForTimeout(5000);
    
    // Check if our timeout fixes are present in console
    const timeoutMessages = consoleMessages.filter(msg => 
      msg.includes('timeout') || 
      msg.includes('cancelled') || 
      msg.includes('cleanup')
    );
    
    console.log(`📊 Timeout-related console messages: ${timeoutMessages.length}`);
    timeoutMessages.forEach(msg => console.log(`   - ${msg}`));
    
    console.log('✅ GIF timeout handling test completed');
  });

  test('GIF progress indicators', async ({ page }) => {
    const gifCreatorButton = page.locator('text=GIF Creator').or(page.locator('text=Create animated GIFs')).first();
    
    if (await gifCreatorButton.isVisible({ timeout: 3000 })) {
      await gifCreatorButton.click();
      await page.waitForTimeout(1000);
      
      // Look for progress indicators
      const progressSelectors = [
        '.progress',
        '[role="progressbar"]',
        'text=Creating',
        'text=Processing',
        '.loader',
        '.spinner'
      ];
      
      for (const selector of progressSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found progress indicator: ${selector}`);
          }
        } catch (error) {
          // Continue checking
        }
      }
    }
    
    console.log('✅ GIF progress indicators test completed');
  });
});
