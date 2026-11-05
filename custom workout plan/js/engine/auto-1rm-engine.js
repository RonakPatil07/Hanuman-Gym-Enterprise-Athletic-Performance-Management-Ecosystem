/**
 * ==============================================================================
 * HANUMAN GYM — 1RM BASELINE & WORKING LOAD AUTO-FILLER ENGINE
 * Calculates and injects individualized barbell/dumbbell working loads
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Auto1RMEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const STORAGE_KEY = 'fitphysique_1rm_baselines';

    const DEFAULT_1RM_BASELINES = {
        'barbell-bench-press': 80,
        'dumbbell-bench-press': 60,
        'incline-barbell-bench-press': 70,
        'barbell-back-squat': 100,
        'front-squat': 80,
        'leg-press': 160,
        'conventional-deadlift': 120,
        'romanian-deadlift': 100,
        'overhead-press': 50,
        'seated-dumbbell-press': 40,
        'barbell-row': 70,
        'lat-pulldown': 65,
        'barbell-curl': 35,
        'skull-crushers': 35
    };

    /**
     * Retrieves stored 1RM baselines or defaults.
     * @returns {Object}
     */
    function getStored1RMBaselines() {
        if (typeof localStorage === 'undefined') return Object.assign({}, DEFAULT_1RM_BASELINES);
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return Object.assign({}, DEFAULT_1RM_BASELINES);
            const parsed = JSON.parse(raw);
            return Object.assign({}, DEFAULT_1RM_BASELINES, parsed);
        } catch (e) {
            return Object.assign({}, DEFAULT_1RM_BASELINES);
        }
    }

    /**
     * Saves updated 1RM baselines to persistent storage.
     * @param {Object} baselinesMap 
     */
    function save1RMBaselines(baselinesMap) {
        if (typeof localStorage === 'undefined' || !baselinesMap) return false;
        try {
            const current = getStored1RMBaselines();
            const updated = Object.assign({}, current, baselinesMap);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Calculates the estimated working intensity percentage of 1RM.
     * @param {number} reps - Target repetitions (e.g. 8)
     * @param {number} rir - Repetitions in Reserve (e.g. 2)
     * @returns {number} Percentage between 0.40 and 1.00
     */
    function calculateIntensityPercentage(reps = 8, rir = 2) {
        const parsedReps = typeof reps === 'number' ? reps : (parseFloat(reps) || 8);
        const parsedRir = typeof rir === 'number' ? rir : (parseFloat(rir) || 0);
        const totalRepsToFailure = Math.max(1, parsedReps + parsedRir);

        if (totalRepsToFailure <= 1) return 1.0;
        // Standard Epley percentage formula
        const pct = 1 / (1 + (0.0333 * (totalRepsToFailure - 1)));
        return Math.min(1.0, Math.max(0.40, Math.round(pct * 1000) / 1000));
    }

    /**
     * Calculates the rounded working load in kilograms for an exercise.
     * @param {string} exerciseId 
     * @param {number|string} reps 
     * @param {number} rir 
     * @param {number} [loadModifierPercent=0] e.g. +5% or -10%
     * @param {Object} [custom1RMs] 
     * @returns {number} Rounded weight in kg (nearest 2.5kg)
     */
    function calculateWorkingLoad(exerciseId, reps = 8, rir = 2, loadModifierPercent = 0, custom1RMs = null) {
        const baselines = custom1RMs || getStored1RMBaselines();
        const base1RM = baselines[exerciseId] || DEFAULT_1RM_BASELINES[exerciseId] || 60;

        let parsedReps = 8;
        if (typeof reps === 'string') {
            const match = reps.match(/(\d+)/);
            if (match) parsedReps = parseInt(match[1], 10);
        } else if (typeof reps === 'number') {
            parsedReps = reps;
        }

        const intensityPct = calculateIntensityPercentage(parsedReps, rir);
        const modMultiplier = 1 + ((parseFloat(loadModifierPercent) || 0) / 100);
        const rawWorkingWeight = base1RM * intensityPct * modMultiplier;

        // Round to nearest 2.5kg plate increment
        const rounded = Math.round(rawWorkingWeight / 2.5) * 2.5;
        return Math.max(10, rounded);
    }

    /**
     * Injects auto-calculated working loads into all exercises in a program.
     * @param {Object} program 
     * @param {Object} [custom1RMs] 
     * @param {number} [weekNumber=1] 
     * @returns {Object} Program with populated targetWeightKg fields
     */
    function apply1RMBaselinesToProgram(program, custom1RMs = null, weekNumber = 1) {
        if (!program || !Array.isArray(program.sessions)) return program;
        const baselines = custom1RMs || getStored1RMBaselines();

        // Get week load modifier from MesocycleScrubber if available
        let loadMod = 0;
        if (typeof window !== 'undefined' && window.MesocycleScrubberEngine) {
            const params = window.MesocycleScrubberEngine.getWeekParameters(weekNumber);
            loadMod = params.loadMod || 0;
        }

        const cloned = JSON.parse(JSON.stringify(program));
        cloned.sessions.forEach(session => {
            (session.exercises || []).forEach(ex => {
                const exId = ex.exerciseId || ex.id || 'barbell-bench-press';
                const rir = typeof ex.rir === 'number' ? ex.rir : 2;
                ex.targetWeightKg = calculateWorkingLoad(exId, ex.reps, rir, loadMod, baselines);
            });
        });

        return cloned;
    }

    return {
        DEFAULT_1RM_BASELINES,
        getStored1RMBaselines,
        save1RMBaselines,
        calculateIntensityPercentage,
        calculateWorkingLoad,
        apply1RMBaselinesToProgram
    };
}));
