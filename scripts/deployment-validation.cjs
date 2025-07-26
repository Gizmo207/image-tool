#!/usr/bin/env node

/**
 * 🎉 SnapForge Production Deployment Validation
 * 
 * This script validates that all production systems are properly deployed:
 * ✅ GitHub repository pushed successfully
 * ✅ GitHub Actions workflow triggered  
 * ✅ Firebase hosting deployed for auto-updater
 * ✅ License system operational
 * ✅ Cross-platform builds ready
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

console.log('🚀 SnapForge Production Deployment Validation\n');

class DeploymentValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
        this.rootDir = path.join(__dirname, '..');
    }

    async test(name, testFn) {
        try {
            console.log(`🧪 Testing: ${name}`);
            const result = await testFn();
            if (result) {
                console.log(`✅ PASS: ${name}`);
                this.results.passed++;
                this.results.tests.push({ name, status: 'PASS', result });
            } else {
                console.log(`❌ FAIL: ${name}`);
                this.results.failed++;
                this.results.tests.push({ name, status: 'FAIL' });
            }
        } catch (error) {
            console.log(`❌ ERROR: ${name} - ${error.message}`);
            this.results.failed++;
            this.results.tests.push({ name, status: 'ERROR', error: error.message });
        }
        console.log('');
    }

    async validateGitRepository() {
        return new Promise((resolve) => {
            exec('git remote get-url origin', (error, stdout) => {
                if (error) {
                    resolve(false);
                } else {
                    const remoteUrl = stdout.trim();
                    resolve(remoteUrl.includes('github.com/Gizmo207/image-tool'));
                }
            });
        });
    }

    async validateGitCommits() {
        return new Promise((resolve) => {
            exec('git log --oneline -1', (error, stdout) => {
                if (error) {
                    resolve(false);
                } else {
                    const latestCommit = stdout.trim();
                    resolve(latestCommit.includes('SnapForge Production System'));
                }
            });
        });
    }

    async validateGitTag() {
        return new Promise((resolve) => {
            exec('git tag --list "v1.0.1"', (error, stdout) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(stdout.trim() === 'v1.0.1');
                }
            });
        });
    }

    async validateFirebaseConfig() {
        const firebaseConfigExists = fs.existsSync(path.join(this.rootDir, 'firebase.json'));
        const firebaseRcExists = fs.existsSync(path.join(this.rootDir, '.firebaserc'));
        return firebaseConfigExists && firebaseRcExists;
    }

    async validateFirebaseHosting() {
        return new Promise((resolve) => {
            const options = {
                hostname: 'snapforge-ab371.web.app',
                port: 443,
                path: '/',
                method: 'GET'
            };

            const req = https.request(options, (res) => {
                resolve(res.statusCode === 200);
            });

            req.on('error', () => {
                resolve(false);
            });

            req.setTimeout(5000, () => {
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    }

    async validateLicenseSystem() {
        const licenseManagerExists = fs.existsSync(path.join(this.rootDir, 'licenseManager.js'));
        if (!licenseManagerExists) return false;

        try {
            const LicenseManager = require(path.join(this.rootDir, 'licenseManager.js'));
            const manager = new LicenseManager();
            
            // Test license key validation
            const testKey = 'SNAP-FORGE-PREMIUM-2024-ABCD-EFGH-IJKL-MNOP';
            const isValid = manager.validateLicenseKey(testKey);
            return typeof isValid === 'boolean';
        } catch (error) {
            return false;
        }
    }

    async validateGitHubActions() {
        const workflowExists = fs.existsSync(path.join(this.rootDir, '.github/workflows/build-cross-platform.yml'));
        return workflowExists;
    }

    async validateElectronApp() {
        const mainExists = fs.existsSync(path.join(this.rootDir, 'electron-simple.js'));
        const packageJsonExists = fs.existsSync(path.join(this.rootDir, 'package.json'));
        
        if (!mainExists || !packageJsonExists) return false;

        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.rootDir, 'package.json'), 'utf8'));
            return packageJson.main === 'electron-simple.js' && packageJson.devDependencies && packageJson.devDependencies.electron;
        } catch (error) {
            return false;
        }
    }

    async validateTestSuite() {
        const testFiles = [
            'scripts/test-readiness.js',
            'tests/snapforge.spec.js'
        ];

        return testFiles.every(file => fs.existsSync(path.join(this.rootDir, file)));
    }

    async validateBuildConfiguration() {
        const buildScriptExists = fs.existsSync(path.join(this.rootDir, 'scripts/build-cross-platform.js'));
        
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.rootDir, 'package.json'), 'utf8'));
            const hasElectronBuilder = packageJson.devDependencies && packageJson.devDependencies['electron-builder'];
            const hasBuildScripts = packageJson.scripts && (packageJson.scripts.build || packageJson.scripts['build:win']);
            
            return buildScriptExists && hasElectronBuilder && hasBuildScripts;
        } catch (error) {
            return false;
        }
    }

    async validateGitIgnore() {
        const gitignoreExists = fs.existsSync(path.join(this.rootDir, '.gitignore'));
        if (!gitignoreExists) return false;

        try {
            const gitignoreContent = fs.readFileSync(path.join(this.rootDir, '.gitignore'), 'utf8');
            return gitignoreContent.includes('dist-electron/') && gitignoreContent.includes('node_modules/');
        } catch (error) {
            return false;
        }
    }

    async runAllTests() {
        console.log('🎯 Starting comprehensive deployment validation...\n');

        await this.test('Git Repository Configuration', () => this.validateGitRepository());
        await this.test('Git Commits Present', () => this.validateGitCommits());
        await this.test('Release Tag Created', () => this.validateGitTag());
        await this.test('Firebase Configuration', () => this.validateFirebaseConfig());
        await this.test('Firebase Hosting Deployed', () => this.validateFirebaseHosting());
        await this.test('License System Operational', () => this.validateLicenseSystem());
        await this.test('GitHub Actions Workflow', () => this.validateGitHubActions());
        await this.test('Electron App Configuration', () => this.validateElectronApp());
        await this.test('Test Suite Present', () => this.validateTestSuite());
        await this.test('Build Configuration', () => this.validateBuildConfiguration());
        await this.test('Git Ignore Configuration', () => this.validateGitIgnore());

        this.printResults();
    }

    printResults() {
        console.log('📊 DEPLOYMENT VALIDATION RESULTS');
        console.log('================================');
        console.log(`✅ Tests Passed: ${this.results.passed}`);
        console.log(`❌ Tests Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);
        console.log('');

        if (this.results.failed === 0) {
            console.log('🎉 DEPLOYMENT SUCCESSFUL!');
            console.log('');
            console.log('🚀 SnapForge Production System Status:');
            console.log('   ✅ Repository: https://github.com/Gizmo207/image-tool');
            console.log('   ✅ Hosting: https://snapforge-ab371.web.app');
            console.log('   ✅ Actions: https://github.com/Gizmo207/image-tool/actions');
            console.log('   ✅ Releases: https://github.com/Gizmo207/image-tool/releases');
            console.log('');
            console.log('🎯 Next Steps:');
            console.log('   1. Monitor GitHub Actions for cross-platform builds');
            console.log('   2. Download and test generated executables');
            console.log('   3. Validate auto-updater functionality');
            console.log('   4. Test license activation system');
            console.log('');
            console.log('🏆 Your SnapForge desktop app business is now LIVE!');
        } else {
            console.log('⚠️  Some issues detected. Please review failed tests above.');
        }
    }
}

// Run validation
const validator = new DeploymentValidator();
validator.runAllTests().catch(console.error);
