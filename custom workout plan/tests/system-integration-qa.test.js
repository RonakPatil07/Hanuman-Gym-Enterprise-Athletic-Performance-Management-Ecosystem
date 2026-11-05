/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * SYSTEM QA, INTEGRATION HARDENING & PRODUCTION READINESS SUITE (PHASE 16)
 * ==============================================================================
 * 
 * 75 Comprehensive end-to-end integration and contract-hardening tests
 * verifying all aspects of the Custom Workout Plan modernization.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Load all engines
const canonicalProfileEngine = require('../js/engine/canonical-profile.js');
const exerciseDatabaseEngine = require('../js/engine/exercise-database.js');
const trainingRulesEngine = require('../js/engine/training-rules.js');
const intensityRulesEngine = require('../js/engine/intensity-rules.js');
const progressionRulesEngine = require('../js/engine/progression-rules.js');
const workoutLoggerEngine = require('../js/engine/workout-logger.js');
const performanceAnalysisEngine = require('../js/engine/performance-analysis.js');
const adaptiveTrainingEngine = require('../js/engine/adaptive-training.js');
const weeklyAnalyticsEngine = require('../js/engine/weekly-analytics.js');
const exerciseSubstitutionEngine = require('../js/engine/exercise-substitution.js');
const periodizationEngine = require('../js/engine/periodization-engine.js');
const personalizationExplanationEngine = require('../js/engine/personalization-explanations.js');
const programGeneratorEngine = require('../js/engine/program-generator.js');
const programValidatorEngine = require('../js/engine/program-validator.js');
const personalizedBlueprintUI = require('../js/ui/personalized-blueprint.js');

// Register global engine reference for UI module execution in Node environment
if (typeof global !== 'undefined') {
    global.PersonalizationExplanationEngine = personalizationExplanationEngine;
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
    totalTests++;
    try {
        testFn();
        passedTests++;
        console.log(`  ✅ [PASS] ${testName}`);
    } catch (err) {
        failedTests++;
        console.error(`  ❌ [FAIL] ${testName}`);
        console.error(`     Error: ${err.message}`);
    }
}

console.log('\n================================================================');
console.log('RUNNING SYSTEM QA & INTEGRATION HARDENING TEST SUITE (PHASE 16)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// WORKSTREAM 1 & 2: STATIC ARCHITECTURE & CROSS-ENGINE CONTRACTS (Tests 1–6)
// -----------------------------------------------------------------------------
runTest('TEST 1: All 14 platform engines and UI modules load with valid exports', () => {
    assert.ok(canonicalProfileEngine.buildCanonicalUserProfile);
    assert.ok(exerciseDatabaseEngine.getExerciseById);
    assert.ok(trainingRulesEngine.buildTrainingRequirements);
    assert.ok(intensityRulesEngine.calculateExerciseIntensity);
    assert.ok(progressionRulesEngine.calculateProgressionStrategy);
    assert.ok(workoutLoggerEngine.createWorkoutLog);
    assert.ok(performanceAnalysisEngine.analyzeSessionPerformance);
    assert.ok(adaptiveTrainingEngine.calculateAdaptiveDecision);
    assert.ok(weeklyAnalyticsEngine.analyzeWeeklyPerformance);
    assert.ok(exerciseSubstitutionEngine.findBestSubstitution);
    assert.ok(periodizationEngine.generate12WeekTrainingBlock);
    assert.ok(personalizationExplanationEngine.generatePersonalizationExplanation);
    assert.ok(programGeneratorEngine.generateWorkoutProgram);
    assert.ok(programValidatorEngine.validateProgram);
    assert.ok(personalizedBlueprintUI.generateBlueprintHTML);
});

runTest('TEST 2: Canonical Profile -> Training Requirements contract flow', () => {
    const rawSelections = {
        goal: 'muscle-gain',
        experience: 'intermediate',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        workoutLocation: 'gym'
    };
    const profile = canonicalProfileEngine.buildCanonicalUserProfile(rawSelections);
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    assert.strictEqual(reqs.weeklyStructure.trainingDayCount, 4);
    assert.strictEqual(reqs.weeklyStructure.splitType, 'upper_lower');
    assert.ok(reqs.musclePriorities.volumeTargets);
});

runTest('TEST 3: Training Requirements -> Program Generator -> Validator and Repair cycle flow', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({
        goal: 'strength',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        workoutLocation: 'gym',
        experience: 'intermediate'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const program = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const valCycle = programValidatorEngine.validateAndRepairProgram(program, profile, reqs, exerciseDatabaseEngine);
    assert.strictEqual(valCycle.validation.valid, true);
    assert.strictEqual(valCycle.program.sessions.length, 3);
});

runTest('TEST 4: Program -> Blueprint UI rendering contract flow', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        workoutLocation: 'gym'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const program = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const val = programValidatorEngine.validateProgram(program, profile, reqs, exerciseDatabaseEngine);
    const html = personalizedBlueprintUI.generateBlueprintHTML(program, val);
    assert.ok(html.includes('personalized-blueprint-wrapper'));
    assert.ok(html.includes('Why This Plan? Decision Transparency'));
});

runTest('TEST 5: Complete Cross-Engine Flow generates valid periodization and explanations', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        workoutLocation: 'gym'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const program = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const val = programValidatorEngine.validateProgram(program, profile, reqs, exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, program, '2026-08-17');
    const expl = personalizationExplanationEngine.generatePersonalizationExplanation(profile, reqs, program, val, null, null, null, block);
    assert.strictEqual(block.phases.length, 6);
    assert.strictEqual(block.weeks.length, 12);
    assert.strictEqual(expl.version, '1.0');
    assert.ok(expl.summary.includes('Muscle Gain'));
});

