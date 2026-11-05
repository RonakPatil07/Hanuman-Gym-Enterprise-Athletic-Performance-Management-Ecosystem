from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.core.permissions import require_admin
from app.schemas.inquiry import (
    InquiryCreate,
    InquiryUpdate,
    InquiryResponse,
    InquiryListResponse
)
from app.services.inquiry_service import InquiryService

router = APIRouter(prefix="/api/v1", tags=["Inquiries CRM"])


# ---------------- Public Website Lead Capture ----------------
@router.post(
    "/inquiries",
    response_model=InquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit an inquiry / tour booking (Public)",
    description="Captures guest inquiries, tour bookings, and free trial requests from the website."
)
def create_inquiry(
    inquiry_in: InquiryCreate,
    db: Session = Depends(get_db)
) -> InquiryResponse:
    inquiry = InquiryService.create_inquiry(db, inquiry_in)
    return InquiryResponse.model_validate(inquiry)


# ---------------- Admin Inquiries Management ----------------
@router.get(
    "/admin/inquiries",
    response_model=InquiryListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all inquiries / leads (Admin)",
    description="Retrieves a paginated list of leads with optional status filtering."
)
def list_inquiries(
    status_filter: Annotated[Optional[str], Query(alias="status", description="Filter by status")] = None,
    limit: Annotated[int, Query(ge=1, le=1000)] = 500,
    offset: Annotated[int, Query(ge=0)] = 0,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> InquiryListResponse:
    inquiries, total_count = InquiryService.get_all_inquiries(
        db, status_filter=status_filter, limit=limit, offset=offset
    )
    return InquiryListResponse(
        inquiries=[InquiryResponse.model_validate(i) for i in inquiries],
        total_count=total_count,
        limit=limit,
        offset=offset
    )


@router.get(
    "/admin/inquiries/{inquiry_id}",
    response_model=InquiryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get inquiry by ID (Admin)",
    description="Retrieves single inquiry details."
)
def get_inquiry(
    inquiry_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> InquiryResponse:
    inquiry = InquiryService.get_inquiry_by_id(db, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry record not found")
    return InquiryResponse.model_validate(inquiry)


@router.put(
    "/admin/inquiries/{inquiry_id}",
    response_model=InquiryResponse,
    status_code=status.HTTP_200_OK,
    summary="Update inquiry status / notes (Admin)",
    description="Updates the lead stage and staff follow-up notes."
)
def update_inquiry(
    inquiry_id: int,
    update_in: InquiryUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> InquiryResponse:
    inquiry = InquiryService.update_inquiry(db, inquiry_id, update_in)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry record not found")
    return InquiryResponse.model_validate(inquiry)


@router.delete(
    "/admin/inquiries/{inquiry_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete inquiry record (Admin)",
    description="Deletes an inquiry from the database."
)
def delete_inquiry(
    inquiry_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> dict:
    success = InquiryService.delete_inquiry(db, inquiry_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry record not found")
    return {
        "status": "ok",
        "message": "Inquiry record deleted successfully by admin",
        "deleted_id": inquiry_id
    }
