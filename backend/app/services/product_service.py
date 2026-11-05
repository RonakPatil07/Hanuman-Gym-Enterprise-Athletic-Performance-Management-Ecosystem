from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Product:
        product = Product(
            name=product_in.name.strip(),
            category=product_in.category,
            gender_category=product_in.gender_category,
            price=product_in.price,
            description=product_in.description.strip() if product_in.description else None,
            image_url=product_in.image_url.strip() if product_in.image_url else None,
            stock_quantity=product_in.stock_quantity,
            is_active=product_in.is_active,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_all_products(
        db: Session,
        category: Optional[str] = None,
        only_active: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Product], int]:
        query = db.query(Product)
        if category and category.lower() != "all":
            query = query.filter(Product.category == category.lower().strip())
        if only_active:
            query = query.filter(Product.is_active.is_(True))
            
        total_count = query.count()
        products = query.order_by(Product.created_at.desc()).offset(offset).limit(limit).all()
        return products, total_count

    @classmethod
    def update_product(
        cls,
        db: Session,
        product_id: int,
        update_in: ProductUpdate
    ) -> Optional[Product]:
        product = cls.get_product_by_id(db, product_id)
        if not product:
            return None
        
        update_data = update_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if isinstance(value, str):
                value = value.strip()
            setattr(product, field, value)
            
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @classmethod
    def delete_product(cls, db: Session, product_id: int) -> bool:
        product = cls.get_product_by_id(db, product_id)
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True
