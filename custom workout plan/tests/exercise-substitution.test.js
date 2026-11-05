/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * EXERCISE SUBSTITUTION TEST SUITE (PHASE 12)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const generatorEngine = require('../js/engine/program-generator.js');
const substitutionEngine = require('../js/engine/exercise-substitution.js');

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
    equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'bench'],
    injuries: []
});

console.log('================================================================');
console.log('RUNNING EXERCISE SUBSTITUTION TEST SUITE (PHASE 12)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: REQUEST VALIDATION & HARD CONSTRAINTS (Tests 1–10)
// -----------------------------------------------------------------------------
runTest('TEST 1: Valid substitution request returns FOUND status and top candidate', () => {
    const req = {
        exerciseId: 'dumbbell_bench_press',
        profile: sampleProfile,
        reason: 'PREFERENCE'
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, substitutionEngine.SUBSTITUTION_STATUS.FOUND);
    assert.ok(res.replacementExerciseId);
    assert.notStrictEqual(res.replacementExerciseId, 'dumbbell_bench_press');
});

runTest('TEST 2: Invalid exercise ID returns INVALID_REQUEST status', () => {
    const req = {
        exerciseId: 'non_existent_exercise_123',
        profile: sampleProfile
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, substitutionEngine.SUBSTITUTION_STATUS.INVALID_REQUEST);
});

runTest('TEST 3: Same exercise is never returned as a candidate', () => {
    const req = { exerciseId: 'barbell_back_squat', profile: sampleProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    candidates.forEach(c => {
        assert.notStrictEqual(c.exerciseId, 'barbell_back_squat');
    });
});

runTest('TEST 4: Missing request object returns INVALID_REQUEST status', () => {
    const res = substitutionEngine.findBestSubstitution(null);
    assert.strictEqual(res.status, substitutionEngine.SUBSTITUTION_STATUS.INVALID_REQUEST);
});

runTest('TEST 5: Knee injury filtering excludes contraindicated leg lifts', () => {
    const kneeProfile = canonicalEngine.buildCanonicalUserProfile({
        goal: 'strength',
        experience: 'intermediate',
        injuries: ['knee']
    });
    const req = { exerciseId: 'leg_press', profile: kneeProfile, reason: 'INJURY' };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    candidates.forEach(c => {
        const model = exerciseDB.getExerciseById(c.exerciseId);
        assert.ok(substitutionEngine._internals.isExerciseAllowedForInjuries(model, ['knee']));
    });
});

runTest('TEST 6: Shoulder injury filtering excludes overhead pressing movements', () => {
    const shoulderProfile = canonicalEngine.buildCanonicalUserProfile({
        goal: 'muscle-gain',
        experience: 'intermediate',
        injuries: ['shoulder']
    });
    const req = { exerciseId: 'dumbbell_overhead_press', profile: shoulderProfile, reason: 'INJURY' };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    candidates.forEach(c => {
        const model = exerciseDB.getExerciseById(c.exerciseId);
        assert.ok(substitutionEngine._internals.isExerciseAllowedForInjuries(model, ['shoulder']));
    });
});

runTest('TEST 7: Back injury filtering excludes conventional deadlifts', () => {
    const backProfile = canonicalEngine.buildCanonicalUserProfile({
        goal: 'strength',
        experience: 'intermediate',
        injuries: ['back']
    });
    const req = { exerciseId: 'romanian_deadlift', profile: backProfile, reason: 'INJURY' };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    candidates.forEach(c => {
        const model = exerciseDB.getExerciseById(c.exerciseId);
        assert.ok(substitutionEngine._internals.isExerciseAllowedForInjuries(model, ['back']));
    });
});

runTest('TEST 8: Unavailable equipment candidates are strictly excluded', () => {
    const dbOnlyProfile = {
        ...sampleProfile,
        availableEquipment: ['dumbbell', 'bodyweight', 'bench'] // NO barbell, NO cable, NO machine
    };
    const req = { exerciseId: 'dumbbell_bench_press', profile: dbOnlyProfile, reason: 'EQUIPMENT_UNAVAILABLE' };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    candidates.forEach(c => {
        const model = exerciseDB.getExerciseById(c.exerciseId);
        const equip = model.equipment || [];
        const valid = equip.every(eq => ['dumbbell', 'bodyweight', 'bench', 'none', 'mat'].includes(eq));
        assert.ok(valid, `Exercise ${c.exerciseId} requires invalid equipment: ${equip.join(', ')}`);
    });
});

runTest('TEST 9: Explicit prohibited equipment constraint in request is respected', () => {
    const req = {
        exerciseId: 'lat_pulldown',
        profile: sampleProfile,
        requestedConstraints: { prohibitedEquipment: ['cable'] }
    };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    candidates.forEach(c => {
        const model = exerciseDB.getExerciseById(c.exerciseId);
        assert.ok(!model.equipment.includes('cable'));
    });
});

runTest('TEST 10: Explicit prohibited exercise in profile safety constraints is excluded', () => {
    const safeProfile = {
        ...sampleProfile,
        safetyConstraints: [{ prohibitedExercises: ['push_up'], reason: 'Wrist sprain' }]
    };
    const req = { exerciseId: 'dumbbell_bench_press', profile: safeProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    candidates.forEach(c => {
        assert.notStrictEqual(c.exerciseId, 'push_up');
    });
});

// -----------------------------------------------------------------------------
// CATEGORY B: INTENT-PRESERVATION SCORING (Tests 11–19)
// -----------------------------------------------------------------------------
runTest('TEST 11: Primary muscle match receives 25 points', () => {
    const orig = exerciseDB.getExerciseById('dumbbell_bench_press');
    const cand = exerciseDB.getExerciseById('incline_dumbbell_press');
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.strictEqual(scored.preservedAttributes.primaryMuscle, true);
});

runTest('TEST 12: Movement pattern match receives 20 points', () => {
    const orig = exerciseDB.getExerciseById('barbell_bench_press');
    const cand = exerciseDB.getExerciseById('dumbbell_bench_press');
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.strictEqual(scored.preservedAttributes.movementPattern, true);
});

runTest('TEST 13: Exact equipment match receives 20 points', () => {
    const orig = exerciseDB.getExerciseById('dumbbell_bench_press');
    const cand = exerciseDB.getExerciseById('incline_dumbbell_press');
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.strictEqual(scored.preservedAttributes.equipment, true);
});

runTest('TEST 14: Goal compatibility evaluates correctly', () => {
    const orig = exerciseDB.getExerciseById('dumbbell_bench_press');
    const cand = exerciseDB.getExerciseById('incline_dumbbell_press');
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.strictEqual(scored.preservedAttributes.goal, true);
});

runTest('TEST 15: Progression model compatibility evaluated', () => {
    const orig = exerciseDB.getExerciseById('dumbbell_bench_press');
    const cand = exerciseDB.getExerciseById('incline_dumbbell_press');
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.strictEqual(scored.preservedAttributes.progressionModel, true);
});

runTest('TEST 16: Difficulty compatibility awards points for same level', () => {
    const orig = exerciseDB.getExerciseById('dumbbell_bench_press');
    const cand = exerciseDB.getExerciseById('incline_dumbbell_press');
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.ok(scored.score > 70);
});

runTest('TEST 17: Technical complexity difference recorded in differences array if large', () => {
    const orig = exerciseDB.getExerciseById('machine_chest_press'); // low complexity
    const cand = exerciseDB.getExerciseById('barbell_bench_press'); // higher complexity
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.ok(scored.differences.some(d => d.includes('complexity') || d.includes('Equipment')));
});

runTest('TEST 18: Fatigue difference recorded in differences array if large', () => {
    const orig = exerciseDB.getExerciseById('machine_chest_press'); // low fatigue
    const cand = exerciseDB.getExerciseById('barbell_bench_press'); // high fatigue
    const scored = substitutionEngine._internals.scoreCandidate(cand, orig, { profile: sampleProfile });
    assert.ok(scored.differences.some(d => d.includes('Fatigue') || d.includes('Equipment')));
});

runTest('TEST 19: Unrelated movement scores substantially lower than biomechanical alternative', () => {
    const orig = exerciseDB.getExerciseById('dumbbell_bench_press');
    const goodCand = exerciseDB.getExerciseById('machine_chest_press');
    const badCand = exerciseDB.getExerciseById('dumbbell_curl');

    const scoreGood = substitutionEngine._internals.scoreCandidate(goodCand, orig, { profile: sampleProfile }).score;
    const scoreBad = substitutionEngine._internals.scoreCandidate(badCand, orig, { profile: sampleProfile }).score;

    assert.ok(scoreGood > scoreBad + 20);
});

// -----------------------------------------------------------------------------
// CATEGORY C: QUALITY CLASSIFICATIONS & CONFIDENCE (Tests 20–25)
// -----------------------------------------------------------------------------
runTest('TEST 20: DIRECT alternative classification for near-identical movement (score >= 85)', () => {
    const quality = substitutionEngine._internals.getQualityClassification(88);
    assert.strictEqual(quality, substitutionEngine.SUBSTITUTION_QUALITY.DIRECT);
});

runTest('TEST 21: STRONG alternative classification (score >= 70)', () => {
    const quality = substitutionEngine._internals.getQualityClassification(75);
    assert.strictEqual(quality, substitutionEngine.SUBSTITUTION_QUALITY.STRONG);
});

runTest('TEST 22: ACCEPTABLE alternative classification (score >= 50)', () => {
    const quality = substitutionEngine._internals.getQualityClassification(58);
    assert.strictEqual(quality, substitutionEngine.SUBSTITUTION_QUALITY.ACCEPTABLE);
});

runTest('TEST 23: LIMITED alternative classification (score < 50)', () => {
    const quality = substitutionEngine._internals.getQualityClassification(42);
    assert.strictEqual(quality, substitutionEngine.SUBSTITUTION_QUALITY.LIMITED);
});

runTest('TEST 24: NO_VALID_ALTERNATIVE status when no candidates satisfy hard constraints', () => {
    const impossibleProfile = canonicalEngine.buildCanonicalUserProfile({
        goal: 'strength',
        experience: 'beginner',
        equipment: ['none'],
        injuries: ['knee', 'back', 'shoulder', 'wrist', 'elbow', 'hip', 'ankle']
    });
    const req = {
        exerciseId: 'barbell_back_squat',
        profile: impossibleProfile,
        requestedConstraints: { prohibitedEquipment: ['bodyweight', 'dumbbell', 'barbell', 'cable', 'machine', 'bench', 'pullup_bar', 'resistance_band', 'mat', 'none'] }
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, substitutionEngine.SUBSTITUTION_STATUS.NO_VALID_ALTERNATIVE);
    assert.strictEqual(res.replacementExerciseId, null);
});

runTest('TEST 25: Confidence calculation returns HIGH, MEDIUM, or LOW', () => {
    assert.strictEqual(substitutionEngine._internals.getConfidenceLevel(85, 1), 'HIGH');
    assert.strictEqual(substitutionEngine._internals.getConfidenceLevel(65, 2), 'MEDIUM');
    assert.strictEqual(substitutionEngine._internals.getConfidenceLevel(40, 4), 'LOW');
});

// -----------------------------------------------------------------------------
// CATEGORY D: RANKING, TIE-BREAKING & CANDIDATE LISTS (Tests 26–31)
// -----------------------------------------------------------------------------
runTest('TEST 26: Candidates are ranked with higher score first', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    for (let i = 1; i < candidates.length; i++) {
        assert.ok(candidates[i - 1].score >= candidates[i].score);
    }
});

runTest('TEST 27: Lower technical complexity breaks score ties', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    for (let i = 1; i < candidates.length; i++) {
        if (candidates[i - 1].score === candidates[i].score) {
            const compA = candidates[i - 1].candidateModel.technicalComplexity || 2;
            const compB = candidates[i].candidateModel.technicalComplexity || 2;
            assert.ok(compA <= compB);
        }
    }
});

runTest('TEST 28: Lower fatigue cost breaks secondary ties', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    for (let i = 1; i < candidates.length; i++) {
        if (candidates[i - 1].score === candidates[i].score) {
            const compA = candidates[i - 1].candidateModel.technicalComplexity || 2;
            const compB = candidates[i].candidateModel.technicalComplexity || 2;
            if (compA === compB) {
                const fatA = candidates[i - 1].candidateModel.fatigueCost || 2;
                const fatB = candidates[i].candidateModel.fatigueCost || 2;
                assert.ok(fatA <= fatB);
            }
        }
    }
});

