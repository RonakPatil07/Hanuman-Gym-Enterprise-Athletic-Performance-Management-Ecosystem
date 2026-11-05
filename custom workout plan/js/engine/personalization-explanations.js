/**
 * ==============================================================================
 * HANUMAN GYM — ADAPTIVE PERSONAL TRAINING ENGINE
 * PERSONALIZATION EXPLANATION & DECISION TRANSPARENCY ENGINE (v1.0)
 * ==============================================================================
 * 
 * Pure, deterministic explanation engine answering:
 * "Why did the system create this plan for me?"
 * "Why was this exercise, training structure, intensity, progression model,
 *  recovery adjustment, or roadmap decision selected?"
 * 
 * Core Design Principles:
 * 1. EXPLANATION ONLY: Consumes existing decisions from previous engines.
 *    Does NOT make new decisions, generate workouts, or alter prescriptions.
 * 2. STRUCTURED TRANSPARENCY: Deconstructs decisions into factor -> source ->
 *    decision -> rationale -> evidence -> priority.
 * 3. FACTUAL EVIDENCE COVERAGE: Explicitly reports evidence availability
 *    (COMPLETE, PARTIAL, UNAVAILABLE) without fabricating data.
 * 4. EVIDENCE-BASED CONFIDENCE: Reports qualitative confidence (HIGH, MEDIUM,
 *    LOW, NOT_AVAILABLE) instead of fake percentages.
 * 5. PLAIN HUMAN LANGUAGE: Communicates clearly without algorithmic jargon
 *    or pseudoscientific/medical claims.
 * 6. PURE & IMMUTABLE: Pure deterministic transformation without mutating any inputs.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PersonalizationExplanationEngine = factory();
        // Expose debug helpers in browser environment
        if (typeof window !== 'undefined') {
            window.getDebugPersonalizationExplanation = function (profile, requirements, program, validation, performance, adaptive, analytics, periodization, substitution) {
                return root.PersonalizationExplanationEngine.generatePersonalizationExplanation(
                    profile, requirements, program, validation, performance, adaptive, analytics, periodization, substitution
                );
            };
            window.getDeterministicPersonalizationExplanationSnapshot = function (explanation) {
                return root.PersonalizationExplanationEngine.getDeterministicExplanationSnapshot(explanation);
            };
        }
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ENGINE_VERSION = '1.0';

    // ==========================================================================
    // 1. CONSTANTS & ENUMS
    // ==========================================================================

    const EXPLANATION_CATEGORIES = Object.freeze({
        PROFILE: 'PROFILE',
        GOAL: 'GOAL',
        SCHEDULE: 'SCHEDULE',
        EXERCISE: 'EXERCISE',
        INTENSITY: 'INTENSITY',
        PROGRESSION: 'PROGRESSION',
        RECOVERY: 'RECOVERY',
        VALIDATION: 'VALIDATION',
        PERFORMANCE: 'PERFORMANCE',
        PERIODIZATION: 'PERIODIZATION',
        SUBSTITUTION: 'SUBSTITUTION'
    });

    const EVIDENCE_STATUS = Object.freeze({
        COMPLETE: 'COMPLETE',
        PARTIAL: 'PARTIAL',
        UNAVAILABLE: 'UNAVAILABLE'
    });

    const CONFIDENCE_LEVEL = Object.freeze({
        HIGH: 'HIGH',
        MEDIUM: 'MEDIUM',
        LOW: 'LOW',
        NOT_AVAILABLE: 'NOT_AVAILABLE'
    });

    const PRIORITY_LEVEL = Object.freeze({
        HIGH: 'HIGH',
        MEDIUM: 'MEDIUM',
        LOW: 'LOW'
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

    // ==========================================================================
    // 3. EXPLANATION BUILDERS BY DOMAIN
    // ==========================================================================

    /**
     * Explains profile factors (Goal, Experience, Schedule, Equipment, Constraints, Recovery).
     */
    function buildProfileFactorExplanations(profile) {
        const explanations = [];
        if (!profile || typeof profile !== 'object') return explanations;

        // 1. Goal
        const goal = profile.goal || (profile.goals && profile.goals.primary);
        if (goal) {
            const goalName = formatLabel(goal);
            let rationale = `Your primary goal is ${goalName.toLowerCase()}, so the program prioritizes training structures aligned with this focus.`;
            if (goal === 'muscle-gain' || goal === 'hypertrophy') {
                rationale = 'Your primary goal is muscle gain, so the program prioritizes hypertrophy-oriented training volume, rep ranges, and progressive overload.';
            } else if (goal === 'strength') {
                rationale = 'Your primary goal is strength, so the program emphasizes compound movements, higher loads, and neuromuscular adaptation.';
            } else if (goal === 'weight-loss' || goal === 'fat-loss') {
                rationale = 'Your primary goal is weight loss, so the program emphasizes muscle retention with sustainable training demand.';
            } else if (goal === 'get-shredded') {
                rationale = 'Your primary goal is definition and density, so the program combines hypertrophy preservation with high-density training.';
            } else if (goal === 'general-fitness') {
                rationale = 'Your primary goal is general fitness, so the program balances movement quality, functional strength, and sustainable conditioning.';
            }

            explanations.push({
                category: EXPLANATION_CATEGORIES.PROFILE,
                factor: 'Primary Goal',
                source: 'canonical-profile',
                decision: `${goalName} Focus`,
                rationale,
                evidence: `goal: "${goal}"`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        // 2. Training Schedule (Days per week)
        const days = profile.daysPerWeek || (profile.schedule && profile.schedule.daysPerWeek);
        if (typeof days === 'number') {
            let splitRationale = `Your availability is ${days} training days per week.`;
            if (days === 2) {
                splitRationale = 'Your two-day availability is structured with full-body sessions to cover major movement patterns within limited weekly frequency.';
            } else if (days === 3) {
                splitRationale = 'Your three-day schedule uses a full-body rotation to distribute training volume across the week.';
            } else if (days === 4) {
                splitRationale = 'Your four-day schedule uses an upper/lower split for optimal stimulus distribution and recovery.';
            } else if (days === 5) {
                splitRationale = 'Your five-day availability allows dedicated focus sessions while maintaining balanced weekly frequency.';
            } else if (days === 6) {
                splitRationale = 'Your six-day availability supports a high-frequency push/pull/legs split.';
            }

            explanations.push({
                category: EXPLANATION_CATEGORIES.PROFILE,
                factor: 'Weekly Frequency',
                source: 'canonical-profile',
                decision: `${days} Days / Week`,
                rationale: splitRationale,
                evidence: `daysPerWeek: ${days}`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        // 3. Experience Level
        const exp = profile.experienceLevel || profile.experience || (profile.trainingBackground && profile.trainingBackground.experienceLevel);
        if (exp) {
            const expLabel = formatLabel(exp);
            let expRationale = `Your experience level is ${expLabel.toLowerCase()}, calibrating volume and progression demands accordingly.`;
            if (exp === 'beginner') {
                expRationale = 'Your experience level is beginner, so training demand is calibrated conservatively with a focus on movement consistency and steady adaptation.';
            } else if (exp === 'intermediate') {
                expRationale = 'Your experience level is intermediate, so training volume and progression are calibrated for structured progressive overload.';
            } else if (exp === 'advanced') {
                expRationale = 'Your experience level is advanced, allowing higher weekly volume capacity and specialized progression models.';
            }

            explanations.push({
                category: EXPLANATION_CATEGORIES.PROFILE,
                factor: 'Experience Level',
                source: 'canonical-profile',
                decision: `${expLabel} Calibration`,
                rationale: expRationale,
                evidence: `experienceLevel: "${exp}"`,
                priority: PRIORITY_LEVEL.MEDIUM
            });
        }

        // 4. Equipment Availability
        const equip = profile.equipment || (profile.equipmentAccess && profile.equipmentAccess.available);
        if (equip) {
            const equipList = Array.isArray(equip) ? equip.join(', ') : String(equip);
            explanations.push({
                category: EXPLANATION_CATEGORIES.PROFILE,
                factor: 'Equipment Access',
                source: 'canonical-profile',
                decision: `Compatible Exercise Filtering`,
                rationale: `Exercise selections are strictly filtered to utilize your available equipment (${equipList}).`,
                evidence: `equipment: [${equipList}]`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        // 5. Physical Constraints & Injuries
        const constraints = profile.injuries || profile.limitations || (profile.safetyConstraints && profile.safetyConstraints.injuries);
        if (Array.isArray(constraints) && constraints.length > 0) {
            const constraintList = constraints.join(', ');
            explanations.push({
                category: EXPLANATION_CATEGORIES.PROFILE,
                factor: 'Physical Constraints',
                source: 'canonical-profile',
                decision: 'Safety Exclusion Gate',
                rationale: `Exercises that place excessive demand on reported restricted areas (${constraintList}) are strictly excluded from your program.`,
                evidence: `injuries: [${constraintList}]`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        // 6. Recovery Signals (Sleep & Activity)
        const recovery = profile.recoveryCapacity || {};
        const sleepHours = typeof recovery.sleepHours === 'number' ? recovery.sleepHours : (typeof profile.sleepHours === 'number' ? profile.sleepHours : null);
        const activity = recovery.dailyActivityLevel || profile.dailyActivityLevel;

        if (sleepHours !== null && sleepHours < 6) {
            explanations.push({
                category: EXPLANATION_CATEGORIES.RECOVERY,
                factor: 'Sleep Duration',
                source: 'canonical-profile',
                decision: 'Volume Capacity Buffer',
                rationale: 'Your reported sleep duration is below the recovery threshold used by training rules, so planned training volume is modulated to manage training demand.',
                evidence: `sleepHours: ${sleepHours}h (< 6h threshold)`,
                priority: PRIORITY_LEVEL.MEDIUM
            });
        } else if (sleepHours !== null && sleepHours >= 8) {
            explanations.push({
                category: EXPLANATION_CATEGORIES.RECOVERY,
                factor: 'Sleep Duration',
                source: 'canonical-profile',
                decision: 'Full Volume Support',
                rationale: 'Your reported sleep duration (8h+) supports sustained progressive training volume.',
                evidence: `sleepHours: ${sleepHours}h`,
                priority: PRIORITY_LEVEL.LOW
            });
        }

        if (activity === 'very-active' || activity === 'high') {
            explanations.push({
                category: EXPLANATION_CATEGORIES.RECOVERY,
                factor: 'Daily Activity Level',
                source: 'canonical-profile',
                decision: 'Activity Workload Buffer',
                rationale: 'High daily occupational/lifestyle activity applies a planned training volume buffer to maintain balanced total workload.',
                evidence: `dailyActivityLevel: "${activity}"`,
                priority: PRIORITY_LEVEL.MEDIUM
            });
        }

        return explanations;
    }

    /**
     * Explains goal-specific training requirements.
     */
    function buildGoalDecisionExplanations(requirements, profile) {
        const explanations = [];
        if (!requirements || typeof requirements !== 'object') return explanations;

        const goal = (profile && profile.goal) || requirements.goal || 'muscle-gain';
        const goalName = formatLabel(goal);

        if (requirements.weeklyVolumeSets) {
            const minV = requirements.weeklyVolumeSets.min || 8;
            const maxV = requirements.weeklyVolumeSets.max || 14;
            explanations.push({
                category: EXPLANATION_CATEGORIES.GOAL,
                factor: 'Weekly Volume Strategy',
                source: 'training-rules',
                decision: `${minV}-${maxV} Sets / Muscle / Week`,
                rationale: `Calibrated volume range designed to provide sufficient stimulus for ${goalName.toLowerCase()} without exceeding recovery capacity.`,
                evidence: `volumeRange: ${minV}-${maxV} sets`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        if (requirements.targetRepRanges) {
            const repRangeDesc = Array.isArray(requirements.targetRepRanges)
                ? requirements.targetRepRanges.join(', ')
                : JSON.stringify(requirements.targetRepRanges);
            explanations.push({
                category: EXPLANATION_CATEGORIES.GOAL,
                factor: 'Repetition Ranges',
                source: 'training-rules',
                decision: 'Target Repetition Spectrum',
                rationale: `Repetition ranges are tailored to the physiological adaptations required for ${goalName.toLowerCase()}.`,
                evidence: `repRanges: ${repRangeDesc}`,
                priority: PRIORITY_LEVEL.MEDIUM
            });
        }

        if (requirements.progressionModel) {
            explanations.push({
                category: EXPLANATION_CATEGORIES.GOAL,
                factor: 'Primary Progression Framework',
                source: 'training-rules',
                decision: formatLabel(requirements.progressionModel),
                rationale: `Selected as the primary progression strategy to drive consistent long-term adaptation.`,
                evidence: `progressionModel: "${requirements.progressionModel}"`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        return explanations;
    }

    /**
     * Explains schedule and split design.
     */
    function buildScheduleDecisionExplanations(program, profile) {
        const explanations = [];
        if (!program || typeof program !== 'object') return explanations;

        const splitName = program.splitName || program.split || (program.schedule && program.schedule.name) || 'Custom Split';
        const sessionCount = Array.isArray(program.sessions) ? program.sessions.length : (program.daysPerWeek || 4);

        explanations.push({
            category: EXPLANATION_CATEGORIES.SCHEDULE,
            factor: 'Workout Split Architecture',
            source: 'program-generator',
            decision: formatLabel(splitName),
            rationale: `The ${formatLabel(splitName)} split organizes ${sessionCount} training sessions per week to ensure all target muscle groups are stimulated with adequate inter-session rest.`,
            evidence: `split: "${splitName}", sessions: ${sessionCount}`,
            priority: PRIORITY_LEVEL.HIGH
        });

        if (Array.isArray(program.sessions)) {
            program.sessions.forEach((s, idx) => {
                const dayName = s.day || s.dayName || `Day ${idx + 1}`;
                const focus = s.focus || s.name || 'Full Body';
                explanations.push({
                    category: EXPLANATION_CATEGORIES.SCHEDULE,
                    factor: `${dayName} Structure`,
                    source: 'program-generator',
                    decision: `${focus} Session`,
                    rationale: `Dedicated session focusing on ${focus.toLowerCase()} movements to distribute weekly workload effectively.`,
                    evidence: `session: "${dayName}", focus: "${focus}"`,
                    priority: PRIORITY_LEVEL.LOW
                });
            });
        }

        return explanations;
    }

    /**
     * Explains individual exercise selections in the generated program.
     */
    function buildExerciseDecisionExplanations(program) {
        const explanations = [];
        if (!program || typeof program !== 'object' || !Array.isArray(program.sessions)) return explanations;

        program.sessions.forEach((session, sIdx) => {
            const dayLabel = session.day || session.dayName || `Session ${sIdx + 1}`;
            if (Array.isArray(session.exercises)) {
                session.exercises.forEach((ex) => {
                    const exName = ex.name || ex.exerciseId || 'Exercise';
                    const pattern = ex.pattern || ex.movementPattern || 'Movement pattern';
                    const targetMuscles = Array.isArray(ex.targetMuscles) ? ex.targetMuscles.join(', ') : (ex.targetMuscle || 'Target muscle');
                    const equip = ex.equipment || 'Available equipment';
                    const isCompound = ex.isCompound !== undefined ? ex.isCompound : (ex.category === 'compound' || true);

                    const rationale = `${exName} was selected for ${dayLabel} because it satisfies the ${pattern} movement pattern, directly targets ${targetMuscles}, and is compatible with ${equip}.`;

                    explanations.push({
                        category: EXPLANATION_CATEGORIES.EXERCISE,
                        factor: `${exName} (${dayLabel})`,
                        source: 'program-generator',
                        decision: `${isCompound ? 'Compound' : 'Isolation'} Movement Selection`,
                        rationale,
                        evidence: `pattern: "${pattern}", target: "${targetMuscles}", equipment: "${equip}"`,
                        priority: PRIORITY_LEVEL.MEDIUM
                    });
                });
            }
        });

        return explanations;
    }

    /**
     * Explains Phase 8 Intensity / RIR / RPE prescriptions.
     */
    function buildIntensityDecisionExplanations(program, requirements) {
        const explanations = [];
        if (!program || typeof program !== 'object') return explanations;

        let primaryRIR = 2;
        if (requirements && typeof requirements.targetRIR === 'number') {
            primaryRIR = requirements.targetRIR;
        }

        const derivedRPE = 10 - primaryRIR;

        explanations.push({
            category: EXPLANATION_CATEGORIES.INTENSITY,
            factor: 'Planned Effort Proximity (RIR)',
            source: 'intensity-rules',
            decision: `Target RIR ${primaryRIR} (RPE ${derivedRPE})`,
            rationale: `Target RIR is ${primaryRIR}, meaning working sets leave approximately ${primaryRIR} repetitions in reserve to balance mechanical stimulus and fatigue management. Target RPE is ${derivedRPE} as derived by the intensity engine (RPE = 10 - targetRIR).`,
            evidence: `targetRIR: ${primaryRIR}, targetRPE: ${derivedRPE}`,
            priority: PRIORITY_LEVEL.HIGH
        });

        explanations.push({
            category: EXPLANATION_CATEGORIES.INTENSITY,
            factor: 'Compound vs Isolation Effort Allocation',
            source: 'intensity-rules',
            decision: 'Reserve Buffer Strategy',
            rationale: 'Compound multi-joint exercises maintain a structured reserve buffer (RIR 2-3) for technique consistency, while isolation exercises permit closer proximity to failure (RIR 1-2).',
            evidence: 'compoundRIR: 2-3, isolationRIR: 1-2',
            priority: PRIORITY_LEVEL.MEDIUM
        });

        return explanations;
    }

    /**
     * Explains Phase 9 Progressive Overload model.
     */
    function buildProgressionDecisionExplanations(program) {
        const explanations = [];
        if (!program || typeof program !== 'object') return explanations;

        const progressionModel = program.progressionModel || 'DOUBLE_PROGRESSION';
        const modelLabel = formatLabel(progressionModel);

        let modelRationale = 'Progression is guided by systematic advancement rules.';
        if (progressionModel === 'DOUBLE_PROGRESSION') {
            modelRationale = 'The program uses double progression: repetitions are progressed to the upper limit of the target range with consistent load before advancing resistance.';
        } else if (progressionModel === 'LOAD_PROGRESSION') {
            modelRationale = 'The program uses load progression: resistance is incrementally increased when target repetitions are achieved with valid form.';
        } else if (progressionModel === 'REP_PROGRESSION') {
            modelRationale = 'The program uses repetition progression: working sets focus on adding repetitions within prescribed limits before adjusting external load.';
        } else if (progressionModel === 'RIR_PROGRESSION') {
            modelRationale = 'Progression is guided by proximity to failure (RIR) targets to regulate session exertion.';
        } else if (progressionModel === 'CONSERVATIVE_PROGRESSION') {
            modelRationale = 'Progression uses a conservative strategy with multi-session consolidation before increasing training demand.';
        }

        explanations.push({
            category: EXPLANATION_CATEGORIES.PROGRESSION,
            factor: 'Overload Architecture',
            source: 'progression-rules',
            decision: modelLabel,
            rationale: modelRationale,
            evidence: `progressionModel: "${progressionModel}"`,
            priority: PRIORITY_LEVEL.HIGH
        });

        return explanations;
    }

    /**
     * Explains Phase 6 Validation & Safety outcomes.
     */
    function buildValidationDecisionExplanations(validationResult) {
        const explanations = [];
        if (!validationResult || typeof validationResult !== 'object') {
            explanations.push({
                category: EXPLANATION_CATEGORIES.VALIDATION,
                factor: 'Safety Verification',
                source: 'program-validator',
                decision: 'Standard Safety Gate',
                rationale: 'The program is verified against movement safety, equipment availability, and volume constraints.',
                evidence: 'validator: standard',
                priority: PRIORITY_LEVEL.MEDIUM
            });
            return explanations;
        }

        const isValid = validationResult.isValid !== false;
        const isRepaired = !!validationResult.isRepaired || validationResult.status === 'REPAIRED';
        const warnings = Array.isArray(validationResult.warnings) ? validationResult.warnings : [];
        const errors = Array.isArray(validationResult.errors) ? validationResult.errors : [];

        if (isValid && !isRepaired && warnings.length === 0) {
            explanations.push({
                category: EXPLANATION_CATEGORIES.VALIDATION,
                factor: 'Safety & Rule Compliance',
                source: 'program-validator',
                decision: 'Validation Passed (100% Compliant)',
                rationale: 'Your program passed all program validation and safety checks, verifying equipment match, volume bounds, and movement coverage.',
                evidence: 'status: "VALID", errors: 0, warnings: 0',
                priority: PRIORITY_LEVEL.HIGH
            });
        } else if (isRepaired) {
            explanations.push({
                category: EXPLANATION_CATEGORIES.VALIDATION,
                factor: 'Automatic Plan Optimization',
                source: 'program-validator',
                decision: 'Structural Constraint Repair',
                rationale: 'The validator adjusted the generated plan to satisfy an identified structural or constraint requirement (e.g. session duration or volume balancing).',
                evidence: `status: "REPAIRED", repairedItems: ${warnings.length}`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        if (warnings.length > 0) {
            explanations.push({
                category: EXPLANATION_CATEGORIES.VALIDATION,
                factor: 'Advisory Notifications',
                source: 'program-validator',
                decision: `${warnings.length} Advisory Note(s)`,
                rationale: 'The plan contains informational validation advisories that are presented for transparency without blocking training execution.',
                evidence: `warnings: [${warnings.map(w => typeof w === 'string' ? w : w.message).join('; ')}]`,
                priority: PRIORITY_LEVEL.LOW
            });
        }

        if (!isValid) {
            explanations.push({
                category: EXPLANATION_CATEGORIES.VALIDATION,
                factor: 'Validation Safety Gate',
                source: 'program-validator',
                decision: 'Execution Blocked',
                rationale: 'The generated plan did not satisfy required safety or structural constraints and is not presented as a usable training prescription.',
                evidence: `errors: [${errors.map(e => typeof e === 'string' ? e : e.message).join('; ')}]`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        return explanations;
    }

    /**
     * Explains Phase 11 Performance & Adaptive Training outputs when historical evidence is present.
     */
    function buildPerformanceDecisionExplanations(performanceAnalysis, adaptiveTrainingResult, weeklyAnalytics) {
        const explanations = [];

        // 1. Performance Analysis
        if (performanceAnalysis && typeof performanceAnalysis === 'object') {
            const completion = performanceAnalysis.completionRate || performanceAnalysis.overallCompletionRate;
            const completionStr = typeof completion === 'number' ? `${Math.round(completion * 100)}%` : 'Recorded';
            explanations.push({
                category: EXPLANATION_CATEGORIES.PERFORMANCE,
                factor: 'Execution History',
                source: 'performance-analysis',
                decision: `Session Attainment (${completionStr})`,
                rationale: `Recent completed training sessions show the performance patterns evaluated by the analysis engine.`,
                evidence: `completionRate: ${completionStr}`,
                priority: PRIORITY_LEVEL.MEDIUM
            });
        }

        // 2. Adaptive Training Decisions (Session Level)
        if (adaptiveTrainingResult && typeof adaptiveTrainingResult === 'object') {
            const decision = adaptiveTrainingResult.decision || adaptiveTrainingResult.action || 'MAINTAIN';
            const rationale = adaptiveTrainingResult.rationale || `Adaptive decision produced by session-level performance evaluation.`;
            explanations.push({
                category: EXPLANATION_CATEGORIES.PERFORMANCE,
                factor: 'Next-Session Adaptive Guidance',
                source: 'adaptive-training',
                decision: `Adaptive Recommendation: ${formatLabel(decision)}`,
                rationale,
                evidence: `adaptiveDecision: "${decision}"`,
                priority: PRIORITY_LEVEL.HIGH
            });
        }

        // 3. Weekly Analytics
        if (weeklyAnalytics && typeof weeklyAnalytics === 'object') {
            const totalSets = weeklyAnalytics.totalSetsCompleted || (weeklyAnalytics.volume && weeklyAnalytics.volume.totalSets) || null;
            if (totalSets !== null) {
                explanations.push({
                    category: EXPLANATION_CATEGORIES.PERFORMANCE,
                    factor: 'Weekly Volume Analytics',
                    source: 'weekly-analytics',
                    decision: 'Weekly Volume Consolidation',
                    rationale: `Weekly training analytics tracks completed set volume (${totalSets} sets) across active movement patterns.`,
                    evidence: `totalSetsCompleted: ${totalSets}`,
                    priority: PRIORITY_LEVEL.LOW
                });
            }
        }

        return explanations;
    }

    /**
     * Explains Phase 14 12-Week Periodization Roadmap decisions.
     */
    function buildPeriodizationDecisionExplanations(periodizationBlock) {
        const explanations = [];
        if (!periodizationBlock || typeof periodizationBlock === 'object' && !Array.isArray(periodizationBlock.phases)) {
            // Default 12-week roadmap structure explanation
            explanations.push({
                category: EXPLANATION_CATEGORIES.PERIODIZATION,
                factor: '12-Week Macrocycle Architecture',
                source: 'periodization-engine',
                decision: '6-Phase Periodized Block',
                rationale: 'The 12-week training roadmap organizes training into 6 distinct mesocycles (Accumulation -> Deload -> Intensification -> Deload -> Peak -> Transition) for structured adaptation.',
                evidence: 'durationWeeks: 12, phaseCount: 6',
                priority: PRIORITY_LEVEL.HIGH
            });
            explanations.push({
                category: EXPLANATION_CATEGORIES.PERIODIZATION,
                factor: 'Strategic Deload Schedule',
                source: 'periodization-engine',
                decision: 'Scheduled Weeks 4, 8, 12',
                rationale: 'Every 4th week delivers scheduled fatigue management with ~40% reduced volume to prioritize recovery and movement consistency.',
                evidence: 'deloadWeeks: [4, 8, 12]',
                priority: PRIORITY_LEVEL.HIGH
            });
            return explanations;
        }

        const duration = periodizationBlock.durationWeeks || 12;
        const phases = periodizationBlock.phases || [];

        explanations.push({
            category: EXPLANATION_CATEGORIES.PERIODIZATION,
            factor: '12-Week Macrocycle Architecture',
            source: 'periodization-engine',
            decision: `${phases.length}-Phase Roadmap`,
            rationale: `The ${duration}-week training roadmap structures your progression across ${phases.length} defined mesocycles to systematically build work capacity and performance.`,
            evidence: `durationWeeks: ${duration}, phaseCount: ${phases.length}`,
            priority: PRIORITY_LEVEL.HIGH
        });

        explanations.push({
            category: EXPLANATION_CATEGORIES.PERIODIZATION,
            factor: 'Strategic Deload Schedule',
            source: 'periodization-engine',
            decision: 'Scheduled Recovery Weeks (Weeks 4, 8, 12)',
            rationale: 'Strategic deload weeks are placed every 4th week to reduce planned training demand by ~40% while maintaining movement quality.',
            evidence: 'deloadFrequency: 4 weeks, volumeReduction: 40%',
            priority: PRIORITY_LEVEL.HIGH
        });

        // Phase 14 Block-Level Adaptation Evaluation (Separated from phaseType)
        if (Array.isArray(periodizationBlock.adaptationRules) && periodizationBlock.adaptationRules.length > 0) {
            const adaptRule = periodizationBlock.adaptationRules[0];
            const decision = adaptRule.adaptationDecision || adaptRule.status || 'DEFERRED';
            const planningEffect = adaptRule.planningEffect || 'PRESERVE_ROADMAP';
            explanations.push({
                category: EXPLANATION_CATEGORIES.PERIODIZATION,
                factor: 'Block-Level Adaptation Status',
                source: 'periodization-engine',
                decision: `Planning State: ${formatLabel(decision)}`,
                rationale: adaptRule.rationale || `Block planning state evaluated as ${decision} with effect ${planningEffect} (programMutation: false).`,
                evidence: `adaptationDecision: "${decision}", planningEffect: "${planningEffect}", programMutation: false`,
                priority: PRIORITY_LEVEL.MEDIUM
            });
        }

        return explanations;
    }

    /**
     * Explains Phase 12 Exercise Substitution when substitution events have occurred.
     */
    function buildSubstitutionDecisionExplanations(substitutionResult) {
        const explanations = [];
        if (!substitutionResult || typeof substitutionResult !== 'object' || !substitutionResult.originalExerciseId) return explanations;

        const origName = substitutionResult.originalExerciseName || substitutionResult.originalExerciseId;
        const repName = substitutionResult.replacementExerciseName || substitutionResult.replacementExerciseId;
        const reason = substitutionResult.reason || 'Equipment or constraint compatibility';

        explanations.push({
            category: EXPLANATION_CATEGORIES.SUBSTITUTION,
            factor: 'Exercise Substitution',
            source: 'exercise-substitution',
            decision: `${origName} -> ${repName}`,
            rationale: `${origName} was replaced with ${repName} because: ${reason}. Movement pattern and target muscle stimuli were preserved.`,
            evidence: `original: "${origName}", replacement: "${repName}", reason: "${reason}"`,
            priority: PRIORITY_LEVEL.HIGH
        });

        return explanations;
    }

    // ==========================================================================
    // 4. EVIDENCE COVERAGE & CONFIDENCE DERIVATION
    // ==========================================================================

    /**
     * Evaluates factual evidence coverage across all input engines.
     */
    function deriveEvidenceCoverage(profile, requirements, program, validationResult, performanceAnalysis, adaptiveTrainingResult, weeklyAnalytics, periodizationBlock, substitutionResult) {
        return {
            profile: (profile && typeof profile === 'object' && Object.keys(profile).length > 0) ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.UNAVAILABLE,
            trainingRules: (requirements && typeof requirements === 'object' && Object.keys(requirements).length > 0) ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.UNAVAILABLE,
            program: (program && typeof program === 'object' && Array.isArray(program.sessions)) ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.UNAVAILABLE,
            intensity: (program && typeof program === 'object' && requirements) ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.PARTIAL,
            progression: (program && typeof program === 'object' && program.progressionModel) ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.PARTIAL,
            validation: (validationResult && typeof validationResult === 'object') ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.PARTIAL,
            performance: (performanceAnalysis && typeof performanceAnalysis === 'object') ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.UNAVAILABLE,
            analytics: (weeklyAnalytics && typeof weeklyAnalytics === 'object') ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.UNAVAILABLE,
            adaptive: (adaptiveTrainingResult && typeof adaptiveTrainingResult === 'object') ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.UNAVAILABLE,
            periodization: (periodizationBlock && typeof periodizationBlock === 'object') ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.COMPLETE,
            substitution: (substitutionResult && typeof substitutionResult === 'object' && substitutionResult.originalExerciseId) ? EVIDENCE_STATUS.COMPLETE : EVIDENCE_STATUS.UNAVAILABLE
        };
    }

    /**
     * Derives evidence-based confidence without fake percentages.
     */
    function deriveConfidence(coverage) {
        const structuralComplete = (coverage.profile === EVIDENCE_STATUS.COMPLETE && coverage.program === EVIDENCE_STATUS.COMPLETE);
        const hasHistory = (coverage.performance === EVIDENCE_STATUS.COMPLETE || coverage.analytics === EVIDENCE_STATUS.COMPLETE);

        return {
            overall: structuralComplete ? CONFIDENCE_LEVEL.HIGH : CONFIDENCE_LEVEL.MEDIUM,
            structural: structuralComplete ? CONFIDENCE_LEVEL.HIGH : CONFIDENCE_LEVEL.MEDIUM,
            historical: hasHistory ? CONFIDENCE_LEVEL.HIGH : CONFIDENCE_LEVEL.NOT_AVAILABLE
        };
    }

    /**
     * Compiles factual limitations when optional evidence is missing.
     */
    function compileLimitations(coverage) {
        const limitations = [];

        if (coverage.performance === EVIDENCE_STATUS.UNAVAILABLE && coverage.analytics === EVIDENCE_STATUS.UNAVAILABLE) {
            limitations.push('No completed workout history is available, so performance-based explanations are limited.');
        }

        if (coverage.substitution === EVIDENCE_STATUS.UNAVAILABLE) {
            limitations.push('No exercise substitution event is present for the current program.');
        }

        if (coverage.adaptive === EVIDENCE_STATUS.UNAVAILABLE) {
            limitations.push('Session-level adaptive decisions will become active once initial workout logs are completed.');
        }

        return limitations;
    }

    // ==========================================================================
    // 5. CORE EXPLANATION GENERATOR
    // ==========================================================================

    /**
     * Generates a comprehensive, deterministic Personalization Explanation.
     * 
     * @param {Object} [canonicalProfile] User profile
     * @param {Object} [trainingRequirements] Training rules requirements
     * @param {Object} [generatedProgram] Generated workout program
     * @param {Object} [validationResult] Validation outcomes
     * @param {Object} [performanceAnalysis] Performance analysis
     * @param {Object} [adaptiveTrainingResult] Adaptive training result
     * @param {Object} [weeklyAnalytics] Weekly analytics
     * @param {Object} [periodizationBlock] 12-week periodization roadmap
     * @param {Object} [substitutionResult] Substitution event metadata
     * @returns {Object} Structured Personalization Explanation
     */
    function generatePersonalizationExplanation(
        canonicalProfile,
        trainingRequirements,
        generatedProgram,
        validationResult,
        performanceAnalysis,
        adaptiveTrainingResult,
        weeklyAnalytics,
        periodizationBlock,
        substitutionResult
    ) {
        const safeProfile = deepClone(canonicalProfile) || {};
        const safeRequirements = deepClone(trainingRequirements) || {};
        const safeProgram = deepClone(generatedProgram) || {};
        const safeValidation = deepClone(validationResult) || null;
        const safePerformance = deepClone(performanceAnalysis) || null;
        const safeAdaptive = deepClone(adaptiveTrainingResult) || null;
        const safeAnalytics = deepClone(weeklyAnalytics) || null;
        const safePeriodization = deepClone(periodizationBlock) || null;
        const safeSubstitution = deepClone(substitutionResult) || null;

        const goal = safeProfile.goal || (safeProfile.goals && safeProfile.goals.primary) || 'muscle-gain';
        const exp = safeProfile.experienceLevel || safeProfile.experience || 'intermediate';
        const days = safeProfile.daysPerWeek || (safeProgram.sessions && safeProgram.sessions.length) || 4;

        const explanationId = `expl_${goal.replace(/[^a-zA-Z0-9]/g, '_')}_${exp.replace(/[^a-zA-Z0-9]/g, '_')}_${days}d`;

        // 1. Build Categorized Explanations
        const profileFactors = buildProfileFactorExplanations(safeProfile);
        const goalDecisions = buildGoalDecisionExplanations(safeRequirements, safeProfile);
        const scheduleDecisions = buildScheduleDecisionExplanations(safeProgram, safeProfile);
        const exerciseDecisions = buildExerciseDecisionExplanations(safeProgram);
        const intensityDecisions = buildIntensityDecisionExplanations(safeProgram, safeRequirements);
        const progressionDecisions = buildProgressionDecisionExplanations(safeProgram);
        const recoveryDecisions = profileFactors.filter(f => f.category === EXPLANATION_CATEGORIES.RECOVERY);
        const validationDecisions = buildValidationDecisionExplanations(safeValidation);
        const performanceDecisions = buildPerformanceDecisionExplanations(safePerformance, safeAdaptive, safeAnalytics);
        const periodizationDecisions = buildPeriodizationDecisionExplanations(safePeriodization);
        const substitutionDecisions = buildSubstitutionDecisionExplanations(safeSubstitution);

        // 2. Synthesize High-Level Summary
        const goalLabel = formatLabel(goal);
        const splitLabel = safeProgram.splitName ? formatLabel(safeProgram.splitName) : `${days}-Day Structure`;
        const summary = `This plan was created for your ${goalLabel} goal with a ${days}-day ${splitLabel}, calibrated for ${formatLabel(exp)} experience with structured progressive overload and scheduled recovery weeks.`;

        // 3. Compile Deduplicated Personalization Reasons
        const personalizationReasons = [];
        const seenReasons = new Set();

        // Ingest reasons from all categories
        const allItems = [
            ...profileFactors,
            ...goalDecisions,
            ...scheduleDecisions,
            ...intensityDecisions,
            ...progressionDecisions,
            ...recoveryDecisions,
            ...validationDecisions,
            ...periodizationDecisions,
            ...substitutionDecisions
        ];

        allItems.forEach(item => {
            if (item && item.rationale && !seenReasons.has(item.rationale)) {
                seenReasons.add(item.rationale);
                personalizationReasons.push({
                    source: item.source,
                    category: item.category,
                    factor: item.factor,
                    reason: item.rationale
                });
            }
        });

        // 4. Evidence Coverage & Confidence
        const evidenceCoverage = deriveEvidenceCoverage(
            safeProfile, safeRequirements, safeProgram, safeValidation, safePerformance, safeAdaptive, safeAnalytics, safePeriodization, safeSubstitution
        );
        const confidence = deriveConfidence(evidenceCoverage);
        const limitations = compileLimitations(evidenceCoverage);

        // 5. Deterministic Snapshot Assembly
        const explanationObject = {
            version: ENGINE_VERSION,
            explanationId,
            summary,

            profileFactors,
            goalDecisions,
            scheduleDecisions,
            exerciseDecisions,
            intensityDecisions,
            progressionDecisions,
            recoveryDecisions,
            validationDecisions,
            performanceDecisions,
            periodizationDecisions,
            substitutionDecisions,

            personalizationReasons,

            evidenceCoverage,
            confidence,
            limitations
        };

        explanationObject.deterministicSnapshot = getDeterministicExplanationSnapshot(explanationObject);

        return explanationObject;
    }

    /**
     * Generates a stripped, deterministic representation for automated hashing and comparison.
     */
    function getDeterministicExplanationSnapshot(explanation) {
        if (!explanation || typeof explanation !== 'object') return null;

        return {
            version: explanation.version,
            explanationId: explanation.explanationId,
            summary: explanation.summary,
            profileFactorsCount: Array.isArray(explanation.profileFactors) ? explanation.profileFactors.length : 0,
            goalDecisionsCount: Array.isArray(explanation.goalDecisions) ? explanation.goalDecisions.length : 0,
            scheduleDecisionsCount: Array.isArray(explanation.scheduleDecisions) ? explanation.scheduleDecisions.length : 0,
            exerciseDecisionsCount: Array.isArray(explanation.exerciseDecisions) ? explanation.exerciseDecisions.length : 0,
            intensityDecisionsCount: Array.isArray(explanation.intensityDecisions) ? explanation.intensityDecisions.length : 0,
            progressionDecisionsCount: Array.isArray(explanation.progressionDecisions) ? explanation.progressionDecisions.length : 0,
            validationDecisionsCount: Array.isArray(explanation.validationDecisions) ? explanation.validationDecisions.length : 0,
            performanceDecisionsCount: Array.isArray(explanation.performanceDecisions) ? explanation.performanceDecisions.length : 0,
            periodizationDecisionsCount: Array.isArray(explanation.periodizationDecisions) ? explanation.periodizationDecisions.length : 0,
            reasonsCount: Array.isArray(explanation.personalizationReasons) ? explanation.personalizationReasons.length : 0,
            evidenceCoverage: deepClone(explanation.evidenceCoverage),
            confidence: deepClone(explanation.confidence),
            limitations: Array.isArray(explanation.limitations) ? [...explanation.limitations] : []
        };
    }

    // ==========================================================================
    // 6. PUBLIC API EXPORTS
    // ==========================================================================

    return {
        ENGINE_VERSION,
        EXPLANATION_CATEGORIES,
        EVIDENCE_STATUS,
        CONFIDENCE_LEVEL,
        PRIORITY_LEVEL,
        generatePersonalizationExplanation,
        getDeterministicExplanationSnapshot,
        buildProfileFactorExplanations,
        buildGoalDecisionExplanations,
        buildScheduleDecisionExplanations,
        buildExerciseDecisionExplanations,
        buildIntensityDecisionExplanations,
        buildProgressionDecisionExplanations,
        buildValidationDecisionExplanations,
        buildPerformanceDecisionExplanations,
        buildPeriodizationDecisionExplanations,
        buildSubstitutionDecisionExplanations,
        deriveEvidenceCoverage,
        deriveConfidence,
        compileLimitations
    };
}));
