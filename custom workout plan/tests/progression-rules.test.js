/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PROGRESSIVE OVERLOAD & PROGRESSION INTELLIGENCE TEST SUITE (PHASE 9)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const rulesEngine = require('../js/engine/training-rules.js');
const intensityEngine = require('../js/engine/intensity-rules.js');
const progressionEngine = require('../js/engine/progression-rules.js');

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
console.log('RUNNING PROGRESSIVE OVERLOAD & PROGRESSION TEST SUITE (PHASE 9)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: CORE MODELS (Tests 1–6)
// -----------------------------------------------------------------------------
runTest('TEST 1: Double progression strategy structure', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const intensity = intensityEngine.calculateExerciseIntensity(ex, profile);
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile, {}, intensity);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
    assert.ok(strat.repRange.min < strat.repRange.max);
    assert.ok(strat.progressionTrigger.includes('top of the rep range') || strat.progressionTrigger.includes('reps'));
    assert.ok(strat.progressionAction.includes('Increase resistance') || strat.progressionAction.includes('reset'));
    assert.ok(strat.resetRule.includes('Reset'));
});

runTest('TEST 2: Load progression strategy structure', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'strength', experience: 'intermediate' });
    const intensity = intensityEngine.calculateExerciseIntensity(ex, profile);
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile, {}, intensity);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.LOAD_PROGRESSION);
    assert.ok(strat.progressionTrigger.includes('prescribed'));
    assert.ok(strat.progressionAction.includes('Increase load'));
});

runTest('TEST 3: Rep progression strategy structure for bodyweight exercises', () => {
    const ex = exerciseDB.getExerciseById('push_up');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const intensity = intensityEngine.calculateExerciseIntensity(ex, profile);
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile, {}, intensity);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.REP_PROGRESSION);
    assert.strictEqual(strat.loadIncrementCategory, progressionEngine.LOAD_INCREMENT_CATEGORIES.NONE);
    assert.strictEqual(strat.repIncrement, 1);
});

runTest('TEST 4: RIR progression model recognition in validator', () => {
    const customStrat = {
        version: '1.0',
        model: progressionEngine.PROGRESSION_MODELS.RIR_PROGRESSION,
        exerciseId: 'test_ex',
        repRange: { min: 8, max: 10 },
        requiredRIR: 3,
        progressionTrigger: 'Complete 3 sets of 10 reps with stable form.',
        progressionAction: 'Reduce target RIR from 3 to 2 for subsequent sessions.',
        loadIncrementCategory: progressionEngine.LOAD_INCREMENT_CATEGORIES.NONE
    };
    const val = progressionEngine.validateProgressionStrategy(customStrat);
    assert.strictEqual(val.valid, true);
});

runTest('TEST 5: Hold progression strategy structure for isometric exercises', () => {
    const isoEx = {
        id: 'isometric_plank',
        name: 'Plank Hold',
        movementPattern: 'isometric',
        equipment: ['bodyweight'],
        tags: ['isometric']
    };
    const strat = progressionEngine.calculateProgressionStrategy(isoEx, {});
    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.HOLD_PROGRESSION);
    assert.strictEqual(strat.holdIncrementSeconds, 5);
    assert.ok(strat.progressionAction.includes('+5s'));
});

runTest('TEST 6: Conservative progression strategy structure for beginners and high complexity', () => {
    const ex = exerciseDB.getExerciseById('barbell_deadlift');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'beginner' });
    const intensity = intensityEngine.calculateExerciseIntensity(ex, profile);
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile, {}, intensity);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.CONSERVATIVE_PROGRESSION);
    assert.strictEqual(strat.loadIncrementCategory, progressionEngine.LOAD_INCREMENT_CATEGORIES.MICRO);
    assert.ok(strat.progressionTrigger.includes('2 consecutive sessions') || strat.progressionTrigger.includes('mechanics'));
});

// -----------------------------------------------------------------------------
// CATEGORY B: GOAL RULES (Tests 7–11)
// -----------------------------------------------------------------------------
runTest('TEST 7: Muscle-gain selects double progression for hypertrophy accessories', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_curl');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
});