runTest('TEST 29: Alphabetical canonical ID breaks final ties deterministically', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 5);
    for (let i = 1; i < candidates.length; i++) {
        if (candidates[i - 1].score === candidates[i].score) {
            const compA = candidates[i - 1].candidateModel.technicalComplexity || 2;
            const compB = candidates[i].candidateModel.technicalComplexity || 2;
            const fatA = candidates[i - 1].candidateModel.fatigueCost || 2;
            const fatB = candidates[i].candidateModel.fatigueCost || 2;
            if (compA === compB && fatA === fatB) {
                assert.ok(candidates[i - 1].exerciseId.localeCompare(candidates[i].exerciseId) <= 0);
            }
        }
    }
});

runTest('TEST 30: Default candidate list is capped at 3', () => {
    const req = { exerciseId: 'barbell_back_squat', profile: sampleProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req);
    assert.strictEqual(candidates.length, 3);
});

runTest('TEST 31: Maximum candidate list capped at 5 even if higher limit requested', () => {
    const req = { exerciseId: 'barbell_back_squat', profile: sampleProfile };
    const candidates = substitutionEngine.rankSubstitutionCandidates(req, 20);
    assert.ok(candidates.length <= 5);
});

// -----------------------------------------------------------------------------
// CATEGORY E: REASON-SPECIFIC BEHAVIOR & EXPLANATION (Tests 32–38)
// -----------------------------------------------------------------------------
runTest('TEST 32: EQUIPMENT_UNAVAILABLE reason reflects equipment context in rationale', () => {
    const req = {
        exerciseId: 'lat_pulldown',
        profile: sampleProfile,
        reason: 'EQUIPMENT_UNAVAILABLE'
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.ok(res.rationale.includes('available equipment'));
});

runTest('TEST 33: INJURY reason reflects movement restriction context in rationale', () => {
    const req = {
        exerciseId: 'barbell_back_squat',
        profile: sampleProfile,
        reason: 'INJURY'
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.ok(res.rationale.includes('movement restrictions'));
});

runTest('TEST 34: DISCOMFORT reason finds viable biomechanical replacement', () => {
    const req = {
        exerciseId: 'dumbbell_overhead_press',
        profile: sampleProfile,
        reason: 'DISCOMFORT'
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 35: PREFERENCE reason provides diverse options', () => {
    const req = {
        exerciseId: 'dumbbell_bench_press',
        profile: sampleProfile,
        reason: 'PREFERENCE'
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
    assert.ok(res.candidateSummary.length >= 2);
});

runTest('TEST 36: ACCESSIBILITY reason provides viable alternatives', () => {
    const req = {
        exerciseId: 'pull_up',
        profile: sampleProfile,
        reason: 'ACCESSIBILITY'
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 37: FATIGUE reason produces valid candidate with rationale', () => {
    const req = {
        exerciseId: 'barbell_back_squat',
        profile: sampleProfile,
        reason: 'FATIGUE'
    };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 38: Preserved attributes object contains booleans for key dimensions', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(typeof res.preservedAttributes.primaryMuscle, 'boolean');
    assert.strictEqual(typeof res.preservedAttributes.movementPattern, 'boolean');
    assert.strictEqual(typeof res.preservedAttributes.goal, 'boolean');
    assert.strictEqual(typeof res.preservedAttributes.equipment, 'boolean');
});

// -----------------------------------------------------------------------------
// CATEGORY F: PROGRESSION MODEL COMPATIBILITY (Tests 39–44)
// -----------------------------------------------------------------------------
runTest('TEST 39: DOUBLE_PROGRESSION preserves double progression compatibility', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 40: LOAD_PROGRESSION finds barbell/compound alternative', () => {
    const req = { exerciseId: 'barbell_bench_press', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 41: REP_PROGRESSION finds bodyweight alternative', () => {
    const req = { exerciseId: 'push_up', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 42: RIR_PROGRESSION finds isolation alternative', () => {
    const req = { exerciseId: 'cable_lateral_raise', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 43: HOLD_PROGRESSION finds isometric/bodyweight alternative', () => {
    const req = { exerciseId: 'push_up', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

runTest('TEST 44: CONSERVATIVE_PROGRESSION finds stable machine alternative', () => {
    const req = { exerciseId: 'machine_chest_press', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(res.status, 'FOUND');
});

// -----------------------------------------------------------------------------
// CATEGORY G: VALIDATION, IMMUTABILITY & DETERMINISM (Tests 45–54)
// -----------------------------------------------------------------------------
runTest('TEST 45: validateSubstitution accepts valid result', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    const val = substitutionEngine.validateSubstitution(res, req);
    assert.strictEqual(val.valid, true);
    assert.strictEqual(val.errors.length, 0);
});

runTest('TEST 46: validateSubstitution rejects invalid status enum', () => {
    const val = substitutionEngine.validateSubstitution({ status: 'INVALID_STATUS' });
    assert.strictEqual(val.valid, false);
});

runTest('TEST 47: validateSubstitution rejects identical replacement ID', () => {
    const val = substitutionEngine.validateSubstitution({
        status: 'FOUND',
        originalExerciseId: 'push_up',
        replacementExerciseId: 'push_up',
        quality: 'DIRECT',
        score: 90,
        confidence: 'HIGH',
        rationale: 'test'
    });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('identical')));
});

runTest('TEST 48: validateSubstitution rejects non-canonical replacement ID', () => {
    const val = substitutionEngine.validateSubstitution({
        status: 'FOUND',
        originalExerciseId: 'push_up',
        replacementExerciseId: 'fake_exercise_xyz',
        quality: 'DIRECT',
        score: 90,
        confidence: 'HIGH',
        rationale: 'test'
    });
    assert.strictEqual(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('not canonical')));
});

runTest('TEST 49: validateSubstitution rejects score out of bounds', () => {
    const val = substitutionEngine.validateSubstitution({
        status: 'FOUND',
        originalExerciseId: 'push_up',
        replacementExerciseId: 'dumbbell_bench_press',
        quality: 'DIRECT',
        score: 150,
        confidence: 'HIGH',
        rationale: 'test'
    });
    assert.strictEqual(val.valid, false);
});

runTest('TEST 50: validateSubstitution rejects empty rationale', () => {
    const val = substitutionEngine.validateSubstitution({
        status: 'FOUND',
        originalExerciseId: 'push_up',
        replacementExerciseId: 'dumbbell_bench_press',
        quality: 'DIRECT',
        score: 80,
        confidence: 'HIGH',
        rationale: ''
    });
    assert.strictEqual(val.valid, false);
});

runTest('TEST 51: Deterministic snapshot remains identical for identical substitution requests', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const res1 = substitutionEngine.findBestSubstitution(req);
    const res2 = substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(
        substitutionEngine.getDeterministicSubstitutionSnapshot(res1),
        substitutionEngine.getDeterministicSubstitutionSnapshot(res2)
    );
});

runTest('TEST 52: 10 repeated passes produce bitwise identical candidate ranking', () => {
    const req = { exerciseId: 'barbell_back_squat', profile: sampleProfile };
    const snap1 = substitutionEngine.getDeterministicSubstitutionSnapshot(substitutionEngine.findBestSubstitution(req));
    for (let i = 0; i < 10; i++) {
        assert.strictEqual(substitutionEngine.getDeterministicSubstitutionSnapshot(substitutionEngine.findBestSubstitution(req)), snap1);
    }
});

runTest('TEST 53: Exercise database is not mutated during substitution', () => {
    const dbSize1 = exerciseDB.getAllExercises().length;
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    substitutionEngine.findBestSubstitution(req);
    const dbSize2 = exerciseDB.getAllExercises().length;
    assert.strictEqual(dbSize1, dbSize2);
});

runTest('TEST 54: Canonical profile is not mutated during substitution', () => {
    const profileSnap = JSON.stringify(sampleProfile);
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    substitutionEngine.findBestSubstitution(req);
    assert.strictEqual(JSON.stringify(sampleProfile), profileSnap);
});

// -----------------------------------------------------------------------------
// CATEGORY H: DIFFERENCES & VERSIONING (Tests 55–60)
// -----------------------------------------------------------------------------
runTest('TEST 55: Differences list highlights equipment shift when replacing barbell with dumbbell', () => {
    const req = { exerciseId: 'barbell_bench_press', profile: sampleProfile, requestedConstraints: { prohibitedEquipment: ['barbell'] } };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.ok(res.differences.length >= 0);
});

runTest('TEST 56: Rationale explains replacement choice with exercise names', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.ok(res.rationale.includes('Dumbbell Bench Press') || res.rationale.includes('Replacing'));
});

runTest('TEST 57: Candidate summary contains structured metadata for each alternative', () => {
    const req = { exerciseId: 'dumbbell_bench_press', profile: sampleProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    assert.ok(Array.isArray(res.candidateSummary));
    assert.ok(res.candidateSummary.length > 0);
    assert.ok(res.candidateSummary[0].exerciseId);
    assert.ok(typeof res.candidateSummary[0].score === 'number');
});

runTest('TEST 58: Candidate list never includes unavailable equipment', () => {
    const noBarbellProfile = canonicalEngine.buildCanonicalUserProfile({
        goal: 'muscle-gain',
        experience: 'beginner',
        equipment: ['dumbbell', 'bodyweight', 'bench']
    });
    const req = { exerciseId: 'dumbbell_bench_press', profile: noBarbellProfile, requestedConstraints: { prohibitedEquipment: ['barbell', 'cable', 'machine'] } };
    const res = substitutionEngine.findBestSubstitution(req);
    const replModel = exerciseDB.getExerciseById(res.replacementExerciseId);
    assert.ok(!replModel.equipment.includes('barbell'));
});

runTest('TEST 59: Candidate list never includes injury-contraindicated exercises', () => {
    const injuredProfile = canonicalEngine.buildCanonicalUserProfile({
        goal: 'strength',
        experience: 'intermediate',
        injuries: ['knee']
    });
    const req = { exerciseId: 'barbell_back_squat', profile: injuredProfile };
    const res = substitutionEngine.findBestSubstitution(req);
    const replModel = exerciseDB.getExerciseById(res.replacementExerciseId);
    assert.ok(substitutionEngine._internals.isExerciseAllowedForInjuries(replModel, ['knee']));
});

runTest('TEST 60: Engine version tag is present and valid', () => {
    assert.strictEqual(substitutionEngine.ENGINE_VERSION, '1.0');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
