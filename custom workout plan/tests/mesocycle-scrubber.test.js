/**
 * ==============================================================================
 * HANUMAN GYM — MESOCYCLE SCRUBBER & PROGRESSION SIMULATOR UNIT TESTS
 * ==============================================================================
 */

const assert = require('assert');
const scrubberEngine = require('../js/engine/mesocycle-scrubber.js');

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
console.log('RUNNING MESOCYCLE SCRUBBER & PROGRESSION SIMULATOR TEST SUITE');
console.log('================================================================\n');

console.log('CATEGORY 1: 12-Week Microcycle Phase Parameters');
runTest('All 12 weeks return valid periodized parameters', () => {
    for (let w = 1; w <= 12; w++) {
        const p = scrubberEngine.getWeekParameters(w);
        assert.strictEqual(p.week, w);
        assert.ok(p.phase.length > 0);
        assert.ok(typeof p.setMult === 'number');
        assert.ok(typeof p.targetRir === 'number');
        assert.ok(typeof p.color === 'string');
    }
});

runTest('Week 1 establishes MEV baseline with RIR 3', () => {
    const p = scrubberEngine.getWeekParameters(1);
    assert.strictEqual(p.setMult, 1.0);
    assert.strictEqual(p.loadMod, 0);
    assert.strictEqual(p.targetRir, 3);
});

runTest('Week 6 planned deload drops sets by 40% with RIR 4 reserve', () => {
    const p = scrubberEngine.getWeekParameters(6);
    assert.strictEqual(p.type, 'DELOAD');
    assert.strictEqual(p.setMult, 0.6);
    assert.strictEqual(p.targetRir, 4);
});

runTest('Week 10 overreach peak reaches maximum volume multiplier 1.35', () => {
    const p = scrubberEngine.getWeekParameters(10);
    assert.strictEqual(p.setMult, 1.35);
    assert.strictEqual(p.loadMod, 12.5);
    assert.strictEqual(p.targetRir, 1);
});

console.log('\nCATEGORY 2: Dynamic Session Morphing Simulation');
runTest('Morphed sessions scale exercise sets and inject RIR targets', () => {
    const mockSessions = [
        {
            day: 'Day 1',
            exercises: [
                { exerciseName: 'Barbell Squat', sets: 4, targetWeightKg: 100 },
                { exerciseName: 'Romanian Deadlift', sets: 3, targetWeightKg: 80 }
            ]
        }
    ];

    // Week 1 (Baseline)
    const w1 = scrubberEngine.calculateMorphedSessionsForWeek(mockSessions, 1);
    assert.strictEqual(w1[0].exercises[0].sets, 4);
    assert.strictEqual(w1[0].exercises[0].rir, 3);
    assert.strictEqual(w1[0].exercises[0].weekModifier.projectedWeightKg, 100);

    // Week 3 (Intensification +5% load)
    const w3 = scrubberEngine.calculateMorphedSessionsForWeek(mockSessions, 3);
    assert.strictEqual(w3[0].exercises[0].sets, 5); // 4 * 1.2 = 4.8 -> 5
    assert.strictEqual(w3[0].exercises[0].rir, 2);
    assert.strictEqual(w3[0].exercises[0].weekModifier.projectedWeightKg, 105);

    // Week 6 (Deload -40% sets, -10% load)
    const w6 = scrubberEngine.calculateMorphedSessionsForWeek(mockSessions, 6);
    assert.strictEqual(w6[0].exercises[0].sets, 2);
    assert.strictEqual(w6[0].exercises[0].rir, 4);
    assert.strictEqual(w6[0].exercises[0].weekModifier.projectedWeightKg, 90);
});

console.log('\nCATEGORY 3: 12-Week Trajectory Analytics');
runTest('Generates complete 12-point periodization curve', () => {
    const mockSessions = [
        { day: 'Day 1', exercises: [{ sets: 4 }, { sets: 4 }] },
        { day: 'Day 2', exercises: [{ sets: 4 }, { sets: 4 }] }
    ];
    const traj = scrubberEngine.compute12WeekTrajectory(mockSessions);
    assert.strictEqual(traj.length, 12);
    assert.strictEqual(traj[0].week, 1);
    assert.strictEqual(traj[0].totalSets, 16);
    assert.strictEqual(traj[5].type, 'DELOAD'); // Week 6
    assert.strictEqual(traj[11].week, 12);
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
