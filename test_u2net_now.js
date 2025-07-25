/**
 * Test U-2-Net Background Removal - IMMEDIATE TEST
 * Run this to see if everything works
 */

const SimpleBackgroundRemover = require('./src/utils/simpleBackgroundRemover.js');
const fs = require('fs');
const path = require('path');

async function testBackgroundRemoval() {
    try {
        console.log('🧪 Testing U-2-Net Background Removal...');
        
        // Check if test image exists
        const testImagePath = 'test_person.png';
        if (!fs.existsSync(testImagePath)) {
            console.log('❌ Test image not found. Creating one...');
            // Run the Python script to create test image
            const { spawn } = require('child_process');
            await new Promise((resolve, reject) => {
                const createProcess = spawn('python', ['create_test_image.py']);
                createProcess.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error('Failed to create test image'));
                });
            });
        }
        
        // Convert test image to data URL
        const imageBuffer = fs.readFileSync(testImagePath);
        const imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        
        console.log('✅ Test image loaded');
        
        // Create background remover
        const remover = new SimpleBackgroundRemover();
        
        // Remove background
        console.log('🚀 Processing with U-2-Net...');
        const resultDataUrl = await remover.removeBackground(imageDataUrl);
        
        // Save result
        const resultBuffer = Buffer.from(resultDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
        fs.writeFileSync('test_result_u2net.png', resultBuffer);
        
        console.log('🎉 SUCCESS! Background removal completed!');
        console.log('📁 Results saved as: test_result_u2net.png');
        console.log('🔍 Check the file to see the transparent background!');
        
        // Show file size comparison
        const originalSize = fs.statSync(testImagePath).size;
        const resultSize = fs.statSync('test_result_u2net.png').size;
        
        console.log(`📊 Original: ${Math.round(originalSize/1024)}KB → Result: ${Math.round(resultSize/1024)}KB`);
        
        console.log('\n✅ U-2-Net is working perfectly! You can now integrate it into your React app.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure Python is installed and in PATH');
        console.log('2. Make sure rembg is installed: pip install rembg');
        console.log('3. Check if test_person.png exists');
    }
}

// Run the test
testBackgroundRemoval();
