/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PERSONALIZATION EXPLANATION ENGINE TEST SUITE (PHASE 15)
 * ==============================================================================
 * 
 * 100 Dedicated Automated Tests for Personalization Explanation & Decision Transparency.
 */

const assert = require('assert');
const explanationEngine = require('../js/engine/personalization-explanations.js');

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
console.log('RUNNING PERSONALIZATION EXPLANATION ENGINE TEST SUITE (PHASE 15)');
console.log('================================================================\n');

// Standard Test Fixtures
const sampleProfile = {
    goal: 'muscle-gain',
    experienceLevel: 'intermediate',
    daysPerWeek: 4,
    equipment: ['barbell', 'dumbbell', 'cable', 'bench'],
    injuries: ['knee'],
    recoveryCapacity: {
        sleepHours: 7,
        dailyActivityLevel: 'moderate'
    }
};

const sampleRequirements = {
    goal: 'muscle-gain',
    weeklyVolumeSets: { min: 8, max: 14 },
    targetRepRanges: ['8-12 reps'],
    progressionModel: 'DOUBLE_PROGRESSION',
    targetRIR: 2
};

const sampleProgram = {
    splitName: 'Upper / Lower Split',
    progressionModel: 'DOUBLE_PROGRESSION',
    sessions: [
        {
            day: 'Monday',
            focus: 'Upper Body A',
            exercises: [
                {
                    exerciseId: 'barbell_bench_press',
                    name: 'Barbell Bench Press',
                    pattern: 'Horizontal Push',
                    targetMuscles: ['Chest', 'Triceps', 'Front Shoulders'],
                    equipment: 'barbell',
                    isCompound: true
                },
                {
                    exerciseId: 'dumbbell_row',
                    name: 'Dumbbell Row',
                    pattern: 'Horizontal Pull',
                    targetMuscles: ['Upper Back', 'Lats', 'Biceps'],
                    equipment: 'dumbbell',
                    isCompound: true
                }
            ]
        },
        {
            day: 'Tuesday',
            focus: 'Lower Body A',
            exercises: [
                {
                    exerciseId: 'romanian_deadlift',
                    name: 'Romanian Deadlift',
                    pattern: 'Hip Hinge',
                    targetMuscles: ['Hamstrings', 'Glutes'],
                    equipment: 'barbell',
                    isCompound: true
                }
            ]
        }
    ]
};

const sampleValidation = {
    isValid: true,
    status: 'VALID',
    errors: [],
    warnings: []
};

// -----------------------------------------------------------------------------
// CATEGORY A: ENGINE INITIALIZATION & SCHEMA STRUCTURE (Tests 1–10)
// -----------------------------------------------------------------------------
runTest('TEST 1: Explanation engine loads successfully with version 1.0', () => {
    assert.strictEqual(explanationEngine.ENGINE_VERSION, '1.0');
});

runTest('TEST 2: Enums are exported and immutable', () => {
    assert.ok(explanationEngine.EXPLANATION_CATEGORIES.PROFILE);
    assert.ok(explanationEngine.EVIDENCE_STATUS.COMPLETE);
    assert.ok(explanationEngine.CONFIDENCE_LEVEL.HIGH);
    assert.ok(explanationEngine.PRIORITY_LEVEL.HIGH);
});

runTest('TEST 3: generatePersonalizationExplanation returns valid schema', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.version, '1.0');
    assert.ok(expl.explanationId);
    assert.ok(expl.summary);
    assert.ok(Array.isArray(expl.profileFactors));
    assert.ok(Array.isArray(expl.goalDecisions));
    assert.ok(Array.isArray(expl.scheduleDecisions));
    assert.ok(Array.isArray(expl.exerciseDecisions));
    assert.ok(Array.isArray(expl.intensityDecisions));
    assert.ok(Array.isArray(expl.progressionDecisions));
    assert.ok(Array.isArray(expl.validationDecisions));
    assert.ok(Array.isArray(expl.periodizationDecisions));
    assert.ok(Array.isArray(expl.personalizationReasons));
    assert.ok(expl.evidenceCoverage);
    assert.ok(expl.confidence);
    assert.ok(Array.isArray(expl.limitations));
    assert.ok(expl.deterministicSnapshot);
});

runTest('TEST 4: Tolerates null profile input gracefully', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(null, sampleRequirements, sampleProgram);
    assert.ok(expl);
    assert.strictEqual(expl.version, '1.0');
});

