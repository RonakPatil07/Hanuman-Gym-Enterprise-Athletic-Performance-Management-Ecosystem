/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * WORKOUT LOGGING & PERFORMANCE CAPTURE TEST SUITE (PHASE 10)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const rulesEngine = require('../js/engine/training-rules.js');
const intensityEngine = require('../js/engine/intensity-rules.js');
const progressionEngine = require('../js/engine/progression-rules.js');
const generatorEngine = require('../js/engine/program-generator.js');
const loggerEngine = require('../js/engine/workout-logger.js');

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

// Mock localStorage for Node.js test environment
const mockStorage = {};
global.window = {
    localStorage: {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => { mockStorage[k] = String(v); },
        removeItem: (k) => { delete mockStorage[k]; },
        clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
    }
};

// Generate a sample valid program for tests
const sampleProfile = canonicalEngine.buildCanonicalUserProfile({
    age: 28,
    gender: 'male',
    goal: 'muscle-gain',
    experience: 'intermediate',
    trainingDays: ['Monday', 'Wednesday', 'Friday']
});
const sampleProgram = generatorEngine.generateWorkoutProgram(sampleProfile);

console.log('================================================================');
console.log('RUNNING WORKOUT LOGGING & PERFORMANCE CAPTURE TEST SUITE (PHASE 10)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: LOG CREATION (Tests 1–5)
// -----------------------------------------------------------------------------
runTest('TEST 1: Create workout log from valid program and session', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 'Monday', 'test_log_1');
    assert.ok(log);
    assert.strictEqual(typeof log, 'object');
    assert.strictEqual(log.logId, 'test_log_1');
});

runTest('TEST 2: Workout log preserves exact programId', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0, 'test_log_2');
    assert.strictEqual(log.programId, sampleProgram.programId);
});

runTest('TEST 3: Workout log preserves exact sessionId / day', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 'Monday', 'test_log_3');
    assert.strictEqual(log.sessionDay, 'Monday');
});

runTest('TEST 4: Workout log version is 1.0', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    assert.strictEqual(log.version, '1.0');
});

runTest('TEST 5: Initial workout log status is NOT_STARTED', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    assert.strictEqual(log.status, loggerEngine.SESSION_STATUS.NOT_STARTED);
    assert.strictEqual(log.startedAt, null);
    assert.strictEqual(log.completedAt, null);
});

// -----------------------------------------------------------------------------
// CATEGORY B: SESSION VALIDATION (Tests 6–9)
// -----------------------------------------------------------------------------
runTest('TEST 6: Null or invalid program is rejected in log creation', () => {
    assert.throws(() => {
        loggerEngine.createWorkoutLog(null, 'Monday');
    }, /Valid generated program object is required/);
});

runTest('TEST 7: Unknown session name is rejected in log creation', () => {
    assert.throws(() => {
        loggerEngine.createWorkoutLog(sampleProgram, 'NonExistentDay');
    }, /not found in program/);
});

runTest('TEST 8: Out of bounds session index is rejected', () => {
    assert.throws(() => {
        loggerEngine.createWorkoutLog(sampleProgram, 999);
    }, /not found in program/);
});

runTest('TEST 9: Valid session index accepted and initialized with planned snapshot', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    assert.ok(log.plannedSnapshot);
    assert.ok(Array.isArray(log.plannedSnapshot.exercises));
    assert.strictEqual(log.plannedSnapshot.exercises.length, sampleProgram.sessions[0].exercises.length);
});

// -----------------------------------------------------------------------------
// CATEGORY C: EXERCISE VALIDATION (Tests 10–13)
// -----------------------------------------------------------------------------
runTest('TEST 10: Canonical exercise ID is required for logging a set', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    assert.throws(() => {
        loggerEngine.logSet(log, '', { actualReps: 10 });
    }, /Valid exerciseId is required/);
});

runTest('TEST 11: Validator detects missing exerciseId in log structure', () => {
    const badLog = {
        logId: 'bad_1',
        programId: 'prog_1',
        sessionId: 'Monday',
        status: 'IN_PROGRESS',
        exercises: [{ sets: [] }]
    };
    const val = loggerEngine.validateWorkoutLog(badLog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('canonical exerciseId')));
});

