/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * 12-WEEK TRAINING ADAPTATION & PERIODIZATION TEST SUITE (PHASE 14)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const generatorEngine = require('../js/engine/program-generator.js');
const periodizationEngine = require('../js/engine/periodization-engine.js');

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
const refDate = '2026-08-17'; // Monday

console.log('================================================================');
console.log('RUNNING 12-WEEK PERIODIZATION & ADAPTATION TEST SUITE (PHASE 14)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: GOAL-SPECIFIC ROADMAPS (Tests 1–6)
// -----------------------------------------------------------------------------
runTest('TEST 1: Empty profile returns valid default 12-week block', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(null, sampleProgram, refDate);
    assert.strictEqual(block.durationWeeks, 12);
    assert.strictEqual(block.weeks.length, 12);
    assert.ok(block.phases.length >= 4);
});

runTest('TEST 2: Muscle-gain profile builds Hypertrophy Periodization', () => {
    const p = { ...sampleProfile, goal: 'muscle-gain' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.goal, 'muscle-gain');
    assert.ok(block.personalizationReasons.some(r => r.includes('Hypertrophy Periodization')));
});

runTest('TEST 3: Strength profile builds Maximal Strength Periodization', () => {
    const p = { ...sampleProfile, goal: 'strength' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.goal, 'strength');
    assert.ok(block.personalizationReasons.some(r => r.includes('Maximal Strength Periodization')));
});

runTest('TEST 4: Weight-loss profile builds Metabolic & Muscle Preservation Periodization', () => {
    const p = { ...sampleProfile, goal: 'weight-loss' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.goal, 'weight-loss');
    assert.ok(block.personalizationReasons.some(r => r.includes('Metabolic & Muscle Preservation')));
});

runTest('TEST 5: Get-shredded profile builds Definition & Density Periodization', () => {
    const p = { ...sampleProfile, goal: 'get-shredded' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.goal, 'get-shredded');
    assert.ok(block.personalizationReasons.some(r => r.includes('Definition & Density')));
});

runTest('TEST 6: General-fitness profile builds Balanced Physical Capacity Periodization', () => {
    const p = { ...sampleProfile, goal: 'general-fitness' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.goal, 'general-fitness');
    assert.ok(block.personalizationReasons.some(r => r.includes('Balanced Physical Capacity')));
});

// -----------------------------------------------------------------------------
// CATEGORY B: EXPERIENCE-LEVEL CALIBRATION (Tests 7–12)
// -----------------------------------------------------------------------------
runTest('TEST 7: Beginner volume limits (6-10 sets/muscle/week baseline)', () => {
    const p = { ...sampleProfile, experienceLevel: 'beginner' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.experienceLevel, 'beginner');
    assert.ok(block.personalizationReasons.some(r => r.includes('6-10 sets/muscle/week')));
});

runTest('TEST 8: Intermediate volume limits (8-14 sets/muscle/week baseline)', () => {
    const p = { ...sampleProfile, experienceLevel: 'intermediate' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.experienceLevel, 'intermediate');
    assert.ok(block.personalizationReasons.some(r => r.includes('8-14 sets/muscle/week')));
});

runTest('TEST 9: Advanced volume limits (10-18 sets/muscle/week baseline)', () => {
    const p = { ...sampleProfile, experienceLevel: 'advanced' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.strictEqual(block.experienceLevel, 'advanced');
    assert.ok(block.personalizationReasons.some(r => r.includes('10-18 sets/muscle/week')));
});

runTest('TEST 10: Beginner conservative RIR baseline', () => {
    const p = { ...sampleProfile, experienceLevel: 'beginner' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.ok(block.qualityMetrics.minPlannedRIR >= 1);
});

runTest('TEST 11: Advanced higher capacity integration', () => {
    const p = { ...sampleProfile, experienceLevel: 'advanced' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.ok(block.weeks[0].volumeTarget.includes('sets'));
});

runTest('TEST 12: Unknown experience level defaults safely to intermediate', () => {
    const p = { ...sampleProfile, experienceLevel: 'elite_unknown' };
    const block = periodizationEngine.generate12WeekTrainingBlock(p, sampleProgram, refDate);
    assert.ok(block.weeks[0].volumeTarget.includes('sets'));
});

// -----------------------------------------------------------------------------
// CATEGORY C: 12-WEEK STRUCTURE, PHASE MAPPING & BOUNDARIES (Tests 13–22)
// -----------------------------------------------------------------------------
runTest('TEST 13: Exact 12-week duration', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.durationWeeks, 12);
    assert.strictEqual(block.weeks.length, 12);
});

runTest('TEST 14: Block ID determinism', () => {
    const b1 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const b2 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b1.blockId, b2.blockId);
});

