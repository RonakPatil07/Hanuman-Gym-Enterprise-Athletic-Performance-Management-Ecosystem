import time
from datetime import date
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def user_a():
    """Creates User A and returns auth header and user info."""
    email = f"workout_user_a_{int(time.time() * 1000)}@gymtest.com"
    password = "WorkoutPass123!"
    
    client.post("/api/v1/auth/register", json={
        "name": "Athlete A",
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
def user_b():
    """Creates User B and returns auth header and user info."""
    email = f"workout_user_b_{int(time.time() * 1000)}@gymtest.com"
    password = "WorkoutPass123!"
    
    client.post("/api/v1/auth/register", json={
        "name": "Athlete B",
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


def test_create_workout_successfully(user_a):
    payload = {
        "workout_date": "2026-08-16",
        "exercise_name": "Bench Press",
        "sets": 4,
        "reps": 10,
        "weight": 80.0,
        "water_intake": 2.5,
        "calories_consumed": 450,
        "duration_minutes": 60,
        "notes": "Chest & Triceps power day."
    }
    
    response = client.post("/api/v1/workouts", json=payload, headers=user_a["headers"])
    assert response.status_code == 201
    data = response.json()
    assert data["exercise_name"] == "Bench Press"
    assert data["sets"] == 4
    assert data["reps"] == 10
    assert data["weight"] == 80.0
    assert data["water_intake"] == 2.5
    assert data["calories_consumed"] == 450
    assert data["duration_minutes"] == 60
    assert data["notes"] == "Chest & Triceps power day."
    assert data["user_id"] == user_a["user_id"]
    assert "id" in data


def test_get_workout_history(user_a):
    # Add two workout logs
    client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-15",
        "exercise_name": "Squats",
        "sets": 5,
        "reps": 5,
        "weight": 100.0
    }, headers=user_a["headers"])
    
    client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "Deadlifts",
        "sets": 3,
        "reps": 8,
        "weight": 120.0
    }, headers=user_a["headers"])
    
    response = client.get("/api/v1/workouts?limit=10&offset=0", headers=user_a["headers"])
    assert response.status_code == 200
    data = response.json()
    assert "workouts" in data
    assert "total_count" in data
    assert data["total_count"] >= 2
    assert len(data["workouts"]) >= 2
    assert data["limit"] == 10
    assert data["offset"] == 0
    # Confirm ordering: latest date first
    dates = [w["workout_date"] for w in data["workouts"]]
    assert dates == sorted(dates, reverse=True)


def test_get_individual_workout(user_a):
    create_res = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "Overhead Press",
        "sets": 3,
        "reps": 10,
        "weight": 45.0
    }, headers=user_a["headers"])
    workout_id = create_res.json()["id"]
    
    get_res = client.get(f"/api/v1/workouts/{workout_id}", headers=user_a["headers"])
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == workout_id
    assert data["exercise_name"] == "Overhead Press"
    assert data["weight"] == 45.0


def test_update_workout_successfully(user_a):
    create_res = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "Pull Ups",
        "sets": 3,
        "reps": 8,
        "weight": 0.0
    }, headers=user_a["headers"])
    workout_id = create_res.json()["id"]
    
    update_payload = {
        "sets": 4,
        "reps": 12,
        "weight": 10.0,
        "notes": "Added 10kg weighted belt"
    }
    update_res = client.put(f"/api/v1/workouts/{workout_id}", json=update_payload, headers=user_a["headers"])
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["sets"] == 4
    assert data["reps"] == 12
    assert data["weight"] == 10.0
    assert data["notes"] == "Added 10kg weighted belt"
    assert data["exercise_name"] == "Pull Ups"


def test_delete_workout_successfully(user_a):
    create_res = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "Barbell Rows",
        "sets": 3,
        "reps": 10,
        "weight": 60.0
    }, headers=user_a["headers"])
    workout_id = create_res.json()["id"]
    
    # Delete
    del_res = client.delete(f"/api/v1/workouts/{workout_id}", headers=user_a["headers"])
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "ok"
    
    # Confirm 404 on subsequent get
    get_res = client.get(f"/api/v1/workouts/{workout_id}", headers=user_a["headers"])
    assert get_res.status_code == 404


