/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PROGRESSIVE OVERLOAD & PROGRESSION INTELLIGENCE ENGINE (v1.0)
 * ==============================================================================
 * 
 * Deterministic engine for selecting and configuring exercise-specific progressive
 * overload strategies across training exposures.
 * 
 * Core Design Principles:
 * 1. MULTI-MODEL PROGRESSION INTELLIGENCE: Double progression, load progression,
 *    rep progression, RIR progression, hold progression, and conservative progression.
 * 2. SAFETY & COMPLEXITY FIRST: High technical complexity and fatigue demand
 *    conservative overload criteria.
 * 3. NO MAGIC KILOGRAM ASSUMPTIONS: Uses standardized load increment categories
 *    (MICRO, SMALL, MODERATE, NONE).
 * 4. STRICT SEPARATION OF RULES VS HISTORY: Phase 9 defines progression strategies
 *    without requiring historical workout logs or database mutations.
 * 5. PURE & DETERMINISTIC: Pure functions with snapshot audit support.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ProgressionRulesEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    // ==========================================================================
    // 1. CONSTANTS & ENUMS
    // ==========================================================================

    const PROGRESSION_MODELS = {
        DOUBLE_PROGRESSION: 'DOUBLE_PROGRESSION',
        LOAD_PROGRESSION: 'LOAD_PROGRESSION',
        REP_PROGRESSION: 'REP_PROGRESSION',
        RIR_PROGRESSION: 'RIR_PROGRESSION',
        HOLD_PROGRESSION: 'HOLD_PROGRESSION',
        CONSERVATIVE_PROGRESSION: 'CONSERVATIVE_PROGRESSION'
    };

    const LOAD_INCREMENT_CATEGORIES = {
        NONE: 'NONE',
        MICRO: 'MICRO',       // e.g. 0.5kg - 1.25kg per side (fractional plates / dumbbells)
        SMALL: 'SMALL',       // e.g. 1.25kg - 2.5kg per side
        MODERATE: 'MODERATE'  // e.g. 2.5kg - 5kg per side
    };

    // ==========================================================================
    // 2. HELPER UTILITIES
    // ==========================================================================

    /**
     * Parses numeric rep range from string or object.
     * @param {string|Object} repRange 
     * @returns {{min: number, max: number}}
     */
    function parseRepRange(repRange) {
        if (!repRange) return { min: 8, max: 12 };
        if (typeof repRange === 'object' && typeof repRange.min === 'number' && typeof repRange.max === 'number') {
            return { min: repRange.min, max: repRange.max };
        }
        if (typeof repRange === 'string') {
            const matches = repRange.match(/\d+/g);
            if (matches && matches.length >= 2) {
                return { min: parseInt(matches[0], 10), max: parseInt(matches[1], 10) };
            }
            if (matches && matches.length === 1) {
                const val = parseInt(matches[0], 10);
                return { min: val, max: val };
            }
        }
        return { min: 8, max: 12 };
    }

    // ==========================================================================
    // 3. CORE PROGRESSION STRATEGY SELECTION
    // ==========================================================================

    /**
     * Synthesizes exercise, profile, requirements, and intensity into a deterministic progression strategy.
     * 
     * @param {Object} exercise Canonical exercise entity
     * @param {Object} [profile] Canonical user training profile
     * @param {Object} [requirements] Training requirements object
     * @param {Object} [intensity] Phase 8 intensity prescription
     * @returns {Object} Deterministic progression strategy
     */
    function calculateProgressionStrategy(exercise, profile, requirements, intensity) {
        const ex = exercise || {};
        const prof = profile || {};
        const reqs = requirements || {};
        const inten = intensity || {};

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

        const repRange = parseRepRange(ex.repRange || (ex.reps));
        const requiredRIR = typeof inten.targetRIR === 'number' ? inten.targetRIR : 2;
        const complexity = typeof ex.technicalComplexity === 'number' ? ex.technicalComplexity : 3;
        const fatigueCost = typeof ex.fatigueCost === 'number' ? ex.fatigueCost : 3;
        const equipment = Array.isArray(ex.equipment) ? ex.equipment : [];
        const isCompound = ex.category === 'compound' || 
                           (ex.tags && ex.tags.includes('compound')) ||
                           (ex.movementPattern && !['isolation', 'core', 'accessory'].includes(ex.movementPattern));
        const isBodyweight = equipment.includes('bodyweight') && !equipment.includes('barbell') && !equipment.includes('cable');
        const isIsometric = ex.movementPattern === 'isometric' || (ex.tags && ex.tags.includes('isometric'));

        let model = PROGRESSION_MODELS.DOUBLE_PROGRESSION;
        let loadIncrement = LOAD_INCREMENT_CATEGORIES.SMALL;
        let repIncrement = 1;
        let holdIncrement = null;
        let trigger = '';
        let action = '';
        let resetRule = '';
        let rationale = '';

        // ----------------------------------------------------------------------
        // Model Selection Logic
        // ----------------------------------------------------------------------
        if (isIsometric) {
            model = PROGRESSION_MODELS.HOLD_PROGRESSION;
            loadIncrement = LOAD_INCREMENT_CATEGORIES.NONE;
            holdIncrement = 5;
            trigger = `Complete prescribed hold duration at target RIR ${requiredRIR} with stable alignment.`;
            action = `Increase hold duration by +${holdIncrement}s in the subsequent session.`;
            rationale = 'Isometric hold movement: duration accumulation prioritized over external load.';
        } else if (isBodyweight && !equipment.includes('dumbbell')) {
            model = PROGRESSION_MODELS.REP_PROGRESSION;
            loadIncrement = LOAD_INCREMENT_CATEGORIES.NONE;
            repIncrement = 1;
            trigger = `Achieve top of target rep range across all working sets while maintaining RIR ${requiredRIR}.`;
            action = `Add +${repIncrement} rep per set before seeking external resistance or advanced leverage regressions.`;
            rationale = 'Bodyweight modality: repetition progression prioritized due to fixed external load constraints.';
        } else if (ex.progressionModel === 'rir_progression' || ex.progressionModel === 'RIR_PROGRESSION' || (primaryGoal === 'get-shredded' && !isCompound && requiredRIR >= 3)) {
            model = PROGRESSION_MODELS.RIR_PROGRESSION;
            loadIncrement = LOAD_INCREMENT_CATEGORIES.NONE;
            const nextRIR = Math.max(0, requiredRIR - 1);
            trigger = `Complete all prescribed sets with strict execution while sustaining target RIR ${requiredRIR}.`;
            action = `Progress effort proximity by targeting RIR ${nextRIR} (RPE ${10 - nextRIR}) in subsequent exposures before adding external resistance.`;
            rationale = 'Effort tolerance progression: increasing proximity to failure within safe biological bounds.';
        } else if (primaryGoal === 'strength' && (complexity >= 4 || isCompound)) {
            model = PROGRESSION_MODELS.LOAD_PROGRESSION;
            loadIncrement = complexity >= 4 ? LOAD_INCREMENT_CATEGORIES.MICRO : LOAD_INCREMENT_CATEGORIES.SMALL;
            trigger = `Complete all prescribed sets at ${repRange.max} reps with technical mastery and RIR ${requiredRIR}.`;
            action = `Increase load (${loadIncrement} increment) and maintain prescribed strength rep target.`;
            resetRule = 'Maintain load if technical breakdown or premature RIR exhaustion occurs.';
            rationale = 'Primary strength compound: load progression prioritized under strict axial and technical safeguards.';
        } else if (expLevel === 'beginner' || complexity >= 4 || fatigueCost >= 5) {
            model = PROGRESSION_MODELS.CONSERVATIVE_PROGRESSION;
            loadIncrement = LOAD_INCREMENT_CATEGORIES.MICRO;
            trigger = `Complete full rep target with impeccable mechanics across 2 consecutive sessions at RIR ${requiredRIR}.`;
            action = `Increase resistance by ${loadIncrement} increment; prioritize motor consistency over aggressive loading.`;
            resetRule = 'Hold current load if any form degradation or velocity decay is observed.';
            rationale = 'High technical complexity or beginner foundation: conservative progression enforces motor learning.';
        } else if (primaryGoal === 'weight-loss' || primaryGoal === 'general-fitness') {
            model = PROGRESSION_MODELS.DOUBLE_PROGRESSION;
            loadIncrement = LOAD_INCREMENT_CATEGORIES.SMALL;
            trigger = `Complete all working sets at ${repRange.max} reps with target RIR ${requiredRIR}.`;
            action = `Increase resistance (${loadIncrement} increment) and return to ${repRange.min} reps.`;
            resetRule = `Reset target repetitions to ${repRange.min} reps upon increasing load.`;
            rationale = 'Energy deficit / general fitness: double progression provides auto-regulated volume without excessive loading spikes.';
        } else {
            // Default Hypertrophy / Muscle-Gain: Double Progression
            model = PROGRESSION_MODELS.DOUBLE_PROGRESSION;
            loadIncrement = complexity <= 2 ? LOAD_INCREMENT_CATEGORIES.SMALL : LOAD_INCREMENT_CATEGORIES.MICRO;
            trigger = `Complete all prescribed sets at the top of the rep range (${repRange.max} reps) while maintaining RIR ${requiredRIR}.`;
            action = `Increase resistance (${loadIncrement} increment) and reset repetition target to ${repRange.min} reps.`;
            resetRule = `Reset repetition prescription to ${repRange.min} reps per set at the new load.`;
            rationale = `Hypertrophy foundation: double progression allows progressive overload from ${repRange.min} to ${repRange.max} reps before load increase.`;
        }

        const strategy = {
            version: ENGINE_VERSION,
            model,
            exerciseId: ex.id || 'custom_exercise',
            repRange,
            requiredRIR,
            progressionTrigger: trigger,
            progressionAction: action,
            loadIncrementCategory: loadIncrement,
            stallPolicy: {
                action: 'maintain',
                futureEscalation: 'adaptive-engine'
            },
            deloadPolicy: {
                action: 'maintain',
                guidance: 'Incorporate scheduled recovery deload every 6-8 weeks reducing volume by 40%.'
            },
            rationale
        };

        if (resetRule) strategy.resetRule = resetRule;
        if (typeof repIncrement === 'number' && model === PROGRESSION_MODELS.REP_PROGRESSION) strategy.repIncrement = repIncrement;
        if (typeof holdIncrement === 'number' && model === PROGRESSION_MODELS.HOLD_PROGRESSION) strategy.holdIncrementSeconds = holdIncrement;

        return strategy;
    }

    /**
     * Alias helper returning structured progression prescription.
     */
    function getProgressionPrescription(exercise, profile, requirements, intensity) {
        return calculateProgressionStrategy(exercise, profile, requirements, intensity);
    }

    /**
     * Returns a human-readable explanation of a progression strategy.
     * @param {Object} strategy 
     * @returns {string}
     */
    function getProgressionExplanation(strategy) {
        if (!strategy || typeof strategy !== 'object') return 'Maintain prescribed resistance and repetitions with stable form.';
        return strategy.rationale || strategy.progressionAction || 'Progress load or reps when criteria are met.';
    }

    /**
     * Generates a deterministic snapshot for regression testing.
     * @param {Object} strategy 
     * @returns {string} JSON snapshot
     */
    function getDeterministicProgressionSnapshot(strategy) {
        return JSON.stringify(strategy);
    }

    /**
     * Validates that a progression strategy is structurally, logically, and model-specifically sound.
     * @param {Object} strategy 
     * @returns {{valid: boolean, errors: string[]}}
     */
    function validateProgressionStrategy(strategy) {
        const errors = [];
        if (!strategy || typeof strategy !== 'object') {
            return { valid: false, errors: ['Progression strategy must be a non-null object.'] };
        }

        // 1. General Schema Validation
        if (!strategy.model || !Object.values(PROGRESSION_MODELS).includes(strategy.model)) {
            errors.push(`Invalid or unsupported progression model: '${strategy.model}'.`);
        }

        if (!strategy.progressionTrigger || typeof strategy.progressionTrigger !== 'string' || strategy.progressionTrigger.trim() === '') {
            errors.push('Progression strategy must define a valid non-empty progressionTrigger.');
        }

        if (!strategy.progressionAction || typeof strategy.progressionAction !== 'string' || strategy.progressionAction.trim() === '') {
            errors.push('Progression strategy must define a valid non-empty progressionAction.');
        }

        if (strategy.repRange) {
            if (typeof strategy.repRange.min !== 'number' || typeof strategy.repRange.max !== 'number') {
                errors.push('Progression repRange must contain numeric min and max values.');
            } else if (strategy.repRange.min > strategy.repRange.max || strategy.repRange.min < 1) {
                errors.push(`Invalid rep range ordering [min: ${strategy.repRange.min}, max: ${strategy.repRange.max}].`);
            }
        }

        if (typeof strategy.requiredRIR !== 'number' || isNaN(strategy.requiredRIR) || strategy.requiredRIR < 0 || strategy.requiredRIR > 5) {
            errors.push(`Invalid requiredRIR: '${strategy.requiredRIR}'. Must be numeric between 0 and 5.`);
        }

        if (strategy.loadIncrementCategory && !Object.values(LOAD_INCREMENT_CATEGORIES).includes(strategy.loadIncrementCategory)) {
            errors.push(`Invalid loadIncrementCategory: '${strategy.loadIncrementCategory}'.`);
        }

        // 2. Historical-State Audit (Phase 9 must not contain stateful historical tracking)
        const statefulFields = [
            'previousSessions', 'completedSessions', 'sessionCount', 'workoutHistory',
            'loggedReps', 'loggedWeight', 'consecutiveFailures', 'historicalStalls', 'deloadTriggered'
        ];
        statefulFields.forEach(field => {
            if (strategy[field] !== undefined) {
                errors.push(`Stateful historical field '${field}' is prohibited in Phase 9 progression strategy.`);
            }
        });

        // 3. Model-Specific Validation & Contradiction Detection
        switch (strategy.model) {
            case PROGRESSION_MODELS.DOUBLE_PROGRESSION:
                if (!strategy.repRange || typeof strategy.repRange.min !== 'number' || typeof strategy.repRange.max !== 'number') {
                    errors.push('DOUBLE_PROGRESSION requires valid numeric repRange (min and max).');
                } else if (strategy.repRange.min >= strategy.repRange.max) {
                    errors.push(`DOUBLE_PROGRESSION requires repRange.min < repRange.max [min: ${strategy.repRange.min}, max: ${strategy.repRange.max}].`);
                }
                if (strategy.loadIncrementCategory === LOAD_INCREMENT_CATEGORIES.NONE) {
                    errors.push('DOUBLE_PROGRESSION requires a non-NONE loadIncrementCategory for the overload step.');
                }
                if (!strategy.resetRule || typeof strategy.resetRule !== 'string') {
                    errors.push('DOUBLE_PROGRESSION requires a defined resetRule.');
                }
                if (strategy.repIncrement !== undefined) {
                    errors.push('DOUBLE_PROGRESSION must not contain contradictory repIncrement field.');
                }
                break;

            case PROGRESSION_MODELS.LOAD_PROGRESSION:
                if (strategy.loadIncrementCategory === LOAD_INCREMENT_CATEGORIES.NONE) {
                    errors.push('LOAD_PROGRESSION requires an active loadIncrementCategory (MICRO, SMALL, or MODERATE).');
                }
                if (strategy.incrementKg !== undefined || strategy.exactKg !== undefined) {
                    errors.push('LOAD_PROGRESSION must not specify arbitrary exact kilogram assumptions.');
                }
                if (strategy.repIncrement !== undefined) {
                    errors.push('LOAD_PROGRESSION must not contain contradictory repIncrement.');
                }
                break;

            case PROGRESSION_MODELS.REP_PROGRESSION:
                if (typeof strategy.repIncrement !== 'number' || strategy.repIncrement < 1) {
                    errors.push('REP_PROGRESSION requires repIncrement >= 1.');
                }
                if (strategy.loadIncrementCategory !== LOAD_INCREMENT_CATEGORIES.NONE) {
                    errors.push('REP_PROGRESSION must have loadIncrementCategory set to NONE.');
                }
                break;

            case PROGRESSION_MODELS.RIR_PROGRESSION:
                if (strategy.loadIncrementCategory !== LOAD_INCREMENT_CATEGORIES.NONE) {
                    errors.push('RIR_PROGRESSION must have loadIncrementCategory set to NONE.');
                }
                if (strategy.requiredRIR === 0) {
                    // RIR progression progresses toward lower RIR; starting at 0 has nowhere to progress effort-wise
                    errors.push('RIR_PROGRESSION should not have baseline requiredRIR of 0.');
                }
                break;

            case PROGRESSION_MODELS.HOLD_PROGRESSION:
                if (typeof strategy.holdIncrementSeconds !== 'number' || strategy.holdIncrementSeconds < 1) {
                    errors.push('HOLD_PROGRESSION requires holdIncrementSeconds >= 1.');
                }
                if (strategy.loadIncrementCategory !== LOAD_INCREMENT_CATEGORIES.NONE) {
                    errors.push('HOLD_PROGRESSION must have loadIncrementCategory set to NONE.');
                }
                if (strategy.repIncrement !== undefined) {
                    errors.push('HOLD_PROGRESSION must not contain contradictory repIncrement.');
                }
                break;

            case PROGRESSION_MODELS.CONSERVATIVE_PROGRESSION:
                if (strategy.loadIncrementCategory !== LOAD_INCREMENT_CATEGORIES.MICRO) {
                    errors.push('CONSERVATIVE_PROGRESSION must use MICRO load increment category.');
                }
                break;
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        PROGRESSION_MODELS,
        LOAD_INCREMENT_CATEGORIES,
        calculateProgressionStrategy,
        getProgressionPrescription,
        getProgressionExplanation,
        getDeterministicProgressionSnapshot,
        validateProgressionStrategy,
        _internals: {
            parseRepRange
        }
    };
}));
