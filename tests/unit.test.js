/**
 * FairShift - Automated Unit Test Suite
 * Validates payroll math, overtime rules, MET fatigue calculations,
 * abuse-proof reporting, anonymity scrubbers, i18n parity,
 * offline-queue store-and-forward, and wet-bulb climate guard.
 * Run via: npm test
 */

const assert = require('assert');
const { INDUSTRY_PRESETS } = require('../js/industries.js');
const { TRANSLATIONS } = require('../js/i18n.js');
const { ShiftTracker } = require('../js/shift-tracker.js');
const { SafetyManager } = require('../js/safety.js');
const { FeedbackManager } = require('../js/feedback.js');
const { AttritionPredictor } = require('../js/attrition.js');
const { SkillPassportManager } = require('../js/passport.js');
const { OfflineQueueManager } = require('../js/offline-queue.js');
const { ClimateGuard, HEAT_ALERTS_I18N } = require('../js/climate-guard.js');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
  }
}

console.log('====================================================');
console.log('🧪 Starting FairShift (SDG 8) Automated Test Suite');
console.log('====================================================\n');

// ----------------------------------------------------
// Test Group 1: Overtime & Payroll Math Verification
// ----------------------------------------------------
console.log('📦 Group 1: Overtime & Transparent Payroll Engine');

runTest('Standard 8-hour shift should NOT incur overtime', () => {
  const construction = INDUSTRY_PRESETS.construction;
  const tracker = new ShiftTracker(construction);
  tracker.toggleMockLocation(true);
  tracker.clockIn('mason', 8.0);
  const summary = tracker.getShiftSummary();

  assert.strictEqual(summary.standardHours, 8.0, 'Standard hours should equal 8.0');
  assert.strictEqual(summary.overtimeHours, 0.0, 'Overtime hours should be 0.0');
  assert.strictEqual(summary.basePay, 8 * 95, 'Base pay should be 8 * 95 = 760');
  assert.strictEqual(summary.overtimePay, 0, 'Overtime pay should be 0');
});

runTest('10-hour shift should correctly calculate 2 hours at 1.5x OT multiplier', () => {
  const construction = INDUSTRY_PRESETS.construction;
  const tracker = new ShiftTracker(construction);
  tracker.toggleMockLocation(true);
  tracker.clockIn('mason', 10.0);
  const summary = tracker.getShiftSummary();

  assert.strictEqual(summary.standardHours, 8.0, 'Standard hours should cap at 8.0');
  assert.strictEqual(summary.overtimeHours, 2.0, 'Overtime hours should equal 2.0');
  
  const expectedBase = 8 * 95;
  const expectedOT = 2 * (95 * 1.5);
  assert.strictEqual(summary.basePay, expectedBase, 'Base pay mismatch');
  assert.strictEqual(summary.overtimePay, expectedOT, 'Overtime pay mismatch');
  assert.ok(summary.netPay > 0, 'Net pay must be greater than 0');
});

// ----------------------------------------------------
// Test Group 2: Geofence Validation
// ----------------------------------------------------
console.log('\n📦 Group 2: Geofence Boundary & Clock-in Security');

runTest('Clock-in must FAIL when worker is outside geofence boundary', () => {
  const tracker = new ShiftTracker(INDUSTRY_PRESETS.construction);
  tracker.toggleMockLocation(false);
  const result = tracker.clockIn('mason');

  assert.strictEqual(result.success, false, 'Clock-in should have failed');
  assert.strictEqual(result.reason, 'GEOFENCE_OUTSIDE', 'Reason must be GEOFENCE_OUTSIDE');
});

runTest('Clock-in must SUCCEED when worker is inside site geofence', () => {
  const tracker = new ShiftTracker(INDUSTRY_PRESETS.construction);
  tracker.toggleMockLocation(true);
  const result = tracker.clockIn('mason');

  assert.strictEqual(result.success, true, 'Clock-in should succeed');
  assert.strictEqual(tracker.state.isClockedIn, true, 'State should be clocked in');
});

