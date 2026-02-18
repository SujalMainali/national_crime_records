-- ============================================================================
-- COMPREHENSIVE SEED DATA - Nepal National Crime Records System
-- ============================================================================
-- Generated: 2026-02-17
-- Coverage: 5 Districts, 4+ Stations per district (20 stations total)
-- Officers: All rank types (IGP, DIG, SSP, SP, DSP, Inspector, Sub-Inspector, ASI, Head Constable, Constable)
-- Cases: 15+ realistic FIR cases with full complainant/accused/witness data
-- Supplementary Statements, FIR Tracking, Users
-- Password for ALL users: admin123
-- BCrypt hash: $2a$10$fS4JVf9aWaUaciOu3M4JROXraquF9S7YebmNn4YvBjRg0BBn0FVX
-- ============================================================================

-- Placeholder SVG for photos (simple colored circle with initial)
-- Using inline SVG base64 for all photo/signature blobs

-- ============================================================================
-- 1. POLICE STATIONS (20 stations across 5 districts)
-- ============================================================================
-- Districts: Kathmandu, Lalitpur, Bhaktapur, Kaski, Morang

INSERT INTO police_stations (station_code, station_name, state_province, district, municipality, ward_no, address_line, phone, email, photo, jurisdiction_area, established_date, is_active) VALUES
-- Kathmandu District (4 stations)
('MPC-KTM-01', 'Metropolitan Police Circle, Teku', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '12', 'Teku Road, Kathmandu-12', '01-4261790', 'teku.mpc@nepalpolice.gov.np',
 NULL,
 'Teku, Kalimati, Kuleshwor, Balkhu areas - Wards 12,13,14', '1985-07-16', TRUE),

('MPC-KTM-02', 'Metropolitan Police Circle, Durbar Marg', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '1', 'Durbar Marg, Kathmandu-1', '01-4220000', 'durbarmarg.mpc@nepalpolice.gov.np',
 NULL,
 'Durbar Marg, New Road, Basantapur, Asan - Wards 1,2,3', '1970-01-01', TRUE),

('MPC-KTM-03', 'Metropolitan Police Circle, Boudha', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '6', 'Boudha Sadak, Kathmandu-6', '01-4480123', 'boudha.mpc@nepalpolice.gov.np',
 NULL,
 'Boudhanath, Jorpati, Chabahil areas - Wards 6,7', '1992-04-14', TRUE),

('MPC-KTM-04', 'Metropolitan Police Circle, Maharajgunj', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '3', 'Maharajgunj, Kathmandu-3', '01-4410567', 'maharajgunj.mpc@nepalpolice.gov.np',
 NULL,
 'Maharajgunj, Lazimpat, Baluwatar - Wards 3,4,5', '1988-11-09', TRUE),

-- Lalitpur District (4 stations)
('MPC-LAL-01', 'Metropolitan Police Circle, Jawalakhel', 'Bagmati', 'Lalitpur', 'Lalitpur Metropolitan City', '4', 'Jawalakhel Chowk, Lalitpur-4', '01-5521207', 'jawalakhel.mpc@nepalpolice.gov.np',
 NULL,
 'Jawalakhel, Ekantakuna, Kupondole - Wards 3,4,5', '1975-03-20', TRUE),

('MPC-LAL-02', 'Metropolitan Police Circle, Pulchowk', 'Bagmati', 'Lalitpur', 'Lalitpur Metropolitan City', '10', 'Pulchowk, Lalitpur-10', '01-5548900', 'pulchowk.mpc@nepalpolice.gov.np',
 NULL,
 'Pulchowk, Mangal Bazar, Patan Durbar - Wards 9,10,11', '1982-06-15', TRUE),

('MPC-LAL-03', 'Metropolitan Police Circle, Satdobato', 'Bagmati', 'Lalitpur', 'Lalitpur Metropolitan City', '14', 'Satdobato, Lalitpur-14', '01-5590234', 'satdobato.mpc@nepalpolice.gov.np',
 NULL,
 'Satdobato, Tikathali, Godawari road - Wards 13,14,15', '1998-02-18', TRUE),

('MPC-LAL-04', 'Metropolitan Police Circle, Imadol', 'Bagmati', 'Lalitpur', 'Lalitpur Metropolitan City', '18', 'Imadol, Lalitpur-18', '01-5592345', 'imadol.mpc@nepalpolice.gov.np',
 NULL,
 'Imadol, Lubhu, Lamatar areas - Wards 17,18,19', '2005-09-01', TRUE),

-- Bhaktapur District (4 stations)
('MPC-BKT-01', 'Metropolitan Police Circle, Suryabinayak', 'Bagmati', 'Bhaktapur', 'Bhaktapur Municipality', '2', 'Suryabinayak, Bhaktapur-2', '01-6614821', 'suryabinayak.mpc@nepalpolice.gov.np',
 NULL,
 'Suryabinayak, Sipadol, Katunje - Wards 1,2,3', '1980-04-14', TRUE),

