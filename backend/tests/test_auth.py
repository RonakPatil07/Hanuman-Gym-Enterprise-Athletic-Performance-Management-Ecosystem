import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, verify_password, get_password_hash

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_password_hashing_and_verification():
    password = "MySecureGymPassword2026!"
    pw_hash = get_password_hash(password)
    
    assert pw_hash != password
    assert pw_hash.startswith("$2")
    assert verify_password(password, pw_hash) is True
    assert verify_password("WrongPassword", pw_hash) is False
    
    # Verify PHP $2y$ format compatibility
    php_2y_hash = pw_hash.replace("$2b$", "$2y$")
    assert verify_password(password, php_2y_hash) is True


def test_register_successful():
    unique_email = f"fastapi_user_{int(time.time())}@gymtest.com"
    payload = {
        "name": "FastAPI Test Athlete",
        "email": unique_email,
        "password": "StrongPassword123!",
        "phone": "9998887777",
        "address": "100 Fitness Way",
        "current_weight": 80.5,
        "target_weight": 75.0,
        "water_goal": 3.0,
        "calorie_goal": 2500,
        "workout_days": 4,
        "fitness_goal": "muscle-gain"
    }
    
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["email"] == unique_email
    assert data["name"] == "FastAPI Test Athlete"
    assert data["role"] == "user"
    assert data["is_active"] is True
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email():
    unique_email = f"duplicate_{int(time.time())}@gymtest.com"
    payload = {
        "name": "Duplicate Tester",
        "email": unique_email,
        "password": "Password123!"
    }
    
    # First registration
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201
    
    # Second registration with same email
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_login_successful():
    email = f"login_user_{int(time.time())}@gymtest.com"
    password = "LoginSecret123!"
    
    # Register first
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Login Tester",
        "email": email,
        "password": password
    })
    assert reg_res.status_code == 201
    
    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["email"] == email
    assert token_data["user"]["role"] == "user"
    assert "password" not in token_data["user"]
    assert "password_hash" not in token_data["user"]


def test_login_incorrect_password():
    email = f"wrongpw_{int(time.time())}@gymtest.com"
    password = "CorrectPassword123!"
    
    client.post("/api/v1/auth/register", json={
        "name": "Wrong Password Tester",
        "email": email,
        "password": password
    })
    
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "IncorrectPassword!"
    })
    assert login_res.status_code == 401
    assert "invalid email or password" in login_res.json()["detail"].lower()


def test_login_nonexistent_user():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "doesnotexist99999@gymtest.com",
        "password": "AnyPassword123!"
    })
    assert login_res.status_code == 401
    assert "invalid email or password" in login_res.json()["detail"].lower()


def test_get_me_valid_jwt():
    email = f"me_user_{int(time.time())}@gymtest.com"
    password = "MePassword123!"
    
    client.post("/api/v1/auth/register", json={
        "name": "Me Endpoint Tester",
        "email": email,
        "password": password
    })
    
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    token = login_res.json()["access_token"]
    
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    user_info = me_res.json()
    assert user_info["email"] == email
    assert user_info["name"] == "Me Endpoint Tester"
    assert user_info["role"] == "user"


def test_get_me_missing_jwt():
    me_res = client.get("/api/v1/auth/me")
    assert me_res.status_code == 401
    assert "not provided" in me_res.json()["detail"].lower()


def test_get_me_invalid_jwt():
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token.here"})
    assert me_res.status_code == 401
    assert "invalid" in me_res.json()["detail"].lower()


def test_logout():
    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200
    assert logout_res.json()["status"] == "ok"
