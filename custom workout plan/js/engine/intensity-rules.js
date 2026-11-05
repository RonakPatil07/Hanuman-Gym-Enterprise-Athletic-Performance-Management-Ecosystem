/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * TRAINING INTENSITY & RIR / RPE INTELLIGENCE ENGINE (v1.0)
 * ==============================================================================
 * 
 * Deterministic rules engine for prescribing exercise effort (Reps In Reserve &
 * Rate of Perceived Exertion).
 * 
 * Core Design Principles:
 * 1. RIR AS PRIMARY INTERNAL METRIC: Reps In Reserve (0–5) models proximity to failure.
 * 2. DETERMINISTIC RPE DERIVATION: RPE = 10 - targetRIR.
 * 3. MULTI-FACTOR INTENSITY SYNTHESIS:
 *    - Primary Goal (Hypertrophy, Strength, Fat Loss, General Fitness)
 *    - Experience Level (Beginner buffer vs Advanced precision)
 *    - Exercise Complexity & Fatigue (Compounds retain reserve, Isolations permit higher effort)
 *    - Recovery & Fatigue Constraints (Sleep deficit, high activity, training frequency)
 * 4. PURE & EXPLAINABLE: Produces structured rationale without AI or randomization.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.IntensityRulesEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    // ==========================================================================
    // 1. CONSTANTS & CATEGORY THRESHOLDS
    // ==========================================================================

    const INTENSITY_CATEGORIES = {
        NEAR_FAILURE: 'near_failure', // RIR 0-1 (RPE 9-10)
        HARD: 'hard',                 // RIR 1-2 (RPE 8-9)
        CHALLENGING: 'challenging',   // RIR 2-3 (RPE 7-8)
        MODERATE: 'moderate',         // RIR 3-4 (RPE 6-7)
        EASY: 'easy'                  // RIR >= 4 (RPE <= 6)
    };

    const GOAL_BASELINES = {
        'muscle-gain': { targetRIR: 2, minRIR: 1, maxRIR: 3, label: 'Hypertrophy target' },
        'hypertrophy': { targetRIR: 2, minRIR: 1, maxRIR: 3, label: 'Hypertrophy target' },
        'strength': { targetRIR: 2, minRIR: 1, maxRIR: 3, label: 'Strength & neuromuscular drive' },
        'weight-loss': { targetRIR: 3, minRIR: 2, maxRIR: 4, label: 'Muscle preservation with fatigue control' },
        'fat-loss': { targetRIR: 3, minRIR: 2, maxRIR: 4, label: 'Muscle preservation with fatigue control' },
        'get-shredded': { targetRIR: 2, minRIR: 2, maxRIR: 3, label: 'Conditioning & density focus' },
        'general-fitness': { targetRIR: 3, minRIR: 2, maxRIR: 4, label: 'Sustainable fitness & movement quality' },
        'endurance': { targetRIR: 3, minRIR: 2, maxRIR: 4, label: 'Submaximal volume accumulation' }
    };

    // ==========================================================================
    // 2. HELPER FUNCTIONS
    // ==========================================================================

    /**
     * Converts a target RIR integer to its deterministic RPE equivalent.
     * Formula: RPE = 10 - targetRIR
     * @param {number} rir 
     * @returns {number} RPE (1–10)
     */
    function calculateRPEFromRIR(rir) {
        if (typeof rir !== 'number' || isNaN(rir)) return 8;
        const clampedRIR = Math.max(0, Math.min(10, Math.round(rir)));
        return 10 - clampedRIR;
    }

    /**
     * Determines intensity category from target RIR.
     * @param {number} rir 
     * @returns {string}
     */
    function getIntensityCategory(rir) {
        if (rir <= 1) return INTENSITY_CATEGORIES.NEAR_FAILURE;
        if (rir <= 2) return INTENSITY_CATEGORIES.HARD;
        if (rir <= 3) return INTENSITY_CATEGORIES.CHALLENGING;
        if (rir <= 4) return INTENSITY_CATEGORIES.MODERATE;
        return INTENSITY_CATEGORIES.EASY;
    }

    // ==========================================================================
    // 3. CORE INTENSITY SYNTHESIS ENGINE
    // ==========================================================================

    /**
     * Determines deterministic RIR/RPE intensity prescription for an exercise.
     * 
     * @param {Object} exercise Canonical exercise entity
     * @param {Object} [profile] Canonical user training profile
     * @param {Object} [requirements] Training requirements object
     * @returns {Object} Deterministic intensity prescription
     */
    function calculateExerciseIntensity(exercise, profile, requirements) {
        // Fallback defaults for missing/partial inputs
        const ex = exercise || {};
        const prof = profile || {};
        const reqs = requirements || {};

        const primaryGoal = (prof.goals && prof.goals.primary) ||
                            (prof.fitnessGoal && prof.fitnessGoal.primaryGoal) || 
                            (prof.primaryGoal) || 
                            (prof.goal) || 
                            'muscle-gain';

        const expLevel = (prof.trainingExperience && prof.trainingExperience.experienceLevel) ||
                         (prof.fitnessLevel && prof.fitnessLevel.experience) || 
                         (prof.experience) || 
                         (prof.experienceLevel) || 
                         'intermediate';

        const baseline = GOAL_BASELINES[primaryGoal] || GOAL_BASELINES['muscle-gain'];
        let targetRIR = baseline.targetRIR;
        let minRIR = baseline.minRIR;
        let maxRIR = baseline.maxRIR;

        const adjustmentFactors = [];
        const rationales = [];

        rationales.push(baseline.label);

        // ----------------------------------------------------------------------
        // Factor 1: Experience Level Adjustment
        // ----------------------------------------------------------------------
        if (expLevel === 'beginner') {
            targetRIR += 1;
            minRIR += 1;
            maxRIR += 1;
            adjustmentFactors.push('beginner_safety_margin');
            rationales.push('Beginner profile: +1 RIR safety buffer applied to reinforce movement mechanics');
        } else if (expLevel === 'advanced') {
            // Advanced trainees can safely express lower RIR on appropriate movements
            if (ex.technicalComplexity && ex.technicalComplexity <= 2 && ex.fatigueCost && ex.fatigueCost <= 2) {
                targetRIR = Math.max(1, targetRIR - 1);
                minRIR = Math.max(0, minRIR - 1);
                adjustmentFactors.push('advanced_overload_precision');
                rationales.push('Advanced trainee on low-complexity lift: calibrated proximity to failure permitted');
            }
        }

        // ----------------------------------------------------------------------
        // Factor 2: Exercise Type & Technical Complexity
        // ----------------------------------------------------------------------
        const isCompound = ex.category === 'compound' || 
                           (ex.tags && ex.tags.includes('compound')) ||
                           (ex.movementPattern && !['isolation', 'core', 'accessory'].includes(ex.movementPattern));
        const isIsolation = ex.category === 'isolation' || 
                            (ex.tags && ex.tags.includes('isolation')) ||
                            ex.movementPattern === 'isolation' || 
                            ex.movementPattern === 'core';
        const complexity = typeof ex.technicalComplexity === 'number' ? ex.technicalComplexity : 3;
        const fatigueCost = typeof ex.fatigueCost === 'number' ? ex.fatigueCost : 3;

        if (complexity >= 4 || fatigueCost >= 4) {
            // Heavy/technical lifts (Squat, Deadlift, Overhead Press) retain reserve for spine/joint safety
            targetRIR = Math.max(targetRIR, 2);
            minRIR = Math.max(minRIR, 1);
            adjustmentFactors.push('high_complexity_axial_reserve');
            rationales.push('High technical/axial demand: reserve retained to prevent technical breakdown');
        } else if (isIsolation || (complexity <= 2 && fatigueCost <= 2)) {
            // Low-axial isolation (Bicep curls, Lateral raises, Calf raises, Tricep pushdowns)
            if (expLevel !== 'beginner') {
                targetRIR = Math.max(1, targetRIR - 1);
                minRIR = Math.max(0, minRIR - 1);
                adjustmentFactors.push('isolation_proximity_tolerance');
                rationales.push('Low-risk isolation movement: closer proximity to failure tolerated');
            }
        }

        // ----------------------------------------------------------------------
        // Factor 3: Recovery Constraints & Systemic Fatigue
        // ----------------------------------------------------------------------
        const sleep = (prof.lifestyle && prof.lifestyle.sleepDuration) ||
                      (prof.recoveryConstraints && prof.recoveryConstraints.sleepHours) ||
                      (prof.sleepDuration) ||
                      '7-8';
        const isPoorSleep = sleep === 'less-than-5' || sleep === '5-6' || (typeof sleep === 'number' && sleep < 7.0);

        const dailyActivity = (prof.lifestyle && prof.lifestyle.typicalDay) ||
                              (prof.recoveryConstraints && prof.recoveryConstraints.dailyActivity) ||
                              (prof.typicalDay) ||
                              'moderately-active';
        const isVeryActive = dailyActivity === 'very-active';

        const trainingDaysCount = (prof.trainingAvailability && typeof prof.trainingAvailability.trainingDayCount === 'number')
            ? prof.trainingAvailability.trainingDayCount
            : ((prof.trainingAvailability && Array.isArray(prof.trainingAvailability.trainingDays))
                ? prof.trainingAvailability.trainingDays.length
                : ((prof.scheduleConstraints && Array.isArray(prof.scheduleConstraints.trainingDays))
                    ? prof.scheduleConstraints.trainingDays.length
                    : (Array.isArray(prof.trainingDays) ? prof.trainingDays.length : 4)));

        if (isPoorSleep || isVeryActive) {
            targetRIR = Math.min(4, targetRIR + 1);
            maxRIR = Math.min(5, maxRIR + 1);
            adjustmentFactors.push('recovery_fatigue_mitigation');
            rationales.push('Elevated systemic fatigue / recovery constraint: intensity tempered to prevent overreaching');
        } else if (trainingDaysCount >= 5 && isCompound && fatigueCost >= 3) {
            targetRIR = Math.min(4, targetRIR + 1);
            adjustmentFactors.push('high_frequency_fatigue_management');
            rationales.push('High weekly frequency (5+ days): compound reserve expanded for cross-session recovery');
        }

        // ----------------------------------------------------------------------
        // Final Bounds Validation & Clamping
        // Rule: 0 <= minRIR <= targetRIR <= maxRIR <= 5
        // ----------------------------------------------------------------------
        targetRIR = Math.max(0, Math.min(5, Math.round(targetRIR)));
        minRIR = Math.max(0, Math.min(targetRIR, Math.round(minRIR)));
        maxRIR = Math.max(targetRIR, Math.min(6, Math.round(maxRIR)));

        const rpe = calculateRPEFromRIR(targetRIR);
        const category = getIntensityCategory(targetRIR);
        const targetRange = minRIR === maxRIR ? `RIR ${targetRIR}` : `RIR ${minRIR}–${maxRIR}`;
        const primaryRationale = rationales.join('. ');

        return {
            version: ENGINE_VERSION,
            targetRIR,
            minRIR,
            maxRIR,
            rpe,
            targetRange,
            intensityCategory: category,
            rationale: primaryRationale,
            adjustmentFactors
        };
    }

    // ==========================================================================
    // 4. 1RM & WARM-UP INTELLIGENCE UTILITIES
    // ==========================================================================

    /**
     * Calculates Estimated 1-Rep Max (E1RM) using validated biomechanical formulas.
     * @param {number} weight Lifted load
     * @param {number} reps Repetitions performed (1-36)
     * @param {string} [formula] 'epley' | 'brzycki' | 'blended' (default: 'epley')
     * @returns {number} Estimated 1RM rounded to 1 decimal place
     */
    function calculateE1RM(weight, reps, formula = 'epley') {
        const numWeight = parseFloat(weight);
        const numReps = parseInt(reps, 10);

        if (!numWeight || numWeight <= 0 || !numReps || numReps <= 0) {
            return 0;
        }

        if (numReps === 1) {
            return Math.round(numWeight * 10) / 10;
        }

        const clampedReps = Math.min(36, numReps);
        let e1rm = 0;

        if (formula === 'brzycki') {
            e1rm = numWeight * (36 / (37 - clampedReps));
        } else if (formula === 'blended') {
            const epley = numWeight * (1 + (clampedReps / 30));
            const brzycki = numWeight * (36 / (37 - clampedReps));
            e1rm = (epley + brzycki) / 2;
        } else {
            // Default Epley
            e1rm = numWeight * (1 + (clampedReps / 30));
        }

        return Math.round(e1rm * 10) / 10;
    }

    /**
     * Generates a 1RM Percentage Training Load Matrix.
     * @param {number} e1rm Estimated 1-Rep Max
     * @param {string} [unit] 'kg' | 'lb'
     * @returns {Array<{ percent: number, load: number, targetReps: number, unit: string }>}
     */
    function calculateRepMaxTable(e1rm, unit = 'kg') {
        const maxVal = parseFloat(e1rm) || 0;
        if (maxVal <= 0) return [];

        const tiers = [
            { percent: 100, targetReps: 1 },
            { percent: 95, targetReps: 2 },
            { percent: 90, targetReps: 4 },
            { percent: 85, targetReps: 6 },
            { percent: 80, targetReps: 8 },
            { percent: 75, targetReps: 10 },
            { percent: 70, targetReps: 12 },
            { percent: 65, targetReps: 15 },
            { percent: 60, targetReps: 20 }
        ];

        const step = unit === 'lb' ? 5 : 2.5;

        return tiers.map(t => {
            const rawLoad = maxVal * (t.percent / 100);
            const load = Math.round(rawLoad / step) * step;
            return {
                percent: t.percent,
                load: Math.round(load * 10) / 10,
                targetReps: t.targetReps,
                unit
            };
        });
    }

    /**
     * Calculates a science-based 4-stage warm-up ramp pyramid for a working set.
     * @param {number} workingWeight Planned working load
     * @param {string} [unit] 'kg' | 'lb' (default: 'kg')
     * @param {boolean} [isBarbell] True if barbell lift (default: true)
     * @param {number} [customBarWeight] Custom bar weight
     * @returns {Array<{ tier: number, name: string, weight: number, unit: string, reps: number, percentage: number, restSeconds: number, purpose: string }>}
     */
    function calculateWarmupPyramid(workingWeight, unit = 'kg', isBarbell = true, customBarWeight = null) {
        const target = parseFloat(workingWeight) || 0;
        const isLb = unit === 'lb';
        const defaultBar = isLb ? 45 : 20;
        const bar = customBarWeight !== null && customBarWeight !== undefined ? parseFloat(customBarWeight) : defaultBar;
        const step = isLb ? 5 : 2.5;

        if (target <= 0) return [];

        const roundToStep = (val) => Math.max(isBarbell ? bar : step, Math.round(val / step) * step);

        // If target is lighter than or equal to empty bar
        if (isBarbell && target <= bar) {
            return [
                {
                    tier: 1,
                    name: 'Barbell Mobility',
                    weight: bar,
                    unit,
                    reps: 10,
                    percentage: 100,
                    restSeconds: 45,
                    purpose: 'Joint lubrication & movement pattern groove'
                }
            ];
        }

        const stages = [];

        // Tier 1: Empty Bar / Light Baseline
        const t1Weight = isBarbell ? bar : roundToStep(target * 0.35);
        stages.push({
            tier: 1,
            name: 'Movement Pattern Groove',
            weight: t1Weight,
            unit,
            reps: 10,
            percentage: Math.round((t1Weight / target) * 100),
            restSeconds: 45,
            purpose: 'Joint mobility & technique groove'
        });

        // Tier 2: Activation (50% of working load)
        const t2Weight = roundToStep(target * 0.50);
        if (t2Weight > t1Weight && t2Weight < target) {
            stages.push({
                tier: 2,
                name: 'Muscle Activation',
                weight: t2Weight,
                unit,
                reps: 5,
                percentage: Math.round((t2Weight / target) * 100),
                restSeconds: 60,
                purpose: 'Motor unit recruitment with minimal metabolic fatigue'
            });
        }

        // Tier 3: Potentiation (70% of working load)
        const t3Weight = roundToStep(target * 0.70);
        if (t3Weight > t2Weight && t3Weight < target) {
            stages.push({
                tier: 3,
                name: 'Neural Priming',
                weight: t3Weight,
                unit,
                reps: 3,
                percentage: Math.round((t3Weight / target) * 100),
                restSeconds: 90,
                purpose: 'Central nervous system excitation & speed'
            });
        }

        // Tier 4: Heavy Single Primer (85-90% of working load, only if significant load delta)
        const minDelta = isLb ? 30 : 15;
        if (target - (isBarbell ? bar : 0) >= minDelta) {
            const t4Weight = roundToStep(target * 0.88);
            if (t4Weight > t3Weight && t4Weight < target) {
                stages.push({
                    tier: 4,
                    name: 'Heavy Single Acclimation',
                    weight: t4Weight,
                    unit,
                    reps: 1,
                    percentage: Math.round((t4Weight / target) * 100),
                    restSeconds: 120,
                    purpose: 'Sensory weight acclimation with zero fatigue accumulation'
                });
            }
        }

        return stages;
    }

    // ==========================================================================
    // 5. DETERMINISTIC SNAPSHOT & AUDIT
    // ==========================================================================

    /**
     * Generates a deterministic intensity snapshot for regression verification.
     * @param {Object} exercise 
     * @param {Object} profile 
     * @param {Object} requirements 
     * @returns {string} JSON snapshot
     */
    function getDeterministicIntensitySnapshot(exercise, profile, requirements) {
        const result = calculateExerciseIntensity(exercise, profile, requirements);
        return JSON.stringify(result);
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        INTENSITY_CATEGORIES,
        GOAL_BASELINES,
        calculateRPEFromRIR,
        getIntensityCategory,
        calculateExerciseIntensity,
        calculateE1RM,
        calculateRepMaxTable,
        calculateWarmupPyramid,
        getDeterministicIntensitySnapshot
    };
}));
