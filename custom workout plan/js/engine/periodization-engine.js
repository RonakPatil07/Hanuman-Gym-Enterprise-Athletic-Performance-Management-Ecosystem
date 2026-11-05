/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * 12-WEEK TRAINING ADAPTATION & PERIODIZATION ENGINE (v1.0)
 * ==============================================================================
 * 
 * Pure, deterministic engine structuring long-term macrocycle & mesocycle
 * periodization to answer:
 * "How should the overall training structure evolve across a 12-week block?"
 * 
 * Core Design Principles:
 * 1. PLANNING & PERIODIZATION ONLY: Constructs a 12-week structural roadmap without
 *    overwriting current session execution or mutating historical logs.
 * 2. GOAL & EXPERIENCE SENSITIVE: Goal-specific mesocycles (Muscle Gain, Strength,
 *    Weight Loss, Get Shredded, General Fitness) and experience constraints (Beginner,
 *    Intermediate, Advanced).
 * 3. BOUNDED VOLUME & EFFORT: Strictly conforms to Phase 4 volume bounds (6-18 sets/wk)
 *    and Phase 8 intensity rules (0-5 RIR), with recovery modifiers.
 * 4. SYSTEMATIC DELOAD INTEGRATION: Planned recovery weeks (Weeks 4, 8, 12) with -40%
 *    volume reduction and higher RIR targets.
 * 5. EVIDENCE-BASED BLOCK ADAPTATION: Evaluates bounded historical analytics (last 3-6 wks)
 *    to determine block adaptation states (HIGH_PERFORMANCE, MAINTAIN, REDUCE_LOAD, DEFERRED).
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PeriodizationEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';
    const DEFAULT_BLOCK_DURATION_WEEKS = 12;

    // ==========================================================================
    // 1. CONSTANTS & ENUMS
    // ==========================================================================

    const TRAINING_PHASES = Object.freeze({
        ACCUMULATION: 'ACCUMULATION',
        INTENSIFICATION: 'INTENSIFICATION',
        PEAK: 'PEAK',
        DELOAD: 'DELOAD',
        TRANSITION: 'TRANSITION',
        FOUNDATION: 'FOUNDATION'
    });

    const BLOCK_ADAPTATION_ACTIONS = Object.freeze({
        HIGH_PERFORMANCE: 'HIGH_PERFORMANCE',
        MAINTAIN: 'MAINTAIN',
        REDUCE_LOAD: 'REDUCE_LOAD',
        EXTEND_PHASE: 'EXTEND_PHASE',
        DEFERRED: 'DEFERRED'
    });

    const GOAL_PERIODIZATION_TEMPLATES = Object.freeze({
        'muscle-gain': {
            name: 'Hypertrophy Periodization',
            phaseSequence: [
                { phaseId: 'p1_accumulation', name: 'Volume Accumulation', startWeek: 1, endWeek: 3, type: TRAINING_PHASES.ACCUMULATION, rirTarget: 2, rirMin: 2, rirMax: 4, volumeMultiplier: 1.0, focus: 'High quality working set volume' },
                { phaseId: 'p1_deload', name: 'Strategic Deload', startWeek: 4, endWeek: 4, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Planned reduction in training demand' },
                { phaseId: 'p2_intensification', name: 'Metabolic & Load Intensification', startWeek: 5, endWeek: 7, type: TRAINING_PHASES.INTENSIFICATION, rirTarget: 2, rirMin: 1, rirMax: 3, volumeMultiplier: 1.05, focus: 'Overload progression & mechanical tension' },
                { phaseId: 'p2_deload', name: 'Strategic Deload', startWeek: 8, endWeek: 8, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Active recovery and movement maintenance' },
                { phaseId: 'p3_peak', name: 'Hypertrophy Realization / Peak', startWeek: 9, endWeek: 11, type: TRAINING_PHASES.PEAK, rirTarget: 1, rirMin: 1, rirMax: 2, volumeMultiplier: 1.1, focus: 'High density stimulus & peak effort' },
                { phaseId: 'p3_transition', name: 'Active Recovery & Transition', startWeek: 12, endWeek: 12, type: TRAINING_PHASES.TRANSITION, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Block review & preparation for next block' }
            ]
        },
        'strength': {
            name: 'Maximal Strength Periodization',
            phaseSequence: [
                { phaseId: 'p1_hypertrophy_base', name: 'Hypertrophy & Work Capacity Base', startWeek: 1, endWeek: 3, type: TRAINING_PHASES.ACCUMULATION, rirTarget: 2, rirMin: 2, rirMax: 4, volumeMultiplier: 1.0, focus: 'Submaximal volume & movement efficiency' },
                { phaseId: 'p1_deload', name: 'Structural Deload', startWeek: 4, endWeek: 4, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Planned volume reduction & recovery' },
                { phaseId: 'p2_strength_intense', name: 'Strength Intensification', startWeek: 5, endWeek: 7, type: TRAINING_PHASES.INTENSIFICATION, rirTarget: 2, rirMin: 1, rirMax: 3, volumeMultiplier: 0.95, focus: 'Heavy compound loads & bar speed' },
                { phaseId: 'p2_deload', name: 'Structural Deload', startWeek: 8, endWeek: 8, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Recovery prioritization between intense phases' },
                { phaseId: 'p3_peaking', name: 'Maximal Force Peaking', startWeek: 9, endWeek: 11, type: TRAINING_PHASES.PEAK, rirTarget: 1, rirMin: 1, rirMax: 2, volumeMultiplier: 0.9, focus: 'Peak mechanical tension & technical precision' },
                { phaseId: 'p3_transition', name: 'Active Transition', startWeek: 12, endWeek: 12, type: TRAINING_PHASES.TRANSITION, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.5, deload: true, focus: 'Testing realization & block reset' }
            ]
        },
        'weight-loss': {
            name: 'Metabolic & Muscle Preservation Periodization',
            phaseSequence: [
                { phaseId: 'p1_retention_base', name: 'Muscle Retention Foundation', startWeek: 1, endWeek: 3, type: TRAINING_PHASES.FOUNDATION, rirTarget: 3, rirMin: 2, rirMax: 4, volumeMultiplier: 0.95, focus: 'Sustainable resistance training baseline' },
                { phaseId: 'p1_deload', name: 'Metabolic Deload', startWeek: 4, endWeek: 4, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Recovery priority & training demand reduction' },
                { phaseId: 'p2_density', name: 'Density & Volume Progression', startWeek: 5, endWeek: 7, type: TRAINING_PHASES.INTENSIFICATION, rirTarget: 2, rirMin: 1, rirMax: 3, volumeMultiplier: 1.0, focus: 'Training density & lean tissue stimulus' },
                { phaseId: 'p2_deload', name: 'Metabolic Deload', startWeek: 8, endWeek: 8, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Fatigue dissipation & movement practice' },
                { phaseId: 'p3_conditioning', name: 'Work Capacity Peak', startWeek: 9, endWeek: 11, type: TRAINING_PHASES.PEAK, rirTarget: 2, rirMin: 1, rirMax: 3, volumeMultiplier: 1.0, focus: 'Metabolic stimulus & strength preservation' },
                { phaseId: 'p3_transition', name: 'Recovery Transition', startWeek: 12, endWeek: 12, type: TRAINING_PHASES.TRANSITION, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Long-term sustainability reset' }
            ]
        },
        'get-shredded': {
            name: 'Definition & Density Periodization',
            phaseSequence: [
                { phaseId: 'p1_shred_base', name: 'Lean Mass Anchoring', startWeek: 1, endWeek: 3, type: TRAINING_PHASES.ACCUMULATION, rirTarget: 2, rirMin: 2, rirMax: 3, volumeMultiplier: 1.0, focus: 'Full spectrum hypertrophy preservation' },
                { phaseId: 'p1_deload', name: 'Recovery Deload', startWeek: 4, endWeek: 4, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Fatigue dissipation & recovery support' },
                { phaseId: 'p2_shred_intense', name: 'Intensity & Hardening', startWeek: 5, endWeek: 7, type: TRAINING_PHASES.INTENSIFICATION, rirTarget: 2, rirMin: 1, rirMax: 3, volumeMultiplier: 1.0, focus: 'Heavy compound preservation' },
                { phaseId: 'p2_deload', name: 'Recovery Deload', startWeek: 8, endWeek: 8, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Fatigue management & recovery' },
                { phaseId: 'p3_shred_peak', name: 'Conditioning Peak', startWeek: 9, endWeek: 11, type: TRAINING_PHASES.PEAK, rirTarget: 1, rirMin: 1, rirMax: 2, volumeMultiplier: 1.05, focus: 'Peak muscular definition' },
                { phaseId: 'p3_transition', name: 'Maintenance Transition', startWeek: 12, endWeek: 12, type: TRAINING_PHASES.TRANSITION, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Active maintenance reset' }
            ]
        },
        'general-fitness': {
            name: 'Balanced Physical Capacity Periodization',
            phaseSequence: [
                { phaseId: 'p1_foundation', name: 'Movement Quality & Foundation', startWeek: 1, endWeek: 3, type: TRAINING_PHASES.FOUNDATION, rirTarget: 3, rirMin: 2, rirMax: 4, volumeMultiplier: 0.95, focus: 'Movement patterning & work capacity' },
                { phaseId: 'p1_deload', name: 'Active Recovery Week', startWeek: 4, endWeek: 4, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.65, deload: true, focus: 'Movement recovery & lower training load' },
                { phaseId: 'p2_strength_endurance', name: 'Strength-Endurance Progression', startWeek: 5, endWeek: 7, type: TRAINING_PHASES.ACCUMULATION, rirTarget: 2, rirMin: 1, rirMax: 3, volumeMultiplier: 1.0, focus: 'Progressive overload across compound lifts' },
                { phaseId: 'p2_deload', name: 'Active Recovery Week', startWeek: 8, endWeek: 8, type: TRAINING_PHASES.DELOAD, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.65, deload: true, focus: 'Active recovery and joint relief' },
                { phaseId: 'p3_functional_peak', name: 'Functional Performance', startWeek: 9, endWeek: 11, type: TRAINING_PHASES.PEAK, rirTarget: 2, rirMin: 1, rirMax: 3, volumeMultiplier: 1.0, focus: 'Total body fitness realization' },
                { phaseId: 'p3_transition', name: 'Transition & Reset', startWeek: 12, endWeek: 12, type: TRAINING_PHASES.TRANSITION, rirTarget: 4, rirMin: 3, rirMax: 5, volumeMultiplier: 0.6, deload: true, focus: 'Sustainable long-term habits' }
            ]
        }
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

    function parseStartDate(refDate) {
        let d;
        if (typeof refDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(refDate)) {
            const [y, m, day] = refDate.split('-').map(Number);
            d = new Date(y, m - 1, day);
        } else if (refDate) {
            d = new Date(refDate);
        } else {
            d = new Date(2026, 7, 17); // Fixed deterministic default start Monday (Aug 17, 2026)
        }

        // Snap to Monday of that week in local context
        const dayOfWeek = d.getDay();
        const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // ==========================================================================
    // 3. VOLUME & RECOVERY BOUNDS DERIVATION
    // ==========================================================================

    /**
     * Derives weekly target volume set ranges per muscle group from experience level.
     * Conforms strictly to Phase 4 Training Rules Engine bounds.
     */
    function getExperienceVolumeBounds(experienceLevel) {
        const exp = (experienceLevel || 'intermediate').toLowerCase();
        switch (exp) {
            case 'beginner':
                return { minSetsPerMuscle: 6, maxSetsPerMuscle: 10, baselineMultiplier: 0.9, name: 'Beginner Conservative' };
            case 'advanced':
                return { minSetsPerMuscle: 10, maxSetsPerMuscle: 18, baselineMultiplier: 1.1, name: 'Advanced High Capacity' };
            case 'intermediate':
            default:
                return { minSetsPerMuscle: 8, maxSetsPerMuscle: 14, baselineMultiplier: 1.0, name: 'Intermediate Structured' };
        }
    }

    /**
     * Calculates recovery modifier from canonical profile signals (sleep, daily activity).
     */
    function calculateRecoveryModifier(profile) {
        let modifier = 1.0;
        const reasons = [];

        if (!profile || typeof profile !== 'object') {
            return { modifier: 1.0, reasons: ['Standard recovery baseline.'] };
        }

        const recovery = profile.recoveryCapacity || {};
        const sleepHours = typeof recovery.sleepHours === 'number' ? recovery.sleepHours : (typeof profile.sleepHours === 'number' ? profile.sleepHours : 8);
        const activityLevel = (recovery.dailyActivityLevel || profile.dailyActivityLevel || 'moderate').toLowerCase();

        if (sleepHours < 6) {
            modifier *= 0.85;
            reasons.push('Sub-optimal sleep (<6h) reduces weekly volume capacity by 15% to manage planned training demand.');
        } else if (sleepHours >= 8) {
            reasons.push('Adequate sleep (8h+) supports sustained volume overload progression.');
        }

        if (activityLevel === 'very-active' || activityLevel === 'high') {
            modifier *= 0.90;
            reasons.push('High occupational/daily activity applies a 10% volume buffer to preserve recovery capacity.');
        }

        return {
            modifier: Math.round(modifier * 100) / 100,
            reasons
        };
    }

    // ==========================================================================
    // 4. EVIDENCE-BASED ADAPTATION EVALUATION
    // ==========================================================================

    /**
     * Evaluates bounded historical weekly performance logs (last 3-6 weeks).
     * Strictly separate from Phase 11 session-level adaptive decisions.
     */
    function evaluateBlockAdaptation(historicalLogs, referenceDate) {
        if (!Array.isArray(historicalLogs) || historicalLogs.length === 0) {
            return {
                status: BLOCK_ADAPTATION_ACTIONS.DEFERRED,
                adaptationDecision: BLOCK_ADAPTATION_ACTIONS.DEFERRED,
                planningEffect: 'PRESERVE_ROADMAP',
                programMutation: false,
                evidenceWeeks: 0,
                rationale: 'Insufficient completed weekly history to modify 12-week macrocycle structure. Preserving planned periodization roadmap.'
            };
        }

        // Ingest completed/partial logs from bounded window (max 6 weeks)
        const completedLogs = historicalLogs.filter(l => l && typeof l === 'object' && (l.status === 'COMPLETED' || l.status === 'PARTIALLY_COMPLETED'));
        const evidenceWeeks = Math.min(6, completedLogs.length);

        if (evidenceWeeks === 0) {
            return {
                status: BLOCK_ADAPTATION_ACTIONS.DEFERRED,
                adaptationDecision: BLOCK_ADAPTATION_ACTIONS.DEFERRED,
                planningEffect: 'PRESERVE_ROADMAP',
                programMutation: false,
                evidenceWeeks: 0,
                rationale: 'Insufficient completed weekly history to modify 12-week macrocycle structure. Preserving planned periodization roadmap.'
            };
        }

        if (evidenceWeeks < 2) {
            return {
                status: BLOCK_ADAPTATION_ACTIONS.MAINTAIN,
                adaptationDecision: BLOCK_ADAPTATION_ACTIONS.MAINTAIN,
                planningEffect: 'MAINTAIN_ROADMAP',
                programMutation: false,
                evidenceWeeks,
                rationale: 'Early block execution phase (1 completed week). Continue the current planned phase structure without additional block-level adjustment.'
            };
        }

        // Compute completion and fatigue adherence across bounded history
        let totalSetsPlanned = 0;
        let totalSetsCompleted = 0;
        let totalRIR = 0;
        let rirCount = 0;

        completedLogs.slice(-6).forEach(log => {
            if (Array.isArray(log.exercises)) {
                log.exercises.forEach(ex => {
                    if (Array.isArray(ex.sets)) {
                        ex.sets.forEach(s => {
                            totalSetsPlanned++;
                            if (s.completed === true) {
                                totalSetsCompleted++;
                                if (typeof s.actualRIR === 'number') {
                                    totalRIR += s.actualRIR;
                                    rirCount++;
                                }
                            }
                        });
                    }
                });
            }
        });

        const overallSetCompRate = totalSetsPlanned > 0 ? (totalSetsCompleted / totalSetsPlanned) : 0;
        const avgRIR = rirCount > 0 ? (totalRIR / rirCount) : null;

        if (overallSetCompRate >= 0.90 && (avgRIR === null || avgRIR >= 1.0)) {
            return {
                status: BLOCK_ADAPTATION_ACTIONS.HIGH_PERFORMANCE,
                adaptationDecision: BLOCK_ADAPTATION_ACTIONS.HIGH_PERFORMANCE,
                planningEffect: 'CONTINUE_PLANNED_PROGRESSION',
                programMutation: false,
                evidenceWeeks,
                rationale: `Strong training execution across the last ${evidenceWeeks} weeks (${Math.round(overallSetCompRate * 100)}% set completion). Evidence supports continuing the planned progression.`
            };
        } else if (overallSetCompRate < 0.60 || (avgRIR !== null && avgRIR < 0.5)) {
            return {
                status: BLOCK_ADAPTATION_ACTIONS.REDUCE_LOAD,
                adaptationDecision: BLOCK_ADAPTATION_ACTIONS.REDUCE_LOAD,
                planningEffect: 'REDUCE_TRAINING_DEMAND',
                programMutation: false,
                evidenceWeeks,
                rationale: `Sub-target set completion (${Math.round(overallSetCompRate * 100)}%) or high proximity to failure detected. Flags the next applicable planning phase for reduced training demand.`
            };
        } else if (overallSetCompRate >= 0.60 && overallSetCompRate < 0.75) {
            return {
                status: BLOCK_ADAPTATION_ACTIONS.EXTEND_PHASE,
                adaptationDecision: BLOCK_ADAPTATION_ACTIONS.EXTEND_PHASE,
                planningEffect: 'RETAIN_PHASE_EMPHASIS',
                programMutation: false,
                evidenceWeeks,
                rationale: `Moderate completion (${Math.round(overallSetCompRate * 100)}%) across ${evidenceWeeks} weeks. Retain the current phase emphasis for additional planning exposure before intensification.`
            };
        }

        return {
            status: BLOCK_ADAPTATION_ACTIONS.MAINTAIN,
            adaptationDecision: BLOCK_ADAPTATION_ACTIONS.MAINTAIN,
            planningEffect: 'MAINTAIN_ROADMAP',
            programMutation: false,
            evidenceWeeks,
            rationale: `Consistent progress across the last ${evidenceWeeks} weeks (${Math.round(overallSetCompRate * 100)}% set completion). Continue the current planned phase structure without additional block-level adjustment.`
        };
    }

    // ==========================================================================
    // 5. CORE 12-WEEK BLOCK GENERATOR
    // ==========================================================================

    /**
     * Generates a deterministic 12-week periodized training roadmap.
     * 
     * @param {Object} profile Canonical user profile
     * @param {Object} [program] Current workout program
     * @param {string|Date} [referenceDate] Explicit start date (defaults to Monday)
     * @param {Object[]} [historicalLogs] Historical workout logs (read-only)
     * @param {Object} [options] Custom generation options
     * @returns {Object} Structured 12-week training block
     */
    function generate12WeekTrainingBlock(profile, program, referenceDate, historicalLogs = [], options = {}) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const rawGoal = safeProfile.goal || (safeProfile.goals && safeProfile.goals.primary) || 'muscle-gain';
        const goal = typeof rawGoal === 'string' ? rawGoal.toLowerCase() : 'muscle-gain';

        const rawExp = safeProfile.experienceLevel || safeProfile.experience || (safeProfile.trainingBackground && safeProfile.trainingBackground.experienceLevel) || 'intermediate';
        const experience = typeof rawExp === 'string' ? rawExp.toLowerCase() : 'intermediate';

        const durationWeeks = (typeof options.durationWeeks === 'number' && options.durationWeeks > 0)
            ? options.durationWeeks
            : DEFAULT_BLOCK_DURATION_WEEKS;

        const startMonday = parseStartDate(referenceDate);
        const endSunday = new Date(startMonday.getTime() + (durationWeeks * 7 * 24 * 60 * 60 * 1000) - 1);

        const expBounds = getExperienceVolumeBounds(experience);
        const recoveryInfo = calculateRecoveryModifier(safeProfile);

        // Select periodization template
        const template = GOAL_PERIODIZATION_TEMPLATES[goal] || GOAL_PERIODIZATION_TEMPLATES['muscle-gain'];

        const blockId = `block_${goal.replace(/[^a-zA-Z0-9]/g, '_')}_${experience.replace(/[^a-zA-Z0-9]/g, '_')}_${durationWeeks}w`;

        const personalizationReasons = [];
        personalizationReasons.push(`12-Week ${template.name} structured specifically for your ${formatLabel(goal)} goal.`);
        personalizationReasons.push(`Volume capacity calibrated to ${expBounds.name} level (${expBounds.minSetsPerMuscle}-${expBounds.maxSetsPerMuscle} sets/muscle/week).`);
        recoveryInfo.reasons.forEach(r => personalizationReasons.push(r));
        personalizationReasons.push('Planned strategic deload weeks at Week 4, 8, and 12 to reduce planned training demand and support continuous adaptation.');

        // Build Phases (exactly 6 phases)
        const phases = template.phaseSequence.map(ph => {
            const isDeload = !!ph.deload;
            const volTarget = isDeload
                ? `Reduced Volume (${Math.round(ph.volumeMultiplier * 100)}% of baseline)`
                : `Progressive Volume (${Math.round(ph.volumeMultiplier * 100)}% of baseline)`;

            return {
                phaseId: ph.phaseId,
                name: ph.name,
                type: ph.type,
                startWeek: ph.startWeek,
                endWeek: ph.endWeek,
                objective: ph.focus,
                volumeStrategy: volTarget,
                intensityStrategy: `Target RIR ${ph.rirTarget} (Allowable RIR ${ph.rirMin}-${ph.rirMax})`,
                rirStrategy: `Proximity to failure bounded between RIR ${ph.rirMin} and ${ph.rirMax}`,
                progressionStrategy: isDeload ? 'Active recovery & load maintenance' : 'Progressive overload via sets, load, and target rep attainment',
                recoveryStrategy: isDeload ? 'High priority recovery & reduced training demand' : 'Standard inter-session recovery protocol',
                deload: isDeload,
                rationale: isDeload
                    ? 'Planned deload phase to reduce accumulated fatigue and maintain movement practice with lower training demand.'
                    : `Dedicated ${formatLabel(ph.type)} mesocycle focusing on ${ph.focus.toLowerCase()}.`
            };
        });

        // Build Weeks (exactly 12 weeks: 1 to 12)
        const weeks = [];
        for (let w = 1; w <= durationWeeks; w++) {
            const phaseDef = template.phaseSequence.find(p => w >= p.startWeek && w <= p.endWeek)
                || template.phaseSequence[template.phaseSequence.length - 1];

            const isDeload = !!phaseDef.deload;
            const weekStart = new Date(startMonday.getTime() + ((w - 1) * 7 * 24 * 60 * 60 * 1000));
            const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);

            const adjustedSetsMin = Math.round(expBounds.minSetsPerMuscle * phaseDef.volumeMultiplier * recoveryInfo.modifier);
            const adjustedSetsMax = Math.round(expBounds.maxSetsPerMuscle * phaseDef.volumeMultiplier * recoveryInfo.modifier);

            weeks.push({
                weekNumber: w,
                phaseId: phaseDef.phaseId,
                phaseName: phaseDef.name,
                phaseType: phaseDef.type,
                weekStart: formatLocalISOString(weekStart),
                weekEnd: formatLocalISOString(weekEnd),
                objective: isDeload ? 'Deload & Fatigue Management' : phaseDef.focus,
                volumeTarget: `${adjustedSetsMin}-${adjustedSetsMax} sets / muscle group / week`,
                intensityTarget: `Target Effort: RIR ${phaseDef.rirTarget} (RPE ${10 - phaseDef.rirTarget})`,
                targetRIR: phaseDef.rirTarget,
                minRIR: phaseDef.rirMin,
                maxRIR: phaseDef.rirMax,
                progressionFocus: isDeload
                    ? 'Maintain form & reduce training load'
                    : (phaseDef.type === TRAINING_PHASES.INTENSIFICATION ? 'Load & tension overload' : 'Volume & repetition attainment'),
                recoveryFocus: isDeload ? 'High Recovery (Active Rest)' : (recoveryInfo.modifier < 1.0 ? 'Enhanced Sleep & Rest' : 'Standard Recovery'),
                deload: isDeload,
                status: 'PLANNED',
                adaptationInputs: {
                    experienceModifier: expBounds.baselineMultiplier,
                    recoveryModifier: recoveryInfo.modifier
                },
                rationale: isDeload
                    ? `Week ${w} is a scheduled deload. Reduce working-set volume by ~40% while preserving movement execution.`
                    : `Week ${w} of 12-week block in ${phaseDef.name} phase.`
            });
        }

        // Adaptation rules evaluation from bounded history
        const adaptationResult = evaluateBlockAdaptation(historicalLogs, referenceDate);

        // Quality Metrics
        const deloadCount = weeks.filter(w => w.deload).length;
        const qualityMetrics = {
            totalWeeks: durationWeeks,
            phaseCount: phases.length,
            deloadWeeksCount: deloadCount,
            minPlannedRIR: 1,
            maxPlannedRIR: 5,
            volumeRange: `${Math.round(expBounds.minSetsPerMuscle * recoveryInfo.modifier)}-${Math.round(expBounds.maxSetsPerMuscle * recoveryInfo.modifier)} sets/muscle/week`,
            adaptationStatus: adaptationResult.status,
            evidenceWeeksAnalyzed: adaptationResult.evidenceWeeks
        };

        return {
            version: ENGINE_VERSION,
            blockId,
            durationWeeks,
            startDate: formatLocalISOString(startMonday),
            endDate: formatLocalISOString(endSunday),
            goal,
            experienceLevel: experience,
            phases,
            weeks,
            progressionStrategy: {
                primaryModel: 'DOUBLE_PROGRESSION',
                applicableModels: ['DOUBLE_PROGRESSION', 'LOAD_PROGRESSION', 'REP_PROGRESSION', 'RIR_PROGRESSION', 'HOLD_PROGRESSION', 'CONSERVATIVE_PROGRESSION'],
                phaseEmphasis: {
                    ACCUMULATION: 'Volume + Rep Range Attainment',
                    INTENSIFICATION: 'Load & Mechanical Tension Overload',
                    PEAK: 'Performance Realization & Effort Density',
                    DELOAD: 'Recovery & Work Quality Maintenance'
                }
            },
            deloadStrategy: {
                frequencyWeeks: 4,
                volumeReductionPercent: 40,
                targetRIRIncrease: 1.0,
                rationale: 'Every 4th week delivers scheduled fatigue management to reduce planned training demand and prioritize recovery.'
            },
            adaptationRules: [
                {
                    status: adaptationResult.status,
                    adaptationDecision: adaptationResult.adaptationDecision,
                    planningEffect: adaptationResult.planningEffect,
                    programMutation: false,
                    evidenceWeeks: adaptationResult.evidenceWeeks,
                    rationale: adaptationResult.rationale
                }
            ],
            qualityMetrics,
            personalizationReasons
        };
    }

    /**
     * Produces a deterministic JSON snapshot of the periodization block.
     * Excludes runtime noise or volatile fields.
     */
    function getDeterministicPeriodizationSnapshot(block) {
        if (!block || typeof block !== 'object') return '{}';
        const clone = deepClone(block);
        return JSON.stringify(clone);
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        DEFAULT_BLOCK_DURATION_WEEKS,
        TRAINING_PHASES,
        BLOCK_ADAPTATION_ACTIONS,
        GOAL_PERIODIZATION_TEMPLATES,
        generate12WeekTrainingBlock,
        getDeterministicPeriodizationSnapshot,
        _internals: {
            deepClone,
            formatLabel,
            formatLocalISOString,
            parseStartDate,
            getExperienceVolumeBounds,
            calculateRecoveryModifier,
            evaluateBlockAdaptation
        }
    };
}));
