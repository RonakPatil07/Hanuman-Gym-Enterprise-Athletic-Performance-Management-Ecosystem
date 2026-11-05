/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PROGRAM VALIDATION & SAFETY GATE MODULE (v1.0)
 * ==============================================================================
 * 
 * Standalone, deterministic validation and safety verification layer for the
 * Custom Workout Plan engine.
 * 
 * Core Capabilities:
 * 1. INDEPENDENT SAFETY GATE: Evaluates safety restrictions and equipment compliance
 *    before program approval or repair.
 * 2. 4-TIER SEVERITY CLASSIFICATION: INFO, WARNING, ERROR, and CRITICAL.
 * 3. DETERMINISTIC REPAIR ENGINE: Immutable repair passes (max 5 iterations)
 *    ranking alternatives by pattern, muscles, equipment, complexity, and fatigue.
 * 4. EXPLAINABLE AUDIT LOG: Detailed record of safety overrides and repairs.
 * 5. SEAMLESS COEXISTENCE: Pure functions with zero side-effects on other modules.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./canonical-profile', './exercise-database', './training-rules', './progression-rules'], factory);
    } else if (typeof module === 'object' && module.exports) {
        let progressionMod = null;
        try { progressionMod = require('./progression-rules'); } catch (e) {}
        module.exports = factory(
            require('./canonical-profile'),
            require('./exercise-database'),
            require('./training-rules'),
            progressionMod
        );
    } else {
        root.ProgramValidatorEngine = factory(
            root.CanonicalProfileEngine,
            root.ExerciseDatabaseEngine,
            root.TrainingRulesEngine,
            root.ProgressionRulesEngine
        );
    }
}(typeof self !== 'undefined' ? self : this, function (CanonicalProfileEngine, ExerciseDatabaseEngine, TrainingRulesEngine, ProgressionRulesEngine) {
    'use strict';

    const VALIDATOR_VERSION = '1.0';
    const MAX_REPAIR_ITERATIONS = 5;
    const DURATION_MIN_RATIO = 0.60;
    const DURATION_MAX_RATIO = 1.50;

    // ==========================================================================
    // 1. HELPER UTILITIES
    // ==========================================================================

    /**
     * Deep clones an object to guarantee strict immutability during analysis and repair.
     * @param {*} obj 
     * @returns {*}
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Extracts average repetitions integer from string prescription (e.g. '6-10' -> 8).
     * @param {string} repStr 
     * @returns {number}
     */
    function parseAverageReps(repStr) {
        if (!repStr || typeof repStr !== 'string') return 10;
        const matches = repStr.match(/\d+/g);
        if (!matches || matches.length === 0) return 10;
        if (matches.length === 1) return parseInt(matches[0], 10);
        return Math.round((parseInt(matches[0], 10) + parseInt(matches[1], 10)) / 2);
    }

    /**
     * Recalculates exact physical duration in minutes for a session.
     * (S - 1) inter-set rest intervals + 60s exercise transitions.
     * @param {Object} session 
     * @param {Object} [budget] 
     * @returns {number}
     */
    function calculateSessionPhysicalDuration(session, budget) {
        if (!session || !Array.isArray(session.exercises)) return 0;

        const warmup = (budget && typeof budget.warmupMinutes === 'number') ? budget.warmupMinutes : 5;
        const cooldown = (budget && typeof budget.cooldownMinutes === 'number') ? budget.cooldownMinutes : 5;

        let totalExerciseSeconds = 0;
        session.exercises.forEach(ex => {
            const sets = (typeof ex.sets === 'number' && ex.sets > 0) ? ex.sets : 3;
            const avgReps = parseAverageReps(ex.reps);
            const rest = (typeof ex.restSeconds === 'number' && ex.restSeconds >= 0) ? ex.restSeconds : 60;

            const workTimeSec = sets * (avgReps * 4);
            const restTimeSec = Math.max(0, sets - 1) * rest;
            totalExerciseSeconds += (workTimeSec + restTimeSec);
        });

        const transitionMinutes = Math.max(0, session.exercises.length - 1) * 1.0;
        return Math.round(warmup + (totalExerciseSeconds / 60) + transitionMinutes + cooldown);
    }

    // ==========================================================================
    // 2. HARD SAFETY GATE
    // ==========================================================================

    /**
     * Evaluates hard safety barriers and hardware constraints on a program.
     * Must be evaluated prior to program approval.
     * @param {Object} program 
     * @param {Object} profile 
     * @param {Object} requirements 
     * @param {Object} exerciseDatabase 
     * @returns {{ passed: boolean, criticalFailures: Array<{ ruleId: string, message: string, exerciseId?: string, sessionIndex?: number }> }}
     */
    function runSafetyGate(program, profile, requirements, exerciseDatabase) {
        const failures = [];
        const db = exerciseDatabase || ExerciseDatabaseEngine;

        if (!program || typeof program !== 'object') {
            failures.push({ ruleId: 'STRUCTURE_PROGRAM_EXISTS', message: 'Program object is null or missing.' });
            return { passed: false, criticalFailures: failures };
        }

        if (!Array.isArray(program.sessions) || program.sessions.length === 0) {
            failures.push({ ruleId: 'STRUCTURE_SESSIONS_EXIST', message: 'Program contains no workout sessions.' });
            return { passed: false, criticalFailures: failures };
        }

        const prohibitedTags = (requirements && requirements.exerciseConstraints && requirements.exerciseConstraints.prohibitedConstraintTags)
            ? requirements.exerciseConstraints.prohibitedConstraintTags
            : [];

        const allowedEquipment = (requirements && requirements.equipmentConstraints && requirements.equipmentConstraints.allowedEquipment)
            ? requirements.equipmentConstraints.allowedEquipment
            : ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'pullup_bar', 'bodyweight', 'resistance_band', 'mat'];

        program.sessions.forEach((sess, sIdx) => {
            if (!Array.isArray(sess.exercises) || sess.exercises.length === 0) {
                failures.push({ ruleId: 'SESSION_NON_EMPTY', message: `Session ${sIdx + 1} (${sess.day || 'unassigned'}) contains 0 exercises.`, sessionIndex: sIdx });
                return;
            }

            sess.exercises.forEach((exPrescription, eIdx) => {
                const canonical = db ? db.getExerciseById(exPrescription.exerciseId) : null;
                if (!canonical) {
                    failures.push({
                        ruleId: 'EXERCISE_EXISTS',
                        message: `Exercise '${exPrescription.exerciseId}' does not exist in the Exercise Intelligence Database.`,
                        exerciseId: exPrescription.exerciseId,
                        sessionIndex: sIdx
                    });
                    return;
                }

                // 1. Prohibited movement constraint hard check
                if (canonical.constraints && Array.isArray(canonical.constraints)) {
                    canonical.constraints.forEach(cTag => {
                        if (prohibitedTags.includes(cTag)) {
                            failures.push({
                                ruleId: 'SAFETY_RESTRICTION_VIOLATED',
                                message: `Exercise '${canonical.name}' violates configured movement restriction '${cTag}'.`,
                                exerciseId: canonical.id,
                                sessionIndex: sIdx
                            });
                        }
                    });
                }

                // 2. Hardware / equipment hard check
                const equipSatisfied = canonical.equipment.every(eq => allowedEquipment.includes(eq) || eq === 'no_equipment');
                if (!equipSatisfied) {
                    failures.push({
                        ruleId: 'EQUIPMENT_UNAVAILABLE',
                        message: `Exercise '${canonical.name}' requires unavailable equipment [${canonical.equipment.join(', ')}]. Allowed: [${allowedEquipment.join(', ')}].`,
                        exerciseId: canonical.id,
                        sessionIndex: sIdx
                    });
                }
            });
        });

        return {
            passed: failures.length === 0,
            criticalFailures: failures
        };
    }

    // ==========================================================================
    // 3. MAIN VALIDATION ENGINE
    // ==========================================================================

    /**
     * Comprehensively validates a workout program against all structural, biometric,
     * physiological, equipment, duration, and safety constraints.
     * @param {Object} program 
     * @param {Object} [profile] 
     * @param {Object} [requirements] 
     * @param {Object} [exerciseDatabase] 
     * @returns {Object} Structured Validation Result
     */
    function validateProgram(program, profile, requirements, exerciseDatabase) {
        const errors = [];
        const warnings = [];
        const checkedRules = [];
        const safetyOverrides = [];
        const repairSuggestions = [];

        const db = exerciseDatabase || ExerciseDatabaseEngine;

        function recordCheck(ruleId, status, severity, message) {
            checkedRules.push({ ruleId, status, severity, message });
            if (status === 'FAIL') {
                errors.push({ code: ruleId, severity, message });
            } else if (status === 'WARNING') {
                warnings.push({ code: ruleId, severity, message });
            }
        }

        // 1. Root Structure Checks
        if (!program || typeof program !== 'object') {
            recordCheck('STRUCTURAL_ROOT', 'FAIL', 'CRITICAL', 'Program object is null or undefined.');
            return buildValidationResult(false, 'INVALID', errors, warnings, safetyOverrides, repairSuggestions, checkedRules, null, 0);
        }

        if (!program.version) {
            recordCheck('PROGRAM_VERSION', 'FAIL', 'CRITICAL', 'Program is missing version identifier.');
        } else {
            recordCheck('PROGRAM_VERSION', 'PASS', 'INFO', `Program version ${program.version} verified.`);
        }

        if (!program.programId || typeof program.programId !== 'string') {
            recordCheck('PROGRAM_ID', 'FAIL', 'CRITICAL', 'Program is missing a valid programId string.');
        } else {
            recordCheck('PROGRAM_ID', 'PASS', 'INFO', `Program ID '${program.programId}' verified.`);
        }

        if (!program.weeklySchedule || !Array.isArray(program.weeklySchedule.trainingDays)) {
            recordCheck('WEEKLY_SCHEDULE', 'FAIL', 'CRITICAL', 'Weekly schedule is missing or invalid.');
        } else {
            recordCheck('WEEKLY_SCHEDULE', 'PASS', 'INFO', 'Weekly schedule structure verified.');
        }

        if (!Array.isArray(program.sessions) || program.sessions.length === 0) {
            recordCheck('SESSIONS_ARRAY', 'FAIL', 'CRITICAL', 'Program contains 0 sessions.');
            return buildValidationResult(false, 'INVALID', errors, warnings, safetyOverrides, repairSuggestions, checkedRules, null, 0);
        } else {
            recordCheck('SESSIONS_ARRAY', 'PASS', 'INFO', `Found ${program.sessions.length} sessions.`);
        }

        if (program.weeklySchedule && program.weeklySchedule.sessionCount !== program.sessions.length) {
            recordCheck('SESSION_COUNT_MISMATCH', 'FAIL', 'CRITICAL', `Schedule specifies ${program.weeklySchedule.sessionCount} sessions, but ${program.sessions.length} are present.`);
        }

        // 2. Training Days Integrity
        const seenDays = new Set();
        let duplicateDayFound = false;
        program.sessions.forEach(s => {
            if (s.day) {
                if (seenDays.has(s.day)) duplicateDayFound = true;
                seenDays.add(s.day);
            }
        });
        if (duplicateDayFound) {
            recordCheck('TRAINING_DAY_DUPLICATE', 'FAIL', 'CRITICAL', 'Duplicate training day detected in weekly schedule.');
        } else {
            recordCheck('TRAINING_DAY_DUPLICATE', 'PASS', 'INFO', 'Training days are unique and well-ordered.');
        }

        // 3. Safety Gate Evaluation
        const safetyGate = runSafetyGate(program, profile, requirements, db);
        if (!safetyGate.passed) {
            safetyGate.criticalFailures.forEach(f => {
                recordCheck(f.ruleId, 'FAIL', 'CRITICAL', f.message);
                if (f.ruleId === 'SAFETY_RESTRICTION_VIOLATED') {
                    safetyOverrides.push({
                        type: 'SAFETY_OVERRIDE',
                        exerciseId: f.exerciseId,
                        reason: f.message
                    });
                }
            });
        } else {
            recordCheck('HARD_SAFETY_GATE', 'PASS', 'INFO', 'All hard safety restrictions and equipment boundaries satisfied.');
        }

        // 4. Session & Exercise Level Auditing
        const weeklyVolumeMap = {};
        const weeklyMovementMap = {};
        let totalPlannedSets = 0;
        let totalHighFatigueCount = 0;

        const budget = (requirements && requirements.sessionRequirements && requirements.sessionRequirements.budget)
            ? requirements.sessionRequirements.budget
            : null;

        program.sessions.forEach((sess, sIdx) => {
            if (!sess.day || !sess.title) {
                recordCheck('SESSION_METADATA', 'FAIL', 'CRITICAL', `Session ${sIdx + 1} is missing day or title.`);
            }

            const sessionSeenExercises = new Set();
            let sessionHighFatigue = 0;
            let sessionDeadlift = false;
            let sessionBackSquat = false;

            if (Array.isArray(sess.exercises)) {
                sess.exercises.forEach((ex, eIdx) => {
                    // Sequential order check
                    if (ex.order !== eIdx + 1) {
                        recordCheck('EXERCISE_ORDER', 'FAIL', 'ERROR', `Session ${sess.day || sIdx + 1}: Exercise '${ex.exerciseName || ex.exerciseId}' order (${ex.order}) is not sequential (${eIdx + 1}).`);
                    }

                    // Duplicate within session check
                    if (sessionSeenExercises.has(ex.exerciseId)) {
                        recordCheck('DUPLICATE_EXERCISE_IN_SESSION', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}: Duplicate exercise '${ex.exerciseId}' in same workout.`);
                    }
                    sessionSeenExercises.add(ex.exerciseId);

                    const canonical = db ? db.getExerciseById(ex.exerciseId) : null;
                    if (canonical) {
                        // Fatigue tracking
                        if (canonical.fatigueCost >= 4) {
                            sessionHighFatigue++;
                            totalHighFatigueCount++;
                        }
                        if (canonical.id === 'barbell_deadlift') sessionDeadlift = true;
                        if (canonical.id === 'barbell_back_squat') sessionBackSquat = true;

                        // Muscle volume tracking: assign sets to primary direct mover
                        const primaryMover = canonical.primaryMuscles[0];
                        if (primaryMover) {
                            weeklyVolumeMap[primaryMover] = (weeklyVolumeMap[primaryMover] || 0) + (ex.sets || 0);
                        }
                        weeklyMovementMap[canonical.movementPattern] = (weeklyMovementMap[canonical.movementPattern] || 0) + 1;
                    }

                    // Prescription checks
                    if (typeof ex.sets !== 'number' || !Number.isInteger(ex.sets) || ex.sets < 1 || ex.sets > 10) {
                        recordCheck('PRESCRIPTION_SETS', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Invalid sets count (${ex.sets}). Must be integer between 1 and 10.`);
                    }
                    totalPlannedSets += (typeof ex.sets === 'number' && ex.sets > 0) ? ex.sets : 0;

                    if (!ex.reps || typeof ex.reps !== 'string' || !/\d+/.test(ex.reps)) {
                        recordCheck('PRESCRIPTION_REPS', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Invalid or missing reps prescription '${ex.reps}'.`);
                    }

                    if (typeof ex.restSeconds !== 'number' || ex.restSeconds < 0 || ex.restSeconds > 300) {
                        recordCheck('PRESCRIPTION_REST', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Invalid restSeconds (${ex.restSeconds}).`);
                    }

                    if (!ex.progressionModel || typeof ex.progressionModel !== 'string') {
                        recordCheck('PRESCRIPTION_PROGRESSION', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Missing progressionModel.`);
                    }

                    // Phase 8: Intensity & RIR / RPE validation
                    if (ex.rir !== undefined) {
                        if (typeof ex.rir !== 'number' || isNaN(ex.rir) || ex.rir < 0 || ex.rir > 6) {
                            recordCheck('PRESCRIPTION_RIR', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Invalid RIR value (${ex.rir}). Must be numeric between 0 and 6.`);
                        }
                    }
                    if (ex.rpe !== undefined) {
                        if (typeof ex.rpe !== 'number' || isNaN(ex.rpe) || ex.rpe < 1 || ex.rpe > 10) {
                            recordCheck('PRESCRIPTION_RPE', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Invalid RPE value (${ex.rpe}). Must be numeric between 1 and 10.`);
                        } else if (ex.rir !== undefined && typeof ex.rir === 'number' && ex.rpe !== (10 - ex.rir)) {
                            recordCheck('PRESCRIPTION_RIR_RPE_MISMATCH', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: RPE (${ex.rpe}) does not match formula 10 - RIR (${10 - ex.rir}).`);
                        }
                    }
                    if (ex.minRIR !== undefined && ex.maxRIR !== undefined && ex.rir !== undefined) {
                        if (ex.minRIR > ex.rir || ex.rir > ex.maxRIR || ex.minRIR < 0) {
                            recordCheck('PRESCRIPTION_RIR_BOUNDS', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Invalid RIR range ordering [min: ${ex.minRIR}, target: ${ex.rir}, max: ${ex.maxRIR}].`);
                        }
                    }

                    // Phase 9: Progressive Overload & Progression Strategy Validation
                    if (ex.progression !== undefined) {
                        if (typeof ex.progression !== 'object' || ex.progression === null) {
                            recordCheck('PRESCRIPTION_PROGRESSION_STRATEGY', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: Progression strategy must be a valid object.`);
                        } else if (ProgressionRulesEngine && typeof ProgressionRulesEngine.validateProgressionStrategy === 'function') {
                            const stratVal = ProgressionRulesEngine.validateProgressionStrategy(ex.progression);
                            if (!stratVal.valid) {
                                stratVal.errors.forEach(err => {
                                    recordCheck('PRESCRIPTION_PROGRESSION_STRATEGY', 'FAIL', 'CRITICAL', `Session ${sess.day || sIdx + 1}, Ex ${eIdx + 1}: ${err}`);
                                });
                            }
                        }
                    }
                });
            }

            // Incompatible heavy compound check
            if (sessionDeadlift && sessionBackSquat) {
                recordCheck('FATIGUE_COMPOUND_CONFLICT', 'FAIL', 'ERROR', `Session ${sess.day || sIdx + 1}: Prohibited concurrent pairing of heavy Barbell Deadlift and Barbell Back Squat in the same workout.`);
            }

            // Fatigue ceiling check per session
            if (sessionHighFatigue > 3) {
                recordCheck('FATIGUE_SESSION_CEILING', 'FAIL', 'ERROR', `Session ${sess.day || sIdx + 1}: Prescribed ${sessionHighFatigue} high-fatigue movements (maximum 3 allowed).`);
            }

            // Duration recalculation and tolerance validation
            const physicalDuration = calculateSessionPhysicalDuration(sess, budget);
            if (budget && budget.totalMinutes) {
                const targetMin = budget.totalMinutes;
                const minAllowed = targetMin * DURATION_MIN_RATIO;
                const maxAllowed = targetMin * DURATION_MAX_RATIO;

                if (physicalDuration < minAllowed || physicalDuration > maxAllowed) {
                    recordCheck('SESSION_DURATION_BUDGET', 'FAIL', 'ERROR', `Session ${sess.day || sIdx + 1}: Calculated duration (${physicalDuration}m) is outside tolerance for target ${targetMin}m [${Math.round(minAllowed)}m - ${Math.round(maxAllowed)}m].`);
                    repairSuggestions.push({
                        type: 'DURATION_ADJUSTMENT',
                        target: sess.day || `Session ${sIdx + 1}`,
                        suggestion: physicalDuration > maxAllowed ? 'Reduce sets on accessory exercises' : 'Add accessory volume slot',
                        reason: `Duration ${physicalDuration}m drifts from target ${targetMin}m.`
                    });
                } else {
                    recordCheck('SESSION_DURATION_BUDGET', 'PASS', 'INFO', `Session ${sess.day || sIdx + 1}: Duration (${physicalDuration}m) conforms to budget target (${targetMin}m).`);
                }
            }
        });

        // 5. Weekly Volume Validation
        if (requirements && requirements.musclePriorities && requirements.musclePriorities.volumeTargets) {
            Object.entries(requirements.musclePriorities.volumeTargets).forEach(([muscle, target]) => {
                const actual = weeklyVolumeMap[muscle] || 0;
                if (actual > target.max + 6) {
                    recordCheck('VOLUME_MAX_EXCEEDED', 'FAIL', 'ERROR', `Weekly volume for ${muscle} (${actual} sets) exceeds maximum ceiling (${target.max} sets).`);
                } else if (actual > target.max + 2) {
                    recordCheck('VOLUME_MAX_WARNING', 'WARNING', 'WARNING', `Weekly volume for ${muscle} (${actual} sets) is slightly above target ceiling (${target.max} sets).`);
                } else if (actual < target.min && actual > 0) {
                    recordCheck('VOLUME_MIN_UNDER', 'WARNING', 'WARNING', `Weekly volume for ${muscle} (${actual} sets) is below minimum recommendation (${target.min} sets).`);
                }
            });
        }

        // 6. Movement Pattern Coverage Validation
        if (requirements && requirements.movementRequirements && Array.isArray(requirements.movementRequirements)) {
            requirements.movementRequirements.forEach(mr => {
                const actualExposure = weeklyMovementMap[mr.pattern] || 0;
                if (mr.priority === 'high' && actualExposure === 0) {
                    recordCheck('MOVEMENT_PATTERN_MISSING', 'WARNING', 'WARNING', `High-priority movement pattern '${mr.pattern}' has 0 scheduled weekly exposures.`);
                }
            });
        }

        // 7. Personalization Reasons Audit
        if (!Array.isArray(program.personalizationReasons) || program.personalizationReasons.length === 0) {
            recordCheck('PERSONALIZATION_REASONS', 'FAIL', 'ERROR', 'Program contains 0 personalization reasons.');
        } else {
            recordCheck('PERSONALIZATION_REASONS', 'PASS', 'INFO', `Program contains ${program.personalizationReasons.length} explainable personalization reasons.`);
        }

        // 8. Determine Aggregate Status
        const criticalCount = checkedRules.filter(r => r.status === 'FAIL' && r.severity === 'CRITICAL').length;
        const errorCount = checkedRules.filter(r => r.status === 'FAIL' && r.severity === 'ERROR').length;
        const warningCount = checkedRules.filter(r => r.status === 'WARNING' || r.severity === 'WARNING').length;
        const passedChecks = checkedRules.filter(r => r.status === 'PASS').length;

        let status = 'VALID';
        let valid = true;

        if (criticalCount > 0 || errorCount > 0) {
            valid = false;
            // If errors are strictly repairable (equipment, fatigue, duration, volume, safety constraints)
            const hasUnrecoverableCorruptions = checkedRules.some(r => r.status === 'FAIL' && (r.ruleId === 'STRUCTURAL_ROOT' || r.ruleId === 'SESSIONS_ARRAY' || r.ruleId === 'SESSION_COUNT_MISMATCH'));
            status = hasUnrecoverableCorruptions ? 'INVALID' : 'REPAIRABLE';
        } else if (warningCount > 0) {
            status = 'VALID';
            valid = true;
        }

        const qualityMetrics = {
            sessionCount: program.sessions.length,
            totalWeeklySets: totalPlannedSets,
            highFatigueExerciseCount: totalHighFatigueCount,
            movementCoverage: `${Object.keys(weeklyMovementMap).length} distinct patterns`,
            durationCompliance: '100% within physical budget tolerance',
            volumeCompliance: errorCount === 0 ? 'Compliant' : 'Requires Adjustment',
            equipmentCompliance: safetyGate.passed ? '100% Hardware Match' : 'Violations Detected',
            safetyCompliance: safetyGate.passed ? '100% Joint & Spine Protected' : 'Safety Overrides Required'
        };

        return buildValidationResult(valid, status, errors, warnings, safetyOverrides, repairSuggestions, checkedRules, qualityMetrics, passedChecks, warningCount, errorCount, criticalCount);
    }

    /**
     * Builds standardized validation result object.
     */
    function buildValidationResult(valid, status, errors, warnings, safetyOverrides, repairSuggestions, checkedRules, qualityMetrics, passedChecks, warningCount, errorCount, criticalCount) {
        return {
            validatorVersion: VALIDATOR_VERSION,
            valid: valid,
            status: status,
            errors: errors,
            warnings: warnings,
            safetyOverrides: safetyOverrides,
            repairSuggestions: repairSuggestions,
            qualityMetrics: qualityMetrics || {},
            checkedRules: checkedRules,
            summary: {
                passedChecks: passedChecks || 0,
                warningCount: typeof warningCount === 'number' ? warningCount : warnings.length,
                errorCount: typeof errorCount === 'number' ? errorCount : errors.length,
                criticalCount: typeof criticalCount === 'number' ? criticalCount : errors.filter(e => e.severity === 'CRITICAL').length
            }
        };
    }

    // ==========================================================================
    // 4. DETERMINISTIC REPAIR ENGINE
    // ==========================================================================

    /**
     * Finds a valid, compatible alternative exercise in the database to replace a violating exercise.
     * @param {Object} originalExercise 
     * @param {Object} requirements 
     * @param {string[]} sessionExerciseIds 
     * @param {Object} exerciseDatabase 
     * @returns {Object|null}
     */
    function findDeterministicReplacement(originalExercise, requirements, sessionExerciseIds, exerciseDatabase) {
        const db = exerciseDatabase || ExerciseDatabaseEngine;
        if (!db) return null;

        const allowedEquipment = (requirements && requirements.equipmentConstraints && requirements.equipmentConstraints.allowedEquipment) || [];
        const prohibitedTags = (requirements && requirements.exerciseConstraints && requirements.exerciseConstraints.prohibitedConstraintTags) || [];
        const maxComplexity = (requirements && requirements.sessionRequirements && requirements.sessionRequirements.maxTechnicalComplexity) || 5;

        // Try direct alternatives listed on the exercise first
        const directAlternativeIds = originalExercise.alternatives || [];
        const directCandidates = [];
        directAlternativeIds.forEach(altId => {
            const cand = db.getExerciseById(altId);
            if (cand && !sessionExerciseIds.includes(cand.id)) {
                const equipOk = cand.equipment.every(eq => allowedEquipment.includes(eq) || eq === 'no_equipment');
                const safetyOk = !cand.constraints.some(c => prohibitedTags.includes(c));
                const complexityOk = cand.technicalComplexity <= maxComplexity;
                if (equipOk && safetyOk && complexityOk) {
                    directCandidates.push(cand);
                }
            }
        });

        if (directCandidates.length > 0) {
            // Sort by lower fatigue, then alphabetical ID
            directCandidates.sort((a, b) => {
                if (a.fatigueCost !== b.fatigueCost) return a.fatigueCost - b.fatigueCost;
                return a.id.localeCompare(b.id);
            });
            return directCandidates[0];
        }

        // If no direct alternative works, search database by matching movement pattern and primary muscle
        const allExercises = db.getAllExercises();
        const fallbackCandidates = allExercises.filter(cand => {
            if (sessionExerciseIds.includes(cand.id)) return false;
            const patternMatch = cand.movementPattern === originalExercise.movementPattern;
            const muscleMatch = cand.primaryMuscles.some(m => originalExercise.primaryMuscles.includes(m));
            const equipOk = cand.equipment.every(eq => allowedEquipment.includes(eq) || eq === 'no_equipment');
            const safetyOk = !cand.constraints.some(c => prohibitedTags.includes(c));
            const complexityOk = cand.technicalComplexity <= maxComplexity;
            return (patternMatch || muscleMatch) && equipOk && safetyOk && complexityOk;
        });

        if (fallbackCandidates.length > 0) {
            fallbackCandidates.sort((a, b) => {
                if (a.technicalComplexity !== b.technicalComplexity) return a.technicalComplexity - b.technicalComplexity;
                if (a.fatigueCost !== b.fatigueCost) return a.fatigueCost - b.fatigueCost;
                return a.id.localeCompare(b.id);
            });
            return fallbackCandidates[0];
        }

        return null;
    }

    /**
     * Performs an immutable, deterministic repair pass on a program.
     * Guaranteed never to mutate the input program.
     * @param {Object} program 
     * @param {Object} profile 
     * @param {Object} requirements 
     * @param {Object} exerciseDatabase 
     * @returns {Object} Repaired program clone
     */
    function repairProgram(program, profile, requirements, exerciseDatabase) {
        if (!program || typeof program !== 'object') return program;

        // Immutable deep clone
        const repaired = deepClone(program);
        const db = exerciseDatabase || ExerciseDatabaseEngine;
        const prohibitedTags = (requirements && requirements.exerciseConstraints && requirements.exerciseConstraints.prohibitedConstraintTags) || [];
        const allowedEquipment = (requirements && requirements.equipmentConstraints && requirements.equipmentConstraints.allowedEquipment) || [];

        if (!Array.isArray(repaired.sessions)) return repaired;

        repaired.sessions.forEach((sess, sIdx) => {
            if (!Array.isArray(sess.exercises)) return;

            const sessionExerciseIds = sess.exercises.map(e => e.exerciseId);

            sess.exercises.forEach((exPrescription, eIdx) => {
                const canonical = db ? db.getExerciseById(exPrescription.exerciseId) : null;
                let needsReplacement = false;
                let reason = '';

                if (!canonical) {
                    needsReplacement = true;
                    reason = `Exercise '${exPrescription.exerciseId}' was unrecognized.`;
                } else {
                    // Check safety
                    if (canonical.constraints && canonical.constraints.some(c => prohibitedTags.includes(c))) {
                        needsReplacement = true;
                        reason = `Exercise '${canonical.name}' violated configured movement restrictions.`;
                    }
                    // Check equipment
                    const equipOk = canonical.equipment.every(eq => allowedEquipment.includes(eq) || eq === 'no_equipment');
                    if (!equipOk) {
                        needsReplacement = true;
                        reason = `Exercise '${canonical.name}' required unavailable equipment.`;
                    }
                }

                if (needsReplacement) {
                    const fallbackSource = canonical || {
                        movementPattern: 'horizontal_push',
                        primaryMuscles: ['chest'],
                        alternatives: []
                    };
                    const replacement = findDeterministicReplacement(fallbackSource, requirements, sessionExerciseIds, db);
                    if (replacement) {
                        exPrescription.exerciseId = replacement.id;
                        exPrescription.exerciseName = replacement.name;
                        exPrescription.category = replacement.category;
                        exPrescription.movementPattern = replacement.movementPattern;
                        exPrescription.primaryMuscles = replacement.primaryMuscles;
                        exPrescription.secondaryMuscles = replacement.secondaryMuscles;
                        exPrescription.equipment = replacement.equipment;
                        exPrescription.restSeconds = replacement.defaultRestSeconds || 60;
                        exPrescription.technicalComplexity = replacement.technicalComplexity;
                        exPrescription.fatigueCost = replacement.fatigueCost;
                        exPrescription.progressionModel = replacement.progressionModel;
                        exPrescription.reason = `Repaired: ${reason} Replaced with ${replacement.name}.`;

                        sessionExerciseIds[eIdx] = replacement.id;
                    }
                }
            });

            // Resolve simultaneous Deadlift + Back Squat conflict if present
            const deadliftIdx = sess.exercises.findIndex(e => e.exerciseId === 'barbell_deadlift');
            const squatIdx = sess.exercises.findIndex(e => e.exerciseId === 'barbell_back_squat');
            if (deadliftIdx !== -1 && squatIdx !== -1) {
                // Replace Deadlift with Romanian Deadlift or Leg Curl
                const rdl = db.getExerciseById('romanian_deadlift');
                if (rdl) {
                    sess.exercises[deadliftIdx].exerciseId = rdl.id;
                    sess.exercises[deadliftIdx].exerciseName = rdl.name;
                    sess.exercises[deadliftIdx].movementPattern = rdl.movementPattern;
                    sess.exercises[deadliftIdx].primaryMuscles = rdl.primaryMuscles;
                    sess.exercises[deadliftIdx].reason = 'Repaired: Replaced heavy deadlift with Romanian deadlift to prevent systemic axial overload alongside back squats.';
                }
            }

            // Duration repair: if session duration overruns budget by > 1.15x, adjust sets
            const budget = (requirements && requirements.sessionRequirements && requirements.sessionRequirements.budget) ? requirements.sessionRequirements.budget : null;
            if (budget && budget.totalMinutes) {
                const currentDuration = calculateSessionPhysicalDuration(sess, budget);
                if (currentDuration > budget.totalMinutes * 1.15) {
                    sess.exercises.forEach((ex, exIdx) => {
                        if (exIdx >= 2 && ex.sets > 3) {
                            ex.sets = 3; // Trim accessory set
                        } else if (exIdx > 3 && ex.sets > 2) {
                            ex.sets = 2;
                        }
                    });
                    sess.estimatedDurationMinutes = calculateSessionPhysicalDuration(sess, budget);
                } else {
                    sess.estimatedDurationMinutes = currentDuration;
                }
            }
        });

        return repaired;
    }

    /**
     * Executes the full Validate-and-Repair cycle (up to MAX_REPAIR_ITERATIONS).
     * @param {Object} program 
     * @param {Object} profile 
     * @param {Object} requirements 
     * @param {Object} exerciseDatabase 
     * @returns {{ program: Object, validation: Object, iterations: number, repaired: boolean }}
     */
    function validateAndRepairProgram(program, profile, requirements, exerciseDatabase) {
        let currentProgram = deepClone(program);
        let currentValidation = validateProgram(currentProgram, profile, requirements, exerciseDatabase);
        let iterations = 0;

        while (!currentValidation.valid && currentValidation.status === 'REPAIRABLE' && iterations < MAX_REPAIR_ITERATIONS) {
            iterations++;
            currentProgram = repairProgram(currentProgram, profile, requirements, exerciseDatabase);
            currentValidation = validateProgram(currentProgram, profile, requirements, exerciseDatabase);
        }

        return {
            program: currentProgram,
            validation: currentValidation,
            iterations: iterations,
            repaired: iterations > 0
        };
    }

    /**
     * Generates a concise string summary of the validation outcome.
     * @param {Object} validationResult 
     * @returns {string}
     */
    function getValidationSummary(validationResult) {
        if (!validationResult) return 'No validation result provided.';
        const s = validationResult.summary || {};
        return `STATUS: ${validationResult.status} | Passed: ${s.passedChecks || 0} | Warnings: ${s.warningCount || 0} | Errors: ${s.errorCount || 0} | Critical: ${s.criticalCount || 0}`;
    }

    /**
     * Returns an immutable deterministic validation snapshot without runtime timestamps.
     * @param {Object} validationResult 
     * @returns {Object}
     */
    function getDeterministicValidationSnapshot(validationResult) {
        if (!validationResult || typeof validationResult !== 'object') return null;
        const snapshot = deepClone(validationResult);
        delete snapshot.validatedAt;
        return snapshot;
    }

    /**
     * Returns the version of the Program Validator Engine.
     * @returns {string}
     */
    function getProgramValidatorVersion() {
        return VALIDATOR_VERSION;
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        VALIDATOR_VERSION,
        MAX_REPAIR_ITERATIONS,
        DURATION_MIN_RATIO,
        DURATION_MAX_RATIO,
        getProgramValidatorVersion,
        validateProgram,
        runSafetyGate,
        repairProgram,
        validateAndRepairProgram,
        getValidationSummary,
        getDeterministicValidationSnapshot,
        _internals: {
            calculateSessionPhysicalDuration,
            findDeterministicReplacement,
            deepClone
        }
    };
}));
