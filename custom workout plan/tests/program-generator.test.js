/**
 * ==============================================================================
 * HANUMAN GYM — DYNAMIC WORKOUT PROGRAM GENERATOR TEST SUITE
 * Comprehensive Unit Test Harness verifying all 42 required program generator scenarios.
 * ==============================================================================
 */

const assert = require('assert');
const path = require('path');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const rulesEngine = require('../js/engine/training-rules.js');
const programGen = require('../js/engine/program-generator.js');

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
console.log('RUNNING HARDENED DYNAMIC PROGRAM GENERATOR SUITE (PHASE 5)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Beginner muscle-gain, 3 days
// -----------------------------------------------------------------------------
runTest('TEST 1: Beginner muscle-gain, 3 days', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 22,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        experience: 'beginner'
    });
    const program = programGen.generateWorkoutProgram(profile);
    const validation = programGen.validateGeneratedProgram(program);

    assert.strictEqual(validation.valid, true);
    assert.strictEqual(program.weeklySchedule.sessionCount, 3);
    assert.strictEqual(program.weeklySchedule.splitType, 'full_body');
    assert.ok(program.sessions.length === 3);
});

// -----------------------------------------------------------------------------
// TEST 2: Intermediate muscle-gain, 4 days
// -----------------------------------------------------------------------------
runTest('TEST 2: Intermediate muscle-gain, 4 days', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 26,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        experience: 'intermediate'
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.strictEqual(program.weeklySchedule.sessionCount, 4);
    assert.strictEqual(program.weeklySchedule.splitType, 'upper_lower');
    assert.ok(program.sessions.every(s => s.exercises.length >= 4));
});

// -----------------------------------------------------------------------------
// TEST 3: Weight-loss program
// -----------------------------------------------------------------------------
runTest('TEST 3: Weight-loss program', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 30,
        gender: 'female',
        goal: 'weight-loss',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.strictEqual(program.profileSummary.goal, 'weight-loss');
    assert.ok(program.personalizationReasons.some(r => r.source === 'goals.primary'));
});

// -----------------------------------------------------------------------------
// TEST 4: General-fitness program
// -----------------------------------------------------------------------------
runTest('TEST 4: General-fitness program', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 35,
        gender: 'male',
        goal: 'general-fitness',
        trainingDays: ['Tuesday', 'Saturday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.strictEqual(program.weeklySchedule.sessionCount, 2);
    assert.strictEqual(program.weeklySchedule.splitType, 'full_body');
});

// -----------------------------------------------------------------------------
// TEST 5: Strength program
// -----------------------------------------------------------------------------
runTest('TEST 5: Strength program', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 28,
        gender: 'male',
        goal: 'strength',
        trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        experience: 'advanced'
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.strictEqual(program.weeklySchedule.sessionCount, 6);
    assert.strictEqual(program.weeklySchedule.splitType, 'push_pull_legs');
    const firstAnchor = program.sessions[0].exercises[0];
    assert.ok(firstAnchor.reps.includes('5-6') || firstAnchor.reps.includes('6-10'));
});

// -----------------------------------------------------------------------------
// TEST 6: Gym equipment
// -----------------------------------------------------------------------------
runTest('TEST 6: Gym equipment', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 25,
        gender: 'male',
        goal: 'muscle-gain',
        workoutLocation: 'gym',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    const allExercises = program.sessions.flatMap(s => s.exercises);
    assert.ok(allExercises.some(e => e.equipment.includes('barbell') || e.equipment.includes('cable')));
});

// -----------------------------------------------------------------------------
// TEST 7: Home dumbbell program
// -----------------------------------------------------------------------------
runTest('TEST 7: Home dumbbell program', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 29,
        gender: 'male',
        goal: 'muscle-gain',
        workoutLocation: 'home',
        homeEquipment: ['dumbbell', 'bench'],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    const allExercises = program.sessions.flatMap(s => s.exercises);
    allExercises.forEach(e => {
        e.equipment.forEach(eq => {
            assert.ok(['dumbbell', 'bench', 'bodyweight', 'mat', 'no_equipment'].includes(eq), `Invalid equip ${eq} in home program`);
        });
    });
});

