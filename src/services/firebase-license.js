// Firebase Configuration for SnapForge License & Tool Management
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAxF6B1VlnEG_iIZw40AjI4sPeiU2QdvQE",
  authDomain: "snapforge-ab371.firebaseapp.com",
  projectId: "snapforge-ab371",
  storageBucket: "snapforge-ab371.firebasestorage.app",
  messagingSenderId: "1007958939902",
  appId: "1:1007958939902:web:74e14efc17fd540867edaf",
  measurementId: "G-DF43TTLMXP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

class SnapForgeLicenseManager {
  constructor() {
    this.currentUser = null;
    this.availableTools = new Map();
    this.unlockedTools = new Set();
  }

  /**
   * Validate license key and unlock tools
   * Called when user enters their Gumroad license key
   */
  async validateLicense(licenseKey) {
    try {
      console.log('🔐 Validating license key...');
      
      // Check license in Firestore
      const licenseDoc = await getDoc(doc(db, 'licenses', licenseKey));
      
      if (!licenseDoc.exists()) {
        throw new Error('Invalid license key. Please check your Gumroad purchase email.');
      }
      
      const licenseData = licenseDoc.data();
      
      // Check if license is active
      if (!licenseData.active) {
        throw new Error('License has been deactivated. Contact support.');
      }
      
      // Set current user
      this.currentUser = {
        licenseKey: licenseKey,
        email: licenseData.email,
        purchaseDate: licenseData.purchaseDate,
        tier: licenseData.tier || 'basic', // basic, pro, enterprise
        unlockedTools: licenseData.unlockedTools || ['background-removal']
      };
      
      // Unlock tools for this user
      this.unlockedTools = new Set(this.currentUser.unlockedTools);
      
      console.log('✅ License validated successfully!');
      console.log(`Welcome back! Unlocked tools: ${Array.from(this.unlockedTools).join(', ')}`);
      
      return {
        success: true,
        user: this.currentUser,
        message: 'License activated successfully!'
      };
      
    } catch (error) {
      console.error('❌ License validation failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get all available tools from Firebase
   * This allows you to add new tools without app updates
   */
  async getAvailableTools() {
    try {
      console.log('🛠️ Fetching available tools...');
      
      const toolsCollection = collection(db, 'tools');
      const toolsSnapshot = await getDocs(toolsCollection);
      
      const tools = [];
      toolsSnapshot.forEach((doc) => {
        const toolData = { id: doc.id, ...doc.data() };
        tools.push(toolData);
        this.availableTools.set(doc.id, toolData);
      });
      
      console.log(`📦 Found ${tools.length} available tools`);
      return tools;
      
    } catch (error) {
      console.error('❌ Failed to fetch tools:', error.message);
      return [];
    }
  }

  /**
   * Check if user has access to a specific tool
   */
  hasAccess(toolId) {
    return this.unlockedTools.has(toolId);
  }

  /**
   * Download AI model or tool files on-demand
   * Only downloads if user has access
   */
  async downloadTool(toolId) {
    try {
      if (!this.hasAccess(toolId)) {
        throw new Error(`Access denied. Purchase required for ${toolId}.`);
      }
      
      const tool = this.availableTools.get(toolId);
      if (!tool) {
        throw new Error(`Tool ${toolId} not found.`);
      }
      
      console.log(`📥 Downloading ${tool.name}...`);
      
      // Get download URL from Firebase Storage
      const downloadRef = ref(storage, tool.downloadPath);
      const downloadUrl = await getDownloadURL(downloadRef);
      
      // Download file (you can add progress tracking here)
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      console.log(`✅ ${tool.name} downloaded successfully!`);
      
      return {
        success: true,
        data: blob,
        tool: tool
      };
      
    } catch (error) {
      console.error(`❌ Download failed:`, error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Purchase additional tool (upsell flow)
   */
  async purchaseAdditionalTool(toolId, paymentData) {
    try {
      console.log(`💳 Processing purchase for ${toolId}...`);
      
      // In real implementation, integrate with Stripe/Gumroad
      // For now, simulate successful purchase
      
      // Add tool to user's unlocked tools
      this.unlockedTools.add(toolId);
      this.currentUser.unlockedTools.push(toolId);
      
      // Update in Firestore
      await setDoc(doc(db, 'licenses', this.currentUser.licenseKey), {
        ...this.currentUser,
        lastUpdated: new Date()
      }, { merge: true });
      
      console.log(`✅ ${toolId} unlocked successfully!`);
      
      return {
        success: true,
        message: `${toolId} has been added to your account!`
      };
      
    } catch (error) {
      console.error('❌ Purchase failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get user's current status and unlocked tools
   */
  getUserStatus() {
    return {
      isLicensed: !!this.currentUser,
      user: this.currentUser,
      unlockedTools: Array.from(this.unlockedTools),
      availableTools: Array.from(this.availableTools.values())
    };
  }
}

// Export singleton instance
export const licenseManager = new SnapForgeLicenseManager();