runTest('TEST 5: Tolerates null requirements input gracefully', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, null, sampleProgram);
    assert.ok(expl);
});

runTest('TEST 6: Tolerates null program input gracefully', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, null);
    assert.ok(expl);
});

runTest('TEST 7: Tolerates empty object inputs', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({}, {}, {});
    assert.ok(expl);
    assert.strictEqual(expl.version, '1.0');
});

runTest('TEST 8: Explanation records have all standard fields (factor, source, decision, rationale, evidence, priority)', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    expl.profileFactors.forEach(f => {
        assert.ok(f.category);
        assert.ok(f.factor);
        assert.ok(f.source);
        assert.ok(f.decision);
        assert.ok(f.rationale);
        assert.ok(f.evidence);
        assert.ok(f.priority);
    });
});

runTest('TEST 9: Priority levels are valid enum values', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
    expl.profileFactors.forEach(f => {
        assert.ok(validPriorities.includes(f.priority));
    });
});

runTest('TEST 10: Sources identify origin engine accurately', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, sampleValidation);
    const sources = expl.personalizationReasons.map(r => r.source);
    assert.ok(sources.includes('canonical-profile'));
    assert.ok(sources.includes('program-generator'));
});

// -----------------------------------------------------------------------------
// CATEGORY B: DETERMINISTIC OUTPUT & SNAPSHOT CONSISTENCY (Tests 11–18)
// -----------------------------------------------------------------------------
runTest('TEST 11: Identical inputs produce identical explanationId', () => {
    const e1 = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const e2 = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(e1.explanationId, e2.explanationId);
});

runTest('TEST 12: Identical inputs produce identical summary', () => {
    const e1 = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const e2 = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(e1.summary, e2.summary);
});

runTest('TEST 13: Deterministic snapshots are identical across 10 repeated passes', () => {
    const snap1 = explanationEngine.getDeterministicExplanationSnapshot(
        explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram)
    );
    for (let i = 0; i < 10; i++) {
        const snapX = explanationEngine.getDeterministicExplanationSnapshot(
            explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram)
        );
        assert.strictEqual(JSON.stringify(snapX), JSON.stringify(snap1));
    }
});

runTest('TEST 14: getDeterministicExplanationSnapshot handles null input', () => {
    assert.strictEqual(explanationEngine.getDeterministicExplanationSnapshot(null), null);
});

runTest('TEST 15: No Math.random or Date.now in deterministic snapshot', () => {
    const snap = explanationEngine.getDeterministicExplanationSnapshot(
        explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram)
    );
    assert.strictEqual(snap.timestamp, undefined);
    assert.strictEqual(snap.generatedAt, undefined);
});

runTest('TEST 16: Snapshot counts accurately reflect explanation lists', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const snap = expl.deterministicSnapshot;
    assert.strictEqual(snap.profileFactorsCount, expl.profileFactors.length);
    assert.strictEqual(snap.goalDecisionsCount, expl.goalDecisions.length);
    assert.strictEqual(snap.exerciseDecisionsCount, expl.exerciseDecisions.length);
});

runTest('TEST 17: Summary text format is consistent and informative', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.ok(expl.summary.includes('Muscle Gain'));
    assert.ok(expl.summary.includes('4-day'));
});

runTest('TEST 18: ExplanationId reflects goal, experience, and days', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.explanationId, 'expl_muscle_gain_intermediate_4d');
});

// -----------------------------------------------------------------------------
// CATEGORY C: PROFILE FACTOR EXPLANATIONS (Tests 19–28)
// -----------------------------------------------------------------------------
runTest('TEST 19: Explains primary goal correctly', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ goal: 'strength' });
    const goalFactor = expl.profileFactors.find(f => f.factor === 'Primary Goal');
    assert.ok(goalFactor);
    assert.ok(goalFactor.rationale.includes('strength'));
});

runTest('TEST 20: Explains 2-day schedule frequency', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ daysPerWeek: 2 });
    const schedFactor = expl.profileFactors.find(f => f.factor === 'Weekly Frequency');
    assert.ok(schedFactor);
    assert.ok(schedFactor.rationale.includes('two-day'));
});

runTest('TEST 21: Explains 3-day schedule frequency', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ daysPerWeek: 3 });
    const schedFactor = expl.profileFactors.find(f => f.factor === 'Weekly Frequency');
    assert.ok(schedFactor);
    assert.ok(schedFactor.rationale.includes('three-day'));
});

