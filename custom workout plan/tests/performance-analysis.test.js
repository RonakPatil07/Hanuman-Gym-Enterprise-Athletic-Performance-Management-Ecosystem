/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PERFORMANCE ANALYSIS TEST SUITE (PHASE 11)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const generatorEngine = require('../js/engine/program-generator.js');
const loggerEngine = require('../js/engine/workout-logger.js');
const analysisEngine = require('../js/engine/performance-analysis.js');

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

// Generate base program for sample logs
const sampleProfile = canonicalEngine.buildCanonicalUserProfile({
    age: 28,
    gender: 'male',
    goal: 'muscle-gain',
    experience: 'intermediate',
    trainingDays: ['Monday', 'Wednesday', 'Friday']
});
const sampleProgram = generatorEngine.generateWorkoutProgram(sampleProfile);
const sampleExId = sampleProgram.sessions[0].exercises[0].exerciseId;

/**
 * Helper to generate synthetic completed logs for testing.
 */
function createSyntheticLog(sessionIdx, setRepsArr, rirVal, status = 'COMPLETED', dateStr = '2026-08-19T10:00:00.000Z') {
    const log = loggerEngine.createWorkoutLog(sampleProgram, sessionIdx);
    log.status = status;
    log.completedAt = dateStr;

    setRepsArr.forEach((reps, idx) => {
        loggerEngine.logSet(log, sampleExId, {
            setNumber: idx + 1,
            actualReps: reps,
            actualLoad: 50,
            loadUnit: 'kg',
            actualRIR: rirVal,
            completed: reps > 0
        });
    });
    return log;
}

console.log('================================================================');
console.log('RUNNING PERFORMANCE ANALYSIS TEST SUITE (PHASE 11)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: LOG INGESTION & FILTERING (Tests 1–5)
// -----------------------------------------------------------------------------
runTest('TEST 1: Valid completed log is ingested and analyzed', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.sessionsAnalyzed, 1);
    assert.strictEqual(analysis.completedSets, 3);
});

runTest('TEST 2: Incomplete workout log is analyzed with factual completed set count', () => {
    const log = createSyntheticLog(0, [10, 8, 0], 2, 'PARTIALLY_COMPLETED');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.sessionsAnalyzed, 1);
    assert.strictEqual(analysis.completedSets, 2);
});

runTest('TEST 3: Abandoned workout logs are ignored during analysis', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2, 'ABANDONED');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.sessionsAnalyzed, 0);
    assert.strictEqual(analysis.performanceSignal, analysisEngine.PERFORMANCE_SIGNALS.INSUFFICIENT_DATA);
});

runTest('TEST 4: Malformed logs are safely ignored without crashing', () => {
    const malformed = [null, undefined, {}, { status: 'COMPLETED' }];
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, malformed);
    assert.strictEqual(analysis.sessionsAnalyzed, 0);
    assert.strictEqual(analysis.performanceSignal, analysisEngine.PERFORMANCE_SIGNALS.INSUFFICIENT_DATA);
});

runTest('TEST 5: Empty log list returns clean INSUFFICIENT_DATA object', () => {
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, []);
    assert.strictEqual(analysis.sessionsAnalyzed, 0);
    assert.strictEqual(analysis.confidence, analysisEngine.CONFIDENCE_LEVELS.LOW);
});

// -----------------------------------------------------------------------------
// CATEGORY B: SET & REP ATTAINMENT (Tests 6–10)
// -----------------------------------------------------------------------------
runTest('TEST 6: Planned set count computed accurately across exposures', () => {
    const log1 = createSyntheticLog(0, [10, 10, 10, 10], 2, 'COMPLETED', '2026-08-15T10:00:00.000Z');
    const log2 = createSyntheticLog(0, [10, 10, 10, 10], 2, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1, log2]);
    assert.strictEqual(analysis.plannedSets, 8);
});

runTest('TEST 7: Completed set count computed accurately across exposures', () => {
    const log1 = createSyntheticLog(0, [10, 10, 10, 10], 2, 'COMPLETED', '2026-08-15T10:00:00.000Z');
    const log2 = createSyntheticLog(0, [10, 10, 10, 0], 2, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1, log2]);
    assert.strictEqual(analysis.completedSets, 7);
});

runTest('TEST 8: Completion ratio computed accurately', () => {
    const log1 = createSyntheticLog(0, [10, 10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1]);
    assert.strictEqual(analysis.completionRatio, 1.0);
});