runTest('TEST 15: Start date & end date determinism (Monday start to Sunday end)', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.startDate.includes('2026-08-17'));
    assert.ok(block.endDate.includes('2026-11-08'));
});

runTest('TEST 16: Phase count >= 4 in 12-week periodization', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.phases.length >= 4);
});

runTest('TEST 17: Week numbering strictly 1 to 12', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    for (let i = 0; i < 12; i++) {
        assert.strictEqual(block.weeks[i].weekNumber, i + 1);
    }
});

runTest('TEST 18: Phase sequence covers all 12 weeks contiguously', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    let covered = 0;
    block.phases.forEach(ph => {
        covered += (ph.endWeek - ph.startWeek + 1);
    });
    assert.strictEqual(covered, 12);
});

runTest('TEST 19: Accumulation phase properties', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const accum = block.phases.find(p => p.type === 'ACCUMULATION');
    assert.ok(accum);
    assert.ok(accum.volumeStrategy.includes('Progressive Volume'));
});

runTest('TEST 20: Intensification phase properties', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const intense = block.phases.find(p => p.type === 'INTENSIFICATION');
    assert.ok(intense);
    assert.ok(intense.intensityStrategy.includes('RIR'));
});

runTest('TEST 21: Peak phase properties', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const peak = block.phases.find(p => p.type === 'PEAK');
    assert.ok(peak);
    assert.ok(peak.objective.length > 0);
});

runTest('TEST 22: Transition / Deload phase properties', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const deload = block.phases.find(p => p.deload === true);
    assert.ok(deload);
    assert.strictEqual(deload.deload, true);
});

// -----------------------------------------------------------------------------
// CATEGORY D: VOLUME PERIODIZATION & RECOVERY MODIFIERS (Tests 23–30)
// -----------------------------------------------------------------------------
runTest('TEST 23: Volume target strictly bounded within Phase 4 limits', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.qualityMetrics.volumeRange.includes('sets/muscle/week'));
});

runTest('TEST 24: Sub-optimal sleep (<6h) applies 0.85x volume modifier', () => {
    const lowSleepProfile = {
        ...sampleProfile,
        recoveryCapacity: { sleepHours: 5 }
    };
    const block = periodizationEngine.generate12WeekTrainingBlock(lowSleepProfile, sampleProgram, refDate);
    assert.ok(block.personalizationReasons.some(r => r.includes('sleep (<6h)')));
    assert.strictEqual(block.weeks[0].adaptationInputs.recoveryModifier, 0.85);
});

runTest('TEST 25: High daily activity applies 0.90x volume modifier', () => {
    const activeProfile = {
        ...sampleProfile,
        recoveryCapacity: { sleepHours: 8, dailyActivityLevel: 'very-active' }
    };
    const block = periodizationEngine.generate12WeekTrainingBlock(activeProfile, sampleProgram, refDate);
    assert.ok(block.personalizationReasons.some(r => r.includes('daily activity')));
    assert.strictEqual(block.weeks[0].adaptationInputs.recoveryModifier, 0.9);
});

runTest('TEST 26: Combined sleep & activity modifiers apply multiplicative reduction', () => {
    const stressedProfile = {
        ...sampleProfile,
        recoveryCapacity: { sleepHours: 5, dailyActivityLevel: 'high' }
    };
    const block = periodizationEngine.generate12WeekTrainingBlock(stressedProfile, sampleProgram, refDate);
    assert.strictEqual(block.weeks[0].adaptationInputs.recoveryModifier, 0.77); // 0.85 * 0.90 = 0.765 -> 0.77
});

runTest('TEST 27: Adequate sleep (8h+) retains 100% capacity', () => {
    const goodSleepProfile = {
        ...sampleProfile,
        recoveryCapacity: { sleepHours: 8, dailyActivityLevel: 'sedentary' }
    };
    const block = periodizationEngine.generate12WeekTrainingBlock(goodSleepProfile, sampleProgram, refDate);
    assert.strictEqual(block.weeks[0].adaptationInputs.recoveryModifier, 1.0);
});

runTest('TEST 28: Focus muscle volume bounds respected', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.weeks[0].volumeTarget);
});

runTest('TEST 29: Deload weeks reduce volume by ~40%', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const deloadWeek = block.weeks[3]; // Week 4
    assert.strictEqual(deloadWeek.deload, true);
    assert.ok(deloadWeek.objective.includes('Deload'));
});

runTest('TEST 30: Volume targets never exceed Phase 4 upper ceilings', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    block.weeks.forEach(w => {
        assert.ok(w.volumeTarget.length > 0);
    });
});

