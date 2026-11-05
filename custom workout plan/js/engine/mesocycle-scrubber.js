/**
 * ==============================================================================
 * HANUMAN GYM — INTERACTIVE 12-WEEK MESOCYCLE SCRUBBER & PROGRESSION SIMULATOR
 * Dynamic periodization timeline adjusting volume, load and RIR in real time
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MesocycleScrubberEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * Microcycle phase definitions across the 12-week macrocycle.
     */
    const MESOCYCLE_WEEKS = {
        1: { phase: 'Accumulation / MEV Intro', type: 'ACCUMULATION', setMult: 1.0, loadMod: 0, targetRir: 3, targetRpe: 7, color: '#38bdf8', badge: 'MEV Baseline', desc: 'Establish movement baseline and technique consistency at Minimum Effective Volume.' },
        2: { phase: 'Progressive Overload I', type: 'ACCUMULATION', setMult: 1.1, loadMod: 2.5, targetRir: 2.5, targetRpe: 7.5, color: '#60a5fa', badge: 'Load Bump +2.5%', desc: 'Initial progressive overload increment with controlled eccentric tempo.' },
        3: { phase: 'Adaptive Hypertrophy', type: 'INTENSIFICATION', setMult: 1.2, loadMod: 5.0, targetRir: 2, targetRpe: 8, color: '#facc15', badge: 'MAV Optimal', desc: 'Maximum Adaptive Volume threshold with increased mechanical tension.' },
        4: { phase: 'Overload Peak I', type: 'OVERREACH', setMult: 1.25, loadMod: 7.5, targetRir: 1.5, targetRpe: 8.5, color: '#fb923c', badge: 'High Overload', desc: 'Approaching maximum recoverable volume prior to planned deload.' },
        5: { phase: 'Pre-Deload Intensification', type: 'OVERREACH', setMult: 1.3, loadMod: 10.0, targetRir: 1, targetRpe: 9, color: '#f87171', badge: 'Near Failure (RIR 1)', desc: 'High systemic stimulus to trigger maximum supercompensation.' },
        6: { phase: 'Active Recovery Deload', type: 'DELOAD', setMult: 0.6, loadMod: -10.0, targetRir: 4, targetRpe: 6, color: '#34d399', badge: 'Deload Recovery', desc: '40% volume reduction to dissipate accumulated neural and systemic fatigue.' },
        7: { phase: 'Resensitized Accumulation', type: 'ACCUMULATION', setMult: 1.1, loadMod: 5.0, targetRir: 3, targetRpe: 7, color: '#38bdf8', badge: 'Post-Deload Fresh', desc: 'Re-entry into training with restored muscle protein synthesis sensitivity.' },
        8: { phase: 'Hypertrophic Density', type: 'INTENSIFICATION', setMult: 1.2, loadMod: 7.5, targetRir: 2, targetRpe: 8, color: '#facc15', badge: 'Density Peak', desc: 'Reduced rest intervals and heightened metabolic accumulation.' },
        9: { phase: 'Mechanical Tension Surge', type: 'INTENSIFICATION', setMult: 1.25, loadMod: 10.0, targetRir: 1.5, targetRpe: 8.5, color: '#fb923c', badge: 'Load Bump +10%', desc: 'Heavy working sets pushing strength-hypertrophy crossover.' },
        10: { phase: 'Overreaching Peak II', type: 'OVERREACH', setMult: 1.35, loadMod: 12.5, targetRir: 1, targetRpe: 9, color: '#f87171', badge: 'MRV Overreach', desc: 'Terminal volume threshold pushing maximum biological adaptation.' },
        11: { phase: 'PR Showcase & Realization', type: 'REALIZATION', setMult: 1.0, loadMod: 15.0, targetRir: 0.5, targetRpe: 9.5, color: '#c084fc', badge: 'PR Testing', desc: 'Low volume, high intensity realization to test and log new 1RM benchmarks.' },
        12: { phase: 'Transition & Consolidation', type: 'DELOAD', setMult: 0.55, loadMod: -15.0, targetRir: 4, targetRpe: 6, color: '#34d399', badge: 'Macro Deload', desc: 'Full macrocycle regeneration and baseline preparation for next cycle.' }
    };

    /**
     * Retrieves the parameters for a specific week in the mesocycle.
     * @param {number} week - Week number (1-12)
     * @returns {Object}
     */
    function getWeekParameters(week) {
        const w = Math.max(1, Math.min(12, parseInt(week, 10) || 1));
        return {
            week: w,
            ...MESOCYCLE_WEEKS[w]
        };
    }

    /**
     * Calculates the dynamically morphed session exercises for a specific week.
     * @param {Array} originalSessions - Base sessions generated for Week 1
     * @param {number} week - Target week (1-12)
     * @returns {Array} Array of modified sessions with calculated sets, RIR, RPE and load modifiers
     */
    function calculateMorphedSessionsForWeek(originalSessions, week) {
        if (!Array.isArray(originalSessions)) return [];
        const params = getWeekParameters(week);

        return originalSessions.map(session => {
            if (!session || typeof session !== 'object') return session;

            const morphedExercises = (session.exercises || []).map(ex => {
                if (!ex || typeof ex !== 'object') return ex;

                const baseSets = typeof ex.sets === 'number' ? ex.sets : (parseInt(ex.sets, 10) || 3);
                let morphedSets = Math.round(baseSets * params.setMult);
                if (params.type === 'DELOAD') {
                    morphedSets = Math.max(2, Math.floor(baseSets * 0.6));
                } else {
                    morphedSets = Math.max(1, morphedSets);
                }

                // If working weight exists, calculate projected load
                let projectedWeight = null;
                if (typeof ex.targetWeightKg === 'number' && ex.targetWeightKg > 0) {
                    projectedWeight = Math.round((ex.targetWeightKg * (1 + (params.loadMod / 100))) * 2) / 2;
                }

                return {
                    ...ex,
                    sets: morphedSets,
                    rir: params.targetRir,
                    rpe: params.targetRpe,
                    targetRange: `RIR ${params.targetRir}`,
                    weekModifier: {
                        week: params.week,
                        phase: params.phase,
                        loadModPercent: params.loadMod,
                        projectedWeightKg: projectedWeight
                    }
                };
            });

            return {
                ...session,
                weekParameters: params,
                exercises: morphedExercises,
                totalWeeklySets: morphedExercises.reduce((acc, e) => acc + (e.sets || 0), 0)
            };
        });
    }

    /**
     * Computes the full 12-week trajectory summary for weekly volume load forecasting.
     * @param {Array} originalSessions - Base sessions
     * @returns {Array} 12-item array of weekly volume analytics
     */
    function compute12WeekTrajectory(originalSessions) {
        const trajectory = [];
        for (let w = 1; w <= 12; w++) {
            const morphed = calculateMorphedSessionsForWeek(originalSessions, w);
            const totalSets = morphed.reduce((acc, s) => acc + (s.totalWeeklySets || 0), 0);
            const params = getWeekParameters(w);
            trajectory.push({
                week: w,
                phase: params.phase,
                type: params.type,
                badge: params.badge,
                color: params.color,
                totalSets: totalSets,
                loadModPercent: params.loadMod,
                targetRir: params.targetRir,
                targetRpe: params.targetRpe
            });
        }
        return trajectory;
    }

    return {
        MESOCYCLE_WEEKS,
        getWeekParameters,
        calculateMorphedSessionsForWeek,
        compute12WeekTrajectory
    };
}));
