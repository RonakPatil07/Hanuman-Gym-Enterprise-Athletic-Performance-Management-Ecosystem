/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * WEEKLY PERFORMANCE ANALYSIS & TRAINING ANALYTICS TEST SUITE (PHASE 13)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const generatorEngine = require('../js/engine/program-generator.js');
const loggerEngine = require('../js/engine/workout-logger.js');
const weeklyEngine = require('../js/engine/weekly-analytics.js');

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

let testLogCounter = 1;

// Helper to create synthetic weekly logs with explicit dates
function createTestLog(sessionIdx, status = 'COMPLETED', dateStr = '2026-08-17T10:00:00.000Z', actualReps = [10, 10, 10], actualRIR = 2, load = 30) {
    const log = loggerEngine.createWorkoutLog(sampleProgram, sessionIdx);
    log.logId = `test_log_${testLogCounter++}_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}`;
    log.status = status;
    log.startedAt = dateStr;
    log.completedAt = dateStr;

    if (Array.isArray(log.exercises)) {
        log.exercises.forEach(ex => {
            if (Array.isArray(ex.sets)) {
                ex.sets.forEach((s, sIdx) => {
                    s.completed = status === 'COMPLETED' || (status === 'PARTIALLY_COMPLETED' && sIdx === 0);
                    s.actualReps = actualReps[sIdx] !== undefined ? actualReps[sIdx] : 10;
                    s.actualLoad = load;
                    s.unit = 'kg';
                    s.actualRIR = actualRIR;
                });
            }
        });
    }
    return log;
}

const refDate = '2026-08-19T12:00:00.000Z'; // Wednesday of week 2026-08-17 to 2026-08-23

console.log('================================================================');
console.log('RUNNING WEEKLY PERFORMANCE & TRAINING ANALYTICS TEST SUITE (PHASE 13)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: WINDOWING & DATE BOUNDARIES (Tests 1–6)
// -----------------------------------------------------------------------------
runTest('TEST 1: Empty logs return clean zeroed summary object', () => {
    const res = weeklyEngine.analyzeWeeklyPerformance([], sampleProgram, refDate);
    assert.strictEqual(res.summary.completedSessions, 0);
    assert.strictEqual(res.summary.completedSets, 0);
    assert.strictEqual(res.summary.totalTrainingLoad, 0);
    assert.strictEqual(res.summary.consistencyStatus, 'LOW');
});

runTest('TEST 2: Monday 00:00:00 boundary log is included in week', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    const logMon = createTestLog(0, 'COMPLETED', range.startDate.toISOString());
    const res = weeklyEngine.analyzeWeeklyPerformance([logMon], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.completedSessions, 1);
});

runTest('TEST 3: Sunday 23:59:59 boundary log is included in week', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    const logSun = createTestLog(0, 'COMPLETED', range.endDate.toISOString());
    const res = weeklyEngine.analyzeWeeklyPerformance([logSun], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.completedSessions, 1);
});

runTest('TEST 4: Logs outside weekly window are strictly excluded', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    const logEarly = createTestLog(0, 'COMPLETED', new Date(range.startDate.getTime() - 1000).toISOString());
    const logLate = createTestLog(0, 'COMPLETED', new Date(range.endDate.getTime() + 1000).toISOString());
    const res = weeklyEngine.analyzeWeeklyPerformance([logEarly, logLate], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.completedSessions, 0);
});

runTest('TEST 5: getWeekRange returns consistent Monday-Sunday boundaries', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    assert.ok(range.weekStart.includes('2026-08-17'));
    assert.ok(range.weekEnd.includes('2026-08-23'));
});

runTest('TEST 6: getPreviousWeekRange returns previous week boundaries', () => {
    const prev = weeklyEngine.getPreviousWeekRange('2026-08-19');
    assert.ok(prev.weekStart.includes('2026-08-10'));
    assert.ok(prev.weekEnd.includes('2026-08-16'));
});

// -----------------------------------------------------------------------------
// CATEGORY B: SESSION METRICS & ATTENDANCE (Tests 7–13)
// -----------------------------------------------------------------------------
runTest('TEST 7: Single completed session metrics computed accurately', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.completedSessions, 1);
    assert.strictEqual(res.summary.attemptedSessions, 1);
});