runTest('TEST 9: Rep attainment ratio calculated relative to target midpoint', () => {
    const log = createSyntheticLog(0, [12, 12, 12], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.ok(analysis.repAttainmentRatio > 1.0);
});

runTest('TEST 10: Rep classifications identify AT_UPPER_BOUND and WITHIN_RANGE', () => {
    const log = createSyntheticLog(0, [12, 10, 8], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.ok(analysis.repClassifications.includes(analysisEngine.REP_CLASSIFICATIONS.AT_UPPER_BOUND));
    assert.ok(analysis.repClassifications.includes(analysisEngine.REP_CLASSIFICATIONS.WITHIN_RANGE));
});

// -----------------------------------------------------------------------------
// CATEGORY C: RIR & RPE ANALYSIS (Tests 11–16)
// -----------------------------------------------------------------------------
runTest('TEST 11: Planned RIR computed accurately', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.averagePlannedRIR, 2);
});

runTest('TEST 12: Actual RIR computed accurately', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 3);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.averageActualRIR, 3);
});

runTest('TEST 13: RIR deviation computed (actual - planned)', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 3);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.rirDeviation, 1.0); // 3 - 2 = +1.0
});

runTest('TEST 14: Planned RPE & Actual RPE computed accurately', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.averagePlannedRPE, 8);
    assert.strictEqual(analysis.averageActualRPE, 8);
});

runTest('TEST 15: RPE deviation computed accurately', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 1); // RPE 9
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.rpeDeviation, 1.0); // 9 - 8 = +1.0
});

runTest('TEST 16: Missing RIR/RPE handled cleanly without throwing', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.logSet(log, sampleExId, { setNumber: 1, actualReps: 10 });
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.ok(analysis);
});

// -----------------------------------------------------------------------------
// CATEGORY D: LOAD & INCONSISTENT DATA (Tests 17–21)
// -----------------------------------------------------------------------------
runTest('TEST 17: Numeric load observations captured in array', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.loadObservations.length, 3);
    assert.strictEqual(analysis.loadObservations[0].load, 50);
});

runTest('TEST 18: Bodyweight exercise load handling preserved without fake kg values', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.logSet(log, sampleExId, { setNumber: 1, actualReps: 15, loadUnit: 'bodyweight' });
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.loadObservations.length, 0); // No numeric load
});

runTest('TEST 19: Inconsistent performance data identified (mix of high and low reps)', () => {
    const log = createSyntheticLog(0, [14, 5, 12], 2); // 14 is ABOVE, 5 is BELOW
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.performanceSignal, analysisEngine.PERFORMANCE_SIGNALS.INCONSISTENT);
});

runTest('TEST 20: Missing fields do not manufacture synthetic values', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.logSet(log, sampleExId, { setNumber: 1, completed: true });
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.averageActualRIR, null);
    assert.strictEqual(analysis.averageActualRPE, null);
});

runTest('TEST 21: Unit preservation in load observations', () => {
    const log = loggerEngine.createWorkoutLog(sampleProgram, 0);
    loggerEngine.logSet(log, sampleExId, { setNumber: 1, actualReps: 10, actualLoad: 135, loadUnit: 'lb' });
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.loadObservations[0].unit, 'lb');
});

// -----------------------------------------------------------------------------
// CATEGORY E: CONFIDENCE & TREND DETECTION (Tests 22–28)
// -----------------------------------------------------------------------------
runTest('TEST 22: One valid exposure yields LOW confidence', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.confidence, analysisEngine.CONFIDENCE_LEVELS.LOW);
});

runTest('TEST 23: Two valid exposures yield MEDIUM confidence', () => {
    const log1 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-15T10:00:00.000Z');
    const log2 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1, log2]);
    assert.strictEqual(analysis.confidence, analysisEngine.CONFIDENCE_LEVELS.MEDIUM);
});

runTest('TEST 24: Three valid exposures yield HIGH confidence', () => {
    const log1 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-13T10:00:00.000Z');
    const log2 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-15T10:00:00.000Z');
    const log3 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1, log2, log3]);
    assert.strictEqual(analysis.confidence, analysisEngine.CONFIDENCE_LEVELS.HIGH);
});

runTest('TEST 25: Improving trend detected across progressive exposures', () => {
    const log1 = createSyntheticLog(0, [8, 8, 8], 2, 'COMPLETED', '2026-08-13T10:00:00.000Z');
    const log2 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-15T10:00:00.000Z');
    const log3 = createSyntheticLog(0, [12, 12, 12], 2, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1, log2, log3]);
    assert.strictEqual(analysis.trend, analysisEngine.TRENDS.IMPROVING);
});