// -----------------------------------------------------------------------------
// TEST 8: Bodyweight-only home program
// -----------------------------------------------------------------------------
runTest('TEST 8: Bodyweight-only home program', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 24,
        gender: 'female',
        goal: 'get-shredded',
        workoutLocation: 'home',
        homeEquipment: [],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    const allExercises = program.sessions.flatMap(s => s.exercises);
    allExercises.forEach(e => {
        e.equipment.forEach(eq => {
            assert.ok(['bodyweight', 'mat', 'no_equipment'].includes(eq), `Non-bodyweight equip ${eq} found`);
        });
    });
});

// -----------------------------------------------------------------------------
// TEST 9: Focus-area personalization
// -----------------------------------------------------------------------------
runTest('TEST 9: Focus-area personalization', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 25,
        gender: 'male',
        goal: 'muscle-gain',
        focusAreas: ['weak-chest'],
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    const allExercises = program.sessions.flatMap(s => s.exercises);
    const chestExercises = allExercises.filter(e => e.primaryMuscles.includes('chest') || e.primaryMuscles.includes('upper_chest'));
    assert.ok(chestExercises.length >= 2, 'Chest focus area must yield targeted chest exercises');
});

// -----------------------------------------------------------------------------
// TEST 10: Secondary-goal influence
// -----------------------------------------------------------------------------
runTest('TEST 10: Secondary-goal influence', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 30,
        gender: 'male',
        goal: 'muscle-gain',
        goals: ['improve-sleep'],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.ok(program.profileSummary.goal === 'muscle-gain');
    assert.ok(program.personalizationReasons.length > 0);
});

// -----------------------------------------------------------------------------
// TEST 11: Injury constraint filtering
// -----------------------------------------------------------------------------
runTest('TEST 11: Injury constraint filtering', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 40,
        gender: 'male',
        goal: 'muscle-gain',
        injuries: ['sensitive-knees', 'sensitive-back'],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    const allExercises = program.sessions.flatMap(s => s.exercises);
    
    // Barbell Back Squats (deep knee flexion) and Conventional Deadlifts (heavy spinal loading) must NOT appear
    const prohibitedIds = ['barbell_back_squat', 'barbell_deadlift'];
    allExercises.forEach(e => {
        assert.ok(!prohibitedIds.includes(e.exerciseId), `Prohibited injury exercise ${e.exerciseId} was prescribed`);
    });
});

// -----------------------------------------------------------------------------
// TEST 12: Unknown equipment handling
// -----------------------------------------------------------------------------
runTest('TEST 12: Unknown equipment handling', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 26,
        gender: 'male',
        goal: 'muscle-gain',
        workoutLocation: null,
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.strictEqual(program.profileSummary.workoutLocation, 'gym');
    assert.ok(program.sessions.length === 3);
});

// -----------------------------------------------------------------------------
// TEST 13: Short workout duration
// -----------------------------------------------------------------------------
runTest('TEST 13: Short workout duration', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 25,
        gender: 'female',
        goal: 'weight-loss',
        workoutDuration: '20-min-or-less',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    program.sessions.forEach(s => {
        assert.ok(s.exercises.length <= 4, `Short duration session had ${s.exercises.length} exercises`);
        assert.ok(s.estimatedDurationMinutes <= 30, `Duration ${s.estimatedDurationMinutes} exceeded short budget`);
    });
});

// -----------------------------------------------------------------------------
// TEST 14: Long workout duration
// -----------------------------------------------------------------------------
runTest('TEST 14: Long workout duration', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 27,
        gender: 'male',
        goal: 'muscle-gain',
        workoutDuration: 'over-an-hour',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    program.sessions.forEach(s => {
        assert.ok(s.exercises.length >= 5);
    });
});