runTest('TEST 8: Weight-loss maintains double progression with auto-regulated volume', () => {
    const ex = exerciseDB.getExerciseById('lat_pulldown');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'weight-loss', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
    assert.ok(strat.rationale.includes('deficit') || strat.rationale.includes('Energy'));
});

runTest('TEST 9: Get-shredded prioritizes density & controlled progression', () => {
    const ex = exerciseDB.getExerciseById('seated_cable_row');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'get-shredded', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
});

runTest('TEST 10: Strength prioritizes load progression on primary compounds', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'strength', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.LOAD_PROGRESSION);
});

runTest('TEST 11: General-fitness prescribes sustainable double progression', () => {
    const ex = exerciseDB.getExerciseById('lat_pulldown');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 40, gender: 'female', goal: 'general-fitness', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
});

// -----------------------------------------------------------------------------
// CATEGORY C: EXPERIENCE (Tests 12–15)
// -----------------------------------------------------------------------------
runTest('TEST 12: Beginner enforces conservative progression model across lifts', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'beginner' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.CONSERVATIVE_PROGRESSION);
    assert.strictEqual(strat.loadIncrementCategory, progressionEngine.LOAD_INCREMENT_CATEGORIES.MICRO);
});

runTest('TEST 13: Intermediate trainees use standard double progression', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
});

runTest('TEST 14: Advanced trainees use calibrated overload precision', () => {
    const ex = exerciseDB.getExerciseById('lateral_raise');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'advanced' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
});

runTest('TEST 15: Beginner conservative behavior requires multi-exposure mastery', () => {
    const ex = exerciseDB.getExerciseById('goblet_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'beginner' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.ok(strat.progressionTrigger.includes('2 consecutive sessions') || strat.progressionTrigger.includes('mechanics'));
});

// -----------------------------------------------------------------------------
// CATEGORY D: EXERCISE CHARACTERISTICS (Tests 16–21)
// -----------------------------------------------------------------------------
runTest('TEST 16: Heavy technical compound receives conservative or load progression', () => {
    const ex = exerciseDB.getExerciseById('barbell_deadlift');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.CONSERVATIVE_PROGRESSION);
});

runTest('TEST 17: Stable isolation exercise receives double progression with small increments', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_curl');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.DOUBLE_PROGRESSION);
    assert.strictEqual(strat.loadIncrementCategory, progressionEngine.LOAD_INCREMENT_CATEGORIES.SMALL);
});

runTest('TEST 18: High technical complexity (>= 4) restricts load increment to MICRO', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'strength', experience: 'intermediate' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.strictEqual(strat.loadIncrementCategory, progressionEngine.LOAD_INCREMENT_CATEGORIES.MICRO);
});

runTest('TEST 19: High fatigue exercise (fatigueCost >= 5) uses conservative progression', () => {
    const ex = exerciseDB.getExerciseById('barbell_deadlift');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.CONSERVATIVE_PROGRESSION);
});

runTest('TEST 20: Stable machine movements utilize standard load categories', () => {
    const ex = exerciseDB.getExerciseById('lat_pulldown');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.ok(strat.loadIncrementCategory !== progressionEngine.LOAD_INCREMENT_CATEGORIES.NONE);
});

runTest('TEST 21: Pure bodyweight exercise enforces REP_PROGRESSION and NONE load category', () => {
    const ex = exerciseDB.getExerciseById('push_up');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.REP_PROGRESSION);
    assert.strictEqual(strat.loadIncrementCategory, progressionEngine.LOAD_INCREMENT_CATEGORIES.NONE);
});

// -----------------------------------------------------------------------------
// CATEGORY E: RIR INTEGRATION (Tests 22–26)
// -----------------------------------------------------------------------------
runTest('TEST 22: Strategy respects target RIR from Phase 8 intensity engine', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const intensity = { targetRIR: 3, rpe: 7 };
    const strat = progressionEngine.calculateProgressionStrategy(ex, {}, {}, intensity);

    assert.strictEqual(strat.requiredRIR, 3);
    assert.ok(strat.progressionTrigger.includes('RIR 3'));
});