runTest('TEST 12: Valid exercise accepted and set record appended', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 10, actualLoad: 60, loadUnit: 'kg', actualRIR: 2 });

    const exRec = log.exercises.find(e => e.exerciseId === targetEx);
    assert.ok(exRec);
    const setRec = exRec.sets.find(s => s.setNumber === 1);
    assert.strictEqual(setRec.actualReps, 10);
    assert.strictEqual(setRec.actualLoad, 60);
    assert.strictEqual(setRec.actualRIR, 2);
    assert.strictEqual(setRec.actualRPE, 8);
});

runTest('TEST 13: Duplicate set logging updates existing set record rather than creating duplicate', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;

    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 8, actualLoad: 50 });
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 10, actualLoad: 55 });

    const exRec = log.exercises.find(e => e.exerciseId === targetEx);
    const set1Matches = exRec.sets.filter(s => s.setNumber === 1);
    assert.strictEqual(set1Matches.length, 1);
    assert.strictEqual(set1Matches[0].actualReps, 10);
    assert.strictEqual(set1Matches[0].actualLoad, 55);
});

// -----------------------------------------------------------------------------
// CATEGORY D: SET VALIDATION (Tests 14–21)
// -----------------------------------------------------------------------------
runTest('TEST 14: Valid actual reps accepted', () => {
    const val = loggerEngine.validateSetData({ actualReps: 12 });
    assert.strictEqual(val.valid, true);
});

runTest('TEST 15: Decimal reps rejected by set validation', () => {
    const val = loggerEngine.validateSetData({ actualReps: 8.5 });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Must be an integer')));
});

runTest('TEST 16: Negative reps rejected by set validation', () => {
    const val = loggerEngine.validateSetData({ actualReps: -3 });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Must be >= 0')));
});

runTest('TEST 17: Zero reps accepted as factual failed attempt', () => {
    const val = loggerEngine.validateSetData({ actualReps: 0, completed: false });
    assert.strictEqual(val.valid, true);
});

runTest('TEST 18: Valid load accepted', () => {
    const val = loggerEngine.validateSetData({ actualLoad: 72.5, loadUnit: 'kg' });
    assert.strictEqual(val.valid, true);
});

runTest('TEST 19: Negative load rejected', () => {
    const val = loggerEngine.validateSetData({ actualLoad: -10 });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Must be >= 0')));
});

runTest('TEST 20: Valid load units (kg, lb, bodyweight, none) accepted', () => {
    assert.strictEqual(loggerEngine.validateSetData({ loadUnit: 'kg' }).valid, true);
    assert.strictEqual(loggerEngine.validateSetData({ loadUnit: 'lb' }).valid, true);
    assert.strictEqual(loggerEngine.validateSetData({ loadUnit: 'bodyweight' }).valid, true);
    assert.strictEqual(loggerEngine.validateSetData({ loadUnit: 'none' }).valid, true);
});

runTest('TEST 21: Invalid load unit rejected', () => {
    const val = loggerEngine.validateSetData({ loadUnit: 'tons' });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Invalid loadUnit')));
});

// -----------------------------------------------------------------------------
// CATEGORY E: RIR / RPE VALIDATION (Tests 22–31)
// -----------------------------------------------------------------------------
runTest('TEST 22: RIR 0 accepted when valid', () => {
    const val = loggerEngine.validateSetData({ actualRIR: 0 });
    assert.strictEqual(val.valid, true);
});

runTest('TEST 23: RIR 5 accepted as valid submaximal effort', () => {
    const val = loggerEngine.validateSetData({ actualRIR: 5 });
    assert.strictEqual(val.valid, true);
});

runTest('TEST 24: RIR 6 rejected according to Phase 8 contract', () => {
    const val = loggerEngine.validateSetData({ actualRIR: 6 });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('between 0 and 5')));
});

runTest('TEST 25: Negative RIR rejected', () => {
    const val = loggerEngine.validateSetData({ actualRIR: -1 });
    assert.strictEqual(val.valid, false);
});

runTest('TEST 26: RPE 5 accepted as valid', () => {
    const val = loggerEngine.validateSetData({ actualRPE: 5 });
    assert.strictEqual(val.valid, true);
});

runTest('TEST 27: RPE 10 accepted as valid', () => {
    const val = loggerEngine.validateSetData({ actualRPE: 10 });
    assert.strictEqual(val.valid, true);
});

