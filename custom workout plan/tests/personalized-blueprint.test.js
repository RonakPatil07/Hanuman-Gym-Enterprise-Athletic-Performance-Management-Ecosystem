/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PERSONALIZED TRAINING BLUEPRINT UI TEST SUITE (PHASE 7)
 * ==============================================================================
 */

const assert = require('assert');
const canonicalEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const rulesEngine = require('../js/engine/training-rules.js');
const programGen = require('../js/engine/program-generator.js');
const validatorEngine = require('../js/engine/program-validator.js');
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
console.log('RUNNING PERSONALIZED TRAINING BLUEPRINT UI SUITE (PHASE 7)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY A: RENDERING (Tests 1–5)
// -----------------------------------------------------------------------------
runTest('TEST 1: Valid program renders complete blueprint HTML', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 26, gender: 'male', goal: 'muscle-gain', userName: 'Vikram' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    const val = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);

    const html = blueprintUI.generateBlueprintHTML(prog, val, { userName: 'Vikram' });
    assert.ok(typeof html === 'string' && html.length > 500);
    assert.ok(html.includes('personalized-blueprint-wrapper'));
    assert.ok(html.includes('Vikram'));
    assert.ok(html.includes('Weekly Training Schedule'));
    assert.ok(html.includes('Session Exercise Blueprints'));
});

runTest('TEST 2: Missing program handled cleanly (returns error container)', () => {
    const htmlNull = blueprintUI.generateBlueprintHTML(null);
    assert.ok(htmlNull.includes('blueprint-error-container'));
    assert.ok(htmlNull.includes('Unable to Render Blueprint'));

    const htmlUndef = blueprintUI.generateBlueprintHTML(undefined);
    assert.ok(htmlUndef.includes('blueprint-error-container'));
});

runTest('TEST 3: Invalid validation state handled cleanly (displays blocking error state)', () => {
    const invalidVal = {
        valid: false,
        status: 'INVALID',
        errors: [{ code: 'HARDWARE_FAILURE', message: 'No suitable barbell available.' }],
        warnings: []
    };
    const html = blueprintUI.generateBlueprintHTML({ version: '1.0' }, invalidVal);
    assert.ok(html.includes('blueprint-invalid-container'));
    assert.ok(html.includes('Validation Barrier Detected'));
    assert.ok(html.includes('No suitable barbell available.'));
    assert.ok(!html.includes('Session Exercise Blueprints'));
});

runTest('TEST 4: Empty sessions handled gracefully', () => {
    const progEmpty = {
        version: '1.0',
        meta: { userName: 'Athlete' },
        sessions: []
    };
    const html = blueprintUI.generateBlueprintHTML(progEmpty);
    assert.ok(html.includes('personalized-blueprint-wrapper'));
    assert.ok(html.includes('0 Training Days / Week'));
});

runTest('TEST 5: Empty exercises in session handled gracefully', () => {
    const session = {
        day: 'Monday',
        title: 'Empty Active Recovery',
        exercises: []
    };
    const cardHtml = blueprintUI.renderSessionCard(session, 0);
    assert.ok(cardHtml.includes('No exercises scheduled for this workout session.'));
});

// -----------------------------------------------------------------------------
// CATEGORY B: WEEKLY SCHEDULE (Tests 6–10)
// -----------------------------------------------------------------------------
runTest('TEST 6: Actual schedule rendered dynamically', () => {
    const prog = {
        version: '1.0',
        sessions: [
            { day: 'Monday', title: 'Chest & Back', estimatedDurationMinutes: 50, exercises: [{ sets: 3, reps: '10' }] },
            { day: 'Thursday', title: 'Legs & Core', estimatedDurationMinutes: 45, exercises: [{ sets: 4, reps: '12' }] }
        ]
    };
    const scheduleHtml = blueprintUI.renderWeeklySchedule(prog);
    assert.ok(scheduleHtml.includes('Chest &amp; Back') || scheduleHtml.includes('Chest & Back'));
    assert.ok(scheduleHtml.includes('Legs &amp; Core') || scheduleHtml.includes('Legs & Core'));
});

