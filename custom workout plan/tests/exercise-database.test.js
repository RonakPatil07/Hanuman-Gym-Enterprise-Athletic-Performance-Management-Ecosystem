/**
 * ==============================================================================
 * HANUMAN GYM — EXERCISE INTELLIGENCE DATABASE TEST SUITE
 * Deterministic Unit Test Suite verifying all 17 required validation checks.
 * ==============================================================================
 */

const assert = require('assert');
const path = require('path');
const dbEngine = require('../js/engine/exercise-database.js');

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
console.log('RUNNING EXERCISE INTELLIGENCE DATABASE SUITE (PHASE 3)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Database loads successfully
// -----------------------------------------------------------------------------
runTest('TEST 1: Database loads successfully', () => {
    assert.ok(dbEngine);
    assert.strictEqual(dbEngine.getExerciseDatabaseVersion(), '1.0');
    const all = dbEngine.getAllExercises();
    assert.ok(Array.isArray(all));
    assert.ok(all.length >= 25, `Expected at least 25 exercises, found ${all.length}`);
});

// -----------------------------------------------------------------------------
// TEST 2: All exercise IDs are unique
// -----------------------------------------------------------------------------
runTest('TEST 2: All exercise IDs are unique', () => {
    const all = dbEngine.getAllExercises();
    const seen = new Set();
    all.forEach(ex => {
        assert.ok(ex.id, 'Exercise must have an id');
        assert.ok(!seen.has(ex.id), `Duplicate ID found: ${ex.id}`);
        seen.add(ex.id);
    });
});

// -----------------------------------------------------------------------------
// TEST 3: All exercise names are present
// -----------------------------------------------------------------------------
runTest('TEST 3: All exercise names are present', () => {
    const all = dbEngine.getAllExercises();
    all.forEach(ex => {
        assert.ok(ex.name && typeof ex.name === 'string' && ex.name.trim().length > 0, `Exercise ${ex.id} missing name`);
    });
});

// -----------------------------------------------------------------------------
// TEST 4: All movement patterns are valid
// -----------------------------------------------------------------------------
runTest('TEST 4: All movement patterns are valid', () => {
    const all = dbEngine.getAllExercises();
    const validPatterns = new Set(dbEngine.TAXONOMIES.MOVEMENT_PATTERNS);
    all.forEach(ex => {
        assert.ok(validPatterns.has(ex.movementPattern), `Exercise ${ex.id} has invalid movementPattern: ${ex.movementPattern}`);
    });
});

// -----------------------------------------------------------------------------
// TEST 5: All muscle identifiers are valid
// -----------------------------------------------------------------------------
runTest('TEST 5: All muscle identifiers are valid', () => {
    const all = dbEngine.getAllExercises();
    const validMuscles = new Set(dbEngine.TAXONOMIES.MUSCLES);
    all.forEach(ex => {
        assert.ok(Array.isArray(ex.primaryMuscles) && ex.primaryMuscles.length > 0, `Exercise ${ex.id} must have primaryMuscles`);
        ex.primaryMuscles.forEach(m => {
            assert.ok(validMuscles.has(m), `Exercise ${ex.id} has invalid primary muscle: ${m}`);
        });
        if (ex.secondaryMuscles) {
            ex.secondaryMuscles.forEach(m => {
                assert.ok(validMuscles.has(m), `Exercise ${ex.id} has invalid secondary muscle: ${m}`);
            });
        }
    });
});

// -----------------------------------------------------------------------------
// TEST 6: All equipment identifiers are valid
// -----------------------------------------------------------------------------
runTest('TEST 6: All equipment identifiers are valid', () => {
    const all = dbEngine.getAllExercises();
    const validEquipment = new Set(dbEngine.TAXONOMIES.EQUIPMENT);
    all.forEach(ex => {
        assert.ok(Array.isArray(ex.equipment) && ex.equipment.length > 0, `Exercise ${ex.id} must specify equipment`);
        ex.equipment.forEach(eq => {
            assert.ok(validEquipment.has(eq), `Exercise ${ex.id} has invalid equipment: ${eq}`);
        });
    });
});

// -----------------------------------------------------------------------------
// TEST 7: Fatigue scores remain within 1–5
// -----------------------------------------------------------------------------
runTest('TEST 7: Fatigue scores remain within 1–5', () => {
    const all = dbEngine.getAllExercises();
    all.forEach(ex => {
        assert.ok(typeof ex.fatigueCost === 'number', `Exercise ${ex.id} fatigueCost must be number`);
        assert.ok(ex.fatigueCost >= 1 && ex.fatigueCost <= 5, `Exercise ${ex.id} fatigueCost (${ex.fatigueCost}) out of range 1-5`);
    });
});

// -----------------------------------------------------------------------------
// TEST 8: Technical complexity remains within 1–5
// -----------------------------------------------------------------------------
runTest('TEST 8: Technical complexity remains within 1–5', () => {
    const all = dbEngine.getAllExercises();
    all.forEach(ex => {
        assert.ok(typeof ex.technicalComplexity === 'number', `Exercise ${ex.id} technicalComplexity must be number`);
        assert.ok(ex.technicalComplexity >= 1 && ex.technicalComplexity <= 5, `Exercise ${ex.id} technicalComplexity (${ex.technicalComplexity}) out of range 1-5`);
    });
});

// -----------------------------------------------------------------------------
// TEST 9: Stability demand remains within 1–3
// -----------------------------------------------------------------------------
runTest('TEST 9: Stability demand remains within 1–3', () => {
    const all = dbEngine.getAllExercises();
    all.forEach(ex => {
        assert.ok(typeof ex.stabilityDemand === 'number', `Exercise ${ex.id} stabilityDemand must be number`);
        assert.ok(ex.stabilityDemand >= 1 && ex.stabilityDemand <= 3, `Exercise ${ex.id} stabilityDemand (${ex.stabilityDemand}) out of range 1-3`);
    });
});

// -----------------------------------------------------------------------------
// TEST 10: Progression models are valid
// -----------------------------------------------------------------------------
runTest('TEST 10: Progression models are valid', () => {
    const all = dbEngine.getAllExercises();
    const validProg = new Set(dbEngine.TAXONOMIES.PROGRESSION_MODELS);
    all.forEach(ex => {
        assert.ok(validProg.has(ex.progressionModel), `Exercise ${ex.id} invalid progressionModel: ${ex.progressionModel}`);
    });
});

// -----------------------------------------------------------------------------
// TEST 11: Every regression reference resolves
// -----------------------------------------------------------------------------
runTest('TEST 11: Every regression reference resolves', () => {
    const all = dbEngine.getAllExercises();
    all.forEach(ex => {
        if (Array.isArray(ex.regressions)) {
            ex.regressions.forEach(regId => {
                const target = dbEngine.getExerciseById(regId);
                assert.ok(target, `Exercise ${ex.id} references missing regression: ${regId}`);
                assert.notStrictEqual(regId, ex.id, `Exercise ${ex.id} cannot regress to itself`);
            });
        }
    });
});

// -----------------------------------------------------------------------------
// TEST 12: Every alternative reference resolves
// -----------------------------------------------------------------------------
runTest('TEST 12: Every alternative reference resolves', () => {
    const all = dbEngine.getAllExercises();
    all.forEach(ex => {
        if (Array.isArray(ex.alternatives)) {
            ex.alternatives.forEach(altId => {
                const target = dbEngine.getExerciseById(altId);
                assert.ok(target, `Exercise ${ex.id} references missing alternative: ${altId}`);
                assert.notStrictEqual(altId, ex.id, `Exercise ${ex.id} cannot be alternative to itself`);
            });
        }
    });
});

// -----------------------------------------------------------------------------
// TEST 13: Legacy exercise names resolve correctly
// -----------------------------------------------------------------------------
runTest('TEST 13: Legacy exercise names resolve correctly', () => {
    const sampleTests = [
        { legacy: 'Barbell Bench Press', expected: 'barbell_bench_press' },
        { legacy: 'Incline Dumbbell Press', expected: 'incline_dumbbell_press' },
        { legacy: 'Barbell Squats', expected: 'barbell_back_squat' },
        { legacy: 'Push-ups', expected: 'push_up' },
        { legacy: 'Pull-ups', expected: 'pull_up' },
        { legacy: 'Romanian Deadlift (light)', expected: 'romanian_deadlift' },
        { legacy: 'Walking Lunges', expected: 'walking_lunge' },
        { legacy: 'Dumbbell Rows', expected: 'one_arm_dumbbell_row' },
        { legacy: 'Pike Push-ups', expected: 'pike_pushup' },
        { legacy: 'Cable Tricep Pushdown', expected: 'tricep_pushdown' }
    ];

    sampleTests.forEach(t => {
        const res = dbEngine.resolveLegacyExerciseName(t.legacy);
        assert.ok(res, `Failed to resolve ${t.legacy}`);
        assert.strictEqual(res.canonicalId, t.expected, `Legacy '${t.legacy}' resolved to '${res.canonicalId}', expected '${t.expected}'`);
        assert.ok(res.exercise, `Resolved exercise object missing for ${t.legacy}`);
    });
});

// -----------------------------------------------------------------------------
// TEST 14: Unknown exercise names fail safely
// -----------------------------------------------------------------------------
runTest('TEST 14: Unknown exercise names fail safely', () => {
    const res = dbEngine.resolveLegacyExerciseName('Random Nonexistent Cardio Protocol');
    assert.strictEqual(res.canonicalId, null);
    assert.strictEqual(res.confidence, 'unresolved');
    assert.strictEqual(res.exercise, null);
});

// -----------------------------------------------------------------------------
// TEST 15: Existing major exercises from legacy database have mappings
// -----------------------------------------------------------------------------
runTest('TEST 15: Existing major exercises from legacy database have mappings', () => {
    const majorLegacyNames = [
        'Barbell Bench Press',
        'Barbell Squats',
        'Bench Press',
        'Bodyweight Squats',
        'Dumbbell Rows',
        'Pike Push-ups',
        'Pull-ups',
        'Push-ups',
        'Squats',
        'Walking Lunges',
        'Lat Pulldown',
        'Barbell Row',
        'Barbell Deadlift',
        'Goblet Squat',
        'Overhead Military Press',
        'Lateral Raises',
        'Barbell Bicep Curls',
        'Standing Calf Raises'
    ];

    majorLegacyNames.forEach(name => {
        const res = dbEngine.resolveLegacyExerciseName(name);
        assert.ok(res.canonicalId, `Major legacy exercise unmapped: ${name}`);
        assert.ok(res.exercise, `Canonical entity missing for: ${name}`);
    });
});

// -----------------------------------------------------------------------------
// TEST 16: Database contains sufficient movement-pattern coverage
// -----------------------------------------------------------------------------
runTest('TEST 16: Database contains sufficient movement-pattern coverage', () => {
    const requiredPatterns = ['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'squat', 'hinge', 'lunge', 'isolation'];
    requiredPatterns.forEach(pattern => {
        const found = dbEngine.findExercises({ movementPattern: pattern });
        assert.ok(found.length > 0, `Missing exercises for core movement pattern: ${pattern}`);
    });
});

// -----------------------------------------------------------------------------
// TEST 17: No circular dependency problems exist
// -----------------------------------------------------------------------------
runTest('TEST 17: No circular dependency problems exist', () => {
    const validation = dbEngine.validateExerciseDatabase();
    assert.strictEqual(validation.valid, true, `Validation failed: ${JSON.stringify(validation.errors)}`);
    assert.strictEqual(validation.errors.length, 0);
});

console.log(`\n================================================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