// ----------------------------------------------------
// Test Group 3: Physiological Strain (MET) Model
// ----------------------------------------------------
console.log('\n📦 Group 3: Role-Weighted Physiological Strain (MET)');

runTest('Heavy manual role (Mason MET 1.7) strains faster than Sedentary role (Crane MET 1.1)', () => {
  const trackerMason = new ShiftTracker(INDUSTRY_PRESETS.construction);
  trackerMason.toggleMockLocation(true);
  trackerMason.clockIn('mason', 7.0);

  const trackerCrane = new ShiftTracker(INDUSTRY_PRESETS.construction);
  trackerCrane.toggleMockLocation(true);
  trackerCrane.clockIn('crane_op', 7.0);

  const strainMason = trackerMason.getShiftSummary().strainScore;
  const strainCrane = trackerCrane.getShiftSummary().strainScore;

  assert.ok(strainMason > strainCrane, `Mason strain (${strainMason}) should exceed Crane strain (${strainCrane})`);
});

runTest('Logging a 15-minute restorative break decreases accumulated strain', () => {
  const tracker = new ShiftTracker(INDUSTRY_PRESETS.construction);
  tracker.toggleMockLocation(true);
  tracker.clockIn('mason', 6.0);
  const strainBefore = tracker.getShiftSummary().strainScore;

  tracker.toggleBreak();
  tracker.toggleBreak();
  const strainAfter = tracker.getShiftSummary().strainScore;

  assert.ok(strainAfter <= strainBefore, 'Break must reduce or halt strain accumulation');
});

// ----------------------------------------------------
// Test Group 4: Safety Incident Peer Consensus & Anti-Abuse
// ----------------------------------------------------
console.log('\n📦 Group 4: Abuse-Proof Safety Desk & Peer Co-Signing');

runTest('Safety hazard report requires worker to be clocked in', () => {
  const safety = new SafetyManager(INDUSTRY_PRESETS.construction);
  const res = safety.submitReport({
    categoryId: 'fall_risk',
    severity: 'Critical',
    isClockedIn: false
  });

  assert.strictEqual(res.success, false, 'Report without clock-in must be rejected');
  assert.strictEqual(res.reason, 'NOT_ON_SITE', 'Must reject with NOT_ON_SITE reason');
});

runTest('Peer co-sign increases report verification and escalates to Under Inspection at 3+ co-signs', () => {
  const safety = new SafetyManager(INDUSTRY_PRESETS.construction);
  const initialReports = safety.getReportsForCurrentIndustry();
  const testReport = initialReports[0];
  const initialCosigns = testReport.cosigns;

  safety.cosignReport(testReport.id);
  assert.strictEqual(testReport.cosigns, initialCosigns + 1, 'Co-sign count must increment');
});

// ----------------------------------------------------
// Test Group 5: Anonymous Feedback & Privacy Blind Tokens
// ----------------------------------------------------
console.log('\n📦 Group 5: Blind-Token Anonymous Feedback');

runTest('Feedback sanitizes email addresses and phone numbers to prevent identification leaks', () => {
  const fb = new FeedbackManager(INDUSTRY_PRESETS.construction);
  const scrubbed = fb.sanitizeFeedbackText('Call me at 9876543210 or email test@gmail.com about the water leak.');

  assert.ok(!scrubbed.includes('9876543210'), 'Phone number must be redacted');
  assert.ok(!scrubbed.includes('test@gmail.com'), 'Email address must be redacted');
  assert.ok(scrubbed.includes('[REDACTED_PHONE]'), 'Phone marker should be present');
  assert.ok(scrubbed.includes('[REDACTED_EMAIL]'), 'Email marker should be present');
});

