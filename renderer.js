// SnapForge Renderer - License Activation UI
console.log('🚀 SnapForge Renderer loaded');

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initializeRenderer);

async function initializeRenderer() {
    console.log('🎯 Initializing SnapForge renderer...');
    
    await setupLicenseSystem();
    await setupAutoUpdater();
    setupToolStore();
    
    console.log('✅ SnapForge ready!');
}

// ===========================================
// 🔐 LICENSE SYSTEM UI
// ===========================================

async function setupLicenseSystem() {
    try {
        // Check if already licensed
        const existingLicense = await window.snapAPI.getStoredLicense();
        
        if (existingLicense && existingLicense.isValid) {
            showLicensedState(existingLicense);
        } else {
            showTrialState();
        }
        
        // Setup license form
        setupLicenseForm();
        
    } catch (error) {
        console.error('License system error:', error);
        showTrialState();
    }
}

function showLicensedState(license) {
    console.log('🎉 Pro license active:', license.key);
    
    // Update UI to show licensed state
    const statusElement = document.getElementById('license-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <div class="license-active">
                <h3>🎉 SnapForge Pro Active!</h3>
                <p><strong>License:</strong> ${maskLicenseKey(license.key)}</p>
                <p><strong>Features:</strong> All Premium Features Unlocked</p>
                <p><strong>Expires:</strong> Never (Lifetime License)</p>
                <p><strong>Machine:</strong> ${license.machineId || 'Unknown'}</p>
                <div class="pro-features">
                    <span class="feature">✅ Unlimited Usage</span>
                    <span class="feature">✅ AI Background Removal</span>
                    <span class="feature">✅ Batch Processing</span>
                    <span class="feature">✅ No Watermarks</span>
                    <span class="feature">✅ Premium Filters</span>
                    <span class="feature">✅ Auto Updates</span>
                </div>
            </div>
        `;
    }
    
    // Enable all premium features
    enablePremiumFeatures();
}

function showTrialState() {
    console.log('🔓 Trial mode active');
    
    const statusElement = document.getElementById('license-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <div class="license-trial">
                <h3>🔓 SnapForge Trial Mode</h3>
                <p>Limited features available. Upgrade to Pro for full access!</p>
                <button id="activate-license-btn" class="btn-primary">
                    🔐 I Have a License Key
                </button>
                <button id="buy-license-btn" class="btn-secondary">
                    💎 Buy SnapForge Pro
                </button>
                <div class="trial-limits">
                    <span class="limit">⚠️ 10 exports per day</span>
                    <span class="limit">⚠️ Watermarks on exports</span>
                    <span class="limit">⚠️ Basic features only</span>
                </div>
            </div>
        `;
    }
    
    // Limit features to trial mode
    enableTrialFeatures();
}

function setupLicenseForm() {
    // Create license activation modal
    const modal = document.createElement('div');
    modal.id = 'license-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔑 Activate SnapForge Pro</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <p>Enter your lifetime license key to unlock all premium features:</p>
                <div class="license-form">
                    <input type="text" id="license-key-input" 
                           placeholder="IMG_PRO_xxxxx_LIFETIME" 
                           maxlength="50">
                    <div class="form-buttons">
                        <button id="activate-btn" class="btn-primary">
                            ✅ Activate License
                        </button>
                        <button id="cancel-btn" class="btn-secondary">
                            ❌ Cancel
                        </button>
                    </div>
                </div>
                <div id="activation-status" class="status-message"></div>
                <div class="help-text">
                    <p><strong>License Format:</strong> IMG_PRO_xxxxx_LIFETIME</p>
                    <p><strong>Need Help?</strong> Contact support@snapforge.com</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Setup event handlers
    document.addEventListener('click', handleLicenseEvents);
}

async function handleLicenseEvents(event) {
    const target = event.target;
    
    if (target.id === 'activate-license-btn') {
        showLicenseModal();
    }
    
    if (target.id === 'buy-license-btn') {
        window.open('https://snapforge.net/buy', '_blank');
    }
    
    if (target.id === 'activate-btn') {
        await activateLicense();
    }
    
    if (target.id === 'cancel-btn' || target.classList.contains('close')) {
        hideLicenseModal();
    }
}

function showLicenseModal() {
    const modal = document.getElementById('license-modal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('license-key-input').focus();
    }
}

function hideLicenseModal() {
    const modal = document.getElementById('license-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('license-key-input').value = '';
        document.getElementById('activation-status').innerHTML = '';
    }
}

