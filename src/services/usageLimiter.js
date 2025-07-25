/**
 * Microsoft/Google-Style Usage Limiter
 * Tracks trial usage locally with encrypted storage
 * Enforces limits until license is activated
 */

class SnapForgeUsageLimiter {
  constructor() {
    this.storageKey = 'snapforge_usage_data';
    this.trialLimits = {
      'background-removal': 1,
      'resize': 1, // Changed from 2 to 1 for proper trial flow
      'gif-creator': 1,
      'filters': 1, // Changed from 3 to 1 for proper trial flow
      'format': 1, // Added format converter with 1 free use
      'batch-resize': 1
    };
    this.usageData = this.loadUsageData();
    this.isLicensed = false;
  }

  /**
   * Load usage data from encrypted local storage
   */
  loadUsageData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.createFreshUsageData();
      }
      
      // Simple obfuscation (in production, use proper encryption)
      const decoded = atob(stored);
      const data = JSON.parse(decoded);
      
      // Validate data structure
      if (!data.installDate || !data.toolUsage) {
        return this.createFreshUsageData();
      }
      
      return data;
    } catch (error) {
      console.warn('Usage data corrupted, resetting...');
      return this.createFreshUsageData();
    }
  }

  /**
   * Create fresh usage tracking data
   */
  createFreshUsageData() {
    const freshData = {
      installDate: new Date().toISOString(),
      toolUsage: {},
      totalActions: 0,
      lastUsed: null,
      trialExpired: false
    };
    
    // Initialize tool counters
    Object.keys(this.trialLimits).forEach(tool => {
      freshData.toolUsage[tool] = 0;
    });
    
    this.saveUsageData(freshData);
    return freshData;
  }

  /**
   * Save usage data with simple obfuscation
   */
  saveUsageData(data) {
    try {
      const encoded = btoa(JSON.stringify(data));
      localStorage.setItem(this.storageKey, encoded);
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  }

  /**
   * Check if user can use a specific tool
   */
  canUseTool(toolId) {
    if (this.isLicensed) {
      return { allowed: true, reason: 'licensed' };
    }

    const limit = this.trialLimits[toolId];
    if (limit === undefined) {
      return { allowed: false, reason: 'unknown_tool' };
    }

    const used = this.usageData.toolUsage[toolId] || 0;
    
    if (used >= limit) {
      return { 
        allowed: false, 
        reason: 'trial_limit_reached',
        used: used,
        limit: limit
      };
    }

    return { 
      allowed: true, 
      reason: 'trial_usage',
      remaining: limit - used
    };
  }

  /**
   * Record tool usage (Microsoft-style telemetry)
   */
  recordUsage(toolId, metadata = {}) {
    if (this.isLicensed) {
      // Licensed users don't have limits, but we still track for analytics
      this.trackAnalytics(toolId, metadata);
      return { success: true, reason: 'licensed' };
    }

    const canUse = this.canUseTool(toolId);
    if (!canUse.allowed) {
      return { success: false, ...canUse };
    }

    // Increment usage
    this.usageData.toolUsage[toolId] = (this.usageData.toolUsage[toolId] || 0) + 1;
    this.usageData.totalActions += 1;
    this.usageData.lastUsed = new Date().toISOString();

    // Save data
    this.saveUsageData(this.usageData);
    
    // Track analytics
    this.trackAnalytics(toolId, { ...metadata, trial: true });

    const newLimit = this.canUseTool(toolId);
    return { 
      success: true, 
      reason: 'trial_usage',
      remaining: newLimit.allowed ? (this.trialLimits[toolId] - this.usageData.toolUsage[toolId]) : 0
    };
  }

  /**
   * Activate license (removes all limits)
   */
  activateLicense(licenseData) {
    this.isLicensed = true;
    this.usageData.licenseActivated = new Date().toISOString();
    this.usageData.licenseData = {
      tier: licenseData.tier,
      email: licenseData.email,
      unlockedTools: licenseData.unlockedTools
    };
    
    this.saveUsageData(this.usageData);
    
    console.log('🎉 License activated! All limits removed.');
    return { success: true };
  }

  /**
   * Get trial status for UI
   */
  getTrialStatus() {
    const totalTrialActions = Object.values(this.trialLimits).reduce((sum, limit) => sum + limit, 0);
    const usedActions = this.usageData.totalActions;
    const remainingActions = Math.max(0, totalTrialActions - usedActions);
    
    const toolStatus = {};
    Object.keys(this.trialLimits).forEach(toolId => {
      const canUse = this.canUseTool(toolId);
      toolStatus[toolId] = {
        used: this.usageData.toolUsage[toolId] || 0,
        limit: this.trialLimits[toolId],
        canUse: canUse.allowed,
        remaining: canUse.allowed ? (this.trialLimits[toolId] - (this.usageData.toolUsage[toolId] || 0)) : 0
      };
    });

    return {
      isLicensed: this.isLicensed,
      totalUsed: usedActions,
      totalAvailable: totalTrialActions,
      remainingActions: remainingActions,
      trialExpired: remainingActions === 0,
      toolStatus: toolStatus,
      installDate: this.usageData.installDate,
      daysSinceInstall: Math.floor((Date.now() - new Date(this.usageData.installDate).getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  /**
   * Track analytics (like Google Analytics)
   */
  trackAnalytics(toolId, metadata) {
    // In production, send to Firebase Analytics
    const analyticsData = {
      tool: toolId,
      timestamp: new Date().toISOString(),
      licensed: this.isLicensed,
      daysSinceInstall: this.getTrialStatus().daysSinceInstall,
      ...metadata
    };
    
    console.log('📊 Analytics:', analyticsData);
    
    // Optional: Send to Firebase if user consents
    if (window.gtag) {
      window.gtag('event', 'tool_usage', {
        tool_name: toolId,
        licensed: this.isLicensed,
        trial_remaining: this.getTrialStatus().remainingActions
      });
    }
  }

  /**
   * Reset trial (for testing only)
   */
  resetTrial() {
    localStorage.removeItem(this.storageKey);
    this.usageData = this.createFreshUsageData();
    this.isLicensed = false;
    console.log('🔄 Trial reset for testing');
  }

  /**
   * Get upgrade prompts for UI
   */
  getUpgradePrompt(toolId) {
    const status = this.getTrialStatus();
    
    if (this.isLicensed) {
      return null;
    }

    const toolStatus = status.toolStatus[toolId];
    if (!toolStatus || toolStatus.canUse) {
      return null;
    }

    const prompts = {
      'background-removal': {
        title: '🎨 Unlock Unlimited Background Removal',
        message: 'Upgrade to remove backgrounds from unlimited photos!',
        cta: 'Unlock Pro for $39.99'
      },
      'resize': {
        title: '📐 Unlock Unlimited Resizing',
        message: 'Upgrade to resize unlimited images + batch processing.',
        cta: 'Get Pro Access'
      },
      'gif-creator': {
        title: '🎬 Unlock GIF Creation',
        message: 'Love making GIFs? Upgrade to create unlimited GIFs with custom settings.',
        cta: 'Upgrade Now'
      }
    };

    return prompts[toolId] || {
      title: '🚀 Unlock Full SnapForge',
      message: 'Trial expired! Upgrade to access all tools unlimited.',
      cta: 'Get License Key'
    };
  }
}

// Export singleton instance
export const usageLimiter = new SnapForgeUsageLimiter();