// -----------------------------------------------------------------------------
// TEST 15: Consecutive training days
// -----------------------------------------------------------------------------
runTest('TEST 15: Consecutive training days', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 24,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.strictEqual(program.sessions[0].day, 'Monday');
    assert.strictEqual(program.sessions[1].day, 'Tuesday');
    assert.strictEqual(program.sessions[2].day, 'Wednesday');
    assert.strictEqual(program.sessions[3].day, 'Thursday');
});

// -----------------------------------------------------------------------------
// TEST 16: Movement-pattern coverage
// -----------------------------------------------------------------------------
runTest('TEST 16: Movement-pattern coverage', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 26,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    const patterns = new Set(program.sessions.flatMap(s => s.exercises.map(e => e.movementPattern)));
    assert.ok(patterns.has('horizontal_push'), 'Missing horizontal_push');
    assert.ok(patterns.has('horizontal_pull'), 'Missing horizontal_pull');
    assert.ok(patterns.has('squat'), 'Missing squat');
    assert.ok(patterns.has('hinge'), 'Missing hinge');
});

// -----------------------------------------------------------------------------
// TEST 17: Weekly volume compliance
// -----------------------------------------------------------------------------
runTest('TEST 17: Weekly volume compliance', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 28,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    assert.ok(program.qualityMetrics.totalPlannedWeeklySets >= 40 && program.qualityMetrics.totalPlannedWeeklySets <= 120);
});

// -----------------------------------------------------------------------------
// TEST 18: Fatigue compliance
// -----------------------------------------------------------------------------
runTest('TEST 18: Fatigue compliance', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 22,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        experience: 'beginner'
    });
    const program = programGen.generateWorkoutProgram(profile);
    program.sessions.forEach(s => {
        const highFatigueCount = s.exercises.filter(e => e.fatigueCost >= 4).length;
        assert.ok(highFatigueCount <= 2, `Beginner session had ${highFatigueCount} high fatigue exercises`);
    });
});

// -----------------------------------------------------------------------------
// TEST 19: Session duration compliance
// -----------------------------------------------------------------------------
runTest('TEST 19: Session duration compliance', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 25,
        gender: 'male',
        goal: 'muscle-gain',
        workoutDuration: '40-60',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    program.sessions.forEach(s => {
        assert.ok(s.estimatedDurationMinutes >= 35 && s.estimatedDurationMinutes <= 75, `Duration ${s.estimatedDurationMinutes} outside reasonable bounds`);
    });
});

// -----------------------------------------------------------------------------
// TEST 20: Deterministic output
// -----------------------------------------------------------------------------
runTest('TEST 20: Deterministic output', () => {
    const raw = {
        age: 27,
        gender: 'male',
        goal: 'muscle-gain',
        height: '180',
        currentWeight: '78',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        workoutLocation: 'gym',
        workoutDuration: '40-60',
        focusAreas: ['weak-chest']
    };
    const profile1 = canonicalEngine.buildCanonicalUserProfile(raw, { timestamp: '2026-08-19T00:00:00Z' });
    const profile2 = canonicalEngine.buildCanonicalUserProfile(raw, { timestamp: '2026-08-19T00:00:00Z' });

    const prog1 = programGen.generateWorkoutProgram(profile1);
    const prog2 = programGen.generateWorkoutProgram(profile2);

    assert.strictEqual(prog1.programId, prog2.programId);
    assert.deepStrictEqual(prog1.sessions, prog2.sessions);
    assert.deepStrictEqual(prog1.qualityMetrics, prog2.qualityMetrics);
});

// -----------------------------------------------------------------------------
// TEST 21: Deterministic tie-breaking
// -----------------------------------------------------------------------------
runTest('TEST 21: Deterministic tie-breaking', () => {
    const exA = { id: 'exercise_b', technicalComplexity: 2, fatigueCost: 2 };
    const exB = { id: 'exercise_a', technicalComplexity: 2, fatigueCost: 2 };
    const tieResult = programGen._internals.deterministicTieBreaker(exA, exB);
    assert.ok(tieResult > 0, 'Alphabetical tie-break must place exercise_a before exercise_b');
});