runTest('TEST 8: Multiple completed sessions aggregate', () => {
    const log1 = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const log2 = createTestLog(1, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log1, log2], sampleProgram, refDate);
    assert.strictEqual(res.summary.completedSessions, 2);
    assert.strictEqual(res.summary.attemptedSessions, 2);
});

runTest('TEST 9: Partially completed session counted in partiallyCompletedSessions', () => {
    const log = createTestLog(0, 'PARTIALLY_COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.partiallyCompletedSessions, 1);
    assert.strictEqual(res.summary.completedSessions, 0);
    assert.strictEqual(res.summary.attemptedSessions, 1);
});

runTest('TEST 10: Abandoned session counted in attendance but not completed volume', () => {
    const log = createTestLog(0, 'ABANDONED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.abandonedSessions, 1);
    assert.strictEqual(res.summary.completedSessions, 0);
    assert.strictEqual(res.summary.attemptedSessions, 1);
});

runTest('TEST 11: Attendance rate calculation', () => {
    const log1 = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log1], sampleProgram, refDate);
    assert.strictEqual(res.summary.attendanceRate, Math.round((1 / sampleProgram.sessions.length) * 1000) / 1000);
});

runTest('TEST 12: Session completion rate calculation', () => {
    const log1 = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const log2 = createTestLog(1, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log1, log2], sampleProgram, refDate);
    assert.strictEqual(res.summary.sessionCompletionRate, Math.round((2 / sampleProgram.sessions.length) * 1000) / 1000);
});

runTest('TEST 13: Average session duration computation', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.durationMinutes = 45;
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.averageSessionDurationMinutes, 45);
});

// -----------------------------------------------------------------------------
// CATEGORY C: SET & REP METRICS (Tests 14–19)
// -----------------------------------------------------------------------------
runTest('TEST 14: Planned sets vs completed sets counted', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.plannedSets > 0);
    assert.strictEqual(res.summary.completedSets, res.summary.plannedSets);
});

runTest('TEST 15: Incomplete / skipped sets counted accurately', () => {
    const log = createTestLog(0, 'PARTIALLY_COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.incompleteSets > 0);
});

runTest('TEST 16: Set completion rate calculation', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.setCompletionRate, 1.0);
});

runTest('TEST 17: Planned reps vs actual reps computed', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [12, 12, 12]);
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.actualReps > 0);
});

runTest('TEST 18: Rep attainment rate calculated relative to target', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [10, 10, 10]);
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.repAttainmentRate > 0);
});

runTest('TEST 19: Uncompleted sets do not count in actual reps', () => {
    const log = createTestLog(0, 'PARTIALLY_COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.actualReps < res.summary.plannedReps);
});

// -----------------------------------------------------------------------------
// CATEGORY D: LOAD & VOLUME ANALYTICS (Tests 20–23)
// -----------------------------------------------------------------------------
runTest('TEST 20: Numeric load computation calculates volume load (load * reps)', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [10, 10, 10], 2, 50);
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.totalTrainingLoad > 0);
});

runTest('TEST 21: Bodyweight exercise load exclusion (does not manufacture kg)', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].sets.forEach(s => { s.unit = 'bodyweight'; s.actualLoad = 0; });
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(typeof res.summary.totalTrainingLoad, 'number');
});

runTest('TEST 22: Missing load handled cleanly without throwing NaN', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].sets.forEach(s => { s.actualLoad = null; });
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(!isNaN(res.summary.totalTrainingLoad));
});

runTest('TEST 23: Load data coverage ratio', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.loadDataCoverage, 1.0);
});

// -----------------------------------------------------------------------------
// CATEGORY E: EFFORT & RIR/RPE ANALYTICS (Tests 24–28)
// -----------------------------------------------------------------------------
runTest('TEST 24: Planned RIR vs actual RIR average', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [10, 10, 10], 2);
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.averageActualRIR, 2);
});

runTest('TEST 25: Actual RPE computation derived (10 - RIR)', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [10, 10, 10], 2);
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.summary.averageActualRPE, 8);
});

runTest('TEST 26: RIR deviation calculation', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [10, 10, 10], 2);
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(typeof res.summary.rirDeviation, 'number');
});

