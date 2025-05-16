-- เพิ่มข้อมูลผู้ใช้ (Users)
INSERT INTO User (UserID, Username, Password, Email, FirstName, LastName, Address, Phone, Role) VALUES
('U0001', 'admin', '$2a$10$qsrvs4AW5gBKJKRoyzfV4eZ3vOQPkPn0N4iZ0Bl4GJZgH8D2vVBm2', 'admin@skyways.com', 'ผู้ดูแล', 'ระบบ', '99 ถนนพหลโยธิน เขตจตุจักร กรุงเทพฯ 10900', '0899998888', 'Admin'),
('U0002', 'somsak', '$2a$10$qsrvs4AW5gBKJKRoyzfV4eZ3vOQPkPn0N4iZ0Bl4GJZgH8D2vVBm2', 'somsak@example.com', 'สมศักดิ์', 'สมบูรณ์', '123 ถนนสุขุมวิท เขตคลองเตย กรุงเทพฯ 10110', '0811112222', 'Customer'),
('U0003', 'somchai', '$2a$10$qsrvs4AW5gBKJKRoyzfV4eZ3vOQPkPn0N4iZ0Bl4GJZgH8D2vVBm2', 'somchai@example.com', 'สมชาย', 'รักเดินทาง', '456 ถนนเพชรบุรี เขตราชเทวี กรุงเทพฯ 10400', '0822223333', 'Customer'),
('U0004', 'wanida', '$2a$10$qsrvs4AW5gBKJKRoyzfV4eZ3vOQPkPn0N4iZ0Bl4GJZgH8D2vVBm2', 'wanida@example.com', 'วนิดา', 'ใจดี', '789 ถนนลาดพร้าว เขตจตุจักร กรุงเทพฯ 10900', '0833334444', 'Customer'),
('U0005', 'pranee', '$2a$10$qsrvs4AW5gBKJKRoyzfV4eZ3vOQPkPn0N4iZ0Bl4GJZgH8D2vVBm2', 'pranee@example.com', 'ปราณี', 'มีสุข', '321 ถนนรามคำแหง เขตบางกะปิ กรุงเทพฯ 10240', '0844445555', 'Customer'),
('U0006', 'staff1', '$2a$10$qsrvs4AW5gBKJKRoyzfV4eZ3vOQPkPn0N4iZ0Bl4GJZgH8D2vVBm2', 'staff1@skyways.com', 'พนักงาน', 'หนึ่ง', '99 ถนนพหลโยธิน เขตจตุจักร กรุงเทพฯ 10900', '0855556666', 'Staff'),
('U0007', 'staff2', '$2a$10$qsrvs4AW5gBKJKRoyzfV4eZ3vOQPkPn0N4iZ0Bl4GJZgH8D2vVBm2', 'staff2@skyways.com', 'พนักงาน', 'สอง', '99 ถนนพหลโยธิน เขตจตุจักร กรุงเทพฯ 10900', '0866667777', 'Staff');

