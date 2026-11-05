-- ==============================================================================
-- Hanuman Gym - PostgreSQL Production Schema Initialization
-- Automatically executed on container startup by /docker-entrypoint-initdb.d/
-- ==============================================================================

-- 1. Users / Athletes Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    role VARCHAR(50) DEFAULT 'athlete',
    current_weight NUMERIC(5,2),
    target_weight NUMERIC(5,2),
    water_goal NUMERIC(4,2) DEFAULT 3.0,
    calorie_goal INT DEFAULT 2500,
    workout_days INT DEFAULT 4,
    fitness_goal VARCHAR(100) DEFAULT 'muscle-gain',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    sets INT NOT NULL,
    reps INT NOT NULL,
    weight NUMERIC(6,2) NOT NULL,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    water_intake NUMERIC(4,2),
    calories_consumed INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Purchases / Store Orders Table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    item_price NUMERIC(10,2) NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(50) DEFAULT 'store',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inquiries & CRM Leads Table
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(100),
    inquiry_type VARCHAR(100) DEFAULT 'general_inquiry',
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trainer Subscriptions / Memberships Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    plan_name VARCHAR(100) NOT NULL,
    trainer_name VARCHAR(100) DEFAULT 'Gym General Membership',
    amount NUMERIC(10,2) NOT NULL,
    branch VARCHAR(100),
    payment_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
