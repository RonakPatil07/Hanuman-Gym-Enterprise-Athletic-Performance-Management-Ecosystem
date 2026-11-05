/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * CANONICAL USER TRAINING PROFILE MODULE (v1.0)
 * ==============================================================================
 * 
 * Central domain entity and Single Source of Truth (SSOT) representing a user's
 * physical assessment, biometric baseline, availability, constraints, and goals.
 * 
 * Design Principles:
 * 1. PURE & DETERMINISTIC: Zero side-effects, no global mutations, no random math.
 * 2. EXPLICIT UNKNOWN: Missing data is represented as null / [] rather than silent defaults.
 * 3. METRIC CANONICALIZATION: Heights in cm, weights in kg, with original units preserved.
 * 4. NAME-SAFE ADAPTER: Transparently normalizes questionnaire mismatches (e.g. eatingHabit vs eatingHabits).
 * 5. BACKWARD-COMPATIBLE: Provides bridge adapters for existing legacy consumers.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CanonicalProfileEngine = factory();
        // Export root-level convenience functions for browser environment
        root.buildCanonicalUserProfile = root.CanonicalProfileEngine.buildCanonicalUserProfile;
        root.validateCanonicalUserProfile = root.CanonicalProfileEngine.validateCanonicalUserProfile;
        root.normalizeCanonicalUserProfile = root.CanonicalProfileEngine.normalizeCanonicalUserProfile;
        root.getCanonicalProfileVersion = root.CanonicalProfileEngine.getCanonicalProfileVersion;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const SCHEMA_VERSION = '1.0';
    const DEFAULT_SOURCE = 'custom-workout-wizard';

    // ==========================================================================
    // 1. ANTHROPOMETRIC CONVERSION HELPERS
    // ==========================================================================

    /**
     * Converts arbitrary height inputs into canonical centimeters.
     * Supports metric (e.g. 175, "175cm") and imperial (e.g. "5'10\"", "5 ft 10 in").
     * @param {string|number|null} rawHeight 
     * @param {string} unit 
     * @returns {number|null}
     */
    function convertHeightToCm(rawHeight, unit) {
        if (rawHeight === null || rawHeight === undefined || rawHeight === '') {
            return null;
        }

        const str = String(rawHeight).trim();
        const rawNum = parseFloat(str);
        if (isNaN(rawNum) || rawNum <= 0) return null;
        
        // Imperial notation: 5'10" or 5 ft 10 in
        if (unit === 'ft' || str.includes("'") || str.includes('ft')) {
            const ftInMatch = str.match(/(\d+)\s*(?:'|ft|feet)?\s*(\d+)?\s*(?:"|in|inches)?/i);
            if (ftInMatch) {
                const feet = parseFloat(ftInMatch[1]) || 0;
                const inches = parseFloat(ftInMatch[2]) || 0;
                const totalInches = (feet * 12) + inches;
                return Math.round(totalInches * 2.54);
            }
        }

        // Standard numeric cm
        const num = parseFloat(str.replace(/[^0-9.]/g, ''));
        return (!isNaN(num) && num > 0) ? Math.round(num) : null;
    }

    /**
     * Converts arbitrary weight inputs into canonical kilograms.
     * @param {string|number|null} rawWeight 
     * @param {string} unit 
     * @returns {number|null}
     */
    function convertWeightToKg(rawWeight, unit) {
        if (rawWeight === null || rawWeight === undefined || rawWeight === '') {
            return null;
        }

        const str = String(rawWeight).trim();
        const rawNum = parseFloat(str);
        if (isNaN(rawNum) || rawNum <= 0) return null;

        const num = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (isNaN(num) || num <= 0) return null;

        if (unit === 'lbs' || String(unit).toLowerCase() === 'lb') {
            return Math.round((num * 0.45359237) * 10) / 10;
        }
        return Math.round(num * 10) / 10;
    }

    /**
     * Normalizes body fat string tiers to numeric midpoints.
     * @param {string|number|null} rawBodyFat 
     * @returns {number|null}
     */
    function parseBodyFatPercent(rawBodyFat) {
        if (!rawBodyFat) return null;
        const str = String(rawBodyFat).toLowerCase().trim();
        
        if (str.includes('5-9') || str.includes('5 to 9')) return 7;
        if (str.includes('10-14') || str.includes('10 to 14')) return 12;
        if (str.includes('15-19') || str.includes('15 to 19')) return 17;
        if (str.includes('20-24') || str.includes('20 to 24')) return 22;
        if (str.includes('25-29') || str.includes('25 to 29')) return 27;
        if (str.includes('30-34') || str.includes('30 to 34') || str.includes('30-39')) return 34;
        if (str.includes('40') || str.includes('>40')) return 42;

        const parsed = parseFloat(str.replace(/[^0-9.]/g, ''));
        return (!isNaN(parsed) && parsed > 0 && parsed <= 70) ? parsed : null;
    }

    /**
     * Isolated Fitness Level Derivation (preserves legacy rules cleanly).
     * @param {string|null} pushups 
     * @param {string|null} pullups 
     * @returns {'beginner'|'intermediate'|'advanced'}
     */
    function deriveFitnessLevel(pushups, pullups) {
        if (!pushups && !pullups) return 'intermediate';

        const p = String(pushups || '').toLowerCase();
        const u = String(pullups || '').toLowerCase();

        if (p.includes('less than 10') || p.includes('<10') || u.includes("can't do") || u.includes('less than 5') || u.includes('<5')) {
            return 'beginner';
        }
        if (p.includes('more than 30') || p.includes('30+') || p.includes('20 to 30') || u.includes('more than 10') || u.includes('10+')) {
            return 'advanced';
        }
        return 'intermediate';
    }

    // ==========================================================================
    // 2. CANONICAL PROFILE BUILDER API
    // ==========================================================================

    /**
     * Builds a standardized Canonical User Training Profile from raw questionnaire answers.
     * @param {Object} raw Raw user selections (e.g. from userSelections or localStorage)
     * @param {Object} [options] Build configuration options
     * @returns {Object} Canonical User Training Profile
     */
    function buildCanonicalUserProfile(raw, options) {
        const input = raw || {};
        const opts = options || {};
        const timestamp = opts.timestamp || new Date().toISOString();

        // 1. Extract and normalize units
        const heightUnit = (input.heightUnit === 'ft' || input.heightUnit === 'feet') ? 'ft' : 'cm';
        const weightUnit = (input.weightUnit === 'lbs' || input.weightUnit === 'lb') ? 'lbs' : 'kg';

        // 2. Anthropometrics
        const heightCm = convertHeightToCm(input.height, heightUnit);
        const weightKg = convertWeightToKg(input.currentWeight || input.weight, weightUnit);
        const targetWeightKg = convertWeightToKg(input.targetWeight, weightUnit);
        const bodyFatLevel = input.bodyFatLevel || null;
        const bodyFatPercent = parseBodyFatPercent(bodyFatLevel);

        // 3. Body Type / Physique Goal Resolution
        const baseBodyType = input.bodyType || null;
        const targetPhysique = input.muscleBodyType || input.weightLossBodyType || input.getShreddedBodyType || null;

        // 4. Goals & Intent
        const primaryGoal = input.goal || input.fitnessGoal || input.primaryGoal || null;
        let secondaryGoals = [];
        if (Array.isArray(input.goals)) {
            secondaryGoals = [...input.goals];
        } else if (Array.isArray(input.secondaryGoals)) {
            secondaryGoals = [...input.secondaryGoals];
        }

        let focusAreas = [];
        if (Array.isArray(input.focusAreas)) {
            focusAreas = [...input.focusAreas];
        }

        // 5. Training Days & Availability
        let trainingDays = [];
        if (Array.isArray(input.trainingDays)) {
            trainingDays = input.trainingDays.filter(d => d && d !== 'Not sure');
        }
        const trainingDayCount = trainingDays.length;

        // 6. Movement Constraints & Injuries
        let injuries = [];
        if (Array.isArray(input.injuries)) {
            injuries = [...input.injuries];
        }
        let pastIssues = [];
        if (Array.isArray(input.issues)) {
            pastIssues = [...input.issues];
        } else if (Array.isArray(input.pastIssues)) {
            pastIssues = [...input.pastIssues];
        }

        // 7. Lifestyle & Nutrition Mismatch Resolution
        // Transparently supports both existing raw and canonical names:
        const eatingHabits = input.eatingHabits || input.eatingHabit || null;
        const proteinIntake = input.proteinIntake || input.protein || null;
        const waterIntake = input.waterIntake || input.water || null;
        const sleepDuration = input.sleepDuration || input.sleep || null;
        const walkingHabits = input.walkingHabits || input.walking || null;
        const typicalDay = input.typicalDay || null;
        const activities = Array.isArray(input.activities) ? [...input.activities] : [];

        // 8. Performance & Experience
        const experienceLevel = input.experience || input.workoutExperience || input.experienceLevel || null;
        const pushups = input.pushups || null;
        const pullups = input.pullups || null;
        const fitnessLevel = deriveFitnessLevel(pushups, pullups);

        // 9. Equipment & Location
        const workoutLocation = input.workoutLocation || 'gym';
        let homeEquipment = [];
        if (Array.isArray(input.homeEquipment)) {
            homeEquipment = [...input.homeEquipment];
        } else if (typeof input.homeEquipment === 'string' && input.homeEquipment.length > 0) {
            homeEquipment = input.homeEquipment.split(',').map(s => s.trim()).filter(Boolean);
        }

        // Build Immutable Canonical Representation
        const canonicalProfile = {
            metadata: {
                profileVersion: SCHEMA_VERSION,
                profileCreatedAt: timestamp,
                profileUpdatedAt: timestamp,
                source: input.source || DEFAULT_SOURCE
            },
            identity: {
                userName: input.userName ? String(input.userName).trim() : null,
                userEmail: input.userEmail ? String(input.userEmail).trim() : null,
                age: (input.age !== null && input.age !== undefined && input.age !== '' && !Number.isNaN(input.age) && String(input.age) !== 'NaN') ? (parseFloat(input.age) || String(input.age)) : null,
                gender: input.gender ? String(input.gender).toLowerCase().trim() : null
            },
            anthropometrics: {
                height: input.height ? String(input.height).trim() : null,
                heightUnit: heightUnit,
                heightCm: heightCm,
                currentWeight: input.currentWeight ? String(input.currentWeight).trim() : (input.weight ? String(input.weight).trim() : null),
                weightUnit: weightUnit,
                weightKg: weightKg,
                targetWeight: input.targetWeight ? String(input.targetWeight).trim() : null,
                targetWeightKg: targetWeightKg,
                bodyType: baseBodyType,
                targetPhysique: targetPhysique,
                bodyFatLevel: bodyFatLevel,
                bodyFatPercent: bodyFatPercent
            },
            goals: {
                primary: primaryGoal,
                secondary: secondaryGoals,
                focusAreas: focusAreas,
                challenge: input.challenge || null
            },
            trainingAvailability: {
                trainingDays: trainingDays,
                trainingDayCount: trainingDayCount,
                trainingFrequency: input.trainingFrequency || null,
                workoutTime: input.workoutTime || null,
                workoutDuration: input.workoutDuration || null,
                workoutLocation: workoutLocation,
                homeEquipment: homeEquipment
            },
            trainingExperience: {
                experienceLevel: experienceLevel,
                fitnessLevel: fitnessLevel,
                pushups: pushups,
                pullups: pullups
            },
            performanceBaseline: {
                pushups: pushups,
                pullups: pullups,
                baselineEstablished: Boolean(pushups || pullups)
            },
            movementConstraints: {
                injuries: injuries,
                pastIssues: pastIssues,
                hasInjuries: injuries.length > 0
            },
            lifestyle: {
                typicalDay: typicalDay,
                activities: activities,
                walkingHabits: walkingHabits,
                sleepDuration: sleepDuration,
                waterIntake: waterIntake
            },
            nutrition: {
                eatingHabits: eatingHabits,
                proteinIntake: proteinIntake
            }
        };

        return canonicalProfile;
    }

    // ==========================================================================
    // 3. NORMALIZATION ENGINE API
    // ==========================================================================

    /**
     * Deterministically normalizes and fills safe defaults on a canonical profile
     * without fabricating user identity or medical facts.
     * @param {Object} profile 
     * @returns {Object} Normalized profile
     */
    function normalizeCanonicalUserProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            profile = buildCanonicalUserProfile({});
        }

        const normalized = JSON.parse(JSON.stringify(profile));

        // Ensure metadata
        if (!normalized.metadata) {
            normalized.metadata = {
                profileVersion: SCHEMA_VERSION,
                profileCreatedAt: new Date().toISOString(),
                profileUpdatedAt: new Date().toISOString(),
                source: DEFAULT_SOURCE
            };
        }

        // Standardize Enums / Strings
        if (normalized.identity && normalized.identity.gender) {
            normalized.identity.gender = String(normalized.identity.gender).toLowerCase().trim();
        }
        if (normalized.goals && normalized.goals.primary) {
            normalized.goals.primary = String(normalized.goals.primary).toLowerCase().trim();
        }
        if (normalized.trainingExperience && normalized.trainingExperience.experienceLevel) {
            normalized.trainingExperience.experienceLevel = String(normalized.trainingExperience.experienceLevel).toLowerCase().trim();
        }

        return normalized;
    }

    // ==========================================================================
    // 4. VALIDATION ENGINE API
    // ==========================================================================

    /**
     * Validates a canonical profile, returning structured errors, warnings, and optional notices.
     * @param {Object} profile 
     * @returns {{ valid: boolean, errors: string[], warnings: string[], optional: string[] }}
     */
    function validateCanonicalUserProfile(profile) {
        const errors = [];
        const warnings = [];
        const optional = [];

        if (!profile || typeof profile !== 'object') {
            return {
                valid: false,
                errors: ['Profile is null or not a valid object.'],
                warnings: [],
                optional: []
            };
        }

        // 1. Identity Validation
        const identity = profile.identity || {};
        if (!identity.age) {
            errors.push('Identity: Age is missing.');
        } else if (typeof identity.age === 'number' && (identity.age < 12 || identity.age > 100)) {
            errors.push(`Identity: Age (${identity.age}) is out of safe physical training range (12-100).`);
        }

        if (!identity.gender) {
            errors.push('Identity: Gender is missing.');
        } else if (!['male', 'female', 'other'].includes(identity.gender)) {
            warnings.push(`Identity: Unrecognized gender value '${identity.gender}'.`);
        }

        // 2. Goal Validation
        const goals = profile.goals || {};
        if (!goals.primary) {
            errors.push('Goals: Primary fitness goal is missing.');
        }

        if (!goals.focusAreas || goals.focusAreas.length === 0) {
            optional.push('Goals: No target focus areas selected.');
        }
        if (!goals.secondary || goals.secondary.length === 0) {
            optional.push('Goals: No secondary lifestyle goals selected.');
        }

        // 3. Anthropometrics Validation
        const anthro = profile.anthropometrics || {};
        if (!anthro.heightCm) {
            warnings.push('Anthropometrics: Height is missing or invalid; metabolic calculations will use population median.');
        } else if (anthro.heightCm < 100 || anthro.heightCm > 250) {
            warnings.push(`Anthropometrics: Height (${anthro.heightCm} cm) is outside typical range.`);
        }

        if (!anthro.weightKg) {
            warnings.push('Anthropometrics: Current weight is missing; caloric calculation will use population median.');
        } else if (anthro.weightKg < 30 || anthro.weightKg > 300) {
            warnings.push(`Anthropometrics: Current weight (${anthro.weightKg} kg) is outside typical range.`);
        }

        if (!anthro.targetWeightKg) {
            optional.push('Anthropometrics: Target weight was not specified.');
        }

        // 4. Training Availability Validation
        const availability = profile.trainingAvailability || {};
        if (!availability.trainingDays || availability.trainingDays.length === 0) {
            warnings.push('Training Availability: No weekly training days selected.');
        } else if (availability.trainingDayCount > 7) {
            errors.push('Training Availability: Training days cannot exceed 7 days per week.');
        }

        // 5. Movement Constraints
        const constraints = profile.movementConstraints || {};
        if (constraints.injuries && constraints.injuries.length > 0) {
            optional.push(`Movement Constraints: ${constraints.injuries.length} injury limitation(s) noted for safety filtering.`);
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            optional: optional
        };
    }

    // ==========================================================================
    // 5. BACKWARD-COMPATIBILITY ADAPTER BRIDGE
    // ==========================================================================

    /**
     * Converts a Canonical Profile into the flat legacy dictionary expected by
     * the existing matching engine, math routines, and renderers.
     * Prevents any regressions in existing legacy components.
     * @param {Object} canonicalProfile 
     * @returns {Object} Flat legacy userProfile object with attached _canonical
     */
    function toLegacyUserProfile(canonicalProfile) {
        const c = canonicalProfile || buildCanonicalUserProfile({});
        const id = c.identity || {};
        const a = c.anthropometrics || {};
        const g = c.goals || {};
        const av = c.trainingAvailability || {};
        const exp = c.trainingExperience || {};
        const mc = c.movementConstraints || {};
        const l = c.lifestyle || {};
        const n = c.nutrition || {};

        // Fallback default days if user selected nothing
        const trainingDays = (av.trainingDays && av.trainingDays.length > 0)
            ? av.trainingDays
            : ['Monday', 'Tuesday', 'Thursday', 'Friday'];

        const legacyProfile = {
            // Flat Identity & Demographics
            gender: id.gender || 'male',
            age: id.age || 25,
            userName: id.userName || 'Athlete',
            userEmail: id.userEmail || '',

            // Flat Anthropometrics
            height: a.height || (a.heightCm ? String(a.heightCm) : '175'),
            heightUnit: a.heightUnit || 'cm',
            heightCm: a.heightCm || 175,
            currentWeight: a.currentWeight || (a.weightKg ? String(a.weightKg) : '70'),
            targetWeight: a.targetWeight || (a.targetWeightKg ? String(a.targetWeightKg) : '70'),
            weightUnit: a.weightUnit || 'kg',
            weightKg: a.weightKg || 70,
            targetWeightKg: a.targetWeightKg || 70,
            bodyType: a.bodyType || a.targetPhysique || 'average',
            bodyFatLevel: a.bodyFatLevel || '15-19%',
            bodyFatPercent: a.bodyFatPercent || 17,

            // Flat Goals
            goal: g.primary || 'muscle-gain',
            goals: g.secondary || [],
            focusAreas: g.focusAreas || [],
            challenge: g.challenge || null,

            // Flat Availability & Location
            workoutLocation: av.workoutLocation || 'gym',
            workoutTime: av.workoutTime || 'morning',
            workoutDuration: av.workoutDuration || '45-60',
            trainingDays: trainingDays,
            trainingFrequency: av.trainingFrequency || '3-times',
            equipment: (av.homeEquipment && av.homeEquipment.length > 0) ? av.homeEquipment.join(',') : 'none',
            homeEquipment: av.homeEquipment || [],

            // Flat Experience & Performance
            experience: exp.experienceLevel || 'intermediate',
            fitnessLevel: exp.fitnessLevel || 'intermediate',
            pushups: exp.pushups || null,
            pullups: exp.pullups || null,

            // Flat Constraints
            injuries: mc.injuries || [],
            pastIssues: mc.pastIssues || [],

            // Flat Lifestyle & Recovery (With Naming Mismatch Fixes Applied)
            typicalDay: l.typicalDay || 'moderately-active',
            activities: l.activities || [],
            eatingHabits: n.eatingHabits || 'balanced',
            proteinIntake: n.proteinIntake || 'moderate',
            waterIntake: l.waterIntake || 'some',
            sleepDuration: l.sleepDuration || '7-8',
            walkingHabits: l.walkingHabits || 'moderate',

            // Canonical Anchor (Single Source of Truth Reference)
            _canonical: c
        };

        return legacyProfile;
    }

    /**
     * Returns schema version.
     * @returns {string}
     */
    function getCanonicalProfileVersion() {
        return SCHEMA_VERSION;
    }

    // ==========================================================================
    // PUBLIC API EXPORTS
    // ==========================================================================
    return {
        SCHEMA_VERSION,
        getCanonicalProfileVersion,
        buildCanonicalUserProfile,
        normalizeCanonicalUserProfile,
        validateCanonicalUserProfile,
        toLegacyUserProfile,
        // Conversion helpers exposed for unit test harness
        _helpers: {
            convertHeightToCm,
            convertWeightToKg,
            parseBodyFatPercent,
            deriveFitnessLevel
        }
    };
}));
