from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, json_schema_extra={"example": "John Doe"})
    email: EmailStr = Field(..., json_schema_extra={"example": "john@example.com"})
    password: str = Field(..., min_length=6, max_length=100, json_schema_extra={"example": "SecurePass123"})
    phone: Optional[str] = Field(None, max_length=25, json_schema_extra={"example": "9876543210"})
    address: Optional[str] = Field(None, json_schema_extra={"example": "123 Fitness St"})
    current_weight: Optional[float] = Field(None, ge=20.0, le=500.0, json_schema_extra={"example": 75.5})
    target_weight: Optional[float] = Field(None, ge=20.0, le=500.0, json_schema_extra={"example": 70.0})
    water_goal: Optional[float] = Field(2.50, ge=0.5, le=20.0, json_schema_extra={"example": 3.0})
    calorie_goal: Optional[int] = Field(2200, ge=500, le=10000, json_schema_extra={"example": 2400})
    workout_days: Optional[int] = Field(3, ge=1, le=7, json_schema_extra={"example": 4})
    fitness_goal: Optional[str] = Field("muscle-gain", max_length=50, json_schema_extra={"example": "muscle-gain"})


class UserLogin(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "john@example.com"})
    password: str = Field(..., min_length=1, json_schema_extra={"example": "SecurePass123"})


class UserResponse(BaseModel):
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

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    exp: Optional[int] = None
