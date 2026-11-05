/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * EXERCISE INTELLIGENCE DATABASE MODULE (v1.0)
 * ==============================================================================
 * 
 * Comprehensive, deterministic exercise domain model and intelligence catalog.
 * Provides biomechanical taxonomy, equipment constraints, movement patterns,
 * fatigue modeling, stability demands, progression models, and legacy resolvers.
 * 
 * Design Principles:
 * 1. PURE & IMMUTABLE: Returns deep-cloned exercise models to prevent accidental mutations.
 * 2. CONTROLLED TAXONOMY: Strict enums for muscles, movement patterns, equipment, and constraints.
 * 3. EXPLICIT ID RELATIONS: Regressions and alternatives use canonical string IDs.
 * 4. HEURISTIC TRANSPARENCY: Fatigue (1-5) and stability (1-3) clearly documented as programming heuristics.
 * 5. 100% LEGACY COMPATIBLE: Seamlessly maps all historic string names to canonical IDs.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ExerciseDatabaseEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DATABASE_VERSION = '1.0';

    // ==========================================================================
    // 1. CONTROLLED DOMAIN TAXONOMIES
    // ==========================================================================

    const MUSCLES = Object.freeze([
        'chest',
        'upper_chest',
        'lower_chest',
        'lats',
        'upper_back',
        'traps',
        'front_delts',
        'side_delts',
        'rear_delts',
        'biceps',
        'triceps',
        'forearms',
        'abs',
        'obliques',
        'erectors',
        'glutes',
        'quadriceps',
        'hamstrings',
        'adductors',
        'calves'
    ]);

    const MOVEMENT_PATTERNS = Object.freeze([
        'horizontal_push',
        'horizontal_pull',
        'vertical_push',
        'vertical_pull',
        'squat',
        'hinge',
        'lunge',
        'carry',
        'rotation',
        'anti_rotation',
        'anti_extension',
        'isolation',
        'conditioning',
        'mobility'
    ]);

    const EQUIPMENT = Object.freeze([
        'barbell',
        'dumbbell',
        'cable',
        'machine',
        'smith_machine',
        'kettlebell',
        'bodyweight',
        'bench',
        'pullup_bar',
        'resistance_band',
        'cardio_machine',
        'mat',
        'no_equipment'
    ]);

    const DIFFICULTIES = Object.freeze(['beginner', 'intermediate', 'advanced']);

    const PROGRESSION_MODELS = Object.freeze([
        'double_progression',
        'load_progression',
        'rep_progression',
        'time_progression',
        'assistance_reduction',
        'bodyweight_progression',
        'skill_progression'
    ]);

    const CONSTRAINTS = Object.freeze([
        'requires_overhead_position',
        'requires_knee_flexion',
        'requires_deep_knee_flexion',
        'requires_hip_hinge',
        'requires_grip',
        'requires_spinal_loading',
        'requires_shoulder_flexion',
        'high_stability_demand',
        'impact_based',
        'unilateral',
        'bilateral'
    ]);

    const TAGS = Object.freeze([
        'compound',
        'isolation',
        'upper_body',
        'lower_body',
        'push',
        'pull',
        'strength',
        'hypertrophy',
        'conditioning',
        'core',
        'unilateral',
        'bilateral',
        'beginner_friendly',
        'advanced',
        'machine_based',
        'free_weight',
        'bodyweight'
    ]);

    // ==========================================================================
    // 2. CANONICAL EXERCISE CATALOG (CORE DOMAIN REPOSITORY)
    // ==========================================================================

    const EXERCISE_REGISTRY = Object.freeze({
        // ----------------------------------------------------------------------
        // CHEST & HORIZONTAL PUSH
        // ----------------------------------------------------------------------
        barbell_bench_press: {
            id: 'barbell_bench_press',
            name: 'Barbell Bench Press',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['front_delts', 'triceps'],
            equipment: ['barbell', 'bench'],
            difficulty: 'intermediate',
            technicalComplexity: 3,
            fatigueCost: 4,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 120,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Lie flat on the bench, grip the barbell slightly wider than shoulder width, unrack, lower with control to mid-chest, and press upward to full lockout.',
            coachingCues: ['Retract scapulae into the bench', 'Drive feet firmly into the floor', 'Keep elbows at 45-degree angle'],
            regressions: ['dumbbell_bench_press', 'machine_chest_press', 'push_up'],
            alternatives: ['dumbbell_bench_press', 'machine_chest_press', 'incline_barbell_press'],
            constraints: ['requires_shoulder_flexion', 'bilateral'],
            tags: ['compound', 'upper_body', 'push', 'strength', 'hypertrophy', 'free_weight', 'bilateral']
        },

        incline_dumbbell_press: {
            id: 'incline_dumbbell_press',
            name: 'Incline Dumbbell Press',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['upper_chest'],
            secondaryMuscles: ['front_delts', 'triceps'],
            equipment: ['dumbbell', 'bench'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Set bench to 30 degrees, press dumbbells upward over clavicles with a slight arch in the upper back.',
            coachingCues: ['Keep bench at 30 degrees to avoid excessive front delt takeover', 'Control the eccentric stretch', 'Squeeze upper pecs at the peak'],
            regressions: ['machine_chest_press', 'incline_push_up'],
            alternatives: ['incline_barbell_press', 'dumbbell_bench_press'],
            constraints: ['requires_shoulder_flexion', 'bilateral'],
            tags: ['compound', 'upper_body', 'push', 'hypertrophy', 'free_weight']
        },

        incline_barbell_press: {
            id: 'incline_barbell_press',
            name: 'Incline Barbell Bench Press',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['upper_chest'],
            secondaryMuscles: ['front_delts', 'triceps'],
            equipment: ['barbell', 'bench'],
            difficulty: 'intermediate',
            technicalComplexity: 3,
            fatigueCost: 4,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 120,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Set incline bench to 30 degrees. Unrack bar, lower smoothly to upper chest/collarbone area, press upward with authority.',
            coachingCues: ['Retract shoulder blades', 'Do not arch lower back excessively'],
            regressions: ['incline_dumbbell_press', 'machine_chest_press'],
            alternatives: ['incline_dumbbell_press', 'barbell_bench_press'],
            constraints: ['requires_shoulder_flexion', 'bilateral'],
            tags: ['compound', 'upper_body', 'push', 'strength', 'free_weight']
        },

        dumbbell_bench_press: {
            id: 'dumbbell_bench_press',
            name: 'Dumbbell Bench Press',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['front_delts', 'triceps'],
            equipment: ['dumbbell', 'bench'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Press dumbbells up above chest line while maintaining shoulder retraction and converging smoothly at top.',
            coachingCues: ['Independent arm path prevents muscular imbalances', 'Deep safe chest stretch at bottom'],
            regressions: ['machine_chest_press', 'push_up'],
            alternatives: ['barbell_bench_press', 'machine_chest_press'],
            constraints: ['requires_shoulder_flexion'],
            tags: ['compound', 'upper_body', 'push', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        machine_chest_press: {
            id: 'machine_chest_press',
            name: 'Machine Chest Press',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'front_delts'],
            equipment: ['machine'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 10, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Adjust seat height so handles align with mid-chest. Press forward to full extension without locking elbows violently.',
            coachingCues: ['Maintain chest up against back pad', 'Control the eccentric return'],
            regressions: ['push_up'],
            alternatives: ['dumbbell_bench_press', 'cable_crossover'],
            constraints: [],
            tags: ['compound', 'upper_body', 'push', 'hypertrophy', 'beginner_friendly', 'machine_based']
        },

        push_up: {
            id: 'push_up',
            name: 'Push-up',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'front_delts', 'abs'],
            equipment: ['bodyweight'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'rep_progression',
            repRange: { min: 10, max: 25 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Assume a rigid plank position, hands slightly wider than shoulders, lower chest until touching floor, and press back up.',
            coachingCues: ['Keep glutes and core braced', 'Elbows track at 45 degrees, not flared wide'],
            regressions: ['incline_push_up', 'knee_push_up'],
            alternatives: ['dumbbell_bench_press', 'band_chest_press'],
            constraints: ['requires_grip'],
            tags: ['compound', 'upper_body', 'push', 'bodyweight', 'beginner_friendly']
        },

        incline_push_up: {
            id: 'incline_push_up',
            name: 'Incline Hands-Elevated Push-up',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'front_delts'],
            equipment: ['bench', 'bodyweight'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 2,
            progressionModel: 'rep_progression',
            repRange: { min: 10, max: 20 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Place hands on elevated bench or bar, keep body in rigid line, lower chest to edge and press away.',
            coachingCues: ['Great regression for building horizontal pressing strength', 'Keep core tight'],
            regressions: ['knee_push_up'],
            alternatives: ['push_up', 'knee_push_up'],
            constraints: ['requires_grip'],
            tags: ['compound', 'upper_body', 'push', 'bodyweight', 'beginner_friendly']
        },

        knee_push_up: {
            id: 'knee_push_up',
            name: 'Kneeling Push-up',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'front_delts'],
            equipment: ['bodyweight', 'mat'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 8, max: 15 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Support weight on knees and hands, maintain straight line from knees to head, lower chest to mat and press up.',
            coachingCues: ['Do not sag hips', 'Focus on pecs initiating the push'],
            regressions: [],
            alternatives: ['incline_push_up', 'band_chest_press'],
            constraints: [],
            tags: ['compound', 'upper_body', 'push', 'bodyweight', 'beginner_friendly']
        },

        band_chest_press: {
            id: 'band_chest_press',
            name: 'Resistance Band Chest Press',
            category: 'chest',
            movementPattern: 'horizontal_push',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['triceps', 'front_delts'],
            equipment: ['resistance_band'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 12, max: 20 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Wrap band around upper back or anchor behind you, press handles forward to full arm extension.',
            coachingCues: ['Feel increasing tension at lockout', 'Control the eccentric return'],
            regressions: ['knee_push_up'],
            alternatives: ['push_up', 'machine_chest_press'],
            constraints: [],
            tags: ['compound', 'upper_body', 'push', 'beginner_friendly']
        },

        cable_crossover: {
            id: 'cable_crossover',
            name: 'Cable Crossover',
            category: 'chest',
            movementPattern: 'isolation',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['front_delts'],
            equipment: ['cable'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'rep_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 1 },
            instructions: 'Stand centered between pulleys with slight forward lean, bring cables together in a hugging arc across chest.',
            coachingCues: ['Maintain soft bend in elbows', 'Focus on peak sternal contraction'],
            regressions: ['band_crossover'],
            alternatives: ['band_crossover', 'dumbbell_flye'],
            constraints: [],
            tags: ['isolation', 'upper_body', 'push', 'hypertrophy']
        },

        dumbbell_flye: {
            id: 'dumbbell_flye',
            name: 'Flat Dumbbell Flye',
            category: 'chest',
            movementPattern: 'isolation',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['front_delts'],
            equipment: ['dumbbell', 'bench'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'rep_progression',
            repRange: { min: 10, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 3, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Lie flat, open arms out in wide arc with elbows slightly bent, feel deep pec stretch, hug dumbbells back together.',
            coachingCues: ['Do not overstretch past shoulder plane', 'Keep elbow angle fixed throughout'],
            regressions: ['cable_crossover', 'band_crossover'],
            alternatives: ['cable_crossover', 'band_crossover'],
            constraints: ['requires_shoulder_flexion'],
            tags: ['isolation', 'upper_body', 'push', 'hypertrophy', 'free_weight']
        },

        band_crossover: {
            id: 'band_crossover',
            name: 'Resistance Band Crossover',
            category: 'chest',
            movementPattern: 'isolation',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['front_delts'],
            equipment: ['resistance_band'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 15, max: 20 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 1 },
            instructions: 'Anchor band behind you at shoulder height and bring handles together in front of sternum.',
            coachingCues: ['Control band recoil', 'Maximize inner chest squeeze'],
            regressions: [],
            alternatives: ['cable_crossover', 'push_up'],
            constraints: [],
            tags: ['isolation', 'upper_body', 'push', 'bodyweight', 'beginner_friendly']
        },

        // ----------------------------------------------------------------------
        // BACK & VERTICAL / HORIZONTAL PULL
        // ----------------------------------------------------------------------
        lat_pulldown: {
            id: 'lat_pulldown',
            name: 'Lat Pulldown',
            category: 'back',
            movementPattern: 'vertical_pull',
            primaryMuscles: ['lats'],
            secondaryMuscles: ['biceps', 'upper_back', 'rear_delts'],
            equipment: ['cable', 'machine'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Grip wide bar, sit upright with thighs locked under pads, pull bar down towards upper chest while arching upper spine.',
            coachingCues: ['Drive elbows down towards hips', 'Do not excessively lean back'],
            regressions: ['band_lat_pulldown'],
            alternatives: ['pull_up', 'assisted_pull_up', 'band_lat_pulldown'],
            constraints: ['requires_grip', 'requires_overhead_position'],
            tags: ['compound', 'upper_body', 'pull', 'hypertrophy', 'beginner_friendly', 'machine_based']
        },

        pull_up: {
            id: 'pull_up',
            name: 'Pull-up',
            category: 'back',
            movementPattern: 'vertical_pull',
            primaryMuscles: ['lats'],
            secondaryMuscles: ['biceps', 'upper_back', 'forearms'],
            equipment: ['pullup_bar', 'bodyweight'],
            difficulty: 'advanced',
            technicalComplexity: 3,
            fatigueCost: 4,
            stabilityDemand: 3,
            progressionModel: 'assistance_reduction',
            repRange: { min: 5, max: 10 },
            defaultRestSeconds: 120,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Hang from overhead bar with overhand grip wider than shoulders, pull chin up over bar with controlled bodyline.',
            coachingCues: ['Full dead-hang stretch at bottom', 'Depress shoulder blades before pulling'],
            regressions: ['assisted_pull_up', 'lat_pulldown', 'band_assisted_pull_up'],
            alternatives: ['lat_pulldown', 'chin_up', 'inverted_row'],
            constraints: ['requires_grip', 'requires_overhead_position', 'requires_shoulder_flexion'],
            tags: ['compound', 'upper_body', 'pull', 'strength', 'advanced', 'bodyweight']
        },

        chin_up: {
            id: 'chin_up',
            name: 'Chin-up',
            category: 'back',
            movementPattern: 'vertical_pull',
            primaryMuscles: ['lats', 'biceps'],
            secondaryMuscles: ['upper_back', 'forearms'],
            equipment: ['pullup_bar', 'bodyweight'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 3,
            progressionModel: 'assistance_reduction',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Hang with underhand (supinated) grip shoulder-width apart, pull chest to bar driving elbows back.',
            coachingCues: ['Great lat and bicep compound synergy', 'Full stretch at bottom'],
            regressions: ['assisted_pull_up', 'lat_pulldown'],
            alternatives: ['pull_up', 'lat_pulldown'],
            constraints: ['requires_grip', 'requires_overhead_position'],
            tags: ['compound', 'upper_body', 'pull', 'bodyweight']
        },

        assisted_pull_up: {
            id: 'assisted_pull_up',
            name: 'Machine Assisted Pull-up',
            category: 'back',
            movementPattern: 'vertical_pull',
            primaryMuscles: ['lats'],
            secondaryMuscles: ['biceps', 'upper_back'],
            equipment: ['machine'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'assistance_reduction',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Kneel or stand on counterweight pad, perform pull-up movement with assisted load.',
            coachingCues: ['Gradually reduce counterbalance pin as pulling strength grows', 'Keep chest elevated'],
            regressions: ['lat_pulldown', 'band_lat_pulldown'],
            alternatives: ['lat_pulldown', 'band_assisted_pull_up'],
            constraints: ['requires_grip', 'requires_overhead_position'],
            tags: ['compound', 'upper_body', 'pull', 'beginner_friendly', 'machine_based']
        },

        band_assisted_pull_up: {
            id: 'band_assisted_pull_up',
            name: 'Resistance Band Assisted Pull-up',
            category: 'back',
            movementPattern: 'vertical_pull',
            primaryMuscles: ['lats'],
            secondaryMuscles: ['biceps', 'upper_back'],
            equipment: ['pullup_bar', 'resistance_band', 'bodyweight'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 2,
            progressionModel: 'assistance_reduction',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Loop heavy loop band over bar, step foot into loop for upward assistance, perform full pull-ups.',
            coachingCues: ['Stay vertical', 'Do not kick legs out'],
            regressions: ['assisted_pull_up', 'lat_pulldown'],
            alternatives: ['lat_pulldown', 'pull_up'],
            constraints: ['requires_grip', 'requires_overhead_position'],
            tags: ['compound', 'upper_body', 'pull', 'bodyweight']
        },

        band_lat_pulldown: {
            id: 'band_lat_pulldown',
            name: 'Resistance Band Pulldown',
            category: 'back',
            movementPattern: 'vertical_pull',
            primaryMuscles: ['lats'],
            secondaryMuscles: ['biceps', 'upper_back'],
            equipment: ['resistance_band'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Attach band high overhead, kneel down, and pull handles toward collarbones driving elbows down.',
            coachingCues: ['Feel the lateral wing contraction', 'Pause at peak squeeze'],
            regressions: [],
            alternatives: ['lat_pulldown', 'inverted_row'],
            constraints: ['requires_overhead_position'],
            tags: ['compound', 'upper_body', 'pull', 'beginner_friendly']
        },

        barbell_bent_over_row: {
            id: 'barbell_bent_over_row',
            name: 'Barbell Bent-Over Row',
            category: 'back',
            movementPattern: 'horizontal_pull',
            primaryMuscles: ['upper_back', 'lats'],
            secondaryMuscles: ['biceps', 'rear_delts', 'erectors'],
            equipment: ['barbell'],
            difficulty: 'intermediate',
            technicalComplexity: 3,
            fatigueCost: 4,
            stabilityDemand: 3,
            progressionModel: 'double_progression',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Hinge forward at 45 degrees with flat spine, pull barbell into upper abdomen/navel, squeezing shoulder blades together.',
            coachingCues: ['Maintain rigid neutral spine', 'Do not use excessive torso heave'],
            regressions: ['seated_cable_row', 'one_arm_dumbbell_row', 'chest_supported_row'],
            alternatives: ['one_arm_dumbbell_row', 'seated_cable_row', 'chest_supported_row'],
            constraints: ['requires_hip_hinge', 'requires_spinal_loading', 'requires_grip'],
            tags: ['compound', 'upper_body', 'pull', 'strength', 'free_weight']
        },

        chest_supported_row: {
            id: 'chest_supported_row',
            name: 'Chest-Supported Dumbbell / Machine Row',
            category: 'back',
            movementPattern: 'horizontal_pull',
            primaryMuscles: ['upper_back', 'lats'],
            secondaryMuscles: ['biceps', 'rear_delts'],
            equipment: ['dumbbell', 'bench', 'machine'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Lie face down on 30-degree incline bench with chest supported, row dumbbells up to sides with zero spinal fatigue.',
            coachingCues: ['Isolates upper back completely without lumbar loading', 'Retract scapulae at top'],
            regressions: ['seated_cable_row', 'band_row'],
            alternatives: ['barbell_bent_over_row', 'seated_cable_row'],
            constraints: ['requires_grip'],
            tags: ['compound', 'upper_body', 'pull', 'hypertrophy', 'beginner_friendly']
        },

        one_arm_dumbbell_row: {
            id: 'one_arm_dumbbell_row',
            name: 'One-Arm Dumbbell Row',
            category: 'back',
            movementPattern: 'horizontal_pull',
            primaryMuscles: ['lats', 'upper_back'],
            secondaryMuscles: ['biceps', 'rear_delts'],
            equipment: ['dumbbell', 'bench'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Support knee and hand on bench, pull dumbbell in an arc toward hip crease with full lat stretch at bottom.',
            coachingCues: ['Pull with elbow rather than hand', 'Keep hips level'],
            regressions: ['seated_cable_row', 'inverted_row'],
            alternatives: ['barbell_bent_over_row', 'seated_cable_row', 'chest_supported_row'],
            constraints: ['requires_grip', 'unilateral'],
            tags: ['compound', 'upper_body', 'pull', 'hypertrophy', 'unilateral', 'free_weight']
        },

        seated_cable_row: {
            id: 'seated_cable_row',
            name: 'Seated Cable Row',
            category: 'back',
            movementPattern: 'horizontal_pull',
            primaryMuscles: ['upper_back', 'lats'],
            secondaryMuscles: ['biceps', 'rear_delts'],
            equipment: ['cable'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Sit with upright torso, feet on footplates, pull handle to abdomen and retract scapulae fully.',
            coachingCues: ['Lead with elbows', 'Avoid rocking torso excessively back and forth'],
            regressions: ['band_row'],
            alternatives: ['barbell_bent_over_row', 'one_arm_dumbbell_row', 'band_row'],
            constraints: ['requires_grip'],
            tags: ['compound', 'upper_body', 'pull', 'hypertrophy', 'beginner_friendly']
        },

        band_row: {
            id: 'band_row',
            name: 'Resistance Band Row',
            category: 'back',
            movementPattern: 'horizontal_pull',
            primaryMuscles: ['upper_back', 'lats'],
            secondaryMuscles: ['biceps'],
            equipment: ['resistance_band'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Loop band around sturdy post or feet, pull handles to sides squeezing shoulder blades together.',
            coachingCues: ['Focus on clean scapular retraction', 'Keep shoulders down away from ears'],
            regressions: [],
            alternatives: ['seated_cable_row', 'inverted_row'],
            constraints: [],
            tags: ['compound', 'upper_body', 'pull', 'beginner_friendly']
        },

        inverted_row: {
            id: 'inverted_row',
            name: 'Inverted Row / Bodyweight Row',
            category: 'back',
            movementPattern: 'horizontal_pull',
            primaryMuscles: ['upper_back', 'lats'],
            secondaryMuscles: ['biceps', 'rear_delts', 'abs'],
            equipment: ['barbell', 'bodyweight'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'bodyweight_progression',
            repRange: { min: 8, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Lie under fixed bar racked at waist height, pull chest up to bar maintaining rigid straight bodyline.',
            coachingCues: ['Brace glutes and abs', 'Touch lower sternum to bar'],
            regressions: ['band_row'],
            alternatives: ['seated_cable_row', 'one_arm_dumbbell_row'],
            constraints: ['requires_grip'],
            tags: ['compound', 'upper_body', 'pull', 'bodyweight', 'beginner_friendly']
        },

        // ----------------------------------------------------------------------
        // LEGS (SQUAT PATTERN & KNEE EXTENSION)
        // ----------------------------------------------------------------------
        barbell_back_squat: {
            id: 'barbell_back_squat',
            name: 'Barbell Back Squat',
            category: 'legs',
            movementPattern: 'squat',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['adductors', 'erectors', 'hamstrings', 'abs'],
            equipment: ['barbell'],
            difficulty: 'intermediate',
            technicalComplexity: 4,
            fatigueCost: 5,
            stabilityDemand: 3,
            progressionModel: 'load_progression',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 120,
            tempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Rest bar on upper traps, descend with hips back and knees tracking toes to parallel or below, drive upward out of the hole.',
            coachingCues: ['Maintain rigid intra-abdominal pressure', 'Keep chest proud', 'Knees track over second toe'],
            regressions: ['goblet_squat', 'leg_press', 'bodyweight_squat'],
            alternatives: ['leg_press', 'goblet_squat', 'hack_squat'],
            constraints: ['requires_deep_knee_flexion', 'requires_spinal_loading', 'bilateral'],
            tags: ['compound', 'lower_body', 'strength', 'hypertrophy', 'free_weight', 'bilateral']
        },

        hack_squat: {
            id: 'hack_squat',
            name: 'Machine Hack Squat',
            category: 'legs',
            movementPattern: 'squat',
            primaryMuscles: ['quadriceps'],
            secondaryMuscles: ['glutes', 'adductors'],
            equipment: ['machine'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 4,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 3, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Position shoulders under shoulder pads, back flat against sled, descend into deep knee flexion, press up through whole foot.',
            coachingCues: ['Incredible quad overload with zero axial spinal balance demand', 'Full controlled depth'],
            regressions: ['leg_press', 'goblet_squat'],
            alternatives: ['barbell_back_squat', 'leg_press'],
            constraints: ['requires_deep_knee_flexion'],
            tags: ['compound', 'lower_body', 'hypertrophy', 'machine_based']
        },

        goblet_squat: {
            id: 'goblet_squat',
            name: 'Goblet Squat',
            category: 'legs',
            movementPattern: 'squat',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['abs', 'upper_back'],
            equipment: ['dumbbell', 'kettlebell'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Hold single dumbbell or kettlebell vertically against sternum, squat deep between hips keeping chest upright.',
            coachingCues: ['Elbows track inside knees at the bottom', 'Superb for learning squat depth without lumbar fatigue'],
            regressions: ['bodyweight_squat'],
            alternatives: ['barbell_back_squat', 'leg_press', 'dumbbell_squat'],
            constraints: ['requires_knee_flexion'],
            tags: ['compound', 'lower_body', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        dumbbell_squat: {
            id: 'dumbbell_squat',
            name: 'Dumbbell Squat',
            category: 'legs',
            movementPattern: 'squat',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['forearms', 'calves'],
            equipment: ['dumbbell'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Hold dumbbells at sides with neutral grip, squat down smoothly until thighs reach parallel.',
            coachingCues: ['Keep weight centered over midfoot', 'Spine stays neutral throughout'],
            regressions: ['bodyweight_squat'],
            alternatives: ['goblet_squat', 'leg_press'],
            constraints: ['requires_knee_flexion'],
            tags: ['compound', 'lower_body', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        leg_press: {
            id: 'leg_press',
            name: '45-Degree Leg Press',
            category: 'legs',
            movementPattern: 'squat',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'adductors'],
            equipment: ['machine'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 10, max: 15 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Sit in machine with back firmly supported, feet shoulder-width on carriage, lower sled to 90 degrees and press back up.',
            coachingCues: ['Never allow lower back to round off pad at bottom', 'Do not hyperextend/lock knees at top'],
            regressions: ['bodyweight_squat'],
            alternatives: ['barbell_back_squat', 'goblet_squat', 'hack_squat'],
            constraints: ['requires_knee_flexion'],
            tags: ['compound', 'lower_body', 'hypertrophy', 'beginner_friendly', 'machine_based']
        },

        bodyweight_squat: {
            id: 'bodyweight_squat',
            name: 'Bodyweight Air Squat',
            category: 'legs',
            movementPattern: 'squat',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['calves', 'abs'],
            equipment: ['bodyweight'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 2,
            progressionModel: 'rep_progression',
            repRange: { min: 15, max: 30 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Stand with feet shoulder-width, reach arms forward, squat deep down with control and stand tall.',
            coachingCues: ['Maintain upright posture', 'Keep weight balanced over whole foot'],
            regressions: [],
            alternatives: ['goblet_squat', 'walking_lunge'],
            constraints: ['requires_knee_flexion'],
            tags: ['compound', 'lower_body', 'bodyweight', 'beginner_friendly']
        },

        walking_lunge: {
            id: 'walking_lunge',
            name: 'Walking Lunges',
            category: 'legs',
            movementPattern: 'lunge',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves', 'abs'],
            equipment: ['dumbbell', 'bodyweight'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 3,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 14 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Step forward into dynamic lunge until back knee gently kisses floor, step through into next stride.',
            coachingCues: ['Keep front shin relatively vertical', 'Maintain slight forward torso lean for glute loading'],
            regressions: ['reverse_lunge', 'bodyweight_squat'],
            alternatives: ['bulgarian_split_squat', 'goblet_squat', 'reverse_lunge'],
            constraints: ['requires_knee_flexion', 'unilateral'],
            tags: ['compound', 'lower_body', 'unilateral', 'hypertrophy']
        },

        reverse_lunge: {
            id: 'reverse_lunge',
            name: 'Dumbbell Reverse Lunge',
            category: 'legs',
            movementPattern: 'lunge',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings'],
            equipment: ['dumbbell', 'bodyweight'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Step backward into lunge, lower back knee gently to floor, drive through front heel to return.',
            coachingCues: ['Easier on knees than forward lunges due to deceleration physics'],
            regressions: ['bodyweight_squat'],
            alternatives: ['walking_lunge', 'bulgarian_split_squat'],
            constraints: ['requires_knee_flexion', 'unilateral'],
            tags: ['compound', 'lower_body', 'unilateral', 'beginner_friendly']
        },

        bulgarian_split_squat: {
            id: 'bulgarian_split_squat',
            name: 'Bulgarian Split Squat (Rear-Foot Elevated)',
            category: 'legs',
            movementPattern: 'lunge',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'adductors'],
            equipment: ['dumbbell', 'bench', 'bodyweight'],
            difficulty: 'intermediate',
            technicalComplexity: 3,
            fatigueCost: 4,
            stabilityDemand: 3,
            progressionModel: 'double_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 3, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Elevate rear foot on bench behind you, descend on front leg until thigh is parallel to ground, drive up through front midfoot.',
            coachingCues: ['Gold standard for unilateral hypertrophy and fixing leg imbalances'],
            regressions: ['reverse_lunge', 'bodyweight_squat'],
            alternatives: ['walking_lunge', 'reverse_lunge'],
            constraints: ['requires_knee_flexion', 'unilateral'],
            tags: ['compound', 'lower_body', 'unilateral', 'hypertrophy']
        },

        seated_leg_extension: {
            id: 'seated_leg_extension',
            name: 'Seated Leg Extension',
            category: 'legs',
            movementPattern: 'isolation',
            primaryMuscles: ['quadriceps'],
            secondaryMuscles: [],
            equipment: ['machine'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Sit in machine with pad over lower shins, extend knees smoothly until full quad contraction, lower under control.',
            coachingCues: ['Keep hips pinned into seat', 'Pause 1s at full extension for peak tension'],
            regressions: [],
            alternatives: ['goblet_squat', 'bodyweight_squat'],
            constraints: ['requires_knee_flexion'],
            tags: ['isolation', 'lower_body', 'hypertrophy', 'beginner_friendly', 'machine_based']
        },

        // ----------------------------------------------------------------------
        // POSTERIOR CHAIN & HINGE
        // ----------------------------------------------------------------------
        barbell_deadlift: {
            id: 'barbell_deadlift',
            name: 'Barbell Conventional Deadlift',
            category: 'legs',
            movementPattern: 'hinge',
            primaryMuscles: ['hamstrings', 'glutes', 'erectors'],
            secondaryMuscles: ['lats', 'traps', 'forearms', 'quadriceps'],
            equipment: ['barbell'],
            difficulty: 'advanced',
            technicalComplexity: 4,
            fatigueCost: 5,
            stabilityDemand: 3,
            progressionModel: 'load_progression',
            repRange: { min: 5, max: 8 },
            defaultRestSeconds: 180,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Stand mid-foot under barbell, hinge down and grip bar, wedge hips, pull slack out of bar, and stand tall with authority.',
            coachingCues: ['Barbell stays in contact with legs the entire pull', 'Engage lats to lock upper spine'],
            regressions: ['romanian_deadlift', 'dumbbell_deadlift', 'kettlebell_deadlift'],
            alternatives: ['romanian_deadlift', 'dumbbell_deadlift', 'trap_bar_deadlift'],
            constraints: ['requires_hip_hinge', 'requires_spinal_loading', 'requires_grip', 'bilateral'],
            tags: ['compound', 'lower_body', 'strength', 'advanced', 'free_weight']
        },

        trap_bar_deadlift: {
            id: 'trap_bar_deadlift',
            name: 'Trap Bar (Hex Bar) Deadlift',
            category: 'legs',
            movementPattern: 'hinge',
            primaryMuscles: ['quadriceps', 'glutes', 'hamstrings'],
            secondaryMuscles: ['traps', 'erectors', 'forearms'],
            equipment: ['barbell'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 4,
            stabilityDemand: 2,
            progressionModel: 'load_progression',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 120,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Stand inside hex bar, grip handles neutrally, drop hips slightly, brace core, and drive through floor.',
            coachingCues: ['Distributes load more evenly between quads and posterior chain with less shear on lumbar'],
            regressions: ['dumbbell_deadlift', 'kettlebell_deadlift'],
            alternatives: ['barbell_deadlift', 'romanian_deadlift'],
            constraints: ['requires_hip_hinge', 'requires_grip'],
            tags: ['compound', 'lower_body', 'strength', 'hypertrophy']
        },

        kettlebell_deadlift: {
            id: 'kettlebell_deadlift',
            name: 'Kettlebell / Dumbbell Stiff-Leg Deadlift',
            category: 'legs',
            movementPattern: 'hinge',
            primaryMuscles: ['hamstrings', 'glutes'],
            secondaryMuscles: ['erectors'],
            equipment: ['kettlebell', 'dumbbell'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Stand over weight, hinge at hips while keeping chest high, stand and squeeze glutes at top.',
            coachingCues: ['Superb starting hinge movement', 'Maintain neutral spine'],
            regressions: ['glute_bridge'],
            alternatives: ['dumbbell_deadlift', 'romanian_deadlift'],
            constraints: ['requires_hip_hinge'],
            tags: ['compound', 'lower_body', 'beginner_friendly']
        },

        romanian_deadlift: {
            id: 'romanian_deadlift',
            name: 'Romanian Deadlift (RDL)',
            category: 'legs',
            movementPattern: 'hinge',
            primaryMuscles: ['hamstrings', 'glutes'],
            secondaryMuscles: ['erectors', 'forearms', 'upper_back'],
            equipment: ['barbell', 'dumbbell'],
            difficulty: 'intermediate',
            technicalComplexity: 3,
            fatigueCost: 3,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 3, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Unlock knees slightly, push hips directly back while sliding weight down thighs until deep hamstring stretch is achieved.',
            coachingCues: ['Movement is pure horizontal hip translation, not a vertical squat', 'Maintain flat neutral spine'],
            regressions: ['dumbbell_deadlift', 'glute_bridge'],
            alternatives: ['barbell_deadlift', 'dumbbell_deadlift', 'lying_leg_curl'],
            constraints: ['requires_hip_hinge', 'requires_grip'],
            tags: ['compound', 'lower_body', 'hypertrophy', 'free_weight']
        },

        dumbbell_deadlift: {
            id: 'dumbbell_deadlift',
            name: 'Dumbbell Deadlift / RDL',
            category: 'legs',
            movementPattern: 'hinge',
            primaryMuscles: ['hamstrings', 'glutes'],
            secondaryMuscles: ['erectors', 'forearms'],
            equipment: ['dumbbell'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Hold dumbbells in front of thighs, hinge at hips while keeping shins vertical, drive hips forward to lockout.',
            coachingCues: ['Keep dumbbells close to shins', 'Feel hamstrings load on the way down'],
            regressions: ['glute_bridge'],
            alternatives: ['romanian_deadlift', 'barbell_deadlift', 'kettlebell_deadlift'],
            constraints: ['requires_hip_hinge'],
            tags: ['compound', 'lower_body', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        glute_bridge: {
            id: 'glute_bridge',
            name: 'Bodyweight Glute Bridge',
            category: 'legs',
            movementPattern: 'hinge',
            primaryMuscles: ['glutes'],
            secondaryMuscles: ['hamstrings', 'erectors'],
            equipment: ['bodyweight', 'mat'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 15, max: 25 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 2 },
            instructions: 'Lie on back with knees bent at 90 degrees, drive heels through floor to extend hips into full alignment.',
            coachingCues: ['Hard 2s glute squeeze at top', 'Do not arch lumbar spine'],
            regressions: [],
            alternatives: ['dumbbell_deadlift', 'lying_leg_curl'],
            constraints: [],
            tags: ['isolation', 'lower_body', 'bodyweight', 'beginner_friendly']
        },

        lying_leg_curl: {
            id: 'lying_leg_curl',
            name: 'Lying Leg Curl',
            category: 'legs',
            movementPattern: 'isolation',
            primaryMuscles: ['hamstrings'],
            secondaryMuscles: ['calves'],
            equipment: ['machine'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 10, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Lie face down, curl roller pad towards glutes, hold peak contraction, lower slowly.',
            coachingCues: ['Direct knee flexion work for hamstrings without axial load'],
            regressions: ['glute_bridge'],
            alternatives: ['romanian_deadlift', 'dumbbell_deadlift'],
            constraints: ['requires_knee_flexion'],
            tags: ['isolation', 'lower_body', 'hypertrophy', 'machine_based']
        },

        // ----------------------------------------------------------------------
        // SHOULDERS & VERTICAL PUSH
        // ----------------------------------------------------------------------
        overhead_military_press: {
            id: 'overhead_military_press',
            name: 'Standing Barbell Overhead Press',
            category: 'shoulders',
            movementPattern: 'vertical_push',
            primaryMuscles: ['front_delts', 'side_delts'],
            secondaryMuscles: ['triceps', 'upper_chest', 'traps', 'abs'],
            equipment: ['barbell'],
            difficulty: 'intermediate',
            technicalComplexity: 3,
            fatigueCost: 4,
            stabilityDemand: 3,
            progressionModel: 'double_progression',
            repRange: { min: 6, max: 10 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Stand tall with bar racked across anterior deltoids, press straight up clearing face, locking overhead with head forward.',
            coachingCues: ['Squeeze glutes and brace core to prevent lumbar hyperextension', 'Lock bar directly over shoulder joint'],
            regressions: ['dumbbell_overhead_press', 'pike_pushup', 'machine_shoulder_press'],
            alternatives: ['dumbbell_overhead_press', 'machine_shoulder_press'],
            constraints: ['requires_overhead_position', 'requires_spinal_loading', 'bilateral'],
            tags: ['compound', 'upper_body', 'push', 'strength', 'free_weight']
        },

        dumbbell_overhead_press: {
            id: 'dumbbell_overhead_press',
            name: 'Seated Dumbbell Shoulder Press',
            category: 'shoulders',
            movementPattern: 'vertical_push',
            primaryMuscles: ['front_delts', 'side_delts'],
            secondaryMuscles: ['triceps', 'upper_chest'],
            equipment: ['dumbbell', 'bench'],
            difficulty: 'beginner',
            technicalComplexity: 2,
            fatigueCost: 3,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 90,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Sit on bench angled at 80 degrees, press dumbbells overhead in a smooth converging arc.',
            coachingCues: ['Do not bang dumbbells together at top', 'Lower until handles align with ear level'],
            regressions: ['pike_pushup', 'machine_shoulder_press'],
            alternatives: ['overhead_military_press', 'machine_shoulder_press'],
            constraints: ['requires_overhead_position'],
            tags: ['compound', 'upper_body', 'push', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        machine_shoulder_press: {
            id: 'machine_shoulder_press',
            name: 'Machine Overhead Shoulder Press',
            category: 'shoulders',
            movementPattern: 'vertical_push',
            primaryMuscles: ['front_delts', 'side_delts'],
            secondaryMuscles: ['triceps'],
            equipment: ['machine'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Adjust seat height so handles start at shoulder level, press upward smoothly to near lockout.',
            coachingCues: ['Fixed track provides safe vertical pressing without balance fatigue'],
            regressions: ['pike_pushup'],
            alternatives: ['dumbbell_overhead_press', 'overhead_military_press'],
            constraints: ['requires_overhead_position'],
            tags: ['compound', 'upper_body', 'push', 'machine_based', 'beginner_friendly']
        },

        pike_pushup: {
            id: 'pike_pushup',
            name: 'Pike Push-up',
            category: 'shoulders',
            movementPattern: 'vertical_push',
            primaryMuscles: ['front_delts', 'side_delts'],
            secondaryMuscles: ['triceps', 'upper_chest'],
            equipment: ['bodyweight'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'rep_progression',
            repRange: { min: 8, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Assume inverted V-shape pike with hips elevated high, lower head diagonally forward toward floor and press back up.',
            coachingCues: ['Form tripod between hands and head target at bottom', 'Elevate feet on bench to increase difficulty'],
            regressions: ['incline_push_up'],
            alternatives: ['dumbbell_overhead_press', 'overhead_military_press'],
            constraints: ['requires_overhead_position', 'requires_grip'],
            tags: ['compound', 'upper_body', 'push', 'bodyweight']
        },

        lateral_raise: {
            id: 'lateral_raise',
            name: 'Dumbbell Lateral Raise',
            category: 'shoulders',
            movementPattern: 'isolation',
            primaryMuscles: ['side_delts'],
            secondaryMuscles: ['traps'],
            equipment: ['dumbbell'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Stand with dumbbells at sides, raise arms out in the scapular plane (30 degrees forward) to shoulder height.',
            coachingCues: ['Lead with elbows, not wrists', 'Keep thumbs level to prevent impingement'],
            regressions: [],
            alternatives: ['cable_lateral_raise'],
            constraints: [],
            tags: ['isolation', 'upper_body', 'push', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        cable_lateral_raise: {
            id: 'cable_lateral_raise',
            name: 'Single-Arm Cable Lateral Raise',
            category: 'shoulders',
            movementPattern: 'isolation',
            primaryMuscles: ['side_delts'],
            secondaryMuscles: ['traps'],
            equipment: ['cable'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Set pulley to wrist/hip height, raise cable across body to shoulder height with smooth constant tension.',
            coachingCues: ['Constant tension profile throughout full range of motion'],
            regressions: [],
            alternatives: ['lateral_raise'],
            constraints: ['unilateral'],
            tags: ['isolation', 'upper_body', 'push', 'hypertrophy']
        },

        // ----------------------------------------------------------------------
        // ARMS (BICEPS & TRICEPS)
        // ----------------------------------------------------------------------
        barbell_bicep_curl: {
            id: 'barbell_bicep_curl',
            name: 'Barbell Bicep Curl',
            category: 'arms',
            movementPattern: 'isolation',
            primaryMuscles: ['biceps'],
            secondaryMuscles: ['forearms'],
            equipment: ['barbell'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'double_progression',
            repRange: { min: 8, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Stand tall with underhand grip, curl barbell upward keeping elbows pinned to ribs.',
            coachingCues: ['No torso swinging', 'Control the 2-second negative'],
            regressions: ['dumbbell_curl'],
            alternatives: ['dumbbell_curl', 'hammer_curl', 'cable_bicep_curl'],
            constraints: ['requires_grip'],
            tags: ['isolation', 'upper_body', 'pull', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        dumbbell_curl: {
            id: 'dumbbell_curl',
            name: 'Dumbbell Bicep Curl',
            category: 'arms',
            movementPattern: 'isolation',
            primaryMuscles: ['biceps'],
            secondaryMuscles: ['forearms'],
            equipment: ['dumbbell'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Hold dumbbells with supinated grip, curl toward front shoulder while supinating wrist at top.',
            coachingCues: ['Supinate pinky outwards at the peak for full bicep peak contraction'],
            regressions: [],
            alternatives: ['barbell_bicep_curl', 'hammer_curl', 'cable_bicep_curl'],
            constraints: ['requires_grip'],
            tags: ['isolation', 'upper_body', 'pull', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        hammer_curl: {
            id: 'hammer_curl',
            name: 'Dumbbell Hammer Curl',
            category: 'arms',
            movementPattern: 'isolation',
            primaryMuscles: ['biceps', 'forearms'],
            secondaryMuscles: [],
            equipment: ['dumbbell'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 12 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
            instructions: 'Hold dumbbells with neutral (palms facing each other) grip, curl upward toward shoulders.',
            coachingCues: ['Targets brachialis and brachioradialis for arm thickness'],
            regressions: [],
            alternatives: ['dumbbell_curl', 'barbell_bicep_curl', 'cable_bicep_curl'],
            constraints: ['requires_grip'],
            tags: ['isolation', 'upper_body', 'pull', 'hypertrophy', 'beginner_friendly', 'free_weight']
        },

        cable_bicep_curl: {
            id: 'cable_bicep_curl',
            name: 'Standing Cable Bicep Curl',
            category: 'arms',
            movementPattern: 'isolation',
            primaryMuscles: ['biceps'],
            secondaryMuscles: ['forearms'],
            equipment: ['cable'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 10, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 1 },
            instructions: 'Attach straight bar to low pulley, stand upright, curl bar upward keeping elbows fixed at sides.',
            coachingCues: ['Continuous constant cable tension at peak curl'],
            regressions: ['dumbbell_curl'],
            alternatives: ['barbell_bicep_curl', 'dumbbell_curl'],
            constraints: ['requires_grip'],
            tags: ['isolation', 'upper_body', 'pull', 'hypertrophy']
        },

        tricep_pushdown: {
            id: 'tricep_pushdown',
            name: 'Cable Tricep Pushdown',
            category: 'arms',
            movementPattern: 'isolation',
            primaryMuscles: ['triceps'],
            secondaryMuscles: [],
            equipment: ['cable'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Attach straight bar or rope to high pulley, pin elbows by ribs, push cable down to full elbow lockout.',
            coachingCues: ['Keep upper arms stationary', 'Lock out triceps with authority at the bottom'],
            regressions: ['band_tricep_extension'],
            alternatives: ['band_tricep_extension', 'overhead_tricep_extension'],
            constraints: ['requires_grip'],
            tags: ['isolation', 'upper_body', 'push', 'hypertrophy', 'beginner_friendly']
        },

        overhead_tricep_extension: {
            id: 'overhead_tricep_extension',
            name: 'Overhead Cable / Dumbbell Tricep Extension',
            category: 'arms',
            movementPattern: 'isolation',
            primaryMuscles: ['triceps'],
            secondaryMuscles: [],
            equipment: ['cable', 'dumbbell'],
            difficulty: 'intermediate',
            technicalComplexity: 2,
            fatigueCost: 2,
            stabilityDemand: 2,
            progressionModel: 'double_progression',
            repRange: { min: 10, max: 14 },
            defaultRestSeconds: 60,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Hold cable rope or dumbbell overhead, bend elbows lowering weight behind head for deep tricep long-head stretch, extend up.',
            coachingCues: ['Targets long head of triceps in stretched position'],
            regressions: ['tricep_pushdown'],
            alternatives: ['tricep_pushdown', 'band_tricep_extension'],
            constraints: ['requires_overhead_position'],
            tags: ['isolation', 'upper_body', 'push', 'hypertrophy']
        },

        band_tricep_extension: {
            id: 'band_tricep_extension',
            name: 'Resistance Band Tricep Extension',
            category: 'arms',
            movementPattern: 'isolation',
            primaryMuscles: ['triceps'],
            secondaryMuscles: [],
            equipment: ['resistance_band'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'rep_progression',
            repRange: { min: 15, max: 20 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 1, concentric: 1, pauseTop: 0 },
            instructions: 'Anchor band high overhead, push down into full elbow extension.',
            coachingCues: ['Control band snap on the return'],
            regressions: [],
            alternatives: ['tricep_pushdown', 'overhead_tricep_extension'],
            constraints: [],
            tags: ['isolation', 'upper_body', 'push', 'beginner_friendly']
        },

        // ----------------------------------------------------------------------
        // CALVES & LOWER BODY ACCESSORY
        // ----------------------------------------------------------------------
        standing_calf_raise: {
            id: 'standing_calf_raise',
            name: 'Standing Calf Raise',
            category: 'legs',
            movementPattern: 'isolation',
            primaryMuscles: ['calves'],
            secondaryMuscles: [],
            equipment: ['machine', 'dumbbell', 'bodyweight'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'double_progression',
            repRange: { min: 15, max: 20 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 2, concentric: 1, pauseTop: 1 },
            instructions: 'Place balls of feet on elevated ledge, descend into deep heel stretch, pause 2s, drive onto toes into peak contraction.',
            coachingCues: ['Deep pause at bottom eliminates Achilles tendon rebound elasticity', 'Squeeze gastrocnemius at top'],
            regressions: [],
            alternatives: ['seated_calf_raise', 'leg_press_calf_raise'],
            constraints: [],
            tags: ['isolation', 'lower_body', 'hypertrophy', 'beginner_friendly']
        },

        seated_calf_raise: {
            id: 'seated_calf_raise',
            name: 'Seated Calf Raise',
            category: 'legs',
            movementPattern: 'isolation',
            primaryMuscles: ['calves'],
            secondaryMuscles: [],
            equipment: ['machine', 'dumbbell'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 1,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 12, max: 15 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 2, concentric: 1, pauseTop: 1 },
            instructions: 'Sit with knees at 90 degrees under thigh pads, lower heels for deep soleus stretch, press up onto balls of feet.',
            coachingCues: ['Knee flexion de-emphasizes gastrocnemius to isolate the soleus'],
            regressions: [],
            alternatives: ['standing_calf_raise', 'leg_press_calf_raise'],
            constraints: [],
            tags: ['isolation', 'lower_body', 'hypertrophy', 'machine_based']
        },

        leg_press_calf_raise: {
            id: 'leg_press_calf_raise',
            name: 'Leg Press Calf Extension (Toe Press)',
            category: 'legs',
            movementPattern: 'isolation',
            primaryMuscles: ['calves'],
            secondaryMuscles: [],
            equipment: ['machine'],
            difficulty: 'beginner',
            technicalComplexity: 1,
            fatigueCost: 2,
            stabilityDemand: 1,
            progressionModel: 'load_progression',
            repRange: { min: 15, max: 20 },
            defaultRestSeconds: 45,
            tempo: { eccentric: 2, pauseBottom: 2, concentric: 1, pauseTop: 1 },
            instructions: 'Place balls of feet on bottom edge of leg press carriage with knees nearly straight, plantarflex toes forward and control back.',
            coachingCues: ['Keep safety catches engaged', 'Full stretch and contraction'],
            regressions: [],
            alternatives: ['standing_calf_raise', 'seated_calf_raise'],
            constraints: [],
            tags: ['isolation', 'lower_body', 'machine_based']
        }
    });

    // ==========================================================================
    // 3. LEGACY EXERCISE NAME RESOLUTION MAP
    // ==========================================================================

    const LEGACY_NAME_ALIAS_MAP = Object.freeze({
        // Chest aliases
        'barbell bench press': 'barbell_bench_press',
        'bench press': 'barbell_bench_press',
        'incline dumbbell press': 'incline_dumbbell_press',
        'incline barbell bench press': 'incline_barbell_press',
        'incline barbell press': 'incline_barbell_press',
        'dumbbell bench press': 'dumbbell_bench_press',
        'machine chest press': 'machine_chest_press',
        'push-up': 'push_up',
        'push-ups': 'push_up',
        'pushup': 'push_up',
        'pushups': 'push_up',
        'incline push-up': 'incline_push_up',
        'incline push-ups': 'incline_push_up',
        'kneeling push-up': 'knee_push_up',
        'knee push-ups': 'knee_push_up',
        'band chest press': 'band_chest_press',
        'cable crossover': 'cable_crossover',
        'dumbbell flye': 'dumbbell_flye',
        'flat dumbbell flye': 'dumbbell_flye',
        'band crossover': 'band_crossover',
        'resistance band crossover': 'band_crossover',

        // Back aliases
        'lat pulldown': 'lat_pulldown',
        'pull-up': 'pull_up',
        'pull-ups': 'pull_up',
        'pullup': 'pull_up',
        'pullups': 'pull_up',
        'chin-up': 'chin_up',
        'chin-ups': 'chin_up',
        'machine assisted pull-up': 'assisted_pull_up',
        'assisted pull-up': 'assisted_pull_up',
        'band assisted pull-up': 'band_assisted_pull_up',
        'band pulldown': 'band_lat_pulldown',
        'resistance band pulldown': 'band_lat_pulldown',
        'barbell bent-over row': 'barbell_bent_over_row',
        'barbell row': 'barbell_bent_over_row',
        'chest-supported dumbbell row': 'chest_supported_row',
        'chest supported row': 'chest_supported_row',
        'one-arm dumbbell row': 'one_arm_dumbbell_row',
        'dumbbell row': 'one_arm_dumbbell_row',
        'dumbbell rows': 'one_arm_dumbbell_row',
        'seated cable row': 'seated_cable_row',
        'cable row': 'seated_cable_row',
        'band row': 'band_row',
        'resistance band row': 'band_row',
        'inverted row': 'inverted_row',
        'inverted rows': 'inverted_row',
        'bodyweight row': 'inverted_row',
        'bodyweight rows': 'inverted_row',
        'pull-ups or inverted towel rows': 'inverted_row',

        // Quad / Squat aliases
        'barbell back squat': 'barbell_back_squat',
        'barbell squat': 'barbell_back_squat',
        'barbell squats': 'barbell_back_squat',
        'squat': 'barbell_back_squat',
        'squats': 'barbell_back_squat',
        'machine hack squat': 'hack_squat',
        'hack squat': 'hack_squat',
        'goblet squat': 'goblet_squat',
        'dumbbell squat': 'dumbbell_squat',
        '45-degree leg press': 'leg_press',
        'leg press': 'leg_press',
        'bodyweight air squat': 'bodyweight_squat',
        'bodyweight squat': 'bodyweight_squat',
        'bodyweight squats': 'bodyweight_squat',
        'walking lunge': 'walking_lunge',
        'walking lunges': 'walking_lunge',
        'reverse lunge': 'reverse_lunge',
        'dumbbell reverse lunge': 'reverse_lunge',
        'bulgarian split squat': 'bulgarian_split_squat',
        'seated leg extension': 'seated_leg_extension',
        'seated leg extensions': 'seated_leg_extension',

        // Hinge / Posterior Chain aliases
        'barbell conventional deadlift': 'barbell_deadlift',
        'barbell deadlift': 'barbell_deadlift',
        'trap bar deadlift': 'trap_bar_deadlift',
        'hex bar deadlift': 'trap_bar_deadlift',
        'kettlebell deadlift': 'kettlebell_deadlift',
        'romanian deadlift': 'romanian_deadlift',
        'romanian deadlifts': 'romanian_deadlift',
        'romanian deadlift (light)': 'romanian_deadlift',
        'single-leg bodyweight deadlift': 'dumbbell_deadlift',
        'dumbbell deadlift': 'dumbbell_deadlift',
        'glute bridge': 'glute_bridge',
        'lying leg curl': 'lying_leg_curl',

        // Shoulders aliases
        'standing barbell overhead press': 'overhead_military_press',
        'overhead military press': 'overhead_military_press',
        'barbell overhead press': 'overhead_military_press',
        'seated dumbbell shoulder press': 'dumbbell_overhead_press',
        'dumbbell overhead press': 'dumbbell_overhead_press',
        'machine overhead shoulder press': 'machine_shoulder_press',
        'machine shoulder press': 'machine_shoulder_press',
        'pike push-up': 'pike_pushup',
        'pike push-ups': 'pike_pushup',
        'pike pushup': 'pike_pushup',
        'dumbbell lateral raise': 'lateral_raise',
        'lateral raise': 'lateral_raise',
        'lateral raises': 'lateral_raise',
        'cable lateral raise': 'cable_lateral_raise',

        // Arms & Calves aliases
        'barbell bicep curl': 'barbell_bicep_curl',
        'barbell bicep curls': 'barbell_bicep_curl',
        'barbell curl': 'barbell_bicep_curl',
        'dumbbell bicep curl': 'dumbbell_curl',
        'dumbbell curl': 'dumbbell_curl',
        'dumbbell hammer curl': 'hammer_curl',
        'hammer curl': 'hammer_curl',
        'hammer curls': 'hammer_curl',
        'standing cable bicep curl': 'cable_bicep_curl',
        'cable bicep curl': 'cable_bicep_curl',
        'cable tricep pushdown': 'tricep_pushdown',
        'tricep pushdown': 'tricep_pushdown',
        'tricep pushdowns': 'tricep_pushdown',
        'overhead tricep extension': 'overhead_tricep_extension',
        'band tricep extension': 'band_tricep_extension',
        'resistance band tricep extension': 'band_tricep_extension',
        'standing calf raise': 'standing_calf_raise',
        'standing calf raises': 'standing_calf_raise',
        'seated calf raise': 'seated_calf_raise',
        'leg press calf raise': 'leg_press_calf_raise',
        'leg press calf extension': 'leg_press_calf_raise'
    });

    // ==========================================================================
    // 4. PUBLIC QUERY & RESOLUTION API
    // ==========================================================================

    /**
     * Retrieves an immutable copy of an exercise by canonical ID.
     * @param {string} id 
     * @returns {Object|null}
     */
    function getExerciseById(id) {
        if (!id || typeof id !== 'string') return null;
        const normalizedId = id.trim().toLowerCase();
        const ex = EXERCISE_REGISTRY[normalizedId];
        return ex ? JSON.parse(JSON.stringify(ex)) : null;
    }

    /**
     * Retrieves all exercises as an immutable array.
     * @returns {Object[]}
     */
    function getAllExercises() {
        return Object.values(EXERCISE_REGISTRY).map(ex => JSON.parse(JSON.stringify(ex)));
    }

    /**
     * Finds exercises matching specific filter criteria.
     * @param {Object} [filters] 
     * @returns {Object[]}
     */
    function findExercises(filters) {
        if (!filters || typeof filters !== 'object') {
            return getAllExercises();
        }

        return Object.values(EXERCISE_REGISTRY).filter(ex => {
            if (filters.category && ex.category !== filters.category) return false;
            if (filters.movementPattern && ex.movementPattern !== filters.movementPattern) return false;
            if (filters.difficulty && ex.difficulty !== filters.difficulty) return false;
            
            if (filters.primaryMuscle) {
                if (!ex.primaryMuscles.includes(filters.primaryMuscle)) return false;
            }

            if (filters.equipment) {
                const requiredEquip = Array.isArray(filters.equipment) ? filters.equipment : [filters.equipment];
                const matchesEquip = requiredEquip.some(eq => ex.equipment.includes(eq));
                if (!matchesEquip) return false;
            }

            if (filters.tag) {
                if (!ex.tags.includes(filters.tag)) return false;
            }

            if (filters.maxTechnicalComplexity && ex.technicalComplexity > filters.maxTechnicalComplexity) return false;
            if (filters.maxFatigueCost && ex.fatigueCost > filters.maxFatigueCost) return false;

            return true;
        }).map(ex => JSON.parse(JSON.stringify(ex)));
    }

    /**
     * Resolves an exercise's structured alternatives list into hydrated exercise objects.
     * @param {string} id 
     * @returns {Object[]}
     */
    function getExerciseAlternatives(id) {
        const ex = getExerciseById(id);
        if (!ex || !Array.isArray(ex.alternatives)) return [];
        return ex.alternatives.map(altId => getExerciseById(altId)).filter(Boolean);
    }

    /**
     * Resolves an exercise's structured regressions list into hydrated exercise objects.
     * @param {string} id 
     * @returns {Object[]}
     */
    function getExerciseRegressions(id) {
        const ex = getExerciseById(id);
        if (!ex || !Array.isArray(ex.regressions)) return [];
        return ex.regressions.map(regId => getExerciseById(regId)).filter(Boolean);
    }

    /**
     * Resolves legacy arbitrary exercise strings to canonical IDs with deterministic safety.
     * @param {string} legacyName 
     * @returns {{ canonicalId: string|null, confidence: string, originalName: string, exercise: Object|null }}
     */
    function resolveLegacyExerciseName(legacyName) {
        if (!legacyName || typeof legacyName !== 'string') {
            return {
                canonicalId: null,
                confidence: 'none',
                originalName: String(legacyName),
                exercise: null
            };
        }

        const clean = legacyName.toLowerCase().replace(/\s+/g, ' ').trim();
        const mappedId = LEGACY_NAME_ALIAS_MAP[clean];

        if (mappedId && EXERCISE_REGISTRY[mappedId]) {
            return {
                canonicalId: mappedId,
                confidence: 'exact_alias',
                originalName: legacyName,
                exercise: getExerciseById(mappedId)
            };
        }

        // Direct ID check if legacy passed direct canonical ID
        if (EXERCISE_REGISTRY[clean]) {
            return {
                canonicalId: clean,
                confidence: 'exact_id',
                originalName: legacyName,
                exercise: getExerciseById(clean)
            };
        }

        return {
            canonicalId: null,
            confidence: 'unresolved',
            originalName: legacyName,
            exercise: null
        };
    }

    // ==========================================================================
    // 5. DATABASE INTEGRITY VALIDATOR
    // ==========================================================================

    /**
     * Validates the entire exercise database integrity, relationship graph, and taxonomy.
     * @returns {{ valid: boolean, errors: string[], warnings: string[], exerciseCount: number, legacyAliasCount: number }}
     */
    function validateExerciseDatabase() {
        const errors = [];
        const warnings = [];
        const ids = Object.keys(EXERCISE_REGISTRY);

        // Check for empty database
        if (ids.length === 0) {
            errors.push('Database is empty.');
            return { valid: false, errors, warnings, exerciseCount: 0, legacyAliasCount: 0 };
        }

        const seenNames = new Set();

        ids.forEach(id => {
            const ex = EXERCISE_REGISTRY[id];

            // 1. ID Consistency
            if (ex.id !== id) {
                errors.push(`Exercise '${id}': id property '${ex.id}' does not match registry key.`);
            }

            // 2. Name validation
            if (!ex.name || typeof ex.name !== 'string') {
                errors.push(`Exercise '${id}': missing or invalid name.`);
            } else {
                if (seenNames.has(ex.name.toLowerCase())) {
                    warnings.push(`Exercise '${id}': duplicate display name '${ex.name}'.`);
                }
                seenNames.add(ex.name.toLowerCase());
            }

            // 3. Movement pattern taxonomy
            if (!MOVEMENT_PATTERNS.includes(ex.movementPattern)) {
                errors.push(`Exercise '${id}': invalid movement pattern '${ex.movementPattern}'.`);
            }

            // 4. Muscles taxonomy
            if (!Array.isArray(ex.primaryMuscles) || ex.primaryMuscles.length === 0) {
                errors.push(`Exercise '${id}': primaryMuscles must be a non-empty array.`);
            } else {
                ex.primaryMuscles.forEach(m => {
                    if (!MUSCLES.includes(m)) errors.push(`Exercise '${id}': invalid primary muscle '${m}'.`);
                });
            }

            if (Array.isArray(ex.secondaryMuscles)) {
                ex.secondaryMuscles.forEach(m => {
                    if (!MUSCLES.includes(m)) errors.push(`Exercise '${id}': invalid secondary muscle '${m}'.`);
                });
            }

            // 5. Equipment taxonomy
            if (!Array.isArray(ex.equipment) || ex.equipment.length === 0) {
                errors.push(`Exercise '${id}': equipment must be a non-empty array.`);
            } else {
                ex.equipment.forEach(eq => {
                    if (!EQUIPMENT.includes(eq)) errors.push(`Exercise '${id}': invalid equipment '${eq}'.`);
                });
            }

            // 6. Difficulty & Complexity
            if (!DIFFICULTIES.includes(ex.difficulty)) {
                errors.push(`Exercise '${id}': invalid difficulty '${ex.difficulty}'.`);
            }
            if (typeof ex.technicalComplexity !== 'number' || ex.technicalComplexity < 1 || ex.technicalComplexity > 5) {
                errors.push(`Exercise '${id}': technicalComplexity must be an integer between 1 and 5.`);
            }

            // 7. Fatigue (1-5) & Stability (1-3)
            if (typeof ex.fatigueCost !== 'number' || ex.fatigueCost < 1 || ex.fatigueCost > 5) {
                errors.push(`Exercise '${id}': fatigueCost must be an integer between 1 and 5.`);
            }
            if (typeof ex.stabilityDemand !== 'number' || ex.stabilityDemand < 1 || ex.stabilityDemand > 3) {
                errors.push(`Exercise '${id}': stabilityDemand must be an integer between 1 and 3.`);
            }

            // 8. Progression Model
            if (!PROGRESSION_MODELS.includes(ex.progressionModel)) {
                errors.push(`Exercise '${id}': invalid progression model '${ex.progressionModel}'.`);
            }

            // 9. Relational Integrity: Regressions
            if (Array.isArray(ex.regressions)) {
                ex.regressions.forEach(regId => {
                    if (!EXERCISE_REGISTRY[regId]) {
                        errors.push(`Exercise '${id}': references non-existent regression '${regId}'.`);
                    }
                    if (regId === id) {
                        errors.push(`Exercise '${id}': cannot list itself as a regression.`);
                    }
                });
            }

            // 10. Relational Integrity: Alternatives
            if (Array.isArray(ex.alternatives)) {
                ex.alternatives.forEach(altId => {
                    if (!EXERCISE_REGISTRY[altId]) {
                        errors.push(`Exercise '${id}': references non-existent alternative '${altId}'.`);
                    }
                    if (altId === id) {
                        errors.push(`Exercise '${id}': cannot list itself as an alternative.`);
                    }
                });
            }

            // 11. Constraints validation
            if (Array.isArray(ex.constraints)) {
                ex.constraints.forEach(c => {
                    if (!CONSTRAINTS.includes(c)) warnings.push(`Exercise '${id}': unlisted constraint tag '${c}'.`);
                });
            }
        });

        // Validate Legacy Name Mapping
        Object.entries(LEGACY_NAME_ALIAS_MAP).forEach(([alias, canonicalId]) => {
            if (!EXERCISE_REGISTRY[canonicalId]) {
                errors.push(`Legacy Alias '${alias}': maps to non-existent exercise ID '${canonicalId}'.`);
            }
        });

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            exerciseCount: ids.length,
            legacyAliasCount: Object.keys(LEGACY_NAME_ALIAS_MAP).length
        };
    }

    /**
     * Returns the database version string.
     * @returns {string}
     */
    function getExerciseDatabaseVersion() {
        return DATABASE_VERSION;
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        DATABASE_VERSION,
        getExerciseDatabaseVersion,
        TAXONOMIES: {
            MUSCLES,
            MOVEMENT_PATTERNS,
            EQUIPMENT,
            DIFFICULTIES,
            PROGRESSION_MODELS,
            CONSTRAINTS,
            TAGS
        },
        getExerciseById,
        getAllExercises,
        findExercises,
        getExerciseAlternatives,
        getExerciseRegressions,
        resolveLegacyExerciseName,
        validateExerciseDatabase
    };
}));
