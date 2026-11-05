from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.workout import WorkoutLog
from app.schemas.workout import WorkoutCreate, WorkoutUpdate


class WorkoutService:
    @classmethod
    def create_workout(cls, db: Session, user_id: int, workout_in: WorkoutCreate) -> WorkoutLog:
        """
        Creates a new workout log record strictly bound to the authenticated user ID.
        """
        workout = WorkoutLog(
            user_id=user_id,
            workout_date=workout_in.workout_date,
            exercise_name=workout_in.exercise_name.strip(),
            sets=workout_in.sets,
            reps=workout_in.reps,
            weight=workout_in.weight,
            water_intake=workout_in.water_intake,
            calories_consumed=workout_in.calories_consumed,
            duration_minutes=workout_in.duration_minutes,
            notes=workout_in.notes.strip() if workout_in.notes else None,
        )
        db.add(workout)
        db.commit()
        db.refresh(workout)
        return workout

    @classmethod
    def get_user_workouts(
        cls,
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[WorkoutLog], int]:
        """
        Retrieves paginated workout logs scoped strictly to the authenticated user ID.
        Ordered latest first (by workout_date descending, then id descending).
        """
        query = db.query(WorkoutLog).filter(WorkoutLog.user_id == user_id)
        total_count = query.count()
        
        workouts = (
            query.order_by(WorkoutLog.workout_date.desc(), WorkoutLog.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return workouts, total_count

    @classmethod
    def get_workout_by_id(cls, db: Session, user_id: int, workout_id: int) -> Optional[WorkoutLog]:
        """
        Retrieves a single workout entry scoped to both workout_id AND user_id.
        Prevents cross-user ID enumeration.
        """
        return (
            db.query(WorkoutLog)
            .filter(WorkoutLog.id == workout_id, WorkoutLog.user_id == user_id)
            .first()
        )

    @classmethod
    def update_workout(
        cls,
        db: Session,
        user_id: int,
        workout_id: int,
        update_in: WorkoutUpdate
    ) -> Optional[WorkoutLog]:
        """
        Updates an existing workout log owned by the authenticated user.
        """
        workout = cls.get_workout_by_id(db, user_id=user_id, workout_id=workout_id)
        if not workout:
            return None
        
        update_data = update_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if isinstance(value, str):
                value = value.strip()
            setattr(workout, field, value)
            
        db.add(workout)
        db.commit()
        db.refresh(workout)
        return workout

    @classmethod
    def delete_workout(cls, db: Session, user_id: int, workout_id: int) -> bool:
        """
        Deletes a workout log owned by the authenticated user.
        """
        workout = cls.get_workout_by_id(db, user_id=user_id, workout_id=workout_id)
        if not workout:
            return False
        
        db.delete(workout)
        db.commit()
        return True


workout_service = WorkoutService()