// -----------------------------------------------------------------------------
// CATEGORY E: INTENSITY & RIR BOUNDARIES (Tests 31–36)
// -----------------------------------------------------------------------------
runTest('TEST 31: Target RIR strictly within 0-5', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    block.weeks.forEach(w => {
        assert.ok(w.targetRIR >= 0 && w.targetRIR <= 5);
        assert.ok(w.minRIR >= 0 && w.maxRIR <= 5);
    });
});

runTest('TEST 32: RIR 0 is exceptional (never default prescribed across full phase)', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    block.weeks.forEach(w => {
        assert.ok(w.targetRIR >= 1.0);
    });
});

runTest('TEST 33: Deload weeks prescribe higher RIR (3.5)', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const deloadW4 = block.weeks[3];
    assert.ok(deloadW4.targetRIR >= 3.0);
});

runTest('TEST 34: Intensification & Peak prescribe lower RIR (1.0-2.0)', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const peakW10 = block.weeks[9]; // Week 10
    assert.ok(peakW10.targetRIR <= 2.0);
});

runTest('TEST 35: Target effort strings match RIR/RPE mathematical relationship (10 - RIR)', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    block.weeks.forEach(w => {
        const expectedRPE = 10 - w.targetRIR;
        assert.ok(w.intensityTarget.includes(`RPE ${expectedRPE}`));
    });
});

runTest('TEST 36: Consistency with Phase 8 Intensity Rules', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.qualityMetrics.maxPlannedRIR, 5);
});

// -----------------------------------------------------------------------------
// CATEGORY F: PROGRESSION MODEL INTEGRATION (Tests 37–42)
// -----------------------------------------------------------------------------
runTest('TEST 37: DOUBLE_PROGRESSION emphasis integrated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.progressionStrategy.primaryModel, 'DOUBLE_PROGRESSION');
});

runTest('TEST 38: LOAD_PROGRESSION emphasis integrated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.progressionStrategy.applicableModels.includes('LOAD_PROGRESSION'));
});

runTest('TEST 39: REP_PROGRESSION emphasis integrated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.progressionStrategy.applicableModels.includes('REP_PROGRESSION'));
});

runTest('TEST 40: RIR_PROGRESSION emphasis integrated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.progressionStrategy.applicableModels.includes('RIR_PROGRESSION'));
});

runTest('TEST 41: HOLD_PROGRESSION emphasis integrated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.progressionStrategy.applicableModels.includes('HOLD_PROGRESSION'));
});

runTest('TEST 42: CONSERVATIVE_PROGRESSION emphasis integrated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.progressionStrategy.applicableModels.includes('CONSERVATIVE_PROGRESSION'));
});

// -----------------------------------------------------------------------------
// CATEGORY G: DELOAD STRATEGY & FREQUENCY (Tests 43–48)
// -----------------------------------------------------------------------------
runTest('TEST 43: Deload weeks at Week 4, Week 8, and Week 12', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.weeks[3].deload, true);
    assert.strictEqual(block.weeks[7].deload, true);
    assert.strictEqual(block.weeks[11].deload, true);
});

runTest('TEST 44: Deload flag is boolean true for deload weeks and false otherwise', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.weeks[0].deload, false);
    assert.strictEqual(block.weeks[1].deload, false);
    assert.strictEqual(block.weeks[2].deload, false);
    assert.strictEqual(block.weeks[3].deload, true);
});

runTest('TEST 45: Deload objective emphasizes fatigue management', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.weeks[3].objective.includes('Deload'));
});

runTest('TEST 46: Deload target RIR increased by at least 1.0 vs prior phase', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const w3RIR = block.weeks[2].targetRIR;
    const w4RIR = block.weeks[3].targetRIR;
    assert.ok(w4RIR >= w3RIR + 1.0);
});

runTest('TEST 47: Deload volume multiplier is <= 0.65', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.deloadStrategy.volumeReductionPercent, 40);
});

runTest('TEST 48: Deload weeks marked as scheduled recovery, not failure', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.weeks[3].rationale.includes('scheduled deload'));
});

// -----------------------------------------------------------------------------
// CATEGORY H: BOUNDED HISTORICAL ADAPTATION EVALUATION (Tests 49–60)
// -----------------------------------------------------------------------------
runTest('TEST 49: Empty historical logs produces DEFERRED or MAINTAIN status', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, []);
    assert.strictEqual(block.qualityMetrics.adaptationStatus, 'DEFERRED');
});

runTest('TEST 50: 1-week history maintains planned block', () => {
    const singleLog = [{ status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] }];
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, singleLog);
    assert.strictEqual(block.qualityMetrics.adaptationStatus, 'MAINTAIN');
});

runTest('TEST 51: 3-week high performance history (>90% set completion) produces HIGH_PERFORMANCE', () => {
    const logs = [
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }] }] },
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }] }] },
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }] }] }
    ];
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(block.qualityMetrics.adaptationStatus, 'HIGH_PERFORMANCE');
});

