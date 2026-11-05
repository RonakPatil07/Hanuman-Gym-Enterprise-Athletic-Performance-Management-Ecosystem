/**
 * ==============================================================================
 * HANUMAN GYM — USER PROFILE & MY SPACE BRIDGE UNIT TEST SUITE
 * ==============================================================================
 */

const assert = require('assert');

// Mock localStorage for Node environment
const storageMock = {};
global.localStorage = {
    getItem: (key) => storageMock[key] || null,
    setItem: (key, val) => { storageMock[key] = String(val); },
    removeItem: (key) => { delete storageMock[key]; },
    clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

const bridgeEngine = require('../js/engine/user-profile-bridge.js');

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
console.log('RUNNING USER PROFILE & MY SPACE BRIDGE TEST SUITE');
console.log('================================================================\n');

// 1. Core Synchronization
console.log('CATEGORY 1: Program Synchronization to My Space');
runTest('Synchronizes valid program and user profile to storage', () => {
    localStorage.clear();
    const mockProgram = {
        programId: 'test_prog_001',
        programTitle: 'Hypertrophy 4-Day Split',
        goal: 'muscle-gain',
        trainingFrequency: 4,
        sessions: [
            { day: 'Day 1', exercises: [{ exerciseName: 'Bench Press', sets: 4 }] },
            { day: 'Day 2', exercises: [{ exerciseName: 'Squat', sets: 4 }] }
        ]
    };
    const mockProfile = {
        name: 'Pradeep',
        bmr: 1750,
        tdee: 2450
    };

    const res = bridgeEngine.syncProgramToMySpace(mockProgram, mockProfile);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.programId, 'test_prog_001');

    const active = bridgeEngine.getActiveProgramFromMySpace();
    assert.ok(active);
    assert.strictEqual(active.programTitle, 'Hypertrophy 4-Day Split');
    assert.strictEqual(active.metrics.weeklyVolumeSets, 8);
    assert.strictEqual(active.metrics.bmr, 1750);
});

runTest('Handles invalid or null program safely without throwing', () => {
    const res = bridgeEngine.syncProgramToMySpace(null, null);
    assert.strictEqual(res.success, false);
});

// 2. Workout Analytics Snapshot
console.log('\nCATEGORY 2: Workout Analytics Snapshot');
runTest('Aggregates total workouts and tonnage from completed logs', () => {
    const mockLogs = [
        { status: 'COMPLETED', metrics: { totalTonnage: 4500 } },
        { status: 'COMPLETED', metrics: { totalTonnage: 5500 } },
        { status: 'IN_PROGRESS', metrics: { totalTonnage: 1000 } }
    ];
    localStorage.setItem(bridgeEngine.STORAGE_KEY_WORKOUT_HISTORY, JSON.stringify(mockLogs));

    const snap = bridgeEngine.getWorkoutAnalyticsSnapshot();
    assert.strictEqual(snap.totalWorkouts, 2);
    assert.strictEqual(snap.totalTonnage, 10000);
    assert.strictEqual(snap.hasActiveProgram, true);
});

// 3. Clear Active Program
console.log('\nCATEGORY 3: Program State Management');
runTest('Clears active program cleanly while preserving history', () => {
    bridgeEngine.clearActiveProgram();
    assert.strictEqual(bridgeEngine.getActiveProgramFromMySpace(), null);
    // History remains intact
    const snap = bridgeEngine.getWorkoutAnalyticsSnapshot();
    assert.strictEqual(snap.totalWorkouts, 2);
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