runTest('TEST 22: Explains 4-day schedule frequency', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ daysPerWeek: 4 });
    const schedFactor = expl.profileFactors.find(f => f.factor === 'Weekly Frequency');
    assert.ok(schedFactor);
    assert.ok(schedFactor.rationale.includes('four-day'));
});

runTest('TEST 23: Explains 5-day schedule frequency', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ daysPerWeek: 5 });
    const schedFactor = expl.profileFactors.find(f => f.factor === 'Weekly Frequency');
    assert.ok(schedFactor);
    assert.ok(schedFactor.rationale.includes('five-day'));
});

runTest('TEST 24: Explains 6-day schedule frequency', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ daysPerWeek: 6 });
    const schedFactor = expl.profileFactors.find(f => f.factor === 'Weekly Frequency');
    assert.ok(schedFactor);
    assert.ok(schedFactor.rationale.includes('six-day'));
});

runTest('TEST 25: Explains beginner experience level conservatively', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ experienceLevel: 'beginner' });
    const expFactor = expl.profileFactors.find(f => f.factor === 'Experience Level');
    assert.ok(expFactor);
    assert.ok(expFactor.rationale.includes('beginner'));
    assert.ok(expFactor.rationale.includes('conservatively'));
});

runTest('TEST 26: Explains advanced experience level with higher capacity', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ experienceLevel: 'advanced' });
    const expFactor = expl.profileFactors.find(f => f.factor === 'Experience Level');
    assert.ok(expFactor);
    assert.ok(expFactor.rationale.includes('advanced'));
});

runTest('TEST 27: Explains equipment availability filtering', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ equipment: ['dumbbell', 'bodyweight'] });
    const equipFactor = expl.profileFactors.find(f => f.factor === 'Equipment Access');
    assert.ok(equipFactor);
    assert.ok(equipFactor.rationale.includes('dumbbell, bodyweight'));
});

runTest('TEST 28: Explains physical constraint exclusion gate', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ injuries: ['knee', 'shoulder'] });
    const injuryFactor = expl.profileFactors.find(f => f.factor === 'Physical Constraints');
    assert.ok(injuryFactor);
    assert.ok(injuryFactor.rationale.includes('knee, shoulder'));
});

// -----------------------------------------------------------------------------
// CATEGORY D: GOAL DECISION EXPLANATIONS ACROSS ALL 5 GOALS (Tests 29–38)
// -----------------------------------------------------------------------------
runTest('TEST 29: Muscle Gain goal produces hypertrophy volume and rep explanations', () => {
    const expl = explanationEngine.generatePersonalizationExplanation({ goal: 'muscle-gain' }, sampleRequirements, sampleProgram);
    assert.ok(expl.goalDecisions.some(g => g.factor === 'Weekly Volume Strategy'));
    assert.ok(expl.goalDecisions.some(g => g.factor === 'Repetition Ranges'));
});

runTest('TEST 30: Strength goal produces strength-oriented explanations', () => {
    const req = { goal: 'strength', weeklyVolumeSets: { min: 6, max: 12 }, targetRepRanges: ['3-6 reps'], progressionModel: 'LOAD_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation({ goal: 'strength' }, req, sampleProgram);
    assert.ok(expl.goalDecisions.some(g => g.rationale.includes('strength')));
});

runTest('TEST 31: Weight Loss goal produces muscle retention explanations', () => {
    const req = { goal: 'weight-loss', weeklyVolumeSets: { min: 8, max: 12 }, targetRepRanges: ['10-15 reps'], progressionModel: 'DOUBLE_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation({ goal: 'weight-loss' }, req, sampleProgram);
    assert.ok(expl.goalDecisions.some(g => g.rationale.includes('weight loss')));
});

runTest('TEST 32: Get Shredded goal produces definition & density explanations', () => {
    const req = { goal: 'get-shredded', weeklyVolumeSets: { min: 8, max: 14 }, targetRepRanges: ['8-12 reps'], progressionModel: 'DOUBLE_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation({ goal: 'get-shredded' }, req, sampleProgram);
    assert.ok(expl.goalDecisions.some(g => g.rationale.includes('get shredded')));
});

runTest('TEST 33: General Fitness goal produces balanced conditioning explanations', () => {
    const req = { goal: 'general-fitness', weeklyVolumeSets: { min: 6, max: 10 }, targetRepRanges: ['10-15 reps'], progressionModel: 'CONSERVATIVE_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation({ goal: 'general-fitness' }, req, sampleProgram);
    assert.ok(expl.goalDecisions.some(g => g.rationale.includes('general fitness')));
});

runTest('TEST 34: Volume set range numbers match actual requirements', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const vol = expl.goalDecisions.find(g => g.factor === 'Weekly Volume Strategy');
    assert.ok(vol.decision.includes('8-14 Sets'));
});

runTest('TEST 35: Target rep range string matches requirements', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const reps = expl.goalDecisions.find(g => g.factor === 'Repetition Ranges');
    assert.ok(reps.evidence.includes('8-12 reps'));
});

runTest('TEST 36: Primary progression framework matches requirements', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const prog = expl.goalDecisions.find(g => g.factor === 'Primary Progression Framework');
    assert.strictEqual(prog.decision, 'Double Progression');
});

runTest('TEST 37: Tolerates missing targetRepRanges gracefully', () => {
    const req = { goal: 'muscle-gain', weeklyVolumeSets: { min: 8, max: 14 } };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, req, sampleProgram);
    assert.ok(expl);
});

