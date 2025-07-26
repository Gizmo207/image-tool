# SnapForge Test Gauntlet 🎯

## Enterprise-Grade Test Automation Suite

The SnapForge Test Gauntlet is a comprehensive automated testing framework that validates the complete user journey from initial install through license activation and trial limitations. This test suite ensures enterprise-level quality assurance for the install→checkout→unlock→trial workflow.

## 🏗️ Test Architecture

### Core Test Suites

1. **Quick Validation** (`snapforge-quick-validation.spec.js`)
   - Basic smoke tests and application health validation
   - Performance benchmarking and load time measurement
   - JavaScript error detection and console monitoring
   - Cross-browser compatibility verification

2. **First Launch Experience** (`snapforge-first-launch.spec.js`)
   - New user onboarding flow validation
   - First-time user experience testing
   - Trial state initialization verification
   - Accessibility testing for new users

3. **Trial Limitations** (`snapforge-trial-limiter.spec.js`)
   - Usage counter and trial enforcement testing
   - Premium feature blocking validation
   - Trial reset and development utilities
   - Storage persistence and state recovery

4. **License Unlock** (`snapforge-license-unlock.spec.js`)
   - License key entry and validation
   - Premium feature unlock verification
   - Trial mode to premium transition
   - License activation workflow testing

5. **Checkout Simulation** (`snapforge-checkout-simulation.spec.js`)
   - Payment flow and purchase process validation
   - Checkout redirect and success state verification
   - Modal functionality and user interface testing
   - Payment provider integration validation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- SnapForge development server running on `http://localhost:3001`
- Playwright test framework dependencies

### Installation
```bash
# Install dependencies (if not already done)
npm install @playwright/test

# Generate test assets
npm run generate-assets

# Install Playwright browsers
npx playwright install
```

### Running Tests

#### Full Test Gauntlet (Recommended)
```bash
npm test
# or
npm run test:gauntlet
```

#### Individual Test Suites
```bash
# Quick smoke tests
npm run test:quick

# License unlock testing
npm run test:license

# Checkout flow simulation
npm run test:checkout

# Trial limitation enforcement
npm run test:trial

# First-time user experience
npm run test:first
```

#### Browser-Specific Testing
```bash
# Chrome only
npm run test:chrome

# Firefox only
npm run test:firefox

# Safari only
npm run test:safari
```

#### Advanced Options
```bash
# Run with browser UI visible
npm run test:headed

# Interactive debugging
npm run test:debug

# Open test UI
npm run test:ui

# View HTML report
npm run test:report
```

## 📊 Test Coverage

### User Journey Validation
- ✅ **Installation Flow**: First launch and setup
- ✅ **Trial Experience**: Usage limits and restrictions
- ✅ **Purchase Flow**: Checkout and payment simulation
- ✅ **License Activation**: Premium unlock workflow
- ✅ **Feature Access**: Trial vs premium feature differentiation

### Technical Validation
- ✅ **Performance**: Load times under 10 seconds
- ✅ **Error Monitoring**: Zero JavaScript console errors
- ✅ **Cross-Browser**: Chrome, Firefox, Safari compatibility
- ✅ **Accessibility**: Keyboard navigation and ARIA compliance
- ✅ **Storage**: LocalStorage persistence and state management

### Quality Metrics
- **Test Count**: 40+ individual test scenarios
- **Browser Coverage**: 3 major browsers (Chrome, Firefox, Safari)
- **Success Rate**: 100% pass rate on valid builds
- **Execution Time**: Full gauntlet completes in under 5 minutes
- **Reporting**: Comprehensive HTML reports with screenshots

## 🎮 Test Runner Features

The custom test runner (`test-runner.js`) provides:

### Command Line Interface
```bash
# Show help
node test-runner.js --help

# Run specific test suites
node test-runner.js --quick
node test-runner.js --license
node test-runner.js --checkout
node test-runner.js --trial
node test-runner.js --first
```

### Automated Reporting
- ✅ Color-coded console output
- ✅ Execution time tracking
- ✅ Pass/fail summary statistics
- ✅ Automatic HTML report opening
- ✅ Exit codes for CI/CD integration

### Prerequisites Validation
- ✅ Playwright installation verification
- ✅ Test asset availability checking
- ✅ Browser dependencies validation
- ✅ Development server connectivity

## 🔧 Configuration

### Playwright Configuration (`playwright.config.js`)
```javascript
// Key settings for SnapForge testing
{
  baseURL: 'http://localhost:3001',
  timeout: 30000,
  retries: 2,
  browsers: ['chromium', 'firefox', 'webkit'],
  reporter: [['html'], ['list']]
}
```

### Test Assets (`test-assets/`)
Auto-generated test files include:
- `small.png` - Basic image testing
- `large.jpg` - Performance testing
- `corrupt.fake` - Error handling validation
- `animated.gif` - GIF processing tests
- Various size and format combinations

## 📈 Continuous Integration

### GitHub Actions Integration
```yaml
- name: Run SnapForge Test Gauntlet
  run: |
    npm install
    npm run generate-assets
    npx playwright install --with-deps
    npm test
```

### Exit Codes
- `0` - All tests passed
- `1` - One or more test suites failed

### Test Artifacts
- HTML reports saved to `playwright-report/`
- Screenshots captured on failures
- Video recordings for failed tests
- JSON test results for parsing

## 🛠️ Development Guidelines

### Adding New Tests
1. Create new `.spec.js` file in `tests/` directory
2. Follow existing naming convention: `snapforge-[feature].spec.js`
3. Add to test runner configuration
4. Update package.json scripts
5. Document in this README

### Test Structure
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('specific behavior', async ({ page }) => {
    // Test implementation
    console.log('📝 Test description');
    // Assertions
    expect(condition).toBe(expected);
  });
});
```

### Best Practices
- ✅ Use descriptive console logging with emojis
- ✅ Implement flexible selector strategies
- ✅ Handle timeouts gracefully
- ✅ Clear storage state when needed
- ✅ Test both success and failure scenarios

## 🐛 Troubleshooting

### Common Issues

**Tests fail with timeout errors**
- Ensure development server is running on `http://localhost:3001`
- Check browser installations: `npx playwright install`
- Verify test assets exist: `npm run generate-assets`

**Cross-browser inconsistencies**
- Review browser-specific selectors
- Check timing and wait strategies
- Validate CSS compatibility

**Storage state issues**
- Clear browser data between test runs
- Use `test.use({ storageState: undefined })` for fresh sessions
- Verify localStorage/sessionStorage clearing

### Debug Mode
```bash
# Run tests with browser visible
npm run test:headed

# Interactive debugging
npm run test:debug

# Run single test file
npx playwright test tests/snapforge-quick-validation.spec.js --headed --debug
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [SnapForge Development Guide](./DEVELOPMENT.md)
- [Test Asset Generation](./generate-test-assets.js)
- [HTML Test Reports](./playwright-report/index.html)

## 🎉 Success Metrics

When all tests pass, you'll see:
```
🎉 All test suites passed! SnapForge is ready for production.

✅ Passed: 5 suites
❌ Failed: 0 suites

📊 Detailed Results:
   ✅ Quick Validation (8s)
   ✅ First Launch Experience (12s)
   ✅ Trial Limitations (15s)
   ✅ License Unlock (10s)
   ✅ Checkout Simulation (9s)
```

This indicates your SnapForge build has passed enterprise-level quality validation and is ready for distribution.

---

**SnapForge Test Gauntlet** - Ensuring excellence in every user journey 🎯
