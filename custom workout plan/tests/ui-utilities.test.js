/**
 * Test Suite: Custom Workout Plan UI Helpers & Utilities
 * Verifies plate loading calculator, chapter definitions, rest timer bounds, and backup formatting.
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`  ❌ [FAIL] ${message}`);
        failCount++;
        throw new Error(message);
    } else {
        console.log(`  ✅ [PASS] ${message}`);
        passCount++;
    }
}

function runTest(testName, testFn) {
    try {
        testFn();
    } catch (e) {
        // Logged in assert
    }
}

console.log('================================================================');
console.log('RUNNING UI HELPERS & UTILITIES TEST SUITE');
console.log('================================================================\n');

// Load PersonalizedBlueprintUI module
const PersonalizedBlueprintUI = require('../js/ui/personalized-blueprint.js');

// 1. Plate Calculator kg Test
runTest('TEST 1: Plate calculator for 80kg bar computes 30kg per side (25kg + 5kg)', () => {
    const res = PersonalizedBlueprintUI.calculateBarbellPlates(80, false, 20);
    assert(res.barWeight === 20, 'Bar weight is 20kg');
    assert(res.weightPerSide === 30, 'Weight per side is 30kg');
    assert(res.plates.length === 2, 'Two plate denominations used');
    assert(res.plates[0].plate === 25 && res.plates[0].count === 1, 'One 25kg plate');
    assert(res.plates[1].plate === 5 && res.plates[1].count === 1, 'One 5kg plate');
    assert(res.remainder === 0, 'No remainder left');
});

// 2. Plate Calculator lb Test
runTest('TEST 2: Plate calculator for 185lb bar computes 70lb per side (45lb + 25lb)', () => {
    const res = PersonalizedBlueprintUI.calculateBarbellPlates(185, true, 45);
    assert(res.barWeight === 45, 'Bar weight is 45lb');
    assert(res.weightPerSide === 70, 'Weight per side is 70lb');
    assert(res.plates.length === 2, 'Two plate denominations used');
    assert(res.plates[0].plate === 45 && res.plates[0].count === 1, 'One 45lb plate');
    assert(res.plates[1].plate === 25 && res.plates[1].count === 1, 'One 25lb plate');
    assert(res.remainder === 0, 'Zero remainder left');
});

// 3. Plate Calculator for bar-only weight
runTest('TEST 3: Target weight equal to bar returns zero plates per side', () => {
    const res = PersonalizedBlueprintUI.calculateBarbellPlates(20, false, 20);
    assert(res.weightPerSide === 0, 'Zero weight per side');
    assert(res.plates.length === 0, 'Empty plates array');
    assert(res.remainder === 0, 'Zero remainder');
});

// 4. Plate Calculator handles invalid / negative inputs safely
runTest('TEST 4: Negative or NaN target weight handled safely without exception', () => {
    const res1 = PersonalizedBlueprintUI.calculateBarbellPlates(-50, false, 20);
    assert(res1.weightPerSide === 0, 'Negative weight returns zero per side');
    const res2 = PersonalizedBlueprintUI.calculateBarbellPlates('invalid', false, 20);
    assert(res2.weightPerSide === 0, 'Invalid string returns zero per side');
});

// 5. Rest Timer method exposure
runTest('TEST 5: Rest timer controls are exposed on PersonalizedBlueprintUI module', () => {
    assert(typeof PersonalizedBlueprintUI.startRestTimer === 'function', 'startRestTimer is function');
    assert(typeof PersonalizedBlueprintUI.pauseResumeRestTimer === 'function', 'pauseResumeRestTimer is function');
    assert(typeof PersonalizedBlueprintUI.adjustRestTimer === 'function', 'adjustRestTimer is function');
    assert(typeof PersonalizedBlueprintUI.stopRestTimer === 'function', 'stopRestTimer is function');
});

// 6. Data Backup & Restore method exposure
runTest('TEST 6: Data portability methods are exposed on PersonalizedBlueprintUI module', () => {
    assert(typeof PersonalizedBlueprintUI.exportWorkoutBackup === 'function', 'exportWorkoutBackup is function');
    assert(typeof PersonalizedBlueprintUI.triggerImportDialog === 'function', 'triggerImportDialog is function');
    assert(typeof PersonalizedBlueprintUI.importWorkoutBackup === 'function', 'importWorkoutBackup is function');
});

// 7. PWA Manifest & Service Worker existence
runTest('TEST 7: PWA manifest and sw.js exist on filesystem and are valid JSON / JS', () => {
    const manifestPath = path.join(__dirname, '../manifest.json');
    const swPath = path.join(__dirname, '../sw.js');
    assert(fs.existsSync(manifestPath), 'manifest.json exists');
    assert(fs.existsSync(swPath), 'sw.js exists');
    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(manifestContent.name === 'FitPhysique Custom Workout Plan', 'Manifest name is correct');
    assert(manifestContent.display === 'standalone', 'Manifest display is standalone');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passCount} / ${passCount + failCount} TESTS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('================================================================\n');

if (failCount > 0) {
    process.exit(1);
}
