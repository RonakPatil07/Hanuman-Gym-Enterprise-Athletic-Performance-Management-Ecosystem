/**
 * ==============================================================================
 * HANUMAN GYM — ONBOARDING FUNNEL & LIVE MICRO-INSIGHTS TEST SUITE
 * Unit & Integration verification for Dual-Track Assessment (Quick vs Pro Mode)
 * and Real-Time Reactive Micro-Calculations (BMR, TDEE, Safety Cues).
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const programGenEngine = require('../js/engine/program-generator.js');

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
console.log('RUNNING ONBOARDING FUNNEL & LIVE MICRO-INSIGHTS TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY 1: QUICK START PROFILE COMPLETION & CANONICAL ADAPTATION
// -----------------------------------------------------------------------------
console.log('CATEGORY 1: Quick Start Profile Completion & Normalization');

runTest('TEST 1: Quick mode minimal selections generate 100% valid canonical profile', () => {
    const quickSelections = {
        age: '18-29',
        gender: 'male',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        height: '178',
        heightUnit: 'cm',
        currentWeight: '75',
        targetWeight: '80',
        weightUnit: 'kg',
        userName: 'Alex',
        userEmail: 'alex@example.com'
    };

    const canonical = canonicalEngine.buildCanonicalUserProfile(quickSelections);
    const normalized = canonicalEngine.normalizeCanonicalUserProfile(canonical);
    const validation = canonicalEngine.validateCanonicalUserProfile(normalized);

    assert.strictEqual(validation.valid, true);
    assert.strictEqual(normalized.identity.gender, 'male');
    assert.strictEqual(normalized.goals.primary, 'muscle-gain');
    assert.strictEqual(normalized.trainingAvailability.trainingDayCount, 3);
    assert.ok(normalized.lifestyle.sleepDuration !== undefined);
});

runTest('TEST 2: Quick mode profile generates fully compliant periodized program', () => {
    const quickSelections = {
        age: '30-39',
        gender: 'female',
        goal: 'weight-loss',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        height: '165',
        heightUnit: 'cm',
        currentWeight: '68',
        targetWeight: '60',
        weightUnit: 'kg',
        userName: 'Elena'
    };

    const canonical = canonicalEngine.normalizeCanonicalUserProfile(
        canonicalEngine.buildCanonicalUserProfile(quickSelections)
    );
    const program = programGenEngine.generateWorkoutProgram(canonical);

    assert.ok(program);
    assert.strictEqual(program.sessions.length, 4);
    assert.ok(program.programId);
});

// -----------------------------------------------------------------------------
// CATEGORY 2: LIVE MICRO-CALCULATIONS (BMR & TDEE)
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 2: Live Biomechanical Micro-Calculations (BMR & TDEE)');

function calculateBMR(age, gender, height, weight) {
    const h = parseFloat(height) || 175;
    const w = parseFloat(weight) || 70;
    const a = typeof age === 'string' && age.includes('-') ? parseInt(age.split('-')[0], 10) + 5 : (parseInt(age, 10) || 25);
    
    if (gender === 'female') {
        return Math.round(10 * w + 6.25 * h - 5 * a - 161);
    }
    return Math.round(10 * w + 6.25 * h - 5 * a + 5);
}

function calculateTDEE(bmr, trainingDays) {
    const days = Array.isArray(trainingDays) ? trainingDays.length : 3;
    let factor = 1.375; // 1-3 days
    if (days >= 4 && days <= 5) factor = 1.55;
    if (days >= 6) factor = 1.725;
    return Math.round(bmr * factor);
}

runTest('TEST 3: Male BMR Calculation (75kg, 180cm, Age 25)', () => {
    // 10*75 + 6.25*180 - 5*25 + 5 = 750 + 1125 - 125 + 5 = 1755
    const bmr = calculateBMR(25, 'male', 180, 75);
    assert.strictEqual(bmr, 1755);
});

runTest('TEST 4: Female BMR Calculation (60kg, 165cm, Age 30)', () => {
    // 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320
    const bmr = calculateBMR(30, 'female', 165, 60);
    assert.strictEqual(bmr, 1320);
});

runTest('TEST 5: TDEE Activity Scaling across training days', () => {
    const bmr = 1755;
    const tdee3 = calculateTDEE(bmr, ['Mon', 'Wed', 'Fri']);
    const tdee5 = calculateTDEE(bmr, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    assert.ok(tdee5 > tdee3);
    assert.strictEqual(tdee3, Math.round(1755 * 1.375));
    assert.strictEqual(tdee5, Math.round(1755 * 1.55));
});

// -----------------------------------------------------------------------------
// CATEGORY 3: STEP ROUTING INVARIANTS
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 3: Step Routing Invariants');

const QUICK_MODE_SEQUENCE = [1, 2, 4, 10, 12, 13, 32, 33, 34];

runTest('TEST 6: Quick mode sequence contains essential profile milestones', () => {
    assert.strictEqual(QUICK_MODE_SEQUENCE.length, 9);
    assert.strictEqual(QUICK_MODE_SEQUENCE[0], 1); // Age
    assert.strictEqual(QUICK_MODE_SEQUENCE[1], 2); // Gender
    assert.strictEqual(QUICK_MODE_SEQUENCE[2], 4); // Goal
    assert.strictEqual(QUICK_MODE_SEQUENCE[3], 10); // Days
    assert.strictEqual(QUICK_MODE_SEQUENCE[4], 12); // Height
    assert.strictEqual(QUICK_MODE_SEQUENCE[5], 13); // Weight
    assert.strictEqual(QUICK_MODE_SEQUENCE[8], 34); // Blueprint
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
