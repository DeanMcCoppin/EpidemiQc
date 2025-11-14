-- EpidemiQc Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS thresholds CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS conditions CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    preferred_language VARCHAR(5) DEFAULT 'fr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Quebec regions table
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    region_type VARCHAR(50),
    population INTEGER,
    center_lat DECIMAL(10, 8),
    center_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health conditions being monitored
CREATE TABLE conditions (
    id SERIAL PRIMARY KEY,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test results (mock lab data)
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
    condition_id INTEGER REFERENCES conditions(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    total_tests INTEGER NOT NULL,
    positive_tests INTEGER NOT NULL,
    positive_rate DECIMAL(5, 2),
    population_tested INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(region_id, condition_id, test_date)
);

-- Outbreak thresholds
CREATE TABLE thresholds (
    id SERIAL PRIMARY KEY,
    condition_id INTEGER REFERENCES conditions(id) ON DELETE CASCADE,
    region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    threshold_type VARCHAR(20) NOT NULL,
    threshold_value DECIMAL(5, 2) NOT NULL,
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(condition_id, region_id, threshold_type)
);

-- User notification preferences
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    condition_id INTEGER REFERENCES conditions(id) ON DELETE CASCADE,
    region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    min_severity VARCHAR(20) DEFAULT 'warning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, condition_id, region_id)
);

-- Notification history
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    condition_id INTEGER REFERENCES conditions(id) ON DELETE SET NULL,
    notification_type VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    delivery_status VARCHAR(20) DEFAULT 'sent'
);

-- Admin audit logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_test_results_date ON test_results(test_date DESC);
CREATE INDEX idx_test_results_region ON test_results(region_id);
CREATE INDEX idx_test_results_condition ON test_results(condition_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, sent_at DESC);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_regions_code ON regions(code);
CREATE INDEX idx_users_email ON users(email);
