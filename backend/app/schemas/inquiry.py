from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, json_schema_extra={"example": "Rahul Sharma"})
    email: Optional[EmailStr] = Field(None, json_schema_extra={"example": "rahul@example.com"})
    phone: Optional[str] = Field(None, max_length=25, json_schema_extra={"example": "+91 9876543210"})
    location: Optional[str] = Field(None, max_length=100, json_schema_extra={"example": "Koregaon Park Branch"})
    inquiry_type: Optional[Literal["tour_booking", "contact_message", "trial_pass", "general_inquiry"]] = Field(
        "general_inquiry", json_schema_extra={"example": "tour_booking"}
    )
    message: Optional[str] = Field(None, max_length=2000, json_schema_extra={"example": "Interested in morning CrossFit sessions."})

    model_config = ConfigDict(extra="forbid")


class InquiryUpdate(BaseModel):
    status: Optional[Literal["new", "contacted", "trial_booked", "converted", "archived"]] = Field(None)
    notes: Optional[str] = Field(None, max_length=2000)

    model_config = ConfigDict(extra="forbid")


class InquiryResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    inquiry_type: str
    message: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class InquiryListResponse(BaseModel):
    inquiries: List[InquiryResponse]
    total_count: int
    limit: int
    offset: int