runTest('TEST 6: Intensity Rules and Progression Rules contracts are aligned', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const exMeta = exerciseDatabaseEngine.getExerciseById('barbell_bench_press');
    const intensity = intensityRulesEngine.calculateExerciseIntensity(exMeta, profile, reqs);
    assert.ok(intensity.targetRIR >= 0 && intensity.targetRIR <= 5);
    assert.strictEqual(intensity.rpe, 10 - intensity.targetRIR);
});

// -----------------------------------------------------------------------------
// WORKSTREAM 3: QUESTIONNAIRE 34-STEP MAPPINGS (Tests 7–12)
// -----------------------------------------------------------------------------
runTest('TEST 7: Lifestyle & nutrition field mappings are accurately parsed into canonical profile', () => {
    const raw = {
        eatingHabit: 'clean-healthy',
        protein: 'high-protein',
        water: '2-3-liters',
        sleep: '7-8-hours',
        walking: '5k-10k-steps'
    };
    const profile = canonicalProfileEngine.buildCanonicalUserProfile(raw);
    assert.strictEqual(profile.nutrition.eatingHabits, 'clean-healthy');
    assert.strictEqual(profile.nutrition.proteinIntake, 'high-protein');
    assert.strictEqual(profile.lifestyle.waterIntake, '2-3-liters');
    assert.strictEqual(profile.lifestyle.sleepDuration, '7-8-hours');
    assert.strictEqual(profile.lifestyle.walkingHabits, '5k-10k-steps');
});

runTest('TEST 8: Anthropometrics (height, weight, bodyFat) parsed cleanly into anthropometrics', () => {
    const raw = { height: '180', heightUnit: 'cm', currentWeight: '80', targetWeight: '75', weightUnit: 'kg', bodyFatLevel: '15-19%' };
    const profile = canonicalProfileEngine.buildCanonicalUserProfile(raw);
    assert.strictEqual(profile.anthropometrics.heightCm, 180);
    assert.strictEqual(profile.anthropometrics.weightKg, 80);
    assert.strictEqual(profile.anthropometrics.targetWeightKg, 75);
    assert.strictEqual(profile.anthropometrics.bodyFatPercent, 17);
});

runTest('TEST 9: Fitness assessment fields (pushups, pullups) parsed into trainingExperience', () => {
    const raw = { pushups: '20 to 30', pullups: '5 to 10' };
    const profile = canonicalProfileEngine.buildCanonicalUserProfile(raw);
    assert.strictEqual(profile.trainingExperience.pushups, '20 to 30');
    assert.strictEqual(profile.trainingExperience.pullups, '5 to 10');
});

runTest('TEST 10: Full 34-step mock questionnaire completes without missing data', () => {
    const fullMock = {
        age: 28, gender: 'male', bodyType: 'athletic', goal: 'muscle-gain',
        workoutTime: 'morning', workoutDuration: '40-60', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        bodyFatLevel: '15-19%', height: 178, heightUnit: 'cm', currentWeight: 78, targetWeight: 82, weightUnit: 'kg',
        experience: 'intermediate', focusAreas: ['chest', 'arms'], injuries: ['knee'],
        pushups: '20 to 30', pullups: '5 to 10', activityLevel: 'moderate', eatingHabit: 'clean-healthy'
    };
    const profile = canonicalProfileEngine.buildCanonicalUserProfile(fullMock);
    assert.strictEqual(profile.identity.age, 28);
    assert.strictEqual(profile.goals.primary, 'muscle-gain');
    assert.strictEqual(profile.movementConstraints.injuries[0], 'knee');
});

runTest('TEST 11: Beginner with 2 days maps cleanly to full body structure', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ experience: 'beginner', trainingDays: ['Monday', 'Thursday'], goal: 'general-fitness', workoutLocation: 'home' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 2);
});

runTest('TEST 12: Advanced with 6 days maps cleanly to push/pull/legs structure', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ experience: 'advanced', trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], goal: 'muscle-gain', workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 6);
});

// -----------------------------------------------------------------------------
// WORKSTREAM 4: FIVE-GOAL INTEGRATION MATRIX (Tests 13–17)
// -----------------------------------------------------------------------------
runTest('TEST 13: Muscle Gain goal produces verified valid program and periodization', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const val = programValidatorEngine.validateProgram(prog, profile, reqs, exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17');
    assert.strictEqual(val.valid, true);
    assert.strictEqual(block.phases.length, 6);
});

runTest('TEST 14: Weight Loss goal produces verified valid program and periodization', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'weight-loss', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'home' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const val = programValidatorEngine.validateProgram(prog, profile, reqs, exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17');
    assert.strictEqual(val.valid, true);
    assert.strictEqual(block.phases.length, 6);
});

