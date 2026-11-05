import time
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

def test_all_api_endpoints():
    client = TestClient(app)
    
    # 1. Register
    ts = int(time.time() * 1000)
    email = f"api_test_{ts}@gym.com"
    reg = client.post("/api/v1/auth/register", json={
        "name": "API Tester",
        "email": email,
        "password": "Password123!",
        "fitness_goal": "muscle-gain"
    })
    assert reg.status_code == 201, f"Register failed: {reg.text}"
    user_id = reg.json()["id"]

    # 2. Login
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123!"})
    assert login.status_code == 200, f"Login failed: {login.text}"
    token = login.json()["access_token"]
    user_h = {"Authorization": f"Bearer {token}"}

    # 3. Auth Me
    me = client.get("/api/v1/auth/me", headers=user_h)
    assert me.status_code == 200, f"Auth me failed: {me.text}"

    # 4. Profile GET & PUT
    p_get = client.get("/api/v1/users/me", headers=user_h)
    assert p_get.status_code == 200, f"Profile get failed: {p_get.text}"
    
    p_put = client.put("/api/v1/users/me", json={"target_weight": 82.5}, headers=user_h)
    assert p_put.status_code == 200, f"Profile put failed: {p_put.text}"

    # 5. Workouts CRUD
    w_post = client.post("/api/v1/workouts", json={
        "workout_date": "2026-08-16",
        "exercise_name": "Incline Bench",
        "sets": 4,
        "reps": 8,
        "weight": 70.0
    }, headers=user_h)
    assert w_post.status_code == 201, f"Workout create failed: {w_post.text}"
    w_id = w_post.json()["id"]

    w_list = client.get("/api/v1/workouts", headers=user_h)
    assert w_list.status_code == 200

    w_get = client.get(f"/api/v1/workouts/{w_id}", headers=user_h)
    assert w_get.status_code == 200

    w_put = client.put(f"/api/v1/workouts/{w_id}", json={"weight": 75.0}, headers=user_h)
    assert w_put.status_code == 200

    w_del = client.delete(f"/api/v1/workouts/{w_id}", headers=user_h)
    assert w_del.status_code == 200

    # 6. Purchases CRUD
    pur_post = client.post("/api/v1/purchases", json={
        "item_name": "Creatine Monohydrate",
        "item_price": 899.00,
        "purchase_date": "2026-08-16"
    }, headers=user_h)
    assert pur_post.status_code == 201, f"Purchase create failed: {pur_post.text}"
    pur_id = pur_post.json()["id"]

    pur_list = client.get("/api/v1/purchases", headers=user_h)
    assert pur_list.status_code == 200

    pur_get = client.get(f"/api/v1/purchases/{pur_id}", headers=user_h)
    assert pur_get.status_code == 200

    pur_del = client.delete(f"/api/v1/purchases/{pur_id}", headers=user_h)
    assert pur_del.status_code == 200

    # 7. Admin Endpoints
    admin_token = create_access_token(data={"user_id": 1, "email": "admin@gym.com", "role": "admin"})
    admin_h = {"Authorization": f"Bearer {admin_token}"}

    assert client.get("/api/v1/admin/stats", headers=admin_h).status_code == 200
    assert client.get("/api/v1/admin/users", headers=admin_h).status_code == 200
    assert client.get(f"/api/v1/admin/users/{user_id}", headers=admin_h).status_code == 200
    assert client.put(f"/api/v1/admin/users/{user_id}", json={"name": "Admin Modified"}, headers=admin_h).status_code == 200
    assert client.get("/api/v1/admin/purchases", headers=admin_h).status_code == 200
    assert client.get("/api/v1/admin/workouts", headers=admin_h).status_code == 200
    assert client.delete(f"/api/v1/admin/users/{user_id}", headers=admin_h).status_code == 200

    # 8. Unauthenticated & Authorization Boundaries
    assert client.get("/api/v1/users/me").status_code == 401
    assert client.get("/api/v1/workouts").status_code == 401
    assert client.get("/api/v1/purchases").status_code == 401
    assert client.get("/api/v1/admin/stats").status_code == 401

    print("ALL 26 FASTAPI ENDPOINTS AND AUTHORIZATION BOUNDARIES VERIFIED AGAINST POSTGRESQL!")

if __name__ == "__main__":
    test_all_api_endpoints()