-- เพิ่มข้อมูลเที่ยวบิน (Flights)
INSERT INTO Flight (FlightID, FlightNumber, DepartureCity, ArrivalCity, DepartureTime, ArrivalTime, Aircraft, FlightStatus) VALUES
('F0001', 'SK101', 'BKK', 'CNX', '2025-05-20 08:00:00', '2025-05-20 09:15:00', 'Boeing 737-800', 'Scheduled'),
('F0002', 'SK102', 'CNX', 'BKK', '2025-05-20 10:30:00', '2025-05-20 11:45:00', 'Boeing 737-800', 'Scheduled'),
('F0003', 'SK103', 'BKK', 'CNX', '2025-05-20 12:30:00', '2025-05-20 13:45:00', 'Airbus A320', 'Scheduled'),
('F0004', 'SK104', 'CNX', 'BKK', '2025-05-20 15:00:00', '2025-05-20 16:15:00', 'Airbus A320', 'Scheduled'),
('F0005', 'SK105', 'BKK', 'CNX', '2025-05-20 18:00:00', '2025-05-20 19:15:00', 'Boeing 737-800', 'Scheduled'),
('F0006', 'SK106', 'CNX', 'BKK', '2025-05-20 20:30:00', '2025-05-20 21:45:00', 'Boeing 737-800', 'Scheduled'),
('F0007', 'SK201', 'BKK', 'HKT', '2025-05-20 07:30:00', '2025-05-20 09:00:00', 'Boeing 787-8', 'Scheduled'),
('F0008', 'SK202', 'HKT', 'BKK', '2025-05-20 10:15:00', '2025-05-20 11:45:00', 'Boeing 787-8', 'Scheduled'),
('F0009', 'SK203', 'BKK', 'HKT', '2025-05-20 13:30:00', '2025-05-20 15:00:00', 'Airbus A330', 'Scheduled'),
('F0010', 'SK204', 'HKT', 'BKK', '2025-05-20 16:30:00', '2025-05-20 18:00:00', 'Airbus A330', 'Scheduled'),
('F0011', 'SK205', 'BKK', 'HKT', '2025-05-20 19:00:00', '2025-05-20 20:30:00', 'Boeing 787-8', 'Scheduled'),
('F0012', 'SK206', 'HKT', 'BKK', '2025-05-20 21:45:00', '2025-05-20 23:15:00', 'Boeing 787-8', 'Scheduled'),
('F0013', 'SK301', 'BKK', 'KBV', '2025-05-20 08:15:00', '2025-05-20 09:30:00', 'Airbus A320', 'Scheduled'),
('F0014', 'SK302', 'KBV', 'BKK', '2025-05-20 10:45:00', '2025-05-20 12:00:00', 'Airbus A320', 'Scheduled'),
('F0015', 'SK303', 'BKK', 'KBV', '2025-05-20 14:00:00', '2025-05-20 15:15:00', 'Boeing 737-800', 'Scheduled'),
('F0016', 'SK304', 'KBV', 'BKK', '2025-05-20 16:30:00', '2025-05-20 17:45:00', 'Boeing 737-800', 'Scheduled'),
('F0017', 'SK401', 'BKK', 'CEI', '2025-05-20 07:45:00', '2025-05-20 09:15:00', 'Boeing 737-800', 'Scheduled'),
('F0018', 'SK402', 'CEI', 'BKK', '2025-05-20 10:30:00', '2025-05-20 12:00:00', 'Boeing 737-800', 'Scheduled'),
('F0019', 'SK403', 'BKK', 'CEI', '2025-05-20 15:30:00', '2025-05-20 17:00:00', 'Airbus A320', 'Scheduled'),
('F0020', 'SK404', 'CEI', 'BKK', '2025-05-20 18:15:00', '2025-05-20 19:45:00', 'Airbus A320', 'Scheduled'),
('F0021', 'SK501', 'BKK', 'HDY', '2025-05-20 08:30:00', '2025-05-20 10:00:00', 'Boeing 737-800', 'Scheduled'),
('F0022', 'SK502', 'HDY', 'BKK', '2025-05-20 11:15:00', '2025-05-20 12:45:00', 'Boeing 737-800', 'Scheduled'),
('F0023', 'SK503', 'BKK', 'HDY', '2025-05-20 16:00:00', '2025-05-20 17:30:00', 'Airbus A320', 'Scheduled'),
('F0024', 'SK504', 'HDY', 'BKK', '2025-05-20 18:45:00', '2025-05-20 20:15:00', 'Airbus A320', 'Scheduled'),
('F0025', 'SK601', 'BKK', 'UTH', '2025-05-20 09:00:00', '2025-05-20 10:15:00', 'Airbus A320', 'Scheduled'),
('F0026', 'SK602', 'UTH', 'BKK', '2025-05-20 11:30:00', '2025-05-20 12:45:00', 'Airbus A320', 'Scheduled'),
('F0027', 'SK603', 'BKK', 'UTH', '2025-05-20 17:00:00', '2025-05-20 18:15:00', 'Boeing 737-800', 'Scheduled'),
('F0028', 'SK604', 'UTH', 'BKK', '2025-05-20 19:30:00', '2025-05-20 20:45:00', 'Boeing 737-800', 'Scheduled'),
('F0029', 'SK701', 'BKK', 'KKC', '2025-05-20 10:00:00', '2025-05-20 11:15:00', 'Boeing 737-800', 'Scheduled'),
('F0030', 'SK702', 'KKC', 'BKK', '2025-05-20 12:30:00', '2025-05-20 13:45:00', 'Boeing 737-800', 'Scheduled');