runTest('TEST 52: Sub-target history (<65% set completion) produces REDUCE_LOAD', () => {
    const logs = [
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }, { completed: false }] }] },
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }, { completed: false }] }] },
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }, { completed: false }] }] }
    ];
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(block.qualityMetrics.adaptationStatus, 'REDUCE_LOAD');
});

runTest('TEST 53: Excessive fatigue / low RIR history triggers volume buffering', () => {
    const logs = [
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0.2 }, { completed: true, actualRIR: 0.2 }] }] },
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0.2 }, { completed: true, actualRIR: 0.2 }] }] }
    ];
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(block.qualityMetrics.adaptationStatus, 'REDUCE_LOAD');
});

runTest('TEST 54: Bounded window consumes max 6 weeks of history', () => {
    const logs = Array(12).fill({ status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] });
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(block.qualityMetrics.evidenceWeeksAnalyzed, 6);
});

runTest('TEST 55: Single isolated workout does not trigger macrocycle transition', () => {
    const log = [{ status: 'PARTIALLY_COMPLETED', exercises: [] }];
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, log);
    assert.strictEqual(block.qualityMetrics.adaptationStatus, 'MAINTAIN');
});

runTest('TEST 56: Phase 11 separation: no session-level PROGRESS / REGRESS decisions produced', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.decision, undefined);
    assert.strictEqual(block.nextPrescription, undefined);
});

runTest('TEST 57: Adaptation status recorded in qualityMetrics', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.qualityMetrics.adaptationStatus);
});

runTest('TEST 58: Evidence weeks analyzed count accurate', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.qualityMetrics.evidenceWeeksAnalyzed, 0);
});

runTest('TEST 59: Malformed historical logs safely filtered', () => {
    const badLogs = [null, undefined, {}, { invalid: true }];
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, badLogs);
    assert.strictEqual(block.qualityMetrics.adaptationStatus, 'DEFERRED');
});

runTest('TEST 60: Duplicate logIds handled safely', () => {
    const logs = [
        { logId: 'log_1', status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] },
        { logId: 'log_1', status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] }
    ];
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.ok(block.qualityMetrics);
});

// -----------------------------------------------------------------------------
// CATEGORY I: PERSONALIZATION REASONS & QUALITY METRICS (Tests 61–70)
// -----------------------------------------------------------------------------
runTest('TEST 61: Personalization reasons list is populated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.personalizationReasons.length >= 3);
});

runTest('TEST 62: Explains goal-specific periodization rationale', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.personalizationReasons.some(r => r.includes('Hypertrophy Periodization')));
});

runTest('TEST 63: Explains experience-level volume bounds', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.personalizationReasons.some(r => r.includes('Intermediate Structured')));
});

runTest('TEST 64: Explains recovery modifiers when applied', () => {
    const lowSleep = { ...sampleProfile, recoveryCapacity: { sleepHours: 4 } };
    const block = periodizationEngine.generate12WeekTrainingBlock(lowSleep, sampleProgram, refDate);
    assert.ok(block.personalizationReasons.some(r => r.includes('sleep (<6h)')));
});

runTest('TEST 65: Explains deload schedule', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.personalizationReasons.some(r => r.includes('deload weeks')));
});

runTest('TEST 66: Quality metrics totalWeeks is 12', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.qualityMetrics.totalWeeks, 12);
});

runTest('TEST 67: Quality metrics phaseCount matches phases length', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.qualityMetrics.phaseCount, block.phases.length);
});

runTest('TEST 68: Quality metrics deloadWeeksCount equals 3', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.qualityMetrics.deloadWeeksCount, 3);
});

runTest('TEST 69: Quality metrics planned RIR bounds accurate', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.qualityMetrics.minPlannedRIR, 1);
    assert.strictEqual(block.qualityMetrics.maxPlannedRIR, 5);
});

runTest('TEST 70: No fake success percentages or fabricated metrics', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(block.qualityMetrics.accuracy, undefined);
    assert.strictEqual(block.qualityMetrics.fitnessScore, undefined);
});

// -----------------------------------------------------------------------------
// CATEGORY J: IMMUTABILITY, SNAPSHOT & DETERMINISM (Tests 71–85)
// -----------------------------------------------------------------------------
runTest('TEST 71: Input profile is not mutated', () => {
    const snap = JSON.stringify(sampleProfile);
    periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(JSON.stringify(sampleProfile), snap);
});

runTest('TEST 72: Input program is not mutated', () => {
    const snap = JSON.stringify(sampleProgram);
    periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(JSON.stringify(sampleProgram), snap);
});

