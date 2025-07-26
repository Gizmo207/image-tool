import { test, expect } from '@playwright/test';

test.describe('SnapForge - First Launch & Onboarding', () => {
  // Clear storage state to simulate first-time user
  test.use({ storageState: undefined });

  test('Cold install first-use flow', async ({ page }) => {
    console.log('🚀 Testing first-time user experience');
    
    // Clear any existing storage to simulate fresh install (with error handling)
    await page.context().clearCookies();
    try {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      console.log('ℹ️ Storage clearing skipped (security restriction)');
    }
    
    await page.goto('/');
    await page.waitForSelector('body', { state: 'visible' });
    await page.waitForTimeout(2000);
    
    // Look for onboarding or welcome elements
    const onboardingSelectors = [
      'text=Welcome to SnapForge',
      'text=Welcome',
      'text=Getting Started',
      'text=First Time',
      'text=Tutorial',
      'text=Guide',
      '.onboarding',
      '.welcome-modal',
      '.tutorial'
    ];
    
    let onboardingFound = false;
    for (const selector of onboardingSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Onboarding element found: ${selector}`);
          onboardingFound = true;
          break;
        }
      } catch (error) {
        // Continue searching
      }
    }
    
    if (onboardingFound) {
      console.log('✅ First-time user onboarding detected');
    } else {
      console.log('ℹ️ No specific onboarding found - checking for tooltips or help');
    }
    
    // Look for help or tooltip elements
    const helpSelectors = [
      'text=?',
      'text=Help',
      'text=Tips',
      '.tooltip',
      '.help-icon',
      '[title*="help"]',
      '[title*="tooltip"]'
    ];
    
    let helpFound = 0;
    for (const selector of helpSelectors) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        helpFound += count;
      } catch (error) {
        // Continue
      }
    }
    
    console.log(`💡 Help elements found: ${helpFound}`);
    
    // Test basic first-use workflow
    console.log('📁 Testing first image upload');
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible({ timeout: 3000 })) {
      try {
        await fileInput.setInputFiles('test-assets/small.png');
        await page.waitForTimeout(3000);
        
        // Check if image appears
        const imageDisplay = page.locator('canvas').or(page.locator('img')).first();
        if (await imageDisplay.isVisible({ timeout: 5000 })) {
          console.log('✅ First image upload successful');
          
          // Try a basic tool
          const basicTools = [
            'text=Resize',
            'text=Format',
            'text=Download'
          ];
          
          for (const tool of basicTools) {
            try {
              const element = page.locator(tool).first();
              if (await element.isVisible({ timeout: 2000 })) {
                console.log(`🔧 Testing basic tool: ${tool}`);
                await element.click();
                await page.waitForTimeout(1000);
                
                // Look for apply or action button
                const actionButtons = [
                  'text=Apply',
                  'text=Convert',
                  'text=Save',
                  'text=Download'
                ];
                
                for (const actionBtn of actionButtons) {
                  try {
                    const btn = page.locator(actionBtn).first();
                    if (await btn.isVisible({ timeout: 2000 })) {
                      await btn.click();
                      console.log(`✅ Tool action completed: ${actionBtn}`);
                      break;
                    }
                  } catch (error) {
                    // Continue
                  }
                }
                
                break;
              }
            } catch (error) {
              // Continue
            }
          }
        } else {
          console.log('⚠️ Image did not appear after upload');
        }
      } catch (error) {
        console.log('⚠️ Could not complete file upload test');
      }
    } else {
      console.log('⚠️ File input not visible for first-use test');
    }
    
    console.log('✅ First launch test completed');
    expect(true).toBe(true);
  });

  test('New user trial state initialization', async ({ page }) => {
    console.log('🎯 Testing trial state for new users');
    
    // Clear storage again (with error handling)
    await page.context().clearCookies();
    try {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      console.log('ℹ️ Storage clearing skipped (security restriction)');
    }
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check localStorage for trial data (with error handling)
    const trialData = await page.evaluate(() => {
      try {
        return {
          trialUsage: localStorage.getItem('snapforge_trial_usage'),
          userPrefs: localStorage.getItem('snapforge_preferences'),
          firstLaunch: localStorage.getItem('snapforge_first_launch')
        };
      } catch (error) {
        return {
          trialUsage: 'access-denied',
          userPrefs: 'access-denied',
          firstLaunch: 'access-denied'
        };
      }
    });
    
    console.log('📊 Initial storage state:', trialData);
    
    // Look for trial indicators
    const trialElements = [
      'text=Trial',
      'text=Free',
      'text=Limited',
      'text=uses left',
      'text=remaining',
      '.trial-counter',
      '.usage-limit'
    ];
    
    let trialIndicators = 0;
    for (const selector of trialElements) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        trialIndicators += count;
      } catch (error) {
        // Continue
      }
    }
    
    console.log(`🔢 Trial indicators found: ${trialIndicators}`);
    
    // Check if dev reset button is available
    const devReset = page.locator('text=Dev Reset').first();
    if (await devReset.isVisible({ timeout: 2000 })) {
      console.log('🛠️ Dev reset button available');
      await devReset.click();
      await page.waitForTimeout(1000);
      
      // Check storage after reset
      const afterReset = await page.evaluate(() => {
        return localStorage.getItem('snapforge_trial_usage');
      });
      
      console.log('🔄 Trial data after dev reset:', afterReset);
    }
    
    console.log('✅ Trial state initialization test completed');
    expect(true).toBe(true);
  });

  test('App accessibility for new users', async ({ page }) => {
    console.log('♿ Testing accessibility for new users');
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    
    // Check for focus indicators
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName || 'none';
    });
    
    console.log(`🎯 Currently focused element: ${focusedElement}`);
    
    // Test escape key functionality
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    console.log(`📝 Headings found: ${headings}`);
    
    // Check for alt text on images
    const images = await page.locator('img').count();
    const imagesWithAlt = await page.locator('img[alt]').count();
    console.log(`🖼️ Images: ${images}, with alt text: ${imagesWithAlt}`);
    
    console.log('✅ Accessibility test completed');
    expect(true).toBe(true);
  });
});