runTest('TEST 38: Tolerates missing weeklyVolumeSets gracefully', () => {
    const req = { goal: 'muscle-gain', progressionModel: 'DOUBLE_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, req, sampleProgram);
    assert.ok(expl);
});

// -----------------------------------------------------------------------------
// CATEGORY E: SCHEDULE DECISION EXPLANATIONS ACROSS SPLITS (Tests 39–46)
// -----------------------------------------------------------------------------
runTest('TEST 39: Explains Upper/Lower split architecture', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const splitDec = expl.scheduleDecisions.find(s => s.factor === 'Workout Split Architecture');
    assert.ok(splitDec);
    assert.ok(splitDec.rationale.includes('Upper / Lower Split'));
});

runTest('TEST 40: Explains Full Body split architecture', () => {
    const prog = { splitName: 'Full Body', sessions: [{ day: 'Day 1' }, { day: 'Day 2' }, { day: 'Day 3' }] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const splitDec = expl.scheduleDecisions.find(s => s.factor === 'Workout Split Architecture');
    assert.ok(splitDec.decision.includes('Full Body'));
});

runTest('TEST 41: Explains Push/Pull/Legs split architecture', () => {
    const prog = { splitName: 'Push / Pull / Legs', sessions: [{ day: 'Push' }, { day: 'Pull' }, { day: 'Legs' }] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const splitDec = expl.scheduleDecisions.find(s => s.factor === 'Workout Split Architecture');
    assert.ok(splitDec.decision.includes('Push / Pull / Legs'));
});

runTest('TEST 42: Individual session focus decisions are generated', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.ok(expl.scheduleDecisions.some(s => s.factor === 'Monday Structure'));
    assert.ok(expl.scheduleDecisions.some(s => s.factor === 'Tuesday Structure'));
});

runTest('TEST 43: Session count matches program sessions length', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const splitDec = expl.scheduleDecisions.find(s => s.factor === 'Workout Split Architecture');
    assert.ok(splitDec.evidence.includes('sessions: 2'));
});

runTest('TEST 44: Handles empty sessions gracefully', () => {
    const prog = { splitName: 'Custom', sessions: [] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    assert.ok(expl.scheduleDecisions);
});

runTest('TEST 45: Handles missing splitName with fallback', () => {
    const prog = { sessions: [{ day: 'Day 1' }] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const splitDec = expl.scheduleDecisions.find(s => s.factor === 'Workout Split Architecture');
    assert.ok(splitDec);
});

runTest('TEST 46: Day focus defaults cleanly if unspecified', () => {
    const prog = { sessions: [{ day: 'Wednesday' }] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const dayDec = expl.scheduleDecisions.find(s => s.factor === 'Wednesday Structure');
    assert.ok(dayDec);
});

// -----------------------------------------------------------------------------
// CATEGORY F: EXERCISE SELECTION RATIONALE (Tests 47–54)
// -----------------------------------------------------------------------------
runTest('TEST 47: Generates an explanation for every exercise in the program', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.exerciseDecisions.length, 3);
});

runTest('TEST 48: Explains Barbell Bench Press selection factors', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const bp = expl.exerciseDecisions.find(e => e.factor.includes('Barbell Bench Press'));
    assert.ok(bp);
    assert.ok(bp.rationale.includes('Horizontal Push'));
    assert.ok(bp.rationale.includes('Chest'));
    assert.ok(bp.rationale.includes('barbell'));
});