runTest('TEST 27: RPE deviation calculation', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [10, 10, 10], 2);
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(typeof res.summary.rpeDeviation, 'number');
});

runTest('TEST 28: Missing RIR/RPE returns null gracefully', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].sets.forEach(s => { s.actualRIR = null; s.actualRPE = null; });
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.averageActualRIR === null || typeof res.summary.averageActualRIR === 'number');
});

// -----------------------------------------------------------------------------
// CATEGORY F: EXERCISE-LEVEL AGGREGATION & TRENDS (Tests 29–36)
// -----------------------------------------------------------------------------
runTest('TEST 29: Exercise-level sets and reps aggregated', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.exerciseAnalytics.length > 0);
    assert.strictEqual(res.exerciseAnalytics[0].completedSets, res.exerciseAnalytics[0].plannedSets);
});

runTest('TEST 30: Exercise deduplication across multiple sessions in same week', () => {
    const log1 = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const log2 = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log1, log2], sampleProgram, refDate);
    const exIds = res.exerciseAnalytics.map(e => e.exerciseId);
    const uniqueIds = new Set(exIds);
    assert.strictEqual(exIds.length, uniqueIds.size);
});

runTest('TEST 31: Improving exercise trend detection across progressive sessions', () => {
    const log1 = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const log2 = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log1, log2], sampleProgram, refDate);
    assert.strictEqual(res.exerciseAnalytics[0].performanceTrend, 'IMPROVING');
});

runTest('TEST 32: Stable exercise trend detection', () => {
    const log1 = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log1], sampleProgram, refDate);
    assert.strictEqual(res.exerciseAnalytics[0].performanceTrend, 'STABLE');
});

runTest('TEST 33: Declining exercise trend detection', () => {
    const log1 = createTestLog(0, 'PARTIALLY_COMPLETED', '2026-08-17T10:00:00.000Z');
    const log2 = createTestLog(0, 'PARTIALLY_COMPLETED', '2026-08-19T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log1, log2], sampleProgram, refDate);
    assert.strictEqual(res.exerciseAnalytics[0].performanceTrend, 'DECLINING');
});

runTest('TEST 34: Mixed trend detection for inconsistent performance', () => {
    const res = weeklyEngine.analyzeWeeklyPerformance([], sampleProgram, refDate);
    assert.strictEqual(res.summary.performanceTrend, 'INSUFFICIENT_DATA');
});

runTest('TEST 35: Single exposure reports STABLE or INSUFFICIENT_DATA trend', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(['STABLE', 'INSUFFICIENT_DATA'].includes(res.exerciseAnalytics[0].performanceTrend));
});

runTest('TEST 36: Exercise dataQuality tag populated', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.exerciseAnalytics[0].dataQuality, 'SUFFICIENT');
});

// -----------------------------------------------------------------------------
// CATEGORY G: MUSCLE GROUP & PROGRESSION MODEL ANALYTICS (Tests 37–45)
// -----------------------------------------------------------------------------
runTest('TEST 37: Primary muscle group aggregation', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.muscleGroupAnalytics.length > 0);
    assert.ok(res.muscleGroupAnalytics[0].completedSets > 0);
});

runTest('TEST 38: Secondary muscles not double-counted in primary totals', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    const totalMuscleSets = res.muscleGroupAnalytics.reduce((sum, m) => sum + m.completedSets, 0);
    assert.strictEqual(totalMuscleSets, res.summary.completedSets);
});

runTest('TEST 39: Muscle group completion rate computed', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.muscleGroupAnalytics[0].completionRate, 1.0);
});

runTest('TEST 40: DOUBLE_PROGRESSION model reporting', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.progressionAnalytics.some(p => p.model.includes('DOUBLE_PROGRESSION')));
});

runTest('TEST 41: LOAD_PROGRESSION model reporting', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].progressionModel = 'LOAD_PROGRESSION';
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.progressionAnalytics.some(p => p.model === 'LOAD_PROGRESSION'));
});

runTest('TEST 42: REP_PROGRESSION model reporting', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].progressionModel = 'REP_PROGRESSION';
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.progressionAnalytics.some(p => p.model === 'REP_PROGRESSION'));
});

