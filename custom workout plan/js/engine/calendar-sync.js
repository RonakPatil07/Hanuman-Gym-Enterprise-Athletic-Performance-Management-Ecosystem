/**
 * ==============================================================================
 * HANUMAN GYM — UNIVERSAL CALENDAR SCHEDULE EXPORTER (RFC 5545 .ICS ENGINE)
 * Exports workout routines to Apple Calendar, Google Calendar, and Outlook
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CalendarSyncEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DAY_MAP = {
        'sunday': 0, 'sun': 0,
        'monday': 1, 'mon': 1,
        'tuesday': 2, 'tue': 2,
        'wednesday': 3, 'wed': 3,
        'thursday': 4, 'thu': 4,
        'friday': 5, 'fri': 5,
        'saturday': 6, 'sat': 6
    };

    const ICAL_DAY_MAP = {
        0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA'
    };

    /**
     * Formats a JS Date to iCalendar UTC timestamp string: YYYYMMDDTHHMMSSZ
     * @param {Date} date 
     * @returns {string}
     */
    function formatICalDate(date) {
        const pad = (n) => String(n).padStart(2, '0');
        return date.getUTCFullYear() +
            pad(date.getUTCMonth() + 1) +
            pad(date.getUTCDate()) + 'T' +
            pad(date.getUTCHours()) +
            pad(date.getUTCMinutes()) +
            pad(date.getUTCSeconds()) + 'Z';
    }

    /**
     * Finds the next date for a given day of the week.
     * @param {number} targetDay - 0 (Sun) to 6 (Sat)
     * @param {number} [hour=7] - Default start hour
     * @param {number} [minute=0] - Default start minute
     * @returns {Date}
     */
    function getNextDayOfWeek(targetDay, hour = 7, minute = 0) {
        const now = new Date();
        const result = new Date(now);
        result.setHours(hour, minute, 0, 0);

        const currentDay = now.getDay();
        let distance = (targetDay - currentDay + 7) % 7;
        if (distance === 0 && now.getTime() > result.getTime()) {
            distance = 7;
        }
        result.setDate(now.getDate() + distance);
        return result;
    }

    /**
     * Cleans and escapes text according to RFC 5545.
     * @param {string} text 
     * @returns {string}
     */
    function escapeICalText(text) {
        if (!text) return '';
        return String(text)
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\r\n|\n|\r/g, '\\n');
    }

    /**
     * Generates standard RFC 5545 .ICS file content for a full workout mesocycle.
     * @param {Object} program - Generated workout program
     * @param {Object} [options] - Optional custom time / recurrence config
     * @returns {string} Valid iCalendar text
     */
    function generateICSFileContent(program, options) {
        if (!program || typeof program !== 'object') {
            throw new Error('Invalid program object provided to CalendarSyncEngine');
        }

        const opt = options || {};
        const startHour = typeof opt.startHour === 'number' ? opt.startHour : 7;
        const startMinute = typeof opt.startMinute === 'number' ? opt.startMinute : 0;
        const durationMinutes = typeof opt.durationMinutes === 'number' ? opt.durationMinutes : 60;
        const weeksCount = typeof opt.weeksCount === 'number' ? opt.weeksCount : 12;

        const programTitle = program.programTitle || 'Hanuman Gym Custom Workout Program';
        const sessions = Array.isArray(program.sessions) ? program.sessions : [];

        let ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Hanuman Gym//Custom AI Workout Engine v2.0//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:' + escapeICalText(programTitle),
            'X-WR-TIMEZONE:UTC'
        ];

        const nowUtc = formatICalDate(new Date());

        sessions.forEach((session, sIdx) => {
            const rawDayStr = String(session.day || '').toLowerCase().replace(/[^a-z]/g, '');
            const targetDayNum = DAY_MAP[rawDayStr] !== undefined ? DAY_MAP[rawDayStr] : ((sIdx * 2 + 1) % 7);
            const byDayRule = ICAL_DAY_MAP[targetDayNum];

            const startDate = getNextDayOfWeek(targetDayNum, startHour, startMinute);
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

            const uid = `hg-workout-${Date.now()}-${sIdx}-${Math.random().toString(36).substring(2, 9)}@hanumangym.com`;
            const summary = `🏋️ ${session.title || session.focus || `Workout Session ${sIdx + 1}`} | Hanuman Gym`;

            // Build detailed description of exercises
            let descLines = [
                `PROGRAM: ${programTitle}`,
                `SESSION: ${session.title || `Day ${sIdx + 1}`}`,
                `FOCUS: ${session.focus || 'Strength & Hypertrophy'}`,
                `ESTIMATED TIME: ${durationMinutes} Minutes`,
                '----------------------------------------',
                'EXERCISE PROTOCOL:'
            ];

            if (Array.isArray(session.exercises)) {
                session.exercises.forEach((ex, exIdx) => {
                    const name = ex.exerciseName || ex.name || 'Exercise';
                    const sets = ex.sets || 3;
                    const reps = ex.reps || '8-12';
                    const rir = ex.rir !== undefined ? ` (RIR ${ex.rir})` : '';
                    const rest = ex.restSeconds ? ` [Rest: ${ex.restSeconds}s]` : '';
                    descLines.push(`${exIdx + 1}. ${name} — ${sets} sets × ${reps} reps${rir}${rest}`);
                });
            }

            descLines.push('----------------------------------------');
            descLines.push('⚡ Open Live HUD: http://localhost:8000/custom%20workout%20plan/workout-plan.html');

            const description = descLines.join('\n');

            ics.push('BEGIN:VEVENT');
            ics.push(`UID:${uid}`);
            ics.push(`DTSTAMP:${nowUtc}`);
            ics.push(`DTSTART:${formatICalDate(startDate)}`);
            ics.push(`DTEND:${formatICalDate(endDate)}`);
            ics.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDayRule};COUNT=${weeksCount}`);
            ics.push(`SUMMARY:${escapeICalText(summary)}`);
            ics.push(`DESCRIPTION:${escapeICalText(description)}`);
            ics.push('LOCATION:Hanuman Gym Athlete Floor / Home Gym');
            ics.push('STATUS:CONFIRMED');
            ics.push('TRANSP:OPAQUE');
            ics.push('BEGIN:VALARM');
            ics.push('TRIGGER:-PT30M');
            ics.push('ACTION:DISPLAY');
            ics.push(`DESCRIPTION:Upcoming Workout: ${escapeICalText(session.title || 'Training Session')}`);
            ics.push('END:VALARM');
            ics.push('END:VEVENT');
        });

        ics.push('END:VCALENDAR');
        return ics.join('\r\n');
    }

    /**
     * Triggers in-browser download of the generated .ICS file.
     * @param {Object} program 
     * @param {string} [filename]
     * @param {Object} [options]
     */
    function downloadICSFile(program, filename, options) {
        const icsContent = generateICSFileContent(program, options);
        const name = filename || `${(program.programTitle || 'Workout-Plan').replace(/[^a-z0-9]/gi, '_')}.ics`;
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }

    /**
     * Generates a 1-tap Google Calendar Web URL for a single session.
     * @param {Object} session 
     * @param {Object} program 
     * @returns {string} URL string
     */
    function generateGoogleCalendarURL(session, program) {
        const title = encodeURIComponent(`🏋️ ${session.title || 'Hanuman Gym Workout'}`);
        const details = encodeURIComponent(
            `Program: ${program?.programTitle || 'Custom AI Plan'}\nFocus: ${session.focus || 'Full Body'}\n\nLive HUD: http://localhost:8000/custom%20workout%20plan/workout-plan.html`
        );
        const loc = encodeURIComponent('Hanuman Gym Floor');
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}`;
    }

    return {
        DAY_MAP,
        ICAL_DAY_MAP,
        formatICalDate,
        getNextDayOfWeek,
        escapeICalText,
        generateICSFileContent,
        downloadICSFile,
        generateGoogleCalendarURL
    };
}));