async function activateLicense() {
    const keyInput = document.getElementById('license-key-input');
    const statusDiv = document.getElementById('activation-status');
    const activateBtn = document.getElementById('activate-btn');
    
    const licenseKey = keyInput.value.trim();
    
    if (!licenseKey) {
        showStatus('Please enter a license key', 'error');
        return;
    }
    
    activateBtn.disabled = true;
    activateBtn.textContent = '⏳ Activating...';
    
    try {
        const result = await window.snapAPI.activateLicense(licenseKey);
        
        if (result.success) {
            showStatus('🎉 License activated successfully!', 'success');
            setTimeout(() => {
                hideLicenseModal();
                showLicensedState(result.license);
            }, 2000);
        } else {
            showStatus(`❌ Activation failed: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('License activation error:', error);
        showStatus('❌ Activation failed. Please try again.', 'error');
    }
    
    activateBtn.disabled = false;
    activateBtn.textContent = '✅ Activate License';
    
    function showStatus(message, type) {
        statusDiv.innerHTML = `<div class="status-${type}">${message}</div>`;
    }
}

function maskLicenseKey(key) {
    if (!key || key.length < 8) return 'Invalid';
    return key.substring(0, 8) + '****' + key.substring(key.length - 4);
}

// ===========================================
// 🔄 AUTO-UPDATER UI
// ===========================================

async function setupAutoUpdater() {
    // Listen for update events
    if (window.snapAPI) {
        window.snapAPI.onUpdateAvailable((info) => {
            showUpdateNotification(info);
        });
        
        window.snapAPI.onUpdateDownloaded(() => {
            showUpdateReadyNotification();
        });
        
        window.snapAPI.onDownloadProgress((progress) => {
            updateDownloadProgress(progress);
        });
    }
    
    // Check for updates on startup (after 5 seconds)
    setTimeout(() => {
        checkForUpdates();
    }, 5000);
}

async function checkForUpdates() {
    try {
        console.log('🔍 Checking for updates...');
        await window.snapAPI.checkForUpdates();
    } catch (error) {
        console.error('Update check failed:', error);
    }
}

function showUpdateNotification(updateInfo) {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <h4>🚀 Update Available!</h4>
            <p>SnapForge ${updateInfo.version} is available</p>
            <div class="update-buttons">
                <button id="download-update-btn" class="btn-primary">
                    📥 Download Update
                </button>
                <button id="skip-update-btn" class="btn-secondary">
                    ⏭️ Skip
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 30000);
    
    // Handle buttons
    notification.addEventListener('click', async (e) => {
        if (e.target.id === 'download-update-btn') {
            await window.snapAPI.downloadUpdate();
            notification.remove();
        }
        if (e.target.id === 'skip-update-btn') {
            notification.remove();
        }
    });
}

function showUpdateReadyNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-ready-notification';
    notification.innerHTML = `
        <div class="update-content">
            <h4>✅ Update Downloaded!</h4>
            <p>SnapForge will restart to apply the update</p>
            <div class="update-buttons">
                <button id="install-update-btn" class="btn-primary">
                    🔄 Restart & Update
                </button>
                <button id="later-update-btn" class="btn-secondary">
                    ⏰ Later
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.addEventListener('click', async (e) => {
        if (e.target.id === 'install-update-btn') {
            await window.snapAPI.installUpdate();
        }
        if (e.target.id === 'later-update-btn') {
            notification.remove();
        }
    });
}

function updateDownloadProgress(progress) {
    let progressBar = document.getElementById('update-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'update-progress';
        progressBar.className = 'update-progress';
        progressBar.innerHTML = `
            <div class="progress-content">
                <p>📥 Downloading update...</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0%</span>
            </div>
        `;
        document.body.appendChild(progressBar);
    }
    
    const fill = progressBar.querySelector('.progress-fill');
    const text = progressBar.querySelector('.progress-text');
    
    if (fill && text) {
        const percent = Math.round(progress.percent);
        fill.style.width = `${percent}%`;
        text.textContent = `${percent}%`;
    }
}

// ===========================================
// 🛠️ TOOL STORE UI
// ===========================================

function setupToolStore() {
    // Create tool store button
    const toolButton = document.createElement('button');
    toolButton.id = 'tool-store-btn';
    toolButton.className = 'tool-store-button';
    toolButton.innerHTML = '🛠️ Tool Store';
    toolButton.title = 'Browse additional tools and plugins';
    
    // Add to header if exists
    const header = document.querySelector('.header') || document.body;
    header.appendChild(toolButton);
    
    toolButton.addEventListener('click', openToolStore);
}

function openToolStore() {
    window.open('https://snapforge.net/tools', '_blank');
}

// ===========================================
// 🎯 FEATURE MANAGEMENT
// ===========================================

function enablePremiumFeatures() {
    console.log('🎉 Enabling premium features...');
    
    // Remove trial limitations
    document.body.classList.remove('trial-mode');
    document.body.classList.add('pro-mode');
    
    // Enable all premium UI elements
    const premiumElements = document.querySelectorAll('.premium-feature');
    premiumElements.forEach(element => {
        element.classList.remove('disabled');
        element.removeAttribute('disabled');
    });
    
    // Remove watermarks
    const watermarks = document.querySelectorAll('.watermark');
    watermarks.forEach(wm => wm.remove());
    
    // Enable batch processing
    enableBatchProcessing();
    
    // Enable AI features
    enableAIFeatures();
    
    console.log('✅ Premium features active!');
}

function enableTrialFeatures() {
    console.log('🔓 Trial mode limitations active');
    
    document.body.classList.add('trial-mode');
    document.body.classList.remove('pro-mode');
    
    // Disable premium features
    const premiumElements = document.querySelectorAll('.premium-feature');
    premiumElements.forEach(element => {
        element.classList.add('disabled');
        element.setAttribute('disabled', 'true');
    });
    
    // Add trial limitations
    addTrialLimitations();
}

function enableBatchProcessing() {
    const batchButton = document.getElementById('batch-process-btn');
    if (batchButton) {
        batchButton.disabled = false;
        batchButton.title = 'Process multiple images at once';
    }
}

function enableAIFeatures() {
    const aiButtons = document.querySelectorAll('.ai-feature');
    aiButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
    });
}

function addTrialLimitations() {
    // Add watermark to export previews
    const exportPreviews = document.querySelectorAll('.export-preview');
    exportPreviews.forEach(preview => {
        if (!preview.querySelector('.watermark')) {
            const watermark = document.createElement('div');
            watermark.className = 'watermark';
            watermark.textContent = 'SNAPFORGE TRIAL';
            preview.appendChild(watermark);
        }
    });
    
    // Limit export count
    window.snapForgeTrialExports = window.snapForgeTrialExports || 0;
}

// ===========================================
// 🎨 STYLING
// ===========================================

// Inject CSS styles
const styles = `
<style>
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.8);
}

.modal-content {
    background-color: #2d3748;
    margin: 10% auto;
    padding: 0;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    color: white;
}

.modal-header {
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.close {
    font-size: 2rem;
    cursor: pointer;
    opacity: 0.7;
}

.close:hover {
    opacity: 1;
}

.modal-body {
    padding: 20px;
}

.license-form {
    margin: 20px 0;
}

.license-form input {
    width: 100%;
    padding: 15px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    background: #1a202c;
    color: white;
    font-size: 1.1rem;
    font-family: monospace;
    text-align: center;
    margin-bottom: 15px;
}

.license-form input:focus {
    outline: none;
    border-color: #667eea;
}

.form-buttons {
    display: flex;
    gap: 10px;
}

.btn-primary, .btn-secondary {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(72, 187, 120, 0.4);
}

.btn-secondary {
    background: #4a5568;
    color: white;
}

.btn-secondary:hover {
    background: #2d3748;
}

.status-success {
    background: #48bb78;
    color: white;
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
}

.status-error {
    background: #f56565;
    color: white;
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
}

.help-text {
    background: #1a202c;
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
    font-size: 0.9rem;
}

.license-active {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    padding: 20px;
    border-radius: 10px;
    color: white;
    text-align: center;
}

.license-trial {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    padding: 20px;
    border-radius: 10px;
    color: white;
    text-align: center;
}

.pro-features, .trial-limits {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
}

.feature, .limit {
    background: rgba(255,255,255,0.2);
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.9rem;
}

.update-notification, .update-ready-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2d3748;
    color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 1000;
    max-width: 350px;
}

.update-buttons {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.update-progress {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2d3748;
    color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 1000;
    min-width: 300px;
}

.progress-bar {
    width: 100%;
    height: 10px;
    background: #4a5568;
    border-radius: 5px;
    overflow: hidden;
    margin: 10px 0;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #48bb78, #38a169);
    transition: width 0.3s ease;
}

.progress-text {
    font-weight: bold;
    text-align: center;
    display: block;
}

.tool-store-button {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 15px 20px;
    border-radius: 25px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
}

.tool-store-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.trial-mode .premium-feature {
    opacity: 0.5;
    position: relative;
}

.trial-mode .premium-feature::after {
    content: "🔒 Pro Only";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.8rem;
    pointer-events: none;
}

.watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 2rem;
    font-weight: bold;
    color: rgba(255,255,255,0.3);
    pointer-events: none;
    z-index: 100;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', styles);

console.log('🎨 SnapForge renderer styles loaded');