def test_workout_missing_jwt():
    response = client.get("/api/v1/workouts")
    assert response.status_code == 401
    assert "not provided" in response.json()["detail"].lower()


def test_workout_invalid_jwt():
    response = client.get("/api/v1/workouts", headers={"Authorization": "Bearer bad.token.here"})
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_invalid_workout_data_validation(user_a):
    # Invalid sets (<= 0) and invalid weight (< 0)
    payload = {
        "workout_date": "2026-08-16",
        "exercise_name": "Invalid Workout",
        "sets": 0,
        "reps": -5,
        "weight": -10.0
    }
    response = client.post("/api/v1/workouts", json=payload, headers=user_a["headers"])
    assert response.status_code == 422


def test_user_id_injection_forbidden(user_a):
    # Attempting to pass "user_id": 999 in body
    payload = {
        "workout_date": "2026-08-16",
        "exercise_name": "Hacked Workout",
        "sets": 3,
        "reps": 10,
        "weight": 50.0,
        "user_id": 999
    }
    response = client.post("/api/v1/workouts", json=payload, headers=user_a["headers"])
    # extra="forbid" rejects the injection attempt
    assert response.status_code == 422


def test_cross_user_isolation_cannot_access_other_user_workout(user_a, user_b):
    # User A creates a workout
    create_res = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "User A Private Workout",
        "sets": 3,
        "reps": 10,
        "weight": 70.0
    }, headers=user_a["headers"])
    workout_a_id = create_res.json()["id"]
    
    # User B attempts to access User A's workout by ID -> returns 404 (not 200, nor 403 leaking existence)
    get_res_b = client.get(f"/api/v1/workouts/{workout_a_id}", headers=user_b["headers"])
    assert get_res_b.status_code == 404
    
    # User B list workouts does NOT contain User A's workout
    list_res_b = client.get("/api/v1/workouts", headers=user_b["headers"])
    assert list_res_b.status_code == 200
    user_b_workout_ids = [w["id"] for w in list_res_b.json()["workouts"]]
    assert workout_a_id not in user_b_workout_ids


def test_cross_user_isolation_cannot_modify_other_user_workout(user_a, user_b):
    # User A creates a workout
    create_res = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "User A Workout Before Edit",
        "sets": 3,
        "reps": 10,
        "weight": 70.0
    }, headers=user_a["headers"])
    workout_a_id = create_res.json()["id"]
    
    # User B attempts to modify User A's workout -> returns 404
    put_res_b = client.put(f"/api/v1/workouts/{workout_a_id}", json={
        "exercise_name": "Tampered By User B"
    }, headers=user_b["headers"])
    assert put_res_b.status_code == 404
    
    # User A verifies workout remains untouched
    get_res_a = client.get(f"/api/v1/workouts/{workout_a_id}", headers=user_a["headers"])
    assert get_res_a.json()["exercise_name"] == "User A Workout Before Edit"


def test_cross_user_isolation_cannot_delete_other_user_workout(user_a, user_b):
    # User A creates a workout
    create_res = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "User A Keep Alive Workout",
        "sets": 3,
        "reps": 10,
        "weight": 70.0
    }, headers=user_a["headers"])
    workout_a_id = create_res.json()["id"]
    
    # User B attempts to delete User A's workout -> returns 404
    del_res_b = client.delete(f"/api/v1/workouts/{workout_a_id}", headers=user_b["headers"])
    assert del_res_b.status_code == 404
    
    # User A verifies workout still exists
    get_res_a = client.get(f"/api/v1/workouts/{workout_a_id}", headers=user_a["headers"])
    assert get_res_a.status_code == 200
    assert get_res_a.json()["id"] == workout_a_id
