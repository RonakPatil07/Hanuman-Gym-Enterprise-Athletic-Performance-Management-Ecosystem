import time
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from app.database.session import SessionLocal
from app.models.user import User


@pytest.fixture
def admin_headers(client: TestClient):
    email = f"admin_inq_{int(time.time() * 1000)}@gymtest.com"
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


def test_public_create_inquiry(client: TestClient):
    payload = {
        "name": "Arjun Patel",
        "email": "arjun@example.com",
        "phone": "+91 9988776655",
        "location": "Koregaon Park Branch",
        "inquiry_type": "tour_booking",
        "message": "Looking forward to booking a VIP gym tour this Saturday."
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Arjun Patel"
    assert data["email"] == "arjun@example.com"
    assert data["inquiry_type"] == "tour_booking"
    assert data["status"] == "new"
    assert "id" in data


def test_admin_list_and_update_inquiry(client: TestClient, admin_headers: dict):
    # 1. Create inquiry
    create_res = client.post(
        "/api/v1/inquiries",
        json={
            "name": "Priya Deshmukh",
            "email": "priya.d@example.com",
            "phone": "9876543210",
            "inquiry_type": "trial_pass",
            "message": "Requesting 1-day trial pass."
        }
    )
    assert create_res.status_code == status.HTTP_201_CREATED
    inq_id = create_res.json()["id"]

    # 2. Admin list inquiries
    list_res = client.get("/api/v1/admin/inquiries", headers=admin_headers)
    assert list_res.status_code == status.HTTP_200_OK
    data = list_res.json()
    assert data["total_count"] >= 1
    assert any(i["id"] == inq_id for i in data["inquiries"])

    # 3. Admin update status & notes
    update_res = client.put(
        f"/api/v1/admin/inquiries/{inq_id}",
        json={"status": "contacted", "notes": "Called prospect. Scheduled trial for Monday 6 PM."},
        headers=admin_headers
    )
    assert update_res.status_code == status.HTTP_200_OK
    assert update_res.json()["status"] == "contacted"
    assert "Scheduled trial" in update_res.json()["notes"]

    # 4. Admin delete inquiry
    del_res = client.delete(f"/api/v1/admin/inquiries/{inq_id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_200_OK
    assert del_res.json()["status"] == "ok"
