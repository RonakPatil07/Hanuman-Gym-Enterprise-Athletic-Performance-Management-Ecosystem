/**
 * ==============================================================================
 * HANUMAN GYM — ACTIVE IN-GYM WORKOUT MODE TEST SUITE
 * Unit & Integration verification for Warm-Up Pyramid, Barbell Plate Visualizer,
 * and Live Estimated 1RM (E1RM) / PR Engine.
 * ==============================================================================
 */

const assert = require('assert');
const intensityEngine = require('../js/engine/intensity-rules.js');
const blueprintUI = require('../js/ui/personalized-blueprint.js');

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
console.log('RUNNING ACTIVE IN-GYM WORKOUT MODE TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY 1: 1RM / E1RM ESTIMATION FORMULAS
// -----------------------------------------------------------------------------
console.log('CATEGORY 1: 1RM / E1RM Estimation Formulas');

runTest('TEST 1: 1 Rep equals exact weight', () => {
    assert.strictEqual(intensityEngine.calculateE1RM(100, 1), 100);
    assert.strictEqual(intensityEngine.calculateE1RM(225, 1), 225);
    assert.strictEqual(blueprintUI.calculateLiveE1RM(100, 1), 100);
});

runTest('TEST 2: Epley Formula 100kg x 10 reps = 133.3kg', () => {
    // 100 * (1 + 10/30) = 133.333...
    const res = intensityEngine.calculateE1RM(100, 10, 'epley');
    assert.strictEqual(res, 133.3);
});

runTest('TEST 3: Brzycki Formula 100kg x 10 reps = 133.3kg', () => {
    // 100 * (36 / 27) = 133.333...
    const res = intensityEngine.calculateE1RM(100, 10, 'brzycki');
    assert.strictEqual(res, 133.3);
});

runTest('TEST 4: Heavy Load E1RM calculation (140kg x 5 reps)', () => {
    // Epley: 140 * (1 + 5/30) = 163.3
    const res = intensityEngine.calculateE1RM(140, 5);
    assert.strictEqual(res, 163.3);
});

runTest('TEST 5: Invalid or zero reps/load returns 0', () => {
    assert.strictEqual(intensityEngine.calculateE1RM(0, 10), 0);
    assert.strictEqual(intensityEngine.calculateE1RM(100, 0), 0);
    assert.strictEqual(intensityEngine.calculateE1RM(-50, 5), 0);
    assert.strictEqual(blueprintUI.calculateLiveE1RM(null, null), 0);
});

runTest('TEST 6: Rep Max Table returns descending percentage tiers', () => {
    const table = intensityEngine.calculateRepMaxTable(100, 'kg');
    assert.strictEqual(table.length, 9);
    assert.strictEqual(table[0].percent, 100);
    assert.strictEqual(table[0].load, 100);
    assert.strictEqual(table[0].targetReps, 1);

    // 80% of 100 = 80kg (8 reps)
    const tier80 = table.find(t => t.percent === 80);
    assert.ok(tier80);
    assert.strictEqual(tier80.load, 80);
    assert.strictEqual(tier80.targetReps, 8);
});

// -----------------------------------------------------------------------------
// CATEGORY 2: SCIENCE-BACKED WARM-UP PYRAMID CALCULATOR
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 2: Science-Backed Warm-Up Pyramid Calculator');

runTest('TEST 7: Standard Barbell 100kg Warm-Up Pyramid (4 Stages)', () => {
    const pyramid = intensityEngine.calculateWarmupPyramid(100, 'kg', true);
    assert.strictEqual(pyramid.length, 4);

    // Tier 1: 20kg bar x 10 reps
    assert.strictEqual(pyramid[0].tier, 1);
    assert.strictEqual(pyramid[0].weight, 20);
    assert.strictEqual(pyramid[0].reps, 10);

    // Tier 2: 50% = 50kg x 5 reps
    assert.strictEqual(pyramid[1].tier, 2);
    assert.strictEqual(pyramid[1].weight, 50);
    assert.strictEqual(pyramid[1].reps, 5);

    // Tier 3: 70% = 70kg x 3 reps
    assert.strictEqual(pyramid[2].tier, 3);
    assert.strictEqual(pyramid[2].weight, 70);
    assert.strictEqual(pyramid[2].reps, 3);

    // Tier 4: ~88% = 87.5kg or 90kg x 1 rep
    assert.strictEqual(pyramid[3].tier, 4);
    assert.strictEqual(pyramid[3].weight, 87.5);
    assert.strictEqual(pyramid[3].reps, 1);
});

runTest('TEST 8: Sub-bar weight handled gracefully (20kg target)', () => {
    const pyramid = intensityEngine.calculateWarmupPyramid(20, 'kg', true);
    assert.strictEqual(pyramid.length, 1);
    assert.strictEqual(pyramid[0].weight, 20);
});

runTest('TEST 9: Pound (lb) units calculation (225 lb Barbell)', () => {
    const pyramid = intensityEngine.calculateWarmupPyramid(225, 'lb', true);
    assert.ok(pyramid.length >= 3);
    assert.strictEqual(pyramid[0].weight, 45); // 45lb bar
    assert.strictEqual(pyramid[0].unit, 'lb');
});

runTest('TEST 10: Dumbbell / non-barbell movements scale without 20kg min bar', () => {
    const pyramid = intensityEngine.calculateWarmupPyramid(30, 'kg', false);
    assert.ok(pyramid.length >= 2);
    assert.ok(pyramid[0].weight < 20);
});

// -----------------------------------------------------------------------------
// CATEGORY 3: 2D BARBELL PLATE LOADER & SLEEVE VISUALIZER
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 3: 2D Barbell Plate Loader & Visualizer');

runTest('TEST 11: 100kg on Olympic Bar (20kg bar + 40kg per side)', () => {
    const res = blueprintUI.calculateBarbellPlates(100, false);
    assert.strictEqual(res.barWeight, 20);
    assert.strictEqual(res.weightPerSide, 40);
    assert.strictEqual(res.remainder, 0);

    // 40kg per side = 1x 25kg + 1x 15kg
    const plate25 = res.plates.find(p => p.plate === 25);
    const plate15 = res.plates.find(p => p.plate === 15);
    assert.ok(plate25 && plate25.count === 1);
    assert.ok(plate15 && plate15.count === 1);
});

runTest('TEST 12: 60kg Standard Warm-up (20kg per side)', () => {
    const res = blueprintUI.calculateBarbellPlates(60, false);
    assert.strictEqual(res.weightPerSide, 20);
    const plate20 = res.plates.find(p => p.plate === 20);
    assert.ok(plate20 && plate20.count === 1);
});

runTest('TEST 13: 225lb Olympic Barbell (45lb bar + 90lb per side)', () => {
    const res = blueprintUI.calculateBarbellPlates(225, true);
    assert.strictEqual(res.barWeight, 45);
    assert.strictEqual(res.weightPerSide, 90);
    // 90lb per side = 2x 45lb plates
    const plate45 = res.plates.find(p => p.plate === 45);
    assert.ok(plate45 && plate45.count === 2);
});

runTest('TEST 14: Barbell Sleeve SVG Graphic renders valid XML/SVG string', () => {
    const res = blueprintUI.calculateBarbellPlates(100, false);
    const svgHTML = blueprintUI.renderVisualBarbellSleeve(res.plates, 'kg', false);
    assert.ok(typeof svgHTML === 'string');
    assert.ok(svgHTML.includes('<svg'));
    assert.ok(svgHTML.includes('barbell-sleeve-svg'));
    assert.ok(svgHTML.includes('barbell-plate-node'));
});

// -----------------------------------------------------------------------------
// CATEGORY 4: LIVE SESSION TONNAGE & HUD METRICS
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 4: Live Session Tonnage & HUD Metrics');

runTest('TEST 15: Session Tonnage calculates total completed weight x reps', () => {
    const mockLog = {
        exercises: [
            {
                exerciseId: 'squat',
                sets: [
                    { setNumber: 1, completed: true, actualLoad: 100, actualReps: 10, loadUnit: 'kg' }, // 1000kg
                    { setNumber: 2, completed: true, actualLoad: 100, actualReps: 8, loadUnit: 'kg' },  // 800kg
                    { setNumber: 3, completed: false, actualLoad: 100, actualReps: 8, loadUnit: 'kg' } // uncompleted, ignore
                ]
            },
            {
                exerciseId: 'bench',
                sets: [
                    { setNumber: 1, completed: true, actualLoad: 80, actualReps: 10, loadUnit: 'kg' }   // 800kg
                ]
            }
        ]
    };

    const tonnage = blueprintUI.calculateSessionTonnage(mockLog);
    // 1000 + 800 + 800 = 2600kg
    assert.strictEqual(tonnage.totalKg, 2600);
    assert.strictEqual(tonnage.totalFormatted, '2,600 kg');
});

runTest('TEST 16: Empty or uncompleted sets produce 0 tonnage safely', () => {
    const mockLog = { exercises: [] };
    const tonnage = blueprintUI.calculateSessionTonnage(mockLog);
    assert.strictEqual(tonnage.totalKg, 0);
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
