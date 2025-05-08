// app.js - Main application file for Airline Booking System Frontend

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';

// Middleware
app.use(cors());
app.use(morgan('dev')); // Logging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'airline-booking-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hour
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'src/main/resources/static/css')));
app.use('/js', express.static(path.join(__dirname, 'src/main/resources/static/js')));
app.use('/images', express.static(path.join(__dirname, 'src/main/resources/static/images')));

// View engine setup (if using templates)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// API proxy middleware
const apiProxy = async (req, res, next) => {
  try {
    const { method, url, params, body } = req;
    const apiUrl = `${API_BASE_URL}${url}`;
    
    const headers = {};
    if (req.session.token) {
      headers['Authorization'] = `Bearer ${req.session.token}`;
    }
    
    const response = await axios({
      method,
      url: apiUrl,
      params,
      data: body,
      headers
    });
    
    req.apiResponse = response.data;
    next();
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Routes

// Home page
app.get('/', (req, res) => {
  res.render('index', { 
    user: req.session.user || null,
    title: 'Airline Booking System - Home'
  });
});

// Login Page
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { 
    title: 'Login',
    error: req.query.error || null
  });
});

// Login API
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    
    req.session.user = response.data.user;
    req.session.token = response.data.token;
    
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error.message);
    res.redirect('/login?error=Invalid username or password');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Registration page
app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register', { 
    title: 'Register',
    error: req.query.error || null
  });
});

// Registration API
app.post('/register', async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, phone, address } = req.body;
    
    await axios.post(`${API_BASE_URL}/auth/register`, {
      username,
      password,
      email,
      firstName,
      lastName,
      phone,
      address
    });
    
    res.redirect('/login?success=Registration successful. Please login.');
  } catch (error) {
    console.error('Registration error:', error.message);
    res.redirect('/register?error=Registration failed. Please try again.');
  }
});

// Flight search page
app.get('/flights', (req, res) => {
  res.render('flights', { 
    user: req.session.user || null,
    title: 'Search Flights',
    query: req.query
  });
});

// Flight search API
app.get('/api/flights/search', async (req, res) => {
  try {
    const { departureCity, arrivalCity, departureDate, returnDate, passengers } = req.query;
    
    const response = await axios.get(`${API_BASE_URL}/flights/search`, {
      params: {
        departureCity,
        arrivalCity,
        departureDate,
        returnDate,
        passengers
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Flight search error:', error.message);
    res.status(500).json({ message: 'Error searching flights' });
  }
});

// Flight details page
app.get('/flight-details/:id', (req, res) => {
  res.render('flight-details', { 
    user: req.session.user || null,
    title: 'Flight Details',
    flightId: req.params.id
  });
});

// Flight details API
app.get('/api/flights/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flights/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Flight details error:', error.message);
    res.status(500).json({ message: 'Error fetching flight details' });
  }
});

// Seat selection page
app.get('/seat-selection/:flightId', isAuthenticated, (req, res) => {
  res.render('seat-selection', { 
    user: req.session.user,
    title: 'Select Your Seat',
    flightId: req.params.flightId
  });
});

// Seats API
app.get('/api/flights/:flightId/seats', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flights/${req.params.flightId}/seats`);
    res.json(response.data);
  } catch (error) {
    console.error('Seat fetch error:', error.message);
    res.status(500).json({ message: 'Error fetching seats' });
  }
});

// Booking page (after seat selection)
app.post('/booking', isAuthenticated, (req, res) => {
  const { flightId, seatIds, passengers, totalPrice } = req.body;
  
  // Store in session for next steps
  req.session.bookingData = {
    flightId,
    seatIds,
    passengers,
    totalPrice
  };
  
  res.render('passenger-details', {
    user: req.session.user,
    title: 'Passenger Details',
    bookingData: req.session.bookingData
  });
});

// Create booking API
app.post('/api/bookings', isAuthenticated, async (req, res) => {
  try {
    const { flightId, seatIds, passengers, totalPrice } = req.body;
    
    const response = await axios.post(`${API_BASE_URL}/bookings`, {
      flightId,
      seatIds,
      passengers,
      totalPrice
    }, {
      headers: {
        'Authorization': `Bearer ${req.session.token}`
      }
    });
    
    // Store booking ID in session for payment
    req.session.bookingId = response.data.bookingId;
    
    res.json(response.data);
  } catch (error) {
    console.error('Booking creation error:', error.message);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Payment page
app.get('/payment/:bookingId', isAuthenticated, (req, res) => {
  res.render('payment', { 
    user: req.session.user,
    title: 'Payment',
    bookingId: req.params.bookingId
  });
});

// Process payment API
app.post('/api/payments', isAuthenticated, async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, cardDetails } = req.body;
    
    const response = await axios.post(`${API_BASE_URL}/payments`, {
      bookingId,
      amount,
      paymentMethod,
      cardDetails
    }, {
      headers: {
        'Authorization': `Bearer ${req.session.token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Payment error:', error.message);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

// Booking confirmation page
app.get('/confirmation/:bookingId', isAuthenticated, (req, res) => {
  res.render('confirmation', { 
    user: req.session.user,
    title: 'Booking Confirmation',
    bookingId: req.params.bookingId
  });
});

// Booking details API
app.get('/api/bookings/:id', isAuthenticated, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/${req.params.id}`, {
      headers: {
        'Authorization': `Bearer ${req.session.token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Booking details error:', error.message);
    res.status(500).json({ message: 'Error fetching booking details' });
  }
});

// Booking status page
app.get('/booking-status/:id', isAuthenticated, (req, res) => {
  res.render('booking-status', { 
    user: req.session.user,
    title: 'Booking Status',
    bookingId: req.params.id
  });
});

// Promotions page
app.get('/promotions', (req, res) => {
  res.render('promotions', { 
    user: req.session.user || null,
    title: 'Promotions & Offers'
  });
});

// Promotions API
app.get('/api/promotions', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/promotions`);
    res.json(response.data);
  } catch (error) {
    console.error('Promotions error:', error.message);
    res.status(500).json({ message: 'Error fetching promotions' });
  }
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('contact', { 
    user: req.session.user || null,
    title: 'Contact Us'
  });
});

// Send contact form API
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const response = await axios.post(`${API_BASE_URL}/contact`, {
      name,
      email,
      message
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({ message: 'Error sending contact form' });
  }
});

// User profile page
app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { 
    user: req.session.user,
    title: 'My Profile'
  });
});

// Get user bookings API
app.get('/api/users/bookings', isAuthenticated, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/bookings`, {
      headers: {
        'Authorization': `Bearer ${req.session.token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('User bookings error:', error.message);
    res.status(500).json({ message: 'Error fetching user bookings' });
  }
});

// Admin routes
app.get('/admin', isAuthenticated, (req, res) => {
  if (req.session.user.role !== 'ADMIN') {
    return res.status(403).render('error', {
      message: 'Forbidden',
      error: { status: 403, stack: '' }
    });
  }
  
  res.render('admin/dashboard', { 
    user: req.session.user,
    title: 'Admin Dashboard'
  });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page Not Found',
    error: { status: 404, stack: process.env.NODE_ENV === 'development' ? '' : '' }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;