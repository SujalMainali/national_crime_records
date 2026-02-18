-- Create Tables for National Crime Records (PostgreSQL Compatible)

-- 1. Police Stations
CREATE TABLE IF NOT EXISTS police_stations (
    id SERIAL PRIMARY KEY,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    district VARCHAR(100),
    municipality VARCHAR(100),
    ward_no VARCHAR(20),
    address_line TEXT,
    photo VARCHAR(500),  -- URL path to photo image
    phone VARCHAR(20),
    email VARCHAR(100),
    jurisdiction_area TEXT,
    incharge_officer_id INT NULL,
    established_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Officers
CREATE TABLE IF NOT EXISTS officers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    rank VARCHAR(50) NOT NULL,
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    station_id INT,
    department TEXT, -- Mapped from department_unit
    contact_number VARCHAR(20), -- Mapped from phone
    email VARCHAR(100),
    gender VARCHAR(20),
    date_of_joining DATE, -- Mapped from join_date
    service_status VARCHAR(50) DEFAULT 'Active',
    -- Permanent Address
    state_province VARCHAR(100), -- Officer's home province
    district VARCHAR(100), -- Officer's home district
    municipality VARCHAR(100), -- Officer's home municipality
    ward_no VARCHAR(20), -- Ward number
    address_line TEXT, -- Street, Tole, House No. etc.
    photo VARCHAR(500), -- URL path to photo image
    signature VARCHAR(500), -- URL path to signature image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES police_stations(id)
);

-- Note: Now update police_stations to add FK for incharge if needed
-- ALTER TABLE police_stations ADD FOREIGN KEY (incharge_officer_id) REFERENCES officers(id);

-- 3. Persons
CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    citizenship VARCHAR(50), -- Mapped from nationality/citizenship_no context
    national_id VARCHAR(50), -- Mapped from citizenship_no
    contact_number VARCHAR(20), -- Mapped from phone
    email VARCHAR(100),
    address TEXT, -- Mapped from address_line
    city VARCHAR(100), -- Mapped from municipality
    state VARCHAR(100), -- Mapped from district/state
    photo VARCHAR(500), -- URL path to photo image
    signature VARCHAR(500), -- URL path to signature image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cases
CREATE TABLE IF NOT EXISTS cases (
    case_id SERIAL PRIMARY KEY,
    fir_no VARCHAR(50) UNIQUE NOT NULL,
    fir_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    station_id INT NOT NULL,
    officer_id INT NOT NULL, -- Registered by
    crime_type VARCHAR(100) NOT NULL,
    crime_section VARCHAR(100),
    incident_date_time TIMESTAMP NOT NULL,
    incident_location TEXT NOT NULL,
    incident_district VARCHAR(100),
    case_priority VARCHAR(20) DEFAULT 'Medium',
    case_status VARCHAR(50) DEFAULT 'Registered',
    summary TEXT, -- incident_description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES police_stations(id),
    FOREIGN KEY (officer_id) REFERENCES officers(id)
);

-- 5. Case Persons (Linking persons to cases)
CREATE TABLE IF NOT EXISTS case_persons (
    id SERIAL PRIMARY KEY,
    case_id INT NOT NULL,
    person_id INT NOT NULL,
    role VARCHAR(50) NOT NULL, -- Complainant / Accused / Suspect / Witness / Victim
    is_primary BOOLEAN DEFAULT FALSE,
    statement TEXT, -- Person's statement/testimony about the incident
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (person_id) REFERENCES persons(id)
);

-- 6. Evidence
CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    case_id INT NOT NULL,
    evidence_code VARCHAR(50),
    evidence_type VARCHAR(50) NOT NULL,
    description TEXT,
    collected_date_time TIMESTAMP,
    collected_by INT, -- Officer ID
    file_path VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Collected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (collected_by) REFERENCES officers(id)
);

-- 7. FIR Track Records
CREATE TABLE IF NOT EXISTS fir_track_records (
    id SERIAL PRIMARY KEY,
    case_id INT NOT NULL,
    track_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    performed_by_user_id INT, -- Refers to Users table usually
    action_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

-- 8. Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- Admin, StationAdmin, Officer, 
    officer_id INT,
    station_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES officers(id),
    FOREIGN KEY (station_id) REFERENCES police_stations(id)
);

-- 9. Supplementary Statements (Additional statements for case persons after initial statement)
CREATE TABLE IF NOT EXISTS supplementary_statements (
    id SERIAL PRIMARY KEY,
    case_person_id INT NOT NULL,
    statement TEXT NOT NULL,
    statement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by_user_id INT,
    remarks TEXT, -- Optional notes about the statement context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_person_id) REFERENCES case_persons(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_cases_fir_no ON cases(fir_no);
CREATE INDEX idx_cases_station ON cases(station_id);
CREATE INDEX idx_officers_station ON officers(station_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_supplementary_case_person ON supplementary_statements(case_person_id);

-- Updated_at Trigger Helper (Optional: If you want auto-update behavior in Postgres)
-- create or replace function update_updated_at_column()
-- returns trigger as $$
-- begin
--    new.updated_at = now();
--    return new;
-- end;
-- $$ language 'plpgsql';

-- Example to apply trigger:
-- create trigger update_users_updated_at before update on users for each row execute procedure update_updated_at_column();