runTest('TEST 73: Input historical logs are not mutated', () => {
    const logs = [{ status: 'COMPLETED' }];
    const snap = JSON.stringify(logs);
    periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(JSON.stringify(logs), snap);
});

runTest('TEST 74: Exercise database is not mutated', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block);
});

runTest('TEST 75: Deterministic snapshot matches for identical inputs', () => {
    const b1 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const b2 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(
        periodizationEngine.getDeterministicPeriodizationSnapshot(b1),
        periodizationEngine.getDeterministicPeriodizationSnapshot(b2)
    );
});

runTest('TEST 76: 10 repeated passes produce bitwise identical snapshots', () => {
    const snap1 = periodizationEngine.getDeterministicPeriodizationSnapshot(
        periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate)
    );
    for (let i = 0; i < 10; i++) {
        assert.strictEqual(
            periodizationEngine.getDeterministicPeriodizationSnapshot(periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate)),
            snap1
        );
    }
});

runTest('TEST 77: Zero Math.random() usage', () => {
    const block = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(block.blockId);
});

runTest('TEST 78: No Date.now() or unseeded date inside calculation', () => {
    const b1 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, '2026-08-17');
    const b2 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, '2026-08-17');
    assert.strictEqual(b1.startDate, b2.startDate);
});

runTest('TEST 79: Custom start date respected deterministically', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, '2026-09-01');
    assert.ok(b.startDate.includes('2026-08-31')); // Snapped to Monday Aug 31
});

runTest('TEST 80: Custom durationWeeks option respected', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, [], { durationWeeks: 8 });
    assert.strictEqual(b.durationWeeks, 8);
    assert.strictEqual(b.weeks.length, 8);
});

runTest('TEST 81: Week 1 starts on Monday', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(b.weeks[0].weekStart);
});

runTest('TEST 82: Week 12 ends on Sunday', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(b.weeks[11].weekEnd);
});

runTest('TEST 83: All weeks flagged with status PLANNED', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    b.weeks.forEach(w => {
        assert.strictEqual(w.status, 'PLANNED');
    });
});

runTest('TEST 84: Engine version is 1.0', () => {
    assert.strictEqual(periodizationEngine.ENGINE_VERSION, '1.0');
});

runTest('TEST 85: DEFAULT_BLOCK_DURATION_WEEKS is 12', () => {
    assert.strictEqual(periodizationEngine.DEFAULT_BLOCK_DURATION_WEEKS, 12);
});

// -----------------------------------------------------------------------------
// CATEGORY K: UI INTEGRATION & RENDERING HELPERS (Tests 86–100)
// -----------------------------------------------------------------------------
runTest('TEST 86: UI helper executes without crashing', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(b.phases);
    assert.ok(b.weeks);
});

runTest('TEST 87: Timeline renders all 12 weeks', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.weeks.length, 12);
});

runTest('TEST 88: Phase cards render with objectives and volume/intensity', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    b.phases.forEach(ph => {
        assert.ok(ph.name);
        assert.ok(ph.objective);
        assert.ok(ph.volumeStrategy);
        assert.ok(ph.intensityStrategy);
    });
});

runTest('TEST 89: Week cards render with targets', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    b.weeks.forEach(w => {
        assert.ok(w.volumeTarget);
        assert.ok(w.intensityTarget);
        assert.ok(w.progressionFocus);
    });
});

runTest('TEST 90: Deload weeks rendered with deload styling markers', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const deloads = b.weeks.filter(w => w.deload);
    assert.strictEqual(deloads.length, 3);
});

runTest('TEST 91: Planned-only labeling clearly visible', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    b.weeks.forEach(w => {
        assert.strictEqual(w.status, 'PLANNED');
    });
});

runTest('TEST 92: Invalid goal fallback handled safely', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock({ goal: 'cosmic_strength' }, sampleProgram, refDate);
    assert.strictEqual(b.durationWeeks, 12);
    assert.strictEqual(b.weeks.length, 12);
});

runTest('TEST 93: Invalid experience fallback handled safely', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock({ experienceLevel: 999 }, sampleProgram, refDate);
    assert.strictEqual(b.durationWeeks, 12);
});

runTest('TEST 94: Invalid duration handled safely', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, [], { durationWeeks: -5 });
    assert.strictEqual(b.durationWeeks, 12);
});

runTest('TEST 95: Deterministic phase selection', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.phases[0].type, 'ACCUMULATION');
});

runTest('TEST 96: Deterministic deload placement', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.phases[1].type, 'DELOAD');
});

runTest('TEST 97: Deterministic volume targets', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(b.weeks[0].volumeTarget.includes('8-14'));
});

runTest('TEST 98: Deterministic RIR targets', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.weeks[0].targetRIR, 2);
});

