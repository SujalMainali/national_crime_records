-- ============================================================================
-- TEKU POLICE STATION SPECIFIC SEED DATA
-- ============================================================================
-- Purpose: Seed 2 realistic cases with 5 persons involved each for Teku Station
-- Includes: Persons, Cases, Case Persons, FIR Tracking (No Evidence)
-- ============================================================================

-- ============================================================================
-- TEKU POLICE STATION SPECIFIC SEED DATA
-- ============================================================================
-- Purpose: Seed 2 realistic cases with 5 persons involved each for Teku Station
-- Includes: Persons, Cases, Case Persons, FIR Tracking (No Evidence)
-- ============================================================================

DO $$
DECLARE
    v_station_id INT;
    v_officer_sita_id INT;
    v_officer_mohan_id INT;
    v_user_sita_id INT;
    v_user_mohan_id INT;
    
    -- IDs for created entities
    v_case1_id INT;
    v_case2_id INT;
    v_p1_id INT; v_p2_id INT; v_p3_id INT; v_p4_id INT; v_p5_id INT;
    v_p6_id INT; v_p7_id INT; v_p8_id INT; v_p9_id INT; v_p10_id INT;
    v_cp_id INT;

BEGIN
    -- 1. GET REFERENCES (Assuming existing seed data)
    SELECT id INTO v_station_id FROM police_stations WHERE station_code = 'MPC-KTM-01';
    
    -- Fallback if station doesn't exist (Safety check)
    IF v_station_id IS NULL THEN
        RAISE EXCEPTION 'Teku Police Station (MPC-KTM-01) not found. Please run seed_complete.sql first.';
    END IF;

    -- ========================================================================
    -- 1.1 ENSURE OFFICERS EXIST (Self-Healing)
    -- ========================================================================
    
    -- Check/Create Sita
    SELECT id INTO v_officer_sita_id FROM officers WHERE badge_number = 'NP-1002';
    IF v_officer_sita_id IS NULL THEN
        INSERT INTO officers (first_name, middle_name, last_name, rank, badge_number, station_id, department, contact_number, email, gender, date_of_joining, service_status, state_province, district, municipality, ward_no, address_line, photo, signature)
        VALUES ('Sita', 'Kumari', 'Sharma', 'Inspector', 'NP-1002', v_station_id, 'Women Cell', '9851000002', 'sita.sharma@nepalpolice.gov.np', 'Female', '2010-08-21', 'Active', 'Bagmati', 'Lalitpur', 'Lalitpur Metro', '8', 'Kupondole, Lalitpur',
        NULL,
        NULL)
        RETURNING id INTO v_officer_sita_id;
    END IF;

    -- Check/Create Mohan
    SELECT id INTO v_officer_mohan_id FROM officers WHERE badge_number = 'NP-1003';
    IF v_officer_mohan_id IS NULL THEN
        INSERT INTO officers (first_name, middle_name, last_name, rank, badge_number, station_id, department, contact_number, email, gender, date_of_joining, service_status, state_province, district, municipality, ward_no, address_line, photo, signature)
        VALUES ('Mohan', 'Prasad', 'Adhikari', 'Sub-Inspector', 'NP-1003', v_station_id, 'Traffic Division', '9851000003', 'mohan.adhikari@nepalpolice.gov.np', 'Male', '2015-03-10', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '29', 'Naikap, Kathmandu',
        NULL,
        NULL)
        RETURNING id INTO v_officer_mohan_id;
    END IF;

    -- ========================================================================
    -- 1.2 ENSURE USERS EXIST
    -- ========================================================================

    -- Check/Create User Sita
    SELECT id INTO v_user_sita_id FROM users WHERE username = 'officer.sita';
    IF v_user_sita_id IS NULL THEN
        INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active)
        VALUES ('officer.sita', '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', v_officer_sita_id, v_station_id, TRUE)
        RETURNING id INTO v_user_sita_id;
    END IF;

    -- Check/Create User Mohan
    SELECT id INTO v_user_mohan_id FROM users WHERE username = 'officer.mohan';
    IF v_user_mohan_id IS NULL THEN
        INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active)
        VALUES ('officer.mohan', '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', v_officer_mohan_id, v_station_id, TRUE)
        RETURNING id INTO v_user_mohan_id;
    END IF;

    -- Double check
    IF v_officer_sita_id IS NULL OR v_officer_mohan_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create or find Teku officers.';
    END IF;

    -- ========================================================================
    -- CASE 1: BANKING OFFENSE (Cheque Bounce) - High Priority
    -- ========================================================================
    
    -- 2. CREATE PERSONS FOR CASE 1
    -- Role Distribution: 1 Complainant, 1 Accused, 1 Witness, 1 Victim (Company Rep), 1 Suspect (Accomplice)
    
    -- P1: Complainant (The Victim's Lawyer/Rep)
    INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo)
    VALUES ('Rajendra', 'Prasad', 'Ghimire', '1980-05-15', 'Male', 'Nepali', '27-01-71-00123', '9851023456', 'rajendra.g@lawfirm.com.np', 'Baneshwor-10, Kathmandu', 'Kathmandu', 'Bagmati', 
    NULL)
    RETURNING id INTO v_p1_id;

    -- P2: Accused (The person who issued the bounced cheque)
    INSERT INTO persons (first_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, address, city, state, photo)
    VALUES ('Suman', 'Karki', '1988-11-22', 'Male', 'Nepali', '27-01-75-09876', '9841987654', 'Kuleshwor-14, Kathmandu', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p2_id;

    -- P3: Witness (Bank Manager)
    INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, contact_number, email, address, city, state, photo)
    VALUES ('Kiran', 'Kumar', 'Shrestha', '1975-03-10', 'Male', 'Nepali', '9841112233', 'kiran.branch@nabil.com', 'Lazimpat-2, Kathmandu', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p3_id;

    -- P4: Victim (The Business Owner owed money)
    INSERT INTO persons (first_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, address, city, state, photo)
    VALUES ('Anita', 'Bajracharya', '1992-07-08', 'Female', 'Nepali', '27-01-73-11223', '9803334455', 'Asan-27, Kathmandu', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p4_id;

    -- P5: Suspect (Accountant who allegedly signed falsely)
    INSERT INTO persons (first_name, last_name, date_of_birth, gender, citizenship, contact_number, address, city, state, photo)
    VALUES ('Mahesh', 'Thapa', '1995-01-30', 'Male', 'Nepali', '9818556677', 'Kalanki-14, Kathmandu', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p5_id;

    -- 3. CREATE CASE 1
    INSERT INTO cases (fir_no, station_id, officer_id, crime_type, crime_section, incident_date_time, incident_location, incident_district, case_priority, case_status, summary)
    VALUES (
        'FIR-3160-2080', 
        v_station_id, 
        v_officer_sita_id, 
        'Banking Offense', 
        'Banking Offense and Punishment Act, 2064', 
        CURRENT_TIMESTAMP - INTERVAL '15 days', 
        'Nabil Bank, Teendhara Branch', 
        'Kathmandu', 
        'High', 
        'Under Investigation',
        'Complaint filed regarding dishonored cheque of NPR 25,00,000 due to insufficient funds. The accused has been uncontactable since the bounce date.'
    )
    RETURNING case_id INTO v_case1_id;

    -- Link Persons to Case 1
    INSERT INTO case_persons (case_id, person_id, role, is_primary, statement) VALUES
    (v_case1_id, v_p1_id, 'Complainant', TRUE, 'Submitted legal notice copies and original bounced cheque.'),
    (v_case1_id, v_p2_id, 'Accused', TRUE, NULL),
    (v_case1_id, v_p3_id, 'Witness', FALSE, 'Verified the cheque return memo and account details.'),
    (v_case1_id, v_p4_id, 'Victim', FALSE, 'Original payee of the cheque.'),
    (v_case1_id, v_p5_id, 'Suspect', FALSE, 'Suspected of falsifying company seal on the cheque.');

    -- FIR Tracking for Case 1
    INSERT INTO fir_track_records (case_id, old_status, new_status, action_type, action_description, performed_by_user_id, track_date_time) VALUES
    (v_case1_id, NULL, 'Registered', 'Registration', 'FIR Registered electronically.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '14 days'),
    (v_case1_id, 'Registered', 'Under Investigation', 'Status Change', 'Investigation Officer assigned. Notices issued to bank.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '12 days'),
    (v_case1_id, 'Under Investigation', 'Under Investigation', 'Statement Recorded', 'Bank Manager statement recorded regarding account status.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (v_case1_id, 'Under Investigation', 'Under Investigation', 'Arrest Warrant Issued', 'Warrant issued for main accused Suman Karki by Kathmandu District Court.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '2 days');


    -- ========================================================================
    -- CASE 2: CYBER CRIME (Online Impersonation)
    -- ========================================================================

    -- 2. CREATE PERSONS FOR CASE 2
    -- Role Distribution: 1 Complainant, 1 Accused, 2 Witnesses, 1 Suspect
    
    -- P6: Complainant (The Victim)
    INSERT INTO persons (first_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo)
    VALUES ('Pooja', 'Lama', '1998-04-12', 'Female', 'Nepali', '27-01-76-23456', '9849123456', 'pooja.style@gmail.com', 'Balkhu-14, Kathmandu', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p6_id;

    -- P7: Accused (The Stalker)
    INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, address, city, state, photo)
    VALUES ('Rabin', 'Raj', 'Bhandari', '1990-12-05', 'Male', 'Nepali', '27-01-70-55667', '9860112233', 'Kalimati-13, Kathmandu', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p7_id;

    -- P8: Witness (Friend of Victim)
    INSERT INTO persons (first_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, address, city, state, photo)
    VALUES ('Sabin', 'Shrestha', '1997-08-15', 'Male', 'Nepali', '27-01-77-99881', '9841009988', 'Sanepa-2, Lalitpur', 'Lalitpur', 'Bagmati',
    NULL)
    RETURNING id INTO v_p8_id;

    -- P9: Witness (Cyber Cafe Owner)
    INSERT INTO persons (first_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, address, city, state, photo)
    VALUES ('Bikram', 'Ale', '1985-02-20', 'Male', 'Nepali', '33-02-74-00991', '9813556677', 'Kuleshwor-14, Kathmandu', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p9_id;

    -- P10: Suspect (Associated Phone Number Owner)
    INSERT INTO persons (first_name, middle_name, last_name, gender, citizenship, contact_number, address, city, state, photo)
    VALUES ('Unknown', 'Sim', 'Owner', 'Other', 'Nepali', '9818000000', 'Unknown', 'Kathmandu', 'Bagmati',
    NULL)
    RETURNING id INTO v_p10_id;

    -- 3. CREATE CASE 2
    INSERT INTO cases (fir_no, station_id, officer_id, crime_type, crime_section, incident_date_time, incident_location, incident_district, case_priority, case_status, summary)
    VALUES (
        'FIR-4589-2080', 
        v_station_id, 
        v_officer_sita_id, 
        'Cyber Crime', 
        'Electronic Transactions Act, 2063', 
        CURRENT_TIMESTAMP - INTERVAL '7 days', 
        'Social Media (Facebook)', 
        'Kathmandu', 
        'Medium', 
        'Registered',
        'Reporting of fake profile creation and harassment via Facebook Messenger. The perpetrator used victim''s photos without consent.'
    )
    RETURNING case_id INTO v_case2_id;

    -- Link Persons to Case 2
    INSERT INTO case_persons (case_id, person_id, role, is_primary, statement) VALUES
    (v_case2_id, v_p6_id, 'Complainant', TRUE, 'Provided screenshots of the fake profile and messages.'),
    (v_case2_id, v_p7_id, 'Accused', TRUE, NULL),
    (v_case2_id, v_p8_id, 'Witness', FALSE, 'Confirmed seeing the fake posts.'),
    (v_case2_id, v_p9_id, 'Witness', FALSE, 'Provided IP logs from cyber cafe where suspect was seen.'),
    (v_case2_id, v_p10_id, 'Suspect', FALSE, 'Sim card registered in this name used for account creation.');

    -- FIR Tracking for Case 2
    INSERT INTO fir_track_records (case_id, old_status, new_status, action_type, action_description, performed_by_user_id, track_date_time) VALUES
    (v_case2_id, NULL, 'Registered', 'Registration', 'FIR filed by victim.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (v_case2_id, 'Registered', 'Under Investigation', 'Status Change', 'Forwarded to CIB for technical analysis.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (v_case2_id, 'Under Investigation', 'Under Investigation', 'Evidence Collection', 'Screenshots and URL logs secured.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '4 days'),
    (v_case2_id, 'Under Investigation', 'Under Investigation', 'Person Added', 'Suspect Rabin Raj Bhandari identified via IP trace.', v_user_sita_id, CURRENT_TIMESTAMP - INTERVAL '1 day');

    -- ========================================================================
    -- SUPPLEMENTARY STATEMENTS
    -- ========================================================================
    
    -- For Case 1
    INSERT INTO supplementary_statements (case_person_id, statement, recorded_by_user_id) 
    SELECT id, 'The bank has confirmed that the signature does not match the specimen.', v_user_mohan_id
    FROM case_persons WHERE case_id = v_case1_id AND role = 'Witness' LIMIT 1;

    -- For Case 2
    INSERT INTO supplementary_statements (case_person_id, statement, recorded_by_user_id)
    SELECT id, 'I recall the suspect using computer number 5 around 2:00 PM.', v_user_sita_id
    FROM case_persons WHERE case_id = v_case2_id AND role = 'Witness' AND person_id = v_p9_id LIMIT 1;

END $$;
