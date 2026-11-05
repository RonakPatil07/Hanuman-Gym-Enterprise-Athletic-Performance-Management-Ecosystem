// ==========================================================================
// HANUMAN GYM - UNIFIED ATHLETE DASHBOARD & SUPABASE CLOUD SYSTEM
// Complete ecosystem sync: Supabase Cloud + MySQL Database + Local Storage
// ==========================================================================

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // 1. Synchronously apply cached user identity to avoid any visual flicker
        let cached = window.GymApiClient ? GymApiClient.getUser() : null;
        if (cached && cached.name && cached.name !== 'Athlete') {
            window.userData = {
                profile: {
                    name: cached.name,
                    email: cached.email,
                    phone: cached.phone || '',
                    address: cached.address || '',
                    currentWeight: cached.current_weight ?? cached.currentWeight ?? null,
                    targetWeight: cached.target_weight ?? cached.targetWeight ?? null,
                    waterGoal: cached.water_goal ?? cached.waterGoal ?? 2.5,
                    calorieGoal: cached.calorie_goal ?? cached.calorieGoal ?? 2200,
                    workoutDays: cached.workout_days ?? cached.workoutDays ?? 3,
                    fitnessGoal: cached.fitness_goal ?? cached.fitnessGoal ?? 'muscle-gain'
                }
            };
            this.currentUser = this.initializeUserFromPHP();
            this.loadUserData();
        }

        // 2. Client-Side JWT / Session Auth Verification & Demo Mode Check
        const isDemo = sessionStorage.getItem('gym_demo_mode') === 'true';
        let isAuthenticated = isDemo || (window.GymApiClient && GymApiClient.isAuthenticated());

        // 3. Fetch latest live profile from FastAPI JWT Auth OR Demo Mode
        try {
            let profileData = null;

            if (isDemo) {
                profileData = {
                    name: 'Vikram Malhotra',
                    email: 'vikram.demo@hanumangym.com',
                    phone: '+91 98765 43210',
                    address: 'Kalyan West, Mumbai',
                    current_weight: 78.5,
                    target_weight: 82.0,
                    water_goal: 3.0,
                    calorie_goal: 2600,
                    workout_days: 5,
                    fitness_goal: 'muscle-gain'
                };
                isAuthenticated = true;
            } else if (window.GymApiClient && GymApiClient.isAuthenticated()) {
                try {
                    const meRes = await GymApiClient.getMe();
                    if (meRes && meRes.authenticated && meRes.user) {
                        profileData = meRes.user;
                        isAuthenticated = true;
                    }
                } catch (err) {
                    console.warn('[Dashboard] getMe network check:', err.message);
                }
            }

            if (profileData && profileData.email) {
                window.userData = {
                    profile: {
                        name: profileData.name || 'Athlete',
                        email: profileData.email,
                        phone: profileData.phone || '',
                        address: profileData.address || '',
                        currentWeight: profileData.current_weight ?? profileData.currentWeight ?? null,
                        targetWeight: profileData.target_weight ?? profileData.targetWeight ?? null,
                        waterGoal: profileData.water_goal ?? profileData.waterGoal ?? 2.5,
                        calorieGoal: profileData.calorie_goal ?? profileData.calorieGoal ?? 2200,
                        workoutDays: profileData.workout_days ?? profileData.workoutDays ?? 3,
                        fitnessGoal: profileData.fitness_goal ?? profileData.fitnessGoal ?? 'muscle-gain'
                    }
                };
                this.currentUser = this.initializeUserFromPHP();
                this.loadUserData();
            } else if (!isAuthenticated && (!window.userData || !window.userData.profile || !window.userData.profile.email)) {
                window.location.href = 'index.html';
                return;
            }
        } catch (e) {
            console.error('[Dashboard Init Auth Error]', e);
            if (!isAuthenticated && (!window.userData || !window.userData.profile)) {
                window.location.href = 'index.html';
                return;
            }
        }

        // Initialize user object structure if not set
        if (!this.currentUser) {
            this.currentUser = this.initializeUserFromPHP();
        }
        this.userStorageKey = `userData_${this.currentUser.profile.email}`;

        // Immediate render of user profile
        this.loadUserData();

        // Pull latest state from Supabase Cloud
        await this.syncWithCloud();

        // Load SQL database records + merge with GymCloudStore records
        await this.loadUserActivityData();

        // Setup event listeners
        this.setupEventListeners();

        // Render all UI components
        this.loadUserData();
        this.renderMembershipsList();
        this.renderTrainersList();
        this.loadWorkoutHistory();
        this.loadPurchaseHistory();
        this.renderExerciseFeedbackList();
        this.updateCloudStatusIndicator();

        // Initialize charts
        setTimeout(() => {
            this.updateCharts();
        }, 150);

        // Real-time synchronization across browser tabs
        window.addEventListener("storage", (e) => {
            if (e.key === "gym_cloud_mgmt_v1") {
                this.refreshFromCloud();
            }
        });

        // Background Cloud Polling (every 30 seconds)
        setInterval(() => {
            if (window.GymCloudStore && typeof GymCloudStore.syncFromCloud === 'function') {
                GymCloudStore.syncFromCloud().then((hasChanges) => {
                    if (hasChanges) this.refreshFromCloud();
                }).catch(() => {});
            }
        }, 30000);

        console.log('My Space successfully connected to Supabase cloud storage.');
    }

    initializeUserFromPHP() {
        return {
            profile: window.userData.profile || {},
            workoutLogs: [],
            purchases: [],
            weightHistory: [{
                date: new Date().toISOString().split('T')[0],
                weight: window.userData.profile.currentWeight || 70
            }],
            waterHistory: [],
            calorieHistory: [],
            workoutHistory: [],
            exerciseHistory: []
        };
    }

    async syncWithCloud() {
        if (window.GymCloudStore && typeof GymCloudStore.syncFromCloud === 'function') {
            try {
                await GymCloudStore.syncFromCloud();
            } catch (e) {
                console.warn('Supabase sync skipped or offline:', e);
            }
        }
    }

    async refreshFromCloud() {
        await this.loadUserActivityData();
        this.renderMembershipsList();
        this.renderTrainersList();
        this.loadWorkoutHistory();
        this.loadPurchaseHistory();
        this.renderExerciseFeedbackList();
        this.updateCharts();
        this.updateCloudStatusIndicator();
    }

    async loadUserActivityData() {
        try {
            // 1. Fetch exclusively from FastAPI Backend
            let workoutsData = null;
            let purchasesData = null;

            if (window.GymApiClient) {
                const [wRes, pRes] = await Promise.all([
                    GymApiClient.getWorkouts().catch(err => {
                        console.warn('[FastAPI Workouts]', err.message);
                        return null;
                    }),
                    GymApiClient.getPurchases().catch(err => {
                        console.warn('[FastAPI Purchases]', err.message);
                        return null;
                    })
                ]);
                workoutsData = wRes;
                purchasesData = pRes;
            }

            if (workoutsData && workoutsData.success) {
                this.currentUser.workoutLogs = workoutsData.workouts || [];
            }

            let dbPurchases = [];
            if (purchasesData && purchasesData.success) {
                dbPurchases = purchasesData.purchases || [];
            }

            // 2. Ingest Store Orders, Subscriptions & Workouts from GymCloudStore (Supabase)
            const cloudStore = window.GymCloudStore ? GymCloudStore.getSnapshot() : this.getLocalSnapshot();
            const userEmail = (this.currentUser.profile.email || '').toLowerCase().trim();
            const userName = (this.currentUser.profile.name || '').toLowerCase().trim();

            const unifiedPurchases = [...dbPurchases];

            // Ingest Store Orders
            if (cloudStore && Array.isArray(cloudStore.storeOrders)) {
                cloudStore.storeOrders.forEach(order => {
                    const orderName = (order.customerName || '').toLowerCase().trim();
                    const orderEmail = (order.customerEmail || '').toLowerCase().trim();
                    
                    const isMatch = (!orderEmail && !orderName) || 
                                    (orderEmail && orderEmail === userEmail) || 
                                    (orderName && (orderName === userName || userName.includes(orderName)));

                    if (isMatch) {
                        const exists = unifiedPurchases.some(p => 
                            p.item_name === ('Store: ' + (order.productName || 'Fitness Gear')) ||
                            p.item_name === (order.productName || 'Store Order')
                        );
                        if (!exists) {
                            unifiedPurchases.push({
                                id: order.id || 'store_' + Math.random().toString(36).substr(2, 6),
                                item_name: 'Store: ' + (order.productName || 'Fitness Gear'),
                                item_price: parseFloat(order.amount || 0),
                                purchase_date: (order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
                                source: 'store'
                            });
                        }
                    }
                });
            }

            // Ingest Trainer Subscriptions & Membership Enrollments
            if (cloudStore && Array.isArray(cloudStore.trainerSubscriptions)) {
                cloudStore.trainerSubscriptions.forEach(sub => {
                    const subName = (sub.customerName || '').toLowerCase().trim();
                    const subEmail = (sub.customerEmail || '').toLowerCase().trim();
                    const isMatch = (!subEmail && !subName) || 
                                    (subEmail && subEmail === userEmail) || 
                                    (subName && (subName === userName || userName.includes(subName)));

                    if (isMatch) {
                        const title = sub.trainerName && sub.trainerName !== "Gym General Membership"
                            ? `Trainer: ${sub.trainerName} (${sub.planName || 'Plan'})`
                            : `Membership: ${sub.planName || 'Standard'} Plan`;

                        const exists = unifiedPurchases.some(p => 
                            p.item_name.includes(sub.planName || 'Plan') && 
                            Math.abs(parseFloat(p.item_price) - parseFloat(sub.amount)) < 0.01
                        );
                        if (!exists) {
                            unifiedPurchases.push({
                                id: sub.id || 'sub_' + Math.random().toString(36).substr(2, 6),
                                item_name: title,
                                item_price: parseFloat(sub.amount || 0),
                                purchase_date: (sub.createdAt ? sub.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
                                source: 'subscription'
                            });
                        }
                    }
                });
            }

            // Ingest Cloud Workout Sessions from Supabase
            if (cloudStore && Array.isArray(cloudStore.workoutSessions)) {
                cloudStore.workoutSessions.forEach(w => {
                    const wEmail = (w.customerEmail || w.email || '').toLowerCase().trim();
                    const isMatch = (!wEmail) || (wEmail && wEmail === userEmail);
                    if (isMatch) {
                        const exists = this.currentUser.workoutLogs.some(log => 
                            log.workout_date === w.workout_date && 
                            log.exercise_name === w.exercise_name &&
                            log.sets == w.sets
                        );
                        if (!exists) {
                            this.currentUser.workoutLogs.push({
                                id: w.id || 'cloud_w_' + Math.random().toString(36).substr(2, 6),
                                workout_date: w.workout_date,
                                exercise_name: w.exercise_name,
                                sets: w.sets,
                                reps: w.reps,
                                weight: w.weight,
                                water_intake: w.water_intake,
                                calories_consumed: w.calories_consumed
                            });
                        }
                    }
                });
            }

            // Ingest Demo Sample Activity if Demo Mode is active
            const isDemo = sessionStorage.getItem('gym_demo_mode') === 'true';
            if (isDemo && this.currentUser.workoutLogs.length === 0) {
                const today = new Date();
                const formatDate = (daysAgo) => {
                    const d = new Date(today);
                    d.setDate(d.getDate() - daysAgo);
                    return d.toISOString().split('T')[0];
                };

                this.currentUser.workoutLogs = [
                    { id: 'demo_1', workout_date: formatDate(0), exercise_name: 'Incline Bench Press', sets: 4, reps: 10, weight: 85, water_intake: 2.7, calories_consumed: 2450 },
                    { id: 'demo_2', workout_date: formatDate(1), exercise_name: 'Deadlifts', sets: 5, reps: 5, weight: 160, water_intake: 3.2, calories_consumed: 2700 },
                    { id: 'demo_3', workout_date: formatDate(2), exercise_name: 'Barbell Squat', sets: 4, reps: 8, weight: 125, water_intake: 2.8, calories_consumed: 2500 },
                    { id: 'demo_4', workout_date: formatDate(4), exercise_name: 'Pull-ups', sets: 4, reps: 12, weight: 78, water_intake: 2.5, calories_consumed: 2300 },
                    { id: 'demo_5', workout_date: formatDate(6), exercise_name: 'Overhead Press', sets: 4, reps: 8, weight: 65, water_intake: 2.6, calories_consumed: 2400 },
                    { id: 'demo_6', workout_date: formatDate(8), exercise_name: 'Flat Dumbbell Bench Press', sets: 4, reps: 10, weight: 36, water_intake: 2.9, calories_consumed: 2600 }
                ];

                if (unifiedPurchases.length === 0) {
                    unifiedPurchases.push(
                        { id: 'demo_p1', item_name: 'Membership: Standard All-Access (Kalyan 24/7)', item_price: 2499, purchase_date: formatDate(15), source: 'plan' },
                        { id: 'demo_p2', item_name: 'Store: Whey Isolate Protein (2kg)', item_price: 3299, purchase_date: formatDate(7), source: 'store' }
                    );
                }
            }

            // Sort purchases newest first
            unifiedPurchases.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
            this.currentUser.purchases = unifiedPurchases;

            // Generate history metrics from workouts
            this.generateHistoryFromWorkouts();

        } catch (e) {
            console.error('Error loading data:', e);
            this.loadFromLocalStorage();
        }
    }

    getLocalSnapshot() {
        try {
            const raw = localStorage.getItem('gym_cloud_mgmt_v1');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    loadFromLocalStorage() {
        try {
            const storedData = localStorage.getItem(this.userStorageKey);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.currentUser.workoutLogs = data.workoutLogs || [];
                this.currentUser.purchases = data.purchases || [];
            }
        } catch (e) {}
    }

    generateHistoryFromWorkouts() {
        this.currentUser.weightHistory = [];
        this.currentUser.waterHistory = [];
        this.currentUser.calorieHistory = [];
        this.currentUser.workoutHistory = [];
        this.currentUser.exerciseHistory = [];

        const historyMap = {};

        this.currentUser.workoutLogs.forEach(workout => {
            const date = workout.workout_date;
            if (!historyMap[date]) {
                historyMap[date] = {
                    weight: parseFloat(workout.weight) || 0,
                    waterIntake: parseFloat(workout.water_intake) || 0,
                    caloriesConsumed: parseInt(workout.calories_consumed) || 0,
                    workoutCount: 1,
                    exercises: []
                };
            } else {
                historyMap[date].weight = Math.max(historyMap[date].weight, parseFloat(workout.weight) || 0);
                historyMap[date].waterIntake = Math.max(historyMap[date].waterIntake, parseFloat(workout.water_intake) || 0);
                historyMap[date].caloriesConsumed = Math.max(historyMap[date].caloriesConsumed, parseInt(workout.calories_consumed) || 0);
                historyMap[date].workoutCount += 1;
            }

            historyMap[date].exercises.push({
                exerciseName: workout.exercise_name,
                sets: workout.sets,
                reps: workout.reps,
                weight: workout.weight,
                totalVolume: workout.sets * workout.reps * workout.weight
            });
        });

        // Add base current weight entry if no workouts yet
        if (Object.keys(historyMap).length === 0 && this.currentUser.profile.currentWeight) {
            const today = new Date().toISOString().split('T')[0];
            this.currentUser.weightHistory.push({
                date: today,
                weight: parseFloat(this.currentUser.profile.currentWeight)
            });
        }

        Object.keys(historyMap).forEach(date => {
            const data = historyMap[date];
            this.currentUser.weightHistory.push({ date, weight: data.weight });
            this.currentUser.waterHistory.push({ date, waterIntake: data.waterIntake });
            this.currentUser.calorieHistory.push({ date, caloriesConsumed: data.caloriesConsumed });
            this.currentUser.workoutHistory.push({ date, workoutCount: data.workoutCount });

            data.exercises.forEach(exercise => {
                this.currentUser.exerciseHistory.push({
                    date,
                    exerciseName: exercise.exerciseName,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    totalVolume: exercise.totalVolume
                });
            });
        });

        this.currentUser.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.currentUser.waterHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.currentUser.calorieHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.currentUser.workoutHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.currentUser.exerciseHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setupEventListeners() {
        // Workout Form Submission
        const workoutForm = document.getElementById('workoutForm');
        if (workoutForm) {
            workoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleWorkoutSubmission(new FormData(workoutForm));
            });
        }

        // Purchase Form Submission
        const purchaseForm = document.getElementById('purchaseForm');
        if (purchaseForm) {
            purchaseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePurchaseSubmission(new FormData(purchaseForm));
            });
        }

        // Export Data
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportUserData());
        }

        // Import Data
        const importBtn = document.getElementById('importData');
        const importFile = document.getElementById('importFile');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => this.importUserData(e));
        }

        // Clear Data
        const clearBtn = document.getElementById('clearData');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearUserData());
        }

        // Pre-fill today's date in forms
        const todayStr = new Date().toISOString().split('T')[0];
        const dateFields = ['workoutDate', 'purchaseDate'];
        dateFields.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value) el.value = todayStr;
        });
    }

    loadUserData() {
        const p = this.currentUser.profile;
        if (!p) return;

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        const displayName = (p.name && String(p.name).trim() !== '' && String(p.name).trim() !== 'Athlete') ? String(p.name).trim() : (p.name || 'Athlete');

        setTxt('userName', displayName);
        setTxt('profileName', displayName);
        setTxt('profileEmail', p.email || 'Not provided');
        setTxt('headerEmail', p.email || 'athlete@gym.com');
        setTxt('profilePhone', p.phone || 'Not provided');
        setTxt('profileAddress', p.address || 'Not provided');

        // Initials
        const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
        setTxt('userInitials', initials);

        if (p.currentWeight) {
            setTxt('currentWeight', `${p.currentWeight} kg`);
            const inlineW = document.getElementById('inlineWeight');
            if (inlineW) inlineW.innerHTML = `${p.currentWeight} <small>kg</small>`;
        }
        if (p.targetWeight) setTxt('targetWeight', `${p.targetWeight} kg`);
        if (p.waterGoal) {
            setTxt('overviewHydration', `${p.waterGoal} L`);
            setTxt('overviewHydrationTarget', `${p.waterGoal} L/day`);
            const inlineH = document.getElementById('inlineHydration');
            if (inlineH) inlineH.innerHTML = `${p.waterGoal} <small>L</small>`;
        }
        if (p.calorieGoal) {
            setTxt('overviewCalories', `${Number(p.calorieGoal).toLocaleString()} kcal`);
            const inlineC = document.getElementById('inlineCalories');
            if (inlineC) inlineC.innerHTML = `${Number(p.calorieGoal).toLocaleString()} <small>kcal</small>`;
        }
        if (p.fitnessGoal) {
            const formattedGoal = p.fitnessGoal.replace('-', ' ').toUpperCase();
            setTxt('fitnessGoal', formattedGoal);
            setTxt('headerGoal', formattedGoal);
        }

        // Keycard Identity
        setTxt('keycardUserName', displayName);
        let idHash = 849201;
        if (p.email) {
            let h = 0;
            for (let i = 0; i < p.email.length; i++) h = (h * 31 + p.email.charCodeAt(i)) | 0;
            idHash = Math.abs(h % 900000) + 100000;
        }
        setTxt('keycardId', `HG-${idHash}`);

        // My Home Branch Sync
        const homeBranch = localStorage.getItem('gym_home_branch');
        if (homeBranch) {
            setTxt('myHomeBranchName', `${homeBranch} Branch`);
            setTxt('myHomeBranchHours', '5:00 AM - 11:00 PM Active');
            if (homeBranch === 'Kalyan' || homeBranch === 'Thane') {
                setTxt('myHomeBranchHours', '24/7 Keycard Access Active');
            }
        }

        // Radial Progress Rings
        const currentWater = parseFloat(p.waterGoal) || 2.5;
        const currentCalories = parseInt(p.calorieGoal) || 2200;
        this.updateRadialRings(currentWater, currentCalories);

        // Update Gamification Streak & PR Trophies
        const streak = this.calculateWorkoutStreak();
        const streakEl = document.getElementById('streakCount');
        if (streakEl) streakEl.textContent = streak;
        this.renderPersonalRecords();

        // Load active AI workout mesocycle from custom workout plan sync
        this.loadActiveAIMesocycle();
    }

    loadActiveAIMesocycle() {
        try {
            const rawActive = localStorage.getItem('fitphysique_active_program');
            const rawCustom = localStorage.getItem('userCustomWorkoutPlan');
            let program = null;
            if (rawActive) {
                program = JSON.parse(rawActive);
            } else if (rawCustom) {
                program = JSON.parse(rawCustom);
            }

            const banner = document.getElementById('activeMesocycleBanner');
            if (!banner) return;

            if (program) {
                banner.style.display = 'block';
                const titleEl = document.getElementById('mesocycleTitle');
                const detailsEl = document.getElementById('mesocycleDetails');
                if (titleEl) titleEl.textContent = program.programTitle || program.title || 'Personalized AI Mesocycle';
                if (detailsEl) {
                    const days = program.frequency || (Array.isArray(program.days) ? program.days.length : (program.sessions ? program.sessions.length : 4));
                    const goal = (program.goal || 'General Hypertrophy').replace(/[-_]/g, ' ').toUpperCase();
                    detailsEl.textContent = `${days} Days / Week • ${goal} • Periodized Progression Active`;
                }
            } else {
                banner.style.display = 'none';
            }
        } catch (e) {
            console.warn('[Dashboard] Could not load active AI program:', e);
        }
    }

    updateRadialRings(waterVal, calVal) {
        const hydText = document.getElementById('radialHydrationVal');
        if (hydText) hydText.textContent = `${waterVal.toFixed(1)} / ${(this.currentUser.profile.waterGoal || 2.5)} L`;

        const calText = document.getElementById('radialCalorieVal');
        if (calText) calText.textContent = `${Number(calVal).toLocaleString()} kcal`;

        // SVG dashoffset: circumference ~ 113
        const hydCircle = document.getElementById('hydrationSvgCircle');
        if (hydCircle) {
            const targetW = parseFloat(this.currentUser.profile.waterGoal) || 2.5;
            const ratioW = Math.min(waterVal / targetW, 1);
            hydCircle.style.strokeDashoffset = `${113 - (ratioW * 113)}`;
        }

        const calCircle = document.getElementById('calorieSvgCircle');
        if (calCircle) {
            const targetC = parseInt(this.currentUser.profile.calorieGoal) || 2200;
            const ratioC = Math.min(calVal / targetC, 1);
            calCircle.style.strokeDashoffset = `${113 - (ratioC * 113)}`;
        }
    }

    quickAddWater(amount) {
        const cur = parseFloat(this.currentUser.profile.waterGoal) || 2.5;
        const newTotal = parseFloat((cur + amount).toFixed(2));
        this.currentUser.profile.waterGoal = newTotal;
        this.loadUserData();
        this.showToast(`Logged +${amount * 1000}ml water! (${newTotal.toFixed(1)}L today)`, 'success');
    }

    calculateWorkoutStreak() {
        const workouts = this.currentUser.workoutLogs || [];
        if (workouts.length === 0) return 0;

        const uniqueDates = Array.from(new Set(workouts.map(w => w.workout_date))).sort().reverse();
        if (uniqueDates.length === 0) return 0;

        let streak = 0;
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
            const parts = uniqueDates[i].split('-');
            const wDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            wDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((checkDate - wDate) / (1000 * 60 * 60 * 24));
            if (diffDays <= 1 || i === 0 && diffDays <= 2) {
                streak++;
                checkDate = wDate;
            } else if (diffDays <= 3) {
                // Gym rest day forgiveness
                streak++;
                checkDate = wDate;
            } else {
                break;
            }
        }
        return Math.max(streak, 1);
    }

    renderPersonalRecords() {
        const container = document.getElementById('prBadgesContainer');
        if (!container) return;

        const workouts = this.currentUser.workoutLogs || [];
        if (workouts.length === 0) {
            container.innerHTML = `
                <div class="pr-badge-chip"><i class="fa-solid fa-trophy text-gold"></i> <span>Log workouts to unlock <strong>Personal Records (PRs)</strong></span></div>
            `;
            return;
        }

        const prMap = {};
        workouts.forEach(w => {
            const name = (w.exercise_name || '').trim();
            const wt = parseFloat(w.weight) || 0;
            if (!prMap[name] || wt > prMap[name]) {
                prMap[name] = wt;
            }
        });

        const topPRs = Object.entries(prMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

        container.innerHTML = topPRs.map(([exercise, maxWeight]) => `
            <div class="pr-badge-chip" title="All-time personal record for ${this.escapeHtml(exercise)}">
                <i class="fa-solid fa-trophy"></i>
                <span>${this.escapeHtml(exercise)}: <strong>${maxWeight} kg PR</strong></span>
            </div>
        `).join('');
    }

    generatePrintReport() {
        window.print();
    }

    updateCloudStatusIndicator() {
        const isCloudConfigured = window.GymCloudAdapter && window.GymCloudAdapter.isConfigured && window.GymCloudAdapter.isConfigured();
        const badge = document.getElementById('cloudSyncStatusBadge');
        if (badge) {
            if (isCloudConfigured) {
                badge.innerHTML = '<i class="fa-solid fa-cloud-bolt text-gold"></i> Supabase Cloud: Active';
                badge.className = 'pill-badge pill-gold';
            } else {
                badge.innerHTML = '<i class="fa-solid fa-hard-drive"></i> Local Cache';
                badge.className = 'pill-badge pill-glass';
            }
        }
    }

    async manualCloudSync() {
        this.showToast('Connecting to Supabase Cloud...', 'success');
        if (window.GymCloudStore && typeof GymCloudStore.syncFromCloud === 'function') {
            try {
                await GymCloudStore.syncFromCloud();
                await this.refreshFromCloud();
                this.showToast('Supabase Cloud sync completed!', 'success');
            } catch (e) {
                this.showToast('Supabase sync error: offline', 'error');
            }
        }
    }

    async manualCloudPush() {
        this.showToast('Pushing local records to Supabase Cloud...', 'success');
        if (window.GymCloudStore && typeof GymCloudStore.pushAllLocalToSupabase === 'function') {
            try {
                const res = await GymCloudStore.pushAllLocalToSupabase();
                if (res.ok) {
                    this.showToast(`Pushed ${res.pushed || 0} events to Supabase Cloud!`, 'success');
                } else {
                    this.showToast('Cloud push completed (local cache)', 'success');
                }
            } catch (e) {
                this.showToast('Cloud push error', 'error');
            }
        }
    }

    // =========================================================================
    // SECTION 1: MEMBERSHIPS & ACTIVE PLANS
    // =========================================================================
    renderMembershipsList() {
        const container = document.getElementById('membershipsContainer');
        if (!container) return;

        const cloudStore = window.GymCloudStore ? GymCloudStore.getSnapshot() : this.getLocalSnapshot();
        const subs = (cloudStore && Array.isArray(cloudStore.trainerSubscriptions)) ? cloudStore.trainerSubscriptions : [];

        const userEmail = (this.currentUser.profile.email || '').toLowerCase().trim();
        const userName = (this.currentUser.profile.name || '').toLowerCase().trim();

        let membershipList = subs.filter(s => {
            const sEmail = (s.customerEmail || '').toLowerCase().trim();
            const sName = (s.customerName || '').toLowerCase().trim();
            const isMatch = (!sEmail && !sName) || (sEmail && sEmail === userEmail) || (sName && (sName === userName || userName.includes(sName)));
            return isMatch && (!s.trainerName || s.trainerName === "Gym General Membership");
        });

        // Ingest any memberships from PostgreSQL purchases
        const dbMemberships = (this.currentUser.purchases || []).filter(p => (p.item_name || '').startsWith('Membership:'));
        dbMemberships.forEach(p => {
            const planName = p.item_name.replace('Membership:', '').trim();
            const exists = membershipList.some(m => m.planName === planName);
            if (!exists) {
                membershipList.unshift({
                    id: p.id,
                    planName: planName,
                    amount: parseFloat(p.item_price || 0),
                    createdAt: p.purchase_date || p.created_at,
                    isDefault: false
                });
            }
        });

        if (membershipList.length === 0) {
            membershipList = [{
                id: 'base_membership',
                planName: 'Pro Athlete Tier',
                amount: 4500,
                createdAt: new Date().toISOString(),
                isDefault: true
            }];
        }

        // Check for Custom Workout Plan generated via custom workout plan wizard
        const customGoal = localStorage.getItem('selectedGoal');
        const customDaysRaw = localStorage.getItem('selectedTrainingDays');
        let customDays = [];
        try { customDays = JSON.parse(customDaysRaw || '[]'); } catch(e){}
        const customDuration = localStorage.getItem('selectedWorkoutDuration') || '45-60 min';

        let customPlanCard = '';
        if (customGoal || customDays.length > 0) {
            customPlanCard = `
                <div class="entity-card" style="border-left-color: #00F0FF; margin-top: 10px;">
                    <div class="entity-header">
                        <div class="entity-title-group">
                            <h3 style="color:#00F0FF;"><i class="fa-solid fa-wand-magic-sparkles"></i> Custom AI Workout Routine</h3>
                            <span class="entity-subtitle">Personalized Generated Program</span>
                        </div>
                        <span class="entity-status-badge" style="background:#00F0FF; color:#000;">ACTIVE</span>
                    </div>
                    <div class="entity-details-list">
                        <div class="entity-detail-item">
                            <span class="label">Target Objective</span>
                            <span class="val" style="color:#00F0FF;">${customGoal ? customGoal.toUpperCase() : 'General Conditioning'}</span>
                        </div>
                        <div class="entity-detail-item">
                            <span class="label">Schedule</span>
                            <span class="val" style="color:#FFFFFF;">${customDays.length > 0 ? customDays.join(', ') : '3 Days / Week'}</span>
                        </div>
                        <div class="entity-detail-item">
                            <span class="label">Session Length</span>
                            <span class="val" style="color:#FFFFFF;">${customDuration}</span>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end;">
                        <a href="../custom workout plan/workout-plan.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-play"></i> Launch Routine</a>
                    </div>
                </div>
            `;
        }

        container.innerHTML = membershipList.map(plan => `
            <div class="entity-card">
                <div class="entity-header">
                    <div class="entity-title-group">
                        <h3>${plan.planName || 'Standard'} Membership</h3>
                        <span class="entity-subtitle">All-Access Hanuman Gym Pass</span>
                    </div>
                    <span class="entity-status-badge">ACTIVE</span>
                </div>
                <div class="entity-details-list">
                    <div class="entity-detail-item">
                        <span class="label"><i class="fa-solid fa-indian-rupee-sign"></i> Subscription Fee</span>
                        <span class="val">₹${(plan.amount || 4500).toLocaleString('en-IN')}/mo</span>
                    </div>
                    <div class="entity-detail-item">
                        <span class="label"><i class="fa-regular fa-calendar-check"></i> Enrolled Date</span>
                        <span class="val">${plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active'}</span>
                    </div>
                    <div class="entity-detail-item">
                        <span class="label"><i class="fa-solid fa-shield-halved"></i> Facility Access</span>
                        <span class="val" style="color:#FFFFFF;">24/7 Access + Recovery Area</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <a href="../Memberships/index.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-repeat"></i> Upgrade Tier</a>
                </div>
            </div>
        `).join('') + customPlanCard;

        const overviewPlanTitle = document.getElementById('overviewPlanTitle');
        if (overviewPlanTitle && membershipList[0]) {
            overviewPlanTitle.textContent = `${membershipList[0].planName || 'Standard'} All-Access Plan`;
        }
    }

    // =========================================================================
    // SECTION 2: ASSIGNED PERSONAL TRAINERS
    // =========================================================================
    renderTrainersList() {
        const container = document.getElementById('trainersContainer');
        if (!container) return;

        const cloudStore = window.GymCloudStore ? GymCloudStore.getSnapshot() : this.getLocalSnapshot();
        const subs = (cloudStore && Array.isArray(cloudStore.trainerSubscriptions)) ? cloudStore.trainerSubscriptions : [];

        const userEmail = (this.currentUser.profile.email || '').toLowerCase().trim();
        const userName = (this.currentUser.profile.name || '').toLowerCase().trim();

        const trainerSubs = subs.filter(s => {
            const sEmail = (s.customerEmail || '').toLowerCase().trim();
            const sName = (s.customerName || '').toLowerCase().trim();
            const isMatch = (!sEmail && !sName) || (sEmail && sEmail === userEmail) || (sName && (sName === userName || userName.includes(sName)));
            return isMatch && s.trainerName && s.trainerName !== "Gym General Membership";
        });

        // Ingest any trainer bookings from PostgreSQL purchases
        const dbTrainers = (this.currentUser.purchases || []).filter(p => (p.item_name || '').startsWith('Trainer:'));
        dbTrainers.forEach(p => {
            const raw = p.item_name.replace('Trainer:', '').trim();
            const match = raw.match(/^([^(]+)(?:\(([^)]+)\))?/);
            const tName = match ? match[1].trim() : raw;
            const pName = match && match[2] ? match[2].trim() : 'Active';
            const exists = trainerSubs.some(t => (t.trainerName || '').toLowerCase() === tName.toLowerCase());
            if (!exists) {
                trainerSubs.unshift({
                    id: p.id,
                    trainerName: tName,
                    planName: pName,
                    amount: parseFloat(p.item_price || 0),
                    createdAt: p.purchase_date || p.created_at
                });
            }
        });

        if (trainerSubs.length === 0) {
            container.innerHTML = `
                <div class="no-data" style="text-align:center; padding:24px 12px;">
                    <i class="fa-solid fa-user-ninja" style="font-size: 1.5rem; color: #B3DD24; margin-bottom: 6px;"></i>
                    <p style="font-size:12.5px; color:#888;">No personal coach booked yet.</p>
                    <a href="../Training_Section/index.html" class="btn btn-primary btn-sm" style="margin-top: 10px;">
                        <i class="fa-solid fa-plus"></i> Browse Coach Roster
                    </a>
                </div>
            `;
            return;
        }

        const catalog = window.GYM_TRAINERS_CATALOG || [];

        container.innerHTML = trainerSubs.map(t => {
            const matchedTrainer = catalog.find(c => c.name.toLowerCase() === (t.trainerName || '').toLowerCase()) || {};
            const photoUrl = matchedTrainer.image || '../Training_Section/images/trainer1.jpg';
            const spec = matchedTrainer.specialization || 'Strength & Conditioning Specialist';

            return `
                <div class="entity-card">
                    <div class="entity-header">
                        <div class="entity-title-group">
                            <h3>${t.trainerName}</h3>
                            <span class="entity-subtitle">${spec}</span>
                        </div>
                        <span class="entity-status-badge">ASSIGNED</span>
                    </div>
                    <div class="trainer-card-body">
                        <img src="${photoUrl}" alt="${t.trainerName}" class="trainer-avatar-img" onerror="this.src='../P Home/images/logo.png'">
                        <div class="entity-details-list" style="flex:1;">
                            <div class="entity-detail-item">
                                <span class="label">Program</span>
                                <span class="val">${t.planName || 'Custom'} Plan</span>
                            </div>
                            <div class="entity-detail-item">
                                <span class="label">Status</span>
                                <span class="val" style="color: #10B981;">Active Coaching</span>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                        <span style="font-size:11.5px; color:#888;">Booked on ${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'}</span>
                        <a href="../Training_Section/trainer-details.html?id=${matchedTrainer.id || 1}" class="btn btn-secondary btn-sm"><i class="fa-solid fa-calendar-check"></i> View Schedule</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // SECTION 3: WORKOUT HISTORY FEED
    // =========================================================================
    loadWorkoutHistory() {
        const historyContainer = document.getElementById('workoutHistory');
        if (!historyContainer) return;

        const workouts = this.currentUser.workoutLogs || [];
        if (workouts.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-data" style="text-align:center; padding:30px 10px;">
                    <i class="fa-solid fa-dumbbell" style="font-size: 1.5rem; color: var(--accent); margin-bottom: 6px;"></i>
                    <p style="font-size:12.5px; color:#888;">No workouts recorded yet. Start logging on the left!</p>
                </div>
            `;
            return;
        }

        const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date));

        historyContainer.innerHTML = sortedWorkouts.map(w => {
            const sets = parseInt(w.sets) || 0;
            const reps = parseInt(w.reps) || 0;
            const weight = parseFloat(w.weight) || 0;
            const volume = sets * reps * weight;

            return `
                <div class="workout-item">
                    <div class="workout-item-header">
                        <span class="workout-exercise">${this.escapeHtml(w.exercise_name)}</span>
                        <span class="workout-date"><i class="fa-regular fa-calendar"></i> ${w.workout_date}</span>
                    </div>
                    <div class="workout-details">
                        <span class="workout-pill"><strong>${sets}</strong> sets &times; <strong>${reps}</strong> reps</span>
                        <span class="workout-pill"><strong>${weight}</strong> kg</span>
                        ${volume > 0 ? `<span class="workout-pill pill-vol"><i class="fa-solid fa-bolt"></i> ${volume.toLocaleString()} kg vol</span>` : ''}
                        ${w.water_intake ? `<span class="workout-pill"><i class="fa-solid fa-droplet text-gold"></i> ${w.water_intake}L</span>` : ''}
                        ${w.calories_consumed ? `<span class="workout-pill"><i class="fa-solid fa-fire text-gold"></i> ${w.calories_consumed} kcal</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // SECTION 4: UNIFIED PURCHASE & STORE ORDERS LEDGER
    // =========================================================================
    loadPurchaseHistory() {
        const tableBody = document.querySelector('#purchaseTable tbody');
        const purchases = this.currentUser.purchases || [];

        if (tableBody) {
            if (purchases.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align:center; padding:24px 10px; color:#888; font-size:12.5px;">
                            <i class="fa-solid fa-cart-arrow-down" style="font-size: 1.2rem; color: var(--accent); margin-bottom: 4px;"></i>
                            <p>No purchases or store orders recorded yet.</p>
                        </td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = purchases.map(p => `
                    <tr>
                        <td>${p.purchase_date}</td>
                        <td>
                            <strong>${this.escapeHtml(p.item_name)}</strong>
                            ${p.source === 'store' ? '<span class="pill-badge pill-gold-outline" style="margin-left:6px; font-size:8.5px;">STORE GEAR</span>' : ''}
                            ${p.source === 'subscription' ? '<span class="pill-badge pill-gold" style="margin-left:6px; font-size:8.5px;">MEMBERSHIP</span>' : ''}
                        </td>
                        <td class="price-cell">₹${parseFloat(p.item_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>
                            <button type="button" class="btn btn-danger-soft btn-sm" onclick="window.dashboardManager.deletePurchase('${p.id}')" title="Delete record" style="padding:3px 8px; font-size:11px;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        this.updateFinancialSummary();
    }

    updateFinancialSummary() {
        const purchases = this.currentUser.purchases || [];
        const total = purchases.reduce((sum, p) => sum + (parseFloat(p.item_price) || 0), 0);
        const count = purchases.length;
        const totalFormatted = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        const ids = ['totalSpent', 'inlineTotalSpent', 'overviewTotalSpent'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = totalFormatted;
        });

        const countIds = ['totalItems', 'overviewTotalItems'];
        countIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        });

        this.renderOverviewRecentWorkouts();
    }

    renderOverviewRecentWorkouts() {
        const overviewContainer = document.getElementById('overviewWorkoutList');
        if (!overviewContainer) return;

        const workouts = this.currentUser.workoutLogs || [];
        if (workouts.length === 0) {
            overviewContainer.innerHTML = `
                <div style="font-size:12px; color:#777; text-align:center; padding:12px 0;">
                    No workouts logged yet.
                </div>
            `;
            return;
        }

        const recent = [...workouts].sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date)).slice(0, 3);
        overviewContainer.innerHTML = recent.map(w => `
            <div class="mini-workout-row">
                <span class="name">${this.escapeHtml(w.exercise_name)}</span>
                <span class="details">${w.sets}x${w.reps} &bull; ${w.weight}kg</span>
            </div>
        `).join('');
    }

    // =========================================================================
    // SECTION 5: EXERCISE FORM TRAINING FEEDBACK
    // =========================================================================
    renderExerciseFeedbackList() {
        const container = document.getElementById('exerciseLogsContainer');
        if (!container) return;

        const cloudStore = window.GymCloudStore ? GymCloudStore.getSnapshot() : this.getLocalSnapshot();
        const logs = (cloudStore && Array.isArray(cloudStore.exerciseLogs)) ? cloudStore.exerciseLogs : [];

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="no-data" style="grid-column: 1 / -1; text-align:center; padding:20px 10px; color:#888; font-size:12.5px;">
                    <i class="fa-solid fa-comments" style="font-size: 1.2rem; color: var(--accent); margin-bottom: 4px;"></i>
                    <p>No technique feedback submitted yet. Practice form in the Form Training Module.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.slice(0, 6).map(log => `
            <div class="exercise-log-card">
                <div class="exercise-log-header">
                    <span><i class="fa-solid fa-bolt"></i> ${this.escapeHtml(log.focus || 'Form Training')}</span>
                    <span style="font-size:10.5px; color:#888;">${log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Logged'}</span>
                </div>
                <div class="exercise-log-notes">
                    "${this.escapeHtml(log.notes || 'Routine practice completed with good technique.')}"
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // FORM SUBMISSIONS & CLOUD ACTIONS
    // =========================================================================
    async handleWorkoutSubmission(formData) {
        const workoutData = {
            workout_date: formData.get('workoutDate'),
            exercise_name: formData.get('exerciseName'),
            sets: parseInt(formData.get('sets')),
            reps: parseInt(formData.get('reps')),
            weight: parseFloat(formData.get('weight')),
            water_intake: parseFloat(formData.get('waterIntake')),
            calories_consumed: parseInt(formData.get('caloriesConsumed')),
            email: this.currentUser.profile.email,
            customerName: this.currentUser.profile.name
        };

        // 1. Sync to Supabase Cloud
        if (window.GymCloudStore && typeof GymCloudStore.recordWorkoutSession === 'function') {
            GymCloudStore.recordWorkoutSession(workoutData);
        }

        // 2. Sync to FastAPI Backend (Strictly FastAPI - No PHP Fallback)
        try {
            if (window.GymApiClient) {
                const data = await GymApiClient.saveWorkout(workoutData);
                if (data && data.success) {
                    this.currentUser.workoutLogs.unshift({
                        ...workoutData,
                        id: data.workout_id || data.id || Date.now()
                    });
                    this.generateHistoryFromWorkouts();
                    this.loadWorkoutHistory();
                    this.loadUserData();
                    this.updateCharts();
                    this.showToast('Workout saved to FastAPI backend!', 'success');
                    document.getElementById('workoutForm').reset();
                    document.getElementById('workoutDate').value = new Date().toISOString().split('T')[0];
                } else {
                    this.showToast((data && data.message) || 'Error saving workout', 'error');
                }
            }
        } catch (e) {
            console.error('[FastAPI Error] Saving workout failed:', e);
            this.showToast(e.message || 'Failed to save workout to FastAPI', 'error');
        }
    }

    async handlePurchaseSubmission(formData) {
        const purchaseData = {
            item_name: formData.get('itemName'),
            item_price: parseFloat(formData.get('itemPrice')),
            purchase_date: formData.get('purchaseDate'),
            customerEmail: this.currentUser.profile.email,
            customerName: this.currentUser.profile.name
        };

        // 1. Sync to Supabase Cloud
        if (window.GymCloudStore && typeof GymCloudStore.recordStorePurchase === 'function') {
            GymCloudStore.recordStorePurchase({
                productName: purchaseData.item_name,
                amount: purchaseData.item_price,
                customerEmail: this.currentUser.profile.email,
                customerName: this.currentUser.profile.name
            });
        }

        // 2. Sync to FastAPI Backend (Strictly FastAPI - No PHP Fallback)
        try {
            if (window.GymApiClient) {
                const data = await GymApiClient.savePurchase(purchaseData);
                if (data && data.success) {
                    this.currentUser.purchases.unshift({
                        ...purchaseData,
                        id: data.purchase_id || data.id || Date.now()
                    });
                    this.loadPurchaseHistory();
                    this.showToast('Purchase recorded in FastAPI backend!', 'success');
                    document.getElementById('purchaseForm').reset();
                    document.getElementById('purchaseDate').value = new Date().toISOString().split('T')[0];
                } else {
                    this.showToast((data && data.message) || 'Error recording purchase', 'error');
                }
            }
        } catch (e) {
            console.error('[FastAPI Error] Saving purchase failed:', e);
            this.showToast(e.message || 'Failed to record purchase in FastAPI', 'error');
        }
    }

    async deletePurchase(purchaseId) {
        if (!confirm('Are you sure you want to remove this purchase record?')) return;

        try {
            if (typeof purchaseId === 'number' || (!isNaN(purchaseId) && !String(purchaseId).startsWith('store_') && !String(purchaseId).startsWith('sub_'))) {
                if (window.GymApiClient) {
                    await GymApiClient.deletePurchase(parseInt(purchaseId, 10));
                }
            }

            this.currentUser.purchases = this.currentUser.purchases.filter(p => String(p.id) !== String(purchaseId));
            this.loadPurchaseHistory();
            this.showToast('Purchase record removed from FastAPI', 'success');
        } catch (e) {
            console.error('[FastAPI Error] Deleting purchase failed:', e);
            this.showToast(e.message || 'Failed to delete purchase from FastAPI', 'error');
        }
    }

    updateCharts() {
        if (window.chartManager) {
            window.chartManager.updateAllCharts(this.currentUser);
        }
    }

    exportUserData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentUser, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `hanuman_gym_backup_${this.currentUser.profile.name || 'athlete'}.json`);
        dlAnchorElem.click();
        this.showToast('JSON Backup downloaded!', 'success');
    }

    importUserData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.workoutLogs) this.currentUser.workoutLogs = importedData.workoutLogs;
                if (importedData.purchases) this.currentUser.purchases = importedData.purchases;
                this.generateHistoryFromWorkouts();
                this.loadWorkoutHistory();
                this.loadPurchaseHistory();
                this.updateCharts();
                this.showToast('Data imported successfully!', 'success');
            } catch (err) {
                this.showToast('Invalid JSON file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearUserData() {
        if (confirm('Are you sure you want to clear your local activity cache? This will not delete your database account.')) {
            localStorage.removeItem(this.userStorageKey);
            if (window.GymCloudStore) GymCloudStore.clearAll();
            this.showToast('Local workspace cache cleared', 'success');
            setTimeout(() => window.location.reload(), 1000);
        }
    }

    showToast(message, type = 'success') {
        const existing = document.querySelectorAll('.toast-pill');
        existing.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast-pill ${type === 'error' ? 'toast-error' : 'toast-success'}`;
        toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}"></i> <span>${this.escapeHtml(message)}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

function initDashboard() {
    if (!window.dashboardManager) {
        window.dashboardManager = new DashboardManager();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
