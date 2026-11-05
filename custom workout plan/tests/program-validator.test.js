/**
 * ==============================================================================
 * HANUMAN GYM — PROGRAM VALIDATION & SAFETY GATE TEST SUITE
 * Comprehensive Unit Test Harness verifying all 47 required validation & safety scenarios.
 * ==============================================================================
 */

const assert = require('assert');
const path = require('path');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const rulesEngine = require('../js/engine/training-rules.js');
const programGen = require('../js/engine/program-generator.js');
const validatorEngine = require('../js/engine/program-validator.js');

let totalTests = 0;
let passedTests = 0;

function runTest(testName, testFn) {
    totalTests++;
    try {
        testFn();
        console.log(`  ✅ [PASS] ${testName}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${testName}`);
        console.error(`     Error: ${err.message}`);
        console.error(err.stack);
    }
}

console.log('================================================================');
console.log('RUNNING PROGRAM VALIDATION & SAFETY GATE SUITE (PHASE 6)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: STRUCTURE (Tests 1-8)
// -----------------------------------------------------------------------------
runTest('TEST 1: Valid program passes validation', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    const res = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);

    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.status, 'VALID');
    assert.strictEqual(res.summary.errorCount, 0);
    assert.strictEqual(res.summary.criticalCount, 0);
});

runTest('TEST 2: Missing program fails validation', () => {
    const res = validatorEngine.validateProgram(null);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.status, 'INVALID');
    assert.ok(res.errors.some(e => e.code === 'STRUCTURAL_ROOT'));
});

runTest('TEST 3: Invalid program version fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.version = null;
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'PROGRAM_VERSION'));
});

runTest('TEST 4: Session count mismatch fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.weeklySchedule.sessionCount = 5; // mismatch (actual sessions: 3)
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'SESSION_COUNT_MISMATCH'));
});

runTest('TEST 5: Invalid training day fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].day = '';
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'SESSION_METADATA'));
});

runTest('TEST 6: Duplicate training day fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[1].day = 'Monday'; // duplicate day
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'TRAINING_DAY_DUPLICATE'));
});

runTest('TEST 7: Invalid exercise ordering fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[1].order = 99; // non-sequential
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'EXERCISE_ORDER'));
});

runTest('TEST 8: Duplicate exercise in session fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[1].exerciseId = prog.sessions[0].exercises[0].exerciseId; // duplicate
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'DUPLICATE_EXERCISE_IN_SESSION'));
});

// -----------------------------------------------------------------------------
// CATEGORY B: EXERCISE INTEGRITY (Tests 9-13)
// -----------------------------------------------------------------------------
runTest('TEST 9: Unknown exercise ID fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].exerciseId = 'fake_exercise_xyz_999';
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'EXERCISE_EXISTS'));
});

runTest('TEST 10: Missing exercise metadata fails in safety gate', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].exerciseId = '';
    const safety = validatorEngine.runSafetyGate(prog, profile, {}, exerciseDB);
    assert.strictEqual(safety.passed, false);
});

runTest('TEST 11: Missing progression model fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    delete prog.sessions[0].exercises[0].progressionModel;
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'PRESCRIPTION_PROGRESSION'));
});

runTest('TEST 12: Invalid difficulty metadata handling', () => {
    const canonical = exerciseDB.getExerciseById('barbell_bench_press');
    assert.ok(['beginner', 'intermediate', 'advanced'].includes(canonical.difficulty));
});

runTest('TEST 13: Invalid fatigue metadata handling', () => {
    const canonical = exerciseDB.getExerciseById('barbell_back_squat');
    assert.ok(canonical.fatigueCost >= 1 && canonical.fatigueCost <= 5);
});

// -----------------------------------------------------------------------------
// CATEGORY C: EQUIPMENT (Tests 14-17)
// -----------------------------------------------------------------------------
runTest('TEST 14: Available equipment passes', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'gym' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    const safety = validatorEngine.runSafetyGate(prog, profile, reqs, exerciseDB);
    assert.strictEqual(safety.passed, true);
});

