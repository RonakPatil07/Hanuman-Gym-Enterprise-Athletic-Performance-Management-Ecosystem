/**
 * ==============================================================================
 * HANUMAN GYM — PWA INSTALLER ENGINE UNIT TESTS
 * ==============================================================================
 */

const assert = require('assert');
const pwaEngine = require('../js/engine/pwa-installer.js');

let testsPassed = 0;
let totalTests = 0;

function runTest(desc, fn) {
    totalTests++;
    try {
        fn();
        testsPassed++;
        console.log(`  ✅ [PASS] TEST ${totalTests}: ${desc}`);
    } catch (e) {
        console.error(`  ❌ [FAIL] TEST ${totalTests}: ${desc}`);
        console.error(e);
    }
}

console.log('================================================================');
console.log('RUNNING PWA INSTALLER ENGINE TEST SUITE');
console.log('================================================================\n');

console.log('CATEGORY 1: Public Method Existence & API Contract');
runTest('PWA Installer exports standard lifecycle methods', () => {
    assert.strictEqual(typeof pwaEngine.initPWAInstaller, 'function');
    assert.strictEqual(typeof pwaEngine.renderPWAInstallBanner, 'function');
    assert.strictEqual(typeof pwaEngine.promptPWAInstall, 'function');
    assert.strictEqual(typeof pwaEngine.dismissPWAInstall, 'function');
    assert.strictEqual(typeof pwaEngine.removePWAInstallBanner, 'function');
});

runTest('Handles non-browser execution environment safely without throwing exceptions', () => {
    pwaEngine.initPWAInstaller();
    pwaEngine.renderPWAInstallBanner();
    pwaEngine.dismissPWAInstall();
    pwaEngine.removePWAInstallBanner();
    assert.ok(true);
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