runTest('TEST 26: Stable trend detected for consistent exposures', () => {
    const log1 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-13T10:00:00.000Z');
    const log2 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-15T10:00:00.000Z');
    const log3 = createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1, log2, log3]);
    assert.strictEqual(analysis.trend, analysisEngine.TRENDS.STABLE);
});

runTest('TEST 27: Declining trend detected across deteriorating exposures', () => {
    const log1 = createSyntheticLog(0, [12, 12, 12], 2, 'COMPLETED', '2026-08-13T10:00:00.000Z');
    const log2 = createSyntheticLog(0, [9, 8, 7], 1, 'COMPLETED', '2026-08-15T10:00:00.000Z');
    const log3 = createSyntheticLog(0, [6, 5, 4], 0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log1, log2, log3]);
    assert.strictEqual(analysis.trend, analysisEngine.TRENDS.DECLINING);
});

runTest('TEST 28: Single exposure reports INSUFFICIENT_DATA trend', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(analysis.trend, analysisEngine.TRENDS.INSUFFICIENT_DATA);
});

// -----------------------------------------------------------------------------
// CATEGORY F: SESSION-LEVEL AGGREGATION (Tests 29–31)
// -----------------------------------------------------------------------------
runTest('TEST 29: Session performance aggregates planned vs completed sets', () => {
    const log = createSyntheticLog(0, [10, 10, 10, 10], 2);
    const sessionAnalysis = analysisEngine.analyzeSessionPerformance(sampleProgram.programId, sampleProgram.sessions[0].day, [log]);
    assert.strictEqual(sessionAnalysis.sessionsAnalyzed, 1);
    assert.ok(sessionAnalysis.plannedSets > 0);
});

runTest('TEST 30: Session performance computes overall completion ratio', () => {
    const log = createSyntheticLog(0, [10, 10, 10, 10], 2);
    const sessionAnalysis = analysisEngine.analyzeSessionPerformance(sampleProgram.programId, sampleProgram.sessions[0].day, [log]);
    assert.ok(sessionAnalysis.completionRatio > 0);
});

runTest('TEST 31: Session detects failure recovery signal when RIR is 0', () => {
    const log = createSyntheticLog(0, [10, 10, 10, 10], 0);
    const sessionAnalysis = analysisEngine.analyzeSessionPerformance(sampleProgram.programId, sampleProgram.sessions[0].day, [log]);
    assert.ok(sessionAnalysis.recoverySignals.length > 0);
});

// -----------------------------------------------------------------------------
// CATEGORY G: WINDOWING & IMMUTABILITY (Tests 32–36)
// -----------------------------------------------------------------------------
runTest('TEST 32: Bounded analysis window limits evaluated sessions to default 3', () => {
    const logs = [];
    for (let i = 1; i <= 6; i++) {
        logs.push(createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', `2026-08-${i < 10 ? '0' + i : i}T10:00:00.000Z`));
    }
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, logs);
    assert.strictEqual(analysis.sessionsAnalyzed, 3);
});

runTest('TEST 33: Maximum window parameter capped at 12', () => {
    const logs = [];
    for (let i = 1; i <= 15; i++) {
        logs.push(createSyntheticLog(0, [10, 10, 10], 2, 'COMPLETED', `2026-08-${i < 10 ? '0' + i : i}T10:00:00.000Z`));
    }
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, logs, { windowSize: 20 });
    assert.strictEqual(analysis.sessionsAnalyzed, 12);
});

runTest('TEST 34: Deterministic analysis snapshot generates stable JSON string', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const analysis = analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    const snap1 = analysisEngine.getDeterministicAnalysisSnapshot(analysis);
    const snap2 = analysisEngine.getDeterministicAnalysisSnapshot(analysis);
    assert.strictEqual(snap1, snap2);
});

runTest('TEST 35: Input logs are not mutated during analysis execution', () => {
    const log = createSyntheticLog(0, [10, 10, 10], 2);
    const serializedOriginal = JSON.stringify(log);
    analysisEngine.analyzeExercisePerformance(sampleExId, [log]);
    assert.strictEqual(JSON.stringify(log), serializedOriginal);
});

runTest('TEST 36: Engine version tag is present and valid', () => {
    assert.strictEqual(analysisEngine.ENGINE_VERSION, '1.0');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
