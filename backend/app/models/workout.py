from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship
from app.database.session import Base


class WorkoutLog(Base):
    """
    SQLAlchemy model mapping directly to the existing MySQL `workout_logs` table.
    Matches exact column definitions, types, and constraints from production database.
    """
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workout_date = Column(Date, nullable=False)
    exercise_name = Column(String(100), nullable=False, default="Exercise")
    sets = Column(Integer, nullable=False, default=3)
    reps = Column(Integer, nullable=False, default=10)
    weight = Column(Numeric(6, 2), nullable=False, default=0.00)
    water_intake = Column(Numeric(4, 2), nullable=True)
    calories_consumed = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True, default=60)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Optional ORM relationship
    user = relationship("User", backref="workout_logs")

    @property
    def user_name(self) -> str | None:
        return self.user.name if self.user else None

    def __repr__(self) -> str:
        return f"<WorkoutLog id={self.id} user_id={self.user_id} date={self.workout_date} exercise={self.exercise_name}>"