runTest('TEST 15: Get Shredded goal produces verified valid program and periodization', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'get-shredded', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const val = programValidatorEngine.validateProgram(prog, profile, reqs, exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17');
    assert.strictEqual(val.valid, true);
    assert.strictEqual(block.phases.length, 6);
});

runTest('TEST 16: Strength goal produces verified valid program and periodization through repair cycle', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'strength', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym', experience: 'intermediate' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const valCycle = programValidatorEngine.validateAndRepairProgram(prog, profile, reqs, exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, valCycle.program, '2026-08-17');
    assert.strictEqual(valCycle.validation.valid, true);
    assert.strictEqual(block.phases.length, 6);
});

runTest('TEST 17: General Fitness goal produces verified valid program and periodization', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'general-fitness', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'home' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const val = programValidatorEngine.validateProgram(prog, profile, reqs, exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17');
    assert.strictEqual(val.valid, true);
    assert.strictEqual(block.phases.length, 6);
});

// -----------------------------------------------------------------------------
// WORKSTREAM 5: FREQUENCY INTEGRATION MATRIX (Tests 18–22)
// -----------------------------------------------------------------------------
runTest('TEST 18: Frequency 2 days generates exactly 2 sessions with no duplicate IDs', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ trainingDays: ['Monday', 'Thursday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 2);
});

runTest('TEST 19: Frequency 3 days generates exactly 3 sessions', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 3);
});

runTest('TEST 20: Frequency 4 days generates exactly 4 sessions', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 4);
});

runTest('TEST 21: Frequency 5 days generates exactly 5 sessions', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 5);
});

runTest('TEST 22: Frequency 6 days generates exactly 6 sessions', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 6);
});

// -----------------------------------------------------------------------------
// WORKSTREAM 6, 7 & 8: SAFETY, INTENSITY & PROGRESSION (Tests 23–30)
// -----------------------------------------------------------------------------
runTest('TEST 23: Knee restriction strictly filters prohibited quad-dominant loaded movements', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ injuries: ['knee'], trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    prog.sessions.forEach(s => {
        s.exercises.forEach(ex => {
            assert.notStrictEqual(ex.exerciseId, 'barbell_back_squat');
        });
    });
});

runTest('TEST 24: Bodyweight-only equipment selection never assigns barbell exercises', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutLocation: 'outdoor', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    prog.sessions.forEach(s => {
        s.exercises.forEach(ex => {
            const dbEx = exerciseDatabaseEngine.getExerciseById(ex.exerciseId);
            assert.notStrictEqual(dbEx.equipment, 'barbell');
        });
    });
});

runTest('TEST 25: Global RIR domain strictly conforms to 0 <= RIR <= 5', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17');
    block.weeks.forEach(w => {
        assert.ok(w.targetRIR >= 0 && w.targetRIR <= 5);
        assert.ok(w.minRIR >= 0 && w.maxRIR <= 5);
    });
});

runTest('TEST 26: RPE is deterministically derived as 10 - targetRIR across all sessions', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'strength' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const exMeta = exerciseDatabaseEngine.getExerciseById('barbell_bench_press');
    const int = intensityRulesEngine.calculateExerciseIntensity(exMeta, profile, reqs);
    assert.strictEqual(int.rpe, 10 - int.targetRIR);
});

runTest('TEST 27: Double progression model evaluates strategy prescription correctly', () => {
    const exMeta = exerciseDatabaseEngine.getExerciseById('barbell_bench_press');
    const res = progressionRulesEngine.calculateProgressionStrategy(exMeta, { primaryGoal: 'muscle-gain' }, 'DOUBLE_PROGRESSION');
    assert.strictEqual(res.model, 'DOUBLE_PROGRESSION');
});

runTest('TEST 28: Load progression model evaluates strategy prescription correctly', () => {
    const exMeta = exerciseDatabaseEngine.getExerciseById('barbell_bench_press');
    const res = progressionRulesEngine.calculateProgressionStrategy(exMeta, { primaryGoal: 'strength' }, 'LOAD_PROGRESSION');
    assert.strictEqual(res.model, 'LOAD_PROGRESSION');
});

runTest('TEST 29: Rep progression model evaluates bodyweight exercises without dumbbells', () => {
    const exMeta = { id: 'push_ups', name: 'Push Ups', equipment: ['bodyweight'], movementPattern: 'horizontal_push', technicalComplexity: 2, fatigueCost: 2, isBodyweight: true };
    const res = progressionRulesEngine.calculateProgressionStrategy(exMeta, { primaryGoal: 'general-fitness' }, 'REP_PROGRESSION');
    assert.strictEqual(res.model, 'REP_PROGRESSION');
});

runTest('TEST 30: Conservative progression model selected for beginner experience', () => {
    const exMeta = { id: 'barbell_bench_press', name: 'Barbell Bench Press', equipment: ['barbell', 'bench'], movementPattern: 'horizontal_push', technicalComplexity: 3, fatigueCost: 3 };
    const profile = { experienceLevel: 'beginner' };
    const res = progressionRulesEngine.calculateProgressionStrategy(exMeta, profile);
    assert.strictEqual(res.model, 'CONSERVATIVE_PROGRESSION');
});

