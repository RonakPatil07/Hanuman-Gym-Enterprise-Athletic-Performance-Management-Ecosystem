import time
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def admin_account():
    """Creates an admin user and returns auth headers."""
    email = f"admin_fixture_{int(time.time() * 1000)}@gymtest.com"
    password = "AdminPass123!"
    
    # Register regular user first
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Super Admin Tester",
        "email": email,
        "password": password
    })
    user_id = reg_res.json()["id"]
    
    # Promote user to admin directly in DB via SQLAlchemy session fixture or direct DB query
    from app.database.session import SessionLocal
    from app.models.user import User
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        user.role = "admin"
        db.commit()
    finally:
        db.close()
    
    # Login to receive JWT with admin role
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    token = login_res.json()["access_token"]
    return {"token": token, "user_id": user_id, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def normal_user():
    """Creates a regular non-admin user."""
    email = f"regular_user_{int(time.time() * 1000)}@gymtest.com"
    password = "UserPass123!"
    
    client.post("/api/v1/auth/register", json={
        "name": "Regular User Tester",
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


def test_admin_can_access_stats(admin_account):
    response = client.get("/api/v1/admin/stats", headers=admin_account["headers"])
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "total_workouts" in data
    assert "total_purchases" in data
    assert "total_revenue" in data
    assert data["total_users"] >= 1


def test_normal_user_receives_403_on_admin_stats(normal_user):
    response = client.get("/api/v1/admin/stats", headers=normal_user["headers"])
    assert response.status_code == 403
    assert "admin privilege required" in response.json()["detail"].lower()


def test_admin_endpoints_require_jwt():
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 401
    
    invalid_res = client.get("/api/v1/admin/users", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert invalid_res.status_code == 401


def test_admin_can_list_users_paginated(admin_account):
    response = client.get("/api/v1/admin/users?limit=10&offset=0", headers=admin_account["headers"])
    assert response.status_code == 200
    data = response.json()
    assert "users" in data
    assert "total_count" in data
    assert data["total_count"] >= 1
    assert data["limit"] == 10
    assert data["offset"] == 0
    assert len(data["users"]) >= 1


def test_admin_can_get_user_details_and_password_hash_never_exposed(admin_account, normal_user):
    response = client.get(f"/api/v1/admin/users/{normal_user['user_id']}", headers=admin_account["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == normal_user["user_id"]
    assert "password" not in data
    assert "password_hash" not in data
    assert "passHash" not in data


def test_admin_can_update_user_role_and_details(admin_account):
    # Create a user to modify
    email = f"update_target_{int(time.time() * 1000)}@gymtest.com"
    reg = client.post("/api/v1/auth/register", json={
        "name": "Before Update",
        "email": email,
        "password": "Password123!"
    })
    target_id = reg.json()["id"]
    
    update_payload = {
        "name": "Promoted Trainer",
        "role": "trainer",
        "is_active": True,
        "fitness_goal": "endurance"
    }
    
    update_res = client.put(f"/api/v1/admin/users/{target_id}", json=update_payload, headers=admin_account["headers"])
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["name"] == "Promoted Trainer"
    assert data["role"] == "trainer"
    assert data["fitness_goal"] == "endurance"


def test_admin_cannot_self_delete(admin_account):
    del_res = client.delete(f"/api/v1/admin/users/{admin_account['user_id']}", headers=admin_account["headers"])
    assert del_res.status_code == 400
    assert "cannot delete your own" in del_res.json()["detail"].lower()


def test_admin_can_delete_user(admin_account):
    # Create temporary user
    email = f"del_target_{int(time.time() * 1000)}@gymtest.com"
    reg = client.post("/api/v1/auth/register", json={
        "name": "To Be Deleted",
        "email": email,
        "password": "Password123!"
    })
    del_id = reg.json()["id"]
    
    del_res = client.delete(f"/api/v1/admin/users/{del_id}", headers=admin_account["headers"])
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "ok"
    
    # Confirm 404
    get_res = client.get(f"/api/v1/admin/users/{del_id}", headers=admin_account["headers"])
    assert get_res.status_code == 404


def test_admin_can_list_and_delete_purchases(admin_account, normal_user):
    # User creates a purchase
    create_res = client.post("/api/v1/purchases", json={
        "item_name": "Admin Test Item",
        "item_price": "799.00",
        "purchase_date": "2026-08-16"
    }, headers=normal_user["headers"])
    purchase_id = create_res.json()["id"]
    
    # Admin lists purchases
    list_res = client.get("/api/v1/admin/purchases", headers=admin_account["headers"])
    assert list_res.status_code == 200
    ids = [p["id"] for p in list_res.json()["purchases"]]
    assert purchase_id in ids
    
    # Admin gets single purchase
    get_res = client.get(f"/api/v1/admin/purchases/{purchase_id}", headers=admin_account["headers"])
    assert get_res.status_code == 200
    assert get_res.json()["item_name"] == "Admin Test Item"
    
    # Admin deletes purchase
    del_res = client.delete(f"/api/v1/admin/purchases/{purchase_id}", headers=admin_account["headers"])
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "ok"


def test_admin_can_list_and_delete_workouts(admin_account, normal_user):
    # User creates a workout
    create_res = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "Admin Audit Squats",
        "sets": 4,
        "reps": 10,
        "weight": 90.0
    }, headers=normal_user["headers"])
    workout_id = create_res.json()["id"]
    
    # Admin lists workouts
    list_res = client.get("/api/v1/admin/workouts", headers=admin_account["headers"])
    assert list_res.status_code == 200
    ids = [w["id"] for w in list_res.json()["workouts"]]
    assert workout_id in ids
    
    # Admin gets single workout
    get_res = client.get(f"/api/v1/admin/workouts/{workout_id}", headers=admin_account["headers"])
    assert get_res.status_code == 200
    assert get_res.json()["exercise_name"] == "Admin Audit Squats"
    
    # Admin deletes workout
    del_res = client.delete(f"/api/v1/admin/workouts/{workout_id}", headers=admin_account["headers"])
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "ok"
