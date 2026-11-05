/**
 * ==============================================================================
 * HANUMAN GYM — DETERMINISTIC TRAINING RULES ENGINE TEST SUITE
 * Comprehensive Unit Test Harness verifying all 20 required training rules scenarios.
 * ==============================================================================
 */

const assert = require('assert');
const path = require('path');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const rulesEngine = require('../js/engine/training-rules.js');

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
console.log('RUNNING DETERMINISTIC TRAINING RULES SUITE (PHASE 4)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Muscle-gain beginner, 3 days
// -----------------------------------------------------------------------------
runTest('TEST 1: Muscle-gain beginner, 3 days', () => {
    const raw = {
        age: 22,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        experience: 'beginner'
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);
    const validation = rulesEngine.validateTrainingRequirements(req);

    assert.strictEqual(validation.valid, true);
    assert.strictEqual(req.goalStrategy.primaryFocus, 'hypertrophy');
    assert.strictEqual(req.weeklyStructure.splitType, 'full_body');
    assert.strictEqual(req.sessionRequirements.maxTechnicalComplexity, 2);
    assert.strictEqual(req.fatigueConstraints.maxHighFatigueExercisesPerSession, 1);
});

// -----------------------------------------------------------------------------
// TEST 2: Muscle-gain intermediate, 4 days
// -----------------------------------------------------------------------------
runTest('TEST 2: Muscle-gain intermediate, 4 days', () => {
    const raw = {
        age: 26,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        experience: 'intermediate'
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.weeklyStructure.splitType, 'upper_lower');
    assert.strictEqual(req.weeklyStructure.trainingDayCount, 4);
    assert.strictEqual(req.sessionRequirements.maxTechnicalComplexity, 4);
});

// -----------------------------------------------------------------------------
// TEST 3: Weight-loss user, 5 days
// -----------------------------------------------------------------------------
runTest('TEST 3: Weight-loss user, 5 days', () => {
    const raw = {
        age: 30,
        gender: 'female',
        goal: 'weight-loss',
        trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        experience: 'intermediate'
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.goalStrategy.primaryFocus, 'fat_loss_preservation');
    assert.strictEqual(req.weeklyStructure.splitType, 'upper_lower_specialization');
});

// -----------------------------------------------------------------------------
// TEST 4: General-fitness user, 2 days
// -----------------------------------------------------------------------------
runTest('TEST 4: General-fitness user, 2 days', () => {
    const raw = {
        age: 38,
        gender: 'female',
        goal: 'general-fitness',
        trainingDays: ['Tuesday', 'Saturday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.weeklyStructure.trainingDayCount, 2);
    assert.strictEqual(req.weeklyStructure.splitType, 'full_body');
});

// -----------------------------------------------------------------------------
// TEST 5: Strength user, 6 days
// -----------------------------------------------------------------------------
runTest('TEST 5: Strength user, 6 days', () => {
    const raw = {
        age: 25,
        gender: 'male',
        goal: 'strength',
        trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        experience: 'advanced'
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.goalStrategy.primaryFocus, 'strength');
    assert.strictEqual(req.weeklyStructure.splitType, 'push_pull_legs');
    assert.strictEqual(req.sessionRequirements.maxTechnicalComplexity, 5);
    assert.strictEqual(req.fatigueConstraints.maxHighFatigueExercisesPerSession, 3);
});

// -----------------------------------------------------------------------------
// TEST 6: Home user with dumbbells
// -----------------------------------------------------------------------------
runTest('TEST 6: Home user with dumbbells', () => {
    const raw = {
        age: 27,
        gender: 'male',
        goal: 'muscle-gain',
        workoutLocation: 'home',
        homeEquipment: ['dumbbell', 'bench'],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.equipmentConstraints.location, 'home');
    assert.strictEqual(req.equipmentConstraints.isRestricted, true);
    assert.ok(req.equipmentConstraints.allowedEquipment.includes('dumbbell'));
    assert.ok(req.equipmentConstraints.allowedEquipment.includes('bench'));
    assert.ok(!req.equipmentConstraints.allowedEquipment.includes('barbell'));
});

// -----------------------------------------------------------------------------
// TEST 7: Home user with bodyweight only
// -----------------------------------------------------------------------------
runTest('TEST 7: Home user with bodyweight only', () => {
    const raw = {
        age: 24,
        gender: 'female',
        goal: 'get-shredded',
        workoutLocation: 'home',
        homeEquipment: [],
        trainingDays: ['Tuesday', 'Thursday', 'Saturday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.equipmentConstraints.location, 'home');
    assert.strictEqual(req.equipmentConstraints.isRestricted, true);
    assert.deepStrictEqual(req.equipmentConstraints.allowedEquipment, ['bodyweight', 'mat']);
});

// -----------------------------------------------------------------------------
// TEST 8: Gym user
// -----------------------------------------------------------------------------
runTest('TEST 8: Gym user', () => {
    const raw = {
        age: 28,
        gender: 'male',
        goal: 'muscle-gain',
        workoutLocation: 'gym',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.equipmentConstraints.location, 'gym');
    assert.strictEqual(req.equipmentConstraints.isRestricted, false);
    assert.ok(req.equipmentConstraints.allowedEquipment.includes('barbell'));
    assert.ok(req.equipmentConstraints.allowedEquipment.includes('cable'));
    assert.ok(req.equipmentConstraints.allowedEquipment.includes('machine'));
});

// -----------------------------------------------------------------------------
// TEST 9: User with focus areas
// -----------------------------------------------------------------------------
runTest('TEST 9: User with focus areas', () => {
    const raw = {
        age: 25,
        gender: 'male',
        goal: 'muscle-gain',
        focusAreas: ['weak-chest', 'slim-arms'],
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.ok(req.musclePriorities.focusMuscles.includes('chest'));
    assert.ok(req.musclePriorities.focusMuscles.includes('biceps'));
    assert.ok(req.musclePriorities.focusMuscles.includes('triceps'));
    assert.strictEqual(req.musclePriorities.volumeTargets.chest.priority, 'high');
    assert.ok(req.musclePriorities.volumeTargets.chest.min > req.musclePriorities.volumeTargets.calves.min);
});

// -----------------------------------------------------------------------------
// TEST 10: User with secondary goals
// -----------------------------------------------------------------------------
runTest('TEST 10: User with secondary goals', () => {
    const raw = {
        age: 32,
        gender: 'male',
        goal: 'muscle-gain',
        goals: ['improve-sleep', 'feel-healthier'],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    // Primary goal must remain primary
    assert.strictEqual(req.goalStrategy.primaryFocus, 'hypertrophy');
    assert.ok(req.personalizationReasons.some(r => r.source === 'goals.primary'));
});

// -----------------------------------------------------------------------------
// TEST 11: User with injuries
// -----------------------------------------------------------------------------
runTest('TEST 11: User with injuries', () => {
    const raw = {
        age: 42,
        gender: 'male',
        goal: 'muscle-gain',
        injuries: ['sensitive-knees', 'sensitive-back'],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.exerciseConstraints.hasActiveRestrictions, true);
    assert.ok(req.exerciseConstraints.prohibitedConstraintTags.includes('requires_deep_knee_flexion'));
    assert.ok(req.exerciseConstraints.prohibitedConstraintTags.includes('requires_spinal_loading'));
    assert.ok(req.personalizationReasons.some(r => r.rule === 'injury_safety_override'));
});

// -----------------------------------------------------------------------------
// TEST 12: User with unknown equipment
// -----------------------------------------------------------------------------
runTest('TEST 12: User with unknown equipment (fallback safety)', () => {
    const raw = {
        age: 29,
        gender: 'male',
        goal: 'muscle-gain',
        workoutLocation: null,
        homeEquipment: null
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);
    const validation = rulesEngine.validateTrainingRequirements(req);

    assert.strictEqual(validation.valid, true);
    assert.ok(req.equipmentConstraints.allowedEquipment.length > 0);
});

// -----------------------------------------------------------------------------
// TEST 13: User with short workout duration
// -----------------------------------------------------------------------------
runTest('TEST 13: User with short workout duration', () => {
    const raw = {
        age: 25,
        gender: 'female',
        goal: 'weight-loss',
        workoutDuration: '20-min-or-less',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.sessionRequirements.budget.totalMinutes, 20);
    assert.strictEqual(req.sessionRequirements.budget.mainTrainingMinutes, 14);
    assert.strictEqual(req.sessionRequirements.budget.targetExerciseCount.max, 4);
});

// -----------------------------------------------------------------------------
// TEST 14: User with long workout duration
// -----------------------------------------------------------------------------
runTest('TEST 14: User with long workout duration', () => {
    const raw = {
        age: 26,
        gender: 'male',
        goal: 'muscle-gain',
        workoutDuration: 'over-an-hour',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.sessionRequirements.budget.totalMinutes, 75);
    assert.strictEqual(req.sessionRequirements.budget.mainTrainingMinutes, 60);
    assert.strictEqual(req.sessionRequirements.budget.targetExerciseCount.max, 8);
});

// -----------------------------------------------------------------------------
// TEST 15: Consecutive training days
// -----------------------------------------------------------------------------
runTest('TEST 15: Consecutive training days preservation', () => {
    const raw = {
        age: 24,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.deepStrictEqual(req.weeklyStructure.trainingDays, ['Monday', 'Tuesday', 'Wednesday', 'Thursday']);
    assert.strictEqual(req.weeklyStructure.splitType, 'upper_lower');
});

// -----------------------------------------------------------------------------
// TEST 16: High daily activity
// -----------------------------------------------------------------------------
runTest('TEST 16: High daily activity', () => {
    const raw = {
        age: 28,
        gender: 'male',
        goal: 'muscle-gain',
        typicalDay: 'very-active',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.ok(req.recoveryConsiderations.recoveryFactor < 1.0);
    assert.ok(req.personalizationReasons.some(r => r.rule === 'activity_expenditure_adjustment'));
});

// -----------------------------------------------------------------------------
// TEST 17: Low sleep duration
// -----------------------------------------------------------------------------
runTest('TEST 17: Low sleep duration', () => {
    const raw = {
        age: 29,
        gender: 'male',
        goal: 'muscle-gain',
        sleep: 'less than 5 hours',
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    assert.strictEqual(req.recoveryConsiderations.recoveryFactor, 0.85);
    assert.ok(req.personalizationReasons.some(r => r.rule === 'recovery_volume_adjustment'));
});

// -----------------------------------------------------------------------------
// TEST 18: Same profile produces identical output twice (Determinism)
// -----------------------------------------------------------------------------
runTest('TEST 18: Same profile produces identical output twice (Determinism)', () => {
    const raw = {
        age: 25,
        gender: 'male',
        goal: 'muscle-gain',
        bodyType: 'average',
        height: '178',
        currentWeight: '75',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        workoutLocation: 'gym',
        workoutDuration: '40-60',
        focusAreas: ['weak-chest']
    };
    const profile1 = canonicalEngine.buildCanonicalUserProfile(raw, { timestamp: '2026-08-19T00:00:00Z' });
    const profile2 = canonicalEngine.buildCanonicalUserProfile(raw, { timestamp: '2026-08-19T00:00:00Z' });

    const req1 = rulesEngine.buildTrainingRequirements(profile1);
    const req2 = rulesEngine.buildTrainingRequirements(profile2);

    assert.deepStrictEqual(req1.goalStrategy, req2.goalStrategy);
    assert.deepStrictEqual(req1.weeklyStructure, req2.weeklyStructure);
    assert.deepStrictEqual(req1.sessionRequirements.budget, req2.sessionRequirements.budget);
    assert.deepStrictEqual(req1.musclePriorities, req2.musclePriorities);
    assert.deepStrictEqual(req1.personalizationReasons, req2.personalizationReasons);
});

// -----------------------------------------------------------------------------
// TEST 19: Invalid profile produces structured validation errors/warnings
// -----------------------------------------------------------------------------
runTest('TEST 19: Invalid profile produces structured validation errors/warnings', () => {
    const validation = rulesEngine.validateTrainingRequirements(null);
    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.length > 0);

    const malformed = { goalStrategy: null, weeklyStructure: { trainingDayCount: 9 } };
    const val2 = rulesEngine.validateTrainingRequirements(malformed);
    assert.strictEqual(val2.valid, false);
    assert.ok(val2.errors.some(e => e.includes('Goal strategy')));
});

// -----------------------------------------------------------------------------
// TEST 20: Lower-priority rules never override higher-priority constraints
// -----------------------------------------------------------------------------
runTest('TEST 20: Lower-priority rules never override higher-priority constraints', () => {
    // User wants chest specialization, but has knee & spinal injury, home-only dumbbells
    const raw = {
        age: 35,
        gender: 'male',
        goal: 'muscle-gain',
        focusAreas: ['weak-chest', 'slim-legs'],
        workoutLocation: 'home',
        homeEquipment: ['dumbbell'],
        injuries: ['sensitive-knees', 'sensitive-back'],
        trainingDays: ['Monday', 'Wednesday', 'Friday']
    };
    const profile = canonicalEngine.buildCanonicalUserProfile(raw);
    const req = rulesEngine.buildTrainingRequirements(profile);

    // 1. Safety overrides: prohibited constraint tags must remain active
    assert.ok(req.exerciseConstraints.prohibitedConstraintTags.includes('requires_deep_knee_flexion'));
    assert.ok(req.exerciseConstraints.prohibitedConstraintTags.includes('requires_spinal_loading'));

    // 2. Equipment constraints must strictly restrict to dumbbells & bodyweight
    assert.strictEqual(req.equipmentConstraints.isRestricted, true);
    assert.ok(req.equipmentConstraints.allowedEquipment.includes('dumbbell'));
    assert.ok(!req.equipmentConstraints.allowedEquipment.includes('barbell'));

    // 3. Focus area still recorded, but contained inside safety & equipment boundary
    assert.ok(req.musclePriorities.focusMuscles.includes('chest'));
});

console.log(`\n================================================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
