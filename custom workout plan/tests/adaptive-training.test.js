/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * ADAPTIVE TRAINING INTELLIGENCE TEST SUITE (PHASE 11)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const generatorEngine = require('../js/engine/program-generator.js');
const progressionEngine = require('../js/engine/progression-rules.js');
const analysisEngine = require('../js/engine/performance-analysis.js');
const adaptiveEngine = require('../js/engine/adaptive-training.js');

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

const sampleProfile = canonicalEngine.buildCanonicalUserProfile({
    age: 28,
    gender: 'male',
    goal: 'muscle-gain',
    experience: 'intermediate',
    trainingDays: ['Monday', 'Wednesday', 'Friday']
});
const sampleProgram = generatorEngine.generateWorkoutProgram(sampleProfile);
const sampleEx = sampleProgram.sessions[0].exercises[0];

console.log('================================================================');
console.log('RUNNING ADAPTIVE TRAINING INTELLIGENCE TEST SUITE (PHASE 11)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: DECISION GATING & BASIC DECISIONS (Tests 1–6)
// -----------------------------------------------------------------------------
runTest('TEST 1: PROGRESS decision generated when 3 consistent sessions satisfy criteria', () => {
    const analysis = {
        sessionsAnalyzed: 3,
        completionRatio: 1.0,
        repAttainmentRatio: 1.1,
        performanceSignal: 'STRONG',
        trend: 'IMPROVING',
        confidence: 'HIGH',
        rirDeviation: 0.0
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.PROGRESS);
    assert.strictEqual(dec.confidence, adaptiveEngine.CONFIDENCE_LEVELS.HIGH);
    assert.strictEqual(dec.nextPrescription.adjustment.type, 'LOAD');
});

runTest('TEST 2: MAINTAIN decision generated as default conservative path on target', () => {
    const analysis = {
        sessionsAnalyzed: 2,
        completionRatio: 0.9,
        repAttainmentRatio: 1.0,
        performanceSignal: 'ON_TARGET',
        trend: 'STABLE',
        confidence: 'MEDIUM',
        rirDeviation: 0.0
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.MAINTAIN);
    assert.strictEqual(dec.nextPrescription.adjustment.type, 'NONE');
});

runTest('TEST 3: REGRESS decision generated upon declining trend and underperformance', () => {
    const analysis = {
        sessionsAnalyzed: 3,
        completionRatio: 0.6,
        repAttainmentRatio: 0.7,
        performanceSignal: 'BELOW_TARGET',
        trend: 'DECLINING',
        confidence: 'HIGH',
        rirDeviation: -1.0
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.REGRESS);
    assert.strictEqual(dec.nextPrescription.adjustment.type, 'LOAD');
});

runTest('TEST 4: RECOVER decision generated upon persistent high effort and failure', () => {
    const analysis = {
        sessionsAnalyzed: 3,
        completionRatio: 0.65,
        repAttainmentRatio: 0.8,
        performanceSignal: 'BELOW_TARGET',
        trend: 'DECLINING',
        confidence: 'HIGH',
        averageActualRIR: 0,
        averageActualRPE: 10,
        rirDeviation: -2.0
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.RECOVER);
    assert.ok(dec.rationale.includes('recovery stress') || dec.rationale.includes('Persistent high exertion'));
});

runTest('TEST 5: DEFER decision generated when fewer than 2 valid sessions are analyzed', () => {
    const analysis = {
        sessionsAnalyzed: 1,
        completionRatio: 1.0,
        performanceSignal: 'STRONG',
        trend: 'INSUFFICIENT_DATA',
        confidence: 'LOW'
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.DEFER);
    assert.strictEqual(dec.confidence, adaptiveEngine.CONFIDENCE_LEVELS.LOW);
});

runTest('TEST 6: Zero exposures results in DEFER decision with LOW confidence', () => {
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, {}, null, sampleProfile);
    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.DEFER);
    assert.strictEqual(dec.confidence, adaptiveEngine.CONFIDENCE_LEVELS.LOW);
});

