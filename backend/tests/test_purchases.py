import time
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def buyer_a():
    """Creates Buyer A and returns auth header and user info."""
    email = f"buyer_a_{int(time.time() * 1000)}@gymtest.com"
    password = "PurchasePass123!"
    
    client.post("/api/v1/auth/register", json={
        "name": "Buyer A",
        "email": email,
        "password": password
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    return {"token": token, "user_id": user_id, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def buyer_b():
    """Creates Buyer B and returns auth header and user info."""
    email = f"buyer_b_{int(time.time() * 1000)}@gymtest.com"
    password = "PurchasePass123!"
    
    client.post("/api/v1/auth/register", json={
        "name": "Buyer B",
        "email": email,
        "password": password
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    return {"token": token, "user_id": user_id, "headers": {"Authorization": f"Bearer {token}"}}


def test_create_purchase_successfully(buyer_a):
    payload = {
        "item_name": "Premium Whey Protein 2kg",
        "item_price": "2499.50",
        "purchase_date": "2026-08-16"
    }
    response = client.post("/api/v1/purchases", json=payload, headers=buyer_a["headers"])
    assert response.status_code == 201
    data = response.json()
    assert data["item_name"] == "Premium Whey Protein 2kg"
    assert Decimal(str(data["item_price"])) == Decimal("2499.50")
    assert data["purchase_date"] == "2026-08-16"
    assert data["user_id"] == buyer_a["user_id"]
    assert "id" in data
    assert "created_at" in data


def test_get_purchase_history(buyer_a):
    # Add two purchases
    client.post("/api/v1/purchases", json={
        "item_name": "Gym Shaker Bottle",
        "item_price": "299.00",
        "purchase_date": "2026-08-14"
    }, headers=buyer_a["headers"])
    
    client.post("/api/v1/purchases", json={
        "item_name": "Creatine Monohydrate 300g",
        "item_price": "999.00",
        "purchase_date": "2026-08-16"
    }, headers=buyer_a["headers"])
    
    response = client.get("/api/v1/purchases?limit=10&offset=0", headers=buyer_a["headers"])
    assert response.status_code == 200
    data = response.json()
    assert "purchases" in data
    assert "total_count" in data
    assert "total_spent" in data
    assert data["total_count"] >= 2
    assert Decimal(str(data["total_spent"])) >= Decimal("1298.00")
    assert data["limit"] == 10
    assert data["offset"] == 0
    
    # Ordering: newest purchase date first
    dates = [p["purchase_date"] for p in data["purchases"]]
    assert dates == sorted(dates, reverse=True)


def test_get_individual_purchase(buyer_a):
    create_res = client.post("/api/v1/purchases", json={
        "item_name": "Lifting Straps",
        "item_price": "450.00",
        "purchase_date": "2026-08-16"
    }, headers=buyer_a["headers"])
    purchase_id = create_res.json()["id"]
    
    get_res = client.get(f"/api/v1/purchases/{purchase_id}", headers=buyer_a["headers"])
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == purchase_id
    assert data["item_name"] == "Lifting Straps"
    assert Decimal(str(data["item_price"])) == Decimal("450.00")


def test_delete_purchase_successfully(buyer_a):
    create_res = client.post("/api/v1/purchases", json={
        "item_name": "Energy Drink 6-Pack",
        "item_price": "600.00",
        "purchase_date": "2026-08-16"
    }, headers=buyer_a["headers"])
    purchase_id = create_res.json()["id"]
    
    # Delete
    del_res = client.delete(f"/api/v1/purchases/{purchase_id}", headers=buyer_a["headers"])
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "ok"
    assert del_res.json()["deleted_id"] == purchase_id
    
    # Subsequent get returns 404
    get_res = client.get(f"/api/v1/purchases/{purchase_id}", headers=buyer_a["headers"])
    assert get_res.status_code == 404


def test_purchase_missing_jwt():
    response = client.get("/api/v1/purchases")
    assert response.status_code == 401
    assert "not provided" in response.json()["detail"].lower()


def test_purchase_invalid_jwt():
    response = client.get("/api/v1/purchases", headers={"Authorization": "Bearer bad.token"})
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_invalid_purchase_data_validation(buyer_a):
    # Invalid price (<= 0)
    payload = {
        "item_name": "Free Item",
        "item_price": "0.00",
        "purchase_date": "2026-08-16"
    }
    response = client.post("/api/v1/purchases", json=payload, headers=buyer_a["headers"])
    assert response.status_code == 422


def test_user_id_and_id_injection_forbidden(buyer_a):
    # Attempting to pass user_id or id in request body
    payload = {
        "item_name": "Hack Attempt",
        "item_price": "100.00",
        "purchase_date": "2026-08-16",
        "user_id": 999,
        "id": 1,
        "created_at": "2020-01-01T00:00:00Z"
    }
    response = client.post("/api/v1/purchases", json=payload, headers=buyer_a["headers"])
    # extra="forbid" rejects all injected fields
    assert response.status_code == 422


def test_cross_user_isolation_cannot_access_other_user_purchase(buyer_a, buyer_b):
    # Buyer A creates a purchase
    create_res = client.post("/api/v1/purchases", json={
        "item_name": "Buyer A Private Subscription",
        "item_price": "1999.00",
        "purchase_date": "2026-08-16"
    }, headers=buyer_a["headers"])
    purchase_a_id = create_res.json()["id"]
    
    # Buyer B attempts to get Buyer A's purchase by ID -> returns 404
    get_res_b = client.get(f"/api/v1/purchases/{purchase_a_id}", headers=buyer_b["headers"])
    assert get_res_b.status_code == 404
    
    # Buyer B purchase list does NOT contain Buyer A's purchase
    list_res_b = client.get("/api/v1/purchases", headers=buyer_b["headers"])
    assert list_res_b.status_code == 200
    buyer_b_purchase_ids = [p["id"] for p in list_res_b.json()["purchases"]]
    assert purchase_a_id not in buyer_b_purchase_ids


def test_cross_user_isolation_cannot_delete_other_user_purchase(buyer_a, buyer_b):
    # Buyer A creates a purchase
    create_res = client.post("/api/v1/purchases", json={
        "item_name": "Buyer A Keep Alive Purchase",
        "item_price": "1500.00",
        "purchase_date": "2026-08-16"
    }, headers=buyer_a["headers"])
    purchase_a_id = create_res.json()["id"]
    
    # Buyer B attempts to delete Buyer A's purchase -> returns 404
    del_res_b = client.delete(f"/api/v1/purchases/{purchase_a_id}", headers=buyer_b["headers"])
    assert del_res_b.status_code == 404
    
    # Buyer A verifies purchase still exists
    get_res_a = client.get(f"/api/v1/purchases/{purchase_a_id}", headers=buyer_a["headers"])
    assert get_res_a.status_code == 200
    assert get_res_a.json()["id"] == purchase_a_id
