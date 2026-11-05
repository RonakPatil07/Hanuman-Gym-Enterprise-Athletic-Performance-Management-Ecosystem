/**
 * ==============================================================================
 * HANUMAN GYM — GYM FOCUS HUD ENGINE UNIT TESTS
 * ==============================================================================
 */

const assert = require('assert');
const hudEngine = require('../js/engine/gym-focus-hud.js');

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
console.log('RUNNING GYM FOCUS HUD ENGINE TEST SUITE');
console.log('================================================================\n');

console.log('CATEGORY 1: Time Formatting & Display Logic');
runTest('Formats seconds into MM:SS string notation', () => {
    assert.strictEqual(hudEngine.formatTimeMMSS(90), '01:30');
    assert.strictEqual(hudEngine.formatTimeMMSS(60), '01:00');
    assert.strictEqual(hudEngine.formatTimeMMSS(125), '02:05');
    assert.strictEqual(hudEngine.formatTimeMMSS(0), '00:00');
});

console.log('\nCATEGORY 2: Micro-Load Weight Bumpers');
runTest('Calculates precise weight increments and decrements', () => {
    assert.strictEqual(hudEngine.calculateWeightBump(100, 2.5), 102.5);
    assert.strictEqual(hudEngine.calculateWeightBump(100, -1.25), 98.75);
    assert.strictEqual(hudEngine.calculateWeightBump(80, 5), 85);
    assert.strictEqual(hudEngine.calculateWeightBump(0, -5), 0); // No negative weights
});

console.log('\nCATEGORY 3: Timer State Transitions');
runTest('Timer starts and resets state correctly', () => {
    const res = hudEngine.startRestTimer(45);
    assert.strictEqual(res.running, true);
    assert.strictEqual(res.totalSeconds, 45);

    const adj = hudEngine.adjustRestTimer(15);
    assert.strictEqual(adj.remaining, 60);

    const paused = hudEngine.pauseRestTimer();
    assert.strictEqual(paused.running, false);

    const reset = hudEngine.resetRestTimer();
    assert.strictEqual(reset.running, false);
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