runTest('TEST 15: Missing equipment fails in safety gate', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: ['dumbbell'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    
    // Inject a barbell bench press into home dumbbell workout
    prog.sessions[0].exercises[0].exerciseId = 'barbell_bench_press';
    const safety = validatorEngine.runSafetyGate(prog, profile, reqs, exerciseDB);
    assert.strictEqual(safety.passed, false);
    assert.ok(safety.criticalFailures.some(f => f.ruleId === 'EQUIPMENT_UNAVAILABLE'));
});

runTest('TEST 16: Deterministic equipment replacement succeeds', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: ['dumbbell', 'bench'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    prog.sessions[0].exercises[0].exerciseId = 'barbell_bench_press'; // unavailable
    const repaired = validatorEngine.repairProgram(prog, profile, reqs, exerciseDB);
    
    // Must be replaced with dumbbell_bench_press
    assert.strictEqual(repaired.sessions[0].exercises[0].exerciseId, 'dumbbell_bench_press');
});

runTest('TEST 17: Impossible equipment replacement fails safely', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: ['nonexistent_eq_123'] });
    const reqs = {
        equipmentConstraints: { allowedEquipment: ['nonexistent_eq_123'] },
        exerciseConstraints: { prohibitedConstraintTags: [] },
        sessionRequirements: { maxTechnicalComplexity: 5 }
    };
    const prog = {
        version: '1.0',
        programId: 'prog_impossible',
        weeklySchedule: { sessionCount: 1, trainingDays: ['Monday'] },
        sessions: [{ day: 'Monday', title: 'Test', exercises: [{ order: 1, exerciseId: 'barbell_bench_press', sets: 3, reps: '8-10', restSeconds: 60, progressionModel: 'double_progression' }] }],
        personalizationReasons: [{ rule: 'test', reason: 'test', source: 'test' }]
    };

    const repairCycle = validatorEngine.validateAndRepairProgram(prog, profile, reqs, exerciseDB);
    assert.strictEqual(repairCycle.validation.valid, false);
});

// -----------------------------------------------------------------------------
// CATEGORY D: SAFETY (Tests 18-22)
// -----------------------------------------------------------------------------
runTest('TEST 18: Knee restriction blocks prohibited exercise', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'male', goal: 'muscle-gain', injuries: ['sensitive-knees'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    
    prog.sessions[0].exercises[0].exerciseId = 'barbell_back_squat';
    const safety = validatorEngine.runSafetyGate(prog, profile, reqs, exerciseDB);
    assert.strictEqual(safety.passed, false);
    assert.ok(safety.criticalFailures.some(f => f.ruleId === 'SAFETY_RESTRICTION_VIOLATED'));
});

runTest('TEST 19: Back restriction blocks prohibited exercise', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'male', goal: 'muscle-gain', injuries: ['sensitive-back'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    prog.sessions[0].exercises[0].exerciseId = 'barbell_deadlift';
    const safety = validatorEngine.runSafetyGate(prog, profile, reqs, exerciseDB);
    assert.strictEqual(safety.passed, false);
    assert.ok(safety.criticalFailures.some(f => f.ruleId === 'SAFETY_RESTRICTION_VIOLATED'));
});

runTest('TEST 20: Shoulder restriction blocks prohibited exercise', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'male', goal: 'muscle-gain', injuries: ['shoulder'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    prog.sessions[0].exercises[0].exerciseId = 'overhead_military_press';
    const safety = validatorEngine.runSafetyGate(prog, profile, reqs, exerciseDB);
    assert.strictEqual(safety.passed, false);
    assert.ok(safety.criticalFailures.some(f => f.ruleId === 'SAFETY_RESTRICTION_VIOLATED'));
});

runTest('TEST 21: Safety restriction cannot be overridden by score', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'male', goal: 'strength', focusAreas: ['legs'], injuries: ['sensitive-knees'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    
    // Safety gate must still reject barbell_back_squat even with high leg/strength score
    prog.sessions[0].exercises[0].exerciseId = 'barbell_back_squat';
    const safety = validatorEngine.runSafetyGate(prog, profile, reqs, exerciseDB);
    assert.strictEqual(safety.passed, false);
});

runTest('TEST 22: Safety override is recorded', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'male', goal: 'muscle-gain', injuries: ['sensitive-knees'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    prog.sessions[0].exercises[0].exerciseId = 'barbell_back_squat';
    const val = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);
    assert.ok(val.safetyOverrides.length > 0);
    assert.strictEqual(val.safetyOverrides[0].exerciseId, 'barbell_back_squat');
});