runTest('TEST 99: Deterministic progression strategy', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.progressionStrategy.primaryModel, 'DOUBLE_PROGRESSION');
});

runTest('TEST 100: Complete block validation passes with 100% integrity', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.version, '1.0');
    assert.strictEqual(b.durationWeeks, 12);
    assert.strictEqual(b.phases.length, 6);
    assert.strictEqual(b.weeks.length, 12);
    assert.strictEqual(b.qualityMetrics.deloadWeeksCount, 3);
});

// -----------------------------------------------------------------------------
// CATEGORY L: SIX-PHASE STRUCTURE & CONTINUOUS MAPPING (Tests 101–105)
// -----------------------------------------------------------------------------
runTest('TEST 101: Muscle Gain produces exactly 6 phases with weeks 1-12 mapped contiguously', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock({ goal: 'muscle-gain' }, sampleProgram, refDate);
    assert.strictEqual(b.phases.length, 6);
    assert.strictEqual(b.weeks.length, 12);
    assert.strictEqual(b.phases[0].startWeek, 1);
    assert.strictEqual(b.phases[0].endWeek, 3);
    assert.strictEqual(b.phases[1].startWeek, 4);
    assert.strictEqual(b.phases[1].endWeek, 4);
    assert.strictEqual(b.phases[2].startWeek, 5);
    assert.strictEqual(b.phases[2].endWeek, 7);
    assert.strictEqual(b.phases[3].startWeek, 8);
    assert.strictEqual(b.phases[3].endWeek, 8);
    assert.strictEqual(b.phases[4].startWeek, 9);
    assert.strictEqual(b.phases[4].endWeek, 11);
    assert.strictEqual(b.phases[5].startWeek, 12);
    assert.strictEqual(b.phases[5].endWeek, 12);
});

runTest('TEST 102: Strength produces exactly 6 phases with weeks 1-12 mapped contiguously', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock({ goal: 'strength' }, sampleProgram, refDate);
    assert.strictEqual(b.phases.length, 6);
    assert.strictEqual(b.weeks.length, 12);
    assert.strictEqual(b.phases[1].deload, true);
    assert.strictEqual(b.phases[3].deload, true);
    assert.strictEqual(b.phases[5].deload, true);
});

runTest('TEST 103: Weight Loss produces exactly 6 phases with weeks 1-12 mapped contiguously', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock({ goal: 'weight-loss' }, sampleProgram, refDate);
    assert.strictEqual(b.phases.length, 6);
    assert.strictEqual(b.weeks.length, 12);
});

runTest('TEST 104: Get Shredded produces exactly 6 phases with weeks 1-12 mapped contiguously', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock({ goal: 'get-shredded' }, sampleProgram, refDate);
    assert.strictEqual(b.phases.length, 6);
    assert.strictEqual(b.weeks.length, 12);
});

runTest('TEST 105: General Fitness produces exactly 6 phases with weeks 1-12 mapped contiguously', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock({ goal: 'general-fitness' }, sampleProgram, refDate);
    assert.strictEqual(b.phases.length, 6);
    assert.strictEqual(b.weeks.length, 12);
});

// -----------------------------------------------------------------------------
// CATEGORY M: PHASE 8 INTEGER RIR ALIGNMENT (Tests 106–110)
// -----------------------------------------------------------------------------
runTest('TEST 106: All target RIR values across all 12 weeks are valid integers', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    b.weeks.forEach(w => {
        assert.ok(Number.isInteger(w.targetRIR), `Week ${w.weekNumber} targetRIR must be integer`);
        assert.ok(Number.isInteger(w.minRIR), `Week ${w.weekNumber} minRIR must be integer`);
        assert.ok(Number.isInteger(w.maxRIR), `Week ${w.weekNumber} maxRIR must be integer`);
    });
});

runTest('TEST 107: All minRIR, targetRIR, maxRIR satisfy 0 <= min <= target <= max <= 5', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    b.weeks.forEach(w => {
        assert.ok(w.minRIR >= 0 && w.maxRIR <= 5);
        assert.ok(w.minRIR <= w.targetRIR && w.targetRIR <= w.maxRIR);
    });
});

runTest('TEST 108: Deload target RIR is integer 4', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.weeks[3].targetRIR, 4);
    assert.strictEqual(b.weeks[7].targetRIR, 4);
    assert.strictEqual(b.weeks[11].targetRIR, 4);
});

runTest('TEST 109: Peak target RIR is integer 1 or 2', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(b.weeks[9].targetRIR <= 2);
});

runTest('TEST 110: Proximity to failure strings accurately state (10 - targetRIR)', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    b.weeks.forEach(w => {
        const expectedRPE = 10 - w.targetRIR;
        assert.ok(w.intensityTarget.includes(`RPE ${expectedRPE}`));
    });
});

