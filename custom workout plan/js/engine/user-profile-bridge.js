/**
 * ==============================================================================
 * HANUMAN GYM — TRAINEE PROFILE & "MY SPACE" SYNCHRONIZATION BRIDGE (PHASE 2)
 * Zero-Regression Data Bridge linking Custom AI Blueprints with My Space Dashboard
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.UserProfileBridgeEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const BRIDGE_VERSION = '1.0';
    const STORAGE_KEY_ACTIVE_PROGRAM = 'fitphysique_active_program';
    const STORAGE_KEY_WORKOUT_HISTORY = 'fitphysique_workout_logs';
    const STORAGE_KEY_USER_PROFILE = 'fitphysique_user_profile';

    /**
     * Synchronizes a generated workout program to the user's My Space storage.
     * @param {Object} program - Generated workout program
     * @param {Object} userProfile - User biometric profile
     * @returns {{ success: boolean, timestamp: string, programId: string }}
     */
    function syncProgramToMySpace(program, userProfile) {
        if (!program) {
            return { success: false, error: 'Invalid program object' };
        }

        try {
            const timestamp = new Date().toISOString();
            const payload = {
                version: BRIDGE_VERSION,
                syncedAt: timestamp,
                programId: program.programId || 'hg_prog_' + Date.now(),
                programTitle: program.programTitle || 'Personalized AI Mesocycle',
                goal: userProfile?.goals?.primary || userProfile?.goals?.primaryGoal || userProfile?.goal || userProfile?.fitnessGoal || program.goal || 'General Fitness',
                experience: userProfile?.performance?.experienceLevel || userProfile?.experienceLevel || userProfile?.experience || 'Intermediate',
                frequency: program.trainingFrequency || program.sessions?.length || 4,
                sessions: program.sessions || [],
                periodization: program.periodization || null,
                metrics: {
                    bmr: userProfile?.biometrics?.bmr || userProfile?.bmr || null,
                    tdee: userProfile?.biometrics?.tdee || userProfile?.tdee || null,
                    targetCalories: userProfile?.nutrition?.targetCalories || userProfile?.targetCalories || null,
                    weeklyVolumeSets: program.sessions?.reduce((acc, s) => acc + (s.exercises?.reduce((eAcc, e) => eAcc + (e.sets || 0), 0) || 0), 0) || 0
                }
            };

            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_ACTIVE_PROGRAM, JSON.stringify(payload));
                if (userProfile) {
                    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(userProfile));
                }
            }

            return {
                success: true,
                timestamp: timestamp,
                programId: payload.programId,
                payload: payload
            };
        } catch (err) {
            console.error('[UserProfileBridge] Sync error:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Retrieves the active workout program from My Space storage.
     * @returns {Object|null}
     */
    function getActiveProgramFromMySpace() {
        if (typeof localStorage === 'undefined') return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_PROGRAM);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('[UserProfileBridge] Failed to read active program:', e);
            return null;
        }
    }

    /**
     * Calculates an analytics snapshot from active workout logs and program.
     * @returns {{ totalWorkouts: number, totalTonnage: number, streakDays: number, activeProgram: Object|null }}
     */
    function getWorkoutAnalyticsSnapshot() {
        const active = getActiveProgramFromMySpace();
        let logs = [];
        if (typeof localStorage !== 'undefined') {
            try {
                logs = JSON.parse(localStorage.getItem(STORAGE_KEY_WORKOUT_HISTORY) || '[]');
            } catch(e) {
                logs = [];
            }
        }

        const completedLogs = logs.filter(l => l && l.status === 'COMPLETED');
        const totalTonnage = completedLogs.reduce((acc, l) => acc + (parseFloat(l.metrics?.totalTonnage) || 0), 0);

        return {
            totalWorkouts: completedLogs.length,
            totalTonnage: Math.round(totalTonnage),
            completedSessions: completedLogs.length,
            activeProgram: active,
            hasActiveProgram: !!active
        };
    }

    /**
     * Clears active program data safely.
     */
    function clearActiveProgram() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY_ACTIVE_PROGRAM);
        }
        return { success: true };
    }

    return {
        BRIDGE_VERSION,
        STORAGE_KEY_ACTIVE_PROGRAM,
        STORAGE_KEY_WORKOUT_HISTORY,
        STORAGE_KEY_USER_PROFILE,
        syncProgramToMySpace,
        getActiveProgramFromMySpace,
        getWorkoutAnalyticsSnapshot,
        clearActiveProgram
    };
}));
