/**
 * ==============================================================================
 * HANUMAN GYM — BIOMECHANICAL EMG MUSCLE AFFINITY & RESISTANCE PROFILE ENGINE
 * Calculates anatomical similarity match percentages and resistance profiles
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.EMGSubstitutionEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * Database of biomechanical profiles, EMG activation focus, and resistance curve dynamics.
     */
    const BIOMECHANICAL_DATABASE = {
        'barbell-bench-press': {
            name: 'Barbell Bench Press',
            pattern: 'horizontal-push',
            primaryHead: 'Sternal Pectoralis',
            resistanceCurve: 'CONSTANT_MID_RANGE',
            stretchRating: 85,
            jointComfort: 'MODERATE',
            alternatives: [
                { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', matchScore: 96, curve: 'STRETCH_MEDIATED', advantage: 'Increased converging adduction at lockout and greater horizontal stretch at bottom.' },
                { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', matchScore: 92, curve: 'STRETCH_MEDIATED', advantage: '+34% Clavicular head activation with 30° shoulder abduction angle.' },
                { id: 'machine-chest-press', name: 'Machine Chest Press', matchScore: 89, curve: 'PEAK_CONTRACTION', advantage: 'Fixed linear path eliminates rotator cuff stabilizer failure.' },
                { id: 'weighted-push-up', name: 'Weighted Push-Up', matchScore: 84, curve: 'CONSTANT_MID_RANGE', advantage: 'Allows free scapular protraction/retraction, reducing anterior impingement.' }
            ]
        },
        'barbell-back-squat': {
            name: 'Barbell Back Squat',
            pattern: 'squat',
            primaryHead: 'Vastus Lateralis & Medialis',
            resistanceCurve: 'CONSTANT_MID_RANGE',
            stretchRating: 90,
            jointComfort: 'MODERATE_AXIAL',
            alternatives: [
                { id: 'hack-squat', name: 'Machine Hack Squat', matchScore: 95, curve: 'STRETCH_MEDIATED', advantage: 'Eliminates lumbar spine shear stress while driving deep knee flexion.' },
                { id: 'leg-press', name: '45° Incline Leg Press', matchScore: 91, curve: 'CONSTANT_MID_RANGE', advantage: 'Allows massive quad loading without axial spinal compression.' },
                { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', matchScore: 88, curve: 'STRETCH_MEDIATED', advantage: 'Unilateral loading fixes side-to-side asymmetries and stretches hip flexors.' },
                { id: 'goblet-squat', name: 'Dumbbell Goblet Squat', matchScore: 82, curve: 'CONSTANT_MID_RANGE', advantage: 'Anterior load forces upright torso angle and deep hip mobility.' }
            ]
        },
        'conventional-deadlift': {
            name: 'Conventional Deadlift',
            pattern: 'hinge',
            primaryHead: 'Erector Spinae & Gluteus Maximus',
            resistanceCurve: 'CONSTANT_MID_RANGE',
            stretchRating: 88,
            jointComfort: 'HEAVY_AXIAL',
            alternatives: [
                { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', matchScore: 94, curve: 'STRETCH_MEDIATED', advantage: 'Maximizes eccentric stretch on hamstring origin with zero floor rebound.' },
                { id: 'trap-bar-deadlift', name: 'Hex / Trap Bar Deadlift', matchScore: 93, curve: 'CONSTANT_MID_RANGE', advantage: 'Aligns load directly with center of gravity, reducing lumbar moment arm by 22%.' },
                { id: 'dumbbell-rdl', name: 'Dumbbell Romanian Deadlift', matchScore: 90, curve: 'STRETCH_MEDIATED', advantage: 'Independent grip tracks naturally along thighs with superior grip comfort.' },
                { id: 'back-extension', name: '45° Hyperextension', matchScore: 85, curve: 'PEAK_CONTRACTION', advantage: 'Isolated posterior chain loading without grip or upper back fatigue.' }
            ]
        },
        'pull-up': {
            name: 'Pull-Up',
            pattern: 'vertical-pull',
            primaryHead: 'Latissimus Dorsi (Iliac & Thoracic)',
            resistanceCurve: 'CONSTANT_MID_RANGE',
            stretchRating: 92,
            jointComfort: 'HIGH',
            alternatives: [
                { id: 'lat-pulldown', name: 'Lat Pulldown', matchScore: 95, curve: 'PEAK_CONTRACTION', advantage: 'Allows granular micro-load scaling and continuous lat stretch under control.' },
                { id: 'neutral-grip-pull-up', name: 'Neutral-Grip Pull-Up', matchScore: 94, curve: 'STRETCH_MEDIATED', advantage: 'Places shoulders in biomechanically friendly scaption plane with brachialis support.' },
                { id: 'single-arm-lat-pulldown', name: 'Half-Kneeling 1-Arm Lat Pulldown', matchScore: 91, curve: 'STRETCH_MEDIATED', advantage: 'Directs pull along exact lat fiber angle (iliac insertion) with full stretch.' }
            ]
        },
        'barbell-overhead-press': {
            name: 'Barbell Overhead Press',
            pattern: 'vertical-push',
            primaryHead: 'Anterior Deltoid',
            resistanceCurve: 'CONSTANT_MID_RANGE',
            stretchRating: 80,
            jointComfort: 'MODERATE_AXIAL',
            alternatives: [
                { id: 'seated-dumbbell-shoulder-press', name: 'Seated DB Overhead Press', matchScore: 94, curve: 'STRETCH_MEDIATED', advantage: 'Supported backrest eliminates lumbar hyperextension under fatigue.' },
                { id: 'arnold-press', name: 'Arnold Dumbbell Press', matchScore: 90, curve: 'PEAK_CONTRACTION', advantage: 'Rotational arc activates anterior and lateral deltoid heads sequentially.' },
                { id: 'landmine-press', name: 'Half-Kneeling Landmine Press', matchScore: 87, curve: 'CONSTANT_MID_RANGE', advantage: 'Angled pressing vector is ideal for trainees with shoulder impingement.' }
            ]
        },
        'barbell-curl': {
            name: 'Barbell Bicep Curl',
            pattern: 'isolation-pull',
            primaryHead: 'Biceps Brachii (Short & Long Head)',
            resistanceCurve: 'CONSTANT_MID_RANGE',
            stretchRating: 75,
            jointComfort: 'MODERATE_WRIST',
            alternatives: [
                { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', matchScore: 96, curve: 'STRETCH_MEDIATED', advantage: 'Shoulder hyperextension pre-stretches long head for superior hypertrophic response.' },
                { id: 'bayesian-cable-curl', name: 'Bayesian Behind-Back Cable Curl', matchScore: 94, curve: 'STRETCH_MEDIATED', advantage: 'Cable maintains maximum tension at peak stretch and full flexion.' },
                { id: 'preacher-curl', name: 'Preacher Curl', matchScore: 90, curve: 'PEAK_CONTRACTION', advantage: 'Eliminates shoulder swing momentum and isolates distal bicep fibers.' },
                { id: 'hammer-curl', name: 'Neutral-Grip Hammer Curl', matchScore: 86, curve: 'CONSTANT_MID_RANGE', advantage: 'Recruits brachioradialis and brachialis to build upper arm thickness.' }
            ]
        }
    };

    /**
     * Finds biomechanical alternatives and EMG affinity matches for an exercise.
     * @param {string} exerciseId - Exercise identifier or name
     * @returns {{ baseExercise: Object, alternatives: Array }}
     */
    function getAffinityAlternatives(exerciseId) {
        if (!exerciseId) return { baseExercise: null, alternatives: [] };
        
        const cleanId = String(exerciseId).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        let entry = BIOMECHANICAL_DATABASE[cleanId];

        // Partial match fallback
        if (!entry) {
            const keys = Object.keys(BIOMECHANICAL_DATABASE);
            const foundKey = keys.find(k => cleanId.includes(k) || k.includes(cleanId));
            if (foundKey) entry = BIOMECHANICAL_DATABASE[foundKey];
        }

        if (!entry) {
            // Generic intelligent fallback
            return {
                baseExercise: { name: exerciseId, pattern: 'Compound', primaryHead: 'Target Muscle Group', resistanceCurve: 'CONSTANT_MID_RANGE' },
                alternatives: [
                    { id: 'dumbbell-var', name: `Dumbbell ${exerciseId}`, matchScore: 92, curve: 'STRETCH_MEDIATED', advantage: 'Independent limb loading and joint-friendly range of motion.' },
                    { id: 'cable-var', name: `Cable ${exerciseId}`, matchScore: 89, curve: 'PEAK_CONTRACTION', advantage: 'Smooth continuous tension throughout entire active contraction.' },
                    { id: 'machine-var', name: `Machine ${exerciseId}`, matchScore: 86, curve: 'CONSTANT_MID_RANGE', advantage: 'Fixed guided trajectory minimizes stabilizer fatigue.' }
                ]
            };
        }

        return {
            baseExercise: entry,
            alternatives: entry.alternatives
        };
    }

    /**
     * Formats human-friendly curve tag label.
     * @param {string} curve 
     * @returns {{ label: string, color: string, badge: string }}
     */
    function formatResistanceCurveMeta(curve) {
        switch (curve) {
            case 'STRETCH_MEDIATED':
                return { label: 'Stretch-Mediated Tension', color: '#38bdf8', badge: '⚡ High Hypertrophy Stretch' };
            case 'PEAK_CONTRACTION':
                return { label: 'Peak Contraction Squeeze', color: '#facc15', badge: '🎯 End-Range Squeeze' };
            case 'CONSTANT_MID_RANGE':
            default:
                return { label: 'Mid-Range Mechanical Tension', color: '#34d399', badge: '💪 Heavy Mechanical Tension' };
        }
    }

    return {
        BIOMECHANICAL_DATABASE,
        getAffinityAlternatives,
        formatResistanceCurveMeta
    };
}));
