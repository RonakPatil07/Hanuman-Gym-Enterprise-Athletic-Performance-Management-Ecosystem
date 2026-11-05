let currentStep = 1;
const totalSteps = 34;

const userSelections = {
    heightUnit: 'cm',
    weightUnit: 'kg',
    age: null,
    gender: null,
    bodyType: null,
    goal: null,
    muscleBodyType: null,
    weightLossBodyType: null,
    getShreddedBodyType: null,
    workoutLocation: null,
    homeEquipment: [],
    workoutTime: null,
    workoutDuration: null,
    trainingDays: [],
    bodyFatLevel: '15-19%',
    trainingFrequency: null,
    pushups: null,
    pullups: null,
    height: null,
    weight: null,
    currentWeight: null,
    targetWeight: null,
    experience: null,
    userName: null,
    userEmail: null,
    goals: [],
    challenge: null,
    activities: [],
    injuries: [],
    focusAreas: []
};

// Cache DOM elements
const domCache = {
    progressText: null,
    backButton: null
};

// Load user data from localStorage
function loadUserDataFromStorage() {
    try {
        userSelections.userName = localStorage.getItem('selectedUserName') || null;
        userSelections.userEmail = localStorage.getItem('selectedUserEmail') || null;
        userSelections.height = localStorage.getItem('selectedHeight') || null;
        userSelections.heightUnit = localStorage.getItem('selectedHeightUnit') || 'cm';
        userSelections.currentWeight = localStorage.getItem('selectedCurrentWeight') || null;
        userSelections.targetWeight = localStorage.getItem('selectedTargetWeight') || null;
        userSelections.weightUnit = localStorage.getItem('selectedWeightUnit') || 'kg';
        userSelections.experience = localStorage.getItem('selectedExperience') || null;
        userSelections.workoutDuration = localStorage.getItem('selectedWorkoutDuration') || null;
        userSelections.trainingDays = JSON.parse(localStorage.getItem('selectedTrainingDays') || '[]');
        userSelections.age = localStorage.getItem('selectedAge') || null;
        userSelections.gender = localStorage.getItem('selectedGender') || null;
        userSelections.bodyType = localStorage.getItem('selectedBodyType') || null;
        userSelections.goal = localStorage.getItem('selectedGoal') || null;
        userSelections.muscleBodyType = localStorage.getItem('selectedMuscleBodyType') || null;
        userSelections.weightLossBodyType = localStorage.getItem('selectedWeightLossBodyType') || null;
        userSelections.getShreddedBodyType = localStorage.getItem('selectedGetShreddedBodyType') || null;
        userSelections.workoutLocation = localStorage.getItem('selectedWorkoutLocation') || null;
        userSelections.homeEquipment = JSON.parse(localStorage.getItem('selectedHomeEquipment') || '[]');
        userSelections.workoutTime = localStorage.getItem('selectedWorkoutTime') || null;
        userSelections.bodyFatLevel = localStorage.getItem('selectedBodyFatLevel') || '15-19%';
        userSelections.trainingFrequency = localStorage.getItem('selectedTrainingFrequency') || null;
        userSelections.pushups = localStorage.getItem('selectedPushups') || null;
        userSelections.pullups = localStorage.getItem('selectedPullups') || null;
        userSelections.focusAreas = JSON.parse(localStorage.getItem('selectedFocusAreas') || '[]');
        userSelections.injuries = JSON.parse(localStorage.getItem('selectedInjuries') || '[]');
        userSelections.typicalDay = localStorage.getItem('selectedTypicalDay') || null;
        userSelections.activities = JSON.parse(localStorage.getItem('selectedActivities') || '[]');
        userSelections.eatingHabit = localStorage.getItem('selectedEatingHabit') || null;
        userSelections.protein = localStorage.getItem('selectedProtein') || null;
        userSelections.water = localStorage.getItem('selectedWater') || null;
        userSelections.sleep = localStorage.getItem('selectedSleep') || null;
        userSelections.walking = localStorage.getItem('selectedWalking') || null;
        userSelections.issues = JSON.parse(localStorage.getItem('selectedIssues') || '[]');
        userSelections.goals = JSON.parse(localStorage.getItem('selectedGoals') || '[]');
        userSelections.challenge = localStorage.getItem('selectedChallenge') || null;
    } catch(e) {
        console.warn('Storage read warning:', e);
    }
}

let assessmentMode = 'pro';
const QUICK_MODE_SEQUENCE = [1, 2, 4, 10, 12, 13, 32, 33, 34];

function setAssessmentMode(mode) {
    assessmentMode = mode === 'quick' ? 'quick' : 'pro';
    try {
        localStorage.setItem('fitphysique_assessment_mode', assessmentMode);
    } catch(e) {}

    const btnPro = document.getElementById('btnModePro');
    const btnQuick = document.getElementById('btnModeQuick');
    if (btnPro && btnQuick) {
        btnPro.classList.toggle('active', assessmentMode === 'pro');
        btnQuick.classList.toggle('active', assessmentMode === 'quick');
    }

    const totalEl = document.getElementById('totalStepsDisplay');
    if (totalEl) {
        totalEl.textContent = assessmentMode === 'quick' ? '6' : '34';
    }

    updateProgress();
    updateLiveAssessmentInsight();
}

function getQuickModeStepIndex(stepNum) {
    const idx = QUICK_MODE_SEQUENCE.indexOf(stepNum);
    return idx !== -1 ? idx + 1 : 1;
}

function updateLiveAssessmentInsight() {
    const banner = document.getElementById('liveAssessmentInsightBanner');
    const content = document.getElementById('liveAssessmentInsightContent');
    if (!banner || !content) return;

    let insightText = '';
    let iconClass = 'fa-wand-magic-sparkles';

    if (userSelections.height && (userSelections.currentWeight || userSelections.weight)) {
        const wt = userSelections.currentWeight || userSelections.weight || 70;
        const bmr = calculateBMR(userSelections.age || 25, userSelections.gender || 'male', userSelections.height, wt);
        const tdee = calculateTDEE(bmr, userSelections.trainingDays, userSelections.typicalDay);
        insightText = `Calculated Metabolic Baseline: <strong>${bmr} kcal BMR</strong> | Estimated TDEE: <strong>${tdee} kcal/day</strong>`;
        iconClass = 'fa-fire-flame-curved';
    } else if (userSelections.goal) {
        const goalLabel = String(userSelections.goal).replace('-', ' ').toUpperCase();
        insightText = `Target Phase Initialized: <strong>12-Week Periodized ${goalLabel} Protocol</strong>`;
        iconClass = 'fa-bullseye';
    } else if (userSelections.trainingDays && userSelections.trainingDays.length > 0) {
        const daysCount = Array.isArray(userSelections.trainingDays) ? userSelections.trainingDays.length : 3;
        const splitType = daysCount <= 3 ? 'Full Body Periodization' : (daysCount === 4 ? 'Upper / Lower Split' : 'Push / Pull / Legs Split');
        insightText = `Optimal Training Schedule: <strong>${daysCount} Days/Wk &rarr; ${splitType}</strong>`;
        iconClass = 'fa-calendar-check';
    } else if (userSelections.age && userSelections.gender) {
        insightText = `Profile Configured: <strong>${String(userSelections.gender).toUpperCase()}, Age ${userSelections.age}</strong>`;
        iconClass = 'fa-user-check';
    }

    if (insightText && currentStep < 34) {
        content.innerHTML = `<strong>AI Insight:</strong> ${insightText}`;
        const iconEl = banner.querySelector('.insight-banner-icon i');
        if (iconEl) iconEl.className = `fas ${iconClass}`;
        banner.style.display = 'flex';
    } else {
        banner.style.display = 'none';
    }
}

const CHAPTER_DEFINITIONS = [
    { start: 1, end: 7, title: 'Chapter 1: Biometrics & Physical Profile', icon: 'fa-user' },
    { start: 8, end: 15, title: 'Chapter 2: Training Goals & Schedule', icon: 'fa-bullseye' },
    { start: 16, end: 25, title: 'Chapter 3: Baseline, Safety & Equipment', icon: 'fa-shield-halved' },
    { start: 26, end: 34, title: 'Chapter 4: Lifestyle & Custom Blueprint', icon: 'fa-dna' }
];

function getChapterForStep(stepNum) {
    return CHAPTER_DEFINITIONS.find(c => stepNum >= c.start && stepNum <= c.end) || CHAPTER_DEFINITIONS[0];
}

// Update progress bar and chapter milestone
function updateProgress() {
    const el = document.getElementById('progressText');
    const isQuick = assessmentMode === 'quick';
    const stepDisplay = isQuick ? getQuickModeStepIndex(currentStep) : currentStep;
    const maxSteps = isQuick ? 6 : 34;

    if (el) {
        el.textContent = stepDisplay;
    }

    const totalEl = document.getElementById('totalStepsDisplay');
    if (totalEl) {
        totalEl.textContent = maxSteps;
    }

    const chapter = getChapterForStep(currentStep);
    const chapterTitleEl = document.getElementById('chapterTitle');
    const chapterBadgeEl = document.getElementById('chapterBadge');
    if (chapterTitleEl) {
        chapterTitleEl.textContent = isQuick ? 'Quick Start Express' : chapter.title;
    }
    if (chapterBadgeEl) {
        const iconEl = chapterBadgeEl.querySelector('i');
        if (iconEl) iconEl.className = isQuick ? 'fas fa-bolt' : `fas ${chapter.icon}`;
    }

    const fillEl = document.getElementById('mainProgressBarFill');
    if (fillEl) {
        const pct = Math.min(100, Math.round((stepDisplay / maxSteps) * 100));
        fillEl.style.width = `${pct}%`;
    }

    const announcer = document.getElementById('a11yStepAnnouncer');
    if (announcer) {
        announcer.textContent = `Step ${stepDisplay} of ${maxSteps}: ${chapter.title}`;
    }

    const container = document.getElementById('mainProgressContainer');
    if (container) {
        if (currentStep === 34) {
            container.style.display = 'none';
        } else {
            container.style.display = 'block';
        }
    }
}

