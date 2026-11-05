/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * BIOMECHANICAL MUSCLE ANATOMY & ACTIVATION ENGINE (v1.0)
 * ==============================================================================
 * 
 * Deterministic engine for mapping exercise biomechanics to anatomical muscle
 * activation levels (Agonist, Synergist, Stabilizer) and computing scientific
 * hypertrophy volume landmarks (MEV, MAV, MRV).
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MuscleAnatomyEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    // ==========================================================================
    // 1. ANATOMICAL MUSCLE GROUPS & VOLUME LANDMARKS (RP Standard)
    // ==========================================================================

    const MUSCLE_GROUPS = {
        chest: { key: 'chest', label: 'Chest (Pectorals)', mev: 8, mavMin: 12, mavMax: 20, mrv: 22, view: 'anterior' },
        lats: { key: 'lats', label: 'Lats (Upper Back)', mev: 8, mavMin: 14, mavMax: 22, mrv: 25, view: 'posterior' },
        upper_back: { key: 'upper_back', label: 'Traps & Rhomboids', mev: 6, mavMin: 10, mavMax: 18, mrv: 22, view: 'posterior' },
        lower_back: { key: 'lower_back', label: 'Lower Back (Erectors)', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, view: 'posterior' },
        shoulders_front: { key: 'shoulders_front', label: 'Front Delts', mev: 4, mavMin: 6, mavMax: 12, mrv: 16, view: 'anterior' },
        shoulders_side: { key: 'shoulders_side', label: 'Side Delts', mev: 8, mavMin: 14, mavMax: 22, mrv: 26, view: 'both' },
        shoulders_rear: { key: 'shoulders_rear', label: 'Rear Delts', mev: 6, mavMin: 12, mavMax: 18, mrv: 22, view: 'posterior' },
        biceps: { key: 'biceps', label: 'Biceps', mev: 6, mavMin: 10, mavMax: 18, mrv: 22, view: 'anterior' },
        triceps: { key: 'triceps', label: 'Triceps', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, view: 'both' },
        forearms: { key: 'forearms', label: 'Forearms', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, view: 'both' },
        abs: { key: 'abs', label: 'Abs & Core', mev: 4, mavMin: 8, mavMax: 16, mrv: 20, view: 'anterior' },
        quads: { key: 'quads', label: 'Quadriceps', mev: 6, mavMin: 12, mavMax: 18, mrv: 22, view: 'anterior' },
        hamstrings: { key: 'hamstrings', label: 'Hamstrings', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, view: 'posterior' },
        glutes: { key: 'glutes', label: 'Glutes', mev: 4, mavMin: 8, mavMax: 16, mrv: 20, view: 'posterior' },
        calves: { key: 'calves', label: 'Calves', mev: 6, mavMin: 10, mavMax: 18, mrv: 22, view: 'both' }
    };

    // ==========================================================================
    // 2. EXERCISE BIOMECHANICAL ACTIVATION DATABASE
    // ==========================================================================

    const EXERCISE_ACTIVATION_RULES = [
        // Arms (Biceps / Triceps / Forearms) - Checked early for high specificity
        { match: ['bicep curl', 'barbell curl', 'dumbbell curl', 'hammer curl', 'preacher curl', 'concentration curl', 'incline curl', 'spider curl', 'curl'], primary: ['biceps'], secondary: ['forearms'], stabilizer: [] },
        { match: ['tricep pushdown', 'skull crusher', 'overhead tricep', 'tricep extension', 'close grip bench', 'tricep dip', 'kickback'], primary: ['triceps'], secondary: ['chest'], stabilizer: [] },
        { match: ['wrist curl', 'farmer walk', 'farmer carry'], primary: ['forearms'], secondary: ['upper_back'], stabilizer: ['abs'] },

        // Chest Compound
        { match: ['bench press', 'chest press', 'push-up', 'push up', 'dumbbell bench', 'flat bench'], primary: ['chest'], secondary: ['shoulders_front', 'triceps'], stabilizer: ['abs'] },
        { match: ['incline bench', 'incline press', 'incline dumbbell press', 'incline chest'], primary: ['chest', 'shoulders_front'], secondary: ['triceps'], stabilizer: ['abs'] },
        { match: ['decline bench', 'dips', 'chest dip'], primary: ['chest', 'triceps'], secondary: ['shoulders_front'], stabilizer: ['abs'] },
        { match: ['fly', 'cable crossover', 'pec deck'], primary: ['chest'], secondary: ['shoulders_front'], stabilizer: [] },

        // Back / Pull
        { match: ['deadlift', 'rack pull'], primary: ['lower_back', 'glutes', 'hamstrings'], secondary: ['lats', 'upper_back', 'forearms'], stabilizer: ['abs', 'quads'] },
        { match: ['pull-up', 'pull up', 'chin-up', 'lat pulldown', 'lat pull'], primary: ['lats'], secondary: ['biceps', 'upper_back', 'forearms'], stabilizer: ['abs'] },
        { match: ['barbell row', 'dumbbell row', 'seated cable row', 't-bar row', 'bent over row', 'pendlay row'], primary: ['lats', 'upper_back'], secondary: ['biceps', 'forearms', 'lower_back'], stabilizer: ['abs'] },
        { match: ['face pull', 'rear delt', 'reverse fly'], primary: ['shoulders_rear', 'upper_back'], secondary: ['shoulders_side'], stabilizer: [] },
        { match: ['shrug'], primary: ['upper_back'], secondary: ['forearms'], stabilizer: [] },

        // Shoulders / Overhead Press
        { match: ['overhead press', 'military press', 'shoulder press', 'pike push-up', 'arnold press'], primary: ['shoulders_front', 'shoulders_side'], secondary: ['triceps', 'upper_back'], stabilizer: ['abs', 'lower_back'] },
        { match: ['lateral raise', 'side raise', 'cable lateral'], primary: ['shoulders_side'], secondary: ['upper_back'], stabilizer: [] },
        { match: ['front raise'], primary: ['shoulders_front'], secondary: ['chest'], stabilizer: [] },

        // Legs (Quads / Hamstrings / Glutes / Calves)
        { match: ['squat', 'front squat', 'goblet squat', 'leg press', 'hack squat', 'sissy squat'], primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'], stabilizer: ['abs', 'lower_back'] },
        { match: ['lunge', 'bulgarian split squat', 'step up'], primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'], stabilizer: ['abs'] },
        { match: ['leg extension'], primary: ['quads'], secondary: [], stabilizer: [] },
        { match: ['romanian deadlift', 'rdl', 'stiff leg deadlift', 'good morning'], primary: ['hamstrings', 'glutes'], secondary: ['lower_back', 'forearms'], stabilizer: ['abs'] },
        { match: ['leg curl', 'lying leg curl', 'seated leg curl', 'nordic curl', 'hamstring curl'], primary: ['hamstrings'], secondary: ['calves'], stabilizer: [] },
        { match: ['hip thrust', 'glute bridge', 'cable kickback'], primary: ['glutes'], secondary: ['hamstrings'], stabilizer: ['lower_back'] },
        { match: ['calf raise', 'standing calf', 'seated calf', 'donkey calf'], primary: ['calves'], secondary: [], stabilizer: [] },

        // Core / Abs
        { match: ['plank', 'hanging leg raise', 'crunch', 'ab rollout', 'cable woodchopper', 'sit up', 'russian twist', 'leg raise'], primary: ['abs'], secondary: ['lower_back'], stabilizer: ['shoulders_front'] }
    ];

    /**
     * Resolves active muscles for a given exercise name.
     * @param {string} exerciseName 
     * @returns {{ primary: string[], secondary: string[], stabilizer: string[] }}
     */
    function getExerciseMuscleMap(exerciseName) {
        if (!exerciseName || typeof exerciseName !== 'string') {
            return { primary: [], secondary: [], stabilizer: [] };
        }

        const cleanName = exerciseName.toLowerCase().trim();
        for (const rule of EXERCISE_ACTIVATION_RULES) {
            for (const m of rule.match) {
                if (cleanName.includes(m)) {
                    return {
                        primary: [...rule.primary],
                        secondary: [...rule.secondary],
                        stabilizer: [...rule.stabilizer]
                    };
                }
            }
        }

        // Fallback heuristics
        if (cleanName.includes('press')) return { primary: ['chest', 'triceps'], secondary: ['shoulders_front'], stabilizer: ['abs'] };
        if (cleanName.includes('pull') || cleanName.includes('row')) return { primary: ['lats'], secondary: ['biceps', 'upper_back'], stabilizer: ['forearms'] };
        if (cleanName.includes('leg')) return { primary: ['quads'], secondary: ['glutes', 'hamstrings'], stabilizer: [] };
        if (cleanName.includes('curl')) return { primary: ['biceps'], secondary: ['forearms'], stabilizer: [] };

        return { primary: ['chest'], secondary: ['shoulders_front'], stabilizer: [] };
    }

    /**
     * Evaluates volume landmark status for a given muscle group and weekly direct set volume.
     * @param {string} muscleKey 
     * @param {number} weeklySets 
     * @returns {{ status: string, label: string, color: string, description: string }}
     */
    function getVolumeStatus(muscleKey, weeklySets) {
        const spec = MUSCLE_GROUPS[muscleKey] || { mev: 6, mavMin: 10, mavMax: 18, mrv: 22 };
        const sets = Math.max(0, parseInt(weeklySets, 10) || 0);

        if (sets === 0) {
            return { status: 'RESTING', label: 'No Active Volume', color: '#718096', description: 'No direct volume programmed.' };
        }
        if (sets < spec.mev) {
            return { status: 'BELOW_MEV', label: 'Maintenance Only (< MEV)', color: '#4299e1', description: `Below Minimum Effective Volume (${spec.mev} sets). Suitable for maintenance.` };
        }
        if (sets >= spec.mev && sets < spec.mavMin) {
            return { status: 'MINIMUM_GROWTH', label: 'Low Hypertrophy Zone', color: '#38a169', description: `Above MEV (${spec.mev} sets), stimulates moderate hypertrophy.` };
        }
        if (sets >= spec.mavMin && sets <= spec.mavMax) {
            return { status: 'OPTIMAL_MAV', label: 'Maximum Adaptive Volume (MAV)', color: '#B3DD24', description: `Optimal growth sweet-spot (${spec.mavMin}–${spec.mavMax} sets/week).` };
        }
        if (sets > spec.mavMax && sets <= spec.mrv) {
            return { status: 'HIGH_VOLUME', label: 'High Accumulation Phase', color: '#ed8936', description: `Approaching Maximum Recoverable Volume (${spec.mrv} sets). Monitor fatigue.` };
        }
        return { status: 'OVER_MRV', label: 'Overreaching Risk (> MRV)', color: '#e53e3e', description: `Exceeds MRV (${spec.mrv} sets). High risk of systemic overtraining.` };
    }

    /**
     * Analyzes weekly muscle volume and activation across an entire generated workout program.
     * @param {Object} program 
     * @returns {Object} Muscle volume breakdown
     */
    function analyzeProgramMuscleVolume(program) {
        if (!program || !Array.isArray(program.sessions)) {
            return { totalSets: 0, muscleMap: {}, activeMuscles: [] };
        }

        const volumeMap = {};
        Object.keys(MUSCLE_GROUPS).forEach(k => {
            volumeMap[k] = {
                muscle: MUSCLE_GROUPS[k],
                directSets: 0,
                indirectSets: 0,
                exercises: []
            };
        });

        let totalSets = 0;

        program.sessions.forEach(session => {
            (session.exercises || []).forEach(ex => {
                const exName = ex.exerciseName || ex.name || '';
                const sets = typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets, 10) || 3;
                totalSets += sets;

                const map = getExerciseMuscleMap(exName);

                map.primary.forEach(m => {
                    if (volumeMap[m]) {
                        volumeMap[m].directSets += sets;
                        if (!volumeMap[m].exercises.includes(exName)) {
                            volumeMap[m].exercises.push(exName);
                        }
                    }
                });

                map.secondary.forEach(m => {
                    if (volumeMap[m]) {
                        volumeMap[m].indirectSets += Math.round(sets * 0.5);
                        if (!volumeMap[m].exercises.includes(exName)) {
                            volumeMap[m].exercises.push(exName);
                        }
                    }
                });
            });
        });

        // Compute status for each muscle
        const resultMuscles = {};
        const activeList = [];

        Object.keys(volumeMap).forEach(k => {
            const data = volumeMap[k];
            const totalEffectiveSets = data.directSets + (data.indirectSets * 0.5);
            const status = getVolumeStatus(k, data.directSets);

            resultMuscles[k] = {
                ...data,
                totalEffectiveSets,
                status
            };

            if (data.directSets > 0 || data.indirectSets > 0) {
                activeList.push(k);
            }
        });

        return {
            totalSets,
            muscleMap: resultMuscles,
            activeMuscles: activeList
        };
    }

    /**
     * Analyzes muscle activation for a single daily training session.
     * @param {Object} session 
     * @returns {{ primary: string[], secondary: string[], stabilizer: string[], sessionExercises: Array }}
     */
    function analyzeSessionMuscleActivation(session) {
        if (!session || !Array.isArray(session.exercises)) {
            return { primary: [], secondary: [], stabilizer: [], sessionExercises: [] };
        }

        const primarySet = new Set();
        const secondarySet = new Set();
        const stabilizerSet = new Set();
        const exerciseList = [];

        session.exercises.forEach(ex => {
            const exName = ex.exerciseName || ex.name || '';
            const map = getExerciseMuscleMap(exName);
            map.primary.forEach(m => primarySet.add(m));
            map.secondary.forEach(m => secondarySet.add(m));
            map.stabilizer.forEach(m => stabilizerSet.add(m));
            exerciseList.push({ name: exName, target: map });
        });

        return {
            primary: Array.from(primarySet),
            secondary: Array.from(secondarySet).filter(m => !primarySet.has(m)),
            stabilizer: Array.from(stabilizerSet).filter(m => !primarySet.has(m) && !secondarySet.has(m)),
            sessionExercises: exerciseList
        };
    }

    // ==========================================================================
    // 3. ANATOMICAL 2D SVG VECTOR HEATMAP BUILDER
    // ==========================================================================

    /**
     * Generates a modern dual-view (Anterior / Front + Posterior / Back) SVG heatmap.
     * 
     * @param {Object} activation Object with primary, secondary, and stabilizer arrays or volume map
     * @param {Object} [options] Custom rendering options
     * @returns {string} Clean SVG markup string
     */
    function renderAnatomyHeatmapSVG(activation, options = {}) {
        const primary = (activation && activation.primary) || [];
        const secondary = (activation && activation.secondary) || [];
        const stabilizer = (activation && activation.stabilizer) || [];

        const getColor = (muscleKey) => {
            if (primary.includes(muscleKey)) return '#B3DD24'; // Performance Lime (Primary)
            if (secondary.includes(muscleKey)) return '#ff9800'; // Amber (Secondary)
            if (stabilizer.includes(muscleKey)) return '#00e5ff'; // Cyan (Stabilizer)
            return '#1e293b'; // Inactive slate
        };

        const getStroke = (muscleKey) => {
            if (primary.includes(muscleKey)) return '#C4ED32';
            if (secondary.includes(muscleKey)) return '#ffb74d';
            if (stabilizer.includes(muscleKey)) return '#80d8ff';
            return '#334155';
        };

        const getGlowFilter = (muscleKey) => {
            if (primary.includes(muscleKey)) return 'filter="url(#glow-gold)"';
            if (secondary.includes(muscleKey)) return 'filter="url(#glow-amber)"';
            if (stabilizer.includes(muscleKey)) return 'filter="url(#glow-cyan)"';
            return '';
        };

        return `
        <div class="anatomy-heatmap-dual-container">
            <svg viewBox="0 0 460 260" class="anatomy-dual-svg" aria-label="Interactive Muscle Anatomy Heatmap">
                <defs>
                    <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <!-- ================= FRONT / ANTERIOR BODY (Left Side) ================= -->
                <g class="anterior-view-group" transform="translate(10, 10)">
                    <text x="105" y="16" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">ANTERIOR (FRONT)</text>
                    
                    <!-- Head & Neck -->
                    <circle cx="105" cy="38" r="14" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
                    <path d="M98 52 L112 52 L110 60 L100 60 Z" fill="#1e293b" stroke="#334155" stroke-width="1" />

                    <!-- Front Shoulders (Deltoids) -->
                    <path class="muscle-node muscle-shoulders_front" data-muscle="shoulders_front" d="M76 60 Q88 56 94 62 L90 76 Q78 72 76 60 Z" fill="${getColor('shoulders_front')}" stroke="${getStroke('shoulders_front')}" stroke-width="1.5" ${getGlowFilter('shoulders_front')} />
                    <path class="muscle-node muscle-shoulders_front" data-muscle="shoulders_front" d="M134 60 Q122 56 116 62 L120 76 Q132 72 134 60 Z" fill="${getColor('shoulders_front')}" stroke="${getStroke('shoulders_front')}" stroke-width="1.5" ${getGlowFilter('shoulders_front')} />

                    <!-- Chest (Pectoralis Major) -->
                    <path class="muscle-node muscle-chest" data-muscle="chest" d="M93 63 Q105 66 117 63 Q121 78 105 84 Q89 78 93 63 Z" fill="${getColor('chest')}" stroke="${getStroke('chest')}" stroke-width="1.5" ${getGlowFilter('chest')} />

                    <!-- Biceps -->
                    <rect class="muscle-node muscle-biceps" data-muscle="biceps" x="72" y="77" width="14" height="24" rx="5" fill="${getColor('biceps')}" stroke="${getStroke('biceps')}" stroke-width="1.5" ${getGlowFilter('biceps')} />
                    <rect class="muscle-node muscle-biceps" data-muscle="biceps" x="124" y="77" width="14" height="24" rx="5" fill="${getColor('biceps')}" stroke="${getStroke('biceps')}" stroke-width="1.5" ${getGlowFilter('biceps')} />

                    <!-- Forearms -->
                    <rect class="muscle-node muscle-forearms" data-muscle="forearms" x="68" y="104" width="12" height="28" rx="4" fill="${getColor('forearms')}" stroke="${getStroke('forearms')}" stroke-width="1.5" ${getGlowFilter('forearms')} />
                    <rect class="muscle-node muscle-forearms" data-muscle="forearms" x="130" y="104" width="12" height="28" rx="4" fill="${getColor('forearms')}" stroke="${getStroke('forearms')}" stroke-width="1.5" ${getGlowFilter('forearms')} />

                    <!-- Abs & Core (Rectus Abdominis) -->
                    <path class="muscle-node muscle-abs" data-muscle="abs" d="M96 86 L114 86 L112 122 L98 122 Z" fill="${getColor('abs')}" stroke="${getStroke('abs')}" stroke-width="1.5" ${getGlowFilter('abs')} />
                    
                    <!-- Pelvis / Hip area -->
                    <path d="M95 124 L115 124 L120 134 L90 134 Z" fill="#1e293b" stroke="#334155" stroke-width="1" />

                    <!-- Quads (Quadriceps Femoris) -->
                    <path class="muscle-node muscle-quads" data-muscle="quads" d="M89 136 Q103 136 103 150 L101 184 Q87 182 86 150 Z" fill="${getColor('quads')}" stroke="${getStroke('quads')}" stroke-width="1.5" ${getGlowFilter('quads')} />
                    <path class="muscle-node muscle-quads" data-muscle="quads" d="M121 136 Q107 136 107 150 L109 184 Q123 182 124 150 Z" fill="${getColor('quads')}" stroke="${getStroke('quads')}" stroke-width="1.5" ${getGlowFilter('quads')} />

                    <!-- Calves (Front Shin / Tibialis / Gastrocnemius) -->
                    <rect class="muscle-node muscle-calves" data-muscle="calves" x="88" y="192" width="12" height="34" rx="4" fill="${getColor('calves')}" stroke="${getStroke('calves')}" stroke-width="1.5" ${getGlowFilter('calves')} />
                    <rect class="muscle-node muscle-calves" data-muscle="calves" x="110" y="192" width="12" height="34" rx="4" fill="${getColor('calves')}" stroke="${getStroke('calves')}" stroke-width="1.5" ${getGlowFilter('calves')} />
                </g>

                <!-- Divider Line -->
                <line x1="230" y1="20" x2="230" y2="240" stroke="#334155" stroke-width="1" stroke-dasharray="3,3" />

                <!-- ================= BACK / POSTERIOR BODY (Right Side) ================= -->
                <g class="posterior-view-group" transform="translate(230, 10)">
                    <text x="115" y="16" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">POSTERIOR (BACK)</text>

                    <!-- Head & Neck -->
                    <circle cx="115" cy="38" r="14" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
                    
                    <!-- Traps & Upper Back -->
                    <path class="muscle-node muscle-upper_back" data-muscle="upper_back" d="M103 52 Q115 50 127 52 L138 68 Q115 76 92 68 Z" fill="${getColor('upper_back')}" stroke="${getStroke('upper_back')}" stroke-width="1.5" ${getGlowFilter('upper_back')} />

                    <!-- Rear Deltoids -->
                    <path class="muscle-node muscle-shoulders_rear" data-muscle="shoulders_rear" d="M86 64 Q98 62 102 68 L98 78 Q86 74 86 64 Z" fill="${getColor('shoulders_rear')}" stroke="${getStroke('shoulders_rear')}" stroke-width="1.5" ${getGlowFilter('shoulders_rear')} />
                    <path class="muscle-node muscle-shoulders_rear" data-muscle="shoulders_rear" d="M144 64 Q132 62 128 68 L132 78 Q144 74 144 64 Z" fill="${getColor('shoulders_rear')}" stroke="${getStroke('shoulders_rear')}" stroke-width="1.5" ${getGlowFilter('shoulders_rear')} />

                    <!-- Lats (Latissimus Dorsi) -->
                    <path class="muscle-node muscle-lats" data-muscle="lats" d="M96 74 Q115 78 134 74 L126 104 Q115 108 104 104 Z" fill="${getColor('lats')}" stroke="${getStroke('lats')}" stroke-width="1.5" ${getGlowFilter('lats')} />

                    <!-- Triceps -->
                    <rect class="muscle-node muscle-triceps" data-muscle="triceps" x="82" y="77" width="13" height="24" rx="4" fill="${getColor('triceps')}" stroke="${getStroke('triceps')}" stroke-width="1.5" ${getGlowFilter('triceps')} />
                    <rect class="muscle-node muscle-triceps" data-muscle="triceps" x="135" y="77" width="13" height="24" rx="4" fill="${getColor('triceps')}" stroke="${getStroke('triceps')}" stroke-width="1.5" ${getGlowFilter('triceps')} />

                    <!-- Lower Back (Erectors) -->
                    <path class="muscle-node muscle-lower_back" data-muscle="lower_back" d="M106 106 L124 106 L122 124 L108 124 Z" fill="${getColor('lower_back')}" stroke="${getStroke('lower_back')}" stroke-width="1.5" ${getGlowFilter('lower_back')} />

                    <!-- Glutes (Gluteus Maximus) -->
                    <path class="muscle-node muscle-glutes" data-muscle="glutes" d="M98 126 Q115 124 132 126 Q138 144 115 146 Q92 144 98 126 Z" fill="${getColor('glutes')}" stroke="${getStroke('glutes')}" stroke-width="1.5" ${getGlowFilter('glutes')} />

                    <!-- Hamstrings -->
                    <path class="muscle-node muscle-hamstrings" data-muscle="hamstrings" d="M99 148 Q113 148 113 162 L111 184 Q97 184 97 162 Z" fill="${getColor('hamstrings')}" stroke="${getStroke('hamstrings')}" stroke-width="1.5" ${getGlowFilter('hamstrings')} />
                    <path class="muscle-node muscle-hamstrings" data-muscle="hamstrings" d="M131 148 Q117 148 117 162 L119 184 Q133 184 133 162 Z" fill="${getColor('hamstrings')}" stroke="${getStroke('hamstrings')}" stroke-width="1.5" ${getGlowFilter('hamstrings')} />

                    <!-- Calves (Gastrocnemius & Soleus) -->
                    <rect class="muscle-node muscle-calves" data-muscle="calves" x="98" y="192" width="13" height="34" rx="5" fill="${getColor('calves')}" stroke="${getStroke('calves')}" stroke-width="1.5" ${getGlowFilter('calves')} />
                    <rect class="muscle-node muscle-calves" data-muscle="calves" x="119" y="192" width="13" height="34" rx="5" fill="${getColor('calves')}" stroke="${getStroke('calves')}" stroke-width="1.5" ${getGlowFilter('calves')} />
                </g>
            </svg>
        </div>`;
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        ENGINE_VERSION,
        MUSCLE_GROUPS,
        getExerciseMuscleMap,
        getVolumeStatus,
        analyzeProgramMuscleVolume,
        analyzeSessionMuscleActivation,
        renderAnatomyHeatmapSVG
    };
}));
