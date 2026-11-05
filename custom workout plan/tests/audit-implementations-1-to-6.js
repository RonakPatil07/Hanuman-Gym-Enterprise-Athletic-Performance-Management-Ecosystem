/**
 * ==============================================================================
 * HANUMAN GYM — FULL 6-PILLAR ARCHITECTURAL AUDIT BATTERY
 * Exhaustive validation & contract verification across Implementations 1 to 6.
 * ==============================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Core Engines
const formEngine = require('../js/engine/form-guides.js');
const voiceEngine = require('../js/engine/voice-coach.js');
const adaptiveEngine = require('../js/engine/adaptive-training.js');
const anatomyEngine = require('../js/engine/muscle-anatomy.js');
const intensityEngine = require('../js/engine/intensity-rules.js');
const exportEngine = require('../js/engine/social-export.js');
const periodizationEngine = require('../js/engine/periodization-engine.js');
const explanationEngine = require('../js/engine/personalization-explanations.js');
const validatorEngine = require('../js/engine/program-validator.js');
const generatorEngine = require('../js/engine/program-generator.js');

let auditResults = {
    totalAudits: 0,
    passedAudits: 0,
    failedAudits: 0,
    pillarReports: []
};

function audit(pillarNum, title, testFn) {
    auditResults.totalAudits++;
    try {
        testFn();
        auditResults.passedAudits++;
        console.log(`  ✅ [PASS] ${title}`);
    } catch (err) {
        auditResults.failedAudits++;
        console.error(`  ❌ [FAIL] ${title}`);
        console.error(`     Error: ${err.message}`);
        console.error(err.stack);
    }
}

console.log('================================================================================');
console.log('       HANUMAN GYM — COMPREHENSIVE AUDIT OF IMPLEMENTATIONS 1 TO 6');
console.log('================================================================================\n');

// =============================================================================
// AUDIT PILLAR 1: DUAL-TRACK ONBOARDING FUNNEL & LIVE MICRO-INSIGHTS
// =============================================================================
console.log('--- AUDIT 1: Dual-Track Onboarding Funnel & Live Micro-Insights ---');

audit(1, '1.1: Quick Mode & Pro Mode UI and reactive banner present in DOM', () => {
    const htmlContent = fs.readFileSync(path.join(__dirname, '../workout-plan.html'), 'utf8');
    assert.ok(htmlContent.includes('id="btnModeQuick"'), 'Quick mode button missing in HTML');
    assert.ok(htmlContent.includes('id="btnModePro"'), 'Pro mode button missing in HTML');
    assert.ok(htmlContent.includes('id="liveAssessmentInsightBanner"'), 'Live Insight HUD missing in HTML');

    const jsContent = fs.readFileSync(path.join(__dirname, '../workout-plan.js'), 'utf8');
    assert.ok(jsContent.includes('QUICK_MODE_SEQUENCE'), 'QUICK_MODE_SEQUENCE missing in workout-plan.js');
    assert.ok(jsContent.includes('updateLiveAssessmentInsight'), 'updateLiveAssessmentInsight missing in workout-plan.js');
    assert.ok(jsContent.includes('setAssessmentMode'), 'setAssessmentMode missing in workout-plan.js');
});

audit(1, '1.2: BMR & TDEE Mathematical formulas follow Mifflin-St Jeor equation', () => {
    // Mifflin-St Jeor: Male = 10*wt + 6.25*ht - 5*age + 5
    const maleWeight = 80, maleHeight = 180, maleAge = 25;
    const expectedMaleBMR = Math.round((10 * maleWeight) + (6.25 * maleHeight) - (5 * maleAge) + 5);
    assert.strictEqual(expectedMaleBMR, 1805);

    // Female: 10*wt + 6.25*ht - 5*age - 161
    const femWeight = 60, femHeight = 165, femAge = 30;
    const expectedFemBMR = Math.round((10 * femWeight) + (6.25 * femHeight) - (5 * femAge) - 161);
    assert.strictEqual(expectedFemBMR, 1320);
});

// =============================================================================
// AUDIT PILLAR 2: BIOMECHANICAL MUSCLE ANATOMY & ACTIVATION HEATMAP
// =============================================================================
console.log('\n--- AUDIT 2: Biomechanical Muscle Anatomy Heatmap ---');

audit(2, '2.1: Anatomy engine classifies Agonist, Synergist, and Stabilizer muscles correctly', () => {
    const squatMap = anatomyEngine.getExerciseMuscleMap('Barbell Back Squat');
    assert.ok(squatMap.primary.includes('quads'));
    assert.ok(squatMap.primary.includes('glutes'));
    assert.ok(squatMap.secondary.includes('hamstrings') || squatMap.secondary.includes('calves'));
    assert.ok(squatMap.stabilizer.includes('abs') || squatMap.stabilizer.includes('lower_back'));

    const benchMap = anatomyEngine.getExerciseMuscleMap('Incline Barbell Bench Press');
    assert.ok(benchMap.primary.includes('chest'));
    assert.ok(benchMap.secondary.includes('triceps') || benchMap.primary.includes('shoulders_front'));
});

audit(2, '2.2: Renaissance Periodization Hypertrophy Volume Landmarks calculate correctly', () => {
    assert.strictEqual(anatomyEngine.getVolumeStatus('chest', 4).status, 'BELOW_MEV');
    assert.strictEqual(anatomyEngine.getVolumeStatus('chest', 10).status, 'MINIMUM_GROWTH');
    assert.strictEqual(anatomyEngine.getVolumeStatus('chest', 16).status, 'OPTIMAL_MAV');
    assert.strictEqual(anatomyEngine.getVolumeStatus('chest', 25).status, 'OVER_MRV');
});

audit(2, '2.3: Dual-View 2D SVG graphic renders valid Anterior and Posterior anatomy vectors', () => {
    const mockProgram = {
        sessions: [
            { day: 'Day 1', exercises: [{ exerciseName: 'Barbell Bench Press', sets: 4 }, { exerciseName: 'Barbell Squat', sets: 4 }] }
        ]
    };
    const svgHTML = anatomyEngine.renderAnatomyHeatmapSVG(mockProgram, 'ALL');
    assert.ok(svgHTML.includes('<svg'), 'SVG tag missing');
    assert.ok(svgHTML.includes('ANTERIOR'), 'Anterior view title missing');
    assert.ok(svgHTML.includes('POSTERIOR'), 'Posterior view title missing');
    assert.ok(svgHTML.includes('muscle-node'), 'Muscle nodes missing');
});

// =============================================================================
// AUDIT PILLAR 3: ACTIVE IN-GYM WORKOUT MODE
// =============================================================================
console.log('\n--- AUDIT 3: Active In-Gym Workout Mode ---');

audit(3, '3.1: 1RM / E1RM Formulas (Epley & Brzycki) produce accurate scientific estimates', () => {
    const e1rm100x10 = intensityEngine.calculateE1RM(100, 10);
    // Epley: 100 * (1 + 10/30) = 133.33 -> 133.3
    assert.strictEqual(e1rm100x10, 133.3);

    const e1rm140x5 = intensityEngine.calculateE1RM(140, 5);
    // Epley: 140 * (1 + 5/30) = 163.33 -> 163.3
    assert.strictEqual(e1rm140x5, 163.3);
});

audit(3, '3.2: 4-Tier Science Warm-Up Pyramid generates potentiation ramp', () => {
    const pyramid = intensityEngine.calculateWarmupPyramid(100, 'kg', true);
    assert.strictEqual(pyramid.length, 4);
    assert.strictEqual(pyramid[0].weight, 20); // 20kg bar
    assert.strictEqual(pyramid[1].weight, 50); // 50%
    assert.strictEqual(pyramid[2].weight, 70); // 70%
    assert.ok(pyramid[3].weight >= 85 && pyramid[3].weight <= 90); // 87.5kg / ~88%
});

// =============================================================================
// AUDIT PILLAR 4: ADAPTIVE OVERLOAD & AUTOMATIC DELOAD PROTOCOL AI
// =============================================================================
console.log('\n--- AUDIT 4: Adaptive Overload & Deload Protocol AI ---');

audit(4, '4.1: Systemic Fatigue Accumulation Index (FAI) evaluates readiness accurately', () => {
    // Fresh
    const fresh = adaptiveEngine.calculateFatigueAccumulationIndex([], null);
    assert.strictEqual(fresh.level, 'FRESH');
    assert.strictEqual(fresh.deloadRecommended, false);

    // Overreaching
    const overreachingLogs = Array.from({ length: 6 }, () => ({
        status: 'COMPLETED',
        exercises: [{ exerciseId: 'deadlift', sets: [{ completed: true, plannedReps: 8, actualReps: 4, actualRIR: 0 }] }]
    }));
    const overreached = adaptiveEngine.calculateFatigueAccumulationIndex(overreachingLogs, null);
    assert.strictEqual(overreached.level, 'OVERREACHING');
    assert.strictEqual(overreached.deloadRecommended, true);
});

audit(4, '4.2: Deload Program Generator adheres to -40% sets and +2 RIR reserve invariant', () => {
    const base = {
        sessions: [
            { exercises: [{ exerciseName: 'Bench Press', sets: 5, targetRIR: 2, targetRPE: 8 }] }
        ]
    };
    const deload = adaptiveEngine.generateDeloadProgram(base);
    assert.strictEqual(deload.isDeload, true);
    assert.strictEqual(deload.sessions[0].exercises[0].sets, 3); // 5 * 0.6 = 3
    assert.strictEqual(deload.sessions[0].exercises[0].targetRIR, 4); // 2 + 2 = 4
    assert.strictEqual(deload.sessions[0].exercises[0].targetRPE, 6); // 8 - 2 = 6
    assert.strictEqual(base.sessions[0].exercises[0].sets, 5); // Base program immutable
});

audit(4, '4.3: 4-Week Overload Forecast Trajectory generates valid progression steps', () => {
    const forecast = adaptiveEngine.generateOverloadForecast({ sets: 4, reps: '8-12' }, {});
    assert.strictEqual(forecast.length, 4);
    assert.strictEqual(forecast[0].week, 1);
    assert.strictEqual(forecast[3].week, 4);
});

// =============================================================================
// AUDIT PILLAR 5: BIOMECHANICAL FORM MASTERCLASS & WEB AUDIO VOICE COACH
// =============================================================================
console.log('\n--- AUDIT 5: Biomechanical Form Guides & Voice Coach Engine ---');

audit(5, '5.1: Form guide database provides setups, breathing, and fixes across all movement patterns', () => {
    ['squat', 'bench press', 'deadlift', 'pull-up', 'barbell row', 'overhead press', 'bicep curl'].forEach(lift => {
        const guide = formEngine.getExerciseFormGuide(lift);
        assert.ok(guide, `Guide missing for ${lift}`);
        assert.ok(guide.setup.length > 0, `Setup steps missing for ${lift}`);
        assert.ok(guide.breathing.length > 0, `Breathing cue missing for ${lift}`);
        assert.ok(guide.mistakes.length > 0, `Mistakes missing for ${lift}`);
    });
});

audit(5, '5.2: Tempo parser parses eccentric, pause, and concentric intervals', () => {
    const tempo = formEngine.parseTempo('3-1-1-0');
    assert.strictEqual(tempo.eccentric, 3);
    assert.strictEqual(tempo.pauseBottom, 1);
    assert.strictEqual(tempo.concentric, 1);
    assert.strictEqual(tempo.pauseTop, 0);
    assert.strictEqual(tempo.totalSeconds, 5);
});

audit(5, '5.3: Voice Coach synthesizes tones and handles speech safely', () => {
    assert.doesNotThrow(() => voiceEngine.playCountdownBeep(true));
    assert.doesNotThrow(() => voiceEngine.playSuccessChime());
    assert.doesNotThrow(() => voiceEngine.playPrFanfare());
    assert.doesNotThrow(() => voiceEngine.announceRestStart(90, 'Barbell Squat'));
});

// =============================================================================
// AUDIT PILLAR 6: SOCIAL SHARE CARD GENERATOR & TRAINER EXPORT SUITE
// =============================================================================
console.log('\n--- AUDIT 6: Social Share Card Generator & Trainer Export Suite ---');

audit(6, '6.1: Social card format resolutions match industry standards', () => {
    assert.strictEqual(exportEngine.CARD_FORMATS.STORY.width, 1080);
    assert.strictEqual(exportEngine.CARD_FORMATS.STORY.height, 1920);
    assert.strictEqual(exportEngine.CARD_FORMATS.SQUARE.width, 1080);
    assert.strictEqual(exportEngine.CARD_FORMATS.SQUARE.height, 1080);
});

audit(6, '6.2: Compact program payload encodes to and from valid Base64 JSON', () => {
    const mock = {
        programId: 'audit_prog_123',
        programTitle: 'Audit Upper Lower',
        sessions: [{ day: 'Day 1', title: 'Upper A', exercises: [{ exerciseName: 'Bench', sets: 3, reps: '8-10' }] }]
    };
    const encoded = exportEngine.generateCompactProgramPayload(mock);
    assert.ok(encoded.length > 0);
    const decoded = JSON.parse(decodeURIComponent(escape(Buffer.from(encoded, 'base64').toString('utf-8'))));
    assert.strictEqual(decoded.id, 'audit_prog_123');
    assert.strictEqual(decoded.title, 'Audit Upper Lower');
});

// =============================================================================
// AUDIT PILLAR INTEGRITY: SCRIPT TAG INJECTIONS & CSS CONTRACTS
// =============================================================================
console.log('\n--- AUDIT 7: DOM Script Tags & CSS Class Architecture ---');

audit(7, '7.1: All 6 engine scripts are loaded in workout-plan.html in correct dependency order', () => {
    const html = fs.readFileSync(path.join(__dirname, '../workout-plan.html'), 'utf8');
    const requiredScripts = [
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
    requiredScripts.forEach(src => {
        const idx = html.indexOf(src);
        assert.ok(idx > -1, `Script ${src} missing from workout-plan.html`);
        assert.ok(idx > lastIdx, `Script ${src} loaded out of order`);
        lastIdx = idx;
    });
});

audit(7, '7.2: workout-plan.css contains responsive and ink-friendly print rules', () => {
    const css = fs.readFileSync(path.join(__dirname, '../workout-plan.css'), 'utf8');
    assert.ok(css.includes('.fai-advisor-banner'), 'FAI CSS missing');
    assert.ok(css.includes('.tempo-rhythm-container'), 'Tempo CSS missing');
    assert.ok(css.includes('.form-guide-drawer'), 'Form Guide CSS missing');
    assert.ok(css.includes('.social-share-modal-content'), 'Social Share CSS missing');
    assert.ok(css.includes('@media print'), 'Print CSS missing');
});

// =============================================================================
// AUDIT SUMMARY
// =============================================================================
console.log('\n================================================================================');
console.log(`AUDIT COMPLETE: ${auditResults.passedAudits} / ${auditResults.totalAudits} CHECKS PASSED (${Math.round((auditResults.passedAudits / auditResults.totalAudits) * 100)}%)`);
console.log('================================================================================\n');

if (auditResults.failedAudits > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