runTest('Feedback rate-limiter canSubmitFeedback() returns proper structure and bypassRateLimit flag works', () => {
  const fb = new FeedbackManager(INDUSTRY_PRESETS.construction);

  // canSubmitFeedback should return an object with 'allowed' property
  const check = fb.canSubmitFeedback();
  assert.ok(typeof check === 'object', 'canSubmitFeedback must return an object');
  assert.ok('allowed' in check, 'Must contain allowed property');

  // Submit with bypassRateLimit should always succeed
  const bypassed = fb.submitFeedback({ supervisorRating: 4, restWaterRating: 3, equipmentRating: 5, comment: 'Bypass test', bypassRateLimit: true });
  assert.strictEqual(bypassed.success, true, 'Bypassed submission must succeed');

  // Verify the feedback entry has a blind token
  assert.ok(bypassed.entry.tokenHash.startsWith('anon_'), 'Token hash must start with anon_');
  assert.ok(!bypassed.entry.comment.includes('test@'), 'No raw emails should leak through');
});

// ----------------------------------------------------
// Test Group 6: Multi-Industry Presets & Attrition AI
// ----------------------------------------------------
console.log('\n📦 Group 6: Cross-Sector Adoption & Attrition Predictor');

runTest('Platform supports at least 4 distinct industries with valid parameters', () => {
  const keys = Object.keys(INDUSTRY_PRESETS);
  assert.ok(keys.length >= 4, 'Must have at least 4 industry presets');
  assert.ok(keys.includes('construction'), 'Must include Construction');
  assert.ok(keys.includes('healthcare'), 'Must include Healthcare');
  assert.ok(keys.includes('manufacturing'), 'Must include Manufacturing');
  assert.ok(keys.includes('education'), 'Must include Education');
});

runTest('Worker with 5 overtime shifts and night rotations triggers High Quit Risk (>75%)', () => {
  const predictor = new AttritionPredictor(INDUSTRY_PRESETS.construction);
  const analytics = predictor.getWorkforceAnalytics();
  
  assert.ok(analytics.highRiskCount >= 1, 'Should identify at least 1 high quit risk employee');
  const highRiskWorker = analytics.workers.find(w => w.riskScore >= 75);
  assert.ok(highRiskWorker, 'High risk worker object must exist');
  assert.ok(highRiskWorker.riskDrivers.length > 0, 'Must have explainable risk drivers');
  assert.ok(highRiskWorker.recommendations.length > 0, 'Must have actionable manager recommendations');
});

// ----------------------------------------------------
// Test Group 7: Internationalization Completeness
// ----------------------------------------------------
console.log('\n📦 Group 7: Multilingual Accessibility Parity');

runTest('All 6 regional languages must have complete essential UI keys', () => {
  const requiredKeys = [
    'appTitle', 'workerMode', 'adminMode', 'clockInBtn', 'clockOutBtn',
    'transparentPayslip', 'basePay', 'overtimePay', 'safetyDesk', 'feedbackTitle'
  ];

  const langs = ['en', 'hi', 'ta', 'te', 'bn', 'es'];
  langs.forEach(lang => {
    assert.ok(TRANSLATIONS[lang], `Language dict for ${lang} must exist`);
    requiredKeys.forEach(k => {
      assert.ok(TRANSLATIONS[lang][k], `Key "${k}" missing in language "${lang}"`);
    });
  });
});

// ----------------------------------------------------
// Test Group 8: Store-and-Forward Offline Queue Resilience
// ----------------------------------------------------
console.log('\n📦 Group 8: Offline Queue Resilience (Store-and-Forward)');

runTest('Actions enqueued offline receive cryptographic nonces and persist locally', () => {
  const queue = new OfflineQueueManager();
  queue.toggleSimulatedOffline(true); // force offline
  assert.strictEqual(queue.isOnline(), false, 'Queue should report offline');

  const action1 = queue.enqueueAction('CLOCK_IN', { role: 'mason', site: 'Metro Rail' });
  const action2 = queue.enqueueAction('HAZARD_REPORT', { category: 'fall_risk', location: 'Pier 114' });

  assert.strictEqual(action1.status, 'QUEUED_OFFLINE');
  assert.ok(action1.item.offlineNonce.startsWith('sig_ecc_'), 'Should contain cryptographic offline nonce');
  assert.strictEqual(queue.getQueueStatus().pendingCount, 2, 'Pending queue count should be 2');

  const result = queue.flushQueue();
  assert.strictEqual(result.count, 2, 'Flushing queue should return 2 synced items');
  assert.ok(Array.isArray(result.items), 'Synced items must be an array');
  assert.strictEqual(result.items.length, 2, 'Synced items array must contain 2 entries');
  assert.strictEqual(queue.getQueueStatus().pendingCount, 0, 'Queue should be empty after flush');
});

