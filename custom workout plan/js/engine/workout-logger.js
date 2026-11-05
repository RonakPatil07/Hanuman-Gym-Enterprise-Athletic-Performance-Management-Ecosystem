/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * WORKOUT LOGGING & PERFORMANCE CAPTURE ENGINE (v1.0)
 * ==============================================================================
 * 
 * Deterministic engine for structured workout execution and performance logging.
 * 
 * Core Design Principles:
 * 1. PURE FACT CAPTURE: Records actual performance without interpreting adaptation
 *    or mutating the prescribed program.
 * 2. PLANNED VS ACTUAL DUALITY: Preserves what was prescribed alongside what
 *    was actually executed.
 * 3. STRICT RIR / RPE VALIDATION: Enforces Phase 8 intensity boundaries (RIR 0–5,
 *    RPE 5–10, RPE = 10 - RIR).
 * 4. ISOLATED STORAGE ABSTRACTION: Safe localStorage persistence under
 *    the namespaced key 'hanumanGym.workoutLogs.v1'.
 * 5. DETERMINISTIC SNAPSHOTS: Separates runtime log timestamps from performance
 *    structure for regression auditability.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.WorkoutLoggerEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';
    const STORAGE_KEY = 'hanumanGym.workoutLogs.v1';

    // ==========================================================================
    // 1. CONSTANTS & ENUMS
    // ==========================================================================

    const SESSION_STATUS = {
        NOT_STARTED: 'NOT_STARTED',
        IN_PROGRESS: 'IN_PROGRESS',
        PAUSED: 'PAUSED',
        COMPLETED: 'COMPLETED',
        PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
        ABANDONED: 'ABANDONED'
    };

    const LOAD_UNITS = {
        KG: 'kg',
        LB: 'lb',
        BODYWEIGHT: 'bodyweight',
        NONE: 'none'
    };

    // ==========================================================================
    // 2. HELPER UTILITIES
    // ==========================================================================

    /**
     * Deep clone helper to protect immutability.
     */
    function deepClone(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Resolves a safe timestamp string without mutating deterministic logic.
     */
    function getISOString() {
        return new Date().toISOString();
    }

    /**
     * Generates a structured, collision-resistant log identifier.
     */
    function generateLogId(programId, sessionId, seed) {
        const pId = programId || 'prog';
        const sId = sessionId || 'sess';
        const unique = seed || Date.now();
        return `log_${pId}_${sId}_${unique}`;
    }

    // ==========================================================================
    // 3. LOG CREATION & INITIALIZATION
    // ==========================================================================

    /**
     * Creates a new structured workout log from a validated generated program and session ID.
     * 
     * @param {Object} program Validated generated workout program (treated as read-only)
     * @param {string|number} sessionId Identifier or index of the session to execute
     * @param {string} [customLogId] Optional explicit logId for deterministic testing
     * @returns {Object} Structured workout log object
     */
    function createWorkoutLog(program, sessionId, customLogId) {
        if (!program || typeof program !== 'object') {
            throw new Error('WorkoutLogger: Valid generated program object is required.');
        }

        if (!Array.isArray(program.sessions) || program.sessions.length === 0) {
            throw new Error('WorkoutLogger: Program contains no valid sessions.');
        }

        // Locate session by session.id, session.day, or array index
        let targetSession = null;
        let targetSessionIndex = -1;

        if (typeof sessionId === 'number') {
            targetSession = program.sessions[sessionId] || null;
            targetSessionIndex = sessionId;
        } else if (typeof sessionId === 'string') {
            targetSessionIndex = program.sessions.findIndex(s => s.id === sessionId || s.day === sessionId || s.dayIndex === sessionId);
            if (targetSessionIndex !== -1) {
                targetSession = program.sessions[targetSessionIndex];
            }
        }

        if (!targetSession) {
            throw new Error(`WorkoutLogger: Session '${sessionId}' not found in program.`);
        }

        const programId = program.programId || 'custom_program';
        const resolvedSessionId = targetSession.id || targetSession.day || `session_${targetSessionIndex}`;
        const logId = customLogId || generateLogId(programId, resolvedSessionId);

        // Build planned snapshot
        const plannedExercises = (targetSession.exercises || []).map(ex => ({
            exerciseId: ex.exerciseId || ex.id || 'unknown_ex',
            exerciseName: ex.exerciseName || ex.name || 'Exercise',
            plannedSets: typeof ex.sets === 'number' ? ex.sets : 3,
            plannedReps: ex.reps || '8-12',
            plannedRIR: typeof ex.rir === 'number' ? ex.rir : 2,
            plannedRPE: typeof ex.rpe === 'number' ? ex.rpe : 8,
            progressionModel: (ex.progression && ex.progression.model) || ex.progressionModel || 'DOUBLE_PROGRESSION'
        }));

        const plannedSnapshot = {
            programId,
            sessionId: resolvedSessionId,
            sessionDay: targetSession.day || 'Day',
            sessionTitle: targetSession.title || 'Training Session',
            exercises: plannedExercises
        };

        // Initialize empty actual exercise records matching planned structure
        const actualExercises = plannedExercises.map(pe => {
            const initialSets = [];
            for (let i = 1; i <= pe.plannedSets; i++) {
                initialSets.push({
                    setNumber: i,
                    plannedReps: pe.plannedReps,
                    actualReps: null,
                    plannedLoad: null,
                    actualLoad: null,
                    loadUnit: LOAD_UNITS.KG,
                    plannedRIR: pe.plannedRIR,
                    actualRIR: null,
                    plannedRPE: pe.plannedRPE,
                    actualRPE: null,
                    durationSeconds: null,
                    completed: false,
                    notes: ''
                });
            }
            return {
                exerciseId: pe.exerciseId,
                exerciseName: pe.exerciseName,
                sets: initialSets
            };
        });

        const now = getISOString();

        return {
            version: ENGINE_VERSION,
            logId,
            programId,
            sessionId: resolvedSessionId,
            sessionDay: targetSession.day || 'Day',
            sessionTitle: targetSession.title || 'Training Session',
            status: SESSION_STATUS.NOT_STARTED,
            startedAt: null,
            completedAt: null,
            createdAt: now,
            updatedAt: now,
            sessionNotes: '',
            plannedSnapshot,
            exercises: actualExercises
        };
    }

    // ==========================================================================
    // 4. LIFECYCLE & PERFORMANCE CAPTURE API
    // ==========================================================================

    /**
     * Starts the workout session, transitioning status to IN_PROGRESS.
     */
    function startWorkout(log) {
        if (!log || typeof log !== 'object') throw new Error('WorkoutLogger: Invalid log.');
        if (log.status === SESSION_STATUS.COMPLETED) {
            throw new Error('WorkoutLogger: Cannot restart an already completed workout log.');
        }
        log.status = SESSION_STATUS.IN_PROGRESS;
        if (!log.startedAt) {
            log.startedAt = getISOString();
        }
        log.updatedAt = getISOString();
        return log;
    }

    /**
     * Pauses the active workout session.
     */
    function pauseWorkout(log) {
        if (!log || typeof log !== 'object') throw new Error('WorkoutLogger: Invalid log.');
        log.status = SESSION_STATUS.PAUSED;
        log.updatedAt = getISOString();
        return log;
    }

    /**
     * Completes the workout session, transitioning status to COMPLETED.
     */
    function completeWorkout(log) {
        if (!log || typeof log !== 'object') throw new Error('WorkoutLogger: Invalid log.');
        log.status = SESSION_STATUS.COMPLETED;
        log.completedAt = getISOString();
        log.updatedAt = getISOString();
        return log;
    }

    /**
     * Marks the workout session as PARTIALLY_COMPLETED or ABANDONED.
     */
    function abandonWorkout(log, isPartial) {
        if (!log || typeof log !== 'object') throw new Error('WorkoutLogger: Invalid log.');
        log.status = isPartial ? SESSION_STATUS.PARTIALLY_COMPLETED : SESSION_STATUS.ABANDONED;
        log.completedAt = getISOString();
        log.updatedAt = getISOString();
        return log;
    }

    /**
     * Validates raw set performance input against strict domain constraints.
     * 
     * @param {Object} setData 
     * @returns {{valid: boolean, errors: string[]}}
     */
    function validateSetData(setData) {
        const errors = [];
        if (!setData || typeof setData !== 'object') {
            return { valid: false, errors: ['Set data must be a non-null object.'] };
        }

        // Reps validation
        if (setData.actualReps !== null && setData.actualReps !== undefined) {
            if (typeof setData.actualReps !== 'number' || !Number.isInteger(setData.actualReps) || isNaN(setData.actualReps)) {
                errors.push(`Invalid actualReps '${setData.actualReps}'. Must be an integer.`);
            } else if (setData.actualReps < 0) {
                errors.push(`Invalid actualReps '${setData.actualReps}'. Must be >= 0.`);
            }
        }

        // Load validation
        if (setData.actualLoad !== null && setData.actualLoad !== undefined) {
            if (typeof setData.actualLoad !== 'number' || isNaN(setData.actualLoad) || !isFinite(setData.actualLoad)) {
                errors.push(`Invalid actualLoad '${setData.actualLoad}'. Must be a finite number.`);
            } else if (setData.actualLoad < 0) {
                errors.push(`Invalid actualLoad '${setData.actualLoad}'. Must be >= 0.`);
            }
        }

        // Load unit validation
        if (setData.loadUnit !== undefined && setData.loadUnit !== null) {
            if (!Object.values(LOAD_UNITS).includes(setData.loadUnit)) {
                errors.push(`Invalid loadUnit '${setData.loadUnit}'. Supported units: ${Object.values(LOAD_UNITS).join(', ')}.`);
            }
        }

        // RIR validation (0 to 5)
        if (setData.actualRIR !== null && setData.actualRIR !== undefined) {
            if (typeof setData.actualRIR !== 'number' || isNaN(setData.actualRIR)) {
                errors.push(`Invalid actualRIR '${setData.actualRIR}'. Must be numeric.`);
            } else if (setData.actualRIR < 0 || setData.actualRIR > 5) {
                errors.push(`Invalid actualRIR '${setData.actualRIR}'. Must be between 0 and 5.`);
            }
        }

        // RPE validation (5 to 10)
        if (setData.actualRPE !== null && setData.actualRPE !== undefined) {
            if (typeof setData.actualRPE !== 'number' || isNaN(setData.actualRPE)) {
                errors.push(`Invalid actualRPE '${setData.actualRPE}'. Must be numeric.`);
            } else if (setData.actualRPE < 5 || setData.actualRPE > 10) {
                errors.push(`Invalid actualRPE '${setData.actualRPE}'. Must be between 5 and 10.`);
            }
        }

        // RIR and RPE Consistency Check (RPE = 10 - RIR)
        if (typeof setData.actualRIR === 'number' && typeof setData.actualRPE === 'number') {
            const expectedRPE = 10 - setData.actualRIR;
            if (setData.actualRPE !== expectedRPE) {
                errors.push(`Inconsistent effort metrics: actualRIR (${setData.actualRIR}) does not match actualRPE (${setData.actualRPE}). Formula: RPE = 10 - RIR (expected RPE ${expectedRPE}).`);
            }
        }

        // Duration validation
        if (setData.durationSeconds !== null && setData.durationSeconds !== undefined) {
            if (typeof setData.durationSeconds !== 'number' || isNaN(setData.durationSeconds) || setData.durationSeconds < 0) {
                errors.push(`Invalid durationSeconds '${setData.durationSeconds}'. Must be >= 0.`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Logs or updates a specific set's performance record for an exercise.
     * Prevents accidental duplication of set records.
     * 
     * @param {Object} log Target workout log
     * @param {string} exerciseId Canonical exercise ID
     * @param {Object} setData Performance data
     * @returns {Object} Updated log
     */
    function logSet(log, exerciseId, setData) {
        if (!log || typeof log !== 'object') throw new Error('WorkoutLogger: Invalid log object.');
        if (!exerciseId || typeof exerciseId !== 'string') throw new Error('WorkoutLogger: Valid exerciseId is required.');

        const val = validateSetData(setData);
        if (!val.valid) {
            throw new Error(`WorkoutLogger Set Validation Error: ${val.errors.join(' ')}`);
        }

        let exRecord = (log.exercises || []).find(e => e.exerciseId === exerciseId);
        if (!exRecord) {
            // If exercise was not in planned snapshot, add it as extra exercise
            exRecord = {
                exerciseId,
                exerciseName: (setData && setData.exerciseName) || exerciseId,
                sets: []
            };
            if (!Array.isArray(log.exercises)) log.exercises = [];
            log.exercises.push(exRecord);
        }

        const setNum = typeof setData.setNumber === 'number' ? setData.setNumber : (exRecord.sets.length + 1);
        let existingSet = exRecord.sets.find(s => s.setNumber === setNum);

        // Derive missing effort if one is supplied
        let rir = setData.actualRIR !== undefined ? setData.actualRIR : (existingSet ? existingSet.actualRIR : null);
        let rpe = setData.actualRPE !== undefined ? setData.actualRPE : (existingSet ? existingSet.actualRPE : null);

        if (typeof rir === 'number' && (rpe === null || rpe === undefined)) {
            rpe = 10 - rir;
        } else if (typeof rpe === 'number' && (rir === null || rir === undefined)) {
            rir = 10 - rpe;
        }

        const setPayload = {
            setNumber: setNum,
            plannedReps: setData.plannedReps !== undefined ? setData.plannedReps : (existingSet ? existingSet.plannedReps : '8-12'),
            actualReps: setData.actualReps !== undefined ? setData.actualReps : (existingSet ? existingSet.actualReps : null),
            plannedLoad: setData.plannedLoad !== undefined ? setData.plannedLoad : (existingSet ? existingSet.plannedLoad : null),
            actualLoad: setData.actualLoad !== undefined ? setData.actualLoad : (existingSet ? existingSet.actualLoad : null),
            loadUnit: setData.loadUnit || (existingSet ? existingSet.loadUnit : LOAD_UNITS.KG),
            plannedRIR: setData.plannedRIR !== undefined ? setData.plannedRIR : (existingSet ? existingSet.plannedRIR : 2),
            actualRIR: rir,
            plannedRPE: setData.plannedRPE !== undefined ? setData.plannedRPE : (existingSet ? existingSet.plannedRPE : 8),
            actualRPE: rpe,
            durationSeconds: setData.durationSeconds !== undefined ? setData.durationSeconds : (existingSet ? existingSet.durationSeconds : null),
            completed: setData.completed !== undefined ? !!setData.completed : true,
            notes: setData.notes !== undefined ? String(setData.notes) : (existingSet ? existingSet.notes : '')
        };

        if (existingSet) {
            Object.assign(existingSet, setPayload);
        } else {
            exRecord.sets.push(setPayload);
            // Keep sets sorted by setNumber
            exRecord.sets.sort((a, b) => a.setNumber - b.setNumber);
        }

        if (log.status === SESSION_STATUS.NOT_STARTED) {
            log.status = SESSION_STATUS.IN_PROGRESS;
            if (!log.startedAt) log.startedAt = getISOString();
        }

        log.updatedAt = getISOString();
        return log;
    }

    /**
     * Alias for logSet with explicit setNumber target.
     */
    function updateSet(log, exerciseId, setNumber, setData) {
        const payload = Object.assign({}, setData, { setNumber });
        return logSet(log, exerciseId, payload);
    }

    // ==========================================================================
    // 5. VALIDATION & FACTUAL SUMMARY
    // ==========================================================================

    /**
     * Validates that an entire workout log satisfies domain structure and performance contracts.
     * 
     * @param {Object} log 
     * @returns {{valid: boolean, errors: string[]}}
     */
    function validateWorkoutLog(log) {
        const errors = [];
        if (!log || typeof log !== 'object') {
            return { valid: false, errors: ['Workout log must be a non-null object.'] };
        }

        if (!log.logId || typeof log.logId !== 'string') {
            errors.push('Workout log must contain a valid logId string.');
        }

        if (!log.programId || typeof log.programId !== 'string') {
            errors.push('Workout log must contain a valid programId string.');
        }

        if (!log.sessionId || (typeof log.sessionId !== 'string' && typeof log.sessionId !== 'number')) {
            errors.push('Workout log must contain a valid sessionId.');
        }

        if (!log.status || !Object.values(SESSION_STATUS).includes(log.status)) {
            errors.push(`Invalid workout log status: '${log.status}'.`);
        }

        if (!Array.isArray(log.exercises)) {
            errors.push('Workout log exercises must be an array.');
        } else {
            log.exercises.forEach((ex, exIdx) => {
                if (!ex.exerciseId || typeof ex.exerciseId !== 'string') {
                    errors.push(`Exercise index ${exIdx} is missing a canonical exerciseId.`);
                }
                if (!Array.isArray(ex.sets)) {
                    errors.push(`Exercise '${ex.exerciseId || exIdx}' sets must be an array.`);
                } else {
                    const seenSetNumbers = new Set();
                    ex.sets.forEach((s, sIdx) => {
                        if (typeof s.setNumber !== 'number' || s.setNumber < 1) {
                            errors.push(`Exercise '${ex.exerciseId}', set index ${sIdx} has invalid setNumber (${s.setNumber}).`);
                        } else {
                            if (seenSetNumbers.has(s.setNumber)) {
                                errors.push(`Exercise '${ex.exerciseId}' contains duplicate setNumber (${s.setNumber}).`);
                            }
                            seenSetNumbers.add(s.setNumber);
                        }

                        const setVal = validateSetData(s);
                        if (!setVal.valid) {
                            setVal.errors.forEach(err => {
                                errors.push(`Exercise '${ex.exerciseId}', set ${s.setNumber}: ${err}`);
                            });
                        }
                    });
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Computes factual performance summary metrics for a workout log.
     * 
     * @param {Object} log 
     * @returns {Object} Factual execution summary
     */
    function getWorkoutSummary(log) {
        if (!log || typeof log !== 'object') {
            return {
                totalPlannedSets: 0,
                completedSets: 0,
                totalActualReps: 0,
                totalPlannedRepsEstimated: 0,
                completionPercentage: 0,
                exercisesCompleted: 0,
                exercisesSkipped: 0,
                status: SESSION_STATUS.NOT_STARTED
            };
        }

        let totalPlannedSets = 0;
        if (log.plannedSnapshot && Array.isArray(log.plannedSnapshot.exercises)) {
            log.plannedSnapshot.exercises.forEach(pe => {
                totalPlannedSets += (typeof pe.plannedSets === 'number' ? pe.plannedSets : 0);
            });
        }

        let completedSets = 0;
        let totalActualReps = 0;
        let exercisesCompleted = 0;
        let exercisesSkipped = 0;

        const exercises = Array.isArray(log.exercises) ? log.exercises : [];

        exercises.forEach(ex => {
            let exCompletedSets = 0;
            const sets = Array.isArray(ex.sets) ? ex.sets : [];
            sets.forEach(s => {
                if (s.completed) {
                    completedSets++;
                    exCompletedSets++;
                }
                if (typeof s.actualReps === 'number') {
                    totalActualReps += s.actualReps;
                }
            });

            if (exCompletedSets > 0) {
                exercisesCompleted++;
            } else {
                exercisesSkipped++;
            }
        });

        const effectivePlannedSets = totalPlannedSets > 0 ? totalPlannedSets : completedSets;
        const completionPercentage = effectivePlannedSets > 0
            ? Math.min(100, Math.round((completedSets / effectivePlannedSets) * 1000) / 10)
            : 0;

        return {
            totalPlannedSets: effectivePlannedSets,
            completedSets,
            totalActualReps,
            completionPercentage,
            exercisesCompleted,
            exercisesSkipped,
            status: log.status || SESSION_STATUS.NOT_STARTED
        };
    }

    // ==========================================================================
    // 6. DETERMINISM & SERIALIZATION
    // ==========================================================================

    /**
     * Generates a deterministic snapshot of workout performance, excluding runtime timestamps and IDs.
     * 
     * @param {Object} log 
     * @returns {string} JSON snapshot
     */
    function getDeterministicWorkoutSnapshot(log) {
        if (!log || typeof log !== 'object') return '{}';

        const clone = deepClone(log);
        delete clone.logId;
        delete clone.startedAt;
        delete clone.completedAt;
        delete clone.createdAt;
        delete clone.updatedAt;

        return JSON.stringify(clone);
    }

    /**
     * Serializes a workout log to a JSON string.
     */
    function serializeWorkoutLog(log) {
        return JSON.stringify(log);
    }

    /**
     * Deserializes a JSON string into a validated workout log object.
     */
    function deserializeWorkoutLog(serialized) {
        if (!serialized || typeof serialized !== 'string') {
            throw new Error('WorkoutLogger: Serialized input must be a valid JSON string.');
        }
        const parsed = JSON.parse(serialized);
        const val = validateWorkoutLog(parsed);
        if (!val.valid) {
            throw new Error(`WorkoutLogger Deserialization Error: ${val.errors.join(' ')}`);
        }
        return parsed;
    }

    // ==========================================================================
    // 7. ISOLATED LOCALSTORAGE PERSISTENCE
    // ==========================================================================

    /**
     * Safely reads all logs from namespaced storage.
     */
    function getAllStoredLogs() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return {};
        }
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch (e) {
            console.warn('[WorkoutLogger] Storage read error:', e.message);
            return {};
        }
    }

    /**
     * Safely writes all logs to namespaced storage.
     */
    function setAllStoredLogs(map) {
        if (typeof window === 'undefined' || !window.localStorage) {
            return false;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
            return true;
        } catch (e) {
            console.warn('[WorkoutLogger] Storage write error:', e.message);
            return false;
        }
    }

    /**
     * Saves a workout log to namespaced storage.
     * 
     * @param {Object} log 
     * @returns {boolean} Success status
     */
    function saveWorkoutLog(log) {
        if (!log || !log.logId) return false;
        const val = validateWorkoutLog(log);
        if (!val.valid) {
            console.warn('[WorkoutLogger] Cannot save invalid log:', val.errors);
            return false;
        }
        const logsMap = getAllStoredLogs();
        logsMap[log.logId] = log;
        return setAllStoredLogs(logsMap);
    }

    /**
     * Loads a workout log by logId.
     * 
     * @param {string} logId 
     * @returns {Object|null}
     */
    function loadWorkoutLog(logId) {
        if (!logId) return null;
        const logsMap = getAllStoredLogs();
        return logsMap[logId] || null;
    }

    /**
     * Retrieves an existing in-progress or paused active workout log for a program & session.
     * Prevents accidental multiple concurrent logs for the same session.
     * 
     * @param {string} programId 
     * @param {string|number} sessionId 
     * @returns {Object|null}
     */
    function getActiveWorkoutLog(programId, sessionId) {
        const logsMap = getAllStoredLogs();
        const sId = String(sessionId);
        for (const id in logsMap) {
            const l = logsMap[id];
            if (l.programId === programId && String(l.sessionId) === sId) {
                if (l.status === SESSION_STATUS.IN_PROGRESS || l.status === SESSION_STATUS.PAUSED) {
                    return l;
                }
            }
        }
        return null;
    }

    /**
     * Lists all stored workout logs.
     * 
     * @returns {Object[]} Array of workout logs
     */
    function listWorkoutLogs() {
        const logsMap = getAllStoredLogs();
        return Object.values(logsMap);
    }

    /**
     * Deletes a workout log by logId.
     * 
     * @param {string} logId 
     * @returns {boolean}
     */
    function deleteWorkoutLog(logId) {
        if (!logId) return false;
        const logsMap = getAllStoredLogs();
        if (logsMap[logId]) {
            delete logsMap[logId];
            return setAllStoredLogs(logsMap);
        }
        return false;
    }

    /**
     * Clears all workout logs in the namespaced store.
     */
    function clearWorkoutLogs() {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                window.localStorage.removeItem(STORAGE_KEY);
                return true;
            } catch (e) {
                return false;
            }
        }
        return true;
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        STORAGE_KEY,
        SESSION_STATUS,
        LOAD_UNITS,
        createWorkoutLog,
        startWorkout,
        pauseWorkout,
        completeWorkout,
        abandonWorkout,
        validateSetData,
        logSet,
        updateSet,
        validateWorkoutLog,
        getWorkoutSummary,
        getDeterministicWorkoutSnapshot,
        serializeWorkoutLog,
        deserializeWorkoutLog,
        saveWorkoutLog,
        loadWorkoutLog,
        getActiveWorkoutLog,
        listWorkoutLogs,
        deleteWorkoutLog,
        clearWorkoutLogs,
        _internals: {
            deepClone,
            generateLogId
        }
    };
}));
