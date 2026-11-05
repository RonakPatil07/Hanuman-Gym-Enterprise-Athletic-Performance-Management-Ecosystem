/**
 * ==============================================================================
 * HANUMAN GYM — ANTAGONIST SUPERSET & CIRCUIT GROUPING ENGINE
 * Pairs biomechanically non-competing lifts to compress workout duration by 35-45%
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SupersetEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Antagonist & Non-Competing Biomechanical Synergy Matrix
    const COMPATIBLE_PAIRINGS = {
        'chest': ['back', 'lats', 'rear_delts', 'biceps', 'abs'],
        'back': ['chest', 'front_delts', 'triceps', 'abs'],
        'lats': ['chest', 'front_delts', 'triceps'],
        'quads': ['hamstrings', 'calves', 'abs', 'biceps', 'triceps'],
        'hamstrings': ['quads', 'calves', 'abs'],
        'biceps': ['triceps', 'forearms', 'calves', 'abs', 'chest'],
        'triceps': ['biceps', 'forearms', 'calves', 'abs', 'back'],
        'shoulders': ['abs', 'calves', 'biceps', 'triceps', 'back'],
        'lateral_delts': ['abs', 'calves', 'biceps', 'triceps'],
        'rear_delts': ['front_delts', 'chest', 'biceps'],
        'calves': ['quads', 'hamstrings', 'biceps', 'triceps', 'abs'],
        'abs': ['chest', 'back', 'quads', 'hamstrings', 'calves', 'shoulders']
    };

    /**
     * Determines whether two exercise target muscle groups are compatible for supersets.
     * @param {string} muscleA 
     * @param {string} muscleB 
     * @returns {boolean}
     */
    function areMusclesCompatible(muscleA, muscleB) {
        if (!muscleA || !muscleB) return false;
        const a = String(muscleA).toLowerCase().replace(/[\s-]/g, '_');
        const b = String(muscleB).toLowerCase().replace(/[\s-]/g, '_');
        if (a === b) return false; // Don't superset identical muscle groups (causes localized exhaustion)

        const compatibleList = COMPATIBLE_PAIRINGS[a] || [];
        return compatibleList.includes(b) || (COMPATIBLE_PAIRINGS[b] || []).includes(a);
    }

    /**
     * Groups session exercises into paired supersets and remaining linear lifts.
     * @param {Object[]} exercises - List of exercise objects
     * @returns {{ supersets: Object[], linearExercises: Object[], totalTimeSavedMinutes: number }}
     */
    function groupSessionIntoSupersets(exercises = []) {
        if (!Array.isArray(exercises) || exercises.length < 2) {
            return {
                groupedList: exercises.map(ex => ({ type: 'LINEAR', exercise: ex })),
                supersetsCount: 0,
                totalTimeSavedMinutes: 0
            };
        }

        const pairedIndices = new Set();
        const groupedList = [];
        let supersetCounter = 1;
        let totalTimeSavedMinutes = 0;

        const labels = ['A', 'B', 'C', 'D', 'E'];

        for (let i = 0; i < exercises.length; i++) {
            if (pairedIndices.has(i)) continue;

            const exA = exercises[i];
            const muscleA = exA.targetMuscle || exA.muscleGroup || exA.primaryMuscle || 'chest';
            let pairedMatch = null;
            let matchIdx = -1;

            // Search ahead for an unpaired compatible exercise
            for (let j = i + 1; j < exercises.length; j++) {
                if (pairedIndices.has(j)) continue;
                const exB = exercises[j];
                const muscleB = exB.targetMuscle || exB.muscleGroup || exB.primaryMuscle || 'back';

                if (areMusclesCompatible(muscleA, muscleB)) {
                    pairedMatch = exB;
                    matchIdx = j;
                    break;
                }
            }

            if (pairedMatch && matchIdx !== -1) {
                pairedIndices.add(i);
                pairedIndices.add(matchIdx);

                const tag = `SS-${labels[(supersetCounter - 1) % labels.length]}`;
                const setsCount = Math.max(exA.sets || 3, pairedMatch.sets || 3);
                // In supersets, you alternate exercises with 45s rest instead of 90s each, saving ~1.5 mins per set
                const timeSaved = Math.round(setsCount * 1.25);
                totalTimeSavedMinutes += timeSaved;

                groupedList.push({
                    type: 'SUPERSET',
                    tag: tag,
                    label: `Antagonist Superset ${tag}`,
                    exerciseA: exA,
                    exerciseB: pairedMatch,
                    combinedRestSeconds: 60,
                    timeSavedMinutes: timeSaved,
                    instructions: `Perform 1 set of ${exA.exerciseName || exA.name}, rest 15s, then immediately perform 1 set of ${pairedMatch.exerciseName || pairedMatch.name}. Rest 60s before repeating.`
                });

                supersetCounter++;
            } else {
                pairedIndices.add(i);
                groupedList.push({
                    type: 'LINEAR',
                    exercise: exA
                });
            }
        }

        return {
            groupedList,
            supersetsCount: supersetCounter - 1,
            totalTimeSavedMinutes
        };
    }

    return {
        COMPATIBLE_PAIRINGS,
        areMusclesCompatible,
        groupSessionIntoSupersets
    };
}));
