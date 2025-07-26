#!/usr/bin/env node
/**
 * SnapForge Test License Generator
 * Generates valid test license keys for full feature testing
 */

console.log('🔑 SnapForge Test License Generator');
console.log('=====================================\n');

// Generate a valid test license key following the format from licenseManager.js
function generateTestLicense() {
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `IMG_PRO_${randomPart}_LIFETIME`;
}

// Generate multiple test keys
const testLicenses = [];
for (let i = 0; i < 5; i++) {
  testLicenses.push(generateTestLicense());
}

console.log('✅ Generated Test License Keys:');
console.log('===============================\n');

testLicenses.forEach((license, index) => {
  console.log(`${index + 1}. ${license}`);
});

console.log('\n📋 How to Use:');
console.log('==============');
console.log('1. Start the desktop app: npm run electron-pro');
console.log('2. Click "🔐 I Have a License Key"');
console.log('3. Enter any of the keys above');
console.log('4. Click "✅ Activate License"');
console.log('5. All premium features will be unlocked!\n');

console.log('🎯 Features Unlocked:');
console.log('=====================');
console.log('• Unlimited usage (no trial limits)');
console.log('• All premium image processing tools');
console.log('• Batch processing capabilities');
console.log('• Advanced export formats');
console.log('• No watermarks');
console.log('• Full AI background removal');
console.log('• Professional GIF creation tools\n');

console.log('💡 Primary Test Key (recommended):');
console.log(`🔑 ${testLicenses[0]}\n`);

// Save the primary key to a file for easy access
import fs from 'fs';
const testKeyInfo = {
  primaryKey: testLicenses[0],
  allKeys: testLicenses,
  generated: new Date().toISOString(),
  instructions: [
    "1. Run: npm run electron-pro",
    "2. Click: 🔐 I Have a License Key",
    "3. Enter: " + testLicenses[0],
    "4. Click: ✅ Activate License",
    "5. Enjoy full premium features!"
  ]
};

fs.writeFileSync('test-license-keys.json', JSON.stringify(testKeyInfo, null, 2));
console.log('💾 Test keys saved to: test-license-keys.json');
console.log('🎉 Ready for premium testing!');