runTest('TEST 23: Default target RIR is 2 when intensity is omitted', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.requiredRIR, 2);
});

runTest('TEST 24: Target RIR is validated within numeric bounds (0–5)', () => {
    const valid5 = progressionEngine.validateProgressionStrategy({
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 8, max: 12 },
        progressionTrigger: 'Trigger',
        progressionAction: 'Action',
        resetRule: 'Reset',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 5
    });
    assert.strictEqual(valid5.valid, true);

    const invalid6 = progressionEngine.validateProgressionStrategy({
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 8, max: 12 },
        progressionTrigger: 'Trigger',
        progressionAction: 'Action',
        resetRule: 'Reset',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 6
    });
    assert.strictEqual(invalid6.valid, false);

    const invalid10 = progressionEngine.validateProgressionStrategy({
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 8, max: 12 },
        progressionTrigger: 'Trigger',
        progressionAction: 'Action',
        resetRule: 'Reset',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 10
    });
    assert.strictEqual(invalid10.valid, false);
});

runTest('TEST 25: Negative RIR is rejected in strategy validation', () => {
    const invalid = progressionEngine.validateProgressionStrategy({
        model: 'DOUBLE_PROGRESSION',
        progressionTrigger: 'Trigger',
        progressionAction: 'Action',
        requiredRIR: -1
    });
    assert.strictEqual(invalid.valid, false);
});

runTest('TEST 26: Progression trigger explicitly references target RIR', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_curl');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {}, {}, { targetRIR: 1 });

    assert.ok(strat.progressionTrigger.includes('RIR 1'));
});

// -----------------------------------------------------------------------------
// CATEGORY F: REP PROGRESSION & RANGES (Tests 27–30)
// -----------------------------------------------------------------------------
runTest('TEST 27: Valid rep range parsing from object', () => {
    const range = progressionEngine._internals.parseRepRange({ min: 6, max: 10 });
    assert.strictEqual(range.min, 6);
    assert.strictEqual(range.max, 10);
});

runTest('TEST 28: String rep range parsing ("8-12")', () => {
    const range = progressionEngine._internals.parseRepRange('8-12');
    assert.strictEqual(range.min, 8);
    assert.strictEqual(range.max, 12);
});

runTest('TEST 29: Upper-bound trigger defined clearly for double progression', () => {
    const ex = { id: 'ex_test', repRange: { min: 8, max: 12 } };
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.ok(strat.progressionTrigger.includes('12 reps') || strat.progressionTrigger.includes('top of the rep range'));
});

runTest('TEST 30: Reset behavior defines lower rep bound reset', () => {
    const ex = { id: 'ex_test', repRange: { min: 8, max: 12 } };
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.ok(strat.resetRule.includes('8 reps'));
});

// -----------------------------------------------------------------------------
// CATEGORY G: LOAD PROGRESSION (Tests 31–34)
// -----------------------------------------------------------------------------
runTest('TEST 31: Valid load increment categories (MICRO, SMALL, MODERATE, NONE)', () => {
    const cats = Object.values(progressionEngine.LOAD_INCREMENT_CATEGORIES);
    assert.ok(cats.includes('MICRO'));
    assert.ok(cats.includes('SMALL'));
    assert.ok(cats.includes('MODERATE'));
    assert.ok(cats.includes('NONE'));
});

runTest('TEST 32: No arbitrary kilogram assumptions in strategy object', () => {
    const ex = exerciseDB.getExerciseById('barbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    const json = JSON.stringify(strat);
    assert.ok(!json.includes('kg'));
    assert.ok(!json.includes('lbs'));
});

runTest('TEST 33: Load trigger defined clearly for load progression', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'strength' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.ok(strat.progressionAction.includes('Increase load'));
});

runTest('TEST 34: Technical compound safeguards enforce reset on breakdown', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'strength' });
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile);

    assert.ok(strat.resetRule.includes('technical breakdown'));
});

// -----------------------------------------------------------------------------
// CATEGORY H: STALL & DELOAD POLICIES (Tests 35–38)
// -----------------------------------------------------------------------------
runTest('TEST 35: Stall policy is defined with future adaptive engine escalation', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.stallPolicy.action, 'maintain');
    assert.strictEqual(strat.stallPolicy.futureEscalation, 'adaptive-engine');
});

