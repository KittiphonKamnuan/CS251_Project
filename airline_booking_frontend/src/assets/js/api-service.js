// api-service.js
class ApiService {
    constructor() {
      this.baseUrl = 'http://localhost:8080/api';
      this.token = localStorage.getItem('authToken');
    }
  
    // Set auth token after login
    setToken(token) {
      this.token = token;
      localStorage.setItem('authToken', token);
    }
  
    // Clear token on logout
    clearToken() {
      this.token = null;
      localStorage.removeItem('authToken');
    }
  
    // Helper method for headers
    getHeaders() {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      return headers;
    }
  
    // Generic request method
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: this.getHeaders()
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            console.log(`Making ${method} request to ${url}`, options);
            const response = await fetch(url, options);
            
            console.log('Response status:', response.status);
            
            // ตรวจสอบว่า response เป็น JSON หรือไม่
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                
                if (!response.ok) {
                    const errorMessage = result.message || result.error || 'Unknown error';
                    throw new Error(errorMessage);
                }
                
                return result;
            } else {
                // ถ้าไม่ใช่ JSON ให้ดึงข้อมูลเป็น text
                const textResult = await response.text();
                
                if (!response.ok) {
                    throw new Error(textResult || 'Server error with non-JSON response');
                }
                
                return { success: true, message: textResult };
            }
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }
  
    // ======== USER ENDPOINTS ========
    
    // Login user
    async login(username, password) {
      return this.request('/auth/login', 'POST', { username, password });
    }
    
    // Register new user
    async register(userData) {
        // ถ้าไม่มี username ให้สร้างจากอีเมล
        if (!userData.username && userData.email) {
            userData.username = userData.email.split('@')[0] + Math.floor(Math.random() * 1000);
        }
        
        return this.request('/users', 'POST', userData);
    }
    
    // Get user by ID
    async getUserById(userId) {
      return this.request(`/users/${userId}`);
    }
    
    // Get user by username
    async getUserByUsername(username) {
      return this.request(`/users/username/${username}`);
    }
    
    // Update user profile
    async updateUser(userId, userData) {
      return this.request(`/users/${userId}`, 'PUT', userData);
    }
    
    // Change user password
    async changePassword(userId, oldPassword, newPassword) {
      return this.request(`/users/${userId}/change-password`, 'PUT', {
        oldPassword,
        newPassword
      });
    }
  
    // ======== FLIGHT ENDPOINTS ========
    
    // Get all flights
    async getAllFlights() {
      return this.request('/flights');
    }
    
    // Get flight by ID
    async getFlightById(flightId) {
      return this.request(`/flights/${flightId}`);
    }
    
    // Get flight by flight number
    async getFlightByNumber(flightNumber) {
      return this.request(`/flights/number/${flightNumber}`);
    }
    
    // Basic flight search (departure and arrival cities)
    async searchFlightsByRoute(departureCity, arrivalCity) {
      return this.request(`/flights/search?from=${departureCity}&to=${arrivalCity}`);
    }
    
    // Advanced flight search (with date range)
    async searchFlights(departureCity, arrivalCity, departureFrom, departureTo) {
      return this.request(
        `/flights/search/advanced?from=${departureCity}&to=${arrivalCity}&departureFrom=${departureFrom}&departureTo=${departureTo}`
      );
    }
    
    // Get flights by status
    async getFlightsByStatus(status) {
      return this.request(`/flights/status/${status}`);
    }
  
    // ======== BOOKING ENDPOINTS ========
    
    // Get all bookings
    async getAllBookings() {
      return this.request('/bookings');
    }
    
    // Get booking by ID
    async getBookingById(bookingId) {
      return this.request(`/bookings/${bookingId}`);
    }
    
    // Get bookings by user
    async getUserBookings(userId) {
      return this.request(`/bookings/user/${userId}`);
    }
    
    // Get bookings by flight
    async getFlightBookings(flightId) {
      return this.request(`/bookings/flight/${flightId}`);
    }
    
    // Create new booking
    async createBooking(bookingData, userId, flightId) {
      return this.request(`/bookings?userId=${userId}&flightId=${flightId}`, 'POST', bookingData);
    }
    
    // Update booking
    async updateBooking(bookingId, bookingData) {
      return this.request(`/bookings/${bookingId}`, 'PUT', bookingData);
    }
    
    // Update booking status
    async updateBookingStatus(bookingId, status) {
      return this.request(`/bookings/${bookingId}/status`, 'PATCH', { status });
    }
    
    // Cancel booking
    async cancelBooking(bookingId) {
      return this.request(`/bookings/${bookingId}/cancel`, 'PATCH');
    }
  
    // ======== SEAT ENDPOINTS ========
    
    // Get all seats for a flight
    async getFlightSeats(flightId) {
      return this.request(`/seats/flight/${flightId}`);
    }
    
    // Get available seats for a flight
    async getAvailableSeats(flightId) {
      return this.request(`/seats/flight/${flightId}/available`);
    }
    
    // Get seat by ID
    async getSeatById(seatId) {
      return this.request(`/seats/${seatId}`);
    }
    
    // Get seat by flight and seat number
    async getSeatByNumber(flightId, seatNumber) {
      return this.request(`/seats/flight/${flightId}/number/${seatNumber}`);
    }
    
    // Update seat status (e.g., mark as selected)
    async updateSeatStatus(seatId, status) {
      return this.request(`/seats/${seatId}/status`, 'PATCH', { status });
    }
  
    // ======== PASSENGER ENDPOINTS ========
    
    // Add passenger to booking
    async addPassenger(bookingId, passengerData) {
      return this.request(`/passengers?bookingId=${bookingId}`, 'POST', passengerData);
    }
    
    // Get passengers for booking
    async getBookingPassengers(bookingId) {
      return this.request(`/passengers/booking/${bookingId}`);
    }
    
    // Update passenger information
    async updatePassenger(passengerId, passengerData) {
      return this.request(`/passengers/${passengerId}`, 'PUT', passengerData);
    }
  
    // ======== PAYMENT ENDPOINTS ========
    
    // Create payment for booking
    async createPayment(bookingId, paymentData) {
      return this.request(`/payments?bookingId=${bookingId}`, 'POST', paymentData);
    }
    
    // Get payment for booking
    async getBookingPayment(bookingId) {
      return this.request(`/payments/booking/${bookingId}`);
    }
    
    // Update payment status
    async updatePaymentStatus(paymentId, status) {
      return this.request(`/payments/${paymentId}/status`, 'PATCH', { status });
    }
  
    // ======== LOYALTY POINTS ENDPOINTS ========
    
    // Get loyalty points for user
    async getUserLoyaltyPoints(userId) {
      return this.request(`/loyalty-points/user/${userId}`);
    }
    
    // Get available discounts for points
    async getAvailableDiscounts(points) {
      return this.request(`/discounts/available?points=${points}`);
    }
    
    // Apply discount to booking
    async applyDiscount(bookingId, discountId) {
      return this.request(`/bookings/${bookingId}/discounts/${discountId}`, 'POST');
    }
    
    // ======== ADDITIONAL ENDPOINTS ========
    
    // Get popular destinations
    async getPopularDestinations() {
      return this.request('/destinations/popular');
    }
    
    // Get special offers
    async getSpecialOffers() {
      return this.request('/promotions/featured');
    }
    
    // Get all cities
    async getCities() {
      return this.request('/cities');
    }
    
    // Subscribe to newsletter
    async subscribeToNewsletter(email) {
      return this.request('/newsletter/subscribe', 'POST', { email });
    }
  }
  
  // Create and export a singleton instance
  export const apiService = new ApiService();