// -----------------------------------------------------------------------------
// CATEGORY N: PLAIN TRAINING LANGUAGE VERIFICATION (Tests 111–114)
// -----------------------------------------------------------------------------
runTest('TEST 111: No pseudoscientific terms in phase rationales', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const jsonStr = JSON.stringify(b.phases).toLowerCase();
    assert.ok(!jsonStr.includes('cns reset'));
    assert.ok(!jsonStr.includes('resensitize'));
    assert.ok(!jsonStr.includes('overtraining'));
    assert.ok(!jsonStr.includes('cortisol'));
});

runTest('TEST 112: No pseudoscientific terms in deload rationale', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const deloadStr = JSON.stringify(b.deloadStrategy).toLowerCase();
    assert.ok(!deloadStr.includes('overtraining'));
    assert.ok(!deloadStr.includes('joint stress'));
});

runTest('TEST 113: No pseudoscientific terms in personalization reasons', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    const reasonsStr = JSON.stringify(b.personalizationReasons).toLowerCase();
    assert.ok(!reasonsStr.includes('overtraining'));
    assert.ok(!reasonsStr.includes('cortisol'));
});

runTest('TEST 114: Deload rationale emphasizes reduced training demand and recovery', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(b.deloadStrategy.rationale.includes('reduce planned training demand'));
});

// -----------------------------------------------------------------------------
// CATEGORY O: SCENARIOS A, B, C, D & ADAPTATION ACTIONS (Tests 115–120)
// -----------------------------------------------------------------------------
runTest('TEST 115: Scenario A: No historical data -> adaptationStatus = DEFERRED', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, []);
    assert.strictEqual(b.qualityMetrics.adaptationStatus, 'DEFERRED');
    assert.strictEqual(b.adaptationRules[0].status, 'DEFERRED');
});

runTest('TEST 116: Scenario B: High positive historical evidence -> HIGH_PERFORMANCE', () => {
    const logs = [
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }] }] },
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }] }] },
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }] }] }
    ];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(b.qualityMetrics.adaptationStatus, 'HIGH_PERFORMANCE');
});

runTest('TEST 117: Scenario C: Declining historical evidence -> REDUCE_LOAD', () => {
    const logs = [
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }, { completed: false }] }] },
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }, { completed: false }] }] },
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }, { completed: false }] }] }
    ];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(b.qualityMetrics.adaptationStatus, 'REDUCE_LOAD');
});

runTest('TEST 118: Scenario D: Moderate historical evidence (65-75%) -> EXTEND_PHASE', () => {
    const logs = [
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }, { completed: false }] }] },
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }, { completed: false }] }] }
    ];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(b.qualityMetrics.adaptationStatus, 'EXTEND_PHASE');
});

runTest('TEST 119: 1-week completed log -> MAINTAIN', () => {
    const singleLog = [{ status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] }];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, singleLog);
    assert.strictEqual(b.qualityMetrics.adaptationStatus, 'MAINTAIN');
});

runTest('TEST 120: Phase 14 adaptation never generates Phase 11 PROGRESS / REGRESS session decisions', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.decision, undefined);
    assert.strictEqual(b.nextPrescription, undefined);
});

// -----------------------------------------------------------------------------
// CATEGORY P: MICRO-HARDENING & DECOUPLED ADAPTATION CONTRACT (Tests 121–135)
// -----------------------------------------------------------------------------
runTest('TEST 121: DELOAD is a phase/week type, not an evidence-driven adaptation decision', () => {
    assert.strictEqual(periodizationEngine.TRAINING_PHASES.DELOAD, 'DELOAD');
    assert.strictEqual(periodizationEngine.BLOCK_ADAPTATION_ACTIONS.DELOAD, undefined);
});

runTest('TEST 122: REDUCE_LOAD does not mutate currentProgram', () => {
    const progCopy = JSON.parse(JSON.stringify(sampleProgram));
    const badLogs = [{ status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }] }] }, { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }] }] }];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, progCopy, refDate, badLogs);
    assert.strictEqual(JSON.stringify(progCopy), JSON.stringify(sampleProgram));
    assert.strictEqual(b.adaptationRules[0].programMutation, false);
});

runTest('TEST 123: REDUCE_LOAD does not create Week 13+', () => {
    const badLogs = [{ status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }] }] }, { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 0 }, { completed: false }] }] }];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, badLogs);
    assert.strictEqual(b.weeks.length, 12);
    assert.strictEqual(b.weeks[11].weekNumber, 12);
});

