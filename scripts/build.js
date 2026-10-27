/**
 * FairShift - Production Asset Bundler
 * Compiles modular domain engines and application controller into a single production bundle.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const SOURCE_MODULES = [
  'js/utils.js',
  'js/industries.js',
  'js/i18n.js',
  'js/shift-tracker.js',
  'js/safety.js',
  'js/feedback.js',
  'js/attrition.js',
  'js/passport.js',
  'js/offline-queue.js',
  'js/climate-guard.js',
  'js/fairshift-app.js'
];

function buildBundle() {
  console.log('[FairShift Build] Compiling production frontend bundle...');
  let bundleContent = '/**\n * FairShift Frontend Production Bundle (SDG 8)\n * Auto-generated on ' + new Date().toISOString() + '\n */\n\n';

  for (const mod of SOURCE_MODULES) {
    const modPath = path.join(rootDir, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`Required module missing: ${mod}`);
    }
    const code = fs.readFileSync(modPath, 'utf8');
    bundleContent += `\n/* ========================================================\n   Module: ${mod}\n   ======================================================== */\n`;
    bundleContent += code + '\n';
  }

  const outputPath = path.join(rootDir, 'js', 'fairshift-bundle.js');
  fs.writeFileSync(outputPath, bundleContent, 'utf8');
  const stats = fs.statSync(outputPath);
  console.log(`[FairShift Build] Successfully compiled js/fairshift-bundle.js (${(stats.size / 1024).toFixed(2)} KB)`);
}

if (require.main === module) {
  buildBundle();
}

module.exports = { buildBundle };
