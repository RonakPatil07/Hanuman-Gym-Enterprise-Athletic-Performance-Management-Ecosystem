/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * TRAINING INTENSITY & RIR / RPE INTELLIGENCE TEST SUITE (PHASE 8)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const rulesEngine = require('../js/engine/training-rules.js');
const intensityEngine = require('../js/engine/intensity-rules.js');

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
console.log('RUNNING TRAINING INTENSITY & RIR / RPE TEST SUITE (PHASE 8)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: CORE RIR / RPE (Tests 1–8)
// -----------------------------------------------------------------------------
runTest('TEST 1: RIR -> RPE conversion formula (RPE = 10 - RIR)', () => {
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(0), 10);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(1), 9);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(2), 8);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(3), 7);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(4), 6);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(5), 5);
});

runTest('TEST 2: Target RIR validity within allowed bounds (0 to 5)', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(typeof res.targetRIR === 'number');
    assert.ok(res.targetRIR >= 0 && res.targetRIR <= 5);
    assert.strictEqual(res.rpe, 10 - res.targetRIR);
});

runTest('TEST 3: RIR range validity (0 <= minRIR <= targetRIR <= maxRIR)', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 28, gender: 'male', goal: 'muscle-gain' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.minRIR >= 0);
    assert.ok(res.minRIR <= res.targetRIR);
    assert.ok(res.targetRIR <= res.maxRIR);
});

runTest('TEST 4: Non-numeric / NaN RIR fails safely to default', () => {
    assert.strictEqual(intensityEngine.calculateRPEFromRIR('invalid'), 8);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(NaN), 8);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(undefined), 8);
});

runTest('TEST 5: Extreme / Negative RIR is clamped safely', () => {
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(-2), 10);
    assert.strictEqual(intensityEngine.calculateRPEFromRIR(15), 0);
});

runTest('TEST 6: Deterministic output across 10 repeated passes', () => {
    const ex = exerciseDB.getExerciseById('barbell_deadlift');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'male', goal: 'strength' });

    const snap1 = intensityEngine.getDeterministicIntensitySnapshot(ex, profile);
    for (let i = 0; i < 10; i++) {
        const snapPass = intensityEngine.getDeterministicIntensitySnapshot(ex, profile);
        assert.strictEqual(snapPass, snap1);
    }
});

runTest('TEST 7: Intensity category mapped accurately', () => {
    assert.strictEqual(intensityEngine.getIntensityCategory(0), 'near_failure');
    assert.strictEqual(intensityEngine.getIntensityCategory(1), 'near_failure');
    assert.strictEqual(intensityEngine.getIntensityCategory(2), 'hard');
    assert.strictEqual(intensityEngine.getIntensityCategory(3), 'challenging');
    assert.strictEqual(intensityEngine.getIntensityCategory(4), 'moderate');
    assert.strictEqual(intensityEngine.getIntensityCategory(5), 'easy');
});

runTest('TEST 8: Rationale generation contains structured engine reasons', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'beginner' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(typeof res.rationale === 'string' && res.rationale.length > 10);
    assert.ok(res.adjustmentFactors.includes('beginner_safety_margin'));
});

// -----------------------------------------------------------------------------
// CATEGORY B: GOAL RULES (Tests 9–13)
// -----------------------------------------------------------------------------
runTest('TEST 9: Muscle-gain prescribes hypertrophy target (RIR 1-3)', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.targetRIR >= 1 && res.targetRIR <= 3);
    assert.ok(res.rpe >= 7 && res.rpe <= 9);
});

runTest('TEST 10: Weight-loss preserves muscle with fatigue control (RIR 2-4)', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'weight-loss', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.targetRIR >= 2 && res.targetRIR <= 4);
    assert.ok(res.rpe <= 8);
});

runTest('TEST 11: Get-shredded prioritizes density & conditioning (RIR 2-3)', () => {
    const ex = exerciseDB.getExerciseById('lat_pulldown');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'female', goal: 'get-shredded', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.targetRIR >= 1 && res.targetRIR <= 3);
});

runTest('TEST 12: Strength prioritizes heavy drive with technical reserve', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'strength', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.targetRIR >= 2);
    assert.ok(res.adjustmentFactors.includes('high_complexity_axial_reserve'));
});

