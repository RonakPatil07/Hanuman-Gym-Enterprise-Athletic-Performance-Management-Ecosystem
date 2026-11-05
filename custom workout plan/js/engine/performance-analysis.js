/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PERFORMANCE ANALYSIS ENGINE (v1.0)
 * ==============================================================================
 * 
 * Deterministic engine for analyzing historical workout performance logs (Phase 10).
 * 
 * Core Design Principles:
 * 1. PURE FACT INTERPRETATION: Translates logged workout execution data into
 *    structured performance signals ("What happened?").
 * 2. BOUNDED ANALYSIS WINDOWS: Evaluates the last N completed valid exposures
 *    (default: 3, bounded max: 12) without scanning arbitrary lifetime logs.
 * 3. TRANSPARENT CONFIDENCE: Assigns LOW (1 exposure), MEDIUM (2 exposures),
 *    or HIGH (3+ exposures) based on concrete evidence counts.
 * 4. READ-ONLY IMMUTABILITY: Never mutates historical logs or program objects.
 * 5. DETERMINISTIC SNAPSHOTS: Separates runtime log metadata from analytical signals.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PerformanceAnalysisEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';
    const DEFAULT_ANALYSIS_WINDOW = 3;
    const MAX_ANALYSIS_WINDOW = 12;

    // ==========================================================================
    // 1. CONSTANTS & ENUMS
    // ==========================================================================

    const PERFORMANCE_SIGNALS = {
        STRONG: 'STRONG',
        ON_TARGET: 'ON_TARGET',
        BELOW_TARGET: 'BELOW_TARGET',
        INCONSISTENT: 'INCONSISTENT',
        INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
    };

    const SESSION_SIGNALS = {
        STRONG: 'STRONG',
        ON_TARGET: 'ON_TARGET',
        BELOW_TARGET: 'BELOW_TARGET',
        MIXED: 'MIXED',
        INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
    };

    const TRENDS = {
        IMPROVING: 'IMPROVING',
        STABLE: 'STABLE',
        DECLINING: 'DECLINING',
        MIXED: 'MIXED',
        INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
    };

    const CONFIDENCE_LEVELS = {
        LOW: 'LOW',
        MEDIUM: 'MEDIUM',
        HIGH: 'HIGH'
    };

    const REP_CLASSIFICATIONS = {
        BELOW_RANGE: 'BELOW_RANGE',
        WITHIN_RANGE: 'WITHIN_RANGE',
        AT_UPPER_BOUND: 'AT_UPPER_BOUND',
        ABOVE_RANGE: 'ABOVE_RANGE',
        NO_REP_DATA: 'NO_REP_DATA'
    };

    // ==========================================================================
    // 2. HELPER UTILITIES
    // ==========================================================================

    function deepClone(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Parses numeric rep range bounds from a string (e.g., "8-12", "15", "5x5").
     */
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

    /**
     * Filters and sorts valid completed logs for a specific program and session.
     */
    function getValidCompletedLogs(logs, programId, sessionId, windowSize) {
        if (!Array.isArray(logs)) return [];
        const limit = Math.max(1, Math.min(windowSize || DEFAULT_ANALYSIS_WINDOW, MAX_ANALYSIS_WINDOW));

        return logs
            .filter(log => {
                if (!log || typeof log !== 'object') return false;
                if (log.status === 'ABANDONED' || log.status === 'NOT_STARTED') return false;
                if (programId && log.programId !== programId) return false;
                if (sessionId !== undefined && sessionId !== null && sessionId !== '') {
                    const sStr = String(sessionId).toLowerCase();
                    const logSId = String(log.sessionId !== undefined ? log.sessionId : '').toLowerCase();
                    const logDay = String(log.sessionDay !== undefined ? log.sessionDay : '').toLowerCase();
                    const matchesExact = logSId === sStr || logDay === sStr;
                    const matchesIndex = (typeof sessionId === 'number') && (
                        logSId === `session_${sessionId}` ||
                        logSId === `day_${sessionId + 1}` ||
                        logDay === `day ${sessionId + 1}`
                    );
                    if (!matchesExact && !matchesIndex) {
                        return false;
                    }
                }
                return Array.isArray(log.exercises) && log.exercises.length > 0;
            })
            .sort((a, b) => {
                const timeA = a.completedAt || a.updatedAt || a.createdAt || '';
                const timeB = b.completedAt || b.updatedAt || b.createdAt || '';
                return timeB.localeCompare(timeA); // newest first
            })
            .slice(0, limit);
    }

    // ==========================================================================
    // 3. EXERCISE PERFORMANCE ANALYSIS
    // ==========================================================================

    /**
     * Analyzes historical performance logs for a specific exercise.
     * 
     * @param {string} exerciseId Canonical exercise ID
     * @param {Object[]} logs Array of workout logs from Phase 10
     * @param {Object} [options] Analysis configuration
     * @returns {Object} Exercise performance analysis object
     */
    function analyzeExercisePerformance(exerciseId, logs, options = {}) {
        if (!exerciseId || typeof exerciseId !== 'string') {
            throw new Error('PerformanceAnalysis: Valid exerciseId is required.');
        }

        const windowSize = Math.max(1, Math.min(options.windowSize || DEFAULT_ANALYSIS_WINDOW, MAX_ANALYSIS_WINDOW));
        const programId = options.programId || null;
        const sessionId = options.sessionId || null;

        // Retrieve valid completed logs that contain this exercise
        const candidateLogs = getValidCompletedLogs(logs, programId, sessionId, windowSize * 2);
        const relevantExExposures = [];

        candidateLogs.forEach(log => {
            const exRecord = (log.exercises || []).find(e => e.exerciseId === exerciseId);
            if (exRecord && Array.isArray(exRecord.sets) && exRecord.sets.length > 0) {
                // Find planned metadata if available
                const plannedEx = log.plannedSnapshot && Array.isArray(log.plannedSnapshot.exercises)
                    ? log.plannedSnapshot.exercises.find(pe => pe.exerciseId === exerciseId)
                    : null;

                relevantExExposures.push({
                    logId: log.logId,
                    completedAt: log.completedAt || log.createdAt,
                    planned: plannedEx,
                    actual: exRecord
                });
            }
        });

        const exposures = relevantExExposures.slice(0, windowSize);
        const sessionsAnalyzed = exposures.length;

        if (sessionsAnalyzed === 0) {
            return {
                exerciseId,
                sessionsAnalyzed: 0,
                completedSets: 0,
                plannedSets: 0,
                completionRatio: 0,
                repAttainmentRatio: 0,
                averageActualRIR: null,
                averagePlannedRIR: null,
                rirDeviation: null,
                averageActualRPE: null,
                averagePlannedRPE: null,
                rpeDeviation: null,
                loadObservations: [],
                performanceSignal: PERFORMANCE_SIGNALS.INSUFFICIENT_DATA,
                trend: TRENDS.INSUFFICIENT_DATA,
                confidence: CONFIDENCE_LEVELS.LOW,
                repClassifications: []
            };
        }

        let totalPlannedSets = 0;
        let totalCompletedSets = 0;
        let totalActualReps = 0;
        let totalTargetReps = 0;
        let rirActualSum = 0;
        let rirActualCount = 0;
        let rirPlannedSum = 0;
        let rirPlannedCount = 0;
        let rpeActualSum = 0;
        let rpeActualCount = 0;
        let rpePlannedSum = 0;
        let rpePlannedCount = 0;

        const loadObservations = [];
        const repClassifications = [];
        const exposureScores = []; // for trend detection

        // Process newest-to-oldest
        exposures.forEach(exp => {
            let expCompletedSets = 0;
            let expPlannedSets = (exp.planned && typeof exp.planned.plannedSets === 'number') ? exp.planned.plannedSets : exp.actual.sets.length;
            totalPlannedSets += expPlannedSets;

            const repRange = parseRepRange(exp.planned ? exp.planned.plannedReps : (exp.actual.sets[0] ? exp.actual.sets[0].plannedReps : '8-12'));
            const targetRepMid = (repRange.min + repRange.max) / 2;

            let expActualReps = 0;
            let expRepSetsCount = 0;

            exp.actual.sets.forEach(s => {
                if (s.completed) {
                    totalCompletedSets++;
                    expCompletedSets++;
                }

                if (typeof s.actualReps === 'number') {
                    totalActualReps += s.actualReps;
                    totalTargetReps += targetRepMid;
                    expActualReps += s.actualReps;
                    expRepSetsCount++;

                    if (s.actualReps > repRange.max) {
                        repClassifications.push(REP_CLASSIFICATIONS.ABOVE_RANGE);
                    } else if (s.actualReps === repRange.max) {
                        repClassifications.push(REP_CLASSIFICATIONS.AT_UPPER_BOUND);
                    } else if (s.actualReps >= repRange.min) {
                        repClassifications.push(REP_CLASSIFICATIONS.WITHIN_RANGE);
                    } else {
                        repClassifications.push(REP_CLASSIFICATIONS.BELOW_RANGE);
                    }
                }

                if (typeof s.actualRIR === 'number') {
                    rirActualSum += s.actualRIR;
                    rirActualCount++;
                }
                if (typeof s.plannedRIR === 'number') {
                    rirPlannedSum += s.plannedRIR;
                    rirPlannedCount++;
                }

                if (typeof s.actualRPE === 'number') {
                    rpeActualSum += s.actualRPE;
                    rpeActualCount++;
                }
                if (typeof s.plannedRPE === 'number') {
                    rpePlannedSum += s.plannedRPE;
                    rpePlannedCount++;
                }

                if (typeof s.actualLoad === 'number' && s.loadUnit) {
                    loadObservations.push({
                        load: s.actualLoad,
                        unit: s.loadUnit,
                        completed: !!s.completed,
                        reps: s.actualReps
                    });
                }
            });

            // Score this exposure for trend (completion + rep ratio)
            const expCompRatio = expPlannedSets > 0 ? (expCompletedSets / expPlannedSets) : 1;
            const expAvgReps = expRepSetsCount > 0 ? (expActualReps / expRepSetsCount) : targetRepMid;
            const expRepScore = targetRepMid > 0 ? (expAvgReps / targetRepMid) : 1;
            exposureScores.push((expCompRatio * 0.5) + (expRepScore * 0.5));
        });

        const completionRatio = totalPlannedSets > 0 ? Math.round((totalCompletedSets / totalPlannedSets) * 100) / 100 : 0;
        const repAttainmentRatio = totalTargetReps > 0 ? Math.round((totalActualReps / totalTargetReps) * 100) / 100 : 0;

        const averageActualRIR = rirActualCount > 0 ? Math.round((rirActualSum / rirActualCount) * 10) / 10 : null;
        const averagePlannedRIR = rirPlannedCount > 0 ? Math.round((rirPlannedSum / rirPlannedCount) * 10) / 10 : null;
        const rirDeviation = (averageActualRIR !== null && averagePlannedRIR !== null) ? Math.round((averageActualRIR - averagePlannedRIR) * 10) / 10 : null;

        const averageActualRPE = rpeActualCount > 0 ? Math.round((rpeActualSum / rpeActualCount) * 10) / 10 : null;
        const averagePlannedRPE = rpePlannedCount > 0 ? Math.round((rpePlannedSum / rpePlannedCount) * 10) / 10 : null;
        const rpeDeviation = (averageActualRPE !== null && averagePlannedRPE !== null) ? Math.round((averageActualRPE - averagePlannedRPE) * 10) / 10 : null;

        // Confidence calculation (Centralized deterministic evidence thresholds)
        let confidence = CONFIDENCE_LEVELS.LOW;
        if (sessionsAnalyzed >= 3) {
            confidence = CONFIDENCE_LEVELS.HIGH;
        } else if (sessionsAnalyzed === 2) {
            confidence = CONFIDENCE_LEVELS.MEDIUM;
        }

        // Performance Signal Evaluation
        let performanceSignal = PERFORMANCE_SIGNALS.ON_TARGET;
        const atOrAboveUpper = repClassifications.filter(c => c === REP_CLASSIFICATIONS.AT_UPPER_BOUND || c === REP_CLASSIFICATIONS.ABOVE_RANGE).length;
        const belowTargetCount = repClassifications.filter(c => c === REP_CLASSIFICATIONS.BELOW_RANGE).length;

        if (completionRatio >= 0.95 && atOrAboveUpper >= (repClassifications.length * 0.75) && (rirDeviation === null || rirDeviation >= 0)) {
            performanceSignal = PERFORMANCE_SIGNALS.STRONG;
        } else if (completionRatio < 0.75 || (belowTargetCount > (repClassifications.length * 0.5))) {
            performanceSignal = PERFORMANCE_SIGNALS.BELOW_TARGET;
        } else if (belowTargetCount > 0 && atOrAboveUpper > 0) {
            performanceSignal = PERFORMANCE_SIGNALS.INCONSISTENT;
        } else {
            performanceSignal = PERFORMANCE_SIGNALS.ON_TARGET;
        }

        // Trend Detection across exposures (exposureScores is newest to oldest)
        let trend = TRENDS.STABLE;
        if (sessionsAnalyzed < 2) {
            trend = TRENDS.INSUFFICIENT_DATA;
        } else {
            // Chronological order: oldest to newest
            const chronological = [...exposureScores].reverse();
            let isAscending = true;
            let isDescending = true;

            for (let i = 1; i < chronological.length; i++) {
                const diff = chronological[i] - chronological[i - 1];
                if (diff < 0.05) isAscending = false;
                if (diff > -0.05) isDescending = false;
            }

            if (isAscending && chronological[chronological.length - 1] > chronological[0] + 0.08) {
                trend = TRENDS.IMPROVING;
            } else if (isDescending && chronological[chronological.length - 1] < chronological[0] - 0.08) {
                trend = TRENDS.DECLINING;
            } else {
                const variance = Math.max(...chronological) - Math.min(...chronological);
                trend = variance > 0.25 ? TRENDS.MIXED : TRENDS.STABLE;
            }
        }

        return {
            exerciseId,
            sessionsAnalyzed,
            completedSets: totalCompletedSets,
            plannedSets: totalPlannedSets,
            completionRatio,
            repAttainmentRatio,
            averageActualRIR,
            averagePlannedRIR,
            rirDeviation,
            averageActualRPE,
            averagePlannedRPE,
            rpeDeviation,
            loadObservations,
            performanceSignal,
            trend,
            confidence,
            repClassifications
        };
    }

    // ==========================================================================
    // 4. SESSION PERFORMANCE ANALYSIS
    // ==========================================================================

    /**
     * Analyzes session-level performance trends across historical logs.
     * 
     * @param {string} programId 
     * @param {string|number} sessionId 
     * @param {Object[]} logs 
     * @param {Object} [options] 
     * @returns {Object} Session performance analysis
     */
    function analyzeSessionPerformance(programId, sessionId, logs, options = {}) {
        const windowSize = Math.max(1, Math.min(options.windowSize || DEFAULT_ANALYSIS_WINDOW, MAX_ANALYSIS_WINDOW));
        const validLogs = getValidCompletedLogs(logs, programId, sessionId, windowSize);
        const sessionsAnalyzed = validLogs.length;

        if (sessionsAnalyzed === 0) {
            return {
                programId,
                sessionId,
                sessionsAnalyzed: 0,
                plannedSets: 0,
                completedSets: 0,
                completionRatio: 0,
                averageRIRDeviation: null,
                averageRPEDeviation: null,
                exercisesCompleted: 0,
                exercisesIncomplete: 0,
                performanceSignal: SESSION_SIGNALS.INSUFFICIENT_DATA,
                confidence: CONFIDENCE_LEVELS.LOW,
                recoverySignals: []
            };
        }

        let totalPlannedSets = 0;
        let totalCompletedSets = 0;
        let totalRIRDev = 0;
        let rirDevCount = 0;
        let totalRPEDev = 0;
        let rpeDevCount = 0;
        let exercisesCompleted = 0;
        let exercisesIncomplete = 0;
        const recoverySignals = [];

        validLogs.forEach(log => {
            const exercises = Array.isArray(log.exercises) ? log.exercises : [];
            exercises.forEach(ex => {
                let exCompleted = 0;
                const sets = Array.isArray(ex.sets) ? ex.sets : [];
                totalPlannedSets += sets.length;

                sets.forEach(s => {
                    if (s.completed) {
                        totalCompletedSets++;
                        exCompleted++;
                    }
                    if (typeof s.actualRIR === 'number' && typeof s.plannedRIR === 'number') {
                        totalRIRDev += (s.actualRIR - s.plannedRIR);
                        rirDevCount++;
                    }
                    if (typeof s.actualRPE === 'number' && typeof s.plannedRPE === 'number') {
                        totalRPEDev += (s.actualRPE - s.plannedRPE);
                        rpeDevCount++;
                    }
                    // High effort detection (RIR = 0 or RPE >= 9.5)
                    if (s.actualRIR === 0 || s.actualRPE >= 10) {
                        recoverySignals.push(`Exercise '${ex.exerciseId}' reached failure (RIR 0 / RPE 10) on set ${s.setNumber}.`);
                    }
                });

                if (exCompleted === sets.length && sets.length > 0) {
                    exercisesCompleted++;
                } else {
                    exercisesIncomplete++;
                }
            });
        });

        const completionRatio = totalPlannedSets > 0 ? Math.round((totalCompletedSets / totalPlannedSets) * 100) / 100 : 0;
        const avgRIRDev = rirDevCount > 0 ? Math.round((totalRIRDev / rirDevCount) * 10) / 10 : null;
        const avgRPEDev = rpeDevCount > 0 ? Math.round((totalRPEDev / rpeDevCount) * 10) / 10 : null;

        let confidence = CONFIDENCE_LEVELS.LOW;
        if (sessionsAnalyzed >= 3) {
            confidence = CONFIDENCE_LEVELS.HIGH;
        } else if (sessionsAnalyzed === 2) {
            confidence = CONFIDENCE_LEVELS.MEDIUM;
        }

        let performanceSignal = SESSION_SIGNALS.ON_TARGET;
        if (completionRatio >= 0.95 && (avgRIRDev === null || avgRIRDev >= 0)) {
            performanceSignal = SESSION_SIGNALS.STRONG;
        } else if (completionRatio < 0.75) {
            performanceSignal = SESSION_SIGNALS.BELOW_TARGET;
        } else if (exercisesIncomplete > 0 && exercisesCompleted > 0) {
            performanceSignal = SESSION_SIGNALS.MIXED;
        }

        return {
            programId,
            sessionId,
            sessionsAnalyzed,
            plannedSets: totalPlannedSets,
            completedSets: totalCompletedSets,
            completionRatio,
            averageRIRDeviation: avgRIRDev,
            averageRPEDeviation: avgRPEDev,
            exercisesCompleted,
            exercisesIncomplete,
            performanceSignal,
            confidence,
            recoverySignals
        };
    }

    /**
     * Produces a deterministic JSON snapshot of an analysis result.
     */
    function getDeterministicAnalysisSnapshot(analysis) {
        if (!analysis || typeof analysis !== 'object') return '{}';
        const clone = deepClone(analysis);
        return JSON.stringify(clone);
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        DEFAULT_ANALYSIS_WINDOW,
        MAX_ANALYSIS_WINDOW,
        PERFORMANCE_SIGNALS,
        SESSION_SIGNALS,
        TRENDS,
        CONFIDENCE_LEVELS,
        REP_CLASSIFICATIONS,
        analyzeExercisePerformance,
        analyzeSessionPerformance,
        getDeterministicAnalysisSnapshot,
        _internals: {
            deepClone,
            parseRepRange,
            getValidCompletedLogs
        }
    };
}));