runTest('TEST 28: RPE 11 rejected', () => {
    const val = loggerEngine.validateSetData({ actualRPE: 11 });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('between 5 and 10')));
});

runTest('TEST 29: RPE below 5 rejected', () => {
    const val = loggerEngine.validateSetData({ actualRPE: 4 });
    assert.strictEqual(val.valid, false);
});

runTest('TEST 30: RIR to RPE automatic derivation when one is provided', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualRIR: 3 });

    const setRec = log.exercises.find(e => e.exerciseId === targetEx).sets[0];
    assert.strictEqual(setRec.actualRIR, 3);
    assert.strictEqual(setRec.actualRPE, 7);
});

runTest('TEST 31: Inconsistent RIR and RPE simultaneously entered is rejected', () => {
    const val = loggerEngine.validateSetData({ actualRIR: 2, actualRPE: 9 }); // RPE should be 8
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Inconsistent effort metrics')));
});

// -----------------------------------------------------------------------------
// CATEGORY F: SET STATE & COMPLETION (Tests 32–35)
// -----------------------------------------------------------------------------
runTest('TEST 32: Completed set marked accurately', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 10, completed: true });

    const setRec = log.exercises.find(e => e.exerciseId === targetEx).sets[0];
    assert.strictEqual(setRec.completed, true);
});

runTest('TEST 33: Incomplete set marked and preserved faithfully', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 2, actualReps: 6, completed: false, notes: 'Grip slipped' });

    const setRec = log.exercises.find(e => e.exerciseId === targetEx).sets.find(s => s.setNumber === 2);
    assert.strictEqual(setRec.completed, false);
    assert.strictEqual(setRec.actualReps, 6);
    assert.strictEqual(setRec.notes, 'Grip slipped');
});

runTest('TEST 34: Update existing set via updateSet helper', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.updateSet(log, targetEx, 1, { actualReps: 11, actualLoad: 62.5 });

    const setRec = log.exercises.find(e => e.exerciseId === targetEx).sets[0];
    assert.strictEqual(setRec.actualReps, 11);
    assert.strictEqual(setRec.actualLoad, 62.5);
});

runTest('TEST 35: Logging preserves planned values without mutation', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    const initialPlannedReps = log.exercises[0].sets[0].plannedReps;

    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 14 });
    assert.strictEqual(log.exercises[0].sets[0].plannedReps, initialPlannedReps);
});

// -----------------------------------------------------------------------------
// CATEGORY G: SESSION LIFECYCLE (Tests 36–41)
// -----------------------------------------------------------------------------
runTest('TEST 36: startWorkout transitions status to IN_PROGRESS', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.startWorkout(log);
    assert.strictEqual(log.status, loggerEngine.SESSION_STATUS.IN_PROGRESS);
    assert.ok(log.startedAt !== null);
});

runTest('TEST 37: Logging a set automatically starts workout if NOT_STARTED', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 10 });
    assert.strictEqual(log.status, loggerEngine.SESSION_STATUS.IN_PROGRESS);
});

runTest('TEST 38: pauseWorkout transitions status to PAUSED', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.startWorkout(log);
    loggerEngine.pauseWorkout(log);
    assert.strictEqual(log.status, loggerEngine.SESSION_STATUS.PAUSED);
});

runTest('TEST 39: abandonWorkout with isPartial=true sets PARTIALLY_COMPLETED', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.startWorkout(log);
    loggerEngine.abandonWorkout(log, true);
    assert.strictEqual(log.status, loggerEngine.SESSION_STATUS.PARTIALLY_COMPLETED);
    assert.ok(log.completedAt !== null);
});

runTest('TEST 40: completeWorkout transitions status to COMPLETED', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.startWorkout(log);
    loggerEngine.completeWorkout(log);
    assert.strictEqual(log.status, loggerEngine.SESSION_STATUS.COMPLETED);
    assert.ok(log.completedAt !== null);
});

runTest('TEST 41: abandonWorkout with isPartial=false sets ABANDONED', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.startWorkout(log);
    loggerEngine.abandonWorkout(log, false);
    assert.strictEqual(log.status, loggerEngine.SESSION_STATUS.ABANDONED);
});

