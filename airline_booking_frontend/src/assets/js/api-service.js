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
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
  }

  // Get token from local storage
  getToken() {
    return this.token;
  }

  // Logout method
  logout() {
    this.clearToken();
  }

  // Get headers with proper content type
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
  
    return headers;
  }  

  // Generic request method with improved error handling and response parsing
  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options = {
      method,
      headers: this.getHeaders()
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`Making ${method} request to ${url}`, options);
    
    try {
      const response = await fetch(url, options);
      console.log(`Response from ${url}:`, response.status, response.statusText);
      
      if (!response.ok) {
        let errorText = "";
        try {
          const errorJson = await response.json();
          errorText = errorJson.message || errorJson.error || response.statusText;
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const text = await response.text();
      console.log(`Response text from ${url}:`, text ? text.substring(0, 100) + "..." : "(empty)");
      
      if (!text) return null;
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return text;
      }
    } catch (error) {
      console.error(`Error in API request to ${url}:`, error);
      throw error;
    }
  }

  // Utility function to trim JSON to a valid ending
  trimToValidJson(jsonString) {
    // Find the index of the last closing bracket or brace
    const lastBraceIndex = jsonString.lastIndexOf('}');
    const lastBracketIndex = jsonString.lastIndexOf(']');
    
    // Use the greater of the two indices
    const lastIndex = Math.max(lastBraceIndex, lastBracketIndex);
    
    if (lastIndex > 0) {
      return jsonString.substring(0, lastIndex + 1);
    }
    
    return jsonString;
  }

  // ======== USER ENDPOINTS ========
  
  // Login user
  async login(username, password) {
    return this.request('/auth/login', 'POST', { username, password });
  }
  
  // Register new user
  async register(userData) {
      // Generate username from email if not provided
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
    return this.request(`/flights/search?from=${encodeURIComponent(departureCity)}&to=${encodeURIComponent(arrivalCity)}`);
  }
  
  // Advanced flight search (with date range)
  async searchFlights(departureCity, arrivalCity, departureFrom, departureTo) {
    try {
      const endpoint = `/flights/search/advanced?from=${encodeURIComponent(departureCity)}&to=${encodeURIComponent(arrivalCity)}&departureFrom=${encodeURIComponent(departureFrom)}&departureTo=${encodeURIComponent(departureTo)}`;
      
      console.log('Searching flights with endpoint:', endpoint);
      
      const result = await this.request(endpoint);
      
      // Return empty array if no results
      if (!result) {
          return [];
      }
      
      // Handle different response formats
      if (Array.isArray(result)) {
          return result;
      } else if (result && typeof result === 'object') {
          if (Array.isArray(result.flights)) {
              return result.flights;
          } else if (Array.isArray(result.content)) {
              return result.content;
          } else if (Array.isArray(result.data)) {
              return result.data;
          }
      }
      
      console.warn('Search result is not an array or does not contain flight data:', result);
      return [];
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
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
  
  // Create a new booking
  async createBooking(bookingData, userId, flightId) {
    console.log('API Service - Creating booking with data:', JSON.stringify(bookingData));
    console.log('API Service - UserID:', userId, 'FlightID:', flightId);
    
    // Use provided IDs or from bookingData
    const effectiveUserId = userId || bookingData.userId;
    const effectiveFlightId = flightId || bookingData.flightId;
    
    // Validate required fields
    if (!effectiveUserId) {
        console.error('API Service - Missing userId');
        throw new Error('ไม่พบ userId สำหรับการสร้างการจอง');
    }
    
    if (!effectiveFlightId) {
        console.error('API Service - Missing flightId');
        throw new Error('ไม่พบ flightId สำหรับการสร้างการจอง');
    }
    
    try {
        // Build endpoint with query params
        const endpoint = `/bookings?userId=${effectiveUserId}&flightId=${effectiveFlightId}`;
        console.log('API Service - Endpoint:', endpoint);
        
        // Send request
        const response = await this.request(endpoint, 'POST', bookingData);
        console.log('API Service - Booking created successfully:', response);
        return response;
    } catch (error) {
        console.error('API Service - Error creating booking:', error);
        throw error;
    }
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
  
  // Add loyalty points to user
  async addLoyaltyPoints(userId, points, bookingId) {
    console.log('API Service - Adding loyalty points:', points, 'for user:', userId, 'booking:', bookingId);
    return this.request('/loyalty-points', 'POST', {
      userId,
      points,
      bookingId,
      earnedDate: new Date().toISOString().split('T')[0],
      description: `Points earned from booking #${bookingId}`
    });
  }
  
  // Use loyalty points for a discount
  async useLoyaltyPoints(userId, points, bookingId) {
    console.log('API Service - Using loyalty points:', points, 'for user:', userId, 'booking:', bookingId);
    return this.request('/loyalty-points/use', 'POST', {
      userId,
      points,
      bookingId,
      usedDate: new Date().toISOString().split('T')[0],
      description: `Points used for discount on booking #${bookingId}`
    });
  }
  
  // Get loyalty points history for user
  async getLoyaltyPointsHistory(userId) {
    return this.request(`/loyalty-points/history/${userId}`);
  }
  
  // Get loyalty points balance for user
  async getLoyaltyPointsBalance(userId) {
    return this.request(`/loyalty-points/balance/${userId}`);
  }
  
  // Get available discounts for points
  async getAvailableDiscounts(points) {
    return this.request(`/discounts/available?points=${points}`);
  }
  
  // Apply discount to booking
  async applyDiscount(bookingId, discountId) {
    return this.request(`/bookings/${bookingId}/discounts/${discountId}`, 'POST');
  }

  // ======== DISCOUNT ENDPOINTS ========
  // Validate discount code
  async validateDiscountCode(code) {
    try {
      const response = await this.request(`/discounts/validate/${code}`);
      return response;
    } catch (error) {
      console.error('Error validating discount code:', error);
      throw error;
    }
  }

  // Apply discount code to booking
  async applyDiscountToBooking(bookingId, discountCode) {
    try {
      const response = await this.request(`/discounts/apply?bookingId=${bookingId}&discountCode=${discountCode}`, 'POST');
      return response;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }

  // Get discounts for booking
  async getDiscountsByBookingId(bookingId) {
    try {
      const response = await this.request(`/discounts/booking/${bookingId}`);
      return response;
    } catch (error) {
      console.error('Error getting discounts for booking:', error);
      return [];
    }
  }

  // Get all discounts
  async getAllDiscounts() {
    return this.request('/discounts');
  }

  // Get discount by ID
  async getDiscountById(discountId) {
    return this.request(`/discounts/${discountId}`);
  }

  // Create new discount
  async createDiscount(discountData) {
    return this.request('/discounts', 'POST', discountData);
  }

  // Update discount
  async updateDiscount(discountId, discountData) {
    return this.request(`/discounts/${discountId}`, 'PUT', discountData);
  }

  // Delete discount
  async deleteDiscount(discountId) {
    return this.request(`/discounts/${discountId}`, 'DELETE');
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

  // ======== ADMIN ENDPOINTS ========
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getRecentUsers() {
    return this.request('/admin/dashboard/recent-users');
  }

  async getRecentBookings() {
    return this.request('/admin/dashboard/recent-bookings');
  }

  async getRevenueChart() {
    return this.request('/admin/dashboard/revenue-chart');
  }

  async countUsers() {
    return this.request('/admin/users/count');
  }

  async countFlights() {
    return this.request('/admin/flights/count');
  }

  async countBookings() {
    return this.request('/admin/bookings/count');
  }

  async countDiscounts() {
    return this.request('/admin/discounts/count');
  }

  async countAvailableSeats() {
    return this.request('/admin/seats/count');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();