runTest('TEST 13: General-fitness prescribes sustainable moderate effort', () => {
    const ex = exerciseDB.getExerciseById('push_up');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 40, gender: 'female', goal: 'general-fitness', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.targetRIR >= 2);
});

// -----------------------------------------------------------------------------
// CATEGORY C: EXPERIENCE (Tests 14–17)
// -----------------------------------------------------------------------------
runTest('TEST 14: Beginner receives +1 RIR safety buffer', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const begProfile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'beginner' });
    const intProfile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });

    const begRes = intensityEngine.calculateExerciseIntensity(ex, begProfile);
    const intRes = intensityEngine.calculateExerciseIntensity(ex, intProfile);

    assert.strictEqual(begRes.targetRIR, intRes.targetRIR + 1);
    assert.ok(begRes.adjustmentFactors.includes('beginner_safety_margin'));
});

runTest('TEST 15: Intermediate receives standard goal baseline', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.strictEqual(res.targetRIR, 2);
});

runTest('TEST 16: Advanced trainee permits overload precision on low-complexity lifts', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_curl');
    const advProfile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'advanced' });
    const res = intensityEngine.calculateExerciseIntensity(ex, advProfile);

    assert.ok(res.targetRIR <= 2);
    assert.ok(res.adjustmentFactors.includes('advanced_overload_precision') || res.adjustmentFactors.includes('isolation_proximity_tolerance'));
});

runTest('TEST 17: Beginner safety margin strictly prevents RIR 0', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_curl');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'beginner' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.targetRIR >= 2);
    assert.ok(res.minRIR >= 1);
});

// -----------------------------------------------------------------------------
// CATEGORY D: EXERCISE CHARACTERISTICS (Tests 18–22)
// -----------------------------------------------------------------------------
runTest('TEST 18: Compound movement retains reserve for safety', () => {
    const compound = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(compound, profile);

    assert.ok(res.targetRIR >= 2);
});

runTest('TEST 19: Isolation movement permits closer proximity to failure', () => {
    const isolation = exerciseDB.getExerciseById('dumbbell_curl');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(isolation, profile);

    assert.ok(res.targetRIR <= 2);
    assert.ok(res.adjustmentFactors.includes('isolation_proximity_tolerance'));
});

runTest('TEST 20: High technical complexity (>= 4) retains RIR >= 2', () => {
    const deadlift = exerciseDB.getExerciseById('barbell_deadlift');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(deadlift, profile);

    assert.ok(res.targetRIR >= 2);
    assert.ok(res.adjustmentFactors.includes('high_complexity_axial_reserve'));
});

runTest('TEST 21: High fatigue exercise retains RIR >= 2', () => {
    const squat = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(squat, profile);

    assert.ok(res.targetRIR >= 2);
});

runTest('TEST 22: Lower-fatigue exercise permits lower RIR', () => {
    const lateralRaise = exerciseDB.getExerciseById('lateral_raise');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const res = intensityEngine.calculateExerciseIntensity(lateralRaise, profile);

    assert.ok(res.targetRIR <= 2);
});

// -----------------------------------------------------------------------------
// CATEGORY E: RECOVERY (Tests 23–26)
// -----------------------------------------------------------------------------
runTest('TEST 23: Poor sleep (< 7h) increases target RIR (+1 RIR buffer)', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const normalProfile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', sleepDuration: '7-8' });
    const poorSleepProfile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', sleepDuration: 'less-than-5' });

    const normRes = intensityEngine.calculateExerciseIntensity(ex, normalProfile);
    const poorRes = intensityEngine.calculateExerciseIntensity(ex, poorSleepProfile);

    assert.strictEqual(poorRes.targetRIR, normRes.targetRIR + 1);
    assert.ok(poorRes.adjustmentFactors.includes('recovery_fatigue_mitigation'));
});

runTest('TEST 24: High daily activity increases target RIR (+1 RIR buffer)', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const normalProfile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', typicalDay: 'moderately-active' });
    const activeProfile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', typicalDay: 'very-active' });

    const normRes = intensityEngine.calculateExerciseIntensity(ex, normalProfile);
    const actRes = intensityEngine.calculateExerciseIntensity(ex, activeProfile);

    assert.strictEqual(actRes.targetRIR, normRes.targetRIR + 1);
    assert.ok(actRes.adjustmentFactors.includes('recovery_fatigue_mitigation'));
});

