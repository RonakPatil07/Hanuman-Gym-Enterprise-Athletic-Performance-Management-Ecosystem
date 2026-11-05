/**
 * ==============================================================================
 * HANUMAN GYM — FULL-SCREEN GYM FLOOR FOCUS HUD ENGINE
 * Distraction-free in-gym active workout mode with audio-haptic countdown timer
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.GymFocusHUDEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    let restTimerInterval = null;
    let restSecondsRemaining = 0;
    let restTotalSeconds = 90;
    let isTimerRunning = false;

    /**
     * Plays a short synthesized Web Audio tone.
     * @param {number} freq - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} [type='sine']
     */
    function playAudioCue(freq = 880, duration = 0.15, type = 'sine') {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context silently handled
        }
    }

    /**
     * Starts the active rest countdown timer.
     * @param {number} durationSeconds - Total duration in seconds
     * @param {Function} [onTick] - Callback executed every second: (remaining, total, percentage)
     * @param {Function} [onComplete] - Callback executed when timer hits 0
     * @returns {{ running: boolean, totalSeconds: number }}
     */
    function startRestTimer(durationSeconds = 90, onTick, onComplete) {
        clearInterval(restTimerInterval);
        restTotalSeconds = Math.max(5, parseInt(durationSeconds, 10) || 90);
        restSecondsRemaining = restTotalSeconds;
        isTimerRunning = true;

        if (typeof onTick === 'function') {
            onTick(restSecondsRemaining, restTotalSeconds, 100);
        }

        restTimerInterval = setInterval(() => {
            restSecondsRemaining--;
            const pct = Math.max(0, Math.round((restSecondsRemaining / restTotalSeconds) * 100));

            // Sound cue on final countdown ticks (3, 2, 1)
            if (restSecondsRemaining === 3 || restSecondsRemaining === 2 || restSecondsRemaining === 1) {
                playAudioCue(800, 0.08);
            }

            if (typeof onTick === 'function') {
                onTick(restSecondsRemaining, restTotalSeconds, pct);
            }

            if (restSecondsRemaining <= 0) {
                clearInterval(restTimerInterval);
                isTimerRunning = false;
                playAudioCue(1200, 0.4, 'triangle'); // Final GO fanfare
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }
        }, 1000);

        return { running: true, totalSeconds: restTotalSeconds };
    }

    /**
     * Pauses the active rest countdown.
     */
    function pauseRestTimer() {
        clearInterval(restTimerInterval);
        isTimerRunning = false;
        return { running: false, remaining: restSecondsRemaining };
    }

    /**
     * Adds or subtracts seconds from the active timer.
     * @param {number} deltaSeconds
     */
    function adjustRestTimer(deltaSeconds) {
        restSecondsRemaining = Math.max(0, restSecondsRemaining + deltaSeconds);
        restTotalSeconds = Math.max(restSecondsRemaining, restTotalSeconds + deltaSeconds);
        return { remaining: restSecondsRemaining, total: restTotalSeconds };
    }

    /**
     * Resets and cancels the active rest timer.
     */
    function resetRestTimer() {
        clearInterval(restTimerInterval);
        restSecondsRemaining = 0;
        isTimerRunning = false;
        return { running: false };
    }

    /**
     * Computes quick weight bump adjustment for an exercise.
     * @param {number} currentWeightKg 
     * @param {number} deltaKg 
     * @returns {number}
     */
    function calculateWeightBump(currentWeightKg, deltaKg) {
        const base = typeof currentWeightKg === 'number' ? currentWeightKg : (parseFloat(currentWeightKg) || 0);
        const bump = typeof deltaKg === 'number' ? deltaKg : (parseFloat(deltaKg) || 0);
        const result = Math.max(0, base + bump);
        return Math.round(result * 4) / 4; // Round to nearest 0.25kg
    }

    /**
     * Formats seconds into MM:SS display format.
     * @param {number} seconds 
     * @returns {string}
     */
    function formatTimeMMSS(seconds) {
        const s = Math.max(0, Math.floor(seconds || 0));
        const mins = Math.floor(s / 60);
        const remSecs = s % 60;
        return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
    }

    return {
        startRestTimer,
        pauseRestTimer,
        adjustRestTimer,
        resetRestTimer,
        calculateWeightBump,
        formatTimeMMSS,
        playAudioCue
    };
}));
