/**
 * ==============================================================================
 * HANUMAN GYM — AUTO 1RM WORKING LOAD ENGINE UNIT TESTS
 * ==============================================================================
 */

const assert = require('assert');
const auto1rm = require('../js/engine/auto-1rm-engine.js');

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
console.log('RUNNING AUTO 1RM WORKING LOAD ENGINE TEST SUITE');
console.log('================================================================\n');

console.log('CATEGORY 1: Intensity Percentage Calculations');
runTest('8 Reps @ RIR 2 derives ~75% 1RM intensity', () => {
    const pct = auto1rm.calculateIntensityPercentage(8, 2);
    assert.ok(pct >= 0.73 && pct <= 0.77, `Expected ~0.75, got ${pct}`);
});

runTest('1 Rep @ RIR 0 derives 100% 1RM intensity', () => {
    const pct = auto1rm.calculateIntensityPercentage(1, 0);
    assert.ok(pct >= 0.95 && pct <= 1.0, `Expected ~0.97-1.0, got ${pct}`);
});

console.log('\nCATEGORY 2: Working Weight Plate Rounding');
runTest('100kg 1RM with 8 reps @ RIR 2 rounds to nearest 2.5kg increment (77.5kg)', () => {
    const custom = { 'barbell-bench-press': 100 };
    const load = auto1rm.calculateWorkingLoad('barbell-bench-press', 8, 2, 0, custom);
    assert.strictEqual(load % 2.5, 0);
    assert.strictEqual(load, 77.5);
});

runTest('+10% Week Overload modifier elevates 100kg 1RM to ~85kg', () => {
    const custom = { 'barbell-bench-press': 100 };
    const load = auto1rm.calculateWorkingLoad('barbell-bench-press', 8, 2, 10, custom);
    assert.strictEqual(load, 85);
});

console.log('\nCATEGORY 3: Program Traversal & Load Injection');
runTest('Applies calculated working loads across all session exercises', () => {
    const mockProg = {
        sessions: [
            {
                day: 'Day 1',
                exercises: [
                    { exerciseId: 'barbell-bench-press', reps: 8, rir: 2 },
                    { exerciseId: 'barbell-back-squat', reps: 5, rir: 2 }
                ]
            }
        ]
    };
    const custom = { 'barbell-bench-press': 100, 'barbell-back-squat': 140 };
    const updated = auto1rm.apply1RMBaselinesToProgram(mockProg, custom, 1);
    assert.strictEqual(updated.sessions[0].exercises[0].targetWeightKg, 77.5);
    assert.ok(updated.sessions[0].exercises[1].targetWeightKg > 100);
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
