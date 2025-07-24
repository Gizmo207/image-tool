// License management for the app
export class LicenseManager {
  static LICENSE_KEY = 'pro_license_key';
  
  static checkLicense() {
    const license = localStorage.getItem(this.LICENSE_KEY);
    return license && this.validateLicense(license);
  }
  
  static validateLicense(key) {
    // Simple validation - in production you'd want better security
    return key && key.length === 32 && key.includes('IMG_PRO');
  }
  
  static activateLicense(key) {
    if (this.validateLicense(key)) {
      localStorage.setItem(this.LICENSE_KEY, key);
      return true;
    }
    return false;
  }
  
  static generateLicense() {
    // This would be done server-side in production
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `IMG_PRO_${randomPart}_LIFETIME`;
  }
  
  static hasProLicense() {
    return this.checkLicense();
  }
  
  static getTrialDaysLeft() {
    const installDate = localStorage.getItem('install_date');
    if (!installDate) {
      localStorage.setItem('install_date', Date.now().toString());
      return 7;
    }
    
    const daysPassed = Math.floor((Date.now() - parseInt(installDate)) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysPassed);
  }
}
