// ==============================================================================
// HANUMAN GYM - TRAINERS DIRECTORY CONTROLLER
// High-performance real-time search, multi-branch filtering, matchmaker quiz, and 1-click consultation
// ==============================================================================

const trainers = window.GYM_TRAINERS_CATALOG || [];
let activeCategory = 'all';
let activeBranch = 'all';
let currentSearchQuery = '';
let selectedConsultTrainerId = null;

// Category mapping helper
function getTrainerCategory(trainer) {
    const spec = (trainer.specialization || '').toLowerCase();
    if (spec.includes('strength') || spec.includes('powerlifting') || spec.includes('muscle') || spec.includes('hypertrophy') || spec.includes('crossfit') || spec.includes('bodybuilding')) {
        return 'strength';
    }
    if (spec.includes('cardio') || spec.includes('hiit') || spec.includes('zumba') || spec.includes('dance')) {
        return 'cardio';
    }
    if (spec.includes('yoga') || spec.includes('mobility') || spec.includes('rehabilitation') || spec.includes('rehab')) {
        return 'yoga';
    }
    if (spec.includes('boxing') || spec.includes('combat') || spec.includes('strike')) {
        return 'combat';
    }
    if (spec.includes('nutrition') || spec.includes('diet') || spec.includes('recomposition')) {
        return 'nutrition';
    }
    return 'strength';
}

// Face Positioning Class Helper
function getTrainerImagePosClass(imgUrl) {
    const src = (imgUrl || '').toLowerCase();
    if (src.includes('pradeep')) return 'img-pos-pradeep';
    if (src.includes('rakhi')) return 'img-pos-rakhi';
    if (src.includes('shravan')) return 'img-pos-shravan';
    if (src.includes('prachi')) return 'img-pos-prachi';
    if (src.includes('krunal')) return 'img-pos-krunal';
    if (src.includes('satyam')) return 'img-pos-satyam';
    if (src.includes('tanvi')) return 'img-pos-tanvi';
    if (src.includes('yash')) return 'img-pos-yash';
    if (src.includes('sahil')) return 'img-pos-sahil';
    if (src.includes('sumit')) return 'img-pos-sumit';
    if (src.includes('aniruddha')) return 'img-pos-aniruddha';
    if (src.includes('shruti')) return 'img-pos-shruti';
    return 'img-pos-default';
}