runTest('TEST 7: Rest days handled and marked with rest classes', () => {
    const prog = {
        version: '1.0',
        sessions: [
            { day: 'Monday', title: 'Upper Body', estimatedDurationMinutes: 50, exercises: [{ sets: 3 }] }
        ]
    };
    const scheduleHtml = blueprintUI.renderWeeklySchedule(prog);
    assert.ok(scheduleHtml.includes('rest-day'));
    assert.ok(scheduleHtml.includes('Rest &amp; Recovery') || scheduleHtml.includes('Rest & Recovery'));
});

runTest('TEST 8: Session order preserved across days', () => {
    const prog = {
        version: '1.0',
        sessions: [
            { day: 'Tuesday', title: 'Push Day' },
            { day: 'Thursday', title: 'Pull Day' },
            { day: 'Saturday', title: 'Legs Day' }
        ]
    };
    const scheduleHtml = blueprintUI.renderWeeklySchedule(prog);
    const monIdx = scheduleHtml.indexOf('MON');
    const tueIdx = scheduleHtml.indexOf('TUE');
    const thuIdx = scheduleHtml.indexOf('THU');
    const satIdx = scheduleHtml.indexOf('SAT');

    assert.ok(monIdx < tueIdx);
    assert.ok(tueIdx < thuIdx);
    assert.ok(thuIdx < satIdx);
});

runTest('TEST 9: No hardcoded split (adapts to any session layout)', () => {
    const prog5Day = {
        version: '1.0',
        sessions: [
            { day: 'Monday', title: 'Chest' },
            { day: 'Tuesday', title: 'Back' },
            { day: 'Wednesday', title: 'Shoulders' },
            { day: 'Thursday', title: 'Legs' },
            { day: 'Friday', title: 'Arms' }
        ]
    };
    const scheduleHtml = blueprintUI.renderWeeklySchedule(prog5Day);
    assert.ok(scheduleHtml.includes('5 Training Days / Week'));
    assert.ok(scheduleHtml.includes('Chest'));
    assert.ok(scheduleHtml.includes('Arms'));
});

runTest('TEST 10: Correct training day labels', () => {
    const prog = {
        version: '1.0',
        sessions: [{ day: 'Wednesday', title: 'Midweek Full Body' }]
    };
    const scheduleHtml = blueprintUI.renderWeeklySchedule(prog);
    assert.ok(scheduleHtml.includes('WED'));
    assert.ok(scheduleHtml.includes('Midweek Full Body'));
});

// -----------------------------------------------------------------------------
// CATEGORY C: EXERCISE RENDERING (Tests 11–20)
// -----------------------------------------------------------------------------
runTest('TEST 11: Exercise name rendered correctly', () => {
    const ex = { exerciseName: 'Barbell Incline Bench Press', sets: 4, reps: '8-10', restSeconds: 90 };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('Barbell Incline Bench Press'));
});

runTest('TEST 12: Sets rendered accurately', () => {
    const ex = { exerciseName: 'Barbell Squat', sets: 5, reps: '5', restSeconds: 180 };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('5</strong> sets'));
});

runTest('TEST 13: Reps rendered accurately', () => {
    const ex = { exerciseName: 'Dumbbell Curl', sets: 3, reps: '12-15', restSeconds: 60 };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('12-15</strong> reps'));
});

runTest('TEST 14: Rest rendered accurately', () => {
    const ex = { exerciseName: 'Deadlift', sets: 3, reps: '5', restSeconds: 180 };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('180s'));
});

runTest('TEST 15: Tempo rendered when available', () => {
    const ex = { exerciseName: 'Leg Press', sets: 3, reps: '10', restSeconds: 90, tempo: '3-1-1' };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('3-1-1'));
    assert.ok(html.includes('Cadence / Tempo'));
});

runTest('TEST 16: Equipment rendered when available', () => {
    const ex = { exerciseName: 'Lat Pulldown', sets: 3, reps: '10', equipment: ['cable', 'machine'] };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('Cable, Machine'));
});