// -----------------------------------------------------------------------------
// CATEGORY B: PROGRESSION MODEL INTEGRATION (Tests 7–12)
// -----------------------------------------------------------------------------
runTest('TEST 7: DOUBLE_PROGRESSION model prescribes load increment and reset description', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.nextPrescription.adjustment.type, 'LOAD');
    assert.strictEqual(dec.nextPrescription.adjustment.category, 'SMALL');
    assert.ok(dec.nextPrescription.adjustment.description.includes('reset reps'));
});

runTest('TEST 8: LOAD_PROGRESSION model prescribes micro/small load increment', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const strat = { model: 'LOAD_PROGRESSION', loadIncrementCategory: 'MICRO' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.nextPrescription.adjustment.type, 'LOAD');
    assert.strictEqual(dec.nextPrescription.adjustment.category, 'MICRO');
});

runTest('TEST 9: REP_PROGRESSION model prescribes REPS adjustment and NONE load category', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const strat = { model: 'REP_PROGRESSION', loadIncrementCategory: 'NONE' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.nextPrescription.adjustment.type, 'REPS');
    assert.strictEqual(dec.nextPrescription.adjustment.category, 'NONE');
});

runTest('TEST 10: RIR_PROGRESSION model prescribes RIR adjustment and targets lower RIR', () => {
    const exPrescription = { ...sampleEx, rir: 3, rpe: 7 };
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const strat = { model: 'RIR_PROGRESSION', loadIncrementCategory: 'NONE' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(exPrescription, strat, analysis, sampleProfile);

    assert.strictEqual(dec.nextPrescription.adjustment.type, 'RIR');
    assert.strictEqual(dec.nextPrescription.rir, 2);
    assert.strictEqual(dec.nextPrescription.rpe, 8);
});

runTest('TEST 11: HOLD_PROGRESSION model prescribes HOLD adjustment and +5s increase', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const strat = { model: 'HOLD_PROGRESSION', loadIncrementCategory: 'NONE' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.nextPrescription.adjustment.type, 'HOLD');
    assert.ok(dec.nextPrescription.adjustment.description.includes('+5s'));
});

runTest('TEST 12: CONSERVATIVE_PROGRESSION model prescribes MICRO load increment', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const strat = { model: 'CONSERVATIVE_PROGRESSION', loadIncrementCategory: 'MICRO' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.nextPrescription.adjustment.type, 'LOAD');
    assert.strictEqual(dec.nextPrescription.adjustment.category, 'MICRO');
});

// -----------------------------------------------------------------------------
// CATEGORY C: SAFETY & RECOVERY PRECEDENCE (Tests 13–17)
// -----------------------------------------------------------------------------
runTest('TEST 13: Safety constraint in profile overrides progression and blocks advancement', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const profileWithSafety = {
        ...sampleProfile,
        safetyConstraints: [{ prohibitedExercises: [sampleEx.exerciseId], reason: 'Shoulder impingement protection' }]
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, profileWithSafety);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.REGRESS);
    assert.ok(dec.safetyFlags.length > 0);
    assert.ok(dec.rationale.includes('Safety restrictions active'));
});

runTest('TEST 14: Recovery concern overrides progression even if high completion was achieved', () => {
    const analysis = {
        sessionsAnalyzed: 3,
        completionRatio: 0.7,
        performanceSignal: 'BELOW_TARGET',
        trend: 'DECLINING',
        averageActualRIR: 0,
        averageActualRPE: 10,
        confidence: 'HIGH'
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.RECOVER);
});

runTest('TEST 15: High effort protection prevents progression when average actual RIR was 0', () => {
    const analysis = {
        sessionsAnalyzed: 3,
        completionRatio: 0.7,
        performanceSignal: 'BELOW_TARGET',
        averageActualRIR: 0,
        confidence: 'HIGH'
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.notStrictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.PROGRESS);
});

runTest('TEST 16: Repeated underperformance triggers conservative REGRESS adjustment', () => {
    const analysis = {
        sessionsAnalyzed: 3,
        completionRatio: 0.5,
        performanceSignal: 'BELOW_TARGET',
        trend: 'DECLINING',
        confidence: 'HIGH'
    };
    const strat = { model: 'DOUBLE_PROGRESSION', loadIncrementCategory: 'SMALL' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, strat, analysis, sampleProfile);

    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.REGRESS);
    assert.strictEqual(dec.nextPrescription.adjustment.category, 'MICRO');
});