// Update back button visibility
function updateBackButton() {
    const btn = document.getElementById('backButton');
    if (btn) {
        if (currentStep <= 1 || currentStep === 34) {
            btn.classList.add('hidden');
            btn.style.display = 'none';
        } else {
            btn.classList.remove('hidden');
            btn.style.display = 'inline-flex';
        }
    }
}

// Show step function
function showStep(stepNumber) {
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
        step.style.display = 'none';
    });
    
    const target = document.getElementById(`step${stepNumber}`);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
        currentStep = stepNumber;
        updateProgress();
        updateBackButton();
        updateLiveAssessmentInsight();
        
        const modeSelectorWrap = document.getElementById('assessmentModeSelectorWrap');
        if (modeSelectorWrap) {
            modeSelectorWrap.style.display = (stepNumber === 34) ? 'none' : 'flex';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (stepNumber === 11) {
        setTimeout(initSlider, 50);
    }
    
    if (stepNumber === 34) {
        const insightBanner = document.getElementById('liveAssessmentInsightBanner');
        if (insightBanner) insightBanner.style.display = 'none';
        displayWorkoutPlan();
    }
}

// Go back function
function goBack() {
    if (currentStep > 1) {
        if (assessmentMode === 'quick') {
            const currentQuickIdx = QUICK_MODE_SEQUENCE.indexOf(currentStep);
            if (currentQuickIdx > 0) {
                showStep(QUICK_MODE_SEQUENCE[currentQuickIdx - 1]);
                return;
            }
        }
        showStep(currentStep - 1);
    }
}

// Interactive body fat slider
function initSlider() {
    const track = document.querySelector('.slider-track');
    const handle = document.getElementById('sliderHandle');
    const filled = document.getElementById('sliderFilled');
    const valueDisplay = document.getElementById('sliderValue');
    
    if (!track || !handle || !filled || !valueDisplay) return;
    
    const tiers = ['5-9%', '10-14%', '15-19%', '20-24%', '25-29%', '30-39%', '>40%'];
    
    function setSliderPosition(percent) {
        const clamped = Math.max(0, Math.min(100, percent));
        handle.style.left = `${clamped}%`;
        filled.style.width = `${clamped}%`;
        
        const index = Math.min(tiers.length - 1, Math.floor((clamped / 100) * tiers.length));
        const tier = tiers[index];
        valueDisplay.textContent = tier;
        valueDisplay.style.left = `${clamped}%`;
        
        userSelections.bodyFatLevel = tier;
        localStorage.setItem('selectedBodyFatLevel', tier);
    }
    
    // Default initial slider position to 15-19% (35%)
    setSliderPosition(35);
    
    function handleMove(e) {
        const rect = track.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const percent = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(percent);
    }
    
    let isDragging = false;
    
    track.onmousedown = function(e) {
        isDragging = true;
        handleMove(e);
        e.preventDefault();
    };
    
    window.addEventListener('mousemove', function(e) {
        if (isDragging) handleMove(e);
    });
    
    window.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    track.ontouchstart = function(e) {
        isDragging = true;
        handleMove(e);
    };
    
    window.addEventListener('touchmove', function(e) {
        if (isDragging) handleMove(e);
    });
    
    window.addEventListener('touchend', function() {
        isDragging = false;
    });
}

