import time
from decimal import Decimal
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from app.database.session import SessionLocal
from app.models.user import User


@pytest.fixture
def admin_headers(client: TestClient):
    email = f"admin_prod_{int(time.time() * 1000)}@gymtest.com"
    password = "AdminPass123!"
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Admin Tester",
        "email": email,
        "password": password
    })
    user_id = reg_res.json()["id"]
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        user.role = "admin"
        db.commit()
    finally:
        db.close()
    
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_public_list_products(client: TestClient):
    response = client.get("/api/v1/products")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "products" in data
    assert "total_count" in data


def test_admin_product_crud_lifecycle(client: TestClient, admin_headers: dict):
    # 1. Admin Create Product
    payload = {
        "name": f"Hanuman Power Lifting Straps Pro {int(time.time())}",
        "category": "gear",
        "gender_category": "unisex",
        "price": 799.00,
        "description": "Extra heavy duty padded cotton lifting straps.",
        "image_url": "../store/images/gear-straps.jpg",
        "stock_quantity": 30,
        "is_active": True
    }
    create_res = client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
    assert create_res.status_code == status.HTTP_201_CREATED
    product_data = create_res.json()
    product_id = product_data["id"]
    assert product_data["name"] == payload["name"]
    assert float(product_data["price"]) == 799.00

    # 2. Public Get Product by ID
    get_res = client.get(f"/api/v1/products/{product_id}")
    assert get_res.status_code == status.HTTP_200_OK
    assert get_res.json()["name"] == payload["name"]

    # 3. Admin Update Product
    update_payload = {
        "price": 699.00,
        "stock_quantity": 25
    }
    update_res = client.put(f"/api/v1/admin/products/{product_id}", json=update_payload, headers=admin_headers)
    assert update_res.status_code == status.HTTP_200_OK
    assert float(update_res.json()["price"]) == 699.00
    assert update_res.json()["stock_quantity"] == 25

    # 4. Admin Delete Product
    del_res = client.delete(f"/api/v1/admin/products/{product_id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_200_OK
    assert del_res.json()["status"] == "ok"