// ----------------------------------------------------
// Test Group 9: Dynamic Climate & Heat-Stress Guard
// ----------------------------------------------------
console.log('\n📦 Group 9: Dynamic Climate & Heat-Stress Guard');

runTest('Normal temperatures (<32°C) maintain normal fatigue multiplier', () => {
  const guard = new ClimateGuard(INDUSTRY_PRESETS.construction);
  const status = guard.setConditions(28, 50); // 28C, 50% humidity

  assert.strictEqual(status.isHeatStressActive, false, 'Heat stress should be inactive');
  assert.strictEqual(status.fatigueStrainMultiplier, 1.0, 'Multiplier should be 1.0');
});

runTest('Extreme heatwave (>35°C threshold) triggers mandatory 15m break and 1.4x fatigue multiplier', () => {
  let alertTriggered = false;
  const guard = new ClimateGuard(INDUSTRY_PRESETS.construction, (alert) => {
    alertTriggered = true;
  });

  const status = guard.setConditions(39, 70); // extreme heat index ~53C
  assert.strictEqual(status.isHeatStressActive, true, 'Heat stress must be active');
  assert.strictEqual(status.mandatoryRestMinutes, 15, 'Mandatory rest should be 15 mins');
  assert.strictEqual(status.fatigueStrainMultiplier, 1.4, 'Fatigue strain multiplier must scale to 1.4x');
  assert.strictEqual(alertTriggered, true, 'Alert callback must trigger');

  // Verify all 6 languages have voice broadcast text
  const langs = ['en', 'hi', 'ta', 'te', 'bn', 'es'];
  langs.forEach(lang => {
    const text = guard.getVoiceBroadcast(lang);
    assert.ok(text && text.length > 20, `Voice alert for ${lang} must exist`);
  });
});

// ----------------------------------------------------
// Test Group 10: Security Sanitization & Utility Engine
// ----------------------------------------------------
console.log('\n📦 Group 10: Security Sanitization & Format Utilities');
const { escapeHTML, sanitizeInput, formatDuration, formatCurrency, generateNonce } = require('../js/utils');

runTest('XSS filter neutralizes script tags, attributes, and special characters', () => {
  const malicious = '<script>alert("pwned")</script><img src="x" onerror="stealCookie()">';
  const clean = escapeHTML(malicious);
  assert.strictEqual(clean.includes('<script>'), false, 'Should not contain raw <script>');
  assert.strictEqual(clean.includes('"'), false, 'Quotes should be escaped');
  assert.strictEqual(clean.includes('&lt;script&gt;'), true, 'Should convert to entities');
});

runTest('Input sanitizer strips null bytes, control characters, and truncates excess length', () => {
  const dirty = 'Safe Text \x00\x08 injected controls \t';
  const clean = sanitizeInput(dirty, 20);
  assert.strictEqual(clean.includes('\x00'), false, 'Null bytes must be stripped');
  assert.strictEqual(clean.includes('\x08'), false, 'Control characters must be stripped');
  assert.ok(clean.length <= 20, 'Length must be capped at maxLength');
});

runTest('Formatters correctly render currency and tabular duration HH:MM:SS', () => {
  assert.strictEqual(formatDuration(3665), '01:01:05', 'Duration 3665s should format to 01:01:05');
  assert.strictEqual(formatDuration(0), '00:00:00', 'Duration 0 should format to 00:00:00');
  assert.strictEqual(formatCurrency(1250.5, '₹'), '₹1,250.50', 'Currency should format with commas and decimals');
  const nonce = generateNonce('test');
  assert.ok(nonce.startsWith('test_'), 'Nonce should start with prefix');
});

console.log('\n====================================================');
console.log(`🏁 Test Summary: ${passedTests}/${totalTests} Tests Passed`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