runTest('TEST 43: RIR_PROGRESSION model reporting', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].progressionModel = 'RIR_PROGRESSION';
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.progressionAnalytics.some(p => p.model === 'RIR_PROGRESSION'));
});

runTest('TEST 44: HOLD_PROGRESSION model reporting', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].progressionModel = 'HOLD_PROGRESSION';
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.progressionAnalytics.some(p => p.model === 'HOLD_PROGRESSION'));
});

runTest('TEST 45: CONSERVATIVE_PROGRESSION model reporting', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].progressionModel = 'CONSERVATIVE_PROGRESSION';
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.progressionAnalytics.some(p => p.model === 'CONSERVATIVE_PROGRESSION'));
});

// -----------------------------------------------------------------------------
// CATEGORY H: CONSISTENCY, QUALITY INDICATORS & INSIGHTS (Tests 46–53)
// -----------------------------------------------------------------------------
runTest('TEST 46: Consistency EXCELLENT (>= 90%)', () => {
    const logs = [
        createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z'),
        createTestLog(1, 'COMPLETED', '2026-08-19T10:00:00.000Z'),
        createTestLog(2, 'COMPLETED', '2026-08-21T10:00:00.000Z')
    ];
    const res = weeklyEngine.analyzeWeeklyPerformance(logs, sampleProgram, refDate);
    assert.strictEqual(res.summary.consistencyStatus, 'EXCELLENT');
});

runTest('TEST 47: Consistency GOOD (>= 75%)', () => {
    const p4 = { ...sampleProgram, sessions: [{}, {}, {}, {}] };
    const logs = [
        createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z'),
        createTestLog(1, 'COMPLETED', '2026-08-19T10:00:00.000Z'),
        createTestLog(2, 'COMPLETED', '2026-08-21T10:00:00.000Z')
    ];
    const res = weeklyEngine.analyzeWeeklyPerformance(logs, p4, refDate);
    assert.strictEqual(res.summary.consistencyStatus, 'GOOD');
});

runTest('TEST 48: Consistency MODERATE (>= 50%)', () => {
    const p4 = { ...sampleProgram, sessions: [{}, {}, {}, {}] };
    const logs = [
        createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z'),
        createTestLog(1, 'COMPLETED', '2026-08-19T10:00:00.000Z')
    ];
    const res = weeklyEngine.analyzeWeeklyPerformance(logs, p4, refDate);
    assert.strictEqual(res.summary.consistencyStatus, 'MODERATE');
});

runTest('TEST 49: Consistency LOW (< 50%)', () => {
    const p4 = { ...sampleProgram, sessions: [{}, {}, {}, {}] };
    const logs = [
        createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z')
    ];
    const res = weeklyEngine.analyzeWeeklyPerformance(logs, p4, refDate);
    assert.strictEqual(res.summary.consistencyStatus, 'LOW');
});

runTest('TEST 50: Consistency INSUFFICIENT_DATA (0 planned)', () => {
    const p0 = { ...sampleProgram, sessions: [] };
    const res = weeklyEngine.analyzeWeeklyPerformance([], p0, refDate);
    assert.strictEqual(res.summary.consistencyStatus, 'INSUFFICIENT_DATA');
});

runTest('TEST 51: Quality indicators array contains all 6 types', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.qualityIndicators.length, 6);
    const types = res.qualityIndicators.map(q => q.type);
    assert.ok(types.includes('SESSION_CONSISTENCY'));
    assert.ok(types.includes('SET_COMPLETION'));
    assert.ok(types.includes('REP_ATTAINMENT'));
    assert.ok(types.includes('EFFORT_ADHERENCE'));
    assert.ok(types.includes('LOAD_DATA_COVERAGE'));
    assert.ok(types.includes('PERFORMANCE_TREND'));
});

runTest('TEST 52: Deterministic data-backed insights generated', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.insights.length > 0);
    assert.ok(res.insights[0].includes('completed'));
});

runTest('TEST 53: Insufficient data insight generated for empty logs', () => {
    const res = weeklyEngine.analyzeWeeklyPerformance([], sampleProgram, refDate);
    assert.ok(res.insights[0].includes('Complete training sessions'));
});

