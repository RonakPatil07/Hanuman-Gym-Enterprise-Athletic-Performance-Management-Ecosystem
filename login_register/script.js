function showForm(formId) {
    // Hide all forms
    document.querySelectorAll(".login-form, .registration-form").forEach(form => form.classList.remove("active"));
    
    // Show the selected form
    const selectedForm = document.getElementById(formId);
    if (selectedForm) {
        selectedForm.classList.add("active");
    }

    // Update Welcome Text
    const title = document.querySelector(".welcome-title");
    const subtitle = document.querySelector(".welcome-subtitle");
    
    // Update Auth Tab Buttons
    const loginTab = document.getElementById("tab-login");
    const registerTab = document.getElementById("tab-register");

    if (formId === 'register-form') {
        if (title) title.innerText = "Join Us!";
        if (subtitle) subtitle.innerText = "Create your account and start your journey";
        if (registerTab) registerTab.classList.add("active");
        if (loginTab) loginTab.classList.remove("active");
    } else {
        if (title) title.innerText = "Welcome Back!";
        if (subtitle) subtitle.innerText = "Start your fitness journey today";
        if (loginTab) loginTab.classList.add("active");
        if (registerTab) registerTab.classList.remove("active");
    }
}

// Display error alert inside active form
function showAuthError(form, message) {
    let errBox = form.querySelector('.error-message');
    if (!errBox) {
        errBox = document.createElement('div');
        errBox.className = 'error-message';
        form.insertBefore(errBox, form.firstChild);
    }
    errBox.textContent = message;
    errBox.style.display = 'block';
    errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showAuthSuccess(form, message) {
    let succBox = form.querySelector('.success-message');
    if (!succBox) {
        succBox = document.createElement('div');
        succBox.className = 'success-message';
        form.insertBefore(succBox, form.firstChild);
    }
    succBox.textContent = message;
    succBox.style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function () {
    // Check if openRegister flag was set from landing page
    if (sessionStorage.getItem('openRegister') === 'true') {
        sessionStorage.removeItem('openRegister');
        showForm('register-form');
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            if (!window.GymApiClient) return; // Fallback to PHP POST if client not loaded
            e.preventDefault();

            const submitBtn = loginForm.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Signing In...";
            }

            const email = loginForm.querySelector("input[name='email']")?.value.trim();
            const password = loginForm.querySelector("input[name='password']")?.value;
            const remember = document.getElementById("remember")?.checked ?? true;

            try {
                const res = await GymApiClient.login(email, password, remember);
                if (res.success) {
                    showAuthSuccess(loginForm, "Login successful! Redirecting...");
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 500);
                }
            } catch (err) {
                showAuthError(loginForm, err.message || "Invalid email or password");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Login";
                }
            }
        });
    }

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            if (!window.GymApiClient) return;
            e.preventDefault();

            const submitBtn = registerForm.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Creating Account...";
            }

            const formData = new FormData(registerForm);
            const payload = {
                name: formData.get("name")?.toString().trim(),
                email: formData.get("email")?.toString().trim().toLowerCase(),
                password: formData.get("password")?.toString(),
                phone: formData.get("phone")?.toString().trim() || null,
                address: formData.get("address")?.toString().trim() || null,
                current_weight: formData.get("current_weight") ? parseFloat(formData.get("current_weight").toString()) : null,
                target_weight: formData.get("target_weight") ? parseFloat(formData.get("target_weight").toString()) : null,
                water_goal: formData.get("water_goal") ? parseFloat(formData.get("water_goal").toString()) : 2.50,
                calorie_goal: formData.get("calorie_goal") ? parseInt(formData.get("calorie_goal").toString(), 10) : 2200,
                workout_days: formData.get("workout_days") ? parseInt(formData.get("workout_days").toString(), 10) : 3,
                fitness_goal: formData.get("fitness_goal")?.toString() || "muscle-gain",
            };

            try {
                const regRes = await GymApiClient.register(payload);
                if (regRes.success) {
                    // Automatically log in after registration
                    const loginRes = await GymApiClient.login(payload.email, payload.password);
                    if (loginRes.success) {
                        showAuthSuccess(registerForm, "Account created successfully! Redirecting...");
                        setTimeout(() => {
                            window.location.href = "dashboard.html";
                        }, 500);
                        return;
                    }
                }
            } catch (err) {
                showAuthError(registerForm, err.message || "Registration failed. Please check your details.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Create Account";
                }
            }
        });
    }
});