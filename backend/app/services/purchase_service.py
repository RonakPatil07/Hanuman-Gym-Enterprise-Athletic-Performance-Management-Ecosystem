from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.purchase import Purchase
from app.schemas.purchase import PurchaseCreate


class PurchaseService:
    @classmethod
    def create_purchase(cls, db: Session, user_id: int, purchase_in: PurchaseCreate) -> Purchase:
        """
        Creates a new purchase record strictly bound to the authenticated user ID.
        """
        purchase = Purchase(
            user_id=user_id,
            item_name=purchase_in.item_name.strip(),
            item_price=purchase_in.item_price,
            purchase_date=purchase_in.purchase_date,
        )
        db.add(purchase)
        db.commit()
        db.refresh(purchase)
        return purchase

    @classmethod
    def get_user_purchases(
        cls,
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Purchase], int, Decimal]:
        """
        Retrieves paginated purchase history and aggregate total spent strictly for the authenticated user.
        Ordered newest first (by purchase_date descending, then id descending).
        """
        query = db.query(Purchase).filter(Purchase.user_id == user_id)
        total_count = query.count()
        
        # Calculate sum of all user's purchases safely with Decimal precision
        total_spent_val = (
            db.query(func.coalesce(func.sum(Purchase.item_price), 0))
            .filter(Purchase.user_id == user_id)
            .scalar()
        )
        total_spent = Decimal(str(total_spent_val)) if total_spent_val is not None else Decimal("0.00")
        
        purchases = (
            query.order_by(Purchase.purchase_date.desc(), Purchase.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return purchases, total_count, total_spent

    @classmethod
    def get_purchase_by_id(cls, db: Session, user_id: int, purchase_id: int) -> Optional[Purchase]:
        """
        Retrieves a single purchase entry scoped to both purchase_id AND user_id.
        Prevents cross-user ID enumeration.
        """
        return (
            db.query(Purchase)
            .filter(Purchase.id == purchase_id, Purchase.user_id == user_id)
            .first()
        )

    @classmethod
    def delete_purchase(cls, db: Session, user_id: int, purchase_id: int) -> bool:
        """
        Deletes a purchase entry owned by the authenticated user.
        """
        purchase = cls.get_purchase_by_id(db, user_id=user_id, purchase_id=purchase_id)
        if not purchase:
            return False
        
        db.delete(purchase)
        db.commit()
        return True


purchase_service = PurchaseService()