runTest('TEST 49: Explains Romanian Deadlift selection factors', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const rdl = expl.exerciseDecisions.find(e => e.factor.includes('Romanian Deadlift'));
    assert.ok(rdl);
    assert.ok(rdl.rationale.includes('Hip Hinge'));
    assert.ok(rdl.rationale.includes('Hamstrings'));
});

runTest('TEST 50: Distinguishes compound vs isolation movement types', () => {
    const progWithIso = {
        sessions: [{
            day: 'Arm Day',
            exercises: [
                { name: 'Bicep Curl', pattern: 'Elbow Flexion', targetMuscles: ['Biceps'], equipment: 'dumbbell', isCompound: false }
            ]
        }]
    };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, progWithIso);
    assert.ok(expl.exerciseDecisions[0].decision.includes('Isolation'));
});

runTest('TEST 51: Handles exercise with array of target muscles', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const bp = expl.exerciseDecisions.find(e => e.factor.includes('Barbell Bench Press'));
    assert.ok(bp.evidence.includes('Chest, Triceps, Front Shoulders'));
});

runTest('TEST 52: Handles exercise with single target muscle string', () => {
    const prog = { sessions: [{ exercises: [{ name: 'Lateral Raise', pattern: 'Abduction', targetMuscle: 'Side Delts', equipment: 'dumbbell' }] }] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    assert.ok(expl.exerciseDecisions[0].evidence.includes('Side Delts'));
});

runTest('TEST 53: Handles empty exercise list without error', () => {
    const prog = { sessions: [{ day: 'Rest Day', exercises: [] }] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    assert.strictEqual(expl.exerciseDecisions.length, 0);
});

runTest('TEST 54: Does not claim exercise is "best" without engine basis', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    expl.exerciseDecisions.forEach(e => {
        assert.ok(!e.rationale.includes('best exercise'));
    });
});

// -----------------------------------------------------------------------------
// CATEGORY G: PHASE 8 INTENSITY / RIR / RPE TRANSPARENCY (Tests 55–62)
// -----------------------------------------------------------------------------
runTest('TEST 55: Explains target RIR and derived RPE accurately', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, { targetRIR: 2 }, sampleProgram);
    const intDec = expl.intensityDecisions.find(i => i.factor.includes('Planned Effort Proximity'));
    assert.ok(intDec);
    assert.ok(intDec.decision.includes('Target RIR 2 (RPE 8)'));
});

runTest('TEST 56: Verifies formula RPE = 10 - targetRIR', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, { targetRIR: 3 }, sampleProgram);
    const intDec = expl.intensityDecisions.find(i => i.factor.includes('Planned Effort Proximity'));
    assert.ok(intDec.decision.includes('Target RIR 3 (RPE 7)'));
});

runTest('TEST 57: Target RIR 4 explains greater reserve distance', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, { targetRIR: 4 }, sampleProgram);
    const intDec = expl.intensityDecisions.find(i => i.factor.includes('Planned Effort Proximity'));
    assert.ok(intDec.decision.includes('Target RIR 4 (RPE 6)'));
});

runTest('TEST 58: Target RIR 1 explains close proximity to failure', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, { targetRIR: 1 }, sampleProgram);
    const intDec = expl.intensityDecisions.find(i => i.factor.includes('Planned Effort Proximity'));
    assert.ok(intDec.decision.includes('Target RIR 1 (RPE 9)'));
});

runTest('TEST 59: Explains compound vs isolation effort allocation buffer', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const compDec = expl.intensityDecisions.find(i => i.factor.includes('Compound vs Isolation'));
    assert.ok(compDec);
    assert.ok(compDec.rationale.includes('RIR 2-3'));
});

runTest('TEST 60: Intensity decision source is intensity-rules', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    expl.intensityDecisions.forEach(i => {
        assert.strictEqual(i.source, 'intensity-rules');
    });
});

runTest('TEST 61: No medical or hormonal claims in intensity explanations', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const jsonStr = JSON.stringify(expl.intensityDecisions).toLowerCase();
    assert.ok(!jsonStr.includes('cns reset'));
    assert.ok(!jsonStr.includes('cortisol'));
});

runTest('TEST 62: Handles missing targetRIR defaulting to RIR 2', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, {}, sampleProgram);
    const intDec = expl.intensityDecisions.find(i => i.factor.includes('Planned Effort Proximity'));
    assert.ok(intDec.decision.includes('RIR 2'));
});

