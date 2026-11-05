from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Check the operational health of the FastAPI service."
)
@router.get(
    "/api/v1/health",
    response_model=HealthResponse,
    summary="API v1 Health check endpoint",
    description="Check the operational health of the FastAPI service via /api/v1 prefix."
)
async def health_check() -> HealthResponse:
    """
    Returns standard health status 'ok'.
    """
    return HealthResponse(status="ok")
