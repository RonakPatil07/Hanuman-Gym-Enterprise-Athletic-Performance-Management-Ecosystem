from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class AdminUserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, json_schema_extra={"example": "John Updated"})
    phone: Optional[str] = Field(None, max_length=25, json_schema_extra={"example": "9876543210"})
    address: Optional[str] = Field(None, json_schema_extra={"example": "456 Admin St"})
    role: Optional[Literal["user", "trainer", "admin"]] = Field(None, json_schema_extra={"example": "trainer"})
    is_active: Optional[bool] = Field(None, json_schema_extra={"example": True})
    current_weight: Optional[float] = Field(None, ge=20.0, le=500.0, json_schema_extra={"example": 75.0})
    target_weight: Optional[float] = Field(None, ge=20.0, le=500.0, json_schema_extra={"example": 70.0})
    water_goal: Optional[float] = Field(None, ge=0.5, le=20.0, json_schema_extra={"example": 3.0})
    calorie_goal: Optional[int] = Field(None, ge=500, le=10000, json_schema_extra={"example": 2200})
    workout_days: Optional[int] = Field(None, ge=1, le=7, json_schema_extra={"example": 4})
    fitness_goal: Optional[str] = Field(None, max_length=50, json_schema_extra={"example": "strength-training"})

    model_config = ConfigDict(extra="forbid")


class AdminUserResponse(BaseModel):
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


class AdminUserListResponse(BaseModel):
    users: List[AdminUserResponse]
    total_count: int
    limit: int
    offset: int


class AdminStatsResponse(BaseModel):
    total_users: int
    total_workouts: int
    total_purchases: int
    total_revenue: Decimal
