/**
 * 🧪 U-2-Net Integration Test - CLEANED CODEBASE
 * Test the complete U-2-Net background removal system after cleanup
 */

const fs = require('fs');
const path = require('path');

// Create test image data URL (small test image)
const createTestImageDataUrl = () => {
    // Simple 2x2 PNG - smallest possible test image
    const pngData = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAABHNCSVQICAgIfAhkiAAAABJJREFUCJlj/M8ABMSIBKNKAABhKQBYvDOxEgAAAABJRU5ErkJggg==';
    return `data:image/png;base64,${pngData}`;
};

async function testU2NetIntegration() {
    console.log('🧪 Starting U-2-Net Integration Test...');
    console.log('📁 Testing cleaned codebase with ONLY U-2-Net solution');
    
    try {
        // Import the cleaned bestBackgroundRemover
        const { bestBackgroundRemover } = require('../src/utils/bestBackgroundRemover.js');
        console.log('✅ bestBackgroundRemover imported successfully');
        
        // Check that MediaPipe references are gone
        const fileContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'bestBackgroundRemover.js'), 'utf8');
        
        if (fileContent.includes('MediaPipe') || fileContent.includes('@mediapipe')) {
            throw new Error('❌ CLEANUP FAILED: MediaPipe references still exist!');
        }
        
        if (fileContent.includes('professionalEdgeCleanup')) {
            throw new Error('❌ CLEANUP FAILED: professionalEdgeCleanup references still exist!');
        }
        
        console.log('✅ File cleanup verification passed - NO MediaPipe code found');
        
        // Test the U-2-Net integration
        const testImage = createTestImageDataUrl();
        console.log('🖼️ Created test image:', testImage.substring(0, 50) + '...');
        
        console.log('🚀 Testing U-2-Net background removal...');
        const result = await bestBackgroundRemover.removeBackground(testImage);
        
        if (!result || !result.startsWith('data:image/')) {
            throw new Error('❌ U-2-Net returned invalid result');
        }
        
        console.log('✅ U-2-Net processing successful!');
        console.log('📊 Result size:', result.length, 'bytes');
        console.log('🎯 Result type:', result.substring(0, 30) + '...');
        
        // Check file system cleanup
        const utilsDir = path.join(__dirname, '..', 'src', 'utils');
        const files = fs.readdirSync(utilsDir);
        
        const deletedFiles = [
            'professionalBackgroundRemover.js',
            'professionalEdgeCleanup.js',
            'u2netProfessionalRemover.js'
        ];
        
        const stillExists = deletedFiles.filter(file => files.includes(file));
        if (stillExists.length > 0) {
            throw new Error(`❌ CLEANUP FAILED: Files still exist: ${stillExists.join(', ')}`);
        }
        
        console.log('✅ File system cleanup verified - old files deleted');
        
        // Check package.json cleanup
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
        if (packageJson.dependencies['@mediapipe/selfie_segmentation']) {
            throw new Error('❌ CLEANUP FAILED: MediaPipe still in package.json dependencies');
        }
        
        console.log('✅ Package.json cleanup verified - MediaPipe dependency removed');
        
        console.log('\n🎉 U-2-NET INTEGRATION TEST PASSED!');
        console.log('🏆 CLEANUP SUCCESSFUL:');
        console.log('   ✅ All MediaPipe code removed');
        console.log('   ✅ All edge cleanup code removed');
        console.log('   ✅ Only U-2-Net professional solution remains');
        console.log('   ✅ Dependencies cleaned up');
        console.log('   ✅ File system cleaned up');
        console.log('   ✅ U-2-Net background removal working');
        
        return true;
        
    } catch (error) {
        console.error('❌ U-2-Net Integration Test FAILED:', error.message);
        console.log('\n📋 Debug Information:');
        console.log('   - Check bestBackgroundRemover.js exists and is correct');
        console.log('   - Check U-2-Net Python script is accessible');
        console.log('   - Check temp directory permissions');
        console.log('   - Verify all MediaPipe code was removed');
        
        return false;
    }
}

// Run test if called directly
if (require.main === module) {
    testU2NetIntegration().then(success => {
        console.log(success ? '\n✅ READY FOR PRODUCTION!' : '\n❌ FIXES NEEDED');
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testU2NetIntegration };