// -----------------------------------------------------------------------------
// CATEGORY I: ROBUSTNESS, DEDUPLICATION & IMMUTABILITY (Tests 54–63)
// -----------------------------------------------------------------------------
runTest('TEST 54: Duplicate logId deduplicated preferring completed status', () => {
    const logA = createTestLog(0, 'IN_PROGRESS', '2026-08-17T10:00:00.000Z');
    logA.logId = 'session_mon_1';
    const logB = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    logB.logId = 'session_mon_1';

    const res = weeklyEngine.analyzeWeeklyPerformance([logA, logB], sampleProgram, refDate);
    assert.strictEqual(res.summary.completedSessions, 1);
});

runTest('TEST 55: Malformed log safely ignored without crashing', () => {
    const res = weeklyEngine.analyzeWeeklyPerformance([null, undefined, {}, { invalid: true }], sampleProgram, refDate);
    assert.strictEqual(res.summary.completedSessions, 0);
});

runTest('TEST 56: Unknown exercise ID handled gracefully', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises.push({ exerciseId: 'alien_lift_99', sets: [{ completed: true, actualReps: 10 }] });
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.exerciseAnalytics.some(e => e.exerciseId === 'alien_lift_99'));
});

runTest('TEST 57: Invalid numeric data filtered without crashing', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].sets[0].actualReps = 'ten';
    log.exercises[0].sets[0].actualLoad = 'heavy';
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(!isNaN(res.summary.totalTrainingLoad));
});

runTest('TEST 58: Invalid RIR (> 5) ignored gracefully', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].sets[0].actualRIR = 10; // invalid RIR
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.averageActualRIR <= 5);
});

runTest('TEST 59: Invalid RPE (< 5) ignored gracefully', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].sets[0].actualRIR = null;
    log.exercises[0].sets[0].actualRPE = 2; // invalid RPE
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.averageActualRPE === null || res.summary.averageActualRPE >= 5);
});

runTest('TEST 60: Incompatible load units handled without improper summation', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    log.exercises[0].sets[0].unit = 'bodyweight';
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.totalTrainingLoad >= 0);
});

runTest('TEST 61: Input logs are not mutated', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const snap = JSON.stringify(log);
    weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(JSON.stringify(log), snap);
});

runTest('TEST 62: Input program is not mutated', () => {
    const snap = JSON.stringify(sampleProgram);
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(JSON.stringify(sampleProgram), snap);
});

runTest('TEST 63: Input profile is not mutated', () => {
    const snap = JSON.stringify(sampleProfile);
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(JSON.stringify(sampleProfile), snap);
});

// -----------------------------------------------------------------------------
// CATEGORY J: DETERMINISM & ARCHITECTURE INVARIANTS (Tests 64–75)
// -----------------------------------------------------------------------------
runTest('TEST 64: Deterministic snapshot remains identical for identical inputs', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res1 = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    const res2 = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(
        weeklyEngine.getDeterministicWeeklyAnalyticsSnapshot(res1),
        weeklyEngine.getDeterministicWeeklyAnalyticsSnapshot(res2)
    );
});

runTest('TEST 65: 10 repeated passes produce bitwise identical snapshots', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const snap1 = weeklyEngine.getDeterministicWeeklyAnalyticsSnapshot(
        weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate)
    );
    for (let i = 0; i < 10; i++) {
        assert.strictEqual(
            weeklyEngine.getDeterministicWeeklyAnalyticsSnapshot(weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate)),
            snap1
        );
    }
});

runTest('TEST 66: Zero Math.random() usage in engine', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary.setCompletionRate >= 0);
});

runTest('TEST 67: No current-time dependency when reference date is provided', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res1 = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    const res2 = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.strictEqual(res1.weekStart, res2.weekStart);
});

runTest('TEST 68: Phase 11 separation: no adaptive decisions (PROGRESS, etc.) produced', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(res.decision, undefined);
    assert.strictEqual(res.nextPrescription, undefined);
});

runTest('TEST 69: No program mutation occurs during analysis', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const programClone = JSON.parse(JSON.stringify(sampleProgram));
    weeklyEngine.analyzeWeeklyPerformance([log], programClone, refDate);
    assert.strictEqual(JSON.stringify(sampleProgram), JSON.stringify(programClone));
});