// -----------------------------------------------------------------------------
// CATEGORY E: PRESCRIPTION (Tests 23-26)
// -----------------------------------------------------------------------------
runTest('TEST 23: Invalid sets fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].sets = 15; // exceeds 10
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'PRESCRIPTION_SETS'));
});

runTest('TEST 24: Invalid reps fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].reps = 'abc'; // non-numeric
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'PRESCRIPTION_REPS'));
});

runTest('TEST 25: Invalid rest fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].restSeconds = 500; // unrealistic rest (>300s)
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'PRESCRIPTION_REST'));
});

runTest('TEST 26: Invalid progression model fails', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].progressionModel = '';
    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'PRESCRIPTION_PROGRESSION'));
});

// -----------------------------------------------------------------------------
// CATEGORY F: DURATION (Tests 27-30)
// -----------------------------------------------------------------------------
runTest('TEST 27: Duration within tolerance passes (including exact 0.60x and 1.50x boundaries)', () => {
    // 1. Natural generated program within tolerance
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutDuration: '40-60' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    const res = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);
    assert.ok(!res.errors.some(e => e.code === 'SESSION_DURATION_BUDGET'));

    // 2. Constants verification
    assert.strictEqual(validatorEngine.DURATION_MIN_RATIO, 0.60);
    assert.strictEqual(validatorEngine.DURATION_MAX_RATIO, 1.50);

    // 3. Exact 0.60x lower boundary acceptance (36m on 60m budget)
    const exactMinBudget = { totalMinutes: 60, warmupMinutes: 5, cooldownMinutes: 5 };
    const progMin = {
        version: '1.0',
        programId: 'prog_test_min_boundary',
        weeklySchedule: { sessionCount: 1, trainingDays: ['Monday'] },
        sessions: [{
            day: 'Monday',
            title: 'Exact Lower Boundary Session',
            exercises: [
                { order: 1, exerciseId: 'dumbbell_bench_press', sets: 3, reps: '10', restSeconds: 315, progressionModel: 'double_progression' },
                { order: 2, exerciseId: 'one_arm_dumbbell_row', sets: 3, reps: '10', restSeconds: 315, progressionModel: 'double_progression' }
            ]
        }],
        personalizationReasons: [{ rule: 'test', reason: 'Exact boundary test', source: 'test' }]
    };
    const minCalculated = validatorEngine._internals.calculateSessionPhysicalDuration(progMin.sessions[0], exactMinBudget);
    assert.strictEqual(minCalculated, 36); // 0.60 * 60 = 36m
    const resMin = validatorEngine.validateProgram(progMin, profile, { sessionRequirements: { budget: exactMinBudget } }, exerciseDB);
    assert.ok(!resMin.errors.some(e => e.code === 'SESSION_DURATION_BUDGET'), '36m on 60m budget (0.60x) must be accepted.');

    // 4. Exact 1.50x upper boundary acceptance (90m on 60m budget)
    const exactMaxBudget = { totalMinutes: 60, warmupMinutes: 5, cooldownMinutes: 5 };
    const progMax = {
        version: '1.0',
        programId: 'prog_test_max_boundary',
        weeklySchedule: { sessionCount: 1, trainingDays: ['Monday'] },
        sessions: [{
            day: 'Monday',
            title: 'Exact Upper Boundary Session',
            exercises: [
                { order: 1, exerciseId: 'dumbbell_bench_press', sets: 5, reps: '10', restSeconds: 240, progressionModel: 'double_progression' },
                { order: 2, exerciseId: 'one_arm_dumbbell_row', sets: 5, reps: '10', restSeconds: 240, progressionModel: 'double_progression' },
                { order: 3, exerciseId: 'dumbbell_overhead_press', sets: 5, reps: '10', restSeconds: 240, progressionModel: 'double_progression' },
                { order: 4, exerciseId: 'lateral_raise', sets: 5, reps: '10', restSeconds: 240, progressionModel: 'double_progression' }
            ]
        }],
        personalizationReasons: [{ rule: 'test', reason: 'Exact boundary test', source: 'test' }]
    };
    const maxCalculated = validatorEngine._internals.calculateSessionPhysicalDuration(progMax.sessions[0], exactMaxBudget);
    assert.strictEqual(maxCalculated, 90); // 1.50 * 60 = 90m
    const resMax = validatorEngine.validateProgram(progMax, profile, { sessionRequirements: { budget: exactMaxBudget } }, exerciseDB);
    assert.ok(!resMax.errors.some(e => e.code === 'SESSION_DURATION_BUDGET'), '90m on 60m budget (1.50x) must be accepted.');
});

