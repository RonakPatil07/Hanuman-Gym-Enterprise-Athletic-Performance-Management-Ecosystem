from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.core.permissions import require_admin
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/v1", tags=["Products & Catalog"])


# ---------------- Public Store Catalog ----------------
@router.get(
    "/products",
    response_model=ProductListResponse,
    status_code=status.HTTP_200_OK,
    summary="List store products (Public)",
    description="Retrieves active store products with optional category filtering."
)
def list_products(
    category: Annotated[Optional[str], Query(description="Filter by category")] = None,
    limit: Annotated[int, Query(ge=1, le=1000)] = 500,
    offset: Annotated[int, Query(ge=0)] = 0,
    db: Session = Depends(get_db)
) -> ProductListResponse:
    products, total_count = ProductService.get_all_products(
        db, category=category, only_active=True, limit=limit, offset=offset
    )
    return ProductListResponse(
        products=[ProductResponse.model_validate(p) for p in products],
        total_count=total_count,
        limit=limit,
        offset=offset
    )


@router.get(
    "/products/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get product details (Public)",
    description="Retrieves product details by ID."
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
) -> ProductResponse:
    product = ProductService.get_product_by_id(db, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductResponse.model_validate(product)


# ---------------- Admin Inventory & Product Management ----------------
@router.get(
    "/admin/products",
    response_model=ProductListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all inventory products (Admin)",
    description="Retrieves all products including inactive ones for inventory management."
)
def admin_list_products(
    category: Annotated[Optional[str], Query(description="Filter by category")] = None,
    limit: Annotated[int, Query(ge=1, le=1000)] = 500,
    offset: Annotated[int, Query(ge=0)] = 0,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> ProductListResponse:
    products, total_count = ProductService.get_all_products(
        db, category=category, only_active=False, limit=limit, offset=offset
    )
    return ProductListResponse(
        products=[ProductResponse.model_validate(p) for p in products],
        total_count=total_count,
        limit=limit,
        offset=offset
    )


@router.post(
    "/admin/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create store product (Admin)",
    description="Adds a new product to the catalog."
)
def admin_create_product(
    product_in: ProductCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> ProductResponse:
    product = ProductService.create_product(db, product_in)
    return ProductResponse.model_validate(product)


@router.put(
    "/admin/products/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Update product details / stock (Admin)",
    description="Updates pricing, stock quantity, active status, or metadata."
)
def admin_update_product(
    product_id: int,
    update_in: ProductUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> ProductResponse:
    product = ProductService.update_product(db, product_id, update_in)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductResponse.model_validate(product)


@router.delete(
    "/admin/products/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete product (Admin)",
    description="Deletes a product from the database."
)
def admin_delete_product(
    product_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> dict:
    success = ProductService.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return {
        "status": "ok",
        "message": "Product deleted successfully by admin",
        "deleted_id": product_id
    }
