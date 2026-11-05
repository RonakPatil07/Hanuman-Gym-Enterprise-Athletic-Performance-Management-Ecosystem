from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.session import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=True, index=True)
    phone = Column(String(25), nullable=True)
    location = Column(String(100), nullable=True)
    inquiry_type = Column(String(50), nullable=False, default="general_inquiry")  # tour_booking, contact_message, trial_pass, general_inquiry
    message = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="new", index=True)  # new, contacted, trial_booked, converted, archived
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    def __repr__(self) -> str:
        return f"<Inquiry(id={self.id}, name='{self.name}', type='{self.inquiry_type}', status='{self.status}')>"