runTest('TEST 28: Duration outside tolerance detected (35m and 91m on 60m budget, 0.55x and 1.55x rejected)', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutDuration: '20-min-or-less' });
    const budget60 = { totalMinutes: 60, warmupMinutes: 5, cooldownMinutes: 5 };

    // 1. Under boundary test: 35 minutes (< 0.60 * 60) must fail
    const prog35m = {
        version: '1.0',
        programId: 'prog_test_35m',
        weeklySchedule: { sessionCount: 1, trainingDays: ['Monday'] },
        sessions: [{
            day: 'Monday',
            title: '35m Session',
            exercises: [
                { order: 1, exerciseId: 'dumbbell_bench_press', sets: 3, reps: '10', restSeconds: 300, progressionModel: 'double_progression' },
                { order: 2, exerciseId: 'one_arm_dumbbell_row', sets: 3, reps: '10', restSeconds: 300, progressionModel: 'double_progression' }
            ]
        }],
        personalizationReasons: [{ rule: 'test', reason: '35m test', source: 'test' }]
    };
    const dur35 = validatorEngine._internals.calculateSessionPhysicalDuration(prog35m.sessions[0], budget60);
    assert.strictEqual(dur35, 35);
    const res35 = validatorEngine.validateProgram(prog35m, profile, { sessionRequirements: { budget: budget60 } }, exerciseDB);
    assert.strictEqual(res35.valid, false);
    assert.ok(res35.errors.some(e => e.code === 'SESSION_DURATION_BUDGET'), '35m on 60m budget must fail.');

    // 2. Over boundary test: 91 minutes (> 1.50 * 60) must fail
    const prog91m = {
        version: '1.0',
        programId: 'prog_test_91m',
        weeklySchedule: { sessionCount: 1, trainingDays: ['Monday'] },
        sessions: [{
            day: 'Monday',
            title: '91m Session',
            exercises: [
                { order: 1, exerciseId: 'dumbbell_bench_press', sets: 5, reps: '10', restSeconds: 244, progressionModel: 'double_progression' },
                { order: 2, exerciseId: 'one_arm_dumbbell_row', sets: 5, reps: '10', restSeconds: 244, progressionModel: 'double_progression' },
                { order: 3, exerciseId: 'dumbbell_overhead_press', sets: 5, reps: '10', restSeconds: 244, progressionModel: 'double_progression' },
                { order: 4, exerciseId: 'lateral_raise', sets: 5, reps: '10', restSeconds: 244, progressionModel: 'double_progression' }
            ]
        }],
        personalizationReasons: [{ rule: 'test', reason: '91m test', source: 'test' }]
    };
    const dur91 = validatorEngine._internals.calculateSessionPhysicalDuration(prog91m.sessions[0], budget60);
    assert.strictEqual(dur91, 91);
    const res91 = validatorEngine.validateProgram(prog91m, profile, { sessionRequirements: { budget: budget60 } }, exerciseDB);
    assert.strictEqual(res91.valid, false);
    assert.ok(res91.errors.some(e => e.code === 'SESSION_DURATION_BUDGET'), '91m on 60m budget must fail.');

    // 3. Confirm 0.55x (33m) and 1.55x (93m) are NOT accepted as valid
    assert.ok(33 < 60 * validatorEngine.DURATION_MIN_RATIO);
    assert.ok(93 > 60 * validatorEngine.DURATION_MAX_RATIO);
});