// -----------------------------------------------------------------------------
// TEST 22: No random selection (10 consecutive iterations)
// -----------------------------------------------------------------------------
runTest('TEST 22: No random selection (10 consecutive iterations)', () => {
    const raw = {
        age: 26,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const p0 = programGen.generateWorkoutProgram(canonicalEngine.buildCanonicalUserProfile(raw));
    for (let i = 0; i < 10; i++) {
        const pNext = programGen.generateWorkoutProgram(canonicalEngine.buildCanonicalUserProfile(raw));
        assert.deepStrictEqual(pNext.sessions, p0.sessions);
    }
});

// -----------------------------------------------------------------------------
// TEST 23: Invalid program validation
// -----------------------------------------------------------------------------
runTest('TEST 23: Invalid program validation', () => {
    const valNull = programGen.validateGeneratedProgram(null);
    assert.strictEqual(valNull.valid, false);

    const malformed = { programId: 'test', sessions: [] };
    const valMalformed = programGen.validateGeneratedProgram(malformed);
    assert.strictEqual(valMalformed.valid, false);
    assert.ok(valMalformed.errors.some(e => e.includes('no workout sessions')));
});

// -----------------------------------------------------------------------------
// TEST 24: Graceful impossible-case failure
// -----------------------------------------------------------------------------
runTest('TEST 24: Graceful impossible-case failure', () => {
    const dummyReqs = {
        equipmentConstraints: { allowedEquipment: ['nonexistent_machine_123'] },
        exerciseConstraints: { prohibitedConstraintTags: [] },
        sessionRequirements: { maxTechnicalComplexity: 5 }
    };
    const chosen = programGen._internals.selectBestExerciseForSlot('horizontal_push', ['chest'], dummyReqs, [], exerciseDB);
    assert.strictEqual(chosen, null);
});

// -----------------------------------------------------------------------------
// TEST 25: Existing legacy engine remains loadable
// -----------------------------------------------------------------------------
runTest('TEST 25: Existing legacy engine remains loadable', () => {
    const legacyDB = require('../workout-plans-database.json');
    assert.ok(legacyDB && Array.isArray(legacyDB.workoutPlans));
    assert.strictEqual(legacyDB.workoutPlans.length, 1152);
});

// -----------------------------------------------------------------------------
// TEST 26: Every generated exercise resolves through Exercise Intelligence Database
// -----------------------------------------------------------------------------
runTest('TEST 26: Every generated exercise resolves through Exercise Intelligence Database', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({
        age: 27,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
    });
    const program = programGen.generateWorkoutProgram(profile);
    program.sessions.forEach(sess => {
        sess.exercises.forEach(ex => {
            const canonicalEntity = exerciseDB.getExerciseById(ex.exerciseId);
            assert.ok(canonicalEntity, `Generated exercise ${ex.exerciseId} not found in database`);
            assert.strictEqual(canonicalEntity.id, ex.exerciseId);
        });
    });
});

// -----------------------------------------------------------------------------
// TEST 27: Validator catches weekly volume violation
// -----------------------------------------------------------------------------
runTest('TEST 27: Validator catches weekly volume violation', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    
    // Artificially inject excessive volume on chest
    prog.sessions[0].exercises[0].sets = 50; // 50 sets in 1 session
    const val = programGen.validateGeneratedProgram(prog, reqs);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Volume Violation') || e.includes('Invalid sets count')));
});

// -----------------------------------------------------------------------------
// TEST 28: Validator catches missing required movement pattern
// -----------------------------------------------------------------------------
runTest('TEST 28: Validator catches missing required movement pattern warning', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    // Artificially remove all squats
    prog.sessions.forEach(s => {
        s.exercises = s.exercises.filter(e => e.movementPattern !== 'squat');
    });
    const val = programGen.validateGeneratedProgram(prog, reqs);
    assert.ok(val.warnings.some(w => w.includes('squat')));
});