runTest('TEST 17: Target muscles rendered when available', () => {
    const ex = { exerciseName: 'Romanian Deadlift', sets: 3, reps: '8', primaryMuscles: ['hamstrings', 'glutes'] };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('Hamstrings, Glutes'));
});

runTest('TEST 18: Unavailable fields cleanly omitted (no "N/A" or "Unknown")', () => {
    const ex = { exerciseName: 'Bodyweight Push Up', sets: 3, reps: '15', restSeconds: 60 };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(!html.includes('N/A'));
    assert.ok(!html.includes('Unknown'));
    assert.ok(!html.includes('Coming soon'));
});

runTest('TEST 19: Duplicate exercise display behavior (unique IDs for accordion control)', () => {
    const ex1 = { exerciseName: 'Bench Press', sets: 3, reps: '10' };
    const ex2 = { exerciseName: 'Bench Press', sets: 3, reps: '10' };
    const html1 = blueprintUI.renderExerciseCard(ex1, 0, 0);
    const html2 = blueprintUI.renderExerciseCard(ex2, 1, 0);
    assert.ok(html1.includes('id="ex-0-0"'));
    assert.ok(html2.includes('id="ex-0-1"'));
});

runTest('TEST 20: Expandable details structure generated', () => {
    const ex = { exerciseName: 'Overhead Press', sets: 3, reps: '8', tempo: '2-0-2', primaryMuscles: ['deltoids'], reason: 'Compound vertical press' };
    const html = blueprintUI.renderExerciseCard(ex, 0, 0);
    assert.ok(html.includes('blueprint-exercise-details'));
    assert.ok(html.includes('blueprint-accordion-btn'));
    assert.ok(html.includes('Compound vertical press'));
});

// -----------------------------------------------------------------------------
// CATEGORY D: VALIDATION (Tests 21–25)
// -----------------------------------------------------------------------------
runTest('TEST 21: VALID status displayed with confirmation', () => {
    const val = { valid: true, status: 'VALID', warnings: [], errors: [] };
    const html = blueprintUI.renderValidationState(val);
    assert.ok(html.includes('banner-success'));
    assert.ok(html.includes('Program Validated:'));
});

runTest('TEST 22: WARNING status displayed with advisory list', () => {
    const val = { valid: true, status: 'VALID', warnings: [{ code: 'SUB_REC', message: 'Machine substitute advised for fatigue management.' }], errors: [] };
    const html = blueprintUI.renderValidationState(val);
    assert.ok(html.includes('banner-warning'));
    assert.ok(html.includes('Machine substitute advised for fatigue management.'));
});

runTest('TEST 23: REPAIRED status displayed showing automatic optimization', () => {
    const val = { valid: true, status: 'REPAIRED', repaired: true, warnings: [], errors: [] };
    const html = blueprintUI.renderValidationState(val);
    assert.ok(html.includes('banner-success'));
    assert.ok(html.includes('Program Validated &amp; Optimized') || html.includes('Program Validated & Optimized'));
});

runTest('TEST 24: INVALID status blocks usable-plan rendering', () => {
    const invalidVal = { valid: false, status: 'INVALID', errors: [{ message: 'Fatal equipment deficit' }] };
    const prog = { version: '1.0', sessions: [{ day: 'Monday', title: 'Unusable' }] };
    const html = blueprintUI.generateBlueprintHTML(prog, invalidVal);
    assert.ok(html.includes('Fatal equipment deficit'));
    assert.ok(!html.includes('Unusable'));
});

runTest('TEST 25: Validation errors displayed in structured format', () => {
    const val = { valid: false, status: 'INVALID', errors: [{ message: 'Err 1' }, { message: 'Err 2' }] };
    const html = blueprintUI.renderValidationState(val);
    assert.ok(html.includes('<li>Err 1</li>'));
    assert.ok(html.includes('<li>Err 2</li>'));
});

