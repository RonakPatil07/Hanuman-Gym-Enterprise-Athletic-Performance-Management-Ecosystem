/**
 * ==============================================================================
 * HANUMAN GYM — MASTER COMPREHENSIVE FLAGSHIP ARCHITECTURAL AUDIT
 * Deep-dive audit verifying all 24 engines, DOM tags, CSS rules, and contracts
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock browser global environment for Node testing
const storageMock = {};
global.localStorage = {
    getItem: (key) => storageMock[key] || null,
    setItem: (key, val) => { storageMock[key] = String(val); },
    removeItem: (key) => { delete storageMock[key]; },
    clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

// Import all engines
const canonicalProfileEngine = require('../js/engine/canonical-profile.js');
const exerciseDB = require('../js/engine/exercise-database.js');
const trainingRules = require('../js/engine/training-rules.js');
const intensityRules = require('../js/engine/intensity-rules.js');
const progressionRules = require('../js/engine/progression-rules.js');
const workoutLogger = require('../js/engine/workout-logger.js');
const performanceAnalysis = require('../js/engine/performance-analysis.js');
const adaptiveEngine = require('../js/engine/adaptive-training.js');
const weeklyAnalytics = require('../js/engine/weekly-analytics.js');
const substitutionEngine = require('../js/engine/exercise-substitution.js');
const periodizationEngine = require('../js/engine/periodization-engine.js');
const explanationsEngine = require('../js/engine/personalization-explanations.js');
const programGenerator = require('../js/engine/program-generator.js');
const programValidator = require('../js/engine/program-validator.js');
const muscleAnatomy = require('../js/engine/muscle-anatomy.js');
const formGuides = require('../js/engine/form-guides.js');
const voiceCoach = require('../js/engine/voice-coach.js');
const socialExport = require('../js/engine/social-export.js');
const profileBridge = require('../js/engine/user-profile-bridge.js');
const mesocycleScrubber = require('../js/engine/mesocycle-scrubber.js');
const calendarSync = require('../js/engine/calendar-sync.js');
const emgSubstitution = require('../js/engine/emg-substitution.js');
const gymFocusHUD = require('../js/engine/gym-focus-hud.js');
const auto1RMEngine = require('../js/engine/auto-1rm-engine.js');
const supersetEngine = require('../js/engine/superset-engine.js');
const pwaInstallerEngine = require('../js/engine/pwa-installer.js');
const blueprintUI = require('../js/ui/personalized-blueprint.js');

let auditCount = 0;
let passedCount = 0;
let failedCount = 0;

function runAudit(category, description, fn) {
    auditCount++;
    try {
        fn();
        passedCount++;
        console.log(`  ✅ [PASS ${auditCount}] [${category}] ${description}`);
    } catch (err) {
        failedCount++;
        console.error(`  ❌ [FAIL ${auditCount}] [${category}] ${description}`);
        console.error(`     Error: ${err.message}`);
    }
}

console.log('================================================================================');
console.log('       HANUMAN GYM MASTER ARCHITECTURAL & FUNCTIONAL AUDIT REPORT');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// AUDIT SECTION 1: CODEBASE FILE & ENGINE INTEGRITY
// -----------------------------------------------------------------------------
console.log('--- AUDIT 1: Engine Module Exports & UMD Contracts ---');

runAudit('MODULES', 'All 27 engines and UI modules export valid public APIs', () => {
    assert.ok(typeof canonicalProfileEngine.buildCanonicalUserProfile === 'function');
    assert.ok(typeof exerciseDB.getAllExercises === 'function');
    assert.ok(typeof trainingRules.buildTrainingRequirements === 'function');
    assert.ok(typeof intensityRules.calculateExerciseIntensity === 'function');
    assert.ok(typeof progressionRules.calculateProgressionStrategy === 'function');
    assert.ok(typeof workoutLogger.createWorkoutLog === 'function');
    assert.ok(typeof performanceAnalysis.analyzeExercisePerformance === 'function');
    assert.ok(typeof adaptiveEngine.calculateFatigueAccumulationIndex === 'function');
    assert.ok(typeof weeklyAnalytics.analyzeWeeklyPerformance === 'function');
    assert.ok(typeof substitutionEngine.findBestSubstitution === 'function');
    assert.ok(typeof periodizationEngine.generate12WeekTrainingBlock === 'function');
    assert.ok(typeof explanationsEngine.generatePersonalizationExplanation === 'function');
    assert.ok(typeof programGenerator.generateWorkoutProgram === 'function');
    assert.ok(typeof programValidator.validateProgram === 'function');
    assert.ok(typeof muscleAnatomy.analyzeProgramMuscleVolume === 'function');
    assert.ok(typeof formGuides.getExerciseFormGuide === 'function');
    assert.ok(typeof voiceCoach.announceRestStart === 'function');
    assert.ok(typeof socialExport.renderSocialCardCanvas === 'function');
    assert.ok(typeof profileBridge.syncProgramToMySpace === 'function');
    assert.ok(typeof mesocycleScrubber.calculateMorphedSessionsForWeek === 'function');
    assert.ok(typeof calendarSync.generateICSFileContent === 'function');
    assert.ok(typeof emgSubstitution.getAffinityAlternatives === 'function');
    assert.ok(typeof gymFocusHUD.startRestTimer === 'function');
    assert.ok(typeof auto1RMEngine.calculateWorkingLoad === 'function');
    assert.ok(typeof supersetEngine.groupSessionIntoSupersets === 'function');
    assert.ok(typeof pwaInstallerEngine.initPWAInstaller === 'function');
    assert.ok(typeof blueprintUI.generateBlueprintHTML === 'function');
});

// -----------------------------------------------------------------------------
// AUDIT SECTION 2: DOM SCRIPT TAGS & DEPENDENCY ORDER
// -----------------------------------------------------------------------------
console.log('\n--- AUDIT 2: HTML Script Tag Dependencies & Hierarchy ---');

runAudit('DOM', 'workout-plan.html loads all 27 script dependencies in strict mathematical order', () => {
    const htmlPath = path.join(__dirname, '../workout-plan.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    const expectedOrder = [
        'js/engine/canonical-profile.js',
        'js/engine/exercise-database.js',
        'js/engine/training-rules.js',
        'js/engine/intensity-rules.js',
        'js/engine/progression-rules.js',
        'js/engine/workout-logger.js',
        'js/engine/performance-analysis.js',
        'js/engine/adaptive-training.js',
        'js/engine/weekly-analytics.js',
        'js/engine/exercise-substitution.js',
        'js/engine/periodization-engine.js',
        'js/engine/personalization-explanations.js',
        'js/engine/program-generator.js',
        'js/engine/program-validator.js',
        'js/engine/muscle-anatomy.js',
        'js/engine/form-guides.js',
        'js/engine/voice-coach.js',
        'js/engine/social-export.js',
        'js/engine/user-profile-bridge.js',
        'js/engine/mesocycle-scrubber.js',
        'js/engine/calendar-sync.js',
        'js/engine/emg-substitution.js',
        'js/engine/gym-focus-hud.js',
        'js/engine/auto-1rm-engine.js',
        'js/engine/superset-engine.js',
        'js/engine/pwa-installer.js',
        'js/ui/personalized-blueprint.js',
        'workout-plan.js'
    ];

    let lastIdx = -1;
    expectedOrder.forEach(scriptSrc => {
        const idx = html.indexOf(scriptSrc);
        assert.ok(idx !== -1, `Missing script tag: ${scriptSrc}`);
        assert.ok(idx > lastIdx, `Script out of dependency order: ${scriptSrc}`);
        lastIdx = idx;
    });
});

runAudit('DOM', 'workout-plan.html contains all essential accessibility and HUD elements', () => {
    const htmlPath = path.join(__dirname, '../workout-plan.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('id="mainProgressContainer"'), 'Missing mainProgressContainer');
    assert.ok(html.includes('id="chapterBadge"'), 'Missing chapterBadge');
    assert.ok(html.includes('id="btnModePro"'), 'Missing btnModePro');
    assert.ok(html.includes('id="btnModeQuick"'), 'Missing btnModeQuick');
    assert.ok(html.includes('id="stepCounterPill"'), 'Missing stepCounterPill');
    assert.ok(html.includes('id="mainProgressBarFill"'), 'Missing mainProgressBarFill');
    assert.ok(html.includes('id="a11yStepAnnouncer"'), 'Missing a11yStepAnnouncer');
});

// -----------------------------------------------------------------------------
// AUDIT SECTION 3: CSS ARCHITECTURE & STYLING INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- AUDIT 3: CSS Class Architecture & Visual Hierarchy ---');

runAudit('CSS', 'workout-plan.css contains complete styling for all new flagship features', () => {
    const cssPath = path.join(__dirname, '../workout-plan.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    const requiredClasses = [
        '.sr-only',
        '.main-progress-container',
        '.chapter-badge',
        '.assessment-mode-selector-wrap',
        '.mode-toggle-btn.active',
        '.step-counter-pill',
        '.progress-bar-track',
        '.progress-bar-fill',
        '.live-assessment-insight-banner',
        '.interactive-mesocycle-scrubber-card',
        '.scrubber-week-pill',
        '.scrubber-week-pill.active-week',
        '.scrubber-slider-input',
        '.gym-focus-overlay',
        '.gym-focus-container',
        '.gym-focus-exercise-card',
        '.gym-bump-btn',
        '.gym-rest-countdown-ring-box',
        '.rest-timer-display-digits',
        '.emg-match-badge',
        '.resistance-curve-pill',
        '@media print'
    ];

    requiredClasses.forEach(cls => {
        assert.ok(css.includes(cls), `Missing CSS rule definition for: ${cls}`);
    });
});

// -----------------------------------------------------------------------------
// AUDIT SECTION 4: FLAGSHIP FEATURE 1 (MESOCYCLE SCRUBBER SIMULATOR)
// -----------------------------------------------------------------------------
console.log('\n--- AUDIT 4: Innovation 1 - 12-Week Mesocycle Wave-Loading Scrubber ---');

runAudit('SCRUBBER', 'Accurately morphs sets, loads and RIR across all 12 periodization phases', () => {
    const mockSessions = [
        {
            day: 'Day 1',
            title: 'Lower Body Strength',
            exercises: [
                { exerciseName: 'Barbell Back Squat', sets: 4, targetWeightKg: 120 },
                { exerciseName: 'Romanian Deadlift', sets: 3, targetWeightKg: 100 }
            ]
        }
    ];

    // Week 1: MEV
    const w1 = mesocycleScrubber.calculateMorphedSessionsForWeek(mockSessions, 1);
    assert.strictEqual(w1[0].exercises[0].sets, 4);
    assert.strictEqual(w1[0].exercises[0].rir, 3);
    assert.strictEqual(w1[0].exercises[0].weekModifier.projectedWeightKg, 120);

    // Week 4: Overload Peak (+7.5% Load)
    const w4 = mesocycleScrubber.calculateMorphedSessionsForWeek(mockSessions, 4);
    assert.strictEqual(w4[0].exercises[0].sets, 5); // 4 * 1.25 = 5
    assert.strictEqual(w4[0].exercises[0].rir, 1.5);
    assert.strictEqual(w4[0].exercises[0].weekModifier.projectedWeightKg, 129); // 120 * 1.075 = 129

    // Week 6: Deload (-40% Volume, -10% Load)
    const w6 = mesocycleScrubber.calculateMorphedSessionsForWeek(mockSessions, 6);
    assert.strictEqual(w6[0].exercises[0].sets, 2);
    assert.strictEqual(w6[0].exercises[0].rir, 4);
    assert.strictEqual(w6[0].exercises[0].weekModifier.projectedWeightKg, 108); // 120 * 0.9 = 108
});

// -----------------------------------------------------------------------------
// AUDIT SECTION 5: FLAGSHIP FEATURE 2 (CALENDAR SYNC .ICS EXPORTER)
// -----------------------------------------------------------------------------
console.log('\n--- AUDIT 5: Innovation 2 - RFC 5545 Universal Calendar Sync Engine ---');

runAudit('CALENDAR', 'Produces RFC 5545 compliant iCalendar payload with recurring weekly rules', () => {
    const mockProgram = {
        programTitle: 'Hanuman Gym Pro Hypertrophy',
        sessions: [
            {
                day: 'Monday',
                title: 'Chest & Back Volume',
                focus: 'Upper Hypertrophy',
                exercises: [
                    { exerciseName: 'Barbell Bench Press', sets: 4, reps: '8-12', rir: 2, restSeconds: 90 },
                    { exerciseName: 'Barbell Row', sets: 4, reps: '8-12', rir: 2, restSeconds: 90 }
                ]
            }
        ]
    };

    const ics = calendarSync.generateICSFileContent(mockProgram, { weeksCount: 12 });
    assert.ok(ics.includes('BEGIN:VCALENDAR'));
    assert.ok(ics.includes('VERSION:2.0'));
    assert.ok(ics.includes('PRODID:-//Hanuman Gym//Custom AI Workout Engine v2.0//EN'));
    assert.ok(ics.includes('BEGIN:VEVENT'));
    assert.ok(ics.includes('RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=12'));
    assert.ok(ics.includes('Barbell Bench Press — 4 sets × 8-12 reps (RIR 2) [Rest: 90s]'));
    assert.ok(ics.includes('BEGIN:VALARM'));
    assert.ok(ics.includes('END:VCALENDAR'));
});

// -----------------------------------------------------------------------------
// AUDIT SECTION 6: FLAGSHIP FEATURE 3 (EMG MUSCLE AFFINITY ENGINE)
// -----------------------------------------------------------------------------
console.log('\n--- AUDIT 6: Innovation 3 - Biomechanical EMG Muscle Affinity Engine ---');

runAudit('EMG_AFFINITY', 'Computes accurate EMG similarity indices and assigns resistance curves', () => {
    const benchAlternatives = emgSubstitution.getAffinityAlternatives('barbell-bench-press');
    assert.strictEqual(benchAlternatives.baseExercise.name, 'Barbell Bench Press');
    assert.ok(benchAlternatives.alternatives.length >= 3);
    assert.strictEqual(benchAlternatives.alternatives[0].id, 'dumbbell-bench-press');
    assert.strictEqual(benchAlternatives.alternatives[0].matchScore, 96);
    assert.strictEqual(benchAlternatives.alternatives[0].curve, 'STRETCH_MEDIATED');

    const squatAlternatives = emgSubstitution.getAffinityAlternatives('barbell-back-squat');
    assert.ok(squatAlternatives.alternatives.some(a => a.id === 'hack-squat' && a.matchScore === 95));

    const deadliftAlternatives = emgSubstitution.getAffinityAlternatives('conventional-deadlift');
    assert.ok(deadliftAlternatives.alternatives.some(a => a.id === 'romanian-deadlift' && a.matchScore === 94));
});

// -----------------------------------------------------------------------------
// AUDIT SECTION 7: FLAGSHIP FEATURE 4 (GYM FLOOR FOCUS HUD)
// -----------------------------------------------------------------------------
console.log('\n--- AUDIT 7: Innovation 4 - Full-Screen Gym Floor Focus Mode & Rest Ring ---');

runAudit('FOCUS_HUD', 'Handles time formatting, micro-load bumping and timer adjustments cleanly', () => {
    assert.strictEqual(gymFocusHUD.formatTimeMMSS(90), '01:30');
    assert.strictEqual(gymFocusHUD.formatTimeMMSS(120), '02:00');
    assert.strictEqual(gymFocusHUD.calculateWeightBump(80, 2.5), 82.5);
    assert.strictEqual(gymFocusHUD.calculateWeightBump(80, -1.25), 78.75);

    const timer = gymFocusHUD.startRestTimer(60);
    assert.strictEqual(timer.running, true);
    assert.strictEqual(timer.totalSeconds, 60);

    const adj = gymFocusHUD.adjustRestTimer(30);
    assert.strictEqual(adj.remaining, 90);

    const reset = gymFocusHUD.resetRestTimer();
    assert.strictEqual(reset.running, false);
});

// -----------------------------------------------------------------------------
// AUDIT SECTION 8: FULL END-TO-END PIPELINE SYNCHRONIZATION
// -----------------------------------------------------------------------------
console.log('\n--- AUDIT 8: Full End-to-End Program Pipeline & Dashboard Sync ---');

runAudit('PIPELINE', 'Generates, validates, morphs, synchronizes to My Space and exports', () => {
    // 1. Create canonical user profile
    const rawInput = {
        age: 26,
        gender: 'male',
        weight: 78,
        height: 180,
        fitnessGoal: 'muscle-gain',
        workoutExperience: 'intermediate',
        trainingDays: ['monday', 'tuesday', 'thursday', 'friday'],
        equipment: ['full-gym'],
        injuries: []
    };

    const canonicalProfile = canonicalProfileEngine.buildCanonicalUserProfile(rawInput);
    assert.ok(canonicalProfile);

    // 2. Build requirements & generate program
    const requirements = trainingRules.buildTrainingRequirements(canonicalProfile);
    assert.ok(requirements);
    const generatedProgram = programGenerator.generateWorkoutProgram(canonicalProfile, requirements);
    assert.ok(generatedProgram);
    assert.ok(generatedProgram.sessions.length > 0);

    // 3. Validate program
    const validation = programValidator.validateProgram(generatedProgram, canonicalProfile, requirements);
    assert.strictEqual(validation.status === 'VALID' || validation.status === 'WARNING', true);
    assert.strictEqual(validation.summary.errorCount, 0);

    // 4. Morph across 12-week periodization
    const morphed12Weeks = mesocycleScrubber.compute12WeekTrajectory(generatedProgram.sessions);
    assert.strictEqual(morphed12Weeks.length, 12);

    // 5. Synchronize to My Space LocalStorage
    const syncRes = profileBridge.syncProgramToMySpace(generatedProgram, canonicalProfile);
    assert.strictEqual(syncRes.success, true);
    const stored = profileBridge.getActiveProgramFromMySpace();
    assert.ok(stored);
    assert.strictEqual(stored.goal, 'muscle-gain');

    // 6. Generate Calendar .ICS payload
    const icsContent = calendarSync.generateICSFileContent(generatedProgram);
    assert.ok(icsContent.includes('BEGIN:VCALENDAR'));
    assert.ok(icsContent.includes('RRULE:FREQ=WEEKLY'));

    // 7. Render UI Blueprint string
    const htmlString = blueprintUI.generateBlueprintHTML(generatedProgram, validation);
    assert.ok(htmlString.includes('blueprint-hero-header'));
    assert.ok(htmlString.includes('mesocycleScrubberWrapper'));
    assert.ok(htmlString.includes('blueprint-session-card'));
});

// -----------------------------------------------------------------------------
// SUMMARY & QA CERTIFICATION
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log(`AUDIT COMPLETE: ${passedCount} / ${auditCount} CHECKS PASSED (${Math.round((passedCount / auditCount) * 100)}%)`);
if (failedCount > 0) {
    console.error(`FAILURES DETECTED: ${failedCount} audits failed.`);
    process.exit(1);
} else {
    console.log('🏆 SYSTEM STATUS: 100% PRODUCTION READY & FULLY CERTIFIED');
    console.log('================================================================================\n');
    process.exit(0);
}
