#!/usr/bin/env node

/**
 * SnapForge Test Runner
 * Comprehensive testing script for the SnapForge image editor
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 SnapForge Comprehensive Test Suite');
console.log('=====================================\n');

// Check if dev server is running
const checkDevServer = () => {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001', { encoding: 'utf8' });
    return response.trim() === '200';
  } catch (error) {
    return false;
  }
};

// Start dev server if not running
const ensureDevServer = () => {
  if (!checkDevServer()) {
    console.log('🚀 Starting development server...');
    console.log('   Please wait for the server to start, then run this script again.');
    console.log('   Run: npm run dev');
    process.exit(1);
  } else {
    console.log('✅ Development server is running on localhost:3001');
  }
};

// Run specific test suites
const runTests = () => {
  const testSuites = [
    {
      name: 'Full App Test',
      command: 'npx playwright test tests/snapforge-full-test.spec.js',
      description: 'Complete application functionality test'
    },
    {
      name: 'GIF Creator Tests', 
      command: 'npx playwright test tests/gif-creator-specific.spec.js',
      description: 'GIF creation and timeout handling tests'
    },
    {
      name: 'Backend Utilities',
      command: 'npx playwright test tests/backend-utilities.spec.js', 
      description: 'Core utilities and libraries test'
    }
  ];

  console.log('🎯 Running Test Suites:\n');

  let totalPassed = 0;
  let totalFailed = 0;

  testSuites.forEach((suite, index) => {
    console.log(`\n📋 ${index + 1}. ${suite.name}`);
    console.log(`   Description: ${suite.description}`);
    console.log(`   Command: ${suite.command}`);
    console.log('   Running...\n');

    try {
      execSync(suite.command, { stdio: 'inherit' });
      console.log(`✅ ${suite.name} - PASSED\n`);
      totalPassed++;
    } catch (error) {
      console.log(`❌ ${suite.name} - FAILED\n`);
      totalFailed++;
    }
  });

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%\n`);

  if (totalFailed === 0) {
    console.log('🎉 All tests passed! Your SnapForge app is working perfectly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    console.log('💡 Tip: Run individual test suites with:');
    console.log('   npm run test:specific  # Full app test');
    console.log('   npm run test:gif       # GIF creator tests');
    console.log('   npm run test:utils     # Backend utilities');
  }

  // Generate HTML report
  console.log('\n📄 Generating HTML report...');
  try {
    execSync('npx playwright show-report', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Could not generate HTML report automatically');
    console.log('   Run: npm run test:report');
  }
};

// Main execution
const main = () => {
  try {
    ensureDevServer();
    runTests();
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkDevServer, ensureDevServer, runTests };
