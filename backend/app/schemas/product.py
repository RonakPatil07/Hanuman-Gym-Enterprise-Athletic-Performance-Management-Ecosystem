from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, json_schema_extra={"example": "Hanuman Whey Isolate 2kg"})
    category: Literal["supplements", "apparel", "gear", "accessories"] = Field(
        "supplements", json_schema_extra={"example": "supplements"}
    )
    gender_category: Optional[Literal["men", "female", "unisex"]] = Field("unisex")
    price: Decimal = Field(..., ge=0.01, max_digits=10, decimal_places=2, json_schema_extra={"example": 3999.00})
    description: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=255)
    stock_quantity: int = Field(50, ge=0)
    is_active: bool = Field(True)

    model_config = ConfigDict(extra="forbid")


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    category: Optional[Literal["supplements", "apparel", "gear", "accessories"]] = None
    gender_category: Optional[Literal["men", "female", "unisex"]] = None
    price: Optional[Decimal] = Field(None, ge=0.01, max_digits=10, decimal_places=2)
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    gender_category: Optional[str] = None
    price: Decimal
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total_count: int
    limit: int
    offset: int