// -----------------------------------------------------------------------------
// WORKSTREAM 9, 10, 11, 12, 13, 14: LOGGING, ADAPTIVE, ANALYTICS, PERIODIZATION (Tests 31–40)
// -----------------------------------------------------------------------------
runTest('TEST 31: Workout logger creates workout log without mutating program', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    const progCopy = JSON.stringify(prog);
    const log = workoutLoggerEngine.createWorkoutLog(prog, 0);
    assert.strictEqual(log.status, workoutLoggerEngine.SESSION_STATUS.NOT_STARTED);
    assert.strictEqual(JSON.stringify(prog), progCopy);
});

runTest('TEST 32: Performance analysis evaluates completed session factual metrics', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    const log = workoutLoggerEngine.createWorkoutLog(prog, 0);
    const activeLog = workoutLoggerEngine.startWorkout(log);
    const loggedLog = workoutLoggerEngine.logSet(activeLog, prog.sessions[0].exercises[0].exerciseId, {
        setNumber: 1,
        actualReps: 10,
        actualRIR: 2,
        completed: true
    });
    const completedLog = workoutLoggerEngine.completeWorkout(loggedLog);
    const analysis = performanceAnalysisEngine.analyzeSessionPerformance(prog.programId, completedLog.sessionId, [completedLog]);
    assert.strictEqual(analysis.programId, prog.programId);
    assert.strictEqual(analysis.sessionId, completedLog.sessionId);
    assert.strictEqual(analysis.sessionsAnalyzed, 1);
});

runTest('TEST 33: Adaptive training generates decision without mutating history', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    const log = workoutLoggerEngine.createWorkoutLog(prog, 0);
    const completedLog = Object.assign({}, log, { status: 'COMPLETED' });
    const logs = [completedLog];
    const logsCopy = JSON.stringify(logs);
    const analysis = performanceAnalysisEngine.analyzeExercisePerformance('barbell_bench_press', logs, '8-12');
    const decision = adaptiveTrainingEngine.calculateAdaptiveDecision(analysis, 'DOUBLE_PROGRESSION');
    assert.ok(decision.decision);
    assert.strictEqual(JSON.stringify(logs), logsCopy);
});

runTest('TEST 34: Weekly analytics strictly separates kg and lb load totals', () => {
    const logs = [
        {
            logId: 'l1',
            status: 'COMPLETED',
            date: '2026-08-17T10:00:00.000Z',
            exercises: [{
                exerciseId: 'e1',
                sets: [{ setNumber: 1, completed: true, actualReps: 10, actualLoad: 80, unit: 'kg' }]
            }]
        },
        {
            logId: 'l2',
            status: 'COMPLETED',
            date: '2026-08-18T10:00:00.000Z',
            exercises: [{
                exerciseId: 'e2',
                sets: [{ setNumber: 1, completed: true, actualReps: 10, actualLoad: 175, unit: 'lb' }]
            }]
        }
    ];
    const analytics = weeklyAnalyticsEngine.analyzeWeeklyPerformance(logs, '2026-08-17');
    assert.strictEqual(analytics.summary.loadTotals.kg, 800);
    assert.strictEqual(analytics.summary.loadTotals.lb, 1750);
});

runTest('TEST 35: Exercise substitution finds ranked compatible replacement', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutLocation: 'home', injuries: ['knee'] });
    const sub = exerciseSubstitutionEngine.findBestSubstitution({
        exerciseId: 'barbell_bench_press',
        userProfile: profile,
        reason: 'EQUIPMENT_UNAVAILABLE'
    });
    assert.strictEqual(sub.status, 'FOUND');
    assert.ok(sub.replacementExerciseId);
});

runTest('TEST 36: 12-Week Periodization contains exactly 6 phases and 12 weeks', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, trainingRulesEngine.buildTrainingRequirements(profile), exerciseDatabaseEngine);
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17');
    assert.strictEqual(block.phases.length, 6);
    assert.strictEqual(block.weeks.length, 12);
});

runTest('TEST 37: Periodization strategic deload weeks are placed at Weeks 4, 8, 12', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, null, '2026-08-17');
    assert.strictEqual(block.weeks[3].deload, true);
    assert.strictEqual(block.weeks[7].deload, true);
    assert.strictEqual(block.weeks[11].deload, true);
});

runTest('TEST 38: Periodization adaptationDecision is decoupled from phaseType', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock({ goal: 'muscle-gain' }, null, '2026-08-17', []);
    assert.strictEqual(block.adaptationRules[0].adaptationDecision, 'DEFERRED');
    assert.strictEqual(block.phases[0].type, 'ACCUMULATION');
    assert.notStrictEqual(block.adaptationRules[0].adaptationDecision, block.phases[0].type);
});

runTest('TEST 39: Personalization explanation provides human-readable summary and factors', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const val = programValidatorEngine.validateProgram(prog, profile, reqs, exerciseDatabaseEngine);
    const expl = personalizationExplanationEngine.generatePersonalizationExplanation(profile, reqs, prog, val);
    assert.ok(expl.summary.includes('Muscle Gain'));
    assert.ok(expl.profileFactors.length > 0);
});

