from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.permissions import require_admin
from app.database.session import get_db
from app.models.user import User
from app.schemas.admin import (
    AdminStatsResponse,
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserUpdate,
)
from app.schemas.purchase import PurchaseListResponse, PurchaseResponse
from app.schemas.workout import WorkoutListResponse, WorkoutResponse
from app.services.admin_service import admin_service

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Command Center"])


# ---------------- System Overview Statistics ----------------
@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get system overview metrics",
    description="Retrieves aggregate totals for users, workouts, orders, and total revenue."
)
def get_stats(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminStatsResponse:
    stats = admin_service.get_system_stats(db)
    return AdminStatsResponse(**stats)


# ---------------- User Management ----------------
@router.get(
    "/users",
    response_model=AdminUserListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all users (Admin)",
    description="Retrieves a paginated list of all users in the system with their profile and role data."
)
def list_users(
    limit: Annotated[int, Query(ge=1, le=1000, description="Max users to return")] = 500,
    offset: Annotated[int, Query(ge=0, description="Pagination offset")] = 0,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminUserListResponse:
    users, total_count = admin_service.get_all_users(db, limit=limit, offset=offset)
    return AdminUserListResponse(
        users=[AdminUserResponse.model_validate(u) for u in users],
        total_count=total_count,
        limit=limit,
        offset=offset
    )


@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user details by ID (Admin)",
    description="Retrieves profile information for any specific user by primary key ID."
)
def get_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminUserResponse:
    user = admin_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return AdminUserResponse.model_validate(user)


@router.put(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user details/role (Admin)",
    description="Allows administrators to update user status, role ('user', 'trainer', 'admin'), or details."
)
def update_user(
    user_id: int,
    update_in: AdminUserUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminUserResponse:
    updated_user = admin_service.update_user(db, user_id=user_id, update_in=update_in)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return AdminUserResponse.model_validate(updated_user)


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete user (Admin)",
    description="Deletes a user and cascades deletion to associated workout logs and purchases. Self-deletion forbidden."
)
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    success, msg = admin_service.delete_user(db, user_id=user_id, admin_id=current_admin.id)
    if not success:
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {
        "status": "ok",
        "message": msg,
        "deleted_user_id": user_id
    }


# ---------------- System Purchases ----------------
@router.get(
    "/purchases",
    response_model=PurchaseListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all purchases across all users (Admin)",
    description="Retrieves a paginated list of all purchases system-wide."
)
def list_purchases(
    limit: Annotated[int, Query(ge=1, le=1000)] = 500,
    offset: Annotated[int, Query(ge=0)] = 0,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PurchaseListResponse:
    purchases, total_count, total_revenue = admin_service.get_all_purchases(db, limit=limit, offset=offset)
    return PurchaseListResponse(
        purchases=[PurchaseResponse.model_validate(p) for p in purchases],
        total_count=total_count,
        total_spent=total_revenue,
        limit=limit,
        offset=offset
    )


@router.get(
    "/purchases/{purchase_id}",
    response_model=PurchaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Get purchase by ID (Admin)",
    description="Retrieves any purchase record by its primary key ID."
)
def get_purchase(
    purchase_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PurchaseResponse:
    purchase = admin_service.get_purchase_by_id(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase record not found")
    return PurchaseResponse.model_validate(purchase)


@router.delete(
    "/purchases/{purchase_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete purchase record (Admin)",
    description="Deletes any purchase record from the database."
)
def delete_purchase(
    purchase_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    success = admin_service.delete_purchase(db, purchase_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase record not found")
    return {
        "status": "ok",
        "message": "Purchase deleted successfully by admin",
        "deleted_id": purchase_id
    }


# ---------------- System Workouts ----------------
@router.get(
    "/workouts",
    response_model=WorkoutListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all workouts across all users (Admin)",
    description="Retrieves a paginated list of all workouts system-wide."
)
def list_workouts(
    limit: Annotated[int, Query(ge=1, le=1000)] = 500,
    offset: Annotated[int, Query(ge=0)] = 0,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> WorkoutListResponse:
    workouts, total_count = admin_service.get_all_workouts(db, limit=limit, offset=offset)
    return WorkoutListResponse(
        workouts=[WorkoutResponse.model_validate(w) for w in workouts],
        total_count=total_count,
        limit=limit,
        offset=offset
    )


@router.get(
    "/workouts/{workout_id}",
    response_model=WorkoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Get workout by ID (Admin)",
    description="Retrieves any workout log by its primary key ID."
)
def get_workout(
    workout_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> WorkoutResponse:
    workout = admin_service.get_workout_by_id(db, workout_id)
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout log not found")
    return WorkoutResponse.model_validate(workout)


@router.delete(
    "/workouts/{workout_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete workout log (Admin)",
    description="Deletes any workout log from the database."
)
def delete_workout(
    workout_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    success = admin_service.delete_workout(db, workout_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout log not found")
    return {
        "status": "ok",
        "message": "Workout log deleted successfully by admin",
        "deleted_id": workout_id
    }