// -----------------------------------------------------------------------------
// CATEGORY H: PHASE 9 PROGRESSIVE OVERLOAD MODELS (Tests 63–70)
// -----------------------------------------------------------------------------
runTest('TEST 63: Explains DOUBLE_PROGRESSION model accurately', () => {
    const prog = { progressionModel: 'DOUBLE_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const prg = expl.progressionDecisions[0];
    assert.strictEqual(prg.decision, 'Double Progression');
    assert.ok(prg.rationale.includes('repetitions are progressed to the upper limit'));
});

runTest('TEST 64: Explains LOAD_PROGRESSION model accurately', () => {
    const prog = { progressionModel: 'LOAD_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const prg = expl.progressionDecisions[0];
    assert.strictEqual(prg.decision, 'Load Progression');
    assert.ok(prg.rationale.includes('resistance is incrementally increased'));
});

runTest('TEST 65: Explains REP_PROGRESSION model accurately', () => {
    const prog = { progressionModel: 'REP_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const prg = expl.progressionDecisions[0];
    assert.strictEqual(prg.decision, 'Rep Progression');
    assert.ok(prg.rationale.includes('adding repetitions within prescribed limits'));
});

runTest('TEST 66: Explains RIR_PROGRESSION model accurately', () => {
    const prog = { progressionModel: 'RIR_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const prg = expl.progressionDecisions[0];
    assert.strictEqual(prg.decision, 'Rir Progression');
});

runTest('TEST 67: Explains CONSERVATIVE_PROGRESSION model accurately', () => {
    const prog = { progressionModel: 'CONSERVATIVE_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    const prg = expl.progressionDecisions[0];
    assert.strictEqual(prg.decision, 'Conservative Progression');
});

runTest('TEST 68: Progression decision source is progression-rules', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.progressionDecisions[0].source, 'progression-rules');
});

runTest('TEST 69: Progression priority is HIGH', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.progressionDecisions[0].priority, 'HIGH');
});

runTest('TEST 70: Handles unknown progression model with clean fallback', () => {
    const prog = { progressionModel: 'CUSTOM_PROGRESSION' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, prog);
    assert.ok(expl.progressionDecisions[0]);
});

// -----------------------------------------------------------------------------
// CATEGORY I: PHASE 6 VALIDATION & SAFETY EXPLANATIONS (Tests 71–76)
// -----------------------------------------------------------------------------
runTest('TEST 71: Explains successful validation passing', () => {
    const val = { isValid: true, status: 'VALID', warnings: [], errors: [] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, val);
    const vDec = expl.validationDecisions[0];
    assert.ok(vDec.decision.includes('Validation Passed'));
    assert.ok(vDec.rationale.includes('passed all program validation'));
});

runTest('TEST 72: Explains auto-repaired program outcome', () => {
    const val = { isValid: true, isRepaired: true, status: 'REPAIRED', warnings: ['Trimmed session duration'] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, val);
    const vDec = expl.validationDecisions.find(v => v.factor.includes('Automatic Plan Optimization'));
    assert.ok(vDec);
    assert.ok(vDec.rationale.includes('adjusted the generated plan'));
});

runTest('TEST 73: Explains validation advisories when warnings exist', () => {
    const val = { isValid: true, warnings: ['Notice: equipment substituted'] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, val);
    assert.ok(expl.validationDecisions.some(v => v.factor === 'Advisory Notifications'));
});

runTest('TEST 74: Explains invalid plan execution block', () => {
    const val = { isValid: false, status: 'INVALID', errors: ['Movement conflict'] };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, val);
    const vDec = expl.validationDecisions.find(v => v.factor === 'Validation Safety Gate');
    assert.ok(vDec);
    assert.strictEqual(vDec.decision, 'Execution Blocked');
});

runTest('TEST 75: Handles null validation result gracefully', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null);
    assert.ok(expl.validationDecisions.length > 0);
});

runTest('TEST 76: Validation decision source is program-validator', () => {
    const val = { isValid: true };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, val);
    assert.strictEqual(expl.validationDecisions[0].source, 'program-validator');
});

// -----------------------------------------------------------------------------
// CATEGORY J: PHASE 11 PERFORMANCE & ADAPTIVE TRANSPARENCY (Tests 77–82)
// -----------------------------------------------------------------------------
runTest('TEST 77: Explains performance analysis execution rate when history is provided', () => {
    const perf = { completionRate: 0.95 };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, perf);
    const pDec = expl.performanceDecisions.find(p => p.factor === 'Execution History');
    assert.ok(pDec);
    assert.ok(pDec.decision.includes('95%'));
});

