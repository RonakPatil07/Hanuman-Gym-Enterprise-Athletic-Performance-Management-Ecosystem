from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.inquiry import Inquiry
from app.schemas.inquiry import InquiryCreate, InquiryUpdate


class InquiryService:
    @staticmethod
    def create_inquiry(db: Session, inquiry_in: InquiryCreate) -> Inquiry:
        inquiry = Inquiry(
            name=inquiry_in.name.strip(),
            email=inquiry_in.email.strip().lower() if inquiry_in.email else None,
            phone=inquiry_in.phone.strip() if inquiry_in.phone else None,
            location=inquiry_in.location.strip() if inquiry_in.location else None,
            inquiry_type=inquiry_in.inquiry_type or "general_inquiry",
            message=inquiry_in.message.strip() if inquiry_in.message else None,
            status="new",
        )
        db.add(inquiry)
        db.commit()
        db.refresh(inquiry)
        return inquiry

    @staticmethod
    def get_inquiry_by_id(db: Session, inquiry_id: int) -> Optional[Inquiry]:
        return db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()

    @staticmethod
    def get_all_inquiries(
        db: Session,
        status_filter: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Inquiry], int]:
        query = db.query(Inquiry)
        if status_filter and status_filter.lower() != "all":
            query = query.filter(Inquiry.status == status_filter.lower().strip())
        
        total_count = query.count()
        inquiries = query.order_by(Inquiry.created_at.desc()).offset(offset).limit(limit).all()
        return inquiries, total_count

    @classmethod
    def update_inquiry(
        cls,
        db: Session,
        inquiry_id: int,
        update_in: InquiryUpdate
    ) -> Optional[Inquiry]:
        inquiry = cls.get_inquiry_by_id(db, inquiry_id)
        if not inquiry:
            return None
        
        update_data = update_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if isinstance(value, str):
                value = value.strip()
            setattr(inquiry, field, value)
            
        db.add(inquiry)
        db.commit()
        db.refresh(inquiry)
        return inquiry

    @classmethod
    def delete_inquiry(cls, db: Session, inquiry_id: int) -> bool:
        inquiry = cls.get_inquiry_by_id(db, inquiry_id)
        if not inquiry:
            return False
        db.delete(inquiry)
        db.commit()
        return True