// -----------------------------------------------------------------------------
// CATEGORY E: PERSONALIZATION & DETERMINISM (Tests 26–32)
// -----------------------------------------------------------------------------
runTest('TEST 26: Actual engine personalization reasons rendered', () => {
    const prog = {
        version: '1.0',
        personalizationReasons: [
            { rule: 'goal_alignment', reason: 'Hypertrophy rep-ranges (8-12) prioritized.', source: 'engine' },
            { rule: 'injury_protection', reason: 'Axial spinal loading eliminated due to lower back history.', source: 'engine' }
        ]
    };
    const html = blueprintUI.renderPersonalizationReasons(prog);
    assert.ok(html.includes('Goal Alignment'));
    assert.ok(html.includes('Hypertrophy rep-ranges (8-12) prioritized.'));
    assert.ok(html.includes('Axial spinal loading eliminated'));
});

runTest('TEST 27: No fabricated reasons rendered', () => {
    const progEmpty = { version: '1.0', personalizationReasons: [] };
    const html = blueprintUI.renderPersonalizationReasons(progEmpty);
    assert.strictEqual(html, '');
});

runTest('TEST 28: Progression framework rendered from program data', () => {
    const prog = {
        version: '1.0',
        progressionFramework: {
            primaryMethod: 'double_progression',
            progressionRule: 'Add 1 rep per set until top of range is hit.',
            intensityTarget: '2 RIR',
            deloadGuidance: 'Deload every 6th week.'
        }
    };
    const html = blueprintUI.renderProgressionFramework(prog);
    assert.ok(html.includes('Double Progression'));
    assert.ok(html.includes('Add 1 rep per set until top of range is hit.'));
    assert.ok(html.includes('2 RIR'));
    assert.ok(html.includes('Deload every 6th week.'));
});

runTest('TEST 29: Quality metrics rendered only when present (no fake percentages)', () => {
    const prog = {
        version: '1.0',
        qualityMetrics: {
            totalWeeklySets: 48,
            highFatigueExerciseCount: 2,
            movementCoverage: 'Complete (6/6)',
            durationCompliance: '100% compliant'
        }
    };
    const html = blueprintUI.renderQualityMetrics(prog);
    assert.ok(html.includes('48 sets'));
    assert.ok(html.includes('Complete (6/6)'));
    assert.ok(!html.includes('95% Match'));
    assert.ok(!html.includes('99% Accuracy'));
});

runTest('TEST 30: Deterministic rendering for same input (10 repeated passes)', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 30, gender: 'female', goal: 'get-shredded', userName: 'Ananya' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    const val = validatorEngine.validateProgram(prog, profile, reqs, exerciseDB);

    const firstHTML = blueprintUI.generateBlueprintHTML(prog, val);
    for (let i = 0; i < 10; i++) {
        const passHTML = blueprintUI.generateBlueprintHTML(prog, val);
        assert.strictEqual(passHTML, firstHTML);
    }
});

runTest('TEST 31: Escaping of user-provided strings (XSS protection)', () => {
    const profile = canonicalEngine.buildCanonicalUserProfile({ age: 25, gender: 'male', goal: 'muscle-gain', userName: '<script>alert("xss")</script>' });
    const reqs = rulesEngine.buildTrainingRequirements(profile);
    const prog = programGen.generateWorkoutProgram(profile, reqs);
    prog.meta = { userName: '<script>alert("xss")</script>' };

    const html = blueprintUI.generateBlueprintHTML(prog);
    assert.ok(!html.includes('<script>alert("xss")</script>'));
    assert.ok(html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
});

runTest('TEST 32: DOM mounting helper executes successfully in simulated document', () => {
    const mockElement = { innerHTML: '' };
    global.document = {
        querySelector: (sel) => (sel === '#blueprintRoot' ? mockElement : null)
    };

    const prog = { version: '1.0', meta: { userName: 'Test User' }, sessions: [] };
    const success = blueprintUI.renderPersonalizedBlueprint('#blueprintRoot', prog);
    assert.strictEqual(success, true);
    assert.ok(mockElement.innerHTML.includes('Test User'));

    delete global.document;
});

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
