/**
 * ==============================================================================
 * HANUMAN GYM — BIOMECHANICAL MUSCLE ANATOMY TEST SUITE
 * Unit & Integration verification for muscle activation mapping, hypertrophy
 * volume landmarks (MEV, MAV, MRV), and interactive 2D SVG heatmap rendering.
 * ==============================================================================
 */

const assert = require('assert');
const anatomyEngine = require('../js/engine/muscle-anatomy.js');

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
console.log('RUNNING BIOMECHANICAL MUSCLE ANATOMY TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY 1: EXERCISE ACTIVATION MAPPING
// -----------------------------------------------------------------------------
console.log('CATEGORY 1: Exercise Biomechanical Activation Mapping');

runTest('TEST 1: Barbell Bench Press maps primary to Chest', () => {
    const map = anatomyEngine.getExerciseMuscleMap('Barbell Bench Press');
    assert.ok(map.primary.includes('chest'));
    assert.ok(map.secondary.includes('triceps') || map.secondary.includes('shoulders_front'));
});

runTest('TEST 2: Deadlift maps primary to Lower Back, Glutes, Hamstrings', () => {
    const map = anatomyEngine.getExerciseMuscleMap('Conventional Barbell Deadlift');
    assert.ok(map.primary.includes('lower_back') || map.primary.includes('hamstrings') || map.primary.includes('glutes'));
    assert.ok(map.secondary.includes('lats') || map.secondary.includes('upper_back'));
});

runTest('TEST 3: Barbell Squat maps primary to Quads and Glutes', () => {
    const map = anatomyEngine.getExerciseMuscleMap('Barbell Back Squats');
    assert.ok(map.primary.includes('quads'));
    assert.ok(map.primary.includes('glutes'));
});

runTest('TEST 4: Pull-ups map primary to Lats', () => {
    const map = anatomyEngine.getExerciseMuscleMap('Weighted Pull-ups');
    assert.ok(map.primary.includes('lats'));
    assert.ok(map.secondary.includes('biceps'));
});

runTest('TEST 5: Bicep Curl isolation maps primary strictly to Biceps', () => {
    const map = anatomyEngine.getExerciseMuscleMap('Incline Dumbbell Bicep Curls');
    assert.ok(map.primary.includes('biceps'));
    assert.strictEqual(map.primary.length, 1);
});

// -----------------------------------------------------------------------------
// CATEGORY 2: HYPERTROPHY VOLUME LANDMARKS (MEV, MAV, MRV)
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 2: Hypertrophy Volume Landmarks (RP Standards)');

runTest('TEST 6: 0 sets returns RESTING status', () => {
    const res = anatomyEngine.getVolumeStatus('chest', 0);
    assert.strictEqual(res.status, 'RESTING');
});

runTest('TEST 7: 4 sets of Chest is BELOW_MEV (maintenance)', () => {
    const res = anatomyEngine.getVolumeStatus('chest', 4);
    assert.strictEqual(res.status, 'BELOW_MEV');
});

runTest('TEST 8: 10 sets of Chest is MINIMUM_GROWTH', () => {
    const res = anatomyEngine.getVolumeStatus('chest', 10);
    assert.strictEqual(res.status, 'MINIMUM_GROWTH');
});

runTest('TEST 9: 16 sets of Chest is OPTIMAL_MAV (Max Adaptive Volume)', () => {
    const res = anatomyEngine.getVolumeStatus('chest', 16);
    assert.strictEqual(res.status, 'OPTIMAL_MAV');
});

runTest('TEST 10: 24 sets of Chest is OVER_MRV (Overreaching risk)', () => {
    const res = anatomyEngine.getVolumeStatus('chest', 24);
    assert.strictEqual(res.status, 'OVER_MRV');
});

// -----------------------------------------------------------------------------
// CATEGORY 3: WHOLE PROGRAM & SESSION VOLUME AGGREGATION
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 3: Program & Session Muscle Volume Aggregation');

runTest('TEST 11: Program analysis computes weekly set breakdown', () => {
    const mockProgram = {
        sessions: [
            {
                day: 'Monday',
                exercises: [
                    { exerciseName: 'Barbell Bench Press', sets: 4 },
                    { exerciseName: 'Incline Dumbbell Press', sets: 3 },
                    { exerciseName: 'Tricep Pushdowns', sets: 3 }
                ]
            },
            {
                day: 'Thursday',
                exercises: [
                    { exerciseName: 'Dumbbell Bench Press', sets: 4 },
                    { exerciseName: 'Barbell Squats', sets: 4 }
                ]
            }
        ]
    };

    const analysis = anatomyEngine.analyzeProgramMuscleVolume(mockProgram);
    assert.strictEqual(analysis.totalSets, 18);
    // Chest: 4 + 3 + 4 = 11 direct sets
    assert.strictEqual(analysis.muscleMap.chest.directSets, 11);
    assert.ok(analysis.activeMuscles.includes('chest'));
    assert.ok(analysis.activeMuscles.includes('quads'));
    assert.ok(analysis.activeMuscles.includes('triceps'));
});

runTest('TEST 12: Session analysis isolates active daily muscles', () => {
    const mockSession = {
        exercises: [
            { exerciseName: 'Barbell Squats' },
            { exerciseName: 'Romanian Deadlift' }
        ]
    };

    const res = anatomyEngine.analyzeSessionMuscleActivation(mockSession);
    assert.ok(res.primary.includes('quads'));
    assert.ok(res.primary.includes('hamstrings') || res.primary.includes('glutes'));
});

// -----------------------------------------------------------------------------
// CATEGORY 4: DUAL-VIEW 2D SVG HEATMAP RENDERER
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 4: Dual-View 2D SVG Heatmap Renderer');

runTest('TEST 13: Renders valid SVG string containing Anterior and Posterior views', () => {
    const activation = {
        primary: ['chest', 'quads'],
        secondary: ['triceps', 'shoulders_front'],
        stabilizer: ['abs']
    };

    const svgHTML = anatomyEngine.renderAnatomyHeatmapSVG(activation);
    assert.ok(typeof svgHTML === 'string');
    assert.ok(svgHTML.includes('<svg'));
    assert.ok(svgHTML.includes('ANTERIOR (FRONT)'));
    assert.ok(svgHTML.includes('POSTERIOR (BACK)'));
    assert.ok(svgHTML.includes('muscle-chest'));
    assert.ok(svgHTML.includes('muscle-quads'));
    assert.ok(svgHTML.includes('#B3DD24')); // Performance Lime for primary
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
