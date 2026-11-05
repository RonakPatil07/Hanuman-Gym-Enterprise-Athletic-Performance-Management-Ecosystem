# Hanuman Gym — Auth & Athlete Dashboard System

A decoupled authentication and athlete dashboard system built with modern HTML5, CSS3, JavaScript (ES6+), and connected directly to the **FastAPI REST API** backend and **Supabase Cloud Storage**.

## 🚀 Features

- **Decoupled User Authentication**: Login and registration powered by FastAPI JWT tokens (`/api/v1/auth/login`, `/api/v1/auth/register`).
- **Client Identity & Token Management**: Secure token persistence in `localStorage`/`sessionStorage` handled via `shared/api-client.js`.
- **Role-Based Access**: Direct access controls for Athletes (`user`) and Gym Administrators (`admin`).
- **Athlete Command Center ("My Space")**: Complete telemetry tracking with live Chart.js biometrics, workout logging, and order history.
- **Hybrid Cloud Synchronization**: Real-time event broadcasting to Supabase for multi-device sync.
- **Interactive Visualizations**: Progress charts for body weight, hydration, calorie intake, workout frequency, and training volume.

---

## 📁 Structure

```
login_register/
├── index.html                 # Modern login & registration portal
├── dashboard.html             # Executive athlete command center (My Space)
├── style.css                  # Auth page stylesheet
├── dashboard-styles.css       # My Space dashboard stylesheet
├── script.js                  # Auth page controller with ApiClient integration
├── js/                        # Dashboard modules
│   ├── dashboard.js           # Dashboard controller & live sync
│   └── charts.js              # Chart.js analytics engine
├── images/                    # Asset images
└── README.md                  # Module documentation
```

---

## 🔐 Authentication Flow

1. **Login**: The user submits credentials on `index.html`. `GymApiClient.login()` calls `POST /api/v1/auth/login`. On success, the JWT token and user profile are saved and the user is redirected to `dashboard.html`.
2. **Registration**: New users submit their profile on `index.html`. `GymApiClient.register()` calls `POST /api/v1/auth/register`.
3. **Session Check**: `dashboard.html` validates the token on load and pulls profile data via `GET /api/v1/auth/me`.
4. **Logout**: User triggers logout via `GymApiClient.logout()`, clearing active tokens and redirecting to the login portal.