runTest('TEST 17: Safety flags are cleanly passed into options and preserved in decision', () => {
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, {}, null, sampleProfile, {
        safetyFlags: ['Active joint inflammation']
    });
    assert.ok(dec.safetyFlags.includes('Active joint inflammation'));
});

// -----------------------------------------------------------------------------
// CATEGORY D: PRESCRIPTION & ADJUSTMENT STRUCTURE (Tests 18–24)
// -----------------------------------------------------------------------------
runTest('TEST 18: Next prescription structure contains valid sets, reps, rir, rpe', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);

    assert.strictEqual(typeof dec.nextPrescription.sets, 'number');
    assert.strictEqual(typeof dec.nextPrescription.reps, 'string');
    assert.strictEqual(typeof dec.nextPrescription.rir, 'number');
    assert.strictEqual(typeof dec.nextPrescription.rpe, 'number');
});

runTest('TEST 19: No-change adjustment object generated for MAINTAIN / DEFER', () => {
    const analysis = { sessionsAnalyzed: 1, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'INSUFFICIENT_DATA', confidence: 'LOW' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, {}, analysis, sampleProfile);

    assert.strictEqual(dec.nextPrescription.adjustment.type, 'NONE');
    assert.strictEqual(dec.nextPrescription.adjustment.category, 'NONE');
});

runTest('TEST 20: Rationale contains concrete explainable evidence', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);

    assert.ok(dec.rationale.includes('3 consistent exposures'));
});

runTest('TEST 21: Confidence matches evidence thresholds (LOW, MEDIUM, HIGH)', () => {
    const decLow = adaptiveEngine.calculateAdaptiveDecision(sampleEx, {}, { sessionsAnalyzed: 1 }, sampleProfile);
    const decMed = adaptiveEngine.calculateAdaptiveDecision(sampleEx, {}, { sessionsAnalyzed: 2 }, sampleProfile);
    const decHigh = adaptiveEngine.calculateAdaptiveDecision(sampleEx, {}, { sessionsAnalyzed: 3 }, sampleProfile);

    assert.strictEqual(decLow.confidence, 'LOW');
    assert.strictEqual(decMed.confidence, 'MEDIUM');
    assert.strictEqual(decHigh.confidence, 'HIGH');
});

runTest('TEST 22: Current prescription remains unmutated', () => {
    const originalPrescription = JSON.stringify(sampleEx);
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);

    assert.strictEqual(JSON.stringify(sampleEx), originalPrescription);
});

runTest('TEST 23: Program object is not mutated by adaptive engine', () => {
    const originalProgram = JSON.stringify(sampleProgram);
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);

    assert.strictEqual(JSON.stringify(sampleProgram), originalProgram);
});

runTest('TEST 24: Analysis object is not mutated by adaptive engine', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const originalAnalysis = JSON.stringify(analysis);
    adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);

    assert.strictEqual(JSON.stringify(analysis), originalAnalysis);
});

// -----------------------------------------------------------------------------
// CATEGORY E: VALIDATION & CONTRACT ADHERENCE (Tests 25–31)
// -----------------------------------------------------------------------------
runTest('TEST 25: validateAdaptiveDecision accepts valid decision object', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);
    const val = adaptiveEngine.validateAdaptiveDecision(dec);

    assert.strictEqual(val.valid, true);
    assert.strictEqual(val.errors.length, 0);
});

runTest('TEST 26: validateAdaptiveDecision rejects invalid decision enum', () => {
    const invalid = { decision: 'SUPER_PROGRESS', confidence: 'HIGH', exerciseId: 'ex1', currentPrescription: {}, nextPrescription: { sets: 3 }, rationale: 'text' };
    const val = adaptiveEngine.validateAdaptiveDecision(invalid);
    assert.strictEqual(val.valid, false);
});