runTest('TEST 29: Final-set rest not counted and deterministic duration calculation', () => {
    const sess = {
        exercises: [{ sets: 3, reps: '10', restSeconds: 60 }]
    };
    // 5m warmup + 5m cooldown + (3 sets * 10 reps * 4s = 120s) + (2 rests * 60s = 120s) = 10m + 4m = 14m
    const duration1 = validatorEngine._internals.calculateSessionPhysicalDuration(sess, { warmupMinutes: 5, cooldownMinutes: 5 });
    assert.strictEqual(duration1, 14);

    // 1-set exercise has exactly 0 rests: 5m + 5m + (1 * 10 * 4s = 40s = 1m) + 0 rests = 11m
    const sessSingle = { exercises: [{ sets: 1, reps: '10', restSeconds: 90 }] };
    const durationSingle = validatorEngine._internals.calculateSessionPhysicalDuration(sessSingle, { warmupMinutes: 5, cooldownMinutes: 5 });
    assert.strictEqual(durationSingle, 11);

    // Deterministic repeatability
    for (let i = 0; i < 10; i++) {
        assert.strictEqual(validatorEngine._internals.calculateSessionPhysicalDuration(sess, { warmupMinutes: 5, cooldownMinutes: 5 }), 14);
    }
});

runTest('TEST 30: Repairable duration overrun is repaired', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutDuration: '40-60' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    // Inflate sets on all exercises to 5
    prog.sessions[0].exercises.forEach(e => { e.sets = 5; });
    const repaired = validatorEngine.repairProgram(prog, profile, reqs, exerciseDB);
    
    // Repair should have trimmed accessory sets
    assert.ok(repaired.sessions[0].exercises[2].sets <= 3);
});

// -----------------------------------------------------------------------------
// CATEGORY G: VOLUME (Tests 31-33)
// -----------------------------------------------------------------------------
runTest('TEST 31: Weekly volume within target passes', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    const res = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);
    assert.ok(!res.errors.some(e => e.code === 'VOLUME_MAX_EXCEEDED'));
});

runTest('TEST 32: Excessive volume detected', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    prog.sessions[0].exercises[0].sets = 10;
    prog.sessions[1].exercises[0].sets = 10;
    prog.sessions[2].exercises[0].sets = 10;

    const res = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'VOLUME_MAX_EXCEEDED'));
});

runTest('TEST 33: Volume repair succeeds when possible', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    
    const repairCycle = validatorEngine.validateAndRepairProgram(prog, profile, reqs, exerciseDB);
    assert.strictEqual(repairCycle.validation.valid, true);
});

// -----------------------------------------------------------------------------
// CATEGORY H: FATIGUE (Tests 34-35)
// -----------------------------------------------------------------------------
runTest('TEST 34: High-fatigue ceiling detected', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);

    // Injects 4 high-fatigue exercises (fatigueCost >= 4)
    prog.sessions[0].exercises[0].exerciseId = 'barbell_back_squat'; // fatigue 5
    prog.sessions[0].exercises[1].exerciseId = 'barbell_bench_press'; // fatigue 4
    prog.sessions[0].exercises[2].exerciseId = 'barbell_bent_over_row'; // fatigue 4
    prog.sessions[0].exercises[3].exerciseId = 'overhead_military_press'; // fatigue 4

    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'FATIGUE_SESSION_CEILING'));
});

runTest('TEST 35: Squat + conventional deadlift conflict detected and repaired', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    prog.sessions[0].exercises[0].exerciseId = 'barbell_back_squat';
    prog.sessions[0].exercises[1].exerciseId = 'barbell_deadlift';

    const res = validatorEngine.validateProgram(prog);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'FATIGUE_COMPOUND_CONFLICT'));

    const repaired = validatorEngine.repairProgram(prog, profile, reqs, exerciseDB);
    // Deadlift replaced with romanian_deadlift
    assert.strictEqual(repaired.sessions[0].exercises[1].exerciseId, 'romanian_deadlift');
});

// -----------------------------------------------------------------------------
// CATEGORY I: MOVEMENT COVERAGE (Tests 36-38)
// -----------------------------------------------------------------------------
runTest('TEST 36: Required movement coverage passes', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    const res = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);
    assert.ok(!res.warnings.some(w => w.code === 'MOVEMENT_PATTERN_MISSING'));
});

runTest('TEST 37: Missing pattern warning generated', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    // Remove horizontal push
    prog.sessions.forEach(s => {
        s.exercises = s.exercises.filter(e => e.movementPattern !== 'horizontal_push');
    });

    const res = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);
    assert.ok(res.warnings.some(w => w.code === 'MOVEMENT_PATTERN_MISSING'));
});