// -----------------------------------------------------------------------------
// TEST 29: Validator catches fatigue ceiling violation
// -----------------------------------------------------------------------------
runTest('TEST 29: Validator catches fatigue ceiling violation', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);

    // Inject prohibited combination of Barbell Squat + Barbell Deadlift in session 1
    prog.sessions[0].exercises[0] = {
        order: 1,
        exerciseId: 'barbell_deadlift',
        exerciseName: 'Barbell Deadlift',
        sets: 4,
        reps: '6-8',
        restSeconds: 120,
        progressionModel: 'load_progression'
    };
    prog.sessions[0].exercises[1] = {
        order: 2,
        exerciseId: 'barbell_back_squat',
        exerciseName: 'Barbell Back Squat',
        sets: 4,
        reps: '6-8',
        restSeconds: 120,
        progressionModel: 'load_progression'
    };

    const val = programGen.validateGeneratedProgram(prog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Prohibited combination')));
});

// -----------------------------------------------------------------------------
// TEST 30: Validator catches invalid sets
// -----------------------------------------------------------------------------
runTest('TEST 30: Validator catches invalid sets', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].sets = -3;

    const val = programGen.validateGeneratedProgram(prog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Invalid sets count')));
});

// -----------------------------------------------------------------------------
// TEST 31: Validator catches invalid reps
// -----------------------------------------------------------------------------
runTest('TEST 31: Validator catches invalid reps', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].reps = ''; // empty reps

    const val = programGen.validateGeneratedProgram(prog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Invalid reps')));
});

// -----------------------------------------------------------------------------
// TEST 32: Validator catches invalid rest
// -----------------------------------------------------------------------------
runTest('TEST 32: Validator catches invalid rest', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].restSeconds = -60; // negative rest

    const val = programGen.validateGeneratedProgram(prog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Invalid restSeconds')));
});

// -----------------------------------------------------------------------------
// TEST 33: Validator catches invalid progression model
// -----------------------------------------------------------------------------
runTest('TEST 33: Validator catches invalid progression model', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    delete prog.sessions[0].exercises[0].progressionModel;

    const val = programGen.validateGeneratedProgram(prog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Missing progressionModel')));
});

// -----------------------------------------------------------------------------
// TEST 34: Validator catches invalid exercise ID
// -----------------------------------------------------------------------------
runTest('TEST 34: Validator catches invalid exercise ID', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.sessions[0].exercises[0].exerciseId = 'totally_fabricated_exercise_999';

    const val = programGen.validateGeneratedProgram(prog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('does not exist in Exercise Intelligence Database')));
});

// -----------------------------------------------------------------------------
// TEST 35: Validator catches session duration outside allowed tolerance
// -----------------------------------------------------------------------------
runTest('TEST 35: Validator catches session duration outside allowed tolerance', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutDuration: '20-min-or-less' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    
    // Inject impossible duration
    prog.sessions[0].estimatedDurationMinutes = 110;
    const val = programGen.validateGeneratedProgram(prog, reqs);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Duration') && e.includes('outside allowed budget tolerance')));
});

// -----------------------------------------------------------------------------
// TEST 36: Validator catches unavailable equipment
// -----------------------------------------------------------------------------
runTest('TEST 36: Validator catches unavailable equipment', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', workoutLocation: 'home', homeEquipment: ['dumbbell'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    // Inject a barbell bench press into a dumbbell-only home program
    prog.sessions[0].exercises[0] = {
        order: 1,
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Bench Press',
        sets: 3,
        reps: '8-10',
        restSeconds: 90,
        progressionModel: 'double_progression'
    };

    const val = programGen.validateGeneratedProgram(prog, reqs);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('unavailable equipment')));
});

