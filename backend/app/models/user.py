from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String, Text, func
from app.database.session import Base


class User(Base):
    """
    SQLAlchemy model mapping directly to the existing MySQL `users` table.
    Preserves all column definitions and constraints for 100% backward compatibility.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    password = Column(String(255), nullable=True)  # Legacy column preserved
    role = Column(String(20), default="user", nullable=False)
    phone = Column(String(25), nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Gym & Fitness telemetry profile
    current_weight = Column(Numeric(5, 2), nullable=True)
    target_weight = Column(Numeric(5, 2), nullable=True)
    water_goal = Column(Numeric(4, 2), default=2.50, nullable=True)
    calorie_goal = Column(Integer, default=2200, nullable=True)
    workout_days = Column(Integer, default=3, nullable=True)
    fitness_goal = Column(String(50), default="muscle-gain", nullable=True)
    
    created_at = Column(DateTime, server_default=func.now(), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