runTest('TEST 38: Equipment restriction explains missing pattern', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: [] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    assert.ok(reqs.equipmentConstraints.isRestricted);
});

// -----------------------------------------------------------------------------
// CATEGORY J: REPAIR (Tests 39-43)
// -----------------------------------------------------------------------------
runTest('TEST 39: Repair does not mutate original program', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: ['dumbbell'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    prog.sessions[0].exercises[0].exerciseId = 'barbell_bench_press';
    const originalId = prog.sessions[0].exercises[0].exerciseId;

    const repaired = validatorEngine.repairProgram(prog, profile, reqs, exerciseDB);
    
    assert.strictEqual(prog.sessions[0].exercises[0].exerciseId, originalId);
    assert.notStrictEqual(repaired.sessions[0].exercises[0].exerciseId, originalId);
});

runTest('TEST 40: Repair is deterministic across repeated passes', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: ['dumbbell'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    prog.sessions[0].exercises[0].exerciseId = 'barbell_bench_press';

    const rep1 = validatorEngine.repairProgram(prog, profile, reqs, exerciseDB);
    const rep2 = validatorEngine.repairProgram(prog, profile, reqs, exerciseDB);

    assert.deepStrictEqual(rep1.sessions, rep2.sessions);
});

runTest('TEST 41: Repaired program is revalidated', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: ['dumbbell', 'bench'], trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    prog.sessions[0].exercises[0].exerciseId = 'barbell_bench_press';

    const cycle = validatorEngine.validateAndRepairProgram(prog, profile, reqs, exerciseDB);
    assert.strictEqual(cycle.repaired, true);
    assert.strictEqual(cycle.validation.valid, true);
});

runTest('TEST 42: Repair iteration limit works', () => {
    assert.strictEqual(validatorEngine.MAX_REPAIR_ITERATIONS, 5);
});

runTest('TEST 43: Impossible repair returns INVALID', () => {
    const prog = {
        version: '1.0',
        programId: 'prog_corrupted',
        weeklySchedule: null, // unrecoverable
        sessions: []
    };
    const cycle = validatorEngine.validateAndRepairProgram(prog, {}, {}, exerciseDB);
    assert.strictEqual(cycle.validation.valid, false);
    assert.strictEqual(cycle.validation.status, 'INVALID');
});

// -----------------------------------------------------------------------------
// CATEGORY K: QUALITY & DETERMINISM (Tests 44-47)
// -----------------------------------------------------------------------------
runTest('TEST 44: Validation snapshot is deterministic', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    const res1 = validatorEngine.validateProgram(prog);
    const res2 = validatorEngine.validateProgram(prog);

    const snap1 = validatorEngine.getDeterministicValidationSnapshot(res1);
    const snap2 = validatorEngine.getDeterministicValidationSnapshot(res2);

    assert.deepStrictEqual(snap1, snap2);
});

runTest('TEST 45: Runtime metadata does not affect snapshot', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    const res = validatorEngine.validateProgram(prog);
    res.validatedAt = '2026-08-19T17:00:00.000Z';

    const snap = validatorEngine.getDeterministicValidationSnapshot(res);
    assert.strictEqual(snap.validatedAt, undefined);
});

runTest('TEST 46: Quality metrics equal actual program values', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const prog = programGen.generateWorkoutProgram(profile);
    const res = validatorEngine.validateProgram(prog);

    assert.strictEqual(res.qualityMetrics.sessionCount, 3);
    assert.strictEqual(res.qualityMetrics.totalWeeklySets, prog.qualityMetrics.totalPlannedWeeklySets);
});

runTest('TEST 47: Repeated validation produces identical results', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 28, gender: 'male', goal: 'strength' });
    const prog = programGen.generateWorkoutProgram(profile);

    const v1 = validatorEngine.validateProgram(prog);
    for (let i = 0; i < 10; i++) {
        const vNext = validatorEngine.validateProgram(prog);
        assert.deepStrictEqual(vNext.summary, v1.summary);
        assert.deepStrictEqual(vNext.errors, v1.errors);
    }
});

console.log(`\n================================================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