// -----------------------------------------------------------------------------
// CATEGORY H: LOCALSTORAGE PERSISTENCE (Tests 42–48)
// -----------------------------------------------------------------------------
runTest('TEST 42: saveWorkoutLog persists log to storage', () => {
    loggerEngine.clearWorkoutLogs();
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0, 'save_test_1');
    const saved = loggerEngine.saveWorkoutLog(log);
    assert.strictEqual(saved, true);
});

runTest('TEST 43: loadWorkoutLog retrieves previously saved log', () => {
    const loaded = loggerEngine.loadWorkoutLog('save_test_1');
    assert.ok(loaded);
    assert.strictEqual(loaded.logId, 'save_test_1');
    assert.strictEqual(loaded.programId, sampleProgram.programId);
});

runTest('TEST 44: listWorkoutLogs returns all stored logs', () => {
    const log2 = loggerEngine.createWorkoutLog(sampleProgram, 1, 'save_test_2');
    loggerEngine.saveWorkoutLog(log2);

    const list = loggerEngine.listWorkoutLogs();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 2);
});

runTest('TEST 45: deleteWorkoutLog removes specific log from storage', () => {
    const deleted = loggerEngine.deleteWorkoutLog('save_test_2');
    assert.strictEqual(deleted, true);
    assert.strictEqual(loggerEngine.loadWorkoutLog('save_test_2'), null);
});

runTest('TEST 46: Malformed storage handled gracefully without throwing', () => {
    window.localStorage.setItem(loggerEngine.STORAGE_KEY, 'INVALID_JSON_CORRUPT');
    const list = loggerEngine.listWorkoutLogs();
    assert.deepStrictEqual(list, []);
});

runTest('TEST 47: Missing storage handled gracefully', () => {
    window.localStorage.removeItem(loggerEngine.STORAGE_KEY);
    const loaded = loggerEngine.loadWorkoutLog('non_existent');
    assert.strictEqual(loaded, null);
});

runTest('TEST 48: clearWorkoutLogs purges only namespaced store', () => {
    window.localStorage.setItem('otherWebsiteKey', 'preserve_me');
    loggerEngine.clearWorkoutLogs();
    assert.strictEqual(loggerEngine.listWorkoutLogs().length, 0);
    assert.strictEqual(window.localStorage.getItem('otherWebsiteKey'), 'preserve_me');
});

// -----------------------------------------------------------------------------
// CATEGORY I: SUMMARY METRICS (Tests 49–53)
// -----------------------------------------------------------------------------
runTest('TEST 49: Summary computes total planned sets accurately', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const summary = loggerEngine.getWorkoutSummary(log);
    assert.ok(summary.totalPlannedSets > 0);
});

runTest('TEST 50: Summary computes completed sets accurately', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 10, completed: true });
    loggerEngine.logSet(log, targetEx, { setNumber: 2, actualReps: 10, completed: true });

    const summary = loggerEngine.getWorkoutSummary(log);
    assert.strictEqual(summary.completedSets, 2);
});

runTest('TEST 51: Summary calculates factual completion percentage', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const totalPlanned = log.plannedSnapshot.exercises.reduce((acc, e) => acc + e.plannedSets, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;

    loggerEngine.logSet(log, targetEx, { setNumber: 1, completed: true });
    const summary = loggerEngine.getWorkoutSummary(log);
    const expected = Math.round((1 / totalPlanned) * 1000) / 10;
    assert.strictEqual(summary.completionPercentage, expected);
});

runTest('TEST 52: Summary calculates total actual reps across session', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 10, completed: true });
    loggerEngine.logSet(log, targetEx, { setNumber: 2, actualReps: 8, completed: true });

    const summary = loggerEngine.getWorkoutSummary(log);
    assert.strictEqual(summary.totalActualReps, 18);
});

runTest('TEST 53: Summary tracks exercises completed vs skipped', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 10, completed: true });

    const summary = loggerEngine.getWorkoutSummary(log);
    assert.strictEqual(summary.exercisesCompleted, 1);
    assert.strictEqual(summary.exercisesSkipped, log.exercises.length - 1);
});