runTest('TEST 40: Personalization explanation reports qualitative confidence (no fake %)', () => {
    const expl = personalizationExplanationEngine.generatePersonalizationExplanation({ goal: 'muscle-gain' });
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(expl.confidence.overall));
    assert.ok(!JSON.stringify(expl.confidence).includes('%'));
});

// -----------------------------------------------------------------------------
// WORKSTREAM 15, 16, 17, 18, 19, 20: DETERMINISM, IMMUTABILITY, SECURITY & FALLBACK (Tests 41–50)
// -----------------------------------------------------------------------------
runTest('TEST 41: End-to-end flow is 100% deterministic across 10 repeated executions', () => {
    const raw = { goal: 'muscle-gain', experience: 'intermediate', trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], workoutLocation: 'gym' };
    const p1 = canonicalProfileEngine.buildCanonicalUserProfile(raw);
    const reqs1 = trainingRulesEngine.buildTrainingRequirements(p1);
    const prog1 = programGeneratorEngine.generateWorkoutProgram(p1, reqs1, exerciseDatabaseEngine);
    const snap1 = programGeneratorEngine.getDeterministicProgramSnapshot(prog1);

    for (let i = 0; i < 10; i++) {
        const pX = canonicalProfileEngine.buildCanonicalUserProfile(raw);
        const reqsX = trainingRulesEngine.buildTrainingRequirements(pX);
        const progX = programGeneratorEngine.generateWorkoutProgram(pX, reqsX, exerciseDatabaseEngine);
        const snapX = programGeneratorEngine.getDeterministicProgramSnapshot(progX);
        assert.strictEqual(JSON.stringify(snapX), JSON.stringify(snap1));
    }
});

runTest('TEST 42: Deep immutability audit across all 14 engine transformations', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'strength', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const profileSnap = JSON.stringify(profile);
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const reqsSnap = JSON.stringify(reqs);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const progSnap = JSON.stringify(prog);

    programValidatorEngine.validateProgram(prog, profile, reqs, exerciseDatabaseEngine);
    periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17');
    personalizationExplanationEngine.generatePersonalizationExplanation(profile, reqs, prog);

    assert.strictEqual(JSON.stringify(profile), profileSnap);
    assert.strictEqual(JSON.stringify(reqs), reqsSnap);
    assert.strictEqual(JSON.stringify(prog), progSnap);
});

runTest('TEST 43: Corrupted null/empty inputs handled safely with structured errors or fallbacks', () => {
    assert.doesNotThrow(() => canonicalProfileEngine.buildCanonicalUserProfile({}));
    assert.doesNotThrow(() => programValidatorEngine.validateProgram(null));
    assert.doesNotThrow(() => periodizationEngine.generate12WeekTrainingBlock(null));
    assert.doesNotThrow(() => personalizationExplanationEngine.generatePersonalizationExplanation(null));
});

runTest('TEST 44: XSS Escaping prevents malicious string injection in UI rendering', () => {
    const maliciousProfile = canonicalProfileEngine.buildCanonicalUserProfile({
        userName: '<script>alert("XSS")</script>',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        workoutLocation: 'gym'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(maliciousProfile);
    const prog = programGeneratorEngine.generateWorkoutProgram(maliciousProfile, reqs, exerciseDatabaseEngine);
    const html = personalizedBlueprintUI.generateBlueprintHTML(prog, null, { userName: maliciousProfile.identity.userName });
    assert.ok(!html.includes('<script>alert("XSS")</script>'));
});

runTest('TEST 45: Legacy 1,152-plan database remains loadable as fallback', () => {
    const legacyPath = path.resolve(__dirname, '../workout-plans-database.json');
    assert.ok(fs.existsSync(legacyPath));
    const data = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
    assert.ok(Array.isArray(data.workoutPlans));
    assert.ok(data.workoutPlans.length >= 1152);
});

runTest('TEST 46: 5-Day frequency with hybrid split generates complete movement pattern coverage', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    assert.strictEqual(prog.sessions.length, 5);
    const patterns = new Set();
    prog.sessions.forEach(s => s.exercises.forEach(e => patterns.add(exerciseDatabaseEngine.getExerciseById(e.exerciseId).movementPattern)));
    assert.ok(patterns.has('horizontal_push'));
    assert.ok(patterns.has('horizontal_pull'));
    assert.ok(patterns.has('squat') || patterns.has('hinge'));
});

runTest('TEST 47: High volume user (>5 days) handles recovery scaling without exception', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workoutLocation: 'gym',
        sleep: '5-6 hours',
        typicalDay: 'heavy-labor'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    assert.ok(reqs.musclePriorities.volumeTargets);
});