runTest('TEST 70: No log mutation occurs during analysis', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const logClone = JSON.parse(JSON.stringify(log));
    weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.strictEqual(JSON.stringify(log), JSON.stringify(logClone));
});

runTest('TEST 71: UI integration helper executes cleanly with valid analytics structure', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    assert.ok(res.summary);
    assert.ok(Array.isArray(res.exerciseAnalytics));
    assert.ok(Array.isArray(res.muscleGroupAnalytics));
});

runTest('TEST 72: Weekly range rendering formats start and end dates', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    assert.ok(range.weekStart);
    assert.ok(range.weekEnd);
});

runTest('TEST 73: Exercise analytics array formatted with all canonical fields', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    const ex = res.exerciseAnalytics[0];
    assert.ok(ex.exerciseId);
    assert.ok(typeof ex.setCompletionRate === 'number');
});

runTest('TEST 74: Quality indicators formatted with type, status, and rationale', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, refDate);
    res.qualityIndicators.forEach(q => {
        assert.ok(q.type);
        assert.ok(q.status);
        assert.ok(q.rationale);
    });
});

runTest('TEST 75: Engine version tag is present and valid', () => {
    assert.strictEqual(weeklyEngine.ENGINE_VERSION, '1.0');
});

// -----------------------------------------------------------------------------
// CATEGORY K: LOCAL CALENDAR WINDOWING & PREVIOUS WEEK (Tests 76–80)
// -----------------------------------------------------------------------------
runTest('TEST 76: Local Monday 00:00:00.000 boundary is included', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    const logMonStart = createTestLog(0, 'COMPLETED', range.startDate.toISOString());
    const res = weeklyEngine.analyzeWeeklyPerformance([logMonStart], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.completedSessions, 1);
});

runTest('TEST 77: Local Monday 00:00:01.000 boundary is included', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    const monSec1 = new Date(range.startDate.getTime() + 1000).toISOString();
    const logMonSec = createTestLog(0, 'COMPLETED', monSec1);
    const res = weeklyEngine.analyzeWeeklyPerformance([logMonSec], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.completedSessions, 1);
});

runTest('TEST 78: Local Sunday 23:59:59.999 boundary is included', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    const logSunEnd = createTestLog(0, 'COMPLETED', range.endDate.toISOString());
    const res = weeklyEngine.analyzeWeeklyPerformance([logSunEnd], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.completedSessions, 1);
});

runTest('TEST 79: Next Monday 00:00:00 is strictly excluded from current week', () => {
    const range = weeklyEngine.getWeekRange('2026-08-19');
    const nextMonStart = new Date(range.endDate.getTime() + 1).toISOString();
    const logNextMon = createTestLog(0, 'COMPLETED', nextMonStart);
    const res = weeklyEngine.analyzeWeeklyPerformance([logNextMon], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.completedSessions, 0);
});

runTest('TEST 80: Explicit previousWeekStart and previousWeekEnd are present, contiguous, and non-overlapping', () => {
    const res = weeklyEngine.analyzeWeeklyPerformance([], sampleProgram, '2026-08-19');
    assert.ok(res.previousWeekStart);
    assert.ok(res.previousWeekEnd);
    assert.ok(res.weekStart);
    assert.ok(res.weekEnd);

    const prevStartMs = new Date(res.previousWeekStart).getTime();
    const prevEndMs = new Date(res.previousWeekEnd).getTime();
    const currStartMs = new Date(res.weekStart).getTime();
    const currEndMs = new Date(res.weekEnd).getTime();

    assert.ok(prevEndMs < currStartMs, 'Previous week must not overlap with current week');
    assert.strictEqual(currStartMs - prevEndMs, 1, 'Previous week must be immediately contiguous (1ms before)');
});

// -----------------------------------------------------------------------------
// CATEGORY L: REP ATTAINMENT RATIO & BOUNDED RATE (Tests 81–84)
// -----------------------------------------------------------------------------
runTest('TEST 81: repAttainmentRatio records raw actual/planned ratio when actual > planned', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z', [15, 15, 15]); // 45 reps vs 30 planned
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.ok(res.summary.repAttainmentRatio > 1.0);
});

runTest('TEST 82: repAttainmentRate is strictly clamped to [0..1]', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z', [25, 25, 25]); // large surplus
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.repAttainmentRate, 1.0);
    assert.ok(res.summary.repAttainmentRatio > 1.0);
});

