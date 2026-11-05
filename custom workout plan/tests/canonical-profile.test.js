/**
 * ==============================================================================
 * HANUMAN GYM — CANONICAL USER TRAINING PROFILE TEST SUITE
 * Deterministic Test Harness verifying all 14 required profile scenarios.
 * ==============================================================================
 */

const assert = require('assert');
const path = require('path');
const engine = require('../js/engine/canonical-profile.js');

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
console.log('RUNNING CANONICAL USER TRAINING PROFILE SUITE (PHASE 2)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Normal gym user
// -----------------------------------------------------------------------------
runTest('TEST 1: Normal gym user', () => {
    const raw = {
        age: '26',
        gender: 'male',
        goal: 'muscle-gain',
        bodyType: 'average',
        height: '180',
        heightUnit: 'cm',
        currentWeight: '78',
        targetWeight: '82',
        weightUnit: 'kg',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        workoutLocation: 'gym',
        workoutDuration: '40-60',
        workoutTime: 'morning',
        pushups: '20 to 30',
        pullups: '5 to 10',
        experience: 'intermediate'
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    const validation = engine.validateCanonicalUserProfile(canonical);
    const legacy = engine.toLegacyUserProfile(canonical);

    assert.strictEqual(canonical.metadata.profileVersion, '1.0');
    assert.strictEqual(canonical.identity.age, 26);
    assert.strictEqual(canonical.identity.gender, 'male');
    assert.strictEqual(canonical.goals.primary, 'muscle-gain');
    assert.strictEqual(canonical.anthropometrics.heightCm, 180);
    assert.strictEqual(canonical.anthropometrics.weightKg, 78);
    assert.strictEqual(canonical.anthropometrics.targetWeightKg, 82);
    assert.strictEqual(canonical.trainingAvailability.trainingDayCount, 3);
    assert.strictEqual(canonical.trainingExperience.fitnessLevel, 'advanced');
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(legacy.goal, 'muscle-gain');
    assert.strictEqual(legacy.heightCm, 180);
});

// -----------------------------------------------------------------------------
// TEST 2: Home workout user
// -----------------------------------------------------------------------------
runTest('TEST 2: Home workout user', () => {
    const raw = {
        age: 30,
        gender: 'female',
        goal: 'weight-loss',
        workoutLocation: 'home',
        homeEquipment: ['dumbbells', 'resistance-bands'],
        trainingDays: ['Tuesday', 'Thursday', 'Saturday']
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    assert.strictEqual(canonical.trainingAvailability.workoutLocation, 'home');
    assert.deepStrictEqual(canonical.trainingAvailability.homeEquipment, ['dumbbells', 'resistance-bands']);
    assert.strictEqual(canonical.trainingAvailability.trainingDayCount, 3);
    
    const legacy = engine.toLegacyUserProfile(canonical);
    assert.strictEqual(legacy.workoutLocation, 'home');
    assert.strictEqual(legacy.equipment, 'dumbbells,resistance-bands');
});

// -----------------------------------------------------------------------------
// TEST 3: User with selected injuries
// -----------------------------------------------------------------------------
runTest('TEST 3: User with selected injuries', () => {
    const raw = {
        age: 45,
        gender: 'male',
        goal: 'muscle-gain',
        injuries: ['sensitive-knees', 'sensitive-back'],
        issues: ['lack-of-motivation']
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    assert.strictEqual(canonical.movementConstraints.hasInjuries, true);
    assert.deepStrictEqual(canonical.movementConstraints.injuries, ['sensitive-knees', 'sensitive-back']);
    assert.deepStrictEqual(canonical.movementConstraints.pastIssues, ['lack-of-motivation']);

    const legacy = engine.toLegacyUserProfile(canonical);
    assert.deepStrictEqual(legacy.injuries, ['sensitive-knees', 'sensitive-back']);
    assert.deepStrictEqual(legacy.pastIssues, ['lack-of-motivation']);
});

// -----------------------------------------------------------------------------
// TEST 4: User with secondary goals
// -----------------------------------------------------------------------------
runTest('TEST 4: User with secondary goals', () => {
    const raw = {
        age: 28,
        gender: 'male',
        goal: 'get-shredded',
        goals: ['improve-sleep', 'feel-healthier', 'reduce-stress'],
        challenge: '21-days-no-sugar'
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    assert.strictEqual(canonical.goals.primary, 'get-shredded');
    assert.deepStrictEqual(canonical.goals.secondary, ['improve-sleep', 'feel-healthier', 'reduce-stress']);
    assert.strictEqual(canonical.goals.challenge, '21-days-no-sugar');
});

// -----------------------------------------------------------------------------
// TEST 5: User with focus areas
// -----------------------------------------------------------------------------
runTest('TEST 5: User with focus areas', () => {
    const raw = {
        age: 24,
        gender: 'male',
        goal: 'muscle-gain',
        focusAreas: ['weak-chest', 'slim-arms']
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    assert.deepStrictEqual(canonical.goals.focusAreas, ['weak-chest', 'slim-arms']);
    
    const legacy = engine.toLegacyUserProfile(canonical);
    assert.deepStrictEqual(legacy.focusAreas, ['weak-chest', 'slim-arms']);
});

// -----------------------------------------------------------------------------
// TEST 6: User with sleep/water/walking/nutrition selections (Naming Mismatches)
// -----------------------------------------------------------------------------
runTest('TEST 6: User with sleep/water/walking/nutrition selections (Mismatch Normalization)', () => {
    // Tests raw fields stored as singular vs plural
    const rawSingular = {
        age: 29,
        gender: 'male',
        goal: 'muscle-gain',
        eatingHabit: 'emotional-eater',
        protein: 'tracking-macros',
        water: '2-6-glasses',
        sleep: '7-8-hours',
        walking: '5-10k-steps'
    };

    const canonical1 = engine.buildCanonicalUserProfile(rawSingular);
    assert.strictEqual(canonical1.nutrition.eatingHabits, 'emotional-eater');
    assert.strictEqual(canonical1.nutrition.proteinIntake, 'tracking-macros');
    assert.strictEqual(canonical1.lifestyle.waterIntake, '2-6-glasses');
    assert.strictEqual(canonical1.lifestyle.sleepDuration, '7-8-hours');
    assert.strictEqual(canonical1.lifestyle.walkingHabits, '5-10k-steps');

    const legacy1 = engine.toLegacyUserProfile(canonical1);
    assert.strictEqual(legacy1.eatingHabits, 'emotional-eater');
    assert.strictEqual(legacy1.proteinIntake, 'tracking-macros');
    assert.strictEqual(legacy1.waterIntake, '2-6-glasses');
    assert.strictEqual(legacy1.sleepDuration, '7-8-hours');
    assert.strictEqual(legacy1.walkingHabits, '5-10k-steps');
});

// -----------------------------------------------------------------------------
// TEST 7: User with missing optional fields
// -----------------------------------------------------------------------------
runTest('TEST 7: User with missing optional fields', () => {
    const raw = {
        age: 22,
        gender: 'male',
        goal: 'muscle-gain'
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    const validation = engine.validateCanonicalUserProfile(canonical);

    assert.strictEqual(canonical.goals.secondary.length, 0);
    assert.strictEqual(canonical.goals.focusAreas.length, 0);
    assert.strictEqual(canonical.movementConstraints.injuries.length, 0);
    assert.strictEqual(validation.valid, true);
    assert.ok(validation.warnings.length > 0 || validation.optional.length > 0);
});

// -----------------------------------------------------------------------------
// TEST 8: User with invalid numeric input
// -----------------------------------------------------------------------------
runTest('TEST 8: User with invalid numeric input', () => {
    const raw = {
        age: 150, // Invalid age
        gender: 'male',
        goal: 'muscle-gain',
        height: 'invalid_text',
        currentWeight: -50
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    const validation = engine.validateCanonicalUserProfile(canonical);

    assert.strictEqual(canonical.anthropometrics.heightCm, null);
    assert.strictEqual(canonical.anthropometrics.weightKg, null);
    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('Age')));
});

// -----------------------------------------------------------------------------
// TEST 9: Metric height/weight
// -----------------------------------------------------------------------------
runTest('TEST 9: Metric height/weight', () => {
    const raw = {
        age: 25,
        gender: 'female',
        goal: 'weight-loss',
        height: '168',
        heightUnit: 'cm',
        currentWeight: '62.5',
        targetWeight: '55',
        weightUnit: 'kg'
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    assert.strictEqual(canonical.anthropometrics.heightCm, 168);
    assert.strictEqual(canonical.anthropometrics.weightKg, 62.5);
    assert.strictEqual(canonical.anthropometrics.targetWeightKg, 55);
});

// -----------------------------------------------------------------------------
// TEST 10: Non-metric height/weight (Imperial)
// -----------------------------------------------------------------------------
runTest('TEST 10: Non-metric height/weight (Imperial)', () => {
    const raw = {
        age: 27,
        gender: 'male',
        goal: 'muscle-gain',
        height: "5'10\"",
        heightUnit: 'ft',
        currentWeight: '175',
        targetWeight: '185',
        weightUnit: 'lbs'
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    // 5'10" = 70 inches * 2.54 = 177.8 -> 178 cm
    assert.strictEqual(canonical.anthropometrics.heightCm, 178);
    // 175 lbs * 0.45359237 = 79.378 -> 79.4 kg
    assert.strictEqual(canonical.anthropometrics.weightKg, 79.4);
    // 185 lbs * 0.45359237 = 83.914 -> 83.9 kg
    assert.strictEqual(canonical.anthropometrics.targetWeightKg, 83.9);
});

// -----------------------------------------------------------------------------
// TEST 11: Different training-day counts
// -----------------------------------------------------------------------------
runTest('TEST 11: Different training-day counts', () => {
    const raw2Days = { age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Tuesday', 'Saturday'] };
    const raw5Days = { age: 25, gender: 'male', goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'] };

    const canonical2 = engine.buildCanonicalUserProfile(raw2Days);
    const canonical5 = engine.buildCanonicalUserProfile(raw5Days);

    assert.strictEqual(canonical2.trainingAvailability.trainingDayCount, 2);
    assert.strictEqual(canonical5.trainingAvailability.trainingDayCount, 5);
});

// -----------------------------------------------------------------------------
// TEST 12: Beginner user
// -----------------------------------------------------------------------------
runTest('TEST 12: Beginner user', () => {
    const raw = {
        age: 21,
        gender: 'female',
        goal: 'weight-loss',
        experience: 'beginner',
        pushups: 'Less than 10',
        pullups: "I can't do a single pull-up"
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    assert.strictEqual(canonical.trainingExperience.experienceLevel, 'beginner');
    assert.strictEqual(canonical.trainingExperience.fitnessLevel, 'beginner');
});

// -----------------------------------------------------------------------------
// TEST 13: Advanced user
// -----------------------------------------------------------------------------
runTest('TEST 13: Advanced user', () => {
    const raw = {
        age: 32,
        gender: 'male',
        goal: 'muscle-gain',
        experience: 'advanced',
        pushups: 'More than 30',
        pullups: 'More than 10'
    };

    const canonical = engine.buildCanonicalUserProfile(raw);
    assert.strictEqual(canonical.trainingExperience.experienceLevel, 'advanced');
    assert.strictEqual(canonical.trainingExperience.fitnessLevel, 'advanced');
});

// -----------------------------------------------------------------------------
// TEST 14: Existing localStorage data from old system
// -----------------------------------------------------------------------------
runTest('TEST 14: Existing localStorage data from old system', () => {
    // Simulates legacy flat storage dump from older versions of the app
    const legacyDump = {
        selectedAge: '28',
        selectedGender: 'male',
        selectedGoal: 'muscle-gain',
        selectedBodyType: 'average',
        selectedHeight: '178',
        selectedHeightUnit: 'cm',
        selectedCurrentWeight: '75',
        selectedTargetWeight: '80',
        selectedWeightUnit: 'kg',
        selectedTrainingDays: JSON.stringify(['Monday', 'Wednesday', 'Friday', 'Saturday']),
        selectedEatingHabit: 'habitual',
        selectedProtein: 'not-enough',
        selectedWater: '7-10-glasses',
        selectedSleep: '7-8-hours',
        selectedWalking: '10-15k-steps',
        selectedPushups: '10 to 20',
        selectedPullups: '5 to 10',
        selectedExperience: 'intermediate',
        selectedUserName: 'Rahul Sharma',
        selectedUserEmail: 'rahul@example.com'
    };

    // Hydrate simulation
    const rawHydrated = {
        age: legacyDump.selectedAge,
        gender: legacyDump.selectedGender,
        goal: legacyDump.selectedGoal,
        bodyType: legacyDump.selectedBodyType,
        height: legacyDump.selectedHeight,
        heightUnit: legacyDump.selectedHeightUnit,
        currentWeight: legacyDump.selectedCurrentWeight,
        targetWeight: legacyDump.selectedTargetWeight,
        weightUnit: legacyDump.selectedWeightUnit,
        trainingDays: JSON.parse(legacyDump.selectedTrainingDays),
        eatingHabit: legacyDump.selectedEatingHabit,
        protein: legacyDump.selectedProtein,
        water: legacyDump.selectedWater,
        sleep: legacyDump.selectedSleep,
        walking: legacyDump.selectedWalking,
        pushups: legacyDump.selectedPushups,
        pullups: legacyDump.selectedPullups,
        experience: legacyDump.selectedExperience,
        userName: legacyDump.selectedUserName,
        userEmail: legacyDump.selectedUserEmail
    };

    const canonical = engine.buildCanonicalUserProfile(rawHydrated);
    const legacy = engine.toLegacyUserProfile(canonical);

    assert.strictEqual(canonical.identity.userName, 'Rahul Sharma');
    assert.strictEqual(canonical.identity.userEmail, 'rahul@example.com');
    assert.strictEqual(canonical.anthropometrics.heightCm, 178);
    assert.strictEqual(canonical.anthropometrics.weightKg, 75);
    assert.strictEqual(canonical.anthropometrics.targetWeightKg, 80);
    assert.strictEqual(canonical.nutrition.eatingHabits, 'habitual');
    assert.strictEqual(canonical.nutrition.proteinIntake, 'not-enough');
    assert.strictEqual(canonical.lifestyle.waterIntake, '7-10-glasses');
    assert.strictEqual(canonical.lifestyle.sleepDuration, '7-8-hours');
    assert.strictEqual(canonical.lifestyle.walkingHabits, '10-15k-steps');

    // Verify complete legacy compatibility
    assert.strictEqual(legacy.userName, 'Rahul Sharma');
    assert.strictEqual(legacy.goal, 'muscle-gain');
    assert.strictEqual(legacy.heightCm, 178);
    assert.strictEqual(legacy.eatingHabits, 'habitual');
    assert.strictEqual(legacy.proteinIntake, 'not-enough');
    assert.strictEqual(legacy.waterIntake, '7-10-glasses');
    assert.strictEqual(legacy.sleepDuration, '7-8-hours');
    assert.strictEqual(legacy.walkingHabits, '10-15k-steps');
});

console.log(`\n================================================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