-- เพิ่มข้อมูลที่นั่ง (Seats) สำหรับเที่ยวบิน F0001 (ตัวอย่าง)
-- ชั้นหนึ่ง (First Class) - แถว 1-2
INSERT INTO Seat (SeatID, FlightID, SeatNumber, Class, SeatStatus, Price) VALUES
('S0001', 'F0001', '1A', 'First', 'Available', 5000.00),
('S0002', 'F0001', '1B', 'First', 'Available', 5000.00),
('S0003', 'F0001', '1C', 'First', 'Available', 5000.00),
('S0004', 'F0001', '1D', 'First', 'Available', 5000.00),
('S0005', 'F0001', '2A', 'First', 'Available', 5000.00),
('S0006', 'F0001', '2B', 'First', 'Available', 5000.00),
('S0007', 'F0001', '2C', 'First', 'Available', 5000.00),
('S0008', 'F0001', '2D', 'First', 'Available', 5000.00);

-- ชั้นธุรกิจ (Business Class) - แถว 3-5
INSERT INTO Seat (SeatID, FlightID, SeatNumber, Class, SeatStatus, Price) VALUES
('S0009', 'F0001', '3A', 'Business', 'Available', 3500.00),
('S0010', 'F0001', '3B', 'Business', 'Available', 3500.00),
('S0011', 'F0001', '3C', 'Business', 'Available', 3500.00),
('S0012', 'F0001', '3D', 'Business', 'Available', 3500.00),
('S0013', 'F0001', '4A', 'Business', 'Available', 3500.00),
('S0014', 'F0001', '4B', 'Business', 'Available', 3500.00),
('S0015', 'F0001', '4C', 'Business', 'Available', 3500.00),
('S0016', 'F0001', '4D', 'Business', 'Available', 3500.00),
('S0017', 'F0001', '5A', 'Business', 'Available', 3500.00),
('S0018', 'F0001', '5B', 'Business', 'Available', 3500.00),
('S0019', 'F0001', '5C', 'Business', 'Available', 3500.00),
('S0020', 'F0001', '5D', 'Business', 'Available', 3500.00);

-- ชั้นประหยัดพิเศษ (Premium Economy) - แถว 6-8
INSERT INTO Seat (SeatID, FlightID, SeatNumber, Class, SeatStatus, Price) VALUES
('S0021', 'F0001', '6A', 'Premium Economy', 'Available', 2000.00),
('S0022', 'F0001', '6B', 'Premium Economy', 'Available', 2000.00),
('S0023', 'F0001', '6C', 'Premium Economy', 'Available', 2000.00),
('S0024', 'F0001', '6D', 'Premium Economy', 'Available', 2000.00),
('S0025', 'F0001', '7A', 'Premium Economy', 'Available', 2000.00),
('S0026', 'F0001', '7B', 'Premium Economy', 'Available', 2000.00),
('S0027', 'F0001', '7C', 'Premium Economy', 'Available', 2000.00),
('S0028', 'F0001', '7D', 'Premium Economy', 'Available', 2000.00),
('S0029', 'F0001', '8A', 'Premium Economy', 'Available', 2000.00),
('S0030', 'F0001', '8B', 'Premium Economy', 'Available', 2000.00),
('S0031', 'F0001', '8C', 'Premium Economy', 'Available', 2000.00),
('S0032', 'F0001', '8D', 'Premium Economy', 'Available', 2000.00);

