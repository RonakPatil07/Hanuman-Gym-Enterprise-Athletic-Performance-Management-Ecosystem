// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const currentUserEmail = localStorage.getItem('currentUser');
        if (currentUserEmail) {
            this.currentUser = this.getUser(currentUserEmail);
            if (this.currentUser) {
                this.redirectToDashboard();
            }
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address.');
            return;
        }

        const user = this.getUser(email);
        if (!user) {
            this.showError('User not found. Please register first.');
            return;
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', email);
        this.redirectToDashboard();
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    getUser(email) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return users[email] || null;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
