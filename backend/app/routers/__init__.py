from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.workouts import router as workouts_router
from app.routers.purchases import router as purchases_router
from app.routers.admin import router as admin_router
from app.routers.inquiries import router as inquiries_router
from app.routers.products import router as products_router

__all__ = [
    "health_router",
    "auth_router",
    "users_router",
    "workouts_router",
    "purchases_router",
    "admin_router",
    "inquiries_router",
    "products_router",
]
