import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture
def test_user():
    """Creates and returns credentials and token for a test user."""
    email = f"user_profile_{int(time.time() * 1000)}@gymtest.com"
    password = "ProfilePassword123!"
    
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Original Name",
        "email": email,
        "password": password,
        "phone": "1234567890",
        "address": "Original Address",
        "current_weight": 70.0,
        "target_weight": 65.0,
        "water_goal": 2.5,
        "calorie_goal": 2000,
        "workout_days": 3,
        "fitness_goal": "weight-loss"
    })
    assert reg_res.status_code == 201
    
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    
    return {
        "email": email,
        "password": password,
        "token": token,
        "user_id": user_id,
    }


def test_get_own_profile_successfully(test_user):
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["name"] == "Original Name"
    assert data["role"] == "user"
    assert data["current_weight"] == 70.0
    assert data["target_weight"] == 65.0
    assert data["water_goal"] == 2.5
    assert data["calorie_goal"] == 2000
    assert data["workout_days"] == 3
    assert data["fitness_goal"] == "weight-loss"
    assert "password" not in data
    assert "password_hash" not in data


def test_update_own_profile_successfully(test_user):
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    update_payload = {
        "name": "Updated Athlete Name",
        "phone": "9876543210",
        "address": "456 Updated St",
        "current_weight": 72.5,
        "target_weight": 68.0,
        "water_goal": 3.5,
        "calorie_goal": 2400,
        "workout_days": 5,
        "fitness_goal": "muscle-gain"
    }
    
    response = client.put("/api/v1/users/me", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Athlete Name"
    assert data["phone"] == "9876543210"
    assert data["address"] == "456 Updated St"
    assert data["current_weight"] == 72.5
    assert data["target_weight"] == 68.0
    assert data["water_goal"] == 3.5
    assert data["calorie_goal"] == 2400
    assert data["workout_days"] == 5
    assert data["fitness_goal"] == "muscle-gain"
    
    # Verify changes persisted in database on subsequent GET
    get_res = client.get("/api/v1/users/me", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Updated Athlete Name"


def test_partial_profile_update(test_user):
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    partial_payload = {
        "current_weight": 69.5
    }
    
    response = client.put("/api/v1/users/me", json=partial_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["current_weight"] == 69.5
    # Original fields remain untouched
    assert data["email"] == test_user["email"]
    assert data["fitness_goal"] in ["weight-loss", "muscle-gain"]


def test_profile_missing_jwt():
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert "not provided" in response.json()["detail"].lower()


def test_profile_invalid_jwt():
    response = client.get("/api/v1/users/me", headers={"Authorization": "Bearer fake.invalid.token"})
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_profile_user_not_found():
    # Construct a valid JWT with a non-existent user_id
    fake_token = create_access_token(data={"sub": "ghost@gym.com", "user_id": 99999999})
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {fake_token}"})
    assert response.status_code == 401
    assert "not found" in response.json()["detail"].lower()


def test_attempt_to_modify_role_forbidden(test_user):
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    # Attempt to inject "role": "admin"
    payload = {
        "name": "Hacker Attempt",
        "role": "admin"
    }
    response = client.put("/api/v1/users/me", json=payload, headers=headers)
    # Extra forbidden field must trigger 422 Unprocessable Entity
    assert response.status_code == 422
    
    # Confirm role was not altered
    get_res = client.get("/api/v1/users/me", headers=headers)
    assert get_res.json()["role"] == "user"


def test_invalid_profile_data_validation(test_user):
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    # Invalid weight (< 20 kg) and invalid workout_days (> 7)
    payload = {
        "current_weight": 5.0,
        "workout_days": 10
    }
    response = client.put("/api/v1/users/me", json=payload, headers=headers)
    assert response.status_code == 422


def test_password_hash_never_exposed(test_user):
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    get_res = client.get("/api/v1/users/me", headers=headers)
    put_res = client.put("/api/v1/users/me", json={"name": "Check Safety"}, headers=headers)
    
    for res in [get_res, put_res]:
        data = res.json()
        assert "password" not in data
        assert "password_hash" not in data
        assert "passHash" not in data


def test_user_cannot_access_or_modify_other_user_profile():
    # Create User A
    email_a = f"user_a_{int(time.time() * 1000)}@gymtest.com"
    client.post("/api/v1/auth/register", json={"name": "User A", "email": email_a, "password": "PasswordA123!"})
    login_a = client.post("/api/v1/auth/login", json={"email": email_a, "password": "PasswordA123!"}).json()
    token_a = login_a["access_token"]
    
    # Create User B
    email_b = f"user_b_{int(time.time() * 1000)}@gymtest.com"
    client.post("/api/v1/auth/register", json={"name": "User B", "email": email_b, "password": "PasswordB123!"})
    login_b = client.post("/api/v1/auth/login", json={"email": email_b, "password": "PasswordB123!"}).json()
    token_b = login_b["access_token"]
    
    # User A requesting /users/me gets User A's data only
    res_a = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.json()["email"] == email_a
    assert res_a.json()["name"] == "User A"
    
    # User A updating /users/me updates User A only
    client.put("/api/v1/users/me", json={"name": "User A Updated"}, headers={"Authorization": f"Bearer {token_a}"})
    
    # Verify User B is completely untouched
    res_b = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b.json()["email"] == email_b
    assert res_b.json()["name"] == "User B"