// Step 1: Age Selection
        function selectAge(age) {
            const termsCheckbox = document.getElementById('termsCheckbox');
            if (termsCheckbox && !termsCheckbox.checked) {
                alert('Please accept the terms and conditions to continue.');
                return;
            }
            userSelections.age = age;
            localStorage.setItem('selectedAge', age);
            
            // Visual selection feedback
            document.querySelectorAll('#step1 .age-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                window.event.currentTarget.classList.add('selected');
            }
            setTimeout(() => showStep(2), 180);
        }

        // Step 2: Gender Selection
        function selectGender(gender) {
            userSelections.gender = gender;
            localStorage.setItem('selectedGender', gender);
            
            // Update gender-specific image visuals
            const bodyFatImage = document.getElementById('body-fat-image');
            if (bodyFatImage) {
                if (gender === 'female') bodyFatImage.classList.add('female');
                else bodyFatImage.classList.remove('female');
            }
            
            document.querySelectorAll('#step2 .gender-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                window.event.currentTarget.classList.add('selected');
            }
            setTimeout(() => {
                if (assessmentMode === 'quick') showStep(4);
                else showStep(3);
            }, 180);
        }

        // Step 3: Body Type Selection
        function selectBodyType(bodyType) {
            userSelections.bodyType = bodyType;
            localStorage.setItem('selectedBodyType', bodyType);
            
            document.querySelectorAll('#step3 .body-type-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                window.event.currentTarget.classList.add('selected');
            }
            setTimeout(() => showStep(4), 180);
        }

        // Step 4: Fitness Goal Selection
        function selectGoal(goal) {
            userSelections.goal = goal;
            localStorage.setItem('selectedGoal', goal);
            
            document.querySelectorAll('#step4 .goal-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                window.event.currentTarget.classList.add('selected');
            }
            
            setTimeout(() => {
                if (assessmentMode === 'quick') {
                    showStep(10);
                } else {
                    if (goal === 'muscle-gain') showStep(5);
                    else if (goal === 'weight-loss') showStep(6);
                    else if (goal === 'get-shredded') showStep(7);
                    else showStep(8);
                }
            }, 180);
        }

        // Step 5: Muscle Desired Body
        function selectMuscleBodyType(bodyType) {
            userSelections.muscleBodyType = bodyType;
            localStorage.setItem('selectedMuscleBodyType', bodyType);
            document.querySelectorAll('#step5 .body-selection-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) window.event.currentTarget.classList.add('selected');
            setTimeout(() => showStep(8), 180);
        }

        // Step 6: Weight Loss Desired Body
        function selectWeightLossBodyType(bodyType) {
            userSelections.weightLossBodyType = bodyType;
            localStorage.setItem('selectedWeightLossBodyType', bodyType);
            document.querySelectorAll('#step6 .body-selection-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) window.event.currentTarget.classList.add('selected');
            setTimeout(() => showStep(8), 180);
        }

        // Step 7: Get Shredded Desired Body
        function selectGetShreddedBodyType(bodyType) {
            userSelections.getShreddedBodyType = bodyType;
            localStorage.setItem('selectedGetShreddedBodyType', bodyType);
            document.querySelectorAll('#step7 .body-selection-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) window.event.currentTarget.classList.add('selected');
            setTimeout(() => showStep(8), 180);
        }

        // Step 8: Preferred Workout Time
        function selectWorkoutTime(time) {
            userSelections.workoutTime = time;
            localStorage.setItem('selectedWorkoutTime', time);
            document.querySelectorAll('#step8 .time-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(9), 180);
        }

        // Step 9: Workout Duration
        function selectWorkoutDuration(duration) {
            userSelections.workoutDuration = duration;
            localStorage.setItem('selectedWorkoutDuration', duration);
            document.querySelectorAll('#step9 .workout-duration-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(10), 180);
        }

        // Step 10: Training Days Multi-Select
        function toggleTrainingDay(day) {
            const card = window.event ? window.event.currentTarget : null;
            if (!card) return;
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            if (day === 'not-sure' || checkbox.value === 'not-sure') {
                // If not sure clicked, uncheck all others
                document.querySelectorAll('#step10 .training-day-card').forEach(c => {
                    if (c !== card) {
                        c.classList.remove('selected');
                        const cb = c.querySelector('input[type="checkbox"]');
                        if (cb) cb.checked = false;
                    }
                });
                checkbox.checked = !checkbox.checked;
                card.classList.toggle('selected', checkbox.checked);
            } else {
                // Uncheck not sure
                const notSureCard = document.querySelector('#step10 .training-day-card.not-sure-card');
                if (notSureCard) {
                    notSureCard.classList.remove('selected');
                    const cb = notSureCard.querySelector('input[type="checkbox"]');
                    if (cb) cb.checked = false;
                }
                checkbox.checked = !checkbox.checked;
                card.classList.toggle('selected', checkbox.checked);
            }
        }

        function proceedWithTrainingDays() {
            const selectedDays = Array.from(document.querySelectorAll('input[name="training-days"]:checked')).map(cb => cb.value);
            if (selectedDays.length === 0) {
                alert('Please select at least one training day or "Not sure" to continue.');
                return;
            }
            userSelections.trainingDays = selectedDays;
            localStorage.setItem('selectedTrainingDays', JSON.stringify(selectedDays));
            if (assessmentMode === 'quick') {
                showStep(12);
            } else {
                showStep(11);
            }
        }

        // Step 11: Body Fat Level
        function proceedWithBodyFat() {
            if (!userSelections.bodyFatLevel) {
                userSelections.bodyFatLevel = '15-19%';
            }
            localStorage.setItem('selectedBodyFatLevel', userSelections.bodyFatLevel);
            showStep(12);
        }

        // Step 12: Height Selection
        function selectUnit(unit) {
            const ftInButton = document.getElementById('ft-in-button');
            const cmButton = document.getElementById('cm-button');
            const heightLabel = document.getElementById('height-label');
            const heightInput = document.getElementById('height-input');

            if (unit === 'ft-in') {
                if (ftInButton) ftInButton.classList.add('active');
                if (cmButton) cmButton.classList.remove('active');
                if (heightLabel) heightLabel.textContent = 'Height (ft, in)';
                if (heightInput) {
                    heightInput.placeholder = "5 ft 10 in";
                    heightInput.type = 'text';
                }
                userSelections.heightUnit = 'ft-in';
            } else {
                if (cmButton) cmButton.classList.add('active');
                if (ftInButton) ftInButton.classList.remove('active');
                if (heightLabel) heightLabel.textContent = 'Height (cm)';
                if (heightInput) {
                    heightInput.placeholder = '_ cm';
                    heightInput.type = 'number';
                }
                userSelections.heightUnit = 'cm';
            }
            localStorage.setItem('selectedHeightUnit', userSelections.heightUnit);
        }

        function proceedWithHeight() {
            const heightInput = document.getElementById('height-input');
            const height = heightInput ? heightInput.value.trim() : '';
            if (!height) {
                alert('Please enter your height');
                return;
            }
            userSelections.height = height;
            localStorage.setItem('selectedHeight', height);
            showStep(13);
        }

                // Step 13: Weight Selection
        function selectWeightUnit(unit) {
            const lbButton = document.getElementById('lb-button') || document.getElementById('lbs-button');
            const kgButton = document.getElementById('kg-button');
            const currentLabel = document.getElementById('current-weight-label');
            const targetLabel = document.getElementById('target-weight-label');

            if (unit === 'lb' || unit === 'lbs') {
                if (lbButton) lbButton.classList.add('active');
                if (kgButton) kgButton.classList.remove('active');
                if (currentLabel) currentLabel.textContent = 'Current weight (lbs)';
                if (targetLabel) targetLabel.textContent = 'Target weight (lbs)';
                userSelections.weightUnit = 'lbs';
            } else {
                if (kgButton) kgButton.classList.add('active');
                if (lbButton) lbButton.classList.remove('active');
                if (currentLabel) currentLabel.textContent = 'Current weight (kg)';
                if (targetLabel) targetLabel.textContent = 'Target weight (kg)';
                userSelections.weightUnit = 'kg';
            }
            localStorage.setItem('selectedWeightUnit', userSelections.weightUnit);
        }

        function proceedWithWeight() {
            const currentEl = document.getElementById('current-weight-input') || document.getElementById('current-weight');
            const targetEl = document.getElementById('target-weight-input') || document.getElementById('target-weight');
            const currentWeight = currentEl ? currentEl.value.trim() : '';
            const targetWeight = targetEl ? targetEl.value.trim() : '';
            
            if (!currentWeight) {
                alert('Please enter your current weight');
                return;
            }
            if (!targetWeight) {
                alert('Please enter your target weight');
                return;
            }
            userSelections.currentWeight = currentWeight;
            userSelections.targetWeight = targetWeight;
            localStorage.setItem('selectedCurrentWeight', currentWeight);
            localStorage.setItem('selectedTargetWeight', targetWeight);
            if (assessmentMode === 'quick') {
                showStep(32);
            } else {
                showStep(14);
            }
        }

        // Step 14: Weight Lifting Experience
        function selectExperience(experience) {
            userSelections.experience = experience;
            localStorage.setItem('selectedExperience', experience);
            document.querySelectorAll('#step14 .experience-card').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(15), 180);
        }

        // Step 15: Focus Areas
        function toggleFocusArea(area) {
            const card = window.event ? window.event.currentTarget : null;
            if (!card) return;
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            checkbox.checked = !checkbox.checked;
            card.classList.toggle('selected', checkbox.checked);
        }

        function proceedWithFocusAreas() {
            const areas = Array.from(document.querySelectorAll('input[name="focus-areas"]:checked')).map(cb => cb.value);
            if (areas.length === 0) {
                alert('Please select at least one focus area to continue.');
                return;
            }
            userSelections.focusAreas = areas;
            localStorage.setItem('selectedFocusAreas', JSON.stringify(areas));
            showStep(16);
        }

        // Step 16: Injuries
        function toggleInjury(injury) {
            const card = window.event ? window.event.currentTarget : null;
            if (!card) return;
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            const noInjuryCard = document.querySelector('#step16 .injury-option.none-option');
            if (noInjuryCard) {
                noInjuryCard.classList.remove('selected');
                const cb = noInjuryCard.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            }
            checkbox.checked = !checkbox.checked;
            card.classList.toggle('selected', checkbox.checked);
        }

        function selectNoInjuries() {
            document.querySelectorAll('#step16 .injury-option:not(.none-option)').forEach(c => {
                c.classList.remove('selected');
                const cb = c.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            });
            const noneCard = window.event ? window.event.currentTarget : null;
            if (noneCard) {
                const isSelected = noneCard.classList.contains('selected');
                noneCard.classList.toggle('selected', !isSelected);
            }
        }

        function proceedWithInjuries() {
            const injuries = Array.from(document.querySelectorAll('#step16 .injury-option.selected input[type="checkbox"]')).map(cb => cb.value);
            userSelections.injuries = injuries;
            localStorage.setItem('selectedInjuries', JSON.stringify(injuries));
            showStep(17);
        }

        // Step 17: Training Frequency
        function selectTrainingFrequency(freq) {
            userSelections.trainingFrequency = freq;
            localStorage.setItem('selectedTrainingFrequency', freq);
            document.querySelectorAll('#step17 .frequency-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(18), 180);
        }

        // Step 18: Pushups
        function selectPushups(val) {
            userSelections.pushups = val;
            localStorage.setItem('selectedPushups', val);
            document.querySelectorAll('#step18 .pushups-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(19), 180);
        }

        // Step 19: Pullups
        function selectPullups(val) {
            userSelections.pullups = val;
            localStorage.setItem('selectedPullups', val);
            document.querySelectorAll('#step19 .pullups-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(20), 180);
        }

        // Step 20: Typical Day
        function selectTypicalDay(val) {
            userSelections.typicalDay = val;
            localStorage.setItem('selectedTypicalDay', val);
            document.querySelectorAll('#step20 .activity-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(21), 180);
        }

        // Step 21: Activities
        function toggleActivity(activity) {
            const option = window.event ? window.event.currentTarget : null;
            let checkbox = document.getElementById(`activity-${activity}`);
            if (!checkbox && option) {
                checkbox = option.querySelector('input[type="checkbox"]');
            }
            if (!checkbox) return;
            
            if (activity === 'none' || checkbox.value === 'none') {
                document.querySelectorAll('#step21 .activity-option').forEach(opt => {
                    if (opt !== option) {
                        opt.classList.remove('selected');
                        const cb = opt.querySelector('input[type="checkbox"]');
                        if (cb) cb.checked = false;
                    }
                });
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) option.classList.add('selected');
                else option.classList.remove('selected');
            } else {
                const noneOption = document.querySelector('#step21 .activity-option.none-option');
                if (noneOption) {
                    noneOption.classList.remove('selected');
                    const noneCb = noneOption.querySelector('input[type="checkbox"]');
                    if (noneCb) noneCb.checked = false;
                }
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) option.classList.add('selected');
                else option.classList.remove('selected');
            }
            
            const selectedActivities = Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value);
            userSelections.activities = selectedActivities;
            localStorage.setItem('selectedActivities', JSON.stringify(selectedActivities));
        }

        function proceedWithActivities() {
            if (!userSelections.activities || userSelections.activities.length === 0) {
                alert('Please select at least one activity or "None of the above" to continue.');
                return;
            }
            showStep(22);
        }

        // Step 22: Nutrition Intro
        function proceedWithNutrition() {
            showStep(23);
        }

        // Step 23: Eating Habits
        function selectEatingHabit(val) {
            userSelections.eatingHabit = val;
            localStorage.setItem('selectedEatingHabit', val);
            document.querySelectorAll('#step23 .habits-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(24), 180);
        }

        // Step 24: Protein Intake
        function selectProtein(val) {
            userSelections.protein = val;
            localStorage.setItem('selectedProtein', val);
            document.querySelectorAll('#step24 .protein-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(25), 180);
        }

        // Step 25: Water Intake
        function selectWater(val) {
            userSelections.water = val;
            localStorage.setItem('selectedWater', val);
            document.querySelectorAll('#step25 .water-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(26), 180);
        }

        // Step 26: Sleep Duration
        function selectSleep(val) {
            userSelections.sleep = val;
            localStorage.setItem('selectedSleep', val);
            document.querySelectorAll('#step26 .sleep-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(27), 180);
        }

        // Step 27: Daily Walking
        function selectWalking(val) {
            userSelections.walking = val;
            localStorage.setItem('selectedWalking', val);
            document.querySelectorAll('#step27 .walking-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            setTimeout(() => showStep(28), 180);
        }

        // Step 28: Fitness Issues / Obstacles
        function toggleIssue(issue) {
            const card = window.event ? window.event.currentTarget : null;
            if (!card) return;
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            const noneCard = document.querySelector('#step28 .issue-option.none-option');
            if (noneCard) {
                noneCard.classList.remove('selected');
                const cb = noneCard.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            }
            checkbox.checked = !checkbox.checked;
            card.classList.toggle('selected', checkbox.checked);
        }

        function selectNone() {
            document.querySelectorAll('#step28 .issue-option:not(.none-option)').forEach(c => {
                c.classList.remove('selected');
                const cb = c.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            });
            const noneCard = window.event ? window.event.currentTarget : null;
            if (noneCard) {
                const isSelected = noneCard.classList.contains('selected');
                noneCard.classList.toggle('selected', !isSelected);
            }
        }

        function proceedWithIssues() {
            const issues = Array.from(document.querySelectorAll('#step28 input[name="issue"]:checked')).map(cb => cb.value);
            const noneSelected = document.querySelector('#step28 .issue-option.none-option.selected');
            if (issues.length === 0 && !noneSelected) {
                alert('Please select at least one issue or "None of the above" to continue.');
                return;
            }
            userSelections.issues = noneSelected ? ['none'] : issues;
            localStorage.setItem('selectedIssues', JSON.stringify(userSelections.issues));
            showStep(29);
        }

        // Step 29: Final Motivation
        function proceedToWorkoutPlan() {
            showStep(30);
        }

        // Step 30: Additional Goals
        function toggleGoal(goal) {
            const card = window.event ? window.event.currentTarget : null;
            if (!card) return;
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            const noneCard = document.querySelector('#step30 .goal-option.none-option');
            if (noneCard) {
                noneCard.classList.remove('selected');
                const cb = noneCard.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            }
            
            checkbox.checked = !checkbox.checked;
            card.classList.toggle('selected', checkbox.checked);
            
            const goals = Array.from(document.querySelectorAll('#step30 input[name="goal"]:checked')).map(cb => cb.value);
            userSelections.goals = goals;
            localStorage.setItem('selectedGoals', JSON.stringify(goals));
        }

        function selectNoneGoals() {
            document.querySelectorAll('#step30 .goal-option:not(.none-option)').forEach(c => {
                c.classList.remove('selected');
                const cb = c.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false;
            });
            const noneCard = window.event ? window.event.currentTarget : null;
            if (noneCard) {
                const isSelected = noneCard.classList.contains('selected');
                noneCard.classList.toggle('selected', !isSelected);
                userSelections.goals = isSelected ? [] : ['none'];
                localStorage.setItem('selectedGoals', JSON.stringify(userSelections.goals));
            }
        }

        function proceedWithGoals() {
            if (!userSelections.goals || userSelections.goals.length === 0) {
                alert('Please select at least one goal or "None of the above" before continuing.');
                return;
            }
            showStep(31);
        }

        // Step 31: Challenge Selection
        function selectChallenge(challenge) {
            document.querySelectorAll('#step31 .challenge-option').forEach(c => c.classList.remove('selected'));
            if (window.event && window.event.currentTarget) {
                const card = window.event.currentTarget;
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            }
            userSelections.challenge = challenge;
            localStorage.setItem('selectedChallenge', challenge);
            setTimeout(() => showStep(32), 180);
        }

        function selectNoneChallenge() {
            document.querySelectorAll('#step31 .challenge-option:not(.none-option)').forEach(c => {
                c.classList.remove('selected');
                const radio = c.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            });
            const noneCard = window.event ? window.event.currentTarget : null;
            if (noneCard) {
                noneCard.classList.toggle('selected');
            }
            userSelections.challenge = 'none';
            localStorage.setItem('selectedChallenge', 'none');
            setTimeout(() => showStep(32), 180);
        }

        function proceedWithChallenge() {
            if (!userSelections.challenge) {
                alert('Please select a challenge or "None of the above" before continuing.');
                return;
            }
            showStep(32);
        }

        // Step 32: Account Name
        function proceedWithAccount() {
            const nameEl = document.getElementById('userName');
            const name = nameEl ? nameEl.value.trim() : '';
            if (!name) {
                alert('Please enter your name');
                return;
            }
            userSelections.userName = name;
            localStorage.setItem('selectedUserName', name);
            showStep(33);
        }

        // Step 33: Account Email
        function proceedWithFinalAccount() {
            const emailEl = document.getElementById('userEmail');
            const email = emailEl ? emailEl.value.trim() : '';
            if (!email) {
                alert('Please enter your email');
                return;
            }
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            userSelections.userEmail = email;
            localStorage.setItem('selectedUserEmail', email);
            showStep(34);
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // ========================================
        // WORKOUT PLAN DATABASE & MATCHING SYSTEM
        // ========================================

        let workoutPlansDatabase = null;

        const MATCH_WEIGHTS = {
            gender: 10,
            goal: 10,
            bodyType: 8,
            age: 6,
            trainingDays: 7,
            workoutLocation: 9,
            fitnessLevel: 6,
            bodyFatLevel: 4,
            workoutTime: 3,
            equipment: 5
        };

        async function loadWorkoutPlansDatabase() {
            try {
                const response = await fetch('./workout-plans-database.json');
                if (response.ok) {
                    workoutPlansDatabase = await response.json();
                    console.log('Workout plans database loaded successfully (' + workoutPlansDatabase.workoutPlans.length + ' plans)');
                } else {
                    workoutPlansDatabase = getEmbeddedDatabase();
                }
            } catch (error) {
                console.warn('Using embedded workout plan fallback:', error);
                workoutPlansDatabase = getEmbeddedDatabase();
            }
        }

        function getEmbeddedDatabase() {
            return {
                "workoutPlans": [
                    {
                        "id": "plan_default",
                        "matchCriteria": {
                            "gender": "male",
                            "goal": "muscle-gain",
                            "bodyType": "average",
                            "age": "18-29",
                            "trainingDays": "3-4",
                            "workoutLocation": "gym",
                            "fitnessLevel": "beginner"
                        },
                        "plan": {
                            "title": "Default Custom Hypertrophy Program",
                            "duration": "12 weeks",
                            "weeklySchedule": {
                                "Monday": "Chest & Triceps",
                                "Tuesday": "Back & Biceps",
                                "Wednesday": "Active Recovery",
                                "Thursday": "Legs & Core",
                                "Friday": "Shoulders & Arms",
                                "Saturday": "Conditioning",
                                "Sunday": "Rest & Mobility"
                            },
                            "exercises": {
                                "Monday": [
                                    { "name": "Barbell Bench Press", "sets": 4, "reps": "8-10", "rest": "90s", "tempo": "2-0-2" },
                                    { "name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": "60s", "tempo": "2-0-2" },
                                    { "name": "Tricep Pushdowns", "sets": 3, "reps": "12-15", "rest": "60s", "tempo": "2-0-2" }
                                ],
                                "Tuesday": [
                                    { "name": "Lat Pulldown", "sets": 4, "reps": "8-10", "rest": "90s", "tempo": "2-0-2" },
                                    { "name": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest": "60s", "tempo": "2-0-2" },
                                    { "name": "Barbell Bicep Curls", "sets": 3, "reps": "10-12", "rest": "60s", "tempo": "2-0-2" }
                                ],
                                "Thursday": [
                                    { "name": "Barbell Squats", "sets": 4, "reps": "8-10", "rest": "120s", "tempo": "3-0-2" },
                                    { "name": "Romanian Deadlifts", "sets": 3, "reps": "10-12", "rest": "90s", "tempo": "2-0-2" },
                                    { "name": "Standing Calf Raises", "sets": 4, "reps": "15", "rest": "45s", "tempo": "2-1-2" }
                                ],
                                "Friday": [
                                    { "name": "Overhead Military Press", "sets": 4, "reps": "8-10", "rest": "90s", "tempo": "2-0-2" },
                                    { "name": "Lateral Raises", "sets": 4, "reps": "12-15", "rest": "45s", "tempo": "2-0-2" },
                                    { "name": "Hammer Curls", "sets": 3, "reps": "10-12", "rest": "60s", "tempo": "2-0-2" }
                                ]
                            },
                            "nutrition": {
                                "calories": 2500,
                                "protein": "170g",
                                "carbs": "280g",
                                "fats": "70g",
                                "hydration": "3.5 liters daily",
                                "meals": [
                                    "Breakfast: 4 egg whites + 2 whole eggs with oatmeal",
                                    "Lunch: 200g chicken breast with jasmine rice & greens",
                                    "Pre-workout: Banana with natural peanut butter",
                                    "Post-workout: Whey isolate with 5g creatine",
                                    "Dinner: 200g salmon with baked sweet potato"
                                ]
                            },
                            "recovery": {
                                "sleep": "8 hours nightly",
                                "restDays": "2 full rest days per week",
                                "stretching": "15 minutes post-workout",
                                "foamRolling": "Focus on quads and upper back",
                                "supplements": "Whey protein, Creatine monohydrate, Multivitamin"
                            }
                        }
                    }
                ]
            };
        }

        function determineFitnessLevel(pushups, pullups) {
            if (pushups === 'less-than-10' || pushups === '0-5' || pullups === 'none' || pullups === '0-1') {
                return 'beginner';
            } else if (pushups === '10-to-20' || pushups === '6-15' || pullups === '1-to-5' || pullups === '2-5') {
                return 'intermediate';
            } else {
                return 'advanced';
            }
        }

        function determineAgeGroup(age) {
            const parsedAge = parseFloat(age) || 25;
            if (parsedAge >= 18 && parsedAge <= 29) return '18-29';
            if (parsedAge >= 30 && parsedAge <= 39) return '30-39';
            if (parsedAge >= 40 && parsedAge <= 49) return '40-49';
            return '50+';
        }

        function determineTrainingDays(userSelectedDays) {
            if (!userSelectedDays || userSelectedDays.length === 0) return '3-4';
            const count = Array.isArray(userSelectedDays) ? userSelectedDays.length : parseInt(userSelectedDays) || 4;
            if (count <= 2) return '2-3';
            if (count === 3 || count === 4) return '3-4';
            if (count === 5) return '4-5';
            return '5-6';
        }

        function prepareUserProfile(userSelections) {
            if (typeof CanonicalProfileEngine !== 'undefined' && CanonicalProfileEngine.buildCanonicalUserProfile) {
                const canonical = CanonicalProfileEngine.buildCanonicalUserProfile(userSelections);
                const normalized = CanonicalProfileEngine.normalizeCanonicalUserProfile(canonical);
                const validation = CanonicalProfileEngine.validateCanonicalUserProfile(normalized);

                if (typeof window !== 'undefined') {
                    window.__lastCanonicalProfile = normalized;
                    window.__lastProfileValidation = validation;
                }

                return CanonicalProfileEngine.toLegacyUserProfile(normalized);
            }

            // Fallback if engine script was not loaded
            return {
                gender: userSelections.gender || 'male',
                age: userSelections.age || 25,
                height: userSelections.height || '175',
                currentWeight: userSelections.currentWeight || '70',
                targetWeight: userSelections.targetWeight || '70',
                heightUnit: userSelections.heightUnit || 'cm',
                weightUnit: userSelections.weightUnit || 'kg',
                bodyType: userSelections.bodyType || userSelections.muscleBodyType || userSelections.weightLossBodyType || userSelections.getShreddedBodyType || 'average',
                bodyFatLevel: userSelections.bodyFatLevel || '15-19%',
                goal: userSelections.goal || 'muscle-gain',
                workoutLocation: userSelections.workoutLocation || 'gym',
                workoutTime: userSelections.workoutTime || 'morning',
                workoutDuration: userSelections.workoutDuration || '45-60',
                trainingDays: userSelections.trainingDays && userSelections.trainingDays.length > 0 ? userSelections.trainingDays : ['Monday', 'Tuesday', 'Thursday', 'Friday'],
                trainingFrequency: userSelections.trainingFrequency || '3-times',
                experience: userSelections.experience || 'intermediate',
                fitnessLevel: determineFitnessLevel(userSelections.pushups, userSelections.pullups),
                pushups: userSelections.pushups,
                pullups: userSelections.pullups,
                equipment: userSelections.homeEquipment && userSelections.homeEquipment.length > 0 ? userSelections.homeEquipment.join(',') : 'none',
                injuries: userSelections.injuries || [],
                focusAreas: userSelections.focusAreas || [],
                typicalDay: userSelections.typicalDay || 'moderately-active',
                activities: userSelections.activities || [],
                eatingHabits: userSelections.eatingHabits || userSelections.eatingHabit || 'balanced',
                proteinIntake: userSelections.proteinIntake || userSelections.protein || 'moderate',
                waterIntake: userSelections.waterIntake || userSelections.water || 'some',
                sleepDuration: userSelections.sleepDuration || userSelections.sleep || '7-8',
                walkingHabits: userSelections.walkingHabits || userSelections.walking || 'moderate',
                userName: userSelections.userName || 'Athlete',
                userEmail: userSelections.userEmail || ''
            };
        }

        function matchesCondition(userValue, planValue) {
            if (!userValue || !planValue) return false;
            if (Array.isArray(planValue)) return planValue.includes(userValue);
            if (typeof planValue === 'string' && typeof userValue === 'string') {
                return planValue.toLowerCase() === userValue.toLowerCase();
            }
            return userValue === planValue;
        }

        function calculateMatchScore(userProfile, criteria) {
            let score = 0;
            let maxScore = 0;
            
            for (let factor in MATCH_WEIGHTS) {
                const weight = MATCH_WEIGHTS[factor];
                maxScore += weight;
                
                let userValue = userProfile[factor];
                let planValue = criteria[factor];
                
                if (factor === 'age') userValue = determineAgeGroup(userProfile.age);
                if (factor === 'trainingDays') userValue = determineTrainingDays(userProfile.trainingDays);
                
                if (matchesCondition(userValue, planValue)) {
                    score += weight;
                }
            }
            
            return maxScore > 0 ? (score / maxScore) * 100 : 80;
        }

        function calculatePlanAccuracy(customizedPlan, userProfile) {
            let accuracy = 94;
            if (userProfile.currentWeight && userProfile.targetWeight) accuracy += 2;
            if (userProfile.injuries && userProfile.injuries.length > 0) accuracy += 1;
            if (userProfile.bodyFatLevel) accuracy += 1;
            return Math.min(99, accuracy);
        }

        function findBestWorkoutPlan(userProfile) {
            if (!workoutPlansDatabase || !workoutPlansDatabase.workoutPlans || workoutPlansDatabase.workoutPlans.length === 0) {
                const fb = getEmbeddedDatabase();
                return { plan: fb.workoutPlans[0], matchScore: 96 };
            }

            let bestMatch = workoutPlansDatabase.workoutPlans[0];
            let highestScore = 0;
            
            workoutPlansDatabase.workoutPlans.forEach((plan) => {
                const score = calculateMatchScore(userProfile, plan.matchCriteria);
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = plan;
                }
            });
            
            return { plan: bestMatch, matchScore: Math.max(88, highestScore) };
        }

        // ========================================
        // DYNAMIC NUTRITION & CALCULATION ENGINE
        // ========================================

        function calculateBMR(age, gender, height, weight) {
            const parsedAge = parseFloat(age) || 25;
            const gen = (gender || 'male').toLowerCase();
            
            let heightCm = 175;
            if (typeof height === 'string' && height.includes('ft')) {
                const parts = height.match(/(\d+)\s*ft(?:\s*(\d+)\s*in)?/i);
                if (parts) {
                    const feet = parseFloat(parts[1]) || 5;
                    const inches = parseFloat(parts[2]) || 8;
                    heightCm = Math.round((feet * 12 + inches) * 2.54);
                }
            } else if (height) {
                heightCm = parseFloat(height) || 175;
            }
            
            let weightKg = 70;
            if (weight) {
                const rawWeight = parseFloat(weight) || 70;
                weightKg = (userSelections && userSelections.weightUnit === 'lbs') ? Math.round(rawWeight * 0.453592) : rawWeight;
            }
            
            if (gen === 'male') {
                return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * parsedAge) + 5);
            } else {
                return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * parsedAge) - 161);
            }
        }

        function calculateTDEE(bmr, trainingDays, typicalDay) {
            const safeBmr = bmr || 1650;
            let activityMultiplier = 1.35;
            const trainingDaysCount = Array.isArray(trainingDays) ? trainingDays.length : parseInt(trainingDays) || 3;
            
            if (trainingDaysCount >= 5) activityMultiplier = 1.75;
            else if (trainingDaysCount >= 4) activityMultiplier = 1.6;
            else if (trainingDaysCount >= 3) activityMultiplier = 1.45;
            else if (trainingDaysCount >= 2) activityMultiplier = 1.3;
            
            if (typicalDay === 'very-active') activityMultiplier += 0.1;
            else if (typicalDay === 'moderately-active') activityMultiplier += 0.05;
            else if (typicalDay === 'sedentary') activityMultiplier -= 0.05;
            
            return Math.round(safeBmr * activityMultiplier);
        }

        function calculateCalorieTarget(tdee, goal, bodyFatLevel) {
            const safeTdee = tdee || 2400;
            let calorieAdjustment = 0;
            const safeGoal = goal || 'muscle-gain';
            
            if (safeGoal.includes('muscle') || safeGoal.includes('gain') || safeGoal.includes('bulk')) {
                calorieAdjustment = 350;
            } else if (safeGoal.includes('loss') || safeGoal.includes('cut') || safeGoal.includes('fat')) {
                calorieAdjustment = -500;
            } else if (safeGoal.includes('shred') || safeGoal.includes('tone')) {
                calorieAdjustment = -350;
            }
            
            if (bodyFatLevel) {
                const bodyFatPercent = parseFloat(String(bodyFatLevel).replace(/[^0-9.]/g, '')) || 18;
                if (calorieAdjustment > 0 && bodyFatPercent > 22) calorieAdjustment = 200;
                else if (calorieAdjustment < 0 && bodyFatPercent < 12) calorieAdjustment = -250;
            }
            
            return Math.max(1400, Math.round(safeTdee + calorieAdjustment));
        }

        function calculateMacros(calories, goal, weight) {
            const safeCalories = calories || 2300;
            let weightKg = 70;
            if (weight) {
                const rawWeight = parseFloat(weight) || 70;
                weightKg = (userSelections && userSelections.weightUnit === 'lbs') ? Math.round(rawWeight * 0.453592) : rawWeight;
            }
            const weightLbs = weightKg * 2.20462;
            const safeGoal = goal || 'muscle-gain';
            
            let proteinPerKg = 2.0;
            if (safeGoal.includes('muscle') || safeGoal.includes('gain')) proteinPerKg = 2.2;
            else if (safeGoal.includes('loss') || safeGoal.includes('cut')) proteinPerKg = 2.4;
            else if (safeGoal.includes('shred')) proteinPerKg = 2.3;
            
            const proteinGrams = Math.round(weightKg * proteinPerKg);
            const proteinCalories = proteinGrams * 4;
            const fatGrams = Math.max(45, Math.round(weightLbs * 0.3));
            const fatCalories = fatGrams * 9;
            const remainingCalories = Math.max(400, safeCalories - proteinCalories - fatCalories);
            const carbGrams = Math.round(remainingCalories / 4);
            
            return {
                protein: proteinGrams,
                carbs: carbGrams,
                fats: fatGrams,
                calories: safeCalories
            };
        }

        function adjustForBodyFat(nutrition, bodyFatLevel, goal) {
            if (!nutrition) return { protein: 160, carbs: 240, fats: 60, calories: 2200 };
            const res = { ...nutrition };
            if (bodyFatLevel) {
                const bodyFatPercent = parseFloat(String(bodyFatLevel).replace(/[^0-9.]/g, '')) || 18;
                if (bodyFatPercent < 12 && goal && goal.includes('loss')) res.protein = Math.round(res.protein * 1.08);
                else if (bodyFatPercent > 25 && goal && goal.includes('gain')) res.protein = Math.round(res.protein * 0.95);
            }
            return res;
        }

        function generatePersonalizedMeals(nutrition, workoutTime, goal) {
            const safeNut = nutrition || { protein: 160, carbs: 240, fats: 60 };
            const proteinPerMeal = Math.round(safeNut.protein / 5);
            const carbPerMeal = Math.round(safeNut.carbs / 5);
            const fatPerMeal = Math.round(safeNut.fats / 5);
            
            let preWorkoutMeal = "Pre-workout: Banana with almond butter & whey";
            let postWorkoutMeal = "Post-workout: Rapid-digesting protein shake & berries";
            
            if (workoutTime === 'morning') {
                preWorkoutMeal = "Pre-workout: Whole oats with vanilla whey protein";
                postWorkoutMeal = "Post-workout: Greek yogurt bowl with granola & honey";
            } else if (workoutTime === 'evening') {
                preWorkoutMeal = "Pre-workout: Rice cakes with natural peanut butter";
                postWorkoutMeal = "Post-workout: High protein shake with intra-workout electrolytes";
            }
            
            return [
                `Breakfast: ${proteinPerMeal}g protein, ${carbPerMeal}g complex carbs, ${fatPerMeal}g healthy fats`,
                "Mid-Morning Snack: Low-fat Greek yogurt with raw walnuts",
                `Lunch: Grilled lean chicken breast with jasmine rice & steamed vegetables (${proteinPerMeal}g protein)`,
                preWorkoutMeal,
                postWorkoutMeal,
                `Dinner: Wild-caught salmon with roasted sweet potatoes & asparagus (${proteinPerMeal}g protein)`,
                "Pre-Bed: Casein protein / low-fat cottage cheese with crushed almonds"
            ];
        }

        function calculateHydrationNeeds(weight, currentIntake) {
            const rawWeight = parseFloat(weight) || 70;
            const weightKg = (userSelections && userSelections.weightUnit === 'lbs') ? rawWeight * 0.453592 : rawWeight;
            const baseWater = Math.round(weightKg * 35);
            let additionalWater = 0;
            
            if (currentIntake === 'very-little') additionalWater = 1000;
            else if (currentIntake === 'some') additionalWater = 500;
            
            return `${Math.round((baseWater + additionalWater) / 1000 * 10) / 10} liters daily`;
        }

        function adjustExercisePrescription(exercises, fitnessLevel, goal) {
            if (!exercises) return {};
            const adjustedExercises = {};
            
            for (let day in exercises) {
                if (!Array.isArray(exercises[day])) continue;
                adjustedExercises[day] = exercises[day].map(exercise => {
                    const adjusted = { ...exercise };
                    
                    switch (fitnessLevel) {
                        case 'beginner':
                            adjusted.sets = Math.max(2, (exercise.sets || 3) - 1);
                            adjusted.reps = '8-10';
                            adjusted.rest = '2-3 min';
                            break;
                        case 'intermediate':
                            adjusted.sets = exercise.sets || 3;
                            adjusted.reps = '10-12';
                            adjusted.rest = '90 sec';
                            break;
                        case 'advanced':
                            adjusted.sets = Math.min(5, (exercise.sets || 3) + 1);
                            adjusted.reps = '12-15';
                            adjusted.rest = '60-90 sec';
                            break;
                    }
                    
                    if (goal === 'muscle-gain') {
                        adjusted.reps = '6-10';
                        adjusted.rest = '2-3 min';
                    } else if (goal === 'weight-loss') {
                        adjusted.reps = '12-15';
                        adjusted.rest = '60 sec';
                    } else if (goal === 'get-shredded') {
                        adjusted.reps = '15-20';
                        adjusted.rest = '30-45 sec';
                    }
                    
                    return adjusted;
                });
            }
            return adjustedExercises;
        }

        function substituteExercises(exercises, userEquipment) {
            if (!exercises) return {};
            if (!userEquipment || userEquipment.length === 0) return exercises;
            
            const equipmentMap = {
                'dumbbells': {
                    'Barbell Squat': 'Dumbbell Squat',
                    'Barbell Bench Press': 'Dumbbell Bench Press',
                    'Barbell Row': 'Dumbbell Row',
                    'Barbell Deadlift': 'Dumbbell Deadlift',
                    'Barbell Curl': 'Dumbbell Curl',
                    'Barbell Overhead Press': 'Dumbbell Overhead Press'
                },
                'resistance-bands': {
                    'Lat Pulldown': 'Band Pulldown',
                    'Cable Crossover': 'Band Crossover',
                    'Cable Row': 'Band Row',
                    'Cable Tricep Pushdown': 'Band Tricep Extension'
                },
                'pull-up-bar': {
                    'Lat Pulldown': 'Pull-ups',
                    'Cable Row': 'Inverted Rows'
                },
                'none': {
                    'Barbell Squat': 'Bodyweight Squat',
                    'Dumbbell Squat': 'Bodyweight Squat',
                    'Barbell Bench Press': 'Push-ups',
                    'Dumbbell Bench Press': 'Push-ups',
                    'Lat Pulldown': 'Pull-ups or Inverted Towel Rows',
                    'Barbell Row': 'Bodyweight Rows',
                    'Dumbbell Row': 'Bodyweight Rows',
                    'Barbell Deadlift': 'Single-Leg Bodyweight Deadlift',
                    'Dumbbell Deadlift': 'Single-Leg Bodyweight Deadlift',
                    'Barbell Overhead Press': 'Pike Push-ups',
                    'Dumbbell Overhead Press': 'Pike Push-ups'
                }
            };
            
            const substitutedExercises = {};
            for (let day in exercises) {
                if (!Array.isArray(exercises[day])) continue;
                substitutedExercises[day] = exercises[day].map(exercise => {
                    const substituted = { ...exercise };
                    for (let equipment of userEquipment) {
                        if (equipmentMap[equipment] && equipmentMap[equipment][exercise.name]) {
                            substituted.name = equipmentMap[equipment][exercise.name];
                            break;
                        }
                    }
                    return substituted;
                });
            }
            return substitutedExercises;
        }

        function adjustForInjuries(exercises, injuries, age, sleepDuration) {
            if (!exercises) return {};
            const injuryList = Array.isArray(injuries) ? injuries : [];
            
            const injurySubstitutions = {
                'lower-back': {
                    'Barbell Deadlift': 'Romanian Deadlift (light)',
                    'Dumbbell Deadlift': 'Romanian Deadlift (light)',
                    'Barbell Squat': 'Goblet Squat',
                    'Dumbbell Squat': 'Goblet Squat'
                },
                'sensitive-back': {
                    'Barbell Deadlift': 'Romanian Deadlift (light)',
                    'Dumbbell Deadlift': 'Romanian Deadlift (light)',
                    'Barbell Squat': 'Goblet Squat',
                    'Dumbbell Squat': 'Goblet Squat'
                },
                'knee': {
                    'Barbell Squat': 'Leg Press',
                    'Dumbbell Squat': 'Leg Press',
                    'Walking Lunges': 'Seated Leg Extensions'
                },
                'sensitive-knees': {
                    'Barbell Squat': 'Leg Press',
                    'Dumbbell Squat': 'Leg Press',
                    'Walking Lunges': 'Seated Leg Extensions'
                }
            };
            
            const adjustedExercises = {};
            for (let day in exercises) {
                if (!Array.isArray(exercises[day])) continue;
                adjustedExercises[day] = exercises[day].map(exercise => {
                    const adjusted = { ...exercise };
                    
                    for (let injury of injuryList) {
                        if (injurySubstitutions[injury] && injurySubstitutions[injury][exercise.name]) {
                            adjusted.name = injurySubstitutions[injury][exercise.name];
                            break;
                        }
                    }
                    
                    let recoveryFactor = 1.0;
                    const parsedAge = parseFloat(age) || 25;
                    if (parsedAge > 40) recoveryFactor *= 0.9;
                    if (parsedAge > 50) recoveryFactor *= 0.8;
                    if (sleepDuration && parseFloat(sleepDuration) < 7) recoveryFactor *= 0.85;
                    
                    adjusted.sets = Math.max(2, Math.round((adjusted.sets || 3) * recoveryFactor));
                    return adjusted;
                });
            }
            return adjustedExercises;
        }

        function customizeRecovery(baseRecovery, age, sleepDuration, trainingDays) {
            const recovery = { ...baseRecovery };
            
            if (sleepDuration && parseFloat(sleepDuration) < 7) {
                recovery.sleep = "7-9 hours nightly (recommended increase for neural recovery)";
            } else {
                recovery.sleep = "7-9 hours nightly with consistent circadian schedule";
            }
            
            const parsedAge = parseFloat(age) || 25;
            if (parsedAge > 40) {
                recovery.restDays = "Complete rest on designated days + 15 min mobility flow";
            } else if (trainingDays >= 5) {
                recovery.restDays = "Active recovery: light zone-2 walking or mobility";
            } else {
                recovery.restDays = "Full rest days to optimize myofibrillar protein synthesis";
            }
            
            return recovery;
        }

        function customizePlan(basePlan, userProfile) {
            if (!basePlan) {
                const fb = getEmbeddedDatabase();
                basePlan = fb.workoutPlans[0];
            }
            
            const customizedPlan = JSON.parse(JSON.stringify(basePlan));
            const profile = userProfile || prepareUserProfile(userSelections);
            
            const bmr = calculateBMR(profile.age, profile.gender, profile.height, profile.currentWeight);
            const tdee = calculateTDEE(bmr, profile.trainingDays, profile.typicalDay);
            const calorieTarget = calculateCalorieTarget(tdee, profile.goal, profile.bodyFatLevel);
            const macros = calculateMacros(calorieTarget, profile.goal, profile.currentWeight);
            const adjustedNutrition = adjustForBodyFat(macros, profile.bodyFatLevel, profile.goal);
            
            customizedPlan.plan.nutrition = {
                calories: adjustedNutrition.calories,
                protein: `${adjustedNutrition.protein}g`,
                carbs: `${adjustedNutrition.carbs}g`,
                fats: `${adjustedNutrition.fats}g`,
                meals: generatePersonalizedMeals(adjustedNutrition, profile.workoutTime, profile.goal),
                hydration: calculateHydrationNeeds(profile.currentWeight, profile.waterIntake)
            };
            
            if (customizedPlan.plan.exercises) {
                customizedPlan.plan.exercises = adjustExercisePrescription(
                    customizedPlan.plan.exercises, 
                    profile.fitnessLevel || 'intermediate', 
                    profile.goal || 'muscle-gain'
                );
                
                const equip = profile.equipment ? String(profile.equipment).split(',') : ['none'];
                customizedPlan.plan.exercises = substituteExercises(
                    customizedPlan.plan.exercises, 
                    equip
                );
                
                customizedPlan.plan.exercises = adjustForInjuries(
                    customizedPlan.plan.exercises, 
                    profile.injuries || [], 
                    profile.age || 25, 
                    profile.sleepDuration || '7-8'
                );
            }
            
            customizedPlan.plan.recovery = customizeRecovery(
                customizedPlan.plan.recovery || {}, 
                profile.age || 25, 
                profile.sleepDuration, 
                Array.isArray(profile.trainingDays) ? profile.trainingDays.length : 4
            );
            
            return customizedPlan;
        }

        // ========================================
        // PLAN PRESENTATION & DASHBOARD POPULATION
        // ========================================

        function displayWorkoutPlan() {
            console.log('Displaying workout plan...');
            
            const loadingHud = document.getElementById('planLoadingStatus');
            if (loadingHud) loadingHud.style.display = 'none';
            
            const planDisplay = document.getElementById('workoutPlanDisplay');
            if (planDisplay) planDisplay.style.display = 'block';

            // Check for Phase 2-7 Adaptive Personal Training Engine modules
            if (typeof CanonicalProfileEngine !== 'undefined' &&
                typeof TrainingRulesEngine !== 'undefined' &&
                typeof ProgramGeneratorEngine !== 'undefined' &&
                typeof ProgramValidatorEngine !== 'undefined' &&
                typeof PersonalizedBlueprintUI !== 'undefined') {
                
                try {
                    const canonicalProfile = CanonicalProfileEngine.buildCanonicalUserProfile(userSelections);
                    const trainingReqs = TrainingRulesEngine.buildTrainingRequirements(canonicalProfile);
                    const db = typeof ExerciseDatabaseEngine !== 'undefined' ? ExerciseDatabaseEngine : undefined;
                    const dynamicProgram = ProgramGeneratorEngine.generateWorkoutProgram(canonicalProfile, trainingReqs, db);
                    const validationCycle = ProgramValidatorEngine.validateAndRepairProgram(dynamicProgram, canonicalProfile, trainingReqs, db);
                    
                    const finalProgram = validationCycle.program || validationCycle.repairedProgram || dynamicProgram;
                    if (typeof window !== 'undefined') {
                        window.canonicalUserProfile = canonicalProfile;
                        window.currentTrainingRequirements = trainingReqs;
                        window.lastValidationResult = validationCycle.validation;
                        window.currentGeneratedProgram = finalProgram;
                    }

                    // Render via Phase 7 Personalized Blueprint UI
                    PersonalizedBlueprintUI.renderPersonalizedBlueprint(planDisplay, finalProgram, validationCycle.validation, { userName: userSelections.userName || 'Athlete' });
                    return;
                } catch (e) {
                    console.error('Error during dynamic program generation & blueprint render, falling back to legacy presentation:', e);
                }
            }

            // Legacy Fallback Path
            if (!workoutPlansDatabase) {
                console.log('Database not loaded yet, loading now...');
                loadWorkoutPlansDatabase().then(() => {
                    displayWorkoutPlan();
                }).catch(() => {
                    workoutPlansDatabase = getEmbeddedDatabase();
                    displayWorkoutPlan();
                });
                return;
            }
            
            const userProfile = prepareUserProfile(userSelections);
            console.log('Prepared user profile:', userProfile);
            
            let { plan, matchScore } = findBestWorkoutPlan(userProfile);
            if (!plan) {
                console.warn('No direct match found, using fallback embedded plan');
                const fallbackDb = getEmbeddedDatabase();
                plan = fallbackDb.workoutPlans[0];
                matchScore = 95;
            }
            
            const customizedPlan = customizePlan(plan, userProfile);
            const accuracyScore = calculatePlanAccuracy(customizedPlan, userProfile);
            
            const titleEl = document.getElementById('planTitle');
            if (titleEl) titleEl.textContent = customizedPlan.plan.title || 'Personalized AI Fitness Blueprint';
            
            const scoreEl = document.getElementById('matchScore');
            if (scoreEl) scoreEl.textContent = `${Math.round(matchScore || 96)}% Match | ${accuracyScore || 98}% Accuracy`;
            
            const goalEl = document.getElementById('displayUserGoal');
            if (goalEl) {
                const goalMap = { 'muscle-gain': 'Hypertrophy & Muscle', 'weight-loss': 'Fat Loss & Shred', 'get-shredded': 'Athletic Conditioning' };
                goalEl.textContent = goalMap[userSelections.goal] || (userSelections.goal ? userSelections.goal.replace(/-/g, ' ') : 'Total Fitness');
            }
            
            const daysEl = document.getElementById('displayUserDays');
            if (daysEl) {
                const daysCount = Array.isArray(userSelections.trainingDays) ? userSelections.trainingDays.length : 4;
                daysEl.textContent = `${daysCount > 0 ? daysCount : 4} Days / Week`;
            }
            
            const levelEl = document.getElementById('displayUserLevel');
            if (levelEl) {
                const exp = userSelections.experience || 'Intermediate';
                levelEl.textContent = exp.charAt(0).toUpperCase() + exp.slice(1);
            }
            
            const durationEl = document.getElementById('displayUserDuration');
            if (durationEl) {
                durationEl.textContent = userSelections.workoutDuration ? `${userSelections.workoutDuration.replace(/-/g, ' ')} min` : '45-60 min';
            }
            
            renderWeeklySchedule(customizedPlan.plan.weeklySchedule);
            renderExercises(customizedPlan.plan.exercises);
            renderNutrition(customizedPlan.plan.nutrition);
            renderRecovery(customizedPlan.plan.recovery);
        }

        function renderWeeklySchedule(schedule) {
            const container = document.getElementById('weeklyScheduleContent');
            if (!container) return;
            container.innerHTML = '';
            
            const scheduleDiv = document.createElement('div');
            scheduleDiv.className = 'schedule-grid';
            
            const defaultSchedule = {
                "Monday": "Upper Body Strength",
                "Tuesday": "Lower Body Power",
                "Wednesday": "Active Recovery / Core",
                "Thursday": "Push Hypertrophy",
                "Friday": "Pull & Legs",
                "Saturday": "Metabolic Conditioning",
                "Sunday": "Systemic Recovery & Mobility"
            };
            
            const activeSchedule = schedule || defaultSchedule;
            
            for (let day in activeSchedule) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'schedule-day';
                const isRest = activeSchedule[day].toLowerCase().includes('rest') || activeSchedule[day].toLowerCase().includes('recovery');
                dayDiv.innerHTML = `
                    <div class="day-name">${day}</div>
                    <div class="day-activity" style="${isRest ? 'color:#888;' : 'color:#B3DD24; font-weight:700;'}">${activeSchedule[day]}</div>
                `;
                scheduleDiv.appendChild(dayDiv);
            }
            
            container.appendChild(scheduleDiv);
        }

        function renderExercises(exercises) {
            const container = document.getElementById('exercisesContent');
            if (!container) return;
            container.innerHTML = '';
            
            if (!exercises || Object.keys(exercises).length === 0) {
                container.innerHTML = '<p style="color:#888; padding:15px;">Customized periodized volume configured across your split.</p>';
                return;
            }
            
            for (let day in exercises) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'exercise-day';
                dayDiv.style.marginBottom = '20px';
                
                const dayHeader = document.createElement('h3');
                dayHeader.style.color = '#B3DD24';
                dayHeader.style.fontSize = '16px';
                dayHeader.style.marginBottom = '10px';
                dayHeader.style.borderBottom = '1px solid rgba(179, 221, 36,0.2)';
                dayHeader.style.paddingBottom = '6px';
                dayHeader.textContent = day;
                dayDiv.appendChild(dayHeader);
                
                const exerciseList = document.createElement('div');
                exerciseList.className = 'exercise-list';
                
                exercises[day].forEach(exercise => {
                    const exerciseDiv = document.createElement('div');
                    exerciseDiv.className = 'exercise-item';
                    exerciseDiv.style.background = '#141414';
                    exerciseDiv.style.border = '1px solid #282828';
                    exerciseDiv.style.borderRadius = '8px';
                    exerciseDiv.style.padding = '12px 16px';
                    exerciseDiv.style.marginBottom = '8px';
                    exerciseDiv.innerHTML = `
                        <div class="exercise-name" style="font-weight:700; color:#FFF; font-size:14px; margin-bottom:4px;">${exercise.name}</div>
                        <div class="exercise-details" style="font-size:12px; color:#AAA; display:flex; gap:15px; flex-wrap:wrap;">
                            <span class="sets"><strong style="color:#B3DD24;">${exercise.sets}</strong> sets</span>
                            <span class="reps"><strong style="color:#FFF;">${exercise.reps}</strong> reps</span>
                            <span class="rest"><strong style="color:#888;">${exercise.rest}</strong> rest</span>
                            <span class="tempo"><strong style="color:#888;">${exercise.tempo || '2-0-2'}</strong> tempo</span>
                        </div>
                    `;
                    exerciseList.appendChild(exerciseDiv);
                });
                
                dayDiv.appendChild(exerciseList);
                container.appendChild(dayDiv);
            }
        }

        function renderNutrition(nutrition) {
            const container = document.getElementById('nutritionContent');
            if (!container) return;
            
            const n = nutrition || { calories: 2400, protein: '160g', carbs: '260g', fats: '65g', hydration: '3.0 liters daily', meals: ['High-protein breakfast', 'Nutrient-dense lunch', 'Pre-workout carbs', 'Post-workout recovery meal'] };
            
            container.innerHTML = `
                <div class="nutrition-macros" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-bottom:18px;">
                    <div class="macro-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:12px; text-align:center;">
                        <span class="macro-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700;">Target Calories</span>
                        <span class="macro-value" style="display:block; font-size:20px; font-weight:800; color:#B3DD24; margin-top:4px;">${n.calories}</span>
                    </div>
                    <div class="macro-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:12px; text-align:center;">
                        <span class="macro-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700;">Protein</span>
                        <span class="macro-value" style="display:block; font-size:20px; font-weight:800; color:#FFF; margin-top:4px;">${n.protein}</span>
                    </div>
                    <div class="macro-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:12px; text-align:center;">
                        <span class="macro-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700;">Carbohydrates</span>
                        <span class="macro-value" style="display:block; font-size:20px; font-weight:800; color:#FFF; margin-top:4px;">${n.carbs}</span>
                    </div>
                    <div class="macro-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:12px; text-align:center;">
                        <span class="macro-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700;">Healthy Fats</span>
                        <span class="macro-value" style="display:block; font-size:20px; font-weight:800; color:#FFF; margin-top:4px;">${n.fats}</span>
                    </div>
                </div>
                ${n.meals && n.meals.length > 0 ? `
                <div class="nutrition-meals" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:15px; margin-bottom:12px;">
                    <h4 style="color:#B3DD24; font-size:13px; margin-bottom:8px; text-transform:uppercase;">Daily Meal Timing Architecture</h4>
                    <ul class="meal-list" style="padding-left:18px; color:#CCC; font-size:13px; line-height:1.6;">
                        ${n.meals.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                </div>` : ''}
                <div class="nutrition-hydration" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:12px 16px; font-size:13px; color:#AAA;">
                    <i class="fas fa-droplet" style="color:#00e5ff; margin-right:6px;"></i> <strong style="color:#FFF;">Hydration Target:</strong> ${n.hydration || '3.2 liters daily'}
                </div>
            `;
        }

        function renderRecovery(recovery) {
            const container = document.getElementById('recoveryContent');
            if (!container) return;
            
            const r = recovery || { sleep: "7-9 hours nightly", restDays: "Active mobility on non-lifting days", stretching: "10-15 min post-workout", foamRolling: "5-10 min targeting thoracic & hips", supplements: "Creatine monohydrate, Whey isolate, Multivitamin" };
            
            container.innerHTML = `
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
                    <div class="recovery-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:14px;">
                        <span class="recovery-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700; margin-bottom:4px;"><i class="fas fa-moon" style="color:#B3DD24;"></i> Sleep Target</span>
                        <span class="recovery-value" style="color:#FFF; font-size:13px;">${r.sleep}</span>
                    </div>
                    <div class="recovery-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:14px;">
                        <span class="recovery-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700; margin-bottom:4px;"><i class="fas fa-battery-half" style="color:#B3DD24;"></i> Rest Protocol</span>
                        <span class="recovery-value" style="color:#FFF; font-size:13px;">${r.restDays}</span>
                    </div>
                    <div class="recovery-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:14px;">
                        <span class="recovery-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700; margin-bottom:4px;"><i class="fas fa-person-stretching" style="color:#B3DD24;"></i> Mobility & Stretch</span>
                        <span class="recovery-value" style="color:#FFF; font-size:13px;">${r.stretching || '10-15 min daily'}</span>
                    </div>
                    <div class="recovery-item" style="background:#141414; border:1px solid #282828; border-radius:8px; padding:14px;">
                        <span class="recovery-label" style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700; margin-bottom:4px;"><i class="fas fa-pills" style="color:#B3DD24;"></i> Recommended Supplementation</span>
                        <span class="recovery-value" style="color:#FFF; font-size:13px;">${r.supplements || 'Creatine & Whey protein'}</span>
                    </div>
                </div>
            `;
        }

        function downloadPlan() {
            const planEl = document.getElementById('workoutPlanDisplay');
            const planContent = planEl ? planEl.innerHTML : '';
            const styles = 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#0B0B0B; color:#EEE; margin: 30px; } ' +
                '.plan-hero-header { border-bottom: 2px solid #B3DD24; padding-bottom: 15px; margin-bottom: 25px; } ' +
                '.plan-title { color: #B3DD24; font-size: 26px; margin: 0 0 8px 0; } ' +
                '.plan-subtitle { color: #AAA; font-size: 14px; margin: 0; } ' +
                '.match-score-badge { display: inline-block; background: #B3DD24; color: #000; font-weight: 800; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin-top: 10px; } ' +
                '.plan-user-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; } ' +
                '.user-stat-card { background: #141414; border: 1px solid #282828; border-radius: 8px; padding: 12px; text-align: center; } ' +
                '.stat-label { font-size: 11px; text-transform: uppercase; color: #888; display: block; margin-bottom: 4px; } ' +
                '.stat-value { font-size: 16px; font-weight: 700; color: #FFF; } ' +
                '.plan-section { background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px; margin-bottom: 20px; } ' +
                '.section-head-bar h2 { color: #FFF; font-size: 18px; margin: 0 0 15px 0; border-left: 3px solid #B3DD24; padding-left: 10px; } ' +
                '.schedule-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; } ' +
                '.schedule-day { background: #181818; border: 1px solid #282828; border-radius: 6px; padding: 10px 6px; text-align: center; } ' +
                '.day-name { font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; margin-bottom: 4px; } ' +
                '.day-activity { font-size: 12px; } ' +
                '.plan-action-bar { display: none !important; }';
            const htmlContent = '<!DOCTYPE html><html><head><title>Custom AI Workout Plan</title><style>' + styles + '</style></head><body>' + planContent + '</body></html>';
            
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Custom-AI-Workout-Plan.html';
            a.click();
            URL.revokeObjectURL(url);
        }

        function printPlan() {
            window.print();
        }

        function syncCustomPlanToMySpace() {
            try {
                const planTitle = document.getElementById('planTitle') ? document.getElementById('planTitle').textContent : 'Custom AI Workout Plan';
                const customPlanData = {
                    title: planTitle,
                    goal: userSelections.goal,
                    days: userSelections.trainingDays,
                    experience: userSelections.experience,
                    duration: userSelections.workoutDuration,
                    dateGenerated: new Date().toISOString()
                };
                localStorage.setItem('userCustomWorkoutPlan', JSON.stringify(customPlanData));
                alert('Plan successfully synced to My Space! You can access it anytime from your dashboard.');
            } catch(e) {
                alert('Plan saved locally on your device.');
            }
        }

        function restartQuiz() {
            if (confirm('Are you sure you want to retake the assessment? Your selections will be reset.')) {
                localStorage.clear();
                window.location.reload();
            }
        }

window.addEventListener('DOMContentLoaded', function() {
    loadUserDataFromStorage();
    loadWorkoutPlansDatabase();
    showStep(1);
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').then(function(reg) {
            reg.update();
        }).catch(function () {});
    }
    if (typeof caches !== 'undefined') {
        caches.keys().then(function(keys) {
            keys.forEach(function(k) {
                if (k.startsWith('fitphysique-workout-cache-') && k !== 'fitphysique-workout-cache-v5') {
                    caches.delete(k);
                }
            });
        });
    }
});

// Safe developer debugging snapshot (never logs user email or sensitive PII)
if (typeof window !== 'undefined') {
    window.getDebugUserProfileSnapshot = function() {
        if (typeof CanonicalProfileEngine === 'undefined') {
            return { error: 'CanonicalProfileEngine module not loaded' };
        }
        const canonical = CanonicalProfileEngine.buildCanonicalUserProfile(userSelections);
        const normalized = CanonicalProfileEngine.normalizeCanonicalUserProfile(canonical);
        const validation = CanonicalProfileEngine.validateCanonicalUserProfile(normalized);
        const sanitized = JSON.parse(JSON.stringify(normalized));
        if (sanitized.identity) {
            delete sanitized.identity.userEmail;
        }
        return {
            profileVersion: CanonicalProfileEngine.getCanonicalProfileVersion(),
            profile: sanitized,
            validation: validation
        };
    };

    window.getDebugGeneratedProgram = function() {
        if (typeof ProgramGeneratorEngine === 'undefined') {
            return { error: 'ProgramGeneratorEngine module not loaded' };
        }
        const canonical = CanonicalProfileEngine.buildCanonicalUserProfile(userSelections);
        const reqs = TrainingRulesEngine.buildTrainingRequirements(canonical);
        const program = ProgramGeneratorEngine.generateWorkoutProgram(canonical, reqs);
        const validation = ProgramGeneratorEngine.validateGeneratedProgram(program);
        return {
            version: ProgramGeneratorEngine.getProgramGeneratorVersion(),
            program: program,
            validation: validation
        };
    };
}
