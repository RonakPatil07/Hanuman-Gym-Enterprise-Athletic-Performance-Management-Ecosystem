/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * WEEKLY PERFORMANCE ANALYSIS & TRAINING ANALYTICS ENGINE (v1.0)
 * ==============================================================================
 * 
 * Pure, deterministic engine analyzing accumulated workout logs to answer:
 * "What happened during this training week?"
 * 
 * Core Design Principles:
 * 1. ANALYSIS ONLY (WHAT HAPPENED): Explains historical performance facts without
 *    triggering adaptive progression or mutating program state.
 * 2. DETERMINISTIC WEEKLY WINDOWING: Standard Monday 00:00:00 to Sunday 23:59:59.
 * 3. STRICT PLANNED VS ACTUAL DISTINCTION: Never conflates or overwrites planned targets.
 * 4. MULTIDIMENSIONAL AGGREGATION: Sessions, sets, reps, load, RIR/RPE, muscle groups,
 *    and progression-model performance reporting.
 * 5. ROBUST DATA QUALITY & IMMUTABILITY: Deduplicates logs, handles missing or malformed
 *    fields cleanly, and never mutates historical logs or program models.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./exercise-database.js'], factory);
    } else if (typeof module === 'object' && module.exports) {
        const exerciseDB = require('./exercise-database.js');
        module.exports = factory(exerciseDB);
    } else {
        root.WeeklyAnalyticsEngine = factory(root.ExerciseDatabaseEngine);
    }
}(typeof self !== 'undefined' ? self : this, function (exerciseDB) {
    'use strict';

    const ENGINE_VERSION = '1.0';

    // ==========================================================================
    // 1. CONSTANTS & ENUMS
    // ==========================================================================

    const CONSISTENCY_STATUS = Object.freeze({
        EXCELLENT: 'EXCELLENT',
        GOOD: 'GOOD',
        MODERATE: 'MODERATE',
        LOW: 'LOW',
        INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
    });

    const PERFORMANCE_TRENDS = Object.freeze({
        IMPROVING: 'IMPROVING',
        STABLE: 'STABLE',
        DECLINING: 'DECLINING',
        MIXED: 'MIXED',
        INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
    });

    const QUALITY_STATUS = Object.freeze({
        EXCELLENT: 'EXCELLENT',
        GOOD: 'GOOD',
        MODERATE: 'MODERATE',
        LOW: 'LOW',
        INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
    });

    const QUALITY_INDICATOR_TYPES = Object.freeze({
        SESSION_CONSISTENCY: 'SESSION_CONSISTENCY',
        SET_COMPLETION: 'SET_COMPLETION',
        REP_ATTAINMENT: 'REP_ATTAINMENT',
        EFFORT_ADHERENCE: 'EFFORT_ADHERENCE',
        LOAD_DATA_COVERAGE: 'LOAD_DATA_COVERAGE',
        PERFORMANCE_TREND: 'PERFORMANCE_TREND'
    });

    // Consistency rate thresholds (Attendance / Session completion)
    const CONSISTENCY_THRESHOLDS = Object.freeze({
        EXCELLENT: 0.90,
        GOOD: 0.75,
        MODERATE: 0.50
    });

    // ==========================================================================
    // 2. HELPER UTILITIES & DATE WINDOWS
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
        return null;
    }

    /**
     * Parses rep range string e.g. "8-12" or number 10 into midpoint.
     */
    function parsePlannedRepMidpoint(reps) {
        if (typeof reps === 'number') return reps;
        if (typeof reps === 'string') {
            const parts = reps.split('-').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n));
            if (parts.length === 2) return (parts[0] + parts[1]) / 2;
            if (parts.length === 1) return parts[0];
        }
        return 10; // default midpoint
    }

    /**
     * Formats Date into local ISO string with explicit timezone offset (e.g. 2026-08-17T00:00:00.000+05:30).
     * @param {Date} date 
     * @returns {string}
     */
    function formatLocalISOString(date) {
        const pad = (n, width = 2) => String(n).padStart(width, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const h = pad(date.getHours());
        const min = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        const ms = pad(date.getMilliseconds(), 3);
        const offsetMin = -date.getTimezoneOffset();
        const sign = offsetMin >= 0 ? '+' : '-';
        const offH = pad(Math.floor(Math.abs(offsetMin) / 60));
        const offM = pad(Math.abs(offsetMin) % 60);
        return `${y}-${m}-${d}T${h}:${min}:${s}.${ms}${sign}${offH}:${offM}`;
    }

    /**
     * Determines Monday 00:00:00 to Sunday 23:59:59.999 window for a reference date in local calendar context.
     * 
     * @param {string|Date} [referenceDate] Date object or parsable date string
     * @returns {{weekStart: string, weekEnd: string, startDate: Date, endDate: Date}}
     */
    function getWeekRange(referenceDate) {
        let ref;
        if (typeof referenceDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(referenceDate)) {
            const [y, m, d] = referenceDate.split('-').map(Number);
            ref = new Date(y, m - 1, d);
        } else if (referenceDate) {
            ref = new Date(referenceDate);
        } else {
            ref = new Date();
        }

        const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());

        // Adjust to Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const day = d.getDay();
        const diff = (day === 0 ? -6 : 1) - day;

        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        const startDate = new Date(d.getTime());

        const endD = new Date(startDate.getTime());
        endD.setDate(endD.getDate() + 6);
        endD.setHours(23, 59, 59, 999);
        const endDate = new Date(endD.getTime());

        return {
            weekStart: formatLocalISOString(startDate),
            weekEnd: formatLocalISOString(endDate),
            startDate,
            endDate
        };
    }

    /**
     * Returns the immediately preceding local calendar week (Monday 00:00:00 to Sunday 23:59:59.999).
     */
    function getPreviousWeekRange(referenceDate) {
        const current = getWeekRange(referenceDate);
        const prevRef = new Date(current.startDate.getTime() - (24 * 60 * 60 * 1000)); // 1 day before current Monday
        return getWeekRange(prevRef);
    }

    // ==========================================================================
    // 3. LOG INGESTION & DEDUPLICATION
    // ==========================================================================

    /**
     * Deduplicates logs by logId and filters to specified week window using local timestamps.
     * 
     * @param {Object[]} logs Array of raw workout logs
     * @param {Object} weekRange Week boundaries object
     * @returns {Object[]} Deduplicated, ordered logs within week
     */
    function ingestAndFilterWeeklyLogs(logs, weekRange) {
        if (!Array.isArray(logs)) return [];

        const logMap = new Map();
        const startMs = weekRange.startDate.getTime();
        const endMs = weekRange.endDate.getTime();

        logs.forEach((log, idx) => {
            if (!log || typeof log !== 'object') return;
            const logId = log.logId || `synthetic_log_${idx}`;

            // Check timestamp
            const timeStr = log.completedAt || log.startedAt || log.timestamp || log.date;
            if (!timeStr) return;
            const timeMs = new Date(timeStr).getTime();
            if (isNaN(timeMs) || timeMs < startMs || timeMs > endMs) return;

            // Deduplication preference: COMPLETED > PARTIALLY_COMPLETED > IN_PROGRESS > ABANDONED > NOT_STARTED
            const statusRank = {
                'COMPLETED': 5,
                'PARTIALLY_COMPLETED': 4,
                'IN_PROGRESS': 3,
                'PAUSED': 2,
                'ABANDONED': 1,
                'NOT_STARTED': 0
            };

            if (logMap.has(logId)) {
                const existing = logMap.get(logId);
                const exRank = statusRank[existing.status] || 0;
                const newRank = statusRank[log.status] || 0;
                if (newRank > exRank) {
                    logMap.set(logId, deepClone(log));
                }
            } else {
                logMap.set(logId, deepClone(log));
            }
        });

        // Deterministic sort by timestamp ascending, then logId
        return Array.from(logMap.values()).sort((a, b) => {
            const tA = new Date(a.completedAt || a.startedAt || 0).getTime();
            const tB = new Date(b.completedAt || b.startedAt || 0).getTime();
            if (tA !== tB) return tA - tB;
            return String(a.logId || '').localeCompare(String(b.logId || ''));
        });
    }

    // ==========================================================================
    // 4. CORE WEEKLY ANALYTICS ENGINE
    // ==========================================================================

    /**
     * Generates comprehensive weekly performance analytics from workout logs.
     * 
     * @param {Object[]} logs All available workout logs
     * @param {Object} [program] Current workout program (for planned frequency/sets)
     * @param {string|Date} [referenceDate] Target week reference date
     * @param {Object} [options] Custom analysis options
     * @returns {Object} Structured weekly performance analytics
     */
    function analyzeWeeklyPerformance(logs, program, referenceDate, options = {}) {
        const weekRange = getWeekRange(referenceDate);
        const prevWeekRange = getPreviousWeekRange(referenceDate);

        const currentWeekLogs = ingestAndFilterWeeklyLogs(logs, weekRange);
        const prevWeekLogs = ingestAndFilterWeeklyLogs(logs, prevWeekRange);

        const plannedSessionsCount = (program && Array.isArray(program.sessions))
            ? program.sessions.length
            : (options.plannedSessions || (currentWeekLogs.length > 0 ? currentWeekLogs.length : 0));

        let attemptedSessions = 0;
        let completedSessions = 0;
        let partiallyCompletedSessions = 0;
        let abandonedSessions = 0;
        let totalDurationMinutes = 0;
        let durationLoggedCount = 0;

        let plannedSets = 0;
        let completedSets = 0;
        let incompleteSets = 0;

        let plannedReps = 0;
        let actualReps = 0;

        // Structured load tracking by unit (kg, lb)
        const loadTotals = {
            kg: 0,
            lb: 0
        };
        let loadedSetsCount = 0;
        let loadedSetsWithLoadData = 0;

        let totalActualRIR = 0;
        let rirLoggedCount = 0;
        let totalPlannedRIR = 0;
        let plannedRIRCount = 0;

        let totalActualRPE = 0;
        let rpeLoggedCount = 0;
        let totalPlannedRPE = 0;
        let plannedRPECount = 0;

        const exerciseAggMap = new Map();
        const muscleAggMap = new Map();
        const progressionAggMap = new Map();

        const db = getDB();

        // Process each session log
        currentWeekLogs.forEach(log => {
            const status = log.status || 'COMPLETED';

            if (status === 'COMPLETED') {
                attemptedSessions++;
                completedSessions++;
            } else if (status === 'PARTIALLY_COMPLETED') {
                attemptedSessions++;
                partiallyCompletedSessions++;
            } else if (status === 'ABANDONED') {
                attemptedSessions++;
                abandonedSessions++;
            }

            if (typeof log.durationMinutes === 'number' && log.durationMinutes > 0) {
                totalDurationMinutes += log.durationMinutes;
                durationLoggedCount++;
            }

            // Exercise processing (only from completed / partial sessions)
            if (status === 'COMPLETED' || status === 'PARTIALLY_COMPLETED') {
                const exercises = Array.isArray(log.exercises) ? log.exercises : [];

                exercises.forEach(ex => {
                    if (!ex || typeof ex !== 'object') return;
                    const exId = ex.exerciseId || ex.id || 'unknown_ex';
                    const exName = ex.exerciseName || ex.name || formatLabel(exId);
                    const exModel = db && typeof db.getExerciseById === 'function' ? db.getExerciseById(exId) : null;

                    const progModel = (ex.progressionModel || (exModel && exModel.progressionModel) || 'double_progression').toUpperCase();
                    const primMuscle = (exModel && Array.isArray(exModel.primaryMuscles) && exModel.primaryMuscles[0])
                        || (ex.primaryMuscle)
                        || 'general';

                    if (!exerciseAggMap.has(exId)) {
                        exerciseAggMap.set(exId, {
                            exerciseId: exId,
                            exerciseName: exName,
                            sessionsExposed: 0,
                            plannedSets: 0,
                            completedSets: 0,
                            plannedReps: 0,
                            actualReps: 0,
                            actualLoads: [],
                            actualRIRs: [],
                            plannedRIRs: [],
                            actualRPEs: [],
                            plannedRPEs: [],
                            progressionModel: progModel,
                            primaryMuscle: primMuscle,
                            dataQuality: 'SUFFICIENT'
                        });
                    }

                    const exAgg = exerciseAggMap.get(exId);
                    exAgg.sessionsExposed++;

                    const sets = Array.isArray(ex.sets) ? ex.sets : [];
                    sets.forEach(s => {
                        if (!s || typeof s !== 'object') return;
                        plannedSets++;
                        exAgg.plannedSets++;

                        const pRepMid = typeof s.plannedReps === 'number'
                            ? s.plannedReps
                            : parsePlannedRepMidpoint(s.plannedReps || ex.reps || '8-12');
                        plannedReps += pRepMid;
                        exAgg.plannedReps += pRepMid;

                        if (typeof s.plannedRIR === 'number') {
                            totalPlannedRIR += s.plannedRIR;
                            plannedRIRCount++;
                            exAgg.plannedRIRs.push(s.plannedRIR);
                        }
                        if (typeof s.plannedRPE === 'number') {
                            totalPlannedRPE += s.plannedRPE;
                            plannedRPECount++;
                            exAgg.plannedRPEs.push(s.plannedRPE);
                        }

                        if (s.completed === true) {
                            completedSets++;
                            exAgg.completedSets++;

                            const hasValidExplicitReps = typeof s.actualReps === 'number' && isFinite(s.actualReps) && !isNaN(s.actualReps);
                            const actReps = hasValidExplicitReps ? s.actualReps : ((s.actualReps === undefined || s.actualReps === null) ? pRepMid : 0);
                            actualReps += actReps;
                            exAgg.actualReps += actReps;

                            // Load computation (strictly separating kg and lb)
                            const unit = (s.unit || 'kg').toLowerCase();
                            if (unit !== 'bodyweight' && unit !== 'none') {
                                loadedSetsCount++;
                                if (typeof s.actualLoad === 'number' && s.actualLoad > 0 && isFinite(s.actualLoad) && !isNaN(s.actualLoad) && actReps > 0) {
                                    const loadVal = s.actualLoad * actReps;
                                    if (unit === 'lb') {
                                        loadTotals.lb += loadVal;
                                    } else {
                                        loadTotals.kg += loadVal;
                                    }
                                    loadedSetsWithLoadData++;
                                    exAgg.actualLoads.push({ load: s.actualLoad, unit: unit, reps: actReps });
                                }
                            }

                            // Effort metrics
                            if (typeof s.actualRIR === 'number' && s.actualRIR >= 0 && s.actualRIR <= 5) {
                                totalActualRIR += s.actualRIR;
                                rirLoggedCount++;
                                exAgg.actualRIRs.push(s.actualRIR);

                                const derivedRPE = 10 - s.actualRIR;
                                totalActualRPE += derivedRPE;
                                rpeLoggedCount++;
                                exAgg.actualRPEs.push(derivedRPE);
                            } else if (typeof s.actualRPE === 'number' && s.actualRPE >= 5 && s.actualRPE <= 10) {
                                totalActualRPE += s.actualRPE;
                                rpeLoggedCount++;
                                exAgg.actualRPEs.push(s.actualRPE);

                                const derivedRIR = Math.max(0, 10 - s.actualRPE);
                                totalActualRIR += derivedRIR;
                                rirLoggedCount++;
                                exAgg.actualRIRs.push(derivedRIR);
                            }
                        } else {
                            incompleteSets++;
                        }
                    });
                });
            }
        });

        // ----------------------------------------------------------------------
        // SESSION & VOLUME RATES
        // ----------------------------------------------------------------------
        const attendanceRate = plannedSessionsCount > 0
            ? Math.min(1, Math.max(0, Math.round((attemptedSessions / plannedSessionsCount) * 1000) / 1000))
            : 0;

        const sessionCompletionRate = plannedSessionsCount > 0
            ? Math.min(1, Math.max(0, Math.round((completedSessions / plannedSessionsCount) * 1000) / 1000))
            : 0;

        const setCompletionRate = plannedSets > 0
            ? Math.min(1, Math.max(0, Math.round((completedSets / plannedSets) * 1000) / 1000))
            : 0;

        // Raw ratio and clamped [0..1] rate
        const rawRepRatio = plannedReps > 0
            ? Math.round((actualReps / plannedReps) * 1000) / 1000
            : 0;
        const repAttainmentRatio = Math.max(0, rawRepRatio);
        const repAttainmentRate = Math.min(1.0, repAttainmentRatio);

        const loadDataCoverage = loadedSetsCount > 0
            ? Math.round((loadedSetsWithLoadData / loadedSetsCount) * 1000) / 1000
            : 1.0;

        const averageSessionDurationMinutes = durationLoggedCount > 0
            ? Math.round((totalDurationMinutes / durationLoggedCount) * 10) / 10
            : 0;

        const averageActualRIR = rirLoggedCount > 0
            ? Math.round((totalActualRIR / rirLoggedCount) * 10) / 10
            : null;

        const averagePlannedRIR = plannedRIRCount > 0
            ? Math.round((totalPlannedRIR / plannedRIRCount) * 10) / 10
            : null;

        const rirDeviation = (averageActualRIR !== null && averagePlannedRIR !== null)
            ? Math.round((averageActualRIR - averagePlannedRIR) * 10) / 10
            : null;

        const averageActualRPE = rpeLoggedCount > 0
            ? Math.round((totalActualRPE / rpeLoggedCount) * 10) / 10
            : null;

        const averagePlannedRPE = plannedRPECount > 0
            ? Math.round((totalPlannedRPE / plannedRPECount) * 10) / 10
            : null;

        const rpeDeviation = (averageActualRPE !== null && averagePlannedRPE !== null)
            ? Math.round((averageActualRPE - averagePlannedRPE) * 10) / 10
            : null;

        // Consistency Status
        let consistencyStatus = CONSISTENCY_STATUS.INSUFFICIENT_DATA;
        if (plannedSessionsCount > 0) {
            if (sessionCompletionRate >= CONSISTENCY_THRESHOLDS.EXCELLENT) {
                consistencyStatus = CONSISTENCY_STATUS.EXCELLENT;
            } else if (sessionCompletionRate >= CONSISTENCY_THRESHOLDS.GOOD) {
                consistencyStatus = CONSISTENCY_STATUS.GOOD;
            } else if (sessionCompletionRate >= CONSISTENCY_THRESHOLDS.MODERATE) {
                consistencyStatus = CONSISTENCY_STATUS.MODERATE;
            } else {
                consistencyStatus = CONSISTENCY_STATUS.LOW;
            }
        }

        // Weekly Performance Trend compared to previous week
        let performanceTrend = PERFORMANCE_TRENDS.INSUFFICIENT_DATA;
        if (prevWeekLogs.length > 0 && currentWeekLogs.length > 0) {
            const prevCompleted = prevWeekLogs.filter(l => l.status === 'COMPLETED').length;
            if (completedSessions > prevCompleted) {
                performanceTrend = PERFORMANCE_TRENDS.IMPROVING;
            } else if (completedSessions === prevCompleted) {
                performanceTrend = setCompletionRate >= 0.85 ? PERFORMANCE_TRENDS.STABLE : PERFORMANCE_TRENDS.MIXED;
            } else {
                performanceTrend = PERFORMANCE_TRENDS.DECLINING;
            }
        } else if (currentWeekLogs.length > 0 && setCompletionRate >= 0.85) {
            performanceTrend = PERFORMANCE_TRENDS.STABLE;
        }

        // Compute total training load (for backward compat: sum of primary loaded sets)
        const totalTrainingLoad = Math.round(loadTotals.kg + loadTotals.lb);

        // ----------------------------------------------------------------------
        // EXERCISE-LEVEL ANALYTICS
        // ----------------------------------------------------------------------
        const exerciseAnalytics = Array.from(exerciseAggMap.values()).map(ex => {
            const setCompRate = ex.plannedSets > 0 ? Math.min(1.0, Math.round((ex.completedSets / ex.plannedSets) * 1000) / 1000) : 0;
            const exRawRatio = ex.plannedReps > 0 ? Math.round((ex.actualReps / ex.plannedReps) * 1000) / 1000 : 0;
            const repAttRate = Math.min(1.0, Math.max(0, exRawRatio));

            const avgActRIR = ex.actualRIRs.length > 0 ? Math.round((ex.actualRIRs.reduce((a, b) => a + b, 0) / ex.actualRIRs.length) * 10) / 10 : null;
            const avgPlanRIR = ex.plannedRIRs.length > 0 ? Math.round((ex.plannedRIRs.reduce((a, b) => a + b, 0) / ex.plannedRIRs.length) * 10) / 10 : null;
            const exRirDev = (avgActRIR !== null && avgPlanRIR !== null) ? Math.round((avgActRIR - avgPlanRIR) * 10) / 10 : null;

            const avgActRPE = ex.actualRPEs.length > 0 ? Math.round((ex.actualRPEs.reduce((a, b) => a + b, 0) / ex.actualRPEs.length) * 10) / 10 : null;
            const avgPlanRPE = ex.plannedRPEs.length > 0 ? Math.round((ex.plannedRPEs.reduce((a, b) => a + b, 0) / ex.plannedRPEs.length) * 10) / 10 : null;
            const exRpeDev = (avgActRPE !== null && avgPlanRPE !== null) ? Math.round((avgActRPE - avgPlanRPE) * 10) / 10 : null;

            let avgActualLoad = null;
            if (ex.actualLoads.length > 0) {
                const totalL = ex.actualLoads.reduce((sum, l) => sum + l.load, 0);
                avgActualLoad = Math.round((totalL / ex.actualLoads.length) * 10) / 10;
            }

            let exTrend = PERFORMANCE_TRENDS.INSUFFICIENT_DATA;
            if (ex.sessionsExposed >= 2) {
                exTrend = setCompRate >= 0.95 && (exRirDev === null || exRirDev >= 0) ? PERFORMANCE_TRENDS.IMPROVING : (setCompRate >= 0.75 ? PERFORMANCE_TRENDS.STABLE : PERFORMANCE_TRENDS.DECLINING);
            } else if (setCompRate >= 0.85) {
                exTrend = PERFORMANCE_TRENDS.STABLE;
            }

            // Aggregate to muscle group map
            const muscleKey = ex.primaryMuscle;
            if (!muscleAggMap.has(muscleKey)) {
                muscleAggMap.set(muscleKey, {
                    muscleGroup: muscleKey,
                    plannedSets: 0,
                    completedSets: 0,
                    exerciseCount: 0
                });
            }
            const mAgg = muscleAggMap.get(muscleKey);
            mAgg.plannedSets += ex.plannedSets;
            mAgg.completedSets += ex.completedSets;
            mAgg.exerciseCount++;

            // Aggregate to progression model map
            const progKey = ex.progressionModel;
            if (!progressionAggMap.has(progKey)) {
                progressionAggMap.set(progKey, {
                    model: progKey,
                    exerciseCount: 0,
                    completedSets: 0,
                    plannedSets: 0,
                    actualReps: 0,
                    plannedReps: 0,
                    performanceTrend: PERFORMANCE_TRENDS.INSUFFICIENT_DATA
                });
            }
            const pAgg = progressionAggMap.get(progKey);
            pAgg.exerciseCount++;
            pAgg.completedSets += ex.completedSets;
            pAgg.plannedSets += ex.plannedSets;
            pAgg.actualReps += ex.actualReps;
            pAgg.plannedReps += ex.plannedReps;

            return {
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                sessionsExposed: ex.sessionsExposed,
                plannedSets: ex.plannedSets,
                completedSets: ex.completedSets,
                setCompletionRate: setCompRate,
                plannedReps: ex.plannedReps,
                actualReps: ex.actualReps,
                repAttainmentRatio: exRawRatio,
                repAttainmentRate: repAttRate,
                plannedLoad: null,
                actualLoad: avgActualLoad,
                loadChange: null,
                plannedRIR: avgPlanRIR,
                actualRIR: avgActRIR,
                rirDeviation: exRirDev,
                plannedRPE: avgPlanRPE,
                actualRPE: avgActRPE,
                rpeDeviation: exRpeDev,
                progressionModel: ex.progressionModel,
                performanceTrend: exTrend,
                dataQuality: ex.completedSets > 0 ? 'SUFFICIENT' : 'INSUFFICIENT_DATA'
            };
        });

        // ----------------------------------------------------------------------
        // MUSCLE-GROUP ANALYTICS
        // ----------------------------------------------------------------------
        const muscleGroupAnalytics = Array.from(muscleAggMap.values()).map(m => ({
            muscleGroup: formatLabel(m.muscleGroup),
            plannedSets: m.plannedSets,
            completedSets: m.completedSets,
            completionRate: m.plannedSets > 0 ? Math.min(1.0, Math.round((m.completedSets / m.plannedSets) * 1000) / 1000) : 0,
            exerciseCount: m.exerciseCount
        }));

        // ----------------------------------------------------------------------
        // PROGRESSION MODEL ANALYTICS
        // ----------------------------------------------------------------------
        const progressionAnalytics = Array.from(progressionAggMap.values()).map(p => {
            const rawRep = p.plannedReps > 0 ? Math.round((p.actualReps / p.plannedReps) * 1000) / 1000 : 0;
            const repAtt = Math.min(1.0, Math.max(0, rawRep));
            const setComp = p.plannedSets > 0 ? Math.min(1.0, Math.round((p.completedSets / p.plannedSets) * 1000) / 1000) : 0;
            return {
                model: p.model,
                exerciseCount: p.exerciseCount,
                completedSets: p.completedSets,
                plannedSets: p.plannedSets,
                repAttainment: repAtt,
                effortAdherence: setComp >= 0.85 ? 'HIGH' : (setComp >= 0.60 ? 'MODERATE' : 'LOW'),
                loadCoverage: 1.0,
                performanceTrend: setComp >= 0.85 ? PERFORMANCE_TRENDS.STABLE : PERFORMANCE_TRENDS.MIXED
            };
        });

        // ----------------------------------------------------------------------
        // QUALITY INDICATORS
        // ----------------------------------------------------------------------
        const qualityIndicators = [
            {
                type: QUALITY_INDICATOR_TYPES.SESSION_CONSISTENCY,
                status: consistencyStatus,
                value: sessionCompletionRate,
                rationale: plannedSessionsCount > 0
                    ? `Completed ${completedSessions} of ${plannedSessionsCount} planned sessions (${Math.round(sessionCompletionRate * 100)}%).`
                    : 'No sessions planned for evaluation.'
            },
            {
                type: QUALITY_INDICATOR_TYPES.SET_COMPLETION,
                status: setCompletionRate >= 0.90 ? QUALITY_STATUS.EXCELLENT : (setCompletionRate >= 0.75 ? QUALITY_STATUS.GOOD : (setCompletionRate >= 0.50 ? QUALITY_STATUS.MODERATE : QUALITY_STATUS.LOW)),
                value: setCompletionRate,
                rationale: plannedSets > 0
                    ? `Completed ${completedSets} of ${plannedSets} prescribed training sets (${Math.round(setCompletionRate * 100)}%).`
                    : 'No sets logged this week.'
            },
            {
                type: QUALITY_INDICATOR_TYPES.REP_ATTAINMENT,
                status: repAttainmentRate >= 0.95 ? QUALITY_STATUS.EXCELLENT : (repAttainmentRate >= 0.80 ? QUALITY_STATUS.GOOD : QUALITY_STATUS.MODERATE),
                value: repAttainmentRate,
                rationale: plannedReps > 0
                    ? `Attained ${actualReps} of ${plannedReps} planned reps (${Math.round(repAttainmentRate * 100)}% target attainment).`
                    : 'No reps logged this week.'
            },
            {
                type: QUALITY_INDICATOR_TYPES.EFFORT_ADHERENCE,
                status: averageActualRIR !== null ? (Math.abs(rirDeviation || 0) <= 1.0 ? QUALITY_STATUS.GOOD : QUALITY_STATUS.MODERATE) : QUALITY_STATUS.INSUFFICIENT_DATA,
                value: averageActualRIR,
                rationale: averageActualRIR !== null
                    ? `Average actual RIR was ${averageActualRIR} (target RIR ${averagePlannedRIR || 2}).`
                    : 'Effort metrics were not recorded.'
            },
            {
                type: QUALITY_INDICATOR_TYPES.LOAD_DATA_COVERAGE,
                status: loadDataCoverage >= 0.80 ? QUALITY_STATUS.GOOD : QUALITY_STATUS.MODERATE,
                value: loadDataCoverage,
                rationale: `Load data captured for ${Math.round(loadDataCoverage * 100)}% of applicable resistance sets.`
            },
            {
                type: QUALITY_INDICATOR_TYPES.PERFORMANCE_TREND,
                status: performanceTrend,
                value: performanceTrend,
                rationale: performanceTrend === PERFORMANCE_TRENDS.IMPROVING
                    ? 'Training volume and completed sets increased compared to previous week.'
                    : (performanceTrend === PERFORMANCE_TRENDS.STABLE ? 'Training consistency remained stable.' : 'Weekly training volume showed variation.')
            }
        ];

        // ----------------------------------------------------------------------
        // DETERMINISTIC INSIGHTS ENGINE
        // ----------------------------------------------------------------------
        const insights = [];
        if (plannedSessionsCount > 0 && attemptedSessions > 0) {
            insights.push(`You completed ${completedSessions} of ${plannedSessionsCount} planned training sessions this week (${Math.round(sessionCompletionRate * 100)}% completion rate).`);
        }
        if (plannedSets > 0) {
            insights.push(`Set completion reached ${Math.round(setCompletionRate * 100)}% across ${completedSets} completed sets.`);
        }
        if (averageActualRIR !== null) {
            insights.push(`Average training proximity to failure was RIR ${averageActualRIR} (RPE ${averageActualRPE}).`);
        }
        
        // Unit-explicit volume insight
        if (loadTotals.kg > 0 && loadTotals.lb > 0) {
            insights.push(`Accumulated total training volume load was ${Math.round(loadTotals.kg).toLocaleString()} kg-reps and ${Math.round(loadTotals.lb).toLocaleString()} lb-reps.`);
        } else if (loadTotals.kg > 0) {
            insights.push(`Accumulated total training volume load was ${Math.round(loadTotals.kg).toLocaleString()} kg-reps.`);
        } else if (loadTotals.lb > 0) {
            insights.push(`Accumulated total training volume load was ${Math.round(loadTotals.lb).toLocaleString()} lb-reps.`);
        } else if (completedSets > 0 && loadedSetsCount === 0) {
            insights.push('Training volume consisted entirely of bodyweight resistance.');
        }

        if (insights.length === 0) {
            insights.push('Complete training sessions this week to generate detailed performance analytics and insights.');
        }

        return {
            version: ENGINE_VERSION,
            weekStart: weekRange.weekStart,
            weekEnd: weekRange.weekEnd,
            previousWeekStart: prevWeekRange.weekStart,
            previousWeekEnd: prevWeekRange.weekEnd,
            summary: {
                plannedSessions: plannedSessionsCount,
                attemptedSessions,
                completedSessions,
                partiallyCompletedSessions,
                abandonedSessions,
                sessionCompletionRate,
                attendanceRate,
                plannedSets,
                completedSets,
                incompleteSets,
                setCompletionRate,
                plannedReps,
                actualReps,
                repAttainmentRatio,
                repAttainmentRate,
                totalTrainingLoad,
                loadTotals: {
                    kg: Math.round(loadTotals.kg),
                    lb: Math.round(loadTotals.lb)
                },
                loadDataCoverage,
                averageSessionDurationMinutes,
                averageActualRIR,
                averagePlannedRIR,
                rirDeviation,
                averageActualRPE,
                averagePlannedRPE,
                rpeDeviation,
                consistencyStatus,
                performanceTrend
            },
            exerciseAnalytics,
            muscleGroupAnalytics,
            progressionAnalytics,
            qualityIndicators,
            insights
        };
    }

    /**
     * Produces a deterministic JSON snapshot of weekly analytics.
     */
    function getDeterministicWeeklyAnalyticsSnapshot(analytics) {
        if (!analytics || typeof analytics !== 'object') return '{}';
        const clone = deepClone(analytics);
        return JSON.stringify(clone);
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        CONSISTENCY_STATUS,
        PERFORMANCE_TRENDS,
        QUALITY_STATUS,
        QUALITY_INDICATOR_TYPES,
        CONSISTENCY_THRESHOLDS,
        getWeekRange,
        getPreviousWeekRange,
        ingestAndFilterWeeklyLogs,
        analyzeWeeklyPerformance,
        getDeterministicWeeklyAnalyticsSnapshot,
        _internals: {
            deepClone,
            formatLabel,
            parsePlannedRepMidpoint
        }
    };
}));
