-- ============================================================================
-- 2. OFFICERS - All rank types across 20 stations
-- ============================================================================
-- Ranks: IGP, DIG, SSP, SP, DSP, Inspector, Sub-Inspector, ASI, Head Constable, Constable
-- SVG photo placeholder: circle with initial letter
-- SVG signature placeholder: cursive name

-- Helper: Photo SVG = circle with initial, Signature SVG = cursive text
-- Photo base64 pattern: data:image/svg+xml;base64,...
-- Using a compact SVG for all

INSERT INTO officers (first_name, middle_name, last_name, rank, badge_number, station_id, department, contact_number, email, gender, date_of_joining, service_status, state_province, district, municipality, ward_no, address_line, photo, signature) VALUES

-- ========== KATHMANDU - Station 1 (Teku) ==========
('Ram', 'Bahadur', 'Thapa', 'SSP', 'NP-1001', 1, 'Crime Division', '9851000001', 'ram.thapa@nepalpolice.gov.np', 'Male', '2005-04-14', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '15', 'Kalanki, Kathmandu',
 NULL,
 NULL),

('Sita', 'Kumari', 'Sharma', 'Inspector', 'NP-1002', 1, 'Women Cell', '9851000002', 'sita.sharma@nepalpolice.gov.np', 'Female', '2010-08-21', 'Active', 'Bagmati', 'Lalitpur', 'Lalitpur Metro', '8', 'Kupondole, Lalitpur',
 NULL,
 NULL),

('Mohan', 'Prasad', 'Adhikari', 'Sub-Inspector', 'NP-1003', 1, 'Traffic Division', '9851000003', 'mohan.adhikari@nepalpolice.gov.np', 'Male', '2015-03-10', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '29', 'Naikap, Kathmandu',
 NULL,
 NULL),

('Binod', NULL, 'KC', 'ASI', 'NP-1004', 1, 'Patrol Unit', '9851000004', 'binod.kc@nepalpolice.gov.np', 'Male', '2018-01-15', 'Active', 'Gandaki', 'Kaski', 'Pokhara Metro', '11', 'Chipledhunga, Pokhara',
 NULL,
 NULL),

('Deepa', NULL, 'Basnet', 'Head Constable', 'NP-1005', 1, 'Crime Division', '9851000005', 'deepa.basnet@nepalpolice.gov.np', 'Female', '2019-06-20', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '10', 'Baneshwor, Kathmandu',
 NULL,
 NULL),

-- ========== KATHMANDU - Station 2 (Durbar Marg) ==========
('Hari', 'Prasad', 'Gurung', 'DSP', 'NP-2001', 2, 'Operations', '9851000006', 'hari.gurung@nepalpolice.gov.np', 'Male', '2008-01-15', 'Active', 'Gandaki', 'Lamjung', 'Besisahar Mun', '3', 'Besisahar, Lamjung',
 NULL,
 NULL),

('Gita', NULL, 'Karki', 'Inspector', 'NP-2002', 2, 'Investigation', '9851000007', 'gita.karki@nepalpolice.gov.np', 'Female', '2012-07-20', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '4', 'Lazimpat, Kathmandu',
 NULL,
 NULL),

('Rajesh', 'Kumar', 'Poudel', 'Constable', 'NP-2003', 2, 'Patrol Unit', '9851000008', 'rajesh.poudel@nepalpolice.gov.np', 'Male', '2020-09-05', 'Active', 'Lumbini', 'Rupandehi', 'Butwal Sub-Metro', '6', 'Butwal, Rupandehi',
 NULL,
 NULL),

-- ========== KATHMANDU - Station 3 (Boudha) ==========
('Suresh', NULL, 'Lama', 'SP', 'NP-3001', 3, 'Administration', '9851000009', 'suresh.lama@nepalpolice.gov.np', 'Male', '2003-11-01', 'Active', 'Bagmati', 'Sindhupalchok', 'Melamchi Mun', '1', 'Melamchi, Sindhupalchok',
 NULL,
 NULL),

('Pramila', 'Devi', 'Tamang', 'Sub-Inspector', 'NP-3002', 3, 'Women Cell', '9851000010', 'pramila.tamang@nepalpolice.gov.np', 'Female', '2014-05-12', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '7', 'Chabahil, Kathmandu',
 NULL,
 NULL),

-- ========== KATHMANDU - Station 4 (Maharajgunj) ==========
('Bikram', 'Singh', 'Rana', 'DSP', 'NP-4001', 4, 'Crime Branch', '9851000011', 'bikram.rana@nepalpolice.gov.np', 'Male', '2007-02-14', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '3', 'Maharajgunj, Kathmandu',
 NULL,
 NULL),

('Mina', NULL, 'Shrestha', 'ASI', 'NP-4002', 4, 'Investigation', '9851000012', 'mina.shrestha@nepalpolice.gov.np', 'Female', '2017-08-30', 'Active', 'Bagmati', 'Bhaktapur', 'Bhaktapur Mun', '5', 'Sallaghari, Bhaktapur',
 NULL,
 NULL),