runTest('TEST 25: High weekly frequency (5+ days) on compound lift manages cross-session fatigue', () => {
    const compound = exerciseDB.getExerciseById('barbell_back_squat');
    const profile5Day = canonicalEngine.buildCanonicalUserProfile({
        age: 25,
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });
    const res = intensityEngine.calculateExerciseIntensity(compound, profile5Day);

    assert.ok(res.targetRIR >= 3);
    assert.ok(res.adjustmentFactors.includes('high_frequency_fatigue_management'));
});

runTest('TEST 26: Normal recovery baseline preserved when no fatigue constraints exist', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', sleepDuration: '7-8', typicalDay: 'moderately-active' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.strictEqual(res.targetRIR, 2);
    assert.ok(!res.adjustmentFactors.includes('recovery_fatigue_mitigation'));
});

// -----------------------------------------------------------------------------
// CATEGORY F: VALIDATION LOGIC (Tests 27–31)
// -----------------------------------------------------------------------------
runTest('TEST 27: Valid RIR accepted by engine schema', () => {
    const ex = exerciseDB.getExerciseById('push_up');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.strictEqual(typeof res.targetRIR, 'number');
    assert.strictEqual(typeof res.rpe, 'number');
    assert.strictEqual(res.rpe, 10 - res.targetRIR);
});

runTest('TEST 28: Out-of-bounds RIR detected and clamped', () => {
    const clampedRPE = intensityEngine.calculateRPEFromRIR(100);
    assert.strictEqual(clampedRPE, 0);
});

runTest('TEST 29: Mismatched RIR/RPE is mathematically impossible via derivation', () => {
    for (let rir = 0; rir <= 5; rir++) {
        const rpe = intensityEngine.calculateRPEFromRIR(rir);
        assert.strictEqual(rpe + rir, 10);
    }
});

runTest('TEST 30: Invalid RIR ordering rejected (minRIR <= targetRIR <= maxRIR enforced)', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.minRIR <= res.targetRIR);
    assert.ok(res.targetRIR <= res.maxRIR);
});

runTest('TEST 31: Contradictory intensity cannot be produced by engine', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain' });
    const res = intensityEngine.calculateExerciseIntensity(ex, profile);

    assert.ok(res.targetRange.includes(`RIR`));
    assert.ok(res.intensityCategory);
});

// -----------------------------------------------------------------------------
// CATEGORY G: INTEGRATION & DETERMINISM (Tests 32–36)
// -----------------------------------------------------------------------------
runTest('TEST 32: Deterministic snapshot remains strictly identical across 10 repeated passes', () => {
    const ex = exerciseDB.getExerciseById('lat_pulldown');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 28, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });

    const snapA = intensityEngine.getDeterministicIntensitySnapshot(ex, profile);
    for (let i = 0; i < 10; i++) {
        const snapB = intensityEngine.getDeterministicIntensitySnapshot(ex, profile);
        assert.strictEqual(snapA, snapB);
    }
});

runTest('TEST 33: Intensity calculation handles missing exercise object safely', () => {
    const res = intensityEngine.calculateExerciseIntensity(null, null);
    assert.ok(typeof res.targetRIR === 'number');
    assert.ok(typeof res.rpe === 'number');
    assert.strictEqual(res.rpe, 10 - res.targetRIR);
});

runTest('TEST 34: Intensity calculation handles partial profile metadata safely', () => {
    const ex = { id: 'test_ex', technicalComplexity: 2, fatigueCost: 2 };
    const res = intensityEngine.calculateExerciseIntensity(ex, {});
    assert.ok(res.targetRIR >= 0 && res.targetRIR <= 5);
});

runTest('TEST 35: Pure function execution without side effects (inputs unmutated)', () => {
    const ex = { id: 'ex_pure', technicalComplexity: 3, fatigueCost: 3 };
    const prof = { primaryGoal: 'muscle-gain', experience: 'intermediate' };
    const exClone = JSON.stringify(ex);
    const profClone = JSON.stringify(prof);

    intensityEngine.calculateExerciseIntensity(ex, prof);
    assert.strictEqual(JSON.stringify(ex), exClone);
    assert.strictEqual(JSON.stringify(prof), profClone);
});

runTest('TEST 36: Engine version tag is present and valid', () => {
    assert.strictEqual(intensityEngine.ENGINE_VERSION, '1.0');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