// -----------------------------------------------------------------------------
// CATEGORY J: DETERMINISM & IMMUTABILITY (Tests 54–57)
// -----------------------------------------------------------------------------
runTest('TEST 54: getDeterministicWorkoutSnapshot excludes timestamps and logId', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0, 'dyn_id_1');
    log.startedAt = '2026-08-19T10:00:00.000Z';
    log.completedAt = '2026-08-19T11:00:00.000Z';

    const snap = loggerEngine.getDeterministicWorkoutSnapshot(log);
    assert.ok(!snap.includes('dyn_id_1'));
    assert.ok(!snap.includes('2026-08-19T10:00:00.000Z'));
    assert.ok(!snap.includes('2026-08-19T11:00:00.000Z'));
});

runTest('TEST 55: Deterministic snapshot remains identical for identical workout performance', () => {
    const logA = loggerEngine.createWorkoutLog(sampleProgram, 0, 'log_A');
    const logB = loggerEngine.createWorkoutLog(sampleProgram, 0, 'log_B');

    const snapA = loggerEngine.getDeterministicWorkoutSnapshot(logA);
    const snapB = loggerEngine.getDeterministicWorkoutSnapshot(logB);
    assert.strictEqual(snapA, snapB);
});

runTest('TEST 56: Generated program is not mutated during workout logging', () => {
    const programClone = JSON.stringify(sampleProgram);
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 20, actualLoad: 100 });

    assert.strictEqual(JSON.stringify(sampleProgram), programClone);
});

runTest('TEST 57: Repeated snapshot generation produces 100% identical string', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0, 'snap_test');
    const snap1 = loggerEngine.getDeterministicWorkoutSnapshot(log);
    for (let i = 0; i < 10; i++) {
        assert.strictEqual(loggerEngine.getDeterministicWorkoutSnapshot(log), snap1);
    }
});

// -----------------------------------------------------------------------------
// CATEGORY K: RESUME / ACTIVE LOOKUP & DETAILS (Tests 58–62)
// -----------------------------------------------------------------------------
runTest('TEST 58: getActiveWorkoutLog finds currently IN_PROGRESS workout', () => {
    loggerEngine.clearWorkoutLogs();
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0, 'active_test_1');
    loggerEngine.startWorkout(log);
    loggerEngine.saveWorkoutLog(log);

    const active = loggerEngine.getActiveWorkoutLog(sampleProgram.programId, log.sessionId);
    assert.ok(active);
    assert.strictEqual(active.logId, 'active_test_1');
    assert.strictEqual(active.status, loggerEngine.SESSION_STATUS.IN_PROGRESS);
});

runTest('TEST 59: Completed workout is not returned by getActiveWorkoutLog', () => {
    const active = loggerEngine.getActiveWorkoutLog(sampleProgram.programId, sampleProgram.sessions[0].day);
    assert.ok(active);
    loggerEngine.completeWorkout(active);
    loggerEngine.saveWorkoutLog(active);

    const check = loggerEngine.getActiveWorkoutLog(sampleProgram.programId, sampleProgram.sessions[0].day);
    assert.strictEqual(check, null);
});

runTest('TEST 60: Serialization and deserialization roundtrip preserves full log integrity', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0, 'roundtrip_log');
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, actualReps: 12, actualLoad: 50, notes: 'Felt light' });

    const serialized = loggerEngine.serializeWorkoutLog(log);
    const restored = loggerEngine.deserializeWorkoutLog(serialized);

    assert.strictEqual(restored.logId, 'roundtrip_log');
    assert.strictEqual(restored.exercises[0].sets[0].actualReps, 12);
    assert.strictEqual(restored.exercises[0].sets[0].notes, 'Felt light');
});

runTest('TEST 61: Set notes preserved and updated cleanly', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, notes: 'Focus on eccentric control' });

    const setRec = log.exercises.find(e => e.exerciseId === targetEx).sets[0];
    assert.strictEqual(setRec.notes, 'Focus on eccentric control');
});

runTest('TEST 62: Duration in seconds supported and preserved for timed exercises', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    const targetEx = sampleProgram.sessions[0].exercises[0].exerciseId;
    loggerEngine.logSet(log, targetEx, { setNumber: 1, durationSeconds: 60, completed: true });

    const setRec = log.exercises.find(e => e.exerciseId === targetEx).sets[0];
    assert.strictEqual(setRec.durationSeconds, 60);
    assert.strictEqual(setRec.completed, true);
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