('MPC-BKT-02', 'Metropolitan Police Circle, Thimi', 'Bagmati', 'Bhaktapur', 'Madhyapur Thimi Municipality', '5', 'Thimi, Bhaktapur', '01-6630123', 'thimi.mpc@nepalpolice.gov.np',
 NULL,
 'Thimi, Lokanthali, Gatthaghar - Wards 4,5,6', '1977-08-21', TRUE),

('MPC-BKT-03', 'Metropolitan Police Circle, Nagarkot', 'Bagmati', 'Bhaktapur', 'Changunarayan Municipality', '8', 'Nagarkot, Bhaktapur', '01-6680456', 'nagarkot.mpc@nepalpolice.gov.np',
 NULL,
 'Nagarkot, Changunarayan temple area - Wards 7,8,9', '2001-12-25', TRUE),

('MPC-BKT-04', 'Metropolitan Police Circle, Duwakot', 'Bagmati', 'Bhaktapur', 'Bhaktapur Municipality', '11', 'Duwakot, Bhaktapur-11', '01-6615789', 'duwakot.mpc@nepalpolice.gov.np',
 NULL,
 'Duwakot, Tathali, Bhimsensthan - Wards 10,11,12', '2010-01-15', TRUE),

-- Kaski District (4 stations)
('DPC-KSK-01', 'District Police Office, Pokhara Lakeside', 'Gandaki', 'Kaski', 'Pokhara Metropolitan City', '6', 'Lakeside Marg, Pokhara-6', '061-462222', 'lakeside.dpo@nepalpolice.gov.np',
 NULL,
 'Lakeside, Damside, Baidam tourist area - Wards 5,6,7', '1972-05-28', TRUE),

('DPC-KSK-02', 'District Police Circle, Prithvi Chowk', 'Gandaki', 'Kaski', 'Pokhara Metropolitan City', '9', 'Prithvi Chowk, Pokhara-9', '061-520111', 'prithvichowk.dpc@nepalpolice.gov.np',
 NULL,
 'Prithvi Chowk, Chipledhunga, Naya Bazar - Wards 8,9,10', '1968-11-03', TRUE),

('DPC-KSK-03', 'District Police Circle, Sarangkot', 'Gandaki', 'Kaski', 'Pokhara Metropolitan City', '18', 'Sarangkot, Pokhara-18', '061-690345', 'sarangkot.dpc@nepalpolice.gov.np',
 NULL,
 'Sarangkot, Kaskikot, Dhampus trail area - Wards 17,18,19', '2003-07-16', TRUE),

('DPC-KSK-04', 'District Police Circle, Lekhnath', 'Gandaki', 'Kaski', 'Pokhara Metropolitan City', '25', 'Lekhnath, Pokhara-25', '061-560789', 'lekhnath.dpc@nepalpolice.gov.np',
 NULL,
 'Lekhnath, Begnas, Rupa Tal area - Wards 24,25,26', '1995-02-19', TRUE),

-- Morang District (4 stations)
('DPC-MRG-01', 'District Police Office, Biratnagar', 'Province 1', 'Morang', 'Biratnagar Metropolitan City', '5', 'Main Road, Biratnagar-5', '021-525222', 'biratnagar.dpo@nepalpolice.gov.np',
 NULL,
 'Biratnagar central, Traffic Chowk, Bargachhi - Wards 4,5,6', '1960-02-18', TRUE),

('DPC-MRG-02', 'District Police Circle, Urlabari', 'Province 1', 'Morang', 'Urlabari Municipality', '3', 'Urlabari Bazar, Morang', '021-540111', 'urlabari.dpc@nepalpolice.gov.np',
 NULL,
 'Urlabari bazar, Letang road, Pathari - Wards 1,2,3', '1990-10-05', TRUE),

('DPC-MRG-03', 'District Police Circle, Sundarharaicha', 'Province 1', 'Morang', 'Sundarharaicha Municipality', '7', 'Sundarharaicha, Morang', '021-555678', 'sundarharaicha.dpc@nepalpolice.gov.np',
 NULL,
 'Sundarharaicha, Katahari, Haraicha - Wards 6,7,8', '2002-04-14', TRUE),

('DPC-MRG-04', 'District Police Circle, Rangeli', 'Province 1', 'Morang', 'Rangeli Municipality', '2', 'Rangeli Bazar, Morang', '021-580234', 'rangeli.dpc@nepalpolice.gov.np',
 NULL,
 'Rangeli, Kerabari, Ratuwamai border area - Wards 1,2,3', '2008-06-30', TRUE);
