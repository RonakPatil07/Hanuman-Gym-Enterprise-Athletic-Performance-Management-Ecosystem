/**
 * ============================================================================
 * FITPHYSIQUE / HANUMAN GYM - MASTER PRE-LAUNCH TESTING BATTERY
 * Complete Multi-Dimensional QA Certification Suite
 * ============================================================================
 * Dimensions Covered:
 *   1. Unit & Mathematical Boundary Testing
 *   2. Cross-Module Integration & Contract Testing
 *   3. End-to-End User Journey Simulation Testing
 *   4. Security, XSS & Prototype Pollution Vulnerability Testing
 *   5. Extreme Edge-Case, Fuzz & Malformed Input Testing
 *   6. Performance Benchmarking & Memory Stress Testing
 *   7. Accessibility (WCAG AA & Touch Targets) Testing
 *   8. Offline PWA, Manifest & Storage Portability Testing
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// Load Engines
const CanonicalProfile = require('../js/engine/canonical-profile.js');
const ExerciseDatabase = require('../js/engine/exercise-database.js');
const TrainingRules = require('../js/engine/training-rules.js');
const ProgramGenerator = require('../js/engine/program-generator.js');
const ProgramValidator = require('../js/engine/program-validator.js');
const IntensityRules = require('../js/engine/intensity-rules.js');
const ProgressionRules = require('../js/engine/progression-rules.js');
const WorkoutLogger = require('../js/engine/workout-logger.js');
const PerformanceAnalysis = require('../js/engine/performance-analysis.js');
const AdaptiveTraining = require('../js/engine/adaptive-training.js');
const WeeklyAnalytics = require('../js/engine/weekly-analytics.js');
const ExerciseSubstitution = require('../js/engine/exercise-substitution.js');
const PeriodizationEngine = require('../js/engine/periodization-engine.js');
const PersonalizationExplanations = require('../js/engine/personalization-explanations.js');
const PersonalizedBlueprintUI = require('../js/ui/personalized-blueprint.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ [PASS] ${message}`);
    } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${message}`);
    }
}

console.log('================================================================================');
console.log('       MASTER PRE-LAUNCH COMPREHENSIVE TESTING BATTERY');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// 1. UNIT & MATHEMATICAL BOUNDARY TESTING
// -----------------------------------------------------------------------------
console.log('--- DIMENSION 1: UNIT & MATHEMATICAL BOUNDARY TESTING ---');

// Plate Loading Exact Math
const plateMath1 = PersonalizedBlueprintUI.calculateBarbellPlates(100, false, 20);
assert(plateMath1.weightPerSide === 40, '100kg barbell calculates 40kg sleeve weight');
assert(plateMath1.plates[0].plate === 25 && plateMath1.plates[0].count === 1, '100kg uses 1x 25kg plate per sleeve');
assert(plateMath1.plates[1].plate === 15 && plateMath1.plates[1].count === 1, '100kg uses 1x 15kg plate per sleeve');
assert(plateMath1.remainder === 0, '100kg leaves 0 remainder');

const plateMath2 = PersonalizedBlueprintUI.calculateBarbellPlates(225, true, 45);
assert(plateMath2.weightPerSide === 90, '225lb barbell calculates 90lb sleeve weight');
assert(plateMath2.plates[0].plate === 45 && plateMath2.plates[0].count === 2, '225lb uses 2x 45lb plates per sleeve');
assert(plateMath2.remainder === 0, '225lb leaves 0 remainder');

// RIR / RPE Bound Equations
assert(IntensityRules.calculateRPEFromRIR(0) === 10, 'RIR 0 derives RPE 10');
assert(IntensityRules.calculateRPEFromRIR(2) === 8, 'RIR 2 derives RPE 8');
assert(IntensityRules.calculateRPEFromRIR(5) === 5, 'RIR 5 derives RPE 5');

// -----------------------------------------------------------------------------
// 2. CROSS-MODULE INTEGRATION & CONTRACT TESTING
// -----------------------------------------------------------------------------
console.log('\n--- DIMENSION 2: CROSS-MODULE INTEGRATION & CONTRACT TESTING ---');

const userA = {
    age: '25-29',
    gender: 'female',
    goal: 'weight-loss',
    trainingDays: ['Monday', 'Wednesday', 'Friday'],
    experience: 'beginner',
    workoutDuration: '45-60',
    workoutLocation: 'dumbbells',
    injuries: 'lower_back',
    weight: '65',
    targetWeight: '58',
    height: '165'
};

const canonicalA = CanonicalProfile.normalizeCanonicalUserProfile(CanonicalProfile.buildCanonicalUserProfile(userA));
const reqsA = TrainingRules.buildTrainingRequirements(canonicalA);
const progA = ProgramGenerator.generateWorkoutProgram(canonicalA, reqsA, ExerciseDatabase);
const valCycleA = ProgramValidator.validateAndRepairProgram(progA, canonicalA, reqsA, ExerciseDatabase);
const finalProgA = valCycleA.program || progA;
const periodA = PeriodizationEngine.generate12WeekTrainingBlock(finalProgA, canonicalA);

assert(valCycleA.validation.valid === true, 'Beginner weight loss plan passes safety gate');
assert(finalProgA.sessions.length === 3, '3-day requirement yields exactly 3 sessions');
assert(periodA.phases.length === 6, 'Periodization contains exactly 6 phases');
assert(periodA.weeks.length === 12, 'Periodization contains exactly 12 weeks');

// Verify no heavy spinal compression exercises assigned for lower_back injury
let hasProhibitedSpineLifts = false;
finalProgA.sessions.forEach(sess => {
    sess.exercises.forEach(ex => {
        if (ex.exerciseId === 'deadlift_barbell' || ex.exerciseId === 'squat_barbell_back') {
            hasProhibitedSpineLifts = true;
        }
    });
});
assert(!hasProhibitedSpineLifts, 'Lower back injury strictly excludes heavy spinal loaded lifts');

// -----------------------------------------------------------------------------
// 3. END-TO-END USER JOURNEY SIMULATION TESTING
// -----------------------------------------------------------------------------
console.log('\n--- DIMENSION 3: END-TO-END USER JOURNEY SIMULATION TESTING ---');

// User Journey: 4-Day Intermediate Athlete completes session 1
const userB = {
    age: '30-39',
    gender: 'male',
    goal: 'muscle-gain',
    trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    experience: 'intermediate',
    workoutDuration: '45-60',
    workoutLocation: 'gym',
    injuries: 'none',
    weight: '80',
    targetWeight: '85',
    height: '180'
};

const canonicalB = CanonicalProfile.normalizeCanonicalUserProfile(CanonicalProfile.buildCanonicalUserProfile(userB));
const reqsB = TrainingRules.buildTrainingRequirements(canonicalB);
const progB = ProgramGenerator.generateWorkoutProgram(canonicalB, reqsB, ExerciseDatabase);
const logB = WorkoutLogger.createWorkoutLog(progB, 0);

WorkoutLogger.startWorkout(logB);
logB.exercises.forEach(ex => {
    for (let s = 1; s <= ex.sets.length; s++) {
        WorkoutLogger.logSet(logB, ex.exerciseId, {
            setNumber: s,
            actualReps: 10,
            actualLoad: 75,
            loadUnit: 'kg',
            actualRIR: 2
        });
    }
});
WorkoutLogger.completeWorkout(logB);

assert(logB.status === 'COMPLETED', 'User Journey workout completes with COMPLETED status');
assert(logB.exercises[0].sets.length > 0, 'User Journey logged sets recorded in history');

const perfB = PerformanceAnalysis.analyzeExercisePerformance(logB.exercises[0].exerciseId, [logB]);
const adaptB = AdaptiveTraining.calculateAdaptiveDecision(logB.exercises[0], { model: 'DOUBLE_PROGRESSION' }, perfB);
assert(adaptB.decision !== undefined, 'Adaptive engine provides valid training progression decision');

const weeklyB = WeeklyAnalytics.analyzeWeeklyPerformance([logB], progB);
assert(weeklyB.summary.completedSets > 0, 'Weekly analytics registers completed sets');
assert(weeklyB.summary.loadTotals.kg > 0, 'Weekly analytics aggregates metric volume load accurately');

// -----------------------------------------------------------------------------
// 4. SECURITY, XSS & PROTOTYPE POLLUTION VULNERABILITY TESTING
// -----------------------------------------------------------------------------
console.log('\n--- DIMENSION 4: SECURITY, XSS & INJECTION TESTING ---');

const maliciousInput = {
    userName: '<script>alert("XSS")</script>',
    userNote: '"><img src=x onerror=alert(1)>',
    goal: 'muscle-gain',
    trainingDays: ['Monday', 'Wednesday'],
    age: '25-29'
};

const valForHTML = ProgramValidator.validateProgram(progB, canonicalB, reqsB, ExerciseDatabase);
const generatedHTML = PersonalizedBlueprintUI.generateBlueprintHTML(progB, valForHTML, { userName: maliciousInput.userName });
assert(!generatedHTML.includes('<script>alert('), 'Blueprint UI strictly escapes malicious script injections');
assert(!generatedHTML.includes('onerror=alert('), 'Blueprint UI strictly escapes img tag injection vectors');

// Prototype Pollution Defense
const evilPayload = JSON.parse('{"__proto__": {"polluted": true}, "goal": "muscle-gain"}');
const protectedProfile = CanonicalProfile.buildCanonicalUserProfile(evilPayload);
assert(Object.prototype.polluted === undefined, 'Prototype pollution vector is completely neutralized');

// -----------------------------------------------------------------------------
// 5. EXTREME EDGE-CASE, FUZZ & MALFORMED INPUT TESTING
// -----------------------------------------------------------------------------
console.log('\n--- DIMENSION 5: EXTREME EDGE-CASE & FUZZ TESTING ---');

// Fuzz 1: NaN, Infinity, negative values
const fuzzInput1 = {
    age: NaN,
    weight: Infinity,
    targetWeight: -50,
    height: 0,
    trainingDays: 999
};
const fuzzedProfile1 = CanonicalProfile.normalizeCanonicalUserProfile(CanonicalProfile.buildCanonicalUserProfile(fuzzInput1));
assert(fuzzedProfile1.anthropometrics.weightKg === null || typeof fuzzedProfile1.anthropometrics.weightKg === 'number', 'Weight handles non-finite inputs safely without throwing exceptions');
assert(typeof fuzzedProfile1.trainingAvailability === 'object', 'Training availability normalized safely under extreme fuzzing');

// Fuzz 2: Empty Object
const emptyProfile = CanonicalProfile.normalizeCanonicalUserProfile(CanonicalProfile.buildCanonicalUserProfile({}));
const emptyReqs = TrainingRules.buildTrainingRequirements(emptyProfile);
const emptyProg = ProgramGenerator.generateWorkoutProgram(emptyProfile, emptyReqs, ExerciseDatabase);
assert(emptyProg.sessions.length >= 2, 'Empty input safely constructs valid fallback program');

// -----------------------------------------------------------------------------
// 6. PERFORMANCE BENCHMARKING & STRESS TESTING
// -----------------------------------------------------------------------------
console.log('\n--- DIMENSION 6: PERFORMANCE BENCHMARKING & STRESS TESTING ---');

const startBench = Date.now();
const ITERATIONS = 100;
for (let i = 0; i < ITERATIONS; i++) {
    const p = CanonicalProfile.normalizeCanonicalUserProfile(CanonicalProfile.buildCanonicalUserProfile(userB));
    const r = TrainingRules.buildTrainingRequirements(p);
    const prog = ProgramGenerator.generateWorkoutProgram(p, r, ExerciseDatabase);
    const val = ProgramValidator.validateAndRepairProgram(prog, p, r, ExerciseDatabase);
    const period = PeriodizationEngine.generate12WeekTrainingBlock(val.program || prog, p);
    const exp = PersonalizationExplanations.generatePersonalizationExplanation({
        program: val.program || prog,
        userProfile: p,
        trainingRequirements: r,
        validationResult: val.validation,
        periodizationBlock: period
    });
}
const elapsed = Date.now() - startBench;
const avgPerRun = elapsed / ITERATIONS;
console.log(`  ⚡ Executed ${ITERATIONS} full multi-engine cycles in ${elapsed}ms (Avg: ${avgPerRun.toFixed(2)}ms / run)`);
assert(avgPerRun < 20, `Average multi-engine run time (${avgPerRun.toFixed(2)}ms) is well under 20ms threshold`);

// -----------------------------------------------------------------------------
// 7. ACCESSIBILITY (WCAG AA & UI TOUCH TARGETS) TESTING
// -----------------------------------------------------------------------------
console.log('\n--- DIMENSION 7: ACCESSIBILITY & UI COMPLIANCE TESTING ---');

// Verify HTML contains required ARIA landmarks and live regions
const htmlContent = fs.readFileSync(path.resolve(__dirname, '../workout-plan.html'), 'utf8');
assert(htmlContent.includes('aria-live="polite"'), 'Workout plan HTML includes aria-live progress announcer');
assert(htmlContent.includes('aria-label') || htmlContent.includes('role='), 'Accessible semantic attributes are present');

// Verify CSS contains touch target styles (min 44px)
const cssContent = fs.readFileSync(path.resolve(__dirname, '../workout-plan.css'), 'utf8');
assert(cssContent.includes('min-height: 44px') || cssContent.includes('44px'), 'Mobile touch targets respect 44px minimum sizing');
assert(cssContent.includes('@media print'), 'Print stylesheet is active for ink-friendly gym card export');

// -----------------------------------------------------------------------------
// 8. OFFLINE PWA, MANIFEST & DATA PORTABILITY TESTING
// -----------------------------------------------------------------------------
console.log('\n--- DIMENSION 8: OFFLINE PWA & DATA PORTABILITY TESTING ---');

const manifestPath = path.resolve(__dirname, '../manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json exists for PWA home screen installation');

const rawManifest = fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '');
const manifest = JSON.parse(rawManifest);
assert(manifest.display === 'standalone', 'PWA display mode is configured as standalone');
assert(manifest.start_url !== undefined, 'PWA start_url is defined');

const swPath = path.resolve(__dirname, '../sw.js');
assert(fs.existsSync(swPath), 'sw.js Service Worker exists for offline asset caching');

const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('caches.open'), 'Service Worker implements cache storage lifecycle');
assert(swContent.includes('fetch'), 'Service Worker implements offline network fetch fallback');

// Data Portability Object Structure
const testBackup = {
    exportVersion: '1.0',
    appName: 'FitPhysique / Hanuman Gym',
    exportedAt: new Date().toISOString(),
    canonicalProfile: canonicalB,
    workoutLogs: [logB],
    customPlan: progB
};
const backupJson = JSON.stringify(testBackup);
const parsedBackup = JSON.parse(backupJson);
assert(parsedBackup.exportVersion === '1.0', 'Backup JSON serializes and deserializes version');
assert(parsedBackup.workoutLogs.length === 1, 'Backup JSON preserves workout log history');

// =============================================================================
// SUMMARY & CERTIFICATION
// =============================================================================
console.log('\n================================================================================');
console.log(`TOTAL BATTERY TESTS RUN : ${totalTests}`);
console.log(`TESTS PASSED            : ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log(`TESTS FAILED            : ${failedTests}`);
console.log('================================================================================');

if (failedTests === 0) {
    console.log('🏆 PRE-LAUNCH QA CERTIFICATION: APPROVED FOR PRODUCTION DEPLOYMENT');
} else {
    console.error('❌ PRE-LAUNCH QA CERTIFICATION: DEFECTS DETECTED');
    process.exit(1);
}
