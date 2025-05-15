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

  // Get token from local storage
  getToken() {
    return this.token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'  // ลบ charset=UTF-8 ออก
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
  
  try {
      console.log(`Making ${method} request to ${url}`, options);
      const response = await fetch(url, options);
      
      console.log('Response status:', response.status);
      
      // ตรวจสอบว่า response เป็น JSON หรือไม่
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
          // กรณีมี error ให้พยายามอ่านข้อความ error ก่อน
          let errorMessage;
          try {
              if (contentType && contentType.includes('application/json')) {
                  const errorData = await response.json();
                  errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
              } else {
                  errorMessage = await response.text() || `Error: ${response.status}`;
              }
          } catch (parseError) {
              errorMessage = `Error ${response.status}: Could not parse error response`;
          }
          throw new Error(errorMessage);
      }
      
      // กรณีไม่มีข้อมูลส่งกลับ (204 No Content)
      if (response.status === 204) {
          return null;
      }
      
      // ถ้าเป็น JSON ให้แปลงเป็น object
      if (contentType && contentType.includes('application/json')) {
          try {
              // ในกรณีที่มีข้อมูลแต่ไม่ใช่ JSON ที่ถูกต้อง
              const responseText = await response.text();
              
              // ตรวจสอบว่ามีข้อมูลหรือไม่
              if (!responseText.trim()) {
                  return null;
              }
              
              try {
                  // พยายามหาจุดจบของ JSON ที่ถูกต้องก่อน
                  // ในกรณีที่มีอักขระแปลกๆ ต่อท้าย
                  let validJson = responseText;
                  
                  // ตรวจหาเครื่องหมายปิดวงเล็บจาก index สุดท้าย
                  const lastBraceIndex = responseText.lastIndexOf(']');
                  const lastCurlyIndex = responseText.lastIndexOf('}');
                  
                  // ใช้ index ที่มากกว่า
                  if (lastBraceIndex > 0 || lastCurlyIndex > 0) {
                      const lastValidIndex = Math.max(lastBraceIndex, lastCurlyIndex);
                      // ตัดข้อมูลจนถึง index ที่หา
                      validJson = responseText.substring(0, lastValidIndex + 1);
                      console.log('Trimmed JSON to valid ending. Original length:', responseText.length, 'New length:', validJson.length);
                  }
                  
                  try {
                      // ทดลอง parse JSON ที่ตัดแล้ว
                      return JSON.parse(validJson);
                  } catch (jsonError) {
                      console.warn('Error parsing trimmed JSON:', jsonError);
                      
                      // หากยังไม่สามารถ parse ได้ ลองใช้วิธีทำความสะอาดอักขระ
                      // ที่เข้มงวดมากขึ้น
                      const cleanedJson = validJson
                          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // ตัดอักขระควบคุม
                          .replace(/[^\x20-\x7E\s]/g, '') // ตัดอักขระที่ไม่ใช่ ASCII
                          .replace(/[^\[\]{},:\"\'0-9a-zA-Z_\-\.\s]/g, ''); // เก็บเฉพาะอักขระที่ใช้ใน JSON
                      
                      try {
                          return JSON.parse(cleanedJson);
                      } catch (secondParseError) {
                          console.error('Failed to parse cleaned JSON:', secondParseError);
                          
                          // ถ้ายังไม่สามารถ parse ได้ ให้ลองใช้วิธีสุดท้าย
                          try {
                              // ใช้ regex เพื่อหา JSON pattern ที่ถูกต้อง
                              const jsonPattern = /\[.*\]|\{.*\}/s;
                              const match = cleanedJson.match(jsonPattern);
                              
                              if (match && match[0]) {
                                  console.log('Found valid JSON pattern, attempting to parse');
                                  return JSON.parse(match[0]);
                              } else {
                                  throw new Error('No valid JSON pattern found');
                              }
                          } catch (finalError) {
                              console.error('All JSON parsing attempts failed:', finalError);
                              
                              // รองรับกรณีที่ response เป็น array
                              if (responseText.includes('[') && responseText.includes(']')) {
                                  console.log('Response appears to be an array, returning empty array');
                                  return [];
                              }
                              
                              // รองรับกรณีที่ response เป็น object
                              if (responseText.includes('{') && responseText.includes('}')) {
                                  console.log('Response appears to be an object, returning empty object');
                                  return {};
                              }
                              
                              throw new Error('Invalid JSON response from server');
                          }
                      }
                  }
              } catch (error) {
                  console.error('Error processing response:', error);
                  throw error;
              }
          } catch (error) {
              console.error('Error reading response text:', error);
              throw error;
          }
      } else {
          // ถ้าไม่ใช่ JSON ให้คืนค่าเป็น text
          const textResult = await response.text();
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
    return this.request(`/flights/search?from=${encodeURIComponent(departureCity)}&to=${encodeURIComponent(arrivalCity)}`);
  }
  
  // Advanced flight search (with date range)
  async searchFlights(departureCity, arrivalCity, departureFrom, departureTo) {
      try {
          const endpoint = `/flights/search/advanced?from=${encodeURIComponent(departureCity)}&to=${encodeURIComponent(arrivalCity)}&departureFrom=${encodeURIComponent(departureFrom)}&departureTo=${encodeURIComponent(departureTo)}`;
          
          console.log('Searching flights with endpoint:', endpoint);
          
          const result = await this.request(endpoint);
          
          // ถ้าไม่มีข้อมูลให้คืนค่าเป็น array ว่าง
          if (!result) {
              return [];
          }
          
          // ตรวจสอบว่า result เป็น array หรือไม่
          if (Array.isArray(result)) {
              return result;
          } else if (result && typeof result === 'object') {
              // กรณีที่ result เป็น object ที่มี array อยู่ภายใน
              if (Array.isArray(result.flights)) {
                  return result.flights;
              } else if (Array.isArray(result.content)) {
                  return result.content;
              } else if (Array.isArray(result.data)) {
                  return result.data;
              }
          }
          
          // กรณีที่ไม่ตรงกับเงื่อนไขข้างต้น ให้คืนค่าเป็น array ว่าง
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
  
  // ปรับปรุงฟังก์ชัน createBooking ใน api-service.js
  async createBooking(bookingData, userId, flightId) {
    console.log('API Service - Creating booking with data:', JSON.stringify(bookingData));
    console.log('API Service - UserID:', userId, 'FlightID:', flightId);
    
    // ใช้ userId และ flightId จากพารามิเตอร์ หรือจาก bookingData ถ้าไม่มี
    const effectiveUserId = userId || bookingData.userId;
    const effectiveFlightId = flightId || bookingData.flightId;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!effectiveUserId) {
        console.error('API Service - Missing userId');
        throw new Error('ไม่พบ userId สำหรับการสร้างการจอง');
    }
    
    if (!effectiveFlightId) {
        console.error('API Service - Missing flightId');
        throw new Error('ไม่พบ flightId สำหรับการสร้างการจอง');
    }
    
    try {
        // สร้าง endpoint
        const endpoint = `/bookings?userId=${effectiveUserId}&flightId=${effectiveFlightId}`;
        console.log('API Service - Endpoint:', endpoint);
        
        // ส่งข้อมูล
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