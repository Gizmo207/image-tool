/**
 * 🔐 SnapForge Production License Manager
 * 
 * Production-grade license management system with:
 * - AES-256-CBC encryption
 * - Machine binding
 * - Offline validation
 * - Tamper-resistant storage
 * - Secure backup/recovery
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

class LicenseManager {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.secretKey = 'SNAPFORGE-SECURE-LICENSE-KEY-2024-PRODUCTION-GRADE-ENCRYPTION';
        this.licenseDir = path.join(os.homedir(), '.snapforge');
        this.licenseFile = path.join(this.licenseDir, 'license.dat');
        this.backupFile = path.join(this.licenseDir, 'license.bak');
        
        this.ensureLicenseDirectory();
    }

    ensureLicenseDirectory() {
        if (!fs.existsSync(this.licenseDir)) {
            fs.mkdirSync(this.licenseDir, { recursive: true });
        }
    }

    /**
     * Generate machine fingerprint for license binding
     */
    getMachineFingerprint() {
        const machineInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalmem: os.totalmem()
        };
        
        const fingerprint = crypto
            .createHash('sha256')
            .update(JSON.stringify(machineInfo))
            .digest('hex')
            .substring(0, 16);
            
        return fingerprint;
    }

    /**
     * Validate license key format and checksum
     */
    validateLicenseKey(licenseKey) {
        if (!licenseKey || typeof licenseKey !== 'string') {
            return false;
        }

        // Expected format: SNAP-FORGE-PREMIUM-2024-XXXX-XXXX-XXXX-XXXX
        const keyPattern = /^SNAP-FORGE-PREMIUM-2024-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        
        if (!keyPattern.test(licenseKey)) {
            return false;
        }

        // Validate checksum
        const keyParts = licenseKey.split('-');
        const checksumPart = keyParts[keyParts.length - 1];
        const keyWithoutChecksum = keyParts.slice(0, -1).join('-');
        
        const calculatedChecksum = crypto
            .createHash('md5')
            .update(keyWithoutChecksum)
            .digest('hex')
            .substring(0, 4)
            .toUpperCase();

        return checksumPart === calculatedChecksum;
    }

    /**
     * Encrypt license data with machine binding
     */
    encryptLicenseData(licenseKey) {
        const machineFingerprint = this.getMachineFingerprint();
        const timestamp = Date.now();
        
        const licenseData = {
            key: licenseKey,
            machine: machineFingerprint,
            activated: timestamp,
            version: '1.0.1'
        };

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.secretKey);
        
        let encrypted = cipher.update(JSON.stringify(licenseData), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            iv: iv.toString('hex'),
            data: encrypted
        };
    }

    /**
     * Decrypt and validate license data
     */
    decryptLicenseData(encryptedData) {
        try {
            const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
            
            let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            const licenseData = JSON.parse(decrypted);
            
            // Validate machine binding
            const currentMachine = this.getMachineFingerprint();
            if (licenseData.machine !== currentMachine) {
                console.warn('⚠️  License machine binding mismatch');
                return null;
            }
            
            return licenseData;
        } catch (error) {
            console.error('❌ License decryption failed:', error.message);
            return null;
        }
    }

    /**
     * Activate license with secure storage
     */
    activateLicense(licenseKey) {
        if (!this.validateLicenseKey(licenseKey)) {
            return {
                success: false,
                error: 'Invalid license key format'
            };
        }

        try {
            const encryptedData = this.encryptLicenseData(licenseKey);
            const licenseContent = JSON.stringify(encryptedData, null, 2);
            
            // Write main license file
            fs.writeFileSync(this.licenseFile, licenseContent, 'utf8');
            
            // Create backup
            fs.writeFileSync(this.backupFile, licenseContent, 'utf8');
            
            console.log('✅ License activated successfully');
            return {
                success: true,
                message: 'License activated successfully'
            };
            
        } catch (error) {
            console.error('❌ License activation failed:', error.message);
            return {
                success: false,
                error: 'License activation failed: ' + error.message
            };
        }
    }

    /**
     * Get stored license with fallback to backup
     */
    getStoredLicense() {
        try {
            // Try main license file
            if (fs.existsSync(this.licenseFile)) {
                const encryptedData = JSON.parse(fs.readFileSync(this.licenseFile, 'utf8'));
                const licenseData = this.decryptLicenseData(encryptedData);
                
                if (licenseData) {
                    return licenseData;
                }
            }
            
            // Fallback to backup
            if (fs.existsSync(this.backupFile)) {
                console.log('🔄 Recovering from backup license file');
                const encryptedData = JSON.parse(fs.readFileSync(this.backupFile, 'utf8'));
                const licenseData = this.decryptLicenseData(encryptedData);
                
                if (licenseData) {
                    // Restore main file from backup
                    fs.copyFileSync(this.backupFile, this.licenseFile);
                    return licenseData;
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ License retrieval failed:', error.message);
            return null;
        }
    }

    /**
     * Check if license is active and valid
     */
    isLicenseActive() {
        const licenseData = this.getStoredLicense();
        
        if (!licenseData) {
            return false;
        }
        
        // Additional validation
        if (!this.validateLicenseKey(licenseData.key)) {
            console.warn('⚠️  Stored license key is invalid');
            return false;
        }
        
        console.log('✅ License is active and valid');
        return true;
    }

    /**
     * Get license status information
     */
    getLicenseStatus() {
        const licenseData = this.getStoredLicense();
        
        if (!licenseData) {
            return {
                active: false,
                message: 'No license found'
            };
        }
        
        return {
            active: true,
            key: licenseData.key,
            activated: new Date(licenseData.activated).toLocaleDateString(),
            machine: licenseData.machine,
            version: licenseData.version
        };
    }

    /**
     * Deactivate license (remove from storage)
     */
    deactivateLicense() {
        try {
            if (fs.existsSync(this.licenseFile)) {
                fs.unlinkSync(this.licenseFile);
            }
            
            if (fs.existsSync(this.backupFile)) {
                fs.unlinkSync(this.backupFile);
            }
            
            console.log('✅ License deactivated successfully');
            return true;
            
        } catch (error) {
            console.error('❌ License deactivation failed:', error.message);
            return false;
        }
    }
}

module.exports = LicenseManager;
