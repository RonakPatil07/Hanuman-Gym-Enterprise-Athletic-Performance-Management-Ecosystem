from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (
    health_router,
    auth_router,
    users_router,
    workouts_router,
    purchases_router,
    admin_router,
    inquiries_router,
    products_router,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI Backend for Hanuman Gym Management System (Migration Pipeline)",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS for decoupled frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(workouts_router)
app.include_router(purchases_router)
app.include_router(admin_router)
app.include_router(inquiries_router)
app.include_router(products_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Hanuman Gym API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "auth": {
                "register": "/api/v1/auth/register",
                "login": "/api/v1/auth/login",
                "me": "/api/v1/auth/me",
                "logout": "/api/v1/auth/logout"
            },
            "users": {
                "profile": "/api/v1/users/me"
            },
            "workouts": {
                "list": "/api/v1/workouts",
                "create": "/api/v1/workouts",
                "detail": "/api/v1/workouts/{workout_id}"
            },
            "purchases": {
                "list": "/api/v1/purchases",
                "create": "/api/v1/purchases",
                "detail": "/api/v1/purchases/{purchase_id}"
            },
            "admin": {
                "stats": "/api/v1/admin/stats",
                "users": "/api/v1/admin/users",
                "purchases": "/api/v1/admin/purchases",
                "workouts": "/api/v1/admin/workouts"
            }
        }
    }
