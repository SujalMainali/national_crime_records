-- ============================================================================
-- 3. USERS (Login accounts for officers)
-- Password for ALL: admin123
-- BCrypt: $2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e
-- ============================================================================

INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
('admin.system',       '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Admin',        1,  1, TRUE),
('admin.durbarmarg',   '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin',  6,  2, TRUE),
('admin.boudha',       '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin',  9,  3, TRUE),
('admin.maharajgunj',  '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin', 11,  4, TRUE),
('admin.jawalakhel',   '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin', 14,  5, TRUE),
('admin.pulchowk',     '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin', 16,  6, TRUE),
('admin.suryabinayak', '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin', 19,  9, TRUE),
('admin.lakeside',     '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin', 21, 13, TRUE),
('admin.biratnagar',   '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'StationAdmin', 24, 17, TRUE),
-- Officers
('officer.sita',       '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer',  2,  1, TRUE),
('officer.mohan',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer',  3,  1, TRUE),
('officer.binod',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer',  4,  1, TRUE),
('officer.deepa',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer',  5,  1, TRUE),
('officer.gita',       '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer',  7,  2, TRUE),
('officer.rajesh',     '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer',  8,  2, TRUE),
('officer.pramila',    '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 10,  3, TRUE),
('officer.mina',       '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 12,  4, TRUE),
('officer.bishnu',     '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 13,  5, TRUE),
('officer.sunita',     '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 15,  5, TRUE),
('officer.anita',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 17,  6, TRUE),
('officer.laxmi',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 20,  9, TRUE),
('officer.kabita',     '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 22, 13, TRUE),
('officer.dilli',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 23, 13, TRUE),
('officer.sarita',     '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 25, 17, TRUE),
('officer.manoj',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Officer', 26, 17, TRUE),
-- DataEntry users
('data.teku',          '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'DataEntry', NULL, 1, TRUE),
('data.lakeside',      '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'DataEntry', NULL, 13, TRUE),
('data.biratnagar',    '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'DataEntry', NULL, 17, TRUE);


-- ============================================================================
-- 4. PERSONS (Complainants, Accused, Victims, Witnesses)
-- ============================================================================

INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state,
 photo, signature) VALUES
-- Person 1: Complainant - robbery case
('Ramesh', NULL, 'Maharjan', '1985-03-15', 'Male', 'Nepali', '011-85-12345', '9841111001', 'ramesh.maharjan@gmail.com', 'Teku-12, near Bagmati bridge', 'Kathmandu', 'Bagmati',
 NULL,
 NULL),

-- Person 2: Accused - robbery
('Santosh', NULL, 'Dhungana', '1992-08-22', 'Male', 'Nepali', '026-92-98765', '9841111002', NULL, 'Kalimati-14, Kathmandu', 'Kathmandu', 'Bagmati',
 NULL,
 NULL),

-- Person 3: Witness - robbery
('Kamala', 'Devi', 'Thapa', '1978-12-05', 'Female', 'Nepali', '011-78-55667', '9841111003', 'kamala.thapa78@gmail.com', 'Teku-12, Kathmandu', 'Kathmandu', 'Bagmati',
 NULL,
 NULL),

-- Person 4: Complainant/Victim - domestic violence
('Saraswati', NULL, 'Pandey', '1990-06-10', 'Female', 'Nepali', '027-90-33221', '9841111004', NULL, 'Jawalakhel-4, Lalitpur', 'Lalitpur', 'Bagmati',
 NULL,
 NULL),

-- Person 5: Accused - domestic violence (husband)
('Bikash', NULL, 'Pandey', '1988-01-25', 'Male', 'Nepali', '027-88-33220', '9841111005', NULL, 'Jawalakhel-4, Lalitpur', 'Lalitpur', 'Bagmati',
 NULL,
 NULL),

-- Person 6: Complainant - vehicle theft (Pokhara)
('Deepak', NULL, 'Gurung', '1982-11-18', 'Male', 'Nepali', '040-82-77889', '9846111006', 'deepak.grg@gmail.com', 'Lakeside-6, Pokhara', 'Pokhara', 'Gandaki',
 NULL,
 NULL),

-- Person 7: Suspect - vehicle theft
('Raju', NULL, 'BK', '1995-04-02', 'Male', 'Nepali', '040-95-44556', '9846111007', NULL, 'Chipledhunga-9, Pokhara', 'Pokhara', 'Gandaki',
 NULL,
 NULL),

-- Person 8: Complainant - fraud (Biratnagar)
('Suman', 'Bahadur', 'Rai', '1975-09-30', 'Male', 'Nepali', '003-75-11223', '9852111008', 'suman.rai75@yahoo.com', 'Traffic Chowk-5, Biratnagar', 'Biratnagar', 'Province 1',
 NULL,
 NULL),

-- Person 9: Accused - fraud
('Prakash', NULL, 'Shah', '1987-07-14', 'Male', 'Nepali', '003-87-66778', '9852111009', NULL, 'Bargachhi-6, Biratnagar', 'Biratnagar', 'Province 1',
 NULL,
 NULL),

-- Person 10: Witness - assault Bhaktapur
('Nirmala', NULL, 'Duwal', '1993-02-28', 'Female', 'Nepali', '026-93-88990', '9841111010', 'nirmala.duwal@gmail.com', 'Suryabinayak-2, Bhaktapur', 'Bhaktapur', 'Bagmati',
 NULL,
 NULL),

-- Person 11: Victim/Complainant - assault
('Bibek', NULL, 'Shrestha', '1996-05-12', 'Male', 'Nepali', '026-96-11234', '9841111011', NULL, 'Katunje-3, Bhaktapur', 'Bhaktapur', 'Bagmati',
 NULL,
 NULL),

-- Person 12: Accused - assault
('Anil', 'Kumar', 'Khadka', '1991-10-08', 'Male', 'Nepali', '026-91-55667', '9841111012', NULL, 'Sipadol-2, Bhaktapur', 'Bhaktapur', 'Bagmati',
 NULL,
 NULL),

-- Person 13: Complainant - burglary (Durbar Marg)
('Shrijan', NULL, 'Bajracharya', '1980-04-20', 'Male', 'Nepali', '011-80-22334', '9841111013', 'shrijan.bajra@hotmail.com', 'New Road-2, Kathmandu', 'Kathmandu', 'Bagmati',
 NULL,
 NULL),

-- Person 14: Accused - burglary
('Dinesh', NULL, 'Thapa', '1994-12-17', 'Male', 'Nepali', '035-94-99001', '9841111014', NULL, 'Asan-1, Kathmandu', 'Kathmandu', 'Bagmati',
 NULL,
 NULL),

-- Person 15: Accused 2 - burglary
('Sujan', NULL, 'Malla', '1997-03-09', 'Male', 'Nepali', '011-97-44556', '9841111015', NULL, 'Basantapur-1, Kathmandu', 'Kathmandu', 'Bagmati',
 NULL,
 NULL);
