# ⚡ Hanuman Gym - FastAPI Microservice

High-performance Python 3.11+ REST API service for the Hanuman Gym platform, supporting JWT Bearer authentication, PostgreSQL 16 / SQLite / MySQL persistence, Pydantic validation, and Supabase cloud synchronization.

---

## 🚀 Getting Started

### 1. Local Environment Setup

Ensure Python 3.11+ is installed.

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📡 API Documentation & Endpoints

Once running, access the interactive OpenAPI documentation:

* **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### Core REST Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | Service uptime and database connection status |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new athlete account with biometrics |
| **Auth** | `POST` | `/api/v1/auth/login` | Login with email/password and obtain JWT token |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| **Users** | `PUT` | `/api/v1/users/{id}` | Update athlete biometrics and goals |
| **Workouts** | `GET` | `/api/v1/workouts` | Fetch user workout logs |
| **Workouts** | `POST` | `/api/v1/workouts` | Save new workout session / set |
| **Purchases** | `GET` | `/api/v1/purchases` | Fetch user purchase and store orders ledger |
| **Purchases** | `POST` | `/api/v1/purchases` | Record store order or subscription pass |
| **Inquiries** | `POST` | `/api/v1/inquiries` | Submit trial pass or corporate inquiry |
| **Admin** | `GET` | `/api/v1/admin/stats` | Aggregate franchise KPIs and financials |
| **Admin** | `GET` | `/api/v1/admin/users` | Master athlete directory pagination |
| **Admin** | `GET` | `/api/v1/admin/purchases` | Global transactions ledger |
| **Admin** | `GET` | `/api/v1/admin/workouts` | Global workout activity telemetry |

---

## 🐳 Docker Deployment

The FastAPI service is containerized via [`Dockerfile`](file:///c:/xampp/htdocs/PS-miniproject/backend/Dockerfile):

```bash
# Build standalone image
docker build -t hanuman-gym-api .

# Run container on port 8000
docker run -d -p 8000:8000 --name hanuman_api hanuman-gym-api
```
*(Or launch the full multi-tier stack via `docker compose up -d` at project root).*