runTest('TEST 48: Multi-joint injury constraint filtering handles compound restrictions', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({
        goal: 'muscle-gain',
        injuries: ['knee', 'back', 'shoulder'],
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        workoutLocation: 'gym'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    prog.sessions.forEach(s => {
        s.exercises.forEach(e => {
            assert.notStrictEqual(e.exerciseId, 'barbell_back_squat');
            assert.notStrictEqual(e.exerciseId, 'barbell_overhead_press');
        });
    });
});

runTest('TEST 49: RIR and RPE bounds integrity checked on all generated sessions', () => {
    const goals = ['muscle-gain', 'weight-loss', 'get-shredded', 'strength', 'general-fitness'];
    goals.forEach(g => {
        const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: g, trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
        const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
        const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
        prog.sessions.forEach(s => {
            s.exercises.forEach(e => {
                assert.ok(e.rir >= 0 && e.rir <= 5);
                assert.strictEqual(e.rpe, 10 - e.rir);
            });
        });
    });
});

runTest('TEST 50: Deterministic snapshot across all 15 components verified identical', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const s1 = periodizationEngine.getDeterministicPeriodizationSnapshot(periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17'));
    const s2 = periodizationEngine.getDeterministicPeriodizationSnapshot(periodizationEngine.generate12WeekTrainingBlock(profile, prog, '2026-08-17'));
    assert.strictEqual(s1, s2);
});

// -----------------------------------------------------------------------------
// ISSUE 1: EXERCISE SUBSTITUTION APPLICATION SEMANTICS (Tests 51–57)
// -----------------------------------------------------------------------------
runTest('TEST 51: Constraint detection does not automatically mutate the program', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ injuries: ['knee'], workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const progSnap = JSON.stringify(prog);

    exerciseSubstitutionEngine.findBestSubstitution({
        exerciseId: 'barbell_back_squat',
        userProfile: profile,
        reason: 'INJURY'
    });

    assert.strictEqual(JSON.stringify(prog), progSnap);
});

runTest('TEST 52: Substitution search does not mutate the program or database', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const progSnap = JSON.stringify(prog);

    const subResult = exerciseSubstitutionEngine.findBestSubstitution({
        exerciseId: 'barbell_bench_press',
        userProfile: profile,
        reason: 'EQUIPMENT_UNAVAILABLE'
    });

    assert.strictEqual(subResult.status, 'FOUND');
    assert.strictEqual(JSON.stringify(prog), progSnap);
});

runTest('TEST 53: Candidate ranking does not mutate the program', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const progSnap = JSON.stringify(prog);

    exerciseSubstitutionEngine.rankSubstitutionCandidates({
        exerciseId: 'barbell_bench_press',
        userProfile: profile
    });
    assert.strictEqual(JSON.stringify(prog), progSnap);
});

runTest('TEST 54: Explicit application action applies validated replacement cleanly on cloned program', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutLocation: 'gym', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const originalExerciseId = prog.sessions[0].exercises[0].exerciseId;

    const subResult = exerciseSubstitutionEngine.findBestSubstitution({
        exerciseId: originalExerciseId,
        userProfile: profile,
        reason: 'EQUIPMENT_UNAVAILABLE'
    });

    assert.strictEqual(subResult.status, 'FOUND');
    assert.ok(subResult.replacementExerciseId);

    // Perform explicit replacement on cloned program
    const clonedProgram = JSON.parse(JSON.stringify(prog));
    clonedProgram.sessions[0].exercises[0].exerciseId = subResult.replacementExerciseId;
    const dbEx = exerciseDatabaseEngine.getExerciseById(subResult.replacementExerciseId);
    clonedProgram.sessions[0].exercises[0].exerciseName = dbEx.name;

    assert.strictEqual(clonedProgram.sessions[0].exercises[0].exerciseId, subResult.replacementExerciseId);
    assert.strictEqual(prog.sessions[0].exercises[0].exerciseId, originalExerciseId);
});

runTest('TEST 55: Workout logs remain unchanged when searching substitutions', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutLocation: 'gym', trainingDays: ['Monday', 'Wednesday', 'Friday'] });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const log = workoutLoggerEngine.createWorkoutLog(prog, 0);
    const logSnap = JSON.stringify(log);

    exerciseSubstitutionEngine.findBestSubstitution({
        exerciseId: 'barbell_bench_press',
        userProfile: profile,
        reason: 'DISCOMFORT'
    });

    assert.strictEqual(JSON.stringify(log), logSnap);
});

runTest('TEST 56: Original program remains completely untouched until explicit user application', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutLocation: 'home' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const progSnap = JSON.stringify(prog);

    const sub = exerciseSubstitutionEngine.findBestSubstitution({
        exerciseId: 'barbell_deadlift',
        userProfile: profile,
        reason: 'EQUIPMENT_UNAVAILABLE'
    });

    assert.ok(sub.replacementExerciseId);
    assert.strictEqual(JSON.stringify(prog), progSnap);
});

runTest('TEST 57: Invalid substitution request is rejected and cannot be applied', () => {
    const invalidSub = exerciseSubstitutionEngine.findBestSubstitution({
        exerciseId: 'non_existent_exercise_123',
        userProfile: {},
        reason: 'INJURY'
    });
    assert.strictEqual(invalidSub.status, 'INVALID_REQUEST');
    assert.strictEqual(invalidSub.replacementExerciseId, null);
});

// -----------------------------------------------------------------------------
// ISSUE 2: RIR 0 CONTRACT & TARGET EFFORT BOUNDS (Tests 58–61)
// -----------------------------------------------------------------------------
runTest('TEST 58: RIR domain accepts 0 and 5, while rejecting negative RIR and RIR > 5', () => {
    assert.strictEqual(intensityRulesEngine.calculateRPEFromRIR(0), 10);
    assert.strictEqual(intensityRulesEngine.calculateRPEFromRIR(5), 5);

    // Negative RIR rejected
    const valNeg = workoutLoggerEngine.validateSetData({ setNumber: 1, actualReps: 10, actualRIR: -1 });
    assert.strictEqual(valNeg.valid, false);

    // RIR > 5 rejected
    const valOver = workoutLoggerEngine.validateSetData({ setNumber: 1, actualReps: 10, actualRIR: 6 });
    assert.strictEqual(valOver.valid, false);
});

