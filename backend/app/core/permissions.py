from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.routers.auth import get_current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI security dependency ensuring the authenticated user has the 'admin' role.
    Verified strictly against the authoritative database record from MySQL.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required to access this resource",
        )
    return current_user