-- ชั้นประหยัด (Economy) - แถว 9-20 (ตัวอย่างบางแถว)
INSERT INTO Seat (SeatID, FlightID, SeatNumber, Class, SeatStatus, Price) VALUES
('S0033', 'F0001', '9A', 'Economy', 'Available', 1290.00),
('S0034', 'F0001', '9B', 'Economy', 'Available', 1290.00),
('S0035', 'F0001', '9C', 'Economy', 'Available', 1290.00),
('S0036', 'F0001', '9D', 'Economy', 'Available', 1290.00),
('S0037', 'F0001', '9E', 'Economy', 'Available', 1290.00),
('S0038', 'F0001', '9F', 'Economy', 'Available', 1290.00);

-- เพิ่มข้อมูลพนักงาน (Employees)
INSERT INTO Employee (EmployeeID, UserID, Position, HireDate) VALUES
('E0001', 'U0006', 'Flight Attendant', '2023-01-15'),
('E0002', 'U0007', 'Flight Attendant', '2023-02-20');

-- เพิ่มข้อมูลพนักงานประจำเที่ยวบิน (Joined)
INSERT INTO Joined (EmployeeID, FlightID, Role) VALUES
('E0001', 'F0001', 'Cabin Crew'),
('E0002', 'F0001', 'Cabin Crew'),
('E0001', 'F0002', 'Cabin Crew'),
('E0002', 'F0002', 'Cabin Crew');

-- เพิ่มข้อมูลการจอง (Bookings)
INSERT INTO Booking (BookingID, UserID, FlightID, BookingDate, BookingStatus, TotalPrice) VALUES
('BK10001', 'U0002', 'F0001', '2025-05-01', 'Confirmed', 1290.00),
('BK10002', 'U0003', 'F0007', '2025-05-02', 'Confirmed', 3580.00),
('BK10003', 'U0004', 'F0013', '2025-05-03', 'Pending', 1290.00),
('BK10004', 'U0005', 'F0021', '2025-05-04', 'Confirmed', 7000.00);

-- เพิ่มข้อมูลส่วนลด (Discounts) ตามรหัสที่แสดงในหน้า Promotions
INSERT INTO Discount (DiscountID, PointRequired, DiscountValue, ExpiryDate) VALUES
('SUMMER2025', 0, 1000.00, '2025-08-31'), -- ส่วนลดโปรโมชั่นฤดูร้อน (สูงสุด 30%)
('SKYPROMO', 0, 500.00, '2025-03-31'),  -- ส่วนลด 20% สำหรับเที่ยวบินไป-กลับ
('PKGDEAL', 0, 750.00, '2025-04-30'),  -- ส่วนลดแพ็คเกจเที่ยวบิน + โรงแรม (30%)
('NEWMEMBER', 0, 300.00, '2025-12-31'), -- ส่วนลดสำหรับสมาชิกใหม่ ฿300
('FAMILY4', 0, 400.00, '2025-05-15'),  -- ส่วนลดแพ็คเกจครอบครัว (15%)
('JAPAN25', 0, 990.00, '2025-06-30'),  -- ส่วนลดโปรเที่ยวญี่ปุ่น
('HOLIDAY25', 0, 300.00, '2025-07-31'); -- ส่วนลดโปรโมชั่นวันหยุด

-- เพิ่มข้อมูลการแลกส่วนลด (Redeems)
INSERT INTO Redeems (DiscountID, BookingID, RedeemDate) VALUES
('DIS10001', 'BK10002', '2025-05-02');