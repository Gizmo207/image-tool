#!/usr/bin/env node
/**
 * SnapForge Test Gauntlet Runner
 * Comprehensive test suite orchestrator for the complete user journey
 * From install → checkout → unlock → trial workflow validation
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkPrerequisites() {
  colorLog('cyan', '\n🔍 Checking prerequisites...');
  
  // Check if Playwright is installed
  try {
    await runCommand('npx', ['playwright', '--version'], { stdio: 'pipe' });
    colorLog('green', '✅ Playwright is installed');
  } catch (error) {
    colorLog('red', '❌ Playwright not found. Installing...');
    await runCommand('npm', ['install', '@playwright/test']);
    await runCommand('npx', ['playwright', 'install']);
  }

  // Check if test assets exist
  const assetsPath = path.join(process.cwd(), 'test-assets');
  if (!existsSync(assetsPath)) {
    colorLog('yellow', '⚠️ Test assets not found. Run asset generation first.');
    return false;
  }

  colorLog('green', '✅ Prerequisites check passed');
  return true;
}

async function runTestSuite(suiteName, specFile, description) {
  colorLog('blue', `\n🧪 Running ${suiteName}`);
  colorLog('bright', `📝 ${description}`);
  
  try {
    await runCommand('npx', ['playwright', 'test', specFile, '--reporter=html']);
    colorLog('green', `✅ ${suiteName} completed successfully`);
    return true;
  } catch (error) {
    colorLog('red', `❌ ${suiteName} failed`);
    console.error(error.message);
    return false;
  }
}

async function runFullGauntlet() {
  colorLog('magenta', '\n🎯 SnapForge Test Gauntlet - Full Automation Suite');
  colorLog('bright', '====================================================');
  
  const prerequisites = await checkPrerequisites();
  if (!prerequisites) {
    colorLog('red', '❌ Prerequisites not met. Exiting.');
    process.exit(1);
  }

  const testSuites = [
    {
      name: 'Quick Validation',
      file: 'tests/snapforge-quick-validation.spec.js',
      description: 'Basic smoke tests and app health validation'
    },
    {
      name: 'First Launch Experience',
      file: 'tests/snapforge-first-launch.spec.js',
      description: 'New user onboarding and first-time experience'
    },
    {
      name: 'Trial Limitations',
      file: 'tests/snapforge-trial-limiter.spec.js',
      description: 'Usage limits and trial enforcement validation'
    },
    {
      name: 'License Unlock',
      file: 'tests/snapforge-license-unlock.spec.js',
      description: 'Premium license activation and feature unlock'
    },
    {
      name: 'Checkout Simulation',
      file: 'tests/snapforge-checkout-simulation.spec.js',
      description: 'Payment flow and purchase process validation'
    }
  ];

  let passedSuites = 0;
  let failedSuites = 0;
  const results = {};

  colorLog('cyan', '\n📊 Test Execution Plan:');
  testSuites.forEach((suite, index) => {
    console.log(`   ${index + 1}. ${suite.name} - ${suite.description}`);
  });

  colorLog('bright', '\n🚀 Starting test execution...\n');

  for (const suite of testSuites) {
    const startTime = Date.now();
    const success = await runTestSuite(suite.name, suite.file, suite.description);
    const duration = Date.now() - startTime;
    
    results[suite.name] = {
      success,
      duration,
      file: suite.file
    };
    
    if (success) {
      passedSuites++;
    } else {
      failedSuites++;
    }
    
    // Brief pause between suites
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate summary report
  colorLog('bright', '\n📋 Test Gauntlet Summary Report');
  colorLog('bright', '=====================================');
  
  colorLog('green', `✅ Passed: ${passedSuites} suites`);
  colorLog('red', `❌ Failed: ${failedSuites} suites`);
  
  console.log('\n📊 Detailed Results:');
  Object.entries(results).forEach(([name, result]) => {
    const status = result.success ? '✅' : '❌';
    const duration = Math.round(result.duration / 1000);
    console.log(`   ${status} ${name} (${duration}s)`);
  });

  // Open HTML report
  colorLog('cyan', '\n📄 Opening HTML test report...');
  try {
    await runCommand('npx', ['playwright', 'show-report']);
  } catch (error) {
    colorLog('yellow', '⚠️ Could not open HTML report automatically');
  }

  // Exit with appropriate code
  if (failedSuites > 0) {
    colorLog('red', '\n❌ Some test suites failed. Check the report for details.');
    process.exit(1);
  } else {
    colorLog('green', '\n🎉 All test suites passed! SnapForge is ready for production.');
    process.exit(0);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
SnapForge Test Gauntlet Runner

Usage:
  node test-runner.js [options]

Options:
  --help, -h     Show this help message
  --quick        Run only quick validation tests
  --license      Run only license unlock tests  
  --checkout     Run only checkout simulation tests
  --trial        Run only trial limitation tests
  --first        Run only first launch tests

Examples:
  node test-runner.js                    # Run full test gauntlet
  node test-runner.js --quick           # Quick smoke tests only
  node test-runner.js --license         # License testing only
  `);
  process.exit(0);
}

// Handle specific test suite execution
if (args.includes('--quick')) {
  runTestSuite('Quick Validation', 'tests/snapforge-quick-validation.spec.js', 'Basic smoke tests').then(() => process.exit(0));
} else if (args.includes('--license')) {
  runTestSuite('License Unlock', 'tests/snapforge-license-unlock.spec.js', 'License activation tests').then(() => process.exit(0));
} else if (args.includes('--checkout')) {
  runTestSuite('Checkout Simulation', 'tests/snapforge-checkout-simulation.spec.js', 'Payment flow tests').then(() => process.exit(0));
} else if (args.includes('--trial')) {
  runTestSuite('Trial Limitations', 'tests/snapforge-trial-limiter.spec.js', 'Trial enforcement tests').then(() => process.exit(0));
} else if (args.includes('--first')) {
  runTestSuite('First Launch', 'tests/snapforge-first-launch.spec.js', 'First-time user tests').then(() => process.exit(0));
} else {
  // Run full gauntlet
  runFullGauntlet();
}
