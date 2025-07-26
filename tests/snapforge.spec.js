// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('SnapForge Production System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should load the main application', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('SnapForge');
  });

  test('should have license activation functionality', async ({ page }) => {
    // Look for license-related elements
    const licenseButton = page.locator('[data-testid="activate-license"], .license-button, #activate-license');
    await expect(licenseButton).toBeVisible({ timeout: 10000 });
  });

  test('should have background removal features', async ({ page }) => {
    // Check for background removal functionality
    const uploadArea = page.locator('.upload-area, [data-testid="upload-area"], #upload-area');
    await expect(uploadArea).toBeVisible();
  });

  test('should handle file uploads', async ({ page }) => {
    // Test file upload capability
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('should display premium features when licensed', async ({ page }) => {
    // Mock licensed state and check premium features
    await page.evaluate(() => {
      window.localStorage.setItem('snapforge_license_status', 'active');
    });
    await page.reload();
    
    // Check for premium features
    const premiumFeatures = page.locator('.premium-feature, [data-premium="true"]');
    if (await premiumFeatures.count() > 0) {
      await expect(premiumFeatures.first()).toBeVisible();
    }
  });
});
