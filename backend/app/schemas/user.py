from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool
    current_weight: Optional[float] = None
    target_weight: Optional[float] = None
    water_goal: Optional[float] = None
    calorie_goal: Optional[int] = None
    workout_days: Optional[int] = None
    fitness_goal: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, json_schema_extra={"example": "John Doe"})
    phone: Optional[str] = Field(None, max_length=25, json_schema_extra={"example": "9876543210"})
    address: Optional[str] = Field(None, json_schema_extra={"example": "123 Fitness St"})
    current_weight: Optional[float] = Field(None, ge=20.0, le=500.0, json_schema_extra={"example": 78.5})
    target_weight: Optional[float] = Field(None, ge=20.0, le=500.0, json_schema_extra={"example": 72.0})
    water_goal: Optional[float] = Field(None, ge=0.5, le=20.0, json_schema_extra={"example": 3.5})
    calorie_goal: Optional[int] = Field(None, ge=500, le=10000, json_schema_extra={"example": 2300})
    workout_days: Optional[int] = Field(None, ge=1, le=7, json_schema_extra={"example": 5})
    fitness_goal: Optional[str] = Field(None, max_length=50, json_schema_extra={"example": "strength-training"})

    model_config = ConfigDict(extra="forbid")