runTest('TEST 36: No historical stall counting attempted in Phase 9', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.consecutiveFailures, undefined);
    assert.strictEqual(strat.historicalStalls, undefined);
});

runTest('TEST 37: Deload policy defined with volume guidance', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.deloadPolicy.action, 'maintain');
    assert.ok(strat.deloadPolicy.guidance.includes('6-8 weeks'));
});

runTest('TEST 38: No automatic historical deload triggering in Phase 9', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.deloadTriggered, undefined);
});

// -----------------------------------------------------------------------------
// CATEGORY I: INTEGRATION & DETERMINISM (Tests 39–46)
// -----------------------------------------------------------------------------
runTest('TEST 39: validateProgressionStrategy accepts valid strategy', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});
    const val = progressionEngine.validateProgressionStrategy(strat);

    assert.strictEqual(val.valid, true);
    assert.strictEqual(val.errors.length, 0);
});

runTest('TEST 40: validateProgressionStrategy rejects invalid model', () => {
    const invalid = {
        model: 'RANDOM_AI_MODEL',
        progressionTrigger: 'Trigger',
        progressionAction: 'Action'
    };
    const val = progressionEngine.validateProgressionStrategy(invalid);

    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Invalid or unsupported progression model')));
});

runTest('TEST 41: validateProgressionStrategy rejects invalid rep range (min > max)', () => {
    const invalid = {
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 15, max: 8 },
        progressionTrigger: 'Trigger',
        progressionAction: 'Action'
    };
    const val = progressionEngine.validateProgressionStrategy(invalid);

    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('Invalid rep range ordering')));
});

runTest('TEST 42: validateProgressionStrategy rejects missing trigger/action', () => {
    const invalid = {
        model: 'DOUBLE_PROGRESSION',
        requiredRIR: 2
    };
    const val = progressionEngine.validateProgressionStrategy(invalid);

    assert.strictEqual(val.valid, false);
});

runTest('TEST 43: Deterministic snapshot remains identical across 10 repeated passes', () => {
    const ex = exerciseDB.getExerciseById('lat_pulldown');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'female', goal: 'get-shredded' });

    const snap1 = progressionEngine.getDeterministicProgressionSnapshot(
        progressionEngine.calculateProgressionStrategy(ex, profile)
    );
    for (let i = 0; i < 10; i++) {
        const snapPass = progressionEngine.getDeterministicProgressionSnapshot(
            progressionEngine.calculateProgressionStrategy(ex, profile)
        );
        assert.strictEqual(snapPass, snap1);
    }
});

runTest('TEST 44: getProgressionExplanation produces human-readable text', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});
    const explanation = progressionEngine.getProgressionExplanation(strat);

    assert.ok(typeof explanation === 'string' && explanation.length > 20);
});

runTest('TEST 45: Pure function execution without side effects (inputs unmutated)', () => {
    const ex = { id: 'test_immutability', repRange: { min: 8, max: 12 }, technicalComplexity: 2 };
    const prof = { primaryGoal: 'muscle-gain', experience: 'intermediate' };
    const exClone = JSON.stringify(ex);
    const profClone = JSON.stringify(prof);

    progressionEngine.calculateProgressionStrategy(ex, prof);
    assert.strictEqual(JSON.stringify(ex), exClone);
    assert.strictEqual(JSON.stringify(prof), profClone);
});

runTest('TEST 46: Engine version tag is present and valid', () => {
    assert.strictEqual(progressionEngine.ENGINE_VERSION, '1.0');
});

// -----------------------------------------------------------------------------
// CATEGORY J: TARGETED CORRECTION & HARDENING (Tests 47–62)
// -----------------------------------------------------------------------------
runTest('TEST 47: RIR_PROGRESSION is formally exposed in PROGRESSION_MODELS enum', () => {
    assert.strictEqual(progressionEngine.PROGRESSION_MODELS.RIR_PROGRESSION, 'RIR_PROGRESSION');
});

