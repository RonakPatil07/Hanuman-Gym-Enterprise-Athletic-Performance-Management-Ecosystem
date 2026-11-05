// Registration System
class RegistrationManager {
    constructor() {
        this.init();
    }

    init() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }

        // Set today's date as default for date inputs
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }

    handleRegistration(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        if (this.userExists(formData.email)) {
            this.showError('User with this email already exists. Please login instead.');
            return;
        }

        this.createUser(formData);
        this.showSuccess('Account created successfully! Redirecting to login...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            currentWeight: parseFloat(document.getElementById('currentWeight').value),
            targetWeight: parseFloat(document.getElementById('targetWeight').value),
            waterGoal: parseFloat(document.getElementById('waterGoal').value),
            calorieGoal: parseInt(document.getElementById('calorieGoal').value),
            workoutDays: parseInt(document.getElementById('workoutDays').value),
            fitnessGoal: document.getElementById('fitnessGoal').value
        };
    }

    validateForm(data) {
        // Basic validation
        if (!data.name || data.name.length < 2) {
            this.showError('Please enter a valid name (at least 2 characters).');
            return false;
        }

        if (!this.validateEmail(data.email)) {
            this.showError('Please enter a valid email address.');
            return false;
        }

        if (!data.phone || data.phone.length < 10) {
            this.showError('Please enter a valid phone number.');
            return false;
        }

        if (!data.address || data.address.length < 5) {
            this.showError('Please enter a valid address.');
            return false;
        }

        if (data.currentWeight <= 0 || data.currentWeight > 500) {
            this.showError('Please enter a valid current weight (1-500 kg).');
            return false;
        }

        if (data.targetWeight <= 0 || data.targetWeight > 500) {
            this.showError('Please enter a valid target weight (1-500 kg).');
            return false;
        }

        if (data.waterGoal < 1 || data.waterGoal > 10) {
            this.showError('Please enter a valid water goal (1-10 liters).');
            return false;
        }

        if (data.calorieGoal < 1000 || data.calorieGoal > 5000) {
            this.showError('Please enter a valid calorie goal (1000-5000 calories).');
            return false;
        }

        if (!data.workoutDays || data.workoutDays < 1 || data.workoutDays > 7) {
            this.showError('Please select valid workout days.');
            return false;
        }

        if (!data.fitnessGoal) {
            this.showError('Please select a fitness goal.');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    userExists(email) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return users.hasOwnProperty(email);
    }

    createUser(userData) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        const newUser = {
            profile: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                address: userData.address,
                currentWeight: userData.currentWeight,
                targetWeight: userData.targetWeight,
                waterGoal: userData.waterGoal,
                calorieGoal: userData.calorieGoal,
                workoutDays: userData.workoutDays,
                fitnessGoal: userData.fitnessGoal,
                registrationDate: new Date().toISOString()
            },
            workoutLogs: [],
            purchases: [],
            weightHistory: [{
                date: new Date().toISOString().split('T')[0],
                weight: userData.currentWeight
            }],
            waterHistory: [],
            calorieHistory: [],
            workoutHistory: [],
            exerciseHistory: []
        };

        users[userData.email] = newUser;
        localStorage.setItem('users', JSON.stringify(users));
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    showSuccess(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.style.background = '#d4edda';
            errorDiv.style.color = '#155724';
            errorDiv.style.border = '1px solid #c3e6cb';
            errorDiv.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize registration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();
});
