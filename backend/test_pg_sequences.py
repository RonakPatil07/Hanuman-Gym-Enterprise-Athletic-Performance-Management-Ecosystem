import psycopg2

def test_sequences():
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="PSDATABASE",
        database="gym_website"
    )
    cur = conn.cursor()

    # 1. Insert new user
    cur.execute("INSERT INTO users (name, email, password_hash, role) VALUES ('Seq Test', 'seq_test@gym.com', 'dummy_hash', 'user') RETURNING id;")
    new_u_id = cur.fetchone()[0]
    print(f"New User ID: {new_u_id} (Expected >= 340)")
    assert new_u_id >= 340, f"Expected user id >= 340, got {new_u_id}"

    # 2. Insert new workout
    cur.execute("INSERT INTO workout_logs (user_id, workout_date, exercise_name, sets, reps, weight) VALUES (%s, '2026-08-16', 'Seq Squats', 3, 10, 60.0) RETURNING id;", (new_u_id,))
    new_w_id = cur.fetchone()[0]
    print(f"New Workout ID: {new_w_id} (Expected >= 85)")
    assert new_w_id >= 85, f"Expected workout id >= 85, got {new_w_id}"

    # 3. Insert new purchase
    cur.execute("INSERT INTO purchases (user_id, item_name, item_price, purchase_date) VALUES (%s, 'Seq Item', 500.00, '2026-08-16') RETURNING id;", (new_u_id,))
    new_p_id = cur.fetchone()[0]
    print(f"New Purchase ID: {new_p_id} (Expected >= 56)")
    assert new_p_id >= 56, f"Expected purchase id >= 56, got {new_p_id}"

    # Clean up test records (cascading deletes workouts and purchases)
    cur.execute("DELETE FROM users WHERE id = %s;", (new_u_id,))
    conn.commit()
    print("Sequence validation: 100% PASSED")
    cur.close()
    conn.close()

if __name__ == "__main__":
    test_sequences()