runTest('TEST 48: RIR_PROGRESSION can be selected dynamically by strategy engine', () => {
    const ex = { id: 'test_rir_ex', progressionModel: 'rir_progression', category: 'isolation' };
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'get-shredded' });
    const intensity = { targetRIR: 3, rpe: 7 };
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile, {}, intensity);

    assert.strictEqual(strat.model, progressionEngine.PROGRESSION_MODELS.RIR_PROGRESSION);
    assert.strictEqual(strat.loadIncrementCategory, progressionEngine.LOAD_INCREMENT_CATEGORIES.NONE);
    assert.ok(strat.progressionAction.includes('RIR 2') || strat.progressionAction.includes('effort'));
});

runTest('TEST 49: RIR_PROGRESSION respects minRIR and clamps safely at 0', () => {
    const ex = { id: 'test_rir_ex', progressionModel: 'rir_progression' };
    const intensity = { targetRIR: 1, minRIR: 0, maxRIR: 2 };
    const strat = progressionEngine.calculateProgressionStrategy(ex, {}, {}, intensity);

    assert.strictEqual(strat.requiredRIR, 1);
    assert.ok(strat.progressionAction.includes('RIR 0'));
});

runTest('TEST 50: RIR_PROGRESSION respects maxRIR from Phase 8 output', () => {
    const ex = { id: 'test_rir_ex', progressionModel: 'rir_progression' };
    const intensity = { targetRIR: 4, minRIR: 3, maxRIR: 5 };
    const strat = progressionEngine.calculateProgressionStrategy(ex, {}, {}, intensity);

    assert.strictEqual(strat.requiredRIR, 4);
    assert.ok(strat.progressionAction.includes('RIR 3'));
});

runTest('TEST 51: RIR_PROGRESSION remains 100% compatible with Phase 8 intensity output', () => {
    const ex = exerciseDB.getExerciseById('cable_lateral_raise');
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 28, gender: 'male', goal: 'get-shredded', experience: 'intermediate' });
    const intensity = intensityEngine.calculateExerciseIntensity(ex, profile);
    const strat = progressionEngine.calculateProgressionStrategy(ex, profile, {}, intensity);

    assert.strictEqual(strat.requiredRIR, intensity.targetRIR);
});

runTest('TEST 52: Historical-state audit: Zero historical workout session state accessed or stored', () => {
    const ex = exerciseDB.getExerciseById('dumbbell_bench_press');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    const prohibitedKeys = [
        'previousSessions', 'completedSessions', 'sessionCount', 'workoutHistory',
        'loggedReps', 'loggedWeight', 'consecutiveFailures', 'historicalStalls', 'deloadTriggered'
    ];
    prohibitedKeys.forEach(k => {
        assert.strictEqual(strat[k], undefined);
    });
});

runTest('TEST 53: Historical-state audit: Zero automatic stall counting in strategy object', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.stallCount, undefined);
    assert.strictEqual(strat.stallPolicy.action, 'maintain');
});

runTest('TEST 54: Historical-state audit: Zero automatic historical deload triggering', () => {
    const ex = exerciseDB.getExerciseById('barbell_back_squat');
    const strat = progressionEngine.calculateProgressionStrategy(ex, {});

    assert.strictEqual(strat.deloadTriggered, undefined);
    assert.strictEqual(strat.deloadPolicy.action, 'maintain');
});

runTest('TEST 55: HOLD_PROGRESSION model-specific validation enforces holdIncrement and rejects load/rep increments', () => {
    const validHold = {
        model: 'HOLD_PROGRESSION',
        progressionTrigger: 'Hold for 45s.',
        progressionAction: 'Increase hold by +5s.',
        holdIncrementSeconds: 5,
        loadIncrementCategory: 'NONE',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(validHold).valid, true);

    const invalidHold = {
        model: 'HOLD_PROGRESSION',
        progressionTrigger: 'Hold for 45s.',
        progressionAction: 'Increase hold by +5s.',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(invalidHold).valid, false);
});