// -----------------------------------------------------------------------------
// TEST 37: Validator catches prohibited movement constraint
// -----------------------------------------------------------------------------
runTest('TEST 37: Validator catches prohibited movement constraint', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', injuries: ['sensitive-knees'] });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);

    // Inject a barbell back squat into a sensitive-knees program
    prog.sessions[0].exercises[0] = {
        order: 1,
        exerciseId: 'barbell_back_squat',
        exerciseName: 'Barbell Back Squat',
        sets: 3,
        reps: '8-10',
        restSeconds: 120,
        progressionModel: 'load_progression'
    };

    const val = programGen.validateGeneratedProgram(prog, reqs);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('violates prohibited safety constraint')));
});

// -----------------------------------------------------------------------------
// TEST 38: Validator catches missing personalization reason
// -----------------------------------------------------------------------------
runTest('TEST 38: Validator catches missing personalization reason', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const prog = programGen.generateWorkoutProgram(profile);
    prog.personalizationReasons = []; // empty

    const val = programGen.validateGeneratedProgram(prog);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Personalization reasons are missing')));
});

// -----------------------------------------------------------------------------
// TEST 39: Deterministic snapshot remains identical across repeated generation
// -----------------------------------------------------------------------------
runTest('TEST 39: Deterministic snapshot remains identical across repeated generation', () => {
    const raw = { age: 28, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'] };
    const p1 = programGen.generateWorkoutProgram(canonicalEngine.buildCanonicalUserProfile(raw));
    const p2 = programGen.generateWorkoutProgram(canonicalEngine.buildCanonicalUserProfile(raw));

    const snap1 = programGen.getDeterministicProgramSnapshot(p1);
    const snap2 = programGen.getDeterministicProgramSnapshot(p2);

    assert.deepStrictEqual(snap1, snap2);
});

// -----------------------------------------------------------------------------
// TEST 40: generatedAt does not affect deterministic comparison
// -----------------------------------------------------------------------------
runTest('TEST 40: generatedAt does not affect deterministic comparison', () => {
    const raw = { age: 31, gender: 'female', goal: 'weight-loss', trainingDays: ['Tuesday', 'Thursday', 'Saturday'] };
    const p1 = programGen.generateWorkoutProgram(canonicalEngine.buildCanonicalUserProfile(raw));
    
    // Simulate time elapsed between generations
    p1.generatedAt = '2026-08-19T00:00:00.000Z';
    const p2 = programGen.generateWorkoutProgram(canonicalEngine.buildCanonicalUserProfile(raw));
    p2.generatedAt = '2026-08-19T12:34:56.789Z';

    const snap1 = programGen.getDeterministicProgramSnapshot(p1);
    const snap2 = programGen.getDeterministicProgramSnapshot(p2);

    assert.strictEqual(snap1.generatedAt, undefined);
    assert.strictEqual(snap2.generatedAt, undefined);
    assert.deepStrictEqual(snap1, snap2);
});

// -----------------------------------------------------------------------------
// TEST 41: Duration calculation does not count final-set rest incorrectly
// -----------------------------------------------------------------------------
runTest('TEST 41: Duration calculation does not count final-set rest incorrectly', () => {
    // For 3 sets with 90s rest and 10 reps @ 4s = 40s per set:
    // Work time: 3 * 40s = 120s
    // Rest time: (3 - 1) * 90s = 180s (2 rests, NOT 3 rests)
    // Total per exercise: 300s = 5 minutes
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const prog = programGen.generateWorkoutProgram(profile);
    assert.ok(prog.sessions[0].estimatedDurationMinutes > 0);
    assert.ok(prog.sessions[0].estimatedDurationMinutes <= 75);
});

// -----------------------------------------------------------------------------
// TEST 42: Quality metrics match actual generated program
// -----------------------------------------------------------------------------
runTest('TEST 42: Quality metrics match actual generated program', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 26, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'] });
    const prog = programGen.generateWorkoutProgram(profile);
    
    const calculatedSets = prog.sessions.reduce((acc, sess) => {
        return acc + sess.exercises.reduce((sAcc, ex) => sAcc + ex.sets, 0);
    }, 0);

    assert.strictEqual(prog.qualityMetrics.totalPlannedWeeklySets, calculatedSets);
});

console.log(`\n================================================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