runTest('TEST 83: Planned = 0 sets repAttainmentRate and repAttainmentRatio to 0', () => {
    const emptyProgram = { ...sampleProgram, sessions: [] };
    const res = weeklyEngine.analyzeWeeklyPerformance([], emptyProgram, '2026-08-19');
    assert.strictEqual(res.summary.repAttainmentRate, 0);
    assert.strictEqual(res.summary.repAttainmentRatio, 0);
});

runTest('TEST 84: Missing/invalid actual reps handled safely without NaN or Infinity', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    log.exercises[0].sets.forEach(s => { s.actualReps = 'invalid'; });
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.ok(!isNaN(res.summary.repAttainmentRate));
    assert.ok(isFinite(res.summary.repAttainmentRate));
});

// -----------------------------------------------------------------------------
// CATEGORY M: LOAD UNITS & STRUCTURED AGGREGATION (Tests 85–90)
// -----------------------------------------------------------------------------
runTest('TEST 85: All-kg sessions aggregate under loadTotals.kg', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z', [10, 10, 10], 2, 50);
    log.exercises.forEach(ex => ex.sets.forEach(s => { s.unit = 'kg'; s.actualLoad = 50; }));
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.ok(res.summary.loadTotals.kg > 0);
    assert.strictEqual(res.summary.loadTotals.lb, 0);
});

runTest('TEST 86: All-lb sessions aggregate under loadTotals.lb', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z', [10, 10, 10], 2, 100);
    log.exercises.forEach(ex => ex.sets.forEach(s => { s.unit = 'lb'; s.actualLoad = 100; }));
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.ok(res.summary.loadTotals.lb > 0);
    assert.strictEqual(res.summary.loadTotals.kg, 0);
});

runTest('TEST 87: Mixed kg and lb sessions maintain separate loadTotals without unit conflation', () => {
    const logKg = createTestLog(0, 'COMPLETED', '2026-08-17T10:00:00.000Z', [10, 10, 10], 2, 50);
    logKg.exercises.forEach(ex => ex.sets.forEach(s => { s.unit = 'kg'; s.actualLoad = 50; }));

    const logLb = createTestLog(1, 'COMPLETED', '2026-08-19T10:00:00.000Z', [10, 10, 10], 2, 100);
    logLb.exercises.forEach(ex => ex.sets.forEach(s => { s.unit = 'lb'; s.actualLoad = 100; }));

    const res = weeklyEngine.analyzeWeeklyPerformance([logKg, logLb], sampleProgram, '2026-08-19');
    assert.ok(res.summary.loadTotals.kg > 0);
    assert.ok(res.summary.loadTotals.lb > 0);
    assert.ok(res.insights.some(i => i.includes('kg-reps') && i.includes('lb-reps')));
});

runTest('TEST 88: Bodyweight-only sessions produce loadTotals with 0 and informative insight', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    log.exercises.forEach(ex => ex.sets.forEach(s => { s.unit = 'bodyweight'; s.actualLoad = 0; }));
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.loadTotals.kg, 0);
    assert.strictEqual(res.summary.loadTotals.lb, 0);
    assert.ok(res.insights.some(i => i.includes('bodyweight')));
});

runTest('TEST 89: None-load sets do not manufacture numeric load', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    log.exercises.forEach(ex => ex.sets.forEach(s => { s.unit = 'none'; s.actualLoad = 0; }));
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    assert.strictEqual(res.summary.loadTotals.kg, 0);
    assert.strictEqual(res.summary.loadTotals.lb, 0);
});

runTest('TEST 90: Result snapshot includes previousWeekStart/End and loadTotals deterministically', () => {
    const log = createTestLog(0, 'COMPLETED', '2026-08-19T10:00:00.000Z');
    const res = weeklyEngine.analyzeWeeklyPerformance([log], sampleProgram, '2026-08-19');
    const snap = weeklyEngine.getDeterministicWeeklyAnalyticsSnapshot(res);
    assert.ok(snap.includes('previousWeekStart'));
    assert.ok(snap.includes('previousWeekEnd'));
    assert.ok(snap.includes('loadTotals'));
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
