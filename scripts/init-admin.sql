-- Script to initialize admin user
-- First, generate a password hash using: node scripts/generate-password-hash.js YourPassword
-- Then replace the hash below with your generated hash

USE fir_management;

-- Delete existing admin user (if any)
DELETE FROM users WHERE username = 'admin';

-- Insert admin user with your custom password hash
-- Default password: admin123
-- Hash below is for 'admin123' - CHANGE THIS IN PRODUCTION
INSERT INTO users (username, password_hash, role, is_active) 
VALUES (
    'admin',
    '$2a$10$rKqF7LqVqR6p.rQ5xQxZ6uGJYvYVZ4f8YkWX9YfXqXqXqXqXqXqXq',
    'Admin',
    TRUE
);

-- Verify
SELECT id, username, role, is_active, created_at FROM users WHERE username = 'admin';

-- Note: The hash above is a placeholder. To set a real password:
-- 1. Run: node scripts/generate-password-hash.js YourSecurePassword
-- 2. Copy the generated hash
-- 3. Replace the hash in this file
-- 4. Run: mysql -u root -p fir_management < scripts/init-admin.sql
