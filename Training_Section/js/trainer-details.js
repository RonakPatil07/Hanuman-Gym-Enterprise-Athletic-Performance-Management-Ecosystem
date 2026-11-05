// Function to go back to trainers page
function goBack() {
    window.location.href = 'index.html';
}

// Function to open signup modal
function openModal(planName) {
    const modal = document.getElementById('signupModal');
    const planInput = document.getElementById('plan');
    const summaryPlan = document.getElementById('summaryPlan');
    const summaryPrice = document.getElementById('summaryPrice');
    const summaryTotal = document.getElementById('summaryTotal');
    const leftTrainerName = document.getElementById('leftTrainerName');
    const trainerName = document.getElementById('trainerName')?.textContent?.trim() || 'Assigned Trainer';
    
    if (modal && planInput) {
        // Reset to first step
        nextStep(1);
        
        // Populate plan data
        planInput.value = planName;
        if (summaryPlan) summaryPlan.textContent = planName + ' Plan';
        if (summaryPrice) summaryPrice.textContent = '₹' + (PLAN_AMOUNTS[planName] || 0).toLocaleString('en-IN');
        if (summaryTotal) summaryTotal.textContent = '₹' + (PLAN_AMOUNTS[planName] || 0).toLocaleString('en-IN');
        if (leftTrainerName) leftTrainerName.textContent = trainerName;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}

// Function to handle multi-step navigation
function nextStep(step) {
    const steps = document.querySelectorAll('.modal-step');
    const currentStepNum = document.getElementById('currentStepNum');
    const modalTitle = document.getElementById('modalTitle');
    
    // Validation for step 1
    if (step === 2) {
        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!name || !email || !phone) {
            alert('Please fill in all contact details.');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
    }

    steps.forEach(s => s.classList.remove('active'));
    const targetStep = document.getElementById('step' + step);
    if (targetStep) targetStep.classList.add('active');
    
    if (currentStepNum) currentStepNum.textContent = step;
    
    // Update Title
    if (modalTitle) {
        const titles = {
            1: 'Personal Information',
            2: 'Secure Checkout'
        };
        modalTitle.textContent = titles[step];
    }
}

// Function to handle payment method selection
function selectPayment(type) {
    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
    if (type === 'card') {
        document.querySelectorAll('.payment-method-card')[0].classList.add('active');
        document.getElementById('cardPaymentForm').style.display = 'block';
        document.getElementById('upiPaymentForm').style.display = 'none';
    } else {
        document.querySelectorAll('.payment-method-card')[1].classList.add('active');
        document.getElementById('cardPaymentForm').style.display = 'none';
        document.getElementById('upiPaymentForm').style.display = 'block';
    }
}

// Global exposure for HTML onclick
window.nextStep = nextStep;
window.selectPayment = selectPayment;

// Function to close signup modal
function closeModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; 
        // Reset form and steps
        document.getElementById('signupForm').reset();
        setTimeout(() => nextStep(1), 300);
    }
}

// Function to load trainer data from ?id= query or localStorage (same roster as admin)
function loadTrainerData() {
    let trainer = null;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam != null && window.GYM_TRAINERS_CATALOG) {
        const tid = parseInt(idParam, 10);
        if (!isNaN(tid)) {
            trainer = window.GYM_TRAINERS_CATALOG.find(function (x) {
                return x.id === tid;
            });
            if (trainer) {
                try {
                    localStorage.setItem('selectedTrainer', JSON.stringify(trainer));
                } catch (e) {}
            }
        }
    }
    if (!trainer) {
        const selectedTrainerData = localStorage.getItem('selectedTrainer');
        if (!selectedTrainerData) {
            window.location.href = 'index.html';
            return;
        }
        trainer = JSON.parse(selectedTrainerData);
    }
    
    // Update trainer information
    const trainerImage = document.getElementById('trainerImage');
    const trainerName = document.getElementById('trainerName');
    const trainerSpecialization = document.getElementById('trainerSpecialization');
    const trainerBio = document.getElementById('trainerBio');
    const trainerEmail = document.getElementById('trainerEmail');
    
    if (trainerImage) {
        trainerImage.src = trainer.image;
        trainerImage.alt = trainer.name;
        
        // Apply calibrated face positioning class
        trainerImage.className = '';
        const src = (trainer.image || '').toLowerCase();
        if (src.includes('shravan')) trainerImage.classList.add('img-pos-shravan');
        else if (src.includes('prachi')) trainerImage.classList.add('img-pos-prachi');
        else if (src.includes('pradeep')) trainerImage.classList.add('img-pos-pradeep');
        else if (src.includes('rakhi')) trainerImage.classList.add('img-pos-rakhi');
        else if (src.includes('krunal')) trainerImage.classList.add('img-pos-krunal');
        else if (src.includes('satyam')) trainerImage.classList.add('img-pos-satyam');
        else if (src.includes('tanvi')) trainerImage.classList.add('img-pos-tanvi');
        else if (src.includes('yash')) trainerImage.classList.add('img-pos-yash');
        else if (src.includes('sahil')) trainerImage.classList.add('img-pos-sahil');
        else if (src.includes('sumit')) trainerImage.classList.add('img-pos-sumit');
        else if (src.includes('aniruddha')) trainerImage.classList.add('img-pos-aniruddha');
        else if (src.includes('shruti')) trainerImage.classList.add('img-pos-shruti');
    }
    if (trainerName) trainerName.textContent = trainer.name;
    if (trainerSpecialization) trainerSpecialization.textContent = trainer.specialization;
    if (trainerBio) trainerBio.textContent = trainer.bio;
    if (trainerEmail) trainerEmail.textContent = trainer.email;
    
    // Update trainer stats
    const trainerStats = document.getElementById('trainerStats');
    if (trainerStats && trainer.stats) {
        const statsHtml = `
            <h4>Professional Statistics</h4>
            <div class="stats-grid">
                <div class="detail-stat-item">
                    <span class="detail-stat-number">${trainer.stats.experience}</span>
                    <span class="detail-stat-label">Years Experience</span>
                </div>
                <div class="detail-stat-item">
                    <span class="detail-stat-number">${trainer.stats.clients || trainer.stats.classes || trainer.stats.competitions}</span>
                    <span class="detail-stat-label">${trainer.stats.clients ? 'Clients Trained' : trainer.stats.classes ? 'Classes Taught' : 'Competitions'}</span>
                </div>
                <div class="detail-stat-item">
                    <span class="detail-stat-number">${trainer.stats.certifications}</span>
                    <span class="detail-stat-label">Certifications</span>
                </div>
            </div>
        `;
        trainerStats.innerHTML = statsHtml;
    }
    
    // Update trainer achievements
    const trainerAchievements = document.getElementById('trainerAchievements');
    if (trainerAchievements && trainer.achievements) {
        const achievementsHtml = `
            <h4>Professional Achievements</h4>
            <ul class="detail-achievements-list">
                ${trainer.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
        `;
        trainerAchievements.innerHTML = achievementsHtml;
    }
    
    // Update social media links
    const facebookLink = document.getElementById('facebookLink');
    const instagramLink = document.getElementById('instagramLink');
    const twitterLink = document.getElementById('twitterLink');
    
    if (facebookLink && trainer.social.facebook) {
        facebookLink.href = trainer.social.facebook;
    }
    if (instagramLink && trainer.social.instagram) {
        instagramLink.href = trainer.social.instagram;
    }
    if (twitterLink && trainer.social.twitter) {
        twitterLink.href = trainer.social.twitter;
    }
}

