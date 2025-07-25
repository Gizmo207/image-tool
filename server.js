/**
 * Simple Express Server for U-2-Net Background Removal
 * Bridges React frontend with Python U-2-Net backend
 */

const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Temp directory
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Background removal endpoint
app.post('/api/remove-background', async (req, res) => {
    try {
        console.log('🚀 Received POLISHED background removal request');
        
        const { image, model } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Use SMART AUTO-DETECTION by default, or manual model if specified
        const modelName = model || 'auto';
        console.log(`🧠 Using AI model: ${modelName}`);

        // Generate unique filenames
        const timestamp = Date.now();
        const inputPath = path.join(tempDir, `input_${timestamp}.png`);
        const outputPath = path.join(tempDir, `output_${timestamp}.png`);

        // Convert data URL to file
        const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
        fs.writeFileSync(inputPath, Buffer.from(base64Data, 'base64'));

        // Run POLISHED U-2-Net Python script with model selection
        const scriptPath = path.join(__dirname, 'u2net', 'u2net_background_remover.py');
        
        console.log('🔥 Running POLISHED U-2-Net with preprocessing & post-processing...');
        const result = await runPythonScript(scriptPath, inputPath, outputPath, modelName);

        if (!fs.existsSync(outputPath)) {
            throw new Error('Python script did not create output file');
        }

        // Convert result back to data URL
        const resultBuffer = fs.readFileSync(outputPath);
        const resultDataUrl = `data:image/png;base64,${resultBuffer.toString('base64')}`;

        // Cleanup temp files
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

        console.log('✅ POLISHED background removal completed successfully!');
        res.json({ processedImage: resultDataUrl });

    } catch (error) {
        console.error('❌ POLISHED background removal failed:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Run Python script with model selection
 */
function runPythonScript(scriptPath, inputPath, outputPath, modelName = 'u2net_human_seg') {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [scriptPath, inputPath, outputPath, modelName]);

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            console.log('Python:', output.trim());
        });

        pythonProcess.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            if (!output.includes('provider_bridge_ort.cc') && !output.includes('CUDA')) {
                console.error('Python Error:', output.trim());
            }
        });

        pythonProcess.on('close', (code) => {
            if (code === 0 && stdout.includes('SUCCESS')) {
                resolve();
            } else {
                reject(new Error(`Python script failed with exit code ${code}: ${stderr}`));
            }
        });

        pythonProcess.on('error', (error) => {
            reject(error);
        });
    });
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'U-2-Net Backend Server Running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 U-2-Net Backend Server running on http://localhost:${PORT}`);
    console.log(`🎯 Ready to process background removal requests!`);
});

module.exports = app;