-- ========== LALITPUR - Station 5 (Jawalakhel) ==========
('Bishnu', 'Maya', 'Rai', 'Inspector', 'NP-5001', 5, 'Investigation', '9851000013', 'bishnu.rai@nepalpolice.gov.np', 'Female', '2012-11-05', 'Active', 'Province 1', 'Dhankuta', 'Dhankuta Mun', '2', 'Dhankuta Bazar',
 NULL,
 NULL),

('Prakash', NULL, 'Tamang', 'DSP', 'NP-5002', 5, 'Crime Branch', '9851000014', 'prakash.tamang@nepalpolice.gov.np', 'Male', '2009-05-18', 'Active', 'Bagmati', 'Nuwakot', 'Bidur Mun', '4', 'Bidur, Nuwakot',
 NULL,
 NULL),

('Sunita', 'Devi', 'Joshi', 'Sub-Inspector', 'NP-5003', 5, 'Women Cell', '9851000015', 'sunita.joshi@nepalpolice.gov.np', 'Female', '2014-02-12', 'Active', 'Sudurpashchim', 'Doti', 'Dipayal Silgadhi', '5', 'Silgadhi, Doti',
 NULL,
 NULL),

-- ========== LALITPUR - Station 6 (Pulchowk) ==========
('Dipak', 'Raj', 'Bhandari', 'Inspector', 'NP-6001', 6, 'Traffic Control', '9851000016', 'dipak.bhandari@nepalpolice.gov.np', 'Male', '2011-06-25', 'Active', 'Bagmati', 'Lalitpur', 'Lalitpur Metro', '12', 'Pulchowk, Lalitpur',
 NULL,
 NULL),

('Anita', NULL, 'Magar', 'Constable', 'NP-6002', 6, 'Administration', '9851000017', 'anita.magar@nepalpolice.gov.np', 'Female', '2021-01-08', 'Active', 'Gandaki', 'Syangja', 'Waling Mun', '3', 'Waling, Syangja',
 NULL,
 NULL),

-- ========== BHAKTAPUR - Station 9 (Suryabinayak) ==========
('Krishna', NULL, 'Shrestha', 'DSP', 'NP-9001', 9, 'Administration', '9851000018', 'krishna.shrestha@nepalpolice.gov.np', 'Male', '2007-03-30', 'Active', 'Bagmati', 'Bhaktapur', 'Bhaktapur Mun', '9', 'Dudhpati, Bhaktapur',
 NULL,
 NULL),

('Laxmi', 'Devi', 'Maharjan', 'Inspector', 'NP-9002', 9, 'Investigation', '9851000019', 'laxmi.maharjan@nepalpolice.gov.np', 'Female', '2013-04-22', 'Active', 'Bagmati', 'Bhaktapur', 'Madhyapur Thimi', '3', 'Bode, Bhaktapur',
 NULL,
 NULL),

-- ========== KASKI - Station 13 (Lakeside) ==========
('Narayan', 'Prasad', 'Acharya', 'SSP', 'NP-13001', 13, 'Crime Division', '9861000001', 'narayan.acharya@nepalpolice.gov.np', 'Male', '2002-07-16', 'Active', 'Gandaki', 'Kaski', 'Pokhara Metro', '8', 'Naya Bazar, Pokhara',
 NULL,
 NULL),

('Kabita', NULL, 'Pun', 'Inspector', 'NP-13002', 13, 'Women Cell', '9861000002', 'kabita.pun@nepalpolice.gov.np', 'Female', '2011-09-14', 'Active', 'Gandaki', 'Myagdi', 'Beni Mun', '2', 'Beni, Myagdi',
 NULL,
 NULL),

('Dilli', 'Ram', 'Neupane', 'Head Constable', 'NP-13003', 13, 'Patrol Unit', '9861000003', 'dilli.neupane@nepalpolice.gov.np', 'Male', '2016-12-01', 'Active', 'Gandaki', 'Tanahun', 'Damauli Mun', '6', 'Damauli, Tanahun',
 NULL,
 NULL),

-- ========== MORANG - Station 17 (Biratnagar) ==========
('Gopal', 'Bahadur', 'Limbu', 'SP', 'NP-17001', 17, 'Administration', '9852000001', 'gopal.limbu@nepalpolice.gov.np', 'Male', '2004-09-21', 'Active', 'Province 1', 'Morang', 'Biratnagar Metro', '10', 'Panbari, Biratnagar',
 NULL,
 NULL),

('Sarita', NULL, 'Chaudhary', 'Inspector', 'NP-17002', 17, 'Investigation', '9852000002', 'sarita.chaudhary@nepalpolice.gov.np', 'Female', '2013-03-15', 'Active', 'Province 1', 'Sunsari', 'Dharan Sub-Metro', '4', 'Dharan, Sunsari',
 NULL,
 NULL),

('Manoj', 'Kumar', 'Yadav', 'Sub-Inspector', 'NP-17003', 17, 'Cyber Crime', '9852000003', 'manoj.yadav@nepalpolice.gov.np', 'Male', '2015-07-10', 'Active', 'Province 2', 'Saptari', 'Rajbiraj Mun', '5', 'Rajbiraj, Saptari',
 NULL,
 NULL);
