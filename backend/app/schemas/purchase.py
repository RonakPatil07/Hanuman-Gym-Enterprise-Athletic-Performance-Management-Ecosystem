from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class PurchaseBase(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=100, json_schema_extra={"example": "Gold Membership Annual"})
    item_price: Decimal = Field(..., ge=Decimal("0.01"), le=Decimal("1000000.00"), json_schema_extra={"example": "4999.00"})
    purchase_date: date = Field(..., json_schema_extra={"example": "2026-08-16"})


class PurchaseCreate(PurchaseBase):
    model_config = ConfigDict(extra="forbid")


class PurchaseResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    item_name: str
    item_price: Decimal
    purchase_date: date
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PurchaseListResponse(BaseModel):
    purchases: List[PurchaseResponse]
    total_count: int
    total_spent: Decimal
    limit: int
    offset: int