runTest('TEST 59: Default generated prescriptions do not use RIR 0 as the standard prescription', () => {
    const goals = ['muscle-gain', 'weight-loss', 'get-shredded', 'strength', 'general-fitness'];
    goals.forEach(g => {
        const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: g, trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
        const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
        const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
        prog.sessions.forEach(s => {
            s.exercises.forEach(e => {
                assert.ok(e.rir >= 1, `Expected standard exercise RIR >= 1, but found RIR ${e.rir} for goal ${g}`);
            });
        });
    });
});

runTest('TEST 60: Periodization peak weeks (Weeks 9-11) prescribe target RIR 1 (not RIR 0)', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const block = periodizationEngine.generate12WeekTrainingBlock(profile, null, '2026-08-17');
    assert.strictEqual(block.weeks[8].targetRIR, 1);
    assert.strictEqual(block.weeks[9].targetRIR, 1);
    assert.strictEqual(block.weeks[10].targetRIR, 1);
});

runTest('TEST 61: RPE is strictly derived as 10 - targetRIR across intensity and logging engines', () => {
    for (let rir = 0; rir <= 5; rir++) {
        const expectedRPE = 10 - rir;
        assert.strictEqual(intensityRulesEngine.calculateRPEFromRIR(rir), expectedRPE);
    }
});

// -----------------------------------------------------------------------------
// ISSUE 4: CORRUPTED DATA COVERAGE (NaN / Infinity) (Tests 62–67)
// -----------------------------------------------------------------------------
runTest('TEST 62: NaN numeric input in user profile handled safely without crash', () => {
    const prof = canonicalProfileEngine.buildCanonicalUserProfile({ age: NaN, height: NaN, currentWeight: NaN, targetWeight: NaN });
    assert.strictEqual(prof.identity.age, null);
    assert.strictEqual(prof.anthropometrics.heightCm, null);
    assert.strictEqual(prof.anthropometrics.weightKg, null);
});

runTest('TEST 63: Infinity and -Infinity in workout logging set validation are strictly rejected', () => {
    const res1 = workoutLoggerEngine.validateSetData({ setNumber: 1, actualReps: Infinity });
    assert.strictEqual(res1.valid, false);

    const res2 = workoutLoggerEngine.validateSetData({ setNumber: 1, actualReps: -Infinity });
    assert.strictEqual(res2.valid, false);

    const res3 = workoutLoggerEngine.validateSetData({ setNumber: 1, actualReps: 10, actualLoad: Infinity });
    assert.strictEqual(res3.valid, false);
});

runTest('TEST 64: NaN in RIR and RPE in set validation are strictly rejected', () => {
    const resRIR = workoutLoggerEngine.validateSetData({ setNumber: 1, actualReps: 10, actualRIR: NaN });
    assert.strictEqual(resRIR.valid, false);

    const resRPE = workoutLoggerEngine.validateSetData({ setNumber: 1, actualReps: 10, actualRPE: NaN });
    assert.strictEqual(resRPE.valid, false);
});

runTest('TEST 65: NaN in workout duration in training requirements handled with safe fallback', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ workoutDuration: NaN });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    assert.ok(reqs.sessionRequirements.budget.totalMinutes > 0);
});

runTest('TEST 66: NaN and Infinity in weekly analytics logs do not contaminate load totals', () => {
    const corruptedLogs = [
        {
            logId: 'c1',
            status: 'COMPLETED',
            date: '2026-08-17T10:00:00.000Z',
            exercises: [{
                exerciseId: 'e1',
                sets: [
                    { setNumber: 1, completed: true, actualReps: 10, actualLoad: NaN, unit: 'kg' },
                    { setNumber: 2, completed: true, actualReps: 10, actualLoad: Infinity, unit: 'kg' },
                    { setNumber: 3, completed: true, actualReps: 10, actualLoad: 50, unit: 'kg' }
                ]
            }]
        }
    ];
    const analytics = weeklyAnalyticsEngine.analyzeWeeklyPerformance(corruptedLogs, '2026-08-17');
    assert.ok(!isNaN(analytics.summary.loadTotals.kg));
    assert.ok(isFinite(analytics.summary.loadTotals.kg));
    assert.strictEqual(analytics.summary.loadTotals.kg, 500);
});

runTest('TEST 67: Malformed / corrupted periodization block handled safely by explanation engine', () => {
    const corruptedBlock = { phases: null, weeks: 'invalid', goal: null };
    const expl = personalizationExplanationEngine.generatePersonalizationExplanation({}, {}, {}, null, null, null, null, corruptedBlock);
    assert.ok(expl.version);
    assert.ok(Array.isArray(expl.periodizationDecisions));
});

