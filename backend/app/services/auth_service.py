from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin


class AuthService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """
        Fetch a user by email address (case-insensitive search).
        """
        return db.query(User).filter(User.email == email.lower().strip()).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        Fetch a user by primary key ID.
        """
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def register_user(cls, db: Session, user_in: UserRegister) -> User:
        """
        Creates a new user record with securely hashed password.
        Zero plaintext password storage.
        """
        hashed_password = get_password_hash(user_in.password)
        
        db_user = User(
            name=user_in.name.strip(),
            email=user_in.email.lower().strip(),
            password_hash=hashed_password,
            password=None,  # Legacy column remains null for new users
            role="user",
            phone=user_in.phone.strip() if user_in.phone else None,
            address=user_in.address.strip() if user_in.address else None,
            is_active=True,
            current_weight=user_in.current_weight,
            target_weight=user_in.target_weight,
            water_goal=user_in.water_goal,
            calorie_goal=user_in.calorie_goal,
            workout_days=user_in.workout_days,
            fitness_goal=user_in.fitness_goal,
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @classmethod
    def authenticate_user(cls, db: Session, credentials: UserLogin) -> Optional[User]:
        """
        Validates user credentials against stored bcrypt password_hash.
        Handles legacy password fallback and checks account activation status.
        """
        user = cls.get_by_email(db, credentials.email)
        if not user:
            return None
        
        if not user.is_active:
            return None
        
        # Check against primary password_hash, or legacy password column if needed
        pass_hash = user.password_hash or user.password or ""
        if not verify_password(credentials.password, pass_hash):
            return None
        
        # If hash was only in legacy password column, migrate to password_hash
        if not user.password_hash and user.password:
            user.password_hash = pass_hash
            db.commit()
            db.refresh(user)
            
        return user


auth_service = AuthService()