// Function to create an executive trainer card HTML
function createTrainerCard(trainer) {
    const expStat = trainer.stats.experience || '5+';
    const volumeStat = trainer.stats.clients || trainer.stats.classes || trainer.stats.competitions || '250+';
    const volumeLabel = trainer.stats.clients ? 'Athletes' : trainer.stats.classes ? 'Classes' : 'Events';
    const certsStat = trainer.stats.certifications || '5';
    const branchName = trainer.branch || 'All Branches';
    const ratingVal = trainer.rating ? trainer.rating.toFixed(1) : '4.9';
    const reviewsVal = trainer.reviewsCount || 40;
    const shiftVal = trainer.shift || 'Full Day';
    const rateText = trainer.rate || 'From ₹799/session';
    const posClass = getTrainerImagePosClass(trainer.image);

    const achievements = (trainer.achievements || []).slice(0, 2).map(ach => `
        <li><i class="fa-solid fa-circle-check"></i> <span>${ach}</span></li>
    `).join('');

    return `
        <div class="trainer-card" data-category="${getTrainerCategory(trainer)}" data-branch="${branchName.toLowerCase()}">
            <div class="trainer-image-wrapper">
                <img src="${trainer.image}" alt="${trainer.name} - ${trainer.specialization}" class="trainer-card-image ${posClass}" loading="lazy" onerror="this.src='images/Shravan.jpg'">
                <div class="trainer-image-overlay"></div>
                
                <div class="trainer-top-badges">
                    <span class="branch-badge"><i class="fa-solid fa-location-dot"></i> ${branchName}</span>
                    <span class="rating-badge"><i class="fa-solid fa-star"></i> ${ratingVal} (${reviewsVal})</span>
                </div>
                
                <div class="trainer-specialization-pill">${trainer.specialization}</div>
            </div>

            <div class="trainer-card-content">
                <h3 class="trainer-card-name">${trainer.name}</h3>
                <div class="trainer-shift-info">
                    <i class="fa-solid fa-clock"></i> ${shiftVal}
                </div>

                <!-- Telemetry Stats -->
                <div class="trainer-stats-strip">
                    <div class="stat-cell">
                        <div class="stat-cell-num">${expStat}</div>
                        <div class="stat-cell-lbl">Yrs Exp</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-cell-num">${volumeStat}</div>
                        <div class="stat-cell-lbl">${volumeLabel}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-cell-num">${certsStat}</div>
                        <div class="stat-cell-lbl">Certs</div>
                    </div>
                </div>

                <!-- Key Credentials -->
                <ul class="trainer-achievements-list">
                    ${achievements}
                </ul>

                <!-- Pricing Indicator -->
                <div class="trainer-rate-row">
                    <span>Coaching Rate:</span>
                    <strong>${rateText}</strong>
                </div>

                <!-- CTAs -->
                <div class="trainer-card-actions">
                    <button class="action-btn profile-btn" onclick="selectTrainer(${trainer.id})">
                        <i class="fa-solid fa-id-badge"></i> Profile
                    </button>
                    <button class="action-btn join-btn" onclick="openConsultationModal(${trainer.id})">
                        <i class="fa-solid fa-calendar-check"></i> Book PT
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Function to filter & render trainer cards
function renderTrainerCards() {
    const trainersGrid = document.getElementById('trainersGrid');
    if (!trainersGrid) return;

    const query = currentSearchQuery.toLowerCase().trim();

    const filtered = trainers.filter(t => {
        const cat = getTrainerCategory(t);
        const branch = (t.branch || '').toLowerCase();
        
        // Category Match
        let catMatch = false;
        if (activeCategory === 'all') {
            catMatch = true;
        } else {
            catMatch = cat === activeCategory;
        }

        // Branch Match
        let branchMatch = false;
        if (activeBranch === 'all') {
            branchMatch = true;
        } else if (branch.includes('all')) {
            branchMatch = true;
        } else {
            branchMatch = branch.includes(activeBranch.toLowerCase());
        }

        // Search Query Match
        let searchMatch = true;
        if (query.length > 0) {
            const nameMatch = (t.name || '').toLowerCase().includes(query);
            const specMatch = (t.specialization || '').toLowerCase().includes(query);
            const bioMatch = (t.bio || '').toLowerCase().includes(query);
            const branchTextMatch = (t.branch || '').toLowerCase().includes(query);
            searchMatch = nameMatch || specMatch || bioMatch || branchTextMatch;
        }

        return catMatch && branchMatch && searchMatch;
    });

    if (filtered.length === 0) {
        trainersGrid.innerHTML = `
            <div class="empty-search-state">
                <i class="fa-solid fa-user-slash"></i>
                <h3>No Master Coaches Found</h3>
                <p>No trainers match your current search and filters. Try another keyword or reset filters.</p>
                <button class="filter-chip active" style="margin-top: 18px; display: inline-flex;" onclick="resetSearch()">View All 12 Coaches</button>
            </div>
        `;
    } else {
        trainersGrid.innerHTML = filtered.map(t => createTrainerCard(t)).join('');
    }
}

// Interactive Category Filter
function filterTrainers(category, btnElement) {
    activeCategory = category;
    
    if (btnElement) {
        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }

    renderTrainerCards();
}

// Interactive Branch Filter
function handleBranchFilter(branchVal) {
    activeBranch = branchVal || 'all';
    renderTrainerCards();
}

// Live search handler
function handleSearch(val) {
    currentSearchQuery = val || '';
    renderTrainerCards();
}

function resetSearch() {
    currentSearchQuery = '';
    activeCategory = 'all';
    activeBranch = 'all';
    
    const searchInput = document.getElementById('trainerSearch');
    if (searchInput) searchInput.value = '';
    
    const branchSelect = document.getElementById('branchFilterSelect');
    if (branchSelect) branchSelect.value = 'all';

    const allChip = document.querySelector('.filter-chip');
    if (allChip) filterTrainers('all', allChip);
    else filterTrainers('all', null);
}

// Function to handle trainer selection & profile redirect
function selectTrainer(trainerId) {
    const selectedTrainer = trainers.find(t => t.id === trainerId);
    if (selectedTrainer) {
        localStorage.setItem('selectedTrainer', JSON.stringify(selectedTrainer));
        window.location.href = 'trainer-details.html';
    }
}

// ==============================================================================
// 1-CLICK CONSULTATION MODAL LOGIC
// ==============================================================================
function openConsultationModal(trainerId) {
    selectedConsultTrainerId = trainerId;
    const t = trainers.find(item => item.id === trainerId);
    
    const titleEl = document.getElementById('consultTrainerTitle');
    const branchInput = document.getElementById('consultBranch');
    
    if (t) {
        if (titleEl) titleEl.textContent = `${t.name} (${t.specialization})`;
        if (branchInput && t.branch && !t.branch.includes('All')) {
            branchInput.value = t.branch;
        }
    } else {
        if (titleEl) titleEl.textContent = 'A Master Coach';
    }
    
    const modal = document.getElementById('consultationModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeConsultationModal() {
    const modal = document.getElementById('consultationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleConsultOverlayClick(e) {
    if (e.target.id === 'consultationModal') closeConsultationModal();
}

async function handleConsultationSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btnConsultSubmit');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reserving Slot...';
    }

    const t = trainers.find(item => item.id === selectedConsultTrainerId);
    const trainerName = t ? t.name : 'Master Coach';
    
    const payload = {
        name: document.getElementById('consultName').value.trim(),
        phone: document.getElementById('consultPhone').value.trim(),
        email: document.getElementById('consultEmail').value.trim(),
        branch: document.getElementById('consultBranch').value,
        timeSlot: document.getElementById('consultSlot').value,
        goal: document.getElementById('consultGoal').value,
        trainerName: trainerName,
        createdAt: new Date().toISOString()
    };

    if (window.GymCloudStore) {
        GymCloudStore.recordTrainerSubscription({
            id: 'pt_lead_' + Date.now(),
            customerName: payload.name,
            customerEmail: payload.email,
            customerPhone: payload.phone,
            planName: `1-on-1 PT Consult with ${trainerName} (${payload.timeSlot})`,
            amount: 0,
            paymentId: 'free_consultation',
            branch: payload.branch,
            createdAt: payload.createdAt
        });
    }

    try {
        if (window.GymApiClient) {
            await GymApiClient.createInquiry({
                name: payload.name,
                phone: payload.phone,
                email: payload.email,
                location: payload.branch,
                inquiry_type: 'pt_consultation',
                message: `[PT Consultation with ${trainerName}] Slot: ${payload.timeSlot}, Goal: ${payload.goal}`
            });
        }
    } catch (err) {
        console.warn('API client inquiry notice:', err);
    }

    const feedback = document.getElementById('consultSuccessFeedback');
    if (feedback) feedback.style.display = 'block';
    
    if (btn) {
        btn.style.display = 'none';
    }

    setTimeout(() => {
        closeConsultationModal();
        if (btn) {
            btn.style.display = 'inline-flex';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-lock"></i> Confirm Consultation Slot';
        }
        if (feedback) feedback.style.display = 'none';
        document.getElementById('consultationForm')?.reset();
    }, 2800);
}

// ==============================================================================
// COACH MATCHMAKER QUIZ LOGIC
// ==============================================================================
let quizAnswers = { goal: null, branch: null, level: null };

function openMatchmakerQuiz() {
    quizAnswers = { goal: null, branch: null, level: null };
    showQuizStep(1);
    
    const modal = document.getElementById('matchmakerModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeMatchmakerQuiz() {
    const modal = document.getElementById('matchmakerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleMatchmakerOverlayClick(e) {
    if (e.target.id === 'matchmakerModal') closeMatchmakerQuiz();
}

function showQuizStep(stepNum) {
    document.querySelectorAll('.quiz-step-panel').forEach(p => p.style.display = 'none');
    const target = document.getElementById('quizStep' + stepNum);
    if (target) target.style.display = 'block';
}

function selectQuizOption(type, value, btnEl) {
    quizAnswers[type] = value;
    
    // UI highlight
    btnEl.closest('.quiz-options-grid').querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
    
    if (type === 'goal') {
        setTimeout(() => showQuizStep(2), 250);
    } else if (type === 'branch') {
        setTimeout(() => showQuizStep(3), 250);
    } else if (type === 'level') {
        setTimeout(() => calculateQuizMatch(), 250);
    }
}

function calculateQuizMatch() {
    showQuizStep(4);
    
    // Find best coach match
    let match = trainers.find(t => {
        const cat = getTrainerCategory(t);
        const branchMatch = (t.branch || '').toLowerCase().includes(quizAnswers.branch ? quizAnswers.branch.toLowerCase() : '');
        return cat === quizAnswers.goal && branchMatch;
    });

    if (!match) {
        match = trainers.find(t => getTrainerCategory(t) === quizAnswers.goal) || trainers[0];
    }

    const resCard = document.getElementById('quizResultCoachCard');
    if (resCard && match) {
        const matchPosClass = getTrainerImagePosClass(match.image);
        resCard.innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;background:var(--bg-card);border:1.5px solid var(--accent-gold);border-radius:14px;padding:16px;margin:16px 0;text-align:left;">
                <img src="${match.image}" class="${matchPosClass}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid var(--accent-gold);" onerror="this.src='images/Shravan.jpg'">
                <div>
                    <span class="branch-badge" style="margin-bottom:4px;display:inline-block;"><i class="fa-solid fa-location-dot"></i> ${match.branch}</span>
                    <h4 style="font-family:var(--font-heading);font-size:18px;font-weight:800;color:#fff;text-transform:uppercase;">${match.name}</h4>
                    <p style="font-size:12px;color:var(--accent-gold);margin-bottom:2px;">${match.specialization}</p>
                    <p style="font-size:11.5px;color:var(--text-muted);">${match.stats.experience} years &bull; ${match.rating} ★ (${match.reviewsCount} reviews)</p>
                </div>
            </div>
            <div style="display:flex;gap:10px;">
                <button class="action-btn join-btn" style="flex:1;" onclick="closeMatchmakerQuiz();openConsultationModal(${match.id})">
                    <i class="fa-solid fa-calendar-check"></i> Book Consultation with ${match.name}
                </button>
            </div>
        `;
    }
}

// ESC Key listener
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('consultationModal')?.style.display === 'flex') closeConsultationModal();
        if (document.getElementById('matchmakerModal')?.style.display === 'flex') closeMatchmakerQuiz();
    }
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    renderTrainerCards();
});