runTest('TEST 27: validateAdaptiveDecision rejects invalid RIR (< 0 or > 5)', () => {
    const invalid = { decision: 'PROGRESS', confidence: 'HIGH', exerciseId: 'ex1', currentPrescription: {}, nextPrescription: { sets: 3, rir: 6 }, rationale: 'text' };
    const val = adaptiveEngine.validateAdaptiveDecision(invalid);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('between 0 and 5')));
});

runTest('TEST 28: validateAdaptiveDecision rejects invalid RPE (< 5 or > 10)', () => {
    const invalid = { decision: 'PROGRESS', confidence: 'HIGH', exerciseId: 'ex1', currentPrescription: {}, nextPrescription: { sets: 3, rpe: 11 }, rationale: 'text' };
    const val = adaptiveEngine.validateAdaptiveDecision(invalid);
    assert.strictEqual(val.valid, false);
});

runTest('TEST 29: validateAdaptiveDecision rejects invalid sets (< 1)', () => {
    const invalid = { decision: 'PROGRESS', confidence: 'HIGH', exerciseId: 'ex1', currentPrescription: {}, nextPrescription: { sets: 0 }, rationale: 'text' };
    const val = adaptiveEngine.validateAdaptiveDecision(invalid);
    assert.strictEqual(val.valid, false);
});

runTest('TEST 30: validateAdaptiveDecision rejects unsupported exact kg assumptions in adjustment', () => {
    const invalid = {
        decision: 'PROGRESS',
        confidence: 'HIGH',
        exerciseId: 'ex1',
        currentPrescription: {},
        nextPrescription: { sets: 3, adjustment: { type: 'LOAD', incrementKg: 2.5 } },
        rationale: 'text'
    };
    const val = adaptiveEngine.validateAdaptiveDecision(invalid);
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('exact kilogram assumption')));
});

runTest('TEST 31: validateAdaptiveDecision rejects empty rationale', () => {
    const invalid = { decision: 'PROGRESS', confidence: 'HIGH', exerciseId: 'ex1', currentPrescription: {}, nextPrescription: { sets: 3 }, rationale: '' };
    const val = adaptiveEngine.validateAdaptiveDecision(invalid);
    assert.strictEqual(val.valid, false);
});

// -----------------------------------------------------------------------------
// CATEGORY F: DETERMINISM & VERSIONING (Tests 32–36)
// -----------------------------------------------------------------------------
runTest('TEST 32: Deterministic snapshot remains identical for identical inputs', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const dec1 = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);
    const dec2 = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);

    assert.strictEqual(adaptiveEngine.getDeterministicAdaptiveSnapshot(dec1), adaptiveEngine.getDeterministicAdaptiveSnapshot(dec2));
});

runTest('TEST 33: 10 repeated passes produce bitwise identical snapshots', () => {
    const analysis = { sessionsAnalyzed: 3, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'HIGH' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);
    const snap1 = adaptiveEngine.getDeterministicAdaptiveSnapshot(dec);

    for (let i = 0; i < 10; i++) {
        assert.strictEqual(adaptiveEngine.getDeterministicAdaptiveSnapshot(dec), snap1);
    }
});

runTest('TEST 34: Single exposure cannot aggressively progress', () => {
    const analysis = { sessionsAnalyzed: 1, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'LOW' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);
    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.DEFER);
});

runTest('TEST 35: Two consistent exposures allow progression with MEDIUM confidence', () => {
    const analysis = { sessionsAnalyzed: 2, completionRatio: 1.0, performanceSignal: 'STRONG', trend: 'IMPROVING', confidence: 'MEDIUM' };
    const dec = adaptiveEngine.calculateAdaptiveDecision(sampleEx, { model: 'DOUBLE_PROGRESSION' }, analysis, sampleProfile);
    assert.strictEqual(dec.decision, adaptiveEngine.ADAPTIVE_DECISIONS.PROGRESS);
    assert.strictEqual(dec.confidence, adaptiveEngine.CONFIDENCE_LEVELS.MEDIUM);
});

runTest('TEST 36: Engine version tag is present and valid', () => {
    assert.strictEqual(adaptiveEngine.ENGINE_VERSION, '1.0');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