const PLAN_AMOUNTS = { Basic: 2400, Standard: 4000, Premium: 6500 };
const GYM_API_BASE = window.GYM_API_URL || 'http://localhost:5000/api';

// Function to handle form submission — records subscription in admin Payments
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const overlay = document.getElementById('processingOverlay');
    
    if (submitBtn) submitBtn.disabled = true;
    if (overlay) overlay.style.display = 'flex';
    
    // Simulate banking processing delay
    await new Promise(r => setTimeout(r, 2500));
    
    const formData = new FormData(event.target);
    const formObject = {};
    
    for (let [key, value] of formData.entries()) {
        formObject[key] = value;
    }

    const amount = PLAN_AMOUNTS[formObject.plan];
    const trainerName = document.getElementById('trainerName')?.textContent?.trim() || '';
    
    // Generate a unique ID to prevent duplicates in cloud sync
    const enrollmentId = window.GymCloudStore ? GymCloudStore.generateUid() : ('e_' + Date.now());

    const subscriptionPayload = {
        id: enrollmentId,
        customerName: formObject.fullName,
        customerEmail: formObject.email,
        customerPhone: formObject.phone,
        planName: formObject.plan,
        trainerName,
        amount,
    };

    if (window.GymCloudStore) {
        GymCloudStore.recordTrainerSubscription(subscriptionPayload);
    }

    // Sync with FastAPI Backend (Strictly FastAPI - No PHP Fallback)
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        if (window.GymApiClient) {
            await GymApiClient.savePurchase({
                item_name: `Trainer: ${trainerName} (${formObject.plan} Plan)`,
                item_price: amount,
                purchase_date: todayStr
            });
        }
    } catch (err) {
        console.warn('[FastAPI Trainer Purchase]', err.message);
    }

    try {
        const res = await fetch(`${GYM_API_BASE}/website/subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptionPayload),
        });
    } catch (err) {}

    if (overlay) overlay.style.display = 'none';
    showSuccessMessage(formObject);
    closeModal();
    
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

// Function to show success message
function showSuccessMessage(formData) {
    // Create success message HTML - Compact version
    const successMessage = `
        <div class="success-overlay" id="successOverlay">
            <div class="success-content compact">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Enrollment Submitted!</h3>
                <div class="success-details">
                    <p style="text-align:center; margin-bottom:15px;">Welcome to the community, <strong>${formData.fullName}</strong>!</p>
                    <div class="next-steps-compact">
                        <div class="step-mini"><i class="fas fa-envelope"></i> Confirmation email sent</div>
                        <div class="step-mini"><i class="fas fa-phone"></i> We'll call for orientation</div>
                        <div class="step-mini"><i class="fas fa-user"></i> Trainer assigned: <strong>${document.getElementById('trainerName')?.textContent || 'Expert'}</strong></div>
                    </div>
                    <div class="contact-mini">
                        <i class="fas fa-info-circle"></i> support@gym.com | (555) 123-4567
                    </div>
                </div>
                <button class="success-btn compact" onclick="closeSuccessMessage()">Great, Thanks!</button>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', successMessage);
    
    // Show with animation
    setTimeout(() => {
        const overlay = document.getElementById('successOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }, 100);
}

// Function to close success message
function closeSuccessMessage() {
    const overlay = document.getElementById('successOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load trainer data
    loadTrainerData();
    
    // Check if we should trigger the enrollment modal immediately
    if (localStorage.getItem('triggerEnrollment') === 'true') {
        localStorage.removeItem('triggerEnrollment');
        // Default to Standard plan if none specified
        setTimeout(() => openModal('Standard'), 500);
    }
    
    // Add form submission handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Add click outside modal to close
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Add click outside success message to close
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('success-overlay')) {
            closeSuccessMessage();
        }
    });
    
    // Add escape key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeSuccessMessage();
        }
    });
});
