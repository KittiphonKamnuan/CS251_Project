// app.js - Main application file for Airline Booking System

// Import required modules
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up session
app.use(session({
    secret: 'flight-booking-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Configure database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'airline_booking'
});

// Connect to database
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up template engine
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Define routes

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// User authentication routes
app.post('/register', async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, phone, address } = req.body;
        
        // Check if username already exists
        db.query('SELECT * FROM User WHERE Username = ?', [username], async (err, results) => {
            if (err) throw err;
            
            if (results.length > 0) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Generate UserID (you may want to improve this logic)
            const userId = Date.now().toString();
            
            // Insert new user
            const query = `INSERT INTO User (UserID, Username, Password, Email, FirstName, LastName, Address, Phone, Role) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Customer')`;
            
            db.query(query, [userId, username, hashedPassword, email, firstName, lastName, address, phone], (err, result) => {
                if (err) throw err;
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        db.query('SELECT * FROM User WHERE Username = ?', [username], async (err, results) => {
            if (err) throw err;
            
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            
            const user = results[0];
            
            // Compare password
            const isMatch = await bcrypt.compare(password, user.Password);
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            
            // Set session
            req.session.user = {
                id: user.UserID,
                username: user.Username,
                firstName: user.FirstName,
                lastName: user.LastName,
                role: user.Role
            };
            
            res.status(200).json({ 
                message: 'Login successful',
                user: {
                    id: user.UserID,
                    username: user.Username,
                    firstName: user.FirstName,
                    lastName: user.LastName,
                    role: user.Role
                } 
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect('/');
    });
});

// Flight routes
app.get('/flights/search', (req, res) => {
    const { departureCity, arrivalCity, departureDate } = req.query;
    
    let query = `SELECT * FROM Flight WHERE 1=1`;
    const params = [];
    
    if (departureCity) {
        query += ` AND DepartureCity = ?`;
        params.push(departureCity);
    }
    
    if (arrivalCity) {
        query += ` AND ArrivalCity = ?`;
        params.push(arrivalCity);
    }
    
    if (departureDate) {
        query += ` AND DATE(DepartureTime) = ?`;
        params.push(departureDate);
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error searching flights', error: err.message });
        }
        
        res.status(200).json({ flights: results });
    });
});

app.get('/flight-details/:id', (req, res) => {
    const flightId = req.params.id;
    
    db.query('SELECT * FROM Flight WHERE FlightID = ?', [flightId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching flight details', error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        
        res.sendFile(path.join(__dirname, 'flight-details.html'));
    });
});

// Seat routes
app.get('/seats/:flightId', (req, res) => {
    const flightId = req.params.flightId;
    
    db.query('SELECT * FROM Seat WHERE FlightID = ?', [flightId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching seats', error: err.message });
        }
        
        res.status(200).json({ seats: results });
    });
});

app.get('/seat-selection/:flightId', (req, res) => {
    const flightId = req.params.flightId;
    
    // Check if flight exists
    db.query('SELECT * FROM Flight WHERE FlightID = ?', [flightId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching flight', error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        
        res.sendFile(path.join(__dirname, 'seat-selection.html'));
    });
});

app.put('/seats/:seatId', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const seatId = req.params.seatId;
    const { status } = req.body;
    
    db.query('UPDATE Seat SET SeatStatus = ? WHERE SeatID = ?', [status, seatId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating seat status', error: err.message });
        }
        
        res.status(200).json({ message: 'Seat status updated successfully' });
    });
});

