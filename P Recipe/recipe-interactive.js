/**
 * ==============================================================================
 * Hanuman Gym - Unified Recipe Interactive Engine (Flagship Edition)
 * ==============================================================================
 * Powers:
 * 1. Dynamic Servings Multiplier (+ / -) with automatic ingredient and macro recalculation.
 * 2. Metric <-> Imperial unit toggle (grams/ml <-> oz/cups).
 * 3. Smart Weekly Grocery & Meal Prep List Aggregator (consolidates ingredients, copy/print).
 * 4. In-Kitchen Fullscreen Cooking Mode with embedded step countdown timers & audio alert.
 * 5. Interactive Ingredient Checklist with strike-through toggle.
 * 6. Recipe Bookmarks (saved in localStorage & synced with My Space).
 * 7. Daily Nutrition Logger ("Log Meal to Nutrition Tracker").
 * 8. Toast Notifications for instant athlete feedback.
 */

(function () {
    // ---- Toast Notification System ----
    function showToast(message, icon = 'fa-circle-check', type = 'gold') {
        let container = document.getElementById('recipe-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'recipe-toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 28px;
                right: 28px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `recipe-toast toast-${type}`;
        toast.style.cssText = `
            background: rgba(18, 18, 18, 0.96);
            border: 1px solid ${type === 'gold' ? '#B3DD24' : '#3ECF8E'};
            color: #FFFFFF;
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 600;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            pointer-events: auto;
        `;

        toast.innerHTML = `
            <i class="fa-solid ${icon}" style="color: ${type === 'gold' ? '#B3DD24' : '#3ECF8E'}; font-size: 18px;"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateY(10px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // ---- Audio Chime for Timer Completion (Web Audio API) ----
    function playTimerChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.log('Audio not supported or permitted:', e);
        }
    }

    // ---- Servings Multiplier & Unit Conversion State ----
    let baseServings = 1;
    let currentServings = 1;
    let isImperial = false;
    const baseIngredients = [];
    const baseMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    function initServingsScaler() {
        const yieldElement = document.querySelector('[data-base-servings]');
        if (yieldElement) {
            baseServings = parseInt(yieldElement.dataset.baseServings, 10) || 1;
        } else {
            const pills = document.querySelectorAll('.metric-pill');
            pills.forEach(p => {
                if (p.textContent.includes('Yield')) {
                    const match = p.textContent.match(/(\d+)/);
                    if (match) baseServings = parseInt(match[1], 10);
                }
            });
        }
        currentServings = baseServings;

        // Parse base ingredients quantities
        const ingredientRows = document.querySelectorAll('.ingredient-row');
        ingredientRows.forEach((row, index) => {
            const badge = row.querySelector('.ingredient-amount-badge');
            if (badge) {
                const text = badge.textContent.trim();
                const numMatch = text.match(/^([\d\.\/]+)\s*(.*)$/);
                if (numMatch) {
                    let num = 0;
                    if (numMatch[1].includes('/')) {
                        const parts = numMatch[1].split('/');
                        num = parseFloat(parts[0]) / parseFloat(parts[1]);
                    } else {
                        num = parseFloat(numMatch[1]);
                    }
                    baseIngredients[index] = {
                        num: num,
                        unit: numMatch[2] || '',
                        raw: text
                    };
                } else {
                    baseIngredients[index] = { num: null, unit: '', raw: text };
                }
            }
        });

        // Parse base macros
        const calEl = document.querySelector('.macro-box:nth-child(1) .macro-val');
        const proEl = document.querySelector('.macro-box:nth-child(2) .macro-val');
        const carbEl = document.querySelector('.macro-box:nth-child(3) .macro-val');
        const fatEl = document.querySelector('.macro-box:nth-child(4) .macro-val');

        if (calEl) baseMacros.calories = parseFloat(calEl.textContent.replace(/[^\d.]/g, '')) || 0;
        if (proEl) baseMacros.protein = parseFloat(proEl.textContent.replace(/[^\d.]/g, '')) || 0;
        if (carbEl) baseMacros.carbs = parseFloat(carbEl.textContent.replace(/[^\d.]/g, '')) || 0;
        if (fatEl) baseMacros.fats = parseFloat(fatEl.textContent.replace(/[^\d.]/g, '')) || 0;

        renderServingControls();
        renderUnitSwitchControl();
    }

    function renderServingControls() {
        const panelHead = document.querySelector('.recipe-sidebar-col .recipe-panel:first-child .recipe-panel-head');
        if (!panelHead) return;

        let controls = document.getElementById('servings-scaler-control');
        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'servings-scaler-control';
            controls.className = 'servings-scaler-widget';
            controls.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(179, 221, 36, 0.3);
                border-radius: 20px;
                padding: 3px 10px;
            `;

            controls.innerHTML = `
                <button type="button" class="btn-scaler-step" id="btn-scale-down" style="background:none; border:none; color:#B3DD24; font-size:16px; font-weight:700; cursor:pointer; padding:0 4px;">−</button>
                <span id="scaler-count-display" style="font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:700; color:#FFFFFF; min-width:65px; text-align:center;">${currentServings} Servings</span>
                <button type="button" class="btn-scaler-step" id="btn-scale-up" style="background:none; border:none; color:#B3DD24; font-size:16px; font-weight:700; cursor:pointer; padding:0 4px;">+</button>
            `;

            const oldSpan = panelHead.querySelector('span#servings-indicator');
            if (oldSpan) oldSpan.remove();

            panelHead.appendChild(controls);

            document.getElementById('btn-scale-down').addEventListener('click', () => changeServings(-1));
            document.getElementById('btn-scale-up').addEventListener('click', () => changeServings(1));
        }
    }

    function renderUnitSwitchControl() {
        const panelHead = document.querySelector('.recipe-sidebar-col .recipe-panel:first-child');
        if (!panelHead) return;

        if (!document.getElementById('unit-switcher-pill')) {
            const switcher = document.createElement('div');
            switcher.id = 'unit-switcher-pill';
            switcher.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: flex-end;
                margin-bottom: 12px;
                gap: 6px;
                font-size: 11px;
                font-weight: 700;
                font-family: 'Outfit', sans-serif;
            `;

            switcher.innerHTML = `
                <span style="color:#888;">Units:</span>
                <button type="button" id="btn-unit-metric" style="background:${!isImperial ? '#B3DD24' : 'rgba(255,255,255,0.08)'}; color:${!isImperial ? '#000' : '#FFF'}; border:none; padding:3px 8px; border-radius:10px; cursor:pointer; font-weight:700;">Metric (g/ml)</button>
                <button type="button" id="btn-unit-imperial" style="background:${isImperial ? '#B3DD24' : 'rgba(255,255,255,0.08)'}; color:${isImperial ? '#000' : '#FFF'}; border:none; padding:3px 8px; border-radius:10px; cursor:pointer; font-weight:700;">Imperial (oz)</button>
            `;

            const checklist = panelHead.querySelector('.ingredients-checklist');
            if (checklist) {
                panelHead.insertBefore(switcher, checklist);
            }

            document.getElementById('btn-unit-metric').addEventListener('click', () => {
                isImperial = false;
                document.getElementById('btn-unit-metric').style.background = '#B3DD24';
                document.getElementById('btn-unit-metric').style.color = '#000';
                document.getElementById('btn-unit-imperial').style.background = 'rgba(255,255,255,0.08)';
                document.getElementById('btn-unit-imperial').style.color = '#FFF';
                updateScaledValues();
            });

            document.getElementById('btn-unit-imperial').addEventListener('click', () => {
                isImperial = true;
                document.getElementById('btn-unit-imperial').style.background = '#B3DD24';
                document.getElementById('btn-unit-imperial').style.color = '#000';
                document.getElementById('btn-unit-metric').style.background = 'rgba(255,255,255,0.08)';
                document.getElementById('btn-unit-metric').style.color = '#FFF';
                updateScaledValues();
            });
        }
    }

    function changeServings(delta) {
        const newCount = currentServings + delta;
        if (newCount < 1 || newCount > 20) return;
        currentServings = newCount;
        updateScaledValues();
    }

    function updateScaledValues() {
        const factor = currentServings / baseServings;
        const display = document.getElementById('scaler-count-display');
        if (display) {
            display.textContent = `${currentServings} Serving${currentServings > 1 ? 's' : ''}`;
        }

        // Update Ingredient Badges
        const ingredientRows = document.querySelectorAll('.ingredient-row');
        ingredientRows.forEach((row, index) => {
            const badge = row.querySelector('.ingredient-amount-badge');
            const base = baseIngredients[index];
            if (badge && base) {
                if (base.num !== null) {
                    let scaled = (base.num * factor);
                    let unit = base.unit;

                    if (isImperial) {
                        if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'grams') {
                            scaled = scaled * 0.035274; // to oz
                            unit = 'oz';
                        } else if (unit.toLowerCase() === 'ml') {
                            scaled = scaled * 0.033814; // to fl oz
                            unit = 'fl oz';
                        }
                    }

                    const formatted = scaled >= 10 ? Math.round(scaled) : (scaled % 1 === 0 ? scaled : scaled.toFixed(1).replace(/\.0$/, ''));
                    badge.textContent = `${formatted} ${unit}`.trim();
                }
            }
        });

        // Update Macro Values
        const calEl = document.querySelector('.macro-box:nth-child(1) .macro-val');
        const proEl = document.querySelector('.macro-box:nth-child(2) .macro-val');
        const carbEl = document.querySelector('.macro-box:nth-child(3) .macro-val');
        const fatEl = document.querySelector('.macro-box:nth-child(4) .macro-val');

        if (calEl && baseMacros.calories) calEl.textContent = `${Math.round(baseMacros.calories * factor)} kcal`;
        if (proEl && baseMacros.protein) proEl.textContent = `${Math.round(baseMacros.protein * factor)}g`;
        if (carbEl && baseMacros.carbs) carbEl.textContent = `${Math.round(baseMacros.carbs * factor)}g`;
        if (fatEl && baseMacros.fats) fatEl.textContent = `${Math.round(baseMacros.fats * factor)}g`;

        // Sync Top Hero Metric Strip
        const heroCal = document.getElementById('metric-calories');
        const heroPro = document.getElementById('metric-protein');
        const heroServings = document.getElementById('metric-servings');

        if (heroCal && baseMacros.calories) heroCal.textContent = `${Math.round(baseMacros.calories * factor)} kcal`;
        if (heroPro && baseMacros.protein) heroPro.textContent = `${Math.round(baseMacros.protein * factor)}g`;
        if (heroServings) heroServings.textContent = `${currentServings} Servings`;
    }

    // ---- Fullscreen Kitchen Cooking Mode with Step Countdown Timers ----
    let activeCookingTimer = null;
    let timerRemainingSecs = 0;

    function initCookingMode() {
        const topActions = document.querySelector('.recipe-actions-quick');
        if (!topActions) return;

        if (!document.getElementById('btn-start-cooking-mode')) {
            const cookBtn = document.createElement('button');
            cookBtn.id = 'btn-start-cooking-mode';
            cookBtn.type = 'button';
            cookBtn.className = 'btn-recipe-action';
            cookBtn.style.background = 'linear-gradient(135deg, rgba(179, 221, 36,0.2) 0%, rgba(179, 221, 36,0.08) 100%)';
            cookBtn.style.borderColor = '#B3DD24';
            cookBtn.style.color = '#B3DD24';
            cookBtn.innerHTML = `<i class="fa-solid fa-fire-burner"></i> <span>Kitchen Cooking Mode</span>`;

            cookBtn.addEventListener('click', launchCookingModeModal);
            topActions.prepend(cookBtn);
        }
    }

    function launchCookingModeModal() {
        const stepCards = document.querySelectorAll('.recipe-step-card');
        if (!stepCards || stepCards.length === 0) {
            showToast('No recipe steps available for cooking mode.', 'fa-triangle-exclamation', 'gold');
            return;
        }

        const recipeTitle = document.querySelector('.recipe-title')?.textContent || 'Hanuman Athlete Recipe';
        const steps = Array.from(stepCards).map((card, i) => {
            const title = card.querySelector('h4')?.textContent || `Step ${i + 1}`;
            const text = card.querySelector('p')?.textContent || '';
            const match = text.match(/(\d+)\s*(?:minutes|mins)/i);
            const timerMinutes = match ? parseInt(match[1], 10) : 0;
            return { stepNum: i + 1, title, text, timerMinutes };
        });

        let currentStepIndex = 0;

        let modal = document.getElementById('kitchen-cooking-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'kitchen-cooking-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #080808;
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 30px 40px;
            color: #FFFFFF;
            font-family: 'Outfit', sans-serif;
            overflow-y: auto;
        `;

        function renderStep() {
            const s = steps[currentStepIndex];
            const progressPct = ((currentStepIndex + 1) / steps.length) * 100;

            modal.innerHTML = `
                <!-- Header -->
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:18px;">
                    <div>
                        <span style="font-size:12px; font-weight:700; color:#B3DD24; letter-spacing:1.5px; text-transform:uppercase;">
                            <i class="fa-solid fa-fire-burner"></i> In-Kitchen Focus Mode
                        </span>
                        <h2 style="font-size:22px; font-weight:800; color:#FFF; margin-top:4px;">${recipeTitle}</h2>
                    </div>
                    <button type="button" id="btn-close-cooking-mode" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#FFF; font-size:16px; padding:8px 16px; border-radius:20px; cursor:pointer; font-weight:700;">
                        <i class="fa-solid fa-xmark"></i> Exit (ESC)
                    </button>
                </div>

                <!-- Progress Bar -->
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin:20px 0; overflow:hidden;">
                    <div style="width:${progressPct}%; height:100%; background:#B3DD24; transition:width 0.3s ease;"></div>
                </div>

                <!-- Big Step Card -->
                <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; max-width:850px; margin:0 auto; padding:20px 0;">
                    <div style="width:54px; height:54px; border-radius:50%; background:#B3DD24; color:#000; font-size:24px; font-weight:900; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                        ${s.stepNum}
                    </div>
                    <span style="font-size:14px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:2px;">Step ${s.stepNum} of ${steps.length}</span>
                    <h1 style="font-size:36px; font-weight:800; color:#FFFFFF; margin:12px 0 20px; line-height:1.25;">${s.title}</h1>
                    <p style="font-size:20px; color:#CCCCCC; line-height:1.7; font-family:'Inter',sans-serif; max-width:760px;">${s.text}</p>

                    ${s.timerMinutes > 0 ? `
                        <!-- Step Countdown Timer -->
                        <div id="step-timer-box" style="margin-top:30px; background:rgba(179, 221, 36,0.06); border:1.5px solid #B3DD24; border-radius:18px; padding:18px 30px; display:inline-flex; align-items:center; gap:20px;">
                            <div style="text-align:left;">
                                <span style="font-size:11px; font-weight:700; color:#B3DD24; letter-spacing:1px; text-transform:uppercase;">Step Timer</span>
                                <div id="cooking-timer-digits" style="font-size:32px; font-weight:900; color:#FFF; font-family:monospace;">${s.timerMinutes < 10 ? '0' + s.timerMinutes : s.timerMinutes}:00</div>
                            </div>
                            <div style="display:flex; gap:10px;">
                                <button type="button" id="btn-timer-start" style="background:#B3DD24; color:#000; border:none; padding:10px 18px; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer;">
                                    <i class="fa-solid fa-play"></i> Start
                                </button>
                                <button type="button" id="btn-timer-reset" style="background:rgba(255,255,255,0.1); color:#FFF; border:none; padding:10px 14px; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer;">
                                    <i class="fa-solid fa-rotate-left"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Navigation Controls -->
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
                    <button type="button" id="btn-cooking-prev" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#FFF; padding:12px 24px; border-radius:14px; font-size:15px; font-weight:700; cursor:pointer; visibility:${currentStepIndex === 0 ? 'hidden' : 'visible'};">
                        <i class="fa-solid fa-arrow-left"></i> Previous Step
                    </button>

                    <span style="color:#666; font-size:13px; font-weight:600;">Use &larr; / &rarr; arrow keys to navigate</span>

                    ${currentStepIndex < steps.length - 1 ? `
                        <button type="button" id="btn-cooking-next" style="background:#B3DD24; color:#000; border:none; padding:12px 28px; border-radius:14px; font-size:15px; font-weight:800; cursor:pointer;">
                            Next Step <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    ` : `
                        <button type="button" id="btn-cooking-finish" style="background:#3ECF8E; color:#000; border:none; padding:12px 28px; border-radius:14px; font-size:15px; font-weight:800; cursor:pointer;">
                            <i class="fa-solid fa-check"></i> Complete Recipe!
                        </button>
                    `}
                </div>
            `;

            // Bind Actions
            document.getElementById('btn-close-cooking-mode').addEventListener('click', () => {
                if (activeCookingTimer) clearInterval(activeCookingTimer);
                modal.remove();
            });

            const prevBtn = document.getElementById('btn-cooking-prev');
            if (prevBtn) prevBtn.addEventListener('click', () => {
                if (currentStepIndex > 0) {
                    if (activeCookingTimer) clearInterval(activeCookingTimer);
                    currentStepIndex--;
                    renderStep();
                }
            });

            const nextBtn = document.getElementById('btn-cooking-next');
            if (nextBtn) nextBtn.addEventListener('click', () => {
                if (currentStepIndex < steps.length - 1) {
                    if (activeCookingTimer) clearInterval(activeCookingTimer);
                    currentStepIndex++;
                    renderStep();
                }
            });

            const finishBtn = document.getElementById('btn-cooking-finish');
            if (finishBtn) finishBtn.addEventListener('click', () => {
                if (activeCookingTimer) clearInterval(activeCookingTimer);
                modal.remove();
                showToast('Chef Approved! Recipe Completed.', 'fa-trophy', 'gold');
            });

            // Bind Timer
            if (s.timerMinutes > 0) {
                let isRunning = false;
                timerRemainingSecs = s.timerMinutes * 60;
                const digitsEl = document.getElementById('cooking-timer-digits');
                const startBtn = document.getElementById('btn-timer-start');
                const resetBtn = document.getElementById('btn-timer-reset');

                startBtn.addEventListener('click', () => {
                    if (isRunning) {
                        clearInterval(activeCookingTimer);
                        isRunning = false;
                        startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Resume`;
                    } else {
                        isRunning = true;
                        startBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause`;
                        activeCookingTimer = setInterval(() => {
                            if (timerRemainingSecs > 0) {
                                timerRemainingSecs--;
                                const m = Math.floor(timerRemainingSecs / 60);
                                const sec = timerRemainingSecs % 60;
                                digitsEl.textContent = `${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
                            } else {
                                clearInterval(activeCookingTimer);
                                isRunning = false;
                                playTimerChime();
                                showToast(`Timer Finished for Step ${s.stepNum}!`, 'fa-bell', 'gold');
                                startBtn.innerHTML = `<i class="fa-solid fa-check"></i> Done`;
                            }
                        }, 1000);
                    }
                });

                resetBtn.addEventListener('click', () => {
                    clearInterval(activeCookingTimer);
                    isRunning = false;
                    timerRemainingSecs = s.timerMinutes * 60;
                    const m = s.timerMinutes;
                    digitsEl.textContent = `${m < 10 ? '0' + m : m}:00`;
                    startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
                });
            }
        }

        document.body.appendChild(modal);
        renderStep();

        // Keyboard navigation
        const keyHandler = (e) => {
            if (!document.getElementById('kitchen-cooking-modal')) {
                window.removeEventListener('keydown', keyHandler);
                return;
            }
            if (e.key === 'Escape') {
                if (activeCookingTimer) clearInterval(activeCookingTimer);
                modal.remove();
            } else if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
                if (activeCookingTimer) clearInterval(activeCookingTimer);
                currentStepIndex++;
                renderStep();
            } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
                if (activeCookingTimer) clearInterval(activeCookingTimer);
                currentStepIndex--;
                renderStep();
            }
        };
        window.addEventListener('keydown', keyHandler);
    }

    // ---- Smart Weekly Grocery & Meal Prep List Aggregator ----
    function getMealBasket() {
        try {
            return JSON.parse(localStorage.getItem('gym_meal_basket') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveMealBasket(basket) {
        localStorage.setItem('gym_meal_basket', JSON.stringify(basket));
        updateBasketFloatingBadge();
    }

    function addToMealBasket(recipe) {
        const basket = getMealBasket();
        if (basket.some(item => item.id === recipe.id)) {
            showToast(`"${recipe.title}" is already in your weekly meal prep basket!`, 'fa-info-circle', 'gold');
            return;
        }
        basket.push(recipe);
        saveMealBasket(basket);
        showToast(`Added "${recipe.title}" to Meal Prep Basket!`, 'fa-cart-plus', 'green');
    }

    function removeFromMealBasket(recipeId) {
        let basket = getMealBasket();
        basket = basket.filter(item => item.id !== recipeId);
        saveMealBasket(basket);
        renderGroceryDrawer();
        showToast('Item removed from Meal Prep Basket', 'fa-trash', 'gold');
    }

    function updateBasketFloatingBadge() {
        const basket = getMealBasket();
        let badge = document.getElementById('floating-meal-basket-badge');
        let countDisplay = document.getElementById('basket-items-count');

        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'floating-meal-basket-badge';
            badge.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 30px;
                background: #B3DD24;
                color: #000000;
                padding: 12px 20px;
                border-radius: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(179, 221, 36,0.3);
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Outfit', sans-serif;
                font-weight: 800;
                font-size: 13.5px;
                cursor: pointer;
                z-index: 99999;
                transition: transform 0.2s ease;
            `;

            badge.innerHTML = `
                <i class="fa-solid fa-basket-shopping" style="font-size:16px;"></i>
                <span>Weekly Meal Prep (<span id="basket-items-count">0</span>)</span>
            `;

            badge.addEventListener('mouseenter', () => badge.style.transform = 'scale(1.05)');
            badge.addEventListener('mouseleave', () => badge.style.transform = 'scale(1)');
            badge.addEventListener('click', openGroceryDrawer);

            document.body.appendChild(badge);
        }

        if (countDisplay) {
            countDisplay.textContent = basket.length;
        } else {
            const innerCount = document.getElementById('basket-items-count');
            if (innerCount) innerCount.textContent = basket.length;
        }

        badge.style.display = basket.length > 0 ? 'flex' : 'none';
    }

    function openGroceryDrawer() {
        let drawer = document.getElementById('grocery-slide-drawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'grocery-slide-drawer';
            drawer.style.cssText = `
                position: fixed;
                top: 0; right: -480px; width: 450px; max-width: 90vw; height: 100vh;
                background: #0E0E0E;
                border-left: 1px solid rgba(179, 221, 36,0.3);
                box-shadow: -15px 0 40px rgba(0,0,0,0.8);
                z-index: 999999;
                display: flex;
                flex-direction: column;
                padding: 24px;
                font-family: 'Outfit', sans-serif;
                color: #FFFFFF;
                transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            document.body.appendChild(drawer);
        }

        renderGroceryDrawer();

        requestAnimationFrame(() => {
            drawer.style.right = '0';
        });
    }

    function closeGroceryDrawer() {
        const drawer = document.getElementById('grocery-slide-drawer');
        if (drawer) {
            drawer.style.right = '-480px';
        }
    }

    function renderGroceryDrawer() {
        const drawer = document.getElementById('grocery-slide-drawer');
        if (!drawer) return;

        const basket = getMealBasket();

        // Aggregate All Ingredients
        const aggregated = {};
        basket.forEach(r => {
            if (r.ingredients && Array.isArray(r.ingredients)) {
                r.ingredients.forEach(ing => {
                    const key = ing.name.trim();
                    if (!aggregated[key]) {
                        aggregated[key] = [];
                    }
                    aggregated[key].push(ing.amount);
                });
            }
        });

        const totalCals = basket.reduce((sum, r) => sum + (r.calories || 0), 0);
        const totalPro = basket.reduce((sum, r) => sum + (r.protein || 0), 0);

        let itemsHtml = '';
        if (Object.keys(aggregated).length === 0) {
            itemsHtml = `
                <div style="text-align:center; padding:40px 10px; color:#777;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:36px; color:#444; margin-bottom:12px;"></i>
                    <p style="font-size:14px;">Your meal prep basket is empty.<br>Add dishes to generate your shopping list!</p>
                </div>
            `;
        } else {
            itemsHtml = Object.keys(aggregated).map(name => {
                const amounts = aggregated[name].join(' + ');
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#161616; padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:13px;">
                        <span style="font-weight:600; color:#FFF;">${name}</span>
                        <span style="background:rgba(179, 221, 36,0.12); color:#B3DD24; padding:2px 8px; border-radius:6px; font-weight:700; font-size:11.5px;">${amounts}</span>
                    </div>
                `;
            }).join('');
        }

        drawer.innerHTML = `
            <!-- Drawer Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:16px;">
                <div>
                    <h3 style="font-size:18px; font-weight:800; color:#FFF; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-clipboard-list text-gold" style="color:#B3DD24;"></i> Weekly Grocery List
                    </h3>
                    <span style="font-size:12px; color:#888;">${basket.length} Planned Meals | ${totalCals} kcal | ${totalPro}g Pro</span>
                </div>
                <button type="button" id="btn-close-grocery-drawer" style="background:none; border:none; color:#AAA; font-size:20px; cursor:pointer;">&times;</button>
            </div>

            <!-- Planned Meals Strip -->
            <div style="margin:16px 0; max-height:120px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                ${basket.map(r => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:6px 10px; border-radius:6px; font-size:12px;">
                        <span style="color:#DDD;">${r.title}</span>
                        <button type="button" onclick="window.HanumanInteractive.removeFromBasket('${r.id}')" style="background:none; border:none; color:#FF5555; cursor:pointer; font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                `).join('')}
            </div>

            <div style="font-size:12px; font-weight:700; color:#B3DD24; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">
                Aggregated Ingredients (${Object.keys(aggregated).length} items)
            </div>

            <!-- Aggregated Ingredients List -->
            <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:4px;">
                ${itemsHtml}
            </div>

            <!-- Bottom Actions -->
            <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:16px; margin-top:16px; display:flex; flex-direction:column; gap:10px;">
                <button type="button" id="btn-copy-grocery-list" style="background:#B3DD24; color:#000; border:none; padding:12px; border-radius:10px; font-weight:800; font-size:13.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class="fa-solid fa-copy"></i> Copy Full Shopping List
                </button>
                <button type="button" id="btn-clear-grocery-basket" style="background:transparent; color:#888; border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:10px; font-weight:600; font-size:12px; cursor:pointer;">
                    Clear Meal Prep Basket
                </button>
            </div>
        `;

        document.getElementById('btn-close-grocery-drawer').addEventListener('click', closeGroceryDrawer);

        const copyBtn = document.getElementById('btn-copy-grocery-list');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                let text = `🏋️ HANUMAN GYM — WEEKLY MEAL PREP SHOPPING LIST\n\n`;
                text += `Planned Meals (${basket.length}):\n`;
                basket.forEach(b => text += ` • ${b.title} (${b.calories} kcal, ${b.protein}g Pro)\n`);
                text += `\n🛒 INGREDIENTS TO BUY:\n`;
                Object.keys(aggregated).forEach(name => {
                    text += ` [ ] ${name} — ${aggregated[name].join(' + ')}\n`;
                });
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Shopping List Copied to Clipboard!', 'fa-check-double', 'gold');
                });
            });
        }

        const clearBtn = document.getElementById('btn-clear-grocery-basket');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                saveMealBasket([]);
                renderGroceryDrawer();
                showToast('Cleared weekly meal prep basket', 'fa-trash', 'gold');
            });
        }
    }

    // ---- Bookmark & Daily Nutrition Logger ----
    function initSaveRecipeAction() {
        const saveBtns = document.querySelectorAll('.btn-recipe-action, .btn-save-recipe');
        saveBtns.forEach(btn => {
            if (btn.textContent.includes('Save') || btn.querySelector('.fa-bookmark')) {
                btn.removeAttribute('onclick');
                btn.addEventListener('click', () => {
                    const title = document.querySelector('.recipe-title')?.textContent?.trim() || document.title;
                    const url = window.location.href;
                    let saved = [];
                    try {
                        saved = JSON.parse(localStorage.getItem('gym_saved_recipes') || '[]');
                    } catch (e) {
                        saved = [];
                    }

                    const existingIndex = saved.findIndex(item => item.title === title || item.url === url);
                    if (existingIndex >= 0) {
                        saved.splice(existingIndex, 1);
                        localStorage.setItem('gym_saved_recipes', JSON.stringify(saved));
                        btn.style.color = 'var(--text-muted)';
                        btn.style.borderColor = 'var(--border)';
                        showToast(`Removed "${title}" from My Space bookmarks`, 'fa-bookmark', 'gold');
                    } else {
                        saved.push({
                            title: title,
                            url: url,
                            savedAt: new Date().toISOString(),
                            category: document.querySelector('.recipe-category-pill')?.textContent?.trim() || 'Nutrition'
                        });
                        localStorage.setItem('gym_saved_recipes', JSON.stringify(saved));
                        btn.style.color = '#B3DD24';
                        btn.style.borderColor = '#B3DD24';
                        showToast(`Saved "${title}" to your My Space nutrition bookmarks!`, 'fa-bookmark', 'gold');
                    }
                });
            }
        });
    }

    function initLogMealAction() {
        const actionsContainer = document.querySelector('.recipe-actions-quick');
        if (!actionsContainer) return;

        if (!document.getElementById('btn-log-meal-quick')) {
            const logBtn = document.createElement('button');
            logBtn.id = 'btn-log-meal-quick';
            logBtn.type = 'button';
            logBtn.className = 'btn-recipe-action';
            logBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> <span>Log to Nutrition</span>`;
            
            logBtn.addEventListener('click', () => {
                const title = document.querySelector('.recipe-title')?.textContent?.trim() || 'Gym Meal';
                const calEl = document.querySelector('.macro-box:nth-child(1) .macro-val');
                const proEl = document.querySelector('.macro-box:nth-child(2) .macro-val');
                const calories = calEl ? parseInt(calEl.textContent, 10) : 350;
                const protein = proEl ? parseInt(proEl.textContent, 10) : 25;

                let logged = [];
                try {
                    logged = JSON.parse(localStorage.getItem('gym_logged_nutrition') || '[]');
                } catch (e) {
                    logged = [];
                }

                logged.push({
                    mealName: title,
                    calories: calories,
                    protein: protein,
                    servings: currentServings,
                    loggedAt: new Date().toISOString()
                });
                localStorage.setItem('gym_logged_nutrition', JSON.stringify(logged));

                showToast(`Logged ${calories} kcal & ${protein}g Protein to daily tracker!`, 'fa-fire-flame-curved', 'green');
            });

            actionsContainer.appendChild(logBtn);
        }
    }

    // Expose Global Object for inline button access
    window.HanumanInteractive = {
        addToBasket: addToMealBasket,
        removeFromBasket: removeFromMealBasket,
        openGroceryDrawer: openGroceryDrawer,
        showToast: showToast
    };

    // Auto initialize on DOM Ready
    function initAll() {
        initServingsScaler();
        initCookingMode();
        initSaveRecipeAction();
        initLogMealAction();
        updateBasketFloatingBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
