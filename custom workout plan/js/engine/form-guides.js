/**
 * ==============================================================================
 * HANUMAN GYM — BIOMECHANICAL FORM & TEMPO RHYTHM ENGINE (v1.0)
 * ==============================================================================
 * 
 * Comprehensive biomechanical setup guides, breathing/bracing protocols,
 * common execution mistakes, and animated tempo rhythm parser.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FormGuidesEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    const FORM_DATABASE = {
        squat: {
            name: 'Barbell Back Squats',
            keywords: ['squat', 'back squat', 'front squat', 'hack squat', 'goblet squat'],
            setup: [
                'Set bar in rack at mid-sternum height. Step under with high or low bar shelf.',
                'Stance slightly wider than shoulder-width with toes flared 15–30 degrees outward.',
                'Take a deep 360° diaphragmatic breath and brace core (Valsalva maneuver).'
            ],
            breathing: 'Inhale and brace before initiating descent. Hold pressure throughout bottom turnaround. Exhale past the sticking point on ascent.',
            mistakes: [
                { mistake: 'Knees caving inward (Valgus collapse)', fix: 'Actively drive knees outward tracking in line with your 2nd and 3rd toes.' },
                { mistake: 'Excessive forward torso pitch', fix: 'Break at hips and knees simultaneously; maintain mid-foot balance.' },
                { mistake: 'Heels lifting off ground', fix: 'Root all 3 foot contact points (heel, big toe, pinky toe) firmly into the floor.' }
            ],
            tempoDefault: '3-1-1-0'
        },
        bench: {
            name: 'Barbell Bench Press',
            keywords: ['bench press', 'chest press', 'dumbbell bench', 'incline bench', 'incline press'],
            setup: [
                'Lie with eyes directly beneath the racked barbell. Plant feet flat on the floor.',
                'Retract and depress scapulae (pinch shoulder blades down into the bench).',
                'Grip slightly wider than shoulder-width; wrap thumbs securely around the bar.'
            ],
            breathing: 'Inhale and pack upper back prior to unrack. Lower under control to lower-sternum. Drive feet into floor and press explosively while exhaling.',
            mistakes: [
                { mistake: 'Flaring elbows at 90 degrees', fix: 'Tuck elbows at roughly 45–60 degrees relative to your torso to protect rotator cuffs.' },
                { mistake: 'Bouncing bar off ribcage', fix: 'Pause for a crisp half-second touch on the chest before initiating the concentric drive.' },
                { mistake: 'Glutes leaving the bench pad', fix: 'Engage leg drive horizontally toward your head rather than lifting hips vertically.' }
            ],
            tempoDefault: '2-1-1-0'
        },
        deadlift: {
            name: 'Conventional Barbell Deadlift',
            keywords: ['deadlift', 'rdl', 'romanian deadlift', 'rack pull', 'stiff leg'],
            setup: [
                'Stand with feet hip-width apart; bar cuts directly across mid-foot (1 inch from shins).',
                'Hinge at hips to grip bar just outside knees without moving the bar forward.',
                'Pull slack out of the barbell until you hear a "click", engage lats like protecting armpits.'
            ],
            breathing: 'Breathe deeply into belly, brace abdominal wall tightly against spine. Maintain brace until bar passes knees on descent.',
            mistakes: [
                { mistake: 'Spinal flexion / Rounding lower back', fix: 'Keep chest proud and wedge hips down and into the bar before pulling.' },
                { mistake: 'Jerking the bar off the floor', fix: 'Build progressive floor pressure by driving through heels before accelerating.' },
                { mistake: 'Hyperextending spine at lockout', fix: 'Finish the lift by squeezing glutes forward into the bar; do not lean backward.' }
            ],
            tempoDefault: '2-0-1-0'
        },
        pullup: {
            name: 'Pull-ups & Lat Pulldowns',
            keywords: ['pull-up', 'pull up', 'chin-up', 'lat pulldown', 'lat pull'],
            setup: [
                'Grip bar with overhand grip slightly wider than shoulders.',
                'Depress shoulder blades down prior to pulling (engage active hang).',
                'Drive elbows down and back toward your hip pockets.'
            ],
            breathing: 'Exhale as you pull your chest toward the bar. Inhale smoothly on the eccentric lower.',
            mistakes: [
                { mistake: 'Kicking legs / Using momentum', fix: 'Cross ankles and squeeze glutes to maintain a rigid hollow-body tension.' },
                { mistake: 'Partial range of motion', fix: 'Lower to a full dead hang stretch on every rep to maximize lat hypertrophy.' }
            ],
            tempoDefault: '2-1-1-0'
        },
        row: {
            name: 'Barbell & Dumbbell Rows',
            keywords: ['row', 'barbell row', 'dumbbell row', 'cable row', 't-bar'],
            setup: [
                'Hinge hips backward until torso is at 45–60 degrees relative to the floor.',
                'Maintain neutral cervical spine (eyes looking 4-5 feet ahead).',
                'Pull load toward lower abdomen / hip crease.'
            ],
            breathing: 'Exhale on the pull, squeeze rhomboids and lats for 1 full second at peak contraction. Inhale as you lower.',
            mistakes: [
                { mistake: 'Standing up too upright using traps', fix: 'Lock hip angle in place; pull elbows behind your back rather than lifting torso.' },
                { mistake: 'Rounding lumbar spine', fix: 'Brace core and keep lats pre-engaged before initiating row repetitions.' }
            ],
            tempoDefault: '2-1-1-0'
        },
        overhead: {
            name: 'Overhead Shoulder Press',
            keywords: ['overhead press', 'military press', 'shoulder press', 'arnold press'],
            setup: [
                'Bar resting on anterior deltoids and clavicle with elbows slightly in front of bar.',
                'Squeeze glutes and quads tight to create a solid immovable base of support.',
                'Press straight up, moving head slightly back then punching head through at lockout.'
            ],
            breathing: 'Inhale deep into core before pressing. Exhale at top lockout.',
            mistakes: [
                { mistake: 'Excessive backward lean', fix: 'Lock ribcage down and flex glutes to prevent hyperextending lower back.' },
                { mistake: 'Pressing bar outward in front of face', fix: 'Keep bar path vertical as close to nose as possible.' }
            ],
            tempoDefault: '2-0-1-0'
        },
        arms: {
            name: 'Arm Isolations (Biceps & Triceps)',
            keywords: ['curl', 'bicep', 'tricep', 'pushdown', 'skull crusher', 'extension'],
            setup: [
                'Pin elbows tight against your ribcage.',
                'Keep wrists neutral without curling wrists backward.',
                'Isolate movement strictly around the elbow hinge joint.'
            ],
            breathing: 'Exhale during contraction, inhale during the eccentric stretch.',
            mistakes: [
                { mistake: 'Swinging torso for momentum', fix: 'Stand against a wall or lock hips in place; reduce weight to isolate the muscle.' }
            ],
            tempoDefault: '3-0-1-0'
        }
    };

    /**
     * Resolves form guidance for an exercise name.
     */
    function getExerciseFormGuide(exerciseName) {
        if (!exerciseName || typeof exerciseName !== 'string') {
            return FORM_DATABASE.bench;
        }
        const nameLower = exerciseName.toLowerCase();
        for (const key of Object.keys(FORM_DATABASE)) {
            const entry = FORM_DATABASE[key];
            for (const kw of entry.keywords) {
                if (nameLower.includes(kw)) {
                    return entry;
                }
            }
        }
        return FORM_DATABASE.bench;
    }

    /**
     * Parses standard tempo string (e.g. "3-1-1-0") into numeric phase durations.
     */
    function parseTempo(tempoStr) {
        if (!tempoStr || typeof tempoStr !== 'string') {
            return { eccentric: 3, pauseBottom: 1, concentric: 1, pauseTop: 0, totalSeconds: 5, label: '3s Eccentric / 1s Pause / 1s Concentric' };
        }
        const parts = tempoStr.split(/[-–]/).map(p => parseInt(p.trim(), 10) || 0);
        const eccentric = parts[0] !== undefined ? parts[0] : 3;
        const pauseBottom = parts[1] !== undefined ? parts[1] : 1;
        const concentric = parts[2] !== undefined ? parts[2] : 1;
        const pauseTop = parts[3] !== undefined ? parts[3] : 0;
        const totalSeconds = eccentric + pauseBottom + concentric + pauseTop;

        return {
            eccentric,
            pauseBottom,
            concentric,
            pauseTop,
            totalSeconds,
            label: `${eccentric}s Lower (Eccentric) • ${pauseBottom}s Pause • ${concentric}s Lift (Concentric)`
        };
    }

    /**
     * Renders an animated Tempo Rhythm visualizer bar.
     */
    function renderTempoVisualizer(tempoStr) {
        const parsed = parseTempo(tempoStr);
        return `
        <div class="tempo-rhythm-container" title="Biomechanical Tempo Rhythm: ${parsed.label}">
            <div class="tempo-pill-badge"><i class="fas fa-metronome"></i> Tempo: ${tempoStr || '3-1-1-0'}</div>
            <div class="tempo-phase-bar-track">
                <div class="tempo-phase phase-eccentric" style="flex: ${Math.max(1, parsed.eccentric)};" title="${parsed.eccentric}s Lowering">
                    <span>${parsed.eccentric}s Lower</span>
                </div>
                ${parsed.pauseBottom > 0 ? `<div class="tempo-phase phase-pause" style="flex: ${parsed.pauseBottom};" title="${parsed.pauseBottom}s Bottom Pause"><span>${parsed.pauseBottom}s Pause</span></div>` : ''}
                <div class="tempo-phase phase-concentric" style="flex: ${Math.max(1, parsed.concentric)};" title="${parsed.concentric}s Explosive Lift">
                    <span>${parsed.concentric}s Lift</span>
                </div>
            </div>
        </div>`;
    }

    return {
        ENGINE_VERSION,
        FORM_DATABASE,
        getExerciseFormGuide,
        parseTempo,
        renderTempoVisualizer
    };
}));