runTest('TEST 78: Explains session-level adaptive guidance', () => {
    const adaptive = { decision: 'PROGRESS', rationale: 'Target repetitions exceeded for 2 consecutive sessions.' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, null, adaptive);
    const aDec = expl.performanceDecisions.find(p => p.factor === 'Next-Session Adaptive Guidance');
    assert.ok(aDec);
    assert.strictEqual(aDec.source, 'adaptive-training');
    assert.ok(aDec.decision.includes('Progress'));
});

runTest('TEST 79: Explains weekly volume analytics totals', () => {
    const analytics = { totalSetsCompleted: 48 };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, null, null, analytics);
    const aDec = expl.performanceDecisions.find(p => p.factor === 'Weekly Volume Analytics');
    assert.ok(aDec);
    assert.ok(aDec.rationale.includes('48 sets'));
});

runTest('TEST 80: Empty performance inputs produce empty performanceDecisions list', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.performanceDecisions.length, 0);
});

runTest('TEST 81: Labels Adaptive Training source distinctly from Performance Analysis', () => {
    const perf = { completionRate: 0.85 };
    const adaptive = { decision: 'MAINTAIN', rationale: 'Solid execution.' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, perf, adaptive);
    const perfDec = expl.performanceDecisions.find(p => p.factor === 'Execution History');
    const adaptDec = expl.performanceDecisions.find(p => p.factor === 'Next-Session Adaptive Guidance');
    assert.strictEqual(perfDec.source, 'performance-analysis');
    assert.strictEqual(adaptDec.source, 'adaptive-training');
});

runTest('TEST 82: Does not generate new adaptive decisions (read-only consumer)', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.nextPrescription, undefined);
});

// -----------------------------------------------------------------------------
// CATEGORY K: PHASE 14 12-WEEK PERIODIZATION TRANSPARENCY (Tests 83–88)
// -----------------------------------------------------------------------------
runTest('TEST 83: Explains 12-week macrocycle architecture', () => {
    const block = { durationWeeks: 12, phases: new Array(6) };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, null, null, null, block);
    const pDec = expl.periodizationDecisions.find(p => p.factor === '12-Week Macrocycle Architecture');
    assert.ok(pDec);
    assert.ok(pDec.decision.includes('6-Phase'));
});

runTest('TEST 84: Explains strategic deload schedule at Weeks 4, 8, 12', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const dDec = expl.periodizationDecisions.find(p => p.factor === 'Strategic Deload Schedule');
    assert.ok(dDec);
    assert.ok(dDec.rationale.includes('reduced volume'));
});

runTest('TEST 85: Explains block-level adaptation status separately from phaseType', () => {
    const block = {
        phases: new Array(6),
        adaptationRules: [
            { adaptationDecision: 'HIGH_PERFORMANCE', planningEffect: 'CONTINUE_PLANNED_PROGRESSION', rationale: 'Strong training execution.' }
        ]
    };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, null, null, null, block);
    const aDec = expl.periodizationDecisions.find(p => p.factor === 'Block-Level Adaptation Status');
    assert.ok(aDec);
    assert.ok(aDec.decision.includes('High Performance'));
    assert.strictEqual(aDec.source, 'periodization-engine');
});

runTest('TEST 86: Block-level adaptation decision states programMutation: false', () => {
    const block = {
        phases: new Array(6),
        adaptationRules: [
            { adaptationDecision: 'REDUCE_LOAD', planningEffect: 'REDUCE_TRAINING_DEMAND' }
        ]
    };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, null, null, null, block);
    const aDec = expl.periodizationDecisions.find(p => p.factor === 'Block-Level Adaptation Status');
    assert.ok(aDec.evidence.includes('programMutation: false'));
});

runTest('TEST 87: Explains exercise substitution when substitution occurred', () => {
    const sub = { originalExerciseId: 'lat_pulldown', originalExerciseName: 'Lat Pulldown', replacementExerciseId: 'pull_up', replacementExerciseName: 'Pull Up', reason: 'Equipment restriction' };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, null, null, null, null, sub);
    assert.strictEqual(expl.substitutionDecisions.length, 1);
    assert.ok(expl.substitutionDecisions[0].decision.includes('Lat Pulldown -> Pull Up'));
    assert.strictEqual(expl.substitutionDecisions[0].source, 'exercise-substitution');
});