// Booking routes
app.post('/booking', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { flightId, seatIds, passengerDetails, totalPrice } = req.body;
    const userId = req.session.user.id;
    
    // Generate booking ID
    const bookingId = 'BK' + Date.now();
    const bookingDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Begin transaction
    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ message: 'Error starting transaction', error: err.message });
        }
        
        // Insert booking
        db.query(
            'INSERT INTO Booking (BookingID, UserID, FlightID, BookingDate, TotalPrice, BookingStatus) VALUES (?, ?, ?, ?, ?, ?)',
            [bookingId, userId, flightId, bookingDate, totalPrice, 'Pending'],
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error creating booking', error: err.message });
                    });
                }
                
                // Add passengers
                const passengerPromises = passengerDetails.map((passenger, index) => {
                    return new Promise((resolve, reject) => {
                        const passengerId = 'P' + Date.now() + index;
                        
                        db.query(
                            'INSERT INTO Passenger (PassengerID, BookingID, FirstName, LastName, PassportNumber, DateOfBirth) VALUES (?, ?, ?, ?, ?, ?)',
                            [passengerId, bookingId, passenger.firstName, passenger.lastName, passenger.passportNumber, passenger.dateOfBirth],
                            (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            }
                        );
                    });
                });
                
                // Update seat status
                const seatPromises = seatIds.map(seatId => {
                    return new Promise((resolve, reject) => {
                        db.query(
                            'UPDATE Seat SET SeatStatus = ? WHERE SeatID = ?',
                            ['Reserved', seatId],
                            (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            }
                        );
                    });
                });
                
                Promise.all([...passengerPromises, ...seatPromises])
                    .then(() => {
                        db.commit(err => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Error committing transaction', error: err.message });
                                });
                            }
                            
                            res.status(201).json({ 
                                message: 'Booking created successfully',
                                bookingId: bookingId
                            });
                        });
                    })
                    .catch(err => {
                        db.rollback(() => {
                            res.status(500).json({ message: 'Error processing booking', error: err.message });
                        });
                    });
            }
        );
    });
});

app.get('/booking-status/:id', (req, res) => {
    const bookingId = req.params.id;
    
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    db.query(
        `SELECT b.*, f.*, s.SeatNumber, s.Class, p.FirstName as PassengerFirstName, p.LastName as PassengerLastName
         FROM Booking b
         JOIN Flight f ON b.FlightID = f.FlightID
         JOIN Passenger p ON p.BookingID = b.BookingID
         LEFT JOIN Seat s ON s.FlightID = f.FlightID AND s.SeatStatus = 'Reserved'
         WHERE b.BookingID = ? AND b.UserID = ?`,
        [bookingId, req.session.user.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching booking', error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            
            res.sendFile(path.join(__dirname, 'booking-status.html'));
        }
    );
});

app.get('/api/booking/:id', (req, res) => {
    const bookingId = req.params.id;
    
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    db.query(
        `SELECT b.*, f.*, s.SeatNumber, s.Class, p.FirstName as PassengerFirstName, p.LastName as PassengerLastName
         FROM Booking b
         JOIN Flight f ON b.FlightID = f.FlightID
         JOIN Passenger p ON p.BookingID = b.BookingID
         LEFT JOIN Seat s ON s.FlightID = f.FlightID AND s.SeatStatus = 'Reserved'
         WHERE b.BookingID = ? AND b.UserID = ?`,
        [bookingId, req.session.user.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching booking', error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            
            // Process results to create a structured booking object
            const booking = {
                bookingId: results[0].BookingID,
                bookingDate: results[0].BookingDate,
                totalPrice: results[0].TotalPrice,
                status: results[0].BookingStatus,
                flight: {
                    flightId: results[0].FlightID,
                    flightNumber: results[0].FlightNumber,
                    departureCity: results[0].DepartureCity,
                    arrivalCity: results[0].ArrivalCity,
                    departureTime: results[0].DepartureTime,
                    arrivalTime: results[0].ArrivalTime,
                    aircraft: results[0].Aircraft,
                    status: results[0].FlightStatus
                },
                passengers: [],
                seats: []
            };
            
            // Extract unique passengers and seats
            const passengerMap = new Map();
            const seatMap = new Map();
            
            results.forEach(row => {
                if (row.PassengerFirstName && !passengerMap.has(row.PassengerFirstName + row.PassengerLastName)) {
                    passengerMap.set(row.PassengerFirstName + row.PassengerLastName, {
                        firstName: row.PassengerFirstName,
                        lastName: row.PassengerLastName
                    });
                }
                
                if (row.SeatNumber && !seatMap.has(row.SeatNumber)) {
                    seatMap.set(row.SeatNumber, {
                        seatNumber: row.SeatNumber,
                        class: row.Class
                    });
                }
            });
            
            booking.passengers = Array.from(passengerMap.values());
            booking.seats = Array.from(seatMap.values());
            
            res.status(200).json({ booking });
        }
    );
});

