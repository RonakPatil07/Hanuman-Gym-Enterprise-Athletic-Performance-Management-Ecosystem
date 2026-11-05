import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_pg_database():
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="PSDATABASE",
        database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'gym_website';")
    if not cur.fetchone():
        cur.execute("CREATE DATABASE gym_website;")
        print("Database 'gym_website' created in PostgreSQL.")
    else:
        print("Database 'gym_website' already exists in PostgreSQL.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    create_pg_database()