runTest('TEST 88: No substitution event produces empty substitutionDecisions array', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.substitutionDecisions.length, 0);
});

// -----------------------------------------------------------------------------
// CATEGORY L: EVIDENCE COVERAGE, CONFIDENCE, LIMITATIONS & SCENARIOS (Tests 89–95)
// -----------------------------------------------------------------------------
runTest('TEST 89: New user scenario reports COMPLETE structural evidence and UNAVAILABLE performance', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.evidenceCoverage.profile, 'COMPLETE');
    assert.strictEqual(expl.evidenceCoverage.program, 'COMPLETE');
    assert.strictEqual(expl.evidenceCoverage.performance, 'UNAVAILABLE');
});

runTest('TEST 90: New user scenario reports historical confidence as NOT_AVAILABLE', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(expl.confidence.historical, 'NOT_AVAILABLE');
    assert.strictEqual(expl.confidence.structural, 'HIGH');
    assert.strictEqual(expl.confidence.overall, 'HIGH');
});

runTest('TEST 91: New user scenario includes limitation about missing workout history', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.ok(expl.limitations.some(l => l.includes('No completed workout history is available')));
});

runTest('TEST 92: User with history reports COMPLETE performance evidence and HIGH historical confidence', () => {
    const perf = { completionRate: 0.90 };
    const analytics = { totalSetsCompleted: 40 };
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram, null, perf, null, analytics);
    assert.strictEqual(expl.evidenceCoverage.performance, 'COMPLETE');
    assert.strictEqual(expl.confidence.historical, 'HIGH');
});

runTest('TEST 93: Personalization reasons list is deduplicated', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const seen = new Set();
    let hasDup = false;
    expl.personalizationReasons.forEach(r => {
        if (seen.has(r.reason)) hasDup = true;
        seen.add(r.reason);
    });
    assert.strictEqual(hasDup, false);
});

runTest('TEST 94: Every personalization reason includes source and factor', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    expl.personalizationReasons.forEach(r => {
        assert.ok(r.source);
        assert.ok(r.factor);
        assert.ok(r.reason);
    });
});

runTest('TEST 95: No fake percentages in confidence object', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const confStr = JSON.stringify(expl.confidence);
    assert.ok(!confStr.includes('%'));
    assert.ok(!confStr.includes('95'));
    assert.ok(!confStr.includes('98'));
});

// -----------------------------------------------------------------------------
// CATEGORY M: DEEP IMMUTABILITY & CLEAN LANGUAGE (Tests 96–100)
// -----------------------------------------------------------------------------
runTest('TEST 96: Deep immutability: Does not mutate canonicalProfile', () => {
    const pCopy = JSON.parse(JSON.stringify(sampleProfile));
    explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(JSON.stringify(sampleProfile), JSON.stringify(pCopy));
});

runTest('TEST 97: Deep immutability: Does not mutate generatedProgram', () => {
    const prgCopy = JSON.parse(JSON.stringify(sampleProgram));
    explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(JSON.stringify(sampleProgram), JSON.stringify(prgCopy));
});

runTest('TEST 98: Deep immutability: Does not mutate trainingRequirements', () => {
    const reqCopy = JSON.parse(JSON.stringify(sampleRequirements));
    explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    assert.strictEqual(JSON.stringify(sampleRequirements), JSON.stringify(reqCopy));
});

runTest('TEST 99: No software algorithmic jargon in user explanations', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const jsonStr = JSON.stringify(expl).toLowerCase();
    assert.ok(!jsonStr.includes('feature vectors'));
    assert.ok(!jsonStr.includes('optimization objective'));
    assert.ok(!jsonStr.includes('weighted scoring function'));
    assert.ok(!jsonStr.includes('neural inference'));
});

runTest('TEST 100: No pseudoscientific/medical claims across all explanations', () => {
    const expl = explanationEngine.generatePersonalizationExplanation(sampleProfile, sampleRequirements, sampleProgram);
    const jsonStr = JSON.stringify(expl).toLowerCase();
    assert.ok(!jsonStr.includes('cns reset'));
    assert.ok(!jsonStr.includes('resensitize'));
    assert.ok(!jsonStr.includes('cortisol reduction'));
    assert.ok(!jsonStr.includes('prevent overtraining'));
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
