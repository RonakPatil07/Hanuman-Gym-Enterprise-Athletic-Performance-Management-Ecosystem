/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * DETERMINISTIC TRAINING RULES ENGINE MODULE (v1.0)
 * ==============================================================================
 * 
 * Interprets the Canonical User Training Profile and Exercise Intelligence
 * taxonomies to generate a structured, deterministic set of Training Requirements
 * for the future Dynamic Program Generator.
 * 
 * Design Principles:
 * 1. 100% PURE & DETERMINISTIC: Identical profiles always generate identical requirements.
 * 2. HIERARCHICAL PRECEDENCE: Safety & equipment constraints strictly override preferences.
 * 3. TRANSPARENT PERSONALIZATION: Every rule decision outputs a structured 'reason'.
 * 4. HEURISTIC REALISM: Volume, frequency, and time budgets match athletic programming science.
 * 5. ISOLATED & SAFE: Operates alongside the legacy matching engine with zero regressions.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TrainingRulesEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const RULES_VERSION = '1.0';

    // ==========================================================================
    // 1. DETERMINISTIC MAPPING TABLES
    // ==========================================================================

    const FOCUS_AREA_MUSCLE_MAP = Object.freeze({
        'weak-chest': ['chest', 'upper_chest'],
        'chest': ['chest', 'upper_chest'],
        'slim-arms': ['biceps', 'triceps', 'forearms'],
        'arms': ['biceps', 'triceps'],
        'beer-belly': ['abs', 'obliques'],
        'core': ['abs', 'obliques'],
        'abs': ['abs'],
        'slim-legs': ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        'legs': ['quadriceps', 'hamstrings', 'glutes'],
        'broad-shoulders': ['side_delts', 'rear_delts'],
        'shoulders': ['front_delts', 'side_delts', 'rear_delts'],
        'back': ['lats', 'upper_back']
    });

    const INJURY_CONSTRAINT_MAP = Object.freeze({
        'sensitive-knees': {
            restrictedConstraints: ['requires_deep_knee_flexion'],
            recommendations: ['Prefer stable leg press or goblet squat over heavy axial barbell squats', 'Avoid extreme ballistic knee deceleration'],
            reason: 'User reported sensitive knees / knee joint limitations.'
        },
        'knee': {
            restrictedConstraints: ['requires_deep_knee_flexion'],
            recommendations: ['Avoid deep open-chain shearing', 'Emphasize hip-dominant posterior chain'],
            reason: 'User reported knee history.'
        },
        'sensitive-back': {
            restrictedConstraints: ['requires_spinal_loading'],
            recommendations: ['Limit axial lumbar spinal compression', 'Prefer chest-supported rows and supported leg presses over standing barbell rows'],
            reason: 'User reported sensitive lower back.'
        },
        'back': {
            restrictedConstraints: ['requires_spinal_loading'],
            recommendations: ['Moderate axial lumbar compression', 'Ensure strict core bracing'],
            reason: 'User reported back history.'
        },
        'shoulder': {
            restrictedConstraints: ['requires_overhead_position', 'requires_shoulder_flexion'],
            recommendations: ['Limit excessive wide-grip overhead pressing', 'Emphasize scapular plane raises'],
            reason: 'User reported shoulder limitations.'
        },
        'wrist': {
            restrictedConstraints: ['requires_grip'],
            recommendations: ['Use neutral wrist angles or straps where needed'],
            reason: 'User reported wrist sensitivity.'
        }
    });

    // ==========================================================================
    // 2. HELPER FUNCTIONS
    // ==========================================================================

    /**
     * Determines the optimal training split based on available days and experience.
     * @param {number} dayCount 
     * @param {string} goal 
     * @param {string} experience 
     * @returns {{ splitType: string, splitName: string, description: string }}
     */
    function determineSplitStrategy(dayCount, goal, experience) {
        if (dayCount <= 2) {
            return {
                splitType: 'full_body',
                splitName: '2-Day Full Body Blueprint',
                description: 'Full body stimulation per session with maximal systemic recovery between workouts.'
            };
        }
        if (dayCount === 3) {
            return {
                splitType: 'full_body',
                splitName: '3-Day Full Body Rotation',
                description: 'High-frequency whole body training with alternating compound movement emphases.'
            };
        }
        if (dayCount === 4) {
            return {
                splitType: 'upper_lower',
                splitName: '4-Day Upper / Lower Split',
                description: 'Optimal balance of localized muscle frequency, volume density, and systemic recovery.'
            };
        }
        if (dayCount === 5) {
            return {
                splitType: 'upper_lower_specialization',
                splitName: '5-Day Upper / Lower + Weak-Point Focus',
                description: 'Dedicated upper/lower foundation with an accessory specialization day for lagging areas.'
            };
        }
        return {
            splitType: 'push_pull_legs',
            splitName: '6-Day Push / Pull / Legs (PPL) Split',
            description: 'Advanced periodized movement pattern split allowing high localized volume and optimal inter-session recovery.'
        };
    }

    /**
     * Calculates duration budget breakdown from string preference.
     * @param {string|null} durationPref 
     * @returns {{ totalMinutes: number, warmupMinutes: number, mainTrainingMinutes: number, cooldownMinutes: number, targetExerciseCount: { min: number, max: number } }}
     */
    function calculateSessionBudget(durationPref) {
        const str = String(durationPref || '').toLowerCase();

        if (str.includes('20 min or less') || str.includes('20-min-or-less') || str.includes('<20') || str === '20') {
            return {
                totalMinutes: 20,
                warmupMinutes: 3,
                mainTrainingMinutes: 14,
                cooldownMinutes: 3,
                targetExerciseCount: { min: 3, max: 4 }
            };
        }
        if (str.includes('20 - 40') || str.includes('20-40') || str.includes('30')) {
            return {
                totalMinutes: 35,
                warmupMinutes: 5,
                mainTrainingMinutes: 25,
                cooldownMinutes: 5,
                targetExerciseCount: { min: 4, max: 5 }
            };
        }
        if (str.includes('over an hour') || str.includes('over-an-hour') || str.includes('>60') || str.includes('90')) {
            return {
                totalMinutes: 75,
                warmupMinutes: 10,
                mainTrainingMinutes: 60,
                cooldownMinutes: 5,
                targetExerciseCount: { min: 6, max: 8 }
            };
        }
        // Default standard 40-60 min
        return {
            totalMinutes: 50,
            warmupMinutes: 7,
            mainTrainingMinutes: 38,
            cooldownMinutes: 5,
            targetExerciseCount: { min: 5, max: 7 }
        };
    }

    /**
     * Generates baseline weekly set volume targets per muscle group.
     * @param {string} goal 
     * @param {string} experience 
     * @param {string[]} focusMuscles 
     * @param {number} recoveryFactor 
     * @returns {Object.<string, { min: number, max: number, recommended: number, priority: string }>}
     */
    function calculateWeeklyVolumeTargets(goal, experience, focusMuscles, recoveryFactor) {
        const baseMin = (experience === 'beginner') ? 6 : ((experience === 'advanced') ? 10 : 8);
        const baseMax = (experience === 'beginner') ? 10 : ((experience === 'advanced') ? 18 : 14);

        const muscleGroups = ['chest', 'lats', 'upper_back', 'front_delts', 'side_delts', 'rear_delts', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'];
        const targets = {};

        muscleGroups.forEach(m => {
            let isFocus = focusMuscles.includes(m);
            let minSets = Math.round((isFocus ? baseMin + 3 : baseMin) * recoveryFactor);
            let maxSets = Math.round((isFocus ? baseMax + 4 : baseMax) * recoveryFactor);

            if (minSets < 4) minSets = 4;
            if (maxSets < minSets) maxSets = minSets + 2;

            targets[m] = {
                min: minSets,
                max: maxSets,
                recommended: Math.round((minSets + maxSets) / 2),
                priority: isFocus ? 'high' : 'standard'
            };
        });

        return targets;
    }

    // ==========================================================================
    // 3. MAIN RULES ENGINE API
    // ==========================================================================

    /**
     * Builds structured, deterministic Training Requirements from a Canonical User Training Profile.
     * @param {Object} canonicalProfile 
     * @returns {Object} Structured Training Requirements
     */
    function buildTrainingRequirements(canonicalProfile) {
        if (!canonicalProfile || typeof canonicalProfile !== 'object') {
            throw new Error('TrainingRulesEngine: Valid CanonicalUserProfile is required.');
        }

        const id = canonicalProfile.identity || {};
        const anthro = canonicalProfile.anthropometrics || {};
        const goals = canonicalProfile.goals || {};
        const avail = canonicalProfile.trainingAvailability || {};
        const exp = canonicalProfile.trainingExperience || {};
        const baseline = canonicalProfile.performanceBaseline || {};
        const constraints = canonicalProfile.movementConstraints || {};
        const life = canonicalProfile.lifestyle || {};
        const nut = canonicalProfile.nutrition || {};

        const reasons = [];

        // 1. Primary Goal Strategy
        const rawGoal = String(goals.primary || 'muscle-gain').toLowerCase().trim();
        let goalStrategy = {
            goalId: rawGoal,
            title: 'Hypertrophy & Muscular Development',
            primaryFocus: 'hypertrophy',
            targetRepRangeGuide: { compound: '6-10', isolation: '10-15' },
            intensityGuidance: 'Train each work set with high proximity to technical failure (1-2 reps in reserve on compound lifts, 0-1 on isolations).',
            restStrategy: 'Full systemic recovery on major multi-joint compounds (90-120s); metabolic density on isolations (45-60s).'
        };

        if (rawGoal.includes('weight-loss') || rawGoal.includes('fat-loss')) {
            goalStrategy.title = 'Metabolic Resistance & Fat Loss';
            goalStrategy.primaryFocus = 'fat_loss_preservation';
            goalStrategy.targetRepRangeGuide = { compound: '8-12', isolation: '12-15' };
            goalStrategy.intensityGuidance = 'Preserve lean tissue with progressive resistance while maintaining high session work density.';
            goalStrategy.restStrategy = 'Short to moderate rest periods (45-75s) to elevate caloric throughput and cardiovascular output.';
            reasons.push({ rule: 'goal_strategy', reason: 'Tailored for lean mass preservation and caloric expenditure.', source: 'goals.primary' });
        } else if (rawGoal.includes('get-shredded') || rawGoal.includes('shredded')) {
            goalStrategy.title = 'Athletic Body Recomposition';
            goalStrategy.primaryFocus = 'recomposition';
            goalStrategy.targetRepRangeGuide = { compound: '6-10', isolation: '10-14' };
            goalStrategy.intensityGuidance = 'Dual focus on heavy mechanical tension and targeted metabolic stress.';
            goalStrategy.restStrategy = 'Dynamic rest: 90s on compound anchors, 45-60s on hypertrophy finishers.';
            reasons.push({ rule: 'goal_strategy', reason: 'High-density hypertrophy programming for vascular definition.', source: 'goals.primary' });
        } else if (rawGoal.includes('strength')) {
            goalStrategy.title = 'Maximal Strength & Neural Drive';
            goalStrategy.primaryFocus = 'strength';
            goalStrategy.targetRepRangeGuide = { compound: '4-6', isolation: '8-12' };
            goalStrategy.intensityGuidance = 'Heavy loading with maximal intent to move the bar on every repetition.';
            goalStrategy.restStrategy = 'Full neurological recovery between sets (120-180s).';
            reasons.push({ rule: 'goal_strategy', reason: 'Strength focus prioritizes low-rep compound mechanics and longer rest.', source: 'goals.primary' });
        } else {
            reasons.push({ rule: 'goal_strategy', reason: 'Hypertrophy focus optimizes weekly set volume and muscular tension.', source: 'goals.primary' });
        }

        // 2. Training Frequency & Split Strategy
        const dayCount = (avail.trainingDayCount && avail.trainingDayCount >= 2 && avail.trainingDayCount <= 6)
            ? avail.trainingDayCount
            : ((Array.isArray(avail.trainingDays) && avail.trainingDays.length > 0) ? Math.min(6, Math.max(2, avail.trainingDays.length)) : 4);

        const experienceLevel = exp.experienceLevel || 'intermediate';
        const split = determineSplitStrategy(dayCount, rawGoal, experienceLevel);

        reasons.push({
            rule: 'split_strategy',
            reason: `Selected ${split.splitName} matched to ${dayCount} available weekly training days.`,
            source: 'trainingAvailability.trainingDays'
        });

        // 3. Session Budget
        const sessionBudget = calculateSessionBudget(avail.workoutDuration);
        reasons.push({
            rule: 'duration_budget',
            reason: `Session planned for ${sessionBudget.totalMinutes} minutes (${sessionBudget.mainTrainingMinutes}m main lifting budget).`,
            source: 'trainingAvailability.workoutDuration'
        });

        // 4. Equipment Constraints
        const location = (avail.workoutLocation || 'gym').toLowerCase();
        let allowedEquipment = ['barbell', 'dumbbell', 'cable', 'machine', 'bench', 'pullup_bar', 'bodyweight', 'resistance_band', 'mat'];
        let equipmentStrict = false;

        if (location === 'home') {
            equipmentStrict = true;
            if (Array.isArray(avail.homeEquipment) && avail.homeEquipment.length > 0) {
                allowedEquipment = ['bodyweight', 'mat', ...avail.homeEquipment];
            } else {
                allowedEquipment = ['bodyweight', 'mat'];
            }
            reasons.push({
                rule: 'equipment_constraint',
                reason: `Home training active; filtering strictly to available equipment: [${allowedEquipment.join(', ')}].`,
                source: 'trainingAvailability.workoutLocation'
            });
        } else {
            reasons.push({
                rule: 'equipment_constraint',
                reason: 'Full commercial gym access enabled; all standard training apparatus permitted.',
                source: 'trainingAvailability.workoutLocation'
            });
        }

        // 5. Safety & Injury Restrictions (Highest Priority Rule)
        const prohibitedConstraintTags = [];
        const safetyRecommendations = [];
        const userInjuries = Array.isArray(constraints.injuries) ? constraints.injuries : [];

        userInjuries.forEach(inj => {
            const mapped = INJURY_CONSTRAINT_MAP[inj.toLowerCase().trim()];
            if (mapped) {
                mapped.restrictedConstraints.forEach(rc => {
                    if (!prohibitedConstraintTags.includes(rc)) prohibitedConstraintTags.push(rc);
                });
                mapped.recommendations.forEach(rec => safetyRecommendations.push(rec));
                reasons.push({
                    rule: 'injury_safety_override',
                    reason: `Injury Safety Override: ${mapped.reason}`,
                    source: 'movementConstraints.injuries'
                });
            }
        });

        // 6. Muscle Focus Priorities
        const focusMuscles = [];
        const rawFocusAreas = Array.isArray(goals.focusAreas) ? goals.focusAreas : [];

        rawFocusAreas.forEach(area => {
            const cleanArea = area.toLowerCase().trim();
            const mappedList = FOCUS_AREA_MUSCLE_MAP[cleanArea];
            if (mappedList) {
                mappedList.forEach(m => {
                    if (!focusMuscles.includes(m)) focusMuscles.push(m);
                });
                reasons.push({
                    rule: 'muscle_priority',
                    reason: `Prioritizing ${mappedList.join(', ')} volume based on focus area '${area}'.`,
                    source: 'goals.focusAreas'
                });
            }
        });

        // 7. Recovery Factor Calculation
        let recoveryFactor = 1.0;
        const sleepStr = String(life.sleepDuration || '').toLowerCase();
        if (sleepStr.includes('less than 5') || sleepStr.includes('<5') || sleepStr.includes('5-6')) {
            recoveryFactor *= 0.85;
            reasons.push({
                rule: 'recovery_volume_adjustment',
                reason: 'Sub-optimal sleep reported (<6 hrs); volume scaled conservatively by 15% to safeguard systemic recovery.',
                source: 'lifestyle.sleepDuration'
            });
        }

        const typicalDay = String(life.typicalDay || '').toLowerCase();
        if (typicalDay.includes('very-active') || typicalDay.includes('heavy-labor')) {
            recoveryFactor *= 0.90;
            reasons.push({
                rule: 'activity_expenditure_adjustment',
                reason: 'High occupational physical activity reported; adjusting weekly set ceiling to manage total load.',
                source: 'lifestyle.typicalDay'
            });
        }

        // 8. Weekly Volume Targets
        const volumeTargets = calculateWeeklyVolumeTargets(rawGoal, experienceLevel, focusMuscles, recoveryFactor);

        // 9. Movement Pattern Weekly Exposures
        const movementRequirements = [
            { pattern: 'horizontal_push', weeklyExposure: (dayCount >= 4) ? 2 : 1, priority: 'high' },
            { pattern: 'horizontal_pull', weeklyExposure: (dayCount >= 4) ? 2 : 1, priority: 'high' },
            { pattern: 'vertical_push', weeklyExposure: (dayCount >= 4) ? 2 : 1, priority: 'standard' },
            { pattern: 'vertical_pull', weeklyExposure: (dayCount >= 4) ? 2 : 1, priority: 'high' },
            { pattern: 'squat', weeklyExposure: (dayCount >= 4) ? 2 : 1, priority: 'high' },
            { pattern: 'hinge', weeklyExposure: (dayCount >= 4) ? 2 : 1, priority: 'high' },
            { pattern: 'lunge', weeklyExposure: 1, priority: 'standard' },
            { pattern: 'isolation', weeklyExposure: dayCount, priority: 'standard' }
        ];

        // 10. Fatigue Constraints
        const maxHighFatiguePerSession = (experienceLevel === 'beginner') ? 1 : ((experienceLevel === 'advanced') ? 3 : 2);
        const fatigueConstraints = {
            maxHighFatigueExercisesPerSession: maxHighFatiguePerSession,
            prohibitSimultaneousHeavySquatAndDeadlift: true,
            maxSessionFatigueScore: (sessionBudget.totalMinutes <= 35) ? 12 : 20
        };

        // 11. Technical Complexity Bounds
        const maxTechnicalComplexity = (experienceLevel === 'beginner') ? 2 : ((experienceLevel === 'intermediate') ? 4 : 5);

        // Construct Canonical Training Requirements Object
        const trainingRequirements = {
            version: RULES_VERSION,
            generatedAt: new Date().toISOString(),
            goalStrategy: goalStrategy,
            weeklyStructure: {
                trainingDayCount: dayCount,
                trainingDays: avail.trainingDays && avail.trainingDays.length > 0 ? avail.trainingDays : ['Monday', 'Tuesday', 'Thursday', 'Friday'],
                splitType: split.splitType,
                splitName: split.splitName,
                description: split.description
            },
            sessionRequirements: {
                budget: sessionBudget,
                maxTechnicalComplexity: maxTechnicalComplexity,
                experienceLevel: experienceLevel,
                fitnessLevel: exp.fitnessLevel || 'intermediate'
            },
            musclePriorities: {
                focusMuscles: focusMuscles,
                volumeTargets: volumeTargets
            },
            movementRequirements: movementRequirements,
            intensityGuidance: goalStrategy.intensityGuidance,
            equipmentConstraints: {
                location: location,
                allowedEquipment: allowedEquipment,
                isRestricted: equipmentStrict
            },
            exerciseConstraints: {
                prohibitedConstraintTags: prohibitedConstraintTags,
                safetyRecommendations: safetyRecommendations,
                hasActiveRestrictions: prohibitedConstraintTags.length > 0
            },
            fatigueConstraints: fatigueConstraints,
            recoveryConsiderations: {
                recoveryFactor: recoveryFactor,
                sleepGuidance: sleepStr,
                typicalDay: typicalDay
            },
            personalizationReasons: reasons
        };

        return trainingRequirements;
    }

    /**
     * Validates a generated TrainingRequirements object against structural integrity rules.
     * @param {Object} req 
     * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
     */
    function validateTrainingRequirements(req) {
        const errors = [];
        const warnings = [];

        if (!req || typeof req !== 'object') {
            return { valid: false, errors: ['Requirements object is null or invalid.'], warnings: [] };
        }

        // 1. Goal Strategy
        if (!req.goalStrategy || !req.goalStrategy.goalId || !req.goalStrategy.primaryFocus) {
            errors.push('Goal strategy is missing or malformed.');
        }

        // 2. Weekly Structure
        if (!req.weeklyStructure || typeof req.weeklyStructure.trainingDayCount !== 'number' || req.weeklyStructure.trainingDayCount < 1 || req.weeklyStructure.trainingDayCount > 7) {
            errors.push('Weekly structure trainingDayCount must be between 1 and 7.');
        }
        if (!req.weeklyStructure || !req.weeklyStructure.splitType) {
            errors.push('Weekly structure splitType is missing.');
        }

        // 3. Session Budget
        if (!req.sessionRequirements || !req.sessionRequirements.budget || req.sessionRequirements.budget.totalMinutes < 15) {
            errors.push('Session time budget is invalid (must be at least 15 minutes).');
        }

        // 4. Equipment Constraints
        if (!req.equipmentConstraints || !Array.isArray(req.equipmentConstraints.allowedEquipment) || req.equipmentConstraints.allowedEquipment.length === 0) {
            errors.push('Allowed equipment array must be non-empty.');
        }

        // 5. Personalization Reasons
        if (!Array.isArray(req.personalizationReasons) || req.personalizationReasons.length === 0) {
            warnings.push('No personalization reasons recorded in requirements.');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Returns the version of the Training Rules Engine.
     * @returns {string}
     */
    function getTrainingRulesVersion() {
        return RULES_VERSION;
    }

    /**
     * Returns a quick summary of all active rule decisions triggered for a profile.
     * @param {Object} canonicalProfile 
     * @returns {Object[]} List of active rule reasons
     */
    function getApplicableRules(canonicalProfile) {
        const req = buildTrainingRequirements(canonicalProfile);
        return req.personalizationReasons;
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        RULES_VERSION,
        getTrainingRulesVersion,
        buildTrainingRequirements,
        validateTrainingRequirements,
        getApplicableRules,
        _internals: {
            determineSplitStrategy,
            calculateSessionBudget,
            calculateWeeklyVolumeTargets,
            FOCUS_AREA_MUSCLE_MAP,
            INJURY_CONSTRAINT_MAP
        }
    };
}));
