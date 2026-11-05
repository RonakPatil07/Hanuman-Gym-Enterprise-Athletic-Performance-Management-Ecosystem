from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.purchase import Purchase
from app.models.user import User
from app.models.workout import WorkoutLog
from app.schemas.admin import AdminUserUpdate


class AdminService:
    # ---------------- User Management ----------------
    @classmethod
    def get_all_users(
        cls,
        db: Session,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[User], int]:
        query = db.query(User)
        total_count = query.count()
        users = query.order_by(User.id.asc()).offset(offset).limit(limit).all()
        return users, total_count

    @classmethod
    def get_user_by_id(cls, db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def update_user(
        cls,
        db: Session,
        user_id: int,
        update_in: AdminUserUpdate
    ) -> Optional[User]:
        user = cls.get_user_by_id(db, user_id)
        if not user:
            return None
        
        update_data = update_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if isinstance(value, str):
                value = value.strip()
            setattr(user, field, value)
            
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @classmethod
    def delete_user(
        cls,
        db: Session,
        user_id: int,
        admin_id: int
    ) -> Tuple[bool, str]:
        if user_id == admin_id:
            return False, "Cannot delete your own authenticated admin account"
        
        user = cls.get_user_by_id(db, user_id)
        if not user:
            return False, "User not found"
        
        db.delete(user)
        db.commit()
        return True, "User deleted successfully"

    # ---------------- System-Wide Purchases ----------------
    @classmethod
    def get_all_purchases(
        cls,
        db: Session,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Purchase], int, Decimal]:
        query = db.query(Purchase)
        total_count = query.count()
        
        total_revenue_val = db.query(func.coalesce(func.sum(Purchase.item_price), 0)).scalar()
        total_revenue = Decimal(str(total_revenue_val)) if total_revenue_val is not None else Decimal("0.00")
        
        purchases = query.options(joinedload(Purchase.user)).order_by(Purchase.purchase_date.desc(), Purchase.id.desc()).offset(offset).limit(limit).all()
        return purchases, total_count, total_revenue

    @classmethod
    def get_purchase_by_id(cls, db: Session, purchase_id: int) -> Optional[Purchase]:
        return db.query(Purchase).filter(Purchase.id == purchase_id).first()

    @classmethod
    def delete_purchase(cls, db: Session, purchase_id: int) -> bool:
        purchase = cls.get_purchase_by_id(db, purchase_id)
        if not purchase:
            return False
        db.delete(purchase)
        db.commit()
        return True

    # ---------------- System-Wide Workouts ----------------
    @classmethod
    def get_all_workouts(
        cls,
        db: Session,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[WorkoutLog], int]:
        query = db.query(WorkoutLog)
        total_count = query.count()
        workouts = query.options(joinedload(WorkoutLog.user)).order_by(WorkoutLog.workout_date.desc(), WorkoutLog.id.desc()).offset(offset).limit(limit).all()
        return workouts, total_count

    @classmethod
    def get_workout_by_id(cls, db: Session, workout_id: int) -> Optional[WorkoutLog]:
        return db.query(WorkoutLog).filter(WorkoutLog.id == workout_id).first()

    @classmethod
    def delete_workout(cls, db: Session, workout_id: int) -> bool:
        workout = cls.get_workout_by_id(db, workout_id)
        if not workout:
            return False
        db.delete(workout)
        db.commit()
        return True

    # ---------------- System Overview Statistics ----------------
    @classmethod
    def get_system_stats(cls, db: Session) -> dict:
        total_users = db.query(User).count()
        total_workouts = db.query(WorkoutLog).count()
        total_purchases = db.query(Purchase).count()
        
        total_rev_val = db.query(func.coalesce(func.sum(Purchase.item_price), 0)).scalar()
        total_revenue = Decimal(str(total_rev_val)) if total_rev_val is not None else Decimal("0.00")
        
        return {
            "total_users": total_users,
            "total_workouts": total_workouts,
            "total_purchases": total_purchases,
            "total_revenue": total_revenue,
        }


admin_service = AdminService()
