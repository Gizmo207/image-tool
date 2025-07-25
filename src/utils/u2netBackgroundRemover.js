/**
 * U-2-Net Background Remover Bridge
 * Professional background removal using U-2-Net AI
 * Same technology as Remove.bg, but offline and free!
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class U2NetBackgroundRemover {
    constructor() {
        this.pythonPath = 'python'; // Or 'python3' on some systems
        this.scriptPath = path.join(__dirname, '..', 'u2net', 'u2net_background_remover.py');
        this.tempDir = path.join(__dirname, '..', 'temp');
        
        // Ensure temp directory exists
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    /**
     * Remove background using U-2-Net AI
     * @param {string} inputImagePath - Path to input image
     * @param {string} outputImagePath - Path to save result
     * @returns {Promise<boolean>} - Success status
     */
    async removeBackground(inputImagePath, outputImagePath) {
        return new Promise((resolve, reject) => {
            console.log('🚀 Starting U-2-Net background removal...');
            
            const pythonProcess = spawn(this.pythonPath, [
                this.scriptPath,
                inputImagePath,
                outputImagePath
            ]);

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                console.log('U-2-Net:', output.trim());
            });

            pythonProcess.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                console.error('U-2-Net Error:', output.trim());
            });

            pythonProcess.on('close', (code) => {
                if (code === 0 && stdout.includes('SUCCESS')) {
                    console.log('✅ U-2-Net background removal completed successfully!');
                    resolve(true);
                } else {
                    console.error('❌ U-2-Net background removal failed');
                    console.error('Exit code:', code);
                    console.error('Stderr:', stderr);
                    reject(new Error(`U-2-Net failed with exit code ${code}: ${stderr}`));
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('❌ Failed to start U-2-Net process:', error);
                reject(error);
            });
        });
    }

    /**
     * Process image data URL and return result as data URL
     * @param {string} imageDataUrl - Input image as data URL
     * @returns {Promise<string>} - Result image as data URL
     */
    async processImageDataUrl(imageDataUrl) {
        try {
            // Generate unique filenames
            const timestamp = Date.now();
            const inputPath = path.join(this.tempDir, `input_${timestamp}.png`);
            const outputPath = path.join(this.tempDir, `output_${timestamp}.png`);

            // Convert data URL to file
            const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
            fs.writeFileSync(inputPath, Buffer.from(base64Data, 'base64'));

            // Process with U-2-Net
            await this.removeBackground(inputPath, outputPath);

            // Convert result back to data URL
            const resultBuffer = fs.readFileSync(outputPath);
            const resultDataUrl = `data:image/png;base64,${resultBuffer.toString('base64')}`;

            // Cleanup temp files
            this.cleanupFile(inputPath);
            this.cleanupFile(outputPath);

            return resultDataUrl;

        } catch (error) {
            console.error('❌ U-2-Net processing failed:', error);
            throw error;
        }
    }

    /**
     * Check if U-2-Net is properly installed
     * @returns {Promise<boolean>} - Installation status
     */
    async checkInstallation() {
        return new Promise((resolve) => {
            const checkProcess = spawn(this.pythonPath, ['-c', 'import torch, torchvision, PIL, numpy, scipy, skimage, gdown; print("OK")']);
            
            checkProcess.on('close', (code) => {
                resolve(code === 0);
            });

            checkProcess.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Install U-2-Net dependencies
     * @returns {Promise<boolean>} - Installation success
     */
    async installDependencies() {
        return new Promise((resolve, reject) => {
            console.log('🔄 Installing U-2-Net dependencies...');
            
            const setupPath = path.join(__dirname, '..', 'u2net', 'setup_u2net.py');
            const installProcess = spawn(this.pythonPath, [setupPath]);

            installProcess.stdout.on('data', (data) => {
                console.log('Setup:', data.toString().trim());
            });

            installProcess.stderr.on('data', (data) => {
                console.error('Setup Error:', data.toString().trim());
            });

            installProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ U-2-Net installation completed!');
                    resolve(true);
                } else {
                    console.error('❌ U-2-Net installation failed');
                    reject(new Error(`Installation failed with exit code ${code}`));
                }
            });
        });
    }

    /**
     * Clean up temporary file
     * @param {string} filePath - File to delete
     */
    cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.warn('Warning: Could not cleanup file:', filePath);
        }
    }
}

module.exports = U2NetBackgroundRemover;
