from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.user import UserProfileResponse, UserUpdate
from app.services.user_service import user_service

router = APIRouter(prefix="/api/v1/users", tags=["Users & Profiles"])


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user's profile",
    description="Retrieves the profile, biometric details, and fitness targets for the authenticated user."
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
) -> UserProfileResponse:
    """
    Returns the authenticated user's profile.
    The identity is derived exclusively from the verified JWT.
    """
    return UserProfileResponse.model_validate(current_user)


@router.put(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user's profile and goals",
    description="Partially updates biometric targets, address, phone, or name. Role and password modifications are strictly forbidden."
)
def update_my_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """
    Updates the authenticated user's profile in the MySQL database.
    """
    updated_user = user_service.update_profile(db=db, user=current_user, update_in=update_in)
    return UserProfileResponse.model_validate(updated_user)
