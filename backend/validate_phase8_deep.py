import pymysql
import psycopg2
import json
from decimal import Decimal

def validate():
    # 1. Connect
    m_conn = pymysql.connect(
        host="localhost", port=3306, user="root", password="", database="gym_website",
        cursorclass=pymysql.cursors.DictCursor
    )
    m_cur = m_conn.cursor()

    p_conn = psycopg2.connect(
        host="localhost", port=5432, user="postgres", password="PSDATABASE", database="gym_website"
    )
    p_cur = p_conn.cursor()

    report = {}

    # 1. Foreign Key Integrity
    m_cur.execute("SELECT COUNT(*) AS c FROM workout_logs WHERE user_id NOT IN (SELECT id FROM users);")
    m_w_orphans = m_cur.fetchone()["c"]
    m_cur.execute("SELECT COUNT(*) AS c FROM purchases WHERE user_id NOT IN (SELECT id FROM users);")
    m_p_orphans = m_cur.fetchone()["c"]

    p_cur.execute("SELECT COUNT(*) FROM workout_logs WHERE user_id NOT IN (SELECT id FROM users);")
    p_w_orphans = p_cur.fetchone()[0]
    p_cur.execute("SELECT COUNT(*) FROM purchases WHERE user_id NOT IN (SELECT id FROM users);")
    p_p_orphans = p_cur.fetchone()[0]

    # Check PG foreign key constraints
    p_cur.execute("""
        SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    """)
    pg_fks = p_cur.fetchall()

    report["foreign_keys"] = {
        "mysql_workout_orphans": m_w_orphans,
        "pg_workout_orphans": p_w_orphans,
        "mysql_purchase_orphans": m_p_orphans,
        "pg_purchase_orphans": p_p_orphans,
        "pg_constraints": pg_fks
    }

    # 2. Primary Keys & Unique Constraints
    p_cur.execute("""
        SELECT tc.table_name, tc.constraint_type, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
        ORDER BY tc.table_name, tc.constraint_type;
    """)
    pg_pk_uni = p_cur.fetchall()
    report["pk_and_unique"] = pg_pk_uni

    # 3. Columns, Types, Nullability, Defaults comparison
    tables = ["users", "workout_logs", "purchases"]
    col_comp = {}
    for t in tables:
        m_cur.execute(f"DESCRIBE {t};")
        m_cols = {row["Field"]: row for row in m_cur.fetchall()}

        p_cur.execute(f"""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '{t}'
            ORDER BY ordinal_position;
        """)
        p_cols = {row[0]: {"type": row[1], "nullable": row[2], "default": row[3]} for row in p_cur.fetchall()}
        col_comp[t] = {
            "mysql": m_cols,
            "postgres": p_cols
        }
    report["columns"] = col_comp

    # 4. Users Data Validation
    m_cur.execute("SELECT id, name, email, password_hash, role, is_active, phone, address, created_at FROM users ORDER BY id ASC;")
    m_users = m_cur.fetchall()
    p_cur.execute("SELECT id, name, email, password_hash, role, is_active, phone, address, created_at FROM users ORDER BY id ASC;")
    p_users = p_cur.fetchall()

    p_users_dict = {u[0]: u for u in p_users}
    id_mismatches = 0
    email_mismatches = 0
    role_mismatches = 0
    hash_mismatches = 0

    for mu in m_users:
        uid = mu["id"]
        if uid not in p_users_dict:
            id_mismatches += 1
            continue
        pu = p_users_dict[uid]
        if mu["email"] != pu[2]:
            email_mismatches += 1
        if mu["role"] != pu[4]:
            role_mismatches += 1
        if mu["password_hash"] != pu[3]:
            hash_mismatches += 1

    report["users"] = {
        "mysql_count": len(m_users),
        "pg_count": len(p_users),
        "id_mismatches": id_mismatches,
        "email_mismatches": email_mismatches,
        "role_mismatches": role_mismatches,
        "hash_mismatches": hash_mismatches
    }

    # 5. Workouts Data Validation
    m_cur.execute("SELECT id, user_id, workout_date, exercise_name, sets, reps, weight, duration_minutes FROM workout_logs ORDER BY id ASC;")
    m_workouts = m_cur.fetchall()
    p_cur.execute("SELECT id, user_id, workout_date, exercise_name, sets, reps, weight, duration_minutes FROM workout_logs ORDER BY id ASC;")
    p_workouts = p_cur.fetchall()

    p_w_dict = {w[0]: w for w in p_workouts}
    w_id_diff = 0
    for mw in m_workouts:
        wid = mw["id"]
        if wid not in p_w_dict:
            w_id_diff += 1

    m_cur.execute("SELECT MIN(id), MAX(id), MIN(workout_date), MAX(workout_date) FROM workout_logs;")
    mw_stats = m_cur.fetchone()
    p_cur.execute("SELECT MIN(id), MAX(id), MIN(workout_date), MAX(workout_date) FROM workout_logs;")
    pw_stats = p_cur.fetchone()

    # Workouts per user check
    m_cur.execute("SELECT user_id, COUNT(*) AS cnt FROM workout_logs GROUP BY user_id ORDER BY user_id ASC;")
    m_w_user = {r["user_id"]: r["cnt"] for r in m_cur.fetchall()}
    p_cur.execute("SELECT user_id, COUNT(*) FROM workout_logs GROUP BY user_id ORDER BY user_id ASC;")
    p_w_user = {r[0]: r[1] for r in p_cur.fetchall()}
    w_user_diff = sum(1 for uid, cnt in m_w_user.items() if p_w_user.get(uid) != cnt)

    report["workouts"] = {
        "mysql_count": len(m_workouts),
        "pg_count": len(p_workouts),
        "id_differences": w_id_diff,
        "user_distribution_mismatches": w_user_diff,
        "mysql_min_id": mw_stats["MIN(id)"],
        "mysql_max_id": mw_stats["MAX(id)"],
        "mysql_min_date": str(mw_stats["MIN(workout_date)"]),
        "mysql_max_date": str(mw_stats["MAX(workout_date)"]),
        "pg_min_id": pw_stats[0],
        "pg_max_id": pw_stats[1],
        "pg_min_date": str(pw_stats[2]),
        "pg_max_date": str(pw_stats[3])
    }

    # 6. Purchases Validation
    m_cur.execute("SELECT COUNT(*), COALESCE(SUM(item_price), 0) FROM purchases;")
    m_p_stat = m_cur.fetchone()
    p_cur.execute("SELECT COUNT(*), COALESCE(SUM(item_price), 0) FROM purchases;")
    p_p_stat = p_cur.fetchone()

    m_total_rev = Decimal(str(m_p_stat["COALESCE(SUM(item_price), 0)"]))
    p_total_rev = Decimal(str(p_p_stat[1]))

    m_cur.execute("SELECT user_id, COUNT(*) AS cnt, SUM(item_price) AS sum FROM purchases GROUP BY user_id ORDER BY user_id ASC;")
    m_p_user = {r["user_id"]: (r["cnt"], Decimal(str(r["sum"]))) for r in m_cur.fetchall()}
    p_cur.execute("SELECT user_id, COUNT(*), SUM(item_price) FROM purchases GROUP BY user_id ORDER BY user_id ASC;")
    p_p_user = {r[0]: (r[1], Decimal(str(r[2]))) for r in p_cur.fetchall()}

    p_user_diff = sum(1 for uid, val in m_p_user.items() if p_p_user.get(uid) != val)

    report["purchases"] = {
        "mysql_count": m_p_stat["COUNT(*)"],
        "pg_count": p_p_stat[0],
        "mysql_total": str(m_total_rev),
        "pg_total": str(p_total_rev),
        "diff": str(p_total_rev - m_total_rev),
        "user_distribution_mismatches": p_user_diff
    }

    # 7. Sequences check
    p_cur.execute("""
        SELECT 'users' AS tbl, COALESCE(MAX(id), 0) FROM users
        UNION ALL
        SELECT 'workout_logs' AS tbl, COALESCE(MAX(id), 0) FROM workout_logs
        UNION ALL
        SELECT 'purchases' AS tbl, COALESCE(MAX(id), 0) FROM purchases;
    """)
    max_ids = dict(p_cur.fetchall())

    p_cur.execute("SELECT last_value FROM users_id_seq;")
    u_seq = p_cur.fetchone()[0]
    p_cur.execute("SELECT last_value FROM workout_logs_id_seq;")
    w_seq = p_cur.fetchone()[0]
    p_cur.execute("SELECT last_value FROM purchases_id_seq;")
    p_seq = p_cur.fetchone()[0]

    report["sequences"] = {
        "users": {"max_id": max_ids["users"], "seq": u_seq, "next_id": u_seq + 1},
        "workout_logs": {"max_id": max_ids["workout_logs"], "seq": w_seq, "next_id": w_seq + 1},
        "purchases": {"max_id": max_ids["purchases"], "seq": p_seq, "next_id": p_seq + 1}
    }

    print(json.dumps(report, indent=2, default=str))

    m_cur.close()
    m_conn.close()
    p_cur.close()
    p_conn.close()

if __name__ == "__main__":
    validate()
