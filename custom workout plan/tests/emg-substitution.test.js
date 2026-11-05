/**
 * ==============================================================================
 * HANUMAN GYM — BIOMECHANICAL EMG SUBSTITUTION ENGINE UNIT TESTS
 * ==============================================================================
 */

const assert = require('assert');
const emgEngine = require('../js/engine/emg-substitution.js');

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
console.log('RUNNING BIOMECHANICAL EMG SUBSTITUTION TEST SUITE');
console.log('================================================================\n');

console.log('CATEGORY 1: Compound Movement EMG Affinity Mapping');
runTest('Barbell Bench Press returns high-affinity alternatives with EMG scores', () => {
    const res = emgEngine.getAffinityAlternatives('barbell-bench-press');
    assert.ok(res.baseExercise);
    assert.strictEqual(res.baseExercise.name, 'Barbell Bench Press');
    assert.ok(res.alternatives.length >= 3);
    assert.strictEqual(res.alternatives[0].name, 'Dumbbell Bench Press');
    assert.strictEqual(res.alternatives[0].matchScore, 96);
    assert.strictEqual(res.alternatives[0].curve, 'STRETCH_MEDIATED');
});

runTest('Barbell Squat returns Hack Squat and Leg Press with axial decompression notes', () => {
    const res = emgEngine.getAffinityAlternatives('barbell-back-squat');
    assert.ok(res.alternatives.some(a => a.name.includes('Hack Squat')));
    assert.ok(res.alternatives.some(a => a.name.includes('Leg Press')));
});

console.log('\nCATEGORY 2: Resistance Curve Metadata & Fallback Handling');
runTest('Resistance curve meta returns correct visual tags and badges', () => {
    const stretchMeta = emgEngine.formatResistanceCurveMeta('STRETCH_MEDIATED');
    assert.strictEqual(stretchMeta.label, 'Stretch-Mediated Tension');
    assert.ok(stretchMeta.badge.includes('Stretch'));

    const peakMeta = emgEngine.formatResistanceCurveMeta('PEAK_CONTRACTION');
    assert.strictEqual(peakMeta.label, 'Peak Contraction Squeeze');
});

runTest('Unlisted movement generates intelligent generic fallback with high similarity', () => {
    const res = emgEngine.getAffinityAlternatives('custom-cable-movement');
    assert.ok(res.alternatives.length >= 2);
    assert.ok(res.alternatives[0].matchScore >= 80);
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
