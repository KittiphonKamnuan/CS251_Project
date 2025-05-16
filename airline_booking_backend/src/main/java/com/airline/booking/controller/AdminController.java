package com.airline.booking.controller;

import com.airline.booking.dto.AdminDTO;
import com.airline.booking.model.Booking;
import com.airline.booking.model.Discount;
import com.airline.booking.model.Flight;
import com.airline.booking.model.Passenger;
import com.airline.booking.model.Payment;
import com.airline.booking.model.Seat;
import com.airline.booking.model.User;
import com.airline.booking.service.*;
import com.airline.booking.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    private static final Logger logger = Logger.getLogger(AdminController.class.getName());

    @Autowired
    private UserService userService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private FlightService flightService;

    @Autowired
    private SeatService seatService;

    @Autowired
    private DiscountService discountService;
    
    @Autowired
    private PassengerService passengerService;
    
    @Autowired
    private PaymentService paymentService;

    // ============ DASHBOARD ENDPOINTS ============

    // Dashboard Stats
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDTO> getDashboardStats() {
        try {
            logger.info("Getting dashboard stats");
            int totalUsers = (int) userService.countUsers();
            int totalBookings = (int) bookingService.countBookings();
            int totalFlights = (int) flightService.countFlights();
            int totalSeats = (int) seatService.countAvailableSeats();
            int totalDiscounts = (int) discountService.countAllDiscounts();
            
            // คำนวณการเปลี่ยนแปลง (ในที่นี้ใช้ค่าตายตัว แต่ในระบบจริงควรคำนวณจากข้อมูลในฐานข้อมูล)
            int userChange = 5; // เปอร์เซ็นต์การเปลี่ยนแปลงของผู้ใช้
            int bookingChange = 10; // เปอร์เซ็นต์การเปลี่ยนแปลงของการจอง
            double totalRevenue = 15000.0; // รายได้ทั้งหมด
            int revenueChange = 8; // เปอร์เซ็นต์การเปลี่ยนแปลงของรายได้
            int flightChange = 3; // เปอร์เซ็นต์การเปลี่ยนแปลงของเที่ยวบิน
            
            // ข้อมูลเพิ่มเติม (ถ้ามี)
            String topDepartureCity = "Bangkok"; // เมืองต้นทางยอดนิยม
            String topArrivalCity = "Chiang Mai"; // เมืองปลายทางยอดนิยม
            int pendingBookingsCount = 12; // จำนวนการจองที่รอดำเนินการ
    
            AdminDTO stats = new AdminDTO(
                totalUsers,
                totalBookings,
                totalFlights,
                totalSeats,
                totalDiscounts,
                userChange,
                bookingChange,
                totalRevenue,
                revenueChange,
                flightChange,
                topDepartureCity,
                topArrivalCity,
                pendingBookingsCount
            );
            
            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting dashboard stats: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Recent Bookings
    @GetMapping("/dashboard/recent-bookings")
    public ResponseEntity<List<Booking>> getRecentBookings() {
        try {
            logger.info("Getting recent bookings");
            List<Booking> bookings = bookingService.getRecentBookingsByBookingID();
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting recent bookings: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Recent Users
    @GetMapping("/dashboard/recent-users")
    public ResponseEntity<List<User>> getRecentUsers() {
        try {
            logger.info("Getting recent users");
            List<User> users = userService.getRecentUsersByUserID();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting recent users: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Revenue Chart
    @GetMapping("/dashboard/revenue-chart")
    public ResponseEntity<Map<String, Object>> getRevenueChart() {
        try {
            logger.info("Getting revenue chart data");
            Map<String, Object> result = bookingService.getRevenueChart();
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting revenue chart: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ============ USER MANAGEMENT ============

    // ใน AdminController
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {
        try {
            logger.info("Getting all users");
            List<User> users;
            
            if (page != null && limit != null) {
                // ปรับให้ page เริ่มที่ 0 (ในขณะที่คนใช้มองว่าหน้าแรกคือ 1)
                int pageIndex = Math.max(0, page - 1);
                users = userService.getUsersWithPagination(pageIndex, limit);
            } else {
                users = userService.getAllUsers();
            }
            
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting all users: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get users by role
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            logger.info("Getting users by role: " + role);
            List<User> users = userService.getUsersByRole(role);
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting users by role: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search users
    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String term) {
        try {
            logger.info("Searching users with term: " + term);
            List<User> users = userService.searchUsers(term);
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error searching users: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get user by ID
    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        try {
            logger.info("Getting user by ID: " + userId);
            User user = userService.getUserById(userId);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("User not found with ID: " + userId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error getting user by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add new user
    @PostMapping(value = "/users", consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<User> addUser(@RequestBody User user) {
        try {
            logger.info("Adding new user: " + user.getUsername());
            User newUser = userService.createUser(user);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.severe("Error adding user: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Update user
    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody User user) {
        try {
            logger.info("Updating user with ID: " + userId);
            User updatedUser = userService.updateUser(userId, user);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("User not found with ID: " + userId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating user: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        try {
            logger.info("Deleting user with ID: " + userId);
            boolean deleted = userService.deleteUser(userId);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.severe("Error deleting user: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count users
    @GetMapping("/users/count")
    public ResponseEntity<Map<String, Object>> getUserCount() {
        try {
            logger.info("Getting user count");
            Map<String, Object> response = new HashMap<>();
            response.put("count", userService.countUsers());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting user count: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ============ FLIGHT MANAGEMENT ============

    // Get all flights
    @GetMapping("/flights")
    public ResponseEntity<List<Flight>> getAllFlights(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {
        try {
            logger.info("Getting all flights");
            List<Flight> flights;
            
            if (page != null && limit != null) {
                // ถ้ามีการระบุหน้าและขนาดหน้า จะดึงข้อมูลแบบแบ่งหน้า
                int offset = (page - 1) * limit;
                flights = flightService.getFlightsWithPagination(offset, limit);
            } else {
                // ถ้าไม่ได้ระบุ จะดึงข้อมูลทั้งหมด
                flights = flightService.getAllFlights();
            }
            
            return new ResponseEntity<>(flights, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting all flights: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get flights by status
    @GetMapping("/flights/status/{status}")
    public ResponseEntity<List<Flight>> getFlightsByStatus(@PathVariable String status) {
        try {
            logger.info("Getting flights by status: " + status);
            List<Flight> flights = flightService.getFlightsByStatus(status);
            return new ResponseEntity<>(flights, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting flights by status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get flight by ID
    @GetMapping("/flights/{flightId}")
    public ResponseEntity<Flight> getFlightById(@PathVariable String flightId) {
        try {
            logger.info("Getting flight by ID: " + flightId);
            Flight flight = flightService.getFlightById(flightId);
            return new ResponseEntity<>(flight, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Flight not found with ID: " + flightId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error getting flight by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add new flight
    @PostMapping("/flights")
    public ResponseEntity<Flight> addFlight(@RequestBody Flight flight) {
        try {
            logger.info("Adding new flight: " + flight.getFlightNumber());
            Flight newFlight = flightService.createFlight(flight);
            return new ResponseEntity<>(newFlight, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.severe("Error adding flight: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Update flight
    @PutMapping("/flights/{flightId}")
    public ResponseEntity<Flight> updateFlight(@PathVariable String flightId, @RequestBody Flight flight) {
        try {
            logger.info("Updating flight with ID: " + flightId);
            Flight updatedFlight = flightService.updateFlight(flightId, flight);
            return new ResponseEntity<>(updatedFlight, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Flight not found with ID: " + flightId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating flight: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Update flight status
    @PatchMapping("/flights/{flightId}/status")
    public ResponseEntity<Flight> updateFlightStatus(
            @PathVariable String flightId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            if (newStatus == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            logger.info("Updating flight status for flight ID: " + flightId + " to: " + newStatus);
            Flight updatedFlight = flightService.updateFlightStatus(flightId, newStatus);
            return new ResponseEntity<>(updatedFlight, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Flight not found with ID: " + flightId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating flight status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete flight
    @DeleteMapping("/flights/{flightId}")
    public ResponseEntity<Void> deleteFlight(@PathVariable String flightId) {
        try {
            logger.info("Deleting flight with ID: " + flightId);
            flightService.deleteFlight(flightId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (ResourceNotFoundException e) {
            logger.warning("Flight not found with ID: " + flightId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error deleting flight: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count flights
    @GetMapping("/flights/count")
    public ResponseEntity<Map<String, Object>> getFlightCount() {
        try {
            logger.info("Getting flight count");
            Map<String, Object> response = new HashMap<>();
            response.put("count", flightService.countFlights());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting flight count: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search flights
    @GetMapping("/flights/search")
    public ResponseEntity<List<Flight>> searchFlights(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate) {
        try {
            logger.info("Searching flights from " + from + " to " + to + (departureDate != null ? " on " + departureDate : ""));
            List<Flight> flights;
            
            if (departureDate != null) {
                // ถ้ามีการระบุวันที่ จะค้นหาตามวันที่ด้วย
                flights = flightService.searchFlightsByRouteAndDate(from, to, departureDate);
            } else {
                // ถ้าไม่ได้ระบุวันที่ จะค้นหาตามเส้นทางเท่านั้น
                flights = flightService.getFlightsByRoute(from, to);
            }
            
            return new ResponseEntity<>(flights, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error searching flights: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // ============ BOOKING MANAGEMENT ============

    // Get all bookings
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {
        try {
            logger.info("Getting all bookings");
            List<Booking> bookings;
            
            if (page != null && limit != null) {
                int offset = (page - 1) * limit; // Adjust for 1-based page numbers
                bookings = bookingService.getBookingsWithPagination(offset, limit);
            } else {
                bookings = bookingService.getAllBookings();
            }
            
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting all bookings: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get booking by ID
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String bookingId) {
        try {
            logger.info("Getting booking by ID: " + bookingId);
            Booking booking = bookingService.getBookingById(bookingId);
            return new ResponseEntity<>(booking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Booking not found with ID: " + bookingId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error getting booking by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add new booking
    @PostMapping("/bookings")
    public ResponseEntity<Booking> addBooking(
            @RequestBody Booking booking,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String flightId) {
        try {
            logger.info("Adding new booking");
            // ใช้ userId และ flightId จาก parameter หรือจาก booking object
            String effectiveUserId = userId != null ? userId : booking.getUserId();
            String effectiveFlightId = flightId != null ? flightId : booking.getFlightId();
            
            if (effectiveUserId == null || effectiveFlightId == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            Booking newBooking = bookingService.createBooking(booking, effectiveUserId, effectiveFlightId);
            return new ResponseEntity<>(newBooking, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.severe("Error adding booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Update booking
    @PutMapping("/bookings/{bookingId}")
    public ResponseEntity<Booking> updateBooking(@PathVariable String bookingId, @RequestBody Booking booking) {
        try {
            logger.info("Updating booking with ID: " + bookingId);
            Booking updatedBooking = bookingService.updateBooking(bookingId, booking);
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Booking not found with ID: " + bookingId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Update booking status
    @PatchMapping("/bookings/{bookingId}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable String bookingId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            if (newStatus == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            logger.info("Updating booking status for booking ID: " + bookingId + " to: " + newStatus);
            Booking updatedBooking = bookingService.updateBookingStatus(bookingId, newStatus);
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Booking not found with ID: " + bookingId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating booking status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Cancel booking
    @PatchMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable String bookingId) {
        try {
            logger.info("Cancelling booking with ID: " + bookingId);
            Booking cancelledBooking = bookingService.cancelBooking(bookingId);
            return new ResponseEntity<>(cancelledBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Booking not found with ID: " + bookingId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error cancelling booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete booking
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String bookingId) {
        try {
            logger.info("Deleting booking with ID: " + bookingId);
            bookingService.deleteBooking(bookingId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (ResourceNotFoundException e) {
            logger.warning("Booking not found with ID: " + bookingId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error deleting booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Count bookings
    @GetMapping("/bookings/count")
    public ResponseEntity<Map<String, Object>> getBookingCount() {
        try {
            logger.info("Getting booking count");
            Map<String, Object> response = new HashMap<>();
            response.put("count", bookingService.countBookings());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting booking count: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search bookings
    @GetMapping("/bookings/search")
    public ResponseEntity<List<Booking>> searchBookings(@RequestParam String term) {
        try {
            logger.info("Searching bookings with term: " + term);
            List<Booking> bookings = bookingService.searchBookings(term);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error searching bookings: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get bookings by user
    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable String userId) {
        try {
            logger.info("Getting bookings for user ID: " + userId);
            List<Booking> bookings = bookingService.getBookingsByUserId(userId);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting bookings by user: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get bookings by flight
    @GetMapping("/bookings/flight/{flightId}")
    public ResponseEntity<List<Booking>> getBookingsByFlight(@PathVariable String flightId) {
        try {
            logger.info("Getting bookings for flight ID: " + flightId);
            List<Booking> bookings = bookingService.getBookingsByFlightId(flightId);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting bookings by flight: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get bookings by status
    @GetMapping("/bookings/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable String status) {
        try {
            logger.info("Getting bookings with status: " + status);
            List<Booking> bookings = bookingService.getBookingsByStatus(status);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting bookings by status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get bookings by date range
    @GetMapping("/bookings/date-range")
    public ResponseEntity<List<Booking>> getBookingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            logger.info("Getting bookings from " + fromDate + " to " + toDate);
            List<Booking> bookings = bookingService.getBookingsByDateRange(fromDate, toDate);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting bookings by date range: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ============ SEAT MANAGEMENT ============

    // Get all seats
    @GetMapping("/seats")
    public ResponseEntity<List<Seat>> getAllSeats() {
        try {
            logger.info("Getting all seats");
            List<Seat> seats = seatService.getAllSeats();
            return new ResponseEntity<>(seats, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting all seats: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get seats by flight
    @GetMapping("/seats/flight/{flightId}")
    public ResponseEntity<List<Seat>> getSeatsByFlight(@PathVariable String flightId) {
        try {
            logger.info("Getting seats for flight ID: " + flightId);
            List<Seat> seats = seatService.getSeatsByFlightId(flightId);
            return new ResponseEntity<>(seats, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting seats by flight: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get available seats by flight
    @GetMapping("/seats/flight/{flightId}/available")
    public ResponseEntity<List<Seat>> getAvailableSeatsByFlight(@PathVariable String flightId) {
        try {
            logger.info("Getting available seats for flight ID: " + flightId);
            List<Seat> seats = seatService.getAvailableSeatsByFlightId(flightId);
            return new ResponseEntity<>(seats, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting available seats by flight: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/seats/{seatId}")
    public ResponseEntity<Seat> getSeatById(@PathVariable String seatId) {
        try {
            logger.info("Getting seat by ID: " + seatId);
            Seat seat = seatService.getSeatById(seatId);
            return new ResponseEntity<>(seat, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Seat not found with ID: " + seatId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error getting seat by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Add new seat
    @PostMapping("/seats")
    public ResponseEntity<Seat> addSeat(@RequestBody Seat seat, @RequestParam String flightId) {
        try {
            logger.info("Adding new seat to flight ID: " + flightId);
            Seat newSeat = seatService.createSeat(seat, flightId);
            return new ResponseEntity<>(newSeat, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.severe("Error adding seat: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Update seat
    @PutMapping("/seats/{seatId}")
    public ResponseEntity<Seat> updateSeat(@PathVariable String seatId, @RequestBody Seat seat) {
        try {
            logger.info("Updating seat with ID: " + seatId);
            Seat updatedSeat = seatService.updateSeat(seatId, seat);
            return new ResponseEntity<>(updatedSeat, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Seat not found with ID: " + seatId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating seat: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Update seat status
    @PatchMapping("/seats/{seatId}/status")
    public ResponseEntity<Seat> updateSeatStatus(
            @PathVariable String seatId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            if (newStatus == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            logger.info("Updating seat status for seat ID: " + seatId + " to: " + newStatus);
            Seat updatedSeat = seatService.updateSeatStatus(seatId, newStatus);
            return new ResponseEntity<>(updatedSeat, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Seat not found with ID: " + seatId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating seat status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Delete seat
    @DeleteMapping("/seats/{seatId}")
    public ResponseEntity<Void> deleteSeat(@PathVariable String seatId) {
        try {
            logger.info("Deleting seat with ID: " + seatId);
            seatService.deleteSeat(seatId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (ResourceNotFoundException e) {
            logger.warning("Seat not found with ID: " + seatId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error deleting seat: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Count seats
    @GetMapping("/seats/count")
    public ResponseEntity<Map<String, Object>> getSeatCount() {
        try {
            logger.info("Getting seat count");
            Map<String, Object> response = new HashMap<>();
            response.put("count", seatService.countAvailableSeats());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting seat count: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ============ DISCOUNT MANAGEMENT ============
    
    // Get all discounts
    @GetMapping("/discounts")
    public ResponseEntity<List<Discount>> getAllDiscounts() {
        try {
            logger.info("Getting all discounts");
            List<Discount> discounts = discountService.getAllDiscounts();
            return new ResponseEntity<>(discounts, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting all discounts: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get discount by ID
    @GetMapping("/discounts/{discountId}")
    public ResponseEntity<Discount> getDiscountById(@PathVariable String discountId) {
        try {
            logger.info("Getting discount by ID: " + discountId);
            Discount discount = discountService.getDiscountById(discountId);
            return new ResponseEntity<>(discount, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Discount not found with ID: " + discountId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error getting discount by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Add new discount
    @PostMapping("/discounts")
    public ResponseEntity<Discount> addDiscount(@RequestBody Discount discount) {
        try {
            logger.info("Adding new discount: " + discount.getDiscountId());
            Discount newDiscount = discountService.createDiscount(discount);
            return new ResponseEntity<>(newDiscount, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.severe("Error adding discount: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Update discount
    @PutMapping("/discounts/{discountId}")
    public ResponseEntity<Discount> updateDiscount(@PathVariable String discountId, @RequestBody Discount discount) {
        try {
            logger.info("Updating discount with ID: " + discountId);
            Discount updatedDiscount = discountService.updateDiscount(discountId, discount);
            return new ResponseEntity<>(updatedDiscount, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Discount not found with ID: " + discountId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating discount: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Delete discount
    @DeleteMapping("/discounts/{discountId}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable String discountId) {
        try {
            logger.info("Deleting discount with ID: " + discountId);
            discountService.deleteDiscount(discountId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (ResourceNotFoundException e) {
            logger.warning("Discount not found with ID: " + discountId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error deleting discount: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ============ PASSENGER MANAGEMENT ============
    
    // Get all passengers
    @GetMapping("/passengers")
    public ResponseEntity<List<Passenger>> getAllPassengers() {
        try {
            logger.info("Getting all passengers");
            List<Passenger> passengers = passengerService.getAllPassengers();
            return new ResponseEntity<>(passengers, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting all passengers: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get passenger by ID
    @GetMapping("/passengers/{passengerId}")
    public ResponseEntity<Passenger> getPassengerById(@PathVariable String passengerId) {
        try {
            logger.info("Getting passenger by ID: " + passengerId);
            Passenger passenger = passengerService.getPassengerById(passengerId);
            return new ResponseEntity<>(passenger, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Passenger not found with ID: " + passengerId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error getting passenger by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get passengers by booking
    @GetMapping("/passengers/booking/{bookingId}")
    public ResponseEntity<List<Passenger>> getPassengersByBooking(@PathVariable String bookingId) {
        try {
            logger.info("Getting passengers for booking ID: " + bookingId);
            List<Passenger> passengers = passengerService.getPassengersByBookingId(bookingId);
            return new ResponseEntity<>(passengers, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting passengers by booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ============ PAYMENT MANAGEMENT ============
    
    // Get all payments
    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        try {
            logger.info("Getting all payments");
            List<Payment> payments = paymentService.getAllPayments();
            return new ResponseEntity<>(payments, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting all payments: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get payment by ID
    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String paymentId) {
        try {
            logger.info("Getting payment by ID: " + paymentId);
            Payment payment = paymentService.getPaymentById(paymentId);
            return new ResponseEntity<>(payment, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Payment not found with ID: " + paymentId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error getting payment by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get payments by booking
    @GetMapping("/payments/booking/{bookingId}")
    public ResponseEntity<List<Payment>> getPaymentsByBooking(@PathVariable String bookingId) {
        try {
            logger.info("Getting payments for booking ID: " + bookingId);
            List<Payment> payments = paymentService.getPaymentsByBookingId(bookingId);
            return new ResponseEntity<>(payments, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting payments by booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Update payment status
    @PatchMapping("/payments/{paymentId}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable String paymentId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            if (newStatus == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            logger.info("Updating payment status for payment ID: " + paymentId + " to: " + newStatus);
            Payment updatedPayment = paymentService.updatePaymentStatus(paymentId, newStatus);
            return new ResponseEntity<>(updatedPayment, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.warning("Payment not found with ID: " + paymentId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.severe("Error updating payment status: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ============ REPORTING ============
    
    // Get revenue report
    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            logger.info("Getting revenue report" + (fromDate != null ? " from " + fromDate : "") 
                    + (toDate != null ? " to " + toDate : ""));
            
            Map<String, Object> report;
            if (fromDate != null && toDate != null) {
                // ถ้ามีการระบุช่วงวันที่ จะดึงรายงานตามช่วงวันที่
                report = bookingService.getRevenueReportByDateRange(fromDate, toDate);
            } else {
                // ถ้าไม่ได้ระบุช่วงวันที่ จะดึงรายงานทั้งหมด
                report = bookingService.getRevenueReport();
            }
            
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting revenue report: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get booking report
    @GetMapping("/reports/bookings")
    public ResponseEntity<Map<String, Object>> getBookingReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            logger.info("Getting booking report" + (fromDate != null ? " from " + fromDate : "") 
                    + (toDate != null ? " to " + toDate : ""));
            
            Map<String, Object> report;
            if (fromDate != null && toDate != null) {
                // ถ้ามีการระบุช่วงวันที่ จะดึงรายงานตามช่วงวันที่
                report = bookingService.getBookingReportByDateRange(fromDate, toDate);
            } else {
                // ถ้าไม่ได้ระบุช่วงวันที่ จะดึงรายงานทั้งหมด
                report = bookingService.getBookingReport();
            }
            
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting booking report: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get flight report
    @GetMapping("/reports/flights")
    public ResponseEntity<Map<String, Object>> getFlightReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            logger.info("Getting flight report" + (fromDate != null ? " from " + fromDate : "") 
                    + (toDate != null ? " to " + toDate : ""));
            
            Map<String, Object> report;
            if (fromDate != null && toDate != null) {
                // ถ้ามีการระบุช่วงวันที่ จะดึงรายงานตามช่วงวันที่
                report = flightService.getFlightReportByDateRange(fromDate, toDate);
            } else {
                // ถ้าไม่ได้ระบุช่วงวันที่ จะดึงรายงานทั้งหมด
                report = flightService.getFlightReport();
            }
            
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            logger.severe("Error getting flight report: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}