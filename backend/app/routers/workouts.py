from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.workout import (
    WorkoutCreate,
    WorkoutListResponse,
    WorkoutResponse,
    WorkoutUpdate,
)
from app.services.workout_service import workout_service

router = APIRouter(prefix="/api/v1/workouts", tags=["Workouts & Telemetry"])


@router.post(
    "",
    response_model=WorkoutResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a workout entry",
    description="Creates a new workout log record bound strictly to the authenticated user ID."
)
def create_workout(
    workout_in: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkoutResponse:
    workout = workout_service.create_workout(
        db=db,
        user_id=current_user.id,
        workout_in=workout_in
    )
    return WorkoutResponse.model_validate(workout)


@router.get(
    "",
    response_model=WorkoutListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user workout history",
    description="Retrieves a paginated list of workout logs for the authenticated user, ordered latest first."
)
def get_workouts(
    limit: Annotated[int, Query(ge=1, le=100, description="Max records to return")] = 50,
    offset: Annotated[int, Query(ge=0, description="Pagination offset")] = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkoutListResponse:
    workouts, total_count = workout_service.get_user_workouts(
        db=db,
        user_id=current_user.id,
        limit=limit,
        offset=offset
    )
    return WorkoutListResponse(
        workouts=[WorkoutResponse.model_validate(w) for w in workouts],
        total_count=total_count,
        limit=limit,
        offset=offset
    )


@router.get(
    "/{workout_id}",
    response_model=WorkoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a single workout entry by ID",
    description="Retrieves a specific workout entry strictly scoped to the authenticated user."
)
def get_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkoutResponse:
    workout = workout_service.get_workout_by_id(
        db=db,
        user_id=current_user.id,
        workout_id=workout_id
    )
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout log not found"
        )
    return WorkoutResponse.model_validate(workout)


@router.put(
    "/{workout_id}",
    response_model=WorkoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a workout entry",
    description="Partially updates an existing workout entry owned by the authenticated user."
)
def update_workout(
    workout_id: int,
    update_in: WorkoutUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkoutResponse:
    updated_workout = workout_service.update_workout(
        db=db,
        user_id=current_user.id,
        workout_id=workout_id,
        update_in=update_in
    )
    if not updated_workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout log not found"
        )
    return WorkoutResponse.model_validate(updated_workout)


@router.delete(
    "/{workout_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a workout entry",
    description="Deletes a specific workout entry owned by the authenticated user."
)
def delete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    success = workout_service.delete_workout(
        db=db,
        user_id=current_user.id,
        workout_id=workout_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout log not found"
        )
    return {
        "status": "ok",
        "message": "Workout log deleted successfully"
    }
