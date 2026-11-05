/**
 * ==============================================================================
 * HANUMAN GYM — BIOMECHANICAL FORM & VOICE COACH TEST SUITE
 * Unit & Integration verification for Form Guides, Tempo Rhythm parser,
 * and Web Audio / Speech Synthesis Voice Coach safely functioning across environments.
 * ==============================================================================
 */

const assert = require('assert');
const formEngine = require('../js/engine/form-guides.js');
const voiceEngine = require('../js/engine/voice-coach.js');

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
console.log('RUNNING BIOMECHANICAL FORM & VOICE COACH TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY 1: BIOMECHANICAL FORM GUIDES
// -----------------------------------------------------------------------------
console.log('CATEGORY 1: Biomechanical Form Guides');

runTest('TEST 1: Squat guide resolves kinetic chain setup and mistakes', () => {
    const guide = formEngine.getExerciseFormGuide('Barbell Back Squat');
    assert.ok(guide);
    assert.strictEqual(guide.name, 'Barbell Back Squats');
    assert.ok(guide.setup.length >= 3);
    assert.ok(guide.breathing.includes('Valsalva') || guide.breathing.includes('brace'));
    assert.ok(guide.mistakes.some(m => m.mistake.toLowerCase().includes('valgus') || m.mistake.toLowerCase().includes('knees')));
});

runTest('TEST 2: Bench Press guide resolves scapular positioning and elbow tuck fix', () => {
    const guide = formEngine.getExerciseFormGuide('Incline Dumbbell Bench Press');
    assert.ok(guide);
    assert.ok(guide.setup.some(s => s.toLowerCase().includes('scapula') || s.toLowerCase().includes('bench')));
    assert.ok(guide.mistakes.some(m => m.fix.toLowerCase().includes('elbow') || m.fix.toLowerCase().includes('torso')));
});

runTest('TEST 3: Deadlift guide resolves spinal alignment and slack pull cue', () => {
    const guide = formEngine.getExerciseFormGuide('Romanian Deadlift (RDL)');
    assert.ok(guide);
    assert.ok(guide.setup.some(s => s.toLowerCase().includes('mid-foot') || s.toLowerCase().includes('hinge')));
    assert.ok(guide.mistakes.some(m => m.mistake.toLowerCase().includes('flexion') || m.mistake.toLowerCase().includes('back')));
});

// -----------------------------------------------------------------------------
// CATEGORY 2: TEMPO RHYTHM PARSER & VISUALIZER
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 2: Tempo Rhythm Parser & Visualizer');

runTest('TEST 4: Parses standard 3-1-1-0 tempo code into numeric phases', () => {
    const parsed = formEngine.parseTempo('3-1-1-0');
    assert.strictEqual(parsed.eccentric, 3);
    assert.strictEqual(parsed.pauseBottom, 1);
    assert.strictEqual(parsed.concentric, 1);
    assert.strictEqual(parsed.pauseTop, 0);
    assert.strictEqual(parsed.totalSeconds, 5);
});

runTest('TEST 5: Parses explosive 2-0-1-0 tempo code accurately', () => {
    const parsed = formEngine.parseTempo('2-0-1-0');
    assert.strictEqual(parsed.eccentric, 2);
    assert.strictEqual(parsed.pauseBottom, 0);
    assert.strictEqual(parsed.concentric, 1);
    assert.strictEqual(parsed.totalSeconds, 3);
});

runTest('TEST 6: Handles missing or invalid tempo strings safely with default 3-1-1-0', () => {
    const parsed = formEngine.parseTempo(null);
    assert.strictEqual(parsed.eccentric, 3);
    assert.strictEqual(parsed.totalSeconds, 5);
});

runTest('TEST 7: Renders tempo visualizer container with color-coded phase tracks', () => {
    const html = formEngine.renderTempoVisualizer('3-1-1-0');
    assert.ok(html.includes('tempo-rhythm-container'));
    assert.ok(html.includes('phase-eccentric'));
    assert.ok(html.includes('phase-concentric'));
    assert.ok(html.includes('3s Lower'));
});

// -----------------------------------------------------------------------------
// CATEGORY 3: VOICE COACH & SOUND FX SAFETY GATES
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 3: Voice Coach & Web Audio Synthesizer');

runTest('TEST 8: Voice Coach settings toggle correctly', () => {
    voiceEngine.setVoiceEnabled(true);
    assert.strictEqual(voiceEngine.isVoiceEnabled(), true);

    voiceEngine.setVoiceEnabled(false);
    assert.strictEqual(voiceEngine.isVoiceEnabled(), false);
    voiceEngine.setVoiceEnabled(true); // reset
});

runTest('TEST 9: Audio synthesizer methods execute safely without browser window context', () => {
    // In headless Node.js, Web Audio Context is not present; methods must execute without throwing errors
    assert.doesNotThrow(() => voiceEngine.playTone(440, 'sine', 100));
    assert.doesNotThrow(() => voiceEngine.playCountdownBeep(false));
    assert.doesNotThrow(() => voiceEngine.playCountdownBeep(true));
    assert.doesNotThrow(() => voiceEngine.playSuccessChime());
    assert.doesNotThrow(() => voiceEngine.playPrFanfare());
    assert.doesNotThrow(() => voiceEngine.speak('Test speech announcement'));
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
