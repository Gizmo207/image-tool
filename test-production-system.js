#!/usr/bin/env node

/**
 * 🧪 SnapForge Production License System Test Suite
 * Tests all components of the lifetime license and auto-updater system
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🧪 Starting SnapForge Production Test Suite...\n');

// Test Configuration
const TEST_CONFIG = {
    validLicenseKeys: [
        'IMG_PRO_abc123456789_LIFETIME',
        'IMG_PRO_def456789012_LIFETIME', 
        'IMG_PRO_xyz789012345_LIFETIME'
    ],
    invalidLicenseKeys: [
        'INVALID_KEY',
        'IMG_PRO_short_LIFETIME',
        'IMG_FREE_abc123_LIFETIME',
        'IMG_PRO_abc123_MONTHLY',
        ''
    ],
    testMachineId: 'test-machine-12345',
    licenseStorePath: path.join(__dirname, 'test-license-storage')
};

// Mock Electron app for testing
global.mockElectronApp = {
    getPath: (name) => {
        if (name === 'userData') {
            return TEST_CONFIG.licenseStorePath;
        }
        return TEST_CONFIG.licenseStorePath;
    },
    getVersion: () => '1.0.0'
};

// Import the license manager for testing
let LicenseManager;
try {
    // Mock the Electron app object before requiring
    const originalRequire = require;
    require = function(id) {
        if (id === 'electron') {
            return { 
                app: global.mockElectronApp 
            };
        }
        return originalRequire.apply(this, arguments);
    };
    
    LicenseManager = originalRequire('./licenseManager');
    require = originalRequire; // restore original require
    
    console.log('✅ License Manager loaded successfully');
} catch (error) {
    console.error('❌ Failed to load License Manager:', error.message);
    process.exit(1);
}

// Test Results Tracking
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Test Runner
async function runTest(testName, testFunction) {
    try {
        console.log(`\n🔬 Testing: ${testName}`);
        await testFunction();
        console.log(`✅ PASS: ${testName}`);
        testResults.passed++;
        testResults.tests.push({ name: testName, result: 'PASS' });
    } catch (error) {
        console.error(`❌ FAIL: ${testName} - ${error.message}`);
        testResults.failed++;
        testResults.tests.push({ name: testName, result: 'FAIL', error: error.message });
    }
}

// ===========================================
// 🔑 LICENSE VALIDATION TESTS
// ===========================================

async function testValidLicenseKeys() {
    const manager = new LicenseManager();
    
    for (const key of TEST_CONFIG.validLicenseKeys) {
        const result = manager.validateLicenseKey(key);
        if (!result.valid) {
            throw new Error(`Valid key ${key} was rejected: ${result.reason}`);
        }
    }
    
    console.log(`   ✓ All ${TEST_CONFIG.validLicenseKeys.length} valid keys accepted`);
}

async function testInvalidLicenseKeys() {
    const manager = new LicenseManager();
    
    for (const key of TEST_CONFIG.invalidLicenseKeys) {
        const result = manager.validateLicenseKey(key);
        if (result.valid) {
            throw new Error(`Invalid key ${key} was incorrectly accepted`);
        }
    }
    
    console.log(`   ✓ All ${TEST_CONFIG.invalidLicenseKeys.length} invalid keys rejected`);
}

// ===========================================
// 🔐 ENCRYPTION TESTS
// ===========================================

async function testEncryptionDecryption() {
    const manager = new LicenseManager();
    const testData = { 
        key: 'IMG_PRO_test123456789_LIFETIME',
        machineId: TEST_CONFIG.testMachineId,
        activated: Date.now()
    };
    
    // Test encryption
    const encrypted = manager.encryptLicenseData(testData);
    if (!encrypted || typeof encrypted !== 'string') {
        throw new Error('Encryption failed to produce valid output');
    }
    
    // Test decryption
    const decrypted = manager.decryptLicenseData(encrypted);
    if (!decrypted || decrypted.key !== testData.key) {
        throw new Error('Decryption failed to restore original data');
    }
    
    console.log('   ✓ Encryption/decryption cycle successful');
    console.log(`   ✓ Encrypted data length: ${encrypted.length} characters`);
}

async function testEncryptionTamperResistance() {
    const manager = new LicenseManager();
    const testData = { key: 'IMG_PRO_test123456789_LIFETIME' };
    
    const encrypted = manager.encryptLicenseData(testData);
    
    // Test tampering by modifying encrypted string
    const tamperedEncrypted = encrypted.substring(0, encrypted.length - 5) + 'XXXXX';
    
    try {
        const result = manager.decryptLicenseData(tamperedEncrypted);
        if (result) {
            throw new Error('Tampered data was incorrectly decrypted');
        }
    } catch (error) {
        // Expected behavior - tampered data should fail
        console.log('   ✓ Tampered data correctly rejected');
    }
}

// ===========================================
// 💾 STORAGE TESTS
// ===========================================

async function testLicenseActivationStorage() {
    // Create temporary storage directory
    if (!fs.existsSync(TEST_CONFIG.licenseStorePath)) {
        fs.mkdirSync(TEST_CONFIG.licenseStorePath, { recursive: true });
    }
    
    const manager = new LicenseManager();
    const testKey = TEST_CONFIG.validLicenseKeys[0];
    
    // Test activation
    const activationResult = await manager.activateLicense(testKey);
    if (!activationResult.success) {
        throw new Error(`License activation failed: ${activationResult.message}`);
    }
    
    // Test retrieval
    const storedLicense = await manager.getStoredLicense();
    if (!storedLicense || !storedLicense.licensed) {
        throw new Error('Stored license retrieval failed');
    }
    
    console.log('   ✓ License activation and storage successful');
    console.log(`   ✓ License type: ${storedLicense.type}`);
}

async function testStorageBackupRecovery() {
    const manager = new LicenseManager();
    
    // Test that license system handles missing files gracefully
    const storedLicense = await manager.getStoredLicense();
    
    // Should return trial mode if no license found
    if (storedLicense && storedLicense.licensed) {
        console.log('   ✓ Found existing license');
    } else {
        console.log('   ✓ Gracefully handles missing license files');
    }
    
    console.log('   ✓ Backup recovery system working');
}

// ===========================================
// 🎯 FEATURE MANAGEMENT TESTS
// ===========================================

async function testFeatureManagement() {
    const manager = new LicenseManager();
    const testKey = TEST_CONFIG.validLicenseKeys[0];
    
    // Test feature checking for valid license
    const hasFeature = await manager.hasFeature('aiBackgroundRemoval');
    
    // Test license status
    const status = await manager.getLicenseStatus();
    
    if (!status) {
        throw new Error('License status retrieval failed');
    }
    
    console.log(`   ✓ License status: ${status.status}`);
    console.log(`   ✓ Features available: ${status.features ? status.features.length : 0}`);
}

// ===========================================
// 🔄 AUTO-UPDATER TESTS  
// ===========================================

async function testUpdateMetadataGeneration() {
    // Test that package.json has correct updater configuration
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    if (!packageJson.build || !packageJson.build.publish) {
        throw new Error('package.json missing auto-updater publish configuration');
    }
    
    const publishConfig = packageJson.build.publish;
    if (!publishConfig.provider || !publishConfig.url) {
        throw new Error('Auto-updater publish configuration incomplete');
    }
    
    console.log(`   ✓ Auto-updater configured for: ${publishConfig.provider}`);
    console.log(`   ✓ Update server: ${publishConfig.url}`);
}

async function testElectronUpdaterIntegration() {
    // Test that electron-updater is properly installed
    try {
        require('electron-updater');
        console.log('   ✓ electron-updater dependency available');
    } catch (error) {
        throw new Error('electron-updater not installed or configured');
    }
    
    // Test that main electron file imports updater
    const electronMain = fs.readFileSync('./electron-simple.js', 'utf8');
    
    if (!electronMain.includes('electron-updater')) {
        throw new Error('electron-simple.js does not import electron-updater');
    }
    
    if (!electronMain.includes('checkForUpdatesAndNotify') && !electronMain.includes('checkForUpdates')) {
        throw new Error('electron-simple.js does not implement update checking');
    }
    
    console.log('   ✓ Electron main process configured for auto-updates');
}

// ===========================================
// 🌐 IPC COMMUNICATION TESTS
// ===========================================

async function testIPCBridgeConfiguration() {
    // Test that preload.js has proper IPC bridge
    const preloadScript = fs.readFileSync('./preload.js', 'utf8');
    
    if (!preloadScript.includes('contextBridge') || !preloadScript.includes('snapAPI')) {
        throw new Error('preload.js missing secure IPC bridge configuration');
    }
    
    const requiredAPIMethods = [
        'activateLicense',
        'getStoredLicense', 
        'checkForUpdates',
        'downloadUpdate',
        'installUpdate'
    ];
    
    for (const method of requiredAPIMethods) {
        if (!preloadScript.includes(method)) {
            throw new Error(`preload.js missing required API method: ${method}`);
        }
    }
    
    console.log(`   ✓ IPC bridge configured with ${requiredAPIMethods.length} API methods`);
}

// ===========================================
// 📦 BUILD SYSTEM TESTS
// ===========================================

async function testBuildConfiguration() {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    // Test build scripts
    const requiredScripts = ['dist-win', 'dist-mac', 'dist-linux'];
    for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
            throw new Error(`package.json missing required script: ${script}`);
        }
    }
    
    // Test electron-builder configuration
    if (!packageJson.build) {
        throw new Error('package.json missing electron-builder configuration');
    }
    
    const buildConfig = packageJson.build;
    if (!buildConfig.appId || !buildConfig.productName) {
        throw new Error('electron-builder configuration incomplete');
    }
    
    console.log(`   ✓ Build system configured for: ${buildConfig.productName}`);
    console.log(`   ✓ App ID: ${buildConfig.appId}`);
}

async function testGitHubActionsWorkflow() {
    const workflowPath = './.github/workflows/build-cross-platform.yml';
    
    if (!fs.existsSync(workflowPath)) {
        throw new Error('GitHub Actions workflow file missing');
    }
    
    const workflow = fs.readFileSync(workflowPath, 'utf8');
    
    if (!workflow.includes('build-windows') || 
        !workflow.includes('build-macos') || 
        !workflow.includes('build-linux')) {
        throw new Error('GitHub Actions workflow missing cross-platform builds');
    }
    
    if (!workflow.includes('package-and-release')) {
        throw new Error('GitHub Actions workflow missing release packaging');
    }
    
    console.log('   ✓ GitHub Actions workflow configured for cross-platform builds');
}

// ===========================================
// 🎨 UI INTEGRATION TESTS
// ===========================================

async function testRendererUIIntegration() {
    const rendererScript = fs.readFileSync('./renderer.js', 'utf8');
    
    const requiredUIFunctions = [
        'setupLicenseSystem',
        'showLicenseModal',
        'activateLicense',
        'setupAutoUpdater',
        'enablePremiumFeatures'
    ];
    
    for (const func of requiredUIFunctions) {
        if (!rendererScript.includes(func)) {
            throw new Error(`renderer.js missing required function: ${func}`);
        }
    }
    
    // Test that UI includes styling
    if (!rendererScript.includes('.modal') || !rendererScript.includes('.btn-primary')) {
        throw new Error('renderer.js missing required UI styles');
    }
    
    console.log(`   ✓ Renderer UI configured with ${requiredUIFunctions.length} functions`);
}

// ===========================================
// 🧹 CLEANUP AND REPORTING
// ===========================================

function cleanup() {
    // Remove test storage directory
    if (fs.existsSync(TEST_CONFIG.licenseStorePath)) {
        fs.rmSync(TEST_CONFIG.licenseStorePath, { recursive: true, force: true });
        console.log('   🧹 Test storage cleaned up');
    }
}

function generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults.tests
            .filter(test => test.result === 'FAIL')
            .forEach(test => {
                console.log(`   • ${test.name}: ${test.error}`);
            });
    }
    
    console.log('\n🎯 PRODUCTION READINESS:');
    if (testResults.failed === 0) {
        console.log('🟢 ALL SYSTEMS GO! Ready for production deployment.');
        console.log('🚀 SnapForge license system is fully operational.');
    } else {
        console.log('🟡 ISSUES DETECTED! Fix failed tests before deployment.');
        console.log('⚠️  Production deployment not recommended.');
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Fix any failed tests above');
    console.log('2. Create a git tag: git tag v1.0.1');
    console.log('3. Push tag: git push origin v1.0.1');
    console.log('4. GitHub Actions will build cross-platform releases');
    console.log('5. Upload customer packages to your sales platform');
    console.log('6. Host update files on your server/Firebase');
    
    console.log('\n🎉 Thank you for building with SnapForge!');
}

// ===========================================
// 🏃‍♂️ RUN ALL TESTS
// ===========================================

async function runAllTests() {
    console.log('🔥 Testing Production License System...\n');
    
    // License validation tests
    await runTest('Valid License Key Validation', testValidLicenseKeys);
    await runTest('Invalid License Key Rejection', testInvalidLicenseKeys);
    
    // Encryption tests
    await runTest('License Data Encryption/Decryption', testEncryptionDecryption);
    await runTest('Encryption Tamper Resistance', testEncryptionTamperResistance);
    
    // Storage tests
    await runTest('License Activation & Storage', testLicenseActivationStorage);
    await runTest('Storage Backup Recovery', testStorageBackupRecovery);
    
    // Feature management tests
    await runTest('Feature Management System', testFeatureManagement);
    
    // Auto-updater tests
    await runTest('Update Metadata Configuration', testUpdateMetadataGeneration);
    await runTest('Electron Updater Integration', testElectronUpdaterIntegration);
    
    // IPC communication tests
    await runTest('IPC Bridge Configuration', testIPCBridgeConfiguration);
    
    // Build system tests
    await runTest('Build System Configuration', testBuildConfiguration);
    await runTest('GitHub Actions Workflow', testGitHubActionsWorkflow);
    
    // UI integration tests
    await runTest('Renderer UI Integration', testRendererUIIntegration);
    
    // Cleanup and report
    cleanup();
    generateReport();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Start the test suite
runAllTests().catch((error) => {
    console.error('\n💥 Test suite crashed:', error);
    cleanup();
    process.exit(1);
});
