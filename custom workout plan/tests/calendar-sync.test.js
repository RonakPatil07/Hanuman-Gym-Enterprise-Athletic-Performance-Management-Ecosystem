/**
 * ==============================================================================
 * HANUMAN GYM — CALENDAR SYNC & .ICS EXPORTER UNIT TESTS
 * ==============================================================================
 */

const assert = require('assert');
const calendarEngine = require('../js/engine/calendar-sync.js');

let testsPassed = 0;
let totalTests = 0;

function runTest(desc, fn) {
    totalTests++;
    try {
        fn();
        testsPassed++;
        console.log(`  ✅ [PASS] TEST ${totalTests}: ${desc}`);
    } catch (e) {
        console.error(`  ❌ [FAIL] TEST ${totalTests}: ${desc}`);
        console.error(e);
    }
}

console.log('================================================================');
console.log('RUNNING CALENDAR SYNC & .ICS EXPORTER TEST SUITE');
console.log('================================================================\n');

console.log('CATEGORY 1: RFC 5545 iCalendar VCALENDAR Compliance');
runTest('Generates standard VCALENDAR header and footer', () => {
    const mockProgram = {
        programTitle: 'Hypertrophy Protocol',
        sessions: [
            { day: 'Monday', title: 'Chest & Triceps', focus: 'Push Volume', exercises: [{ exerciseName: 'Bench Press', sets: 4, reps: '8-10' }] }
        ]
    };
    const ics = calendarEngine.generateICSFileContent(mockProgram);
    assert.ok(ics.includes('BEGIN:VCALENDAR'));
    assert.ok(ics.includes('VERSION:2.0'));
    assert.ok(ics.includes('PRODID:-//Hanuman Gym//Custom AI Workout Engine v2.0//EN'));
    assert.ok(ics.includes('END:VCALENDAR'));
});

console.log('\nCATEGORY 2: VEVENT Recurring Rules & Schedule Mapping');
runTest('Embeds recurring weekly rule and exercise list in event description', () => {
    const mockProgram = {
        programTitle: '4-Day Upper Lower Split',
        sessions: [
            { day: 'Monday', title: 'Upper Body A', focus: 'Chest & Back', exercises: [{ exerciseName: 'Incline Bench Press', sets: 4, reps: '8-12', rir: 2, restSeconds: 90 }] },
            { day: 'Tuesday', title: 'Lower Body A', focus: 'Quads & Calves', exercises: [{ exerciseName: 'Barbell Squat', sets: 4, reps: '6-8', rir: 2, restSeconds: 120 }] }
        ]
    };
    const ics = calendarEngine.generateICSFileContent(mockProgram, { weeksCount: 8 });
    assert.ok(ics.includes('BEGIN:VEVENT'));
    assert.ok(ics.includes('RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=8'));
    assert.ok(ics.includes('RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=8'));
    assert.ok(ics.includes('Incline Bench Press'));
    assert.ok(ics.includes('VALARM')); // Reminder alarm
});

console.log('\nCATEGORY 3: Google Calendar 1-Tap URL Generation');
runTest('Generates encoded Google Calendar template URL', () => {
    const session = { title: 'Leg Day Annihilation', focus: 'Quads and Hamstrings' };
    const program = { programTitle: '12-Week Mass Protocol' };
    const url = calendarEngine.generateGoogleCalendarURL(session, program);
    assert.ok(url.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'));
    assert.ok(url.includes('Leg%20Day%20Annihilation'));
});

console.log('\n================================================================');
console.log(`RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED (${Math.round((testsPassed / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (testsPassed !== totalTests) {
    process.exit(1);
} else {
    process.exit(0);
}