// Payment routes
app.get('/payment/:bookingId', (req, res) => {
    const bookingId = req.params.bookingId;
    
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    db.query(
        'SELECT * FROM Booking WHERE BookingID = ? AND UserID = ?',
        [bookingId, req.session.user.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching booking', error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            
            res.sendFile(path.join(__dirname, 'payment.html'));
        }
    );
});

app.post('/payment', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { bookingId, amount, paymentMethod, cardDetails } = req.body;
    
    // Generate payment ID
    const paymentId = 'PAY' + Date.now();
    const paymentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Save payment details based on method
    let query;
    let params;
    
    if (paymentMethod === 'credit_card') {
        query = 'INSERT INTO Payment (PaymentID, BookingID, Amount, PaymentMethod, PaymentDate, PaymentStatus, credit_card) VALUES (?, ?, ?, ?, ?, ?, ?)';
        params = [paymentId, bookingId, amount, 'credit_card', paymentDate, 'Completed', cardDetails.cardNumber];
    } else if (paymentMethod === 'debit_card') {
        query = 'INSERT INTO Payment (PaymentID, BookingID, Amount, PaymentMethod, PaymentDate, PaymentStatus, debit_card) VALUES (?, ?, ?, ?, ?, ?, ?)';
        params = [paymentId, bookingId, amount, 'debit_card', paymentDate, 'Completed', cardDetails.cardNumber];
    } else if (paymentMethod === 'bank_transfer') {
        query = 'INSERT INTO Payment (PaymentID, BookingID, Amount, PaymentMethod, PaymentDate, PaymentStatus, bank_transfer) VALUES (?, ?, ?, ?, ?, ?, ?)';
        params = [paymentId, bookingId, amount, 'bank_transfer', paymentDate, 'Completed', cardDetails.accountNumber];
    } else if (paymentMethod === 'cash') {
        query = 'INSERT INTO Payment (PaymentID, BookingID, Amount, PaymentMethod, PaymentDate, PaymentStatus, cash) VALUES (?, ?, ?, ?, ?, ?, ?)';
        params = [paymentId, bookingId, amount, 'cash', paymentDate, 'Completed', true];
    } else {
        return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    // Begin transaction
    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ message: 'Error starting transaction', error: err.message });
        }
        
        // Save payment
        db.query(query, params, (err, result) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ message: 'Error processing payment', error: err.message });
                });
            }
            
            // Update booking status
            db.query(
                'UPDATE Booking SET BookingStatus = ? WHERE BookingID = ?',
                ['Confirmed', bookingId],
                (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Error updating booking status', error: err.message });
                        });
                    }
                    
                    // Add loyalty points
                    db.query(
                        'SELECT TotalPrice FROM Booking WHERE BookingID = ?',
                        [bookingId],
                        (err, results) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Error fetching booking details', error: err.message });
                                });
                            }
                            
                            const totalPrice = results[0].TotalPrice;
                            const pointsEarned = Math.floor(totalPrice / 100); // 1 point per 100 currency units
                            const expiryDate = new Date();
                            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Points expire after 1 year
                            
                            db.query(
                                'INSERT INTO LoyaltyPoints (BookingID, PointsBalance, PointsExpiryDate) VALUES (?, ?, ?)',
                                [bookingId, pointsEarned, expiryDate.toISOString().slice(0, 10)],
                                (err, result) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            res.status(500).json({ message: 'Error adding loyalty points', error: err.message });
                                        });
                                    }
                                    
                                    db.commit(err => {
                                        if (err) {
                                            return db.rollback(() => {
                                                res.status(500).json({ message: 'Error committing transaction', error: err.message });
                                            });
                                        }
                                        
                                        res.status(200).json({ 
                                            message: 'Payment successful',
                                            paymentId: paymentId,
                                            pointsEarned: pointsEarned
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    });
});

// Confirmation route
app.get('/confirmation/:bookingId', (req, res) => {
    const bookingId = req.params.bookingId;
    
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    res.sendFile(path.join(__dirname, 'confirmation.html'));
});

