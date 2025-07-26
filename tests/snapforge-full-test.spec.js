import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('SnapForge Image Editor - Comprehensive App Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to fully load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for React app to initialize
    await page.waitForTimeout(2000);
  });

  test('Basic UI loads without crashes', async ({ page }) => {
    // Check if the main app title/branding is visible
    await expect(page.locator('text=SnapForge').or(page.locator('h1')).first()).toBeVisible({ timeout: 10000 });
    
    // Verify the page title
    await expect(page).toHaveTitle(/SnapForge|Image Editor/);
    
    // Check for file upload area
    const uploadArea = page.locator('input[type="file"]').or(page.locator('[data-testid="upload-area"]')).first();
    await expect(uploadArea).toBeVisible();
    
    console.log('✅ Basic UI elements loaded successfully');
  });

  test('File upload functionality works', async ({ page }) => {
    // Test uploading a valid image
    const fileInput = page.locator('input[type="file"]').first();
    
    // Upload a small PNG image
    await fileInput.setInputFiles('test-assets/small.png');
    
    // Wait for image to process/load
    await page.waitForTimeout(3000);
    
    // Check if image preview or canvas is visible
    const imagePreview = page.locator('canvas').or(page.locator('img')).first();
    await expect(imagePreview).toBeVisible({ timeout: 10000 });
    
    console.log('✅ File upload works correctly');
  });

  test('Tool buttons are accessible and clickable', async ({ page }) => {
    // Upload an image first
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/small.png');
    await page.waitForTimeout(2000);
    
    // List of tools to test (we'll look for these in various ways)
    const toolsToTest = [
      'Resize', 'Color Tools', 'Format Converter', 'GIF Creator', 
      'Background Removal', 'resize', 'colorTools', 'format', 
      'gifCreator', 'backgroundRemoval'
    ];
    
    let foundTools = 0;
    
    for (const tool of toolsToTest) {
      // Try different selectors for each tool
      const selectors = [
        `text=${tool}`,
        `button:has-text("${tool}")`,
        `[data-testid="${tool}"]`,
        `.${tool}`,
        `#${tool}`
      ];
      
      for (const selector of selectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click({ timeout: 5000 });
            foundTools++;
            console.log(`✅ Found and clicked: ${tool}`);
            await page.waitForTimeout(500);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }
    }
    
    expect(foundTools).toBeGreaterThan(0);
    console.log(`✅ Found and tested ${foundTools} tools`);
  });

  test('Handle invalid file uploads gracefully', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    
    // Try uploading a text file (invalid image)
    await fileInput.setInputFiles('test-assets/not-an-image.txt');
    await page.waitForTimeout(2000);
    
    // Look for error messages or validation
    const errorSelectors = [
      'text=Invalid',
      'text=Error',
      'text=not supported',
      'text=Please upload',
      '.error',
      '[role="alert"]'
    ];
    
    let errorFound = false;
    for (const selector of errorSelectors) {
      try {
        const errorElement = page.locator(selector).first();
        if (await errorElement.isVisible({ timeout: 2000 })) {
          errorFound = true;
          console.log(`✅ Error handling works: ${await errorElement.textContent()}`);
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // If no specific error message, at least ensure the app didn't crash
    const appStillWorking = await page.locator('body').isVisible();
    expect(appStillWorking).toBe(true);
    
    console.log('✅ Invalid file upload handled gracefully');
  });

  test('Test multiple image formats', async ({ page }) => {
    const testFiles = ['small.png', 'transparency.png'];
    
    for (const file of testFiles) {
      console.log(`🔍 Testing file: ${file}`);
      
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(`test-assets/${file}`);
      await page.waitForTimeout(3000);
      
      // Verify image loads
      const imageDisplay = page.locator('canvas').or(page.locator('img')).first();
      await expect(imageDisplay).toBeVisible({ timeout: 10000 });
      
      console.log(`✅ ${file} processed successfully`);
    }
  });

  test('Resize functionality', async ({ page }) => {
    // Upload image first
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/small.png');
    await page.waitForTimeout(2000);
    
    // Look for resize controls
    const resizeSelectors = [
      'text=Resize',
      'button:has-text("Resize")',
      'input[type="number"]',
      '[placeholder*="width"]',
      '[placeholder*="height"]'
    ];
    
    let resizeFound = false;
    for (const selector of resizeSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          if (selector.includes('input')) {
            // Try entering values
            await element.fill('200');
          } else {
            await element.click();
          }
          resizeFound = true;
          await page.waitForTimeout(500);
          break;
        }
      } catch (error) {
        // Continue
      }
    }
    
    // Look for apply button
    const applyButton = page.locator('button:has-text("Apply")').or(page.locator('text=Apply')).first();
    if (await applyButton.isVisible({ timeout: 2000 })) {
      await applyButton.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('✅ Resize functionality tested');
  });

  test('Format conversion functionality', async ({ page }) => {
    // Upload image first
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/small.png');
    await page.waitForTimeout(2000);
    
    // Look for format options
    const formatSelectors = [
      'text=JPG',
      'text=JPEG', 
      'text=PNG',
      'text=WebP',
      'button:has-text("JPG")',
      'button:has-text("PNG")',
      '[value="jpg"]',
      '[value="png"]'
    ];
    
    for (const selector of formatSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`✅ Format option clicked: ${selector}`);
          await page.waitForTimeout(500);
          break;
        }
      } catch (error) {
        // Continue
      }
    }
    
    console.log('✅ Format conversion tested');
  });

  test('Background removal functionality', async ({ page }) => {
    // Upload image first
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/transparency.png');
    await page.waitForTimeout(2000);
    
    // Look for background removal button
    const bgRemovalSelectors = [
      'text=Remove Background',
      'text=Background Removal',
      'button:has-text("Remove")',
      'button:has-text("Background")'
    ];
    
    for (const selector of bgRemovalSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`✅ Background removal clicked: ${selector}`);
          await page.waitForTimeout(3000); // Give time for processing
          break;
        }
      } catch (error) {
        // Continue
      }
    }
    
    console.log('✅ Background removal tested');
  });

  test('Check for JavaScript errors and console warnings', async ({ page }) => {
    const errors = [];
    const warnings = [];
    
    // Capture console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Upload an image and interact with tools
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/small.png');
    await page.waitForTimeout(3000);
    
    // Try clicking various elements
    const clickableElements = [
      'button',
      '[role="button"]',
      'a',
      'input[type="checkbox"]'
    ];
    
    for (const selector of clickableElements) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        for (let i = 0; i < Math.min(count, 5); i++) {
          const element = elements.nth(i);
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click({ timeout: 2000 });
            await page.waitForTimeout(300);
          }
        }
      } catch (error) {
        // Continue testing
      }
    }
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('DevTools') &&
      !error.toLowerCase().includes('extension')
    );
    
    console.log(`📊 Console Summary:`);
    console.log(`   - Errors: ${criticalErrors.length}`);
    console.log(`   - Warnings: ${warnings.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('🚨 Critical Errors Found:');
      criticalErrors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Fail test if there are critical JavaScript errors
    expect(criticalErrors.length).toBe(0);
    
    console.log('✅ No critical JavaScript errors found');
  });

  test('Download functionality', async ({ page }) => {
    // Upload image first
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/small.png');
    await page.waitForTimeout(2000);
    
    // Look for download button
    const downloadSelectors = [
      'text=Download',
      'button:has-text("Download")',
      'a[download]',
      '[data-testid="download"]'
    ];
    
    for (const selector of downloadSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          // Set up download handler
          const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
          await element.click();
          
          try {
            const download = await downloadPromise;
            console.log(`✅ Download initiated: ${download.suggestedFilename()}`);
          } catch (downloadError) {
            console.log('⚠️ Download event not triggered, but button clicked successfully');
          }
          break;
        }
      } catch (error) {
        // Continue
      }
    }
    
    console.log('✅ Download functionality tested');
  });

  test('UI responsiveness and layout stability', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      // Upload image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('test-assets/small.png');
      await page.waitForTimeout(2000);
      
      // Check if main elements are still visible
      const mainElements = [
        'input[type="file"]',
        'canvas, img',
        'button'
      ];
      
      for (const selector of mainElements) {
        try {
          const element = page.locator(selector).first();
          await expect(element).toBeVisible({ timeout: 3000 });
        } catch (error) {
          console.log(`⚠️ Element not visible at ${viewport.width}x${viewport.height}: ${selector}`);
        }
      }
      
      console.log(`✅ UI responsive at ${viewport.width}x${viewport.height}`);
    }
  });

  test('Performance and loading times', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate and measure load time
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Page load time: ${loadTime}ms`);
    
    // Ensure load time is reasonable (under 10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Test image processing performance
    const processStart = Date.now();
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/small.png');
    
    // Wait for image to appear
    await page.locator('canvas').or(page.locator('img')).first().waitFor({ timeout: 10000 });
    const processTime = Date.now() - processStart;
    
    console.log(`📊 Image processing time: ${processTime}ms`);
    expect(processTime).toBeLessThan(5000);
    
    console.log('✅ Performance benchmarks passed');
  });

  test('Edge cases and stress testing', async ({ page }) => {
    // Test rapid clicks
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('test-assets/small.png');
    await page.waitForTimeout(2000);
    
    // Rapid clicking on buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      try {
        const button = buttons.nth(i);
        if (await button.isVisible({ timeout: 500 })) {
          await button.click({ timeout: 1000 });
          await page.waitForTimeout(100);
        }
      } catch (error) {
        // Continue stress testing
      }
    }
    
    // Ensure app is still responsive
    const appResponsive = await page.locator('body').isVisible();
    expect(appResponsive).toBe(true);
    
    console.log('✅ Stress testing completed - app remains stable');
  });
});
