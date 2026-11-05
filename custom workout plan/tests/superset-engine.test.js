/**
 * ==============================================================================
 * HANUMAN GYM — SUPERSET & CIRCUIT GROUPING ENGINE UNIT TESTS
 * ==============================================================================
 */

const assert = require('assert');
const supersetEngine = require('../js/engine/superset-engine.js');

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
console.log('RUNNING SUPERSET & CIRCUIT GROUPING ENGINE TEST SUITE');
console.log('================================================================\n');

console.log('CATEGORY 1: Biomechanical Synergy & Compatibility Check');
runTest('Chest and Back are compatible antagonist pairs', () => {
    assert.strictEqual(supersetEngine.areMusclesCompatible('chest', 'back'), true);
    assert.strictEqual(supersetEngine.areMusclesCompatible('biceps', 'triceps'), true);
    assert.strictEqual(supersetEngine.areMusclesCompatible('quads', 'hamstrings'), true);
});

runTest('Identical muscle groups are rejected for supersets to prevent localized exhaustion', () => {
    assert.strictEqual(supersetEngine.areMusclesCompatible('chest', 'chest'), false);
    assert.strictEqual(supersetEngine.areMusclesCompatible('quads', 'quads'), false);
});

console.log('\nCATEGORY 2: Session Superset Grouping & Time Savings');
runTest('Groups full upper body session into paired antagonist supersets', () => {
    const exercises = [
        { exerciseName: 'Barbell Bench Press', targetMuscle: 'chest', sets: 4 },
        { exerciseName: 'Barbell Row', targetMuscle: 'back', sets: 4 },
        { exerciseName: 'Bicep Curl', targetMuscle: 'biceps', sets: 3 },
        { exerciseName: 'Tricep Pushdown', targetMuscle: 'triceps', sets: 3 }
    ];

    const result = supersetEngine.groupSessionIntoSupersets(exercises);
    assert.strictEqual(result.supersetsCount, 2);
    assert.ok(result.totalTimeSavedMinutes >= 8);
    assert.strictEqual(result.groupedList[0].tag, 'SS-A');
    assert.strictEqual(result.groupedList[1].tag, 'SS-B');
});

runTest('Preserves unpaired movements as linear exercises safely', () => {
    const exercises = [
        { exerciseName: 'Barbell Back Squat', targetMuscle: 'quads', sets: 4 },
        { exerciseName: 'Leg Press', targetMuscle: 'quads', sets: 3 }
    ];

    const result = supersetEngine.groupSessionIntoSupersets(exercises);
    assert.strictEqual(result.supersetsCount, 0);
    assert.strictEqual(result.groupedList[0].type, 'LINEAR');
    assert.strictEqual(result.groupedList[1].type, 'LINEAR');
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