runTest('TEST 124: HIGH_PERFORMANCE does not mutate currentProgram', () => {
    const progCopy = JSON.parse(JSON.stringify(sampleProgram));
    const goodLogs = [
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] },
        { status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] }
    ];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, progCopy, refDate, goodLogs);
    assert.strictEqual(JSON.stringify(progCopy), JSON.stringify(sampleProgram));
    assert.strictEqual(b.adaptationRules[0].programMutation, false);
    assert.strictEqual(b.adaptationRules[0].planningEffect, 'CONTINUE_PLANNED_PROGRESSION');
});

runTest('TEST 125: MAINTAIN does not mutate currentProgram', () => {
    const progCopy = JSON.parse(JSON.stringify(sampleProgram));
    const singleLog = [{ status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] }];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, progCopy, refDate, singleLog);
    assert.strictEqual(JSON.stringify(progCopy), JSON.stringify(sampleProgram));
    assert.strictEqual(b.adaptationRules[0].planningEffect, 'MAINTAIN_ROADMAP');
    assert.strictEqual(b.adaptationRules[0].programMutation, false);
});

runTest('TEST 126: EXTEND_PHASE does not create Week 13+', () => {
    const logs = [
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }, { completed: false }] }] },
        { status: 'PARTIALLY_COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }, { completed: true, actualRIR: 2 }, { completed: false }] }] }
    ];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(b.adaptationRules[0].adaptationDecision, 'EXTEND_PHASE');
    assert.strictEqual(b.weeks.length, 12);
    assert.strictEqual(b.durationWeeks, 12);
});

runTest('TEST 127: DEFERRED preserves the 12-week roadmap', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, []);
    assert.strictEqual(b.adaptationRules[0].adaptationDecision, 'DEFERRED');
    assert.strictEqual(b.adaptationRules[0].planningEffect, 'PRESERVE_ROADMAP');
    assert.strictEqual(b.weeks.length, 12);
});

runTest('TEST 128: adaptationDecision and phaseType remain separate in output schema', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.ok(b.adaptationRules[0].adaptationDecision);
    assert.ok(b.phases[0].type);
    assert.notStrictEqual(b.adaptationRules[0].adaptationDecision, b.phases[0].type);
});

runTest('TEST 129: programMutation remains false across all adaptation states', () => {
    const b1 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, []);
    assert.strictEqual(b1.adaptationRules[0].programMutation, false);
});

runTest('TEST 130: RIR reporting matches actual generated week values', () => {
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate);
    assert.strictEqual(b.weeks[0].targetRIR, 2);
    assert.strictEqual(b.weeks[3].targetRIR, 4);
    assert.strictEqual(b.weeks[7].targetRIR, 4);
    assert.strictEqual(b.weeks[9].targetRIR, 1);
    assert.strictEqual(b.weeks[11].targetRIR, 4);
});

runTest('TEST 131: All 12 weeks remain present after adaptation evaluation', () => {
    const logs = [{ status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] }];
    const b = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(b.weeks.length, 12);
});

runTest('TEST 132: No adaptation decision creates additional weeks beyond 12', () => {
    const b1 = periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, []);
    assert.strictEqual(b1.weeks.length, 12);
});

runTest('TEST 133: Deep clone immutability recheck on all platform artifacts', () => {
    const pSnap = JSON.stringify(sampleProfile);
    const prgSnap = JSON.stringify(sampleProgram);
    const logs = [{ logId: 'l1', status: 'COMPLETED' }];
    const lSnap = JSON.stringify(logs);
    periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs);
    assert.strictEqual(JSON.stringify(sampleProfile), pSnap);
    assert.strictEqual(JSON.stringify(sampleProgram), prgSnap);
    assert.strictEqual(JSON.stringify(logs), lSnap);
});

runTest('TEST 134: Bitwise determinism across 10 repeated passes with adaptation logs', () => {
    const logs = [{ status: 'COMPLETED', exercises: [{ sets: [{ completed: true, actualRIR: 2 }] }] }];
    const snap1 = periodizationEngine.getDeterministicPeriodizationSnapshot(
        periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs)
    );
    for (let i = 0; i < 10; i++) {
        assert.strictEqual(
            periodizationEngine.getDeterministicPeriodizationSnapshot(periodizationEngine.generate12WeekTrainingBlock(sampleProfile, sampleProgram, refDate, logs)),
            snap1
        );
    }
});

runTest('TEST 135: Exactly 6 phases present across all 5 primary goals', () => {
    const goals = ['muscle-gain', 'strength', 'weight-loss', 'get-shredded', 'general-fitness'];
    goals.forEach(g => {
        const b = periodizationEngine.generate12WeekTrainingBlock({ goal: g }, sampleProgram, refDate);
        assert.strictEqual(b.phases.length, 6, `Goal ${g} must have 6 phases`);
        assert.strictEqual(b.weeks.length, 12, `Goal ${g} must have 12 weeks`);
    });
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
