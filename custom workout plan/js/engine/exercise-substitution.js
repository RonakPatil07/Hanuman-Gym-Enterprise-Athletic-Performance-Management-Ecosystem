/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * EXERCISE SUBSTITUTION & CONSTRAINT-AWARE ALTERNATIVES ENGINE (v1.0)
 * ==============================================================================
 * 
 * Pure, deterministic engine for finding, scoring, ranking, and validating
 * constraint-aware exercise substitutions.
 * 
 * Core Design Principles:
 * 1. HARD SAFETY & FEASIBILITY FIRST: Unsafe or equipment-incompatible candidates
 *    are eliminated BEFORE scoring. Safety constraints are never relaxed.
 * 2. TRAINING INTENT PRESERVATION: Multidimensional scoring prioritizing primary
 *    muscles, movement patterns, progression models, and biomechanics.
 * 3. TRANSPARENT QUALITY & CONFIDENCE: Classifies substitutions as DIRECT, STRONG,
 *    ACCEPTABLE, or LIMITED with explainable rationales and preserved attributes.
 * 4. STRICT DETERMINISM: Stable sorting and tie-breaking (Score -> Quality ->
 *    Lower Complexity -> Lower Fatigue -> Alphabetical ID). Zero Math.random().
 * 5. READ-ONLY IMMUTABILITY: Never mutates the exercise database, canonical profile,
 *    current program, or historical logs.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./exercise-database.js'], factory);
    } else if (typeof module === 'object' && module.exports) {
        const exerciseDB = require('./exercise-database.js');
        module.exports = factory(exerciseDB);
    } else {
        root.ExerciseSubstitutionEngine = factory(root.ExerciseDatabaseEngine);
    }
}(typeof self !== 'undefined' ? self : this, function (exerciseDB) {
    'use strict';

    const ENGINE_VERSION = '1.0';

    // ==========================================================================
    // 1. CONSTANTS, ENUMS & WEIGHTS
    // ==========================================================================

    const SUBSTITUTION_STATUS = Object.freeze({
        FOUND: 'FOUND',
        NO_VALID_ALTERNATIVE: 'NO_VALID_ALTERNATIVE',
        INVALID_REQUEST: 'INVALID_REQUEST',
        DEFER: 'DEFER'
    });

    const SUBSTITUTION_REASONS = Object.freeze({
        INJURY: 'INJURY',
        EQUIPMENT_UNAVAILABLE: 'EQUIPMENT_UNAVAILABLE',
        DISCOMFORT: 'DISCOMFORT',
        PREFERENCE: 'PREFERENCE',
        ACCESSIBILITY: 'ACCESSIBILITY',
        FATIGUE: 'FATIGUE',
        OTHER: 'OTHER'
    });

    const SUBSTITUTION_QUALITY = Object.freeze({
        DIRECT: 'DIRECT',
        STRONG: 'STRONG',
        ACCEPTABLE: 'ACCEPTABLE',
        LIMITED: 'LIMITED',
        NONE: 'NONE'
    });

    const CONFIDENCE_LEVELS = Object.freeze({
        HIGH: 'HIGH',
        MEDIUM: 'MEDIUM',
        LOW: 'LOW'
    });

    // Centralized Scoring Weights (Total: 100 points)
    const SCORING_WEIGHTS = Object.freeze({
        PRIMARY_MUSCLE_MATCH: 25,
        MOVEMENT_PATTERN_MATCH: 20,
        EQUIPMENT_MATCH: 20,
        GOAL_COMPATIBILITY: 10,
        SECONDARY_MUSCLE_OVERLAP: 8,
        PROGRESSION_COMPATIBILITY: 7,
        DIFFICULTY_COMPATIBILITY: 4,
        TECHNICAL_COMPLEXITY_SIMILARITY: 3,
        FATIGUE_SIMILARITY: 2,
        STABILITY_SIMILARITY: 1
    });

    // ==========================================================================
    // 2. HELPER UTILITIES
    // ==========================================================================

    function deepClone(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    function formatLabel(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/[_-]+/g, ' ')
            .trim()
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }

    function getDB() {
        if (exerciseDB && typeof exerciseDB.getAllExercises === 'function') {
            return exerciseDB;
        }
        if (typeof window !== 'undefined' && window.ExerciseDatabaseEngine) {
            return window.ExerciseDatabaseEngine;
        }
        throw new Error('ExerciseSubstitutionEngine: ExerciseDatabaseEngine is required.');
    }

    // Injury constraint mapping (consistent with training-rules.js)
    const INJURY_CONSTRAINT_MAP = Object.freeze({
        'sensitive-knees': ['requires_deep_knee_flexion'],
        'knee': ['requires_deep_knee_flexion'],
        'sensitive-back': ['requires_spinal_loading'],
        'back': ['requires_spinal_loading'],
        'shoulder': ['requires_overhead_position', 'requires_shoulder_flexion'],
        'wrist': ['requires_grip']
    });

    /**
     * Checks whether an exercise model is permitted under specified injury constraints.
     */
    function isExerciseAllowedForInjuries(candidate, injuries) {
        if (!candidate || !Array.isArray(candidate.constraints)) return true;
        if (!Array.isArray(injuries) || injuries.length === 0) return true;

        for (const inj of injuries) {
            const cleanInj = String(inj).toLowerCase().trim();
            const prohibited = INJURY_CONSTRAINT_MAP[cleanInj] || [];
            for (const p of prohibited) {
                if (candidate.constraints.includes(p)) {
                    return false;
                }
            }
        }
        return true;
    }

    // ==========================================================================
    // 3. HARD CONSTRAINT FILTERING
    // ==========================================================================

    /**
     * Checks if a candidate exercise satisfies hard safety and equipment constraints.
     * 
     * @param {Object} candidate Candidate exercise from DB
     * @param {Object} original Original exercise being replaced
     * @param {Object} request Substitution request
     * @returns {{passed: boolean, rejectionReason: string|null}}
     */
    function passesHardConstraints(candidate, original, request) {
        if (!candidate || !candidate.id) {
            return { passed: false, rejectionReason: 'Invalid candidate model.' };
        }

        // 1. Same exercise is rejected
        if (candidate.id === original.id) {
            return { passed: false, rejectionReason: 'Candidate is identical to original exercise.' };
        }

        const profile = request.profile || {};
        const reqs = request.requirements || {};

        // 2. Injury & Movement Restrictions Filtering
        const injuries = Array.isArray(profile.injuries)
            ? profile.injuries
            : (profile.movementConstraints && Array.isArray(profile.movementConstraints.injuries)
                ? profile.movementConstraints.injuries
                : (Array.isArray(reqs.injuries) ? reqs.injuries : []));

        if (injuries.length > 0 && !isExerciseAllowedForInjuries(candidate, injuries)) {
            return { passed: false, rejectionReason: `Violates injury restriction: ${injuries.join(', ')}.` };
        }

        // Check explicit safety constraints in profile
        const safetyConstraints = Array.isArray(profile.safetyConstraints)
            ? profile.safetyConstraints
            : (profile.movementConstraints && Array.isArray(profile.movementConstraints.safetyConstraints)
                ? profile.movementConstraints.safetyConstraints
                : []);

        for (const sc of safetyConstraints) {
            if (sc.prohibitedExercises && sc.prohibitedExercises.includes(candidate.id)) {
                return { passed: false, rejectionReason: `Prohibited by safety constraint: ${sc.reason || 'Restricted lift'}.` };
            }
        }

        // 3. Equipment Constraints Filtering
        let availableEquipment = null;
        if (Array.isArray(request.availableEquipment)) {
            availableEquipment = request.availableEquipment;
        } else if (Array.isArray(reqs.equipment)) {
            availableEquipment = reqs.equipment;
        } else if (Array.isArray(profile.availableEquipment)) {
            availableEquipment = profile.availableEquipment;
        } else if (Array.isArray(profile.equipment)) {
            availableEquipment = profile.equipment;
        } else if (profile.trainingAvailability) {
            if (profile.trainingAvailability.workoutLocation === 'home') {
                availableEquipment = Array.isArray(profile.trainingAvailability.homeEquipment) && profile.trainingAvailability.homeEquipment.length > 0
                    ? profile.trainingAvailability.homeEquipment
                    : ['bodyweight', 'none', 'mat'];
            } else if (Array.isArray(profile.trainingAvailability.homeEquipment) && profile.trainingAvailability.homeEquipment.length > 0) {
                availableEquipment = profile.trainingAvailability.homeEquipment;
            }
        }

        if (availableEquipment && availableEquipment.length > 0) {
            const requiredEquip = Array.isArray(candidate.equipment) ? candidate.equipment : [];
            const hasRequired = requiredEquip.length === 0 ||
                requiredEquip.every(eq => availableEquipment.includes(eq) || eq === 'none' || eq === 'mat' || eq === 'bodyweight');

            if (!hasRequired) {
                return { passed: false, rejectionReason: `Requires unavailable equipment (${requiredEquip.join(', ')}).` };
            }
        }

        // 4. Requested Constraints Filtering (e.g. equipment restriction specified in request)
        if (request.requestedConstraints && typeof request.requestedConstraints === 'object') {
            const rc = request.requestedConstraints;
            if (Array.isArray(rc.prohibitedEquipment) && rc.prohibitedEquipment.length > 0) {
                const reqEquip = Array.isArray(candidate.equipment) ? candidate.equipment : [];
                const hasProhibited = reqEquip.length === 0
                    ? rc.prohibitedEquipment.includes('none') || rc.prohibitedEquipment.includes('bodyweight')
                    : reqEquip.some(eq => rc.prohibitedEquipment.includes(eq));

                if (hasProhibited) {
                    return { passed: false, rejectionReason: `Contains requested prohibited equipment.` };
                }
            }
            if (Array.isArray(rc.prohibitedExercises) && rc.prohibitedExercises.includes(candidate.id)) {
                return { passed: false, rejectionReason: `Explicitly requested as prohibited.` };
            }
        }

        return { passed: true, rejectionReason: null };
    }

    // ==========================================================================
    // 4. INTENT-PRESERVATION SCORING
    // ==========================================================================

    /**
     * Computes the intent-preservation score (0-100) between candidate and original exercise.
     * 
     * @param {Object} candidate 
     * @param {Object} original 
     * @param {Object} request 
     * @returns {{score: number, preservedAttributes: Object, differences: string[]}}
     */
    function scoreCandidate(candidate, original, request) {
        let score = 0;
        const differences = [];
        const preserved = {
            primaryMuscle: false,
            movementPattern: false,
            goal: false,
            equipment: false,
            progressionModel: false
        };

        const origPrimary = Array.isArray(original.primaryMuscles)
            ? original.primaryMuscles
            : (original.targetMuscles && Array.isArray(original.targetMuscles.primary) ? original.targetMuscles.primary : []);

        const candPrimary = Array.isArray(candidate.primaryMuscles)
            ? candidate.primaryMuscles
            : (candidate.targetMuscles && Array.isArray(candidate.targetMuscles.primary) ? candidate.targetMuscles.primary : []);

        // 1. Primary Muscle Match (25 pts)
        const isChestVariant = (m1, m2) => (m1 === 'chest' && (m2 === 'upper_chest' || m2 === 'lower_chest')) ||
            ((m1 === 'upper_chest' || m1 === 'lower_chest') && m2 === 'chest');

        const primaryOverlap = origPrimary.filter(m => candPrimary.includes(m) || candPrimary.some(c => isChestVariant(m, c)));
        if (primaryOverlap.length > 0 && primaryOverlap.length === origPrimary.length) {
            score += SCORING_WEIGHTS.PRIMARY_MUSCLE_MATCH;
            preserved.primaryMuscle = true;
        } else if (primaryOverlap.length > 0) {
            score += (SCORING_WEIGHTS.PRIMARY_MUSCLE_MATCH * 0.85);
            preserved.primaryMuscle = true;
            differences.push(`Partial primary muscle overlap (${primaryOverlap.join(', ')} vs ${origPrimary.join(', ')}).`);
        } else {
            differences.push(`Different primary muscles (${candPrimary.join(', ')} vs ${origPrimary.join(', ')}).`);
        }

        // 2. Movement Pattern Match (20 pts)
        const origPattern = original.movementPattern || 'isolation';
        const candPattern = candidate.movementPattern || 'isolation';
        if (origPattern === candPattern) {
            score += SCORING_WEIGHTS.MOVEMENT_PATTERN_MATCH;
            preserved.movementPattern = true;
        } else {
            differences.push(`Different movement pattern (${formatLabel(candPattern)} vs ${formatLabel(origPattern)}).`);
        }

        // 3. Equipment Match (20 pts)
        const origEquip = Array.isArray(original.equipment) ? original.equipment : [];
        const candEquip = Array.isArray(candidate.equipment) ? candidate.equipment : [];
        const equipExact = origEquip.length === candEquip.length && origEquip.every(e => candEquip.includes(e));
        if (equipExact) {
            score += SCORING_WEIGHTS.EQUIPMENT_MATCH;
            preserved.equipment = true;
        } else {
            const hasCommon = origEquip.some(e => candEquip.includes(e));
            if (hasCommon) {
                score += (SCORING_WEIGHTS.EQUIPMENT_MATCH * 0.7);
                preserved.equipment = true;
            } else {
                score += (SCORING_WEIGHTS.EQUIPMENT_MATCH * 0.4); // Feasible equipment from profile
                differences.push(`Equipment changes from ${origEquip.join('/')} to ${candEquip.join('/')}.`);
            }
        }

        // 4. Goal Compatibility (10 pts)
        const profile = request.profile || {};
        const goal = profile.goal || (request.requirements && request.requirements.goal) || 'hypertrophy';
        const origGoals = Array.isArray(original.suitableGoals) ? original.suitableGoals : [];
        const candGoals = Array.isArray(candidate.suitableGoals) ? candidate.suitableGoals : [];
        if (candGoals.includes(goal) || candGoals.length === 0 || origGoals.every(g => candGoals.includes(g))) {
            score += SCORING_WEIGHTS.GOAL_COMPATIBILITY;
            preserved.goal = true;
        } else {
            score += (SCORING_WEIGHTS.GOAL_COMPATIBILITY * 0.5);
        }

        // 5. Secondary Muscle Overlap (8 pts)
        const origSec = Array.isArray(original.secondaryMuscles)
            ? original.secondaryMuscles
            : (original.targetMuscles && Array.isArray(original.targetMuscles.secondary) ? original.targetMuscles.secondary : []);
        const candSec = Array.isArray(candidate.secondaryMuscles)
            ? candidate.secondaryMuscles
            : (candidate.targetMuscles && Array.isArray(candidate.targetMuscles.secondary) ? candidate.targetMuscles.secondary : []);
        const secOverlap = origSec.filter(m => candSec.includes(m));
        if (origSec.length === 0 || secOverlap.length === origSec.length) {
            score += SCORING_WEIGHTS.SECONDARY_MUSCLE_OVERLAP;
        } else if (secOverlap.length > 0) {
            score += (SCORING_WEIGHTS.SECONDARY_MUSCLE_OVERLAP * (secOverlap.length / origSec.length));
        }

        // 6. Progression Compatibility (7 pts)
        const origProg = (original.progressionModel || 'double_progression').toLowerCase();
        const candProg = (candidate.progressionModel || 'double_progression').toLowerCase();
        if (origProg === candProg) {
            score += SCORING_WEIGHTS.PROGRESSION_COMPATIBILITY;
            preserved.progressionModel = true;
        } else {
            score += (SCORING_WEIGHTS.PROGRESSION_COMPATIBILITY * 0.4);
            differences.push(`Progression model shifts from ${formatLabel(origProg)} to ${formatLabel(candProg)}.`);
        }

        // 7. Difficulty Compatibility (4 pts)
        const origDiff = original.difficulty || 'intermediate';
        const candDiff = candidate.difficulty || 'intermediate';
        if (origDiff === candDiff) {
            score += SCORING_WEIGHTS.DIFFICULTY_COMPATIBILITY;
        } else {
            score += (SCORING_WEIGHTS.DIFFICULTY_COMPATIBILITY * 0.5);
            differences.push(`Difficulty shifts from ${formatLabel(origDiff)} to ${formatLabel(candDiff)}.`);
        }

        // 8. Technical Complexity Similarity (3 pts)
        const origComp = typeof original.technicalComplexity === 'number' ? original.technicalComplexity : 2;
        const candComp = typeof candidate.technicalComplexity === 'number' ? candidate.technicalComplexity : 2;
        const compDiff = Math.abs(origComp - candComp);
        if (compDiff === 0) {
            score += SCORING_WEIGHTS.TECHNICAL_COMPLEXITY_SIMILARITY;
        } else if (compDiff === 1) {
            score += (SCORING_WEIGHTS.TECHNICAL_COMPLEXITY_SIMILARITY * 0.6);
        } else {
            differences.push(`Technical complexity difference: ${candComp} vs ${origComp}.`);
        }

        // 9. Fatigue Similarity (2 pts)
        const origFatigue = typeof original.fatigueCost === 'number' ? original.fatigueCost : 2;
        const candFatigue = typeof candidate.fatigueCost === 'number' ? candidate.fatigueCost : 2;
        const fatDiff = Math.abs(origFatigue - candFatigue);
        if (fatDiff === 0) {
            score += SCORING_WEIGHTS.FATIGUE_SIMILARITY;
        } else if (fatDiff === 1) {
            score += (SCORING_WEIGHTS.FATIGUE_SIMILARITY * 0.5);
        } else {
            differences.push(`Fatigue cost difference: ${candFatigue}/5 vs ${origFatigue}/5.`);
        }

        // 10. Stability Demand Similarity (1 pt)
        const origStab = typeof original.stabilityDemand === 'number' ? original.stabilityDemand : (typeof original.stabilityRequirement === 'number' ? original.stabilityRequirement : 2);
        const candStab = typeof candidate.stabilityDemand === 'number' ? candidate.stabilityDemand : (typeof candidate.stabilityRequirement === 'number' ? candidate.stabilityRequirement : 2);
        if (origStab === candStab) {
            score += SCORING_WEIGHTS.STABILITY_SIMILARITY;
        }

        const roundedScore = Math.round(score * 10) / 10;

        return {
            score: roundedScore,
            preservedAttributes: preserved,
            differences
        };
    }

    /**
     * Determines the quality classification for a given substitution score.
     */
    function getQualityClassification(score) {
        if (score >= 85) return SUBSTITUTION_QUALITY.DIRECT;
        if (score >= 70) return SUBSTITUTION_QUALITY.STRONG;
        if (score >= 50) return SUBSTITUTION_QUALITY.ACCEPTABLE;
        if (score > 0) return SUBSTITUTION_QUALITY.LIMITED;
        return SUBSTITUTION_QUALITY.NONE;
    }

    /**
     * Determines confidence level from score and differences.
     */
    function getConfidenceLevel(score, differencesCount) {
        if (score >= 80 && differencesCount <= 2) return CONFIDENCE_LEVELS.HIGH;
        if (score >= 50) return CONFIDENCE_LEVELS.MEDIUM;
        return CONFIDENCE_LEVELS.LOW;
    }

    // ==========================================================================
    // 5. CANDIDATE RETRIEVAL & RANKING API
    // ==========================================================================

    /**
     * Retrieves and ranks all valid substitution candidates for an exercise.
     * 
     * @param {Object} request Normalized substitution request
     * @param {number} [limit=3] Maximum candidates to return (capped at 5)
     * @returns {Object[]} Ranked array of scored candidate objects
     */
    function rankSubstitutionCandidates(request, limit = 3) {
        if (!request || typeof request !== 'object') {
            throw new Error('ExerciseSubstitution: Valid request object is required.');
        }

        const exerciseId = request.exerciseId;
        if (!exerciseId || typeof exerciseId !== 'string') {
            throw new Error('ExerciseSubstitution: Valid exerciseId is required.');
        }

        const db = getDB();
        const original = db.getExerciseById(exerciseId);
        if (!original) {
            throw new Error(`ExerciseSubstitution: Unknown original exercise '${exerciseId}'.`);
        }

        const allExercises = db.getAllExercises();
        const scoredCandidates = [];

        allExercises.forEach(candidate => {
            const hardCheck = passesHardConstraints(candidate, original, request);
            if (hardCheck.passed) {
                const scoring = scoreCandidate(candidate, original, request);
                const quality = getQualityClassification(scoring.score);
                const confidence = getConfidenceLevel(scoring.score, scoring.differences.length);

                scoredCandidates.push({
                    exerciseId: candidate.id,
                    exerciseName: candidate.name || formatLabel(candidate.id),
                    candidateModel: candidate,
                    score: scoring.score,
                    quality,
                    confidence,
                    preservedAttributes: scoring.preservedAttributes,
                    differences: scoring.differences,
                    safetyStatus: 'COMPATIBLE'
                });
            }
        });

        // Deterministic Ranking:
        // 1. Score (descending)
        // 2. Technical Complexity (ascending)
        // 3. Fatigue Cost (ascending)
        // 4. Canonical exerciseId (alphabetical ascending)
        scoredCandidates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const compA = a.candidateModel.technicalComplexity || 2;
            const compB = b.candidateModel.technicalComplexity || 2;
            if (compA !== compB) return compA - compB;
            const fatA = a.candidateModel.fatigueCost || 2;
            const fatB = b.candidateModel.fatigueCost || 2;
            if (fatA !== fatB) return fatA - fatB;
            return a.exerciseId.localeCompare(b.exerciseId);
        });

        const maxLimit = Math.max(1, Math.min(limit, 5));
        return scoredCandidates.slice(0, maxLimit);
    }

    /**
     * Finds the best valid substitution and returns an explainable result object.
     * 
     * @param {Object} request Normalized substitution request
     * @returns {Object} Structured substitution result
     */
    function findBestSubstitution(request) {
        if (!request || typeof request !== 'object') {
            return {
                version: ENGINE_VERSION,
                status: SUBSTITUTION_STATUS.INVALID_REQUEST,
                originalExerciseId: null,
                replacementExerciseId: null,
                quality: SUBSTITUTION_QUALITY.NONE,
                score: 0,
                confidence: CONFIDENCE_LEVELS.LOW,
                preservedAttributes: {},
                differences: [],
                safetyFlags: ['Invalid or missing substitution request.'],
                rationale: 'Substitution request is invalid or missing required parameters.',
                candidateSummary: []
            };
        }

        const exerciseId = request.exerciseId;
        if (!exerciseId || typeof exerciseId !== 'string') {
            return {
                version: ENGINE_VERSION,
                status: SUBSTITUTION_STATUS.INVALID_REQUEST,
                originalExerciseId: null,
                replacementExerciseId: null,
                quality: SUBSTITUTION_QUALITY.NONE,
                score: 0,
                confidence: CONFIDENCE_LEVELS.LOW,
                preservedAttributes: {},
                differences: [],
                safetyFlags: ['Missing canonical exerciseId in request.'],
                rationale: 'No valid canonical exerciseId was provided in substitution request.',
                candidateSummary: []
            };
        }

        const db = getDB();
        const original = db.getExerciseById(exerciseId);
        if (!original) {
            return {
                version: ENGINE_VERSION,
                status: SUBSTITUTION_STATUS.INVALID_REQUEST,
                originalExerciseId: exerciseId,
                replacementExerciseId: null,
                quality: SUBSTITUTION_QUALITY.NONE,
                score: 0,
                confidence: CONFIDENCE_LEVELS.LOW,
                preservedAttributes: {},
                differences: [],
                safetyFlags: [`Exercise '${exerciseId}' not found in canonical exercise database.`],
                rationale: `Original exercise '${exerciseId}' does not exist in the canonical exercise database.`,
                candidateSummary: []
            };
        }

        const rankedCandidates = rankSubstitutionCandidates(request, 5);

        if (rankedCandidates.length === 0) {
            return {
                version: ENGINE_VERSION,
                status: SUBSTITUTION_STATUS.NO_VALID_ALTERNATIVE,
                originalExerciseId: exerciseId,
                replacementExerciseId: null,
                quality: SUBSTITUTION_QUALITY.NONE,
                score: 0,
                confidence: CONFIDENCE_LEVELS.LOW,
                preservedAttributes: {
                    primaryMuscle: false,
                    movementPattern: false,
                    goal: false,
                    equipment: false,
                    progressionModel: false
                },
                differences: [],
                safetyFlags: [],
                rationale: 'No exercise satisfies the required safety, equipment, and training-intent constraints.',
                candidateSummary: []
            };
        }

        const best = rankedCandidates[0];
        const reasonType = request.reason || SUBSTITUTION_REASONS.PREFERENCE;

        // Generate explainable rationale
        const origName = original.name || formatLabel(original.id);
        const replName = best.exerciseName || formatLabel(best.exerciseId);
        const origPattern = formatLabel(original.movementPattern || 'movement');
        const primMuscles = ((original.targetMuscles && original.targetMuscles.primary) || []).join(', ');

        let rationale = `Replacing ${origName} with ${replName} (${best.quality} alternative, score ${best.score}/100). `;
        if (reasonType === SUBSTITUTION_REASONS.EQUIPMENT_UNAVAILABLE) {
            rationale += `Preserves the ${origPattern} pattern for ${primMuscles} while utilizing your available equipment.`;
        } else if (reasonType === SUBSTITUTION_REASONS.INJURY) {
            rationale += `Compatible with recorded movement restrictions while maintaining primary target work for ${primMuscles}.`;
        } else {
            rationale += `Preserves training intent across primary muscles (${primMuscles}) and ${origPattern} pattern.`;
        }

        const candidateSummary = rankedCandidates.map(c => ({
            exerciseId: c.exerciseId,
            exerciseName: c.exerciseName,
            score: c.score,
            quality: c.quality,
            confidence: c.confidence,
            preservedAttributes: c.preservedAttributes,
            differences: c.differences,
            safetyStatus: c.safetyStatus
        }));

        return {
            version: ENGINE_VERSION,
            status: SUBSTITUTION_STATUS.FOUND,
            originalExerciseId: exerciseId,
            replacementExerciseId: best.exerciseId,
            quality: best.quality,
            score: best.score,
            confidence: best.confidence,
            preservedAttributes: best.preservedAttributes,
            differences: best.differences,
            safetyFlags: [],
            rationale,
            candidateSummary
        };
    }

    // ==========================================================================
    // 6. VALIDATION & SNAPSHOT API
    // ==========================================================================

    /**
     * Validates that a substitution result satisfies all domain and safety invariants.
     * 
     * @param {Object} result 
     * @param {Object} request 
     * @returns {{valid: boolean, errors: string[]}}
     */
    function validateSubstitution(result, request) {
        const errors = [];
        if (!result || typeof result !== 'object') {
            return { valid: false, errors: ['Substitution result must be a non-null object.'] };
        }

        if (!result.status || !Object.values(SUBSTITUTION_STATUS).includes(result.status)) {
            errors.push(`Invalid substitution status: '${result.status}'.`);
        }

        if (result.status === SUBSTITUTION_STATUS.FOUND) {
            if (!result.originalExerciseId || typeof result.originalExerciseId !== 'string') {
                errors.push('Missing valid originalExerciseId.');
            }
            if (!result.replacementExerciseId || typeof result.replacementExerciseId !== 'string') {
                errors.push('Missing valid replacementExerciseId.');
            } else if (result.originalExerciseId === result.replacementExerciseId) {
                errors.push('Replacement exercise cannot be identical to original exercise.');
            }

            const db = getDB();
            const orig = db.getExerciseById(result.originalExerciseId);
            const repl = db.getExerciseById(result.replacementExerciseId);

            if (!orig) {
                errors.push(`Original exercise '${result.originalExerciseId}' is not canonical.`);
            }
            if (!repl) {
                errors.push(`Replacement exercise '${result.replacementExerciseId}' is not canonical.`);
            }

            if (!result.quality || !Object.values(SUBSTITUTION_QUALITY).includes(result.quality)) {
                errors.push(`Invalid quality rating: '${result.quality}'.`);
            }

            if (typeof result.score !== 'number' || isNaN(result.score) || result.score < 0 || result.score > 100) {
                errors.push(`Invalid score (${result.score}). Must be numeric between 0 and 100.`);
            }

            if (!result.confidence || !Object.values(CONFIDENCE_LEVELS).includes(result.confidence)) {
                errors.push(`Invalid confidence rating: '${result.confidence}'.`);
            }

            if (!result.rationale || typeof result.rationale !== 'string' || result.rationale.trim() === '') {
                errors.push('Substitution result must contain a non-empty rationale string.');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Produces a deterministic JSON snapshot of a substitution result.
     */
    function getDeterministicSubstitutionSnapshot(result) {
        if (!result || typeof result !== 'object') return '{}';
        const clone = deepClone(result);
        return JSON.stringify(clone);
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        SUBSTITUTION_STATUS,
        SUBSTITUTION_REASONS,
        SUBSTITUTION_QUALITY,
        CONFIDENCE_LEVELS,
        SCORING_WEIGHTS,
        rankSubstitutionCandidates,
        findBestSubstitution,
        validateSubstitution,
        getDeterministicSubstitutionSnapshot,
        _internals: {
            deepClone,
            formatLabel,
            isExerciseAllowedForInjuries,
            passesHardConstraints,
            scoreCandidate,
            getQualityClassification,
            getConfidenceLevel
        }
    };
}));
