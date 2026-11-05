from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate


class UserService:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        Retrieves a user by primary key ID.
        """
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def update_profile(cls, db: Session, user: User, update_in: UserUpdate) -> User:
        """
        Performs a partial update on the user's profile and telemetry goals.
        Only fields explicitly provided in the request payload are updated.
        """
        update_data = update_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if isinstance(value, str):
                value = value.strip()
            setattr(user, field, value)
            
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


user_service = UserService()