// Promotions route
app.get('/promotions', (req, res) => {
    db.query('SELECT * FROM Discount WHERE ExpiryDate >= CURDATE()', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching promotions', error: err.message });
        }
        
        res.sendFile(path.join(__dirname, 'promotions.html'));
    });
});

app.get('/api/promotions', (req, res) => {
    db.query('SELECT * FROM Discount WHERE ExpiryDate >= CURDATE()', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching promotions', error: err.message });
        }
        
        res.status(200).json({ promotions: results });
    });
});

// Contact route
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Here you would typically send an email or save to a database
    // For this example, we'll just respond with success
    
    res.status(200).json({ message: 'Message sent successfully' });
});

// User profile and bookings
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    
    db.query(
        'SELECT * FROM User WHERE UserID = ?',
        [req.session.user.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching user data', error: err.message });
            }
            
            if (results.length === 0) {
                req.session.destroy();
                return res.redirect('/');
            }
            
            // Fetch user's bookings
            db.query(
                `SELECT b.*, f.DepartureCity, f.ArrivalCity, f.DepartureTime, f.ArrivalTime
                 FROM Booking b
                 JOIN Flight f ON b.FlightID = f.FlightID
                 WHERE b.UserID = ?
                 ORDER BY b.BookingDate DESC`,
                [req.session.user.id],
                (err, bookings) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error fetching bookings', error: err.message });
                    }
                    
                    // Fetch loyalty points
                    db.query(
                        `SELECT SUM(lp.PointsBalance) as TotalPoints
                         FROM LoyaltyPoints lp
                         JOIN Booking b ON lp.BookingID = b.BookingID
                         WHERE b.UserID = ? AND lp.PointsExpiryDate >= CURDATE()`,
                        [req.session.user.id],
                        (err, pointsResults) => {
                            if (err) {
                                return res.status(500).json({ message: 'Error fetching loyalty points', error: err.message });
                            }
                            
                            const userData = {
                                user: {
                                    id: results[0].UserID,
                                    username: results[0].Username,
                                    firstName: results[0].FirstName,
                                    lastName: results[0].LastName,
                                    email: results[0].Email,
                                    phone: results[0].Phone,
                                    address: results[0].Address
                                },
                                bookings: bookings,
                                loyaltyPoints: pointsResults[0].TotalPoints || 0
                            };
                            
                            res.render('profile', userData);
                        }
                    );
                }
            );
        }
    );
});

// Admin routes (protected by role check)
app.use('/admin', (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    next();
});

app.get('/admin/flights', (req, res) => {
    db.query('SELECT * FROM Flight ORDER BY DepartureTime', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching flights', error: err.message });
        }
        
        res.render('admin/flights', { flights: results });
    });
});

app.post('/admin/flights', (req, res) => {
    const { flightNumber, departureCity, arrivalCity, departureTime, arrivalTime, aircraft } = req.body;
    
    // Generate flight ID
    const flightId = 'FL' + Date.now();
    
    db.query(
        'INSERT INTO Flight (FlightID, FlightNumber, DepartureCity, ArrivalCity, DepartureTime, ArrivalTime, Aircraft, FlightStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [flightId, flightNumber, departureCity, arrivalCity, departureTime, arrivalTime, aircraft, 'Scheduled'],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error creating flight', error: err.message });
            }
            
            res.status(201).json({ 
                message: 'Flight created successfully',
                flightId: flightId
            });
        }
    );
});

app.put('/admin/flights/:id', (req, res) => {
    const flightId = req.params.id;
    const { flightNumber, departureCity, arrivalCity, departureTime, arrivalTime, aircraft, status } = req.body;
    
    db.query(
        'UPDATE Flight SET FlightNumber = ?, DepartureCity = ?, ArrivalCity = ?, DepartureTime = ?, ArrivalTime = ?, Aircraft = ?, FlightStatus = ? WHERE FlightID = ?',
        [flightNumber, departureCity, arrivalCity, departureTime, arrivalTime, aircraft, status, flightId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating flight', error: err.message });
            }
            
            res.status(200).json({ message: 'Flight updated successfully' });
        }
    );
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;