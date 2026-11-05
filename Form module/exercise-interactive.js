/**
 * ==============================================================================
 * Hanuman Gym - Unified Exercise & Movement Academy Interactive Controller
 * Enterprise Architecture: Deep-linking, Dual Data Store, Lazy Video Previews,
 * Pro Slow-Mo Video Modal & My Space Cloud Sync
 * ==============================================================================
 */

(function (global) {
    let allExercises = [];
    let activeBodyPart = 'all';
    let activeEquipment = 'all';
    let activeDifficulty = 'all';
    let activeBodySide = 'all';

    // Toast Notification System
    function showExerciseToast(msg, icon = 'fa-star', type = 'gold') {
        let container = document.getElementById('exercise-toast-box');
        if (!container) {
            container = document.createElement('div');
            container.id = 'exercise-toast-box';
            container.style.cssText = `
                position: fixed;
                bottom: 28px;
                right: 28px;
                z-index: 9999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'exercise-toast';
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
            <i class="fa-solid ${icon}" style="color:${type === 'gold' ? '#B3DD24' : '#3ECF8E'}; font-size:18px;"></i>
            <span>${msg}</span>
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

    // Flatten all exercises into master list
    function flattenAllExercises(data) {
        let list = [];
        Object.keys(data).forEach(cat => {
            if (Array.isArray(data[cat])) {
                list = list.concat(data[cat]);
            }
        });
        return list;
    }

    // URL State Synchronizer
    function updateUrlState(params) {
        try {
            const url = new URL(window.location.href);
            Object.keys(params).forEach(key => {
                if (params[key] && params[key] !== 'all') {
                    url.searchParams.set(key, params[key]);
                } else {
                    url.searchParams.delete(key);
                }
            });
            window.history.replaceState({}, '', url.toString());
        } catch (e) {
            // Ignore if URL API restricted
        }
    }

    function readUrlState() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            group: urlParams.get('group') || urlParams.get('muscle') || 'all',
            exercise: urlParams.get('exercise') || urlParams.get('ex') || null,
            search: urlParams.get('search') || urlParams.get('q') || '',
            equipment: urlParams.get('equipment') || 'all',
            difficulty: urlParams.get('difficulty') || 'all'
        };
    }

    // Card Renderer with Lazy-Loaded Video Preview
    function createExerciseCard(ex) {
        const hasVideo = !!ex.video;
        const videoSrc = hasVideo ? `./${ex.video}` : '';
        const isSaved = isExerciseSaved(ex.name);

        return `
            <div class="exercise-card" 
                 data-name="${ex.name}" 
                 data-category="${ex.category}" 
                 data-equipment="${ex.equipment}" 
                 data-difficulty="${ex.difficulty}">
                
                <div class="exercise-thumbnail-box" 
                     data-video-src="${videoSrc}"
                     onmouseenter="window.HanumanExercise.lazyPlayPreview(this)" 
                     onmouseleave="window.HanumanExercise.lazyPausePreview(this)"
                     onclick="window.HanumanExercise.openModal('${ex.name.replace(/'/g, "\\'")}')">
                    
                    ${hasVideo ? `
                        <video muted playsinline preload="none"></video>
                    ` : `
                        <i class="fa-solid fa-dumbbell" style="font-size:42px; color:rgba(179, 221, 36,0.3);"></i>
                    `}
                    <span class="card-equipment-badge"><i class="fa-solid fa-gear"></i> ${ex.equipment}</span>
                    <span class="card-duration-badge"><i class="fa-solid fa-layer-group"></i> ${ex.difficulty}</span>
                    <div class="play-circle-btn">
                        <i class="fa-solid fa-play" style="margin-left:3px;"></i>
                    </div>
                </div>

                <div class="exercise-card-content">
                    <h3 class="exercise-card-title">${ex.name}</h3>
                    <div class="exercise-target-muscles">
                        <i class="fa-solid fa-bullseye text-gold" style="color:#B3DD24;"></i>
                        <span>Primary: <strong>${ex.primaryMuscles}</strong></span>
                    </div>
                    <p class="exercise-card-desc">${ex.description}</p>

                    <div class="exercise-card-footer">
                        <button type="button" class="btn-open-technique" onclick="window.HanumanExercise.openModal('${ex.name.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-book-open-reader"></i> Technique Guide
                        </button>
                        <button type="button" class="btn-card-fav" title="Save Exercise" style="${isSaved ? 'color:#B3DD24; border-color:#B3DD24;' : ''}" onclick="window.HanumanExercise.toggleBookmark(this, '${ex.name.replace(/'/g, "\\'")}')">
                            <i class="${isSaved ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Lazy Video Preview Handlers
    function lazyPlayPreview(box) {
        const video = box.querySelector('video');
        const src = box.dataset.videoSrc;
        if (video && src) {
            if (!video.src || !video.src.includes(src.replace('./', ''))) {
                video.src = src;
            }
            video.play().catch(() => {});
        }
    }

    function lazyPausePreview(box) {
        const video = box.querySelector('video');
        if (video && video.src) {
            video.pause();
            video.currentTime = 0;
        }
    }

    // Main Filtering & Rendering Engine
    function renderExercises() {
        const searchInput = document.getElementById('exercise-search-input');
        const videosContainer = document.getElementById('videosContainer');
        const emptyState = document.getElementById('exercise-empty-state');
        const titleEl = document.getElementById('selectedBodyPartTitle');
        const countEl = document.getElementById('exercise-group-count');

        if (!videosContainer) return;

        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        let list = [];

        if (activeBodyPart === 'all' || query.length > 0) {
            list = allExercises;
        } else {
            list = allExercises.filter(ex => ex.category === activeBodyPart);
        }

        const filtered = list.filter(ex => {
            const matchesQuery = !query || ex.name.toLowerCase().includes(query) || (ex.primaryMuscles && ex.primaryMuscles.toLowerCase().includes(query)) || (ex.category && ex.category.toLowerCase().includes(query));
            const matchesEquip = activeEquipment === 'all' || ex.equipment === activeEquipment;
            const matchesDiff = activeDifficulty === 'all' || ex.difficulty === activeDifficulty;
            const matchesCat = (activeBodyPart === 'all' || query.length > 0) ? true : (ex.category === activeBodyPart);
            return matchesQuery && matchesEquip && matchesDiff && matchesCat;
        });

        if (filtered.length === 0) {
            videosContainer.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            videosContainer.innerHTML = filtered.map(ex => createExerciseCard(ex)).join('');
        }

        if (countEl) countEl.textContent = `Showing ${filtered.length} Exercise${filtered.length === 1 ? '' : 's'}`;

        if (activeBodyPart !== 'all' && query.length === 0) {
            const formattedName = activeBodyPart.charAt(0).toUpperCase() + activeBodyPart.slice(1);
            if (titleEl) titleEl.innerHTML = `${formattedName} <span>Technique Library</span>`;
        } else if (query.length > 0) {
            if (titleEl) titleEl.innerHTML = `Search: <span>"${query}"</span>`;
        } else {
            if (titleEl) titleEl.innerHTML = `All <span>Exercises & Form Library</span>`;
        }

        updateUrlState({ group: activeBodyPart, search: query, equipment: activeEquipment, difficulty: activeDifficulty });
    }

    function showBodyPartExercises(cat) {
        activeBodyPart = cat;
        const bodyPartsSection = document.getElementById('bodyPartsSection');
        const anatomyStrip = document.getElementById('anatomy-strip');
        const exerciseVideosSection = document.getElementById('exerciseVideos');

        if (bodyPartsSection) bodyPartsSection.style.display = 'none';
        if (anatomyStrip) anatomyStrip.style.display = 'none';
        if (exerciseVideosSection) {
            exerciseVideosSection.style.display = 'block';
            exerciseVideosSection.classList.add('show');
        }

        renderExercises();
        window.scrollTo({ top: 380, behavior: 'smooth' });
    }

    function showAllMuscleGroups() {
        activeBodyPart = 'all';
        const searchInput = document.getElementById('exercise-search-input');
        const bodyPartsSection = document.getElementById('bodyPartsSection');
        const anatomyStrip = document.getElementById('anatomy-strip');
        const exerciseVideosSection = document.getElementById('exerciseVideos');

        if (searchInput) searchInput.value = '';
        if (bodyPartsSection) bodyPartsSection.style.display = 'grid';
        if (anatomyStrip) anatomyStrip.style.display = 'flex';
        if (exerciseVideosSection) {
            exerciseVideosSection.style.display = 'none';
            exerciseVideosSection.classList.remove('show');
        }

        document.querySelectorAll('.body-part-card').forEach(c => c.classList.remove('active'));
        updateUrlState({ group: 'all', search: '' });
    }

    // Modal Video & Technique Player
    function openExerciseModal(name) {
        const ex = allExercises.find(e => e.name === name);
        if (!ex) return;

        let existing = document.getElementById('pro-video-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'pro-video-modal';
        modal.className = 'pro-video-modal-backdrop';

        const hasVideo = !!ex.video;
        const videoSrc = hasVideo ? `./${ex.video}` : '';
        const isSaved = isExerciseSaved(ex.name);

        modal.innerHTML = `
            <div class="pro-video-modal-dialog">
                <!-- Header -->
                <div class="modal-header-bar">
                    <div class="modal-header-info">
                        <span><i class="fa-solid fa-dumbbell text-gold"></i> ${ex.equipment} • ${ex.difficulty} • ${ex.mechanics}</span>
                        <h3>${ex.name}</h3>
                    </div>
                    <button type="button" class="btn-close-modal" id="btn-modal-close"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Body Grid -->
                <div class="modal-body-grid">
                    <!-- Left: Video Player Pane -->
                    <div class="video-player-pane">
                        <div class="video-wrapper">
                            ${hasVideo ? `
                                <video id="modal-active-video" src="${videoSrc}" controls autoplay loop playsinline></video>
                            ` : `
                                <div style="text-align:center; padding:50px 20px; color:#888;">
                                    <i class="fa-solid fa-video-slash" style="font-size:48px; color:#444; margin-bottom:14px;"></i>
                                    <h4 style="font-size:17px; color:#FFF; margin-bottom:6px;">Technique Blueprint Mode</h4>
                                    <p style="font-size:13px;">Follow the step-by-step coaching cues on the right for safe execution.</p>
                                </div>
                            `}
                        </div>

                        ${hasVideo ? `
                            <div class="video-controls-toolbar">
                                <div class="speed-control-group">
                                    <span style="color:#888;">Speed:</span>
                                    <button type="button" class="btn-speed-pill" data-speed="0.5">0.5x Slow-Mo</button>
                                    <button type="button" class="btn-speed-pill" data-speed="0.75">0.75x</button>
                                    <button type="button" class="btn-speed-pill active" data-speed="1.0">1.0x Normal</button>
                                </div>
                                <button type="button" class="btn-loop-toggle active" id="btn-loop-switch">
                                    <i class="fa-solid fa-repeat"></i> Loop Reps
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Right: Technique Coaching & Safety Cues -->
                    <div class="technique-cues-pane">
                        <div>
                            <div class="cues-block-title">
                                <i class="fa-solid fa-circle-check gold"></i> Step-by-Step Form Cues
                            </div>
                            <ul class="cues-checklist">
                                ${(ex.formCues || []).map(cue => `<li>${cue}</li>`).join('')}
                            </ul>
                        </div>

                        <div>
                            <div class="cues-block-title">
                                <i class="fa-solid fa-triangle-exclamation red"></i> Common Mistakes to Avoid
                            </div>
                            <ul class="cues-checklist mistakes-list">
                                ${(ex.commonMistakes || []).map(m => `<li>${m}</li>`).join('')}
                            </ul>
                        </div>

                        <div style="margin-top:auto; padding-top:16px; border-top:1px solid rgba(255,255,255,0.1); display:flex; gap:10px;">
                            <button type="button" id="btn-save-modal-ex" style="flex:1; background:${isSaved ? '#3ECF8E' : '#B3DD24'}; color:#000; border:none; padding:10px; border-radius:10px; font-weight:800; font-size:13px; cursor:pointer;">
                                <i class="${isSaved ? 'fa-solid fa-check' : 'fa-solid fa-star'}"></i> ${isSaved ? 'Saved in My Library' : 'Save to My Library'}
                            </button>
                            <a href="../custom workout plan/workout-plan.html" style="background:rgba(255,255,255,0.08); color:#FFF; padding:10px 14px; border-radius:10px; font-weight:700; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                                <i class="fa-solid fa-calendar-plus"></i> Add to Plan
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        updateUrlState({ exercise: ex.name });

        // Bind Modal Events
        const closeBtn = document.getElementById('btn-modal-close');
        const videoEl = document.getElementById('modal-active-video');

        const closeModal = () => {
            if (videoEl) videoEl.pause();
            modal.remove();
            updateUrlState({ exercise: null });
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // Speed Buttons
        const speedBtns = modal.querySelectorAll('.btn-speed-pill');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (videoEl) videoEl.playbackRate = parseFloat(btn.dataset.speed);
            });
        });

        // Loop Button
        const loopBtn = document.getElementById('btn-loop-switch');
        if (loopBtn && videoEl) {
            loopBtn.addEventListener('click', () => {
                videoEl.loop = !videoEl.loop;
                loopBtn.classList.toggle('active', videoEl.loop);
            });
        }

        // Save Button inside modal
        const saveModalBtn = document.getElementById('btn-save-modal-ex');
        if (saveModalBtn) {
            saveModalBtn.addEventListener('click', () => {
                toggleSaveExercise(null, ex.name);
                const updatedSaved = isExerciseSaved(ex.name);
                saveModalBtn.style.background = updatedSaved ? '#3ECF8E' : '#B3DD24';
                saveModalBtn.innerHTML = `<i class="${updatedSaved ? 'fa-solid fa-check' : 'fa-solid fa-star'}"></i> ${updatedSaved ? 'Saved in My Library' : 'Save to My Library'}`;
            });
        }
    }

    // Bookmark helpers
    function isExerciseSaved(name) {
        try {
            const saved = JSON.parse(localStorage.getItem('gym_saved_exercises') || '[]');
            return saved.includes(name);
        } catch (e) {
            return false;
        }
    }

    function toggleSaveExercise(btn, name) {
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem('gym_saved_exercises') || '[]');
        } catch (e) {
            saved = [];
        }

        const idx = saved.indexOf(name);
        const isNowSaved = idx < 0;

        if (!isNowSaved) {
            saved.splice(idx, 1);
            localStorage.setItem('gym_saved_exercises', JSON.stringify(saved));
            showExerciseToast(`Removed "${name}" from your saved exercises.`, 'fa-trash-can', 'gold');
        } else {
            saved.push(name);
            localStorage.setItem('gym_saved_exercises', JSON.stringify(saved));
            showExerciseToast(`Saved "${name}" to your My Space Exercise Library!`, 'fa-star', 'gold');

            // Sync with central Cloud Store if available
            if (window.GymCloudStore && typeof window.GymCloudStore.recordExerciseLog === 'function') {
                try {
                    window.GymCloudStore.recordExerciseLog({
                        exerciseName: name,
                        savedAt: new Date().toISOString()
                    });
                } catch (e) {}
            }
        }

        // Sync all matching buttons on current screen
        document.querySelectorAll(`.exercise-card[data-name="${name}"] .btn-card-fav`).forEach(favBtn => {
            favBtn.style.color = isNowSaved ? '#B3DD24' : '#AAAAAA';
            favBtn.style.borderColor = isNowSaved ? '#B3DD24' : 'var(--border)';
            const icon = favBtn.querySelector('i');
            if (icon) icon.className = isNowSaved ? 'fa-solid fa-star' : 'fa-regular fa-star';
        });
    }

    function resetExerciseFilters() {
        const searchInput = document.getElementById('exercise-search-input');
        if (searchInput) searchInput.value = '';
        activeEquipment = 'all';
        activeDifficulty = 'all';
        document.querySelectorAll('#equipment-filter-chips .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.equipment === 'all'));
        document.querySelectorAll('#difficulty-filter-chips .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.difficulty === 'all'));
        
        if (activeBodyPart === 'all') {
            showAllMuscleGroups();
        } else {
            renderExercises();
        }
    }

    // Master Initialization
    async function initExerciseAcademy() {
        try {
            if (window.GYM_EXERCISES_DATA && typeof window.GYM_EXERCISES_DATA === 'object') {
                allExercises = flattenAllExercises(window.GYM_EXERCISES_DATA);
            } else {
                const res = await fetch('data/exercises.json');
                if (!res.ok) throw new Error('Failed to load data/exercises.json');
                const data = await res.json();
                allExercises = flattenAllExercises(data);
            }

            // Bind DOM Listeners
            const searchInput = document.getElementById('exercise-search-input');
            const bodyPartsSection = document.getElementById('bodyPartsSection');
            const anatomyStrip = document.getElementById('anatomy-strip');
            const exerciseVideosSection = document.getElementById('exerciseVideos');

            // Body Card Click
            document.querySelectorAll('.body-part-card').forEach(card => {
                card.addEventListener('click', function () {
                    const part = this.dataset.bodyPart;
                    document.querySelectorAll('.body-part-card').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    showBodyPartExercises(part);
                });
            });

            // Instant Search Input with auto-collapse/expand
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    const q = searchInput.value.trim();
                    if (q.length > 0) {
                        if (bodyPartsSection) bodyPartsSection.style.display = 'none';
                        if (anatomyStrip) anatomyStrip.style.display = 'none';
                        if (exerciseVideosSection) {
                            exerciseVideosSection.style.display = 'block';
                            exerciseVideosSection.classList.add('show');
                        }
                    } else if (activeBodyPart === 'all') {
                        if (bodyPartsSection) bodyPartsSection.style.display = 'grid';
                        if (anatomyStrip) anatomyStrip.style.display = 'flex';
                        if (exerciseVideosSection) {
                            exerciseVideosSection.style.display = 'none';
                            exerciseVideosSection.classList.remove('show');
                        }
                    }
                    renderExercises();
                });
            }

            // Equipment Chips
            document.querySelectorAll('#equipment-filter-chips .filter-chip').forEach(chip => {
                chip.addEventListener('click', function () {
                    document.querySelectorAll('#equipment-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    activeEquipment = this.dataset.equipment;
                    renderExercises();
                });
            });

            // Difficulty Chips
            document.querySelectorAll('#difficulty-filter-chips .filter-chip').forEach(chip => {
                chip.addEventListener('click', function () {
                    document.querySelectorAll('#difficulty-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    activeDifficulty = this.dataset.difficulty;
                    renderExercises();
                });
            });

            // Anatomy View Toggles
            document.querySelectorAll('.btn-view-toggle').forEach(btn => {
                btn.addEventListener('click', function () {
                    document.querySelectorAll('.btn-view-toggle').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const view = this.dataset.view;
                    activeBodySide = view;

                    document.querySelectorAll('.body-part-card').forEach(card => {
                        const side = card.dataset.bodySide;
                        if (view === 'all' || side === view) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });

            // Read Initial URL State (Deep-Linking Router)
            const urlState = readUrlState();
            if (urlState.search && searchInput) {
                searchInput.value = urlState.search;
                showBodyPartExercises('all');
            } else if (urlState.group && urlState.group !== 'all') {
                showBodyPartExercises(urlState.group);
            }

            if (urlState.exercise) {
                openExerciseModal(urlState.exercise);
            }

        } catch (err) {
            console.error('Error initializing Exercise Academy:', err);
        }
    }

    // Expose global API
    global.HanumanExercise = {
        init: initExerciseAcademy,
        showGroup: showBodyPartExercises,
        showAll: showAllMuscleGroups,
        openModal: openExerciseModal,
        toggleBookmark: toggleSaveExercise,
        lazyPlayPreview: lazyPlayPreview,
        lazyPausePreview: lazyPausePreview,
        resetFilters: resetExerciseFilters
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExerciseAcademy);
    } else {
        initExerciseAcademy();
    }
})(typeof window !== "undefined" ? window : this);
