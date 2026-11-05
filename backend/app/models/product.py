from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime
from app.database.session import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="supplements", index=True)  # supplements, apparel, gear, accessories
    gender_category = Column(String(20), nullable=True, default="unisex")  # men, female, unisex
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    stock_quantity = Column(Integer, nullable=False, default=50)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name='{self.name}', price={self.price}, stock={self.stock_quantity})>"
