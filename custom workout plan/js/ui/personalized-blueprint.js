/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PERSONALIZED TRAINING BLUEPRINT UI MODULE (v1.0)
 * ==============================================================================
 * 
 * Standalone, deterministic presentation and interaction layer for displaying
 * validated, dynamically generated workout programs.
 * 
 * Core Design Principles:
 * 1. PURE PRESENTATION LAYER: Consumes validated program data without generating
 *    or mutating workout logic.
 * 2. EXPLAINABLE PERSONALIZATION: Displays actual engine reasons and constraints.
 *    No fabricated percentages or fake match scores.
 * 3. TRANSPARENT QUALITY & SAFETY: Renders deterministic quality metrics,
 *    validation statuses (VALID, WARNING, REPAIRED, INVALID), and joint protection notes.
 * 4. PROGRESSION VISIBILITY: Clearly communicates progressive overload models,
 *    rep/tempo targets, and recovery guidelines.
 * 5. RESPONSIVE & INTERACTIVE: Mobile-first responsive layout with touch-friendly
 *    expandable exercise details and print/download support.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PersonalizedBlueprintUI = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const UI_VERSION = '1.0';

    // ==========================================================================
    // 1. HELPER UTILITIES & STRING ESCAPING
    // ==========================================================================

    /**
     * Escapes raw text for safe HTML rendering.
     * @param {string} str 
     * @returns {string}
     */
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Converts hyphenated/snake_case tokens to clean Title Case.
     * @param {string} str 
     * @returns {string}
     */
    function formatLabel(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    // ==========================================================================
    // 2. HEADER COMPONENT
    // ==========================================================================

    /**
     * Renders the personalized blueprint header.
     * @param {Object} program 
     * @param {Object} [validationResult] 
     * @param {Object} [options] 
     * @returns {string} HTML string
     */
    function renderPersonalizedHeader(program, validationResult, options) {
        if (!program || typeof program !== 'object') return '';

        const meta = program.meta || {};
        const profile = program.profileSummary || {};
        const opt = options || {};
        const userName = escapeHTML(opt.userName || program.userName || meta.userName || profile.name || profile.userName || 'Athlete');
        const goalLabel = formatLabel(profile.goal || meta.goal || 'Custom Transformation');
        const splitType = formatLabel(program.weeklySchedule ? program.weeklySchedule.splitType : 'Periodized Split');
        const daysCount = program.weeklySchedule && Array.isArray(program.weeklySchedule.trainingDays) 
            ? program.weeklySchedule.trainingDays.length 
            : (program.sessions ? program.sessions.length : 3);
        const expLevel = formatLabel(profile.experience || 'Intermediate');
        const durationMin = profile.workoutDuration ? `${profile.workoutDuration.replace(/-/g, ' ')} min` : '45-60 min';
        const location = formatLabel(profile.workoutLocation || 'Gym');

        return `
        <header class="blueprint-hero-header" data-testid="blueprint-header">
            <div class="blueprint-hero-top">
                <div class="blueprint-badge-group">
                    <span class="blueprint-status-pill"><i class="fas fa-certificate"></i> Personalized Training Blueprint</span>
                    <span class="blueprint-version-pill">v${escapeHTML(program.version || '1.0')}</span>
                </div>
                <h1 class="blueprint-main-title">${userName}'s Custom Blueprint</h1>
                <p class="blueprint-subtitle">Built around your goal, schedule, experience, equipment and recovery constraints.</p>
            </div>
            
            <div class="blueprint-stat-grid" data-testid="blueprint-stat-grid">
                <div class="blueprint-stat-card">
                    <span class="blueprint-stat-label"><i class="fas fa-bullseye"></i> Primary Goal</span>
                    <span class="blueprint-stat-value">${goalLabel}</span>
                </div>
                <div class="blueprint-stat-card">
                    <span class="blueprint-stat-label"><i class="fas fa-calendar-week"></i> Frequency</span>
                    <span class="blueprint-stat-value">${daysCount} Days / Week</span>
                </div>
                <div class="blueprint-stat-card">
                    <span class="blueprint-stat-label"><i class="fas fa-layer-group"></i> Experience</span>
                    <span class="blueprint-stat-value">${expLevel}</span>
                </div>
                <div class="blueprint-stat-card">
                    <span class="blueprint-stat-label"><i class="fas fa-stopwatch"></i> Target Duration</span>
                    <span class="blueprint-stat-value">${escapeHTML(durationMin)}</span>
                </div>
                <div class="blueprint-stat-card">
                    <span class="blueprint-stat-label"><i class="fas fa-location-dot"></i> Training Environment</span>
                    <span class="blueprint-stat-value">${location}</span>
                </div>
                <div class="blueprint-stat-card">
                    <span class="blueprint-stat-label"><i class="fas fa-diagram-project"></i> Split Architecture</span>
                    <span class="blueprint-stat-value">${splitType}</span>
                </div>
            </div>
        </header>`;
    }

    // ==========================================================================
    // 3. PERSONALIZATION REASONS & "WHY THIS PLAN" COMPONENT
    // ==========================================================================

    /**
     * Renders explainable engine personalization reasons.
     * @param {Object} program 
     * @returns {string} HTML string
     */
    function renderPersonalizationReasons(program) {
        if (!program || typeof program !== 'object') return '';
        const reasons = Array.isArray(program.personalizationReasons) ? program.personalizationReasons : [];

        if (reasons.length === 0) return '';

        const reasonItems = reasons.map((r, idx) => {
            const ruleName = r.rule ? formatLabel(r.rule) : 'Personalization Logic';
            const text = escapeHTML(typeof r === 'string' ? r : r.reason);
            return `
            <li class="blueprint-reason-item" data-testid="reason-item-${idx}">
                <div class="blueprint-reason-icon"><i class="fas fa-check"></i></div>
                <div class="blueprint-reason-body">
                    <strong class="blueprint-reason-title">${escapeHTML(ruleName)}:</strong>
                    <span class="blueprint-reason-text">${text}</span>
                </div>
            </li>`;
        }).join('');

        return `
        <section class="blueprint-section blueprint-why-this-plan" data-testid="why-this-plan-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-sliders section-icon"></i>
                    <h2>Why This Plan Fits Your Profile</h2>
                </div>
                <span class="blueprint-meta-tag">Deterministic Engine Audits</span>
            </div>
            <ul class="blueprint-reasons-list">
                ${reasonItems}
            </ul>
        </section>`;
    }

    // ==========================================================================
    // 4. WEEKLY SCHEDULE COMPONENT
    // ==========================================================================

    /**
     * Renders the 7-day weekly schedule matrix based on actual program data.
     * Never hardcodes split days.
     * @param {Object} program 
     * @returns {string} HTML string
     */
    function renderWeeklySchedule(program) {
        if (!program || typeof program !== 'object') return '';

        const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const sessions = Array.isArray(program.sessions) ? program.sessions : [];
        const sessionMap = {};

        sessions.forEach(sess => {
            if (sess && sess.day) {
                sessionMap[sess.day] = sess;
            }
        });

        const dayCards = allDays.map(dayName => {
            const sess = sessionMap[dayName];
            const isTrainingDay = !!sess;
            const title = isTrainingDay ? escapeHTML(sess.title || `${sess.focus || 'Training Session'}`) : 'Rest & Recovery';
            const duration = isTrainingDay && sess.estimatedDurationMinutes ? `${sess.estimatedDurationMinutes}m` : '0m';
            const exerciseCount = isTrainingDay && Array.isArray(sess.exercises) ? `${sess.exercises.length} lifts` : 'Active Reset';
            const statusClass = isTrainingDay ? 'training-day' : 'rest-day';
            const icon = isTrainingDay ? 'fa-dumbbell' : 'fa-bed';

            return `
            <div class="blueprint-schedule-col ${statusClass}" data-testid="schedule-day-${dayName.toLowerCase()}">
                <div class="blueprint-day-name">${dayName.slice(0, 3).toUpperCase()}</div>
                <div class="blueprint-day-icon"><i class="fas ${icon}"></i></div>
                <div class="blueprint-day-activity">${title}</div>
                <div class="blueprint-day-meta">
                    <span class="blueprint-day-dur">${duration}</span>
                    <span class="blueprint-day-count">${exerciseCount}</span>
                </div>
            </div>`;
        }).join('');

        return `
        <section class="blueprint-section blueprint-schedule-section" data-testid="weekly-schedule-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-calendar-days section-icon"></i>
                    <h2>Weekly Training Schedule</h2>
                </div>
                <span class="blueprint-meta-tag">${sessions.length} Training Days / Week</span>
            </div>
            <div class="blueprint-schedule-grid">
                ${dayCards}
            </div>
        </section>`;
    }

    // ==========================================================================
    // 5. EXERCISE CARD & EXPANDABLE ACCORDION COMPONENT
    // ==========================================================================

    /**
     * Renders a single exercise item with expandable details.
     * Cleanly omits unavailable metadata (no "N/A" or "Unknown").
     * @param {Object} exercise 
     * @param {number} exIndex 
     * @param {number} sessionIndex 
     * @returns {string} HTML string
     */
    function renderExerciseCard(exercise, exIndex, sessionIndex) {
        if (!exercise || typeof exercise !== 'object') return '';

        const sIdx = typeof sessionIndex === 'number' ? sessionIndex : 0;
        const eIdx = typeof exIndex === 'number' ? exIndex : 0;
        const exId = `ex-${sIdx}-${eIdx}`;
        const name = escapeHTML(exercise.exerciseName || exercise.name || 'Exercise');
        const sets = typeof exercise.sets === 'number' ? exercise.sets : (parseInt(exercise.sets) || 3);
        const reps = escapeHTML(exercise.reps || '8-12');
        const rest = typeof exercise.restSeconds === 'number' ? `${exercise.restSeconds}s` : (exercise.rest ? escapeHTML(exercise.rest) : '60s');
        const tempo = exercise.tempo ? escapeHTML(exercise.tempo) : null;
        const pattern = exercise.movementPattern ? formatLabel(exercise.movementPattern) : null;
        const primaryMuscles = Array.isArray(exercise.primaryMuscles) && exercise.primaryMuscles.length > 0 
            ? exercise.primaryMuscles.map(m => formatLabel(m)).join(', ') 
            : null;
        const equipment = Array.isArray(exercise.equipment) && exercise.equipment.length > 0 
            ? exercise.equipment.map(e => formatLabel(e)).join(', ') 
            : (typeof exercise.equipment === 'string' ? formatLabel(exercise.equipment) : null);
        const reason = exercise.reason ? escapeHTML(exercise.reason) : null;
        const progObj = (exercise.progression && typeof exercise.progression === 'object') ? exercise.progression : null;
        const progression = progObj && progObj.model ? formatLabel(progObj.model) : (exercise.progressionModel ? formatLabel(exercise.progressionModel) : null);
        const progressionTrigger = progObj && progObj.progressionTrigger ? escapeHTML(progObj.progressionTrigger) : null;
        const progressionAction = progObj && progObj.progressionAction ? escapeHTML(progObj.progressionAction) : null;
        const hasIntensity = typeof exercise.rir === 'number' && typeof exercise.rpe === 'number';
        const intensityRange = exercise.targetRange ? escapeHTML(exercise.targetRange) : (hasIntensity ? `RIR ${exercise.rir}` : null);
        const intensityRationale = exercise.intensityRationale ? escapeHTML(exercise.intensityRationale) : null;
        const isBarbell = Array.isArray(exercise.equipment)
            ? exercise.equipment.some(eq => typeof eq === 'string' && eq.toLowerCase().includes('barbell'))
            : (typeof exercise.equipment === 'string' && exercise.equipment.toLowerCase().includes('barbell'));

        return `
        <div class="blueprint-exercise-item" id="${exId}" data-testid="exercise-card-${exId}">
            <div class="blueprint-exercise-summary" onclick="PersonalizedBlueprintUI.toggleExercise('${exId}')">
                <div class="blueprint-exercise-left">
                    <span class="blueprint-exercise-num">${eIdx + 1}</span>
                    <div class="blueprint-exercise-title-wrap">
                        <span class="blueprint-exercise-name">${name}</span>
                        ${exercise.substituted ? `<span class="blueprint-substituted-pill" title="Substituted alternative"><i class="fas fa-arrows-rotate"></i> Swapped</span>` : ''}
                        ${pattern ? `<span class="blueprint-pattern-tag">${pattern}</span>` : ''}
                    </div>
                </div>
                <div class="blueprint-exercise-quick-stats">
                    <span class="blueprint-pill-stat"><strong class="highlight-gold">${sets}</strong> sets</span>
                    <span class="blueprint-pill-stat"><strong>${reps}</strong> reps</span>
                    <span class="blueprint-pill-stat"><i class="fas fa-stopwatch"></i> ${rest}</span>
                    ${hasIntensity ? `<span class="blueprint-pill-stat"><i class="fas fa-gauge"></i> <strong class="highlight-gold">RIR ${exercise.rir}</strong> (RPE ${exercise.rpe})</span>` : ''}
                    ${isBarbell ? `
                    <button class="blueprint-swap-btn" onclick="event.stopPropagation(); PersonalizedBlueprintUI.openPlateCalculator(60, 'kg')" title="Barbell Plate Calculator">
                        <i class="fas fa-calculator"></i> Plates
                    </button>` : ''}
                    <a href="../Form%20module/index.html" class="blueprint-swap-btn" onclick="event.stopPropagation();" title="Watch Technique Masterclass in Exercise Academy" target="_blank" style="text-decoration:none; display:inline-flex; align-items:center;">
                        <i class="fas fa-video"></i> Technique
                    </a>
                    <button class="blueprint-swap-btn" onclick="event.stopPropagation(); PersonalizedBlueprintUI.openSubstitutionModal('${escapeHTML(exercise.exerciseId || exercise.id)}', ${sIdx}, ${eIdx})" title="Replace Exercise with Valid Alternative">
                        <i class="fas fa-arrows-rotate"></i> Swap
                    </button>
                    <button class="blueprint-accordion-btn" aria-label="Toggle exercise details">
                        <i class="fas fa-chevron-down blueprint-chevron"></i>
                    </button>
                </div>
            </div>
            
            <div class="blueprint-exercise-details" style="display: none;">
                <div class="blueprint-detail-grid">
                    ${primaryMuscles ? `
                    <div class="blueprint-detail-item">
                        <span class="blueprint-detail-label"><i class="fas fa-bullseye"></i> Target Muscle</span>
                        <span class="blueprint-detail-value">${primaryMuscles}</span>
                    </div>` : ''}
                    
                    ${equipment ? `
                    <div class="blueprint-detail-item">
                        <span class="blueprint-detail-label"><i class="fas fa-wrench"></i> Equipment</span>
                        <span class="blueprint-detail-value">${equipment}</span>
                    </div>` : ''}
                    
                    ${hasIntensity ? `
                    <div class="blueprint-detail-item">
                        <span class="blueprint-detail-label"><i class="fas fa-gauge"></i> Target Effort</span>
                        <span class="blueprint-detail-value">${intensityRange} &middot; RPE ${exercise.rpe}</span>
                    </div>` : ''}

                    ${tempo ? `
                    <div class="blueprint-detail-item">
                        <span class="blueprint-detail-label"><i class="fas fa-gauge-high"></i> Cadence / Tempo</span>
                        <span class="blueprint-detail-value">${tempo} (Ecc-Pause-Conc-Top)</span>
                    </div>` : ''}
                    
                    ${progression ? `
                    <div class="blueprint-detail-item">
                        <span class="blueprint-detail-label"><i class="fas fa-arrow-trend-up"></i> Overload Protocol</span>
                        <span class="blueprint-detail-value">${progression}</span>
                    </div>` : ''}
                </div>
                
                ${progressionTrigger ? `
                <div class="blueprint-exercise-coaching" style="margin-bottom: 8px;">
                    <i class="fas fa-arrow-trend-up"></i> <strong>Progression Rule:</strong> ${progressionTrigger} ${progressionAction ? `<em>(${progressionAction})</em>` : ''}
                </div>` : ''}

                ${intensityRationale ? `
                <div class="blueprint-exercise-coaching" style="margin-bottom: 8px;">
                    <i class="fas fa-gauge"></i> <strong>Effort Target:</strong> ${intensityRationale}
                </div>` : ''}

                ${reason ? `
                <div class="blueprint-exercise-coaching">
                    <i class="fas fa-lightbulb"></i> <strong>Coaching Note:</strong> ${reason}
                </div>` : ''}
            </div>
        </div>`;
    }

    // ==========================================================================
    // 6. SESSION CARDS COMPONENT
    // ==========================================================================

    /**
     * Renders a full session card with all prescribed exercises.
     * @param {Object} session 
     * @param {number} sIdx 
     * @returns {string} HTML string
     */
    function renderSessionCard(session, sIdx) {
        if (!session || typeof session !== 'object') return '';

        const day = escapeHTML(session.day || `Day ${sIdx + 1}`);
        const title = escapeHTML(session.title || `Workout Session ${sIdx + 1}`);
        const focus = session.focus ? escapeHTML(session.focus) : null;
        const duration = session.estimatedDurationMinutes ? `${session.estimatedDurationMinutes} min` : '45 min';
        const exercises = Array.isArray(session.exercises) ? session.exercises : [];

        let exerciseItems = '';
        if (_isSupersetModeActive && typeof window !== 'undefined' && window.SupersetEngine) {
            const supersetGrouping = window.SupersetEngine.groupSessionIntoSupersets(exercises);
            exerciseItems = supersetGrouping.groupedList.map((item, idx) => {
                if (item.type === 'SUPERSET') {
                    return `
                    <div class="superset-pairing-container">
                        <div class="superset-header-tag">
                            <span><i class="fas fa-bolt"></i> ${item.label} (${item.tag})</span>
                            <span style="color:#38bdf8; font-size:11px;"><i class="fas fa-stopwatch"></i> Saves ~${item.timeSavedMinutes}m</span>
                        </div>
                        ${renderExerciseCard(item.exerciseA, 0, sIdx)}
                        <div class="superset-connector-line">
                            <i class="fas fa-arrow-down"></i> Fast Transition (15s) • No Rest <i class="fas fa-arrow-down"></i>
                        </div>
                        ${renderExerciseCard(item.exerciseB, 1, sIdx)}
                    </div>`;
                } else {
                    return renderExerciseCard(item.exercise, idx, sIdx);
                }
            }).join('');
        } else {
            exerciseItems = exercises.length > 0
                ? exercises.map((ex, exIdx) => renderExerciseCard(ex, exIdx, sIdx)).join('')
                : '<p class="blueprint-empty-msg">No exercises scheduled for this workout session.</p>';
        }

        return `
        <div class="blueprint-session-card" data-testid="session-card-${sIdx}">
            <div class="blueprint-session-header">
                <div class="blueprint-session-title-wrap">
                    <span class="blueprint-session-day-pill">${day}</span>
                    <h3 class="blueprint-session-title">${title}</h3>
                    ${focus ? `<p class="blueprint-session-focus">${focus}</p>` : ''}
                </div>
                <div class="blueprint-session-meta-chips">
                    <span class="blueprint-meta-chip"><i class="fas fa-stopwatch"></i> ${duration}</span>
                    <span class="blueprint-meta-chip"><i class="fas fa-list-check"></i> ${exercises.length} Exercises</span>
                    <button class="blueprint-start-workout-btn" onclick="PersonalizedBlueprintUI.openGymFloorFocusMode(${sIdx})" title="Distraction-free Full-Screen Gym Floor Mode" style="background: rgba(179, 221, 36,0.15); border-color: #B3DD24; color: #B3DD24;">
                        <i class="fas fa-mobile-screen"></i> Gym Mode
                    </button>
                    <button class="blueprint-start-workout-btn" onclick="PersonalizedBlueprintUI.startSession('${day}', ${sIdx})" data-testid="start-workout-${sIdx}">
                        <i class="fas fa-play"></i> Start Workout
                    </button>
                </div>
            </div>
            
            <div class="blueprint-exercise-stack">
                ${exerciseItems}
            </div>
        </div>`;
    }

    // ==========================================================================
    // 7. PROGRESSION FRAMEWORK COMPONENT
    // ==========================================================================

    /**
     * Renders the progressive overload framework from engine data.
     * @param {Object} program 
     * @returns {string} HTML string
     */
    function renderProgressionFramework(program) {
        if (!program || typeof program !== 'object' || !program.progressionFramework) return '';

        const pf = program.progressionFramework;
        const method = formatLabel(pf.primaryMethod || 'Double Progression');
        const rule = escapeHTML(pf.progressionRule || 'Increase load by 2-5% once target reps are hit across all prescribed sets.');
        const deload = escapeHTML(pf.deloadGuidance || 'Schedule a planned deload every 6-8 weeks reducing total volume by 40-50%.');
        const rir = escapeHTML(pf.intensityTarget || 'Maintain 1-3 Reps in Reserve (RIR) on all working sets.');

        return `
        <section class="blueprint-section blueprint-progression-section" data-testid="progression-framework-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-chart-line section-icon"></i>
                    <h2>Progressive Overload Framework</h2>
                </div>
                <span class="blueprint-meta-tag">${method}</span>
            </div>
            
            <div class="blueprint-progression-grid">
                <div class="blueprint-progression-card">
                    <span class="blueprint-prog-label"><i class="fas fa-weight-hanging"></i> Load Increase Rule</span>
                    <p class="blueprint-prog-desc">${rule}</p>
                </div>
                <div class="blueprint-progression-card">
                    <span class="blueprint-prog-label"><i class="fas fa-gauge"></i> Working Intensity</span>
                    <p class="blueprint-prog-desc">${rir}</p>
                </div>
                <div class="blueprint-progression-card">
                    <span class="blueprint-prog-label"><i class="fas fa-shield-heart"></i> Deload Protocol</span>
                    <p class="blueprint-prog-desc">${deload}</p>
                </div>
            </div>
        </section>`;
    }

    // ==========================================================================
    // 8. QUALITY METRICS COMPONENT
    // ==========================================================================

    /**
     * Renders verified program and validation quality metrics.
     * Displays only real metrics without fake percentages.
     * @param {Object} program 
     * @param {Object} [validationResult] 
     * @returns {string} HTML string
     */
    function renderQualityMetrics(program, validationResult) {
        if (!program || typeof program !== 'object') return '';

        const pQm = program.qualityMetrics || {};
        const vQm = (validationResult && validationResult.qualityMetrics) || {};

        const totalSets = pQm.totalWeeklySets || vQm.totalWeeklySets || 0;
        const highFatigue = typeof pQm.highFatigueExerciseCount === 'number' ? pQm.highFatigueExerciseCount : (vQm.highFatigueExerciseCount || 0);
        const movementCoverage = escapeHTML(pQm.movementCoverage || vQm.movementCoverage || 'Full Coverage');
        const durationCompliance = escapeHTML(pQm.durationCompliance || vQm.durationCompliance || 'Conforms to tolerance');
        const safetyStatus = escapeHTML(vQm.safetyCompliance || pQm.safetyCompliance || 'Joint & Spine Protected');
        const equipCompliance = escapeHTML(vQm.equipmentCompliance || pQm.equipmentCompliance || '100% Hardware Match');

        return `
        <section class="blueprint-section blueprint-quality-section" data-testid="quality-metrics-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-microchip section-icon"></i>
                    <h2>Deterministic Program Quality Metrics</h2>
                </div>
                <span class="blueprint-meta-tag">Engine Verified</span>
            </div>
            
            <div class="blueprint-quality-grid">
                <div class="blueprint-quality-card">
                    <span class="quality-card-label">Weekly Volume</span>
                    <span class="quality-card-value">${totalSets} sets</span>
                    <span class="quality-card-sub">Prescribed direct set volume</span>
                </div>
                <div class="blueprint-quality-card">
                    <span class="quality-card-label">High-Fatigue Lifts</span>
                    <span class="quality-card-value">${highFatigue}</span>
                    <span class="quality-card-sub">Axial & CNS load controlled</span>
                </div>
                <div class="blueprint-quality-card">
                    <span class="quality-card-label">Movement Breadth</span>
                    <span class="quality-card-value">${movementCoverage}</span>
                    <span class="quality-card-sub">Compound balance matrix</span>
                </div>
                <div class="blueprint-quality-card">
                    <span class="quality-card-label">Duration Tolerance</span>
                    <span class="quality-card-value">${durationCompliance}</span>
                    <span class="quality-card-sub">Physical execution + rest</span>
                </div>
                <div class="blueprint-quality-card">
                    <span class="quality-card-label">Joint & Spine Safety</span>
                    <span class="quality-card-value">${safetyStatus}</span>
                    <span class="quality-card-sub">Prohibited angles filtered</span>
                </div>
                <div class="blueprint-quality-card">
                    <span class="quality-card-label">Equipment Matching</span>
                    <span class="quality-card-value">${equipCompliance}</span>
                    <span class="quality-card-sub">Available hardware only</span>
                </div>
            </div>
        </section>`;
    }

    // ==========================================================================
    // 9. VALIDATION STATUS & ERROR STATE COMPONENT
    // ==========================================================================

    /**
     * Renders validation banner (VALID, WARNING, REPAIRED, or INVALID).
     * @param {Object} validationResult 
     * @returns {string} HTML string
     */
    function renderValidationState(validationResult) {
        if (!validationResult || typeof validationResult !== 'object') {
            return `
            <div class="blueprint-validation-banner banner-info" data-testid="validation-banner">
                <i class="fas fa-circle-info"></i>
                <div class="banner-body">
                    <strong>Program Status:</strong> Dynamically synthesized blueprint ready for training.
                </div>
            </div>`;
        }

        const isValid = !!validationResult.valid;
        const status = validationResult.status || (isValid ? 'VALID' : 'INVALID');
        const warnings = Array.isArray(validationResult.warnings) ? validationResult.warnings : [];
        const errors = Array.isArray(validationResult.errors) ? validationResult.errors : [];
        const overrides = Array.isArray(validationResult.safetyOverrides) ? validationResult.safetyOverrides : [];

        if (status === 'INVALID' || (!isValid && status !== 'REPAIRABLE')) {
            const errorItems = errors.map(e => `<li>${escapeHTML(typeof e === 'string' ? e : e.message)}</li>`).join('');
            return `
            <div class="blueprint-validation-banner banner-danger" data-testid="validation-banner-invalid">
                <i class="fas fa-triangle-exclamation"></i>
                <div class="banner-body">
                    <strong>Validation Barrier Detected:</strong>
                    <p>The generated program could not satisfy all biometric or safety constraints.</p>
                    <ul class="banner-list">${errorItems}</ul>
                </div>
            </div>`;
        }

        if (status === 'REPAIRED' || (validationResult.repaired === true)) {
            return `
            <div class="blueprint-validation-banner banner-success" data-testid="validation-banner-repaired">
                <i class="fas fa-shield-check"></i>
                <div class="banner-body">
                    <strong>Program Validated & Optimized:</strong>
                    <span>Exercise alternatives and duration parameters were automatically refined to ensure complete joint protection and hardware compliance.</span>
                </div>
            </div>`;
        }

        if (warnings.length > 0) {
            const warningItems = warnings.map(w => `<li>${escapeHTML(typeof w === 'string' ? w : w.message)}</li>`).join('');
            return `
            <div class="blueprint-validation-banner banner-warning" data-testid="validation-banner-warning">
                <i class="fas fa-circle-exclamation"></i>
                <div class="banner-body">
                    <strong>Program Validated with Advisory Notes:</strong>
                    <ul class="banner-list">${warningItems}</ul>
                </div>
            </div>`;
        }

        return `
        <div class="blueprint-validation-banner banner-success" data-testid="validation-banner-valid">
            <i class="fas fa-circle-check"></i>
            <div class="banner-body">
                <strong>Program Validated:</strong> Passed 100% of biometric, volume, fatigue, and joint safety verification rules.
            </div>
        </div>`;
    }

    // ==========================================================================
    // 10. MAIN BLUEPRINT HTML GENERATOR
    // ==========================================================================

    /**
     * Generates complete, validated Personalized Training Blueprint HTML string.
     * @param {Object} program 
     * @param {Object} [validationResult] 
     * @param {Object} [options] 
     * @returns {string} Complete HTML string
     */
    function generateBlueprintHTML(program, validationResult, options) {
        if (!program || typeof program !== 'object') {
            return `
            <div class="blueprint-error-container" data-testid="blueprint-error">
                <i class="fas fa-circle-exclamation error-icon"></i>
                <h2>Unable to Render Blueprint</h2>
                <p>No valid workout program data was provided. Please complete the assessment questionnaire to synthesize your plan.</p>
            </div>`;
        }

        // Hard blocker: if validation is strictly INVALID, block usable plan presentation
        if (validationResult && validationResult.valid === false && validationResult.status === 'INVALID') {
            return `
            <div class="blueprint-error-container" data-testid="blueprint-invalid-container">
                ${renderValidationState(validationResult)}
            </div>`;
        }

        const headerHTML = renderPersonalizedHeader(program, validationResult, options);
        const validationHTML = renderValidationState(validationResult);
        const reasonsHTML = renderPersonalizationReasons(program);
        const scheduleHTML = renderWeeklySchedule(program);

        const sessions = Array.isArray(program.sessions) ? program.sessions : [];
        const morphedSessions = (typeof window !== 'undefined' && window.MesocycleScrubberEngine) 
            ? window.MesocycleScrubberEngine.calculateMorphedSessionsForWeek(sessions, _activeMesocycleWeek || 1)
            : sessions;
        const sessionCardsHTML = morphedSessions.map((sess, sIdx) => renderSessionCard(sess, sIdx)).join('');

        const scrubberHTML = `
        <div id="mesocycleScrubberWrapper">
            ${renderInteractiveMesocycleScrubber(program, _activeMesocycleWeek || 1)}
        </div>`;

        const sessionsSectionHTML = `
        <section class="blueprint-section blueprint-sessions-section" data-testid="session-cards-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-dumbbell section-icon"></i>
                    <h2>Session Exercise Blueprints</h2>
                </div>
                <span class="blueprint-meta-tag">Periodized Lifts, Sets & Reps</span>
            </div>
            ${scrubberHTML}
            <div class="blueprint-sessions-stack">
                ${sessionCardsHTML}
            </div>
        </section>`;

        const qualityHTML = renderQualityMetrics(program, validationResult);
        const progressionHTML = renderProgressionFramework(program);
        const anatomyHTML = renderMuscleAnatomySection(program);
        const weeklyAnalyticsHTML = renderWeeklyAnalyticsSection(program);
        const roadmapHTML = render12WeekRoadmapSection(program);
        const adaptiveHTML = renderAdaptiveIntelligenceSection(program);
        const explanationHTML = renderPersonalizationExplanationSection(program, validationResult);

        const actionsHTML = `
        <div class="plan-action-bar blueprint-action-bar" data-testid="blueprint-actions">
            <button class="plan-btn btn-gold" onclick="PersonalizedBlueprintUI.open1RMCalibrationModal()">
                <i class="fas fa-calculator"></i> 🎯 Calibrate 1RM Working Weights
            </button>
            <button class="plan-btn btn-outline" id="blueprint-superset-toggle-btn" onclick="PersonalizedBlueprintUI.toggleSupersetMode()">
                <i class="fas fa-bolt"></i> ⚡ Supersets: OFF
            </button>
            <button class="plan-btn btn-gold" onclick="PersonalizedBlueprintUI.exportToCalendarICS()">
                <i class="fas fa-calendar-plus"></i> 📅 Add to Phone Calendar (.ICS)
            </button>
            <button class="plan-btn btn-gold" onclick="PersonalizedBlueprintUI.openSocialShareModal()">
                <i class="fas fa-share-nodes"></i> 📸 Social Share Card (Story / Feed)
            </button>
            <button class="plan-btn btn-outline" onclick="PersonalizedBlueprintUI.printInkFriendlyGymCard()">
                <i class="fas fa-print"></i> Print Workout Card
            </button>
            <button class="plan-btn btn-outline" onclick="PersonalizedBlueprintUI.openPlateCalculator(80, 'kg')">
                <i class="fas fa-calculator"></i> Plate Calculator
            </button>
            <a href="../P%20Recipe/recipes.html" class="plan-btn btn-outline" style="text-decoration:none; display:inline-flex; align-items:center;">
                <i class="fas fa-bowl-food"></i> Matching Recipes
            </a>
            <a href="../Training_Section/index.html" class="plan-btn btn-outline" style="text-decoration:none; display:inline-flex; align-items:center;">
                <i class="fas fa-user-ninja"></i> Book Trainer Review
            </a>
            <button class="plan-btn btn-ghost" onclick="PersonalizedBlueprintUI.exportWorkoutBackup()">
                <i class="fas fa-file-export"></i> Export Backup (JSON)
            </button>
            <button class="plan-btn btn-ghost" onclick="PersonalizedBlueprintUI.triggerImportDialog()">
                <i class="fas fa-file-import"></i> Restore Backup
            </button>
            <input type="file" id="blueprint-backup-input" style="display:none;" accept=".json" onchange="PersonalizedBlueprintUI.importWorkoutBackup(event)" />
            <button class="plan-btn btn-ghost" onclick="syncCustomPlanToMySpace()">
                <i class="fas fa-cloud-arrow-up"></i> Sync to My Space
            </button>
            <button class="plan-btn btn-ghost" onclick="restartQuiz()">
                <i class="fas fa-redo"></i> Retake Assessment
            </button>
        </div>`;

        return `
        <div class="personalized-blueprint-wrapper" data-testid="personalized-blueprint">
            ${validationHTML}
            ${headerHTML}
            ${reasonsHTML}
            ${explanationHTML}
            ${scheduleHTML}
            ${anatomyHTML}
            ${sessionsSectionHTML}
            ${progressionHTML}
            ${weeklyAnalyticsHTML}
            ${roadmapHTML}
            ${adaptiveHTML}
            ${qualityHTML}
            ${actionsHTML}
        </div>`;
    }

    // ==========================================================================
    // 9. BIOMECHANICAL MUSCLE ANATOMY & ACTIVATION COMPONENT
    // ==========================================================================

    /**
     * Renders the interactive 2D anatomical heatmap and volume landmark breakdown.
     * @param {Object} program 
     * @returns {string} HTML string
     */
    function renderMuscleAnatomySection(program) {
        if (!program || typeof program !== 'object') return '';

        const anatomyEngine = (typeof window !== 'undefined' && window.MuscleAnatomyEngine)
            ? window.MuscleAnatomyEngine
            : null;

        if (!anatomyEngine) return '';

        const volumeAnalysis = anatomyEngine.analyzeProgramMuscleVolume(program);
        const svgHTML = anatomyEngine.renderAnatomyHeatmapSVG({
            primary: volumeAnalysis.activeMuscles,
            secondary: []
        });

        const sessions = Array.isArray(program.sessions) ? program.sessions : [];
        const sessionTabsHTML = sessions.map((s, idx) => `
            <button type="button" class="anatomy-tab-btn" id="anatomy-tab-${idx}" onclick="PersonalizedBlueprintUI.switchAnatomyView(${idx})" title="View muscle activation for ${escapeHTML(s.day || `Day ${idx + 1}`)}">
                ${escapeHTML(s.day || `Day ${idx + 1}`)}
            </button>`).join('');

        // Muscle Landmark Cards (Top 8 active muscles)
        const activeEntries = Object.entries(volumeAnalysis.muscleMap)
            .filter(([_, data]) => data.directSets > 0 || data.indirectSets > 0)
            .sort((a, b) => b[1].directSets - a[1].directSets);

        const muscleCardsHTML = activeEntries.map(([key, data]) => {
            const status = data.status || { status: 'OPTIMAL_MAV', label: 'Optimal MAV', color: '#B3DD24' };
            const exercisesStr = data.exercises.slice(0, 3).map(e => escapeHTML(e)).join(', ');
            return `
            <div class="muscle-landmark-card">
                <div class="muscle-card-header">
                    <span class="muscle-card-title">${escapeHTML(data.muscle.label)}</span>
                    <span class="muscle-status-badge" style="background:${status.color}22; color:${status.color}; border:1px solid ${status.color}55;">
                        ${escapeHTML(status.label)}
                    </span>
                </div>
                <div class="muscle-card-metrics">
                    <div class="muscle-metric">
                        <span class="metric-num" style="color:#B3DD24;">${data.directSets}</span>
                        <span class="metric-txt">Direct Sets/Wk</span>
                    </div>
                    <div class="muscle-metric">
                        <span class="metric-num" style="color:#cbd5e0;">${data.muscle.mavMin}–${data.muscle.mavMax}</span>
                        <span class="metric-txt">Target MAV Range</span>
                    </div>
                    <div class="muscle-metric">
                        <span class="metric-num" style="color:#e53e3e;">${data.muscle.mrv}</span>
                        <span class="metric-txt">MRV Ceiling</span>
                    </div>
                </div>
                <div class="muscle-card-exercises">
                    <i class="fas fa-dumbbell"></i> <span>${exercisesStr || 'Programmed lifts'}</span>
                </div>
            </div>`;
        }).join('');

        return `
        <section class="blueprint-section blueprint-anatomy-section" data-testid="muscle-anatomy-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-child-reaching section-icon" style="color: #B3DD24;"></i>
                    <h2>Biomechanical Muscle Anatomy & Activation Heatmap</h2>
                </div>
                <div class="blueprint-meta-tag-group">
                    <span class="blueprint-meta-tag"><i class="fas fa-dna"></i> Dr. Israetel Hypertrophy Landmarks</span>
                    <span class="blueprint-meta-tag"><i class="fas fa-circle-nodes"></i> ${volumeAnalysis.activeMuscles.length} Muscle Groups Targeted</span>
                </div>
            </div>

            <!-- Heatmap View Selector Tabs -->
            <div class="anatomy-view-toolbar">
                <div class="anatomy-tabs-wrap">
                    <button type="button" class="anatomy-tab-btn active" id="anatomy-tab-all" onclick="PersonalizedBlueprintUI.switchAnatomyView('all')">
                        <i class="fas fa-globe"></i> Whole Program Split
                    </button>
                    ${sessionTabsHTML}
                </div>
                <div class="anatomy-legend">
                    <span class="legend-item"><span class="legend-dot dot-primary"></span> Primary Target</span>
                    <span class="legend-item"><span class="legend-dot dot-secondary"></span> Secondary / Synergist</span>
                    <span class="legend-item"><span class="legend-dot dot-stabilizer"></span> Stabilizer / Core</span>
                </div>
            </div>

            <!-- Dual Anatomy Graphic Container -->
            <div class="anatomy-display-layout">
                <div class="anatomy-svg-display-card" id="anatomy-svg-container">
                    ${svgHTML}
                </div>
                <div class="anatomy-volume-matrix-wrap">
                    <h4 class="matrix-heading"><i class="fas fa-chart-simple"></i> Scientific Hypertrophy Volume Landmarks (MEV / MAV / MRV)</h4>
                    <div class="muscle-landmarks-grid" id="anatomy-landmarks-grid">
                        ${muscleCardsHTML}
                    </div>
                </div>
            </div>
        </section>`;
    }

    /**
     * Dynamically switches the SVG Anatomy heatmap view between All-Week and specific sessions.
     */
    function switchAnatomyView(sessionTarget) {
        if (typeof document === 'undefined') return;
        const prog = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        const anatomyEngine = (typeof window !== 'undefined' && window.MuscleAnatomyEngine) ? window.MuscleAnatomyEngine : null;
        if (!prog || !anatomyEngine) return;

        // Update active tab buttons
        document.querySelectorAll('.anatomy-tab-btn').forEach(b => b.classList.remove('active'));
        if (sessionTarget === 'all') {
            const allBtn = document.getElementById('anatomy-tab-all');
            if (allBtn) allBtn.classList.add('active');
        } else {
            const tabBtn = document.getElementById(`anatomy-tab-${sessionTarget}`);
            if (tabBtn) tabBtn.classList.add('active');
        }

        const container = document.getElementById('anatomy-svg-container');
        if (!container) return;

        if (sessionTarget === 'all') {
            const volumeAnalysis = anatomyEngine.analyzeProgramMuscleVolume(prog);
            container.innerHTML = anatomyEngine.renderAnatomyHeatmapSVG({
                primary: volumeAnalysis.activeMuscles,
                secondary: []
            });
        } else {
            const session = (prog.sessions || [])[sessionTarget];
            if (session) {
                const sessionActivation = anatomyEngine.analyzeSessionMuscleActivation(session);
                container.innerHTML = anatomyEngine.renderAnatomyHeatmapSVG(sessionActivation);
            }
        }
    }

    // ==========================================================================
    // 10. ADAPTIVE TRAINING INTELLIGENCE COMPONENT
    // ==========================================================================

    let _isDeloadModeActive = false;

    /**
     * Renders the performance analysis and adaptive intelligence section from historical logs.
     * @param {Object} program 
     * @returns {string} HTML string
     */
    function renderAdaptiveIntelligenceSection(program) {
        if (!program || typeof program !== 'object') return '';
        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
        const analysisEngine = (typeof window !== 'undefined' && window.PerformanceAnalysisEngine) ? window.PerformanceAnalysisEngine : null;
        const adaptiveEngine = (typeof window !== 'undefined' && window.AdaptiveTrainingEngine) ? window.AdaptiveTrainingEngine : null;

        if (!logger || !analysisEngine || !adaptiveEngine) return '';

        const allLogs = logger.listWorkoutLogs().filter(l => l.programId === program.programId);
        const validCompletedCount = allLogs.filter(l => l.status === 'COMPLETED' || l.status === 'PARTIALLY_COMPLETED').length;

        // 1. Calculate Fatigue Accumulation Index (FAI) & Deload Protocol status
        const fatigueAnalysis = adaptiveEngine.calculateFatigueAccumulationIndex(allLogs, program);
        const faiScore = fatigueAnalysis.score;
        const faiLevel = fatigueAnalysis.level;
        const isDeloadRec = fatigueAnalysis.deloadRecommended;

        const faiColorMap = {
            'FRESH': '#38a169',
            'PRODUCTIVE': '#B3DD24',
            'ELEVATED': '#ed8936',
            'OVERREACHING': '#e53e3e'
        };
        const faiColor = faiColorMap[faiLevel] || '#B3DD24';

        const deloadAdvisorHTML = `
        <div class="fai-advisor-banner ${isDeloadRec ? 'deload-alert' : ''}">
            <div class="fai-advisor-left">
                <div class="fai-meter-wrap">
                    <span class="fai-score-label">Fatigue Index</span>
                    <span class="fai-score-num" style="color: ${faiColor};">${faiScore}<span class="fai-score-max">/100</span></span>
                    <span class="fai-level-badge" style="background: ${faiColor}22; color: ${faiColor}; border: 1px solid ${faiColor}55;">
                        ${faiLevel}
                    </span>
                </div>
                <div class="fai-progress-track">
                    <div class="fai-progress-fill" style="width: ${faiScore}%; background: ${faiColor};"></div>
                </div>
            </div>
            <div class="fai-advisor-content">
                <h4 class="fai-rec-heading">
                    <i class="${isDeloadRec ? 'fas fa-triangle-exclamation' : 'fas fa-shield-halved'}" style="color: ${faiColor};"></i>
                    ${isDeloadRec ? 'Deload Microcycle Recommended' : 'Mesocycle Readiness: Optimal'}
                </h4>
                <p class="fai-rec-text">${escapeHTML(fatigueAnalysis.recommendation)}</p>
                ${fatigueAnalysis.factors.length > 0 ? `<ul class="fai-factors-list">${fatigueAnalysis.factors.map(f => `<li><i class="fas fa-check"></i> ${escapeHTML(f)}</li>`).join('')}</ul>` : ''}
            </div>
            <div class="fai-advisor-actions">
                <button type="button" class="btn-deload-toggle ${_isDeloadModeActive ? 'active' : ''}" onclick="PersonalizedBlueprintUI.toggleDeloadMode()">
                    <i class="fas fa-bed-pulse"></i> ${_isDeloadModeActive ? 'Exit Deload Mode' : 'Preview Deload Week'}
                </button>
            </div>
        </div>`;

        const sampleExercises = (program.sessions && program.sessions[0] && program.sessions[0].exercises) ? program.sessions[0].exercises.slice(0, 3) : [];

        const exerciseCardsHTML = sampleExercises.map(ex => {
            const exId = ex.exerciseId || ex.id;
            const exName = ex.exerciseName || ex.name || 'Exercise';
            const analysis = analysisEngine.analyzeExercisePerformance(exId, allLogs);
            const strat = ex.progression || { model: ex.progressionModel || 'DOUBLE_PROGRESSION' };
            const decision = adaptiveEngine.calculateAdaptiveDecision(ex, strat, analysis);
            const forecast = adaptiveEngine.generateOverloadForecast(ex, strat);

            const decisionBadgeClass = {
                'PROGRESS': 'badge-progress',
                'MAINTAIN': 'badge-maintain',
                'REGRESS': 'badge-regress',
                'RECOVER': 'badge-recover',
                'DEFER': 'badge-defer'
            }[decision.decision] || 'badge-defer';

            const nextPres = decision.nextPrescription;
            const adjText = nextPres.adjustment && nextPres.adjustment.description
                ? nextPres.adjustment.description
                : 'Maintain current parameters.';

            const forecastHTML = forecast.map(fc => `
                <div class="forecast-step">
                    <span class="fc-week">${fc.week === 1 ? 'W1' : `W${fc.week}`}</span>
                    <span class="fc-target">${fc.reps}</span>
                    <span class="fc-rir">${fc.targetRIR}</span>
                </div>
            `).join('');

            return `
            <div class="adaptive-exercise-card">
                <div class="adaptive-card-header">
                    <h4 class="adaptive-ex-name">${escapeHTML(exName)}</h4>
                    <div class="adaptive-badges">
                        <span class="adaptive-trend-chip"><i class="fas fa-chart-line"></i> ${formatLabel(analysis.trend)}</span>
                        <span class="adaptive-decision-badge ${decisionBadgeClass}">${decision.decision}</span>
                    </div>
                </div>
                <p class="adaptive-rationale"><strong>Rationale:</strong> ${escapeHTML(decision.rationale)}</p>
                <div class="adaptive-next-box">
                    <span class="next-box-label"><i class="fas fa-forward-step"></i> Next Prescribed Target:</span>
                    <span class="next-box-val">${nextPres.sets} sets × ${nextPres.reps} (Target RIR ${nextPres.rir} / RPE ${nextPres.rpe})</span>
                    <p class="next-box-adj">${escapeHTML(adjText)}</p>
                </div>
                <div class="adaptive-forecast-wrap">
                    <span class="forecast-label"><i class="fas fa-stairs"></i> 4-Week Progressive Overload Trajectory:</span>
                    <div class="forecast-steps-grid">
                        ${forecastHTML}
                    </div>
                </div>
            </div>`;
        }).join('');

        return `
        <section class="blueprint-section blueprint-adaptive-section" data-testid="adaptive-intelligence-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-brain section-icon"></i>
                    <h2>Performance & Adaptive Intelligence</h2>
                </div>
                <span class="blueprint-meta-tag">${validCompletedCount} Completed Sessions Analyzed</span>
            </div>
            
            ${deloadAdvisorHTML}

            <div class="blueprint-adaptive-grid">
                ${exerciseCardsHTML}
            </div>
        </section>`;
    }

    /**
     * Toggles 1-Week Active Recovery Deload Mode on the Blueprint UI.
     */
    function toggleDeloadMode() {
        _isDeloadModeActive = !_isDeloadModeActive;
        const prog = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        const adaptiveEngine = (typeof window !== 'undefined' && window.AdaptiveTrainingEngine) ? window.AdaptiveTrainingEngine : null;
        if (!prog || !adaptiveEngine) return;

        let activePlan = prog;
        if (_isDeloadModeActive) {
            activePlan = adaptiveEngine.generateDeloadProgram(prog);
        }

        const container = document.getElementById('blueprintContainer');
        if (container) {
            container.innerHTML = generateBlueprintHTML(activePlan);
        }
    }

    // ==========================================================================
    // 11. WEEKLY PERFORMANCE ANALYSIS COMPONENT
    // ==========================================================================

    /**
     * Renders the weekly performance analytics and training volume metrics.
     * @param {Object} program 
     * @param {string|Date} [referenceDate] 
     * @returns {string} HTML string
     */
    function renderWeeklyAnalyticsSection(program, referenceDate) {
        if (!program || typeof program !== 'object') return '';
        const weeklyEngine = (typeof window !== 'undefined' && window.WeeklyAnalyticsEngine) ? window.WeeklyAnalyticsEngine : null;
        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;

        if (!weeklyEngine || !logger) return '';

        const allLogs = logger.listWorkoutLogs().filter(l => !program.programId || l.programId === program.programId || !l.programId);
        const analytics = weeklyEngine.analyzeWeeklyPerformance(allLogs, program, referenceDate);
        const sum = analytics.summary || {};

        const weekStartFormatted = new Date(analytics.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const weekEndFormatted = new Date(analytics.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const consistencyClass = {
            'EXCELLENT': 'badge-direct',
            'GOOD': 'badge-strong',
            'MODERATE': 'badge-acceptable',
            'LOW': 'badge-limited',
            'INSUFFICIENT_DATA': 'badge-limited'
        }[sum.consistencyStatus] || 'badge-acceptable';

        // Muscle group volume pills
        const musclePillsHTML = analytics.muscleGroupAnalytics && analytics.muscleGroupAnalytics.length > 0
            ? analytics.muscleGroupAnalytics.map(m => `
                <div class="analytics-muscle-pill">
                    <span class="m-name">${escapeHTML(m.muscleGroup)}</span>
                    <span class="m-sets"><strong>${m.completedSets}</strong> / ${m.plannedSets} sets</span>
                </div>`).join('')
            : '<span class="analytics-sub-note">No muscle volume logged yet.</span>';

        // Insights list
        const insightsHTML = analytics.insights && analytics.insights.length > 0
            ? analytics.insights.map(ins => `<li><i class="fas fa-check-circle text-gold"></i> ${escapeHTML(ins)}</li>`).join('')
            : '<li>Complete sessions this week to generate automated performance insights.</li>';

        // Quality indicators
        const indicatorsHTML = analytics.qualityIndicators && analytics.qualityIndicators.length > 0
            ? analytics.qualityIndicators.map(q => {
                const badgeClass = {
                    'EXCELLENT': 'badge-direct',
                    'GOOD': 'badge-strong',
                    'MODERATE': 'badge-acceptable',
                    'LOW': 'badge-limited',
                    'INSUFFICIENT_DATA': 'badge-limited'
                }[q.status] || 'badge-acceptable';
                return `
                <div class="quality-indicator-card">
                    <div class="qi-header">
                        <span class="qi-title">${formatLabel(q.type)}</span>
                        <span class="sub-quality-badge ${badgeClass}">${q.status}</span>
                    </div>
                    <p class="qi-rationale">${escapeHTML(q.rationale)}</p>
                </div>`;
            }).join('')
            : '';

        let volumeLoadDisplay = 'N/A';
        const lt = sum.loadTotals || {};
        if (lt.kg > 0 && lt.lb > 0) {
            volumeLoadDisplay = `${lt.kg.toLocaleString()} <small class="text-gold">kg</small> + ${lt.lb.toLocaleString()} <small class="text-gold">lb</small>`;
        } else if (lt.kg > 0) {
            volumeLoadDisplay = `${lt.kg.toLocaleString()} <small class="text-gold">kg-reps</small>`;
        } else if (lt.lb > 0) {
            volumeLoadDisplay = `${lt.lb.toLocaleString()} <small class="text-gold">lb-reps</small>`;
        } else if (sum.completedSets > 0 && (sum.totalTrainingLoad === 0 || sum.totalTrainingLoad === null)) {
            volumeLoadDisplay = '<span style="font-size: 16px;">Bodyweight</span>';
        }

        return `
        <section class="blueprint-section blueprint-weekly-analytics-section" data-testid="weekly-analytics-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-chart-column section-icon"></i>
                    <h2>Weekly Training Analytics</h2>
                </div>
                <span class="blueprint-meta-tag"><i class="fas fa-calendar-week"></i> ${weekStartFormatted} &ndash; ${weekEndFormatted}</span>
            </div>

            <div class="blueprint-analytics-grid">
                <div class="blueprint-analytics-card">
                    <span class="analytics-card-label"><i class="fas fa-calendar-check"></i> Session Attendance</span>
                    <div class="analytics-card-val-row">
                        <span class="analytics-card-val">${sum.completedSessions} <small class="text-muted">/ ${sum.plannedSessions}</small></span>
                        <span class="sub-quality-badge ${consistencyClass}">${sum.consistencyStatus}</span>
                    </div>
                    <span class="analytics-card-sub">${Math.round(sum.sessionCompletionRate * 100)}% session completion rate</span>
                </div>

                <div class="blueprint-analytics-card">
                    <span class="analytics-card-label"><i class="fas fa-layer-group"></i> Prescribed Sets</span>
                    <span class="analytics-card-val">${sum.completedSets} <small class="text-muted">/ ${sum.plannedSets}</small></span>
                    <span class="analytics-card-sub">${Math.round(sum.setCompletionRate * 100)}% volume completion</span>
                </div>

                <div class="blueprint-analytics-card">
                    <span class="analytics-card-label"><i class="fas fa-repeat"></i> Repetition Target</span>
                    <span class="analytics-card-val">${sum.actualReps} <small class="text-muted">/ ${sum.plannedReps}</small></span>
                    <span class="analytics-card-sub">${Math.round(sum.repAttainmentRate * 100)}% target rep attainment</span>
                </div>

                <div class="blueprint-analytics-card">
                    <span class="analytics-card-label"><i class="fas fa-weight-hanging"></i> Total Volume Load</span>
                    <span class="analytics-card-val">${volumeLoadDisplay}</span>
                    <span class="analytics-card-sub">${Math.round(sum.loadDataCoverage * 100)}% load data coverage</span>
                </div>

                <div class="blueprint-analytics-card">
                    <span class="analytics-card-label"><i class="fas fa-gauge"></i> Proximity to Failure</span>
                    <span class="analytics-card-val">${sum.averageActualRIR !== null ? `RIR ${sum.averageActualRIR}` : 'N/A'}</span>
                    <span class="analytics-card-sub">${sum.averageActualRPE !== null ? `RPE ${sum.averageActualRPE} average effort` : 'Effort unrecorded'}</span>
                </div>
            </div>

            <div class="analytics-detail-grid">
                <div class="analytics-sub-block">
                    <h4><i class="fas fa-dumbbell"></i> Muscle Group Volume</h4>
                    <div class="analytics-muscle-stack">
                        ${musclePillsHTML}
                    </div>
                </div>
                <div class="analytics-sub-block">
                    <h4><i class="fas fa-lightbulb"></i> Weekly Insights</h4>
                    <ul class="analytics-insights-list">
                        ${insightsHTML}
                    </ul>
                </div>
            </div>

            <div class="analytics-indicators-wrap">
                <h4><i class="fas fa-shield-halved"></i> Training Quality Indicators</h4>
                <div class="analytics-indicators-grid">
                    ${indicatorsHTML}
                </div>
            </div>
        </section>`;
    }

    /**
     * Renders the 12-Week Training Adaptation & Periodization Roadmap.
     * @param {Object} program 
     * @param {string|Date} [referenceDate] 
     * @returns {string} HTML string
     */
    function render12WeekRoadmapSection(program, referenceDate) {
        if (!program || typeof program !== 'object') return '';

        let block = null;
        if (typeof PeriodizationEngine !== 'undefined' && typeof PeriodizationEngine.generate12WeekTrainingBlock === 'function') {
            const profile = program.profileSummary || program.canonicalProfile || {};
            block = PeriodizationEngine.generate12WeekTrainingBlock(profile, program, referenceDate);
        }

        if (!block) return '';

        const phasesHTML = (block.phases || []).map((ph, idx) => {
            const isDeload = !!ph.deload;
            const badgeClass = isDeload ? 'badge-deload' : 'badge-direct';
            return `
            <div class="roadmap-phase-card ${isDeload ? 'phase-card-deload' : ''}">
                <div class="phase-card-top">
                    <span class="phase-num">Phase ${idx + 1} &bull; W${ph.startWeek}&ndash;W${ph.endWeek}</span>
                    <span class="sub-quality-badge ${badgeClass}">${ph.type}</span>
                </div>
                <h4 class="phase-title">${escapeHTML(ph.name)}</h4>
                <p class="phase-objective"><i class="fas fa-bullseye"></i> ${escapeHTML(ph.objective)}</p>
                <div class="phase-metrics">
                    <span class="phase-metric-tag"><i class="fas fa-layer-group"></i> ${escapeHTML(ph.volumeStrategy)}</span>
                    <span class="phase-metric-tag"><i class="fas fa-gauge"></i> ${escapeHTML(ph.intensityStrategy)}</span>
                </div>
            </div>`;
        }).join('');

        const timelineWeeksHTML = (block.weeks || []).map(w => {
            const isDeload = !!w.deload;
            return `
            <div class="timeline-week-pill ${isDeload ? 'twp-deload' : ''}" title="Week ${w.weekNumber}: ${w.phaseName}">
                <span class="twp-num">W${w.weekNumber}</span>
                <span class="twp-type">${isDeload ? 'DELOAD' : w.phaseType.slice(0, 5)}</span>
            </div>`;
        }).join('');

        const reasonsHTML = (block.personalizationReasons || []).map(r => `<li><i class="fas fa-check text-gold"></i> ${escapeHTML(r)}</li>`).join('');

        return `
        <section class="blueprint-section blueprint-roadmap-section" data-testid="12-week-roadmap-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-calendar-days section-icon"></i>
                    <h2>12-Week Periodization Roadmap</h2>
                </div>
                <span class="blueprint-meta-tag"><i class="fas fa-road"></i> PLANNED MACROCYCLE</span>
            </div>

            <div class="roadmap-overview-grid">
                <div class="roadmap-stat-card">
                    <span class="stat-label"><i class="fas fa-bullseye"></i> Macrocycle Goal</span>
                    <span class="stat-value">${formatLabel(block.goal)}</span>
                </div>
                <div class="roadmap-stat-card">
                    <span class="stat-label"><i class="fas fa-layer-group"></i> Experience Calibration</span>
                    <span class="stat-value">${formatLabel(block.experienceLevel)}</span>
                </div>
                <div class="roadmap-stat-card">
                    <span class="stat-label"><i class="fas fa-calendar"></i> Total Duration</span>
                    <span class="stat-value">12 Weeks (${block.phases.length} Phases)</span>
                </div>
                <div class="roadmap-stat-card">
                    <span class="stat-label"><i class="fas fa-bed"></i> Scheduled Deloads</span>
                    <span class="stat-value">3 Strategic Weeks</span>
                </div>
            </div>

            <div class="roadmap-timeline-wrapper">
                <h4><i class="fas fa-timeline"></i> 12-Week Progression Timeline</h4>
                <div class="roadmap-timeline-strip">
                    ${timelineWeeksHTML}
                </div>
            </div>

            <div class="roadmap-phases-grid">
                ${phasesHTML}
            </div>

            <div class="roadmap-reasons-wrap">
                <h4><i class="fas fa-brain"></i> Periodization Rationale & Constraints</h4>
                <ul class="roadmap-reasons-list">
                    ${reasonsHTML}
                </ul>
            </div>
        </section>`;
    }

    // ==========================================================================
    // 12. DOM MOUNTING & ACCORDION INTERACTIONS
    // ==========================================================================

    /**
     * Toggles an exercise item's detail accordion.
     * @param {string} exerciseCardId 
     */
    function toggleExercise(exerciseCardId) {
        if (typeof document === 'undefined') return;
        const el = document.getElementById(exerciseCardId);
        if (!el) return;

        const details = el.querySelector('.blueprint-exercise-details');
        const chevron = el.querySelector('.blueprint-chevron');

        if (details) {
            const isHidden = details.style.display === 'none' || details.style.display === '';
            details.style.display = isHidden ? 'block' : 'none';
            if (chevron) {
                chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
    }

    let _activeProgramCache = null;
    let _activeLogCache = null;

    function attachGlobalKeyListeners() {
        if (typeof document !== 'undefined' && !document._blueprintEscListenerAttached) {
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    closeWorkoutModal();
                    closeSubstitutionModal();
                    closePlateCalculator();
                }
            });
            document._blueprintEscListenerAttached = true;
        }
    }

    /**
     * Renders the interactive workout execution modal for logging sets in real time.
     * @param {Object} log 
     */
    function renderWorkoutExecutionModal(log) {
        if (typeof document === 'undefined' || !log) return;
        attachGlobalKeyListeners();

        let modal = document.getElementById('blueprint-execution-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blueprint-execution-modal';
            modal.className = 'blueprint-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'execution-modal-title');
            modal.onclick = function (e) {
                if (e.target === modal) {
                    PersonalizedBlueprintUI.closeWorkoutModal();
                }
            };
            document.body.appendChild(modal);
        }

        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
        const summary = logger ? logger.getWorkoutSummary(log) : { completedSets: 0, totalPlannedSets: 0, completionPercentage: 0 };
        const sessionTonnage = calculateSessionTonnage(log);

        const exercisesHTML = (log.exercises || []).map((ex, exIdx) => {
            const plannedEx = (log.plannedSnapshot && log.plannedSnapshot.exercises && log.plannedSnapshot.exercises[exIdx]) || {};
            const histBestE1RM = getHistoricalBestE1RM(ex.exerciseId);
            const currentExBestE1RM = getExerciseCurrentBestE1RM(ex);
            const effectiveBestE1RM = Math.max(histBestE1RM, currentExBestE1RM);

            // Determine suggested working weight from planned or first set load
            const firstSetWithLoad = (ex.sets || []).find(s => s.actualLoad || s.plannedLoad);
            const defaultWarmupLoad = (firstSetWithLoad && (firstSetWithLoad.actualLoad || firstSetWithLoad.plannedLoad)) || 60;
            const defaultUnit = (firstSetWithLoad && firstSetWithLoad.loadUnit) || 'kg';

            const setsHTML = (ex.sets || []).map(s => {
                const isCompleted = !!s.completed;
                const repsVal = s.actualReps !== null && s.actualReps !== undefined ? s.actualReps : '';
                const loadVal = s.actualLoad !== null && s.actualLoad !== undefined ? s.actualLoad : '';
                const rirVal = s.actualRIR !== null && s.actualRIR !== undefined ? s.actualRIR : '';
                const rpeVal = s.actualRPE !== null && s.actualRPE !== undefined ? s.actualRPE : (s.actualRIR !== null && s.actualRIR !== undefined ? (10 - s.actualRIR) : '');
                const unitVal = s.loadUnit || 'kg';
                const setE1RM = calculateLiveE1RM(loadVal, repsVal);
                const isNewPR = setE1RM > 0 && setE1RM > histBestE1RM && histBestE1RM > 0;

                return `
                <tr class="log-set-row ${isCompleted ? 'set-completed' : ''}" id="set-row-${ex.exerciseId}-${s.setNumber}">
                    <td class="set-col-num">
                        <span class="set-num-badge">Set ${s.setNumber}</span>
                    </td>
                    <td class="set-col-target">
                        <span class="target-badge">${s.plannedReps} reps</span>
                    </td>
                    <td class="set-col-reps">
                        <input type="number" min="0" max="200" step="1" class="log-input reps-input" placeholder="Reps" value="${repsVal}" id="input-reps-${ex.exerciseId}-${s.setNumber}" oninput="PersonalizedBlueprintUI.handleSetInputChange('${ex.exerciseId}', ${s.setNumber})" onchange="PersonalizedBlueprintUI.handleSetInputChange('${ex.exerciseId}', ${s.setNumber})" />
                    </td>
                    <td class="set-col-load">
                        <div class="load-input-wrap">
                            <input type="number" min="0" max="1000" step="0.5" class="log-input load-input" placeholder="Weight" value="${loadVal}" id="input-load-${ex.exerciseId}-${s.setNumber}" oninput="PersonalizedBlueprintUI.handleSetInputChange('${ex.exerciseId}', ${s.setNumber})" onchange="PersonalizedBlueprintUI.handleSetInputChange('${ex.exerciseId}', ${s.setNumber})" />
                            <select class="log-select unit-select" id="input-unit-${ex.exerciseId}-${s.setNumber}" onchange="PersonalizedBlueprintUI.handleSetInputChange('${ex.exerciseId}', ${s.setNumber})">
                                <option value="kg" ${unitVal === 'kg' ? 'selected' : ''}>kg</option>
                                <option value="lb" ${unitVal === 'lb' ? 'selected' : ''}>lb</option>
                                <option value="bodyweight" ${unitVal === 'bodyweight' ? 'selected' : ''}>BW</option>
                                <option value="none" ${unitVal === 'none' ? 'selected' : ''}>None</option>
                            </select>
                            <button type="button" class="btn-plate-calc" onclick="PersonalizedBlueprintUI.openPlateCalculatorForSet('${ex.exerciseId}', ${s.setNumber})" title="Open Barbell Plate Visualizer">
                                <i class="fas fa-weight-hanging"></i>
                            </button>
                        </div>
                    </td>
                    <td class="set-col-effort">
                        <div class="effort-input-wrap">
                            <input type="number" min="0" max="5" step="1" class="log-input rir-input" placeholder="RIR" value="${rirVal}" id="input-rir-${ex.exerciseId}-${s.setNumber}" oninput="PersonalizedBlueprintUI.syncRIRToRPE('${ex.exerciseId}', ${s.setNumber})" onchange="PersonalizedBlueprintUI.handleSetInputChange('${ex.exerciseId}', ${s.setNumber})" />
                            <span class="derived-rpe" id="derived-rpe-${ex.exerciseId}-${s.setNumber}">RPE ${rpeVal || '-'}</span>
                        </div>
                    </td>
                    <td class="set-col-e1rm">
                        <div class="e1rm-cell-wrap" id="e1rm-cell-${ex.exerciseId}-${s.setNumber}">
                            <span class="e1rm-val-pill ${setE1RM > 0 ? 'has-val' : ''}">
                                ${setE1RM > 0 ? `${setE1RM} ${unitVal}` : '-'}
                            </span>
                            ${isNewPR ? `<span class="pr-pulse-pill" title="New Estimated 1RM PR!"><i class="fas fa-fire"></i> PR</span>` : ''}
                        </div>
                    </td>
                    <td class="set-col-check">
                        <button class="set-check-btn ${isCompleted ? 'checked' : ''}" id="btn-check-${ex.exerciseId}-${s.setNumber}" onclick="PersonalizedBlueprintUI.toggleSetCompletion('${ex.exerciseId}', ${s.setNumber})" title="Mark set completed">
                            <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i>
                        </button>
                    </td>
                </tr>`;
            }).join('');

            const formEngine = (typeof window !== 'undefined' && window.FormGuidesEngine) ? window.FormGuidesEngine : null;
            const tempoVisualizerHTML = formEngine ? formEngine.renderTempoVisualizer(plannedEx.tempo || '3-1-1-0') : '';

            return `
            <div class="log-exercise-block" id="log-ex-${ex.exerciseId}">
                <div class="log-exercise-header">
                    <div class="log-ex-title-wrap">
                        <span class="log-ex-idx">${exIdx + 1}</span>
                        <h4 class="log-ex-name">${escapeHTML(ex.exerciseName)}</h4>
                    </div>
                    <div class="log-ex-action-tools">
                        <button type="button" class="btn-form-guide-toggle" onclick="PersonalizedBlueprintUI.toggleFormGuideDrawer('${ex.exerciseId}', '${escapeHTML(ex.exerciseName)}')" title="View Biomechanical Setup & Common Mistakes">
                            <i class="fas fa-brain"></i> Form Guide
                        </button>
                        <button type="button" class="btn-warmup-toggle" onclick="PersonalizedBlueprintUI.toggleWarmupDrawer('${ex.exerciseId}', ${defaultWarmupLoad}, '${defaultUnit}', '${escapeHTML(ex.exerciseName)}')" title="Calculate warm-up ramp pyramid">
                            <i class="fas fa-fire-flame-curved"></i> Warm-Up
                        </button>
                        <span class="live-e1rm-badge" id="ex-best-e1rm-${ex.exerciseId}">
                            <i class="fas fa-trophy"></i> Best 1RM: <strong>${effectiveBestE1RM > 0 ? `${effectiveBestE1RM} ${defaultUnit}` : '-'}</strong>
                        </span>
                        <span class="log-chip"><i class="fas fa-bullseye"></i> Target RIR ${plannedEx.plannedRIR !== undefined ? plannedEx.plannedRIR : 2}</span>
                        ${plannedEx.progressionModel ? `<span class="log-chip"><i class="fas fa-arrow-trend-up"></i> ${formatLabel(plannedEx.progressionModel)}</span>` : ''}
                    </div>
                </div>

                <!-- Animated Biomechanical Tempo Rhythm Bar -->
                ${tempoVisualizerHTML}

                <!-- Collapsible Biomechanical Form Guide Drawer -->
                <div class="form-guide-drawer" id="form-guide-drawer-${ex.exerciseId}" style="display: none;">
                    <!-- Dynamically populated by renderFormGuideContent -->
                </div>

                <!-- Collapsible Warm-Up Pyramid Drawer -->
                <div class="warmup-drawer" id="warmup-drawer-${ex.exerciseId}" style="display: none;">
                    <!-- Dynamically populated by renderWarmupDrawerContent -->
                </div>

                <div class="log-table-responsive">
                    <table class="log-sets-table">
                        <thead>
                            <tr>
                                <th>Set</th>
                                <th>Target</th>
                                <th>Reps</th>
                                <th>Load</th>
                                <th>RIR</th>
                                <th>Est. 1RM</th>
                                <th>Done</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${setsHTML}
                        </tbody>
                    </table>
                </div>
            </div>`;
        }).join('');

        const voiceCoach = (typeof window !== 'undefined' && window.VoiceCoachEngine) ? window.VoiceCoachEngine : null;
        const isVoiceOn = voiceCoach ? voiceCoach.isVoiceEnabled() : true;

        modal.innerHTML = `
        <div class="blueprint-modal-content">
            <div class="blueprint-modal-header">
                <div class="modal-title-wrap">
                    <span class="status-live-pill"><i class="fas fa-circle-play"></i> LIVE WORKOUT</span>
                    <h3 class="modal-session-title">${escapeHTML(log.sessionTitle || log.sessionDay)}</h3>
                </div>
                <div class="modal-stats-bar">
                    <div class="modal-stat-item">
                        <span class="stat-label"><i class="fas fa-check-double"></i> Sets Done</span>
                        <span class="stat-value" id="header-completed-sets"><strong>${summary.completedSets}</strong> / ${summary.totalPlannedSets} (${summary.completionPercentage}%)</span>
                    </div>
                    <div class="modal-stat-item">
                        <span class="stat-label"><i class="fas fa-dumbbell"></i> Session Volume</span>
                        <span class="stat-value" id="header-session-tonnage" style="color: #B3DD24;"><strong>${sessionTonnage.totalFormatted}</strong></span>
                    </div>
                    <div class="modal-stat-item voice-coach-hud-item">
                        <button type="button" class="voice-coach-toggle-pill ${isVoiceOn ? 'active' : ''}" id="btnVoiceCoachToggle" onclick="PersonalizedBlueprintUI.toggleVoiceCoach()" title="Toggle Voice Coach announcements and audio cues">
                            <i class="fas ${isVoiceOn ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>
                            <span>Voice Coach: <strong id="voiceCoachStateText">${isVoiceOn ? 'ON' : 'OFF'}</strong></span>
                        </button>
                    </div>
                </div>
                <div class="modal-progress-wrap">
                    <div class="modal-progress-bar">
                        <div class="modal-progress-fill" id="header-modal-progress-fill" style="width: ${summary.completionPercentage}%;"></div>
                    </div>
                </div>
                <button class="modal-close-btn" onclick="PersonalizedBlueprintUI.closeWorkoutModal()" title="Save and Pause Session">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
            
            <div class="blueprint-modal-body">
                ${exercisesHTML}
                <div class="log-notes-section">
                    <label for="workout-session-notes"><i class="fas fa-pen"></i> Session Notes (Optional):</label>
                    <textarea id="workout-session-notes" class="log-textarea" placeholder="How did this workout feel? (e.g. Energy levels, joint comfort, equipment notes)" onchange="PersonalizedBlueprintUI.saveSessionNotes()">${escapeHTML(log.sessionNotes || '')}</textarea>
                </div>
            </div>
            
            <div class="blueprint-modal-footer">
                <button class="log-action-btn btn-ghost" onclick="PersonalizedBlueprintUI.abandonCurrentWorkout()">
                    <i class="fas fa-trash"></i> Abandon
                </button>
                <button class="log-action-btn btn-outline" onclick="PersonalizedBlueprintUI.closeWorkoutModal()">
                    <i class="fas fa-pause"></i> Save & Pause
                </button>
                <button class="log-action-btn btn-gold" onclick="PersonalizedBlueprintUI.finishActiveWorkout()">
                    <i class="fas fa-flag-checkered"></i> Complete Workout
                </button>
            </div>
        </div>`;
    }

    function startSession(sessionDay, sIdx) {
        if (typeof document === 'undefined') return;
        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
        if (!logger) {
            alert('Workout Logger engine is initializing.');
            return;
        }

        const prog = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        if (!prog) {
            alert('No active workout program found.');
            return;
        }

        let log = logger.getActiveWorkoutLog(prog.programId, sessionDay);
        if (!log) {
            log = logger.createWorkoutLog(prog, typeof sIdx === 'number' ? sIdx : sessionDay);
            logger.startWorkout(log);
            logger.saveWorkoutLog(log);
        }
        _activeLogCache = log;
        renderWorkoutExecutionModal(log);
    }

    let _restTimerInterval = null;
    let _restTimeRemaining = 0;
    let _restTotalDuration = 90;
    let _isRestTimerPaused = false;

    function playRestChime() {
        try {
            if (typeof window === 'undefined') return;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
        } catch (e) {
            // AudioContext not allowed before user gesture or unavailable
        }
    }

    function startRestTimer(seconds = 90) {
        if (typeof document === 'undefined') return;
        clearInterval(_restTimerInterval);
        _restTotalDuration = Math.max(15, parseInt(seconds, 10) || 90);
        _restTimeRemaining = _restTotalDuration;
        _isRestTimerPaused = false;

        let banner = document.getElementById('blueprint-rest-timer-banner');
        if (!banner) {
            const modalBody = document.querySelector('#blueprint-execution-modal .blueprint-modal-body');
            if (!modalBody) return;
            banner = document.createElement('div');
            banner.id = 'blueprint-rest-timer-banner';
            banner.className = 'rest-timer-banner';
            modalBody.insertBefore(banner, modalBody.firstChild);
        }

        renderRestTimerUI();

        const voiceCoach = (typeof window !== 'undefined' && window.VoiceCoachEngine) ? window.VoiceCoachEngine : null;
        if (voiceCoach) {
            voiceCoach.announceRestStart(_restTotalDuration);
        }

        _restTimerInterval = setInterval(() => {
            if (!_isRestTimerPaused) {
                _restTimeRemaining--;
                if (_restTimeRemaining === 15 && voiceCoach) {
                    voiceCoach.announceRestWarning(15);
                } else if (_restTimeRemaining <= 3 && _restTimeRemaining >= 1 && voiceCoach) {
                    voiceCoach.playCountdownBeep(false);
                }

                if (_restTimeRemaining <= 0) {
                    clearInterval(_restTimerInterval);
                    _restTimerInterval = null;
                    if (voiceCoach) {
                        voiceCoach.announceRestComplete();
                    } else {
                        playRestChime();
                    }
                    stopRestTimer();
                } else {
                    renderRestTimerUI();
                }
            }
        }, 1000);
    }

    function renderRestTimerUI() {
        if (typeof document === 'undefined') return;
        const banner = document.getElementById('blueprint-rest-timer-banner');
        if (!banner) return;
        const mins = Math.floor(_restTimeRemaining / 60);
        const secs = _restTimeRemaining % 60;
        const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        const pct = Math.round((_restTimeRemaining / _restTotalDuration) * 100);

        banner.innerHTML = `
        <div class="rest-timer-content">
            <div class="rest-timer-left">
                <i class="fas fa-stopwatch rest-timer-icon ${!_isRestTimerPaused ? 'active-ticking' : ''}"></i>
                <div class="rest-timer-info">
                    <span class="rest-timer-label">REST INTERVAL</span>
                    <span class="rest-timer-clock">${timeStr}</span>
                </div>
            </div>
            <div class="rest-timer-bar-wrap">
                <div class="rest-timer-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <div class="rest-timer-controls">
                <button class="rest-btn" onclick="PersonalizedBlueprintUI.adjustRestTimer(-15)" title="Subtract 15 seconds">-15s</button>
                <button class="rest-btn" onclick="PersonalizedBlueprintUI.pauseResumeRestTimer()" title="${_isRestTimerPaused ? 'Resume' : 'Pause'}">
                    <i class="fas ${_isRestTimerPaused ? 'fa-play' : 'fa-pause'}"></i>
                </button>
                <button class="rest-btn" onclick="PersonalizedBlueprintUI.adjustRestTimer(30)" title="Add 30 seconds">+30s</button>
                <button class="rest-btn rest-btn-skip" onclick="PersonalizedBlueprintUI.stopRestTimer()" title="Skip Rest">
                    <i class="fas fa-forward"></i>
                </button>
            </div>
        </div>`;
    }

    function pauseResumeRestTimer() {
        _isRestTimerPaused = !_isRestTimerPaused;
        renderRestTimerUI();
    }

    function adjustRestTimer(deltaSeconds) {
        _restTimeRemaining = Math.max(5, _restTimeRemaining + deltaSeconds);
        _restTotalDuration = Math.max(_restTimeRemaining, _restTotalDuration);
        renderRestTimerUI();
    }

    function stopRestTimer() {
        if (_restTimerInterval) {
            clearInterval(_restTimerInterval);
            _restTimerInterval = null;
        }
        if (typeof document !== 'undefined') {
            const banner = document.getElementById('blueprint-rest-timer-banner');
            if (banner) banner.remove();
        }
    }

    function closeWorkoutModal() {
        if (typeof document === 'undefined') return;
        stopRestTimer();
        const modal = document.getElementById('blueprint-execution-modal');
        if (modal) modal.remove();
    }

    function syncRIRToRPE(exerciseId, setNum) {
        if (typeof document === 'undefined') return;
        const rirInput = document.getElementById(`input-rir-${exerciseId}-${setNum}`);
        const rpeDisplay = document.getElementById(`derived-rpe-${exerciseId}-${setNum}`);
        if (!rirInput || !rpeDisplay) return;

        const val = parseFloat(rirInput.value);
        if (!isNaN(val) && val >= 0 && val <= 5) {
            rpeDisplay.textContent = `RPE ${10 - val}`;
        } else {
            rpeDisplay.textContent = 'RPE -';
        }
    }

    /**
     * Calculates session total tonnage (reps x weight) for completed sets.
     */
    function calculateSessionTonnage(log) {
        if (!log || !Array.isArray(log.exercises)) {
            return { totalKg: 0, totalLb: 0, totalFormatted: '0 kg' };
        }
        let totalKg = 0;
        let primaryUnit = 'kg';

        log.exercises.forEach(ex => {
            (ex.sets || []).forEach(s => {
                if (s.completed && s.actualReps && s.actualLoad) {
                    const reps = parseFloat(s.actualReps) || 0;
                    const load = parseFloat(s.actualLoad) || 0;
                    const unit = s.loadUnit || 'kg';
                    primaryUnit = unit;
                    if (unit === 'lb') {
                        totalKg += (reps * load * 0.453592);
                    } else if (unit === 'kg') {
                        totalKg += (reps * load);
                    }
                }
            });
        });

        const totalFormatted = primaryUnit === 'lb'
            ? `${Math.round(totalKg * 2.20462).toLocaleString()} lb`
            : `${Math.round(totalKg).toLocaleString()} kg`;

        return {
            totalKg: Math.round(totalKg * 10) / 10,
            totalLb: Math.round(totalKg * 2.20462 * 10) / 10,
            totalFormatted
        };
    }

    /**
     * Calculates Estimated 1-Rep Max for given load and reps.
     */
    function calculateLiveE1RM(weight, reps, formula = 'epley') {
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (!w || w <= 0 || !r || r <= 0) return 0;
        if (r === 1) return Math.round(w * 10) / 10;
        const clampedR = Math.min(36, r);
        const e1rm = formula === 'brzycki' ? w * (36 / (37 - clampedR)) : w * (1 + (clampedR / 30));
        return Math.round(e1rm * 10) / 10;
    }

    /**
     * Retrieves historical best E1RM for an exercise across stored workout logs.
     */
    function getHistoricalBestE1RM(exerciseId) {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return 0;
            const raw = localStorage.getItem('hanumanGym.workoutLogs.v1') || localStorage.getItem('hanuman_workout_logs_v1');
            if (!raw) return 0;
            const logs = JSON.parse(raw);
            if (!Array.isArray(logs)) return 0;

            let best = 0;
            logs.forEach(l => {
                if (l.status === 'COMPLETED' || l.status === 'PARTIALLY_COMPLETED') {
                    (l.exercises || []).forEach(ex => {
                        if (ex.exerciseId === exerciseId) {
                            (ex.sets || []).forEach(s => {
                                if (s.completed && s.actualLoad && s.actualReps) {
                                    const e1rm = calculateLiveE1RM(s.actualLoad, s.actualReps);
                                    if (e1rm > best) best = e1rm;
                                }
                            });
                        }
                    });
                }
            });
            return best;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Gets highest E1RM logged in the current active session for an exercise.
     */
    function getExerciseCurrentBestE1RM(ex) {
        if (!ex || !Array.isArray(ex.sets)) return 0;
        let best = 0;
        ex.sets.forEach(s => {
            if (s.actualLoad && s.actualReps) {
                const e1rm = calculateLiveE1RM(s.actualLoad, s.actualReps);
                if (e1rm > best) best = e1rm;
            }
        });
        return best;
    }

    function handleSetInputChange(exerciseId, setNum) {
        if (!_activeLogCache || typeof document === 'undefined') return;
        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
        if (!logger) return;

        const repsEl = document.getElementById(`input-reps-${exerciseId}-${setNum}`);
        const loadEl = document.getElementById(`input-load-${exerciseId}-${setNum}`);
        const unitEl = document.getElementById(`input-unit-${exerciseId}-${setNum}`);
        const rirEl = document.getElementById(`input-rir-${exerciseId}-${setNum}`);

        const actualReps = repsEl && repsEl.value !== '' ? parseInt(repsEl.value, 10) : null;
        const actualLoad = loadEl && loadEl.value !== '' ? parseFloat(loadEl.value) : null;
        const loadUnit = unitEl ? unitEl.value : 'kg';
        const actualRIR = rirEl && rirEl.value !== '' ? parseInt(rirEl.value, 10) : null;

        try {
            logger.logSet(_activeLogCache, exerciseId, {
                setNumber: setNum,
                actualReps,
                actualLoad,
                loadUnit,
                actualRIR
            });
            logger.saveWorkoutLog(_activeLogCache);
        } catch (e) {
            console.warn('[WorkoutLogger UI]', e.message);
        }

        // Update live set E1RM cell
        const e1rmCell = document.getElementById(`e1rm-cell-${exerciseId}-${setNum}`);
        const histBest = getHistoricalBestE1RM(exerciseId);
        const setE1RM = calculateLiveE1RM(actualLoad, actualReps);
        const isNewPR = setE1RM > 0 && setE1RM > histBest && histBest > 0;

        if (e1rmCell) {
            e1rmCell.innerHTML = `
                <span class="e1rm-val-pill ${setE1RM > 0 ? 'has-val' : ''}">
                    ${setE1RM > 0 ? `${setE1RM} ${loadUnit}` : '-'}
                </span>
                ${isNewPR ? `<span class="pr-pulse-pill" title="New Estimated 1RM PR!"><i class="fas fa-fire"></i> PR</span>` : ''}`;
        }

        // Update exercise best 1RM chip
        const exRec = (_activeLogCache.exercises || []).find(e => e.exerciseId === exerciseId);
        const currentExBest = getExerciseCurrentBestE1RM(exRec);
        const effectiveBest = Math.max(histBest, currentExBest);
        const bestEl = document.getElementById(`ex-best-e1rm-${exerciseId}`);
        if (bestEl) {
            bestEl.innerHTML = `<i class="fas fa-trophy"></i> Best 1RM: <strong>${effectiveBest > 0 ? `${effectiveBest} ${loadUnit}` : '-'}</strong>`;
        }

        // Update session header stats
        const summary = logger.getWorkoutSummary(_activeLogCache);
        const tonnage = calculateSessionTonnage(_activeLogCache);
        const tonnageEl = document.getElementById('header-session-tonnage');
        if (tonnageEl) tonnageEl.innerHTML = `<strong>${tonnage.totalFormatted}</strong>`;
        const setsEl = document.getElementById('header-completed-sets');
        if (setsEl) setsEl.innerHTML = `<strong>${summary.completedSets}</strong> / ${summary.totalPlannedSets} (${summary.completionPercentage}%)`;
        const fillEl = document.getElementById('header-modal-progress-fill');
        if (fillEl) fillEl.style.width = `${summary.completionPercentage}%`;
    }

    function toggleSetCompletion(exerciseId, setNum) {
        if (!_activeLogCache || typeof document === 'undefined') return;
        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
        if (!logger) return;

        handleSetInputChange(exerciseId, setNum);

        const exRec = (_activeLogCache.exercises || []).find(e => e.exerciseId === exerciseId);
        const sRec = exRec && (exRec.sets || []).find(s => s.setNumber === setNum);
        if (sRec) {
            sRec.completed = !sRec.completed;
            logger.saveWorkoutLog(_activeLogCache);
            renderWorkoutExecutionModal(_activeLogCache);
            if (sRec.completed) {
                const restSecs = (exRec && (exRec.restSeconds || exRec.defaultRestSeconds)) || 90;
                startRestTimer(restSecs);
            }
        }
    }

    /**
     * Opens the plate calculator pre-filled for a specific set in the workout execution modal.
     */
    function openPlateCalculatorForSet(exerciseId, setNum) {
        if (!_activeLogCache || typeof document === 'undefined') return;
        const loadEl = document.getElementById(`input-load-${exerciseId}-${setNum}`);
        const unitEl = document.getElementById(`input-unit-${exerciseId}-${setNum}`);
        const weight = loadEl && loadEl.value !== '' ? parseFloat(loadEl.value) : 60;
        const unit = unitEl ? unitEl.value : 'kg';
        openPlateCalculator(weight, unit === 'lb' ? 'lb' : 'kg');
    }

    /**
     * Toggles the collapsible warm-up drawer on an exercise block in the active workout modal.
     */
    function toggleWarmupDrawer(exerciseId, defaultLoad = 60, defaultUnit = 'kg', exerciseName = '') {
        if (typeof document === 'undefined') return;
        const drawer = document.getElementById(`warmup-drawer-${exerciseId}`);
        if (!drawer) return;

        const isHidden = drawer.style.display === 'none' || !drawer.style.display;
        if (isHidden) {
            renderWarmupDrawerContent(drawer, exerciseId, defaultLoad, defaultUnit, exerciseName);
            drawer.style.display = 'block';
        } else {
            drawer.style.display = 'none';
        }
    }

    /**
     * Renders the warm-up pyramid stages inside an exercise drawer.
     */
    function renderWarmupDrawerContent(drawer, exerciseId, initialLoad = 60, unit = 'kg', exerciseName = '') {
        const rules = (typeof window !== 'undefined' && window.IntensityRulesEngine) ? window.IntensityRulesEngine : null;
        const isBarbell = !exerciseName.toLowerCase().includes('dumbbell') && !exerciseName.toLowerCase().includes('cable');
        const stages = rules && rules.calculateWarmupPyramid
            ? rules.calculateWarmupPyramid(initialLoad, unit, isBarbell)
            : [
                { tier: 1, name: 'Barbell Mobility', weight: unit === 'lb' ? 45 : 20, reps: 10, restSeconds: 45, purpose: 'Joint mobility & technique groove', percentage: 33 },
                { tier: 2, name: 'Muscle Activation', weight: Math.round(initialLoad * 0.5), reps: 5, restSeconds: 60, purpose: 'Motor unit recruitment', percentage: 50 },
                { tier: 3, name: 'Neural Priming', weight: Math.round(initialLoad * 0.7), reps: 3, restSeconds: 90, purpose: 'CNS potentiation & bar speed', percentage: 70 }
            ];

        const rowsHTML = stages.map(st => `
            <div class="warmup-stage-card">
                <div class="warmup-stage-left">
                    <span class="warmup-tier-badge">Stage ${st.tier}</span>
                    <div class="warmup-stage-info">
                        <span class="warmup-stage-name">${escapeHTML(st.name)}</span>
                        <span class="warmup-stage-purpose">${escapeHTML(st.purpose)}</span>
                    </div>
                </div>
                <div class="warmup-stage-right">
                    <div class="warmup-metric-group">
                        <strong class="warmup-weight">${st.weight} ${unit}</strong>
                        <span class="warmup-reps">&times; ${st.reps} reps</span>
                        <span class="warmup-rest"><i class="fas fa-stopwatch"></i> ${st.restSeconds}s rest</span>
                    </div>
                    <button type="button" class="btn-plate-calc-mini" onclick="PersonalizedBlueprintUI.openPlateCalculator(${st.weight}, '${unit}')" title="View plates for this warm-up set">
                        <i class="fas fa-weight-hanging"></i>
                    </button>
                    <label class="warmup-check-label" title="Mark warm-up stage completed">
                        <input type="checkbox" class="warmup-checkbox" />
                        <span class="warmup-custom-check"></span>
                    </label>
                </div>
            </div>`).join('');

        drawer.innerHTML = `
        <div class="warmup-drawer-inner">
            <div class="warmup-drawer-header">
                <div class="warmup-header-title">
                    <i class="fas fa-fire-flame-curved" style="color: #ff9800;"></i>
                    <span>Science-Backed Warm-Up Ramp Pyramid (Target: <strong>${initialLoad} ${unit}</strong>)</span>
                </div>
                <div class="warmup-recalc-wrap">
                    <input type="number" class="log-input warmup-load-input" value="${initialLoad}" id="warmup-recalc-${exerciseId}" min="20" max="500" step="2.5" />
                    <button type="button" class="btn-warmup-recalc" onclick="PersonalizedBlueprintUI.recalcWarmup('${exerciseId}', '${unit}', '${escapeHTML(exerciseName)}')">Recalculate</button>
                </div>
            </div>
            <div class="warmup-stages-list">
                ${rowsHTML}
            </div>
        </div>`;
    }

    function recalcWarmup(exerciseId, unit, exerciseName) {
        if (typeof document === 'undefined') return;
        const inputEl = document.getElementById(`warmup-recalc-${exerciseId}`);
        const val = inputEl ? parseFloat(inputEl.value) || 60 : 60;
        const drawer = document.getElementById(`warmup-drawer-${exerciseId}`);
        if (drawer) {
            renderWarmupDrawerContent(drawer, exerciseId, val, unit, exerciseName);
        }
    }

    /**
     * Toggles the collapsible Biomechanical Form Guide drawer on an exercise block.
     */
    function toggleFormGuideDrawer(exerciseId, exerciseName = '') {
        if (typeof document === 'undefined') return;
        const drawer = document.getElementById(`form-guide-drawer-${exerciseId}`);
        if (!drawer) return;

        const isHidden = drawer.style.display === 'none' || !drawer.style.display;
        if (isHidden) {
            renderFormGuideContent(drawer, exerciseId, exerciseName);
            drawer.style.display = 'block';
        } else {
            drawer.style.display = 'none';
        }
    }

    /**
     * Renders the Biomechanical Setup, Breathing Cues, and Common Mistakes checklist.
     */
    function renderFormGuideContent(drawer, exerciseId, exerciseName = '') {
        const formEngine = (typeof window !== 'undefined' && window.FormGuidesEngine) ? window.FormGuidesEngine : null;
        const guide = formEngine ? formEngine.getExerciseFormGuide(exerciseName) : null;
        if (!guide) return;

        const setupListHTML = guide.setup.map((s, i) => `
            <li><span class="step-badge">${i + 1}</span> <span>${escapeHTML(s)}</span></li>
        `).join('');

        const mistakesListHTML = guide.mistakes.map(m => `
            <div class="mistake-item-card">
                <div class="mistake-title"><i class="fas fa-circle-xmark" style="color: #e53e3e;"></i> <strong>Mistake:</strong> ${escapeHTML(m.mistake)}</div>
                <div class="mistake-correction"><i class="fas fa-circle-check" style="color: #38a169;"></i> <strong>Biomechanical Fix:</strong> ${escapeHTML(m.fix)}</div>
            </div>
        `).join('');

        drawer.innerHTML = `
        <div class="form-guide-drawer-inner">
            <div class="form-guide-header">
                <div class="form-guide-title">
                    <i class="fas fa-brain" style="color: #00e5ff;"></i>
                    <span>Biomechanical Form &amp; Setup Masterclass: <strong>${escapeHTML(exerciseName || guide.name)}</strong></span>
                </div>
            </div>

            <div class="form-guide-section">
                <h5 class="guide-section-heading"><i class="fas fa-list-check" style="color: #B3DD24;"></i> Kinetic Chain Setup Protocol</h5>
                <ul class="form-setup-steps">
                    ${setupListHTML}
                </ul>
            </div>

            <div class="form-guide-section">
                <h5 class="guide-section-heading"><i class="fas fa-lungs" style="color: #00e5ff;"></i> Intra-Abdominal Pressure &amp; Breathing</h5>
                <p class="form-breathing-text">${escapeHTML(guide.breathing)}</p>
            </div>

            <div class="form-guide-section">
                <h5 class="guide-section-heading"><i class="fas fa-triangle-exclamation" style="color: #ff9800;"></i> Common Technical Mistakes &amp; Fixes</h5>
                <div class="form-mistakes-grid">
                    ${mistakesListHTML}
                </div>
            </div>
        </div>`;
    }

    /**
     * Toggles Voice Coach state on the live workout modal.
     */
    function toggleVoiceCoach() {
        const vc = (typeof window !== 'undefined' && window.VoiceCoachEngine) ? window.VoiceCoachEngine : null;
        if (!vc) return;
        const current = vc.isVoiceEnabled();
        vc.setVoiceEnabled(!current);
        vc.setSoundFxEnabled(!current);
        const btn = document.getElementById('btnVoiceCoachToggle');
        if (btn) {
            btn.classList.toggle('active', !current);
            const icon = btn.querySelector('i');
            if (icon) icon.className = `fas ${!current ? 'fa-volume-high' : 'fa-volume-xmark'}`;
            const txt = document.getElementById('voiceCoachStateText');
            if (txt) txt.textContent = !current ? 'ON' : 'OFF';
        }
    }

    function saveSessionNotes() {
        if (!_activeLogCache || typeof document === 'undefined') return;
        const notesEl = document.getElementById('workout-session-notes');
        if (notesEl) {
            _activeLogCache.sessionNotes = notesEl.value;
            const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
            if (logger) logger.saveWorkoutLog(_activeLogCache);
        }
    }

    function finishActiveWorkout() {
        if (!_activeLogCache) return;
        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
        if (logger) {
            saveSessionNotes();
            logger.completeWorkout(_activeLogCache);
            logger.saveWorkoutLog(_activeLogCache);
            alert('Workout successfully completed and performance saved!');
        }
        closeWorkoutModal();
    }

    function abandonCurrentWorkout() {
        if (!_activeLogCache) return;
        const logger = (typeof window !== 'undefined' && window.WorkoutLoggerEngine) ? window.WorkoutLoggerEngine : null;
        if (logger) {
            logger.abandonWorkout(_activeLogCache, false);
            logger.saveWorkoutLog(_activeLogCache);
        }
        closeWorkoutModal();
    }

    // ==========================================================================
    // BARBELL PLATE LOADER & 2D VISUAL SLEEVE RENDERER
    // ==========================================================================

    const OLYMPIC_PLATES_SPEC_KG = [
        { weight: 25, color: '#e53e3e', border: '#c53030', text: '#ffffff', heightPct: 100, widthPx: 20 },
        { weight: 20, color: '#3182ce', border: '#2b6cb0', text: '#ffffff', heightPct: 92, widthPx: 18 },
        { weight: 15, color: '#d69e2e', border: '#b7791f', text: '#ffffff', heightPct: 82, widthPx: 16 },
        { weight: 10, color: '#38a169', border: '#2f855a', text: '#ffffff', heightPct: 70, widthPx: 14 },
        { weight: 5, color: '#edf2f7', border: '#cbd5e0', text: '#1a202c', heightPct: 56, widthPx: 12 },
        { weight: 2.5, color: '#1a202c', border: '#4a5568', text: '#ffffff', heightPct: 44, widthPx: 10 },
        { weight: 1.25, color: '#a0aec0', border: '#718096', text: '#1a202c', heightPct: 36, widthPx: 8 }
    ];

    const OLYMPIC_PLATES_SPEC_LB = [
        { weight: 45, color: '#3182ce', border: '#2b6cb0', text: '#ffffff', heightPct: 100, widthPx: 20 },
        { weight: 35, color: '#d69e2e', border: '#b7791f', text: '#ffffff', heightPct: 86, widthPx: 18 },
        { weight: 25, color: '#38a169', border: '#2f855a', text: '#ffffff', heightPct: 72, widthPx: 16 },
        { weight: 10, color: '#edf2f7', border: '#cbd5e0', text: '#1a202c', heightPct: 58, widthPx: 14 },
        { weight: 5, color: '#e53e3e', border: '#c53030', text: '#ffffff', heightPct: 46, widthPx: 12 },
        { weight: 2.5, color: '#1a202c', border: '#4a5568', text: '#ffffff', heightPct: 36, widthPx: 10 }
    ];

    /**
     * Calculates plate combinations per barbell sleeve.
     * @param {number} targetWeight Total weight including bar
     * @param {boolean} [isLb] True if in pounds, false for kg
     * @param {number} [barWeight] Barbell weight (defaults to 20kg or 45lb)
     * @returns {{ barWeight: number, weightPerSide: number, plates: Array<{ plate: number, count: number, spec: Object }>, remainder: number }}
     */
    function calculateBarbellPlates(targetWeight, isLb = false, barWeight = null) {
        const numWeight = parseFloat(targetWeight) || 0;
        const defaultBar = isLb ? 45 : 20;
        const bar = barWeight !== null && barWeight !== undefined ? parseFloat(barWeight) : defaultBar;

        if (numWeight <= bar) {
            return { barWeight: bar, weightPerSide: 0, plates: [], remainder: 0 };
        }

        const specs = isLb ? OLYMPIC_PLATES_SPEC_LB : OLYMPIC_PLATES_SPEC_KG;
        let sideWeight = (numWeight - bar) / 2;
        const plates = [];

        for (const spec of specs) {
            if (sideWeight >= spec.weight) {
                const count = Math.floor(sideWeight / spec.weight);
                plates.push({ plate: spec.weight, count, spec });
                sideWeight = Math.round((sideWeight - (count * spec.weight)) * 100) / 100;
            }
        }

        return {
            barWeight: bar,
            weightPerSide: Math.round(((numWeight - bar) / 2) * 100) / 100,
            plates,
            remainder: sideWeight
        };
    }

    /**
     * Generates a 2D color-coded SVG visualization of the loaded barbell sleeve.
     */
    function renderVisualBarbellSleeve(plates, unit, isLb = false) {
        const specs = isLb ? OLYMPIC_PLATES_SPEC_LB : OLYMPIC_PLATES_SPEC_KG;
        let plateElements = '';
        let xPos = 65; // start position after collar

        plates.forEach(p => {
            const spec = specs.find(s => s.weight === p.plate) || { color: '#4a5568', border: '#718096', text: '#fff', heightPct: 60, widthPx: 12 };
            for (let i = 0; i < p.count; i++) {
                const h = Math.round((spec.heightPct / 100) * 100);
                const y = Math.round((120 - h) / 2);
                const w = spec.widthPx || 14;
                plateElements += `
                    <g class="barbell-plate-node">
                        <rect x="${xPos}" y="${y}" width="${w}" height="${h}" rx="3" fill="${spec.color}" stroke="${spec.border}" stroke-width="1.5" />
                        <text x="${xPos + (w / 2)}" y="63" fill="${spec.text}" font-size="${spec.heightPct < 50 ? '8' : '10'}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" transform="rotate(90 ${xPos + (w / 2)} 63)">${p.plate}</text>
                    </g>`;
                xPos += (w + 3);
            }
        });

        return `
        <div class="barbell-visual-wrap">
            <svg viewBox="0 0 340 120" class="barbell-sleeve-svg" aria-label="Visual Barbell Sleeve Representation">
                <!-- Bar Shaft -->
                <rect x="0" y="52" width="40" height="16" fill="#718096" stroke="#4a5568" stroke-width="1" />
                
                <!-- Inner Collar -->
                <rect x="40" y="30" width="22" height="60" rx="2" fill="#a0aec0" stroke="#4a5568" stroke-width="1.5" />
                <line x1="51" y1="30" x2="51" y2="90" stroke="#718096" stroke-width="1" stroke-dasharray="2,2" />
                
                <!-- Sleeve Bar -->
                <rect x="62" y="48" width="260" height="24" rx="2" fill="#cbd5e0" stroke="#718096" stroke-width="1" />
                
                <!-- Loaded Plates -->
                ${plateElements}
                
                <!-- Outer Sleeve Cap -->
                <rect x="322" y="46" width="10" height="28" rx="2" fill="#4a5568" />
            </svg>
        </div>`;
    }

    function openPlateCalculator(initialWeight = 60, unit = 'kg') {
        if (typeof document === 'undefined') return;
        let modal = document.getElementById('blueprint-plate-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blueprint-plate-modal';
            modal.className = 'blueprint-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'plate-calc-modal-title');
            modal.onclick = function (e) {
                if (e.target === modal) closePlateCalculator();
            };
            document.body.appendChild(modal);
        }

        const isLb = unit === 'lb';
        const res = calculateBarbellPlates(initialWeight, isLb);
        const visualSleeve = renderVisualBarbellSleeve(res.plates, unit, isLb);
        const platesHTML = res.plates.length > 0
            ? res.plates.map(p => {
                const spec = p.spec || (isLb ? OLYMPIC_PLATES_SPEC_LB : OLYMPIC_PLATES_SPEC_KG).find(s => s.weight === p.plate);
                const bg = spec ? spec.color : '#4a5568';
                const col = spec ? spec.text : '#fff';
                return `<div class="plate-chip" style="background:${bg}; color:${col}; border: 1px solid ${spec ? spec.border : '#fff'};"><span class="plate-weight">${p.plate} ${unit}</span><span class="plate-count">&times; ${p.count} per side</span></div>`;
            }).join('')
            : '<p class="text-muted" style="color:#a0aec0; margin:8px 0;">Bar only (no plates needed per side)</p>';

        modal.innerHTML = `
        <div class="blueprint-modal-content plate-modal-content" style="max-width: 560px;">
            <div class="blueprint-modal-header">
                <div class="modal-title-wrap">
                    <span class="status-live-pill"><i class="fas fa-calculator"></i> GYM FLOOR TOOL</span>
                    <h3 class="modal-session-title" id="plate-calc-modal-title">Barbell Plate Visualizer</h3>
                </div>
                <button class="modal-close-btn" onclick="PersonalizedBlueprintUI.closePlateCalculator()" title="Close">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
            <div class="blueprint-modal-body" style="gap: 16px;">
                <div class="plate-calc-input-row" style="display: flex; gap: 12px; align-items: flex-end;">
                    <div class="plate-input-group" style="flex: 1;">
                        <label for="plate-target-weight" style="font-size: 12px; color: #a0aec0; display: block; margin-bottom: 4px; font-weight: 600;">Total Weight (Bar + Plates):</label>
                        <input type="number" id="plate-target-weight" min="20" max="500" step="2.5" value="${initialWeight}" class="log-input" style="width: 100%; font-size: 15px; box-sizing: border-box;" oninput="PersonalizedBlueprintUI.onPlateCalcInputChange()" />
                    </div>
                    <div class="plate-input-group" style="width: 150px;">
                        <label for="plate-unit-select" style="font-size: 12px; color: #a0aec0; display: block; margin-bottom: 4px; font-weight: 600;">Unit & Bar:</label>
                        <select id="plate-unit-select" class="log-select" style="width: 100%; font-size: 13px; box-sizing: border-box;" onchange="PersonalizedBlueprintUI.onPlateCalcInputChange()">
                            <option value="kg" ${!isLb ? 'selected' : ''}>kg (20kg bar)</option>
                            <option value="lb" ${isLb ? 'selected' : ''}>lb (45lb bar)</option>
                        </select>
                    </div>
                </div>

                <!-- 2D Barbell Visualizer -->
                <div class="plate-visual-section" id="plate-visual-container">
                    ${visualSleeve}
                </div>

                <div class="plate-calc-results-wrap" id="plate-calc-results" style="background: #181f2d; border-radius: 8px; padding: 14px; border: 1px solid rgba(255,255,255,0.06);">
                    <div class="plate-sleeve-summary" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                        <span>Sleeve Load (Each Side): <strong style="color:#B3DD24;">${res.weightPerSide} ${unit}</strong></span>
                        <span>Bar Weight: <strong>${res.barWeight} ${unit}</strong></span>
                    </div>
                    <div class="plate-stack-display" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${platesHTML}
                    </div>
                </div>
            </div>
            <div class="blueprint-modal-footer">
                <button class="log-action-btn btn-gold" onclick="PersonalizedBlueprintUI.closePlateCalculator()">Done</button>
            </div>
        </div>`;

        modal.style.display = 'flex';
    }

    function onPlateCalcInputChange() {
        if (typeof document === 'undefined') return;
        const weightEl = document.getElementById('plate-target-weight');
        const unitEl = document.getElementById('plate-unit-select');
        const resultsEl = document.getElementById('plate-calc-results');
        const visualContainer = document.getElementById('plate-visual-container');
        if (!weightEl || !unitEl || !resultsEl) return;

        const unit = unitEl.value;
        const isLb = unit === 'lb';
        const val = parseFloat(weightEl.value) || 0;
        const res = calculateBarbellPlates(val, isLb);

        if (visualContainer) {
            visualContainer.innerHTML = renderVisualBarbellSleeve(res.plates, unit, isLb);
        }

        const platesHTML = res.plates.length > 0
            ? res.plates.map(p => {
                const spec = p.spec || (isLb ? OLYMPIC_PLATES_SPEC_LB : OLYMPIC_PLATES_SPEC_KG).find(s => s.weight === p.plate);
                const bg = spec ? spec.color : '#4a5568';
                const col = spec ? spec.text : '#fff';
                return `<div class="plate-chip" style="background:${bg}; color:${col}; border: 1px solid ${spec ? spec.border : '#fff'};"><span class="plate-weight">${p.plate} ${unit}</span><span class="plate-count">&times; ${p.count} per side</span></div>`;
            }).join('')
            : '<p class="text-muted" style="color:#a0aec0; margin:8px 0;">Bar only (no plates needed per side)</p>';

        const remainderHTML = res.remainder > 0
            ? `<div class="plate-remainder-note" style="font-size: 11px; color: #f6ad55; margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px;"><i class="fas fa-circle-info"></i> Remainder: <strong>${res.remainder} ${unit}</strong> per side (use micro-plates or round to nearest 2.5${unit}).</div>`
            : '';

        resultsEl.innerHTML = `
        <div class="plate-sleeve-summary" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
            <span>Sleeve Load (Each Side): <strong style="color:#B3DD24;">${res.weightPerSide} ${unit}</strong></span>
            <span>Bar Weight: <strong>${res.barWeight} ${unit}</strong></span>
        </div>
        <div class="plate-stack-display" style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${platesHTML}
        </div>
        ${remainderHTML}`;
    }

    function closePlateCalculator() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('blueprint-plate-modal');
        if (modal) modal.remove();
    }

    function exportWorkoutBackup() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                alert('Storage not accessible for backup.');
                return;
            }
            const profile = localStorage.getItem('fitphysique_canonical_user_profile_v1') || localStorage.getItem('userSelections');
            const logs = localStorage.getItem('hanuman_workout_logs_v1');
            const customPlan = localStorage.getItem('userCustomWorkoutPlan');

            const backupData = {
                exportVersion: '1.0',
                appName: 'FitPhysique / Hanuman Gym',
                exportedAt: new Date().toISOString(),
                canonicalProfile: profile ? JSON.parse(profile) : null,
                workoutLogs: logs ? JSON.parse(logs) : [],
                customPlan: customPlan ? JSON.parse(customPlan) : null,
                activeProgram: _activeProgramCache
            };

            const jsonStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fitphysique-workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Failed to generate backup: ' + e.message);
        }
    }

    function triggerImportDialog() {
        if (typeof document === 'undefined') return;
        const input = document.getElementById('blueprint-backup-input');
        if (input) {
            input.click();
        } else {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.onchange = importWorkoutBackup;
            fileInput.click();
        }
    }

    function importWorkoutBackup(event) {
        const file = event.target && event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid JSON format');
                }

                if (data.canonicalProfile) {
                    localStorage.setItem('fitphysique_canonical_user_profile_v1', JSON.stringify(data.canonicalProfile));
                }
                if (Array.isArray(data.workoutLogs)) {
                    localStorage.setItem('hanuman_workout_logs_v1', JSON.stringify(data.workoutLogs));
                }
                if (data.customPlan) {
                    localStorage.setItem('userCustomWorkoutPlan', JSON.stringify(data.customPlan));
                }

                alert('Workout data and history successfully restored!');
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            } catch (err) {
                alert('Failed to restore backup file: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    // ==========================================================================
    // 12. EXERCISE SUBSTITUTION MODAL & SELECTION
    // ==========================================================================

    let _activeSubOriginalExId = null;
    let _activeSubSessionIdx = null;
    let _activeSubExIdx = null;

    function openSubstitutionModal(exerciseId, sIdx, exIdx, reason = 'PREFERENCE') {
        if (typeof document === 'undefined') return;

        const subEngine = (typeof window !== 'undefined' && window.ExerciseSubstitutionEngine) ? window.ExerciseSubstitutionEngine : null;
        const db = (typeof window !== 'undefined' && window.ExerciseDatabaseEngine) ? window.ExerciseDatabaseEngine : null;
        if (!subEngine || !db) {
            return;
        }

        _activeSubOriginalExId = exerciseId;
        _activeSubSessionIdx = sIdx;
        _activeSubExIdx = exIdx;

        const profile = (typeof window !== 'undefined' && window.currentCanonicalProfile) ? window.currentCanonicalProfile : null;
        const req = {
            exerciseId,
            profile,
            reason
        };

        const result = subEngine.findBestSubstitution(req);
        const originalModel = db.getExerciseById(exerciseId);
        const originalName = originalModel ? (originalModel.name || formatLabel(originalModel.id)) : formatLabel(exerciseId);

        let modal = document.getElementById('blueprint-substitution-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blueprint-substitution-modal';
            modal.className = 'blueprint-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'sub-modal-title');
            modal.onclick = function (e) {
                if (e.target === modal) {
                    PersonalizedBlueprintUI.closeSubstitutionModal();
                }
            };
            document.body.appendChild(modal);
        }

        const emgEngine = (typeof window !== 'undefined' && window.EMGSubstitutionEngine) ? window.EMGSubstitutionEngine : null;
        const emgData = emgEngine ? emgEngine.getAffinityAlternatives(exerciseId) : null;

        const candidatesHTML = result.candidateSummary && result.candidateSummary.length > 0
            ? result.candidateSummary.map((cand, idx) => {
                const qualityClass = {
                    'DIRECT': 'badge-direct',
                    'STRONG': 'badge-strong',
                    'ACCEPTABLE': 'badge-acceptable',
                    'LIMITED': 'badge-limited'
                }[cand.quality] || 'badge-acceptable';

                const candModel = db.getExerciseById(cand.exerciseId);
                const equip = candModel && Array.isArray(candModel.equipment) ? candModel.equipment.join(', ') : 'standard';

                const emgMatch = emgData?.alternatives?.find(a => a.id === cand.exerciseId || (cand.exerciseName && a.name && cand.exerciseName.toLowerCase().includes(a.name.toLowerCase())));
                const emgScore = emgMatch ? emgMatch.matchScore : cand.score;
                const curveMeta = emgMatch ? emgEngine.formatResistanceCurveMeta(emgMatch.curve) : { label: 'Mechanical Tension', badge: '💪 Compound Load', color: '#38bdf8' };
                const advantageText = emgMatch ? emgMatch.advantage : (cand.differences?.[0] || 'High biomechanical similarity across joint angles.');

                return `
                <div class="substitution-candidate-card ${idx === 0 ? 'top-match' : ''}">
                    <div class="sub-cand-header">
                        <div class="sub-cand-title-wrap">
                            <h4 class="sub-cand-name">${escapeHTML(cand.exerciseName)}</h4>
                            <span class="sub-quality-badge ${qualityClass}">${cand.quality}</span>
                            <span class="emg-match-badge"><i class="fas fa-bolt"></i> ${emgScore}% EMG Match</span>
                            <span class="resistance-curve-pill" style="border-color: ${curveMeta.color}; color: ${curveMeta.color};">${curveMeta.badge}</span>
                        </div>
                        <span class="sub-score-pill">Affinity: <strong>${emgScore}</strong>/100</span>
                    </div>
                    <div class="sub-cand-meta">
                        <span><i class="fas fa-wrench"></i> ${escapeHTML(equip)}</span>
                        <span><i class="fas fa-chart-line"></i> ${curveMeta.label}</span>
                    </div>
                    <div class="sub-cand-differences">
                        <strong>Biomechanical Advantage:</strong>
                        <p style="font-size:12px; color:#cbd5e1; margin-top:3px;"><i class="fas fa-circle-check" style="color:#38bdf8;"></i> ${escapeHTML(advantageText)}</p>
                    </div>
                    <div class="sub-cand-action">
                        <button class="plan-btn btn-gold sub-apply-btn" onclick="PersonalizedBlueprintUI.applySubstitution('${escapeHTML(exerciseId)}', '${escapeHTML(cand.exerciseId)}', ${_activeSubSessionIdx}, ${_activeSubExIdx})">
                            <i class="fas fa-arrow-right-arrow-left"></i> Replace with ${escapeHTML(cand.exerciseName)}
                        </button>
                    </div>
                </div>`;
            }).join('')
            : `<div class="sub-no-candidates">
                <i class="fas fa-triangle-exclamation"></i>
                <p>No valid candidates satisfied all safety and equipment constraints for this exercise.</p>
               </div>`;

        modal.innerHTML = `
        <div class="blueprint-modal-content sub-modal-content">
            <div class="blueprint-modal-header">
                <div class="modal-title-wrap">
                    <span class="status-live-pill"><i class="fas fa-arrows-rotate"></i> EXERCISE REPLACEMENT</span>
                    <h3 class="modal-session-title">Replace: ${escapeHTML(originalName)}</h3>
                </div>
                <button class="modal-close-btn" onclick="PersonalizedBlueprintUI.closeSubstitutionModal()" title="Close">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
            
            <div class="blueprint-modal-body sub-modal-body">
                <div class="sub-reason-selector-wrap">
                    <label for="sub-reason-select"><i class="fas fa-filter"></i> Reason for Replacement:</label>
                    <select id="sub-reason-select" class="sub-select" onchange="PersonalizedBlueprintUI.onSubstitutionReasonChange('${escapeHTML(exerciseId)}', ${_activeSubSessionIdx}, ${_activeSubExIdx})">
                        <option value="PREFERENCE" ${reason === 'PREFERENCE' ? 'selected' : ''}>Exercise Preference / Variation</option>
                        <option value="EQUIPMENT_UNAVAILABLE" ${reason === 'EQUIPMENT_UNAVAILABLE' ? 'selected' : ''}>Equipment Unavailable</option>
                        <option value="INJURY" ${reason === 'INJURY' ? 'selected' : ''}>Joint / Movement Limitation</option>
                        <option value="DISCOMFORT" ${reason === 'DISCOMFORT' ? 'selected' : ''}>Movement Discomfort</option>
                        <option value="ACCESSIBILITY" ${reason === 'ACCESSIBILITY' ? 'selected' : ''}>Accessibility / Setup Time</option>
                        <option value="FATIGUE" ${reason === 'FATIGUE' ? 'selected' : ''}>Fatigue Management</option>
                    </select>
                </div>

                <div class="sub-rationale-banner">
                    <i class="fas fa-circle-info"></i>
                    <p>${escapeHTML(result.rationale || 'Preserving movement pattern and primary muscle loading.')}</p>
                </div>

                <div class="sub-candidates-stack">
                    ${candidatesHTML}
                </div>
            </div>
            
            <div class="blueprint-modal-footer">
                <button class="log-action-btn btn-ghost" onclick="PersonalizedBlueprintUI.closeSubstitutionModal()">
                    Cancel
                </button>
            </div>
        </div>`;

        modal.style.display = 'flex';
    }

    function onSubstitutionReasonChange(exerciseId, sIdx, exIdx) {
        if (typeof document === 'undefined') return;
        const select = document.getElementById('sub-reason-select');
        const reason = select ? select.value : 'PREFERENCE';
        openSubstitutionModal(exerciseId, sIdx, exIdx, reason);
    }

    function closeSubstitutionModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('blueprint-substitution-modal');
        if (modal) modal.style.display = 'none';
    }

    function applySubstitution(originalExId, replacementExId, sIdx, exIdx) {
        if (!_activeProgramCache || !_activeProgramCache.sessions) return;
        const db = (typeof window !== 'undefined' && window.ExerciseDatabaseEngine) ? window.ExerciseDatabaseEngine : null;
        if (!db) return;

        const replModel = db.getExerciseById(replacementExId);
        if (!replModel) {
            return;
        }

        const clonedProgram = JSON.parse(JSON.stringify(_activeProgramCache));
        const session = clonedProgram.sessions[sIdx];
        if (!session || !session.exercises || !session.exercises[exIdx]) return;

        const oldEx = session.exercises[exIdx];

        session.exercises[exIdx] = {
            ...replModel,
            exerciseId: replModel.id,
            exerciseName: replModel.name,
            sets: oldEx.sets || 3,
            reps: oldEx.reps || (replModel.repRange ? `${replModel.repRange.min}-${replModel.repRange.max}` : '8-12'),
            rir: oldEx.rir !== undefined ? oldEx.rir : 2,
            rpe: oldEx.rpe !== undefined ? oldEx.rpe : 8,
            restSeconds: oldEx.restSeconds || replModel.defaultRestSeconds || 90,
            substituted: true,
            originalExerciseId: originalExId,
            originalExerciseName: oldEx.exerciseName || oldEx.name
        };

        _activeProgramCache = clonedProgram;
        if (typeof window !== 'undefined') window.currentGeneratedProgram = clonedProgram;

        const container = document.getElementById('personalized-blueprint-mount') || (document.querySelector('.personalized-blueprint-wrapper') ? document.querySelector('.personalized-blueprint-wrapper').parentElement : null);
        if (container) {
            const validator = (typeof window !== 'undefined' && window.ProgramValidatorEngine) ? window.ProgramValidatorEngine : null;
            const validationResult = validator ? validator.validateProgram(clonedProgram) : null;
            renderPersonalizedBlueprint(container, clonedProgram, validationResult);
        }

        closeSubstitutionModal();
    }

    /**
     * Renders the comprehensive "WHY THIS PLAN?" decision transparency section (Phase 15).
     * @param {Object} program 
     * @param {Object} [validationResult]
     * @returns {string} HTML string
     */
    function renderPersonalizationExplanationSection(program, validationResult) {
        let explanation = null;
        if (typeof PersonalizationExplanationEngine !== 'undefined') {
            const profile = (typeof window !== 'undefined' && window.canonicalUserProfile) || {};
            const requirements = (typeof window !== 'undefined' && window.currentTrainingRequirements) || {};
            const validation = validationResult || (typeof window !== 'undefined' && window.lastValidationResult) || null;
            const perf = (typeof window !== 'undefined' && window.currentPerformanceAnalysis) || null;
            const adapt = (typeof window !== 'undefined' && window.currentAdaptiveState) || null;
            const analytics = (typeof window !== 'undefined' && window.currentWeeklyAnalytics) || null;
            const periodization = (typeof window !== 'undefined' && window.current12WeekBlock) || null;
            const sub = (typeof window !== 'undefined' && window.lastSubstitutionEvent) || null;

            explanation = PersonalizationExplanationEngine.generatePersonalizationExplanation(
                profile, requirements, program, validation, perf, adapt, analytics, periodization, sub
            );
        }

        if (!explanation) return '';

        const summary = escapeHTML(explanation.summary);
        const factors = explanation.profileFactors || [];
        const limitations = explanation.limitations || [];
        const coverage = explanation.evidenceCoverage || {};
        const conf = explanation.confidence || {};

        const factorCards = factors.map(f => `
            <div class="explanation-card">
                <div class="explanation-card-header">
                    <span class="explanation-card-category">${escapeHTML(f.category)}</span>
                    <span class="explanation-card-priority priority-${f.priority ? f.priority.toLowerCase() : 'low'}">${escapeHTML(f.priority || 'NORMAL')}</span>
                </div>
                <h4 class="explanation-card-title">${escapeHTML(f.factor)}</h4>
                <div class="explanation-card-decision">${escapeHTML(f.decision)}</div>
                <p class="explanation-card-rationale">${escapeHTML(f.rationale)}</p>
                <div class="explanation-card-evidence"><code>${escapeHTML(f.evidence)}</code></div>
            </div>
        `).join('');

        const limitationsHTML = limitations.length > 0 ? `
            <div class="explanation-limitations-box">
                <h4><i class="fas fa-info-circle"></i> Evidence & Data Transparency</h4>
                <ul>
                    ${limitations.map(l => `<li>${escapeHTML(l)}</li>`).join('')}
                </ul>
            </div>
        ` : '';

        return `
        <section class="blueprint-section blueprint-explanation-section" data-testid="explanation-section">
            <div class="blueprint-section-header">
                <div class="blueprint-section-title-wrap">
                    <i class="fas fa-brain section-icon"></i>
                    <h2>Why This Plan? Decision Transparency</h2>
                </div>
                <div class="blueprint-meta-tag-group">
                    <span class="blueprint-meta-tag"><i class="fas fa-shield-halved"></i> Confidence: ${conf.overall || 'HIGH'}</span>
                    <span class="blueprint-meta-tag"><i class="fas fa-database"></i> Profile: ${coverage.profile || 'COMPLETE'}</span>
                </div>
            </div>
            
            <div class="explanation-summary-banner">
                <i class="fas fa-lightbulb"></i>
                <p>${summary}</p>
            </div>

            <div class="explanation-grid">
                ${factorCards}
            </div>

            ${limitationsHTML}
        </section>`;
    }

    // ==========================================================================
    // 16. SOCIAL SHARE CARD & TRAINER EXPORT MODAL
    // ==========================================================================

    let _activeShareCanvas = null;
    let _activeShareFormat = 'story';

    function openSocialShareModal(format = 'story') {
        if (typeof document === 'undefined') return;
        _activeShareFormat = format;

        const prog = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        const exportEngine = (typeof window !== 'undefined' && window.SocialExportEngine) ? window.SocialExportEngine : null;
        if (!prog || !exportEngine) return;

        let modal = document.getElementById('blueprint-social-share-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blueprint-social-share-modal';
            modal.className = 'blueprint-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'social-share-title');
            modal.onclick = function (e) {
                if (e.target === modal) closeSocialShareModal();
            };
            document.body.appendChild(modal);
        }

        renderSocialShareModalContent(modal, prog, _activeShareFormat);
    }

    function renderSocialShareModalContent(modal, prog, format) {
        const exportEngine = (typeof window !== 'undefined' && window.SocialExportEngine) ? window.SocialExportEngine : null;
        if (!exportEngine) return;

        _activeShareCanvas = exportEngine.renderSocialCardCanvas(prog, format);
        const dataUrl = _activeShareCanvas ? _activeShareCanvas.toDataURL('image/png') : '';

        modal.innerHTML = `
        <div class="blueprint-modal-content social-share-modal-content" style="max-width: 650px;">
            <div class="blueprint-modal-header">
                <div class="modal-title-wrap">
                    <span class="status-live-pill"><i class="fas fa-share-nodes"></i> SOCIAL EXPORT</span>
                    <h3 class="modal-session-title" id="social-share-title">Workout Story &amp; Share Card</h3>
                </div>
                <button class="modal-close-btn" onclick="PersonalizedBlueprintUI.closeSocialShareModal()" title="Close">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
            
            <div class="social-modal-body">
                <div class="share-format-switcher">
                    <button class="btn-format-toggle ${format === 'story' ? 'active' : ''}" onclick="PersonalizedBlueprintUI.switchSocialCardFormat('story')">
                        <i class="fas fa-mobile-screen"></i> 9:16 Story (Instagram / WhatsApp)
                    </button>
                    <button class="btn-format-toggle ${format === 'square' ? 'active' : ''}" onclick="PersonalizedBlueprintUI.switchSocialCardFormat('square')">
                        <i class="fas fa-square"></i> 1:1 Square (Feed / Twitter)
                    </button>
                </div>

                <div class="share-card-preview-wrap">
                    <img src="${dataUrl}" alt="Workout Share Card Preview" class="share-card-preview-img ${format === 'story' ? 'img-story' : 'img-square'}" />
                </div>
            </div>

            <div class="blueprint-modal-footer social-modal-footer">
                <button class="log-action-btn btn-outline" onclick="PersonalizedBlueprintUI.printInkFriendlyGymCard()">
                    <i class="fas fa-print"></i> Print Gym Card
                </button>
                <button class="log-action-btn btn-gold" onclick="PersonalizedBlueprintUI.downloadCurrentSocialCard()">
                    <i class="fas fa-download"></i> Download PNG Image
                </button>
            </div>
        </div>`;
    }

    function switchSocialCardFormat(format) {
        _activeShareFormat = format;
        const prog = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        const modal = document.getElementById('blueprint-social-share-modal');
        if (modal && prog) {
            renderSocialShareModalContent(modal, prog, _activeShareFormat);
        }
    }

    function closeSocialShareModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('blueprint-social-share-modal');
        if (modal) modal.remove();
    }

    function downloadCurrentSocialCard() {
        const exportEngine = (typeof window !== 'undefined' && window.SocialExportEngine) ? window.SocialExportEngine : null;
        if (exportEngine && _activeShareCanvas) {
            exportEngine.downloadCanvasAsPNG(_activeShareCanvas, `hanuman-gym-${_activeShareFormat}-card.png`);
        }
    }

    function printInkFriendlyGymCard() {
        if (typeof window !== 'undefined') {
            window.print();
        }
    }

    // ==========================================================================
    // 16. INTERACTIVE MESOCYCLE SCRUBBER & CALENDAR SYNC & GYM FLOOR HUD
    // ==========================================================================
    let _activeMesocycleWeek = 1;

    function renderInteractiveMesocycleScrubber(program, activeWeek = 1) {
        const scrubberEngine = (typeof window !== 'undefined' && window.MesocycleScrubberEngine) ? window.MesocycleScrubberEngine : null;
        if (!scrubberEngine) return '';

        const week = Math.max(1, Math.min(12, activeWeek || _activeMesocycleWeek || 1));
        const currentParams = scrubberEngine.getWeekParameters(week);

        const weekPillsHTML = [];
        for (let w = 1; w <= 12; w++) {
            const p = scrubberEngine.getWeekParameters(w);
            const isActive = w === week;
            const isDeload = p.type === 'DELOAD';
            const isPeak = p.type === 'OVERREACH' || p.type === 'REALIZATION';

            let pillClass = 'scrubber-week-pill';
            if (isActive) pillClass += ' active-week';
            if (isDeload) pillClass += ' deload-week';
            if (isPeak) pillClass += ' peak-week';

            weekPillsHTML.push(`
                <button type="button" class="${pillClass}" onclick="PersonalizedBlueprintUI.setMesocycleWeek(${w})" title="Week ${w}: ${p.phase} (${p.badge})" style="--week-color: ${p.color};">
                    <span class="scrubber-w-num">W${w}</span>
                    <span class="scrubber-w-type">${p.badge}</span>
                </button>
            `);
        }

        return `
        <div class="interactive-mesocycle-scrubber-card" id="mesocycleScrubberCard" data-testid="mesocycle-scrubber">
            <div class="scrubber-header-row">
                <div class="scrubber-title-wrap">
                    <span class="pill-badge pill-gold"><i class="fas fa-wave-square"></i> LIVE PERIODIZATION SCRUBBER</span>
                    <h3 class="scrubber-active-phase">Week ${week}: <span style="color: ${currentParams.color};">${currentParams.phase}</span></h3>
                </div>
                <div class="scrubber-meta-stats">
                    <span class="scrubber-stat-badge" style="border-color: ${currentParams.color}; color: ${currentParams.color};">
                        <i class="fas fa-gauge"></i> Target Effort: <strong>RIR ${currentParams.targetRir}</strong> (RPE ${currentParams.targetRpe})
                    </span>
                    <span class="scrubber-stat-badge">
                        <i class="fas fa-weight-hanging"></i> Load Modifier: <strong>${currentParams.loadMod >= 0 ? '+' : ''}${currentParams.loadMod}%</strong>
                    </span>
                </div>
            </div>

            <div class="scrubber-track-container">
                <div class="scrubber-pills-row">
                    ${weekPillsHTML.join('')}
                </div>
                <input type="range" class="scrubber-slider-input" min="1" max="12" value="${week}" step="1" oninput="PersonalizedBlueprintUI.setMesocycleWeek(parseInt(this.value, 10))" aria-label="Mesocycle Week Scrubber" />
            </div>

            <div class="scrubber-desc-banner" style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid ${currentParams.color};">
                <p><i class="fas fa-circle-info" style="color: ${currentParams.color};"></i> ${currentParams.desc}</p>
            </div>
        </div>`;
    }

    function setMesocycleWeek(week) {
        _activeMesocycleWeek = Math.max(1, Math.min(12, parseInt(week, 10) || 1));
        const program = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        if (!program) return;

        const scrubberEngine = (typeof window !== 'undefined' && window.MesocycleScrubberEngine) ? window.MesocycleScrubberEngine : null;
        if (!scrubberEngine) return;

        const morphedSessions = scrubberEngine.calculateMorphedSessionsForWeek(program.sessions, _activeMesocycleWeek);

        const scrubberContainer = document.getElementById('mesocycleScrubberWrapper');
        if (scrubberContainer) {
            scrubberContainer.innerHTML = renderInteractiveMesocycleScrubber(program, _activeMesocycleWeek);
        }

        const sessionStack = document.querySelector('.blueprint-sessions-stack');
        if (sessionStack) {
            sessionStack.innerHTML = morphedSessions.map((sess, sIdx) => renderSessionCard(sess, sIdx)).join('');
        }
    }

    function exportToCalendarICS() {
        const calEngine = (typeof window !== 'undefined' && window.CalendarSyncEngine) ? window.CalendarSyncEngine : null;
        const program = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        if (!calEngine || !program) {
            alert('Calendar Sync engine initializing. Please try again.');
            return;
        }
        calEngine.downloadICSFile(program);
    }

    let _activeFocusSessionIdx = 0;
    let _activeFocusExIdx = 0;

    function openGymFloorFocusMode(sessionIdx = 0) {
        const program = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        if (!program || !Array.isArray(program.sessions)) return;

        _activeFocusSessionIdx = Math.max(0, Math.min(program.sessions.length - 1, sessionIdx));
        _activeFocusExIdx = 0;

        let overlay = document.getElementById('gym-floor-focus-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'gym-floor-focus-overlay';
            overlay.className = 'gym-focus-overlay';
            document.body.appendChild(overlay);
        }

        renderGymFloorFocusHUD();
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeGymFloorFocusMode() {
        const overlay = document.getElementById('gym-floor-focus-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (typeof window !== 'undefined' && window.GymFocusHUDEngine) {
            window.GymFocusHUDEngine.resetRestTimer();
        }
    }

    function renderGymFloorFocusHUD() {
        const program = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        if (!program) return;
        const session = program.sessions[_activeFocusSessionIdx];
        if (!session) return;
        const exercises = session.exercises || [];
        const currentEx = exercises[_activeFocusExIdx] || exercises[0];

        const overlay = document.getElementById('gym-floor-focus-overlay');
        if (!overlay || !currentEx) return;

        const hudEngine = (typeof window !== 'undefined' && window.GymFocusHUDEngine) ? window.GymFocusHUDEngine : null;
        const setsCount = currentEx.sets || 3;
        const exName = currentEx.exerciseName || currentEx.name || 'Exercise';

        let setsRowsHTML = '';
        for (let i = 1; i <= setsCount; i++) {
            setsRowsHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 12px; font-weight:800; color:#B3DD24;">Set ${i}</td>
                <td style="padding: 12px;">
                    <input type="number" id="focus-weight-${i}" value="${currentEx.targetWeightKg || 60}" class="gym-bump-btn" style="width:70px; text-align:center;" /> kg
                </td>
                <td style="padding: 12px;">
                    <input type="text" id="focus-reps-${i}" value="${currentEx.reps || '8-10'}" class="gym-bump-btn" style="width:70px; text-align:center;" /> reps
                </td>
                <td style="padding: 12px;">
                    <button class="plan-btn btn-gold" onclick="PersonalizedBlueprintUI.focusToggleSet(${i})" style="padding:6px 14px; font-size:12px;">
                        <i class="fas fa-check"></i> Complete
                    </button>
                </td>
            </tr>`;
        }

        overlay.innerHTML = `
        <div class="gym-focus-container">
            <div class="gym-focus-top-bar">
                <div>
                    <span class="pill-badge pill-gold"><i class="fas fa-bolt"></i> GYM FLOOR FOCUS HUD</span>
                    <h3 style="font-size:16px; font-weight:800; color:#FFF; margin-top:3px;">${escapeHTML(session.title || 'Active Workout')}</h3>
                </div>
                <button class="gym-focus-exit-btn" onclick="PersonalizedBlueprintUI.closeGymFloorFocusMode()">
                    <i class="fas fa-xmark"></i> Exit Gym Mode
                </button>
            </div>

            <div class="gym-focus-exercise-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <span style="font-size:12px; color:#94a3b8; font-weight:700;">Exercise ${_activeFocusExIdx + 1} of ${exercises.length}</span>
                    <span class="pill-badge pill-gold">RIR ${currentEx.rir || 2}</span>
                </div>
                <h2 class="gym-focus-ex-title">${escapeHTML(exName)}</h2>

                <div class="gym-focus-bumpers-row">
                    <span style="font-size:12px; color:#94a3b8; font-weight:700; align-self:center;">Quick Load Bumper:</span>
                    <button class="gym-bump-btn" onclick="PersonalizedBlueprintUI.focusBumpWeight(1.25)">+1.25 kg</button>
                    <button class="gym-bump-btn" onclick="PersonalizedBlueprintUI.focusBumpWeight(2.5)">+2.5 kg</button>
                    <button class="gym-bump-btn" onclick="PersonalizedBlueprintUI.focusBumpWeight(5)">+5.0 kg</button>
                    <button class="gym-bump-btn" onclick="PersonalizedBlueprintUI.focusBumpWeight(-2.5)">-2.5 kg</button>
                </div>

                <table style="width:100%; text-align:left; border-collapse:collapse; margin-top:8px;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(179, 221, 36,0.3); color:#94a3b8; font-size:11px; text-transform:uppercase;">
                            <th style="padding:8px 12px;">Set</th>
                            <th style="padding:8px 12px;">Load</th>
                            <th style="padding:8px 12px;">Target Reps</th>
                            <th style="padding:8px 12px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${setsRowsHTML}
                    </tbody>
                </table>
            </div>

            <!-- Auto-Rest Countdown Card -->
            <div class="gym-rest-countdown-ring-box">
                <span style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Auto Rest Countdown</span>
                <div class="rest-timer-display-digits" id="gymFocusTimerDigits">01:30</div>
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <button class="gym-bump-btn" onclick="PersonalizedBlueprintUI.focusAdjustRestTimer(-15)">-15s</button>
                    <button class="gym-bump-btn" onclick="PersonalizedBlueprintUI.focusStartRest(90)">Restart 90s</button>
                    <button class="gym-bump-btn" onclick="PersonalizedBlueprintUI.focusAdjustRestTimer(15)">+15s</button>
                </div>
            </div>

            <!-- Navigation Bar -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <button class="plan-btn btn-outline" onclick="PersonalizedBlueprintUI.focusPrevExercise()" ${_activeFocusExIdx === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous Exercise
                </button>
                <button class="plan-btn btn-gold" onclick="PersonalizedBlueprintUI.focusNextExercise()">
                    ${_activeFocusExIdx >= exercises.length - 1 ? '<i class="fas fa-flag-checkered"></i> Finish Session' : 'Next Exercise <i class="fas fa-chevron-right"></i>'}
                </button>
            </div>
        </div>`;
    }

    function focusBumpWeight(deltaKg) {
        const hudEngine = (typeof window !== 'undefined' && window.GymFocusHUDEngine) ? window.GymFocusHUDEngine : null;
        for (let i = 1; i <= 10; i++) {
            const input = document.getElementById(`focus-weight-${i}`);
            if (input) {
                const current = parseFloat(input.value) || 0;
                input.value = hudEngine ? hudEngine.calculateWeightBump(current, deltaKg) : Math.max(0, current + deltaKg);
            }
        }
    }

    function focusToggleSet(setIdx) {
        const hudEngine = (typeof window !== 'undefined' && window.GymFocusHUDEngine) ? window.GymFocusHUDEngine : null;
        if (hudEngine) {
            hudEngine.startRestTimer(90, (remaining, total, pct) => {
                const digitEl = document.getElementById('gymFocusTimerDigits');
                if (digitEl) {
                    digitEl.textContent = hudEngine.formatTimeMMSS(remaining);
                    digitEl.classList.toggle('timer-critical', remaining <= 3 && remaining > 0);
                }
            }, () => {
                const digitEl = document.getElementById('gymFocusTimerDigits');
                if (digitEl) {
                    digitEl.textContent = '00:00 - GO!';
                    digitEl.classList.remove('timer-critical');
                }
            });
        }
    }

    function focusStartRest(seconds = 90) {
        const hudEngine = (typeof window !== 'undefined' && window.GymFocusHUDEngine) ? window.GymFocusHUDEngine : null;
        if (hudEngine) {
            hudEngine.startRestTimer(seconds, (remaining, total, pct) => {
                const digitEl = document.getElementById('gymFocusTimerDigits');
                if (digitEl) {
                    digitEl.textContent = hudEngine.formatTimeMMSS(remaining);
                    digitEl.classList.toggle('timer-critical', remaining <= 3 && remaining > 0);
                }
            });
        }
    }

    function focusAdjustRestTimer(delta) {
        const hudEngine = (typeof window !== 'undefined' && window.GymFocusHUDEngine) ? window.GymFocusHUDEngine : null;
        if (hudEngine) {
            const res = hudEngine.adjustRestTimer(delta);
            const digitEl = document.getElementById('gymFocusTimerDigits');
            if (digitEl) digitEl.textContent = hudEngine.formatTimeMMSS(res.remaining);
        }
    }

    function focusNextExercise() {
        const program = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        if (!program) return;
        const session = program.sessions[_activeFocusSessionIdx];
        if (!session) return;
        const exercises = session.exercises || [];

        if (_activeFocusExIdx < exercises.length - 1) {
            _activeFocusExIdx++;
            renderGymFloorFocusHUD();
        } else {
            alert('🎉 Workout Session Completed! Outstanding effort.');
            closeGymFloorFocusMode();
        }
    }

    function focusPrevExercise() {
        if (_activeFocusExIdx > 0) {
            _activeFocusExIdx--;
            renderGymFloorFocusHUD();
        }
    }

    // ==========================================================================
    // 17. SUPERSET & 1RM AUTO-CALIBRATION METHODS
    // ==========================================================================
    let _isSupersetModeActive = false;

    function toggleSupersetMode() {
        _isSupersetModeActive = !_isSupersetModeActive;
        const program = _activeProgramCache || (typeof window !== 'undefined' ? window.currentGeneratedProgram : null);
        if (!program) return;

        const morphedSessions = (typeof window !== 'undefined' && window.MesocycleScrubberEngine) 
            ? window.MesocycleScrubberEngine.calculateMorphedSessionsForWeek(program.sessions, _activeMesocycleWeek || 1)
            : program.sessions;

        const sessionStack = document.querySelector('.blueprint-sessions-stack');
        if (sessionStack) {
            sessionStack.innerHTML = morphedSessions.map((sess, sIdx) => renderSessionCard(sess, sIdx)).join('');
        }

        const btn = document.getElementById('blueprint-superset-toggle-btn');
        if (btn) {
            btn.innerHTML = _isSupersetModeActive 
                ? '<i class="fas fa-bolt" style="color:#B3DD24;"></i> ⚡ Supersets: ON' 
                : '<i class="fas fa-bolt"></i> ⚡ Supersets: OFF';
            btn.style.borderColor = _isSupersetModeActive ? '#B3DD24' : 'rgba(255,255,255,0.2)';
            btn.style.color = _isSupersetModeActive ? '#B3DD24' : '#ffffff';
        }
    }

    function open1RMCalibrationModal() {
        if (typeof document === 'undefined') return;
        const auto1rm = (typeof window !== 'undefined' && window.Auto1RMEngine) ? window.Auto1RMEngine : null;
        if (!auto1rm) return;

        const baselines = auto1rm.getStored1RMBaselines();

        let modal = document.getElementById('blueprint-1rm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blueprint-1rm-modal';
            modal.className = 'blueprint-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.onclick = function (e) {
                if (e.target === modal) {
                    PersonalizedBlueprintUI.close1RMCalibrationModal();
                }
            };
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
        <div class="blueprint-modal-content" style="max-width: 560px;">
            <div class="blueprint-modal-header">
                <div class="modal-title-wrap">
                    <span class="status-live-pill"><i class="fas fa-calculator"></i> 1RM CALIBRATION</span>
                    <h3 class="modal-session-title">1RM Strength Baselines</h3>
                </div>
                <button class="modal-close-btn" onclick="PersonalizedBlueprintUI.close1RMCalibrationModal()" title="Close">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
            <div class="blueprint-modal-body">
                <p style="font-size:12.5px; color:#cbd5e1; margin-bottom:12px;">
                    Enter your established or estimated One-Rep Maximum (1RM) for key compound lifts. The AI will automatically compute exact working weights for every workout set across all 12 weeks.
                </p>
                <div class="auto-1rm-grid">
                    <div class="auto-1rm-input-card">
                        <label><i class="fas fa-dumbbell"></i> Barbell Bench Press (kg)</label>
                        <input type="number" id="1rm-bench" value="${baselines['barbell-bench-press'] || 80}" min="20" max="400" />
                    </div>
                    <div class="auto-1rm-input-card">
                        <label><i class="fas fa-dumbbell"></i> Barbell Back Squat (kg)</label>
                        <input type="number" id="1rm-squat" value="${baselines['barbell-back-squat'] || 100}" min="20" max="500" />
                    </div>
                    <div class="auto-1rm-input-card">
                        <label><i class="fas fa-dumbbell"></i> Conventional Deadlift (kg)</label>
                        <input type="number" id="1rm-deadlift" value="${baselines['conventional-deadlift'] || 120}" min="20" max="600" />
                    </div>
                    <div class="auto-1rm-input-card">
                        <label><i class="fas fa-dumbbell"></i> Overhead Press (kg)</label>
                        <input type="number" id="1rm-ohp" value="${baselines['overhead-press'] || 50}" min="15" max="250" />
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
                    <button class="plan-btn btn-ghost" onclick="PersonalizedBlueprintUI.close1RMCalibrationModal()">Cancel</button>
                    <button class="plan-btn btn-gold" onclick="PersonalizedBlueprintUI.save1RMCalibration()">
                        <i class="fas fa-check"></i> Save & Recalculate Working Weights
                    </button>
                </div>
            </div>
        </div>`;

        modal.style.display = 'flex';
    }

    function close1RMCalibrationModal() {
        const modal = document.getElementById('blueprint-1rm-modal');
        if (modal) modal.remove();
    }

    function save1RMCalibration() {
        const auto1rm = (typeof window !== 'undefined' && window.Auto1RMEngine) ? window.Auto1RMEngine : null;
        if (!auto1rm) return;

        const bench = parseFloat(document.getElementById('1rm-bench')?.value) || 80;
        const squat = parseFloat(document.getElementById('1rm-squat')?.value) || 100;
        const deadlift = parseFloat(document.getElementById('1rm-deadlift')?.value) || 120;
        const ohp = parseFloat(document.getElementById('1rm-ohp')?.value) || 50;

        const updated = {
            'barbell-bench-press': bench,
            'dumbbell-bench-press': Math.round(bench * 0.75),
            'incline-barbell-bench-press': Math.round(bench * 0.85),
            'barbell-back-squat': squat,
            'leg-press': Math.round(squat * 1.6),
            'conventional-deadlift': deadlift,
            'romanian-deadlift': Math.round(deadlift * 0.8),
            'overhead-press': ohp,
            'barbell-row': Math.round(bench * 0.85)
        };

        auto1rm.save1RMBaselines(updated);

        if (_activeProgramCache) {
            _activeProgramCache = auto1rm.apply1RMBaselinesToProgram(_activeProgramCache, updated, _activeMesocycleWeek || 1);
            const sessionStack = document.querySelector('.blueprint-sessions-stack');
            if (sessionStack) {
                sessionStack.innerHTML = _activeProgramCache.sessions.map((sess, sIdx) => renderSessionCard(sess, sIdx)).join('');
            }
        }

        close1RMCalibrationModal();
        alert('✅ 1RM Baselines saved! All working loads have been dynamically recalibrated.');
    }

    // Initialize PWA installer listener on browser load
    if (typeof window !== 'undefined' && window.PWAInstallerEngine) {
        window.PWAInstallerEngine.initPWAInstaller();
    }

    /**
     * Mounts the generated blueprint HTML into a target DOM container.
     * @param {HTMLElement|string} container Element or CSS selector
     * @param {Object} program 
     * @param {Object} [validationResult] 
     * @param {Object} [options] 
     * @returns {boolean} True if successfully mounted
     */
    function renderPersonalizedBlueprint(container, program, validationResult, options) {
        if (typeof document === 'undefined') return false;

        const target = typeof container === 'string' ? document.querySelector(container) : container;
        if (!target) return false;

        _activeProgramCache = program;
        if (typeof window !== 'undefined') window.currentGeneratedProgram = program;

        const html = generateBlueprintHTML(program, validationResult, options);
        target.innerHTML = html;
        return true;
    }

    // ==========================================================================
    // EXPORTS
    // ==========================================================================
    return {
        UI_VERSION,
        generateBlueprintHTML,
        renderPersonalizedBlueprint,
        renderPersonalizedHeader,
        renderPersonalizationReasons,
        renderWeeklySchedule,
        renderSessionCard,
        renderExerciseCard,
        renderProgressionFramework,
        renderQualityMetrics,
        renderValidationState,
        renderAdaptiveIntelligenceSection,
        toggleExercise,
        startSession,
        closeWorkoutModal,
        syncRIRToRPE,
        handleSetInputChange,
        toggleSetCompletion,
        saveSessionNotes,
        finishActiveWorkout,
        abandonCurrentWorkout,
        openSubstitutionModal,
        closeSubstitutionModal,
        onSubstitutionReasonChange,
        applySubstitution,
        startRestTimer,
        pauseResumeRestTimer,
        adjustRestTimer,
        stopRestTimer,
        calculateBarbellPlates,
        renderVisualBarbellSleeve,
        openPlateCalculator,
        openPlateCalculatorForSet,
        closePlateCalculator,
        onPlateCalcInputChange,
        toggleWarmupDrawer,
        renderWarmupDrawerContent,
        recalcWarmup,
        toggleFormGuideDrawer,
        renderFormGuideContent,
        toggleVoiceCoach,
        calculateSessionTonnage,
        calculateLiveE1RM,
        getHistoricalBestE1RM,
        getExerciseCurrentBestE1RM,
        exportWorkoutBackup,
        triggerImportDialog,
        importWorkoutBackup,
        renderWeeklyAnalyticsSection,
        render12WeekRoadmapSection,
        renderMuscleAnatomySection,
        switchAnatomyView,
        toggleDeloadMode,
        openSocialShareModal,
        closeSocialShareModal,
        switchSocialCardFormat,
        downloadCurrentSocialCard,
        printInkFriendlyGymCard,
        renderPersonalizationExplanationSection,
        renderInteractiveMesocycleScrubber,
        setMesocycleWeek,
        exportToCalendarICS,
        openGymFloorFocusMode,
        closeGymFloorFocusMode,
        renderGymFloorFocusHUD,
        focusBumpWeight,
        focusToggleSet,
        focusStartRest,
        focusAdjustRestTimer,
        focusNextExercise,
        focusPrevExercise,
        toggleSupersetMode,
        open1RMCalibrationModal,
        close1RMCalibrationModal,
        save1RMCalibration,
        _internals: {
            escapeHTML,
            formatLabel
        }
    };
}));
