USE AirlineBooking;

-- สร้างตาราง User (ข้อมูลผู้ใช้)
CREATE TABLE User (
    UserID VARCHAR(20) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Address TEXT,
    Phone VARCHAR(20),
    Role VARCHAR(20) DEFAULT 'Customer' CHECK (Role IN ('Admin', 'Customer', 'Staff'))
);

-- สร้างตาราง Flight (ข้อมูลเที่ยวบิน)
CREATE TABLE Flight (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    FlightID VARCHAR(10) UNIQUE NOT NULL,
    FlightNumber VARCHAR(20) NOT NULL,
    DepartureCity VARCHAR(50),
    ArrivalCity VARCHAR(50),
    DepartureTime DATETIME,
    ArrivalTime DATETIME,
    Aircraft VARCHAR(50),
    FlightStatus VARCHAR(20)
);

-- สร้างตาราง Booking (ข้อมูลการจอง)
CREATE TABLE Booking (
    BookingID VARCHAR(10) PRIMARY KEY,
    UserID VARCHAR(20) NOT NULL,
    FlightID VARCHAR(10) NOT NULL,
    BookingDate DATE NOT NULL,
    BookingStatus VARCHAR(20) DEFAULT 'Pending' CHECK (BookingStatus IN ('Pending', 'Confirmed', 'Cancelled')),
    TotalPrice DECIMAL(10,2) NOT NULL,
    ContactEmail VARCHAR(100),
    ContactPhone VARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (FlightID) REFERENCES Flight(FlightID)
);

-- สร้างตาราง Seat (ข้อมูลที่นั่ง)
CREATE TABLE Seat (
    SeatID VARCHAR(10) PRIMARY KEY,
    FlightID VARCHAR(10) NOT NULL,
    SeatNumber VARCHAR(5) NOT NULL,
    Class VARCHAR(20) NOT NULL CHECK (Class IN ('Economy', 'Premium Economy', 'Business', 'First')),
    SeatStatus VARCHAR(20) DEFAULT 'Available' CHECK (SeatStatus IN ('Available', 'Booked', 'Reserved', 'Unavailable')),
    Price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (FlightID) REFERENCES Flight(FlightID),
    UNIQUE (FlightID, SeatNumber)
);

-- สร้างตาราง Passenger (ข้อมูลผู้โดยสาร)
CREATE TABLE Passenger (
    PassengerID VARCHAR(10) PRIMARY KEY,
    BookingID VARCHAR(10) NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    PassportNumber VARCHAR(20),
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);

-- สร้างตาราง Payment (ข้อมูลการชำระเงิน)
CREATE TABLE Payment (
    PaymentID VARCHAR(10) PRIMARY KEY,
    BookingID VARCHAR(10) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentStatus VARCHAR(20) DEFAULT 'Pending' CHECK (PaymentStatus IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    debit_card VARCHAR(19),
    credit_card VARCHAR(19),
    bank_transfer VARCHAR(20),
    cash BOOLEAN DEFAULT FALSE,
    PaymentMethod VARCHAR(50),
    PaymentDate DATE NOT NULL,
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);

-- สร้างตาราง LoyaltyPoints (คะแนนสะสม)
CREATE TABLE LoyaltyPoints (
    LoyaltyID VARCHAR(10) PRIMARY KEY,
    UserID VARCHAR(20) NOT NULL,
    PointsBalance INT NOT NULL DEFAULT 0,
    PointsExpiryDate DATE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- สร้างตาราง Discount (ส่วนลด)
CREATE TABLE Discount (
    DiscountID VARCHAR(10) PRIMARY KEY,
    PointRequired INT NOT NULL,
    DiscountValue DECIMAL(10,2) NOT NULL,
    ExpiryDate DATE NOT NULL
);

-- สร้างตาราง Redeems (การแลกคะแนนเป็นส่วนลด)
CREATE TABLE Redeems (
    DiscountID VARCHAR(10) NOT NULL,
    BookingID VARCHAR(10) NOT NULL,
    RedeemDate DATE NOT NULL,
    PRIMARY KEY (DiscountID, BookingID),
    FOREIGN KEY (DiscountID) REFERENCES Discount(DiscountID),
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);

-- สร้างตาราง Employee (พนักงาน) - ถ้าจำเป็นสำหรับตาราง Joined
CREATE TABLE Employee (
    EmployeeID VARCHAR(10) PRIMARY KEY,
    UserID VARCHAR(20) NOT NULL,
    Position VARCHAR(50) NOT NULL,
    HireDate DATE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- สร้างตาราง Joined (พนักงานประจำเที่ยวบิน)
CREATE TABLE Joined (
    EmployeeID VARCHAR(10) NOT NULL,
    FlightID VARCHAR(10) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    PRIMARY KEY (EmployeeID, FlightID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (FlightID) REFERENCES Flight(FlightID)
);