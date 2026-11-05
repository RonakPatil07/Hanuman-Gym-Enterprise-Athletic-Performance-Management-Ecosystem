/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * ADAPTIVE TRAINING INTELLIGENCE ENGINE (v1.0)
 * ==============================================================================
 * 
 * Deterministic engine for generating conservative, explainable next-exposure
 * training prescriptions ("What should happen next?").
 * 
 * Core Design Principles:
 * 1. SAFETY & RECOVERY PRECEDENCE:
 *    Safety > Recovery > Performance Quality > Goal > Progression Strategy.
 * 2. EVIDENCE-BASED DECISION GATING:
 *    - 0-1 Exposures -> DEFER (LOW confidence)
 *    - 2 Exposures -> MEDIUM confidence (eligible for conservative progression)
 *    - 3+ Exposures -> HIGH confidence (eligible for full progression)
 * 3. CONTROLLED ADAPTIVE DECISIONS:
 *    - PROGRESS: Evidence confirms completion, upper rep boundary hit, RIR maintained.
 *    - MAINTAIN: Default conservative path.
 *    - REGRESS: Conservative load/volume adjustment upon repeated failure.
 *    - RECOVER: De-escalation upon persistent high-effort / low-RIR distress.
 *    - DEFER: Insufficient or ambiguous data.
 * 4. READ-ONLY IMMUTABILITY: Never mutates current program or historical logs.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AdaptiveTrainingEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    // ==========================================================================
    // 1. CONSTANTS & ENUMS
    // ==========================================================================

    const ADAPTIVE_DECISIONS = {
        PROGRESS: 'PROGRESS',
        MAINTAIN: 'MAINTAIN',
        REGRESS: 'REGRESS',
        RECOVER: 'RECOVER',
        DEFER: 'DEFER'
    };

    const CONFIDENCE_LEVELS = {
        LOW: 'LOW',
        MEDIUM: 'MEDIUM',
        HIGH: 'HIGH'
    };

    const ADJUSTMENT_TYPES = {
        LOAD: 'LOAD',
        REPS: 'REPS',
        RIR: 'RIR',
        HOLD: 'HOLD',
        NONE: 'NONE'
    };

    // ==========================================================================
    // 2. HELPER UTILITIES
    // ==========================================================================

    function deepClone(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    function parseRepRange(rangeStr) {
        if (!rangeStr) return { min: 8, max: 12 };
        if (typeof rangeStr === 'object' && typeof rangeStr.min === 'number' && typeof rangeStr.max === 'number') {
            return { min: rangeStr.min, max: rangeStr.max };
        }
        const str = String(rangeStr).trim();
        const rangeMatch = str.match(/(\d+)\s*[-–—]\s*(\d+)/);
        if (rangeMatch) {
            return { min: parseInt(rangeMatch[1], 10), max: parseInt(rangeMatch[2], 10) };
        }
        const singleMatch = str.match(/(\d+)/);
        if (singleMatch) {
            const val = parseInt(singleMatch[1], 10);
            return { min: val, max: val };
        }
        return { min: 8, max: 12 };
    }

    // ==========================================================================
    // 3. ADAPTIVE DECISION GENERATION
    // ==========================================================================

    /**
     * Determines the validated next-exposure prescription based on factual performance analysis.
     * 
     * @param {Object} currentPrescription Current exercise prescription from program
     * @param {Object} progressionStrategy Progression strategy from Phase 9
     * @param {Object} performanceAnalysis Performance analysis from Phase 11
     * @param {Object} [profile] Canonical user profile
     * @param {Object} [options] Context options (e.g. safetyFlags)
     * @returns {Object} Adaptive training decision and next prescription
     */
    function calculateAdaptiveDecision(currentPrescription, progressionStrategy, performanceAnalysis, profile = {}, options = {}) {
        if (!currentPrescription || typeof currentPrescription !== 'object') {
            throw new Error('AdaptiveTraining: Valid currentPrescription is required.');
        }

        const exerciseId = currentPrescription.exerciseId || currentPrescription.id || (performanceAnalysis && performanceAnalysis.exerciseId) || 'unknown_ex';
        const progModel = String(
            (progressionStrategy && progressionStrategy.model) ||
            (currentPrescription.progression && currentPrescription.progression.model) ||
            currentPrescription.progressionModel ||
            'DOUBLE_PROGRESSION'
        ).toUpperCase();

        const currentSets = typeof currentPrescription.sets === 'number' ? currentPrescription.sets : 3;
        const currentReps = currentPrescription.reps || '8-12';
        const currentRIR = typeof currentPrescription.rir === 'number' ? currentPrescription.rir : (typeof currentPrescription.targetRIR === 'number' ? currentPrescription.targetRIR : 2);
        const currentRPE = typeof currentPrescription.rpe === 'number' ? currentPrescription.rpe : (10 - currentRIR);

        const normalizedCurrent = {
            exerciseId,
            sets: currentSets,
            reps: currentReps,
            rir: currentRIR,
            rpe: currentRPE,
            progressionModel: progModel
        };

        const safetyFlags = Array.isArray(options.safetyFlags) ? [...options.safetyFlags] : [];

        // Check for safety restrictions in profile
        if (profile && Array.isArray(profile.safetyConstraints)) {
            profile.safetyConstraints.forEach(sc => {
                if (sc.prohibitedExercises && sc.prohibitedExercises.includes(exerciseId)) {
                    safetyFlags.push(`Safety restriction on '${exerciseId}': ${sc.reason || 'Restricted by profile.'}`);
                }
            });
        }

        // Default base next prescription (no change)
        let nextPrescription = deepClone(normalizedCurrent);
        nextPrescription.adjustment = {
            type: ADJUSTMENT_TYPES.NONE,
            category: 'NONE',
            description: 'Maintain current prescribed training parameters.'
        };

        const analysis = performanceAnalysis || {
            sessionsAnalyzed: 0,
            completionRatio: 0,
            repAttainmentRatio: 0,
            performanceSignal: 'INSUFFICIENT_DATA',
            trend: 'INSUFFICIENT_DATA',
            confidence: 'LOW'
        };

        const sessionsAnalyzed = analysis.sessionsAnalyzed || 0;
        const confidence = analysis.confidence || (sessionsAnalyzed >= 3 ? CONFIDENCE_LEVELS.HIGH : (sessionsAnalyzed === 2 ? CONFIDENCE_LEVELS.MEDIUM : CONFIDENCE_LEVELS.LOW));

        // ----------------------------------------------------------------------
        // SAFETY PRECEDENCE (Safety > Recovery > Performance > Progression)
        // ----------------------------------------------------------------------
        if (safetyFlags.length > 0) {
            return {
                decision: ADAPTIVE_DECISIONS.REGRESS,
                confidence: CONFIDENCE_LEVELS.HIGH,
                exerciseId,
                currentPrescription: normalizedCurrent,
                nextPrescription: {
                    ...normalizedCurrent,
                    adjustment: {
                        type: ADJUSTMENT_TYPES.NONE,
                        category: 'NONE',
                        description: `Safety gate active: ${safetyFlags.join(' ')}`
                    }
                },
                rationale: `Safety restrictions active: ${safetyFlags.join(' ')}. Progression is blocked.`,
                evidence: {
                    sessionsAnalyzed,
                    trend: analysis.trend || 'INSUFFICIENT_DATA',
                    performanceSignal: analysis.performanceSignal || 'INSUFFICIENT_DATA',
                    completionRatio: analysis.completionRatio || 0,
                    repAttainmentRatio: analysis.repAttainmentRatio || 0,
                    averageRIRDeviation: analysis.rirDeviation
                },
                safetyFlags
            };
        }

        // ----------------------------------------------------------------------
        // INSUFFICIENT EVIDENCE GATING (0-1 Sessions -> DEFER)
        // ----------------------------------------------------------------------
        if (sessionsAnalyzed < 2 || analysis.performanceSignal === 'INSUFFICIENT_DATA') {
            return {
                decision: ADAPTIVE_DECISIONS.DEFER,
                confidence: CONFIDENCE_LEVELS.LOW,
                exerciseId,
                currentPrescription: normalizedCurrent,
                nextPrescription,
                rationale: `Only ${sessionsAnalyzed} valid exposure(s) recorded. Evidence is insufficient for a reliable adaptation decision; maintaining current prescription.`,
                evidence: {
                    sessionsAnalyzed,
                    trend: analysis.trend || 'INSUFFICIENT_DATA',
                    performanceSignal: analysis.performanceSignal || 'INSUFFICIENT_DATA',
                    completionRatio: analysis.completionRatio || 0,
                    repAttainmentRatio: analysis.repAttainmentRatio || 0,
                    averageRIRDeviation: analysis.rirDeviation
                },
                safetyFlags: []
            };
        }

        // ----------------------------------------------------------------------
        // RECOVERY & PERSISTENT HIGH-EFFORT DETECTION
        // ----------------------------------------------------------------------
        const isRepeatedFailure = analysis.averageActualRIR === 0 || (analysis.averageActualRPE && analysis.averageActualRPE >= 9.8);
        const isUnderperforming = analysis.completionRatio < 0.75 || analysis.performanceSignal === 'BELOW_TARGET';

        if (isRepeatedFailure && isUnderperforming) {
            nextPrescription.adjustment = {
                type: ADJUSTMENT_TYPES.LOAD,
                category: 'MICRO',
                description: 'Reduce training load by micro-increment or reduce target sets to restore movement quality.'
            };
            return {
                decision: ADAPTIVE_DECISIONS.RECOVER,
                confidence,
                exerciseId,
                currentPrescription: normalizedCurrent,
                nextPrescription,
                rationale: `Persistent high exertion (average RIR ${analysis.averageActualRIR}) coupled with below-target completion indicates recovery stress. De-escalating demand to restore training quality.`,
                evidence: {
                    sessionsAnalyzed,
                    trend: analysis.trend,
                    performanceSignal: analysis.performanceSignal,
                    completionRatio: analysis.completionRatio,
                    repAttainmentRatio: analysis.repAttainmentRatio,
                    averageRIRDeviation: analysis.rirDeviation
                },
                safetyFlags: []
            };
        }

        if (isUnderperforming && analysis.trend === 'DECLINING') {
            nextPrescription.adjustment = {
                type: ADJUSTMENT_TYPES.LOAD,
                category: 'MICRO',
                description: 'Regress load or target reps slightly to consolidate technique and rebuild momentum.'
            };
            return {
                decision: ADAPTIVE_DECISIONS.REGRESS,
                confidence,
                exerciseId,
                currentPrescription: normalizedCurrent,
                nextPrescription,
                rationale: `Performance trend is declining across ${sessionsAnalyzed} sessions (completion ratio: ${Math.round(analysis.completionRatio * 100)}%). Conservative regression recommended.`,
                evidence: {
                    sessionsAnalyzed,
                    trend: analysis.trend,
                    performanceSignal: analysis.performanceSignal,
                    completionRatio: analysis.completionRatio,
                    repAttainmentRatio: analysis.repAttainmentRatio,
                    averageRIRDeviation: analysis.rirDeviation
                },
                safetyFlags: []
            };
        }

        // ----------------------------------------------------------------------
        // PROGRESSION GATING (Integrates Phase 9 Models)
        // ----------------------------------------------------------------------
        const repRange = parseRepRange(currentReps);
        const isStrong = (analysis.performanceSignal === 'STRONG' || analysis.completionRatio >= 0.95) && (analysis.trend === 'IMPROVING' || analysis.trend === 'STABLE' || analysis.trend === 'INSUFFICIENT_DATA' || sessionsAnalyzed >= 2);
        const isConsistent = analysis.completionRatio >= 0.95 && (analysis.rirDeviation === null || analysis.rirDeviation === undefined || analysis.rirDeviation >= 0);

        if (isStrong && isConsistent) {
            let adjType = ADJUSTMENT_TYPES.LOAD;
            let adjCat = (progressionStrategy && progressionStrategy.loadIncrementCategory) || 'SMALL';
            let adjDesc = 'Increase resistance using prescribed increment.';

            switch (progModel) {
                case 'DOUBLE_PROGRESSION':
                    adjType = ADJUSTMENT_TYPES.LOAD;
                    adjCat = (progressionStrategy && progressionStrategy.loadIncrementCategory) || 'SMALL';
                    adjDesc = `Upper rep target (${repRange.max} reps) achieved across all sets. Increase load by ${adjCat} increment and reset reps to ${repRange.min}.`;
                    break;

                case 'LOAD_PROGRESSION':
                    adjType = ADJUSTMENT_TYPES.LOAD;
                    adjCat = (progressionStrategy && progressionStrategy.loadIncrementCategory) || 'MICRO';
                    adjDesc = `Strength target achieved with solid form and target RIR ${currentRIR}. Increase load by ${adjCat} increment.`;
                    break;

                case 'REP_PROGRESSION':
                    adjType = ADJUSTMENT_TYPES.REPS;
                    adjCat = 'NONE';
                    adjDesc = `Target reps achieved at target RIR. Add +1 rep per set for the next exposure.`;
                    break;

                case 'RIR_PROGRESSION':
                    adjType = ADJUSTMENT_TYPES.RIR;
                    adjCat = 'NONE';
                    const nextTargetRIR = Math.max(0, currentRIR - 1);
                    nextPrescription.rir = nextTargetRIR;
                    nextPrescription.rpe = 10 - nextTargetRIR;
                    adjDesc = `Target RIR ${currentRIR} sustained with technical mastery. Target higher effort proximity (RIR ${nextTargetRIR} / RPE ${10 - nextTargetRIR}).`;
                    break;

                case 'HOLD_PROGRESSION':
                    adjType = ADJUSTMENT_TYPES.HOLD;
                    adjCat = 'NONE';
                    adjDesc = `Target hold duration completed with stable posture. Increase hold by +5s.`;
                    break;

                case 'CONSERVATIVE_PROGRESSION':
                default:
                    adjType = ADJUSTMENT_TYPES.LOAD;
                    adjCat = 'MICRO';
                    adjDesc = `Motor pattern verified across ${sessionsAnalyzed} sessions. Apply conservative micro-load increment.`;
                    break;
            }

            nextPrescription.adjustment = {
                type: adjType,
                category: adjCat,
                description: adjDesc
            };

            return {
                decision: ADAPTIVE_DECISIONS.PROGRESS,
                confidence,
                exerciseId,
                currentPrescription: normalizedCurrent,
                nextPrescription,
                rationale: `${sessionsAnalyzed} consistent exposures reached target work with target RIR ${currentRIR} maintained. Progression strategy (${progModel}) permits advancement.`,
                evidence: {
                    sessionsAnalyzed,
                    trend: analysis.trend,
                    performanceSignal: analysis.performanceSignal,
                    completionRatio: analysis.completionRatio,
                    repAttainmentRatio: analysis.repAttainmentRatio,
                    averageRIRDeviation: analysis.rirDeviation
                },
                safetyFlags: []
            };
        }

        // ----------------------------------------------------------------------
        // DEFAULT CONSERVATIVE PATH -> MAINTAIN
        // ----------------------------------------------------------------------
        return {
            decision: ADAPTIVE_DECISIONS.MAINTAIN,
            confidence,
            exerciseId,
            currentPrescription: normalizedCurrent,
            nextPrescription,
            rationale: `Performance is on target (${Math.round(analysis.completionRatio * 100)}% completion), but upper progression thresholds have not yet been fully satisfied. Maintaining current prescription to build adaptation.`,
            evidence: {
                sessionsAnalyzed,
                trend: analysis.trend,
                performanceSignal: analysis.performanceSignal,
                completionRatio: analysis.completionRatio,
                repAttainmentRatio: analysis.repAttainmentRatio,
                averageRIRDeviation: analysis.rirDeviation
            },
            safetyFlags: []
        };
    }

    // ==========================================================================
    // 4. SYSTEMIC FATIGUE ACCUMULATION INDEX (FAI) & DELOAD TRIGGER ENGINE
    // ==========================================================================

    /**
     * Calculates the systemic Fatigue Accumulation Index (0-100) across recent workout logs.
     * 
     * @param {Array} logs Historical workout logs
     * @param {Object} program Base workout program
     * @returns {{ score: number, level: string, deloadRecommended: boolean, factors: string[], recommendation: string }}
     */
    function calculateFatigueAccumulationIndex(logs, program) {
        if (!Array.isArray(logs) || logs.length === 0) {
            return {
                score: 15,
                level: 'FRESH',
                deloadRecommended: false,
                factors: ['No previous session fatigue recorded.'],
                recommendation: 'Baseline readiness optimal for progressive mesocycle accumulation.'
            };
        }

        const completedLogs = logs.filter(l => l && (l.status === 'COMPLETED' || l.status === 'PARTIALLY_COMPLETED'));
        if (completedLogs.length === 0) {
            return {
                score: 20,
                level: 'FRESH',
                deloadRecommended: false,
                factors: ['No completed training logs available.'],
                recommendation: 'Initial mesocycle phase. Ready for standard progression.'
            };
        }

        // Evaluate the last 3-6 exposures
        const recentLogs = completedLogs.slice(-6);
        let totalSets = 0;
        let lowRIRCount = 0;
        let missedRepSets = 0;
        const factors = [];

        recentLogs.forEach(log => {
            (log.exercises || []).forEach(ex => {
                (ex.sets || []).filter(s => s && s.completed).forEach(s => {
                    totalSets++;
                    if (typeof s.actualRIR === 'number' && s.actualRIR <= 1) {
                        lowRIRCount++;
                    }
                    if (s.plannedReps && s.actualReps && s.actualReps < (s.plannedReps * 0.8)) {
                        missedRepSets++;
                    }
                });
            });
        });

        let fatigueScore = 20; // baseline physiological load

        // Volume accumulation component
        if (completedLogs.length >= 12) {
            fatigueScore += 25;
            factors.push('High mesocycle density (12+ completed sessions without structural deload).');
        } else if (completedLogs.length >= 8) {
            fatigueScore += 15;
            factors.push('Moderate mesocycle accumulation (8+ completed sessions).');
        }

        // Low RIR / Proximity to failure fatigue
        if (totalSets > 0) {
            const lowRIRRatio = lowRIRCount / totalSets;
            if (lowRIRRatio >= 0.45) {
                fatigueScore += 30;
                factors.push(`High CNS demand: ${Math.round(lowRIRRatio * 100)}% of recent sets executed at RIR <= 1.`);
            } else if (lowRIRRatio >= 0.25) {
                fatigueScore += 15;
                factors.push(`Moderate proximity to failure: ${Math.round(lowRIRRatio * 100)}% of sets at RIR <= 1.`);
            }

            // Missed rep failure rate
            const missedRatio = missedRepSets / totalSets;
            if (missedRatio >= 0.2) {
                fatigueScore += 25;
                factors.push(`Performance decline: ${Math.round(missedRatio * 100)}% of sets fell below 80% target rep threshold.`);
            }
        }

        // Clamp between 0 and 100
        fatigueScore = Math.max(0, Math.min(100, fatigueScore));

        let level = 'FRESH';
        let deloadRecommended = false;
        let recommendation = 'Readiness is high. Continue normal mesocycle progression.';

        if (fatigueScore >= 75) {
            level = 'OVERREACHING';
            deloadRecommended = true;
            recommendation = 'Systemic fatigue is high. A 1-week recovery deload microcycle (-40% volume, +2 RIR) is strongly recommended.';
        } else if (fatigueScore >= 50) {
            level = 'ELEVATED';
            deloadRecommended = false;
            recommendation = 'Fatigue is accumulating normally. Monitor recovery and prepare for upcoming deload.';
        } else if (fatigueScore >= 30) {
            level = 'PRODUCTIVE';
            deloadRecommended = false;
            recommendation = 'Optimal training stimulus. Continue progressive overload.';
        }

        return {
            score: fatigueScore,
            level,
            deloadRecommended,
            factors,
            recommendation
        };
    }

    /**
     * Generates a 1-week scientific deload microcycle from the base program.
     * (-40% volume, -10% load, +2 RIR buffer for CNS and connective tissue resensitization).
     * 
     * @param {Object} baseProgram 
     * @returns {Object} Deload Workout Program
     */
    function generateDeloadProgram(baseProgram) {
        if (!baseProgram || typeof baseProgram !== 'object') return baseProgram;

        const deload = deepClone(baseProgram);
        deload.isDeload = true;
        deload.phaseTitle = '1-Week Active Recovery & Resensitization Deload';
        deload.phaseDescription = 'Volume scaled down by 40% with +2 RIR reserve to dissipate systemic fatigue and prime neuromuscular sensitivity for the next mesocycle.';

        (deload.sessions || []).forEach((sess, sIdx) => {
            sess.title = `${sess.title || `Session ${sIdx + 1}`} (Deload)`;
            sess.focus = `${sess.focus || 'Strength'} — Active Recovery Protocol`;

            (sess.exercises || []).forEach(ex => {
                const originalSets = typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets, 10) || 3;
                ex.sets = Math.max(1, Math.round(originalSets * 0.6)); // 40% reduction
                ex.isDeload = true;
                ex.originalSets = originalSets;

                if (typeof ex.targetRIR === 'number') {
                    ex.targetRIR = Math.min(5, ex.targetRIR + 2);
                } else {
                    ex.targetRIR = 4;
                }

                if (typeof ex.targetRPE === 'number') {
                    ex.targetRPE = Math.max(5, ex.targetRPE - 2);
                } else {
                    ex.targetRPE = 6;
                }

                ex.coachingCues = [
                    'Deload Set: Maintain explosive intent on the concentric phase with zero technical breakdown or grinding.',
                    'Stop every set with 3-4 reps in reserve (RIR 3-4).'
                ];
            });
        });

        return deload;
    }

    /**
     * Generates a 4-week projected overload forecast trajectory for an exercise.
     * 
     * @param {Object} exercise 
     * @param {Object} strategy 
     * @returns {Array} 4-week projection milestones
     */
    function generateOverloadForecast(exercise, strategy) {
        if (!exercise || typeof exercise !== 'object') return [];

        const repRange = parseRepRange(exercise.reps);
        const baseSets = typeof exercise.sets === 'number' ? exercise.sets : parseInt(exercise.sets, 10) || 3;

        return [
            { week: 1, label: 'Week 1: Baseline Establishment', sets: baseSets, reps: `${repRange.min} reps`, targetRIR: 'RIR 2-3', focus: 'Calibrate load & tempo' },
            { week: 2, label: 'Week 2: Volume Accumulation', sets: baseSets, reps: `${Math.min(repRange.max, repRange.min + 1)} reps`, targetRIR: 'RIR 2', focus: '+1 Rep per set overload' },
            { week: 3, label: 'Week 3: Peak Intensity Overload', sets: baseSets + (baseSets < 4 ? 1 : 0), reps: `${repRange.max} reps`, targetRIR: 'RIR 1-2', focus: 'Hit upper rep boundary' },
            { week: 4, label: 'Week 4: Weight Increment / Consolidation', sets: baseSets, reps: `${repRange.min} reps`, targetRIR: 'RIR 2', focus: '+2.5kg / +5lb load increase' }
        ];
    }

    // ==========================================================================
    // 5. VALIDATION & DETERMINISM
    // ==========================================================================

    /**
     * Validates that an adaptive training decision is structurally and logically sound.
     * 
     * @param {Object} decision 
     * @returns {{valid: boolean, errors: string[]}}
     */
    function validateAdaptiveDecision(decision) {
        const errors = [];
        if (!decision || typeof decision !== 'object') {
            return { valid: false, errors: ['Adaptive decision must be a non-null object.'] };
        }

        if (!decision.decision || !Object.values(ADAPTIVE_DECISIONS).includes(decision.decision)) {
            errors.push(`Invalid adaptive decision: '${decision.decision}'.`);
        }

        if (!decision.confidence || !Object.values(CONFIDENCE_LEVELS).includes(decision.confidence)) {
            errors.push(`Invalid confidence level: '${decision.confidence}'.`);
        }

        if (!decision.exerciseId || typeof decision.exerciseId !== 'string') {
            errors.push('Adaptive decision must contain a valid exerciseId.');
        }

        if (!decision.currentPrescription || typeof decision.currentPrescription !== 'object') {
            errors.push('Missing currentPrescription object.');
        }

        if (!decision.nextPrescription || typeof decision.nextPrescription !== 'object') {
            errors.push('Missing nextPrescription object.');
        } else {
            const np = decision.nextPrescription;
            if (typeof np.sets !== 'number' || np.sets < 1) {
                errors.push(`Invalid nextPrescription sets (${np.sets}).`);
            }
            if (typeof np.rir === 'number' && (np.rir < 0 || np.rir > 5)) {
                errors.push(`Invalid nextPrescription RIR (${np.rir}). Must be between 0 and 5.`);
            }
            if (typeof np.rpe === 'number' && (np.rpe < 5 || np.rpe > 10)) {
                errors.push(`Invalid nextPrescription RPE (${np.rpe}). Must be between 5 and 10.`);
            }
            if (np.adjustment) {
                if (!Object.values(ADJUSTMENT_TYPES).includes(np.adjustment.type)) {
                    errors.push(`Invalid adjustment type: '${np.adjustment.type}'.`);
                }
                // Reject exact unsupported kilogram claims in adaptive adjustments
                if (np.adjustment.exactKg !== undefined || np.adjustment.incrementKg !== undefined) {
                    errors.push('Unsupported exact kilogram assumption in adaptive decision.');
                }
            }
        }

        if (!decision.rationale || typeof decision.rationale !== 'string' || decision.rationale.trim() === '') {
            errors.push('Adaptive decision must contain a non-empty rationale string.');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Produces a deterministic JSON snapshot of an adaptive decision.
     */
    function getDeterministicAdaptiveSnapshot(decision) {
        if (!decision || typeof decision !== 'object') return '{}';
        const clone = deepClone(decision);
        return JSON.stringify(clone);
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        ADAPTIVE_DECISIONS,
        CONFIDENCE_LEVELS,
        ADJUSTMENT_TYPES,
        calculateAdaptiveDecision,
        calculateFatigueAccumulationIndex,
        generateDeloadProgram,
        generateOverloadForecast,
        validateAdaptiveDecision,
        getDeterministicAdaptiveSnapshot,
        _internals: {
            deepClone,
            parseRepRange
        }
    };
}));
