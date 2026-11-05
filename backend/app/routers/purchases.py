from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.purchase import (
    PurchaseCreate,
    PurchaseListResponse,
    PurchaseResponse,
)
from app.services.purchase_service import purchase_service

router = APIRouter(prefix="/api/v1/purchases", tags=["Store & Purchases"])


@router.post(
    "",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a purchase or subscription",
    description="Creates a new purchase record bound strictly to the authenticated user ID."
)
def create_purchase(
    purchase_in: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PurchaseResponse:
    purchase = purchase_service.create_purchase(
        db=db,
        user_id=current_user.id,
        purchase_in=purchase_in
    )
    return PurchaseResponse.model_validate(purchase)


@router.get(
    "",
    response_model=PurchaseListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user purchase history",
    description="Retrieves a paginated list of purchases and total expenditure for the authenticated user."
)
def get_purchases(
    limit: Annotated[int, Query(ge=1, le=100, description="Max records to return")] = 50,
    offset: Annotated[int, Query(ge=0, description="Pagination offset")] = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PurchaseListResponse:
    purchases, total_count, total_spent = purchase_service.get_user_purchases(
        db=db,
        user_id=current_user.id,
        limit=limit,
        offset=offset
    )
    return PurchaseListResponse(
        purchases=[PurchaseResponse.model_validate(p) for p in purchases],
        total_count=total_count,
        total_spent=total_spent,
        limit=limit,
        offset=offset
    )


@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single purchase by ID",
    description="Retrieves a specific purchase entry strictly scoped to the authenticated user."
)
def get_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PurchaseResponse:
    purchase = purchase_service.get_purchase_by_id(
        db=db,
        user_id=current_user.id,
        purchase_id=purchase_id
    )
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase record not found"
        )
    return PurchaseResponse.model_validate(purchase)


@router.delete(
    "/{purchase_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a purchase entry",
    description="Deletes a specific purchase entry owned by the authenticated user."
)
def delete_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    success = purchase_service.delete_purchase(
        db=db,
        user_id=current_user.id,
        purchase_id=purchase_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase record not found"
        )
    return {
        "status": "ok",
        "message": "Purchase deleted successfully",
        "deleted_id": purchase_id
    }