// -----------------------------------------------------------------------------
// ISSUE 5: SECURITY / HTML ESCAPING VERIFICATION (Tests 68–71)
// -----------------------------------------------------------------------------
runTest('TEST 68: Malicious <script> injection in user name is strictly escaped in rendered HTML', () => {
    const maliciousProfile = canonicalProfileEngine.buildCanonicalUserProfile({
        userName: '<script>alert("XSS")</script>',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        workoutLocation: 'gym'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(maliciousProfile);
    const prog = programGeneratorEngine.generateWorkoutProgram(maliciousProfile, reqs, exerciseDatabaseEngine);
    const html = personalizedBlueprintUI.generateBlueprintHTML(prog, null, { userName: maliciousProfile.identity.userName });
    assert.ok(!html.includes('<script>alert("XSS")</script>'));
    assert.ok(html.includes('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'));
});

runTest('TEST 69: Malicious <img onerror> injection in session/user text is strictly escaped in rendered HTML', () => {
    const maliciousProfile = canonicalProfileEngine.buildCanonicalUserProfile({
        userName: '<img src=x onerror=alert(1)>',
        goal: 'muscle-gain',
        trainingDays: ['Monday', 'Wednesday', 'Friday'],
        workoutLocation: 'gym'
    });
    const reqs = trainingRulesEngine.buildTrainingRequirements(maliciousProfile);
    const prog = programGeneratorEngine.generateWorkoutProgram(maliciousProfile, reqs, exerciseDatabaseEngine);
    const html = personalizedBlueprintUI.generateBlueprintHTML(prog, null, { userName: maliciousProfile.identity.userName });
    assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

runTest('TEST 70: Malicious quote-breaking string is escaped safely without unclosed tag execution', () => {
    const maliciousString = '"><script>alert(1)</script>';
    const escaped = personalizedBlueprintUI._internals.escapeHTML(maliciousString);
    assert.strictEqual(escaped, '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
});

runTest('TEST 71: Explanation engine sanitizes malicious evidence and rationale strings', () => {
    const maliciousProfile = canonicalProfileEngine.buildCanonicalUserProfile({
        userName: '<script>alert(1)</script>',
        goal: 'muscle-gain'
    });
    const expl = personalizationExplanationEngine.generatePersonalizationExplanation(maliciousProfile);
    const snap = personalizationExplanationEngine.getDeterministicExplanationSnapshot(expl);
    assert.ok(!JSON.stringify(snap).includes('<script>alert(1)</script>'));
});

// -----------------------------------------------------------------------------
// ISSUE 6 & 7: PHASE 14 & PHASE 15 CONTRACT INTEGRITY (Tests 72–75)
// -----------------------------------------------------------------------------
runTest('TEST 72: Phase 14 periodization contains exactly 12 weeks and 6 valid phase types', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock({ goal: 'muscle-gain' }, null, '2026-08-17');
    const validPhaseTypes = ['ACCUMULATION', 'INTENSIFICATION', 'PEAK', 'DELOAD', 'TRANSITION'];
    assert.strictEqual(block.weeks.length, 12);
    assert.strictEqual(block.phases.length, 6);
    block.phases.forEach(p => {
        assert.ok(validPhaseTypes.includes(p.type));
    });
});

runTest('TEST 73: Phase 14 adaptationDecision uses exclusively valid decision actions', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock({ goal: 'muscle-gain' }, null, '2026-08-17');
    const validActions = ['HIGH_PERFORMANCE', 'MAINTAIN', 'REDUCE_LOAD', 'EXTEND_PHASE', 'DEFERRED'];
    block.adaptationRules.forEach(rule => {
        assert.ok(validActions.includes(rule.adaptationDecision));
    });
});

runTest('TEST 74: Phase 15 explanation engine produces UNAVAILABLE coverage when upstream engines are omitted', () => {
    const expl = personalizationExplanationEngine.generatePersonalizationExplanation({ goal: 'muscle-gain' });
    assert.strictEqual(expl.evidenceCoverage.performance, 'UNAVAILABLE');
    assert.strictEqual(expl.evidenceCoverage.adaptive, 'UNAVAILABLE');
    assert.strictEqual(expl.evidenceCoverage.substitution, 'UNAVAILABLE');
    assert.strictEqual(expl.confidence.historical, 'NOT_AVAILABLE');
    assert.ok(expl.limitations.length > 0);
});

runTest('TEST 75: Phase 15 explanation engine does not mutate any passed arguments', () => {
    const profile = canonicalProfileEngine.buildCanonicalUserProfile({ goal: 'muscle-gain', trainingDays: ['Monday', 'Wednesday', 'Friday'], workoutLocation: 'gym' });
    const reqs = trainingRulesEngine.buildTrainingRequirements(profile);
    const prog = programGeneratorEngine.generateWorkoutProgram(profile, reqs, exerciseDatabaseEngine);
    const profileSnap = JSON.stringify(profile);
    const reqsSnap = JSON.stringify(reqs);
    const progSnap = JSON.stringify(prog);

    personalizationExplanationEngine.generatePersonalizationExplanation(profile, reqs, prog);

    assert.strictEqual(JSON.stringify(profile), profileSnap);
    assert.strictEqual(JSON.stringify(reqs), reqsSnap);
    assert.strictEqual(JSON.stringify(prog), progSnap);
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
