from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class WorkoutBase(BaseModel):
    workout_date: date = Field(..., json_schema_extra={"example": "2026-08-16"})
    exercise_name: str = Field(default="Exercise", min_length=1, max_length=100, json_schema_extra={"example": "Bench Press"})
    sets: int = Field(default=3, ge=1, le=100, json_schema_extra={"example": 3})
    reps: int = Field(default=10, ge=1, le=1000, json_schema_extra={"example": 12})
    weight: float = Field(default=0.0, ge=0.0, le=1000.0, json_schema_extra={"example": 60.0})
    water_intake: Optional[float] = Field(None, ge=0.0, le=20.0, json_schema_extra={"example": 2.5})
    calories_consumed: Optional[int] = Field(None, ge=0, le=20000, json_schema_extra={"example": 450})
    duration_minutes: Optional[int] = Field(60, ge=1, le=1440, json_schema_extra={"example": 60})
    notes: Optional[str] = Field(None, json_schema_extra={"example": "Felt strong, good form."})


class WorkoutCreate(WorkoutBase):
    model_config = ConfigDict(extra="forbid")


class WorkoutUpdate(BaseModel):
    workout_date: Optional[date] = Field(None, json_schema_extra={"example": "2026-08-16"})
    exercise_name: Optional[str] = Field(None, min_length=1, max_length=100, json_schema_extra={"example": "Incline Dumbbell Press"})
    sets: Optional[int] = Field(None, ge=1, le=100, json_schema_extra={"example": 4})
    reps: Optional[int] = Field(None, ge=1, le=1000, json_schema_extra={"example": 10})
    weight: Optional[float] = Field(None, ge=0.0, le=1000.0, json_schema_extra={"example": 25.0})
    water_intake: Optional[float] = Field(None, ge=0.0, le=20.0, json_schema_extra={"example": 3.0})
    calories_consumed: Optional[int] = Field(None, ge=0, le=20000, json_schema_extra={"example": 500})
    duration_minutes: Optional[int] = Field(None, ge=1, le=1440, json_schema_extra={"example": 45})
    notes: Optional[str] = Field(None, json_schema_extra={"example": "Updated notes."})

    model_config = ConfigDict(extra="forbid")


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    workout_date: date
    exercise_name: str
    sets: int
    reps: int
    weight: float
    water_intake: Optional[float] = None
    calories_consumed: Optional[int] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WorkoutListResponse(BaseModel):
    workouts: List[WorkoutResponse]
    total_count: int
    limit: int
    offset: int
