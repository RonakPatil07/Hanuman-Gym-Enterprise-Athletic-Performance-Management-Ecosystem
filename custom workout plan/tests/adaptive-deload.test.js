/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE OVERLOAD & AUTOMATIC DELOAD AI TEST SUITE
 * Unit & Integration verification for Systemic Fatigue Accumulation Index (FAI),
 * Deload Trigger Protocol, and 4-Week Progressive Overload Forecasting.
 * ==============================================================================
 */

const assert = require('assert');
const adaptiveEngine = require('../js/engine/adaptive-training.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  ✅ [PASS] ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(`     Error: ${err.message}`);
        console.error(err.stack);
    }
}

console.log('================================================================');
console.log('RUNNING ADAPTIVE OVERLOAD & DELOAD AI TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY 1: SYSTEMIC FATIGUE ACCUMULATION INDEX (FAI)
// -----------------------------------------------------------------------------
console.log('CATEGORY 1: Systemic Fatigue Accumulation Index (FAI)');

runTest('TEST 1: Empty or 0 logs returns baseline FRESH score (<30)', () => {
    const res = adaptiveEngine.calculateFatigueAccumulationIndex([], null);
    assert.strictEqual(res.level, 'FRESH');
    assert.strictEqual(res.deloadRecommended, false);
    assert.ok(res.score <= 25);
});

runTest('TEST 2: Normal productive mesocycle yields PRODUCTIVE/ELEVATED score', () => {
    const mockLogs = [
        {
            status: 'COMPLETED',
            exercises: [
                {
                    exerciseId: 'squat',
                    sets: [
                        { completed: true, plannedReps: 10, actualReps: 10, actualRIR: 2 },
                        { completed: true, plannedReps: 10, actualReps: 10, actualRIR: 2 }
                    ]
                }
            ]
        }
    ];

    const res = adaptiveEngine.calculateFatigueAccumulationIndex(mockLogs, null);
    assert.ok(res.score >= 20 && res.score < 50);
    assert.strictEqual(res.deloadRecommended, false);
});

runTest('TEST 3: High failure rate and RIR <= 1 triggers OVERREACHING and Deload Recommended', () => {
    // 6 consecutive sessions with extreme fatigue & missed reps
    const fatiguedLogs = Array.from({ length: 6 }, () => ({
        status: 'COMPLETED',
        exercises: [
            {
                exerciseId: 'squat',
                sets: [
                    { completed: true, plannedReps: 10, actualReps: 7, actualRIR: 0 },
                    { completed: true, plannedReps: 10, actualReps: 6, actualRIR: 0 },
                    { completed: true, plannedReps: 10, actualReps: 5, actualRIR: 0 }
                ]
            }
        ]
    }));

    const res = adaptiveEngine.calculateFatigueAccumulationIndex(fatiguedLogs, null);
    assert.strictEqual(res.level, 'OVERREACHING');
    assert.strictEqual(res.deloadRecommended, true);
    assert.ok(res.score >= 75);
});

// -----------------------------------------------------------------------------
// CATEGORY 2: 1-WEEK ACTIVE DELOAD MICROCYCLE GENERATION
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 2: 1-Week Active Deload Microcycle Generation');

runTest('TEST 4: Deload program scales sets by ~40% and adds +2 RIR reserve', () => {
    const baseProgram = {
        programId: 'prog_test_123',
        sessions: [
            {
                day: 'Monday',
                title: 'Upper Hypertrophy',
                exercises: [
                    { exerciseId: 'bench', exerciseName: 'Barbell Bench Press', sets: 4, reps: '8-12', targetRIR: 2, targetRPE: 8 },
                    { exerciseId: 'row', exerciseName: 'Barbell Row', sets: 5, reps: '8-12', targetRIR: 1, targetRPE: 9 }
                ]
            }
        ]
    };

    const deload = adaptiveEngine.generateDeloadProgram(baseProgram);

    assert.strictEqual(deload.isDeload, true);
    // Bench: 4 sets -> 2 sets (4 * 0.6 = 2.4 -> 2)
    assert.strictEqual(deload.sessions[0].exercises[0].sets, 2);
    // Bench RIR: 2 -> 4
    assert.strictEqual(deload.sessions[0].exercises[0].targetRIR, 4);
    // Bench RPE: 8 -> 6
    assert.strictEqual(deload.sessions[0].exercises[0].targetRPE, 6);

    // Row: 5 sets -> 3 sets (5 * 0.6 = 3)
    assert.strictEqual(deload.sessions[0].exercises[1].sets, 3);
    assert.strictEqual(deload.sessions[0].exercises[1].targetRIR, 3);

    // Verify immutability of base program
    assert.strictEqual(baseProgram.sessions[0].exercises[0].sets, 4);
});

// -----------------------------------------------------------------------------
// CATEGORY 3: 4-WEEK OVERLOAD FORECASTING
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 3: 4-Week Overload Trajectory Forecasting');

runTest('TEST 5: Generates 4 progressive milestones', () => {
    const ex = { exerciseName: 'Overhead Press', sets: 3, reps: '8-10' };
    const forecast = adaptiveEngine.generateOverloadForecast(ex, { model: 'DOUBLE_PROGRESSION' });

    assert.strictEqual(forecast.length, 4);
    assert.strictEqual(forecast[0].week, 1);
    assert.strictEqual(forecast[3].week, 4);
    assert.ok(forecast[0].reps.includes('8'));
    assert.ok(forecast[2].reps.includes('10'));
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