runTest('TEST 56: REP_PROGRESSION model-specific validation enforces repIncrement and NONE load category', () => {
    const validRep = {
        model: 'REP_PROGRESSION',
        progressionTrigger: 'Complete 3x15.',
        progressionAction: 'Add 1 rep.',
        repIncrement: 1,
        loadIncrementCategory: 'NONE',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(validRep).valid, true);

    const invalidRep = {
        model: 'REP_PROGRESSION',
        progressionTrigger: 'Complete 3x15.',
        progressionAction: 'Add 1 rep.',
        repIncrement: 0,
        loadIncrementCategory: 'NONE',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(invalidRep).valid, false);
});

runTest('TEST 57: LOAD_PROGRESSION model-specific validation requires active load category and rejects arbitrary kg', () => {
    const validLoad = {
        model: 'LOAD_PROGRESSION',
        progressionTrigger: 'Complete 5x5.',
        progressionAction: 'Increase load by SMALL increment.',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(validLoad).valid, true);

    const invalidLoadWithKg = {
        model: 'LOAD_PROGRESSION',
        progressionTrigger: 'Complete 5x5.',
        progressionAction: 'Increase load.',
        loadIncrementCategory: 'SMALL',
        incrementKg: 2.5,
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(invalidLoadWithKg).valid, false);
});

runTest('TEST 58: DOUBLE_PROGRESSION model-specific validation requires repRange, resetRule, and rejects repIncrement', () => {
    const validDouble = {
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 8, max: 12 },
        progressionTrigger: 'Complete 3x12.',
        progressionAction: 'Increase load and reset to 8.',
        resetRule: 'Reset to 8 reps.',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(validDouble).valid, true);

    const invalidDoubleNoReset = {
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 8, max: 12 },
        progressionTrigger: 'Complete 3x12.',
        progressionAction: 'Increase load.',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(invalidDoubleNoReset).valid, false);
});

runTest('TEST 59: CONSERVATIVE_PROGRESSION model-specific validation enforces MICRO load category', () => {
    const validConservative = {
        model: 'CONSERVATIVE_PROGRESSION',
        progressionTrigger: 'Complete 3x8 with perfect form.',
        progressionAction: 'Increase load by MICRO increment.',
        loadIncrementCategory: 'MICRO',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(validConservative).valid, true);

    const invalidConservative = {
        model: 'CONSERVATIVE_PROGRESSION',
        progressionTrigger: 'Complete 3x8.',
        progressionAction: 'Increase load.',
        loadIncrementCategory: 'MODERATE',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(invalidConservative).valid, false);
});

runTest('TEST 60: Contradictory progression fields are rejected across all models', () => {
    const contradictoryStrategy = {
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 8, max: 12 },
        repIncrement: 2,
        progressionTrigger: 'Trigger',
        progressionAction: 'Action',
        resetRule: 'Reset',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(contradictoryStrategy).valid, false);
});

runTest('TEST 61: Validator rejects DOUBLE_PROGRESSION where min >= max rep range', () => {
    const invertedRange = {
        model: 'DOUBLE_PROGRESSION',
        repRange: { min: 12, max: 8 },
        progressionTrigger: 'Trigger',
        progressionAction: 'Action',
        resetRule: 'Reset',
        loadIncrementCategory: 'SMALL',
        requiredRIR: 2
    };
    assert.strictEqual(progressionEngine.validateProgressionStrategy(invertedRange).valid, false);
});

runTest('TEST 62: Deterministic snapshot across all 6 progression models remains identical across 10 repeated passes', () => {
    const models = Object.values(progressionEngine.PROGRESSION_MODELS);
    models.forEach(m => {
        const dummyStrat = {
            version: '1.0',
            model: m,
            requiredRIR: 2,
            progressionTrigger: 'Trigger',
            progressionAction: 'Action',
            loadIncrementCategory: m === 'CONSERVATIVE_PROGRESSION' ? 'MICRO' : (m === 'DOUBLE_PROGRESSION' || m === 'LOAD_PROGRESSION' ? 'SMALL' : 'NONE')
        };
        const snap1 = progressionEngine.getDeterministicProgressionSnapshot(dummyStrat);
        for (let i = 0; i < 10; i++) {
            assert.strictEqual(progressionEngine.getDeterministicProgressionSnapshot(dummyStrat), snap1);
        }
    });
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}

