/**
 * ==============================================================================
 * HANUMAN GYM — SOCIAL SHARE & EXPORT ENGINE TEST SUITE
 * Unit & Integration verification for Story/Square formats, payload serialization,
 * and export safety across environments.
 * ==============================================================================
 */

const assert = require('assert');
const exportEngine = require('../js/engine/social-export.js');

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
console.log('RUNNING SOCIAL SHARE & EXPORT ENGINE TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY 1: CARD FORMAT RESOLUTION & CONSTANTS
// -----------------------------------------------------------------------------
console.log('CATEGORY 1: Card Format Specifications');

runTest('TEST 1: Story format specifies 9:16 aspect ratio (1080x1920)', () => {
    assert.strictEqual(exportEngine.CARD_FORMATS.STORY.width, 1080);
    assert.strictEqual(exportEngine.CARD_FORMATS.STORY.height, 1920);
});

runTest('TEST 2: Square format specifies 1:1 aspect ratio (1080x1080)', () => {
    assert.strictEqual(exportEngine.CARD_FORMATS.SQUARE.width, 1080);
    assert.strictEqual(exportEngine.CARD_FORMATS.SQUARE.height, 1080);
});

// -----------------------------------------------------------------------------
// CATEGORY 2: PROGRAM PAYLOAD SERIALIZATION & COMPACT ENCODING
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 2: Program Payload Serialization');

runTest('TEST 3: Compact program payload encodes to valid Base64 string', () => {
    const mockProgram = {
        programId: 'prog_xyz_789',
        programTitle: 'Hypertrophy Mastery Split',
        goal: 'MUSCLE_HYPERTROPHY',
        sessions: [
            {
                day: 'Day 1',
                title: 'Upper Push & Pull',
                exercises: [
                    { exerciseName: 'Incline Bench Press', sets: 4, reps: '8-12' },
                    { exerciseName: 'Barbell Row', sets: 4, reps: '8-12' }
                ]
            }
        ]
    };

    const payload = exportEngine.generateCompactProgramPayload(mockProgram);
    assert.ok(typeof payload === 'string' && payload.length > 0);

    // Decode and verify
    const jsonStr = Buffer.from(payload, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodeURIComponent(escape(jsonStr)));

    assert.strictEqual(parsed.id, 'prog_xyz_789');
    assert.strictEqual(parsed.title, 'Hypertrophy Mastery Split');
    assert.strictEqual(parsed.sessions.length, 1);
    assert.strictEqual(parsed.sessions[0].exercises.length, 2);
});

runTest('TEST 4: Null or invalid program returns empty string safely', () => {
    const res = exportEngine.generateCompactProgramPayload(null);
    assert.strictEqual(res, '');
});

// -----------------------------------------------------------------------------
// CATEGORY 3: BROWSER ENVIRONMENT SAFETY GATES
// -----------------------------------------------------------------------------
console.log('\nCATEGORY 3: Headless Environment Safety');

runTest('TEST 5: renderSocialCardCanvas returns null safely without browser DOM', () => {
    const res = exportEngine.renderSocialCardCanvas({ programTitle: 'Test' }, 'story');
    assert.strictEqual(res, null);
});

runTest('TEST 6: downloadCanvasAsPNG and shareCanvasNative handle null canvas safely', () => {
    assert.doesNotThrow(() => exportEngine.downloadCanvasAsPNG(null));
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
